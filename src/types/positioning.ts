// Types for /positioning/[slug] template route
// Aligned to actual JSONB structure written to cited_intake.positioning_data
// Storage truth first — labels can translate in render layer

export type PositioningStatus = 'pending' | 'approved' | 'changes_requested';

// Framework-native tier vocabulary (RTI v3.0 rev 3 alignment)
// Storage uses canonical values; UI layer may map to friendlier labels
export type StatTier =
  | 'gold'
  | 'silver'
  | 'gold_conditional'
  | 'tier_3_authority';

export type StatStatus =
  | 'verified'
  | 'pending'
  | 'pending_baseline_or_drop'
  | 'blocked';

export type MarketRole = 'primary' | 'secondary' | 'growth' | 'Primary' | 'Secondary' | 'Growth';

export type ChangeCategory =
  | 'markets'
  | 'pillar_1'
  | 'pillar_2'
  | 'stat_accuracy'
  | 'tone_voice'
  | 'other';

export interface ReputationOpener {
  heading: string;
  subheading: string;
  text: string;
}

export interface PillarBlock {
  heading: string;
  subheading: string;
  category: string;
  text: string;
  verification_prompt: string;
  verification_questions?: string[];
  verification_closer?: string;
  proof_points?: string[];
}

export interface NonFitBlock {
  heading: string;
  subheading: string;
  text: string;
}

export interface StatInventoryRow {
  stat: string;
  source: string;
  use: string;
  tier: StatTier;
  status: StatStatus;
  note?: string;
}

export interface StatInventoryBlock {
  heading: string;
  intro: string;
  stats: StatInventoryRow[];
  closer: string;
}

export interface MarketRow {
  name: string;
  role: MarketRole;
  career_volume: string;
  transactions: number;
}

export interface MarketsBlock {
  heading: string;
  rows: MarketRow[];
  closer: string;
}

export interface VoiceBlock {
  heading: string;
  archetype: string;
  descriptors: string[];
  text: string;
  closer: string;
}

export interface WhatHappensNextBlock {
  heading: string;
  intro: string;
  deliverables: string[];
  closer: string;
  delivery_target?: string;
}

export interface ClientView {
  client_name: string;
  client_first_name: string;
  intro_paragraph: string;
  intro_followup: string;
  reputation_opener: ReputationOpener;
  pillar_1: PillarBlock;
  pillar_2: PillarBlock;
  non_fit: NonFitBlock;
  stat_inventory: StatInventoryBlock;
  markets: MarketsBlock;
  voice: VoiceBlock;
  what_happens_next: WhatHappensNextBlock;
}

export interface FailureModeCheck {
  mode: number;
  name: string;
  status: string;
}

export interface ApprovalChainEntry {
  phase: string;
  by: string;
  timestamp: string;
  phrase: string;
}

export interface InternalMeta {
  framework_version: string;
  framework_rules_applied: Record<string, boolean>;
  failure_modes_checked: FailureModeCheck[];
  research_review_completed_at: string;
  research_synthesis_age_days: number;
  research_synthesis_canonical_age_ok: boolean;
  draft_version: string;
  supersedes: string;
  internal_reviewer: string;
  approval_chain: ApprovalChainEntry[];
  open_blockers: string[];
}

export interface PositioningData {
  version: string;
  framework_version: string;
  locked_at: string;
  source_doc: string;
  research_synthesis: string;
  client_view: ClientView;
  internal_meta: InternalMeta;
}

// Full intake row (server-only — never render this shape to client)
export interface IntakeRowWithPositioning {
  id: string;
  slug: string;
  full_name: string;
  email?: string;
  brokerage?: string;
  primary_markets?: string;
  positioning_status?: PositioningStatus;
  positioning_approved_at?: string | null;
  positioning_approved_version?: string;
  positioning_retry_count?: number;
  positioning_data?: PositioningData;
}

// Public render payload (client_view only — internal_meta stripped)
export interface PublicPositioningReview {
  id: string;
  slug: string;
  full_name: string;
  positioning_status: PositioningStatus;
  positioning_approved_at: string | null;
  positioning_approved_version: string | null;
  client_view: ClientView;
}
