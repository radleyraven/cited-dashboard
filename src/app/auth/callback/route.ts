import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  
  // Supabase magic link sends token_hash + type as query params
  // We need to redirect to a page where the client-side Supabase JS
  // can pick these up and exchange them for a session
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const code = searchParams.get("code");

  // Build redirect URL that preserves all params for client-side handling
  if (token_hash && type) {
    // Redirect to login page with params — it will handle the verification
    const redirectUrl = new URL("/login", origin);
    redirectUrl.searchParams.set("token_hash", token_hash);
    redirectUrl.searchParams.set("type", type);
    return NextResponse.redirect(redirectUrl);
  }

  if (code) {
    const redirectUrl = new URL("/login", origin);
    redirectUrl.searchParams.set("code", code);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.redirect(`${origin}/login`);
}
