'use client';

import { useState } from 'react';

/* ═══════════════════════════════════════════════════════════════
   CITED Universal Header Component
   Two variants: onboarding (minimal) + dashboard (full nav)
   v1.0 — April 9, 2026
   Research: Krug (persistent nav), Yablonski (Jakob's Law),
   10 best-in-class SaaS header analysis
   ═══════════════════════════════════════════════════════════════ */

type HeaderProps = {
  variant: 'onboarding' | 'dashboard';
  currentPage?: string;
  stepIndicator?: string;
  userEmail?: string;
  userName?: string;
  clientTier?: 'founding_client' | 'standard' | 'premium';
  clientTitle?: string; // e.g., "Oppenheim Group" or custom credential
};

const NAV_LINKS = [
  { label: 'Dashboard', href: '/' },
  { label: 'Score', href: '/audit' },
  { label: 'Copy Kit', href: '/copy-kit' },
  { label: 'Articles', href: '/articles' },
  { label: 'Brief', href: '/brief' },
];

const TIER_BADGES: Record<string, { label: string; color: string; bg: string }> = {
  founding_client: { label: '★ Founding Member', color: '#D4A830', bg: 'rgba(212,168,48,0.15)' },
  standard: { label: '★ CITED Agent', color: '#00BFA6', bg: 'rgba(0,191,166,0.15)' },
  premium: { label: '★★ Premium Agent', color: '#00BFA6', bg: 'rgba(0,191,166,0.15)' },
};

export default function CitedHeader({ variant, currentPage, stepIndicator, userEmail, userName, clientTier, clientTitle }: HeaderProps) {
  const badge = clientTier ? TIER_BADGES[clientTier] : null;
  const [exitTaps, setExitTaps] = useState(0);

  function handleLogoClick(e: React.MouseEvent) {
    if (variant === 'onboarding') {
      e.preventDefault();
      if (exitTaps === 0) {
        setExitTaps(1);
        // Reset after 4 seconds
        setTimeout(() => setExitTaps(0), 4000);
      } else {
        // Second tap — navigate away
        window.location.href = '/';
      }
    }
  }
  return (
    <>
      {/* Main Header Bar */}
      <div style={{
        background: '#0A1929',
        padding: variant === 'onboarding' ? '20px 32px' : '16px 32px',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '960px',
          margin: '0 auto',
        }}>
          {/* Left: Brand */}
          <a href="/" onClick={handleLogoClick} style={{ textDecoration: 'none', cursor: 'pointer' }}>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#fff', letterSpacing: '2px', marginBottom: '2px' }}>CITED</div>
            <div style={{ fontSize: '9px', fontWeight: 600, color: '#00BFA6', textTransform: 'uppercase', letterSpacing: '2px' }}>
              AI Citation Optimization™
            </div>
          </a>

          {/* Center: Nav (dashboard only) */}
          {variant === 'dashboard' && (
            <nav style={{ display: 'flex', gap: '24px' }}>
              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  style={{
                    fontSize: '13px',
                    fontWeight: currentPage === link.label ? 700 : 500,
                    color: currentPage === link.label ? '#00BFA6' : '#94a3b8',
                    textDecoration: 'none',
                    transition: 'color 0.2s',
                  }}
                >
                  {link.label}
                </a>
              ))}
            </nav>
          )}

          {/* Right: Client Identity */}
          <div style={{ textAlign: 'right' }}>
            {userName ? (
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>{userName}</div>
                {clientTitle && (
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{clientTitle}</div>
                )}
                {badge && (
                  <div style={{
                    display: 'inline-block',
                    fontSize: '9px',
                    fontWeight: 700,
                    color: badge.color,
                    background: badge.bg,
                    padding: '2px 8px',
                    borderRadius: '10px',
                    marginTop: '3px',
                    letterSpacing: '0.5px',
                  }}>
                    {badge.label}
                  </div>
                )}
              </div>
            ) : userEmail ? (
              <div style={{ fontSize: '11px', color: '#64748b' }}>{userEmail}</div>
            ) : (
              <a href="/login" style={{ fontSize: '13px', color: '#00BFA6', textDecoration: 'none', fontWeight: 600 }}>
                Sign in
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Gradient Bar */}
      <div style={{ height: '3px', background: 'linear-gradient(90deg, #00BFA6, #D4A830, #00BFA6)' }} />

      {/* Exit Nudge (onboarding — first tap) */}
      {variant === 'onboarding' && exitTaps === 1 && (
        <div style={{
          background: '#fffdf5',
          borderBottom: '1px solid #D4A830',
          padding: '10px 32px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '16px',
          animation: 'fadeIn 0.2s ease',
        }}>
          <span style={{ fontSize: '13px', color: '#0A1929', fontWeight: 500 }}>
            Almost done — finish approving your markets to unlock your Full PRISM Scan.
          </span>
          <button
            onClick={() => { window.location.href = '/'; }}
            style={{
              fontSize: '12px', color: '#94a3b8', background: 'none', border: '1px solid #e2e8f0',
              borderRadius: '4px', padding: '4px 12px', cursor: 'pointer', whiteSpace: 'nowrap',
            }}
          >
            Leave anyway
          </button>
        </div>
      )}

      {/* Step Indicator (onboarding only) */}
      {variant === 'onboarding' && stepIndicator && (
        <div style={{
          background: '#fff',
          borderBottom: '1px solid #e2e8f0',
          padding: '10px 32px',
          display: 'flex',
          justifyContent: 'center',
        }}>
          <div style={{
            background: 'rgba(0,191,166,0.1)',
            color: '#00BFA6',
            fontSize: '12px',
            fontWeight: 600,
            padding: '4px 16px',
            borderRadius: '20px',
          }}>
            {stepIndicator}
          </div>
        </div>
      )}
    </>
  );
}
