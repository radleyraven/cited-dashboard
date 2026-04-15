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
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  // ALL hooks must be at the top — no hooks after conditional returns
  // Delayed mount: 1800ms delay then animate in
  useEffect(() => {
    const t = setTimeout(() => {
      setMounted(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    }, 1800);
    return () => clearTimeout(t);
  }, []);

  // ESC key dismiss — only active when mounted
  useEffect(() => {
    if (!mounted) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onDismiss(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [mounted, onDismiss]);

  // Body scroll lock — only active when mounted
  useEffect(() => {
    if (!mounted || typeof document === 'undefined') return;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [mounted]);

  // Conditional render AFTER all hooks
  if (!mounted || !milestone) return null;

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
  const stat = milestone.value_label ?? milestone.stat ?? '';
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
        top: 0, right: 0, bottom: 0, left: 0,
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
          padding: '36px 32px',
          transform: visible ? 'scale(1)' : 'scale(0.85)',
          opacity: visible ? 1 : 0,
          transition: 'transform 350ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 250ms ease-out',
        }}
      >
        {/* Sub-copy opener — centered */}
        {subCopy && (
          <div style={{ fontSize: '17px', color: '#CBD5E1', marginBottom: '20px', lineHeight: 1.4, fontWeight: 700, textAlign: 'center' }}>{subCopy}</div>
        )}
        {/* Trophy small, stat huge — centered */}
        <div style={{ textAlign: 'center', marginBottom: '6px' }}>
          <div style={{ fontSize: '24px', lineHeight: 1, marginBottom: '8px' }}>{icon}</div>
          <div style={{ fontSize: '68px', fontWeight: 900, color: accentColor, lineHeight: 1 }}>{stat}</div>
          <div style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 500, marginTop: '6px', letterSpacing: '0.5px' }}>in career sales</div>
        </div>
        {/* Way to go — centered, gold, prominent */}
        <div style={{ fontSize: '22px', fontWeight: 800, color: accentColor, textAlign: 'center', margin: '20px 0 4px', letterSpacing: '0.3px' }}>Way to go! 🎉</div>
        <button
          onClick={onDismiss}
          style={{ marginTop: 24, width: '100%', padding: '14px', background: isGold ? '#D4A830' : '#00BFA6', color: '#0A1929', fontWeight: 800, fontSize: 15, borderRadius: 8, border: 'none', cursor: 'pointer', letterSpacing: 0.3 }}
        >
          Continue to my report →
        </button>
      </div>
    </div>
  );
}
