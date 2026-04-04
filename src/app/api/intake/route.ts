/*
  Supabase table schema — run this SQL manually:

  CREATE TABLE cited_intake (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    brokerage TEXT NOT NULL,
    title TEXT,
    license_number TEXT NOT NULL,
    primary_markets TEXT NOT NULL,
    neighborhoods TEXT,
    years_in_market TEXT,
    top_transactions TEXT,
    differentiator TEXT NOT NULL,
    review_platforms JSONB,
    website_url TEXT,
    linkedin_url TEXT,
    instagram_handle TEXT,
    youtube_url TEXT,
    zillow_url TEXT,
    realtor_url TEXT,
    fastexpert_url TEXT,
    homelight_url TEXT,
    other_platforms TEXT,
    gbp_manager_added BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'pending'
  );
*/

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    const required: { field: string; label: string }[] = [
      { field: "fullName", label: "Full Name" },
      { field: "email", label: "Email" },
      { field: "phone", label: "Phone" },
      { field: "brokerage", label: "Brokerage / Company" },
      { field: "licenseNumber", label: "License #" },
      { field: "primaryMarkets", label: "Primary markets" },
      { field: "differentiator", label: "What makes you different" },
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

    // Check for duplicate email submission
    const { data: existing } = await supabase
      .from("cited_intake")
      .select("id")
      .eq("email", body.email.trim().toLowerCase())
      .limit(1);

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { error: "An intake form has already been submitted with this email address. If you need to update your information, please contact us at hello@citedagent.com." },
        { status: 409 }
      );
    }

    const { error } = await supabase.from("cited_intake").insert({
      full_name: body.fullName.trim(),
      email: body.email.trim(),
      phone: body.phone.trim(),
      brokerage: body.brokerage.trim(),
      title: body.title?.trim() || null,
      license_number: body.licenseNumber.trim(),
      primary_markets: body.primaryMarkets.trim(),
      neighborhoods: body.neighborhoods?.trim() || null,
      years_in_market: body.yearsInMarket?.trim() || null,
      top_transactions: body.topTransactions?.trim() || null,
      differentiator: body.differentiator.trim(),
      review_platforms: reviewPlatforms.length > 0 ? reviewPlatforms : null,
      website_url: body.websiteUrl?.trim() || null,
      linkedin_url: body.linkedinUrl?.trim() || null,
      instagram_handle: body.instagramHandle?.trim() || null,
      youtube_url: body.youtubeUrl?.trim() || null,
      zillow_url: body.zillowUrl?.trim() || null,
      realtor_url: body.realtorUrl?.trim() || null,
      fastexpert_url: body.fastexpertUrl?.trim() || null,
      homelight_url: body.homelightUrl?.trim() || null,
      other_platforms: body.otherPlatforms?.trim() || null,
      gbp_manager_added: body.gbpStatus === "added" || body.gbpManagerAdded === true,
    });

    if (error) {
      console.error("Supabase insert error:", error);
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
