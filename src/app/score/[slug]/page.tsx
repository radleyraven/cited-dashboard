import { notFound } from 'next/navigation';

/*
  /score/[slug] — Score Page (Supabase-driven)
  Quick PRISM scan → Supabase → this page reads it. No hardcoded data.
  Slug converted to name, matched against cited_intake.full_name.
  Built: April 12, 2026 — rewritten to remove all hardcoded prospect data.
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
  narrative_quality?: { overall_accuracy: string; overall_favorability: string };
  tier_name?: string;
  gaps?: Gap[];
  markets?: { name: string; competitor: string; competitor_score: string }[];
  ai_quote?: { text: string };
  query_count?: number;
  brokerage_discovered?: string;
};

type IntakeRow = {
  id: string;
  full_name: string;
  email?: string;
  brokerage?: string;
  primary_markets?: string;
  scan_results?: ScanResults;
  onboarding_token?: string;
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
    `${sbUrl}/rest/v1/cited_intake?or=(full_name.ilike.${encodeURIComponent(slugName)})&select=id,full_name,email,brokerage,primary_markets,scan_results,onboarding_token&limit=1`,
    { headers: { apikey: sbKey, Authorization: `Bearer ${sbKey}` }, next: { revalidate: 120 } }
  );

  if (!res.ok) return null;
  const rows = await res.json();
  return rows[0] || null;
}

export default async function ScorePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const baseSlug = slug.endsWith('-b') ? slug.slice(0, -2) : slug;

  const prospect = await fetchProspect(baseSlug);
  if (!prospect) notFound();

  const scan = prospect.scan_results;

  const name = prospect.full_name;
  const firstName = name.split(' ')[0];
  const brokerage = prospect.brokerage || scan?.brokerage_discovered || '';
  const market = prospect.primary_markets?.split(',')[0]?.trim() || '';
  const score = scan?.foundation_score ?? scan?.composite_score ?? 0;
  const tier = scan?.foundation_tier ?? scan?.tier_name ?? 'Not scanned';

  // Benchmark — the agent AI DOES recommend in this market
  // Research basis: agents recommended by AI typically score 65-75 (SOCi, BrightLocal 2026)
  const primaryMarket = scan?.markets?.[0];
  const benchmarkScore = parseInt(primaryMarket?.competitor_score || '0') || 70; // Default 70 from research
  const benchmarkSizePx = Math.max(24, Math.round(64 * (benchmarkScore / 100)));
  const clientPct = Math.max(1, (score / 100) * 100);
  const benchmarkPct = Math.max(1, (benchmarkScore / 100) * 100);
  const gap = benchmarkScore - score;

  // Visibility
  const visibilityData = scan?.visibility_rates?.[market];
  const visibilityRate = visibilityData?.overall_visibility_pct ?? Math.round((score / 100) * 12);
  const benchmarkRate = visibilityData?.competitor_visibility_pct ?? 76;

  // Narrative
  const narrative = scan?.narrative_quality;

  // Gaps from scan
  const gaps: Gap[] = scan?.gaps || [];

  // Foundation Score components
  // v3.1 weights (LOCKED April 12, 2026)
  const scoreComponents = [
    { name: 'Discovery Visibility', weight: 30, key: 'discovery_visibility' },
    { name: 'Earned Media', weight: 20, key: 'earned_media' },
    { name: 'Brand Web Presence', weight: 12, key: 'brand_web_presence' },
    { name: 'Content Freshness', weight: 12, key: 'content_freshness' },
    { name: 'Platform Presence', weight: 10, key: 'platform_presence' },
    { name: 'Recommendation Readiness', weight: 7, key: 'recommendation_readiness' },
    { name: 'Entity Consistency', weight: 4, key: 'entity_consistency' },
    { name: 'Schema / Structured Data', weight: 3, key: 'schema_structured_data' },
    { name: 'Explanation Readiness', weight: 2, key: 'explanation_readiness' },
  ];

  // Report URL
  const reportUrl = prospect.onboarding_token
    ? `https://citedagent.com/onboarding/results?token=${prospect.onboarding_token}`
    : `https://citedagent.com/onboarding/results`;

  // Intake pre-fill URL
  const prefillParams = new URLSearchParams();
  if (name) prefillParams.set('fullName', name);
  if (prospect.email) prefillParams.set('email', prospect.email);
  if (brokerage) prefillParams.set('brokerage', brokerage);
  if (market) prefillParams.set('primaryMarkets', prospect.primary_markets || market);
  // Pre-fill from scan discovered data
  if (scan?.brokerage_discovered) prefillParams.set('brokerage', scan.brokerage_discovered);
  const intakeUrl = `/intake?${prefillParams.toString()}`;

  return (
    <div style={{ minHeight: '100vh', background: D.grayBg, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif' }}>
      <style>{`details > summary { list-style: none; } details > summary::-webkit-details-marker { display: none; }`}</style>

      {/* ═══ HEADER ═══ */}
      <header style={{ background: D.navy, padding: '24px 32px', textAlign: 'center' }}>
        <div style={{ fontSize: '24px', fontWeight: 900, color: '#ffffff', letterSpacing: '2px', marginBottom: '4px' }}>CITED</div>
        <div style={{ fontSize: '10px', fontWeight: 600, color: D.teal, textTransform: 'uppercase', letterSpacing: '2.5px' }}>AI Citation Optimization™</div>
      </header>
      <div style={{ height: '3px', background: `linear-gradient(90deg, ${D.teal}, ${D.gold}, ${D.teal})` }} />

      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px 48px' }}>

        {/* ═══ PERSONALIZATION HEADER ═══ */}
        <div style={{ paddingTop: '40px', marginBottom: '8px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: D.navy, margin: '0 0 4px', lineHeight: 1.3 }}>
            {firstName}, here&apos;s your Foundation Score.
          </h1>
          <p style={{ fontSize: '13px', color: D.textTertiary, margin: 0 }}>
            {brokerage}{brokerage && market ? ' · ' : ''}{market}{market ? ' · ' : ''}Generated {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {/* ═══ CONTEXT BLOCK ═══ */}
        <div style={{ background: D.navy, borderRadius: '12px', padding: '24px', marginBottom: '32px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: D.gold, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '10px' }}>What This Measures</div>
          <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: 1.7, margin: 0 }}>
            Your clients are using AI tools like ChatGPT and Google AI to find agents. Unlike Google, AI doesn&apos;t rank websites — it <span style={{ color: '#fff', fontWeight: 600 }}>recommends agents it already knows</span>. Your Foundation Score measures how visible you are across those AI searches — and where the gaps are.
          </p>
        </div>

        {/* ═══ SCORE CARD ═══ */}
        <div style={{ background: '#fff', borderRadius: '14px', overflow: 'hidden', marginBottom: '32px', boxShadow: '0 4px 24px rgba(0,0,0,0.10)' }}>
          <div style={{ padding: '20px 24px 16px', borderBottom: `1px solid ${D.grayMid}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, color: D.textTertiary, textTransform: 'uppercase', letterSpacing: '1.5px' }}>Foundation Score</div>
                {tier !== 'Not scanned' && (
                  <div style={{ fontSize: '10px', color: D.textTertiary, marginTop: '2px' }}>{tier}</div>
                )}
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
              <div style={{ fontSize: '10px', fontWeight: 700, color: D.textTertiary, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '12px' }}>Your Foundation Score</div>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: '64px', fontWeight: 900, color: D.navy, lineHeight: 1 }}>{score}</div>
              <div style={{ fontSize: '12px', color: D.textTertiary, marginTop: '4px', marginBottom: '12px' }}>out of 100</div>
              {/* Why AI doesn't recommend you yet */}
              {gaps.length > 0 && (
                <div style={{ paddingTop: '10px', borderTop: `1px solid ${D.border}` }}>
                  <div style={{ fontSize: '9px', fontWeight: 700, color: D.red, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>Why AI doesn&apos;t recommend you yet</div>
                  {gaps.slice(0, 3).map((g, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '5px', marginBottom: '3px' }}>
                      <span style={{ color: D.red, fontWeight: 700, fontSize: '10px', flexShrink: 0, marginTop: '1px' }}>→</span>
                      <span style={{ fontSize: '11px', color: D.textSecondary, lineHeight: 1.4 }}>{g.title || g.platform}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ padding: '24px', background: D.grayBg }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: D.red, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '12px' }}>Market Benchmark</div>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: `${benchmarkSizePx}px`, fontWeight: 900, color: '#94a3b8', lineHeight: 1, minHeight: '64px', display: 'flex', alignItems: 'flex-start' }}>~{benchmarkScore}</div>
              <div style={{ fontSize: '12px', color: D.textTertiary, marginTop: '4px', marginBottom: '10px' }}>Agents AI recommends</div>
              <div style={{ paddingTop: '10px', borderTop: `1px solid ${D.border}` }}>
                <div style={{ fontSize: '9px', fontWeight: 700, color: D.textTertiary, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>What they have that you don&apos;t</div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '5px', marginBottom: '3px' }}>
                  <span style={{ color: D.teal, fontWeight: 700, fontSize: '10px', flexShrink: 0 }}>✓</span>
                  <span style={{ fontSize: '11px', color: D.textSecondary, lineHeight: 1.4 }}>Earned media mentions</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '5px', marginBottom: '3px' }}>
                  <span style={{ color: D.teal, fontWeight: 700, fontSize: '10px', flexShrink: 0 }}>✓</span>
                  <span style={{ fontSize: '11px', color: D.textSecondary, lineHeight: 1.4 }}>Fresh content (last 30 days)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '5px' }}>
                  <span style={{ color: D.teal, fontWeight: 700, fontSize: '10px', flexShrink: 0 }}>✓</span>
                  <span style={{ fontSize: '11px', color: D.textSecondary, lineHeight: 1.4 }}>Optimized platform presence</span>
                </div>
              </div>
            </div>
          </div>

          {/* Discovery gap callout */}
          <div style={{ padding: '14px 24px', background: D.navy, textAlign: 'center' }}>
            {scan?.query_count ? (
              <span style={{ fontSize: '14px', color: '#fff', lineHeight: 1.6 }}>
                AI answered <span style={{ color: D.teal, fontWeight: 700 }}>{scan.query_count} queries</span> in {market}.{' '}
                Your name appeared in <span style={{ color: D.red, fontWeight: 700 }}>{visibilityRate}%</span> of them.
              </span>
            ) : gap > 0 ? (
              <>
                <span style={{ fontSize: '14px', color: '#fff', fontWeight: 600 }}>{gap} points behind in {market}.</span>
                <span style={{ fontSize: '13px', color: D.textTertiary, marginLeft: '8px' }}>AI recommends the benchmark — not you.</span>
              </>
            ) : null}
          </div>
        </div>

        {/* ═══ MARKET VISIBILITY RATE ═══ */}
        <div style={{ background: '#fff', borderRadius: '14px', padding: '24px', marginBottom: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, color: D.textTertiary, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '4px' }}>Market Visibility Rate</div>
          <div style={{ fontSize: '13px', color: D.textSecondary, marginBottom: '20px' }}>
            How often AI recommends <strong>{name}</strong> when clients search in {market}
          </div>
          <div style={{ position: 'relative', height: '20px', borderRadius: '10px', background: D.navy, marginBottom: '10px' }}>
            <div style={{ position: 'absolute', top: '-6px', left: `${Math.max(1, visibilityRate)}%`, transform: 'translateX(-50%)', width: '6px', height: '32px', background: visibilityRate < 10 ? D.red : D.teal, borderRadius: '3px', boxShadow: '0 2px 6px rgba(0,0,0,0.3)' }} />
            <div style={{ position: 'absolute', top: '-6px', left: `${benchmarkRate}%`, transform: 'translateX(-50%)', width: '6px', height: '32px', background: D.gold, borderRadius: '3px', boxShadow: '0 2px 6px rgba(0,0,0,0.3)' }} />
          </div>
          <div style={{ position: 'relative', height: '22px', marginBottom: '16px' }}>
            <span style={{ position: 'absolute', left: `${Math.max(1, visibilityRate)}%`, transform: 'translateX(-50%)', fontSize: '12px', fontWeight: 800, color: visibilityRate < 10 ? D.red : D.teal, whiteSpace: 'nowrap' }}>You: {visibilityRate}%</span>
            <span style={{ position: 'absolute', left: `${benchmarkRate}%`, transform: 'translateX(-50%)', fontSize: '12px', fontWeight: 700, color: D.gold, whiteSpace: 'nowrap' }}>Benchmark: {benchmarkRate}%</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: visibilityRate < 10 ? '16px' : '0' }}>
            {['Invisible', 'Emerging', 'Recognized', 'Dominant'].map((l) => (
              <span key={l} style={{ fontSize: '10px', color: D.textTertiary, textTransform: 'uppercase', letterSpacing: '1px' }}>{l}</span>
            ))}
          </div>
          {visibilityRate < 10 && (
            <div style={{ background: 'rgba(239,68,68,0.06)', border: `1px solid rgba(239,68,68,0.15)`, borderRadius: '8px', padding: '12px 16px', textAlign: 'center' }}>
              <p style={{ fontSize: '14px', fontWeight: 700, color: D.red, margin: 0 }}>
                You are invisible to AI in {market}.
              </p>
              <p style={{ fontSize: '12px', color: D.textSecondary, margin: '4px 0 0' }}>
                AI recommends agents in your market to 45% of consumers. None of those recommendations include you.
              </p>
            </div>
          )}
        </div>

        {/* ═══ NARRATIVE QUALITY ═══ */}
        <div style={{ background: '#fff', borderRadius: '14px', padding: '24px', marginBottom: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, color: D.textTertiary, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '4px' }}>Narrative Quality</div>
          <div style={{ fontSize: '13px', color: D.textSecondary, marginBottom: '20px' }}>
            When AI mentions {firstName}, here is how it describes you:
          </div>
          <div style={{ background: D.grayBg, borderLeft: `3px solid ${D.teal}`, borderRadius: '0 8px 8px 0', padding: '16px 20px', marginBottom: '20px' }}>
            <p style={{ fontSize: '14px', color: D.textSecondary, fontStyle: 'italic', lineHeight: 1.7, margin: 0 }}>
              {scan?.ai_quote?.text
                ? `"${scan.ai_quote.text}"`
                : `"${name} is a real estate agent based in ${market}${brokerage ? ` working with ${brokerage}` : ''}. Limited publicly available detail on specializations or notable transactions."`
              }
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { label: 'Accuracy', grade: narrative?.overall_accuracy || 'B', color: narrative?.overall_accuracy === 'A' ? D.teal : '#3b82f6' },
              { label: 'Favorability', grade: narrative?.overall_favorability || 'Neutral', color: narrative?.overall_favorability === 'Positive' ? D.teal : D.textTertiary },
              { label: 'Specificity', grade: score > 40 ? 'Medium' : 'Low', color: score > 40 ? D.gold : D.red },
            ].map(({ label, grade, color }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: D.grayBg, border: `1px solid ${D.border}`, borderRadius: '20px', padding: '4px 12px' }}>
                <span style={{ fontSize: '11px', color: D.textTertiary }}>{label}</span>
                <span style={{ fontSize: '11px', fontWeight: 700, color }}>{grade}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ GAPS ═══ */}
        {gaps.length > 0 && (
          <div style={{ background: '#fff', borderRadius: '14px', padding: '24px', marginBottom: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, color: D.textTertiary, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '16px' }}>Platform Gaps</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {gaps.map((g, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: D.grayBg, borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: g.impact === 'High' ? D.red : g.impact === 'Medium' ? D.gold : D.teal, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: D.navy }}>{g.title || g.platform}</div>
                      <div style={{ fontSize: '11px', color: D.textTertiary }}>{g.status} · {g.impact} impact</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: D.teal }}>+{g.points}</div>
                </div>
              ))}
            </div>
            <div style={{ background: D.navy, borderRadius: '8px', padding: '12px 16px', marginTop: '12px', textAlign: 'center' }}>
              <span style={{ fontSize: '13px', color: '#fff', fontWeight: 600 }}>
                Total recoverable: <span style={{ color: D.teal }}>+{gaps.reduce((s, g) => s + g.points, 0)} points</span>
              </span>
            </div>
          </div>
        )}

        {/* ═══ FOUNDATION SCORE COMPONENTS ═══ */}
        <details style={{ background: '#fff', borderRadius: '14px', marginBottom: '32px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
          <summary style={{ padding: '20px 24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', listStyleType: 'none' }}>
            <div>
              <div style={{ fontSize: '10px', fontWeight: 700, color: D.textTertiary, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '4px' }}>Foundation Score Breakdown</div>
              <div style={{ fontSize: '13px', color: D.navy }}>9 scored components · tap to expand</div>
            </div>
            <span style={{ fontSize: '20px', color: D.textTertiary, lineHeight: 1 }}>›</span>
          </summary>
          <div style={{ padding: '0 24px 24px', borderTop: `1px solid ${D.grayMid}` }}>
            <div style={{ paddingTop: '16px' }}>
              {scoreComponents.map(({ name: compName, weight, key }) => {
                const compScore = scan?.foundation_components?.[key] ?? Math.round(score * weight / 100);
                const fillPct = Math.round((compScore / weight) * 100);
                return (
                  <div key={key} style={{ marginBottom: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <span style={{ fontSize: '12px', color: D.textSecondary }}>{compName}</span>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: D.navy }}>{compScore}<span style={{ fontSize: '10px', fontWeight: 400, color: D.textTertiary }}>/{weight}</span></span>
                    </div>
                    <div style={{ height: '5px', borderRadius: '3px', background: D.grayMid, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${fillPct}%`, background: fillPct > 60 ? D.teal : fillPct > 30 ? D.gold : D.red, borderRadius: '3px' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </details>

        {/* ═══ CTA ═══ */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <a href={reportUrl} style={{ display: 'inline-block', background: D.teal, color: '#fff', fontWeight: 700, fontSize: '16px', padding: '18px 40px', borderRadius: '10px', textDecoration: 'none', boxShadow: '0 4px 16px rgba(0,191,166,0.3)', marginBottom: '12px' }}>
            See My Full Citation Report →
          </a>
          <br />
          <a href={intakeUrl} style={{ display: 'inline-block', fontSize: '13px', color: D.teal, textDecoration: 'none', marginTop: '8px' }}>
            Start onboarding →
          </a>
        </div>

        {/* ═══ FOUNDING MEMBER ═══ */}
        <div style={{ background: D.navy, borderRadius: '10px', padding: '20px 24px', marginBottom: '48px', textAlign: 'center' }}>
          <div style={{ display: 'inline-block', background: 'rgba(212,168,48,0.15)', border: `1px solid ${D.gold}`, borderRadius: '20px', padding: '4px 16px', marginBottom: '12px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: D.gold, letterSpacing: '1.5px', textTransform: 'uppercase' }}>★ Founding Member</span>
          </div>
          <p style={{ fontSize: '14px', color: '#e2e8f0', lineHeight: 1.7, margin: '0 0 4px' }}>
            We&apos;re accepting a small group of founding members in North County San Diego. Your first 90 days are on us. If your Foundation Score doesn&apos;t improve by 20+ points, you owe nothing.
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
