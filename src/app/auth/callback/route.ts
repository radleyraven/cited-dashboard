import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/dashboard'
  const code = searchParams.get('code')

  // For PKCE code flow
  if (code) {
    // Redirect to login page with code — client-side will handle exchange
    const loginUrl = new URL('/login', origin)
    loginUrl.searchParams.set('code', code)
    loginUrl.searchParams.set('next', next)
    return NextResponse.redirect(loginUrl)
  }

  // For magic link / OTP flow — pass token to login page for client-side verification
  if (token_hash && type) {
    const loginUrl = new URL('/login', origin)
    loginUrl.searchParams.set('token_hash', token_hash)
    loginUrl.searchParams.set('type', type)
    loginUrl.searchParams.set('next', next)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.redirect(`${origin}/login`)
}
