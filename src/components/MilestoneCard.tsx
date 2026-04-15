'use client';

export interface MilestoneData {
  headline: string;
  celebration_copy?: string;
  sub_copy?: string;
  value_label?: string;
  stat?: string;
  card_type?: string;
  type?: string;
  tier?: string;
  icon?: string;
  // Extra fields from real data (ignored by renderer):
  label?: string;
  stage?: string;
  value?: number;
  crossed_year?: number;
  is_personal_target?: boolean;
}

interface MilestoneCardProps {
  milestone: MilestoneData | null | undefined;
}

export default function MilestoneCard({ milestone }: MilestoneCardProps) {
  if (!milestone) return null;

  // Card type logic
  const cardType = (() => {
    if (milestone.card_type === 'gold') return 'gold';
    if (milestone.card_type === 'teal') return 'teal';
    const t = milestone.type ?? '';
    if (t.includes('volume') || t.includes('crossed') || milestone.tier === 'elite') return 'gold';
    if (t.includes('growth') || t.includes('yoy')) return 'teal';
    return 'gold';
  })();

  const accentColor = cardType === 'teal' ? '#00BFA6' : '#D4A830';

  // Stat display: value_label → stat → ""
  const stat = milestone.value_label ?? milestone.stat ?? '';

  // Sub-copy: sub_copy → parse celebration_copy after first "!" → ""
  const subCopy = (() => {
    if (milestone.sub_copy) return milestone.sub_copy;
    if (milestone.celebration_copy) {
      const idx = milestone.celebration_copy.indexOf('!');
      if (idx !== -1 && idx < milestone.celebration_copy.length - 1) {
        return milestone.celebration_copy.slice(idx + 1).trim();
      }
    }
    return '';
  })();

  // Icon: icon field → derive from type → default
  const icon = (() => {
    if (milestone.icon) return milestone.icon;
    const t = milestone.type ?? '';
    if (t.includes('volume') || t.includes('crossed')) return '🏆';
    if (t.includes('growth') || t.includes('yoy')) return '📈';
    return '🏅';
  })();

  return (
    <>
      <div style={{
        background: '#0A1929',
        borderLeft: `4px solid ${accentColor}`,
        borderRadius: '12px',
        padding: '28px 32px',
        marginBottom: '24px',
      }}>
        <div style={{ fontSize: '32px' }}>{icon}</div>
        <div style={{ fontSize: '52px', fontWeight: 900, color: accentColor, margin: '8px 0 4px' }}>
          {stat}
        </div>
        <div style={{ fontSize: '19px', fontWeight: 700, color: '#ffffff', lineHeight: 1.4 }}>
          {milestone.headline}
        </div>
        {subCopy && (
          <div style={{ fontSize: '14px', color: '#CBD5E1', marginTop: '8px', lineHeight: 1.6 }}>
            {subCopy}
          </div>
        )}
      </div>
      <p style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', margin: '-12px 0 32px' }}>
        ↓ Your full report below
      </p>
    </>
  );
}
