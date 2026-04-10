/*
  Supabase table schema — run this SQL to update:

  -- Add new columns (run against existing cited_intake table)
  ALTER TABLE cited_intake
    ADD COLUMN IF NOT EXISTS brokerage_address TEXT,
    ADD COLUMN IF NOT EXISTS brokerage_profile_url TEXT,
    ADD COLUMN IF NOT EXISTS personal_website_url TEXT,
    ADD COLUMN IF NOT EXISTS primary_market_zip TEXT,
    ADD COLUMN IF NOT EXISTS audience_focus TEXT,
    ADD COLUMN IF NOT EXISTS voice_capture TEXT,
    ADD COLUMN IF NOT EXISTS gbp_status TEXT DEFAULT '',
    ADD COLUMN IF NOT EXISTS skipped_fields JSONB DEFAULT '[]',
    ADD COLUMN IF NOT EXISTS intake_completion_pct INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS yelp_url TEXT,
    ADD COLUMN IF NOT EXISTS additional_platforms TEXT;

  -- Make phone optional (was NOT NULL)
  ALTER TABLE cited_intake ALTER COLUMN phone DROP NOT NULL;

  -- Full schema for new installs:
  CREATE TABLE IF NOT EXISTS cited_intake (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    brokerage TEXT NOT NULL,
    title TEXT,
    license_number TEXT NOT NULL,
    brokerage_address TEXT,
    brokerage_profile_url TEXT,
    personal_website_url TEXT,
    primary_markets TEXT NOT NULL,
    primary_market_zip TEXT,
    neighborhoods TEXT,
    years_in_market TEXT,
    audience_focus TEXT,
    differentiator TEXT,
    voice_capture TEXT,
    top_transactions TEXT,
    review_platforms JSONB,
    website_url TEXT,
    linkedin_url TEXT,
    zillow_url TEXT,
    yelp_url TEXT,
    realtor_url TEXT,
    fastexpert_url TEXT,
    homelight_url TEXT,
    youtube_url TEXT,
    instagram_handle TEXT,
    other_platforms TEXT,
    additional_platforms TEXT,
    gbp_status TEXT DEFAULT '',
    skipped_fields JSONB DEFAULT '[]',
    intake_completion_pct INTEGER DEFAULT 0,
    gbp_manager_added BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'pending'
  );
*/

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields — phone is now OPTIONAL
    const required: { field: string; label: string }[] = [
      { field: "fullName", label: "Full Name" },
      { field: "email", label: "Email" },
      { field: "brokerage", label: "Brokerage / Company" },
      { field: "licenseNumber", label: "License #" },
      { field: "primaryMarkets", label: "Primary markets" },
    ];

    for (const { field, label } of required) {
      if (!body[field]?.trim()) {
        return NextResponse.json(
          { error: `${label} is required` },
          { status: 400 }
        );
      }
    }

    // Build review platforms JSONB
    const reviewPlatforms = body.reviewPlatforms ?? [];
    if (reviewPlatforms.includes("Other") && body.reviewOther?.trim()) {
      const idx = reviewPlatforms.indexOf("Other");
      reviewPlatforms[idx] = `Other: ${body.reviewOther.trim()}`;
    }

    // Upsert: match on signupEmail first (original email from score page), then contact email.
    // This allows clients to re-submit and handles email changes (e.g., gmail → brokerage email).
    const signupEmail = (body.signupEmail || body.email || "").trim().toLowerCase();
    const contactEmail = body.email.trim().toLowerCase();

    const { data: existing } = await supabase
      .from("cited_intake")
      .select("id")
      .or(`email.eq.${signupEmail},email.eq.${contactEmail}`)
      .limit(1);

    const payload = {
      full_name: body.fullName.trim(),
      email: contactEmail,
      phone: body.phone?.trim() || null,
      brokerage: body.brokerage.trim(),
      title: body.title?.trim() || null,
      license_number: body.licenseNumber.trim(),
      brokerage_address: body.brokerageAddress?.trim() || null,
      broker_dre: body.brokerDre?.trim() || null,
      broker_name: body.brokerName?.trim() || null,
      brokerage_profile_url: body.brokerageProfileUrl?.trim() || null,
      personal_website_url: body.personalWebsiteUrl?.trim() || null,
      primary_markets: body.primaryMarkets.trim(),
      primary_market_zip: body.primaryMarketZip?.trim() || null,
      neighborhoods: body.neighborhoods?.trim() || null,
      years_in_market: body.yearsInMarket?.trim() || null,
      audience_focus: body.audienceFocus?.trim() || null,
      differentiator: body.differentiator?.trim() || null,
      voice_capture: body.voiceCapture?.trim() || null,
      top_transactions: body.topTransactions?.trim() || null,
      review_platforms: reviewPlatforms.length > 0 ? reviewPlatforms : null,
      website_url: body.personalWebsiteUrl?.trim() || null,
      linkedin_url: body.linkedinUrl?.trim() || null,
      zillow_url: body.zillowUrl?.trim() || null,
      yelp_url: body.yelpUrl?.trim() || null,
      realtor_url: body.realtorUrl?.trim() || null,
      fastexpert_url: body.fastexpertUrl?.trim() || null,
      youtube_url: body.youtubeUrl?.trim() || null,
      additional_platforms: body.additionalPlatforms?.trim() || null,
      gbp_status: body.gbpStatus?.trim() || null,
      gbp_url: body.gbpUrl?.trim() || null,
      skipped_fields: body.skippedFields?.length > 0 ? body.skippedFields : [],
      intake_completion_pct: body.intakeCompletionPct ?? 100,
      gbp_manager_added: body.gbpStatus === "added" || body.gbpManagerAdded === true,
    };

    let error;
    if (existing && existing.length > 0) {
      // Update existing record
      const result = await supabase
        .from("cited_intake")
        .update(payload)
        .eq("id", existing[0].id);
      error = result.error;
    } else {
      // Insert new record
      const result = await supabase.from("cited_intake").insert({
        ...payload,
      });
      error = result.error;
    }

    if (error) {
      console.error("Supabase upsert error:", error);
      return NextResponse.json(
        { error: "Failed to save submission" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}
