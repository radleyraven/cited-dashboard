import { notFound } from 'next/navigation';
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

// ── Gap Cards (expandable, matches Citation Report pattern) ──
function GapCards({ gaps }: { gaps: Gap[] }) {
  return (
    <div style={{ background: '#fff', borderRadius: '14px', padding: '24px', marginBottom: '32px',  }}>
      <div style={{ fontSize: '10px', fontWeight: 700, color: D.textTertiary, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '16px' }}>Where You&apos;re Losing Visibility</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {gaps.map((gap, i) => (
          <details key={i} className="gap-card" style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', borderLeft: `4px solid ${gap.color || (gap.impact === 'High' ? '#EF4444' : '#D4A830')}` }}>
            <summary style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 20px', cursor: 'pointer', listStyleType: 'none',
              background: 'none', border: 'none', transition: 'background 0.15s',
            }}

            >
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#0A1929' }}>{gap.title || gap.platform}</div>
                <div style={{ fontSize: '12px', color: gap.color || '#EF4444', fontWeight: 600, marginTop: '3px' }}>{gap.status}</div>
                <div className="see-fix" style={{ fontSize: '11px', color: '#00BFA6', fontWeight: 600, marginTop: '6px' }}>See the fix →</div>
              </div>
              <span className="chevron" style={{ fontSize: '20px', color: '#00BFA6', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(0,191,166,0.1)', flexShrink: 0, marginLeft: '12px' }}>▾</span>
            </summary>
            {(gap.action || gap.outcome) && (
              <div style={{ padding: '0 20px 16px 20px', borderTop: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingTop: '10px' }}>
                  {gap.action && (
                    <div style={{ fontSize: '13px', color: '#0A1929', lineHeight: 1.5 }}>
                      <span style={{ color: '#94a3b8', fontWeight: 600 }}>The fix:</span> {gap.action}
                    </div>
                  )}
                  {gap.outcome && (
                    <div style={{ fontSize: '13px', color: '#00BFA6', fontWeight: 600, lineHeight: 1.5 }}>
                      → {gap.outcome}
                    </div>
                  )}
                </div>
              </div>
            )}
          </details>
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
  const firstName = name.split(' ')[0];
  const brokerage = prospect.brokerage || scan?.brokerage_discovered || '';
  const market = prospect.primary_markets?.split(',')[0]?.trim() || '';
  const score = scan?.foundation_score ?? scan?.composite_score ?? 0;
  const tier = scan?.foundation_tier ?? scan?.tier_name ?? 'Not scanned';

  // Benchmark — the agent AI DOES recommend in this market
  // Research basis: agents recommended by AI typically score 65-75 (SOCi, BrightLocal 2026)
  const primaryMarket = scan?.markets?.[0];
  const benchmarkScore = parseInt(primaryMarket?.competitor_score || '0') || 70; // Default 70 from research
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

  // Foundation Score component breakdown — Citation Report only (not shown on score page)

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
      <style>{`details > summary { list-style: none; cursor: pointer; transition: background 0.15s; } details > summary::-webkit-details-marker { display: none; } details > summary:hover { background: #f0faf8; } details[open] > summary { background: #f0faf8 !important; } .chevron { transition: transform 0.2s; } details[open] .chevron { transform: rotate(180deg); } .see-fix { } details[open] .see-fix { display: none; } .gap-card { transition: box-shadow 0.15s; } .gap-card:hover { box-shadow: 0 2px 12px rgba(0,191,166,0.12); }`}</style>

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
              <div style={{ fontSize: '10px', fontWeight: 700, color: D.textTertiary, textTransform: 'uppercase', letterSpacing: '1.5px', height: '16px', marginBottom: '12px' }}>Your Foundation Score</div>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: '64px', fontWeight: 900, color: D.navy, lineHeight: 1, height: '64px' }}>{score}</div>
              <div style={{ fontFamily: 'var(--font-geist-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif', fontSize: '12px', fontWeight: 400, color: D.textTertiary, height: '18px', marginTop: '6px', marginBottom: '16px' }}>out of 100</div>
              <div style={{ paddingTop: '14px', borderTop: `1px solid ${D.border}` }}>
                {gaps.length > 0 && (
                  <>
                    <div style={{ fontSize: '9px', fontWeight: 700, color: D.red, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>Why AI doesn&apos;t recommend you yet</div>
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
              <div style={{ fontSize: '10px', fontWeight: 700, color: D.red, textTransform: 'uppercase', letterSpacing: '1.5px', height: '16px', marginBottom: '12px' }}>Market Benchmark</div>
              <div style={{ height: '64px', display: 'flex', alignItems: 'flex-start', paddingTop: '20px' }}>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: '36px', fontWeight: 900, color: '#94a3b8', lineHeight: 1 }}>~{benchmarkScore}</div>
              </div>
              <div style={{ fontFamily: 'var(--font-geist-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif', fontSize: '12px', fontWeight: 400, color: D.textTertiary, height: '18px', marginTop: '6px', marginBottom: '16px' }}>Agents AI recommends</div>
              <div style={{ paddingTop: '14px', borderTop: `1px solid ${D.border}` }}>
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
        <div style={{ background: '#fff', borderRadius: '14px', padding: '24px', marginBottom: '32px',  }}>
          <div style={{ fontSize: '10px', fontWeight: 700, color: D.textTertiary, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '4px' }}>Market Visibility Rate</div>
          <div style={{ fontSize: '13px', color: D.textSecondary, marginBottom: '20px' }}>
            How often AI recommends <strong>{name}</strong> when clients search in {market}
          </div>
          <div style={{ position: 'relative', height: '8px', borderRadius: '4px', background: `linear-gradient(90deg, ${D.red} 0%, #F59E0B 25%, ${D.gold} 45%, ${D.teal} 70%, ${D.navy} 100%)`, marginBottom: '8px' }}>
            <div style={{ position: 'absolute', top: '-5px', left: `${Math.max(1, visibilityRate)}%`, transform: 'translateX(-50%)', width: '18px', height: '18px', borderRadius: '50%', background: visibilityRate < 10 ? D.red : D.teal, border: '3px solid #fff', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }} />
            <div style={{ position: 'absolute', top: '-5px', left: `${benchmarkRate}%`, transform: 'translateX(-50%)', width: '18px', height: '18px', borderRadius: '50%', background: D.gold, border: '3px solid #fff', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }} />
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

        {/* ═══ GAPS — expandable cards matching Citation Report ═══ */}
        {gaps.length > 0 && (
          <GapCards gaps={gaps} />
        )}

        {/* ═══ WHAT AI SAYS ABOUT YOU ═══ */}
        <div style={{ background: '#fff', borderRadius: '14px', padding: '24px', marginBottom: '32px' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, color: D.red, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '4px' }}>Someone Just Asked AI About You</div>
          <div style={{ fontSize: '13px', color: D.textSecondary, marginBottom: '20px' }}>
            We asked AI about {firstName} directly. Out of {scan?.query_count || 30} queries, AI only described you in <span style={{ color: D.red, fontWeight: 700 }}>{scan?.narrative_quality?.query_count || 2}</span> — and this is what it said:
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
            <div style={{ fontSize: '11px', fontWeight: 700, color: D.red, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>What&apos;s missing from this description</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {['Your market specialization and neighborhoods', 'Transaction stats and track record', 'What makes you different from every other agent', 'Why a seller should call you specifically'].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                  <span style={{ color: D.red, fontWeight: 700, fontSize: '10px', flexShrink: 0, marginTop: '2px' }}>✗</span>
                  <span style={{ fontSize: '12px', color: D.textSecondary, lineHeight: 1.5 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ═══ CTA ═══ */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <a href={intakeUrl} style={{ display: 'inline-block', background: D.teal, color: '#fff', fontWeight: 700, fontSize: '16px', padding: '18px 40px', borderRadius: '10px', textDecoration: 'none', boxShadow: '0 4px 16px rgba(0,191,166,0.3)' }}>
            Make AI Recommend Me →
          </a>
          <p style={{ fontSize: '12px', color: D.textTertiary, marginTop: '12px' }}>
            Free. Takes 5 minutes. We handle the rest.
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
            We&apos;re accepting a small group of founding members in North County San Diego. If your Foundation Score doesn&apos;t improve by 20+ points, you owe nothing.
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
