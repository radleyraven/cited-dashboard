'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';
import CitedHeader from '@/components/CitedHeader';
import CitedFooter from '@/components/CitedFooter';

/* ═══════════════════════════════════════════════════════════════
   PRISM Scan Results — Redesigned from Scratch
   Story arc: Celebrate → Gap → Score → Markets → Path → Approve
   v2.0 — April 9, 2026
   Research: Sugarman (slippery slide), Peak-End (Yablonski),
   Heath (Made to Stick), Cialdini (contrast), Raw.Studio (dashboard UX)
   ═══════════════════════════════════════════════════════════════ */

function ResultsContent() {
  const [clientName, setClientName] = useState('');
  const [approved, setApproved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [recordId, setRecordId] = useState('');
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

  async function handleApprove() {
    if (!recordId) return;
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

      {/* ════════════════════════════════════════════
          SECTION 1: CELEBRATE THE CLIENT
          Dark hero section — their stats, their wins
          ════════════════════════════════════════════ */}
      <div style={{ background: '#0A1929', padding: '48px 24px 40px', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ fontSize: '13px', color: '#00BFA6', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '16px' }}>
            Your PRISM Scan is Complete
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#fff', lineHeight: 1.3, margin: '0 0 24px 0' }}>
            {firstName ? `${firstName}, here's what we found.` : "Here's what we found."}
          </h1>

          {/* Client Stats — Celebratory */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '24px' }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '16px 12px' }}>
              <div style={{ fontSize: '28px', fontWeight: 900, color: '#00BFA6' }}>$91.7M</div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Career Volume</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '16px 12px' }}>
              <div style={{ fontSize: '28px', fontWeight: 900, color: '#00BFA6' }}>33</div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Deals Closed</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '16px 12px' }}>
              <div style={{ fontSize: '28px', fontWeight: 900, color: '#00BFA6' }}>5.0 ★</div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Google Rating</div>
            </div>
          </div>

          <p style={{ fontSize: '15px', color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
            You&apos;re one of the most active luxury agents in North County San Diego. But when buyers ask AI who to call — your name doesn&apos;t come up. <span style={{ color: '#fff', fontWeight: 600 }}>That changes now.</span>
          </p>
        </div>
      </div>
      <div style={{ height: '3px', background: 'linear-gradient(90deg, #00BFA6, #D4A830, #00BFA6)' }} />

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '40px 24px' }}>

        {/* ════════════════════════════════════════════
            SECTION 2: THE GAP — Visual + Visceral
            Side by side: competitor vs you
            ════════════════════════════════════════════ */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0A1929', margin: '0 0 16px 0' }}>
            Here&apos;s what AI tells buyers in Carmel Valley right now.
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            {/* Competitor */}
            <div style={{
              background: '#fff', border: '2px solid #EF4444', borderRadius: '12px',
              padding: '24px 16px', textAlign: 'center',
            }}>
              <div style={{ fontSize: '11px', color: '#EF4444', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
                AI Recommends
              </div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#0A1929' }}>Felicia Lewis</div>
              <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Felicia Lewis Group</div>
              <div style={{
                marginTop: '16px', background: '#fff5f5', borderRadius: '8px', padding: '8px',
                fontSize: '24px', fontWeight: 900, color: '#EF4444',
              }}>~55<span style={{ fontSize: '14px', color: '#94a3b8' }}>/100</span></div>
            </div>

            {/* Client */}
            <div style={{
              background: '#fff', border: '2px solid #e2e8f0', borderRadius: '12px',
              padding: '24px 16px', textAlign: 'center',
            }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
                Your Current Score
              </div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#0A1929' }}>{firstName || 'You'}</div>
              <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Oppenheim Group</div>
              <div style={{
                marginTop: '16px', background: '#f8f9fa', borderRadius: '8px', padding: '8px',
                fontSize: '24px', fontWeight: 900, color: '#0A1929',
              }}>24<span style={{ fontSize: '14px', color: '#94a3b8' }}>/100</span></div>
            </div>
          </div>

          <div style={{
            background: '#0A1929', color: '#fff', padding: '14px 20px', borderRadius: '8px',
            fontSize: '14px', fontWeight: 500, textAlign: 'center', lineHeight: 1.5,
          }}>
            When a buyer asks ChatGPT, Perplexity, or Google AI <em>&quot;who&apos;s the best agent in Carmel Valley?&quot;</em> — Felicia shows up. You don&apos;t. <span style={{ color: '#00BFA6', fontWeight: 700 }}>We fix that.</span>
          </div>
        </div>

        {/* ════════════════════════════════════════════
            SECTION 3: WHY — In Their Language
            What each platform means (not model names)
            ════════════════════════════════════════════ */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0A1929', margin: '0 0 8px 0' }}>
            Why you&apos;re not showing up.
          </h2>
          <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 16px 0' }}>
            AI pulls recommendations from specific platforms. Here&apos;s where your gaps are:
          </p>

          {[
            {
              platform: 'Yelp',
              ai: 'Perplexity',
              status: '0 reviews · Generic bio',
              impact: 'Perplexity uses Yelp as its #1 source for agent recommendations.',
              score: '5/25',
              color: '#EF4444',
              points: '+12 pts',
            },
            {
              platform: 'Bing Places + Foursquare',
              ai: 'ChatGPT',
              status: 'Not claimed',
              impact: 'ChatGPT pulls 87% of local results from Bing. You\'re invisible to it.',
              score: '3/25',
              color: '#EF4444',
              points: '+14 pts',
            },
            {
              platform: 'Google Business + Website',
              ai: 'Google AI / Gemini',
              status: '11 reviews · No schema markup',
              impact: 'Your GBP is active but your website has no AI-readable structure.',
              score: '7/25',
              color: '#D4A830',
              points: '+10 pts',
            },
            {
              platform: 'Platform Consistency',
              ai: 'All AI Models',
              status: '4 different locations listed',
              impact: 'AI sees Del Mar, La Jolla, Carlsbad, AND Carmel Valley. It can\'t resolve you as one person.',
              score: '0/10',
              color: '#EF4444',
              points: '+10 pts',
            },
          ].map((item, i) => (
            <div key={i} style={{
              background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px',
              padding: '16px 20px', marginBottom: '10px',
              borderLeft: `4px solid ${item.color}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#0A1929' }}>{item.platform}</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>Used by {item.ai} · Score: {item.score}</div>
                </div>
                <div style={{
                  background: '#f0fdf9', color: '#00BFA6', fontSize: '12px', fontWeight: 700,
                  padding: '3px 10px', borderRadius: '12px', whiteSpace: 'nowrap',
                }}>{item.points}</div>
              </div>
              <div style={{ fontSize: '13px', color: '#EF4444', fontWeight: 600, marginTop: '6px' }}>{item.status}</div>
              <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px', lineHeight: 1.4 }}>{item.impact}</div>
            </div>
          ))}

          <div style={{
            background: '#f0fdf9', borderRadius: '8px', padding: '12px 16px', marginTop: '12px',
            fontSize: '14px', color: '#0A1929', textAlign: 'center',
          }}>
            <strong>Content Freshness: 5/5 ✓</strong> — Your LinkedIn articles and GBP posts are active. This is your strongest signal right now.
          </div>
        </div>

        {/* ════════════════════════════════════════════
            SECTION 4: YOUR MARKETS — Slick Cards
            From the market approval design (proven)
            ════════════════════════════════════════════ */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0A1929', margin: '0 0 8px 0' }}>
            Where we&apos;ll focus your optimization.
          </h2>
          <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 16px 0' }}>
            Based on your transaction history + what AI currently sees:
          </p>

          {[
            { name: 'Carmel Valley', tier: '🎯 Primary', color: '#00BFA6', vol: '$44.8M', txns: '11', hoods: 'Rancho Pacifica (8 txns) · Whispering Woods · PHR (growth)', border: '#00BFA6' },
            { name: 'Carlsbad', tier: '📍 Secondary', color: '#D4A830', vol: '$10.0M', txns: '6', hoods: 'La Costa (3 txns) · Santalina · Aviara (growth)', border: '#D4A830' },
            { name: 'Rancho Santa Fe', tier: '🌱 Growth', color: '#0A1929', vol: '$11.7M', txns: '3', hoods: 'Del Mar Country Club ($6.2M) · Whispering Palms', border: '#94a3b8' },
          ].map(m => (
            <div key={m.name} style={{
              background: '#fff', border: `2px solid ${m.border}`, borderRadius: '12px',
              padding: '20px', marginBottom: '12px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: m.color, textTransform: 'uppercase', letterSpacing: '1px' }}>{m.tier}</span>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#0A1929', marginTop: '2px' }}>{m.name}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#0A1929' }}>{m.vol}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>{m.txns} transactions</div>
                </div>
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.5 }}>
                <strong>Neighborhoods:</strong> {m.hoods}
              </div>
            </div>
          ))}
        </div>

        {/* ════════════════════════════════════════════
            SECTION 5: THE PATH — 90 Day Trajectory
            ════════════════════════════════════════════ */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0A1929', margin: '0 0 16px 0' }}>
            Your 90-day path.
          </h2>

          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', position: 'relative' }}>
            {/* Progress visualization */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', position: 'relative' }}>
              {/* Track line */}
              <div style={{ position: 'absolute', top: '14px', left: '20px', right: '20px', height: '3px', background: '#f1f5f9', borderRadius: '2px' }}>
                <div style={{ width: '10%', height: '100%', background: 'linear-gradient(90deg, #EF4444, #D4A830)', borderRadius: '2px' }} />
              </div>
              {[
                { label: 'Today', score: '24', color: '#EF4444', active: true },
                { label: 'Day 30', score: '45-50', color: '#D4A830', active: false },
                { label: 'Day 60', score: '55-65', color: '#D4A830', active: false },
                { label: 'Day 90', score: '65-75', color: '#00BFA6', active: false },
              ].map((step, i) => (
                <div key={i} style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%', margin: '0 auto 8px',
                    background: step.active ? step.color : '#fff',
                    border: `3px solid ${step.color}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {step.active && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fff' }} />}
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: step.color }}>{step.score}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{step.label}</div>
                </div>
              ))}
            </div>

            <div style={{
              background: '#f0fdf9', borderRadius: '8px', padding: '14px 16px',
              fontSize: '14px', color: '#0A1929', textAlign: 'center',
            }}>
              <strong>Citation Guarantee™:</strong> +20 points in 90 days or you owe nothing. Ever.
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════
            SECTION 6: APPROVE
            Clear, specific, one action
            ════════════════════════════════════════════ */}
        {!approved ? (
          <div style={{ marginBottom: '32px' }}>
            {/* What Happens Next */}
            <div style={{
              background: '#f8f9fa', borderRadius: '10px', padding: '20px 24px', marginBottom: '20px',
            }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0A1929', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>What happens next</div>
              {[
                { num: '1', title: 'Approve your strategy below', desc: '3 markets + 9 neighborhoods — takes 10 seconds.' },
                { num: '2', title: 'Your positioning statement arrives', desc: 'Written from this scan + your intake — within 24 hours.' },
                { num: '3', title: 'We start building', desc: '12 platform bios + your AI-optimized website + first article.' },
              ].map((step, i) => (
                <div key={step.num} style={{ display: 'flex', gap: '12px', marginBottom: i < 2 ? '10px' : 0 }}>
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

            <button onClick={handleApprove} disabled={saving} style={{
              width: '100%', padding: '18px 24px', background: '#00BFA6', color: '#fff',
              fontSize: '16px', fontWeight: 700, border: 'none', borderRadius: '10px',
              cursor: saving ? 'wait' : 'pointer', opacity: saving ? 0.7 : 1,
              boxShadow: '0 4px 12px rgba(0,191,166,0.3)',
            }}>
              {saving ? 'Saving...' : '✓ Approve 3 Markets + 9 Neighborhoods — Start Optimization'}
            </button>
          </div>
        ) : (
          <div style={{
            background: '#0A1929', borderRadius: '12px', padding: '32px', textAlign: 'center', marginBottom: '32px',
          }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>🚀</div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', margin: '0 0 8px 0' }}>Strategy Approved — We&apos;re On It</h3>
            <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0 }}>
              Your positioning statement will arrive within 24 hours. The building starts now.
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
