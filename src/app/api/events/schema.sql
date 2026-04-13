-- cited_events — Event logging for Cited dashboard
-- Run this migration in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS cited_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  client_slug TEXT NOT NULL,
  client_name TEXT,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  source TEXT DEFAULT 'web'
);

CREATE INDEX idx_cited_events_slug ON cited_events(client_slug);
CREATE INDEX idx_cited_events_type ON cited_events(event_type);
CREATE INDEX idx_cited_events_created ON cited_events(created_at DESC);

-- Event types:
-- page_view, cta_click, intake_started, intake_completed,
-- email_sent, email_opened, mls_received, scan_started, scan_completed,
-- report_delivered, targets_confirmed, positioning_approved, copy_kit_delivered,
-- notification
