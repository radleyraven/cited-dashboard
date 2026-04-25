// Server-side data access for /positioning/[slug]
// READ-ONLY per RTI-STANDARD Phase 3b authorization scope.
// Mutation functions (approve, request-changes) held back for separate authorization.

import type {
  IntakeRowWithPositioning,
  PositioningData,
  PublicPositioningReview,
} from '@/types/positioning';

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function isPositioningData(value: unknown): value is PositioningData {
  if (!isObject(value)) return false;
  if (!isObject(value.client_view)) return false;
  if (!isObject(value.internal_meta)) return false;
  return true;
}

/**
 * Strip internal_meta before exposing to client.
 * NON-NEGOTIABLE: internal_meta must never reach the render layer.
 */
export function toPublicReview(row: IntakeRowWithPositioning): PublicPositioningReview | null {
  if (!row.positioning_data || !isPositioningData(row.positioning_data)) {
    return null;
  }
  if (!row.positioning_status) {
    return null;
  }

  return {
    id: row.id,
    slug: row.slug,
    full_name: row.full_name,
    positioning_status: row.positioning_status,
    positioning_approved_at: row.positioning_approved_at ?? null,
    positioning_approved_version: row.positioning_approved_version ?? null,
    client_view: row.positioning_data.client_view,
  };
}

/**
 * Fetch positioning review by slug.
 * Returns null if: slug not found, positioning_data not populated,
 * or positioning_data fails schema validation.
 */
export async function fetchPositioningBySlug(
  slug: string,
): Promise<PublicPositioningReview | null> {
  const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const sbKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!sbUrl || !sbKey) return null;

  const fields = [
    'id',
    'slug',
    'full_name',
    'positioning_status',
    'positioning_approved_at',
    'positioning_approved_version',
    'positioning_retry_count',
    'positioning_data',
  ].join(',');

  // Primary lookup: exact slug match
  const res = await fetch(
    `${sbUrl}/rest/v1/cited_intake?slug=eq.${encodeURIComponent(slug)}&select=${fields}&limit=1`,
    {
      headers: { apikey: sbKey, Authorization: `Bearer ${sbKey}` },
      next: { revalidate: 60 },
    },
  );

  if (!res.ok) return null;

  const rows = (await res.json()) as IntakeRowWithPositioning[];
  const row = rows[0];
  if (!row) return null;

  return toPublicReview(row);
}
