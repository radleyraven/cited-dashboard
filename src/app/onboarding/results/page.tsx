'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';
import CitedHeader from '@/components/CitedHeader';
import CitedFooter from '@/components/CitedFooter';

/* ═══════════════════════════════════════════════════════════════
   Citation Report — v6.0
   April 10, 2026

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
}

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
    <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', padding: '14px 24px', background: '#fff', borderBottom: '1px solid #f1f5f9', flexWrap: 'wrap' }}>
      {steps.map((step, i) => (
        <div key={step} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', opacity: i === 0 ? 1 : 0.4 }}>
            <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: i === 0 ? '#0A1929' : '#e2e8f0', color: '#fff', fontSize: '9px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</div>
            <span style={{ fontSize: '11px', fontWeight: i === 0 ? 700 : 500, color: i === 0 ? '#0A1929' : '#94a3b8' }}>{step}</span>
          </div>
          {i < steps.length - 1 && <div style={{ width: '16px', height: '1px', background: '#e2e8f0' }} />}
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
        .select('id, full_name, markets_approved, scan_results')
        .eq('onboarding_token', token).single();
      if (data) {
        setRecordId(data.id);
        setClientName(data.full_name || '');
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
    if (!allMarketsConfirmed) { setShowModal(true); return; }
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

  const primaryCompetitor = scan.markets.find(m => m.tier === 'primary');

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      {showModal && <Modal onClose={scrollToMarkets} onConfirm={() => { setShowModal(false); setShowApprovePanel(true); }} />}

      <CitedHeader variant="onboarding" userEmail="" userName={clientName} clientTier="founding_client" />
      <ProgressIndicator />

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
            We ran {scan.query_count} queries across the top AI models sellers and buyers use, audited {scan.platform_count} platforms,
            analyzed {scan.txn_analyzed} of your transactions, and mapped {scan.neighborhood_count} neighborhoods — every query
            run {scan.consistency_runs}x for consistency.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '24px' }}>
            {scan.stats.map((stat) => (
              <div key={stat.label} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '12px 8px' }}>
                <div style={{ fontSize: '22px', fontWeight: 900, color: '#00BFA6' }}>{stat.value}</div>
                <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '3px' }}>{stat.label}</div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '15px', color: '#94a3b8', lineHeight: 1.6, margin: 0, maxWidth: '520px', marginLeft: 'auto', marginRight: 'auto' }}>
            These numbers tell the story of a top-performing luxury agent. But when sellers and buyers ask AI who to call —{' '}
            <span style={{ color: '#fff', fontWeight: 600 }}>your name doesn&apos;t come up. Let&apos;s fix that.</span>
          </p>
        </div>
      </div>
      <div style={{ height: '3px', background: 'linear-gradient(90deg, #00BFA6, #D4A830, #00BFA6)' }} />

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '0 24px 32px' }}>

        {/* ═══ SECTION 1: DISCOVERY GAP ═══ */}
        <div ref={el => { sectionRefs.current[0] = el; }} style={{ paddingTop: '36px' }}>
          <SectionHeader num="1" title="The Discovery Gap" color="#0A1929" />
          <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 16px 0', lineHeight: 1.5 }}>
            We asked the top AI models the exact questions a seller or buyer would ask when looking for an agent. Here&apos;s what came back for your primary market:
          </p>

          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', marginBottom: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            {/* Query header */}
            <div style={{ background: '#f8f9fa', padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>We asked {scan.ai_quote.model}:</div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#0A1929', fontStyle: 'italic', lineHeight: 1.4 }}>&ldquo;{scan.ai_quote.query}&rdquo;</div>
            </div>
            {/* AI response */}
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>AI Response:</div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ width: '3px', background: '#EF4444', borderRadius: '2px', flexShrink: 0 }} />
                <div style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6 }}>&ldquo;{scan.ai_quote.response}&rdquo;</div>
              </div>
            </div>
            {/* Result */}
            <div style={{ padding: '12px 16px', background: '#fff5f5', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '12px' }}>✕</div>
              <div style={{ fontSize: '13px', color: '#EF4444', fontWeight: 700, lineHeight: 1.4 }}>
                Your name did not appear — in this query or any discovery query we ran across all your markets and all AI models.
              </div>
            </div>
          </div>

          {primaryCompetitor && (
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', overflow: 'hidden', marginBottom: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>

              {/* Score spectrum bar */}
              <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>
                  Citation Score Scale
                </div>
                <div style={{ position: 'relative', height: '8px', borderRadius: '4px', background: 'linear-gradient(90deg, #EF4444 0%, #F59E0B 30%, #D4A830 50%, #00BFA6 75%, #0A1929 100%)', marginBottom: '6px' }}>
                  {/* Radley marker */}
                  <div style={{
                    position: 'absolute', top: '-4px', left: `${scan.composite_score}%`,
                    width: '16px', height: '16px', borderRadius: '50%', background: '#0A1929',
                    border: '2px solid #fff', boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                    transform: 'translateX(-50%)',
                  }} />
                  {/* Competitor marker */}
                  <div style={{
                    position: 'absolute', top: '-4px', left: '55%',
                    width: '16px', height: '16px', borderRadius: '50%', background: '#EF4444',
                    border: '2px solid #fff', boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                    transform: 'translateX(-50%)',
                  }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>
                  <span>0 — Not Indexed</span>
                  <span>50 — In the Mix</span>
                  <span>100 — Top Cited</span>
                </div>
              </div>

              {/* Side by side — YOUR score leads */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0' }}>

                {/* Radley — primary focus */}
                <div style={{ padding: '20px', borderRight: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Your Score</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#0A1929' }}>{firstName || 'You'}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Oppenheim Group</div>
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ fontSize: '42px', fontWeight: 900, color: '#0A1929', lineHeight: 1 }}>{scan.composite_score}</div>
                    <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '2px' }}>out of 100</div>
                  </div>
                  <div style={{ marginTop: '10px', display: 'inline-block', background: '#f0f4f8', borderRadius: '6px', padding: '4px 10px', fontSize: '11px', fontWeight: 700, color: '#64748b' }}>
                    {scan.tier_name} · {scan.tier_line}
                  </div>
                  <div style={{ marginTop: '8px', fontSize: '12px', color: '#64748b', lineHeight: 1.4 }}>
                    AI knows who you are but doesn&apos;t recommend you in discovery searches yet.
                  </div>
                </div>

                {/* Competitor — benchmark context */}
                <div style={{ padding: '20px', background: '#fafbfc' }}>
                  <div style={{ fontSize: '10px', color: '#EF4444', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Current Benchmark</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#0A1929' }}>{primaryCompetitor.competitor}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>{primaryCompetitor.competitor_brokerage}</div>
                  {scan.competitor_validation?.verified && (
                    <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>DRE #{scan.competitor_validation.dre} · Verified active</div>
                  )}
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ fontSize: '42px', fontWeight: 900, color: '#EF4444', lineHeight: 1 }}>~55</div>
                    <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '2px' }}>out of 100</div>
                  </div>
                  <div style={{ marginTop: '10px', fontSize: '12px', color: '#64748b', lineHeight: 1.4 }}>
                    Appears in AI recommendations in Carmel Valley. This is the slot we&apos;re building you into.
                  </div>
                </div>
              </div>

              {/* What the gap means */}
              <div style={{ padding: '14px 20px', background: '#0A1929', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.5, flex: 1 }}>
                  The higher your score, the more consistently AI recommends you.
                  Felicia is at ~55 and gets recommended regularly — our goal is to get you there and past it.
                  Our analysis shows exactly where your <span style={{ color: '#00BFA6', fontWeight: 700 }}>+41 points</span> are coming from.
                </div>
              </div>
            </div>
          )}

          {visibleSection < 2 && <ContinueButton onClick={() => revealNext(2)} text="See What's Working" />}
        </div>

        {/* ═══ SECTION 2: STRENGTHS ═══ */}
        {visibleSection >= 2 && (
          <div ref={el => { sectionRefs.current[1] = el; }} style={{ paddingTop: '36px' }}>
            <SectionHeader num="2" title="What's Already Working" color="#00BFA6" />
            <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 4px 0', lineHeight: 1.5 }}>
              You&apos;re not starting from zero. Our {scan.platform_count}-platform audit found real strengths to build on.
            </p>
            <div style={{ marginBottom: '16px' }}><DepthBadge text={`${scan.platform_count} platforms audited · ${scan.query_count} queries analyzed`} /></div>

            {scan.strengths.map((item, i) => (
              <div key={i} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 18px', marginBottom: '8px', borderLeft: '4px solid #00BFA6' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#0A1929' }}>{item.title}</div>
                  <div style={{ background: '#f0fdf9', color: '#00BFA6', fontSize: '11px', fontWeight: 700, padding: '2px 10px', borderRadius: '12px' }}>{item.badge}</div>
                </div>
                <div style={{ fontSize: '13px', color: '#64748b', marginTop: '6px', lineHeight: 1.5 }}>{item.detail}</div>
              </div>
            ))}

            <div style={{ background: '#f0fdf9', borderRadius: '8px', padding: '12px 16px', marginTop: '12px', fontSize: '13px', color: '#0A1929', textAlign: 'center', fontWeight: 500 }}>
              Now you know your foundation. Next: the specific gaps costing you AI recommendations.
            </div>
            {visibleSection < 3 && <ContinueButton onClick={() => revealNext(3)} text="See Where the Gaps Are" />}
          </div>
        )}

        {/* ═══ SECTION 3: GAPS ═══ */}
        {visibleSection >= 3 && (
          <div ref={el => { sectionRefs.current[2] = el; }} style={{ paddingTop: '36px' }}>
            <SectionHeader num="3" title="Where the Gaps Are" color="#EF4444" />
            <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 4px 0', lineHeight: 1.5 }}>
              {scan.gaps.length} specific gaps are keeping you out of AI recommendations. Each one has a measurable fix.
            </p>
            <div style={{ marginBottom: '16px' }}><DepthBadge text={`${scan.query_count} queries · ${scan.platform_count} platforms · ${scan.consistency_runs}x consistency runs per query`} /></div>

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
                  <div style={{ textAlign: 'center', background: gap.color === '#EF4444' ? '#fff5f5' : '#fffdf5', borderRadius: '10px', padding: '6px 12px', minWidth: '56px' }}>
                    <div style={{ fontSize: '18px', fontWeight: 900, color: gap.color, lineHeight: 1 }}>{gap.points.replace(' pts', '')}</div>
                    <div style={{ fontSize: '9px', color: gap.color, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>pts</div>
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
              <span style={{ fontSize: '14px', color: '#fff', fontWeight: 600 }}>Total recoverable: <span style={{ color: '#00BFA6' }}>+46 points</span></span>
              <span style={{ fontSize: '13px', color: '#64748b', marginLeft: '10px' }}>— enough to move from {scan.composite_score} to 65+ in 90 days</span>
            </div>
            {visibleSection < 4 && <ContinueButton onClick={() => revealNext(4)} text="See Your Market Strategy" />}
          </div>
        )}

        {/* ═══ SECTION 4: MARKETS — Hybrid original style + confirm ═══ */}
        {visibleSection >= 4 && (
          <div ref={el => { sectionRefs.current[3] = el; }} style={{ paddingTop: '36px' }}>
            <div ref={marketsRef}>
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
                { label: 'Our Analysis', icon: '🔍', desc: `${scan.query_count} AI queries run` },
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

            {scan.markets.map((market, idx) => {
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
                      <strong style={{ color: '#0A1929' }}>From our analysis:</strong> {market.ai_signal}
                    </div>

                    {/* Evidence */}
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
                      <strong>Your evidence:</strong> {market.txn_highlight}
                    </div>

                    {/* Neighborhoods toggle */}
                    <button onClick={() => setExpandedMarket(isExpanded ? null : idx)} style={{
                      background: 'none', border: 'none', fontSize: '13px', color: '#00BFA6',
                      fontWeight: 600, cursor: 'pointer', padding: '2px 0',
                    }}>
                      {isExpanded ? '▾ Hide neighborhoods' : `▸ See ${hoods.length} recommended neighborhoods`}
                    </button>
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
          </div>
        )}

        {/* ═══ SECTION 5: 90-DAY PATH ═══ */}
        {visibleSection >= 5 && (
          <div ref={el => { sectionRefs.current[4] = el; }} style={{ paddingTop: '36px' }}>
            <SectionHeader num="5" title={`From ${scan.composite_score} to 65+ — Your 90-Day Path`} color="#0A1929" />

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

            <div style={{ background: '#f0fdf9', borderRadius: '8px', padding: '12px 16px', fontSize: '14px', color: '#0A1929', textAlign: 'center', marginTop: '10px', border: '1px solid #00BFA6' }}>
              <strong>Citation Guarantee™:</strong> +20 points in 90 days or you owe nothing. Ever.
            </div>
            {visibleSection < 6 && <ContinueButton onClick={() => revealNext(6)} text="See What We're Building" />}
          </div>
        )}

        {/* ═══ SECTION 6: DELIVERABLES — SVG icons ═══ */}
        {visibleSection >= 6 && (
          <div ref={el => { sectionRefs.current[5] = el; }} style={{ paddingTop: '36px' }}>
            <SectionHeader num="6" title="What We're Building For You" color="#00BFA6" />
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
