import { notFound } from 'next/navigation';

// Score page prospects — add each prospect here before sending cold email
const prospects: Record<string, ProspectData> = {
  'maria-santos': {
    name: 'Maria Santos',
    brokerage: 'Compass',
    market: 'Carlsbad',
    score: 18,
    competitorScore: 47,
    gaps: [
      { platform: 'Google Business Profile', status: 'missing', impact: 'High' },
      { platform: 'FastExpert', status: 'missing', impact: 'High' },
      { platform: 'LinkedIn Articles', status: 'missing', impact: 'Medium' },
    ],
    projected90: 52,
  },
};

type Gap = {
  platform: string;
  status: string;
  impact: string;
};

type ProspectData = {
  name: string;
  brokerage: string;
  market: string;
  score: number;
  competitorScore: number;
  gaps: Gap[];
  projected90: number;
};

export default async function ScorePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const prospect = prospects[slug];
  if (!prospect) notFound();

  const { name, brokerage, market, score, competitorScore, gaps, projected90 } = prospect;
  const firstName = name.split(' ')[0];
  const scoreWidth = Math.round((score / 100) * 100);
  const competitorWidth = Math.round((competitorScore / 100) * 100);
  const projectedWidth = Math.round((projected90 / 100) * 100);

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif' }}>
      {/* Header */}
      <header style={{ background: '#0A1929', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '4px', color: '#00BFA6' }}>CITED</div>
          <div style={{ fontSize: '10px', color: '#6b8aaa', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '2px' }}>AI Visibility for Real Estate Professionals</div>
        </div>
      </header>

      <main style={{ maxWidth: '640px', margin: '0 auto', padding: '32px 20px' }}>

        {/* Intro */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#0A1929', margin: '0 0 8px' }}>
            {firstName}, here&apos;s your AI Visibility Score for {market}.
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
            {brokerage} · {market} · Generated {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {/* Score Card */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '28px', marginBottom: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <h2 style={{ fontSize: '13px', fontWeight: 700, color: '#94a3b8', letterSpacing: '1px', textTransform: 'uppercase', margin: '0 0 20px' }}>Citation Score — {market}</h2>

          {/* Your score */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a2e' }}>You ({name})</span>
              <span style={{ fontSize: '24px', fontWeight: 800, color: '#e53e3e' }}>{score}<span style={{ fontSize: '14px', color: '#94a3b8', fontWeight: 400 }}>/100</span></span>
            </div>
            <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px' }}>
              <div style={{ height: '8px', background: '#e53e3e', borderRadius: '4px', width: `${scoreWidth}%` }} />
            </div>
          </div>

          {/* Competitor */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a2e' }}>Top {market} Competitor</span>
              <span style={{ fontSize: '24px', fontWeight: 800, color: '#64748b' }}>{competitorScore}<span style={{ fontSize: '14px', color: '#94a3b8', fontWeight: 400 }}>/100</span></span>
            </div>
            <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px' }}>
              <div style={{ height: '8px', background: '#94a3b8', borderRadius: '4px', width: `${competitorWidth}%` }} />
            </div>
          </div>

          {/* Projected */}
          <div style={{ paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#00BFA6' }}>Your Projected Score (90 days)</span>
              <span style={{ fontSize: '24px', fontWeight: 800, color: '#00BFA6' }}>{projected90}<span style={{ fontSize: '14px', color: '#94a3b8', fontWeight: 400 }}>/100</span></span>
            </div>
            <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px' }}>
              <div style={{ height: '8px', background: '#00BFA6', borderRadius: '4px', width: `${projectedWidth}%` }} />
            </div>
          </div>
        </div>

        {/* Gaps */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '28px', marginBottom: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <h2 style={{ fontSize: '13px', fontWeight: 700, color: '#94a3b8', letterSpacing: '1px', textTransform: 'uppercase', margin: '0 0 16px' }}>What&apos;s Holding Your Score Back</h2>
          {gaps.map((gap, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: i < gaps.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: gap.impact === 'High' ? '#e53e3e' : '#f59e0b', flexShrink: 0 }} />
                <span style={{ fontSize: '14px', color: '#1a1a2e', fontWeight: 500 }}>{gap.platform}</span>
              </div>
              <span style={{ fontSize: '12px', fontWeight: 600, color: gap.impact === 'High' ? '#e53e3e' : '#f59e0b', background: gap.impact === 'High' ? '#fff5f5' : '#fffbeb', padding: '3px 10px', borderRadius: '20px' }}>
                {gap.impact} Impact
              </span>
            </div>
          ))}
        </div>

        {/* What Cited Does */}
        <div style={{ background: '#0A1929', borderRadius: '12px', padding: '28px', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '13px', fontWeight: 700, color: '#00BFA6', letterSpacing: '1px', textTransform: 'uppercase', margin: '0 0 16px' }}>How Cited Closes the Gap</h2>
          {[
            'We handle 87% of the work. You provide 15 minutes a month.',
            'Full platform optimization — GBP, FastExpert, LinkedIn, and more.',
            'Monthly AI-optimized articles published in your name.',
            'PRISM re-scans every 30 days to track your score.',
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'flex-start' }}>
              <span style={{ color: '#00BFA6', fontWeight: 700, flexShrink: 0 }}>→</span>
              <span style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: 1.6 }}>{item}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '28px', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0A1929', margin: '0 0 8px' }}>Ready to close the gap?</h2>
          <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 24px' }}>First 90 days free for founding clients. No commitment.</p>
          <a
            href="https://calendly.com/radleyraven/cited"
            style={{ display: 'inline-block', background: '#00BFA6', color: '#fff', fontWeight: 700, fontSize: '15px', padding: '14px 36px', borderRadius: '8px', textDecoration: 'none', letterSpacing: '0.3px' }}
          >
            Book a 15-Min Call →
          </a>
          <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '12px' }}>Or reply to Radley&apos;s email — we&apos;ll take it from there.</p>
        </div>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '12px', color: '#94a3b8' }}>
          Cited · AI Visibility for Real Estate Professionals · citedagent.com
        </div>
      </main>
    </div>
  );
}
