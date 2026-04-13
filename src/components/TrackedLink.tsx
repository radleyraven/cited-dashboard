'use client';
import { trackEvent } from '@/lib/track';

export default function TrackedLink({ href, slug, name, eventType, eventData, style, children }: {
  href: string;
  slug: string;
  name: string;
  eventType: string;
  eventData?: Record<string, unknown>;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      style={style}
      onClick={() => trackEvent(slug, eventType, eventData, name)}
    >
      {children}
    </a>
  );
}
