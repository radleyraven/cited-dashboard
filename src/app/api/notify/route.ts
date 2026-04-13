import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  const { client_name, client_email, event, skipped_fields } = body;

  // Build notification message with skipped fields context
  const skipped: string[] = skipped_fields || [];
  const skippedNote = skipped.length > 0 ? ` Skipped: ${skipped.join(', ')}.` : '';
  const message = `🔴 ${client_name} submitted intake.${skippedNote} MLS data needed.`;

  // Log notification event to cited_events
  // Future: send Telegram notification, trigger email sequence
  const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const sbKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  await fetch(`${sbUrl}/rest/v1/cited_events`, {
    method: 'POST',
    headers: {
      'apikey': sbKey!,
      'Authorization': `Bearer ${sbKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify({
      client_slug: client_name?.toLowerCase().replace(/\s+/g, '-') || 'unknown',
      client_name,
      event_type: 'notification',
      event_data: {
        event,
        client_email,
        skipped_fields: skipped,
        message,
        mls_reminders: {
          '4hr': new Date(Date.now() + 4 * 3600000).toISOString(),
          '12hr': new Date(Date.now() + 12 * 3600000).toISOString(),
          '24hr': new Date(Date.now() + 24 * 3600000).toISOString(),
        },
      },
      source: 'system',
    }),
  });

  return NextResponse.json({ success: true });
}
