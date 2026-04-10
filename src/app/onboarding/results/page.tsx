'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';
import CitedHeader from '@/components/CitedHeader';
import CitedFooter from '@/components/CitedFooter';

/* ═══════════════════════════════════════════════════════════════
   PRISM Scan Results + Market/Neighborhood Approval (Combined)
   Token-based auth — single delivery touchpoint
   v1.0 — April 9, 2026
   Protocol: cited-scan-delivery-protocol.md
   ═══════════════════════════════════════════════════════════════ */

type MarketRec = {
  name: string;
  tier: 'primary' | 'secondary' | 'growth';
  evidence: string;
  txn_volume: string;
  txn_count: number;
  ai_signal: string;
  approved?: boolean;
};

type ScanResults = {
  composite_score: number;
  tier_name: string;
  tier_line: string;
  perplexity: number;
  chatgpt: number;
  gemini: number;
  claude: number;
  entity: number;
  freshness: number;
  competitors: { name: string; firm: string; market: string; score: number }[];
  gaps: { title: string; impact: string; description: string }[];
  trajectory: { day: string; target: string }[];
  scan_date: string;
  scan_completion: string;
};

const TIER_CONFIG = {
  primary: { label: 'Primary Market', color: '#00BFA6', bg: '#f0fdf9', icon: '🎯' },
  secondary: { label: 'Secondary Market', color: '#D4A830', bg: '#fffdf5', icon: '📍' },
  growth: { label: 'Growth Market', color: '#0A1929', bg: '#f0f4f8', icon: '🌱' },
};

const DEFAULT_SCAN: ScanResults = {
  composite_score: 24,
  tier_name: 'Building',
  tier_line: 'Foundation going in. Key platforms next.',
  perplexity: 5,
  chatgpt: 3,
  gemini: 7,
  claude: 4,
  entity: 0,
  freshness: 5,
  competitors: [
    { name: 'Felicia Lewis', firm: 'Felicia Lewis Group', market: 'Carmel Valley', score: 55 },
    { name: 'Kurt Wannebo', firm: 'Compass', market: 'Carlsbad', score: 50 },
    { name: 'Bree Bornstein', firm: 'Compass', market: 'Rancho Santa Fe', score: 45 },
  ],
  gaps: [
    { title: 'Claim Bing Places + Foursquare', impact: '+14 points', description: 'ChatGPT pulls 87% of local results from Bing. Without these, you\'re invisible to ChatGPT for all discovery queries.' },
    { title: 'Optimize Yelp + Begin Reviews', impact: '+12 points', description: 'Perplexity uses Yelp as its primary recommendation gate. Your profile exists but has 0 reviews and a generic bio.' },
    { title: 'Fix Entity Inconsistency', impact: '+10 points', description: 'You\'re listed as Del Mar, La Jolla, Carlsbad, AND Carmel Valley across platforms. AI can\'t resolve you as one person.' },
  ],
  trajectory: [
    { day: 'Day 0 (Today)', target: '24/100' },
    { day: 'Day 14', target: '35-40' },
    { day: 'Day 30', target: '45-50' },
    { day: 'Day 60', target: '55-65' },
    { day: 'Day 90', target: '65-75' },
  ],
  scan_date: '2026-04-09',
  scan_completion: '99%',
};

function ResultsContent() {
  const [clientName, setClientName] = useState('');
  const [markets, setMarkets] = useState<MarketRec[]>([]);
  const [scan, setScan] = useState<ScanResults>(DEFAULT_SCAN);
  const [loading, setLoading] = useState(true);
  const [approved, setApproved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [recordId, setRecordId] = useState('');
  const searchParams = useSearchParams();

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const supabase = createSupabaseBrowserClient();
    const token = searchParams.get('token');
    let data = null;

    if (token) {
      const { data: d } = await supabase
        .from('cited_intake')
        .select('id, full_name, market_recommendations, markets_approved, scan_results')
        .eq('onboarding_token', token)
        .single();
      if (d) data = d;
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: d } = await supabase
          .from('cited_intake')
          .select('id, full_name, market_recommendations, markets_approved, scan_results')
          .eq('email', user.email)
          .single();
        if (d) data = d;
      }
    }

    if (data) {
      setRecordId(data.id);
      setClientName(data.full_name || '');
      if (data.markets_approved) setApproved(true);
      if (data.market_recommendations) {
        try {
          const recs = typeof data.market_recommendations === 'string'
            ? JSON.parse(data.market_recommendations) : data.market_recommendations;
          if (Array.isArray(recs)) setMarkets(recs);
        } catch {}
      }
      if (data.scan_results) {
        try {
          const sr = typeof data.scan_results === 'string'
            ? JSON.parse(data.scan_results) : data.scan_results;
          setScan(sr);
        } catch {}
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
      <div style={{ minHeight: '100vh', background: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#0A1929', letterSpacing: '2px', marginBottom: '8px' }}>CITED</div>
          <div style={{ fontSize: '14px', color: '#94a3b8' }}>Loading your scan results...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      <CitedHeader variant="onboarding" userEmail="" userName={clientName} clientTier="founding_client" />

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '40px 24px' }}>

        {/* A. SCORE HERO */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0A1929', marginBottom: '16px' }}>
            {firstName ? `${firstName}, your PRISM Scan is complete.` : 'Your PRISM Scan is complete.'}
          </h1>
          <div style={{
            display: 'inline-block', background: '#0A1929', borderRadius: '16px',
            padding: '32px 48px', textAlign: 'center',
          }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>Citation Score</div>
            <div style={{ fontSize: '64px', fontWeight: 900, color: '#00BFA6', lineHeight: 1 }}>{scan.composite_score}</div>
            <div style={{ fontSize: '18px', color: '#64748b', marginTop: '4px' }}>/100</div>
            <div style={{
              marginTop: '12px', background: 'rgba(0,191,166,0.15)', color: '#00BFA6',
              fontSize: '13px', fontWeight: 700, padding: '4px 16px', borderRadius: '20px', display: 'inline-block',
            }}>
              {scan.tier_name}
            </div>
            <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '8px' }}>{scan.tier_line}</div>
          </div>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '12px' }}>
            Based on 49 queries across ChatGPT, Perplexity, Gemini, and Brave · Scan completion: {scan.scan_completion} · {scan.scan_date}
          </div>
        </div>

        {/* B. KEY FINDING */}
        <div style={{
          background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px',
          padding: '24px', marginBottom: '24px',
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0A1929', margin: '0 0 16px 0' }}>The Key Finding</h2>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
            <div style={{ flex: 1, background: '#f0fdf9', borderRadius: '8px', padding: '16px', borderLeft: '4px solid #00BFA6' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#0A1929' }}>When someone searches YOUR NAME</div>
              <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>AI finds you ✅</div>
            </div>
            <div style={{ flex: 1, background: '#fff5f5', borderRadius: '8px', padding: '16px', borderLeft: '4px solid #EF4444' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#0A1929' }}>When someone searches BEST AGENT IN YOUR MARKET</div>
              <div style={{ fontSize: '13px', color: '#EF4444', marginTop: '4px' }}>AI doesn't recommend you ❌</div>
            </div>
          </div>
          <div style={{
            background: '#0A1929', color: '#fff', padding: '12px 20px', borderRadius: '6px',
            fontSize: '14px', fontWeight: 500, textAlign: 'center',
          }}>
            That's the gap CITED closes.
          </div>
        </div>

        {/* C. PER-MODEL SUB-SCORES */}
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0A1929', margin: '0 0 16px 0' }}>How Each AI Model Sees You</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {[
              { name: 'Perplexity', score: scan.perplexity, max: 25, desc: 'Yelp-powered recommendations' },
              { name: 'ChatGPT', score: scan.chatgpt, max: 25, desc: 'Bing + local search results' },
              { name: 'Google AI', score: scan.gemini, max: 25, desc: 'Google Business + organic ranking' },
              { name: 'Claude', score: scan.claude, max: 10, desc: 'Brave Search + reviews' },
            ].map(model => (
              <div key={model.name} style={{
                background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px',
              }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#0A1929' }}>{model.name}</div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '8px' }}>{model.desc}</div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: model.score === 0 ? '#EF4444' : '#0A1929' }}>
                  {model.score}<span style={{ fontSize: '14px', color: '#94a3b8' }}>/{model.max}</span>
                </div>
                <div style={{
                  height: '4px', background: '#f1f5f9', borderRadius: '2px', marginTop: '8px', overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%', width: `${(model.score / model.max) * 100}%`,
                    background: model.score / model.max > 0.5 ? '#00BFA6' : model.score / model.max > 0.2 ? '#D4A830' : '#EF4444',
                    borderRadius: '2px',
                  }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#0A1929' }}>Entity Consistency</div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '8px' }}>Same name + location everywhere</div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#EF4444' }}>{scan.entity}<span style={{ fontSize: '14px', color: '#94a3b8' }}>/10</span></div>
            </div>
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#0A1929' }}>Content Freshness</div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '8px' }}>Recent articles + GBP posts</div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#00BFA6' }}>{scan.freshness}<span style={{ fontSize: '14px', color: '#94a3b8' }}>/5</span></div>
            </div>
          </div>
        </div>

        {/* F. COMPETITOR SNAPSHOT */}
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0A1929', margin: '0 0 16px 0' }}>Who AI Recommends Instead</h2>
          {scan.competitors.map(comp => (
            <div key={comp.market} style={{
              background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px',
              padding: '16px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#0A1929' }}>{comp.name}</div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>{comp.firm} · {comp.market}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#0A1929' }}>~{comp.score}</div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>/100</div>
              </div>
            </div>
          ))}
        </div>

        {/* G. TOP 3 GAPS */}
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0A1929', margin: '0 0 16px 0' }}>Your Top 3 Opportunities</h2>
          {scan.gaps.map((gap, i) => (
            <div key={i} style={{
              background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px',
              padding: '20px', marginBottom: '12px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#0A1929' }}>{gap.title}</div>
                <div style={{
                  background: '#f0fdf9', color: '#00BFA6', fontSize: '12px', fontWeight: 700,
                  padding: '2px 10px', borderRadius: '12px', whiteSpace: 'nowrap',
                }}>{gap.impact}</div>
              </div>
              <div style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5 }}>{gap.description}</div>
            </div>
          ))}
        </div>

        {/* H. 90-DAY TRAJECTORY */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0A1929', margin: '0 0 16px 0' }}>Your 90-Day Path</h2>
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px' }}>
            {scan.trajectory.map((step, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 0', borderBottom: i < scan.trajectory.length - 1 ? '1px solid #f1f5f9' : 'none',
              }}>
                <div style={{ fontSize: '14px', fontWeight: i === 0 ? 700 : 500, color: '#0A1929' }}>{step.day}</div>
                <div style={{
                  fontSize: '16px', fontWeight: 700,
                  color: i === 0 ? '#EF4444' : i === scan.trajectory.length - 1 ? '#00BFA6' : '#0A1929',
                }}>{step.target}</div>
              </div>
            ))}
            <div style={{
              marginTop: '16px', background: '#f0fdf9', borderRadius: '6px', padding: '12px 16px',
              fontSize: '13px', color: '#0A1929', textAlign: 'center',
            }}>
              <strong>Citation Guarantee™:</strong> +20 points in 90 days or you owe nothing.
            </div>
          </div>
        </div>

        {/* I. APPROVE */}
        {!approved ? (
          <div style={{ marginBottom: '32px' }}>
            <div style={{
              background: '#f8f9fa', borderRadius: '8px', padding: '20px 24px', marginBottom: '24px',
            }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0A1929', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>What happens next</div>
              {[
                { num: '1', title: 'Approve your market strategy', desc: 'Confirm markets and neighborhoods — takes 30 seconds.' },
                { num: '2', title: 'Your positioning statement arrives', desc: 'Written from your scan data + intake — within 24 hours.' },
                { num: '3', title: 'Copy kit + satellite site build begins', desc: 'Platform-specific bios + your AI-optimized website.' },
              ].map((step, i) => (
                <div key={step.num} style={{ display: 'flex', gap: '12px', marginBottom: i < 2 ? '12px' : 0 }}>
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
              width: '100%', padding: '16px 24px', background: '#00BFA6', color: '#fff',
              fontSize: '16px', fontWeight: 700, border: 'none', borderRadius: '8px',
              cursor: saving ? 'wait' : 'pointer', opacity: saving ? 0.7 : 1,
            }}>
              {saving ? 'Saving...' : '✓ Approve Strategy — Start Optimization'}
            </button>
          </div>
        ) : (
          <div style={{
            background: '#f0fdf9', border: '2px solid #00BFA6', borderRadius: '12px',
            padding: '24px', textAlign: 'center', marginBottom: '32px',
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🚀</div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0A1929', margin: '0 0 8px 0' }}>Strategy Approved — Optimization Begins</h3>
            <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
              Your positioning statement will arrive within 24 hours. We&apos;re on it.
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
      <div style={{ minHeight: '100vh', background: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: '14px', color: '#94a3b8' }}>Loading...</div>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}
