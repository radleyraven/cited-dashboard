/*
  Signed action token for /positioning/[slug] mutation endpoints.
  HMAC-SHA256(secret, slug:timestamp). 24-hour expiry default.

  Generated server-side at page render. Validated server-side in mutation routes.
  Read access (GET) does NOT require token — link-accessible by design.
  POST mutations (approve, request-changes) require token.

  Tier: FORENSIC (auth-sensitive code per RTI v3.0 Promotion Rule trigger #3).
  Created: 2026-04-24 under RADLEY APPROVED — RTI PHASE 0 → 1.
*/

import { createHmac, timingSafeEqual } from 'crypto';

const TOKEN_VERSION = 'v1';
const DEFAULT_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

function getSecret(): string {
  const secret = process.env.POSITIONING_ACTION_SECRET;
  if (!secret || secret.length < 32) {
    // Fail closed. Do not generate or accept tokens without a real secret.
    throw new Error(
      'POSITIONING_ACTION_SECRET missing or too short (require 32+ chars).',
    );
  }
  return secret;
}

function sign(payload: string): string {
  const hmac = createHmac('sha256', getSecret());
  hmac.update(payload);
  return hmac.digest('base64url');
}

/**
 * Generate a signed action token for the given slug.
 * Format: base64url(`{version}:{slug}:{timestamp_ms}:{signature}`)
 */
export function generateActionToken(slug: string): string {
  if (!slug || typeof slug !== 'string') {
    throw new Error('generateActionToken: slug is required');
  }
  const timestamp = Date.now();
  const payload = `${TOKEN_VERSION}:${slug}:${timestamp}`;
  const signature = sign(payload);
  const token = `${payload}:${signature}`;
  return Buffer.from(token, 'utf8').toString('base64url');
}

export type TokenVerifyResult =
  | { ok: true; slug: string; issued_at: number }
  | { ok: false; reason: 'malformed' | 'bad_signature' | 'expired' | 'wrong_slug' | 'wrong_version' };

/**
 * Verify a signed action token. Returns ok+slug+issued_at if valid,
 * otherwise reason for failure.
 *
 * @param token  the token from the request body
 * @param expectedSlug  the slug the request claims to operate on
 * @param maxAgeMs  optional override for expiry (default 24h)
 */
export function verifyActionToken(
  token: string,
  expectedSlug: string,
  maxAgeMs: number = DEFAULT_EXPIRY_MS,
): TokenVerifyResult {
  if (!token || typeof token !== 'string') {
    return { ok: false, reason: 'malformed' };
  }

  let decoded: string;
  try {
    decoded = Buffer.from(token, 'base64url').toString('utf8');
  } catch {
    return { ok: false, reason: 'malformed' };
  }

  const parts = decoded.split(':');
  if (parts.length !== 4) {
    return { ok: false, reason: 'malformed' };
  }
  const [version, slug, timestampStr, providedSignature] = parts;

  if (version !== TOKEN_VERSION) {
    return { ok: false, reason: 'wrong_version' };
  }

  if (slug !== expectedSlug) {
    return { ok: false, reason: 'wrong_slug' };
  }

  const timestamp = parseInt(timestampStr, 10);
  if (!Number.isFinite(timestamp)) {
    return { ok: false, reason: 'malformed' };
  }

  // Constant-time signature comparison
  const payload = `${version}:${slug}:${timestamp}`;
  const expectedSignature = sign(payload);

  let signaturesMatch = false;
  try {
    const a = Buffer.from(providedSignature);
    const b = Buffer.from(expectedSignature);
    if (a.length !== b.length) {
      return { ok: false, reason: 'bad_signature' };
    }
    signaturesMatch = timingSafeEqual(a, b);
  } catch {
    return { ok: false, reason: 'bad_signature' };
  }

  if (!signaturesMatch) {
    return { ok: false, reason: 'bad_signature' };
  }

  const ageMs = Date.now() - timestamp;
  if (ageMs > maxAgeMs || ageMs < 0) {
    return { ok: false, reason: 'expired' };
  }

  return { ok: true, slug, issued_at: timestamp };
}
