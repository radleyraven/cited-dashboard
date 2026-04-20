export default function HowItWorksPage() {
  const faqs = [
    {
      q: 'I don\'t actually believe AI recommends specific agents. Does this really happen?',
      a: 'Yes — and you can test it right now. Open ChatGPT or Perplexity and type "who are the best real estate agents in [your market]?" You\'ll get 1–3 names. The agents on that list didn\'t get there by accident — they have the right platform signals in place. The agents not on the list (likely including you) don\'t exist to that seller or buyer before they ever pick up the phone.',
    },
    {
      q: 'I already have a Google Business Profile. Doesn\'t that cover it?',
      a: 'Claiming a Google Business Profile is step one. Optimizing it for AI citation is different — it requires a specific structure in your description, consistent NAP data across all platforms, active posts, and keyword-specific reviews. Most claimed GBPs score in the low range because claiming ≠ optimizing. We write the optimized copy — you paste it in.',
    },
    {
      q: 'Why hasn\'t my current marketing company done this?',
      a: 'Because it didn\'t exist 18 months ago. Traditional marketing companies optimize for Google rankings and social engagement. AI citation is a different system with different signals — most marketing companies are still catching up. This is where SEO was in 2005: the people who moved first owned the next decade. Cited is built specifically for this shift.',
    },
    {
      q: 'What happens at Day 91 if I\'m not thrilled?',
      a: 'Nothing. You walk away, you keep everything we\'ve built (all profile optimizations, all content, all platform setups — it\'s yours). There\'s no invoice, no awkward call. If your score didn\'t move by at least 20 points, you don\'t owe us anything. That\'s the Citation Guarantee™.',
    },
    {
      q: 'Who else in my market is doing this?',
      a: 'Very few. By our analysis, fewer than 5% of agents in any market are actively optimizing for AI citation visibility right now. We\'re currently working with a small founding cohort — we don\'t publish their names publicly while they\'re building their competitive advantage. That\'s the point of moving first.',
    },
  ];

  const valueStack = [
    { item: 'Foundation Score Audit + PRISM Baseline Scan', value: 250 },
    { item: 'Google Business Profile claim + full optimization', value: 400 },
    { item: 'LinkedIn profile rewrite — location, markets, expertise signals', value: 350 },
    { item: 'Zillow + Realtor.com bio rewrites for AI keyword structure', value: 300 },
    { item: 'FastExpert + Bing Places + Apple Business profile builds', value: 300 },
    { item: 'AI citation satellite site — built with RealEstateAgent schema, hosted, and maintained by Cited', value: 500 },
    { item: 'Month 1 authority article (written in your voice, published)', value: 500 },
    { item: 'Monthly PRISM re-scans across 9 AI engines (3 months)', value: 450 },
    { item: 'Monthly performance reports — score, platform, next steps (3 months)', value: 300 },
  ];

  const weeks = [
    { week: 'Week 1', title: 'We audit. You do nothing.', time: '0 min', color: '#D4A830', detail: 'Full business and visibility audit — we examine your transaction history, AI footprint across 13+ platforms, and market opportunity gaps. Optimization plan built.' },
    { week: 'Week 2', title: 'Copy kit ready. You review.', time: '15 min', color: '#00BFA6', detail: 'Your Copy Kit written and ready — optimized bios for 13+ platforms, each structured for AI citation. You review the positioning, approve it, and paste the copy into each platform. Your positioning approval triggers this step.' },
    { week: 'Week 3', title: 'Article written. You answer 3 questions.', time: '3 min', color: '#00BFA6', detail: 'Article brief: 3 questions, 3 minutes. We write the article in your voice. Posting it to LinkedIn IS your approval — no separate step needed.' },
    { week: 'Week 4', title: 'Article live. Score moves. You see it.', time: '5 min', color: '#D4A830', detail: 'Article live and indexing. First AI signals visible within 7-14 days on Perplexity. Full PRISM re-scan at Day 30.' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif' }}>

      {/* Header */}
      <header style={{ background: '#0A1929', padding: '20px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <a href="/" style={{ textDecoration: 'none' }}>
            <div style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '5px', color: '#00BFA6' }}>CITED</div>
          </a>
          <div style={{ fontSize: '10px', color: '#4a6380', letterSpacing: '1.5px', textTransform: 'uppercase', marginTop: '3px' }}>AI Citation Optimization™</div>
        </div>
        <div style={{ fontSize: '11px', color: '#4a6380' }}>Powered by <span style={{ color: '#00BFA6', fontWeight: 700 }}>PRISM™</span></div>
      </header>
      <div style={{ height: '3px', background: 'linear-gradient(90deg, #00BFA6, #D4A830, #00BFA6)' }} />

      <main style={{ maxWidth: '720px', margin: '0 auto', padding: '48px 20px 64px' }}>

        {/* ── SECTION 1: The Problem ── */}
        <div style={{ marginBottom: '56px' }}>
          <div style={{ display: 'inline-block', background: '#0A1929', color: '#D4A830', fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', padding: '6px 16px', borderRadius: '20px', marginBottom: '20px' }}>
            The Problem
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#0A1929', margin: '0 0 12px', lineHeight: 1.25 }}>
            Traditional Google rankings are no longer enough.<br />AI is now the first stop — and most agents are invisible to it.
          </h1>
          <p style={{ fontSize: '17px', fontStyle: 'italic', color: '#00BFA6', fontWeight: 600, margin: '0 0 16px', lineHeight: 1.5 }}>
            AI cites agents it already knows. We make sure it knows you.
          </p>
          <p style={{ fontSize: '16px', color: '#4a5568', lineHeight: 1.8, margin: '0 0 20px' }}>
            Sellers and buyers used to Google an agent&apos;s name and scroll through results. Now they ask ChatGPT, Perplexity, Google AI Overviews, and Gemini — and those systems surface 1–3 names. Not a directory. A short list of agents AI already knows. And traditional SEO doesn&apos;t influence any of them. <span style={{ fontSize: '13px', color: '#94a3b8' }}>(BrightLocal, 2026)</span>
          </p>
          <p style={{ fontSize: '16px', color: '#4a5568', lineHeight: 1.8, margin: 0 }}>
            The agents who get recommended have something in common: their information exists in the right places, in the right format, for AI to read and cite. It has nothing to do with how good they are. It&apos;s a data problem — and it&apos;s fixable.
          </p>
        </div>

        {/* ── SECTION 2: What Cited Does ── */}
        <div style={{ marginBottom: '56px' }}>
          <div style={{ display: 'inline-block', background: '#0A1929', color: '#D4A830', fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', padding: '6px 16px', borderRadius: '20px', marginBottom: '20px' }}>
            What Cited Does
          </div>
          <h2 style={{ fontSize: '26px', fontWeight: 700, color: '#0A1929', margin: '0 0 24px' }}>
            Three things. That&apos;s the whole system.
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            {[
              { num: '01', title: 'Optimize', desc: 'We fix every platform AI reads — GBP, LinkedIn, Zillow, FastExpert, Bing, Apple. Each one structured for AI citation.' },
              { num: '02', title: 'Create', desc: 'One AI-optimized article per month, written in your voice, targeting your markets. Published under your name after you approve.' },
              { num: '03', title: 'Monitor', desc: 'Monthly PRISM re-scans across 9 AI engines. You see exactly what moved, what\'s next, and how you compare to competitors.' },
            ].map((item, i) => (
              <div key={i} style={{ background: '#0A1929', borderRadius: '12px', padding: '24px 20px' }}>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#D4A830', marginBottom: '8px' }}>{item.num}</div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>{item.title}</div>
                <div style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6 }}>{item.desc}</div>
              </div>
            ))}
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px 20px', textAlign: 'center' }}>
            <span style={{ fontSize: '15px', fontWeight: 700, color: '#0A1929' }}>
              &ldquo;We handle 87% of the work. You provide ~30 minutes to get started, 15 minutes per month after that.&rdquo;
            </span>
          </div>
        </div>

        {/* ── SECTION 3: How We Do It (30-day timeline) ── */}
        <div style={{ marginBottom: '56px' }}>
          <div style={{ display: 'inline-block', background: '#0A1929', color: '#D4A830', fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', padding: '6px 16px', borderRadius: '20px', marginBottom: '20px' }}>
            How It Works
          </div>
          <h2 style={{ fontSize: '26px', fontWeight: 700, color: '#0A1929', margin: '0 0 8px' }}>Your first 30 days.</h2>
          <p style={{ fontSize: '15px', color: '#64748b', margin: '0 0 28px' }}>Week by week — what we do, and what we need from you.</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            {weeks.map((w, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #e8edf2', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: w.color, letterSpacing: '1px', textTransform: 'uppercase' }}>{w.week}</div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>Your time</div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: w.time === '0 min' ? '#dc2626' : '#0A1929' }}>{w.time}</div>
                  </div>
                </div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#0A1929', marginBottom: '6px' }}>{w.title}</div>
                <div style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.6 }}>{w.detail}</div>
              </div>
            ))}
          </div>

          <div style={{ background: '#0A1929', borderRadius: '10px', padding: '18px 24px', marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#D4A830', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>Total — Month 1</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#fff' }}>~30 minutes</div>
            </div>
            <div style={{ fontSize: '13px', color: '#64748b', textAlign: 'right', lineHeight: 1.7 }}>
              Optimized profiles<br />1 published article<br />PRISM re-scan + report
            </div>
          </div>
        </div>

        {/* ── SECTION 4: Why Now ── */}
        <div style={{ marginBottom: '56px', background: '#fff', borderRadius: '14px', padding: '36px 32px', border: '1px solid #e8edf2', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'inline-block', background: '#0A1929', color: '#D4A830', fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', padding: '6px 16px', borderRadius: '20px', marginBottom: '20px' }}>
            Why Now
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0A1929', margin: '0 0 14px' }}>
            This is where SEO was in 2005.
          </h2>
          <p style={{ fontSize: '15px', color: '#4a5568', lineHeight: 1.8, margin: '0 0 14px' }}>
            In 2005, most businesses didn&apos;t have a website. The ones that built them early dominated search results for years before competitors caught up. The same shift is happening now with AI.
          </p>
          <p style={{ fontSize: '15px', color: '#4a5568', lineHeight: 1.8, margin: 0 }}>
            By our analysis, fewer than 5% of agents in any market have AI-optimized visibility. The window to be the agent AI recommends — before every other agent in your market figures this out — is open. It won&apos;t stay open.
          </p>
        </div>

        {/* ── SECTION 5: Proof ── */}
        <div style={{ marginBottom: '56px' }}>
          <div style={{ display: 'inline-block', background: '#0A1929', color: '#D4A830', fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', padding: '6px 16px', borderRadius: '20px', marginBottom: '20px' }}>
            Proof
          </div>
          <h2 style={{ fontSize: '26px', fontWeight: 700, color: '#0A1929', margin: '0 0 8px' }}>Client Zero — Radley Raven.</h2>
          <p style={{ fontSize: '15px', color: '#64748b', margin: '0 0 24px' }}>Before building Cited for others, we built it for ourselves.</p>

          <div style={{ background: '#fff', borderRadius: '12px', padding: '28px', border: '1px solid #e8edf2', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.7, marginBottom: '12px' }}>
                At baseline scan, Radley Raven — 10-year Carmel Valley agent with $91M+ career volume — was not mentioned in a single AI query for his primary market. Zero citations across ChatGPT, Perplexity, and Google AI when buyers searched for Carmel Valley agents. Foundation Score: <strong style={{ color: '#dc2626' }}>35/100</strong>.
              </div>
              <div style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.7 }}>
                That’s the baseline. Production volume doesn’t create AI citations. Structured digital presence does. That’s exactly what Cited builds.
              </div>
            </div>
            <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '14px 16px', fontSize: '13px', color: '#4a5568', lineHeight: 1.6, textAlign: 'center' }}>
              Radley Raven · The Oppenheim Group · Carmel Valley, CA · 10 years · $91M+ career volume · Foundation Score: 35/100 at baseline
            </div>
          </div>
        </div>

        {/* ── SECTION 6: Pricing + Value Stack ── */}
        <div style={{ marginBottom: '56px' }}>
          <div style={{ display: 'inline-block', background: '#0A1929', color: '#D4A830', fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', padding: '6px 16px', borderRadius: '20px', marginBottom: '20px' }}>
            Founding Offer
          </div>
          <h2 style={{ fontSize: '26px', fontWeight: 700, color: '#0A1929', margin: '0 0 8px' }}>
            Here&apos;s everything you get. Here&apos;s what it&apos;s worth.
          </h2>
          <p style={{ fontSize: '15px', color: '#64748b', margin: '0 0 8px', lineHeight: 1.7 }}>
            A few select agents. First 90 days free.
          </p>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 24px', lineHeight: 1.7 }}>
            Founding members get a full <span style={{ color: '#D4A830', fontWeight: 600 }}>PRISM Scan™</span> — 1,700+ queries across 9 AI engines, complete gap analysis, competitor intelligence, and a 90-day optimization plan.
          </p>

          {/* Value stack */}
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e8edf2', overflow: 'hidden', marginBottom: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            {valueStack.map((row, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '14px 20px',
                borderBottom: i < valueStack.length - 1 ? '1px solid #f1f5f9' : 'none',
                background: i % 2 === 0 ? '#fff' : '#fafbfc'
              }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span style={{ color: '#00BFA6', fontWeight: 700, flexShrink: 0 }}>→</span>
                  <span style={{ fontSize: '13px', color: '#374151' }}>{row.item}</span>
                </div>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#94a3b8', flexShrink: 0, marginLeft: '16px' }}>${row.value.toLocaleString()}</span>
              </div>
            ))}
            {/* Total */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: '#0A1929' }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>Total value (90 days)</span>
              <span style={{ fontSize: '18px', fontWeight: 800, color: '#D4A830' }}>
                ${valueStack.reduce((a, r) => a + r.value, 0).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Price + guarantee */}
          <div style={{ background: '#0A1929', borderRadius: '12px', padding: '24px 28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#D4A830', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>Your Price</div>
                <div style={{ fontSize: '32px', fontWeight: 900, color: '#fff' }}>$0 <span style={{ fontSize: '16px', color: '#64748b', fontWeight: 400 }}>for 90 days</span></div>
                <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Founding members: completely free for 90 days.</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '14px', color: '#fff', fontWeight: 600, maxWidth: '200px', lineHeight: 1.5 }}>The Citation Guarantee™ — 20 points in 90 days or you owe nothing. Ever.</div>
              </div>
            </div>
            {[
              'No setup fees. No contracts. No awkward conversations.',
              'All profile optimizations are yours to keep, regardless.',
              'Cancel anytime after the founding period.',
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '8px', alignItems: 'center' }}>
                <span style={{ color: '#00BFA6', fontWeight: 700 }}>✓</span>
                <span style={{ fontSize: '13px', color: '#64748b' }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── SECTION 7: FAQ ── */}
        <div style={{ marginBottom: '56px' }}>
          <div style={{ display: 'inline-block', background: '#0A1929', color: '#D4A830', fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', padding: '6px 16px', borderRadius: '20px', marginBottom: '20px' }}>
            Common Questions
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {faqs.map((faq, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: '10px', padding: '20px 22px', border: '1px solid #e8edf2', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#0A1929', marginBottom: '8px' }}>{faq.q}</div>
                <div style={{ fontSize: '13px', color: '#4a5568', lineHeight: 1.7 }}>{faq.a}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── FINAL CTA ── */}
        <div style={{ background: '#fff', borderRadius: '14px', padding: '40px 32px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e8edf2' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#D4A830', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>Ready to start?</div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0A1929', margin: '0 0 8px' }}>Claim your founding spot.</h2>
          <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 28px', lineHeight: 1.6 }}>
            A few select agents. First 90 days free.<br />Takes 5 minutes or less to get started.
          </p>

          <a href="https://citedagent.com/score" style={{ display: 'block', background: '#00BFA6', color: '#fff', fontWeight: 700, fontSize: '16px', padding: '16px 36px', borderRadius: '8px', textDecoration: 'none', letterSpacing: '0.3px', marginBottom: '12px' }}>
            Get My Foundation Score →
          </a>

          <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
            Prefer to talk first? Email Radley directly at <a href="mailto:hello@citedagent.com" style={{ color: '#00BFA6', textDecoration: 'none' }}>hello@citedagent.com</a>
          </p>
        </div>

        <div style={{ textAlign: 'center', marginTop: '32px', fontSize: '11px', color: '#94a3b8', lineHeight: 2 }}>
          <div style={{ marginBottom: '6px' }}>
            <a href="/privacy" style={{ color: '#64748b', textDecoration: 'none', marginRight: '16px' }}>Privacy Policy</a>
            <a href="/terms" style={{ color: '#64748b', textDecoration: 'none' }}>Terms of Service</a>
          </div>
          Cited · AI Citation Optimization™ for Professionals · citedagent.com · Powered by PRISM™
        </div>

      </main>
    </div>
  );
}
