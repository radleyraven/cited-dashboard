import type { PublicPositioningReview, StatTier, StatStatus, StatInventoryRow, ChangeCategory, MarketRole } from '@/types/positioning';
import CitedHeader from '@/components/CitedHeader';

/*
  PositioningReviewPage — renders cited_intake.positioning_data.client_view
  Brand aligned with Citation Report / Score Page design system.
  Actions rendered but DISABLED.
  Polish v3 (2026-04-24):
    - Stats sorted gold → silver per Sugarman slippery slide research
    - Source statement tightened (Bly Rule 6)
    - Header passes userName + clientTier (Krug/Yablonski continuity)
    - Footer matches /score light-footer pattern (was navy, mismatched)
    - Freshness signal added (SE Ranking 2.3M page study)
*/

// Tier sort order: gold first (Sugarman: lead with strongest claim)
const TIER_ORDER: Record<StatTier, number> = {
  gold: 0,
  gold_conditional: 1,
  silver: 2,
  tier_3_authority: 3,
};

function sortStatsByTier(stats: StatInventoryRow[]): StatInventoryRow[] {
  return [...stats].sort((a, b) => {
    const aOrder = TIER_ORDER[a.tier] ?? 99;
    const bOrder = TIER_ORDER[b.tier] ?? 99;
    return aOrder - bOrder;
  });
}

const D = {
  navy: '#0A1929',
  navyDeep: '#091629',
  teal: '#00BFA6',
  red: '#EF4444',
  gold: '#D4A830',
  goldDeep: '#C9A84C',
  grayBg: '#f8f9fa',
  grayMid: '#f1f5f9',
  textSecondary: '#475569',
  textTertiary: '#94a3b8',
  border: '#e2e8f0',
  white: '#ffffff',
};

const CHANGE_OPTIONS: Array<{ value: ChangeCategory; label: string }> = [
  { value: 'markets', label: 'Markets' },
  { value: 'pillar_1', label: 'Pillar 1 — Pricing' },
  { value: 'pillar_2', label: 'Pillar 2 — Process' },
  { value: 'stat_accuracy', label: 'Stat accuracy' },
  { value: 'tone_voice', label: 'Tone / voice' },
  { value: 'other', label: 'Other' },
];

// Friendly labels for framework-native tier values (storage truth, UI translation)
function tierLabel(tier: StatTier): string {
  const map: Record<StatTier, string> = {
    gold: 'Gold',
    silver: 'Silver',
    gold_conditional: 'Gold (conditional)',
    tier_3_authority: 'Authority',
  };
  return map[tier] ?? tier;
}

function statusLabel(status: StatStatus): string {
  const map: Record<StatStatus, string> = {
    verified: 'Verified',
    pending: 'Pending',
    pending_baseline_or_drop: 'Pending baseline',
    blocked: 'Blocked',
  };
  return map[status] ?? status;
}

function statusColor(status: StatStatus): string {
  if (status === 'verified') return D.teal;
  if (status === 'blocked') return D.red;
  return D.gold;
}

// Market role color hierarchy: primary=gold, secondary=teal, growth=gray
function marketRoleStyle(role: MarketRole): { bg: string; fg: string } {
  const r = role.toString().toLowerCase();
  if (r === 'primary') return { bg: D.gold, fg: D.navy };
  if (r === 'secondary') return { bg: D.teal, fg: D.white };
  return { bg: D.grayMid, fg: D.navy }; // growth + fallback
}

// Strip improvised sub-titles from Pillar 2 subheading.
// Title becomes "Pillar 2 — [Archetype]" only. Mechanism stays in body text.
// Component-side cleanup; JSONB source preserved.
function cleanPillarSubheading(subheading: string): string {
  // Strip everything after the second em dash or hyphen if it adds a sub-modifier
  // Example: "Pillar 2 — Process Mastery / Pre-Listing Process" → "Pillar 2 — Process Mastery"
  const m = subheading.match(/^(.+?\u2014\s*[^\/\u2014]+)/);
  return m ? m[1].trim() : subheading;
}

export function PositioningReviewPage({ review }: { review: PublicPositioningReview }) {
  const cv = review.client_view;

  return (
    <main style={{ background: D.grayBg, minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', color: D.navy }}>
      {/* Shared Cited dashboard header with member identity (matches score page) */}
      <CitedHeader
        variant="onboarding"
        stepIndicator="Positioning Review"
        userName={cv.client_name}
        clientTier="founding_client"
      />

      {/* Hero */}
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '40px 24px 24px' }}>
        <h1 style={{ fontSize: '38px', fontWeight: 700, lineHeight: '1.15', color: D.navy, marginBottom: '16px' }}>
          Review Your Positioning Direction
        </h1>
        <div style={{ fontSize: '16px', color: D.textSecondary, lineHeight: '1.6', maxWidth: '720px' }}>
          <p style={{ marginBottom: '14px' }}>{cv.intro_paragraph}</p>
          <p>{cv.intro_followup}</p>
        </div>
        <div style={{ marginTop: '24px', fontSize: '13px', color: D.textTertiary }}>
          Status: <span style={{ color: D.navy, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{review.positioning_status.replace('_', ' ')}</span>
          {review.positioning_approved_version && (
            <span style={{ marginLeft: '16px' }}>Version: <span style={{ color: D.navy, fontWeight: 600 }}>{review.positioning_approved_version}</span></span>
          )}
        </div>
      </div>

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0 24px 48px' }}>

        {/* Reputation Opener — with reputation classification pill */}
        <SectionWithPill heading={cv.reputation_opener.heading} pill="SEASONED VETERAN">
          <p style={{ fontSize: '19px', lineHeight: '1.6', color: D.navy, fontWeight: 500 }}>{cv.reputation_opener.text}</p>
        </SectionWithPill>

        {/* Markets (moved up per O's recommendation — highest sensitivity) */}
        <Section heading={cv.markets.heading}>
          <div style={{ background: D.white, borderRadius: '12px', overflow: 'hidden', border: `1px solid ${D.border}` }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: D.grayMid }}>
                  <th style={thStyle}>Role</th>
                  <th style={thStyle}>Market</th>
                  <th style={thStyle}>Career Volume</th>
                  <th style={thStyle}>Transactions</th>
                </tr>
              </thead>
              <tbody>
                {cv.markets.rows.map((m, i) => {
                  const rs = marketRoleStyle(m.role);
                  return (
                    <tr key={`${m.role}-${m.name}-${i}`} style={{ borderTop: `1px solid ${D.border}` }}>
                      <td style={tdStyle}>
                        <span style={{ display: 'inline-block', padding: '4px 10px', borderRadius: '999px', background: rs.bg, color: rs.fg, fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{m.role}</span>
                      </td>
                      <td style={{ ...tdStyle, fontWeight: 600 }}>{m.name}</td>
                      <td style={tdStyle}>{m.career_volume}</td>
                      <td style={tdStyle}>{m.transactions}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '14px', color: D.textSecondary, marginTop: '12px', lineHeight: '1.5' }}>{cv.markets.closer}</p>
        </Section>

        {/* Pillar 1 */}
        <PillarSection
          heading={cv.pillar_1.heading}
          subheading={cleanPillarSubheading(cv.pillar_1.subheading)}
          category={cv.pillar_1.category}
          text={cv.pillar_1.text}
          proofPoints={cv.pillar_1.proof_points}
          verificationPrompt={cv.pillar_1.verification_prompt}
          verificationQuestions={cv.pillar_1.verification_questions}
          verificationCloser={cv.pillar_1.verification_closer}
        />

        {/* Pillar 2 — subheading cleaned (improvised modifiers stripped at render) */}
        <PillarSection
          heading={cv.pillar_2.heading}
          subheading={cleanPillarSubheading(cv.pillar_2.subheading)}
          category={cv.pillar_2.category}
          text={cv.pillar_2.text}
          proofPoints={cv.pillar_2.proof_points}
          verificationPrompt={cv.pillar_2.verification_prompt}
          verificationQuestions={cv.pillar_2.verification_questions}
          verificationCloser={cv.pillar_2.verification_closer}
        />

        {/* Non-Fit */}
        <Section heading={cv.non_fit.heading} subheading={cv.non_fit.subheading}>
          <p style={{ fontSize: '17px', lineHeight: '1.65', color: D.navy }}>{cv.non_fit.text}</p>
        </Section>

        {/* Stat Inventory — sorted gold → silver per Sugarman slippery slide */}
        <Section heading={cv.stat_inventory.heading}>
          <p style={{ fontSize: '14px', color: D.textSecondary, marginBottom: '16px', lineHeight: '1.5' }}>{cv.stat_inventory.intro}</p>
          <div style={{ background: D.grayMid, borderRadius: '8px', padding: '10px 14px', marginBottom: '14px', fontSize: '12px', color: D.textSecondary, lineHeight: '1.5' }}>
            <strong style={{ color: D.navy }}>Source:</strong> San Diego MLS career records and individual listing history. Each row below shows the underlying source. Numbers can be cross-checked against your MLS dashboard.
          </div>
          <div style={{ background: D.white, borderRadius: '12px', overflow: 'hidden', border: `1px solid ${D.border}` }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: D.grayMid }}>
                  <th style={thStyle}>Stat</th>
                  <th style={thStyle}>Tier</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Used Where</th>
                </tr>
              </thead>
              <tbody>
                {sortStatsByTier(cv.stat_inventory.stats).map((s, i) => (
                  <tr key={i} style={{ borderTop: `1px solid ${D.border}` }}>
                    <td style={{ ...tdStyle, fontWeight: 500 }}>{s.stat}</td>
                    <td style={tdStyle}>
                      <span style={{ display: 'inline-block', padding: '3px 8px', borderRadius: '6px', background: D.grayMid, fontSize: '11px', fontWeight: 600, color: D.navy }}>{tierLabel(s.tier)}</span>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ display: 'inline-block', padding: '3px 8px', borderRadius: '6px', background: statusColor(s.status), color: D.white, fontSize: '11px', fontWeight: 600 }}>{statusLabel(s.status)}</span>
                    </td>
                    <td style={tdStyle}>{s.use}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '14px', color: D.textSecondary, marginTop: '12px', lineHeight: '1.5' }}>{cv.stat_inventory.closer}</p>
        </Section>

        {/* Voice Signature Card (compact) + What Happens Next */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginTop: '40px' }}>

          {/* VOICE SIGNATURE CARD — compact reference, full voice approval moves to Copy Kit stage */}
          <div style={{ background: D.white, borderRadius: '12px', padding: '20px 24px', border: `1px solid ${D.border}` }}>
            <div style={{ fontSize: '10px', fontWeight: 700, color: D.gold, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '6px' }}>Voice Signature</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: D.navy, marginBottom: '10px', textTransform: 'capitalize' }}>{cv.voice.archetype.replace(/_/g, ' ')}</div>
            <div style={{ marginBottom: '10px' }}>
              {cv.voice.descriptors.map((d, i) => (
                <span key={i} style={{ display: 'inline-block', padding: '3px 9px', borderRadius: '999px', background: D.grayMid, color: D.navy, fontSize: '11px', fontWeight: 600, marginRight: '5px', marginBottom: '5px' }}>{d}</span>
              ))}
            </div>
            <p style={{ fontSize: '12px', color: D.textTertiary, lineHeight: '1.5', fontStyle: 'italic', marginBottom: 0 }}>
              Full voice review happens at the Copy Kit stage when you see drafts.
            </p>
          </div>

          <div style={{ background: D.white, borderRadius: '12px', padding: '24px 28px', border: `1px solid ${D.border}` }}>
            <div style={{ fontSize: '10px', fontWeight: 700, color: D.gold, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>What Happens Next</div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: D.navy, marginBottom: '12px' }}>{cv.what_happens_next.heading}</h2>
            <p style={{ fontSize: '14px', color: D.textSecondary, lineHeight: '1.6', marginBottom: '12px' }}>{cv.what_happens_next.intro}</p>
            <ul style={{ paddingLeft: '20px', margin: '0 0 12px' }}>
              {cv.what_happens_next.deliverables.map((d, i) => (
                <li key={i} style={{ fontSize: '13px', color: D.navy, lineHeight: '1.55', marginBottom: '4px' }}>{d}</li>
              ))}
            </ul>
            <p style={{ fontSize: '12px', color: D.textTertiary, lineHeight: '1.5', fontStyle: 'italic', marginBottom: 0 }}>{cv.what_happens_next.closer}</p>
          </div>
        </div>

        {/* Approval actions — DISABLED in render-only pass */}
        <div style={{ marginTop: '48px', background: D.white, borderRadius: '14px', padding: '32px', border: `2px solid ${D.gold}` }}>
          <div style={{ fontSize: '10px', fontWeight: 700, color: D.gold, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>Your Sign-Off</div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: D.navy, marginBottom: '12px' }}>Approve or request changes</h2>
          <p style={{ fontSize: '14px', color: D.textSecondary, lineHeight: '1.6', marginBottom: '20px' }}>
            Approval locks your positioning. Radley reviews and triggers Copy Kit generation manually. You'll be notified when your platform-specific bios, satellite site copy, and downstream drafts are ready for review. Approval includes a 60-second undo window.
          </p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px' }}>
            <button
              type="button"
              disabled
              style={{ padding: '14px 28px', background: D.gold, color: D.navy, border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 700, cursor: 'not-allowed', opacity: 0.6 }}
              title="Actions wired in next phase"
            >
              Approve as-is
            </button>
            <button
              type="button"
              disabled
              style={{ padding: '14px 28px', background: D.white, color: D.navy, border: `1.5px solid ${D.navy}`, borderRadius: '10px', fontSize: '15px', fontWeight: 700, cursor: 'not-allowed', opacity: 0.6 }}
              title="Actions wired in next phase"
            >
              Request changes
            </button>
          </div>

          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: D.textTertiary, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '10px' }}>What would you like to change?</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px', marginBottom: '14px' }}>
              {CHANGE_OPTIONS.map(option => (
                <label key={option.value} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: D.navy, opacity: 0.6 }}>
                  <input type="checkbox" disabled />
                  {option.label}
                </label>
              ))}
            </div>
            <textarea
              disabled
              placeholder={`Be specific. Example: "Change the 86% stat to 84% — I just relisted one that reduced."`}
              style={{ width: '100%', minHeight: '110px', padding: '14px', border: `1.5px solid ${D.border}`, borderRadius: '10px', fontSize: '14px', fontFamily: 'inherit', color: D.navy, resize: 'vertical', opacity: 0.6, cursor: 'not-allowed' }}
            />
            <div style={{ marginTop: '12px', padding: '10px 14px', background: D.grayMid, borderRadius: '8px', fontSize: '12px', color: D.textSecondary, fontStyle: 'italic' }}>
              Actions intentionally disabled in render-only preview. Mutation endpoints wire in the next build phase under separate authorization.
            </div>
          </div>
        </div>

      </div>

      {/* Footer — light variant matching /score and /report (was navy CitedFooter, mismatched) */}
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ fontSize: '11px', color: D.textTertiary, textAlign: 'center', marginTop: '32px', marginBottom: '12px', fontStyle: 'italic' }}>
          Data current as of April 5, 2026 · Source: San Diego MLS
        </div>
        <div style={{ borderTop: `1px solid ${D.border}`, paddingTop: '24px', paddingBottom: '24px', textAlign: 'center' }}>
          <p style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: 800, color: D.navy, letterSpacing: '-0.5px' }}>CITED</p>
          <p style={{ margin: '0 0 10px 0', fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1.5px' }}>AI Citation Optimization™ for Professionals</p>
          <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>
            Powered by PRISM™ · <a href="/how-it-works" style={{ color: D.teal, textDecoration: 'none', fontWeight: 600 }}>How it works</a> · <a href="/privacy" style={{ color: D.teal, textDecoration: 'none', fontWeight: 600 }}>Privacy</a> · <a href="/terms" style={{ color: D.teal, textDecoration: 'none', fontWeight: 600 }}>Terms</a>
          </p>
        </div>
        <div style={{ height: '4px', background: `linear-gradient(90deg, ${D.teal}, ${D.gold}, ${D.teal})`, borderRadius: '2px', marginBottom: '32px' }} />
      </div>
    </main>
  );
}

function Section({ heading, children }: { heading: string; subheading?: string; children: React.ReactNode }) {
  // subheading prop accepted for backward compat but no longer rendered (per 2026-04-24 polish pass)
  return (
    <section style={{ marginTop: '40px' }}>
      <h2 style={{ fontSize: '26px', fontWeight: 700, color: D.navy, marginBottom: '16px', lineHeight: '1.2' }}>{heading}</h2>
      {children}
    </section>
  );
}

// SectionWithPill — used for Reputation Opener and any section that wants a category pill
// instead of a gold subheading text line.
function SectionWithPill({ heading, pill, children }: { heading: string; pill: string; children: React.ReactNode }) {
  return (
    <section style={{ marginTop: '40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '14px', flexWrap: 'wrap' }}>
        <h2 style={{ fontSize: '26px', fontWeight: 700, color: D.navy, lineHeight: '1.2', margin: 0 }}>{heading}</h2>
        <span style={{ padding: '5px 12px', borderRadius: '999px', background: D.grayMid, color: D.navy, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', whiteSpace: 'nowrap' }}>{pill}</span>
      </div>
      {children}
    </section>
  );
}

function PillarSection({ heading, subheading, category, text, proofPoints, verificationPrompt, verificationQuestions, verificationCloser }: {
  heading: string;
  subheading: string;  // accepted for backward compat; no longer rendered
  category: string;
  text: string;
  proofPoints?: string[];
  verificationPrompt: string;
  verificationQuestions?: string[];
  verificationCloser?: string;
}) {
  void subheading; // suppress unused warning while preserving prop API
  return (
    <section style={{ marginTop: '40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '14px', flexWrap: 'wrap' }}>
        <h2 style={{ fontSize: '26px', fontWeight: 700, color: D.navy, lineHeight: '1.2', margin: 0 }}>{heading}</h2>
        <span style={{ padding: '5px 12px', borderRadius: '999px', background: D.grayMid, color: D.navy, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', whiteSpace: 'nowrap' }}>{category.replace(/_/g, ' ')}</span>
      </div>
      <p style={{ fontSize: '18px', lineHeight: '1.65', color: D.navy, marginBottom: proofPoints?.length ? '16px' : '24px' }}>{text}</p>
      {proofPoints && proofPoints.length > 0 && (
        <ul style={{ paddingLeft: '20px', marginBottom: '24px' }}>
          {proofPoints.map((p, i) => (
            <li key={i} style={{ fontSize: '15px', color: D.textSecondary, lineHeight: '1.6', marginBottom: '6px' }}>{p}</li>
          ))}
        </ul>
      )}
      <div style={{ background: D.white, border: `1px solid ${D.border}`, borderLeft: `4px solid ${D.teal}`, borderRadius: '0 12px 12px 0', padding: '20px 24px' }}>
        <div style={{ fontSize: '10px', fontWeight: 700, color: D.teal, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '10px' }}>Verification</div>
        <p style={{ fontSize: '15px', color: D.navy, lineHeight: '1.6', marginBottom: verificationQuestions?.length ? '12px' : 0 }}>{verificationPrompt}</p>
        {verificationQuestions && verificationQuestions.length > 0 && (
          <ul style={{ paddingLeft: '20px', marginBottom: verificationCloser ? '12px' : 0 }}>
            {verificationQuestions.map((q, i) => (
              <li key={i} style={{ fontSize: '14px', color: D.textSecondary, lineHeight: '1.6', marginBottom: '6px' }}>{q}</li>
            ))}
          </ul>
        )}
        {verificationCloser && (
          <p style={{ fontSize: '13px', color: D.textTertiary, lineHeight: '1.5', fontStyle: 'italic', marginBottom: 0 }}>{verificationCloser}</p>
        )}
      </div>
    </section>
  );
}

const thStyle: React.CSSProperties = { padding: '14px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: D.textSecondary, textTransform: 'uppercase', letterSpacing: '1px' };
const tdStyle: React.CSSProperties = { padding: '14px 16px', fontSize: '14px', color: D.navy, verticalAlign: 'middle' };
