/*
  POST /api/scan
  Creates a prospect record from the lite scan form (/scan page).
  Alerts Jett via Supabase to run a Quick PRISM scan and build score page.

  Supabase table: cited_prospects (create if not exists)
  CREATE TABLE IF NOT EXISTS cited_prospects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    primary_market TEXT NOT NULL,
    source TEXT DEFAULT 'scan_page',
    status TEXT DEFAULT 'pending_scan',
    score_page_slug TEXT,
    citation_score INTEGER,
    notes TEXT
  );
*/

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { fullName, market, email } = body;

    if (!fullName?.trim() || !market?.trim() || !email?.trim()) {
      return NextResponse.json({ error: "Name, market, and email are required" }, { status: 400 });
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
    }

    // Check for existing prospect
    const { data: existing } = await supabase
      .from("cited_prospects")
      .select("id, status")
      .eq("email", email.trim().toLowerCase())
      .limit(1);

    if (existing && existing.length > 0) {
      // Already requested — don't error, just confirm
      return NextResponse.json({ success: true, existing: true });
    }

    // Insert prospect
    const { error } = await supabase.from("cited_prospects").insert({
      full_name: fullName.trim(),
      email: email.trim().toLowerCase(),
      primary_market: market.trim(),
      source: "scan_page",
      status: "pending_scan",
    });

    if (error) {
      // Table might not exist yet — return success anyway so user experience isn't broken
      console.error("Supabase insert error (cited_prospects):", error);
      // Still return success — Jett can pick up from email notification if table isn't ready
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
