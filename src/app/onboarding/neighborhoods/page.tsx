'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';
import CitedHeader from '@/components/CitedHeader';
import CitedFooter from '@/components/CitedFooter';

/* ═══════════════════════════════════════════════════════════════
   Neighborhood Confirmation Card — Onboarding Step 2
   Token-based auth (same token from markets page)
   v2.0 — April 9, 2026
   ═══════════════════════════════════════════════════════════════ */

type Neighborhood = {
  name: string;
  market: string;
  source: 'intake' | 'mls' | 'prism';
  confirmed: boolean;
};

type MarketGroup = {
  market: string;
  tier: string;
  neighborhoods: Neighborhood[];
};

const DEFAULT_GROUPS: MarketGroup[] = [
  {
    market: 'Carmel Valley',
    tier: 'Primary Market',
    neighborhoods: [
      { name: 'Pacific Highlands Ranch', market: 'Carmel Valley', source: 'intake', confirmed: true },
      { name: 'Torrey Hills', market: 'Carmel Valley', source: 'mls', confirmed: true },
      { name: 'Rancho Pacifica', market: 'Carmel Valley', source: 'intake', confirmed: true },
      { name: 'Del Mar Mesa', market: 'Carmel Valley', source: 'mls', confirmed: true },
    ],
  },
  {
    market: 'Carlsbad',
    tier: 'Secondary Market',
    neighborhoods: [
      { name: 'La Costa Oaks', market: 'Carlsbad', source: 'intake', confirmed: true },
      { name: 'Aviara', market: 'Carlsbad', source: 'mls', confirmed: true },
    ],
  },
  {
    market: 'Rancho Santa Fe',
    tier: 'Growth Market',
    neighborhoods: [
      { name: 'The Crosby', market: 'Rancho Santa Fe', source: 'intake', confirmed: true },
      { name: 'Fairbanks Ranch', market: 'Rancho Santa Fe', source: 'intake', confirmed: true },
    ],
  },
];

const TIER_COLORS: Record<string, string> = {
  'Primary Market': '#00BFA6',
  'Secondary Market': '#D4A830',
  'Growth Market': '#0A1929',
};

const SOURCE_LABELS: Record<string, { label: string; color: string }> = {
  intake: { label: 'From your intake', color: '#00BFA6' },
  mls: { label: 'From MLS data', color: '#D4A830' },
  prism: { label: 'From PRISM scan', color: '#6366f1' },
};

function NeighborhoodsContent() {
  const [groups, setGroups] = useState<MarketGroup[]>(DEFAULT_GROUPS);
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [newHoodName, setNewHoodName] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientBrokerage, setClientBrokerage] = useState('');
  const [marketsApproved, setMarketsApproved] = useState(false);
  const [recordId, setRecordId] = useState('');
  const [tokenValid, setTokenValid] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    loadClientData();
  }, []);

  async function loadClientData() {
    const supabase = createSupabaseBrowserClient();
    const token = searchParams.get('token');

    let data = null;

    if (token) {
      const { data: d } = await supabase
        .from('cited_intake')
        .select('id, full_name, email, brokerage, markets_approved, neighborhoods_confirmed, neighborhood_data, onboarding_token_expires_at')
        .eq('onboarding_token', token)
        .single();
      if (d) {
        const expires = new Date(d.onboarding_token_expires_at);
        if (expires > new Date()) {
          data = d;
          setTokenValid(true);
        }
      }
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: d } = await supabase
          .from('cited_intake')
          .select('id, full_name, email, brokerage, markets_approved, neighborhoods_confirmed, neighborhood_data')
          .eq('email', user.email)
          .single();
        if (d) {
          data = d;
          setTokenValid(true);
        }
      }
    }

    if (data) {
      setRecordId(data.id);
      setClientName(data.full_name || '');
      setClientEmail(data.email || '');
      setClientBrokerage(data.brokerage || '');
      setMarketsApproved(!!data.markets_approved);
      if (data.neighborhoods_confirmed) setConfirmed(true);
      if (data.neighborhood_data) {
        try {
          const parsed = typeof data.neighborhood_data === 'string'
            ? JSON.parse(data.neighborhood_data) : data.neighborhood_data;
          if (Array.isArray(parsed) && parsed.length > 0) setGroups(parsed);
        } catch { /* use defaults */ }
      }
    }
    setPageLoading(false);
  }

  function toggleNeighborhood(marketIdx: number, hoodIdx: number) {
    setGroups(prev => {
      const updated = [...prev];
      const market = { ...updated[marketIdx] };
      const hoods = [...market.neighborhoods];
      hoods[hoodIdx] = { ...hoods[hoodIdx], confirmed: !hoods[hoodIdx].confirmed };
      market.neighborhoods = hoods;
      updated[marketIdx] = market;
      return updated;
    });
  }

  function addNeighborhood(marketIdx: number) {
    if (!newHoodName.trim()) return;
    setGroups(prev => {
      const updated = [...prev];
      const market = { ...updated[marketIdx] };
      market.neighborhoods = [...market.neighborhoods, {
        name: newHoodName.trim(),
        market: market.market,
        source: 'intake' as const,
        confirmed: true,
      }];
      updated[marketIdx] = market;
      return updated;
    });
    setNewHoodName('');
    setAddingTo(null);
  }

  function removeNeighborhood(marketIdx: number, hoodIdx: number) {
    setGroups(prev => {
      const updated = [...prev];
      const market = { ...updated[marketIdx] };
      market.neighborhoods = market.neighborhoods.filter((_, i) => i !== hoodIdx);
      updated[marketIdx] = market;
      return updated;
    });
  }

  async function handleConfirm() {
    if (!recordId) return;
    setLoading(true);
    const supabase = createSupabaseBrowserClient();

    const confirmedHoods = groups.flatMap(g =>
      g.neighborhoods.filter(n => n.confirmed).map(n => ({
        name: n.name,
        market: g.market,
        source: n.source,
      }))
    );

    await supabase
      .from('cited_intake')
      .update({
        neighborhoods_confirmed: true,
        neighborhoods_confirmed_at: new Date().toISOString(),
        neighborhood_data: JSON.stringify(groups),
        confirmed_neighborhoods: JSON.stringify(confirmedHoods),
      })
      .eq('id', recordId);

    setConfirmed(true);
    setLoading(false);
  }

  const firstName = clientName.split(' ')[0] || '';
  const totalConfirmed = groups.reduce((sum, g) => sum + g.neighborhoods.filter(n => n.confirmed).length, 0);

  if (pageLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#0A1929', letterSpacing: '2px', marginBottom: '8px' }}>CITED</div>
          <div style={{ fontSize: '14px', color: '#94a3b8' }}>Loading your neighborhoods...</div>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '40px', maxWidth: '400px' }}>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#0A1929', letterSpacing: '2px', marginBottom: '8px' }}>CITED</div>
          <p style={{ fontSize: '16px', color: '#0A1929', fontWeight: 600 }}>Sign in to continue</p>
          <a href="/login?redirect=/onboarding/neighborhoods" style={{
            display: 'inline-block', background: '#00BFA6', color: '#fff',
            fontSize: '15px', fontWeight: 700, padding: '12px 32px', borderRadius: '8px', textDecoration: 'none',
          }}>Sign In →</a>
        </div>
      </div>
    );
  }

  if (!marketsApproved && !confirmed) {
    const token = searchParams.get('token');
    const tokenParam = token ? `?token=${token}` : '';
    return (
      <div style={{ minHeight: '100vh', background: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#0A1929', letterSpacing: '2px', marginBottom: '16px' }}>CITED</div>
          <p style={{ fontSize: '16px', color: '#64748b' }}>Markets need to be approved first.</p>
          <a href={`/onboarding/markets${tokenParam}`} style={{ color: '#00BFA6', fontWeight: 600 }}>← Go to Market Approval</a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      <CitedHeader
        variant="onboarding"
        stepIndicator="Step 2 of 2 — Neighborhood Confirmation"
        userEmail={clientEmail}
        userName={clientName}
        clientTier="founding_client"
      />

      {/* Content */}
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '40px 24px' }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: 800,
          color: '#0A1929',
          marginBottom: '8px',
          lineHeight: 1.3,
        }}>
          Confirm your neighborhoods.
        </h1>
        <p style={{
          fontSize: '15px',
          color: '#64748b',
          marginBottom: '8px',
          lineHeight: 1.6,
        }}>
          These are the neighborhoods we'll optimize your visibility for within each market.
          We've pulled them from your intake and MLS transaction history.
        </p>
        <p style={{
          fontSize: '13px',
          color: '#94a3b8',
          marginBottom: '32px',
        }}>
          ✓ Check the neighborhoods you want to target · ✕ Uncheck any to remove · + Add any we missed
        </p>

        {/* Market Groups */}
        {groups.map((group, gIdx) => {
          const tierColor = TIER_COLORS[group.tier] || '#0A1929';
          const confirmedCount = group.neighborhoods.filter(n => n.confirmed).length;

          return (
            <div
              key={group.market}
              style={{
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                marginBottom: '20px',
                overflow: 'hidden',
              }}
            >
              {/* Market Header */}
              <div style={{
                background: '#f8f9fa',
                padding: '16px 24px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0A1929', margin: 0 }}>
                    {group.market}
                  </h2>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: tierColor,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                  }}>
                    {group.tier}
                  </span>
                </div>
                <div style={{
                  background: tierColor === '#0A1929' ? '#f0f4f8' : `${tierColor}15`,
                  color: tierColor,
                  fontSize: '12px',
                  fontWeight: 600,
                  padding: '4px 10px',
                  borderRadius: '12px',
                }}>
                  {confirmedCount} selected
                </div>
              </div>

              {/* Neighborhoods */}
              <div style={{ padding: '8px 16px' }}>
                {group.neighborhoods.map((hood, hIdx) => {
                  const src = SOURCE_LABELS[hood.source];
                  return (
                    <div
                      key={hood.name}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '12px 8px',
                        borderBottom: hIdx < group.neighborhoods.length - 1 ? '1px solid #f1f5f9' : 'none',
                        gap: '12px',
                      }}
                    >
                      {/* Checkbox */}
                      {!confirmed && (
                        <input
                          type="checkbox"
                          checked={hood.confirmed}
                          onChange={() => toggleNeighborhood(gIdx, hIdx)}
                          style={{ width: '18px', height: '18px', accentColor: '#00BFA6', cursor: 'pointer' }}
                        />
                      )}
                      {confirmed && (
                        <span style={{ fontSize: '16px' }}>{hood.confirmed ? '✓' : '—'}</span>
                      )}

                      {/* Name + Source */}
                      <div style={{ flex: 1 }}>
                        <span style={{
                          fontSize: '15px',
                          fontWeight: 600,
                          color: hood.confirmed ? '#0A1929' : '#94a3b8',
                          textDecoration: hood.confirmed ? 'none' : 'line-through',
                        }}>
                          {hood.name}
                        </span>
                        <span style={{
                          marginLeft: '8px',
                          fontSize: '10px',
                          fontWeight: 600,
                          color: src.color,
                          background: `${src.color}15`,
                          padding: '2px 8px',
                          borderRadius: '10px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}>
                          {src.label}
                        </span>
                      </div>

                      {/* Remove */}
                      {!confirmed && (
                        <button
                          onClick={() => removeNeighborhood(gIdx, hIdx)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#cbd5e1',
                            cursor: 'pointer',
                            fontSize: '16px',
                            padding: '4px',
                          }}
                          title="Remove"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  );
                })}

                {/* Add Neighborhood */}
                {!confirmed && (
                  <div style={{ padding: '8px 8px 12px' }}>
                    {addingTo === group.market ? (
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input
                          type="text"
                          value={newHoodName}
                          onChange={(e) => setNewHoodName(e.target.value)}
                          placeholder="Neighborhood name"
                          onKeyDown={(e) => e.key === 'Enter' && addNeighborhood(gIdx)}
                          autoFocus
                          style={{
                            flex: 1,
                            padding: '8px 12px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontFamily: 'inherit',
                          }}
                        />
                        <button
                          onClick={() => addNeighborhood(gIdx)}
                          style={{
                            padding: '8px 16px',
                            background: '#00BFA6',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          Add
                        </button>
                        <button
                          onClick={() => { setAddingTo(null); setNewHoodName(''); }}
                          style={{
                            padding: '8px 12px',
                            background: '#f1f5f9',
                            color: '#64748b',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '13px',
                            cursor: 'pointer',
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setAddingTo(group.market)}
                        style={{
                          background: 'none',
                          border: '1px dashed #cbd5e1',
                          borderRadius: '6px',
                          padding: '8px 16px',
                          color: '#94a3b8',
                          fontSize: '13px',
                          cursor: 'pointer',
                          width: '100%',
                        }}
                      >
                        + Add a neighborhood
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Summary */}
        <div style={{
          background: '#f0f4f8',
          borderRadius: '8px',
          padding: '16px 20px',
          marginBottom: '24px',
          fontSize: '14px',
          color: '#475569',
          lineHeight: 1.6,
        }}>
          <strong>{totalConfirmed} neighborhoods</strong> across {groups.length} markets will be
          included in your Full PRISM Scan. Each neighborhood gets its own AI query — the more
          specific, the more citation opportunities.
        </div>

        {/* Confirm Button */}
        {!confirmed && (
          <button
            onClick={handleConfirm}
            disabled={loading || totalConfirmed === 0}
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
              opacity: loading || totalConfirmed === 0 ? 0.7 : 1,
            }}
          >
            {loading ? 'Saving...' : `✓ Confirm ${totalConfirmed} Neighborhoods — Start Full Scan`}
          </button>
        )}

        {/* Confirmed State */}
        {confirmed && (
          <div style={{
            marginTop: '8px',
            background: '#f0fdf9',
            border: '2px solid #00BFA6',
            borderRadius: '12px',
            padding: '24px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔍</div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0A1929', margin: '0 0 8px 0' }}>
              Neighborhoods Confirmed — Full Scan Running
            </h3>
            <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
              Your Full PRISM Scan is running across {totalConfirmed} neighborhoods and 4 AI models.
              You'll receive your results and positioning statement within 24 hours.
            </p>
          </div>
        )}

        <CitedFooter />
      </div>
    </div>
  );
}

export default function NeighborhoodsPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: '14px', color: '#94a3b8' }}>Loading...</div>
      </div>
    }>
      <NeighborhoodsContent />
    </Suspense>
  );
}
