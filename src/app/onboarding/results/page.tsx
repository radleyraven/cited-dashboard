'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';
import CitedHeader from '@/components/CitedHeader';
import CitedFooter from '@/components/CitedFooter';
import MilestoneCard, { type MilestoneData } from '@/components/MilestoneCard';

/* ═══════════════════════════════════════════════════════════════
   Citation Report — v7.0
   April 11, 2026

   Changes from v5:
   - Hybrid market cards: data source icons (original style) + confirm
   - Neighborhoods: recommended list with reasons, no checkboxes
   - Deliverable icons: SVG inline icons, no letter circles
   - "Ghostwritten" removed — collaborative language
   - Review strategy: flexible (no hardcoded platform)
   - Approve: two-step (button → reveals What Happens Next → confirm)
   - Unsaved warning: centered modal overlay, not banner
   - AI Visibility Leader removed from market cards
   ═══════════════════════════════════════════════════════════════ */

/* ── Types ── */
interface NeighborhoodData {
  name: string;
  ai_recognized: boolean;
  txn_count?: number;
  source: string;
}

interface RecommendedNeighborhood {
  name: string;
  reason: string;
  ai_status: string;
}

interface MarketData {
  name: string;
  tier: 'primary' | 'secondary' | 'growth';
  volume: string;
  txn_count: string;
  avg_price: string;
  competitor: string;
  competitor_brokerage: string;
  competitor_score: string;
  ai_signal: string;
  txn_highlight: string;
  neighborhoods: NeighborhoodData[];
  recommended_neighborhoods?: RecommendedNeighborhood[];
}

interface GapData {
  title: string;
  status: string;
  impact: string;
  points: string;
  color: string;
  action: string;
  outcome: string;
}

interface StrengthData {
  title: string;
  detail: string;
  badge: string;
}

interface TrajectoryData {
  day: string;
  score: string;
  color: string;
  headline: string;
  outcomes: string[];
}

interface DeliverableData {
  icon: string;
  title: string;
  desc: string;
  color: string;
}

interface StatData {
  value: string;
  label: string;
}

interface AIQuote {
  model: string;
  query: string;
  response: string;
  client_mentioned: boolean;
}

interface CompetitorValidation {
  name: string;
  firm: string;
  dre: string;
  location: string;
  verified: boolean;
}

interface ScanResults {
  composite_score: number;
  tier_name: string;
  tier_line: string;
  scan_date: string;
  scan_completion: string;
  query_count: number;
  model_count: number;
  platform_count: number;
  neighborhood_count: number;
  consistency_runs: number;
  txn_analyzed: number;
  stats: StatData[];
  ai_quote: AIQuote;
  strengths: StrengthData[];
  gaps: GapData[];
  markets: MarketData[];
  trajectory: TrajectoryData[];
  deliverables: DeliverableData[];
  competitor_validation?: CompetitorValidation;
  milestone_to_celebrate?: Record<string, unknown> | null;
  client_mentioned_count?: number;
  deal_map?: Record<string, unknown>;
  mls_stats?: {
    median_dom?: number;
    list_to_sale_ratio?: number;
    above_asking_rate?: number;
    above_asking_count?: number;
    above_asking_avg_dollars_over?: number;
    at_asking_count?: number;
    below_asking_count?: number;
    below_asking_avg_dollars_under?: number;
    price_reduction_count?: number;
    price_reduction_rate?: number;
    price_reduction_avg_amount?: number;
    total_dollar_difference?: number;
    sl_transaction_count?: number;
    concentration_band?: string;
    concentration_pct?: number;
    concentration_count?: number;
    listing_pct?: number;
    volume_trend_label?: string;
    price_trend_vs_market?: string;
    price_trend_label?: string;
    annual_volume_12mo?: number;
    annual_transactions_12mo?: number;
    luxury_pct?: number;
    price_band_distribution?: Array<{band: string; count: number}>;
  } | null;
}

/* ── Default deliverables (fallback when Deep Scan v2 output omits this field) ── */
const DEFAULT_DELIVERABLES: DeliverableData[] = [
  { icon: 'profiles', title: 'Platform Profile Optimization', desc: 'LinkedIn, Bing Places, Zillow, Realtor.com, and FastExpert — every platform AI pulls from, fully optimized.', color: '#0A1929' },
  { icon: 'profiles', title: 'Google Business Profile Optimization', desc: 'Claim, verify, and fully optimize your GBP — the #1 signal Gemini uses for local agent recommendations.', color: '#00BFA6' },
  { icon: 'star', title: 'Yelp Profile + Review Strategy', desc: 'Optimize your Yelp profile and build your review count — Perplexity\'s #1 data source for local recommendations.', color: '#D4A830' },
  { icon: 'article', title: 'Market Authority Articles', desc: 'Two market-specific articles per month written collaboratively in your voice, targeting your exact markets and neighborhoods.', color: '#0A1929' },
  { icon: 'globe', title: 'Satellite Site + Schema', desc: 'A dedicated authority site with RealEstateAgent schema markup — required for Gemini and ChatGPT visibility.', color: '#64748b' },
  { icon: 'chart', title: 'Monthly PRISM Scan + Report', desc: 'Full 9-engine rescan every 30 days. You see exactly what moved, what AI says about you, and what\'s next.', color: '#EF4444' },
];

/* ── Tier config ── */
const TIER_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; desc: string }> = {
  primary: { label: 'Primary Market', color: '#00BFA6', bg: '#f0fdf9', border: '#00BFA6', desc: 'Your headline market. Deepest evidence, highest optimization priority.' },
  secondary: { label: 'Secondary Market', color: '#D4A830', bg: '#fffdf5', border: '#D4A830', desc: 'Strong signal. Included in all content and platform optimization.' },
  growth: { label: 'Growth Market', color: '#64748b', bg: '#f0f4f8', border: '#94a3b8', desc: 'Building toward. Content and visibility grow over time.' },
};

/* ── Inline SVG icons ── */
function DeliverableIcon({ type, size = 28 }: { type: string; size?: number }) {
  const icons: Record<string, string> = {
    profiles: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>`,
    globe: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 4 10 15 15 0 0 1-4 10 15 15 0 0 1-4-10 15 15 0 0 1 4-10z"/></svg>`,
    article: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
    star: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
    chart: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
    refresh: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>`,
  };
  return (
    <div
      style={{ color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      dangerouslySetInnerHTML={{ __html: icons[type] || icons.article }}
    />
  );
}

/* ── Progress indicator ── */
function ProgressIndicator() {
  const steps = ['Citation Report', 'Approve Strategy', 'Positioning', 'Copy Kit'];
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px 24px', background: '#fff', borderBottom: '1px solid #f1f5f9' }}>
      {steps.map((step, i) => (
        <div key={step} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', opacity: i === 0 ? 1 : 0.35 }}>
            <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: i === 0 ? '#0A1929' : '#e2e8f0', color: i === 0 ? '#fff' : '#94a3b8', fontSize: '10px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</div>
            {/* Show label only for active step on mobile */}
            {i === 0 && <span style={{ fontSize: '12px', fontWeight: 700, color: '#0A1929', whiteSpace: 'nowrap' }}>{step}</span>}
          </div>
          {i < steps.length - 1 && <div style={{ width: '20px', height: '1px', background: '#e2e8f0', flexShrink: 0 }} />}
        </div>
      ))}
    </div>
  );
}

/* ── Continue button ── */
function ContinueButton({ onClick, text }: { onClick: () => void; text: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '24px 0 8px' }}>
      <button onClick={onClick} style={{ background: '#00BFA6', color: '#fff', border: 'none', padding: '14px 32px', borderRadius: '8px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,191,166,0.25)' }}>
        {text} →
      </button>
    </div>
  );
}

/* ── Depth badge ── */
function DepthBadge({ text }: { text: string }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f0f4f8', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', color: '#475569', fontWeight: 500 }}>
      <span style={{ color: '#00BFA6', fontWeight: 700 }}>●</span> {text}
    </div>
  );
}

/* ── Section header ── */
function SectionHeader({ num, title, color }: { num: string; title: string; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: color, color: '#fff', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{num}</div>
      <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0A1929', margin: 0 }}>{title}</h2>
    </div>
  );
}

/* ── Centered modal ── */
function Modal({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ background: '#fff', borderRadius: '16px', padding: '32px 28px', maxWidth: '360px', width: '100%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚠️</div>
        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0A1929', margin: '0 0 8px 0' }}>Confirm all 3 markets first</h3>
        <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 24px 0', lineHeight: 1.5 }}>
          Scroll up and tap <strong>Confirm</strong> on each market before approving your strategy.
        </p>
        <button onClick={onClose} style={{ width: '100%', padding: '14px', background: '#00BFA6', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', marginBottom: '10px' }}>
          Go Back and Confirm
        </button>
        <button onClick={onConfirm} style={{ width: '100%', padding: '10px', background: 'none', color: '#94a3b8', border: 'none', fontSize: '13px', cursor: 'pointer' }}>
          Skip — approve anyway
        </button>
      </div>
    </div>
  );
}

/* ── Strength cards — collapsible ── */
const STRENGTH_ICONS: Record<string, string> = {
  'Content Freshness': '🔄',
  'Direct Name Recognition': '✓',
  'Google Business Profile': '⭐',
};

function StrengthCards({ strengths }: { strengths: StrengthData[] }) {
  const [expanded, setExpanded] = useState<number | null>(null);
  return (
    <div>
      {strengths.map((item, i) => {
        const isOpen = expanded === i;
        return (
          <div key={i} style={{
            background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px',
            marginBottom: '8px', overflow: 'hidden',
            boxShadow: isOpen ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
          }}>
            <button onClick={() => setExpanded(isOpen ? null : i)} style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '8px', background: '#f0fdf9',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0,
                }}>
                  {STRENGTH_ICONS[item.title] || '✓'}
                </div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#0A1929' }}>{item.title}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ background: '#f0fdf9', color: '#00BFA6', fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '12px' }}>{item.badge}</div>
                <div style={{ fontSize: '12px', color: '#94a3b8', transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</div>
              </div>
            </button>
            {isOpen && (
              <div style={{ padding: '0 16px 14px', borderTop: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6, paddingTop: '10px' }}>{item.detail}</div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── normalizeScanResults — bridges Deep Scan v2 output → ScanResults interface ── */
function normalizeScanResults(sr: Record<string, unknown>): ScanResults {
  // Adapter: maps Deep Scan v2 field names → ScanResults interface
  // This bridges the gap between cited-prism-score-v2.py output and the page contract
  const primaryMarket = (Array.isArray(sr.markets)
    ? (sr.markets as Array<{name: string; tier: string}>).find(m => m.tier === 'primary')?.name
    : null)
    ?? (Array.isArray(sr.markets) ? (sr.markets as Array<{name: string}>)[0]?.name : null)
    ?? 'your market';
  return {
    ...sr,
    // Score fields
    composite_score: (sr.composite_score as number) ?? (sr.foundation_score as number) ?? 0,
    tier_name: (sr.tier_name as string) ?? (sr.foundation_tier as string) ?? 'Early Signal',
    tier_line: (sr.tier_line as string) ?? `Foundation Score: ${(sr.foundation_score as number) ?? 0}/100`,
    // Deliverables — required for Section 6, absent from Deep Scan output
    deliverables: (sr.deliverables as unknown[]) ?? DEFAULT_DELIVERABLES,
    // Platform/scan metadata
    platform_count: (sr.platform_count as number) ?? 13,
    scan_completion: (sr.scan_completion as string) ?? `PRISM Deep Scan — 9 engines — ${(sr.scan_date as string) ?? 'Recent'}`,
    consistency_runs: (sr.consistency_runs as number) ?? (sr.queries_completed as number) ?? 0,
    // ai_quote shape: Deep Scan outputs {text:string} OR narrative.ai_quote
    // Page expects {model, query, response} — normalize to what exists
    ai_quote: (() => {
      const aq = sr.ai_quote as Record<string,unknown> | undefined;
      // If ai_quote already has model+query+response (full object from Supabase) — use directly
      if (aq?.model && aq?.query && aq?.response) {
        return aq as {model:string,query:string,response:string,client_mentioned?:boolean};
      }
      // Fallback: narrative ai_quote text shape
      const narr = sr.narrative as Record<string,unknown> | undefined;
      const narrativeText = (narr?.ai_quote as Record<string,unknown>)?.text as string | undefined
        ?? (aq?.text as string | undefined);
      if (narrativeText) {
        const primaryMarket = (sr.markets as Array<{name:string,tier:string}>)?.find(m => m.tier === 'primary')?.name
          ?? (sr.markets as Array<{name:string}>)?.[0]?.name ?? 'Carlsbad';
        return { model: 'Multiple AI engines', query: `Who is the best real estate agent in ${primaryMarket}?`, response: narrativeText, client_mentioned: false };
      }
      return { model: 'Multiple AI engines', query: '', response: '', client_mentioned: false };
    })(),
    // Transaction count for stats display
    txn_analyzed: (sr.txn_analyzed as number) ?? (sr.deal_map as Record<string,unknown>)?.closed_count as number ?? 0,
    // gaps.points: ensure string type if page expects it
    gaps: Array.isArray(sr.gaps) ? (sr.gaps as Record<string,unknown>[]).map(g => ({
      ...g,
      points: String(g.points ?? ''),
    })) : [],
    stats: Array.isArray(sr.stats) ? sr.stats : [],
    strengths: Array.isArray(sr.strengths) ? sr.strengths : [],
    trajectory: Array.isArray(sr.trajectory) && (sr.trajectory as unknown[]).length > 0
      ? sr.trajectory
      : (() => {
          const base = (sr.foundation_score as number) ?? (sr.composite_score as number) ?? 0;
          return [
            { day: 'Day 0', score: String(base), color: base < 35 ? '#DC2626' : '#D4A830', headline: 'Baseline established', outcomes: ['AI citation footprint mapped', 'Competitor gap identified'] },
            { day: 'Day 30', score: String(Math.min(100, base + 19)), color: '#D4A830', headline: 'Platform foundation built', outcomes: ['GBP + Yelp optimized', 'First market article published', 'Day 30 score update delivered'] },
            { day: 'Day 60', score: String(Math.min(100, base + 33)), color: '#D4A830', headline: 'Content & media momentum', outcomes: ['3+ earned media mentions', 'AI connects your name to your markets', 'Entity signals locked'] },
            { day: 'Day 90', score: String(Math.min(100, base + 46)) + '+', color: '#00BFA6', headline: 'AI starts recommending you', outcomes: [`First time AI recommends you in ${(sr.markets as Array<{name:string,tier:string}>)?.find(m=>m.tier==='primary')?.name ?? 'your market'}`, 'Foundation Score verified', 'Citation Guarantee™ check'] },
          ];
        })(),
    mls_stats: (() => {
      const statsRaw = (sr as Record<string,unknown>).mls_stats as Record<string,unknown> | undefined;
      const statsAlt = (sr as Record<string,unknown>).stats as Record<string,unknown> | undefined;
      const s = statsRaw ?? (Array.isArray(statsAlt) ? undefined : statsAlt);
      if (!s) return null;
      // Pass through all fields — Block 1-4 fields flow through automatically
      return s as ScanResults['mls_stats'];
    })(),
    query_count: (sr.query_count as number) ?? 0,
    neighborhood_count: (sr.neighborhood_count as number) ?? (Array.isArray(sr.markets) ? (sr.markets as Record<string,unknown>[]).reduce((n, m) => n + ((m.neighborhoods as unknown[])?.length ?? 0), 0) : 0),
    milestone_to_celebrate: (sr.milestone_to_celebrate as ScanResults['milestone_to_celebrate']) ?? null,
  } as ScanResults;
}

/* ── selectGoldStats — determines which hero stats get gold color ── */
function selectGoldStats(scan: ScanResults): Set<string> {
  const gold = new Set<string>();
  const mls = scan.mls_stats;
  const dealMap = scan.deal_map as Record<string,unknown> | undefined;

  // Always gold: career volume
  if (dealMap?.career_volume || scan.stats?.find((s: {label:string}) => s.label === 'Career Volume')) {
    gold.add('Career Volume');
  }

  // Gold if median_dom present
  if (mls?.median_dom != null) gold.add('Median DOM');

  // Gold if list_to_sale >= 95%
  if (mls?.list_to_sale_ratio != null && mls.list_to_sale_ratio >= 0.95) gold.add('List-to-Sale');

  // Gold if above_asking_rate >= 20%
  if (mls?.above_asking_rate != null && mls.above_asking_rate >= 0.20) gold.add('Above Asking');

  // Cap at 3 — keep first 3 added
  const capped = new Set<string>();
  for (const k of gold) {
    if (capped.size >= 3) break;
    capped.add(k);
  }
  return capped;
}

/* ── Condensed bar ── */
function CondensedBar({ num, summary, onClick }: { num: number; summary: string; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: '#f8f9fa',
        borderRadius: '8px',
        padding: '10px 16px',
        marginBottom: '12px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        border: '1px solid #e2e8f0',
      }}
    >
      <span style={{ fontSize: '13px', color: '#0A1929', fontWeight: 600 }}>
        {num}. {summary}
      </span>
      <span style={{ fontSize: '11px', color: '#00BFA6', fontWeight: 600 }}>Expand ↑</span>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════════════════ */
function ResultsContent() {
  const [clientName, setClientName] = useState('');
  const [approved, setApproved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [recordId, setRecordId] = useState('');
  const [scan, setScan] = useState<ScanResults | null>(null);
  const [visibleSection, setVisibleSection] = useState(1);
  const [marketConfirms, setMarketConfirms] = useState<boolean[]>([]);
  const [expandedMarket, setExpandedMarket] = useState<number | null>(null);
  const [showApprovePanel, setShowApprovePanel] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [audienceFocus, setAudienceFocus] = useState<string>('sellers');
  const [expandedSection, setExpandedSection] = useState<number | null>(null);
  const [milestonePopupDismissed, setMilestonePopupDismissed] = useState(false);

  const searchParams = useSearchParams();
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const marketsRef = useRef<HTMLDivElement | null>(null);
  const approvePanelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const supabase = createSupabaseBrowserClient();
    const token = searchParams.get('token');
    if (token) {
      const { data } = await supabase.from('cited_intake')
        .select('id, full_name, markets_approved, scan_results, audience_focus')
        .eq('onboarding_token', token).single();
      if (data) {
        setRecordId(data.id);
        setClientName(data.full_name || '');
        if (data.markets_approved) { setApproved(true); setVisibleSection(8); setShowApprovePanel(true); }
        if (data.audience_focus) setAudienceFocus(data.audience_focus);
        if (data.scan_results) {
          const sr = data.scan_results as ScanResults;
          setScan(normalizeScanResults(sr as unknown as Record<string, unknown>));
          setMarketConfirms((sr.markets || []).map(() => false));
        }
      }
    }
    setLoading(false);
  }

  const revealNext = useCallback((sectionNum: number) => {
    setVisibleSection(prev => Math.max(prev, sectionNum));
    setTimeout(() => {
      const ref = sectionRefs.current[sectionNum - 1];
      if (ref) ref.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }, []);

  function scrollToMarkets() {
    setShowModal(false);
    setTimeout(() => {
      if (marketsRef.current) marketsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  function toggleMarket(i: number) {
    setMarketConfirms(prev => { const n = [...prev]; n[i] = !n[i]; return n; });
  }

  function approveAllMarkets() { setMarketConfirms(prev => prev.map(() => true)); }

  function handleApproveClick() {
    if (!allMarketsConfirmed) {
      setShowModal(true);
      scrollToMarkets();
      return;
    }
    setShowApprovePanel(true);
    setTimeout(() => {
      if (approvePanelRef.current) approvePanelRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  async function handleFinalApprove() {
    if (!recordId || !scan) return;
    setSaving(true);
    const supabase = createSupabaseBrowserClient();
    await supabase.from('cited_intake').update({
      markets_approved: true,
      markets_approved_at: new Date().toISOString(),
      neighborhoods_confirmed: true,
      neighborhoods_confirmed_at: new Date().toISOString(),
    }).eq('id', recordId);
    setApproved(true);
    setSaving(false);
  }

  const allMarketsConfirmed = marketConfirms.length > 0 && marketConfirms.every(Boolean);
  const confirmedCount = marketConfirms.filter(Boolean).length;
  const firstName = clientName.split(' ')[0] || '';

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0A1929', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '24px', fontWeight: 900, color: '#fff', letterSpacing: '2px' }}>CITED</div>
        <div style={{ fontSize: '14px', color: '#94a3b8', marginTop: '8px' }}>Loading your Citation Report...</div>
      </div>
    </div>
  );

  if (!scan) return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '24px', fontWeight: 900, color: '#0A1929', letterSpacing: '2px' }}>CITED</div>
        <p style={{ fontSize: '16px', color: '#64748b', marginTop: '16px' }}>Your Citation Report isn&apos;t ready yet. Check back soon.</p>
      </div>
    </div>
  );

  // scan is non-null beyond this point (TypeScript narrowing via explicit cast)
  const safeScan = scan as ScanResults;

  const primaryCompetitor = scan.markets?.find(m => m.tier === 'primary') ?? scan.markets?.[0];
  const primaryMarket = scan.markets?.find(m => m.tier === 'primary')?.name ?? scan.markets?.[0]?.name ?? 'Carlsbad';

  const primaryMarketForCondense = scan?.markets?.find(m => m.tier === 'primary')?.name ?? scan?.markets?.[0]?.name ?? 'Carlsbad';
  const totalRecoverablePoints = scan?.gaps?.reduce((sum: number, g: {points: string | number}) => sum + Number(String(g.points).replace(' pts', '')), 0) ?? 0;
  const day90Score = scan ? Math.min(100, scan.composite_score + 46) : 0;

  function isCondensed(sectionNum: number): boolean {
    // A section is condensed if: it has been revealed AND a later section is now visible AND user hasn't re-expanded it
    return visibleSection > sectionNum && expandedSection !== sectionNum;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      {showModal && <Modal onClose={scrollToMarkets} onConfirm={() => { setShowModal(false); if (allMarketsConfirmed) setShowApprovePanel(true); }} />}

      <CitedHeader variant="onboarding" userEmail="" userName={clientName} clientTier="founding_client" />
      <ProgressIndicator />

      {/* ═══ BLOCK 0: MILESTONE CARD ═══ */}
      {safeScan.milestone_to_celebrate && !milestonePopupDismissed && (
        <MilestoneCard
          milestone={safeScan.milestone_to_celebrate as unknown as MilestoneData}
          onDismiss={() => setMilestonePopupDismissed(true)}
        />
      )}

      {/* ═══ HERO ═══ */}
      <div style={{ background: '#0A1929', padding: '44px 24px 40px', textAlign: 'center' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <div style={{ fontSize: '12px', color: '#00BFA6', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '14px' }}>
            Your Citation Report is Ready
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#fff', lineHeight: 1.3, margin: '0 0 6px 0' }}>
            {firstName ? `${firstName}, here's what we found.` : "Here's what we found."}
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 24px 0', lineHeight: 1.5 }}>
            We ran {scan.query_count} queries across {scan.model_count} AI engines {audienceFocus === 'buyers' ? 'buyers and sellers' : 'sellers and buyers'} use, audited {scan.platform_count} platforms,
            and analyzed {scan.txn_analyzed} transactions across your markets.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '24px' }}>
            {(() => {
              const goldStats = selectGoldStats(scan);
              // Sort: gold stats first, then others. Cap at 6, show 2 rows of 3.
              const allStats = scan.stats ?? [];
              const sorted = [
                ...allStats.filter(s => goldStats.has(s.label)),
                ...allStats.filter(s => !goldStats.has(s.label)),
              ].slice(0, 6);
              return sorted.map((stat) => {
                const isGold = goldStats.has(stat.label);
                return (
                  <div key={stat.label} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '12px 8px' }}>
                    <div style={{ fontSize: '22px', fontWeight: 900, color: isGold ? '#D4A830' : '#00BFA6' }}>{stat.value}</div>
                    <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '3px', lineHeight: 1.3 }}>{stat.label}</div>
                  </div>
                );
              });
            })()}
          </div>

          <p style={{ fontSize: '15px', color: '#94a3b8', lineHeight: 1.6, margin: 0, maxWidth: '520px', marginLeft: 'auto', marginRight: 'auto' }}>
            These numbers tell the story of a top-performing luxury agent. But when {audienceFocus === 'buyers' ? 'buyers and sellers' : 'sellers and buyers'} ask AI who to call —{' '}
            <span style={{ color: '#fff', fontWeight: 600 }}>your name doesn&apos;t come up. Let&apos;s fix that.</span>
          </p>
        </div>
      </div>
      <div style={{ height: '3px', background: 'linear-gradient(90deg, #00BFA6, #D4A830, #00BFA6)' }} />

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '0 24px 32px' }}>

        {/* ═══ SECTION 1: DISCOVERY GAP ═══ */}
        <div ref={el => { sectionRefs.current[0] = el; }} style={{ paddingTop: '36px' }}>
          {isCondensed(1) ? (
            <CondensedBar
              num={1}
              summary={`Foundation Score: ${scan.composite_score}/100 · ${primaryMarketForCondense}`}
              onClick={() => {
                setExpandedSection(1);
                setTimeout(() => {
                  const ref = sectionRefs.current[0];
                  if (ref) ref.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
              }}
            />
          ) : (
          <><SectionHeader num="1" title="The Discovery Gap" color="#0A1929" />
          <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 16px 0', lineHeight: 1.5 }}>
            Your next client is asking AI who to {audienceFocus === 'buyers' ? 'buy with' : 'list with'} right now. Here&apos;s what one of those queries returned:
          </p>

          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', marginBottom: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            {/* Query header */}
            <div style={{ background: '#f8f9fa', padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>We asked {scan.ai_quote.model}:</div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#0A1929', fontStyle: 'italic', lineHeight: 1.4 }}>&ldquo;{scan.ai_quote.query}&rdquo;</div>
            </div>
            {/* AI response */}
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>{scan.ai_quote.model} responded:</div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ width: '3px', background: '#EF4444', borderRadius: '2px', flexShrink: 0 }} />
                <div style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6 }}>&ldquo;{(() => {
                  const text = scan.ai_quote.response;
                  if (!text || text.length <= 280) return text;
                  // Truncate at last sentence boundary before 280 chars
                  const trimmed = text.slice(0, 280);
                  const lastPeriod = Math.max(trimmed.lastIndexOf('. '), trimmed.lastIndexOf('." '), trimmed.lastIndexOf('."'));
                  return lastPeriod > 150 ? text.slice(0, lastPeriod + 1) + '...' : trimmed.slice(0, trimmed.lastIndexOf(' ')) + '...';
                })()}&rdquo;</div>
              </div>
            </div>
            {/* Not mentioned callout removed — conveyed via discovery stat block below */}
            {/* Result — context + stat inline */}
            <div style={{ padding: '12px 16px', background: '#fff5f5', borderTop: '1px solid #fee2e2' }}>
              <div style={{ fontSize: '13px', color: '#EF4444', fontWeight: 600, lineHeight: 1.5 }}>
                We ran that search — and {(scan.query_count - 1).toLocaleString()} others just like it — across all the AI tools {audienceFocus === 'buyers' ? 'buyers and sellers' : 'sellers and buyers'} are using right now to find agents.
              </div>
            </div>
          </div>

          {/* Discovery Stat Block — A-8/Flag 1 */}
          <div style={{ background: '#0A1929', borderRadius: '10px', padding: '20px 24px', marginBottom: '20px' }}>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#fff', textAlign: 'center', marginBottom: '16px', lineHeight: 1.3 }}>
              AI recognizes your name. AI doesn&apos;t recommend you.
            </div>
            <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', marginBottom: '12px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '48px', fontWeight: 900, color: '#00BFA6', lineHeight: 1 }}>{scan.client_mentioned_count ?? 0}</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px', lineHeight: 1.4 }}>times AI recognized your name</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '48px', fontWeight: 900, color: '#EF4444', lineHeight: 1 }}>0</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px', lineHeight: 1.4 }}>times AI recommended you in {primaryMarket}</div>
              </div>
            </div>
            <div style={{ fontSize: '13px', color: '#94a3b8', textAlign: 'center' }}>
              We ran {scan.query_count.toLocaleString()} queries across 9 AI engines.
            </div>
          </div>

          {primaryCompetitor && (
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', overflow: 'hidden', marginBottom: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>

              {/* Score spectrum bar */}
              <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Foundation Score Scale</div>
                  <div style={{ fontSize: '10px', color: '#94a3b8', background: '#f0f4f8', borderRadius: '4px', padding: '3px 8px' }}>Based on {scan.query_count} queries across all AI models</div>
                </div>
                <div style={{ position: 'relative', height: '8px', borderRadius: '4px', background: 'linear-gradient(90deg, #EF4444 0%, #F59E0B 30%, #D4A830 50%, #00BFA6 75%, #0A1929 100%)', marginBottom: '6px' }}>
                  {/* Radley marker */}
                  <div style={{
                    position: 'absolute', top: '-4px', left: `${scan.composite_score}%`,
                    width: '16px', height: '16px', borderRadius: '50%', background: '#0A1929',
                    border: '2px solid #fff', boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                    transform: 'translateX(-50%)',
                  }} />
                  {/* Competitor dot removed — no score estimates on score page per spec */}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>
                  <span>0 — Not Indexed</span>
                  <span>50 — In the Mix</span>
                  <span>100 — Top Cited</span>
                </div>
              </div>

              {/* Side by side — cleaner, balanced */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>

                {/* Radley */}
                <div style={{ padding: '20px 20px 20px 20px', borderRight: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '12px' }}>Your Score</div>
                  <div style={{ fontSize: '48px', fontWeight: 900, color: '#0A1929', lineHeight: 1 }}>{scan.composite_score}</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px', marginBottom: '12px' }}>out of 100</div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f0f4f8', borderRadius: '20px', padding: '4px 12px', marginBottom: '10px' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#64748b' }} />
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#475569' }}>{scan.tier_name}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.5 }}>
                    AI knows you — but doesn&apos;t recommend you in discovery searches yet.
                  </div>
                </div>

                {/* Competitor */}
                <div style={{ padding: '20px', background: '#fafbfc' }}>
                  <div style={{ fontSize: '10px', color: '#EF4444', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '12px' }}>Benchmark</div>
                  {/* Score aligned with left panel */}
                  <div style={{ fontSize: '48px', fontWeight: 900, color: '#EF4444', lineHeight: 1 }}>{primaryCompetitor?.competitor_score ?? '~52'}</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px', marginBottom: '12px' }}>est. Foundation Score</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0A1929', marginBottom: '2px' }}>{primaryCompetitor?.competitor ?? 'Top Local Agent'}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '8px' }}>{primaryCompetitor?.competitor_brokerage ?? ''}</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.5 }}>
                    AI recommends them in {primaryCompetitor?.name ?? primaryMarket} — the position we&apos;re building you into.
                  </div>
                </div>
              </div>

              {/* What the gap means */}
              <div style={{ padding: '14px 20px', background: '#0A1929', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.5, flex: 1 }}>
                  <span style={{ color: '#fff', fontWeight: 700 }}>46 points you&apos;re leaving on the table</span>
                  <span> — enough to move from {scan.composite_score} to 65+ in 90 days.</span>
                </div>
              </div>
            </div>
          )}

          {visibleSection < 2 && <ContinueButton onClick={() => revealNext(2)} text="See What's Working" />}
          </>
          )}
        </div>

        {/* ═══ SECTION 2: STRENGTHS ═══ */}
        {visibleSection >= 2 && (
          <div ref={el => { sectionRefs.current[1] = el; }} style={{ paddingTop: '36px' }}>
            {isCondensed(2) ? (
              <CondensedBar
                num={2}
                summary={`${scan.strengths?.length ?? 0} strengths identified`}
                onClick={() => {
                  setExpandedSection(2);
                  setTimeout(() => {
                    const ref = sectionRefs.current[1];
                    if (ref) ref.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 100);
                }}
              />
            ) : (
            <><SectionHeader num="2" title="What's Already Working" color="#00BFA6" />
            <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 4px 0', lineHeight: 1.5 }}>
              You&apos;re not starting from zero. Our {scan.platform_count}-platform audit found real strengths to build on.
            </p>
            <div style={{ marginBottom: '16px' }}><DepthBadge text={`${scan.platform_count} platforms audited · ${scan.query_count} queries analyzed`} /></div>

            <StrengthCards strengths={scan.strengths} />

            {/* Block 2 — Pricing Performance */}
            {scan.mls_stats?.sl_transaction_count && scan.mls_stats.sl_transaction_count > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
                Your Listing Performance
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                {/* Above asking */}
                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '12px 8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '22px', fontWeight: 900, color: '#00BFA6' }}>{scan.mls_stats.above_asking_count}</div>
                  <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '3px', lineHeight: 1.3 }}>above asking</div>
                    {scan.mls_stats.above_asking_avg_dollars_over && (
                    <div style={{ fontSize: '10px', color: '#00BFA6', fontWeight: 600, marginTop: '2px' }}>
                      avg +${Math.round(scan.mls_stats.above_asking_avg_dollars_over / 1000)}K
                    </div>
                  )}
                </div>
                {/* At asking */}
                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '12px 8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '22px', fontWeight: 900, color: '#94a3b8' }}>{scan.mls_stats.at_asking_count}</div>
                  <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '3px', lineHeight: 1.3 }}>at asking</div>
                </div>
                {/* Below asking */}
                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '12px 8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '22px', fontWeight: 900, color: '#94a3b8' }}>{scan.mls_stats.below_asking_count}</div>
                  <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '3px', lineHeight: 1.3 }}>below asking</div>
                </div>
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.5 }}>
                {(() => {
                  const noReduceRate = scan.mls_stats!.sl_transaction_count! > 0
                    ? Math.round(((scan.mls_stats!.sl_transaction_count! - (scan.mls_stats!.price_reduction_count ?? 0)) / scan.mls_stats!.sl_transaction_count!) * 100)
                    : 0;
                  const listingLabel = (scan.mls_stats!.listing_pct ?? 0) >= 0.75
                    ? `${Math.round((scan.mls_stats!.listing_pct ?? 0) * 100)}% listing-side — seller specialist`
                    : (scan.mls_stats!.listing_pct ?? 0) >= 0.60
                    ? `${Math.round((scan.mls_stats!.listing_pct ?? 0) * 100)}% listing-side`
                    : 'balanced buyer/seller';
                  return `${noReduceRate}% of listings sold without a price reduction · ${listingLabel}`;
                })()}
              </div>
            </div>
          )}

            {/* Block 3 — Market Concentration */}
            {scan.mls_stats?.price_band_distribution && scan.mls_stats.price_band_distribution.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
                Where Your Deals Concentrate
              </div>
              {(() => {
                const bands = [...scan.mls_stats!.price_band_distribution!]
                  .filter(b => b.count > 0)
                  .sort((a, b) => b.count - a.count)
                  .slice(0, 5);
                const maxCount = bands[0]?.count ?? 1;
                const total = bands.reduce((s, b) => s + b.count, 0);
                return bands.map((band, i) => (
                  <div key={band.band} style={{ marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ fontSize: '10px', color: '#94a3b8', width: '80px', flexShrink: 0 }}>{band.band}</div>
                    <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: '3px', height: '8px', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.round((band.count / maxCount) * 100)}%`, height: '100%', background: i === 0 ? '#D4A830' : '#00BFA6', borderRadius: '3px' }} />
                    </div>
                    <div style={{ fontSize: '10px', color: i === 0 ? '#D4A830' : '#94a3b8', width: '50px', flexShrink: 0, textAlign: 'right' }}>
                      {band.count} ({Math.round((band.count / total) * 100)}%)
                    </div>
                  </div>
                ));
              })()}
              <div style={{ fontSize: '12px', color: '#D4A830', fontWeight: 600, marginTop: '8px', lineHeight: 1.5 }}>
                Core market: {scan.mls_stats.price_band_distribution.filter(b => b.count > 0).sort((a,b) => b.count - a.count)[0]?.band} ({Math.round((scan.mls_stats.price_band_distribution.filter(b=>b.count>0).sort((a,b)=>b.count-a.count)[0]?.count / scan.mls_stats.price_band_distribution.reduce((s,b)=>s+b.count,0)) * 100)}% of deals)
              </div>
            </div>
          )}

            {/* Block 4 — Momentum */}
          {(scan.mls_stats?.volume_trend_label || scan.mls_stats?.price_trend_vs_market) && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
                Your Market Momentum
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                  {scan.mls_stats.annual_volume_12mo && (
                  <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '12px 8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '22px', fontWeight: 900, color: '#00BFA6' }}>
                      ${(scan.mls_stats.annual_volume_12mo / 1e6).toFixed(1)}M
                    </div>
                    <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '3px', lineHeight: 1.3 }}>last 12 months volume</div>
                  </div>
                )}
                  {scan.mls_stats.price_trend_vs_market && (
                  <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '12px 8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', fontWeight: 900, color: '#00BFA6', lineHeight: 1.2 }}>{scan.mls_stats.price_trend_vs_market.split(' ')[0]}</div>
                    <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '3px', lineHeight: 1.3 }}>above market avg appreciation</div>
                  </div>
                )}
              </div>
                {scan.mls_stats.volume_trend_label && (
                <div style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.5 }}>
                    {scan.mls_stats.volume_trend_label === 'growing' ? '📈' : scan.mls_stats.volume_trend_label === 'declining' ? '📉' : '➡️'} Volume trending: {scan.mls_stats.volume_trend_label}
                  {(scan.mls_stats.luxury_pct ?? 0) >= 0.50 && ` · ${Math.round((scan.mls_stats.luxury_pct ?? 0) * 100)}% of deals are $1M+`}
                </div>
              )}
            </div>
          )}


            <div style={{ background: '#f0fdf9', borderRadius: '8px', padding: '12px 16px', marginTop: '12px', fontSize: '13px', color: '#0A1929', textAlign: 'center', fontWeight: 500 }}>
              Now you know your foundation. Next: the specific gaps costing you AI recommendations.
            </div>
            {visibleSection < 3 && <ContinueButton onClick={() => revealNext(3)} text="See Where the Gaps Are" />}
            </>
            )}
          </div>
        )}

        {/* ═══ SECTION 3: GAPS ═══ */}
        {visibleSection >= 3 && (
          <div ref={el => { sectionRefs.current[2] = el; }} style={{ paddingTop: '36px' }}>
            {isCondensed(3) ? (
              <CondensedBar
                num={3}
                summary={`${scan.gaps?.length ?? 0} gaps · ${totalRecoverablePoints} pts available`}
                onClick={() => {
                  setExpandedSection(3);
                  setTimeout(() => {
                    const ref = sectionRefs.current[2];
                    if (ref) ref.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 100);
                }}
              />
            ) : (
            <><SectionHeader num="3" title="Where the Gaps Are" color="#EF4444" />
            <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 4px 0', lineHeight: 1.5 }}>
              {scan.gaps.length} specific gaps are keeping you out of AI recommendations. Each one has a measurable fix.
            </p>
            <div style={{ marginBottom: '16px' }}><DepthBadge text={`${scan.query_count.toLocaleString()} queries · 9 AI engines · ${scan.platform_count} platforms audited`} /></div>

            {scan.gaps.map((gap, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: '12px', marginBottom: '12px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' }}>
                {/* Card header — platform + point impact */}
                <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '6px', height: '36px', borderRadius: '3px', background: gap.color, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 800, color: '#0A1929' }}>{gap.title}</div>
                      <div style={{ fontSize: '11px', color: gap.color, fontWeight: 600, marginTop: '1px' }}>{gap.status}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'center', background: gap.color === '#EF4444' ? '#fff5f5' : '#fffdf5', borderRadius: '10px', padding: '6px 12px', minWidth: '80px' }}>
                    <div style={{ fontSize: '13px', color: gap.color, fontWeight: 700 }}>
                      +{String(gap.points).replace(' pts', '')} pts available
                    </div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                      Fixing this: {scan.composite_score} → {Math.min(100, scan.composite_score + Number(String(gap.points).replace(' pts', '')))}
                    </div>
                  </div>
                </div>

                {/* Impact */}
                <div style={{ padding: '12px 16px 0', fontSize: '13px', color: '#475569', lineHeight: 1.6 }}>{gap.impact}</div>

                {/* What we do */}
                <div style={{ margin: '12px 16px', padding: '10px 14px', background: '#f0fdf9', borderRadius: '8px', borderLeft: '3px solid #00BFA6' }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: '#00BFA6', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>What we do</div>
                  <div style={{ fontSize: '13px', color: '#0A1929', lineHeight: 1.5 }}>{gap.action}</div>
                </div>

                {/* Result */}
                <div style={{ padding: '0 16px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#00BFA6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: '9px', color: '#fff', fontWeight: 700 }}>→</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#00BFA6', fontWeight: 600 }}>{gap.outcome}</div>
                </div>
              </div>
            ))}

            <div style={{ background: '#0A1929', borderRadius: '8px', padding: '14px 18px', marginTop: '14px', textAlign: 'center' }}>
              <span style={{ fontSize: '14px', color: '#fff', fontWeight: 600 }}>46 points you&apos;re leaving on the table</span>
              <span style={{ fontSize: '13px', color: '#64748b', marginLeft: '10px' }}>— enough to move from {scan.composite_score} to 65+ in 90 days</span>
            </div>
            {visibleSection < 4 && <ContinueButton onClick={() => revealNext(4)} text="See Your Market Strategy" />}
            </>
            )}
          </div>
        )}

        {/* ═══ SECTION 4: MARKETS — Hybrid original style + confirm ═══ */}
        {visibleSection >= 4 && (
          <div ref={el => { sectionRefs.current[3] = el; }} style={{ paddingTop: '36px' }}>
            {isCondensed(4) ? (
              <CondensedBar
                num={4}
                summary={`${confirmedCount}/${scan.markets?.length ?? 0} markets confirmed`}
                onClick={() => {
                  setExpandedSection(4);
                  setTimeout(() => {
                    const ref = sectionRefs.current[3];
                    if (ref) ref.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 100);
                }}
              />
            ) : (
            <><div ref={marketsRef}>
              <SectionHeader num="4" title="Your Market Strategy" color="#D4A830" />
            </div>
            <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 16px 0', lineHeight: 1.5 }}>
              Based on your {scan.txn_analyzed} transactions, {scan.query_count} AI queries, and our {scan.platform_count}-platform audit,
              we recommend optimizing your AI visibility in these {scan.markets.length} markets.
            </p>

            {/* Data source icons — original style */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '20px' }}>
              {[
                { label: 'Your Input', icon: '📋', desc: 'Markets you identified' },
                { label: 'Your Transactions', icon: '📊', desc: `${scan.txn_analyzed} sales analyzed` },
                { label: 'PRISM™ Scan', icon: '🔍', desc: `${scan.query_count} AI queries run` },
              ].map(s => (
                <div key={s.label} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', marginBottom: '4px' }}>{s.icon}</div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#0A1929', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
                  <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>{s.desc}</div>
                </div>
              ))}
            </div>

            {!approved && (
              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <button onClick={approveAllMarkets} disabled={allMarketsConfirmed} style={{
                  padding: '8px 20px', background: allMarketsConfirmed ? '#e2e8f0' : '#0A1929',
                  color: allMarketsConfirmed ? '#94a3b8' : '#fff', fontSize: '12px', fontWeight: 600,
                  border: 'none', borderRadius: '6px', cursor: allMarketsConfirmed ? 'default' : 'pointer',
                }}>
                  {allMarketsConfirmed ? '✓ All Markets Confirmed' : `Confirm All ${scan.markets.length} Markets`}
                </button>
              </div>
            )}

            {(() => {
              const sortedMarkets = [...(scan.markets ?? [])].sort((a, b) => {
                const order = { primary: 0, secondary: 1, growth: 2 };
                return (order[a.tier as keyof typeof order] ?? 3) - (order[b.tier as keyof typeof order] ?? 3);
              });
              return sortedMarkets;
            })().map((market, idx) => {
              const tier = TIER_CONFIG[market.tier] || TIER_CONFIG.growth;
              const isConfirmed = approved || marketConfirms[idx];
              const isExpanded = expandedMarket === idx;
              const hoods = market.recommended_neighborhoods || market.neighborhoods.map(n => ({
                name: n.name, reason: n.txn_count ? `${n.txn_count} transactions` : `From your ${n.source}`,
                ai_status: n.ai_recognized ? 'recognized' : 'not_indexed',
              }));

              return (
                <div key={market.name} style={{
                  background: '#fff', border: `2px solid ${isConfirmed ? '#00BFA6' : tier.border}`,
                  borderRadius: '12px', marginBottom: '16px', overflow: 'hidden', transition: 'border-color 0.3s',
                  position: 'relative',
                }}>
                  {/* Tier badge — tab style */}
                  <div style={{
                    position: 'absolute', top: 0, left: '20px',
                    background: tier.color, color: '#fff', fontSize: '10px', fontWeight: 700,
                    padding: '4px 12px', borderRadius: '0 0 8px 8px',
                    textTransform: 'uppercase', letterSpacing: '1px',
                  }}>{tier.label}</div>

                  {/* Confirm button */}
                  {!approved && (
                    <div style={{ position: 'absolute', top: '12px', right: '16px' }}>
                      <button onClick={() => toggleMarket(idx)} style={{
                        background: isConfirmed ? '#00BFA6' : '#fff',
                        color: isConfirmed ? '#fff' : '#94a3b8',
                        border: isConfirmed ? '2px solid #00BFA6' : '2px solid #e2e8f0',
                        borderRadius: '20px', padding: '4px 14px', fontSize: '11px', fontWeight: 700,
                        cursor: 'pointer', transition: 'all 0.2s',
                      }}>
                        {isConfirmed ? '✓ Confirmed' : 'Confirm'}
                      </button>
                    </div>
                  )}

                  <div style={{ padding: '20px 20px 16px', marginTop: '10px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0A1929', margin: '0 0 4px 0' }}>{market.name}</h3>
                    <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 14px 0' }}>{tier.desc}</p>

                    {/* Stats — 3 column original style */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                      {[
                        { label: 'Volume', value: market.volume },
                        { label: 'Transactions', value: market.txn_count },
                        { label: 'Avg Price', value: market.avg_price },
                      ].map(s => (
                        <div key={s.label} style={{ background: tier.bg, borderRadius: '8px', padding: '10px 12px' }}>
                          <div style={{ fontSize: '10px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
                          <div style={{ fontSize: '16px', fontWeight: 800, color: '#0A1929', marginTop: '2px' }}>{s.value}</div>
                        </div>
                      ))}
                    </div>

                    {/* AI signal */}
                    <div style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5, padding: '8px 12px', background: '#f8f9fa', borderRadius: '6px', marginBottom: '8px' }}>
                      <strong style={{ color: '#0A1929' }}>From PRISM™ Scan:</strong> {market.ai_signal}
                    </div>

                    {/* Evidence */}
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
                      <strong>Your evidence:</strong> {market.txn_highlight}
                    </div>

                    {/* Neighborhoods toggle — only show when neighborhoods exist */}
                    {(hoods.length ?? 0) > 0 && (
                      <button onClick={() => setExpandedMarket(isExpanded ? null : idx)} style={{
                        background: 'none', border: 'none', fontSize: '13px', color: '#00BFA6',
                        fontWeight: 600, cursor: 'pointer', padding: '2px 0',
                      }}>
                        {isExpanded ? '▾ Hide neighborhoods' : `▸ See ${hoods.length} recommended neighborhoods`}
                      </button>
                    )}
                  </div>

                  {/* Neighborhoods — recommended list, not checkboxes */}
                  {isExpanded && (
                    <div style={{ borderTop: '1px solid #f1f5f9', padding: '16px 20px', background: '#fafbfc' }}>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#0A1929', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                        Recommended Neighborhoods
                      </div>
                      <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 10px 0', lineHeight: 1.4 }}>
                        We recommend these {hoods.length} neighborhoods based on your transaction history and our analysis:
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {hoods.map((hood) => {
                          const recognized = hood.ai_status === 'recognized';
                          return (
                            <div key={hood.name} style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              padding: '10px 12px', background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0',
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{
                                  width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0,
                                  background: recognized ? '#f0fdf9' : '#fff5f5',
                                  border: `1.5px solid ${recognized ? '#00BFA6' : '#EF4444'}`,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontSize: '10px', fontWeight: 700, color: recognized ? '#00BFA6' : '#EF4444',
                                }}>
                                  {recognized ? '✓' : '!'}
                                </div>
                                <div>
                                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#0A1929' }}>{hood.name}</div>
                                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>{hood.reason}</div>
                                </div>
                              </div>
                              <span style={{ fontSize: '10px', fontWeight: 600, color: recognized ? '#00BFA6' : '#EF4444', whiteSpace: 'nowrap' }}>
                                {recognized ? 'AI recognizes' : 'Not in AI yet'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '10px', marginBottom: 0 }}>
                        Neighborhoods not yet in AI are where we&apos;ll build your content — getting you recommended in areas your competitors haven&apos;t claimed yet.
                      </p>
                    </div>
                  )}
                </div>
              );
            })}

            {visibleSection < 5 && <ContinueButton onClick={() => revealNext(5)} text="See Your 90-Day Path" />}
            </>
            )}
          </div>
        )}

        {/* ═══ SECTION 5: 90-DAY PATH ═══ */}
        {visibleSection >= 5 && (
          <div ref={el => { sectionRefs.current[4] = el; }} style={{ paddingTop: '36px' }}>
            {isCondensed(5) ? (
              <CondensedBar
                num={5}
                summary={`90-day path: ${scan.composite_score} → ${day90Score}+`}
                onClick={() => {
                  setExpandedSection(5);
                  setTimeout(() => {
                    const ref = sectionRefs.current[4];
                    if (ref) ref.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 100);
                }}
              />
            ) : (
            <><SectionHeader num="5" title={`From ${scan.composite_score} to 65+ — Your 90-Day Path`} color="#0A1929" />

            <div style={{ position: 'relative', paddingLeft: '30px' }}>
              <div style={{ position: 'absolute', left: '11px', top: '0', bottom: '0', width: '2px', background: 'linear-gradient(180deg, #EF4444, #D4A830, #00BFA6)' }} />
              {scan.trajectory.map((ms, i) => (
                <div key={ms.day} style={{ position: 'relative', marginBottom: i < scan.trajectory.length - 1 ? '20px' : 0 }}>
                  <div style={{
                    position: 'absolute', left: '-30px', top: '2px', width: '22px', height: '22px', borderRadius: '50%',
                    background: i === 0 ? ms.color : '#fff', border: `3px solid ${ms.color}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {i === 0 && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff' }} />}
                  </div>
                  <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#0A1929' }}>{ms.day}</div>
                      <div style={{ fontSize: '16px', fontWeight: 900, color: ms.color }}>{ms.score}<span style={{ fontSize: '11px', color: '#94a3b8' }}>/100</span></div>
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: ms.color, marginBottom: '8px' }}>{ms.headline}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {ms.outcomes.map((outcome, j) => (
                        <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '12px', color: '#475569', lineHeight: 1.4 }}>
                          <span style={{ color: '#00BFA6', fontWeight: 700, flexShrink: 0 }}>→</span>{outcome}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {visibleSection < 6 && <ContinueButton onClick={() => revealNext(6)} text="See What We're Building" />}
            <div style={{ background: '#f0fdf9', borderRadius: '8px', padding: '12px 16px', fontSize: '14px', color: '#0A1929', textAlign: 'center', marginTop: '10px', border: '1px solid #00BFA6' }}>
              <strong>Citation Guarantee™:</strong> +20 points in 90 days or you owe nothing. Ever.
            </div>
            </>
            )}
          </div>
        )}

        {/* ═══ SECTION 6: DELIVERABLES — SVG icons ═══ */}
        {visibleSection >= 6 && (
          <div ref={el => { sectionRefs.current[5] = el; }} style={{ paddingTop: '36px' }}>
            {isCondensed(6) ? (
              <CondensedBar
                num={6}
                summary={`${scan.deliverables?.length ?? DEFAULT_DELIVERABLES.length} deliverables in your plan`}
                onClick={() => {
                  setExpandedSection(6);
                  setTimeout(() => {
                    const ref = sectionRefs.current[5];
                    if (ref) ref.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 100);
                }}
              />
            ) : (
            <><SectionHeader num="6" title="What We're Building For You" color="#00BFA6" />
            <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 16px 0', lineHeight: 1.5 }}>
              Everything in your founding package — built from your scan data, your transactions, and your markets.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {scan.deliverables.map((item, i) => (
                <div key={i} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px' }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '10px', background: item.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px',
                  }}>
                    <DeliverableIcon type={item.icon} size={20} />
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#0A1929', marginBottom: '4px' }}>{item.title}</div>
                  <div style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.5 }}>{item.desc}</div>
                </div>
              ))}
            </div>
            {visibleSection < 7 && <ContinueButton onClick={() => revealNext(7)} text="Approve Your Strategy" />}
            </>
            )}
          </div>
        )}

        {/* ═══ SECTION 7: APPROVE — two-step ═══ */}
        {visibleSection >= 7 && (
          <div ref={el => { sectionRefs.current[6] = el; }} style={{ paddingTop: '36px', marginBottom: '32px' }}>
            {!approved ? (
              <>
                <SectionHeader num="✓" title="Approve Your Strategy" color="#0A1929" />

                {/* Step 1: Approve button (shows What Happens Next panel) */}
                {!showApprovePanel ? (
                  <>
                    <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 20px 0', lineHeight: 1.5 }}>
                      You&apos;ve seen your data, your gaps, your markets, and your path. When you&apos;re ready — approve your strategy and we start building.
                    </p>
                    <button onClick={handleApproveClick} style={{
                      width: '100%', padding: '18px 24px', background: '#00BFA6', color: '#fff',
                      fontSize: '16px', fontWeight: 700, border: 'none', borderRadius: '10px',
                      cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,191,166,0.3)',
                    }}>
                      Approve My Strategy →
                    </button>
                    {!allMarketsConfirmed && (
                      <p style={{ textAlign: 'center', fontSize: '12px', color: '#94a3b8', marginTop: '10px' }}>
                        {confirmedCount}/{scan.markets.length} markets confirmed · <button onClick={scrollToMarkets} style={{ background: 'none', border: 'none', color: '#00BFA6', fontSize: '12px', fontWeight: 600, cursor: 'pointer', padding: 0 }}>go back</button>
                      </p>
                    )}
                  </>
                ) : (
                  /* Step 2: What Happens Next + final confirm */
                  <div ref={approvePanelRef}>
                    <div style={{ background: '#0A1929', borderRadius: '12px', padding: '24px', marginBottom: '16px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#00BFA6', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>
                        What happens when you confirm
                      </div>
                      {[
                        { num: '1', title: 'Your positioning statement arrives within 24 hours', desc: 'Written from this scan + your intake — the foundation for all your platform profiles.' },
                        { num: '2', title: 'We start building your platform profiles', desc: 'Optimized profiles for every platform that feeds AI recommendations — written in your voice.' },
                        { num: '3', title: 'Your dedicated website + first article begin', desc: 'The two highest-impact deliverables. Your website is the key to Google AI.' },
                      ].map((step, i) => (
                        <div key={step.num} style={{ display: 'flex', gap: '12px', marginBottom: i < 2 ? '12px' : 0 }}>
                          <div style={{ width: '22px', height: '22px', minWidth: '22px', background: '#00BFA6', borderRadius: '50%', textAlign: 'center', lineHeight: '22px', color: '#fff', fontSize: '11px', fontWeight: 700 }}>{step.num}</div>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>{step.title}</div>
                            <div style={{ fontSize: '12px', color: '#94a3b8' }}>{step.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button onClick={handleFinalApprove} disabled={saving} style={{
                      width: '100%', padding: '18px 24px', background: '#00BFA6', color: '#fff',
                      fontSize: '16px', fontWeight: 700, border: 'none', borderRadius: '10px',
                      cursor: saving ? 'wait' : 'pointer', opacity: saving ? 0.7 : 1,
                      boxShadow: '0 4px 12px rgba(0,191,166,0.3)', transition: 'opacity 0.2s',
                    }}>
                      {saving ? 'Saving...' : '✓ Confirm — Start Building'}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div style={{ background: '#0A1929', borderRadius: '12px', padding: '32px', textAlign: 'center' }}>
                <div style={{ fontSize: '36px', marginBottom: '12px' }}>🚀</div>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', margin: '0 0 8px 0' }}>Strategy Approved — We&apos;re On It</h3>
                <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0, lineHeight: 1.6 }}>
                  Your positioning statement will arrive within 24 hours.
                  Your {scan.platform_count} platform profiles and dedicated website are in production.
                </p>
              </div>
            )}
          </div>
        )}

        <CitedFooter />
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#0A1929', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: '14px', color: '#94a3b8' }}>Loading...</div>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}
