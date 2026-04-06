export default function ThirtyDaysPage() {
  const weeks = [
    {
      week: 'Week 1',
      title: 'We audit. You do nothing.',
      color: '#D4A830',
      items: [
        'Full PRISM scan across ChatGPT, Claude, Perplexity, and Gemini for your markets',
        'Audit every platform — what exists, what\'s missing, what\'s misrepresenting you',
        'Build your profile optimization plan and bio vault',
        'Research your top 3 competitors\' visibility signals',
      ],
      yourTime: '0 minutes',
    },
    {
      week: 'Week 2',
      title: 'Your profiles get fixed. You review.',
      color: '#00BFA6',
      items: [
        'Google Business Profile claimed and fully optimized',
        'LinkedIn profile rewritten — headline, about section, markets, expertise',
        'Zillow bio updated with AI-optimized keyword structure',
        'All copy delivered to you for a quick review before anything goes live',
      ],
      yourTime: '15 minutes',
    },
    {
      week: 'Week 3',
      title: 'Your first article gets written. You answer 5 questions.',
      color: '#00BFA6',
      items: [
        'We send you a brief — 5 quick questions about your market perspective',
        'We write a full authority article in your voice for your target market',
        'You review the draft and approve (or request one round of edits)',
        'Article staged and ready to publish to LinkedIn',
      ],
      yourTime: '10 minutes',
    },
    {
      week: 'Week 4',
      title: 'Article live. Score moves. You see it.',
      color: '#D4A830',
      items: [
        'Article published to LinkedIn under your name',
        'Distributed across GBP, Nextdoor, and any other active channels',
        'PRISM re-scan run — your new score vs. your baseline',
        'Month 1 report delivered: what moved, what\'s next, what to expect in 60 days',
      ],
      yourTime: '5 minutes',
    },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif' }}>

      {/* Header */}
      <header style={{ background: '#0A1929', padding: '20px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '5px', color: '#00BFA6' }}>CITED</div>
          <div style={{ fontSize: '10px', color: '#4a6380', letterSpacing: '1.5px', textTransform: 'uppercase', marginTop: '3px' }}>AI Visibility for Real Estate Professionals</div>
        </div>
        <div style={{ fontSize: '11px', color: '#4a6380' }}>
          Powered by <span style={{ color: '#00BFA6', fontWeight: 700 }}>PRISM</span>
        </div>
      </header>
      <div style={{ height: '3px', background: 'linear-gradient(90deg, #D4A830 0%, #00BFA6 100%)' }} />

      <main style={{ maxWidth: '680px', margin: '0 auto', padding: '40px 20px 56px' }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: '44px' }}>
          <div style={{ display: 'inline-block', background: '#0A1929', color: '#D4A830', fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', padding: '6px 16px', borderRadius: '20px', marginBottom: '16px' }}>
            Your First 30 Days
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0A1929', margin: '0 0 12px', lineHeight: 1.3 }}>
            30 minutes of your time.<br />Everything else is us.
          </h1>
          <p style={{ fontSize: '15px', color: '#64748b', margin: 0, lineHeight: 1.7, maxWidth: '480px', marginLeft: 'auto', marginRight: 'auto' }}>
            Here&apos;s exactly what happens after you join — week by week, what we do, and what we need from you.
          </p>
        </div>

        {/* Timeline */}
        <div style={{ position: 'relative' }}>
          {/* Vertical line */}
          <div style={{ position: 'absolute', left: '28px', top: '20px', bottom: '20px', width: '2px', background: '#e2e8f0', zIndex: 0 }} />

          {weeks.map((w, i) => (
            <div key={i} style={{ position: 'relative', display: 'flex', gap: '24px', marginBottom: i < weeks.length - 1 ? '28px' : 0 }}>
              {/* Circle */}
              <div style={{
                width: '58px', height: '58px', borderRadius: '50%', flexShrink: 0,
                background: w.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 1, boxShadow: '0 2px 8px rgba(0,0,0,0.12)'
              }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#0A1929', textAlign: 'center', lineHeight: 1.2 }}>
                  WK<br />{i + 1}
                </span>
              </div>

              {/* Card */}
              <div style={{ flex: 1, background: '#fff', borderRadius: '12px', padding: '22px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', border: '1px solid #e8edf2' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: w.color, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>{w.week}</div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#0A1929' }}>{w.title}</div>
                  </div>
                  <div style={{ flexShrink: 0, textAlign: 'right' }}>
                    <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Your time</div>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: w.yourTime === '0 minutes' ? '#dc2626' : '#0A1929' }}>{w.yourTime}</div>
                  </div>
                </div>
                {w.items.map((item, j) => (
                  <div key={j} style={{ display: 'flex', gap: '10px', marginBottom: j < w.items.length - 1 ? '8px' : 0, alignItems: 'flex-start' }}>
                    <span style={{ color: w.color, fontWeight: 700, flexShrink: 0, fontSize: '13px', marginTop: '1px' }}>→</span>
                    <span style={{ fontSize: '13px', color: '#4a5568', lineHeight: 1.6 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Total time summary */}
        <div style={{ background: '#0A1929', borderRadius: '12px', padding: '24px 28px', margin: '36px 0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#D4A830', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '6px' }}>Total time from you — Month 1</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#ffffff' }}>~30 minutes</div>
            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Review, approve, answer 5 questions. That&apos;s it.</div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#00BFA6', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '6px' }}>What you get</div>
            <div style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.7 }}>
              Optimized profiles<br />
              1 published article<br />
              PRISM re-scan<br />
              Month 1 report
            </div>
          </div>
        </div>

        {/* What months 2-3 look like */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '24px 28px', marginBottom: '28px', border: '1px solid #e8edf2', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '14px' }}>Months 2 &amp; 3 — Same Rhythm</div>
          {[
            'One new article per month — 10 minutes of your input, we write and publish',
            'Monthly PRISM re-scan — you see your score move in real time',
            'Profile maintenance — we update bios, respond to reviews, keep everything fresh',
            'Monthly report — what moved, what\'s next, what\'s coming',
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: i < 3 ? '10px' : 0, alignItems: 'flex-start' }}>
              <span style={{ color: '#00BFA6', fontWeight: 700, flexShrink: 0 }}>→</span>
              <span style={{ fontSize: '13px', color: '#4a5568', lineHeight: 1.6 }}>{item}</span>
            </div>
          ))}
        </div>

        {/* CTA block */}
        <div style={{ background: '#fff', borderRadius: '14px', padding: '32px 28px', textAlign: 'center', boxShadow: '0 1px 6px rgba(0,0,0,0.07)', border: '1px solid #e8edf2' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#D4A830', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '12px' }}>
            Founding Client Offer
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0A1929', margin: '0 0 8px' }}>
            First 90 days free. No commitment.
          </h2>
          <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 28px', lineHeight: 1.6 }}>
            3–5 founding spots available in North County San Diego.<br />
            After 90 days, continue at $800/month — only if the score moved.
          </p>

          {/* Primary CTA */}
          <a
            href="https://citedagent.com/intake"
            style={{
              display: 'block', background: '#00BFA6', color: '#fff',
              fontWeight: 700, fontSize: '15px', padding: '16px 36px',
              borderRadius: '8px', textDecoration: 'none', letterSpacing: '0.3px',
              marginBottom: '12px'
            }}
          >
            Claim Your Founding Spot →
          </a>

          {/* Secondary CTA */}
          <a
            href="https://calendly.com/radleyraven/cited"
            style={{
              display: 'block', background: '#fff', color: '#0A1929',
              fontWeight: 600, fontSize: '14px', padding: '14px 36px',
              borderRadius: '8px', textDecoration: 'none',
              border: '1.5px solid #e2e8f0'
            }}
          >
            Book a 15-Min Call First
          </a>

          <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '14px', margin: '14px 0 0' }}>
            Questions? Reply directly to Radley&apos;s email.
          </p>
        </div>

        <div style={{ textAlign: 'center', marginTop: '28px', fontSize: '11px', color: '#94a3b8' }}>
          Cited · AI Visibility for Real Estate Professionals · citedagent.com<br />
          <span style={{ color: '#cbd5e1' }}>Powered by PRISM · Professional Recognition Index for Search Models</span>
        </div>
      </main>
    </div>
  );
}
