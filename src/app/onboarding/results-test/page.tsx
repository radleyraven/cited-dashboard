'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';
import CitedHeader from '@/components/CitedHeader';
import CitedFooter from '@/components/CitedFooter';

/* ═══════════════════════════════════════════════════════════════
   Citation Report — v9.0 (Test Page)
   April 11, 2026 — 38-note research-backed redesign

   Design system from: Refactoring UI, Non-Designer's Design Book,
   Thinking with Type, Beautiful Evidence, Stanford Web Credibility Study

   Changes from v7:
   - All borders removed → background color + whitespace separation
   - Section number circles removed (chartjunk — Tufte)
   - Section connector text removed (chartjunk)
   - Score: 64px serif, dominant, nothing competes
   - Colors reduced: navy + teal only. Red = genuine alerts only.
   - Hierarchy through weight+color, not size alone (Lupton)
   - Left-aligned body content (Williams — alignment creates authority)
   - 56px section gaps (breathing room)
   - One shadow on score card only (elevation system)
   - Proportional competitor score (Tufte — data-ink integrity)
   - Market cards: small multiples, identical structure (Tufte)
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
  competitor_signals?: string[]; // Note 39: "Why AI recommends her" bullets
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

interface FoundationComponents {
  platform_presence_quality?: number;
  recommendation_readiness?: number;
  explanation_readiness?: number;
  brand_search_volume?: number;
  earned_media_authority?: number;
  entity_consistency?: number;
  specialization_clarity?: number;
  content_freshness?: number;
  schema_structured_data?: number;
}

interface VisibilityRate {
  overall_visibility_pct: number;
  competitor_visibility_pct: number;
  by_platform: Record<string, { visibility_pct: number; competitor_pct: number; queries_run: number }>;
}

interface NarrativeQuality {
  overall_accuracy: string;
  overall_favorability: string;
  query_count: number;
}

interface ScanResults {
  composite_score: number;
  foundation_score?: number;
  foundation_tier?: string;
  foundation_tier_description?: string;
  foundation_components?: FoundationComponents;
  visibility_rates?: Record<string, VisibilityRate>;
  narrative_quality?: NarrativeQuality;
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
}

/* ── Design tokens ── */
const D = {
  navy: '#0A1929',
  teal: '#00BFA6',
  red: '#EF4444',
  grayBg: '#f8f9fa',
  grayMid: '#f1f5f9',
  textPrimary: '#0A1929',
  textSecondary: '#475569',
  textTertiary: '#94a3b8',
  border: '#e2e8f0',
  sectionGap: '56px',
  cardPad: '24px',
};

const TIER_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  primary: { label: 'Primary', color: D.teal, bg: '#f0fdf9' },
  secondary: { label: 'Secondary', color: '#D4A830', bg: '#fffdf5' },
  growth: { label: 'Growth', color: '#94a3b8', bg: D.grayBg },
};

/* ── SVG deliverable icon ── */
function DeliverableIcon({ type, size = 20 }: { type: string; size?: number }) {
  const icons: Record<string, string> = {
    profiles: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>`,
    globe: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 4 10 15 15 0 0 1-4 10 15 15 0 0 1-4-10 15 15 0 0 1 4-10z"/></svg>`,
    article: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
    star: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
    chart: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
    refresh: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>`,
  };
  return (
    <div style={{ color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      dangerouslySetInnerHTML={{ __html: icons[type] || icons.article }} />
  );
}

/* ── Continue button ── */
function ContinueButton({ onClick, text }: { onClick: () => void; text: string }) {
  return (
    <div style={{ paddingTop: '32px', paddingBottom: '8px' }}>
      <button onClick={onClick} style={{
        background: D.teal, color: '#fff', border: 'none',
        padding: '14px 32px', borderRadius: '8px', fontSize: '15px',
        fontWeight: 700, cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(0,191,166,0.25)',
        display: 'block',
      }}>
        {text} →
      </button>
      {/* Note 37: subtle section transition pull */}
      <div style={{ marginTop: '32px', height: '2px', background: 'linear-gradient(90deg, rgba(0,191,166,0.18) 0%, rgba(0,191,166,0.04) 100%)', borderRadius: '1px' }} />
    </div>
  );
}

/* ── Progress bar ── */
function ProgressIndicator() {
  const steps = ['Citation Report', 'Approve Strategy', 'Positioning', 'Copy Kit'];
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px 24px', background: '#fff', borderBottom: `1px solid ${D.border}` }}>
      {steps.map((step, i) => (
        <div key={step} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', opacity: i === 0 ? 1 : 0.35 }}>
            <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: i === 0 ? D.navy : D.border, color: i === 0 ? '#fff' : D.textTertiary, fontSize: '10px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</div>
            {i === 0 && <span style={{ fontSize: '12px', fontWeight: 700, color: D.navy }}>{step}</span>}
          </div>
          {i < steps.length - 1 && <div style={{ width: '24px', height: '1px', background: D.border, flexShrink: 0 }} />}
        </div>
      ))}
    </div>
  );
}

/* ── Strengths table (compact, no accordion — Tufte: data-ink ratio) ── */
function StrengthsTable({ strengths }: { strengths: StrengthData[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {strengths.map((item, i) => (
        <div key={i} style={{ background: '#fff', borderRadius: '10px', borderLeft: `4px solid ${D.teal}`, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
            <span style={{ fontSize: '13px', color: D.teal, fontWeight: 700 }}>✓</span>
            <span style={{ fontSize: '14px', fontWeight: 600, color: D.textPrimary }}>{item.title}</span>
            <span style={{ fontSize: '12px', color: D.textTertiary, marginLeft: '4px' }}>— {item.detail.length > 60 ? item.detail.substring(0, 60) + '…' : item.detail}</span>
          </div>
          <span style={{ fontSize: '11px', fontWeight: 600, color: D.teal, background: '#f0fdf9', padding: '3px 10px', borderRadius: '12px', flexShrink: 0, marginLeft: '12px' }}>{item.badge}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Section Summary Bar (Note 40 — compact completed state, enriched) ── */
function SectionSummaryBar({ title, stats, onExpand }: { title: string; stats: { label: string; value: string; color?: string }[]; onExpand: () => void }) {
  return (
    <div
      onClick={onExpand}
      style={{
        background: '#fff', borderRadius: '10px', cursor: 'pointer',
        borderLeft: `3px solid #00BFA6`, transition: 'background 0.15s',
        padding: '18px 20px',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = '#f0faf8')}
      onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: stats.length > 0 ? '10px' : 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', color: '#00BFA6', fontWeight: 700 }}>✓</span>
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#0A1929' }}>{title}</span>
        </div>
        <span style={{ fontSize: '11px', color: '#94a3b8', flexShrink: 0 }}>expand ↓</span>
      </div>
      {stats.length > 0 && (
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', paddingLeft: '21px' }}>
          {stats.map((s, i) => (
            <div key={i} style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.4 }}>
              <span style={{ color: '#475569' }}>{s.label}: </span>
              <span style={{ fontWeight: 600, color: s.color || '#0A1929' }}>{s.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Re-collapse button — styled as pill, positioned at section end ── */
function CompactButton({ onClick }: { onClick: () => void }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '16px' }}>
      <button onClick={onClick} style={{
        background: '#f1f5f9', border: `1px solid #e2e8f0`, borderRadius: '20px',
        fontSize: '11px', color: '#94a3b8', fontWeight: 600, cursor: 'pointer',
        padding: '6px 16px', transition: 'background 0.15s',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = '#e2e8f0')}
      onMouseLeave={e => (e.currentTarget.style.background = '#f1f5f9')}
      >
        ↑ Compact this section
      </button>
    </div>
  );
}

/* ── Gap Cards (accordion) ── */
function GapCards({ gaps, audienceFocus }: { gaps: GapData[]; audienceFocus: string }) {
  // Note 42: swap buyer/seller language based on audienceFocus
  function swapAudience(text: string): string {
    if (audienceFocus === 'sellers') {
      return text.replace(/\bbuyers\b/gi, 'sellers').replace(/\bbuyer\b/gi, 'seller').replace(/\bbuy with\b/gi, 'list with').replace(/\bbuying\b/gi, 'selling');
    } else {
      return text.replace(/\bsellers\b/gi, 'buyers').replace(/\bseller\b/gi, 'buyer').replace(/\blist with\b/gi, 'buy with').replace(/\bselling\b/gi, 'buying');
    }
  }
  const [expanded, setExpanded] = useState<number | null>(null);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {gaps.map((gap, i) => {
        const isOpen = expanded === i;
        return (
          <div key={i} style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', borderLeft: `4px solid ${gap.color}` }}>
            {/* Collapsed header — always visible, full row clickable */}
            <button
              onClick={() => setExpanded(isOpen ? null : i)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#f0faf8')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#0A1929' }}>{swapAudience(gap.title)}</div>
                <div style={{ fontSize: '12px', color: gap.color, fontWeight: 600, marginTop: '3px' }}>{swapAudience(gap.status)}</div>
              </div>
              <div style={{ background: '#f0fdf9', color: '#00BFA6', fontSize: '12px', fontWeight: 700, padding: '4px 14px', borderRadius: '12px', whiteSpace: 'nowrap', flexShrink: 0, marginLeft: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {gap.points} <span style={{ fontSize: '10px', color: '#94a3b8', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▾</span>
              </div>
            </button>
            {/* Expanded detail */}
            {isOpen && (
              <div style={{ padding: '0 20px 16px 20px', borderTop: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingTop: '10px' }}>
                  <div style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5 }}><span style={{ color: '#94a3b8', fontWeight: 600 }}>The problem:</span> {swapAudience(gap.impact)}</div>
                  <div style={{ fontSize: '13px', color: '#0A1929', lineHeight: 1.5 }}><span style={{ color: '#94a3b8', fontWeight: 600 }}>The fix:</span> {swapAudience(gap.action)}</div>
                  <div style={{ fontSize: '13px', color: '#00BFA6', fontWeight: 600, lineHeight: 1.5 }}>→ {swapAudience(gap.outcome)}</div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Modal ── */
function Modal({ onClose }: { onClose: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ background: '#fff', borderRadius: '16px', padding: '32px 28px', maxWidth: '360px', width: '100%', textAlign: 'center' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#f0fdf9', border: `2px solid ${D.teal}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '16px', color: D.teal, fontWeight: 700 }}>ⓘ</div>
        <h3 style={{ fontSize: '17px', fontWeight: 800, color: D.navy, margin: '0 0 8px 0' }}>Approve all 3 markets first</h3>
        <p style={{ fontSize: '13px', color: D.textSecondary, margin: '0 0 24px 0', lineHeight: 1.6 }}>
          Scroll up and approve each market — then your strategy is ready to lock in.
        </p>
        <button onClick={onClose} style={{ width: '100%', padding: '13px', background: D.teal, color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>
          ← Review my markets
        </button>
      </div>
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
  const [audienceFocus, setAudienceFocus] = useState('sellers');
  const [visibleSection, setVisibleSection] = useState(1);
  const [collapsedSections, setCollapsedSections] = useState<Set<number>>(new Set());
  const [marketConfirms, setMarketConfirms] = useState<boolean[]>([]);
  const [hoodStep, setHoodStep] = useState<Set<number>>(new Set()); // markets showing neighborhood confirmation step
  const [hoodConfirms, setHoodConfirms] = useState<boolean[]>([]); // neighborhoods confirmed per market
  const [expandedMarket, setExpandedMarket] = useState<number | null>(null);
  const [showApprovePanel, setShowApprovePanel] = useState(false);
  const [showModal, setShowModal] = useState(false);

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
        if (data.audience_focus) setAudienceFocus(data.audience_focus);
        if (data.markets_approved) { setApproved(true); setVisibleSection(8); setShowApprovePanel(true); }
        if (data.scan_results) {
          const sr = data.scan_results as ScanResults;
          setScan(sr);
          setMarketConfirms(sr.markets.map(() => false));
        }
      }
    }
    setLoading(false);
  }

  const revealNext = useCallback((n: number) => {
    // Only compact sections 1-3 (narrative setup). Sections 4+ (Markets, 90-Day, Deliverables, Approve) stay open.
    if (n - 1 >= 1 && n - 1 <= 3) {
      setCollapsedSections(prev => new Set(prev).add(n - 1));
    }
    setVisibleSection(prev => Math.max(prev, n));
    setTimeout(() => { sectionRefs.current[n - 1]?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100);
  }, []);

  function scrollToMarkets() {
    setShowModal(false);
    setTimeout(() => { marketsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100);
  }

  function toggleMarket(i: number) {
    const wasConfirmed = marketConfirms[i];
    if (wasConfirmed) {
      // Un-approve: reset to full card
      setMarketConfirms(prev => { const n = [...prev]; n[i] = false; return n; });
      setHoodStep(prev => { const n = new Set(prev); n.delete(i); return n; });
    } else {
      // Approve market → show neighborhood step
      setHoodStep(prev => new Set(prev).add(i));
    }
  }
  function confirmNeighborhoods(i: number) {
    setHoodStep(prev => { const n = new Set(prev); n.delete(i); return n; });
    setMarketConfirms(prev => { const n = [...prev]; n[i] = true; return n; });
  }
  function approveAllMarkets() {
    setMarketConfirms(prev => prev.map(() => true));
    setHoodStep(new Set());
  }

  function handleApproveClick() {
    if (!allMarketsConfirmed) { setShowModal(true); return; }
    setShowApprovePanel(true);
    setTimeout(() => { approvePanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100);
  }

  async function handleFinalApprove() {
    if (!recordId || !scan) return;
    setSaving(true);
    const supabase = createSupabaseBrowserClient();
    await supabase.from('cited_intake').update({
      markets_approved: true, markets_approved_at: new Date().toISOString(),
      neighborhoods_confirmed: true, neighborhoods_confirmed_at: new Date().toISOString(),
      strategy_approved: true, strategy_approved_at: new Date().toISOString(),
    }).eq('id', recordId);
    setApproved(true);
    setSaving(false);
  }

  const allMarketsConfirmed = marketConfirms.length > 0 && marketConfirms.every(Boolean);
  const confirmedCount = marketConfirms.filter(Boolean).length;
  const firstName = clientName.split(' ')[0] || '';

  if (loading) return (
    <div style={{ minHeight: '100vh', background: D.navy, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '22px', fontWeight: 900, color: '#fff', letterSpacing: '3px' }}>CITED</div>
        <div style={{ fontSize: '13px', color: D.textTertiary, marginTop: '8px' }}>Loading your Citation Report...</div>
      </div>
    </div>
  );

  if (!scan) return (
    <div style={{ minHeight: '100vh', background: D.grayBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '22px', fontWeight: 900, color: D.navy, letterSpacing: '3px' }}>CITED</div>
        <p style={{ fontSize: '15px', color: D.textSecondary, marginTop: '16px' }}>Your Citation Report isn&apos;t ready yet. Check back soon.</p>
      </div>
    </div>
  );

  const primaryCompetitor = scan.markets.find(m => m.tier === 'primary');
  const clientScore = scan.composite_score;
  const competitorScore = primaryCompetitor ? parseInt(primaryCompetitor.competitor_score.replace('~', '')) : 55;
  const competitorPct = (competitorScore / 100) * 100;
  const clientPct = (clientScore / 100) * 100;

  return (
    <div style={{ minHeight: '100vh', background: D.grayBg }}>
      {showModal && <Modal onClose={scrollToMarkets} />}

      <CitedHeader variant="onboarding" userEmail="" userName={clientName} clientTier="founding_client" />
      <ProgressIndicator />

      {/* ═══ HERO ═══ */}
      <div style={{ background: D.navy, padding: '48px 24px 44px', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ fontSize: '11px', color: D.teal, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '2.5px', marginBottom: '16px' }}>
            Your Citation Report is Ready
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#fff', lineHeight: 1.25, margin: '0 0 8px 0' }}>
            {firstName ? `${firstName}, here's what we found.` : "Here's what we found."}
          </h1>
          <p style={{ fontSize: '13px', color: D.textTertiary, margin: '0 0 28px 0', lineHeight: 1.6 }}>
            Tested across the top AI platforms sellers use · {scan.platform_count} platforms audited · {scan.txn_analyzed} transactions analyzed
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '28px' }}>
            {scan.stats.map((stat) => (
              <div key={stat.label} style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '10px', padding: '14px 10px' }}>
                <div style={{ fontSize: '22px', fontWeight: 900, color: D.teal }}>{stat.value}</div>
                <div style={{ fontSize: '10px', color: D.textTertiary, marginTop: '4px', lineHeight: 1.3 }}>{stat.label}</div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: 1.7, margin: 0, maxWidth: '480px', marginLeft: 'auto', marginRight: 'auto' }}>
            These numbers tell the story of a top luxury agent. But when sellers ask AI who to list with —{' '}
            <span style={{ color: '#fff', fontWeight: 700 }}>your name doesn&apos;t come up.</span>
          </p>
        </div>
      </div>
      <div style={{ height: '3px', background: `linear-gradient(90deg, ${D.teal}, #D4A830, ${D.teal})` }} />

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: `0 24px 48px` }}>

        {/* ═══ SECTION 1: DISCOVERY GAP ═══ */}
        <div ref={el => { sectionRefs.current[0] = el; }} style={{ paddingTop: D.sectionGap }}>
        {collapsedSections.has(1) ? (
          <SectionSummaryBar title="The Discovery Gap" stats={[
            { label: 'Citation Score', value: `${clientScore}/100`, color: D.red },
            { label: 'Behind benchmark', value: `${competitorScore - clientScore} pts`, color: D.red },
            { label: 'AI queries with your name', value: '0 of 90', color: D.red },
          ]} onExpand={() => setCollapsedSections(prev => { const n = new Set(prev); n.delete(1); return n; })} />
        ) : (<>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: D.navy, margin: '0 0 6px 0' }}>The Discovery Gap</h2>
          <p style={{ fontSize: '14px', color: D.textSecondary, margin: '0 0 20px 0', lineHeight: 1.7 }}>
            Your next client is asking AI who to list with right now. Here&apos;s what one of those queries returned:
          </p>

          {/* Unified AI quote card */}
          <div style={{ background: '#fff', borderRadius: '14px', overflow: 'hidden', marginBottom: '20px', boxShadow: '0 2px 16px rgba(0,0,0,0.08)' }}>
            <div style={{ padding: '20px 24px 16px', borderBottom: `1px solid ${D.grayMid}` }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: D.textTertiary, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px' }}>
                We asked {scan.ai_quote.model}:
              </div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: D.navy, fontStyle: 'italic', lineHeight: 1.4 }}>
                &ldquo;{scan.ai_quote.query}&rdquo;
              </div>
            </div>
            <div style={{ padding: '16px 24px', borderBottom: `1px solid ${D.grayMid}` }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ width: '3px', minWidth: '3px', background: D.red, borderRadius: '2px', alignSelf: 'stretch' }} />
                <div style={{ fontSize: '13px', color: D.textSecondary, lineHeight: 1.8 }}>
                  &ldquo;{(() => {
                    const response = scan.ai_quote.response;
                    const competitor = primaryCompetitor?.competitor;
                    if (!competitor || !response.includes(competitor)) return response;
                    const parts = response.split(competitor);
                    return parts.map((part, i) => (
                      i < parts.length - 1
                        ? <span key={i}>{part}<strong style={{ color: D.navy, fontWeight: 800 }}>{competitor}</strong></span>
                        : <span key={i}>{part}</span>
                    ));
                  })()}&rdquo;
                </div>
              </div>
            </div>
            <div style={{ padding: '14px 24px', background: D.grayBg, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
              <p style={{ fontSize: '13px', color: D.textSecondary, margin: 0, lineHeight: 1.6, flex: 1 }}>
                We ran that search — and 89 others across all the AI tools sellers are using right now. Your name appeared:
              </p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', flexShrink: 0 }}>
                <span style={{ fontSize: '40px', fontWeight: 900, color: D.red, lineHeight: 1 }}>0</span>
                <span style={{ fontSize: '13px', color: D.textTertiary }}>/ 90 times</span>
              </div>
            </div>
          </div>

          {/* Score card — THE dominant element */}
          {primaryCompetitor && (
            <div style={{ background: '#fff', borderRadius: '14px', overflow: 'hidden', marginBottom: '20px', boxShadow: '0 4px 24px rgba(0,0,0,0.10)' }}>

              {/* Score scale */}
              <div style={{ padding: '20px 24px 16px', borderBottom: `1px solid ${D.grayMid}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: D.textTertiary, textTransform: 'uppercase', letterSpacing: '1.5px' }}>Citation Score™</div>
                    {scan.foundation_score !== undefined && (
                      <div style={{ fontSize: '10px', color: D.textTertiary, marginTop: '2px' }}>
                        Foundation Score: <span style={{ color: D.navy, fontWeight: 700 }}>{scan.foundation_score}/100</span>
                        {scan.foundation_tier && <span style={{ color: D.textTertiary }}> · {scan.foundation_tier}</span>}
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: '10px', color: D.textTertiary, background: D.grayBg, padding: '3px 8px', borderRadius: '4px' }}>PRISM Scan™ · {scan.query_count} queries</div>
                </div>
                <div style={{ position: 'relative', height: '8px', borderRadius: '4px', background: `linear-gradient(90deg, ${D.red} 0%, #F59E0B 30%, #D4A830 50%, ${D.teal} 75%, ${D.navy} 100%)`, marginBottom: '6px' }}>
                  {/* Client dot */}
                  <div style={{ position: 'absolute', top: '-5px', left: `${clientPct}%`, width: '18px', height: '18px', borderRadius: '50%', background: D.navy, border: '3px solid #fff', boxShadow: '0 2px 6px rgba(0,0,0,0.2)', transform: 'translateX(-50%)' }} />
                  {/* Competitor dot */}
                  <div style={{ position: 'absolute', top: '-5px', left: `${competitorPct}%`, width: '18px', height: '18px', borderRadius: '50%', background: D.red, border: '3px solid #fff', boxShadow: '0 2px 6px rgba(0,0,0,0.2)', transform: 'translateX(-50%)' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: D.textTertiary }}>
                  <span>Not indexed</span>
                  <span>Recommended</span>
                </div>
              </div>

              {/* Score comparison */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                {/* Client score — dominant */}
                <div style={{ padding: '24px', borderRight: `1px solid ${D.grayMid}` }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: D.textTertiary, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '12px' }}>Your Citation Score</div>
                  <div style={{ fontFamily: 'Georgia, serif', fontSize: '64px', fontWeight: 900, color: D.navy, lineHeight: 1 }}>{clientScore}</div>
                  <div style={{ fontSize: '12px', color: D.textTertiary, marginTop: '4px', marginBottom: '10px' }}>out of 100</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: D.navy, marginBottom: '2px' }}>{clientName}</div>
                  <div style={{ fontSize: '11px', color: D.textTertiary, marginBottom: '10px' }}>{scan.stats?.[0]?.label || ''}</div>
                  {/* Why AI doesn't recommend you yet */}
                  <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: `1px solid ${D.border}` }}>
                    <div style={{ fontSize: '9px', fontWeight: 700, color: D.red, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>Why AI doesn&apos;t recommend you yet</div>
                    {scan.gaps.slice(0, 3).map((g, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '5px', marginBottom: '3px' }}>
                        <span style={{ color: D.red, fontWeight: 700, fontSize: '10px', flexShrink: 0, marginTop: '1px' }}>→</span>
                        <span style={{ fontSize: '11px', color: D.textSecondary, lineHeight: 1.4 }}>{g.title}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Competitor — benchmark context */}
                <div style={{ padding: '24px', background: D.grayBg }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: D.red, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '12px' }}>Benchmark</div>
                  <div style={{ fontFamily: 'Georgia, serif', fontSize: `${Math.round(64 * (competitorScore / 100))}px`, fontWeight: 900, color: '#94a3b8', lineHeight: 1, minHeight: '64px', display: 'flex', alignItems: 'flex-start' }}>~{competitorScore}</div>
                  <div style={{ fontSize: '12px', color: D.textTertiary, marginTop: '4px', marginBottom: '10px' }}>out of 100</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: D.navy, marginBottom: '2px' }}>{primaryCompetitor.competitor}</div>
                  <div style={{ fontSize: '11px', color: D.textTertiary, marginBottom: '2px' }}>{primaryCompetitor.competitor_brokerage}</div>
                  {scan.competitor_validation?.verified && (
                    <div style={{ fontSize: '10px', color: D.textTertiary, marginBottom: '10px' }}>DRE #{scan.competitor_validation.dre} · Verified</div>
                  )}
                  {/* Note 39: Why AI recommends them */}
                  {primaryCompetitor.competitor_signals && primaryCompetitor.competitor_signals.length > 0 && (
                    <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: `1px solid ${D.border}` }}>
                      <div style={{ fontSize: '9px', fontWeight: 700, color: D.textTertiary, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>Why AI recommends her</div>
                      {primaryCompetitor.competitor_signals.map((signal, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '5px', marginBottom: '4px' }}>
                          <span style={{ color: D.red, fontWeight: 700, fontSize: '10px', flexShrink: 0, marginTop: '1px' }}>→</span>
                          <span style={{ fontSize: '11px', color: D.textSecondary, lineHeight: 1.4 }}>{signal}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Goal */}
              <div style={{ padding: '14px 24px', background: D.navy, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
                  Our goal isn&apos;t just to match the benchmark — it&apos;s to make you{' '}
                  <strong style={{ color: D.teal }}>the most recommended agent</strong> in your market.
                </p>
              </div>
            </div>
          )}

          {visibleSection < 2 && <ContinueButton onClick={() => revealNext(2)} text="See What's Already Working" />}
          {visibleSection >= 2 && <CompactButton onClick={() => setCollapsedSections(prev => new Set(prev).add(1))} />}
        </>)}</div>

        {/* ═══ SECTION 2: STRENGTHS ═══ */}
        {visibleSection >= 2 && (
          <div ref={el => { sectionRefs.current[1] = el; }} style={{ paddingTop: D.sectionGap }}>
            {collapsedSections.has(2) ? (
              <SectionSummaryBar title="What's Already Working" stats={scan.strengths.map(s => ({
                label: s.title, value: s.badge, color: D.teal,
              }))} onExpand={() => setCollapsedSections(prev => { const n = new Set(prev); n.delete(2); return n; })} />
            ) : (
              <>
                <h2 style={{ fontSize: '22px', fontWeight: 800, color: D.navy, margin: '0 0 6px 0' }}>What&apos;s Already Working</h2>
                <p style={{ fontSize: '14px', color: D.textSecondary, margin: '0 0 20px 0', lineHeight: 1.7 }}>
                  You&apos;re not starting from zero. Our {scan.platform_count}-platform audit found real strengths to build on.
                </p>
                <StrengthsTable strengths={scan.strengths} />
                {visibleSection < 3 && <ContinueButton onClick={() => revealNext(3)} text="See Where the Gaps Are" />}
                {visibleSection >= 3 && <CompactButton onClick={() => setCollapsedSections(prev => new Set(prev).add(2))} />}
              </>
            )}
          </div>
        )}

        {/* ═══ SECTION 3: GAPS ═══ */}
        {visibleSection >= 3 && (
          <div ref={el => { sectionRefs.current[2] = el; }} style={{ paddingTop: D.sectionGap }}>
            {collapsedSections.has(3) ? (
              <SectionSummaryBar title="Where the Gaps Are" stats={[
                { label: 'Gaps found', value: `${scan.gaps.length}`, color: D.red },
                { label: 'Points leaving on the table', value: '+46', color: D.teal },
                { label: 'Path to', value: `${clientScore} → 65+ in 90 days` },
              ]} onExpand={() => setCollapsedSections(prev => { const n = new Set(prev); n.delete(3); return n; })} />
            ) : (
              <>
                <h2 style={{ fontSize: '22px', fontWeight: 800, color: D.navy, margin: '0 0 6px 0' }}>Where the Gaps Are</h2>
                <p style={{ fontSize: '14px', color: D.textSecondary, margin: '0 0 20px 0', lineHeight: 1.7 }}>
                  {scan.gaps.length} specific gaps are keeping you out of AI recommendations. Each one has a measurable fix.
                </p>
                <GapCards gaps={scan.gaps} audienceFocus={audienceFocus} />
                <div style={{ background: D.navy, borderRadius: '10px', padding: '14px 20px', marginTop: '16px', textAlign: 'center' }}>
                  <span style={{ fontSize: '14px', color: '#fff', fontWeight: 600 }}>Points you&apos;re leaving on the table: <span style={{ color: D.teal }}>+46</span></span>
                  <span style={{ fontSize: '13px', color: D.textTertiary, marginLeft: '10px' }}>— enough to move from {clientScore} to 65+ in 90 days</span>
                </div>
                {visibleSection < 4 && <ContinueButton onClick={() => revealNext(4)} text="See Your Market Strategy" />}
                {visibleSection >= 4 && <CompactButton onClick={() => setCollapsedSections(prev => new Set(prev).add(3))} />}
              </>
            )}
          </div>
        )}

        {/* ═══ SECTION 4: MARKETS ═══ */}
        {visibleSection >= 4 && (
          <div ref={el => { sectionRefs.current[3] = el; }} style={{ paddingTop: D.sectionGap }}>
            <div ref={marketsRef}>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: D.navy, margin: '0 0 6px 0' }}>Your Market Strategy</h2>
            </div>
            <p style={{ fontSize: '14px', color: D.textSecondary, margin: '0 0 16px 0', lineHeight: 1.7 }}>
              Based on {scan.txn_analyzed} transactions, {scan.query_count} AI queries, and our {scan.platform_count}-platform audit, we recommend these {scan.markets.length} markets.
            </p>

            {/* Data source icons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '20px' }}>
              {[
                { icon: '📋', label: 'Your Input', desc: 'Markets you identified' },
                { icon: '📊', label: 'Your Transactions', desc: `${scan.txn_analyzed} sales analyzed` },
                { icon: '🔍', label: 'PRISM SCAN™', desc: `4 AI models · ${scan.platform_count} platforms audited` },
              ].map(s => (
                <div key={s.label} style={{ background: '#fff', borderRadius: '8px', padding: '12px 14px', textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', marginBottom: '4px' }}>{s.icon}</div>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: D.navy, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
                  <div style={{ fontSize: '10px', color: D.textTertiary, marginTop: '2px' }}>{s.desc}</div>
                </div>
              ))}
            </div>

            {!approved && (
              <div style={{ textAlign: 'right', marginBottom: '12px' }}>
                <button onClick={approveAllMarkets} disabled={allMarketsConfirmed} style={{
                  padding: '7px 16px', background: allMarketsConfirmed ? D.border : D.navy,
                  color: allMarketsConfirmed ? D.textTertiary : '#fff', fontSize: '12px', fontWeight: 600,
                  border: 'none', borderRadius: '6px', cursor: allMarketsConfirmed ? 'default' : 'pointer',
                }}>
                  {allMarketsConfirmed ? '✓ All Approved' : `Approve All ${scan.markets.length}`}
                </button>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {scan.markets.map((market, idx) => {
                const tier = TIER_CONFIG[market.tier] || TIER_CONFIG.growth;
                const isConfirmed = approved || marketConfirms[idx];
                const isExpanded = expandedMarket === idx;
                const hoods = market.recommended_neighborhoods || market.neighborhoods.map(n => ({
                  name: n.name, reason: n.txn_count ? `${n.txn_count} transactions` : n.source,
                  ai_status: n.ai_recognized ? 'recognized' : 'not_indexed',
                }));

                return (
                  <div key={market.name} style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', borderLeft: `4px solid ${isConfirmed ? D.teal : tier.color}`, transition: 'border-color 0.3s' }}>
                    {/* Neighborhood confirmation step — after market approved, before full collapse */}
                    {hoodStep.has(idx) && !approved && (
                      <div>
                        <div style={{ padding: '20px 20px 10px' }}>
                          <div style={{ fontSize: '10px', fontWeight: 700, color: tier.color, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>{tier.label}</div>
                          <div style={{ fontSize: '19px', fontWeight: 800, color: D.navy, marginBottom: '4px' }}>{market.name} ✓</div>
                          <div style={{ fontSize: '13px', color: D.textSecondary, lineHeight: 1.6 }}>
                            Last step — confirm the neighborhoods we&apos;ll optimize for.
                          </div>
                        </div>
                        <div style={{ padding: '10px 20px 16px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {hoods.map((hood) => {
                              const recognized = hood.ai_status === 'recognized';
                              return (
                                <div key={hood.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', background: D.grayBg, borderRadius: '8px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: recognized ? '#f0fdf9' : '#fff5f5', border: `1.5px solid ${recognized ? D.teal : D.red}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 700, color: recognized ? D.teal : D.red, flexShrink: 0 }}>
                                      {recognized ? '✓' : '!'}
                                    </div>
                                    <div>
                                      <div style={{ fontSize: '13px', fontWeight: 600, color: D.navy }}>{hood.name}</div>
                                      <div style={{ fontSize: '11px', color: D.textTertiary }}>{hood.reason}</div>
                                    </div>
                                  </div>
                                  <span style={{ fontSize: '10px', fontWeight: 600, color: recognized ? D.teal : '#D4A830', whiteSpace: 'nowrap' }}>
                                    {recognized ? 'Already in AI — we reinforce it' : 'Not indexed — we\'ll change that'}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                            <button onClick={() => confirmNeighborhoods(idx)} style={{
                              background: D.teal, color: '#fff', border: 'none', borderRadius: '20px',
                              padding: '7px 18px', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                            }}>
                              Confirm {hoods.length} neighborhoods →
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    {/* Collapsed approved state — after neighborhoods confirmed */}
                    {isConfirmed && !hoodStep.has(idx) && !approved && (
                      <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '14px', color: D.teal, fontWeight: 700 }}>✅</span>
                          <span style={{ fontSize: '14px', fontWeight: 700, color: D.navy }}>{market.name}</span>
                          <span style={{ fontSize: '11px', color: D.textTertiary }}>— {tier.label} · {hoods.length} neighborhoods · Approved</span>
                        </div>
                        <button onClick={() => toggleMarket(idx)} style={{ background: 'none', border: 'none', fontSize: '12px', color: D.teal, fontWeight: 600, cursor: 'pointer', padding: 0 }}>
                          Edit ↗
                        </button>
                      </div>
                    )}
                    {/* Full card — shown when not confirmed and not in hood step, or when already fully approved */}
                    {((!isConfirmed && !hoodStep.has(idx)) || approved) && (
                    <div style={{ padding: '20px 20px 16px', position: 'relative' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontSize: '10px', fontWeight: 700, color: tier.color, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>{tier.label}</div>
                          <div style={{ fontSize: '19px', fontWeight: 800, color: D.navy }}>{market.name}</div>
                          <div style={{ fontSize: '12px', color: D.textTertiary, marginTop: '2px' }}>
                            {market.tier === 'primary' ? 'Highest AI opportunity — full optimization priority' :
                             market.tier === 'secondary' ? 'Strong signal — included in all content and platforms' :
                             'Building toward — visibility grows over time'}
                          </div>
                        </div>
                        {!approved && (
                          <button onClick={() => toggleMarket(idx)} style={{
                            background: '#fff', color: D.textTertiary,
                            border: `2px solid ${D.border}`,
                            borderRadius: '20px', padding: '5px 14px', fontSize: '11px', fontWeight: 700,
                            cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0, marginLeft: '12px',
                          }}>
                            Approve
                          </button>
                        )}
                      </div>

                      {/* Small multiples stats — identical structure every card */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginTop: '14px' }}>
                        {[
                          { label: 'Volume', value: market.volume },
                          { label: 'Transactions', value: market.txn_count },
                          { label: 'Avg Price', value: market.avg_price },
                        ].map(s => (
                          <div key={s.label} style={{ background: tier.bg, borderRadius: '8px', padding: '10px 12px' }}>
                            <div style={{ fontSize: '9px', fontWeight: 600, color: D.textTertiary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
                            <div style={{ fontSize: '15px', fontWeight: 800, color: D.navy, marginTop: '2px' }}>{s.value}</div>
                          </div>
                        ))}
                      </div>

                      <div style={{ marginTop: '10px', fontSize: '13px', color: D.textSecondary, lineHeight: 1.6, padding: '8px 12px', background: D.grayBg, borderRadius: '6px' }}>
                        <strong style={{ color: D.navy }}>From our PRISM Scan™:</strong> {market.ai_signal}
                      </div>
                      {/* Visibility Rate — shown if available */}
                      {scan.visibility_rates && scan.visibility_rates[market.name] && (() => {
                        const vr = scan.visibility_rates![market.name];
                        const clientPctVis = vr.overall_visibility_pct;
                        const compPctVis = vr.competitor_visibility_pct;
                        return (
                          <div style={{ marginTop: '10px', padding: '10px 12px', background: '#fff', borderRadius: '8px', border: `1px solid ${D.border}` }}>
                            <div style={{ fontSize: '9px', fontWeight: 700, color: D.textTertiary, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>AI Visibility Rate</div>
                            <div style={{ position: 'relative', height: '6px', borderRadius: '3px', background: `linear-gradient(90deg, ${D.red} 0%, #F59E0B 30%, #D4A830 50%, ${D.teal} 75%, ${D.navy} 100%)`, marginBottom: '4px' }}>
                              <div style={{ position: 'absolute', top: '-4px', left: `${Math.min(clientPctVis, 99)}%`, width: '14px', height: '14px', borderRadius: '50%', background: D.navy, border: '2px solid #fff', boxShadow: '0 1px 4px rgba(0,0,0,0.2)', transform: 'translateX(-50%)' }} />
                              <div style={{ position: 'absolute', top: '-4px', left: `${Math.min(compPctVis, 99)}%`, width: '14px', height: '14px', borderRadius: '50%', background: D.red, border: '2px solid #fff', boxShadow: '0 1px 4px rgba(0,0,0,0.2)', transform: 'translateX(-50%)' }} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: D.textTertiary, marginTop: '4px' }}>
                              <span><span style={{ color: D.navy, fontWeight: 700 }}>{clientPctVis}%</span> you</span>
                              <span><span style={{ color: D.red, fontWeight: 700 }}>{compPctVis}%</span> {market.competitor}</span>
                            </div>
                          </div>
                        );
                      })()}
                      <div style={{ marginTop: '6px', fontSize: '12px', color: D.textTertiary }}>
                        <strong>Evidence:</strong> {market.txn_highlight}
                      </div>

                      <button onClick={() => setExpandedMarket(isExpanded ? null : idx)} style={{
                        background: 'none', border: 'none', fontSize: '12px', color: D.teal,
                        fontWeight: 600, cursor: 'pointer', padding: '6px 0 0', display: 'block',
                      }}>
                        {isExpanded ? '▾ Hide neighborhoods' : `▸ See ${hoods.length} recommended neighborhoods`}
                      </button>
                    </div>
                    )}

                    {isExpanded && (
                      <div style={{ borderTop: `1px solid ${D.grayMid}`, padding: '16px 20px', background: D.grayBg }}>
                        <div style={{ fontSize: '10px', fontWeight: 700, color: D.navy, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>Recommended Neighborhoods</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {hoods.map((hood) => {
                            const recognized = hood.ai_status === 'recognized';
                            return (
                              <div key={hood.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', background: '#fff', borderRadius: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: recognized ? '#f0fdf9' : '#fff5f5', border: `1.5px solid ${recognized ? D.teal : D.red}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 700, color: recognized ? D.teal : D.red, flexShrink: 0 }}>
                                    {recognized ? '✓' : '!'}
                                  </div>
                                  <div>
                                    <div style={{ fontSize: '13px', fontWeight: 600, color: D.navy }}>{hood.name}</div>
                                    <div style={{ fontSize: '11px', color: D.textTertiary }}>{hood.reason}</div>
                                  </div>
                                </div>
                                <span style={{ fontSize: '10px', fontWeight: 600, color: recognized ? D.teal : D.red, whiteSpace: 'nowrap' }}>
                                  {recognized ? 'AI sees this' : 'Not in AI yet'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                        <p style={{ fontSize: '11px', color: D.textTertiary, margin: '10px 0 0 0' }}>
                          Neighborhoods not yet in AI are where we&apos;ll build your content — getting you recommended in areas competitors haven&apos;t claimed.
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {visibleSection < 5 && <ContinueButton onClick={() => revealNext(5)} text="See Your 90-Day Path" />}
          </div>
        )}

        {/* ═══ SECTION 5: 90-DAY PATH ═══ */}
        {visibleSection >= 5 && (
          <div ref={el => { sectionRefs.current[4] = el; }} style={{ paddingTop: D.sectionGap }}>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: D.navy, margin: '0 0 6px 0' }}>From {clientScore} to 65+ — Your 90-Day Path</h2>
            <div style={{ position: 'relative', paddingLeft: '28px', marginTop: '20px' }}>
              <div style={{ position: 'absolute', left: '10px', top: 0, bottom: 0, width: '2px', background: `linear-gradient(180deg, ${D.red}, #D4A830, ${D.navy}, ${D.teal})` }} />
              {scan.trajectory.map((ms, i) => {
                // Day 60 (index 2) gets navy; Day 0 stays red, Day 30 stays gold, Day 90 stays teal
                const dotColor = i === 2 ? D.navy : ms.color;
                const isToday = i === 0;
                // Calculate delta from previous milestone
                const prevScore = i === 0 ? null : parseInt(scan.trajectory[i - 1].score);
                const thisScore = parseInt(ms.score);
                const delta = prevScore !== null ? thisScore - prevScore : null;
                return (
                  <div key={ms.day} style={{ position: 'relative', marginBottom: i < scan.trajectory.length - 1 ? '20px' : 0 }}>
                    <div style={{ position: 'absolute', left: '-28px', top: '2px', width: '20px', height: '20px', borderRadius: '50%', background: isToday ? dotColor : '#fff', border: `3px solid ${dotColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {isToday && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff' }} />}
                    </div>
                    <div style={{ background: isToday ? '#fff8f8' : '#fff', borderRadius: '10px', padding: '14px 18px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <div>
                          {isToday && <div style={{ fontSize: '9px', fontWeight: 700, color: D.red, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px' }}>📍 You are here</div>}
                          <div style={{ fontSize: '13px', fontWeight: 700, color: D.navy }}>{ms.day}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                          {delta !== null && (
                            <span style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8' }}>+{delta} pts</span>
                          )}
                          <div style={{ fontFamily: 'Georgia, serif', fontSize: '18px', fontWeight: 900, color: dotColor }}>{ms.score}<span style={{ fontSize: '11px', color: D.textTertiary, fontFamily: 'system-ui' }}>/100</span></div>
                        </div>
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: dotColor, marginBottom: '8px' }}>{ms.headline}</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {ms.outcomes.map((outcome, j) => (
                          <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '12px', color: D.textSecondary, lineHeight: 1.5 }}>
                            <span style={{ color: D.teal, fontWeight: 700, flexShrink: 0 }}>→</span>{outcome}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ background: '#f0fdf9', borderRadius: '8px', padding: '12px 18px', fontSize: '14px', color: D.navy, textAlign: 'center', marginTop: '12px', border: `1px solid ${D.teal}` }}>
              <strong>Citation Guarantee™:</strong> +20 points in 90 days or you owe nothing. Ever.
            </div>
            {visibleSection < 6 && <ContinueButton onClick={() => revealNext(6)} text="See What We're Building" />}
          </div>
        )}

        {/* ═══ SECTION 6: DELIVERABLES ═══ */}
        {visibleSection >= 6 && (
          <div ref={el => { sectionRefs.current[5] = el; }} style={{ paddingTop: D.sectionGap }}>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: D.navy, margin: '0 0 6px 0' }}>What We&apos;re Building For You</h2>
            <p style={{ fontSize: '14px', color: D.textSecondary, margin: '0 0 20px 0', lineHeight: 1.7 }}>
              Everything in your founding package — built from your scan, your transactions, and your markets.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {scan.deliverables.map((item, i) => (
                <div key={i} style={{ background: '#fff', borderRadius: '10px', padding: '18px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                    <DeliverableIcon type={item.icon} size={18} />
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: D.navy, marginBottom: '4px' }}>{item.title}</div>
                  <div style={{ fontSize: '12px', color: D.textSecondary, lineHeight: 1.6 }}>{item.desc}</div>
                </div>
              ))}
            </div>
            {visibleSection < 7 && <ContinueButton onClick={() => revealNext(7)} text="Approve Your Strategy" />}
          </div>
        )}

        {/* ═══ SECTION 7: APPROVE ═══ */}
        {visibleSection >= 7 && (
          <div ref={el => { sectionRefs.current[6] = el; }} style={{ paddingTop: D.sectionGap, marginBottom: '48px' }}>
            {!approved ? (
              <>
                {!showApprovePanel ? (
                  <>
                    {/* Note 36: thin rule above approval section */}
                    <div style={{ height: '1px', background: '#e2e8f0', marginBottom: '32px' }} />
                    <h2 style={{ fontSize: '22px', fontWeight: 800, color: D.navy, margin: '0 0 8px 0' }}>Approve Your Strategy</h2>
                    <p style={{ fontSize: '14px', color: D.textSecondary, margin: '0 0 24px 0', lineHeight: 1.7 }}>
                      You&apos;ve reviewed your data, your gaps, and your path. Approve your strategy and we start building today.
                    </p>
                    {/* Note 22: locked button until all markets approved */}
                    <button
                      onClick={handleApproveClick}
                      disabled={!allMarketsConfirmed}
                      style={{
                        display: 'block', margin: '0 auto', padding: '18px 40px',
                        background: allMarketsConfirmed ? D.teal : '#e2e8f0',
                        color: allMarketsConfirmed ? '#fff' : '#94a3b8',
                        fontSize: '16px', fontWeight: 700, border: 'none', borderRadius: '10px',
                        cursor: allMarketsConfirmed ? 'pointer' : 'not-allowed',
                        boxShadow: allMarketsConfirmed ? `0 4px 16px rgba(0,191,166,0.3)` : 'none',
                        transition: 'all 0.2s',
                      }}
                    >
                      {allMarketsConfirmed
                        ? 'Approve My Strategy →'
                        : `Approve My Strategy (${confirmedCount}/${scan.markets.length} markets approved)`}
                    </button>
                    {!allMarketsConfirmed && (
                      <p style={{ textAlign: 'center', fontSize: '12px', color: D.textTertiary, marginTop: '12px' }}>
                        <button onClick={scrollToMarkets} style={{ background: 'none', border: 'none', color: D.teal, fontSize: '12px', fontWeight: 600, cursor: 'pointer', padding: 0 }}>← Review my markets</button>
                      </p>
                    )}
                  </>
                ) : (
                  <div ref={approvePanelRef} style={{ background: D.navy, borderRadius: '14px', padding: '28px', overflow: 'hidden' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: D.teal, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '18px' }}>
                      What happens when you confirm
                    </div>
                    {[
                      { num: '1', title: 'Your positioning statement arrives within 24 hours', desc: 'Written from this scan + your intake — the foundation for everything.' },
                      { num: '2', title: 'We start building your 12 platform profiles', desc: 'Optimized for every platform that feeds AI recommendations.' },
                      { num: '3', title: 'Your dedicated website + first article begin', desc: 'The two highest-impact deliverables. Your website unlocks Google AI.' },
                    ].map((step, i) => (
                      <div key={step.num} style={{ display: 'flex', gap: '14px', marginBottom: i < 2 ? '14px' : '24px' }}>
                        <div style={{ width: '22px', height: '22px', minWidth: '22px', background: D.teal, borderRadius: '50%', textAlign: 'center', lineHeight: '22px', color: '#fff', fontSize: '11px', fontWeight: 700 }}>{step.num}</div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>{step.title}</div>
                          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{step.desc}</div>
                        </div>
                      </div>
                    ))}
                    <button onClick={handleFinalApprove} disabled={saving} style={{
                      width: '100%', padding: '16px 24px', background: D.teal, color: '#fff',
                      fontSize: '15px', fontWeight: 700, border: 'none', borderRadius: '8px',
                      cursor: saving ? 'wait' : 'pointer', opacity: saving ? 0.7 : 1,
                    }}>
                      {saving ? 'Saving...' : '✓ Approve — Start Building'}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div style={{ background: D.navy, borderRadius: '14px', padding: '40px 28px', textAlign: 'center' }}>
                <div style={{ fontSize: '40px', marginBottom: '14px' }}>🚀</div>
                <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#fff', margin: '0 0 10px 0' }}>Strategy Approved — We&apos;re On It</h3>
                <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0, lineHeight: 1.7 }}>
                  Your positioning statement arrives within 24 hours. Your {scan.platform_count} platform profiles and dedicated website are in production.
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
        <div style={{ fontSize: '13px', color: '#94a3b8' }}>Loading...</div>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}
