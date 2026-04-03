import CitationScore from '@/components/CitationScore';
import PlatformStatus from '@/components/PlatformStatus';
import DeliverablesChecklist from '@/components/DeliverablesChecklist';
import ScoreHistory from '@/components/ScoreHistory';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="text-white" style={{ background: '#0A1929' }}>
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-widest" style={{ color: '#D4A830' }}>CITED</h1>
            <p className="text-sm text-gray-400 mt-1">AI Visibility Dashboard</p>
          </div>
          <div className="text-right">
            <div className="font-semibold">Radley Raven</div>
            <div className="text-sm text-gray-400">The Oppenheim Group · La Jolla</div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Top Row: Score + Platforms */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Citation Score */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center justify-center">
            <CitationScore score={42} />
          </div>

          {/* Platform Status */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <PlatformStatus />
          </div>
        </div>

        {/* Bottom Row: Score History + Deliverables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Score History */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <ScoreHistory />
          </div>

          {/* Deliverables */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <DeliverablesChecklist />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-400">
          Cited · AI Visibility for Professionals · citedagent.com
        </div>
      </main>
    </div>
  );
}
