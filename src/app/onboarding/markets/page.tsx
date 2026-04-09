'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';

/* ═══════════════════════════════════════════════════════════════
   Market Recommendation Card — Onboarding Step
   Client approves Primary / Secondary / Growth markets
   individually or all at once.
   v1.1 — April 9, 2026 — Individual approve + data fix
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

const DEFAULT_MARKETS: MarketRec[] = [
  {
    name: 'Carmel Valley',
    tier: 'primary',
    evidence: 'Your deepest concentration of closed deals — 11 transactions in Rancho Pacifica and surrounding neighborhoods. AI is already picking up signals here.',
    txn_volume: '$44.8M',
    txn_count: 11,
    ai_signal: 'Strongest — partial platform presence',
    approved: false,
  },
  {
    name: 'Carlsbad',
    tier: 'secondary',
    evidence: '6 closed transactions across La Costa, Santalina, and Santander — from $1.1M condos to $2.2M luxury homes. We optimize for both price ranges.',
    txn_volume: '$10.0M',
    txn_count: 6,
    ai_signal: 'Some signal — partial presence',
    approved: false,
  },
  {
    name: 'Rancho Santa Fe',
    tier: 'growth',
    evidence: '3 high-value transactions including a $6.2M sale at Del Mar Country Club. The evidence is starting — we build from here.',
    txn_volume: '$11.7M',
    txn_count: 3,
    ai_signal: 'Minimal — not in AI results',
    approved: false,
  },
];

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

export default function MarketsPage() {
  const [markets, setMarkets] = useState<MarketRec[]>(DEFAULT_MARKETS);
  const [allApproved, setAllApproved] = useState(false);
  const [changeRequest, setChangeRequest] = useState('');
  const [changeSubmitted, setChangeSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [clientName, setClientName] = useState('');
  const [authLoading, setAuthLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');
  const router = useRouter();

  useEffect(() => {
    loadClientData();
  }, []);

  async function loadClientData() {
    const supabase = createSupabaseBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setAuthLoading(false);
      return;
    }
    setUserEmail(user.email || '');

    // Try matching by email first, then by signup_email
    let data = null;
    const { data: d1 } = await supabase
      .from('cited_intake')
      .select('full_name, primary_markets, markets_approved, market_recommendations')
      .eq('email', user.email)
      .single();
    
    if (d1) {
      data = d1;
    } else {
      // Try signup_email field
      const { data: d2 } = await supabase
        .from('cited_intake')
        .select('full_name, primary_markets, markets_approved, market_recommendations')
        .eq('signup_email', user.email)
        .single();
      data = d2;
    }

    if (data) {
      setClientName(data.full_name || '');
      if (data.markets_approved) {
        setAllApproved(true);
      }
      if (data.market_recommendations) {
        try {
          const recs = typeof data.market_recommendations === 'string'
            ? JSON.parse(data.market_recommendations)
            : data.market_recommendations;
          if (Array.isArray(recs) && recs.length > 0) {
            setMarkets(recs.map((r: MarketRec) => ({ ...r, approved: r.approved ?? false })));
          }
        } catch { /* use defaults */ }
      }
    }
    setAuthLoading(false);
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

  const allMarketApproved = markets.every(m => m.approved);

  async function handleConfirm() {
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const approvedMarkets = markets.filter(m => m.approved);
    const marketData = {
      primary_market: approvedMarkets.find(m => m.tier === 'primary')?.name || '',
      secondary_market: approvedMarkets.find(m => m.tier === 'secondary')?.name || '',
      growth_market: approvedMarkets.find(m => m.tier === 'growth')?.name || '',
    };

    // Try both email fields
    const updateData = {
      markets_approved: true,
      markets_approved_at: new Date().toISOString(),
      primary_market: marketData.primary_market,
      secondary_market: marketData.secondary_market,
      growth_market: marketData.growth_market,
      market_recommendations: JSON.stringify(markets),
    };

    const { error: e1 } = await supabase
      .from('cited_intake')
      .update(updateData)
      .eq('email', user.email);

    if (e1) {
      await supabase
        .from('cited_intake')
        .update(updateData)
        .eq('signup_email', user.email);
    }

    setAllApproved(true);
    setLoading(false);

    setTimeout(() => {
      router.push('/onboarding/neighborhoods');
    }, 2000);
  }

  async function handleChangeRequest() {
    if (!changeRequest.trim()) return;
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('cited_intake')
      .update({
        market_change_request: changeRequest,
        market_change_requested_at: new Date().toISOString(),
      })
      .eq('email', user.email);

    setChangeSubmitted(true);
    setLoading(false);
  }

  const firstName = clientName.split(' ')[0] || '';
  const approvedCount = markets.filter(m => m.approved).length;

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: '14px', color: '#94a3b8' }}>Loading...</div>
      </div>
    );
  }

  // If not logged in, redirect to login with return URL
  if (!userEmail) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '40px', maxWidth: '400px' }}>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#0A1929', letterSpacing: '2px', marginBottom: '8px' }}>CITED</div>
          <div style={{ fontSize: '10px', fontWeight: 600, color: '#00BFA6', textTransform: 'uppercase', letterSpacing: '2.5px', marginBottom: '24px' }}>AI Citation Optimization™</div>
          <p style={{ fontSize: '16px', color: '#0A1929', fontWeight: 600, marginBottom: '8px' }}>Sign in to view your market strategy</p>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>Use the email address you signed up with.</p>
          <a
            href="/login?redirect=/onboarding/markets"
            style={{
              display: 'inline-block',
              background: '#00BFA6',
              color: '#fff',
              fontSize: '15px',
              fontWeight: 700,
              padding: '12px 32px',
              borderRadius: '8px',
              textDecoration: 'none',
            }}
          >
            Sign In →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', padding: '0' }}>
      {/* Header */}
      <div style={{
        background: '#0A1929',
        padding: '20px 32px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '720px', margin: '0 auto' }}>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#fff', letterSpacing: '2px', marginBottom: '2px' }}>CITED</div>
            <div style={{ fontSize: '10px', fontWeight: 600, color: '#00BFA6', textTransform: 'uppercase', letterSpacing: '2.5px' }}>AI Citation Optimization™</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            {userEmail ? (
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                <span style={{ color: '#94a3b8' }}>{userEmail}</span>
              </div>
            ) : (
              <a href="/login" style={{ fontSize: '12px', color: '#00BFA6', textDecoration: 'none', fontWeight: 600 }}>Sign in</a>
            )}
          </div>
        </div>
      </div>
      <div style={{ height: '3px', background: 'linear-gradient(90deg, #00BFA6, #D4A830, #00BFA6)' }} />

      {/* Step indicator */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '12px 32px', display: 'flex', justifyContent: 'center' }}>
        <div style={{
          background: 'rgba(0,191,166,0.1)',
          color: '#00BFA6',
          fontSize: '12px',
          fontWeight: 600,
          padding: '4px 16px',
          borderRadius: '20px',
        }}>
          Step 1 of 2 — Market Approval
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '40px 24px' }}>
        {/* Intro */}
        <h1 style={{
          fontSize: '28px',
          fontWeight: 800,
          color: '#0A1929',
          marginBottom: '8px',
          lineHeight: 1.3,
        }}>
          {firstName ? `${firstName}, here's your market strategy.` : "Here's your market strategy."}
        </h1>
        <p style={{
          fontSize: '15px',
          color: '#64748b',
          marginBottom: '24px',
          lineHeight: 1.6,
        }}>
          Based on your transaction history, intake data, and our initial PRISM Scan, we&apos;ve identified
          three markets to focus your optimization. Approve each market individually, or approve all at once.
        </p>

        {/* Education Line — positioned right before market cards */}
        <div style={{
          background: '#0A1929',
          color: '#fff',
          padding: '16px 24px',
          borderRadius: '8px',
          marginBottom: '32px',
          textAlign: 'center',
        }}>
          <p style={{ margin: 0, fontSize: '15px', fontWeight: 500, lineHeight: 1.6 }}>
            AI recommends agents it can find evidence for.{' '}
            <span style={{ color: '#00BFA6', fontWeight: 700 }}>We&apos;re building your evidence.</span>
          </p>
        </div>

        {/* Data Sources */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '12px',
          marginBottom: '32px',
        }}>
          {[
            { label: 'Your Intake', icon: '📋', desc: 'Markets you identified' },
            { label: 'MLS Data', icon: '📊', desc: 'Where you\'ve sold' },
            { label: 'PRISM Scan', icon: '🔍', desc: 'Where AI sees you' },
          ].map((src) => (
            <div key={src.label} style={{
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '12px 16px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '20px', marginBottom: '4px' }}>{src.icon}</div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#0A1929', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{src.label}</div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{src.desc}</div>
            </div>
          ))}
        </div>

        {/* Approve All Button (top) */}
        {!allApproved && !changeSubmitted && (
          <div style={{ marginBottom: '20px', textAlign: 'center' }}>
            <button
              onClick={approveAll}
              disabled={allMarketApproved}
              style={{
                padding: '8px 20px',
                background: allMarketApproved ? '#e2e8f0' : '#0A1929',
                color: allMarketApproved ? '#94a3b8' : '#fff',
                fontSize: '13px',
                fontWeight: 600,
                border: 'none',
                borderRadius: '6px',
                cursor: allMarketApproved ? 'default' : 'pointer',
              }}
            >
              {allMarketApproved ? '✓ All Approved' : 'Approve All Markets'}
            </button>
          </div>
        )}

        {/* Market Cards */}
        {markets.map((market, idx) => {
          const tier = TIER_CONFIG[market.tier];
          const isApproved = market.approved;
          return (
            <div
              key={market.name}
              style={{
                background: '#fff',
                border: `2px solid ${isApproved ? '#00BFA6' : tier.border}`,
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '16px',
                position: 'relative',
                opacity: allApproved ? 0.85 : 1,
                transition: 'border-color 0.3s, opacity 0.3s',
              }}
            >
              {/* Tier Badge */}
              <div style={{
                position: 'absolute',
                top: '-12px',
                left: '20px',
                background: tier.color,
                color: '#fff',
                fontSize: '11px',
                fontWeight: 700,
                padding: '4px 14px',
                borderRadius: '20px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}>
                {tier.icon} {tier.label}
              </div>

              {/* Approve checkbox (top right) */}
              {!allApproved && !changeSubmitted && (
                <div style={{ position: 'absolute', top: '-12px', right: '20px' }}>
                  <button
                    onClick={() => toggleMarketApproval(idx)}
                    style={{
                      background: isApproved ? '#00BFA6' : '#fff',
                      color: isApproved ? '#fff' : '#94a3b8',
                      border: isApproved ? '2px solid #00BFA6' : '2px solid #e2e8f0',
                      borderRadius: '20px',
                      padding: '4px 14px',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {isApproved ? '✓ Approved' : 'Approve'}
                  </button>
                </div>
              )}

              <div style={{ marginTop: '8px' }}>
                <h2 style={{
                  fontSize: '22px',
                  fontWeight: 800,
                  color: '#0A1929',
                  margin: '0 0 4px 0',
                }}>
                  {market.name}
                </h2>
                <p style={{
                  fontSize: '13px',
                  color: '#64748b',
                  margin: '0 0 16px 0',
                }}>
                  {tier.description}
                </p>

                {/* Stats Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '12px',
                }}>
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
                  marginTop: '12px',
                  padding: '10px 14px',
                  background: '#f8f9fa',
                  borderRadius: '6px',
                  fontSize: '13px',
                  color: '#475569',
                  lineHeight: 1.5,
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
            background: '#f8f9fa',
            borderRadius: '8px',
            padding: '20px 24px',
            marginTop: '32px',
            marginBottom: '24px',
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
                }}>
                  {step.num}
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#0A1929' }}>{step.title}</div>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Confirm + Continue Button */}
        {!allApproved && !changeSubmitted && (
          <div>
            <button
              onClick={handleConfirm}
              disabled={loading || approvedCount === 0}
              style={{
                width: '100%',
                padding: '16px 24px',
                background: approvedCount === 3 ? '#00BFA6' : approvedCount > 0 ? '#0A1929' : '#e2e8f0',
                color: approvedCount > 0 ? '#fff' : '#94a3b8',
                fontSize: '16px',
                fontWeight: 700,
                border: 'none',
                borderRadius: '8px',
                cursor: loading || approvedCount === 0 ? 'default' : 'pointer',
                marginBottom: '12px',
                opacity: loading ? 0.7 : 1,
                transition: 'background 0.3s',
              }}
            >
              {loading ? 'Saving...' : approvedCount === 3 ? '✓ Confirm All 3 Markets → Next Step' : approvedCount > 0 ? `Confirm ${approvedCount} Market${approvedCount > 1 ? 's' : ''} → Next Step` : 'Approve at least one market to continue'}
            </button>

            <div style={{
              textAlign: 'center',
              fontSize: '13px',
              color: '#94a3b8',
              marginBottom: '24px',
            }}>
              or
            </div>

            <div style={{
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '20px',
            }}>
              <p style={{ fontSize: '14px', fontWeight: 600, color: '#0A1929', margin: '0 0 8px 0' }}>
                Want to adjust?
              </p>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 12px 0' }}>
                Tell us what you&apos;d like to change and we&apos;ll update the recommendation.
              </p>
              <textarea
                value={changeRequest}
                onChange={(e) => setChangeRequest(e.target.value)}
                placeholder="e.g., I'd like to focus more on La Jolla instead of Rancho Santa Fe..."
                style={{
                  width: '100%',
                  minHeight: '80px',
                  padding: '12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '14px',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                }}
              />
              <button
                onClick={handleChangeRequest}
                disabled={loading || !changeRequest.trim()}
                style={{
                  marginTop: '8px',
                  padding: '10px 20px',
                  background: '#0A1929',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: 600,
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  opacity: loading || !changeRequest.trim() ? 0.5 : 1,
                }}
              >
                Request Changes
              </button>
            </div>
          </div>
        )}

        {/* Approved State */}
        {allApproved && (
          <div style={{
            marginTop: '32px',
            background: '#f0fdf9',
            border: '2px solid #00BFA6',
            borderRadius: '12px',
            padding: '24px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>✓</div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0A1929', margin: '0 0 8px 0' }}>
              Markets Approved
            </h3>
            <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
              Next up: confirm the neighborhoods within each market.
              Redirecting in a moment...
            </p>
          </div>
        )}

        {/* Change Request Submitted */}
        {changeSubmitted && (
          <div style={{
            marginTop: '32px',
            background: '#fffdf5',
            border: '2px solid #D4A830',
            borderRadius: '12px',
            padding: '24px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📝</div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0A1929', margin: '0 0 8px 0' }}>
              Change Request Received
            </h3>
            <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
              We&apos;ll review your feedback and update the recommendation. You&apos;ll receive an email when it&apos;s ready.
            </p>
          </div>
        )}

        {/* Footer */}
        <div style={{
          marginTop: '48px',
          borderTop: '1px solid #e2e8f0',
          paddingTop: '24px',
          textAlign: 'center',
        }}>
          <p style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: 800, color: '#0A1929', letterSpacing: '-0.5px' }}>CITED</p>
          <p style={{ margin: '0 0 10px 0', fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1.5px' }}>AI Citation Optimization™ for Professionals</p>
          <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>
            Powered by PRISM™ · <a href="https://citedagent.com/how-it-works" style={{ color: '#00BFA6', textDecoration: 'none', fontWeight: 600 }}>How it works</a> · <a href="https://citedagent.com" style={{ color: '#00BFA6', textDecoration: 'none', fontWeight: 600 }}>citedagent.com</a>
          </p>
        </div>
        <div style={{ height: '4px', background: 'linear-gradient(90deg, #00BFA6, #D4A830, #00BFA6)', marginTop: '24px', borderRadius: '2px' }} />
      </div>
    </div>
  );
}
