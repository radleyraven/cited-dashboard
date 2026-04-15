'use client';

import { useState, useEffect } from 'react';

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
  onDismiss: () => void;
}

export default function MilestoneCard({ milestone, onDismiss }: MilestoneCardProps) {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Delayed mount: wait 1800ms after page load, then animate in
  useEffect(() => {
    const mountTimer = setTimeout(() => {
      setMounted(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
    }, 1800);
    return () => clearTimeout(mountTimer);
  }, []);

  if (!mounted) return null;

  // ESC key dismiss
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDismiss();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onDismiss]);

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

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

  const isGold = cardType === 'gold';
  const accentColor = isGold ? '#D4A830' : '#00BFA6';

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
    <div
      onClick={onDismiss}
      style={{
        position: 'fixed',
        inset: 0,
        background: visible ? 'rgba(0,0,0,0.80)' : 'rgba(0,0,0,0)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background 300ms ease-out',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: 480,
          width: '90%',
          background: '#0A1929',
          borderLeft: `4px solid ${accentColor}`,
          borderRadius: '12px',
          padding: '28px 32px',
          transform: visible ? 'scale(1)' : 'scale(0.85)',
          opacity: visible ? 1 : 0,
          transition: 'transform 350ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 250ms ease-out',
        }}
      >
        {/* Pre-header */}
        <div style={{
          fontSize: 11,
          color: '#94a3b8',
          fontWeight: 600,
          letterSpacing: 1,
          textTransform: 'uppercase',
          marginBottom: 12,
        }}>
          Before your report...
        </div>

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

        {/* CTA button */}
        <button
          onClick={onDismiss}
          style={{
            marginTop: 24,
            width: '100%',
            padding: '14px',
            background: isGold ? '#D4A830' : '#00BFA6',
            color: '#0A1929',
            fontWeight: 800,
            fontSize: 15,
            borderRadius: 8,
            border: 'none',
            cursor: 'pointer',
            letterSpacing: 0.3,
          }}
        >
          Continue to my report →
        </button>
      </div>
    </div>
  );
}
