import { NextResponse } from 'next/server';
import { verifyActionToken } from '@/lib/positioning-tokens';

/*
  POST /api/positioning/approve
  Body: { slug: string, token: string, version: string }

  - Validates signed action token
  - Conditional UPDATE on cited_intake (positioning_status='approved' WHERE positioning_status='pending')
  - On success: insert cited_events row + send Telegram (interim direct send)
  - Returns 200 on success, 401/409/412/500 on failure

  Built: 2026-04-24 under RADLEY APPROVED — RTI PHASE 0 → 1
  Tier: FORENSIC (canonical mutation, auth, external send)

  INTERIM TELEGRAM SEND — 2026-04-24
  The cited_events.telegram_delivered_at column exists but no consumer
  currently stamps it. Once a consumer queue is built, remove this
  direct send and rely on event-driven delivery to avoid double-fire.
  Tracked: references/staged/cited-positioning-mutation-endpoints-phase-0-spec-2026-04-24.md
*/

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const slug = String(body.slug ?? '');
    const token = String(body.token ?? '');
    const version = String(body.version ?? '');

    if (!slug || !token) {
      return NextResponse.json(
        { error: 'Missing required fields: slug, token' },
        { status: 400 },
      );
    }

    // 1. Verify signed action token
    const tokenResult = verifyActionToken(token, slug);
    if (!tokenResult.ok) {
      return NextResponse.json(
        { error: 'Invalid or expired action token', reason: tokenResult.reason },
        { status: 401 },
      );
    }

    // 2. Supabase service-key access
    const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const sbKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!sbUrl || !sbKey) {
      console.error('[positioning/approve] Supabase env missing');
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }

    // 3. Read current row (need id, positioning_data, status guard)
    const readRes = await fetch(
      `${sbUrl}/rest/v1/cited_intake?slug=eq.${encodeURIComponent(slug)}&select=id,full_name,email,positioning_status,positioning_approved_version&limit=1`,
      {
        headers: { apikey: sbKey, Authorization: `Bearer ${sbKey}` },
        cache: 'no-store',
      },
    );

    if (!readRes.ok) {
      console.error('[positioning/approve] Read failed', readRes.status);
      return NextResponse.json({ error: 'Read failed' }, { status: 500 });
    }

    const rows = (await readRes.json()) as Array<{
      id: string;
      full_name: string;
      email: string | null;
      positioning_status: string | null;
      positioning_approved_version: string | null;
    }>;
    const row = rows[0];

    if (!row) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    if (row.positioning_status !== 'pending') {
      return NextResponse.json(
        {
          error: 'Positioning is not in pending state',
          current_status: row.positioning_status,
          message:
            row.positioning_status === 'approved'
              ? 'Positioning already approved'
              : 'Positioning was updated — please review the latest version',
        },
        { status: 409 },
      );
    }

    // 4. Conditional UPDATE — only if still pending (race-safe)
    const approvedAt = new Date().toISOString();
    const updateRes = await fetch(
      `${sbUrl}/rest/v1/cited_intake?slug=eq.${encodeURIComponent(slug)}&positioning_status=eq.pending`,
      {
        method: 'PATCH',
        headers: {
          apikey: sbKey,
          Authorization: `Bearer ${sbKey}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify({
          positioning_status: 'approved',
          positioning_approved_at: approvedAt,
        }),
      },
    );

    if (!updateRes.ok) {
      const errText = await updateRes.text();
      console.error('[positioning/approve] UPDATE failed', updateRes.status, errText);
      return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }

    const updated = await updateRes.json();
    if (!Array.isArray(updated) || updated.length === 0) {
      // Race: another request changed status between read and write
      return NextResponse.json(
        {
          error: 'Concurrent modification — please refresh and review the latest version',
        },
        { status: 409 },
      );
    }

    // 5. Insert cited_events row (canonical audit trail)
    await fetch(`${sbUrl}/rest/v1/cited_events`, {
      method: 'POST',
      headers: {
        apikey: sbKey,
        Authorization: `Bearer ${sbKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        client_id: row.id,
        client_slug: slug,
        client_name: row.full_name,
        event_type: 'positioning_approved',
        source: 'positioning_review_page',
        severity: 'info',
        event_data: {
          version: version || row.positioning_approved_version,
          approved_at: approvedAt,
          actor: 'client',
          copy_kit_triggered: false,
          undo_window_seconds: 60,
        },
      }),
    }).catch((e) => {
      console.error('[positioning/approve] Event insert failed (non-fatal)', e);
    });

    // 6. Send Telegram notification (INTERIM — see header comment)
    const tgToken = process.env.TELEGRAM_BOT_TOKEN;
    const tgChatId = process.env.RADLEY_TELEGRAM_CHAT_ID || process.env.TELEGRAM_CHAT_ID;

    if (tgToken && tgChatId) {
      const message =
        `✅ *Positioning APPROVED* — ${row.full_name}\n` +
        `Version: ${version || row.positioning_approved_version || 'n/a'}\n` +
        `Approved at: ${approvedAt}\n` +
        `Status: queued for Radley review (Copy Kit NOT auto-fired)\n` +
        `URL: https://citedagent.com/positioning/${slug}\n` +
        `Next: review and trigger Copy Kit generation manually when ready.`;

      try {
        await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: tgChatId,
            text: message,
            parse_mode: 'Markdown',
          }),
        });
      } catch (e) {
        console.error('[positioning/approve] Telegram send failed (non-fatal)', e);
      }
    } else {
      console.warn(
        '[positioning/approve] Telegram env vars missing — event row inserted but no Telegram notification sent',
      );
    }

    return NextResponse.json({
      ok: true,
      slug,
      approved_at: approvedAt,
      version: version || row.positioning_approved_version,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[positioning/approve] Unhandled error', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
