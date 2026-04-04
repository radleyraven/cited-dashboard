import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);

  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as "magiclink" | "signup" | "recovery" | "invite" | "email" | null;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  // Supabase PKCE flow (newer versions)
  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Token hash flow (email magic links)
  if (token_hash && type) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { error } = await supabase.auth.verifyOtp({ token_hash, type });
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    // If server-side verify fails, try client-side (redirect with params)
    const loginUrl = new URL("/login", origin);
    loginUrl.searchParams.set("token_hash", token_hash);
    loginUrl.searchParams.set("type", type);
    return NextResponse.redirect(loginUrl);
  }

  // Fallback
  return NextResponse.redirect(`${origin}/login`);
}
