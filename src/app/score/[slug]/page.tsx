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
      { platform: 'Google Reviews (keyword-rich)', status: 'missing', impact: 'Low', points: 5 },
      { platform: 'FastExpert', status: 'missing', impact: 'Low', points: 4 },
      { platform: 'Bing Places', status: 'missing', impact: 'Low', points: 4 },
      { platform: 'Apple Business Connect', status: 'missing', impact: 'Low', points: 3 },
      { platform: 'GBP Posts (freshness)', status: 'missing', impact: 'Low', points: 3 },
    ],
  },
};

function ScoreCircle({ score, color, size = 100 }: { score: number; color: string; size?: number }) {
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
  const prospect = prospects[slug];
  if (!prospect) notFound();

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
          <div style={{ fontSize: '10px', color: '#4a6380', letterSpacing: '1.5px', textTransform: 'uppercase', marginTop: '3px' }}>AI Visibility for Real Estate Professionals</div>
        </div>
        <div style={{ fontSize: '11px', color: '#4a6380', textAlign: 'right' }}>
          Powered by <span style={{ color: '#00BFA6', fontWeight: 700 }}>PRISM</span>
        </div>
      </header>

      {/* Gold accent line */}
      <div style={{ height: '3px', background: 'linear-gradient(90deg, #D4A830 0%, #00BFA6 100%)' }} />

      <main style={{ maxWidth: '660px', margin: '0 auto', padding: '36px 20px 48px' }}>

        {/* Intro */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0A1929', margin: '0 0 6px', lineHeight: 1.3 }}>
            {firstName}, here&apos;s your AI Visibility Score for {market}.
          </h1>
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
            {brokerage} · {market} · Generated {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {/* Score Circles */}
        <div style={{ background: '#fff', borderRadius: '14px', padding: '32px 28px', marginBottom: '20px', boxShadow: '0 1px 6px rgba(0,0,0,0.07)', border: '1px solid #e8edf2' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '28px' }}>
            Citation Score — {market}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', textAlign: 'center' }}>

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

            {/* Projected */}
            <div>
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

          {/* Gap between current and competitor */}
          <div style={{ marginTop: '24px', padding: '12px 16px', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca', textAlign: 'center' }}>
            <span style={{ fontSize: '13px', color: '#dc2626', fontWeight: 600 }}>
              You&apos;re {competitorScore - score} points behind the top competitor in {market}.
            </span>
          </div>
        </div>

        {/* Gaps + Projected breakdown */}
        <div style={{ background: '#fff', borderRadius: '14px', padding: '28px', marginBottom: '20px', boxShadow: '0 1px 6px rgba(0,0,0,0.07)', border: '1px solid #e8edf2' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '16px' }}>
            What&apos;s Holding Your Score Back
          </div>

          {/* Show top 4 gaps prominently: GBP + LinkedIn Profile + Zillow + wildcard */}
          {gaps.filter(g => g.impact === 'High' || g.impact === 'Medium').slice(0, 4).map((gap, i, arr) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '13px 0',
              borderBottom: i < arr.length - 1 ? '1px solid #f1f5f9' : 'none'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
                  background: gap.impact === 'High' ? '#dc2626' : '#f59e0b'
                }} />
                <span style={{ fontSize: '14px', color: '#1a1a2e', fontWeight: 500 }}>{gap.platform}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '13px', color: '#00BFA6', fontWeight: 700 }}>+{gap.points} pts</span>
                <span style={{
                  fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px',
                  color: gap.impact === 'High' ? '#dc2626' : '#f59e0b',
                  background: gap.impact === 'High' ? '#fef2f2' : '#fffbeb'
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
        </div>

        {/* How Cited Works */}
        <div style={{ background: '#0A1929', borderRadius: '14px', padding: '28px', marginBottom: '20px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#D4A830', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '16px' }}>
            How Cited Closes the Gap
          </div>
          {[
            { icon: '→', text: 'We handle 87% of the work. You provide 15 minutes a month.' },
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
            First 90 days free. No commitment.
          </h2>
          <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 24px', lineHeight: 1.6 }}>
            3–5 founding spots available in {market}.<br />
            After 90 days, continue at $800/month — only if the score moved.
          </p>

          {/* Primary */}
          <a href="https://citedagent.com/intake" style={{ display: 'block', background: '#00BFA6', color: '#fff', fontWeight: 700, fontSize: '15px', padding: '15px 36px', borderRadius: '8px', textDecoration: 'none', letterSpacing: '0.3px', marginBottom: '10px' }}>
            Claim Your Founding Spot →
          </a>

          {/* Secondary */}
          <a href="https://calendly.com/radleyraven/cited" style={{ display: 'block', background: '#fff', color: '#0A1929', fontWeight: 600, fontSize: '14px', padding: '13px 36px', borderRadius: '8px', textDecoration: 'none', border: '1.5px solid #e2e8f0', marginBottom: '10px' }}>
            Book a 15-Min Call First
          </a>

          {/* Tertiary */}
          <a href="/how-it-works" style={{ display: 'block', fontSize: '13px', color: '#00BFA6', fontWeight: 600, textDecoration: 'none', padding: '6px 0' }}>
            Learn more about how Cited works →
          </a>

          <p style={{ fontSize: '12px', color: '#94a3b8', margin: '12px 0 0' }}>Questions? Reply directly to Radley&apos;s email.</p>
        </div>

        <div style={{ textAlign: 'center', marginTop: '28px', fontSize: '11px', color: '#94a3b8' }}>
          Cited · AI Visibility for Real Estate Professionals · citedagent.com
          <br />
          <span style={{ color: '#cbd5e1' }}>Powered by PRISM · Professional Recognition Index for Search Models</span>
        </div>
      </main>
    </div>
  );
}
