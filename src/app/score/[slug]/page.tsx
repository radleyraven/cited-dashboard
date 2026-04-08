import { notFound } from 'next/navigation';

type Gap = {
  platform: string;
  status: string;
  impact: 'High' | 'Medium' | 'Low';
  points: number;
};

type ProspectData = {
  name: string;
  brokerage: string;
  market: string;
  score: number;
  competitorScore: number;
  gaps: Gap[];
};

// Score page prospects — add each prospect before sending cold email
// Projected score protocol: current score + platform gap points. Target range 62-68. Never show 80+.
// A/B test: [slug] = Version A ("AI visibility"), [slug]-b = Version B ("AI Citation Optimization")
// Track via Vercel Analytics — whichever slug gets more intake form clicks wins.

// Pre-fill data — what we know from the audit before Maria ever fills the form
const prefillData: Record<string, Record<string, string>> = {
  'maria-santos': {
    fullName: 'Maria Santos',
    email: 'rrmacmini@gmail.com',
    brokerage: 'Compass',
    primaryMarkets: 'Carlsbad, Encinitas, Solana Beach',
    zillowUrl: 'https://zillow.com/profile/mariasantos',
    linkedinUrl: 'https://linkedin.com/in/maria-santos-realtor',
    realtorUrl: 'https://realtor.com/realestateagents/maria-santos',
    yearsInMarket: '7',
    topTransactions: 'Approx. $48M career volume across Carlsbad/Encinitas',
    hideMLSUpload: 'true', // CA agent — Radley pulls MLS data directly from SDMLS/CRMLS
  },
  'radley-raven': {
    fullName: 'Radley Raven',
    email: 'radleyraven@gmail.com',
    brokerage: 'The Oppenheim Group',
    primaryMarkets: 'Carmel Valley, Carlsbad, Rancho Santa Fe',
    zillowUrl: 'https://www.zillow.com/profile/radleyraven',
    linkedinUrl: 'https://www.linkedin.com/in/radleyraven',
    realtorUrl: 'https://www.realtor.com/realestateagents/5c7d7904b05f40001240ee53',
    yearsInMarket: '10',
    topTransactions: '$91.7M career volume — 11 closed in Carmel Valley 92130',
    hideMLSUpload: 'true',
  },
  'travis-mcclain': {
    fullName: 'Travis McClain',
    email: '',
    brokerage: 'HomeSmart',
    primaryMarkets: 'Carlsbad, Encinitas, Oceanside',
    zillowUrl: 'https://www.zillow.com/profile/travis076',
    linkedinUrl: '',
    realtorUrl: '',
    yearsInMarket: '10',
    topTransactions: 'Carlsbad specialist — McClain Real Estate Group',
    hideMLSUpload: 'true',
  },
  'adam-loew': {
    fullName: 'Adam Loew',
    email: '',
    brokerage: 'Keller Williams',
    primaryMarkets: 'Carmel Valley, Del Mar, Rancho Santa Fe',
    zillowUrl: '',
    linkedinUrl: '',
    realtorUrl: 'https://www.kw.com/kw/agent/adamloew',
    yearsInMarket: '15',
    topTransactions: '#1 Individual Agent KW Carmel Valley/Del Mar 2017-2018',
    hideMLSUpload: 'true',
  },
  'bree-bornstein': {
    fullName: 'Bree Bornstein',
    email: '',
    brokerage: 'Compass',
    primaryMarkets: 'Rancho Santa Fe, Coastal San Diego',
    zillowUrl: '',
    linkedinUrl: '',
    realtorUrl: '',
    yearsInMarket: '15',
    topTransactions: 'Top listing agent Ranch and Coastal San Diego — Compass top producer',
    hideMLSUpload: 'true',
  },
  'ashley-michael': {
    fullName: 'Ashley Michael',
    email: '',
    brokerage: 'Pointe3 Real Estate',
    primaryMarkets: 'Seattle, Ballard, Blue Ridge',
    zillowUrl: '',
    linkedinUrl: '',
    realtorUrl: '',
    yearsInMarket: '15',
    topTransactions: 'Managing Broker + Principal Broker OR — Pointe3 co-founder',
    hideMLSUpload: 'true',
  },
  'alexa-devaney': {
    fullName: 'Alexa Devaney',
    email: '',
    brokerage: 'The Oppenheim Group',
    primaryMarkets: 'La Jolla, San Diego',
    zillowUrl: '',
    linkedinUrl: 'https://www.linkedin.com/in/alexa-devaney-77a348130/',
    realtorUrl: '',
    yearsInMarket: '5',
    topTransactions: 'Luxury sales — The Oppenheim Group San Diego',
    hideMLSUpload: 'true',
  },
  'raquel-abrams': {
    fullName: 'Raquel Abrams',
    email: '',
    brokerage: 'The Oppenheim Group',
    primaryMarkets: 'Del Mar, La Jolla, Carmel Valley',
    zillowUrl: '',
    linkedinUrl: '',
    realtorUrl: '',
    yearsInMarket: '8',
    topTransactions: 'Del Mar and coastal San Diego specialist — born and raised in Del Mar',
    hideMLSUpload: 'true',
  },
};

const prospects: Record<string, ProspectData> = {
  'maria-santos': {
    name: 'Maria Santos',
    brokerage: 'Compass',
    market: 'Carlsbad',
    score: 18,
    competitorScore: 47,
    gaps: [
      // Standard top 3: GBP + LinkedIn Profile + Zillow — always the core for RE agents
      { platform: 'Google Business Profile', status: 'missing', impact: 'High', points: 14 },
      { platform: 'LinkedIn Profile Optimization', status: 'unoptimized', impact: 'High', points: 10 },
      { platform: 'Zillow Bio Optimization', status: 'unoptimized', impact: 'Medium', points: 8 },
      // Wildcard: highest-impact item from audit (varies by prospect)
      { platform: 'LinkedIn Articles', status: 'missing', impact: 'Medium', points: 7 },
      // Additional optimizations (shown as summary)
      { platform: 'Yelp Profile (Tier 1 — AI citation driver)', status: 'missing', impact: 'Low', points: 8 },
      { platform: 'Google Reviews (keyword-rich)', status: 'missing', impact: 'Low', points: 5 },
      { platform: 'FastExpert', status: 'missing', impact: 'Low', points: 4 },
      { platform: 'Bing Places', status: 'missing', impact: 'Low', points: 4 },
      { platform: 'Apple Business Connect', status: 'missing', impact: 'Low', points: 3 },
      { platform: 'GBP Posts (freshness)', status: 'missing', impact: 'Low', points: 3 },
    ],
  },
  'radley-raven': {
    name: 'Radley Raven',
    brokerage: 'The Oppenheim Group',
    market: 'Carmel Valley',
    score: 3,
    competitorScore: 65,
    gaps: [
      { platform: 'Google Business Profile', status: 'unoptimized', impact: 'High', points: 14 },
      { platform: 'LinkedIn Profile Optimization', status: 'unoptimized', impact: 'High', points: 10 },
      { platform: 'Yelp Profile', status: 'missing', impact: 'High', points: 12 },
      { platform: 'Zillow Bio Optimization', status: 'unoptimized', impact: 'Medium', points: 8 },
      { platform: 'LinkedIn Articles', status: 'partial', impact: 'Medium', points: 7 },
      { platform: 'FastExpert Profile', status: 'missing', impact: 'Low', points: 4 },
      { platform: 'Bing Places', status: 'claimed', impact: 'Low', points: 3 },
      { platform: 'Apple Business Connect', status: 'pending', impact: 'Low', points: 3 },
      { platform: 'Foursquare', status: 'missing', impact: 'Low', points: 4 },
      { platform: 'GBP Posts (freshness)', status: 'missing', impact: 'Low', points: 3 },
    ],
   'travis-mcclain': {
    name: 'Travis McClain',
    brokerage: 'HomeSmart',
    market: 'Carlsbad',
    score: 8,
    competitorScore: 52,
    gaps: [
      { platform: 'Google Business Profile', status: 'missing', impact: 'High', points: 14 },
      { platform: 'LinkedIn Profile Optimization', status: 'unoptimized', impact: 'High', points: 10 },
      { platform: 'Yelp Profile', status: 'missing', impact: 'High', points: 12 },
      { platform: 'Zillow Bio Optimization', status: 'unoptimized', impact: 'Medium', points: 8 },
      { platform: 'LinkedIn Articles', status: 'missing', impact: 'Medium', points: 7 },
      { platform: 'FastExpert', status: 'missing', impact: 'Low', points: 4 },
      { platform: 'Bing Places', status: 'missing', impact: 'Low', points: 4 },
      { platform: 'Apple Business Connect', status: 'missing', impact: 'Low', points: 3 },
      { platform: 'Foursquare', status: 'missing', impact: 'Low', points: 4 },
      { platform: 'GBP Posts (freshness)', status: 'missing', impact: 'Low', points: 3 },
    ],
  },
  'adam-loew': {
    name: 'Adam Loew',
    brokerage: 'Keller Williams',
    market: 'Carmel Valley',
    score: 22,
    competitorScore: 65,
    gaps: [
      { platform: 'Google Business Profile', status: 'unoptimized', impact: 'High', points: 14 },
      { platform: 'Yelp Profile', status: 'missing', impact: 'High', points: 12 },
      { platform: 'LinkedIn Articles', status: 'missing', impact: 'Medium', points: 7 },
      { platform: 'Zillow Bio Optimization', status: 'unoptimized', impact: 'Medium', points: 8 },
      { platform: 'FastExpert', status: 'missing', impact: 'Low', points: 4 },
      { platform: 'Foursquare', status: 'missing', impact: 'Low', points: 4 },
      { platform: 'GBP Posts (freshness)', status: 'missing', impact: 'Low', points: 3 },
    ],
  },
  'bree-bornstein': {
    name: 'Bree Bornstein',
    brokerage: 'Compass',
    market: 'Rancho Santa Fe',
    score: 38,
    competitorScore: 52,
    gaps: [
      { platform: 'Yelp Profile', status: 'missing', impact: 'High', points: 12 },
      { platform: 'LinkedIn Articles', status: 'missing', impact: 'Medium', points: 7 },
      { platform: 'Foursquare', status: 'missing', impact: 'Low', points: 4 },
      { platform: 'FastExpert', status: 'partial', impact: 'Low', points: 3 },
      { platform: 'GBP Posts (freshness)', status: 'unoptimized', impact: 'Low', points: 3 },
    ],
  },
  'ashley-michael': {
    name: 'Ashley Michael',
    brokerage: 'Pointe3 Real Estate',
    market: 'Seattle',
    score: 12,
    competitorScore: 48,
    gaps: [
      { platform: 'Google Business Profile', status: 'missing', impact: 'High', points: 14 },
      { platform: 'LinkedIn Profile Optimization', status: 'unoptimized', impact: 'High', points: 10 },
      { platform: 'Yelp Profile', status: 'missing', impact: 'High', points: 12 },
      { platform: 'Zillow Bio Optimization', status: 'unoptimized', impact: 'Medium', points: 8 },
      { platform: 'LinkedIn Articles', status: 'missing', impact: 'Medium', points: 7 },
      { platform: 'Foursquare', status: 'missing', impact: 'Low', points: 4 },
      { platform: 'GBP Posts (freshness)', status: 'missing', impact: 'Low', points: 3 },
    ],
  },
  'alexa-devaney': {
    name: 'Alexa Devaney',
    brokerage: 'The Oppenheim Group',
    market: 'La Jolla',
    score: 5,
    competitorScore: 42,
    gaps: [
      { platform: 'Google Business Profile', status: 'missing', impact: 'High', points: 14 },
      { platform: 'LinkedIn Profile Optimization', status: 'unoptimized', impact: 'High', points: 10 },
      { platform: 'Yelp Profile', status: 'missing', impact: 'High', points: 12 },
      { platform: 'Zillow Bio Optimization', status: 'unoptimized', impact: 'Medium', points: 8 },
      { platform: 'LinkedIn Articles', status: 'missing', impact: 'Medium', points: 7 },
      { platform: 'FastExpert', status: 'missing', impact: 'Low', points: 4 },
      { platform: 'Foursquare', status: 'missing', impact: 'Low', points: 4 },
      { platform: 'GBP Posts (freshness)', status: 'missing', impact: 'Low', points: 3 },
    ],
  },,
  'raquel-abrams': {
    name: 'Raquel Abrams',
    brokerage: 'The Oppenheim Group',
    market: 'Del Mar',
    score: 7,
    competitorScore: 45,
    gaps: [
      { platform: 'Google Business Profile', status: 'missing', impact: 'High', points: 14 },
      { platform: 'LinkedIn Profile Optimization', status: 'unoptimized', impact: 'High', points: 10 },
      { platform: 'Yelp Profile', status: 'missing', impact: 'High', points: 12 },
      { platform: 'Zillow Bio Optimization', status: 'unoptimized', impact: 'Medium', points: 8 },
      { platform: 'LinkedIn Articles', status: 'missing', impact: 'Medium', points: 7 },
      { platform: 'FastExpert', status: 'missing', impact: 'Low', points: 4 },
      { platform: 'Foursquare', status: 'missing', impact: 'Low', points: 4 },
      { platform: 'GBP Posts (freshness)', status: 'missing', impact: 'Low', points: 3 },
    ],
  },
};

function ScoreCirclecle({ score, color, size = 100 }: { score: number; color: string; size?: number }) {
  const r = (size / 2) - 8;
  const circumference = 2 * Math.PI * r;
  const filled = (score / 100) * circumference;
  const gap = circumference - filled;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
      {/* Track */}
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth="8" />
      {/* Progress */}
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={`${filled} ${gap}`}
      />
    </svg>
  );
}

export default async function ScorePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // Support A/B test: strip '-b' suffix to get prospect data
  const baseSlug = slug.endsWith('-b') ? slug.slice(0, -2) : slug;
  const isVariantB = slug.endsWith('-b');
  const prospect = prospects[baseSlug];
  if (!prospect) notFound();

  // Pre-fill URL params for intake form
  const prefill = prefillData[baseSlug] || {};
  const prefillParams = new URLSearchParams(prefill).toString();
  const intakeUrl = `https://citedagent.com/intake${prefillParams ? '?' + prefillParams : ''}`;

  const { name, brokerage, market, score, competitorScore, gaps } = prospect;
  const firstName = name.split(' ')[0];
  // Projected score protocol: floor at current+3, cap at 68, target 62-68 range
  const rawProjected = score + gaps.reduce((acc, g) => acc + g.points, 0);
  const projected90 = Math.min(Math.max(rawProjected, score + 3), 68);

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif' }}>

      {/* Header */}
      <header style={{ background: '#0A1929', padding: '20px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '5px', color: '#00BFA6' }}>CITED</div>
          <div style={{ fontSize: '10px', color: '#4a6380', letterSpacing: '1.5px', textTransform: 'uppercase', marginTop: '3px' }}>{isVariantB ? 'AI Citation Optimization for Professionals' : 'AI Visibility for Professionals'}</div>
        </div>
        <div style={{ fontSize: '11px', color: '#4a6380', textAlign: 'right' }}>
          Powered by <span style={{ color: '#00BFA6', fontWeight: 700 }}>PRISM™</span>
        </div>
      </header>

      {/* Gold accent line */}
      <div style={{ height: '3px', background: 'linear-gradient(90deg, #D4A830 0%, #00BFA6 100%)' }} />

      <main style={{ maxWidth: '660px', margin: '0 auto', padding: '36px 20px 48px' }}>

        {/* Intro + top CTA (convenience catch for already-converted visitors) */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0A1929', margin: '0 0 4px', lineHeight: 1.3 }}>
                {firstName}, here&apos;s your AI Visibility Score for {market}.
              </h1>
              <p style={{ fontSize: '13px', fontStyle: 'italic', color: '#00BFA6', fontWeight: 600, margin: '0 0 4px' }}>
                AI cites agents it already knows. We make sure it knows you.
              </p>
              <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
                {brokerage} · {market} · Generated {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            {/* Top text link — early convenience catch */}
            <a href={intakeUrl} style={{ flexShrink: 0, display: 'inline-block', color: '#00BFA6', fontWeight: 600, fontSize: '13px', textDecoration: 'none', alignSelf: 'center' }}>
              Ready to start? Claim your founding spot →
            </a>
          </div>
        </div>

        {/* Context block — sets up the score reveal */}
        <div style={{ background: '#0A1929', borderRadius: '12px', padding: '22px 24px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <div style={{ flexShrink: 0, marginTop: '2px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(0,191,166,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>⚡</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#D4A830', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '8px' }}>Why This Matters</div>
              <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.7, margin: 0 }}>
                Traditional Google rankings are no longer enough. AI tools — ChatGPT, Perplexity, Google AI Overviews, Gemini — are now the first stop for sellers and buyers researching agents in {market}. These systems don&apos;t rank websites the way Google used to. They <span style={{ color: '#fff', fontWeight: 600 }}>cite agents they already know</span>, from structured signals across 14+ platforms. Your Citation Score measures how visible and citable you are across all of them — and where the gaps are.
              </p>
            </div>
          </div>
        </div>

        {/* Score Circles */}
        <div style={{ background: '#fff', borderRadius: '14px', padding: '32px 28px', marginBottom: '20px', boxShadow: '0 1px 6px rgba(0,0,0,0.07)', border: '1px solid #e8edf2' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '28px' }}>
            Citation Score — {market}
          </div>

          {/* You vs Competitor */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', textAlign: 'center' }}>

            {/* Your score */}
            <div>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <ScoreCircle score={score} color="#dc2626" size={110} />
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: '#dc2626', lineHeight: 1 }}>{score}</div>
                  <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>of 100</div>
                </div>
              </div>
              <div style={{ marginTop: '10px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0A1929' }}>You</div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{name}</div>
              </div>
            </div>

            {/* Competitor */}
            <div>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <ScoreCircle score={competitorScore} color="#64748b" size={110} />
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: '#64748b', lineHeight: 1 }}>{competitorScore}</div>
                  <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>of 100</div>
                </div>
              </div>
              <div style={{ marginTop: '10px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0A1929' }}>Competitor</div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>Top {market} Agent</div>
              </div>
            </div>

          </div>

          {/* Gap between current and competitor */}
          <div style={{ marginTop: '24px', padding: '12px 16px', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca', textAlign: 'center' }}>
            <span style={{ fontSize: '13px', color: '#dc2626', fontWeight: 600 }}>
              You&apos;re {competitorScore - score} points behind the top competitor in {market}.
            </span>
          </div>

          {/* Section divider */}
          <div style={{ borderTop: '1px solid #e8edf2', margin: '24px 0 20px' }} />

          {/* 90-Day Target — With Cited by Day 90 */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#00BFA6', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '16px' }}>
              With Cited by Day 90
            </div>
            <div style={{ display: 'inline-block' }}>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <ScoreCircle score={projected90} color="#00BFA6" size={110} />
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: '#00BFA6', lineHeight: 1 }}>{projected90}</div>
                  <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>of 100</div>
                </div>
              </div>
              <div style={{ marginTop: '10px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#00BFA6' }}>90-Day Target</div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>With Cited</div>
              </div>
            </div>
          </div>
        </div>

        {/* Gaps + Projected breakdown */}
        <div style={{ background: '#fff', borderRadius: '14px', padding: '28px', marginBottom: '20px', boxShadow: '0 1px 6px rgba(0,0,0,0.07)', border: '1px solid #e8edf2' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '16px' }}>
            What&apos;s Holding Your Score Back
          </div>

          {/* Show top 4 gaps prominently: GBP + LinkedIn Profile + Zillow + wildcard */}
          {gaps.filter(g => g.impact === 'High' || g.impact === 'Medium').slice(0, 4).map((gap, i) => (
            <div key={i} style={gap.impact === 'High' ? {
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 14px', marginBottom: '8px', borderRadius: '4px',
              borderLeft: '4px solid #EF4444', background: '#fff5f5',
            } : {
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 14px', marginBottom: '8px', borderRadius: '4px',
              border: '1px solid #e8edf2', background: '#f8f9fa',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
                  background: gap.impact === 'High' ? '#EF4444' : '#94a3b8'
                }} />
                <span style={{ fontSize: '14px', color: '#1a1a2e', fontWeight: 500 }}>{gap.platform}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '13px', color: '#00BFA6', fontWeight: 700 }}>+{gap.points} pts</span>
                <span style={{
                  fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px',
                  color: gap.impact === 'High' ? '#EF4444' : '#64748b',
                  background: gap.impact === 'High' ? '#fef2f2' : '#f1f5f9'
                }}>
                  {gap.impact} Impact
                </span>
              </div>
            </div>
          ))}
          {/* Additional gaps summary */}
          {gaps.filter(g => g.impact === 'Low').length > 0 && (
            <div style={{ padding: '12px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0, background: '#94a3b8' }} />
                <span style={{ fontSize: '13px', color: '#64748b' }}>
                  +{gaps.filter(g => g.impact === 'Low').length} additional optimizations
                </span>
              </div>
              <span style={{ fontSize: '13px', color: '#00BFA6', fontWeight: 700 }}>
                +{gaps.filter(g => g.impact === 'Low').reduce((a, g) => a + g.points, 0)} pts
              </span>
            </div>
          )}

          {/* Projected math */}
          <div style={{ marginTop: '16px', padding: '14px 16px', background: '#f0fdf9', borderRadius: '8px', border: '1px solid #99f6e4' }}>
            <div style={{ fontSize: '12px', color: '#0f766e', fontWeight: 600 }}>
              Your score: {score} + {gaps.reduce((a, g) => a + g.points, 0)} points from closing these gaps = <strong>{projected90}/100 in 90 days</strong>
            </div>
          </div>

          {/* Primary CTA — right after gap analysis */}
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <a href={intakeUrl} style={{ display: 'inline-block', background: '#00BFA6', color: '#fff', fontWeight: 700, fontSize: '15px', padding: '14px 32px', borderRadius: '8px', textDecoration: 'none', letterSpacing: '0.3px' }}>
              Claim My Founding Spot →
            </a>
          </div>
        </div>

        {/* How Cited Works */}
        <div style={{ background: '#0A1929', borderRadius: '14px', padding: '28px', marginBottom: '20px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#D4A830', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '16px' }}>
            How Cited Closes the Gap
          </div>
          {[
            { icon: '→', text: 'We handle 87% of the work. You provide ~30 minutes to get started, 15 minutes per month after that.' },
            { icon: '→', text: 'Full platform optimization — GBP, FastExpert, LinkedIn, and more.' },
            { icon: '→', text: 'Monthly AI-optimized articles published under your name.' },
            { icon: '→', text: 'PRISM re-scans every 30 days so you can see the score move.' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: i < 3 ? '12px' : 0, alignItems: 'flex-start' }}>
              <span style={{ color: '#00BFA6', fontWeight: 700, flexShrink: 0 }}>{item.icon}</span>
              <span style={{ fontSize: '14px', color: '#94a3b8', lineHeight: 1.6 }}>{item.text}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ background: '#fff', borderRadius: '14px', padding: '32px 28px', textAlign: 'center', boxShadow: '0 1px 6px rgba(0,0,0,0.07)', border: '1px solid #e8edf2' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#D4A830', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '12px' }}>
            Founding Client Offer
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0A1929', margin: '0 0 8px' }}>
            First 90 days free. Protected by The Citation Guarantee™.
          </h2>
          <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 24px', lineHeight: 1.6 }}>
            3–5 founding spots available in North County San Diego.<br />
            After 90 days, continue at $800/month — only if the score moved.
          </p>

          {/* Primary — pre-filled with audit data */}
          <a href={intakeUrl} style={{ display: 'block', background: '#00BFA6', color: '#fff', fontWeight: 700, fontSize: '15px', padding: '15px 36px', borderRadius: '8px', textDecoration: 'none', letterSpacing: '0.3px', marginBottom: '10px' }}>
            Claim My Founding Spot →
          </a>

          {/* Secondary — Learn More (swapped) */}
          <a href="/how-it-works" style={{ display: 'block', background: '#fff', color: '#0A1929', fontWeight: 600, fontSize: '14px', padding: '13px 36px', borderRadius: '8px', textDecoration: 'none', border: '1.5px solid #e2e8f0', marginBottom: '10px' }}>
            Learn More About How Cited Works
          </a>

          {/* Tertiary — Book a Call (demoted to text link) */}
          <a href="https://calendly.com/radleyraven/cited" style={{ display: 'block', fontSize: '13px', color: '#64748b', fontWeight: 600, textDecoration: 'none', padding: '6px 0' }}>
            Prefer to talk first? Book a 15-min call →
          </a>

          <p style={{ fontSize: '12px', color: '#94a3b8', margin: '12px 0 0' }}>Questions? Reply directly to Radley&apos;s email.</p>
        </div>

        <div style={{ textAlign: 'center', marginTop: '28px', fontSize: '11px', color: '#94a3b8', lineHeight: 2 }}>
          <div style={{ marginBottom: '6px' }}>
            <a href="/privacy" style={{ color: '#64748b', textDecoration: 'none', marginRight: '16px' }}>Privacy Policy</a>
            <a href="/terms" style={{ color: '#64748b', textDecoration: 'none' }}>Terms of Service</a>
          </div>
          Cited · AI Visibility for Professionals · citedagent.com
          <br />
          <span style={{ color: '#cbd5e1' }}>Powered by PRISM™ · Professional Recognition Index for Search Models</span>
        </div>
      </main>
    </div>
  );
}
