'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';
import CitedHeader from '@/components/CitedHeader';
import CitedFooter from '@/components/CitedFooter';

/* ═══════════════════════════════════════════════════════════════
   PRISM Scan Results — v4.0 Complete Rewrite
   April 10, 2026

   Progressive reveal — sections unlock one at a time.
   8-section narrative arc with scan depth throughout.

   Research applied:
   - Yablonski: Peak-End (this IS the peak), Serial Position,
     Goal-Gradient, Hick's Law (one section at a time)
   - Sugarman: Slippery slide (every section pulls to next)
   - Hunt: Awareness Ladder Step 3→5 (convince → approve)
   - Cialdini: Contrast (strengths before gaps)
   - Thaler: Loss aversion in gap framing
   - Jarrett: Gift/Reward per section
   - Clear: Identity language (client is hero)
   - Norman: Credit score mental model, signifiers (show depth)
   - Sunstein: Good friction on approval
   - Heath: SUCCESs — concrete, specific, verifiable
   - Bly: Outcomes over actions, benefits over features
   ═══════════════════════════════════════════════════════════════ */

/* ── Types ── */
type NeighborhoodData = {
  name: string;
  aiRecognized: boolean;
  txnCount?: number;
  source: string;
  selected: boolean;
};

type MarketData = {
  name: string;
  tier: 'primary' | 'secondary' | 'growth';
  volume: string;
  txnCount: string;
  avgPrice: string;
  competitor: string;
  competitorBrokerage: string;
  competitorScore: string;
  aiSignal: string;
  txnHighlight: string;
  neighborhoods: NeighborhoodData[];
  confirmed: boolean;
};

/* ── Tier config ── */
const TIER_CONFIG = {
  primary: { label: 'Primary', color: '#00BFA6', bg: '#f0fdf9', border: '#00BFA6' },
  secondary: { label: 'Secondary', color: '#D4A830', bg: '#fffdf5', border: '#D4A830' },
  growth: { label: 'Growth', color: '#64748b', bg: '#f0f4f8', border: '#94a3b8' },
};

/* ── Hardcoded scan data (Client Zero — Radley Raven) ── */
const SCAN = {
  score: 24,
  tier: 'Building',
  tierLine: 'Foundation going in. Key platforms next.',
  scanDate: 'April 9, 2026',
  queryCount: 180,
  modelCount: 4,
  platformCount: 12,
  neighborhoodCount: 12,
  consistencyRuns: 3,
  txnAnalyzed: 33,
  hoursAnalysis: 4,

  stats: [
    { value: '$91.7M', label: 'Career Volume' },
    { value: '33', label: 'Deals Closed' },
    { value: '5.0 ★', label: 'Google Rating' },
    { value: '28 days', label: 'Avg Days on Market' },
    { value: '96%', label: 'List-to-Sale Ratio' },
    { value: '24%', label: 'Sold Above Asking' },
  ],

  aiQuote: {
    model: 'Perplexity',
    query: 'Who is the best real estate agent in Carmel Valley, San Diego?',
    response: 'Felicia Lewis of the Felicia Lewis Group is widely regarded as one of the top agents in Carmel Valley. She specializes in luxury homes in Torrey Hills, Pacific Highlands Ranch, and surrounding neighborhoods...',
  },

  strengths: [
    {
      title: 'Content Freshness',
      detail: 'Your LinkedIn articles and GBP posts have been updated within the last 30 days. AI models prioritize fresh content — this is your strongest signal.',
      badge: 'Strong',
    },
    {
      title: 'Direct Name Recognition',
      detail: 'When AI is asked about you by name, every model finds you. Across all 4 AI models we tested, "Radley Raven real estate" returns results. AI knows who you are.',
      badge: 'Strong',
    },
    {
      title: 'Google Business Profile',
      detail: 'Your GBP is claimed, actively posted, and has 8 reviews with a perfect 5.0 rating. This is the foundation — it just needs more reviews to cross the AI recommendation threshold.',
      badge: 'Active',
    },
  ],

  gaps: [
    {
      title: 'Yelp Profile',
      status: '0 reviews · Generic bio',
      impact: 'Perplexity uses Yelp as its #1 source for local professional recommendations. We ran 15 Perplexity queries about agents in your markets — you appeared in zero. Every day without an optimized Yelp profile is a day Perplexity recommends your competitor instead.',
      points: '+12 pts',
      color: '#EF4444',
      action: 'We rewrite your Yelp bio with market-specific positioning and build a targeted review strategy. Once you have 20+ Yelp reviews, Perplexity starts including you.',
      outcome: 'Buyers asking Perplexity about Carmel Valley agents will see your name.',
    },
    {
      title: 'Bing Places + Foursquare',
      status: 'Not claimed — you\'re invisible to ChatGPT',
      impact: 'ChatGPT pulls 87% of its local business data from Bing. We ran 15 ChatGPT queries about your markets — you appeared in zero. Without Bing Places, you simply don\'t exist in the world\'s most popular AI.',
      points: '+14 pts',
      color: '#EF4444',
      action: 'We walk you through claiming both profiles — takes about 5 minutes each. Once claimed, we fully optimize them with your positioning copy.',
      outcome: 'When someone asks ChatGPT "who\'s the best agent in Carlsbad?" — you\'re in the answer.',
    },
    {
      title: 'Website Schema + AI Structure',
      status: '8 GBP reviews · No AI-readable structure on your website',
      impact: 'Google AI and Gemini rely on schema markup — structured data that tells AI exactly who you are, where you work, and what you specialize in. Your website has none. Google AI can\'t parse your expertise from your site.',
      points: '+10 pts',
      color: '#D4A830',
      action: 'We build your satellite site with full RealEstateAgent schema, FAQ markup, and market-specific structured data — the exact format Google AI reads.',
      outcome: 'Google AI Overviews will be able to cite you as a Carmel Valley specialist.',
    },
    {
      title: 'Your Platforms Tell Different Stories',
      status: '4 different locations listed across your profiles',
      impact: 'We audited all 12 of your indexed platforms. Yelp says Del Mar. Zillow says La Jolla. LinkedIn says Carlsbad. GBP says Carmel Valley. AI cross-checks your profiles to verify you\'re one person — and right now, it can\'t confidently connect them.',
      points: '+10 pts',
      color: '#EF4444',
      action: 'We align every platform to a consistent story: Carmel Valley · Carlsbad · Rancho Santa Fe. Same name format, same specialty, same markets — everywhere.',
      outcome: 'AI will confidently link all your profiles as one authoritative agent.',
    },
  ],

  markets: [
    {
      name: 'Carmel Valley',
      tier: 'primary' as const,
      volume: '$44.8M',
      txnCount: '11',
      avgPrice: '$2.1M',
      competitor: 'Felicia Lewis',
      competitorBrokerage: 'Felicia Lewis Group',
      competitorScore: '~55',
      aiSignal: 'AI recommends agents in Carmel Valley in 8 out of 10 discovery queries — but never you. High demand, clear gap.',
      txnHighlight: '8 transactions in Rancho Pacifica alone, including $6.2M Del Mar Country Club sale',
      neighborhoods: [
        { name: 'Rancho Pacifica', aiRecognized: true, txnCount: 8, source: 'MLS', selected: true },
        { name: 'Pacific Highlands Ranch', aiRecognized: true, source: 'PRISM', selected: true },
        { name: 'Torrey Hills', aiRecognized: true, source: 'PRISM', selected: true },
        { name: 'Whispering Woods', aiRecognized: false, txnCount: 2, source: 'MLS', selected: true },
        { name: 'Del Mar Mesa', aiRecognized: false, source: 'Intake', selected: true },
      ],
    },
    {
      name: 'Carlsbad',
      tier: 'secondary' as const,
      volume: '$10.0M',
      txnCount: '6',
      avgPrice: '$1.7M',
      competitor: 'Kurt Wannebo',
      competitorBrokerage: 'Wannebo Group',
      competitorScore: '~60',
      aiSignal: '5+ agents regularly recommended. Competitive — but early movers win disproportionate AI share.',
      txnHighlight: '3 transactions in La Costa, strong presence in Santalina community',
      neighborhoods: [
        { name: 'La Costa', aiRecognized: true, txnCount: 3, source: 'MLS', selected: true },
        { name: 'Aviara', aiRecognized: true, source: 'PRISM', selected: true },
        { name: 'Santalina', aiRecognized: false, source: 'Intake', selected: true },
        { name: 'Bressi Ranch', aiRecognized: false, source: 'Intake', selected: true },
      ],
    },
    {
      name: 'Rancho Santa Fe',
      tier: 'growth' as const,
      volume: '$11.7M',
      txnCount: '3',
      avgPrice: '$3.9M',
      competitor: 'Bree Bornstein',
      competitorBrokerage: 'Compass',
      competitorScore: '~45',
      aiSignal: 'Low AI coverage — only 2-3 agents mentioned. Massive early mover advantage.',
      txnHighlight: '$6.2M Del Mar Country Club sale — highest single transaction across all markets',
      neighborhoods: [
        { name: 'Del Mar Country Club', aiRecognized: true, txnCount: 1, source: 'MLS', selected: true },
        { name: 'The Bridges', aiRecognized: true, source: 'PRISM', selected: true },
        { name: 'Whispering Palms', aiRecognized: false, source: 'Intake', selected: true },
      ],
    },
  ] as MarketData[],

  trajectory: [
    {
      day: 'Today',
      score: '24',
      color: '#EF4444',
      headline: 'Your baseline is documented.',
      outcomes: [
        'AI knows your name but doesn\'t recommend you in any market',
        'Every gap has been identified with a specific fix and point value',
      ],
    },
    {
      day: 'Day 30',
      score: '45–50',
      color: '#D4A830',
      headline: 'You start appearing in ChatGPT results.',
      outcomes: [
        'Bing Places + Foursquare live — ChatGPT can now find you for local queries',
        'Yelp bio rewritten — Perplexity sees an optimized, market-specific profile',
        'All 12 platforms aligned — AI confidently links your profiles as one agent',
        'Satellite site live with full schema — Google AI can read your expertise',
      ],
    },
    {
      day: 'Day 60',
      score: '55–65',
      color: '#D4A830',
      headline: 'AI starts recommending you alongside competitors.',
      outcomes: [
        'First article published and indexed — Perplexity cites it when asked about your market',
        'Review momentum building on Yelp — approaching the 20-review threshold',
        'Your name appears in at least 2 AI models for Carmel Valley discovery queries',
        'Satellite site indexed by Google — Gemini can now cite your market expertise',
      ],
    },
    {
      day: 'Day 90',
      score: '65–75',
      color: '#00BFA6',
      headline: 'You\'re the agent AI recommends in your market.',
      outcomes: [
        'When a buyer asks any AI "who\'s the best agent in Carmel Valley?" — your name is in the answer',
        'Full platform coverage: every AI model has multiple signals pointing to you',
        'Monthly content rhythm keeps your signals fresh — competitors can\'t catch up easily',
        'Citation Guarantee™ met: 20+ point improvement documented with data',
      ],
    },
  ],

  deliverables: [
    { icon: 'B', title: '12 Platform Bios', desc: 'AI-optimized copy for every platform that feeds recommendations. Written from your positioning — not templates.', color: '#00BFA6' },
    { icon: 'S', title: 'Your Satellite Website', desc: 'A dedicated site with full schema markup. This is the signal that unlocks Google AI and Gemini — the platform that drives 60%+ of AI search traffic.', color: '#0A1929' },
    { icon: 'A', title: 'First Market Article', desc: 'A ghostwritten article about your primary market. Published on your platforms so AI sees you as the local expert — not just a name in a directory.', color: '#D4A830' },
    { icon: 'R', title: 'Review Strategy', desc: 'A targeted plan starting with Yelp — the platform Perplexity relies on most. We tell you exactly who to ask and when.', color: '#EF4444' },
    { icon: 'M', title: 'Monthly PRISM Re-Scans', desc: 'Every 30 days, we re-run the full analysis — same depth, same rigor. You see exactly what moved and what\'s next.', color: '#00BFA6' },
    { icon: 'C', title: 'Ongoing Content + Freshness', desc: '2 articles per month after Month 1. GBP posts, platform updates, and content syndication — AI prioritizes agents who stay current.', color: '#D4A830' },
  ],
};

/* ── Styled icon (replaces emoji) ── */
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
  const steps = ['Your Results', 'Approve Strategy', 'Positioning', 'Copy Kit'];
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

/* ── Section reveal button ── */
function ContinueButton({ onClick, text }: { onClick: () => void; text: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '24px 0 8px' }}>
      <button onClick={onClick} style={{
        background: '#00BFA6', color: '#fff', border: 'none',
        padding: '14px 32px', borderRadius: '8px', fontSize: '15px',
        fontWeight: 700, cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(0,191,166,0.25)',
        transition: 'transform 0.2s',
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

/* ════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════════════════ */
function ResultsContent() {
  const [clientName, setClientName] = useState('');
  const [approved, setApproved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [recordId, setRecordId] = useState('');

  // Progressive reveal state
  const [visibleSection, setVisibleSection] = useState(1);

  // Market + neighborhood state
  const [marketConfirms, setMarketConfirms] = useState<boolean[]>([false, false, false]);
  const [neighborhoods, setNeighborhoods] = useState<NeighborhoodData[][]>(
    SCAN.markets.map(m => m.neighborhoods.map(n => ({ ...n })))
  );
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
        .select('id, full_name, markets_approved')
        .eq('onboarding_token', token).single();
      if (data) {
        setRecordId(data.id);
        setClientName(data.full_name || '');
        if (data.markets_approved) {
          setApproved(true);
          setVisibleSection(8);
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
    if (marketsRef.current) {
      marketsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function toggleMarket(index: number) {
    setMarketConfirms(prev => { const n = [...prev]; n[index] = !n[index]; return n; });
  }

  function approveAllMarkets() {
    setMarketConfirms([true, true, true]);
  }

  function toggleNeighborhood(marketIdx: number, hoodIdx: number) {
    setNeighborhoods(prev => {
      const next = prev.map(m => m.map(n => ({ ...n })));
      next[marketIdx][hoodIdx].selected = !next[marketIdx][hoodIdx].selected;
      return next;
    });
  }

  const allMarketsConfirmed = marketConfirms.every(Boolean);
  const confirmedCount = marketConfirms.filter(Boolean).length;

  async function handleApprove() {
    if (!recordId || !allMarketsConfirmed) return;
    setSaving(true);
    const supabase = createSupabaseBrowserClient();
    const selectedHoods = neighborhoods.map((market, i) => ({
      market: SCAN.markets[i].name,
      neighborhoods: market.filter(n => n.selected).map(n => n.name),
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

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      <CitedHeader variant="onboarding" userEmail="" userName={clientName} clientTier="founding_client" />
      <ProgressIndicator />

      {/* ═══════════════════════════════════════════════════════
          HERO — Always visible. Celebrate + scan depth.
          ═══════════════════════════════════════════════════════ */}
      <div style={{ background: '#0A1929', padding: '44px 24px 40px', textAlign: 'center' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <div style={{
            fontSize: '12px', color: '#00BFA6', fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '14px',
          }}>
            Your PRISM Scan is Complete
          </div>
          <h1 style={{
            fontSize: '26px', fontWeight: 800, color: '#fff',
            lineHeight: 1.3, margin: '0 0 6px 0',
          }}>
            {firstName ? `${firstName}, here's what we found.` : "Here's what we found."}
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 24px 0', lineHeight: 1.5 }}>
            We ran {SCAN.queryCount} queries across {SCAN.modelCount} AI models, audited {SCAN.platformCount} platforms,
            analyzed {SCAN.txnAnalyzed} of your transactions, and mapped {SCAN.neighborhoodCount} neighborhoods — every query
            run {SCAN.consistencyRuns}x for consistency.
          </p>

          {/* Stats Grid — 3x2 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '24px' }}>
            {SCAN.stats.map((stat) => (
              <div key={stat.label} style={{
                background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '12px 8px',
              }}>
                <div style={{ fontSize: '22px', fontWeight: 900, color: '#00BFA6' }}>{stat.value}</div>
                <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '3px' }}>{stat.label}</div>
              </div>
            ))}
          </div>

          <p style={{
            fontSize: '15px', color: '#94a3b8', lineHeight: 1.6, margin: 0,
            maxWidth: '520px', marginLeft: 'auto', marginRight: 'auto',
          }}>
            These numbers tell the story of a top-performing luxury agent.
            But when buyers ask AI who to call —{' '}
            <span style={{ color: '#fff', fontWeight: 600 }}>your name doesn&apos;t come up. Let&apos;s fix that.</span>
          </p>
        </div>
      </div>
      <div style={{ height: '3px', background: 'linear-gradient(90deg, #00BFA6, #D4A830, #00BFA6)' }} />

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '0 24px 32px' }}>

        {/* ═══════════════════════════════════════════════════════
            SECTION 1: THE DISCOVERY GAP
            ═══════════════════════════════════════════════════════ */}
        <div ref={el => { sectionRefs.current[0] = el; }} style={{ paddingTop: '36px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%', background: '#0A1929',
              color: '#fff', fontSize: '13px', fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>1</div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0A1929', margin: 0 }}>
              The Discovery Gap
            </h2>
          </div>

          <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 16px 0', lineHeight: 1.5 }}>
            We asked all {SCAN.modelCount} AI models the exact questions a buyer would ask.
            Here&apos;s what came back from one of those {SCAN.queryCount} queries:
          </p>

          {/* AI Quote */}
          <div style={{
            background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px',
            padding: '18px', marginBottom: '14px',
          }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
              We asked {SCAN.aiQuote.model}:
            </div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#0A1929', fontStyle: 'italic', marginBottom: '10px', lineHeight: 1.5 }}>
              &ldquo;{SCAN.aiQuote.query}&rdquo;
            </div>
            <div style={{
              background: '#f8f9fa', borderRadius: '8px', padding: '12px 14px',
              borderLeft: '3px solid #EF4444', fontSize: '13px', color: '#475569', lineHeight: 1.6,
            }}>
              &ldquo;{SCAN.aiQuote.response}&rdquo;
            </div>
            <div style={{ marginTop: '10px', fontSize: '13px', color: '#EF4444', fontWeight: 600 }}>
              Your name did not appear — in this query or in any of the {SCAN.queryCount} discovery queries we ran across {SCAN.modelCount} AI models.
            </div>
          </div>

          {/* Side by Side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
            <div style={{ background: '#fff', border: '2px solid #EF4444', borderRadius: '12px', padding: '18px 14px', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: '#EF4444', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>AI Recommends Instead</div>
              <div style={{ fontSize: '17px', fontWeight: 800, color: '#0A1929' }}>Felicia Lewis</div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Felicia Lewis Group</div>
              <div style={{ marginTop: '12px', background: '#fff5f5', borderRadius: '8px', padding: '6px', fontSize: '20px', fontWeight: 900, color: '#EF4444' }}>
                ~55<span style={{ fontSize: '12px', color: '#94a3b8' }}>/100</span>
              </div>
            </div>
            <div style={{ background: '#fff', border: '2px solid #e2e8f0', borderRadius: '12px', padding: '18px 14px', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Your Citation Score</div>
              <div style={{ fontSize: '17px', fontWeight: 800, color: '#0A1929' }}>{firstName || 'You'}</div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Oppenheim Group</div>
              <div style={{ marginTop: '12px', background: '#f8f9fa', borderRadius: '8px', padding: '6px', fontSize: '20px', fontWeight: 900, color: '#0A1929' }}>
                {SCAN.score}<span style={{ fontSize: '12px', color: '#94a3b8' }}>/100</span>
              </div>
            </div>
          </div>

          <div style={{
            background: '#0A1929', color: '#fff', padding: '12px 18px', borderRadius: '8px',
            fontSize: '13px', fontWeight: 500, textAlign: 'center', lineHeight: 1.5,
          }}>
            Think of your Citation Score like a credit score for AI visibility. Right now, yours is {SCAN.score}.{' '}
            <span style={{ color: '#00BFA6', fontWeight: 700 }}>Here&apos;s exactly what&apos;s holding it back — and how we fix it.</span>
          </div>

          {visibleSection < 2 && (
            <ContinueButton onClick={() => revealNext(2)} text="See What's Working" />
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════
            SECTION 2: WHAT'S WORKING
            ═══════════════════════════════════════════════════════ */}
        {visibleSection >= 2 && (
          <div ref={el => { sectionRefs.current[1] = el; }} style={{ paddingTop: '36px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%', background: '#00BFA6',
                color: '#fff', fontSize: '13px', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>2</div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0A1929', margin: 0 }}>
                What&apos;s Already Working
              </h2>
            </div>

            <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 4px 0', lineHeight: 1.5 }}>
              You&apos;re not starting from zero. Our {SCAN.platformCount}-platform audit found real strengths to build on.
            </p>
            <div style={{ marginBottom: '16px' }}>
              <DepthBadge text={`${SCAN.platformCount} platforms audited · ${SCAN.queryCount} queries analyzed`} />
            </div>

            {SCAN.strengths.map((item, i) => (
              <div key={i} style={{
                background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px',
                padding: '14px 18px', marginBottom: '8px', borderLeft: '4px solid #00BFA6',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#0A1929' }}>{item.title}</div>
                  <div style={{
                    background: '#f0fdf9', color: '#00BFA6', fontSize: '11px', fontWeight: 700,
                    padding: '2px 10px', borderRadius: '12px',
                  }}>{item.badge}</div>
                </div>
                <div style={{ fontSize: '13px', color: '#64748b', marginTop: '6px', lineHeight: 1.5 }}>{item.detail}</div>
              </div>
            ))}

            <div style={{
              background: '#f0fdf9', borderRadius: '8px', padding: '12px 16px', marginTop: '12px',
              fontSize: '13px', color: '#0A1929', textAlign: 'center', fontWeight: 500,
            }}>
              Now you know your foundation. Next: the specific gaps costing you AI recommendations.
            </div>

            {visibleSection < 3 && (
              <ContinueButton onClick={() => revealNext(3)} text="See Where the Gaps Are" />
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            SECTION 3: WHERE THE GAPS ARE
            ═══════════════════════════════════════════════════════ */}
        {visibleSection >= 3 && (
          <div ref={el => { sectionRefs.current[2] = el; }} style={{ paddingTop: '36px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%', background: '#EF4444',
                color: '#fff', fontSize: '13px', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>3</div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0A1929', margin: 0 }}>
                Where the Gaps Are
              </h2>
            </div>

            <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 4px 0', lineHeight: 1.5 }}>
              4 specific gaps are keeping you out of AI recommendations. Each one has a measurable fix.
            </p>
            <div style={{ marginBottom: '16px' }}>
              <DepthBadge text={`${SCAN.queryCount} queries · ${SCAN.platformCount} platforms · ${SCAN.consistencyRuns}x consistency runs per query`} />
            </div>

            {SCAN.gaps.map((gap, i) => (
              <div key={i} style={{
                background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px',
                padding: '16px 18px', marginBottom: '10px', borderLeft: `4px solid ${gap.color}`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#0A1929' }}>{gap.title}</div>
                  <div style={{
                    background: '#f0fdf9', color: '#00BFA6', fontSize: '11px', fontWeight: 700,
                    padding: '2px 10px', borderRadius: '12px', whiteSpace: 'nowrap',
                  }}>{gap.points}</div>
                </div>
                <div style={{ fontSize: '12px', color: '#EF4444', fontWeight: 600, marginTop: '5px' }}>{gap.status}</div>
                <div style={{ fontSize: '13px', color: '#64748b', marginTop: '6px', lineHeight: 1.5 }}>{gap.impact}</div>
                <div style={{
                  marginTop: '8px', padding: '10px 12px', background: '#f0fdf9',
                  borderRadius: '6px', fontSize: '13px', color: '#0A1929', lineHeight: 1.5,
                }}>
                  <strong>What we do:</strong> {gap.action}
                </div>
                <div style={{
                  marginTop: '6px', fontSize: '12px', color: '#00BFA6', fontWeight: 600, fontStyle: 'italic',
                }}>
                  Result: {gap.outcome}
                </div>
              </div>
            ))}

            <div style={{
              background: '#0A1929', borderRadius: '8px', padding: '14px 18px',
              marginTop: '14px', textAlign: 'center',
            }}>
              <span style={{ fontSize: '14px', color: '#fff', fontWeight: 600 }}>
                Total recoverable: <span style={{ color: '#00BFA6' }}>+46 points</span>
              </span>
              <span style={{ fontSize: '13px', color: '#64748b', marginLeft: '10px' }}>
                — enough to move from {SCAN.score} to 65+ in 90 days
              </span>
            </div>

            {visibleSection < 4 && (
              <ContinueButton onClick={() => revealNext(4)} text="See Your Market Strategy" />
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            SECTION 4: YOUR MARKETS + NEIGHBORHOODS
            Interactive: confirm per market, select neighborhoods
            ═══════════════════════════════════════════════════════ */}
        {visibleSection >= 4 && (
          <div ref={el => { sectionRefs.current[3] = el; }} style={{ paddingTop: '36px' }}>
            <div ref={marketsRef} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%', background: '#D4A830',
                color: '#fff', fontSize: '13px', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>4</div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0A1929', margin: 0 }}>
                Your Market Strategy
              </h2>
            </div>

            <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 4px 0', lineHeight: 1.5 }}>
              Based on your {SCAN.txnAnalyzed} transactions, {SCAN.queryCount} AI queries, and our {SCAN.platformCount}-platform audit,
              we recommend optimizing your AI visibility in these 3 markets. Review each one, then confirm.
            </p>
            <div style={{ marginBottom: '16px' }}>
              <DepthBadge text={`${SCAN.txnAnalyzed} transactions analyzed · ${SCAN.neighborhoodCount} neighborhoods mapped`} />
            </div>

            {/* Approve All button */}
            {!approved && (
              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <button onClick={approveAllMarkets} disabled={allMarketsConfirmed} style={{
                  padding: '8px 20px', background: allMarketsConfirmed ? '#e2e8f0' : '#0A1929',
                  color: allMarketsConfirmed ? '#94a3b8' : '#fff',
                  fontSize: '12px', fontWeight: 600, border: 'none', borderRadius: '6px',
                  cursor: allMarketsConfirmed ? 'default' : 'pointer',
                }}>
                  {allMarketsConfirmed ? '✓ All 3 Markets Confirmed' : 'Confirm All 3 Markets'}
                </button>
              </div>
            )}

            {SCAN.markets.map((market, idx) => {
              const tier = TIER_CONFIG[market.tier];
              const isConfirmed = approved || marketConfirms[idx];
              const isExpanded = expandedMarket === idx;
              const marketHoods = neighborhoods[idx];

              return (
                <div key={market.name} style={{
                  background: '#fff',
                  border: `2px solid ${isConfirmed ? '#00BFA6' : tier.border}`,
                  borderRadius: '12px', marginBottom: '14px', overflow: 'hidden',
                  transition: 'border-color 0.3s',
                }}>
                  <div style={{ padding: '18px 18px 14px', position: 'relative' }}>
                    {/* Tier badge */}
                    <div style={{
                      position: 'absolute', top: '-1px', left: '18px',
                      background: tier.color, color: '#fff', fontSize: '10px', fontWeight: 700,
                      padding: '3px 10px', borderRadius: '0 0 6px 6px',
                      textTransform: 'uppercase', letterSpacing: '1px',
                    }}>{tier.label}</div>

                    {/* Confirm toggle */}
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

                      {/* Stats */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '10px' }}>
                        {[
                          { label: 'Volume', value: market.volume },
                          { label: 'Transactions', value: market.txnCount },
                          { label: 'Avg Price', value: market.avgPrice },
                          { label: 'AI Visibility Leader', value: `${market.competitor} (${market.competitorScore})` },
                        ].map(s => (
                          <div key={s.label} style={{ background: tier.bg, borderRadius: '6px', padding: '8px 10px' }}>
                            <div style={{ fontSize: '9px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: '#0A1929', marginTop: '2px' }}>{s.value}</div>
                          </div>
                        ))}
                      </div>

                      {/* AI Signal */}
                      <div style={{
                        marginTop: '10px', fontSize: '13px', color: '#475569', lineHeight: 1.5,
                        padding: '8px 12px', background: '#f8f9fa', borderRadius: '6px',
                      }}>
                        <strong style={{ color: '#0A1929' }}>From our scan:</strong> {market.aiSignal}
                      </div>

                      {/* Transaction highlight */}
                      <div style={{ marginTop: '6px', fontSize: '12px', color: '#64748b', lineHeight: 1.4 }}>
                        <strong>Your evidence:</strong> {market.txnHighlight}
                      </div>

                      {/* Expand neighborhoods */}
                      <button onClick={() => setExpandedMarket(isExpanded ? null : idx)} style={{
                        marginTop: '8px', background: 'none', border: 'none',
                        fontSize: '13px', color: '#00BFA6', fontWeight: 600,
                        cursor: 'pointer', padding: '4px 0',
                      }}>
                        {isExpanded ? '▾ Hide neighborhoods' : `▸ View ${marketHoods.length} neighborhoods — select which to target`}
                      </button>
                    </div>
                  </div>

                  {/* Neighborhoods panel */}
                  {isExpanded && (
                    <div style={{
                      borderTop: '1px solid #f1f5f9', padding: '14px 18px', background: '#fafbfc',
                    }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#0A1929', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                        Target Neighborhoods
                      </div>
                      <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 10px 0', lineHeight: 1.4 }}>
                        We mapped these from your MLS transactions, your intake, and what AI already recognizes.
                        Select the neighborhoods you want us to optimize for. Uncheck any you don&apos;t target.
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        {marketHoods.map((hood, hIdx) => (
                          <label key={hood.name} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '8px 12px', background: '#fff', borderRadius: '6px',
                            border: '1px solid #e2e8f0', cursor: 'pointer',
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <input
                                type="checkbox"
                                checked={hood.selected}
                                onChange={() => toggleNeighborhood(idx, hIdx)}
                                style={{ width: '16px', height: '16px', accentColor: '#00BFA6' }}
                              />
                              <span style={{ fontSize: '13px', fontWeight: 600, color: '#0A1929' }}>{hood.name}</span>
                              {hood.txnCount && (
                                <span style={{ fontSize: '11px', color: '#94a3b8' }}>({hood.txnCount} txns)</span>
                              )}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{
                                fontSize: '9px', fontWeight: 600, color: '#94a3b8',
                                background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase',
                              }}>{hood.source}</span>
                              <span style={{
                                fontSize: '10px', fontWeight: 600,
                                color: hood.aiRecognized ? '#00BFA6' : '#EF4444',
                              }}>
                                {hood.aiRecognized ? '✓ AI sees this' : '✗ Not in AI yet'}
                              </span>
                            </div>
                          </label>
                        ))}
                      </div>
                      <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '8px', marginBottom: 0 }}>
                        Neighborhoods marked &ldquo;Not in AI yet&rdquo; are where we&apos;ll focus your content — building the signals that put you on the map in these areas.
                      </p>
                    </div>
                  )}
                </div>
              );
            })}

            {visibleSection < 5 && (
              <ContinueButton onClick={() => revealNext(5)} text="See Your 90-Day Path" />
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            SECTION 5: 90-DAY PATH — Vertical timeline
            Outcome-oriented milestones
            ═══════════════════════════════════════════════════════ */}
        {visibleSection >= 5 && (
          <div ref={el => { sectionRefs.current[4] = el; }} style={{ paddingTop: '36px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%', background: '#0A1929',
                color: '#fff', fontSize: '13px', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>5</div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0A1929', margin: 0 }}>
                From {SCAN.score} to 65+ — Your 90-Day Path
              </h2>
            </div>

            <div style={{ position: 'relative', paddingLeft: '30px' }}>
              {/* Vertical line */}
              <div style={{
                position: 'absolute', left: '11px', top: '0', bottom: '0',
                width: '2px', background: 'linear-gradient(180deg, #EF4444, #D4A830, #00BFA6)',
              }} />

              {SCAN.trajectory.map((ms, i) => (
                <div key={ms.day} style={{
                  position: 'relative', marginBottom: i < SCAN.trajectory.length - 1 ? '20px' : '0',
                }}>
                  <div style={{
                    position: 'absolute', left: '-30px', top: '2px',
                    width: '22px', height: '22px', borderRadius: '50%',
                    background: i === 0 ? ms.color : '#fff',
                    border: `3px solid ${ms.color}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {i === 0 && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff' }} />}
                  </div>

                  <div style={{
                    background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 16px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#0A1929' }}>{ms.day}</div>
                      <div style={{ fontSize: '16px', fontWeight: 900, color: ms.color }}>
                        {ms.score}<span style={{ fontSize: '11px', color: '#94a3b8' }}>/100</span>
                      </div>
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: ms.color, marginBottom: '8px' }}>
                      {ms.headline}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {ms.outcomes.map((outcome, j) => (
                        <div key={j} style={{
                          display: 'flex', alignItems: 'flex-start', gap: '6px',
                          fontSize: '12px', color: '#475569', lineHeight: 1.4,
                        }}>
                          <span style={{ color: '#00BFA6', fontWeight: 700, flexShrink: 0 }}>→</span>
                          {outcome}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{
              background: '#f0fdf9', borderRadius: '8px', padding: '12px 16px',
              fontSize: '14px', color: '#0A1929', textAlign: 'center', marginTop: '16px',
              border: '1px solid #00BFA6',
            }}>
              <strong>Citation Guarantee™:</strong> +20 points in 90 days or you owe nothing. Ever.
            </div>

            {visibleSection < 6 && (
              <ContinueButton onClick={() => revealNext(6)} text="See What We're Building" />
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            SECTION 6: WHAT WE'LL BUILD
            Styled icons, client language, no pricing
            ═══════════════════════════════════════════════════════ */}
        {visibleSection >= 6 && (
          <div ref={el => { sectionRefs.current[5] = el; }} style={{ paddingTop: '36px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%', background: '#00BFA6',
                color: '#fff', fontSize: '13px', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>6</div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0A1929', margin: 0 }}>
                What We&apos;re Building For You
              </h2>
            </div>

            <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 16px 0', lineHeight: 1.5 }}>
              Everything in your founding package — built from your scan data, your transactions, and your markets.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {SCAN.deliverables.map((item, i) => (
                <div key={i} style={{
                  background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px',
                }}>
                  <StyledIcon letter={item.icon} color={item.color} size={32} />
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#0A1929', marginTop: '8px', marginBottom: '4px' }}>{item.title}</div>
                  <div style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.5 }}>{item.desc}</div>
                </div>
              ))}
            </div>

            {visibleSection < 7 && (
              <ContinueButton onClick={() => revealNext(7)} text="Approve Your Strategy" />
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            SECTION 7: APPROVE STRATEGY
            Dark card, prominent, weighted approval
            ═══════════════════════════════════════════════════════ */}
        {visibleSection >= 7 && (
          <div ref={el => { sectionRefs.current[6] = el; }} style={{ paddingTop: '36px', marginBottom: '32px' }}>
            {!approved ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%', background: '#0A1929',
                    color: '#fff', fontSize: '13px', fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>✓</div>
                  <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0A1929', margin: 0 }}>
                    Approve Your Strategy
                  </h2>
                </div>

                {/* What happens next — dark card */}
                <div style={{
                  background: '#0A1929', borderRadius: '12px', padding: '24px', marginBottom: '16px',
                }}>
                  <div style={{
                    fontSize: '12px', fontWeight: 700, color: '#00BFA6',
                    textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px',
                  }}>What happens when you approve</div>
                  {[
                    { num: '1', title: 'Your positioning statement arrives within 24 hours', desc: 'Written from this scan + your intake — the foundation for all 12 platform bios.' },
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

                {/* Market confirmation status */}
                {!allMarketsConfirmed && (
                  <button onClick={scrollToMarkets} style={{
                    width: '100%', background: '#fffdf5', border: '1px solid #D4A830',
                    borderRadius: '8px', padding: '12px 16px', marginBottom: '12px',
                    textAlign: 'center', fontSize: '13px', color: '#0A1929',
                    cursor: 'pointer',
                  }}>
                    ☝️ <strong>{confirmedCount}/3 markets confirmed.</strong> Tap here to go back and confirm each market.
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
                    : `Confirm All 3 Markets First (${confirmedCount}/3)`}
                </button>
              </>
            ) : (
              <div style={{
                background: '#0A1929', borderRadius: '12px', padding: '32px', textAlign: 'center',
              }}>
                <div style={{ fontSize: '36px', marginBottom: '12px' }}>🚀</div>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', margin: '0 0 8px 0' }}>
                  Strategy Approved — We&apos;re On It
                </h3>
                <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0, lineHeight: 1.6 }}>
                  Your positioning statement will arrive within 24 hours.
                  Your {SCAN.platformCount} platform bios and satellite site are in production.
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
