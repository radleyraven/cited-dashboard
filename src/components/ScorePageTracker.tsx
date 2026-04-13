'use client';
import { useEffect } from 'react';
import { trackEvent } from '@/lib/track';

export default function ScorePageTracker({ slug, name }: { slug: string; name: string }) {
  useEffect(() => {
    trackEvent(slug, 'page_view', { page: 'score' }, name);
  }, [slug, name]);
  return null;
}
