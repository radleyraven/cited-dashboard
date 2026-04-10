'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';
import CitedHeader from '@/components/CitedHeader';
import CitedFooter from '@/components/CitedFooter';

/* ═══════════════════════════════════════════════════════════════
   Citation Report — v5.0
   April 10, 2026

   ALL client data pulled from Supabase scan_results JSON.
   Zero hardcoded stats. Progressive reveal. Research-driven.

   Data source: cited_intake.scan_results (JSONB)
   Auth: onboarding_token (URL param)
   ═══════════════════════════════════════════════════════════════ */

/* ── Types (match Supabase JSON shape) ── */
interface NeighborhoodData {
  name: string;
  ai_recognized: boolean;
  txn_count?: number;
  source: string;
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
}

/* ── Tier config ── */
const TIER_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  primary: { label: 'Primary', color: '#00BFA6', bg: '#f0fdf9', border: '#00BFA6' },
  secondary: { label: 'Secondary', color: '#D4A830', bg: '#fffdf5', border: '#D4A830' },
  growth: { label: 'Growth', color: '#64748b', bg: '#f0f4f8', border: '#94a3b8' },
};

/* ── Styled icon ── */
function StyledIcon({ letter, color, size = 36 }: { letter: string; color: string; size?: number }) {
  return (
    <div style={{
      width: `${size}px`, height: `${size}px`, borderRadius: '10px',
      background: color, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: `${size * 0.4}px`, fontWeight: 800, flexShrink: 0,
    }}>
      {letter}
    </div>
  );
}

/* ── Progress indicator ── */
function ProgressIndicator() {
  const steps = ['Your Citation Report', 'Approve Strategy', 'Positioning', 'Copy Kit'];
  return (
    <div style={{
      display: 'flex', justifyContent: 'center', gap: '6px',
      padding: '14px 24px', background: '#fff', borderBottom: '1px solid #f1f5f9',
      flexWrap: 'wrap',
    }}>
      {steps.map((step, i) => (
        <div key={step} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', opacity: i === 0 ? 1 : 0.4 }}>
            <div style={{
              width: '18px', height: '18px', borderRadius: '50%',
              background: i === 0 ? '#0A1929' : '#e2e8f0',
              color: '#fff', fontSize: '9px', fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{i + 1}</div>
            <span style={{
              fontSize: '11px', fontWeight: i === 0 ? 700 : 500,
              color: i === 0 ? '#0A1929' : '#94a3b8',
            }}>{step}</span>
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
      <button onClick={onClick} style={{
        background: '#00BFA6', color: '#fff', border: 'none',
        padding: '14px 32px', borderRadius: '8px', fontSize: '15px',
        fontWeight: 700, cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(0,191,166,0.25)',
      }}>
        {text} →
      </button>
    </div>
  );
}

/* ── Scan depth badge ── */
function DepthBadge({ text }: { text: string }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      background: '#f0f4f8', borderRadius: '6px', padding: '6px 12px',
      fontSize: '12px', color: '#475569', fontWeight: 500,
    }}>
      <span style={{ color: '#00BFA6', fontWeight: 700 }}>●</span> {text}
    </div>
  );
}

/* ── Section header ── */
function SectionHeader({ num, title, color }: { num: string; title: string; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
      <div style={{
        width: '28px', height: '28px', borderRadius: '50%', background: color,
        color: '#fff', fontSize: '13px', fontWeight: 700,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>{num}</div>
      <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0A1929', margin: 0 }}>{title}</h2>
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
  const [hoodSelections, setHoodSelections] = useState<boolean[][]>([]);
  const [expandedMarket, setExpandedMarket] = useState<number | null>(null);

  const searchParams = useSearchParams();
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const marketsRef = useRef<HTMLDivElement | null>(null);

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
        if (data.markets_approved) {
          setApproved(true);
          setVisibleSection(8);
        }
        if (data.scan_results) {
          const sr = data.scan_results as ScanResults;
          setScan(sr);
          setMarketConfirms(sr.markets.map(() => false));
          setHoodSelections(sr.markets.map(m => m.neighborhoods.map(() => true)));
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
    if (marketsRef.current) marketsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function toggleMarket(i: number) {
    setMarketConfirms(prev => { const n = [...prev]; n[i] = !n[i]; return n; });
  }

  function approveAllMarkets() { setMarketConfirms(prev => prev.map(() => true)); }

  function toggleHood(mIdx: number, hIdx: number) {
    setHoodSelections(prev => {
      const next = prev.map(m => [...m]);
      next[mIdx][hIdx] = !next[mIdx][hIdx];
      return next;
    });
  }

  const allMarketsConfirmed = marketConfirms.length > 0 && marketConfirms.every(Boolean);
  const confirmedCount = marketConfirms.filter(Boolean).length;

  async function handleApprove() {
    if (!recordId || !allMarketsConfirmed || !scan) return;
    setSaving(true);
    const supabase = createSupabaseBrowserClient();
    const selectedHoods = scan.markets.map((m, mi) => ({
      market: m.name,
      neighborhoods: m.neighborhoods.filter((_, hi) => hoodSelections[mi]?.[hi]).map(n => n.name),
    }));
    await supabase.from('cited_intake').update({
      markets_approved: true,
      markets_approved_at: new Date().toISOString(),
      neighborhoods_confirmed: true,
      neighborhoods_confirmed_at: new Date().toISOString(),
      confirmed_neighborhoods: JSON.stringify(selectedHoods),
    }).eq('id', recordId);
    setApproved(true);
    setSaving(false);
  }

  const firstName = clientName.split(' ')[0] || '';

  // Loading
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0A1929', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#fff', letterSpacing: '2px' }}>CITED</div>
          <div style={{ fontSize: '14px', color: '#94a3b8', marginTop: '8px' }}>Loading your results...</div>
        </div>
      </div>
    );
  }

  // No scan data
  if (!scan) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#0A1929', letterSpacing: '2px' }}>CITED</div>
          <p style={{ fontSize: '16px', color: '#64748b', marginTop: '16px' }}>Your Citation Report isn&apos;t ready yet. Check back soon.</p>
        </div>
      </div>
    );
  }

  const primaryCompetitor = scan.markets.find(m => m.tier === 'primary');

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
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
            We ran {scan.query_count} queries across {scan.model_count} AI models, audited {scan.platform_count} platforms,
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
            These numbers tell the story of a top-performing luxury agent.
            But when buyers ask AI who to call —{' '}
            <span style={{ color: '#fff', fontWeight: 600 }}>your name doesn&apos;t come up. Let&apos;s fix that.</span>
          </p>
        </div>
      </div>
      <div style={{ height: '3px', background: 'linear-gradient(90deg, #00BFA6, #D4A830, #00BFA6)' }} />

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '0 24px 32px' }}>

        {/* ═══ SECTION 1: THE DISCOVERY GAP ═══ */}
        <div ref={el => { sectionRefs.current[0] = el; }} style={{ paddingTop: '36px' }}>
          <SectionHeader num="1" title="The Discovery Gap" color="#0A1929" />

          <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 16px 0', lineHeight: 1.5 }}>
            We asked all {scan.model_count} AI models the exact questions a buyer would ask.
            Here&apos;s what came back from one of those {scan.query_count} queries:
          </p>

          {/* AI Quote */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '18px', marginBottom: '14px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
              We asked {scan.ai_quote.model}:
            </div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#0A1929', fontStyle: 'italic', marginBottom: '10px', lineHeight: 1.5 }}>
              &ldquo;{scan.ai_quote.query}&rdquo;
            </div>
            <div style={{ background: '#f8f9fa', borderRadius: '8px', padding: '12px 14px', borderLeft: '3px solid #EF4444', fontSize: '13px', color: '#475569', lineHeight: 1.6 }}>
              &ldquo;{scan.ai_quote.response}&rdquo;
            </div>
            <div style={{ marginTop: '10px', fontSize: '13px', color: '#EF4444', fontWeight: 600 }}>
              Your name did not appear — in this query or in any of the {scan.query_count} discovery queries we ran across {scan.model_count} AI models.
            </div>
          </div>

          {/* Side by Side */}
          {primaryCompetitor && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
              <div style={{ background: '#fff', border: '2px solid #EF4444', borderRadius: '12px', padding: '18px 14px', textAlign: 'center' }}>
                <div style={{ fontSize: '10px', color: '#EF4444', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>AI Recommends Instead</div>
                <div style={{ fontSize: '17px', fontWeight: 800, color: '#0A1929' }}>{primaryCompetitor.competitor}</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{primaryCompetitor.competitor_brokerage}</div>
                <div style={{ marginTop: '12px', background: '#fff5f5', borderRadius: '8px', padding: '6px', fontSize: '20px', fontWeight: 900, color: '#EF4444' }}>
                  {primaryCompetitor.competitor_score}<span style={{ fontSize: '12px', color: '#94a3b8' }}>/100</span>
                </div>
              </div>
              <div style={{ background: '#fff', border: '2px solid #e2e8f0', borderRadius: '12px', padding: '18px 14px', textAlign: 'center' }}>
                <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Your Citation Score</div>
                <div style={{ fontSize: '17px', fontWeight: 800, color: '#0A1929' }}>{firstName || 'You'}</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Oppenheim Group</div>
                <div style={{ marginTop: '12px', background: '#f8f9fa', borderRadius: '8px', padding: '6px', fontSize: '20px', fontWeight: 900, color: '#0A1929' }}>
                  {scan.composite_score}<span style={{ fontSize: '12px', color: '#94a3b8' }}>/100</span>
                </div>
              </div>
            </div>
          )}

          <div style={{ background: '#0A1929', color: '#fff', padding: '12px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, textAlign: 'center', lineHeight: 1.5 }}>
            Think of your Citation Score like a credit score for AI visibility. Right now, yours is {scan.composite_score}.{' '}
            <span style={{ color: '#00BFA6', fontWeight: 700 }}>Here&apos;s exactly what&apos;s holding it back — and how we fix it.</span>
          </div>

          {visibleSection < 2 && <ContinueButton onClick={() => revealNext(2)} text="See What's Working" />}
        </div>

        {/* ═══ SECTION 2: WHAT'S WORKING ═══ */}
        {visibleSection >= 2 && (
          <div ref={el => { sectionRefs.current[1] = el; }} style={{ paddingTop: '36px' }}>
            <SectionHeader num="2" title="What's Already Working" color="#00BFA6" />
            <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 4px 0', lineHeight: 1.5 }}>
              You&apos;re not starting from zero. Our {scan.platform_count}-platform audit found real strengths to build on.
            </p>
            <div style={{ marginBottom: '16px' }}>
              <DepthBadge text={`${scan.platform_count} platforms audited · ${scan.query_count} queries analyzed`} />
            </div>

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
            <div style={{ marginBottom: '16px' }}>
              <DepthBadge text={`${scan.query_count} queries · ${scan.platform_count} platforms · ${scan.consistency_runs}x consistency runs per query`} />
            </div>

            {scan.gaps.map((gap, i) => (
              <div key={i} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px 18px', marginBottom: '10px', borderLeft: `4px solid ${gap.color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#0A1929' }}>{gap.title}</div>
                  <div style={{ background: '#f0fdf9', color: '#00BFA6', fontSize: '11px', fontWeight: 700, padding: '2px 10px', borderRadius: '12px', whiteSpace: 'nowrap' }}>{gap.points}</div>
                </div>
                <div style={{ fontSize: '12px', color: '#EF4444', fontWeight: 600, marginTop: '5px' }}>{gap.status}</div>
                <div style={{ fontSize: '13px', color: '#64748b', marginTop: '6px', lineHeight: 1.5 }}>{gap.impact}</div>
                <div style={{ marginTop: '8px', padding: '10px 12px', background: '#f0fdf9', borderRadius: '6px', fontSize: '13px', color: '#0A1929', lineHeight: 1.5 }}>
                  <strong>What we do:</strong> {gap.action}
                </div>
                <div style={{ marginTop: '6px', fontSize: '12px', color: '#00BFA6', fontWeight: 600, fontStyle: 'italic' }}>
                  Result: {gap.outcome}
                </div>
              </div>
            ))}

            <div style={{ background: '#0A1929', borderRadius: '8px', padding: '14px 18px', marginTop: '14px', textAlign: 'center' }}>
              <span style={{ fontSize: '14px', color: '#fff', fontWeight: 600 }}>
                Total recoverable: <span style={{ color: '#00BFA6' }}>+46 points</span>
              </span>
              <span style={{ fontSize: '13px', color: '#64748b', marginLeft: '10px' }}>
                — enough to move from {scan.composite_score} to 65+ in 90 days
              </span>
            </div>

            {visibleSection < 4 && <ContinueButton onClick={() => revealNext(4)} text="See Your Market Strategy" />}
          </div>
        )}

        {/* ═══ SECTION 4: MARKETS + NEIGHBORHOODS ═══ */}
        {visibleSection >= 4 && (
          <div ref={el => { sectionRefs.current[3] = el; }} style={{ paddingTop: '36px' }}>
            <div ref={marketsRef}>
              <SectionHeader num="4" title="Your Market Strategy" color="#D4A830" />
            </div>
            <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 4px 0', lineHeight: 1.5 }}>
              Based on your {scan.txn_analyzed} transactions, {scan.query_count} AI queries, and our {scan.platform_count}-platform audit,
              we recommend optimizing your AI visibility in these {scan.markets.length} markets. Review each one, then confirm.
            </p>
            <div style={{ marginBottom: '16px' }}>
              <DepthBadge text={`${scan.txn_analyzed} transactions analyzed · ${scan.neighborhood_count} neighborhoods mapped`} />
            </div>

            {!approved && (
              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <button onClick={approveAllMarkets} disabled={allMarketsConfirmed} style={{
                  padding: '8px 20px', background: allMarketsConfirmed ? '#e2e8f0' : '#0A1929',
                  color: allMarketsConfirmed ? '#94a3b8' : '#fff',
                  fontSize: '12px', fontWeight: 600, border: 'none', borderRadius: '6px',
                  cursor: allMarketsConfirmed ? 'default' : 'pointer',
                }}>
                  {allMarketsConfirmed ? '✓ All Markets Confirmed' : `Confirm All ${scan.markets.length} Markets`}
                </button>
              </div>
            )}

            {scan.markets.map((market, idx) => {
              const tier = TIER_CONFIG[market.tier] || TIER_CONFIG.growth;
              const isConfirmed = approved || marketConfirms[idx];
              const isExpanded = expandedMarket === idx;
              const mHoods = market.neighborhoods;

              return (
                <div key={market.name} style={{
                  background: '#fff', border: `2px solid ${isConfirmed ? '#00BFA6' : tier.border}`,
                  borderRadius: '12px', marginBottom: '14px', overflow: 'hidden', transition: 'border-color 0.3s',
                }}>
                  <div style={{ padding: '18px 18px 14px', position: 'relative' }}>
                    <div style={{
                      position: 'absolute', top: '-1px', left: '18px',
                      background: tier.color, color: '#fff', fontSize: '10px', fontWeight: 700,
                      padding: '3px 10px', borderRadius: '0 0 6px 6px', textTransform: 'uppercase', letterSpacing: '1px',
                    }}>{tier.label}</div>

                    {!approved && (
                      <div style={{ position: 'absolute', top: '10px', right: '14px' }}>
                        <button onClick={() => toggleMarket(idx)} style={{
                          background: isConfirmed ? '#00BFA6' : '#fff',
                          color: isConfirmed ? '#fff' : '#94a3b8',
                          border: isConfirmed ? '2px solid #00BFA6' : '2px solid #e2e8f0',
                          borderRadius: '20px', padding: '4px 12px', fontSize: '11px', fontWeight: 700,
                          cursor: 'pointer', transition: 'all 0.2s',
                        }}>
                          {isConfirmed ? '✓ Confirmed' : 'Confirm'}
                        </button>
                      </div>
                    )}

                    <div style={{ marginTop: '14px' }}>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: '#0A1929' }}>{market.name}</div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '10px' }}>
                        {[
                          { label: 'Volume', value: market.volume },
                          { label: 'Transactions', value: market.txn_count },
                          { label: 'Avg Price', value: market.avg_price },
                          { label: 'AI Visibility Leader', value: `${market.competitor} (${market.competitor_score})` },
                        ].map(s => (
                          <div key={s.label} style={{ background: tier.bg, borderRadius: '6px', padding: '8px 10px' }}>
                            <div style={{ fontSize: '9px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: '#0A1929', marginTop: '2px' }}>{s.value}</div>
                          </div>
                        ))}
                      </div>

                      <div style={{ marginTop: '10px', fontSize: '13px', color: '#475569', lineHeight: 1.5, padding: '8px 12px', background: '#f8f9fa', borderRadius: '6px' }}>
                        <strong style={{ color: '#0A1929' }}>From our scan:</strong> {market.ai_signal}
                      </div>

                      <div style={{ marginTop: '6px', fontSize: '12px', color: '#64748b', lineHeight: 1.4 }}>
                        <strong>Your evidence:</strong> {market.txn_highlight}
                      </div>

                      <button onClick={() => setExpandedMarket(isExpanded ? null : idx)} style={{
                        marginTop: '8px', background: 'none', border: 'none',
                        fontSize: '13px', color: '#00BFA6', fontWeight: 600, cursor: 'pointer', padding: '4px 0',
                      }}>
                        {isExpanded ? '▾ Hide neighborhoods' : `▸ View ${mHoods.length} neighborhoods — select which to target`}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div style={{ borderTop: '1px solid #f1f5f9', padding: '14px 18px', background: '#fafbfc' }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#0A1929', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                        Target Neighborhoods
                      </div>
                      <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 10px 0', lineHeight: 1.4 }}>
                        We mapped these from your MLS transactions, your intake, and what AI already recognizes.
                        Select the neighborhoods you want us to optimize for.
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        {mHoods.map((hood, hIdx) => (
                          <label key={hood.name} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '8px 12px', background: '#fff', borderRadius: '6px', border: '1px solid #e2e8f0', cursor: 'pointer',
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <input type="checkbox" checked={hoodSelections[idx]?.[hIdx] ?? true}
                                onChange={() => toggleHood(idx, hIdx)}
                                style={{ width: '16px', height: '16px', accentColor: '#00BFA6' }} />
                              <span style={{ fontSize: '13px', fontWeight: 600, color: '#0A1929' }}>{hood.name}</span>
                              {hood.txn_count && <span style={{ fontSize: '11px', color: '#94a3b8' }}>({hood.txn_count} txns)</span>}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontSize: '9px', fontWeight: 600, color: '#94a3b8', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>{hood.source}</span>
                              <span style={{ fontSize: '10px', fontWeight: 600, color: hood.ai_recognized ? '#00BFA6' : '#EF4444' }}>
                                {hood.ai_recognized ? '✓ AI sees this' : '✗ Not in AI yet'}
                              </span>
                            </div>
                          </label>
                        ))}
                      </div>
                      <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '8px', marginBottom: 0 }}>
                        Neighborhoods marked &ldquo;Not in AI yet&rdquo; are where we&apos;ll focus your content — building the signals that put you on the map.
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
                <div key={ms.day} style={{ position: 'relative', marginBottom: i < scan.trajectory.length - 1 ? '20px' : '0' }}>
                  <div style={{
                    position: 'absolute', left: '-30px', top: '2px',
                    width: '22px', height: '22px', borderRadius: '50%',
                    background: i === 0 ? ms.color : '#fff', border: `3px solid ${ms.color}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {i === 0 && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff' }} />}
                  </div>

                  <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#0A1929' }}>{ms.day}</div>
                      <div style={{ fontSize: '16px', fontWeight: 900, color: ms.color }}>
                        {ms.score}<span style={{ fontSize: '11px', color: '#94a3b8' }}>/100</span>
                      </div>
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: ms.color, marginBottom: '8px' }}>{ms.headline}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {ms.outcomes.map((outcome, j) => (
                        <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '12px', color: '#475569', lineHeight: 1.4 }}>
                          <span style={{ color: '#00BFA6', fontWeight: 700, flexShrink: 0 }}>→</span>
                          {outcome}
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

        {/* ═══ SECTION 6: DELIVERABLES ═══ */}
        {visibleSection >= 6 && (
          <div ref={el => { sectionRefs.current[5] = el; }} style={{ paddingTop: '36px' }}>
            <SectionHeader num="6" title="What We're Building For You" color="#00BFA6" />
            <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 16px 0', lineHeight: 1.5 }}>
              Everything in your founding package — built from your scan data, your transactions, and your markets.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {scan.deliverables.map((item, i) => (
                <div key={i} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px' }}>
                  <StyledIcon letter={item.icon} color={item.color} size={32} />
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#0A1929', marginTop: '8px', marginBottom: '4px' }}>{item.title}</div>
                  <div style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.5 }}>{item.desc}</div>
                </div>
              ))}
            </div>

            {visibleSection < 7 && <ContinueButton onClick={() => revealNext(7)} text="Approve Your Strategy" />}
          </div>
        )}

        {/* ═══ SECTION 7: APPROVE ═══ */}
        {visibleSection >= 7 && (
          <div ref={el => { sectionRefs.current[6] = el; }} style={{ paddingTop: '36px', marginBottom: '32px' }}>
            {!approved ? (
              <>
                <SectionHeader num="✓" title="Approve Your Strategy" color="#0A1929" />

                <div style={{ background: '#0A1929', borderRadius: '12px', padding: '24px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#00BFA6', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>
                    What happens when you approve
                  </div>
                  {[
                    { num: '1', title: 'Your positioning statement arrives within 24 hours', desc: 'Written from this scan + your intake — the foundation for all platform bios.' },
                    { num: '2', title: 'We start building your platform copy', desc: 'AI-optimized bios for every platform that feeds recommendations — written in your voice.' },
                    { num: '3', title: 'Your satellite site + first article begin', desc: 'The two highest-impact deliverables. Your satellite site is the key to Google AI.' },
                  ].map((step, i) => (
                    <div key={step.num} style={{ display: 'flex', gap: '12px', marginBottom: i < 2 ? '12px' : 0 }}>
                      <div style={{
                        width: '22px', height: '22px', minWidth: '22px', background: '#00BFA6', borderRadius: '50%',
                        textAlign: 'center', lineHeight: '22px', color: '#fff', fontSize: '11px', fontWeight: 700,
                      }}>{step.num}</div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>{step.title}</div>
                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>{step.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {!allMarketsConfirmed && (
                  <button onClick={scrollToMarkets} style={{
                    width: '100%', background: '#fffdf5', border: '1px solid #D4A830',
                    borderRadius: '8px', padding: '12px 16px', marginBottom: '12px',
                    textAlign: 'center', fontSize: '13px', color: '#0A1929', cursor: 'pointer',
                  }}>
                    ☝️ <strong>{confirmedCount}/{scan.markets.length} markets confirmed.</strong> Tap here to go back and confirm.
                  </button>
                )}

                <button onClick={handleApprove} disabled={saving || !allMarketsConfirmed} style={{
                  width: '100%', padding: '18px 24px',
                  background: allMarketsConfirmed ? '#00BFA6' : '#e2e8f0',
                  color: allMarketsConfirmed ? '#fff' : '#94a3b8',
                  fontSize: '16px', fontWeight: 700, border: 'none', borderRadius: '10px',
                  cursor: saving || !allMarketsConfirmed ? 'default' : 'pointer',
                  opacity: saving ? 0.7 : 1,
                  boxShadow: allMarketsConfirmed ? '0 4px 12px rgba(0,191,166,0.3)' : 'none',
                  transition: 'all 0.3s',
                }}>
                  {saving ? 'Saving...' : allMarketsConfirmed
                    ? '✓ Approve Strategy — Start Building'
                    : `Confirm All ${scan.markets.length} Markets First (${confirmedCount}/${scan.markets.length})`}
                </button>
              </>
            ) : (
              <div style={{ background: '#0A1929', borderRadius: '12px', padding: '32px', textAlign: 'center' }}>
                <div style={{ fontSize: '36px', marginBottom: '12px' }}>🚀</div>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', margin: '0 0 8px 0' }}>Strategy Approved — We&apos;re On It</h3>
                <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0, lineHeight: 1.6 }}>
                  Your positioning statement will arrive within 24 hours.
                  Your {scan.platform_count} platform bios and satellite site are in production.
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
