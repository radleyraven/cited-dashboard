import CitationScore from '@/components/CitationScore';
import PlatformStatus from '@/components/PlatformStatus';
import DeliverablesChecklist from '@/components/DeliverablesChecklist';
import ScoreHistory from '@/components/ScoreHistory';
import SignOutButton from '@/components/SignOutButton';
import Link from 'next/link';
import { getPrismScans } from '@/lib/prism-data';

function getNextMilestone(score: number): { target: number; label: string; description: string } {
  if (score < 21) return { target: 21, label: 'AI is learning you exist', description: 'First citations appearing' };
  if (score < 36) return { target: 36, label: 'Appearing in local searches', description: 'AI mentions you in target markets' };
  if (score < 51) return { target: 51, label: 'Competing with top agents', description: "You're in the consideration set" };
  if (score < 66) return { target: 66, label: 'Leading your market', description: 'AI recommends you first' };
  if (score < 76) return { target: 76, label: 'Dominant', description: 'Top recommendation across all markets' };
  return { target: 86, label: 'Category authority', description: 'The definitive expert in your market' };
}

export default function Home() {
  const prism = getPrismScans();
  const displayScore = Math.round(prism.latest * 10);
  const nextMilestone = getNextMilestone(displayScore);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="text-white" style={{ background: '#0A1929' }}>
        <div className="max-w-6xl mx-auto px-4 py-4 md:px-6 md:py-6">
          {/* Top row: logo + sign out */}
          <div className="flex items-center justify-between mb-3 md:mb-0">
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-widest" style={{ color: '#00BFA6' }}>CITED</h1>
              <p className="text-xs md:text-sm text-gray-400 mt-0.5">AI Visibility Dashboard</p>
            </div>
            <div className="text-right">
              <div className="font-semibold text-sm md:text-base">Radley Raven</div>
              <div className="text-xs text-gray-400">Oppenheim Group · Carlsbad</div>
              <SignOutButton />
            </div>
          </div>
          {/* Nav row — order: My Platforms | Articles | Reviews */}
          <div className="flex items-center gap-4 md:gap-6 border-t border-white/10 pt-3 md:border-0 md:pt-0 md:absolute md:top-6 md:left-1/2 md:-translate-x-1/2">
            <Link href="/copy-kit" className="text-xs md:text-sm text-gray-400 hover:text-white transition-colors">My Citation Profiles</Link>
            <Link href="/articles" className="text-xs md:text-sm text-gray-400 hover:text-white transition-colors">Articles</Link>
            <Link href="/reviews" className="text-xs md:text-sm text-gray-400 hover:text-white transition-colors">Reviews</Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Top Row: Score + Platforms */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Citation Score */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center justify-center">
            <CitationScore score={displayScore} />
          </div>

          {/* Platform Status */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <PlatformStatus />
          </div>
        </div>

        {/* Next Milestone Banner */}
        <div style={{ background: '#fff', borderRadius: '10px', padding: '12px 20px', marginBottom: '16px', border: '1px solid #e8edf2', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: '13px', color: '#64748b' }}>
            🎯 <strong style={{ color: '#0A1929' }}>Next milestone:</strong> Score {nextMilestone.target} — {nextMilestone.label}
          </div>
          <div style={{ fontSize: '12px', color: '#00BFA6', fontWeight: 600 }}>{nextMilestone.description}</div>
        </div>

        {/* Bottom Row: Score History + Deliverables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Score History */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <ScoreHistory history={prism.history} />
          </div>

          {/* Deliverables */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <DeliverablesChecklist />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 mb-4">
          <h2 className="text-lg font-bold tracking-wide" style={{ color: '#0A1929' }}>Quick Actions</h2>
          <p className="text-sm text-gray-500 mt-1">Jump to your most-used tools</p>
        </div>

        {/* Navigation Cards — order: My Platforms | Articles | Reviews */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* My Platforms Card */}
          <Link href="/copy-kit" className="block rounded-xl p-6 transition-all duration-200 hover:opacity-90 hover:scale-[1.02]" style={{ background: '#0A1929', border: '2px solid #D4A830' }}>
            <div className="text-3xl mb-3">🏠</div>
            <h3 className="text-lg font-bold mb-2" style={{ color: '#D4A830' }}>My Citation Profiles</h3>
            <p className="text-sm text-gray-400 mb-4">Your Citation Profiles, ready to post to each platform</p>
            <span className="text-sm font-semibold" style={{ color: '#00BFA6' }}>Open →</span>
          </Link>

          {/* Articles Card */}
          <Link href="/articles" className="block rounded-xl p-6 transition-all duration-200 hover:opacity-90 hover:scale-[1.02]" style={{ background: '#0A1929', border: '2px solid #D4A830' }}>
            <div className="text-3xl mb-3">📝</div>
            <h3 className="text-lg font-bold mb-2" style={{ color: '#D4A830' }}>Articles</h3>
            <p className="text-sm text-gray-400 mb-4">Copy, publish, and distribute your AI-optimized content</p>
            <span className="text-sm font-semibold" style={{ color: '#00BFA6' }}>Open →</span>
          </Link>

          {/* Reviews Card */}
          <Link href="/reviews" className="block rounded-xl p-6 transition-all duration-200 hover:opacity-90 hover:scale-[1.02]" style={{ background: '#0A1929', border: '2px solid #D4A830' }}>
            <div className="text-3xl mb-3">⭐</div>
            <h3 className="text-lg font-bold mb-2" style={{ color: '#D4A830' }}>Reviews</h3>
            <p className="text-sm text-gray-400 mb-4">Respond to reviews with pre-written, AI-optimized responses</p>
            <span className="text-sm font-semibold" style={{ color: '#00BFA6' }}>Open →</span>
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-400">
          Cited · AI Visibility for Professionals · citedagent.com · Powered by PRISM™
        </div>
      </main>
    </div>
  );
}
