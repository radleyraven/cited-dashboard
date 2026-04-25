import { notFound } from 'next/navigation';
import { fetchPositioningBySlug } from '@/lib/positioning';
import { PositioningReviewPage } from '@/components/positioning/PositioningReviewPage';

/*
  /positioning/[slug] — Positioning Review Page (Supabase-driven template)
  Reads cited_intake.positioning_data for the given slug.
  Renders client_view ONLY. internal_meta stripped server-side.
  Built: 2026-04-24 under RTI-STANDARD Phase 3b.
  Mutation endpoints (approve, request-changes) NOT wired in this pass.
*/

export const dynamic = 'force-dynamic';

export default async function PositioningSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const review = await fetchPositioningBySlug(slug);

  if (!review) notFound();

  return <PositioningReviewPage review={review} />;
}
