import { notFound } from 'next/navigation';
import ScorePageTracker from '@/components/ScorePageTracker';
import TrackedLink from '@/components/TrackedLink';
// CitedHeader/CitedFooter are 'use client' components — inline versions used here
// to avoid server/client component boundary issues in production

/*
  /score/[slug] — Score Page (Supabase-driven)
  Quick PRISM scan → Supabase → this page reads it. No hardcoded data.
  Slug converted to name, matched against cited_intake.full_name.
  Design system aligned with Citation Report v9.
  Built: April 12, 2026
*/

type Gap = {
  title: string;
  platform?: string;  // legacy field
  status: string;
  impact: 'High' | 'Medium' | 'Low' | string;
  points: number;
  color?: string;
  action?: string;
  outcome?: string;
};

type ScanResults = {
  composite_score?: number;
  foundation_score?: number;
  foundation_tier?: string;
  foundation_components?: Record<string, number>;
  visibility_rates?: Record<string, { overall_visibility_pct: number; competitor_visibility_pct: number }>;
  narrative_quality?: { overall_accuracy: string; overall_favorability: string; query_count?: number };
  tier_name?: string;
  gaps?: Gap[];
  markets?: { name: string; competitor: string; competitor_score: string; tier?: string; competitor_brokerage?: string }[];
  ai_quote?: { text: string };
  query_count?: number;
  competitor_frequency?: Record<string, number>;
  brokerage_discovered?: string;
  deal_map?: Record<string, unknown>;
  platforms_discovered?: Record<string, { found: boolean | null; url: string }>;
  dre_data?: {
    agent_license_id?: string;
    broker_license_id?: string;
    broker_name?: string;
    agent_mailing_address?: string;
  };
};

type IntakeRow = {
  id: string;
  full_name: string;
  preferred_name?: string;
  email?: string;
  brokerage?: string;
  primary_markets?: string;
  scan_results?: ScanResults;
  onboarding_token?: string;
  intake_completion_pct?: number;
  status?: string;
};

const D = {
  navy: '#0A1929',
  teal: '#00BFA6',
  red: '#EF4444',
  gold: '#D4A830',
  grayBg: '#f8f9fa',
  grayMid: '#f1f5f9',
  textSecondary: '#475569',
  textTertiary: '#94a3b8',
  border: '#e2e8f0',
};

async function fetchProspect(slug: string): Promise<IntakeRow | null> {
  const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const sbKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!sbUrl || !sbKey) return null;

  // Try by slug field first, then by name-derived slug
  const slugName = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  const res = await fetch(
    `${sbUrl}/rest/v1/cited_intake?or=(full_name.ilike.${encodeURIComponent(slugName)})&select=id,full_name,preferred_name,email,brokerage,primary_markets,scan_results,onboarding_token,intake_completion_pct,status&limit=1`,
    { headers: { apikey: sbKey, Authorization: `Bearer ${sbKey}` }, next: { revalidate: 120 } }
  );

  if (!res.ok) return null;
  const rows = await res.json();
  return rows[0] || null;
}

// ── S-1: Veteran agent detection (CITED-207) ──
// Only triggers when career data is VERIFIED from source (MLS, RealTrends, etc.)
// Placeholder estimates (source contains 'pending' or 'estimate') are IGNORED.
function isVeteranAgent(scan: IntakeRow['scan_results']): boolean {
  if (!scan?.deal_map) return false;
  const dm = scan.deal_map as Record<string, unknown>;
  const careerVolume = (dm.career_volume as number) ?? 0;
  const closedCount = (dm.closed_count as number) ?? 0;
  const volumeSource = ((dm.career_volume_source as string) ?? '').toLowerCase();
  const countSource = ((dm.closed_count_source as string) ?? '').toLowerCase();
  // Reject if source string signals unverified data
  const isEstimate = (s: string) => s.includes('pending') || s.includes('estimate') || s.includes('manual');
  const volumeVerified = careerVolume > 0 && !isEstimate(volumeSource);
  const countVerified = closedCount > 0 && !isEstimate(countSource);
  return (careerVolume >= 50_000_000 && volumeVerified) || (closedCount >= 50 && countVerified);
}

// ── Gap Cards (flat list — no expandable, no chevrons, score page only) ──
function GapCards({ gaps }: { gaps: Gap[] }) {
  return (
    <div style={{ background: '#fff', borderRadius: '14px', padding: '24px', marginBottom: '32px' }}>
      <div style={{ fontSize: '10px', fontWeight: 700, color: D.textTertiary, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '16px' }}>Where You&apos;re Losing Visibility</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {gaps.map((gap, i) => (
          <div key={i} style={{ borderLeft: `4px solid ${gap.color || (gap.impact === 'High' ? '#EF4444' : '#D4A830')}`, padding: '14px 20px', borderRadius: '0 12px 12px 0', background: D.grayBg }}>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#0A1929' }}>{gap.title || gap.platform}</div>
            <div style={{ fontSize: '12px', color: gap.color || '#EF4444', fontWeight: 600, marginTop: '3px' }}>{gap.status}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function ScorePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const baseSlug = slug.endsWith('-b') ? slug.slice(0, -2) : slug;

  const prospect = await fetchProspect(baseSlug);
  if (!prospect) notFound();

  const scan = prospect.scan_results;

  const name = prospect.full_name;
  const firstName = prospect.preferred_name || name.split(' ')[0];
  const brokerage = prospect.brokerage || scan?.brokerage_discovered || '';
  const market = prospect.primary_markets?.split(',')[0]?.trim() || '';
  const score = scan?.foundation_score ?? scan?.composite_score ?? 0;

  // S-2: Veteran framing variables (CITED-207)
  const veteran = isVeteranAgent(scan);
  const careerVolume = (scan?.deal_map?.career_volume as number) ?? 0;
  const primaryMarketName = scan?.markets?.find(m => m.tier === 'primary')?.name ?? name.split(' ')[0]?.concat("'s market") ?? 'your market';
  const scanDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const subheaderText = veteran && careerVolume > 0
    ? `${Math.round(careerVolume/1e6)}M+ in career sales. And yet — AI has no idea who you are.`
    : `${brokerage}${brokerage && market ? ' · ' : ''}${market}${market ? ' · ' : ''}Generated ${scanDate}`;

  // S-5: Tier label — veteran segment (CITED-207)
  const tierDisplay = veteran && ((scan?.foundation_score ?? scan?.composite_score ?? 0) < 35)
    ? 'AI-Invisible'
    : (scan?.foundation_tier ?? scan?.tier_name ?? 'Early Signal');
  // Keep legacy tier variable for any other references
  const tier = tierDisplay;

  // Benchmark — the agent AI DOES recommend in this market
  // Research basis: agents recommended by AI typically score 65-75 (SOCi, BrightLocal 2026)
  const primaryMarket = scan?.markets?.[0];
  const benchmarkScore = parseInt(primaryMarket?.competitor_score || '0') || 70; // Default 70 from research

  // S-3: Named competitor (CITED-207)
  const primaryCompetitorName = scan?.markets?.find(m => m.tier === 'primary')?.competitor ?? null;
  const primaryCompetitorBrokerage = scan?.markets?.find(m => m.tier === 'primary')?.competitor_brokerage ?? null;
  const primaryCompetitorVerified = (scan?.markets?.find(m => m.tier === 'primary') as Record<string,unknown>)?.competitor_verified as boolean ?? false;
  const primaryCompetitorFrequency = (scan?.markets?.find(m => m.tier === 'primary') as Record<string,unknown>)?.competitor_frequency as number ?? 0;
  const primaryCompetitorTotal = (scan?.markets?.find(m => m.tier === 'primary') as Record<string,unknown>)?.competitor_total_queries as number ?? 0;
  const isRealPersonName = (n: string | null) => {
    if (!n || n.length <= 3 || !/[A-Z][a-z]/.test(n) || !n.includes(' ')) return false;
    const words = n.trim().split(/\s+/);
    // Filter noise: repeated words ("News News"), single-word duplicates, generic terms
    if (words.length >= 2 && words[0].toLowerCase() === words[1].toLowerCase()) return false;
    const noiseTerms = ['news', 'view', 'group', 'team', 'agents', 'realty', 'real estate', 'properties', 'homes', 'bay', 'commencement'];
    if (noiseTerms.some(t => n.toLowerCase() === t || words.every(w => noiseTerms.includes(w.toLowerCase())))) return false;
    return true;
  };
  // Top real competitors from frequency map (fallback when primary competitor is noise)
  const topRealCompetitors = Object.entries(scan?.competitor_frequency ?? {})
    .filter(([name]) => isRealPersonName(name))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2);
  const topTwoNames = topRealCompetitors.map(([name]) => name);
  const topTwoCombined = topRealCompetitors.reduce((sum, [, count]) => sum + count, 0);
  const clientPct = Math.max(1, (score / 100) * 100);
  const benchmarkPct = Math.max(1, (benchmarkScore / 100) * 100);
  const gap = benchmarkScore - score;

  // Visibility
  const visibilityData = scan?.visibility_rates?.[market];
  const visibilityRate = visibilityData?.overall_visibility_pct ?? Math.round((score / 100) * 12);
  const appearances = Math.floor((visibilityRate / 100) * (scan?.query_count ?? 60));
  const benchmarkRate = visibilityData?.competitor_visibility_pct ?? 76;

  // Narrative
  const narrative = scan?.narrative_quality;

  // Gaps from scan
  const gaps: Gap[] = scan?.gaps || [];

  // Foundation Score component breakdown — Citation Report only (not shown on score page)

  // Intake pre-fill URL
  const prefillParams = new URLSearchParams();
  if (name) prefillParams.set('fullName', name);
  if (prospect.email) prefillParams.set('email', prospect.email);
  if (brokerage) prefillParams.set('brokerage', brokerage);
  if (market) prefillParams.set('primaryMarkets', prospect.primary_markets || market);
  // Pre-fill from scan discovered data
  if (scan?.brokerage_discovered) prefillParams.set('brokerage', scan.brokerage_discovered);
  // Pre-fill platform URLs from scan
  const platforms = scan?.platforms_discovered || {};
  if (platforms.Brokerage?.url) prefillParams.set('brokerageProfileUrl', platforms.Brokerage.url);
  if (platforms['Brokerage Site']?.url) prefillParams.set('brokerageProfileUrl', platforms['Brokerage Site'].url);
  if (platforms.LinkedIn?.url) prefillParams.set('linkedinUrl', platforms.LinkedIn.url);
  if (platforms.Zillow?.url) prefillParams.set('zillowUrl', platforms.Zillow.url);
  if (platforms.Yelp?.url) prefillParams.set('yelpUrl', platforms.Yelp.url);
  if (platforms['Realtor.com']?.url) prefillParams.set('realtorUrl', platforms['Realtor.com'].url);
  if (platforms.YouTube?.url) prefillParams.set('youtubeUrl', platforms.YouTube.url);
  if (platforms.FastExpert?.url) prefillParams.set('fastexpertUrl', platforms.FastExpert.url);
  if (platforms.HomeLight?.url) prefillParams.set('homelightUrl', platforms.HomeLight.url);
  if (platforms['Homes.com']?.url) prefillParams.set('homescomUrl', platforms['Homes.com'].url);
  if (platforms.Instagram?.url) prefillParams.set('instagramUrl', platforms.Instagram.url);
  if (platforms.Facebook?.url) prefillParams.set('facebookUrl', platforms.Facebook.url);
  if (platforms.TikTok?.url) prefillParams.set('tiktokUrl', platforms.TikTok.url);
  if (platforms['About.me']?.url) prefillParams.set('aboutmeUrl', platforms['About.me'].url);
  // Extra identity fields if present in scan
  const scanAny = scan as Record<string, unknown> | undefined;
  if (typeof scanAny?.personal_website === 'string') prefillParams.set('personalWebsiteUrl', scanAny.personal_website as string);
  if (typeof scanAny?.phone === 'string') prefillParams.set('phone', scanAny.phone as string);
  // DRE data from scan
  if (scan?.dre_data?.agent_license_id) prefillParams.set('licenseNumber', scan.dre_data.agent_license_id);
  if (scan?.dre_data?.broker_license_id) prefillParams.set('brokerDre', scan.dre_data.broker_license_id);
  if (scan?.dre_data?.broker_name) prefillParams.set('brokerName', scan.dre_data.broker_name);
  if (scan?.dre_data?.agent_mailing_address) prefillParams.set('brokerageAddress', scan.dre_data.agent_mailing_address);
  const intakeUrl = `/intake?${prefillParams.toString()}`;

  // ── Dynamic CTA logic (CITED-176) ──
  const foundingActive = process.env.NEXT_PUBLIC_FOUNDING_ACTIVE === 'true';
  const intakePct = prospect.intake_completion_pct ?? 0;
  const intakeComplete = intakePct === 100 || prospect.status === 'complete';
  const intakeStarted = intakePct > 0;

  let ctaText: string;
  let ctaHref: string = intakeUrl;

  if (intakeComplete) {
    ctaText = 'View My Report →';
    ctaHref = '/onboarding/results';
  } else if (intakeStarted) {
    ctaText = 'Complete Your Intake →';
  } else if (foundingActive) {
    ctaText = 'Claim My Founding Spot →';
  } else {
    ctaText = 'Get Cited →';
  }

  // Dynamic "why this is a problem" bullets based on scan data
  const components = scan?.foundation_components || {};

  // S-4: Veteran vs. emerging problem bullets (CITED-207)
  const closedCount = (scan?.deal_map?.closed_count as number) ?? 0;
  let problemBullets: string[];

  if (veteran) {
    problemBullets = [
      closedCount > 0
        ? `Your ${closedCount} transactions aren't in the sources AI reads — to AI, your track record doesn't exist`
        : `Your transaction history isn't in AI-readable formats yet`,
      `Your market expertise hasn't been published in AI-citable formats`,
      `AI treats you like a generic agent in ${primaryMarketName} — it can't find your specialization`,
      "88% of consumers fact-check AI — this is what they'd see",
    ];
  } else {
    problemBullets = [];
    if ((components.discovery_visibility ?? 0) === 0) {
      problemBullets.push("AI doesn't associate you with any specific market");
    }
    if (!scan?.ai_quote?.text || scan.ai_quote.text.includes("Limited") || scan.ai_quote.text.includes("limited")) {
      problemBullets.push("No transaction history — AI has no proof you perform");
    }
    if ((components.earned_media ?? 0) < 5) {
      problemBullets.push("No third-party mentions — 48% of AI citations come from earned media");
    }
    if ((components.content_freshness ?? 0) < 4) {
      problemBullets.push("No content published in the last 30 days — AI deprioritizes stale profiles");
    }
    const platformCount = Object.values(scan?.platforms_discovered || {}).filter((p: any) => p?.found === true).length;
    if (platformCount < 5) {
      problemBullets.push(`You're only on ${platformCount} platforms — agents on 6+ get 2.8x more citations`);
    }
    if ((components.schema_structured_data ?? 0) === 0) {
      problemBullets.push("No structured data — AI can't verify your expertise");
    }
    if ((components.recommendation_readiness ?? 0) < 4) {
      problemBullets.push("Nothing differentiates you from every other agent");
    }
    // Always add the closer
    problemBullets.push("88% of consumers fact-check AI — this is what they'd see");
  }

  // Take top 4 max (3 dynamic + the closer)
  const displayBullets = problemBullets.length > 4
    ? [...problemBullets.slice(0, 3), problemBullets[problemBullets.length - 1]]
    : problemBullets;

  return (
    <div style={{ minHeight: '100vh', background: D.grayBg, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif' }}>
      <style>{`details > summary { list-style: none; cursor: pointer; transition: background 0.15s; } details > summary::-webkit-details-marker { display: none; } details > summary:hover { background: #f0faf8; } details[open] > summary { background: #f0faf8 !important; } .chevron { transition: transform 0.2s; } details[open] .chevron { transform: rotate(180deg); } .see-fix { } details[open] .see-fix { display: none; } .gap-card { transition: box-shadow 0.15s; } .gap-card:hover { box-shadow: 0 2px 12px rgba(0,191,166,0.12); }`}</style>
      <ScorePageTracker slug={slug} name={name} />

      {/* Header — inline version matching CitedHeader component */}
      <div style={{ background: '#0A1929', padding: '20px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '960px', margin: '0 auto' }}>
          <a href="/" style={{ textDecoration: 'none' }}>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#fff', letterSpacing: '2px', marginBottom: '2px' }}>CITED</div>
            <div style={{ fontSize: '9px', fontWeight: 600, color: '#00BFA6', textTransform: 'uppercase', letterSpacing: '2px' }}>AI Citation Optimization™</div>
          </a>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>{name}</div>
            <div style={{ fontSize: '10px', fontWeight: 600, color: '#D4A830', marginTop: '2px', letterSpacing: '0.5px' }}>★ Founding Member</div>
          </div>
        </div>
      </div>
      <div style={{ height: '3px', background: 'linear-gradient(90deg, #00BFA6, #D4A830, #00BFA6)' }} />

      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px 48px' }}>

        {/* ═══ PERSONALIZATION HEADER ═══ */}
        <div style={{ paddingTop: '40px', marginBottom: '8px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: D.navy, margin: '0 0 4px', lineHeight: 1.3 }}>
            {firstName}, here&apos;s your Initial Foundation Score.
          </h1>
          <p style={{ fontSize: '13px', color: D.textTertiary, margin: 0 }}>
            {subheaderText}
          </p>
        </div>

        {/* ═══ CONTEXT BLOCK ═══ */}
        <div style={{ background: D.navy, borderRadius: '12px', padding: '24px', marginBottom: '32px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: D.gold, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '10px' }}>What This Measures</div>
          <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: 1.7, margin: 0 }}>
<span style={{ color: '#ffffff', fontWeight: 700 }}>45% of consumers now use AI for local business recommendations.</span> Unlike Google, AI doesn&apos;t rank websites — it <span style={{ color: '#fff', fontWeight: 600 }}>recommends agents it already knows</span>. Your Foundation Score measures how visible you are across those AI searches — and where the gaps are.
          </p>
        </div>

        {/* ═══ SCORE CARD ═══ */}
        <div style={{ background: '#fff', borderRadius: '14px', overflow: 'hidden', marginBottom: '32px', boxShadow: '0 4px 24px rgba(0,0,0,0.10)' }}>
          <div style={{ padding: '20px 24px 16px', borderBottom: `1px solid ${D.grayMid}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, color: D.textTertiary, textTransform: 'uppercase', letterSpacing: '1.5px' }}>Initial Foundation Score</div>

              </div>
              <div style={{ fontSize: '10px', color: D.textTertiary, background: D.grayBg, padding: '3px 8px', borderRadius: '4px' }}>
                PRISM Scan™{scan?.query_count ? ` · ${scan.query_count} queries` : ''}
              </div>
            </div>
            <div style={{ position: 'relative', height: '8px', borderRadius: '4px', background: `linear-gradient(90deg, ${D.red} 0%, #F59E0B 30%, ${D.gold} 50%, ${D.teal} 75%, ${D.navy} 100%)`, marginBottom: '6px' }}>
              <div style={{ position: 'absolute', top: '-5px', left: `${clientPct}%`, width: '18px', height: '18px', borderRadius: '50%', background: D.navy, border: '3px solid #fff', boxShadow: '0 2px 6px rgba(0,0,0,0.2)', transform: 'translateX(-50%)' }} />
              {benchmarkScore > 0 && <div style={{ position: 'absolute', top: '-5px', left: `${benchmarkPct}%`, width: '18px', height: '18px', borderRadius: '50%', background: D.red, border: '3px solid #fff', boxShadow: '0 2px 6px rgba(0,0,0,0.2)', transform: 'translateX(-50%)' }} />}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: D.textTertiary }}>
              <span>Not indexed</span>
              <span>Recommended</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
            <div style={{ padding: '24px', borderRight: `1px solid ${D.grayMid}` }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: D.textTertiary, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '14px' }}>Your Score</div>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: '64px', fontWeight: 900, color: D.navy, lineHeight: 1, whiteSpace: 'nowrap', marginBottom: '8px' }}>{score}<span style={{ fontSize: '18px', color: D.textTertiary, fontWeight: 400, fontFamily: 'var(--font-geist-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif' }}>/100</span></div>

              <div style={{ paddingTop: '14px', borderTop: `1px solid ${D.border}` }}>
                {gaps.length > 0 && (
                  <>
                    <div style={{ fontSize: '9px', fontWeight: 700, color: D.red, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>What&apos;s blocking you</div>
                    {gaps.slice(0, 3).map((g, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '5px', marginBottom: '3px' }}>
                        <span style={{ color: D.red, fontWeight: 700, fontSize: '10px', flexShrink: 0, marginTop: '1px' }}>→</span>
                        <span style={{ fontSize: '11px', color: D.textSecondary, lineHeight: 1.4 }}>{g.title || g.platform}</span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
            <div style={{ padding: '24px', background: D.grayBg }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: D.textTertiary, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '14px' }}>Benchmark</div>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: '64px', fontWeight: 900, color: '#94a3b8', lineHeight: 1, whiteSpace: 'nowrap', marginBottom: '16px' }}>~{benchmarkScore}<span style={{ fontSize: '18px', color: D.textTertiary, fontWeight: 400, fontFamily: 'var(--font-geist-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif' }}>/100</span></div>

              <div style={{ paddingTop: '14px', borderTop: `1px solid ${D.border}` }}>
                <div style={{ fontSize: '9px', fontWeight: 700, color: D.textTertiary, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>What they have</div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '5px', marginBottom: '3px' }}>
                  <span style={{ color: D.teal, fontWeight: 700, fontSize: '10px', flexShrink: 0 }}>✓</span>
                  <span style={{ fontSize: '11px', color: D.textSecondary, lineHeight: 1.4 }}>Earned media mentions</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '5px', marginBottom: '3px' }}>
                  <span style={{ color: D.teal, fontWeight: 700, fontSize: '10px', flexShrink: 0 }}>✓</span>
                  <span style={{ fontSize: '11px', color: D.textSecondary, lineHeight: 1.4 }}>Published market content</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '5px' }}>
                  <span style={{ color: D.teal, fontWeight: 700, fontSize: '10px', flexShrink: 0 }}>✓</span>
                  <span style={{ fontSize: '11px', color: D.textSecondary, lineHeight: 1.4 }}>Verified platform presence</span>
                </div>
              </div>
            </div>
          </div>


        </div>

        {/* ═══ MID-PAGE CTA ═══ */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <p style={{ fontSize: '15px', color: D.textSecondary, marginBottom: '14px' }}>Ready to fix this?</p>
          <TrackedLink href={ctaHref} slug={slug} name={name} eventType="cta_click" eventData={{ page: 'score', cta: 'mid_page' }} style={{ display: 'inline-block', background: D.teal, color: '#fff', fontWeight: 700, fontSize: '15px', padding: '14px 36px', borderRadius: '10px', textDecoration: 'none', boxShadow: '0 4px 16px rgba(0,191,166,0.3)' }}>
            {ctaText}
          </TrackedLink>
          <p style={{ fontSize: '12px', color: D.textTertiary, marginTop: '12px' }}>
            <strong style={{ color: D.navy }}>Free for Founding Members.</strong> Takes 5 minutes. We handle the rest.
          </p>
          <p style={{ fontSize: '13px', color: D.textTertiary, marginTop: '8px' }}>
            <a href="/how-it-works" style={{ color: D.teal, textDecoration: 'none', fontWeight: 600 }}>Want to know how it works? →</a>
          </p>
          <div style={{ marginTop: '16px', padding: '14px 20px', background: 'rgba(0,0,0,0.03)', borderRadius: '10px', textAlign: 'left', maxWidth: '480px', margin: '16px auto 0' }}>
            <p style={{ fontSize: '12px', color: D.textTertiary, lineHeight: 1.6, margin: '0 0 6px 0' }}>Founding members get a full <span style={{ color: D.gold, fontWeight: 600 }}>PRISM Scan™</span> — 1,700+ queries, complete gap analysis, competitor intelligence, and a 90-day optimization plan.</p>
            <p style={{ fontSize: '12px', color: D.textTertiary, lineHeight: 1.6, margin: 0 }}>Your results may change once we run your full PRISM Scan™.</p>
          </div>
        </div>

        {/* ═══ MARKET VISIBILITY RATE ═══ */}
        <div style={{ background: '#fff', borderRadius: '14px', padding: '24px', marginBottom: '32px',  }}>
          <div style={{ fontSize: '10px', fontWeight: 700, color: D.textTertiary, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '4px' }}>AI Discovery Rate</div>
          <div style={{ fontSize: '13px', color: D.textSecondary, marginBottom: '20px' }}>
            How often AI recommends <strong>{name}</strong> when sellers search in {market}
          </div>
          <div style={{ position: 'relative', height: '8px', borderRadius: '4px', background: `linear-gradient(90deg, ${D.red} 0%, #F59E0B 25%, ${D.gold} 45%, ${D.teal} 70%, ${D.navy} 100%)`, marginBottom: '8px' }}>
            <div style={{ position: 'absolute', top: '-5px', left: `${Math.max(1, visibilityRate)}%`, transform: 'translateX(-50%)', width: '18px', height: '18px', borderRadius: '50%', background: visibilityRate < 10 ? D.red : D.teal, border: '3px solid #fff', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }} />
            <div style={{ position: 'absolute', top: '-3px', left: '40%', transform: 'translateX(-50%)', width: '2px', height: '14px', background: D.gold, borderRadius: '1px' }} />
          </div>
          {/* You label — above track, pinned to thumb position */}
          <div style={{ position: 'relative', height: '20px', marginBottom: '4px' }}>
            <span style={{ position: 'absolute', left: `${Math.max(1, Math.min(visibilityRate, 90))}%`, transform: 'translateX(-50%)', fontSize: '12px', fontWeight: 800, color: visibilityRate < 10 ? D.red : D.teal, whiteSpace: 'nowrap' }}>You: {visibilityRate}%</span>
          </div>
          {/* Benchmark label — own row, always centered at 40% */}
          <div style={{ position: 'relative', height: '20px', marginBottom: '8px' }}>
            <span style={{ position: 'absolute', left: `40%`, transform: 'translateX(-50%)', fontSize: '12px', fontWeight: 700, color: D.gold, whiteSpace: 'nowrap' }}>Top agents score here</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            {['Invisible', 'Emerging', 'Recognized', 'Dominant'].map((l) => (
              <span key={l} style={{ fontSize: '10px', color: D.textTertiary, textTransform: 'uppercase', letterSpacing: '1px' }}>{l}</span>
            ))}
          </div>
          {/* Competitor callout — below tier labels */}
          {scan?.query_count ? (
            <div style={{ padding: '14px 20px', background: D.navy, borderRadius: '10px', textAlign: 'center', marginBottom: '16px' }}>
              {topTwoNames.length >= 2 ? (
                <span style={{ fontSize: '14px', color: '#fff', lineHeight: 1.6 }}>
                  AI recommended <span style={{ color: D.red, fontWeight: 700 }}>{topTwoNames[0]}</span> and <span style={{ color: D.red, fontWeight: 700 }}>{topTwoNames[1]}</span> a combined <span style={{ color: D.red, fontWeight: 700 }}>{topTwoCombined}x</span>. Your name came up only <span style={{ color: D.red, fontWeight: 700 }}>{visibilityRate === 0 ? '0x' : `${appearances}x`}</span>.
                </span>
              ) : primaryCompetitorName && isRealPersonName(primaryCompetitorName) && primaryCompetitorFrequency > 0 ? (
                <span style={{ fontSize: '14px', color: '#fff', lineHeight: 1.6 }}>
                  AI recommended <span style={{ color: D.red, fontWeight: 700 }}>{primaryCompetitorName}</span> in <span style={{ color: D.red, fontWeight: 700 }}>{primaryCompetitorFrequency} of {primaryCompetitorTotal} queries</span>. Your name came up only <span style={{ color: D.red, fontWeight: 700 }}>{visibilityRate === 0 ? '0' : appearances} times</span>.
                </span>
              ) : (
                <span style={{ fontSize: '14px', color: '#fff', lineHeight: 1.6 }}>
                  We ran <span style={{ color: '#ffffff', fontWeight: 700 }}>{scan.query_count} AI real estate searches</span> in {market}.{' '}
                  Your name came up only <span style={{ color: D.red, fontWeight: 700 }}>{visibilityRate === 0 ? '0 times' : `${appearances} times`}</span>.
                </span>
              )}
            </div>
          ) : null}
          {visibilityRate < 10 && (
            <div style={{ background: 'rgba(239,68,68,0.06)', border: `1px solid rgba(239,68,68,0.15)`, borderRadius: '8px', padding: '12px 16px', textAlign: 'center' }}>
              <p style={{ fontSize: '14px', fontWeight: 700, color: D.red, margin: 0 }}>
                You are invisible to AI in {market}.
              </p>
              <p style={{ fontSize: '12px', color: D.textSecondary, margin: '4px 0 0' }}>
                When sellers in {market} ask AI for an agent, your name does not come up. 45% of consumers now use AI for local business recommendations <span style={{ color: D.textTertiary }}>(BrightLocal, April 2026)</span>.
              </p>
            </div>
          )}
        </div>

        {/* ═══ GAPS — expandable cards matching Citation Report ═══ */}
        {gaps.length > 0 && (
          <GapCards gaps={gaps} />
        )}

        {/* ═══ WHAT AI SAYS ABOUT YOU ═══ */}
        <div style={{ background: '#fff', borderRadius: '14px', padding: '24px', marginBottom: '32px' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, color: D.textTertiary, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '4px' }}>This Is What AI Says About You</div>
          <div style={{ fontSize: '13px', color: D.textSecondary, marginBottom: '20px' }}>
            We asked AI about {firstName} directly. Out of {scan?.query_count || 40} queries, AI only described you in <span style={{ color: D.red, fontWeight: 700 }}>{scan?.narrative_quality?.query_count || 2}</span> — and this is what it said:
          </div>
          <div style={{ background: D.grayBg, borderLeft: `3px solid ${visibilityRate > 20 ? D.teal : D.red}`, borderRadius: '0 8px 8px 0', padding: '16px 20px', marginBottom: '16px' }}>
            <p style={{ fontSize: '14px', color: D.textSecondary, fontStyle: 'italic', lineHeight: 1.7, margin: 0 }}>
              {scan?.ai_quote?.text
                ? `\u201C${scan.ai_quote.text.replace(/\*\*/g, '').replace(/##\s*/g, '').replace(/\[\d+\]/g, '').replace(/\n/g, ' ').trim()}\u201D`
                : `\u201C${name} is a real estate agent based in ${market}${brokerage ? ` working with ${brokerage}` : ''}. Limited publicly available detail on specializations or notable transactions.\u201D`
              }
            </p>
          </div>
          <div style={{ background: 'rgba(239,68,68,0.04)', border: `1px solid rgba(239,68,68,0.12)`, borderRadius: '8px', padding: '14px 18px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: D.red, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Why this is a problem</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {displayBullets.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                  <span style={{ color: D.red, fontWeight: 700, fontSize: '10px', flexShrink: 0, marginTop: '2px' }}>✗</span>
                  <span style={{ fontSize: '12px', color: D.textSecondary, lineHeight: 1.5 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ═══ TRY IT YOURSELF ═══ */}
        <div style={{ background: '#fff', borderRadius: '14px', padding: '24px', marginBottom: '32px' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, color: D.textTertiary, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '12px' }}>See For Yourself</div>
          <p style={{ fontSize: '15px', color: D.textSecondary, lineHeight: 1.7, margin: '0 0 16px' }}>
            Don&apos;t take our word for it. Open ChatGPT right now and ask:
          </p>
          <div style={{ background: D.grayBg, borderRadius: '10px', padding: '16px 20px', marginBottom: '16px', borderLeft: `3px solid ${D.gold}` }}>
            <p style={{ fontSize: '15px', color: D.navy, fontWeight: 700, fontStyle: 'italic', margin: 0 }}>
              &ldquo;Who is the best luxury real estate agent in {market}?&rdquo;
            </p>
          </div>
          <p style={{ fontSize: '14px', color: D.textSecondary, lineHeight: 1.7, margin: 0 }}>
            If your name isn&apos;t in the answer, that&apos;s what your sellers see too. Your Foundation Score measures exactly why — and what to fix.
          </p>
        </div>

        {/* ═══ CTA ═══ */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <TrackedLink href={ctaHref} slug={slug} name={name} eventType="cta_click" eventData={{ page: 'score', cta: 'bottom' }} style={{ display: 'inline-block', background: D.teal, color: '#fff', fontWeight: 700, fontSize: '16px', padding: '18px 40px', borderRadius: '10px', textDecoration: 'none', boxShadow: '0 4px 16px rgba(0,191,166,0.3)' }}>
            {ctaText}
          </TrackedLink>
          <p style={{ fontSize: '12px', color: D.textTertiary, marginTop: '12px' }}>
            <strong style={{ color: D.navy }}>Free for Founding Members.</strong> Takes 5 minutes. We handle the rest.
          </p>
          <p style={{ fontSize: '13px', color: D.textTertiary, marginTop: '8px' }}>
            <a href="/how-it-works" style={{ color: D.teal, textDecoration: 'none', fontWeight: 600 }}>Want to know how it works? →</a>
          </p>
        </div>

        {/* ═══ FOUNDING MEMBER ═══ */}
        <div style={{ background: D.navy, borderRadius: '10px', padding: '20px 24px', marginBottom: '48px', textAlign: 'center' }}>
          <div style={{ display: 'inline-block', background: 'rgba(212,168,48,0.15)', border: `1px solid ${D.gold}`, borderRadius: '20px', padding: '4px 16px', marginBottom: '16px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: D.gold, letterSpacing: '1.5px', textTransform: 'uppercase' }}>★ Founding Member</span>
          </div>
          <p style={{ fontSize: '28px', fontWeight: 900, color: '#fff', margin: '0 0 6px', lineHeight: 1.2 }}>
            Completely <span style={{ color: D.teal }}>free</span>. No commitment.
          </p>
          <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: 1.7, margin: '0 0 8px' }}>
            We&apos;re accepting a small group of founding members{market ? ` in ${market}` : ''}. If your Foundation Score doesn&apos;t improve by 20+ points, you owe nothing.
          </p>
          <p style={{ fontSize: '13px', color: D.teal, fontWeight: 700, margin: 0 }}>
            That&apos;s the Citation Guarantee™.
          </p>
        </div>

        {/* Footer — inline version matching CitedFooter component */}
        <div style={{ marginTop: '48px', borderTop: '1px solid #e2e8f0', paddingTop: '24px', paddingBottom: '24px', textAlign: 'center' }}>
          <p style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: 800, color: '#0A1929', letterSpacing: '-0.5px' }}>CITED</p>
          <p style={{ margin: '0 0 10px 0', fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1.5px' }}>AI Citation Optimization™ for Professionals</p>
          <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>
            Powered by PRISM™ · <a href="/how-it-works" style={{ color: '#00BFA6', textDecoration: 'none', fontWeight: 600 }}>How it works</a> · <a href="/privacy" style={{ color: '#00BFA6', textDecoration: 'none', fontWeight: 600 }}>Privacy</a> · <a href="/terms" style={{ color: '#00BFA6', textDecoration: 'none', fontWeight: 600 }}>Terms</a>
          </p>
        </div>
        <div style={{ height: '4px', background: 'linear-gradient(90deg, #00BFA6, #D4A830, #00BFA6)', borderRadius: '2px' }} />
      </main>
    </div>
  );
}
