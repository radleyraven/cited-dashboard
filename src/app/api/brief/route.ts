/*
  Supabase table — create this manually if the REST API can't run DDL:

  CREATE TABLE article_briefs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_email TEXT NOT NULL,
    article_number INTEGER NOT NULL DEFAULT 1,
    q1 TEXT NOT NULL,
    q2 TEXT NOT NULL,
    q3 TEXT NOT NULL,
    q4 TEXT NOT NULL,
    q5 TEXT NOT NULL,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'pending'
  );

  Note: Supabase's REST API does not support DDL (CREATE TABLE).
  The table must be created via the Supabase SQL editor or Dashboard.
  This route will work correctly once the table exists.
*/

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clientEmail, articleNumber, q1, q2, q3, q4, q5 } = body;

    if (!clientEmail?.trim()) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const required: [string, string][] = [
      [q1, 'Question 1'],
      [q2, 'Question 2'],
      [q3, 'Question 3'],
      [q4, 'Question 4'],
      [q5, 'Question 5'],
    ];

    for (const [val, label] of required) {
      if (!val?.trim()) {
        return NextResponse.json({ error: `${label} is required` }, { status: 400 });
      }
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    const { error } = await supabase.from('article_briefs').insert({
      client_email: clientEmail.trim().toLowerCase(),
      article_number: articleNumber ?? 1,
      q1: q1.trim(),
      q2: q2.trim(),
      q3: q3.trim(),
      q4: q4.trim(),
      q5: q5.trim(),
      status: 'pending',
    });

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json({ error: 'Failed to save brief' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
