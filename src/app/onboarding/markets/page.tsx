'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';

/* ═══════════════════════════════════════════════════════════════
   Market Recommendation Card — Onboarding Step
   Client approves Primary / Secondary / Growth markets
   before Full PRISM scan runs.
   v1.0 — April 9, 2026
   ═══════════════════════════════════════════════════════════════ */

type MarketRec = {
  name: string;
  tier: 'primary' | 'secondary' | 'growth';
  evidence: string;
  txn_volume: string;
  txn_count: number;
  ai_signal: string;
};

// Default data — will be replaced by Supabase pull in production
const DEFAULT_MARKETS: MarketRec[] = [
  {
    name: 'Carmel Valley',
    tier: 'primary',
    evidence: 'Deepest transaction history + strongest existing AI signal',
    txn_volume: '$22.3M',
    txn_count: 14,
    ai_signal: 'Strongest — appearing in some Brave results',
  },
  {
    name: 'Carlsbad',
    tier: 'secondary',
    evidence: 'Strong volume, mixed-tier (luxury + mid-market)',
    txn_volume: '$18.1M',
    txn_count: 11,
    ai_signal: 'Some signal — partial platform presence',
  },
  {
    name: 'Rancho Santa Fe',
    tier: 'growth',
    evidence: 'Luxury market, building evidence — thinner history but high opportunity',
    txn_volume: '$7.2M',
    txn_count: 3,
    ai_signal: 'Minimal — not appearing in AI results',
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
  const [approved, setApproved] = useState(false);
  const [changeRequest, setChangeRequest] = useState('');
  const [changeSubmitted, setChangeSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [clientName, setClientName] = useState('');
  const router = useRouter();

  useEffect(() => {
    loadClientData();
  }, []);

  async function loadClientData() {
    const supabase = createSupabaseBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('cited_intake')
      .select('full_name, primary_markets, markets_approved, market_recommendations')
      .eq('email', user.email)
      .single();

    if (data) {
      setClientName(data.full_name || '');
      if (data.markets_approved) {
        setApproved(true);
      }
      if (data.market_recommendations) {
        try {
          const recs = typeof data.market_recommendations === 'string'
            ? JSON.parse(data.market_recommendations)
            : data.market_recommendations;
          if (Array.isArray(recs) && recs.length > 0) {
            setMarkets(recs);
          }
        } catch { /* use defaults */ }
      }
    }
  }

  async function handleApprove() {
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const marketData = {
      primary_market: markets.find(m => m.tier === 'primary')?.name || '',
      secondary_market: markets.find(m => m.tier === 'secondary')?.name || '',
      growth_market: markets.find(m => m.tier === 'growth')?.name || '',
    };

    await supabase
      .from('cited_intake')
      .update({
        markets_approved: true,
        markets_approved_at: new Date().toISOString(),
        primary_market: marketData.primary_market,
        secondary_market: marketData.secondary_market,
        growth_market: marketData.growth_market,
        market_recommendations: JSON.stringify(markets),
      })
      .eq('email', user.email);

    setApproved(true);
    setLoading(false);

    // Auto-navigate to neighborhoods after 2 seconds
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

  const firstName = clientName.split(' ')[0] || 'there';

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', padding: '0' }}>
      {/* Header */}
      <div style={{
        background: '#0A1929',
        padding: '24px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '20px', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>CITED</span>
          <span style={{ color: '#64748b', fontSize: '14px' }}>|</span>
          <span style={{ color: '#94a3b8', fontSize: '14px' }}>Market Strategy</span>
        </div>
        <div style={{
          background: 'rgba(0,191,166,0.15)',
          color: '#00BFA6',
          fontSize: '12px',
          fontWeight: 600,
          padding: '4px 12px',
          borderRadius: '20px',
        }}>
          Step 1 of 2
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '40px 24px' }}>
        {/* Education Line */}
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
            <span style={{ color: '#00BFA6', fontWeight: 700 }}>We're building your evidence.</span>
          </p>
        </div>

        {/* Intro */}
        <h1 style={{
          fontSize: '28px',
          fontWeight: 800,
          color: '#0A1929',
          marginBottom: '8px',
          lineHeight: 1.3,
        }}>
          {firstName}, here's your market strategy.
        </h1>
        <p style={{
          fontSize: '15px',
          color: '#64748b',
          marginBottom: '32px',
          lineHeight: 1.6,
        }}>
          Based on your transaction history, intake data, and our initial AI scan, we've identified
          three markets to focus your optimization. Review the recommendation below and approve — or
          request changes if something doesn't look right.
        </p>

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

        {/* Market Cards */}
        {markets.map((market) => {
          const tier = TIER_CONFIG[market.tier];
          return (
            <div
              key={market.name}
              style={{
                background: '#fff',
                border: `2px solid ${tier.border}`,
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '16px',
                position: 'relative',
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
                  <strong>Why this tier:</strong> {market.evidence}
                </div>
              </div>
            </div>
          );
        })}

        {/* Action Buttons */}
        {!approved && !changeSubmitted && (
          <div style={{ marginTop: '32px' }}>
            <button
              onClick={handleApprove}
              disabled={loading}
              style={{
                width: '100%',
                padding: '16px 24px',
                background: '#00BFA6',
                color: '#fff',
                fontSize: '16px',
                fontWeight: 700,
                border: 'none',
                borderRadius: '8px',
                cursor: loading ? 'wait' : 'pointer',
                marginBottom: '12px',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Saving...' : '✓ Approve Market Strategy'}
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
                Tell us what you'd like to change and we'll update the recommendation.
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
        {approved && (
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
              We'll review your feedback and update the recommendation. You'll receive an email when it's ready.
            </p>
          </div>
        )}

        {/* Footer */}
        <div style={{
          marginTop: '48px',
          textAlign: 'center',
          fontSize: '12px',
          color: '#94a3b8',
          paddingBottom: '32px',
        }}>
          Powered by PRISM™ · CITED
        </div>
      </div>
    </div>
  );
}
