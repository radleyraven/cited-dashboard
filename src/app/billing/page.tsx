'use client';

import Link from 'next/link';

export default function BillingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: '#f4f6f8' }}>
      <div className="max-w-lg w-full bg-white rounded-xl border border-gray-100 shadow-sm p-10 text-center">
        <div style={{ color: '#00BFA6', fontWeight: 700, fontSize: 13, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 12 }}>
          CITED · Membership
        </div>
        <h1 className="text-2xl font-bold mb-3" style={{ color: '#0A1929' }}>
          Continue Your Membership
        </h1>
        <p className="text-gray-500 mb-8 leading-relaxed">
          To manage your membership or continue after your founding period, reply directly to Radley&apos;s email or use the link below.
        </p>
        <a
          href="mailto:radleyraven@gmail.com?subject=Cited Membership"
          className="inline-block font-bold text-white px-8 py-3 rounded-lg"
          style={{ background: '#00BFA6', textDecoration: 'none' }}
        >
          Continue My Membership →
        </a>
        <div className="mt-8 pt-6 border-t border-gray-100">
          <Link href="/copy-kit" className="text-sm" style={{ color: '#00BFA6' }}>
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
