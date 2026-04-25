import type { PublicPositioningReview, StatTier, StatStatus, ChangeCategory } from '@/types/positioning';

/*
  PositioningReviewPage — renders cited_intake.positioning_data.client_view
  Brand aligned with Citation Report / Score Page design system.
  Actions rendered but DISABLED per RTI-STANDARD Phase 3b render-only scope.
*/

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

export function PositioningReviewPage({ review }: { review: PublicPositioningReview }) {
  const cv = review.client_view;

  return (
    <main style={{ background: D.grayBg, minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', color: D.navy }}>
      {/* Gradient bar */}
      <div style={{ height: '4px', background: `linear-gradient(to right, ${D.gold}, ${D.teal})` }} />

      {/* Header */}
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '48px 24px 24px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: D.gold, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px' }}>
          Cited — AI Citation Optimization™
        </div>
        <h1 style={{ fontSize: '40px', fontWeight: 700, lineHeight: '1.15', color: D.navy, marginBottom: '16px' }}>
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

        {/* Reputation Opener */}
        <Section heading={cv.reputation_opener.heading} subheading={cv.reputation_opener.subheading}>
          <p style={{ fontSize: '19px', lineHeight: '1.6', color: D.navy, fontWeight: 500 }}>{cv.reputation_opener.text}</p>
        </Section>

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
                {cv.markets.rows.map((m, i) => (
                  <tr key={`${m.role}-${m.name}-${i}`} style={{ borderTop: `1px solid ${D.border}` }}>
                    <td style={tdStyle}>
                      <span style={{ display: 'inline-block', padding: '4px 10px', borderRadius: '999px', background: m.role.toString().toLowerCase() === 'primary' ? D.teal : D.grayMid, color: m.role.toString().toLowerCase() === 'primary' ? D.white : D.navy, fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{m.role}</span>
                    </td>
                    <td style={{ ...tdStyle, fontWeight: 600 }}>{m.name}</td>
                    <td style={tdStyle}>{m.career_volume}</td>
                    <td style={tdStyle}>{m.transactions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '14px', color: D.textSecondary, marginTop: '12px', lineHeight: '1.5' }}>{cv.markets.closer}</p>
        </Section>

        {/* Pillar 1 */}
        <PillarSection
          heading={cv.pillar_1.heading}
          subheading={cv.pillar_1.subheading}
          category={cv.pillar_1.category}
          text={cv.pillar_1.text}
          proofPoints={cv.pillar_1.proof_points}
          verificationPrompt={cv.pillar_1.verification_prompt}
          verificationQuestions={cv.pillar_1.verification_questions}
          verificationCloser={cv.pillar_1.verification_closer}
        />

        {/* Pillar 2 */}
        <PillarSection
          heading={cv.pillar_2.heading}
          subheading={cv.pillar_2.subheading}
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

        {/* Stat Inventory */}
        <Section heading={cv.stat_inventory.heading}>
          <p style={{ fontSize: '14px', color: D.textSecondary, marginBottom: '16px', lineHeight: '1.5' }}>{cv.stat_inventory.intro}</p>
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
                {cv.stat_inventory.stats.map((s, i) => (
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

        {/* Voice + What Happens Next (two-column on desktop) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginTop: '40px' }}>

          <div style={{ background: D.white, borderRadius: '12px', padding: '28px', border: `1px solid ${D.border}` }}>
            <div style={{ fontSize: '10px', fontWeight: 700, color: D.gold, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>Voice</div>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: D.navy, marginBottom: '16px' }}>{cv.voice.heading}</h2>
            <div style={{ marginBottom: '12px' }}>
              {cv.voice.descriptors.map((d, i) => (
                <span key={i} style={{ display: 'inline-block', padding: '4px 10px', borderRadius: '999px', background: D.grayMid, color: D.navy, fontSize: '12px', fontWeight: 600, marginRight: '6px', marginBottom: '6px' }}>{d}</span>
              ))}
            </div>
            <p style={{ fontSize: '15px', color: D.textSecondary, lineHeight: '1.6', marginBottom: '12px' }}>{cv.voice.text}</p>
            <p style={{ fontSize: '13px', color: D.textTertiary, lineHeight: '1.5', fontStyle: 'italic' }}>{cv.voice.closer}</p>
          </div>

          <div style={{ background: D.white, borderRadius: '12px', padding: '28px', border: `1px solid ${D.border}` }}>
            <div style={{ fontSize: '10px', fontWeight: 700, color: D.gold, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>What Happens Next</div>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: D.navy, marginBottom: '16px' }}>{cv.what_happens_next.heading}</h2>
            <p style={{ fontSize: '15px', color: D.textSecondary, lineHeight: '1.6', marginBottom: '14px' }}>{cv.what_happens_next.intro}</p>
            <ul style={{ paddingLeft: '20px', margin: '0 0 14px' }}>
              {cv.what_happens_next.deliverables.map((d, i) => (
                <li key={i} style={{ fontSize: '14px', color: D.navy, lineHeight: '1.6', marginBottom: '6px' }}>{d}</li>
              ))}
            </ul>
            <p style={{ fontSize: '13px', color: D.textTertiary, lineHeight: '1.5', fontStyle: 'italic' }}>{cv.what_happens_next.closer}</p>
          </div>
        </div>

        {/* Approval actions — DISABLED in render-only pass */}
        <div style={{ marginTop: '48px', background: D.white, borderRadius: '14px', padding: '32px', border: `2px solid ${D.gold}` }}>
          <div style={{ fontSize: '10px', fontWeight: 700, color: D.gold, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>Your Sign-Off</div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: D.navy, marginBottom: '12px' }}>Approve or request changes</h2>
          <p style={{ fontSize: '14px', color: D.textSecondary, lineHeight: '1.6', marginBottom: '20px' }}>
            Once you approve, we finalize your positioning nucleus and generate your platform-specific bios, satellite site copy, and downstream content. Approval includes a 60-second undo window.
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

      {/* Footer */}
      <div style={{ background: D.navyDeep, color: D.white, padding: '40px 24px', marginTop: '32px' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: D.gold, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>Powered by PRISM™</div>
          <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.6', marginBottom: '0' }}>
            Your positioning nucleus is the single source of truth for every Cited deliverable. Questions? Reply to your intake email or reach us at hello@citedagent.com.
          </p>
        </div>
      </div>
    </main>
  );
}

function Section({ heading, subheading, children }: { heading: string; subheading?: string; children: React.ReactNode }) {
  return (
    <section style={{ marginTop: '40px' }}>
      {subheading && (
        <div style={{ fontSize: '10px', fontWeight: 700, color: D.gold, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '6px' }}>{subheading}</div>
      )}
      <h2 style={{ fontSize: '26px', fontWeight: 700, color: D.navy, marginBottom: '16px', lineHeight: '1.2' }}>{heading}</h2>
      {children}
    </section>
  );
}

function PillarSection({ heading, subheading, category, text, proofPoints, verificationPrompt, verificationQuestions, verificationCloser }: {
  heading: string;
  subheading: string;
  category: string;
  text: string;
  proofPoints?: string[];
  verificationPrompt: string;
  verificationQuestions?: string[];
  verificationCloser?: string;
}) {
  return (
    <section style={{ marginTop: '40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
        <div style={{ fontSize: '10px', fontWeight: 700, color: D.gold, textTransform: 'uppercase', letterSpacing: '2px' }}>{subheading}</div>
        <span style={{ padding: '3px 10px', borderRadius: '999px', background: D.grayMid, color: D.navy, fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px' }}>{category.replace(/_/g, ' ')}</span>
      </div>
      <h2 style={{ fontSize: '26px', fontWeight: 700, color: D.navy, marginBottom: '16px', lineHeight: '1.2' }}>{heading}</h2>
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
