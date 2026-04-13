export function trackEvent(clientSlug: string, eventType: string, eventData?: Record<string, unknown>, clientName?: string) {
  // Fire and forget — non-blocking
  fetch('/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_slug: clientSlug,
      client_name: clientName,
      event_type: eventType,
      event_data: eventData || {},
      source: 'web',
    }),
  }).catch(() => {}); // Silent fail — tracking should never break UX
}
