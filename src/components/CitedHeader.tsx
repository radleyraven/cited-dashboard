'use client';

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
  stepIndicator?: string; // e.g., "Step 1 of 2 — Market Approval"
  userEmail?: string;
  userName?: string;
};

const NAV_LINKS = [
  { label: 'Dashboard', href: '/' },
  { label: 'Score', href: '/audit' },
  { label: 'Copy Kit', href: '/copy-kit' },
  { label: 'Articles', href: '/articles' },
  { label: 'Brief', href: '/brief' },
];

export default function CitedHeader({ variant, currentPage, stepIndicator, userEmail, userName }: HeaderProps) {
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
          <a href="/" style={{ textDecoration: 'none' }}>
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

          {/* Right: Auth */}
          <div style={{ textAlign: 'right' }}>
            {userEmail ? (
              <div>
                {userName && (
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>{userName}</div>
                )}
                <div style={{ fontSize: '11px', color: '#64748b' }}>{userEmail}</div>
              </div>
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
