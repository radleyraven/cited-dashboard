import { NextResponse } from 'next/server';
import { verifyActionToken } from '@/lib/positioning-tokens';
import type { ChangeCategory } from '@/types/positioning';

/*
  POST /api/positioning/request-changes
  Body: { slug: string, token: string, version: string, categories: ChangeCategory[], notes: string }

  - Validates signed action token
  - Validates categories against allowlist
  - UPDATE positioning_status='changes_requested', increments retry count
  - Inserts cited_events row + sends Telegram (interim)

  Built: 2026-04-24 under RADLEY APPROVED — RTI PHASE 0 → 1
  Tier: FORENSIC

  INTERIM TELEGRAM SEND — same caveat as approve route.
*/

const ALLOWED_CATEGORIES: ChangeCategory[] = [
  'markets',
  'pillar_1',
  'pillar_2',
  'stat_accuracy',
  'tone_voice',
  'other',
];

function isValidCategoryArray(value: unknown): value is ChangeCategory[] {
  if (!Array.isArray(value)) return false;
  if (value.length === 0) return false;
  return value.every((v) => typeof v === 'string' && (ALLOWED_CATEGORIES as string[]).includes(v));
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const slug = String(body.slug ?? '');
    const token = String(body.token ?? '');
    const version = String(body.version ?? '');
    const notes = String(body.notes ?? '').slice(0, 2000);
    const categories = body.categories;

    if (!slug || !token) {
      return NextResponse.json(
        { error: 'Missing required fields: slug, token' },
        { status: 400 },
      );
    }

    if (!isValidCategoryArray(categories)) {
      return NextResponse.json(
        {
          error: 'categories must be a non-empty array of valid change categories',
          allowed: ALLOWED_CATEGORIES,
        },
        { status: 400 },
      );
    }

    // If "other" selected, require notes
    if ((categories as ChangeCategory[]).includes('other') && notes.trim().length === 0) {
      return NextResponse.json(
        { error: 'notes are required when "other" category is selected' },
        { status: 400 },
      );
    }

    // Verify signed action token
    const tokenResult = verifyActionToken(token, slug);
    if (!tokenResult.ok) {
      return NextResponse.json(
        { error: 'Invalid or expired action token', reason: tokenResult.reason },
        { status: 401 },
      );
    }

    const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const sbKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!sbUrl || !sbKey) {
      console.error('[positioning/request-changes] Supabase env missing');
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }

    // Read current row
    const readRes = await fetch(
      `${sbUrl}/rest/v1/cited_intake?slug=eq.${encodeURIComponent(slug)}&select=id,full_name,email,positioning_status,positioning_retry_count&limit=1`,
      {
        headers: { apikey: sbKey, Authorization: `Bearer ${sbKey}` },
        cache: 'no-store',
      },
    );

    if (!readRes.ok) {
      console.error('[positioning/request-changes] Read failed', readRes.status);
      return NextResponse.json({ error: 'Read failed' }, { status: 500 });
    }

    const rows = (await readRes.json()) as Array<{
      id: string;
      full_name: string;
      email: string | null;
      positioning_status: string | null;
      positioning_retry_count: number | null;
    }>;
    const row = rows[0];

    if (!row) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Allow request-changes only from 'pending' state (not from 'approved' — that's terminal until Radley resets)
    if (row.positioning_status !== 'pending') {
      return NextResponse.json(
        {
          error: 'Cannot request changes from current state',
          current_status: row.positioning_status,
        },
        { status: 409 },
      );
    }

    // UPDATE — set status + increment retry count
    const newRetryCount = (row.positioning_retry_count ?? 0) + 1;
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
          positioning_status: 'changes_requested',
          positioning_retry_count: newRetryCount,
        }),
      },
    );

    if (!updateRes.ok) {
      const errText = await updateRes.text();
      console.error('[positioning/request-changes] UPDATE failed', updateRes.status, errText);
      return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }

    const updated = await updateRes.json();
    if (!Array.isArray(updated) || updated.length === 0) {
      return NextResponse.json(
        {
          error: 'Concurrent modification — please refresh and review the latest version',
        },
        { status: 409 },
      );
    }

    // Insert cited_events row
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
        event_type: 'positioning_change_requested',
        source: 'positioning_review_page',
        severity: 'info',
        event_data: {
          version_rejected: version || null,
          categories,
          notes,
          actor: 'client',
          retry_count: newRetryCount,
        },
      }),
    }).catch((e) => {
      console.error('[positioning/request-changes] Event insert failed (non-fatal)', e);
    });

    // Send Telegram (INTERIM)
    const tgToken = process.env.TELEGRAM_BOT_TOKEN;
    const tgChatId = process.env.RADLEY_TELEGRAM_CHAT_ID || process.env.TELEGRAM_CHAT_ID;

    if (tgToken && tgChatId) {
      const categoriesStr = (categories as string[]).join(', ');
      const notesPreview = notes ? `\nNotes: "${notes.slice(0, 500)}${notes.length > 500 ? '…' : ''}"` : '';
      const message =
        `⚠️ *Positioning CHANGES REQUESTED* — ${row.full_name}\n` +
        `Version rejected: ${version || 'n/a'}\n` +
        `Categories flagged: ${categoriesStr}${notesPreview}\n` +
        `Retry count: ${newRetryCount}\n` +
        `URL: https://citedagent.com/positioning/${slug}\n` +
        `Next: review the flagged categories and update positioning_data.`;

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
        console.error('[positioning/request-changes] Telegram send failed (non-fatal)', e);
      }
    } else {
      console.warn(
        '[positioning/request-changes] Telegram env vars missing — event row inserted but no Telegram notification sent',
      );
    }

    return NextResponse.json({
      ok: true,
      slug,
      retry_count: newRetryCount,
      categories,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[positioning/request-changes] Unhandled error', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
