import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  
  // Supabase sends token_hash + type for email confirmations
  // or code for OAuth/magic link
  // Either way, redirect to home — the client-side supabase will pick up the session
  // from the URL hash fragment
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const code = searchParams.get("code");

  // For email confirmation links, redirect with the hash params intact
  if (token_hash && type) {
    return NextResponse.redirect(`${origin}/#access_token=${token_hash}&type=${type}`);
  }

  // For magic links / OAuth
  return NextResponse.redirect(`${origin}/`);
}
