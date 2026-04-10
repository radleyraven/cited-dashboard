'use client';

/* ═══════════════════════════════════════════════════════════════
   CITED Universal Footer Component — Hybrid (Option C)
   v1.0 — April 9, 2026
   ═══════════════════════════════════════════════════════════════ */

export default function CitedFooter() {
  return (
    <>
      <div style={{
        marginTop: '48px',
        borderTop: '1px solid #e2e8f0',
        paddingTop: '24px',
        paddingBottom: '24px',
        textAlign: 'center',
      }}>
        <p style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: 800, color: '#0A1929', letterSpacing: '-0.5px' }}>CITED</p>
        <p style={{ margin: '0 0 10px 0', fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
          AI Citation Optimization™ for Professionals
        </p>
        <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>
          Powered by PRISM™ ·{' '}
          <a href="/how-it-works" style={{ color: '#00BFA6', textDecoration: 'none', fontWeight: 600 }}>How it works</a>
          {' · '}
          <a href="https://citedagent.com" style={{ color: '#00BFA6', textDecoration: 'none', fontWeight: 600 }}>citedagent.com</a>
        </p>
      </div>
      <div style={{ height: '4px', background: 'linear-gradient(90deg, #00BFA6, #D4A830, #00BFA6)', borderRadius: '2px' }} />
    </>
  );
}
