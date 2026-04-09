'use client';

import Link from 'next/link';
import SignOutButton from '@/components/SignOutButton';

const client = {
  name: "Radley Raven",
  brokerage: "The Oppenheim Group",
  citationScore: 5,
  baselineScore: 3,
  primaryMarket: "Carmel Valley",
  scanDate: "April 8, 2026",
};

const marketScores = [
  { market: "Carmel Valley", clientScore: 5, competitorScore: 65, competitorName: "Seth O'Byrne", gap: 60 },
  { market: "Carlsbad", clientScore: 0, competitorScore: 52, competitorName: "Erin Wade", gap: 52 },
  { market: "Rancho Santa Fe", clientScore: 10, competitorScore: 45, competitorName: "Laura Barry", gap: 35 },
];

const platforms = [
  { name: "Google Business Profile", status: "unoptimized", scoreImpact: 14, href: "/copy-kit" },
  { name: "LinkedIn", status: "partial", scoreImpact: 10, href: "/copy-kit" },
  { name: "Yelp", status: "unoptimized", scoreImpact: 12, href: "/copy-kit" },
  { name: "Foursquare", status: "pending", scoreImpact: 8, href: "/copy-kit" },
  { name: "Zillow", status: "unoptimized", scoreImpact: 8, href: "/copy-kit" },
  { name: "Realtor.com", status: "partial", scoreImpact: 6, href: "/copy-kit" },
  { name: "FastExpert", status: "missing", scoreImpact: 5, href: "/copy-kit" },
  { name: "Bing Places", status: "claimed", scoreImpact: 3, href: "/copy-kit" },
  { name: "Apple Business Connect", status: "pending", scoreImpact: 3, href: "/copy-kit" },
  { name: "HomeLight", status: "missing", scoreImpact: 3, href: "/copy-kit" },
  { name: "Homes.com", status: "partial", scoreImpact: 4, href: "/copy-kit" },
];

const immediateWins = [
  { rank: 1, platform: "Yelp — Get on the Best Agents List", points: 12, reason: "Currently have a Yelp profile but not on the CV or Carlsbad best-agents list. Seth O'Byrne has 40+ reviews. 5+ keyword-rich reviews + optimized bio = list placement. This is the single highest-leverage action in Month 2.", owner: "Cited + You" },
  { rank: 2, platform: "LinkedIn Headline Re-Index", points: 8, reason: "Headline still shows 'Entrepreneur • Operations' in search index. Bio content has partially updated. Full re-index expected April 9-14 — will add Carmel Valley + Carlsbad keyword association.", owner: "Cited" },
  { rank: 3, platform: "Google Business Profile", points: 14, reason: "Updated in dashboard but not yet indexed for Carmel Valley or Carlsbad. 60-day GBP indexing window — normal. Posting to GBP weekly accelerates indexing.", owner: "You" },
];

const trajectory = [
  { label: "Baseline", score: 3, date: "Mar 26", projected: false },
  { label: "Day 13", score: 5, date: "Apr 8", projected: false },
  { label: "Day 30 Target", score: 28, date: "May 7", projected: true },
  { label: "Day 90 Target", score: 55, date: "Jul 7", projected: true },
];

const competitorNotes: Record<string, string> = {
  "Carmel Valley": "Seth O'Byrne has an optimized GBP, active LinkedIn articles, and a Yelp profile with 40+ reviews. We're building the same foundation — plus Foursquare which he's likely missing.",
  "Carlsbad": "Erin Wade dominates Perplexity with 122 Yelp reviews. That's the playbook. Month 2 of your onboarding starts your Yelp review campaign.",
  "Rancho Santa Fe": "Barry Estates has strong brokerage-level presence but limited individual agent signals. This is the most winnable market.",
};

function statusIcon(status: string) {
  if (status === "missing") return "🔴";
  if (status === "claimed" || status === "optimized") return "✅";
  return "🟡";
}

function scoreColor(score: number) {
  if (score < 20) return "#EF4444";
  if (score < 50) return "#F59E0B";
  return "#22C55E";
}

const workItems = [
  { done: true, text: "Citation Score audit complete" },
  { done: true, text: "Positioning statement delivered" },
  { done: false, text: "Optimizing Google Business Profile copy" },
  { done: false, text: "LinkedIn profile rewrite" },
  { done: false, text: "Yelp claim and optimization" },
  { done: false, text: "Foursquare submission" },
  { done: false, text: "Article 1 brief (sent Day 18-21)" },
];

const maxTrajectoryScore = 100;

export default function AuditPage() {
  const optimized = platforms.filter(p => p.status === "claimed" || p.status === "optimized").length;
  const inProgress = platforms.filter(p => p.status === "partial" || p.status === "pending").length;
  const needAttention = platforms.filter(p => p.status === "missing" || p.status === "unoptimized").length;

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
              <p className="text-xs md:text-sm text-gray-400 mt-0.5">AI Citation Dashboard</p>
            </div>
            <div className="text-right">
              <div className="font-semibold text-sm md:text-base">{client.name}</div>
              <div className="text-xs text-gray-400">{client.brokerage} · Carlsbad</div>
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

      <main className="max-w-3xl mx-auto px-6 py-10">

        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold" style={{ color: '#0A1929' }}>Full Audit Report</h2>
          <p className="text-gray-500 mt-2">Your complete AI visibility analysis — market scores, platform gaps, and the exact path to catching your competitors.</p>
        </div>

        {/* Section 1 — Strategic Recommendation */}
        <section className="mb-6">
          <div className="rounded-xl p-8 shadow-sm" style={{ background: '#0A1929' }}>
            <div
              className="inline-block text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-5"
              style={{ background: '#D4A830', color: '#0A1929' }}
            >
              STRATEGIC RECOMMENDATION
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Lead with Carmel Valley. Here&apos;s why.
            </h3>
            <p className="text-gray-300 leading-relaxed">
              Your Carmel Valley transaction history + AI citation gap make it the highest-leverage market to target first. 11 closed deals, $44.8M in a single ZIP code — and AI currently has no idea you exist there.
            </p>
          </div>
        </section>

        {/* Section 2 — Score By Market */}
        <section className="mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold mb-5" style={{ color: '#0A1929' }}>Your Citation Score — By Market</h3>
            <div className="space-y-4">
              {marketScores.map((m) => (
                <div key={m.market} className="rounded-xl border border-gray-100 p-5" style={{ background: '#F8F9FA' }}>
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div>
                      <div className="font-bold text-lg" style={{ color: '#0A1929' }}>{m.market}</div>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-3xl font-black" style={{ color: scoreColor(m.clientScore) }}>{m.clientScore}</span>
                        <span className="text-gray-400 text-sm font-medium">vs</span>
                        <div className="text-left">
                          <span className="text-2xl font-bold" style={{ color: '#0A1929' }}>{m.competitorScore}</span>
                          <div className="text-xs text-gray-500 mt-0.5">{m.competitorName}</div>
                        </div>
                      </div>
                    </div>
                    <div
                      className="text-sm font-bold px-3 py-1.5 rounded-full"
                      style={{ background: '#FEE2E2', color: '#EF4444' }}
                    >
                      -{m.gap} pts gap
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 3 — Platform Status */}
        <section className="mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold mb-1" style={{ color: '#0A1929' }}>Platform Analysis — {platforms.length} Platforms</h3>
            <p className="text-sm text-gray-500 mb-5">
              <span className="font-semibold text-green-600">{optimized} optimized</span>
              {' · '}
              <span className="font-semibold text-amber-500">{inProgress} in progress</span>
              {' · '}
              <span className="font-semibold text-red-500">{needAttention} need attention</span>
            </p>
            <div className="space-y-2">
              {platforms.map((p) => {
                const actionable = p.status === "missing" || p.status === "unoptimized" || p.status === "partial";
                return (
                  <div key={p.name} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="text-base">{statusIcon(p.status)}</span>
                      <span className="text-sm font-medium text-gray-700">{p.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {actionable && (
                        <span className="text-xs font-semibold" style={{ color: '#00BFA6' }}>+{p.scoreImpact} pts available</span>
                      )}
                      {actionable && (
                        <Link
                          href={p.href}
                          className="text-xs font-bold px-3 py-1 rounded-lg transition-opacity hover:opacity-80"
                          style={{ background: '#0A1929', color: '#00BFA6' }}
                        >
                          Fix this →
                        </Link>
                      )}
                      {!actionable && (
                        <span className="text-xs text-gray-400 capitalize">{p.status}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Section 4 — Top 3 Immediate Wins */}
        <section className="mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold mb-5" style={{ color: '#0A1929' }}>Your 3 Fastest Wins</h3>
            <div className="space-y-4">
              {immediateWins.map((w) => (
                <div key={w.rank} className="rounded-xl border border-gray-100 p-5 flex items-start gap-4" style={{ background: '#F8F9FA' }}>
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-black"
                    style={{ background: '#D4A830', color: '#0A1929' }}
                  >
                    #{w.rank}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-2">
                      <span className="font-bold text-base" style={{ color: '#0A1929' }}>{w.platform}</span>
                      <span
                        className="text-xs font-bold px-2.5 py-1 rounded-full"
                        style={{ background: '#F0FDF9', color: '#00BFA6', border: '1px solid #00BFA6' }}
                      >
                        +{w.points} points
                      </span>
                      {w.owner === "Cited" ? (
                        <span
                          className="text-xs font-semibold px-2.5 py-1 rounded-full"
                          style={{ background: '#F0FDF9', color: '#00BFA6' }}
                        >
                          We handle this
                        </span>
                      ) : (
                        <span
                          className="text-xs font-semibold px-2.5 py-1 rounded-full"
                          style={{ background: '#FFFDF5', color: '#D4A830' }}
                        >
                          You handle this
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{w.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 5 — Competitor Analysis */}
        <section className="mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold mb-5" style={{ color: '#0A1929' }}>Who Owns AI Visibility in Your Markets</h3>
            <div className="space-y-6">
              {marketScores.map((m) => (
                <div key={m.market}>
                  <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">{m.market}</div>
                  <div className="rounded-xl border border-gray-100 p-5" style={{ background: '#F8F9FA' }}>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="font-bold text-base" style={{ color: '#0A1929' }}>{m.competitorName}</span>
                      <span
                        className="text-sm font-black px-2.5 py-0.5 rounded-full"
                        style={{ background: '#0A1929', color: '#00BFA6' }}
                      >
                        {m.competitorScore}
                      </span>
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">What they have that you don&apos;t:</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{competitorNotes[m.market]}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 6 — Score Trajectory */}
        <section className="mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold mb-2" style={{ color: '#0A1929' }}>Your Score Trajectory</h3>
            <p className="text-xs text-gray-400 mb-6">Projected based on standard optimization pace</p>
            <div className="space-y-4">
              {trajectory.map((t) => {
                const pct = Math.max(2, (t.score / maxTrajectoryScore) * 100);
                return (
                  <div key={t.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">{t.label}</span>
                        {t.projected && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: '#F0F9FF', color: '#0284C7' }}>projected</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-black" style={{ color: t.projected ? '#94A3B8' : '#D4A830' }}>{t.score}</span>
                        <span className="text-xs text-gray-400">{t.date}</span>
                      </div>
                    </div>
                    <div className="h-6 rounded-full overflow-hidden" style={{ background: '#F1F5F9' }}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${pct}%`,
                          background: t.projected
                            ? 'repeating-linear-gradient(90deg, #CBD5E1 0px, #CBD5E1 6px, transparent 6px, transparent 12px)'
                            : '#D4A830',
                          border: t.projected ? '2px dashed #94A3B8' : 'none',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-5 pt-4 border-t border-gray-100 flex items-center gap-4 text-xs text-gray-400">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-2 rounded-sm" style={{ background: '#D4A830' }} />
                <span>Actual</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-2 rounded-sm border-2 border-dashed border-gray-400" />
                <span>Projected</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 7 — What Cited Is Doing */}
        <section className="mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold mb-5" style={{ color: '#0A1929' }}>What We&apos;re Building This Month</h3>
            <div className="space-y-3">
              {workItems.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  {item.done ? (
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: '#00BFA6' }}
                    >
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  ) : (
                    <div
                      className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5"
                      style={{ borderColor: '#00BFA6' }}
                    >
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#00BFA6' }} />
                    </div>
                  )}
                  <span className={`text-sm leading-relaxed ${item.done ? 'text-gray-500 line-through' : 'text-gray-700'}`}>
                    {item.text}
                  </span>
                  {!item.done && (
                    <span className="text-xs font-semibold ml-auto shrink-0" style={{ color: '#00BFA6' }}>→</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="text-center text-sm text-gray-400">
          Cited · AI Citation Optimization™ for Professionals · citedagent.com · Powered by PRISM™
        </div>

      </main>
    </div>
  );
}
