import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { client_slug, client_name, event_type, event_data, source } = body;

    if (!client_slug || !event_type) {
      return NextResponse.json({ error: 'client_slug and event_type required' }, { status: 400 });
    }

    const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const sbKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const res = await fetch(`${sbUrl}/rest/v1/cited_events`, {
      method: 'POST',
      headers: {
        'apikey': sbKey!,
        'Authorization': `Bearer ${sbKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        client_slug: client_slug,
        client_name: client_name || null,
        event_type: event_type,
        event_data: event_data || {},
        source: source || 'web',
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Event log error:', err);
      return NextResponse.json({ error: 'Failed to log event' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
