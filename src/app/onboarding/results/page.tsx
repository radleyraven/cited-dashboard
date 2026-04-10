'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';
import CitedHeader from '@/components/CitedHeader';
import CitedFooter from '@/components/CitedFooter';

/* ═══════════════════════════════════════════════════════════════
   PRISM Scan Results — v3.0 Complete Rewrite
   April 10, 2026

   Story arc (8 sections):
   1. HERO — Celebrate client stats (expanded grid)
   2. THE GAP — Side-by-side competitor with real AI quote
   3. WHAT'S WORKING — Positive signals first (Cialdini contrast)
   4. WHERE THE GAPS ARE — Platform gaps, no sub-scores
   5. YOUR MARKETS — Interactive approval per market + neighborhoods + competitor
   6. YOUR 90-DAY PATH — Vertical timeline with actions per milestone
   7. WHAT WE'LL BUILD — Deliverables preview (value stack in action)
   8. APPROVE — Weighted approval with confirmation

   Research: Sugarman (slippery slide), Yablonski (Peak-End),
   Hunt (Awareness Ladder Step 3→5), Cialdini (contrast),
   Gawande (checklist clarity), Heath (Made to Stick),
   QC 15-source synthesis (enforce > document)
   ═══════════════════════════════════════════════════════════════ */

/* ── Market & Neighborhood types ── */
type NeighborhoodStatus = {
  name: string;
  aiRecognized: boolean;
  txnCount?: number;
  source: string; // 'MLS' | 'Intake' | 'PRISM'
};

type MarketData = {
  name: string;
  tier: 'primary' | 'secondary' | 'growth';
  volume: string;
  txnCount: string;
  competitor: string;
  competitorBrokerage: string;
  competitorScore: string;
  aiSignal: string;
  neighborhoods: NeighborhoodStatus[];
  confirmed: boolean;
};

/* ── Tier config (from markets page pattern) ── */
const TIER_CONFIG = {
  primary: { label: 'Primary Market', color: '#00BFA6', bg: '#f0fdf9', border: '#00BFA6', icon: '🎯' },
  secondary: { label: 'Secondary Market', color: '#D4A830', bg: '#fffdf5', border: '#D4A830', icon: '📍' },
  growth: { label: 'Growth Market', color: '#0A1929', bg: '#f0f4f8', border: '#94a3b8', icon: '🌱' },
};

/* ── Hardcoded scan data (Client Zero — Radley Raven) ── */
/* TODO: Pull dynamically from Supabase for real clients */
const SCAN_DATA = {
  score: 24,
  tier: 'Building',
  tierLine: 'Foundation going in. Key platforms next.',
  scanDate: 'April 9, 2026',
  queryCount: 180,
  modelCount: 4,
  stats: [
    { value: '$91.7M', label: 'Career Volume' },
    { value: '33', label: 'Deals Closed' },
    { value: '5.0 ★', label: 'Google Rating' },
    { value: '28', label: 'Avg Days on Market' },
    { value: '96%', label: 'List-to-Sale Ratio' },
    { value: '24%', label: 'Sold Above Asking' },
  ],
  aiQuote: {
    model: 'Perplexity',
    query: 'Who is the best real estate agent in Carmel Valley, San Diego?',
    response: 'Felicia Lewis of the Felicia Lewis Group is widely regarded as one of the top agents in Carmel Valley. She specializes in luxury homes in Torrey Hills, Pacific Highlands Ranch, and surrounding neighborhoods...',
    clientMentioned: false,
  },
  strengths: [
    { title: 'Content Freshness', detail: 'Your LinkedIn articles and GBP posts are active — updated within 30 days. This is your strongest signal right now.', score: '5/5', color: '#00BFA6' },
    { title: 'Name Recognition', detail: 'When AI is asked about you specifically ("Radley Raven real estate"), every model finds you. AI knows who you are.', score: '✓', color: '#00BFA6' },
    { title: 'Google Business Profile', detail: 'Your GBP is claimed, active, and has 11 reviews with a 5.0 rating. Strong foundation — needs more reviews to hit the threshold.', score: 'Active', color: '#D4A830' },
  ],
  gaps: [
    {
      title: 'Yelp',
      status: '0 reviews · Generic bio',
      impact: 'Perplexity uses Yelp as its primary source for local agent recommendations. Without an optimized profile and reviews, you\'re invisible to the AI that 40% of buyers now use.',
      points: '+12 pts',
      color: '#EF4444',
      action: 'We\'ll rewrite your Yelp bio and build a review acquisition strategy targeting Yelp first.',
    },
    {
      title: 'Bing Places + Foursquare',
      status: 'Not claimed',
      impact: 'ChatGPT pulls 87% of its local business data from Bing. If you don\'t exist in Bing Places, you don\'t exist in ChatGPT. Same with Foursquare — it feeds multiple AI models.',
      points: '+14 pts',
      color: '#EF4444',
      action: 'We\'ll claim and fully optimize both profiles with your positioning copy.',
    },
    {
      title: 'Google Business + Website Schema',
      status: '11 reviews · No AI-readable structure',
      impact: 'Your GBP is active but your website has no schema markup — the structured data that helps Google AI understand who you are, where you work, and what you specialize in.',
      points: '+10 pts',
      color: '#D4A830',
      action: 'We\'ll build your satellite site with full RealEstateAgent schema and connect it to your GBP.',
    },
    {
      title: 'Your Platforms Don\'t Match',
      status: '4 different locations listed across profiles',
      impact: 'Yelp says Del Mar. Zillow says La Jolla. LinkedIn says Carlsbad. GBP says Carmel Valley. AI cross-checks your platforms — when every profile says a different city, it can\'t confidently connect them as one person.',
      points: '+10 pts',
      color: '#EF4444',
      action: 'We\'ll align every platform to tell the same story: Carmel Valley · Carlsbad · Rancho Santa Fe.',
    },
  ],
  markets: [
    {
      name: 'Carmel Valley',
      tier: 'primary' as const,
      volume: '$44.8M',
      txnCount: '11',
      competitor: 'Felicia Lewis',
      competitorBrokerage: 'Felicia Lewis Group',
      competitorScore: '~55',
      aiSignal: 'AI recommends agents here 8x per query — but never mentions you',
      neighborhoods: [
        { name: 'Rancho Pacifica', aiRecognized: true, txnCount: 8, source: 'MLS' },
        { name: 'Pacific Highlands Ranch', aiRecognized: true, source: 'PRISM' },
        { name: 'Whispering Woods', aiRecognized: false, txnCount: 2, source: 'MLS' },
        { name: 'Torrey Hills', aiRecognized: true, source: 'PRISM' },
        { name: 'Del Mar Mesa', aiRecognized: false, source: 'Intake' },
      ],
    },
    {
      name: 'Carlsbad',
      tier: 'secondary' as const,
      volume: '$10.0M',
      txnCount: '6',
      competitor: 'Kurt Wannebo',
      competitorBrokerage: 'Wannebo Group',
      competitorScore: '~60',
      aiSignal: 'Competitive market — 5+ agents recommended regularly. Room to break in.',
      neighborhoods: [
        { name: 'La Costa', aiRecognized: true, txnCount: 3, source: 'MLS' },
        { name: 'Santalina', aiRecognized: false, source: 'Intake' },
        { name: 'Aviara', aiRecognized: true, source: 'PRISM' },
        { name: 'Bressi Ranch', aiRecognized: false, source: 'Intake' },
      ],
    },
    {
      name: 'Rancho Santa Fe',
      tier: 'growth' as const,
      volume: '$11.7M',
      txnCount: '3',
      competitor: 'Bree Bornstein',
      competitorBrokerage: 'Compass',
      competitorScore: '~45',
      aiSignal: 'Low AI coverage — fewer agents mentioned. Early mover advantage here.',
      neighborhoods: [
        { name: 'Del Mar Country Club', aiRecognized: true, txnCount: 1, source: 'MLS' },
        { name: 'Whispering Palms', aiRecognized: false, source: 'Intake' },
        { name: 'The Bridges', aiRecognized: true, source: 'PRISM' },
      ],
    },
  ] as MarketData[],
  trajectory: [
    {
      day: 'Today',
      score: '24',
      color: '#EF4444',
      actions: [
        'PRISM Scan complete — your baseline is documented',
        'Every gap identified with a specific fix',
      ],
    },
    {
      day: 'Day 30',
      score: '45–50',
      color: '#D4A830',
      actions: [
        'Bing Places + Foursquare claimed and optimized',
        'Yelp bio rewritten with market-specific positioning',
        'All platforms aligned to consistent location + specialty',
        'Satellite site live with full schema markup',
      ],
    },
    {
      day: 'Day 60',
      score: '55–65',
      color: '#D4A830',
      actions: [
        '2 articles published and syndicated across platforms',
        'Review acquisition strategy active — targeting 20+ on Yelp',
        'Bing Places fully indexed by ChatGPT',
        'First article appearing in AI responses',
      ],
    },
    {
      day: 'Day 90',
      score: '65–75',
      color: '#00BFA6',
      actions: [
        'Full platform coverage across all 12 AI-indexed platforms',
        'Monthly content rhythm established',
        'AI actively recommending you in discovery queries',
        'Earned media and citation momentum building',
      ],
    },
  ],
  deliverables: [
    { icon: '📝', title: '12 Platform Bios', desc: 'AI-optimized copy for every platform that feeds recommendations — written from your positioning, not generic templates.' },
    { icon: '🌐', title: 'Your Satellite Website', desc: 'A dedicated AI-optimized site with full schema markup — the signal that unlocks Google AI and Gemini recommendations.' },
    { icon: '📰', title: 'First Market Article', desc: 'A ghostwritten, data-backed article about your primary market — syndicated across platforms for maximum citation surface.' },
    { icon: '⭐', title: 'Review Strategy', desc: 'A targeted plan to build reviews on the platforms AI cares about most — starting with Yelp, then expanding.' },
    { icon: '📊', title: 'Monthly PRISM Re-Scans', desc: 'We re-run the full scan every 30 days to measure movement and adjust strategy based on what\'s working.' },
    { icon: '🔄', title: 'Ongoing Content & Freshness', desc: '2 articles per month after Month 1, GBP posts, platform updates — keeping your signals fresh so AI keeps recommending you.' },
  ],
};

/* ── Section connector component (Sugarman slippery slide) ── */
function SectionConnector({ text }: { text: string }) {
  return (
    <div style={{
      textAlign: 'center', padding: '24px 0', fontSize: '14px',
      color: '#94a3b8', fontStyle: 'italic',
    }}>
      {text}
    </div>
  );
}

/* ── Progress step indicator ── */
function ProgressIndicator({ currentStep }: { currentStep: number }) {
  const steps = ['Your Results', 'Approve Strategy', 'Positioning', 'Copy Kit'];
  return (
    <div style={{
      display: 'flex', justifyContent: 'center', gap: '8px',
      padding: '16px 24px', background: '#fff', borderBottom: '1px solid #f1f5f9',
    }}>
      {steps.map((step, i) => (
        <div key={step} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            opacity: i <= currentStep ? 1 : 0.4,
          }}>
            <div style={{
              width: '20px', height: '20px', borderRadius: '50%',
              background: i < currentStep ? '#00BFA6' : i === currentStep ? '#0A1929' : '#e2e8f0',
              color: '#fff', fontSize: '10px', fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {i < currentStep ? '✓' : i + 1}
            </div>
            <span style={{
              fontSize: '12px', fontWeight: i === currentStep ? 700 : 500,
              color: i === currentStep ? '#0A1929' : '#94a3b8',
            }}>{step}</span>
          </div>
          {i < steps.length - 1 && (
            <div style={{ width: '24px', height: '1px', background: '#e2e8f0' }} />
          )}
        </div>
      ))}
    </div>
  );
}

function ResultsContent() {
  const [clientName, setClientName] = useState('');
  const [approved, setApproved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [recordId, setRecordId] = useState('');
  const [marketConfirms, setMarketConfirms] = useState<boolean[]>([false, false, false]);
  const [expandedMarket, setExpandedMarket] = useState<number | null>(null);
  const searchParams = useSearchParams();

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
        if (data.markets_approved) setApproved(true);
      }
    }
    setLoading(false);
  }

  function toggleMarket(index: number) {
    setMarketConfirms(prev => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  }

  function toggleExpandMarket(index: number) {
    setExpandedMarket(prev => prev === index ? null : index);
  }

  const allMarketsConfirmed = marketConfirms.every(Boolean);
  const confirmedCount = marketConfirms.filter(Boolean).length;

  async function handleApprove() {
    if (!recordId || !allMarketsConfirmed) return;
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
      <ProgressIndicator currentStep={0} />

      {/* ═══════════════════════════════════════════════
          SECTION 1: HERO — Celebrate the Client
          Dark hero, expanded stats grid (6 stats)
          ═══════════════════════════════════════════════ */}
      <div style={{ background: '#0A1929', padding: '48px 24px 44px', textAlign: 'center' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <div style={{
            fontSize: '12px', color: '#00BFA6', fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '16px',
          }}>
            Your PRISM Scan is Complete
          </div>
          <h1 style={{
            fontSize: '28px', fontWeight: 800, color: '#fff',
            lineHeight: 1.3, margin: '0 0 8px 0',
          }}>
            {firstName ? `${firstName}, here's what we found.` : "Here's what we found."}
          </h1>
          <p style={{
            fontSize: '14px', color: '#64748b', margin: '0 0 28px 0',
          }}>
            Based on {SCAN_DATA.queryCount} queries across {SCAN_DATA.modelCount} AI models · Scanned {SCAN_DATA.scanDate}
          </p>

          {/* Stats Grid — 6 stats, 3x2 */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
            gap: '10px', marginBottom: '28px',
          }}>
            {SCAN_DATA.stats.map((stat) => (
              <div key={stat.label} style={{
                background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '14px 10px',
              }}>
                <div style={{ fontSize: '24px', fontWeight: 900, color: '#00BFA6' }}>{stat.value}</div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>{stat.label}</div>
              </div>
            ))}
          </div>

          <p style={{ fontSize: '15px', color: '#94a3b8', lineHeight: 1.6, margin: 0, maxWidth: '540px', marginLeft: 'auto', marginRight: 'auto' }}>
            You&apos;re one of the most active luxury agents in North County San Diego.
            But when buyers ask AI who to call — your name doesn&apos;t come up.{' '}
            <span style={{ color: '#fff', fontWeight: 600 }}>Here&apos;s exactly why, and what we&apos;re going to do about it.</span>
          </p>
        </div>
      </div>
      <div style={{ height: '3px', background: 'linear-gradient(90deg, #00BFA6, #D4A830, #00BFA6)' }} />

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '40px 24px 32px' }}>

        {/* ═══════════════════════════════════════════════
            SECTION 2: THE GAP — Visual + Real AI Quote
            ═══════════════════════════════════════════════ */}
        <div style={{ marginBottom: '8px' }}>
          <div style={{
            fontSize: '11px', fontWeight: 700, color: '#00BFA6',
            textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px',
          }}>Section 1 · The Discovery Gap</div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0A1929', margin: '0 0 8px 0' }}>
            This is what AI tells buyers in Carmel Valley right now.
          </h2>
          <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 20px 0', lineHeight: 1.5 }}>
            We asked {SCAN_DATA.modelCount} AI models the same question a buyer would ask. Here&apos;s what came back.
          </p>

          {/* The AI Quote */}
          <div style={{
            background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px',
            padding: '20px', marginBottom: '16px',
          }}>
            <div style={{
              fontSize: '11px', fontWeight: 700, color: '#94a3b8',
              textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px',
            }}>
              We asked {SCAN_DATA.aiQuote.model}:
            </div>
            <div style={{
              fontSize: '15px', fontWeight: 600, color: '#0A1929',
              fontStyle: 'italic', marginBottom: '12px', lineHeight: 1.5,
            }}>
              &ldquo;{SCAN_DATA.aiQuote.query}&rdquo;
            </div>
            <div style={{
              background: '#f8f9fa', borderRadius: '8px', padding: '14px 16px',
              borderLeft: '3px solid #EF4444', fontSize: '14px', color: '#475569', lineHeight: 1.6,
            }}>
              &ldquo;{SCAN_DATA.aiQuote.response}&rdquo;
            </div>
            <div style={{
              marginTop: '10px', fontSize: '13px', color: '#EF4444', fontWeight: 600,
            }}>
              Your name did not appear in this response — or in any of the {SCAN_DATA.queryCount}+ discovery queries we ran.
            </div>
          </div>

          {/* Side by Side — Competitor vs Client */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div style={{
              background: '#fff', border: '2px solid #EF4444', borderRadius: '12px',
              padding: '20px 16px', textAlign: 'center',
            }}>
              <div style={{
                fontSize: '10px', color: '#EF4444', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px',
              }}>AI Recommends</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#0A1929' }}>Felicia Lewis</div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Felicia Lewis Group</div>
              <div style={{
                marginTop: '14px', background: '#fff5f5', borderRadius: '8px', padding: '8px',
                fontSize: '22px', fontWeight: 900, color: '#EF4444',
              }}>~55<span style={{ fontSize: '13px', color: '#94a3b8' }}>/100</span></div>
            </div>
            <div style={{
              background: '#fff', border: '2px solid #e2e8f0', borderRadius: '12px',
              padding: '20px 16px', textAlign: 'center',
            }}>
              <div style={{
                fontSize: '10px', color: '#94a3b8', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px',
              }}>Your Current Score</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#0A1929' }}>{firstName || 'You'}</div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Oppenheim Group</div>
              <div style={{
                marginTop: '14px', background: '#f8f9fa', borderRadius: '8px', padding: '8px',
                fontSize: '22px', fontWeight: 900, color: '#0A1929',
              }}>{SCAN_DATA.score}<span style={{ fontSize: '13px', color: '#94a3b8' }}>/100</span></div>
            </div>
          </div>

          <div style={{
            background: '#0A1929', color: '#fff', padding: '14px 20px', borderRadius: '8px',
            fontSize: '14px', fontWeight: 500, textAlign: 'center', lineHeight: 1.5,
          }}>
            AI knows who you are when asked directly. But when a buyer asks <em>&ldquo;who&apos;s the best agent in Carmel Valley?&rdquo;</em> — you&apos;re not in the answer.{' '}
            <span style={{ color: '#00BFA6', fontWeight: 700 }}>That&apos;s the gap CITED closes.</span>
          </div>
        </div>

        <SectionConnector text="So what IS working? More than you might think." />

        {/* ═══════════════════════════════════════════════
            SECTION 3: WHAT'S WORKING — Positive first
            Cialdini contrast: strengths → then gaps hit harder
            ═══════════════════════════════════════════════ */}
        <div style={{ marginBottom: '8px' }}>
          <div style={{
            fontSize: '11px', fontWeight: 700, color: '#00BFA6',
            textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px',
          }}>Section 2 · What&apos;s Working</div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0A1929', margin: '0 0 16px 0' }}>
            You&apos;re not starting from zero.
          </h2>

          {SCAN_DATA.strengths.map((item, i) => (
            <div key={i} style={{
              background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px',
              padding: '16px 20px', marginBottom: '10px',
              borderLeft: `4px solid ${item.color}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#0A1929' }}>{item.title}</div>
                <div style={{
                  background: '#f0fdf9', color: '#00BFA6', fontSize: '12px', fontWeight: 700,
                  padding: '3px 10px', borderRadius: '12px',
                }}>{item.score}</div>
              </div>
              <div style={{ fontSize: '13px', color: '#64748b', marginTop: '6px', lineHeight: 1.5 }}>
                {item.detail}
              </div>
            </div>
          ))}
        </div>

        <SectionConnector text="Now here's where the opportunity is." />

        {/* ═══════════════════════════════════════════════
            SECTION 4: WHERE THE GAPS ARE
            No sub-scores. Platform name + AI + action.
            ═══════════════════════════════════════════════ */}
        <div style={{ marginBottom: '8px' }}>
          <div style={{
            fontSize: '11px', fontWeight: 700, color: '#EF4444',
            textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px',
          }}>Section 3 · Where the Gaps Are</div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0A1929', margin: '0 0 8px 0' }}>
            4 gaps are keeping you out of AI recommendations.
          </h2>
          <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 16px 0', lineHeight: 1.5 }}>
            Each gap has a specific fix and a measurable impact on your Citation Score.
          </p>

          {SCAN_DATA.gaps.map((gap, i) => (
            <div key={i} style={{
              background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px',
              padding: '18px 20px', marginBottom: '10px',
              borderLeft: `4px solid ${gap.color}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#0A1929' }}>{gap.title}</div>
                <div style={{
                  background: '#f0fdf9', color: '#00BFA6', fontSize: '12px', fontWeight: 700,
                  padding: '3px 10px', borderRadius: '12px', whiteSpace: 'nowrap',
                }}>{gap.points}</div>
              </div>
              <div style={{ fontSize: '13px', color: '#EF4444', fontWeight: 600, marginTop: '6px' }}>
                {gap.status}
              </div>
              <div style={{ fontSize: '13px', color: '#64748b', marginTop: '6px', lineHeight: 1.5 }}>
                {gap.impact}
              </div>
              <div style={{
                marginTop: '10px', padding: '10px 14px', background: '#f0fdf9',
                borderRadius: '6px', fontSize: '13px', color: '#0A1929', lineHeight: 1.5,
              }}>
                <strong>What we do:</strong> {gap.action}
              </div>
            </div>
          ))}

          <div style={{
            background: '#0A1929', borderRadius: '8px', padding: '14px 20px',
            marginTop: '16px', textAlign: 'center',
          }}>
            <span style={{ fontSize: '14px', color: '#fff', fontWeight: 600 }}>
              Total recoverable points: <span style={{ color: '#00BFA6' }}>+46</span>
            </span>
            <span style={{ fontSize: '13px', color: '#64748b', marginLeft: '12px' }}>
              — enough to move you from {SCAN_DATA.score} to 65+ in 90 days
            </span>
          </div>
        </div>

        <SectionConnector text="Here's where we'll focus — and who you're up against in each market." />

        {/* ═══════════════════════════════════════════════
            SECTION 5: YOUR MARKETS — Interactive Approval
            Per-market: competitor, neighborhoods, AI signal
            ═══════════════════════════════════════════════ */}
        <div style={{ marginBottom: '8px' }}>
          <div style={{
            fontSize: '11px', fontWeight: 700, color: '#D4A830',
            textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px',
          }}>Section 4 · Your Market Strategy</div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0A1929', margin: '0 0 8px 0' }}>
            We recommend focusing on these 3 markets.
          </h2>
          <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 24px 0', lineHeight: 1.5 }}>
            Based on your transaction history and what AI currently sees. Review each market, then confirm below.
          </p>

          {SCAN_DATA.markets.map((market, idx) => {
            const tier = TIER_CONFIG[market.tier];
            const isConfirmed = approved || marketConfirms[idx];
            const isExpanded = expandedMarket === idx;

            return (
              <div key={market.name} style={{
                background: '#fff',
                border: `2px solid ${isConfirmed ? '#00BFA6' : tier.border}`,
                borderRadius: '12px', marginBottom: '16px',
                transition: 'border-color 0.3s',
                overflow: 'hidden',
              }}>
                {/* Card Header */}
                <div style={{ padding: '20px 20px 16px', position: 'relative' }}>
                  {/* Tier Badge */}
                  <div style={{
                    position: 'absolute', top: '-1px', left: '20px',
                    background: tier.color, color: '#fff', fontSize: '10px', fontWeight: 700,
                    padding: '4px 12px 4px', borderRadius: '0 0 8px 8px',
                    textTransform: 'uppercase', letterSpacing: '1px',
                  }}>
                    {tier.icon} {tier.label}
                  </div>

                  {/* Approve toggle */}
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

                  <div style={{ marginTop: '16px' }}>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#0A1929' }}>{market.name}</div>

                    {/* Stats row */}
                    <div style={{
                      display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
                      gap: '10px', marginTop: '12px',
                    }}>
                      <div style={{ background: tier.bg, borderRadius: '8px', padding: '10px 12px' }}>
                        <div style={{ fontSize: '10px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Volume</div>
                        <div style={{ fontSize: '16px', fontWeight: 800, color: '#0A1929', marginTop: '2px' }}>{market.volume}</div>
                      </div>
                      <div style={{ background: tier.bg, borderRadius: '8px', padding: '10px 12px' }}>
                        <div style={{ fontSize: '10px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Transactions</div>
                        <div style={{ fontSize: '16px', fontWeight: 800, color: '#0A1929', marginTop: '2px' }}>{market.txnCount}</div>
                      </div>
                      <div style={{ background: tier.bg, borderRadius: '8px', padding: '10px 12px' }}>
                        <div style={{ fontSize: '10px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Top Competitor</div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#0A1929', marginTop: '2px' }}>{market.competitor}</div>
                        <div style={{ fontSize: '10px', color: '#94a3b8' }}>{market.competitorScore}/100</div>
                      </div>
                    </div>

                    {/* AI Signal */}
                    <div style={{
                      marginTop: '10px', fontSize: '13px', color: '#475569', lineHeight: 1.5,
                      padding: '8px 12px', background: '#f8f9fa', borderRadius: '6px',
                    }}>
                      <strong style={{ color: '#0A1929' }}>AI Signal:</strong> {market.aiSignal}
                    </div>

                    {/* Expand toggle for neighborhoods */}
                    <button onClick={() => toggleExpandMarket(idx)} style={{
                      marginTop: '10px', background: 'none', border: 'none',
                      fontSize: '13px', color: '#00BFA6', fontWeight: 600,
                      cursor: 'pointer', padding: '4px 0',
                    }}>
                      {isExpanded ? '▾ Hide neighborhoods' : '▸ View neighborhoods AI recognizes'}
                    </button>
                  </div>
                </div>

                {/* Neighborhoods — expandable */}
                {isExpanded && (
                  <div style={{
                    borderTop: '1px solid #f1f5f9', padding: '16px 20px',
                    background: '#fafbfc',
                  }}>
                    <div style={{
                      fontSize: '12px', fontWeight: 700, color: '#0A1929',
                      textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px',
                    }}>
                      Neighborhoods
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {market.neighborhoods.map((hood) => (
                        <div key={hood.name} style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '8px 12px', background: '#fff', borderRadius: '6px',
                          border: '1px solid #e2e8f0',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                              width: '18px', height: '18px', borderRadius: '50%',
                              background: hood.aiRecognized ? '#f0fdf9' : '#fff5f5',
                              color: hood.aiRecognized ? '#00BFA6' : '#EF4444',
                              fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontWeight: 700, border: `1px solid ${hood.aiRecognized ? '#00BFA6' : '#EF4444'}`,
                            }}>
                              {hood.aiRecognized ? '✓' : '✗'}
                            </div>
                            <span style={{ fontSize: '13px', fontWeight: 600, color: '#0A1929' }}>{hood.name}</span>
                            {hood.txnCount && (
                              <span style={{ fontSize: '11px', color: '#94a3b8' }}>({hood.txnCount} txns)</span>
                            )}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{
                              fontSize: '10px', fontWeight: 600, color: '#94a3b8',
                              background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px',
                            }}>{hood.source}</span>
                            <span style={{
                              fontSize: '11px', fontWeight: 600,
                              color: hood.aiRecognized ? '#00BFA6' : '#EF4444',
                            }}>
                              {hood.aiRecognized ? 'AI Recognizes' : 'Not in AI'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p style={{
                      fontSize: '12px', color: '#94a3b8', marginTop: '10px', marginBottom: 0, lineHeight: 1.4,
                    }}>
                      Neighborhoods marked &ldquo;Not in AI&rdquo; are where we&apos;ll focus your content strategy — building the signals that put you on the map in these areas.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <SectionConnector text="Here's exactly what happens over the next 90 days — and when." />

        {/* ═══════════════════════════════════════════════
            SECTION 6: 90-DAY PATH — Vertical Timeline
            Actions per milestone, not just scores
            ═══════════════════════════════════════════════ */}
        <div style={{ marginBottom: '8px' }}>
          <div style={{
            fontSize: '11px', fontWeight: 700, color: '#0A1929',
            textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px',
          }}>Section 5 · Your 90-Day Path</div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0A1929', margin: '0 0 20px 0' }}>
            From {SCAN_DATA.score} to 65+ — here&apos;s how we get there.
          </h2>

          <div style={{ position: 'relative', paddingLeft: '32px' }}>
            {/* Vertical line */}
            <div style={{
              position: 'absolute', left: '11px', top: '0', bottom: '0',
              width: '2px', background: 'linear-gradient(180deg, #EF4444, #D4A830, #00BFA6)',
            }} />

            {SCAN_DATA.trajectory.map((milestone, i) => (
              <div key={milestone.day} style={{
                position: 'relative', marginBottom: i < SCAN_DATA.trajectory.length - 1 ? '24px' : '0',
              }}>
                {/* Dot */}
                <div style={{
                  position: 'absolute', left: '-32px', top: '2px',
                  width: '24px', height: '24px', borderRadius: '50%',
                  background: i === 0 ? milestone.color : '#fff',
                  border: `3px solid ${milestone.color}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {i === 0 && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff' }} />}
                </div>

                <div style={{
                  background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px',
                  padding: '16px 20px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#0A1929' }}>{milestone.day}</div>
                    <div style={{
                      fontSize: '18px', fontWeight: 900, color: milestone.color,
                    }}>{milestone.score}<span style={{ fontSize: '12px', color: '#94a3b8' }}>/100</span></div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {milestone.actions.map((action, j) => (
                      <div key={j} style={{
                        display: 'flex', alignItems: 'flex-start', gap: '8px',
                        fontSize: '13px', color: '#475569', lineHeight: 1.4,
                      }}>
                        <span style={{ color: '#00BFA6', fontWeight: 700, flexShrink: 0 }}>→</span>
                        {action}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{
            background: '#f0fdf9', borderRadius: '8px', padding: '14px 16px',
            fontSize: '14px', color: '#0A1929', textAlign: 'center', marginTop: '20px',
            border: '1px solid #00BFA6',
          }}>
            <strong>Citation Guarantee™:</strong> +20 points in 90 days or you owe nothing. Ever.
          </div>
        </div>

        <SectionConnector text="And here's everything we're building for you." />

        {/* ═══════════════════════════════════════════════
            SECTION 7: WHAT WE'LL BUILD — Deliverables
            Value stack in action — specific, not dollar amounts
            ═══════════════════════════════════════════════ */}
        <div style={{ marginBottom: '8px' }}>
          <div style={{
            fontSize: '11px', fontWeight: 700, color: '#00BFA6',
            textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px',
          }}>Section 6 · What We&apos;ll Build For You</div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0A1929', margin: '0 0 16px 0' }}>
            Your founding package includes everything below.
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {SCAN_DATA.deliverables.map((item, i) => (
              <div key={i} style={{
                background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px',
                padding: '16px',
              }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>{item.icon}</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#0A1929', marginBottom: '4px' }}>{item.title}</div>
                <div style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.5 }}>{item.desc}</div>
              </div>
            ))}
          </div>

          <div style={{
            background: '#0A1929', borderRadius: '8px', padding: '14px 20px',
            marginTop: '16px', textAlign: 'center', fontSize: '14px', color: '#94a3b8',
          }}>
            Total value if purchased separately: <span style={{ color: '#D4A830', fontWeight: 700 }}>$13,100+/year</span>
            <br />
            <span style={{ color: '#fff', fontWeight: 700 }}>Founding member price: $0 for 90 days → $800/month</span>
          </div>
        </div>

        <SectionConnector text="Ready? One step to kick this off." />

        {/* ═══════════════════════════════════════════════
            SECTION 8: APPROVE
            Markets must be confirmed first
            ═══════════════════════════════════════════════ */}
        {!approved ? (
          <div style={{ marginBottom: '32px' }}>
            <div style={{
              fontSize: '11px', fontWeight: 700, color: '#0A1929',
              textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px',
            }}>Final Step · Approve Your Strategy</div>

            {/* What Happens Next */}
            <div style={{
              background: '#f8f9fa', borderRadius: '10px', padding: '20px 24px', marginBottom: '20px',
            }}>
              <div style={{
                fontSize: '13px', fontWeight: 700, color: '#0A1929', marginBottom: '14px',
                textTransform: 'uppercase', letterSpacing: '0.5px',
              }}>What happens when you approve</div>
              {[
                { num: '1', title: 'Your positioning statement arrives within 24 hours', desc: 'Written from this scan + your intake — the foundation for all your copy.' },
                { num: '2', title: 'We start building your 12 platform bios', desc: 'AI-optimized copy for every platform that feeds recommendations.' },
                { num: '3', title: 'Your satellite site + first article begin production', desc: 'The two highest-impact deliverables start immediately.' },
              ].map((step, i) => (
                <div key={step.num} style={{ display: 'flex', gap: '12px', marginBottom: i < 2 ? '12px' : 0 }}>
                  <div style={{
                    width: '24px', height: '24px', minWidth: '24px', background: '#00BFA6', borderRadius: '50%',
                    textAlign: 'center', lineHeight: '24px', color: '#fff', fontSize: '12px', fontWeight: 700,
                  }}>{step.num}</div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#0A1929' }}>{step.title}</div>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Market confirmation status */}
            {!allMarketsConfirmed && (
              <div style={{
                background: '#fffdf5', border: '1px solid #D4A830', borderRadius: '8px',
                padding: '12px 16px', marginBottom: '12px', textAlign: 'center',
                fontSize: '13px', color: '#0A1929',
              }}>
                ☝️ Scroll up and confirm each market before approving.{' '}
                <strong>{confirmedCount}/3 markets confirmed.</strong>
              </div>
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
                : `Confirm All 3 Markets to Continue (${confirmedCount}/3)`}
            </button>
          </div>
        ) : (
          <div style={{
            background: '#0A1929', borderRadius: '12px', padding: '32px', textAlign: 'center', marginBottom: '32px',
          }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>🚀</div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', margin: '0 0 8px 0' }}>
              Strategy Approved — We&apos;re On It
            </h3>
            <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0, lineHeight: 1.6 }}>
              Your positioning statement will arrive within 24 hours.{' '}
              Your 12 platform bios and satellite site are in production. The building starts now.
            </p>
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
