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
// A/B test: [slug] = Version A ("AI visibility"), [slug]-b = Version B ("AI Citation Optimization™")
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
  'sanjay-solomon': {
    fullName: 'Sanjay Solomon',
    email: '',
    brokerage: 'Exude Luxury Group',
    primaryMarkets: 'La Jolla, Rancho Santa Fe, Coastal San Diego',
    zillowUrl: '',
    linkedinUrl: '',
    realtorUrl: 'https://www.compass.com/agents/sanjay-solomon/',
    yearsInMarket: '10',
    topTransactions: 'International marketing background + luxury RE — La Jolla specialist',
    hideMLSUpload: 'true',
  },
  'nic-lind': {
    fullName: 'Nic Lind',
    email: '',
    brokerage: 'Commencement Bay Brokers',
    primaryMarkets: 'Tacoma, Gig Harbor, Western Washington',
    zillowUrl: '',
    linkedinUrl: '',
    realtorUrl: '',
    yearsInMarket: '10',
    topTransactions: 'Principal broker serving all of Western Washington',
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
    score: 5,
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
  },
  'travis-mcclain': {
    name: 'Travis McClain',
    brokerage: 'HomeSmart',
    market: 'Carlsbad',
    score: 12,
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
    score: 15,
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
    score: 35,
    competitorScore: 62,
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
    score: 18,
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
    competitorScore: 68,
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
  'raquel-abrams': {
    name: 'Raquel Abrams',
    brokerage: 'The Oppenheim Group',
    market: 'Del Mar',
    score: 18,
    competitorScore: 55,
    gaps: [
      { platform: 'Google Business Profile', status: 'missing', impact: 'High', points: 14 },
      { platform: 'LinkedIn Profile Optimization', status: 'unoptimized', impact: 'High', points: 10 },
      { platform: 'Yelp Profile (listed — not optimized)', status: 'unoptimized', impact: 'High', points: 8 },
      { platform: 'Zillow Bio Optimization', status: 'unoptimized', impact: 'Medium', points: 8 },
      { platform: 'LinkedIn Articles', status: 'missing', impact: 'Medium', points: 7 },
      { platform: 'FastExpert', status: 'missing', impact: 'Low', points: 4 },
      { platform: 'Foursquare', status: 'missing', impact: 'Low', points: 4 },
      { platform: 'GBP Posts (freshness)', status: 'missing', impact: 'Low', points: 3 },
    ],
  },
  'sanjay-solomon': {
    name: 'Sanjay Solomon',
    brokerage: 'Exude Luxury Group',
    market: 'La Jolla',
    score: 10,
    competitorScore: 68,
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
  'nic-lind': {
    name: 'Nic Lind',
    brokerage: 'Commencement Bay Brokers',
    market: 'Tacoma',
    score: 8,
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
  },
};

/* ── Design tokens (matched to Citation Report v9 / Cited Design System) ── */
const D = {
  navy: '#0A1929',
  teal: '#00BFA6',
  red: '#EF4444',
  gold: '#D4A830',
  grayBg: '#f8f9fa',
  grayMid: '#f1f5f9',
  textPrimary: '#0A1929',
  textSecondary: '#475569',
  textTertiary: '#94a3b8',
  border: '#e2e8f0',
};

export default async function ScorePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const baseSlug = slug.endsWith('-b') ? slug.slice(0, -2) : slug;
  const prospect = prospects[baseSlug];
  if (!prospect) notFound();

  const { name, brokerage, market, score, competitorScore } = prospect;
  const firstName = name.split(' ')[0];
  const competitorSizePx = Math.round(64 * (competitorScore / 100));
  const clientPct = (score / 100) * 100;
  const competitorPct = (competitorScore / 100) * 100;
  const gap = competitorScore - score;
  // Citation Report URL — token-based when available, slug-based fallback
  const reportUrl = `https://citedagent.com/onboarding/results`;

  const visibilityRate = Math.round((score / 100) * 12);
  const benchmarkRate = 76;
  const scoreComponents = [
    { name: 'Platform Presence', weight: 20 },
    { name: 'Recommendation Readiness', weight: 15 },
    { name: 'Explanation Readiness', weight: 15 },
    { name: 'Brand Search Volume', weight: 10 },
    { name: 'Earned Media', weight: 10 },
    { name: 'Entity Consistency', weight: 10 },
    { name: 'Specialization Clarity', weight: 10 },
    { name: 'Content Freshness', weight: 5 },
    { name: 'Schema/Structured Data', weight: 5 },
  ];

  return (
    <div style={{ minHeight: '100vh', background: D.grayBg, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif' }}>
      <style>{`details > summary { list-style: none; } details > summary::-webkit-details-marker { display: none; }`}</style>

      {/* ═══ HEADER ═══ */}
      <header style={{ background: D.navy, padding: '24px 32px', textAlign: 'center' }}>
        <div style={{ fontSize: '24px', fontWeight: 900, color: '#ffffff', letterSpacing: '2px', marginBottom: '4px' }}>CITED</div>
        <div style={{ fontSize: '10px', fontWeight: 600, color: D.teal, textTransform: 'uppercase', letterSpacing: '2.5px' }}>AI Citation Optimization™</div>
      </header>

      {/* Gradient bar */}
      <div style={{ height: '3px', background: `linear-gradient(90deg, ${D.teal}, ${D.gold}, ${D.teal})` }} />

      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px 48px' }}>

        {/* ═══ PERSONALIZATION HEADER ═══ */}
        <div style={{ paddingTop: '40px', marginBottom: '8px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: D.navy, margin: '0 0 4px', lineHeight: 1.3 }}>
            {firstName}, here&apos;s your Foundation Score.
          </h1>
          <p style={{ fontSize: '13px', color: D.textTertiary, margin: 0 }}>
            {brokerage} · {market} · Generated {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {/* ═══ CONTEXT BLOCK (Research-validated 4-sentence copy) ═══ */}
        <div style={{ background: D.navy, borderRadius: '12px', padding: '24px', marginBottom: '32px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: D.gold, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '10px' }}>
            What This Measures
          </div>
          <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: 1.7, margin: 0 }}>
            Sellers in your market are using AI — ChatGPT, Perplexity, Google AI Overviews — to search for real estate agents by name, market, and specialty. Unlike Google, AI doesn&apos;t rank websites. It <span style={{ color: '#fff', fontWeight: 600 }}>cites agents it already knows</span>, from structured signals across 12 platforms. Your Citation Score measures how visible and citable you are in those AI searches — and where the gaps are.
          </p>
        </div>

        {/* ═══ SCORE CARD — THE DOMINANT ELEMENT ═══ */}
        <div style={{ background: '#fff', borderRadius: '14px', overflow: 'hidden', marginBottom: '32px', boxShadow: '0 4px 24px rgba(0,0,0,0.10)' }}>

          {/* Score gradient scale */}
          <div style={{ padding: '20px 24px 16px', borderBottom: `1px solid ${D.grayMid}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: D.textTertiary, textTransform: 'uppercase', letterSpacing: '1.5px' }}>Foundation Score™</div>
              <div style={{ fontSize: '10px', color: D.textTertiary, background: D.grayBg, padding: '3px 8px', borderRadius: '4px' }}>PRISM Scan™ · {market}</div>
            </div>
            <div style={{ position: 'relative', height: '8px', borderRadius: '4px', background: `linear-gradient(90deg, ${D.red} 0%, #F59E0B 30%, ${D.gold} 50%, ${D.teal} 75%, ${D.navy} 100%)`, marginBottom: '6px' }}>
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

          {/* Score comparison — client dominant, competitor proportional */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
            {/* Client score — dominant */}
            <div style={{ padding: '24px', borderRight: `1px solid ${D.grayMid}` }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: D.textTertiary, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '12px' }}>Your Score</div>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: '64px', fontWeight: 900, color: D.navy, lineHeight: 1 }}>{score}</div>
              <div style={{ fontSize: '12px', color: D.textTertiary, marginTop: '4px' }}>out of 100</div>
            </div>

            {/* Competitor — proportional (Tufte Lie Factor) */}
            <div style={{ padding: '24px', background: D.grayBg }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: D.red, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '12px' }}>Top Competitor</div>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: `${competitorSizePx}px`, fontWeight: 900, color: '#94a3b8', lineHeight: 1, minHeight: '64px', display: 'flex', alignItems: 'flex-start' }}>~{competitorScore}</div>
              <div style={{ fontSize: '12px', color: D.textTertiary, marginTop: '4px' }}>out of 100</div>
            </div>
          </div>

          {/* Gap callout — loss framing */}
          <div style={{ padding: '14px 24px', background: D.navy, textAlign: 'center' }}>
            <span style={{ fontSize: '14px', color: '#fff', fontWeight: 600 }}>
              {gap} points you&apos;re leaving on the table in {market}.
            </span>
            <span style={{ fontSize: '13px', color: D.textTertiary, marginLeft: '8px' }}>
              AI recommends your competitor — not you.
            </span>
          </div>
        </div>

        {/* ═══ MARKET VISIBILITY RATE ═══ */}
        <div style={{ background: '#fff', borderRadius: '14px', padding: '24px', marginBottom: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, color: D.textTertiary, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '4px' }}>Market Visibility Rate</div>
          <div style={{ fontSize: '13px', color: D.textSecondary, marginBottom: '20px' }}>
            How often AI surfaces <strong>{name}</strong> when buyers search for agents in {market}
          </div>

          {/* Bar track */}
          <div style={{ position: 'relative', height: '14px', borderRadius: '7px', background: D.navy, marginBottom: '8px' }}>
            {/* Client marker — teal vertical tick */}
            <div style={{
              position: 'absolute', top: '-7px',
              left: `${Math.max(1, visibilityRate)}%`,
              transform: 'translateX(-50%)',
              width: '4px', height: '28px',
              background: D.teal, borderRadius: '2px',
            }} />
            {/* Benchmark marker — gold vertical tick */}
            <div style={{
              position: 'absolute', top: '-7px',
              left: `${benchmarkRate}%`,
              transform: 'translateX(-50%)',
              width: '4px', height: '28px',
              background: D.gold, borderRadius: '2px',
            }} />
          </div>

          {/* Positioned labels row */}
          <div style={{ position: 'relative', height: '22px', marginBottom: '16px' }}>
            <span style={{
              position: 'absolute',
              left: `${Math.max(1, visibilityRate)}%`,
              transform: 'translateX(-50%)',
              fontSize: '11px', fontWeight: 700, color: D.teal,
              whiteSpace: 'nowrap',
            }}>You: {visibilityRate}%</span>
            <span style={{
              position: 'absolute',
              left: `${benchmarkRate}%`,
              transform: 'translateX(-50%)',
              fontSize: '11px', fontWeight: 700, color: D.gold,
              whiteSpace: 'nowrap',
            }}>Benchmark: {benchmarkRate}%</span>
          </div>

          {/* Scale labels */}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {['Invisible', 'Emerging', 'Recognized', 'Dominant'].map((label) => (
              <span key={label} style={{ fontSize: '10px', color: D.textTertiary, textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</span>
            ))}
          </div>
        </div>

        {/* ═══ NARRATIVE QUALITY ═══ */}
        <div style={{ background: '#fff', borderRadius: '14px', padding: '24px', marginBottom: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, color: D.textTertiary, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '4px' }}>Narrative Quality</div>
          <div style={{ fontSize: '13px', color: D.textSecondary, marginBottom: '20px' }}>
            When AI mentions {firstName}, here is how it describes you:
          </div>
          <div style={{ background: D.grayBg, borderLeft: `3px solid ${D.teal}`, borderRadius: '0 8px 8px 0', padding: '16px 20px', marginBottom: '20px' }}>
            <p style={{ fontSize: '14px', color: D.textSecondary, fontStyle: 'italic', lineHeight: 1.7, margin: 0 }}>
              &ldquo;{name} is a real estate agent based in {market} working with {brokerage}. Limited publicly available detail on specializations or notable transactions.&rdquo;
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { label: 'Accuracy', grade: 'B', color: '#3b82f6' },
              { label: 'Favorability', grade: 'Neutral', color: D.textTertiary },
              { label: 'Specificity', grade: 'Low', color: D.red },
            ].map(({ label, grade, color }) => (
              <div key={label} style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: D.grayBg, border: `1px solid ${D.border}`,
                borderRadius: '20px', padding: '4px 12px',
              }}>
                <span style={{ fontSize: '11px', color: D.textTertiary }}>{label}</span>
                <span style={{ fontSize: '11px', fontWeight: 700, color }}>{grade}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ FOUNDATION SCORE COMPONENTS ═══ */}
        <details style={{ background: '#fff', borderRadius: '14px', marginBottom: '32px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
          <summary style={{
            padding: '20px 24px',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            listStyleType: 'none',
          }}>
            <div>
              <div style={{ fontSize: '10px', fontWeight: 700, color: D.textTertiary, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '4px' }}>Foundation Score Breakdown</div>
              <div style={{ fontSize: '13px', color: D.navy }}>9 scored components · tap to expand</div>
            </div>
            <span style={{ fontSize: '20px', color: D.textTertiary, lineHeight: 1 }}>›</span>
          </summary>
          <div style={{ padding: '0 24px 24px', borderTop: `1px solid ${D.grayMid}` }}>
            <div style={{ paddingTop: '16px' }}>
              {scoreComponents.map(({ name: compName, weight }) => {
                const compScore = Math.round(score * weight / 100);
                const fillPct = Math.round((compScore / weight) * 100);
                return (
                  <div key={compName} style={{ marginBottom: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <span style={{ fontSize: '12px', color: D.textSecondary }}>{compName}</span>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: D.navy }}>
                        {compScore}<span style={{ fontSize: '10px', fontWeight: 400, color: D.textTertiary }}>/{weight}</span>
                      </span>
                    </div>
                    <div style={{ height: '5px', borderRadius: '3px', background: D.grayMid, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${fillPct}%`, background: D.teal, borderRadius: '3px' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </details>

        {/* ═══ SINGLE CTA — ROUTES TO CITATION REPORT ═══ */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <a href={reportUrl} style={{
            display: 'inline-block', background: D.teal, color: '#fff',
            fontWeight: 700, fontSize: '16px', padding: '18px 40px', borderRadius: '10px',
            textDecoration: 'none', boxShadow: '0 4px 16px rgba(0,191,166,0.3)',
          }}>
            See My Full Citation Report →
          </a>
          <p style={{ fontSize: '12px', color: D.textTertiary, marginTop: '12px' }}>
            Your gaps, your markets, your 90-day path — all inside.
          </p>
        </div>

        {/* ═══ FOUNDING MEMBER NOTE (brief, not a full offer section) ═══ */}
        <div style={{ background: D.navy, borderRadius: '10px', padding: '20px 24px', marginBottom: '48px', textAlign: 'center' }}>
          <div style={{ display: 'inline-block', background: 'rgba(212,168,48,0.15)', border: `1px solid ${D.gold}`, borderRadius: '20px', padding: '4px 16px', marginBottom: '12px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: D.gold, letterSpacing: '1.5px', textTransform: 'uppercase' }}>★ Founding Member</span>
          </div>
          <p style={{ fontSize: '14px', color: '#e2e8f0', lineHeight: 1.7, margin: '0 0 4px' }}>
            Your first 90 days are on us. If your Citation Score doesn&apos;t improve by 20+ points, you owe nothing.
          </p>
          <p style={{ fontSize: '12px', color: D.textTertiary, margin: 0 }}>
            That&apos;s the <span style={{ color: D.teal, fontWeight: 700 }}>Citation Guarantee™</span>.
          </p>
        </div>

        {/* ═══ FOOTER ═══ */}
        <div style={{ textAlign: 'center', fontSize: '11px', color: D.textTertiary, lineHeight: 2, paddingBottom: '24px' }}>
          <div style={{ marginBottom: '6px' }}>
            <a href="/how-it-works" style={{ color: '#64748b', textDecoration: 'none', marginRight: '16px' }}>How It Works</a>
            <a href="/privacy" style={{ color: '#64748b', textDecoration: 'none', marginRight: '16px' }}>Privacy</a>
            <a href="/terms" style={{ color: '#64748b', textDecoration: 'none' }}>Terms</a>
          </div>
          CITED · AI Citation Optimization™ for Professionals
          <br />
          <span style={{ color: '#cbd5e1' }}>Powered by PRISM™</span>
        </div>
      </main>
    </div>
  );
}
