'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import SignOutButton from '@/components/SignOutButton';

const POSITIONING_STATEMENT = `Radley Raven is the North County San Diego luxury listing specialist sellers choose when they need their home sold fast and at the right price. With 11 closed transactions in the Carmel Valley corridor alone — $44.8M in a single ZIP code — and a 28-day median days on market, Radley brings the kind of hyperlocal depth that only comes from being the agent who actually closes the deals, not just lists them. His renovation background and active investment ownership mean he sees every property differently — and his sellers feel that difference at the closing table.`;

const AUDIT_FINDINGS = [
  {
    icon: "📍",
    label: "Where your deals are concentrated",
    value: "11 closed transactions in the 92130 Carmel Valley corridor — $44.8M in a single ZIP code. You are not just serving this market. You are this market.",
  },
  {
    icon: "⚡",
    label: "Your strongest performance stat",
    value: "28-day median days on market with a 96% sale-to-list ratio. Your listings move fast and close clean — that is the proof point that wins luxury sellers.",
  },
  {
    icon: "🔑",
    label: "Your key differentiator",
    value: "Active STR operator + renovation investor. You own the properties you advise on. When you walk through a listing, you see repair costs, renovation upside, and real numbers — not guesses.",
  },
  {
    icon: "⚠️",
    label: "Your biggest AI visibility gap",
    value: "Citation Score: 3/100. You are invisible to AI search in Carmel Valley and Carlsbad — the two markets where you have the deepest track record. That is the gap Cited closes.",
  },
];

const STORAGE_KEY = 'cited_positioning_approved';

export default function PositioningPage() {
  const [approved, setApproved] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setApproved(localStorage.getItem(STORAGE_KEY) === 'true');
    }
  }, []);

  const handleApprove = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, 'true');
    }
    setApproved(true);
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;
    setFeedbackSent(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="text-white" style={{ background: '#0A1929' }}>
        <div className="max-w-6xl mx-auto px-4 py-4 md:px-6 md:py-6">
          <div className="flex items-center justify-between mb-3 md:mb-0">
            <div>
              <Link href="/">
                <h1 className="text-xl md:text-2xl font-bold tracking-widest cursor-pointer" style={{ color: '#00BFA6' }}>CITED</h1>
              </Link>
              <p className="text-xs md:text-sm text-gray-400 mt-0.5">AI Visibility Dashboard</p>
            </div>
            <div className="text-right">
              <div className="font-semibold text-sm md:text-base">Radley Raven</div>
              <div className="text-xs text-gray-400">Oppenheim Group · Carlsbad</div>
              <SignOutButton />
            </div>
          </div>
          <div className="flex items-center gap-4 md:gap-6 border-t border-white/10 pt-3 md:border-0 md:pt-0 md:absolute md:top-6 md:left-1/2 md:-translate-x-1/2">
            <Link href="/copy-kit" className="text-xs md:text-sm text-gray-400 hover:text-white transition-colors">My Platforms</Link>
            <Link href="/articles" className="text-xs md:text-sm text-gray-400 hover:text-white transition-colors">Articles</Link>
            <Link href="/reviews" className="text-xs md:text-sm text-gray-400 hover:text-white transition-colors">Reviews</Link>
          </div>
        </div>
      </header>

      <div style={{ background: "#0D2137", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-3xl mx-auto px-6 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-black" style={{ color: "#D4A830" }}>$44.8M</div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">Carmel Valley Volume</div>
              <div className="text-xs text-gray-600 mt-0.5">11 deals · 92130</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-black" style={{ color: "#D4A830" }}>28 days</div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">Median DOM</div>
              <div className="text-xs text-gray-600 mt-0.5">Across all transactions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-black" style={{ color: "#D4A830" }}>96%</div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">Sale-to-List Ratio</div>
              <div className="text-xs text-gray-600 mt-0.5">Career average</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-black" style={{ color: "#D4A830" }}>$91.7M</div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">Career Volume</div>
              <div className="text-xs text-gray-600 mt-0.5">33 closed deals · 10+ yrs</div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-6 py-10">
        {/* Page Header */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold" style={{ color: '#0A1929' }}>Your Positioning Statement</h2>
          <p className="text-gray-500 mt-2">
            Review what we found in your audit, then approve the positioning statement that will guide everything we write for you.
          </p>
        </div>

        {/* Compact top approve button — transforms same as bottom on click */}
        <div className="mb-6 rounded-lg px-4 py-3 border shadow-sm" style={{ borderColor: approved ? '#00BFA6' : '#e5e7eb', background: approved ? '#f0fdf9' : '#fff' }}>
          {approved ? (
            <div className="flex items-center gap-3">
              <span style={{ color: '#00BFA6', fontSize: '20px' }}>✓</span>
              <p className="text-sm font-semibold" style={{ color: '#00BFA6' }}>Approved — we&apos;re writing your platform copy now</p>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">Looks right already? Approve it now and we&apos;ll get started.</p>
              <button
                onClick={handleApprove}
                className="ml-4 shrink-0 px-4 py-2 rounded-lg text-xs font-bold text-white transition-opacity hover:opacity-90"
                style={{ background: '#00BFA6' }}
              >
                Approve →
              </button>
            </div>
          )}
        </div>

        {/* Section 1 — Business Analysis */}
        <section className="mb-8">
          <h3 className="text-lg font-bold mb-4" style={{ color: '#0A1929' }}>Your Business Analysis</h3>
          <div className="space-y-3">
            {AUDIT_FINDINGS.map((finding, i) => (
              <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-start gap-4"
                style={{ borderLeft: `4px solid ${i === 0 ? "#00BFA6" : i === 1 ? "#D4A830" : i === 2 ? "#00BFA6" : "#EF4444"}` }}>
                <span className="text-xl shrink-0">{finding.icon}</span>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider mb-1.5 text-gray-400">{finding.label}</div>
                  <p className="text-sm text-gray-700 leading-relaxed">{finding.value}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 2 — Positioning Statement */}
        <section className="mb-8">
          <h3 className="text-lg font-bold mb-4" style={{ color: '#0A1929' }}>Your Positioning Statement</h3>
          <div className="rounded-xl p-6 shadow-sm" style={{ background: '#0A1929' }}>
            <div
              className="inline-block text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-5"
              style={{ background: '#D4A830', color: '#0A1929' }}
            >
              DRAFT — Awaiting Your Approval
            </div>
            <blockquote
              className="text-lg italic leading-relaxed mb-5"
              style={{ color: '#F0F4F8', fontStyle: 'italic' }}
            >
              &ldquo;{POSITIONING_STATEMENT}&rdquo;
            </blockquote>
            <p className="text-sm" style={{ color: '#94A3B8' }}>
              This statement guides everything we write — your bios, your articles, your platform copy. It should sound like you.
            </p>
          </div>
        </section>

        {/* Section 3 — Actions */}
        <section className="mb-8 space-y-5">
          {/* Action A — Approve */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            {approved ? (
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: '#00BFA6' }}
                >
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold" style={{ color: '#00BFA6' }}>Approved — we&rsquo;re writing your platform copy now</p>
                  <p className="text-sm text-gray-500 mt-0.5">We&rsquo;ll have your platform copy ready within 48 hours.</p>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-4">
                  Does this statement feel right? If it sounds like you — approve it and we&rsquo;ll get to work.
                </p>
                <button
                  onClick={handleApprove}
                  className="w-full sm:w-auto px-6 py-3 rounded-lg text-sm font-bold text-white transition-opacity hover:opacity-90"
                  style={{ background: '#00BFA6' }}
                >
                  This looks right — approve it
                </button>
              </div>
            )}
          </div>

          {/* Action B — Request a change */}
          {!approved && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              {feedbackSent ? (
                <p className="text-sm font-medium" style={{ color: '#0A1929' }}>
                  ✓ Got it — we&rsquo;ll update this within 24 hours.
                </p>
              ) : (
                <form onSubmit={handleFeedbackSubmit}>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#0A1929' }}>
                    I&rsquo;d change this:
                  </label>
                  <textarea
                    className="w-full rounded-lg border border-gray-200 p-3 text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-teal-300"
                    rows={3}
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="e.g., 'I'd emphasize my listing experience more' or 'The Encinitas Ranch reference should be more specific'"
                  />
                  <div className="mt-3">
                    <button
                      type="submit"
                      disabled={!feedbackText.trim()}
                      className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-opacity disabled:opacity-40"
                      style={{ background: '#0A1929', color: '#00BFA6' }}
                    >
                      Send my feedback →
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </section>

        {/* Bottom note */}
        <div
          className="rounded-xl px-6 py-4 text-sm text-gray-600 border border-gray-100"
          style={{ background: '#F8F9FA' }}
        >
          Once you approve, we&rsquo;ll have your platform copy ready within 48 hours. Questions? Reply to any of our emails or reach out at{' '}
          <a href="mailto:hello@citedagent.com" className="font-semibold" style={{ color: '#00BFA6' }}>
            hello@citedagent.com
          </a>
        </div>

        {/* Footer */}
        <div className="mt-10 text-center text-sm text-gray-400">
          Cited · AI Visibility for Professionals · citedagent.com
        </div>
      </main>
    </div>
  );
}
