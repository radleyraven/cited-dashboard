'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';
import CitedHeader from '@/components/CitedHeader';
import CitedFooter from '@/components/CitedFooter';

/* ═══════════════════════════════════════════════════════════════
   Market Recommendation Card — Onboarding Step 1
   Token-based auth (no login required for onboarding)
   v2.0 — April 9, 2026
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

const TIER_CONFIG = {
  primary: {
    label: 'Primary Market',
    color: '#00BFA6',
    bg: '#f0fdf9',
    border: '#00BFA6',
    description: 'Your headline market. Deepest evidence, highest optimization priority.',
    icon: '🎯',
  },
  secondary: {
    label: 'Secondary Market',
    color: '#D4A830',
    bg: '#fffdf5',
    border: '#D4A830',
    description: 'Strong signal. Included in all content and platform optimization.',
    icon: '📍',
  },
  growth: {
    label: 'Growth Market',
    color: '#0A1929',
    bg: '#f0f4f8',
    border: '#94a3b8',
    description: 'Building toward. Content and visibility grow over time.',
    icon: '🌱',
  },
};

function MarketsContent() {
  const [markets, setMarkets] = useState<MarketRec[]>([]);
  const [allApproved, setAllApproved] = useState(false);
  const [changeRequest, setChangeRequest] = useState('');
  const [changeSubmitted, setChangeSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [tokenValid, setTokenValid] = useState(false);
  const [recordId, setRecordId] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const supabase = createSupabaseBrowserClient();
    const token = searchParams.get('token');

    if (token) {
      // Token-based auth (from email link)
      const { data } = await supabase
        .from('cited_intake')
        .select('id, full_name, email, markets_approved, market_recommendations, onboarding_token_expires_at')
        .eq('onboarding_token', token)
        .single();

      if (data) {
        // Check expiry
        const expires = new Date(data.onboarding_token_expires_at);
        if (expires > new Date()) {
          setTokenValid(true);
          setRecordId(data.id);
          setClientName(data.full_name || '');
          setClientEmail(data.email || '');
          if (data.markets_approved) setAllApproved(true);
          if (data.market_recommendations) {
            try {
              const recs = typeof data.market_recommendations === 'string'
                ? JSON.parse(data.market_recommendations)
                : data.market_recommendations;
              if (Array.isArray(recs) && recs.length > 0) {
                setMarkets(recs.map((r: MarketRec) => ({ ...r, approved: r.approved ?? false })));
              }
            } catch { /* fall through */ }
          }
        }
      }
    } else {
      // Fallback: try auth session
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('cited_intake')
          .select('id, full_name, email, markets_approved, market_recommendations')
          .eq('email', user.email)
          .single();

        if (data) {
          setTokenValid(true);
          setRecordId(data.id);
          setClientName(data.full_name || '');
          setClientEmail(data.email || '');
          if (data.markets_approved) setAllApproved(true);
          if (data.market_recommendations) {
            try {
              const recs = typeof data.market_recommendations === 'string'
                ? JSON.parse(data.market_recommendations)
                : data.market_recommendations;
              if (Array.isArray(recs) && recs.length > 0) {
                setMarkets(recs.map((r: MarketRec) => ({ ...r, approved: r.approved ?? false })));
              }
            } catch { /* fall through */ }
          }
        }
      }
    }

    setPageLoading(false);
  }

  function toggleMarketApproval(index: number) {
    setMarkets(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], approved: !updated[index].approved };
      return updated;
    });
  }

  function approveAll() {
    setMarkets(prev => prev.map(m => ({ ...m, approved: true })));
  }

  const allMarketApproved = markets.length > 0 && markets.every(m => m.approved);

  async function handleConfirm() {
    if (!recordId) return;
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const token = searchParams.get('token');

    const approvedMarkets = markets.filter(m => m.approved);
    const updateData = {
      markets_approved: true,
      markets_approved_at: new Date().toISOString(),
      primary_market: approvedMarkets.find(m => m.tier === 'primary')?.name || '',
      secondary_market: approvedMarkets.find(m => m.tier === 'secondary')?.name || '',
      growth_market: approvedMarkets.find(m => m.tier === 'growth')?.name || '',
      market_recommendations: JSON.stringify(markets),
    };

    await supabase
      .from('cited_intake')
      .update(updateData)
      .eq('id', recordId);

    setAllApproved(true);
    setLoading(false);

    // Redirect to neighborhoods with same token
    setTimeout(() => {
      const tokenParam = token ? `?token=${token}` : '';
      router.push(`/onboarding/neighborhoods${tokenParam}`);
    }, 2000);
  }

  async function handleChangeRequest() {
    if (!changeRequest.trim() || !recordId) return;
    setLoading(true);
    const supabase = createSupabaseBrowserClient();

    await supabase
      .from('cited_intake')
      .update({
        market_change_request: changeRequest,
        market_change_requested_at: new Date().toISOString(),
      })
      .eq('id', recordId);

    setChangeSubmitted(true);
    setLoading(false);
  }

  const firstName = clientName.split(' ')[0] || '';
  const approvedCount = markets.filter(m => m.approved).length;

  // Loading state
  if (pageLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#0A1929', letterSpacing: '2px', marginBottom: '8px' }}>CITED</div>
          <div style={{ fontSize: '14px', color: '#94a3b8' }}>Loading your market strategy...</div>
        </div>
      </div>
    );
  }

  // Invalid/expired token
  if (!tokenValid || markets.length === 0) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '40px', maxWidth: '400px' }}>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#0A1929', letterSpacing: '2px', marginBottom: '8px' }}>CITED</div>
          <div style={{ fontSize: '10px', fontWeight: 600, color: '#00BFA6', textTransform: 'uppercase', letterSpacing: '2.5px', marginBottom: '24px' }}>AI Citation Optimization™</div>
          <p style={{ fontSize: '16px', color: '#0A1929', fontWeight: 600, marginBottom: '8px' }}>Sign in to view your market strategy</p>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>Use the email address you signed up with.</p>
          <a href="/login?redirect=/onboarding/markets" style={{
            display: 'inline-block', background: '#00BFA6', color: '#fff',
            fontSize: '15px', fontWeight: 700, padding: '12px 32px', borderRadius: '8px', textDecoration: 'none',
          }}>Sign In →</a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      <CitedHeader
        variant="onboarding"
        stepIndicator="Step 1 of 2 — Market Approval"
        userEmail={clientEmail}
        userName={firstName}
      />

      {/* Content */}
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '40px 24px' }}>
        {/* Intro */}
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0A1929', marginBottom: '8px', lineHeight: 1.3 }}>
          {firstName ? `${firstName}, here's your market strategy.` : "Here's your market strategy."}
        </h1>
        <p style={{ fontSize: '15px', color: '#64748b', marginBottom: '24px', lineHeight: 1.6 }}>
          Based on your transaction history, intake data, and our initial PRISM Scan, we&apos;ve identified
          three markets to focus your optimization. Approve each market individually, or approve all at once.
        </p>

        {/* Education Line */}
        <div style={{
          background: '#0A1929', color: '#fff', padding: '16px 24px',
          borderRadius: '8px', marginBottom: '32px', textAlign: 'center',
        }}>
          <p style={{ margin: 0, fontSize: '15px', fontWeight: 500, lineHeight: 1.6 }}>
            AI recommends agents it can find evidence for.{' '}
            <span style={{ color: '#00BFA6', fontWeight: 700 }}>We&apos;re building your evidence.</span>
          </p>
        </div>

        {/* Data Sources */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '32px' }}>
          {[
            { label: 'Your Intake', icon: '📋', desc: 'Markets you identified' },
            { label: 'MLS Data', icon: '📊', desc: 'Where you\'ve sold' },
            { label: 'PRISM Scan', icon: '🔍', desc: 'Where AI sees you' },
          ].map((src) => (
            <div key={src.label} style={{
              background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px',
              padding: '12px 16px', textAlign: 'center',
            }}>
              <div style={{ fontSize: '20px', marginBottom: '4px' }}>{src.icon}</div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#0A1929', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{src.label}</div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{src.desc}</div>
            </div>
          ))}
        </div>

        {/* Approve All Button */}
        {!allApproved && !changeSubmitted && (
          <div style={{ marginBottom: '20px', textAlign: 'center' }}>
            <button onClick={approveAll} disabled={allMarketApproved} style={{
              padding: '8px 20px',
              background: allMarketApproved ? '#e2e8f0' : '#0A1929',
              color: allMarketApproved ? '#94a3b8' : '#fff',
              fontSize: '13px', fontWeight: 600, border: 'none', borderRadius: '6px',
              cursor: allMarketApproved ? 'default' : 'pointer',
            }}>
              {allMarketApproved ? '✓ All Approved' : 'Approve All Markets'}
            </button>
          </div>
        )}

        {/* Market Cards */}
        {markets.map((market, idx) => {
          const tier = TIER_CONFIG[market.tier];
          const isApproved = market.approved;
          return (
            <div key={market.name} style={{
              background: '#fff',
              border: `2px solid ${isApproved ? '#00BFA6' : tier.border}`,
              borderRadius: '12px', padding: '24px', marginBottom: '16px',
              position: 'relative', opacity: allApproved ? 0.85 : 1,
              transition: 'border-color 0.3s, opacity 0.3s',
            }}>
              {/* Tier Badge */}
              <div style={{
                position: 'absolute', top: '-12px', left: '20px',
                background: tier.color, color: '#fff', fontSize: '11px', fontWeight: 700,
                padding: '4px 14px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '1px',
              }}>
                {tier.icon} {tier.label}
              </div>

              {/* Approve button per card */}
              {!allApproved && !changeSubmitted && (
                <div style={{ position: 'absolute', top: '-12px', right: '20px' }}>
                  <button onClick={() => toggleMarketApproval(idx)} style={{
                    background: isApproved ? '#00BFA6' : '#fff',
                    color: isApproved ? '#fff' : '#94a3b8',
                    border: isApproved ? '2px solid #00BFA6' : '2px solid #e2e8f0',
                    borderRadius: '20px', padding: '4px 14px', fontSize: '11px', fontWeight: 700,
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}>
                    {isApproved ? '✓ Approved' : 'Approve'}
                  </button>
                </div>
              )}

              <div style={{ marginTop: '8px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0A1929', margin: '0 0 4px 0' }}>{market.name}</h2>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px 0' }}>{tier.description}</p>

                {/* Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <div style={{ background: tier.bg, borderRadius: '8px', padding: '12px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Volume</div>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#0A1929', marginTop: '2px' }}>{market.txn_volume}</div>
                  </div>
                  <div style={{ background: tier.bg, borderRadius: '8px', padding: '12px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Transactions</div>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#0A1929', marginTop: '2px' }}>{market.txn_count}</div>
                  </div>
                  <div style={{ background: tier.bg, borderRadius: '8px', padding: '12px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>AI Signal</div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#0A1929', marginTop: '4px' }}>{market.ai_signal}</div>
                  </div>
                </div>

                {/* Evidence */}
                <div style={{
                  marginTop: '12px', padding: '10px 14px', background: '#f8f9fa',
                  borderRadius: '6px', fontSize: '13px', color: '#475569', lineHeight: 1.5,
                }}>
                  {market.evidence}
                </div>
              </div>
            </div>
          );
        })}

        {/* What Happens Next */}
        {!allApproved && !changeSubmitted && (
          <div style={{
            background: '#f8f9fa', borderRadius: '8px', padding: '20px 24px',
            marginTop: '32px', marginBottom: '24px',
          }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#0A1929', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>What happens next</div>
            {[
              { num: '1', title: 'Approve your markets', desc: 'Confirm or adjust — takes 30 seconds.' },
              { num: '2', title: 'Confirm your neighborhoods', desc: "We'll show the specific neighborhoods within each market." },
              { num: '3', title: 'Full PRISM Scan launches', desc: 'We test exactly what happens when someone asks AI "who\'s the best agent in your market?" — on every platform that matters. Results within 24 hours.' },
            ].map((step, i) => (
              <div key={step.num} style={{ display: 'flex', gap: '12px', marginBottom: i < 2 ? '12px' : 0 }}>
                <div style={{
                  width: '24px', height: '24px', minWidth: '24px',
                  background: '#00BFA6', borderRadius: '50%',
                  textAlign: 'center', lineHeight: '24px',
                  color: '#fff', fontSize: '12px', fontWeight: 700,
                }}>{step.num}</div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#0A1929' }}>{step.title}</div>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Confirm Button */}
        {!allApproved && !changeSubmitted && (
          <div>
            <button onClick={handleConfirm} disabled={loading || approvedCount === 0} style={{
              width: '100%', padding: '16px 24px',
              background: approvedCount === 3 ? '#00BFA6' : approvedCount > 0 ? '#0A1929' : '#e2e8f0',
              color: approvedCount > 0 ? '#fff' : '#94a3b8',
              fontSize: '16px', fontWeight: 700, border: 'none', borderRadius: '8px',
              cursor: loading || approvedCount === 0 ? 'default' : 'pointer',
              marginBottom: '12px', opacity: loading ? 0.7 : 1, transition: 'background 0.3s',
            }}>
              {loading ? 'Saving...' : approvedCount === 3 ? '✓ Confirm All 3 Markets → Next Step' : approvedCount > 0 ? `Confirm ${approvedCount} Market${approvedCount > 1 ? 's' : ''} → Next Step` : 'Approve at least one market to continue'}
            </button>

            <div style={{ textAlign: 'center', fontSize: '13px', color: '#94a3b8', marginBottom: '24px' }}>or</div>

            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px' }}>
              <p style={{ fontSize: '14px', fontWeight: 600, color: '#0A1929', margin: '0 0 8px 0' }}>Want to adjust?</p>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 12px 0' }}>
                Tell us what you&apos;d like to change and we&apos;ll update the recommendation.
              </p>
              <textarea value={changeRequest} onChange={(e) => setChangeRequest(e.target.value)}
                placeholder="e.g., I'd like to focus more on La Jolla instead of Rancho Santa Fe..."
                style={{
                  width: '100%', minHeight: '80px', padding: '12px',
                  border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px',
                  resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box',
                }}
              />
              <button onClick={handleChangeRequest} disabled={loading || !changeRequest.trim()} style={{
                marginTop: '8px', padding: '10px 20px', background: '#0A1929', color: '#fff',
                fontSize: '14px', fontWeight: 600, border: 'none', borderRadius: '6px',
                cursor: 'pointer', opacity: loading || !changeRequest.trim() ? 0.5 : 1,
              }}>Request Changes</button>
            </div>
          </div>
        )}

        {/* Approved State */}
        {allApproved && (
          <div style={{
            marginTop: '32px', background: '#f0fdf9', border: '2px solid #00BFA6',
            borderRadius: '12px', padding: '24px', textAlign: 'center',
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>✓</div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0A1929', margin: '0 0 8px 0' }}>Markets Approved</h3>
            <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
              Next up: confirm the neighborhoods within each market. Redirecting in a moment...
            </p>
          </div>
        )}

        {/* Change Request Submitted */}
        {changeSubmitted && (
          <div style={{
            marginTop: '32px', background: '#fffdf5', border: '2px solid #D4A830',
            borderRadius: '12px', padding: '24px', textAlign: 'center',
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📝</div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0A1929', margin: '0 0 8px 0' }}>Change Request Received</h3>
            <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
              We&apos;ll review your feedback and update the recommendation. You&apos;ll receive an email when it&apos;s ready.
            </p>
          </div>
        )}

        <CitedFooter />
      </div>
    </div>
  );
}

export default function MarketsPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: '14px', color: '#94a3b8' }}>Loading...</div>
      </div>
    }>
      <MarketsContent />
    </Suspense>
  );
}
