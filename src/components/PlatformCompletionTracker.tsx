'use client';

type Status = 'green' | 'yellow' | 'red';

interface Platform {
  name: string;
  status: Status;
}

const platforms: Platform[] = [
  { name: 'Google Business Profile', status: 'green' },
  { name: 'LinkedIn', status: 'green' },
  { name: 'Zillow', status: 'green' },
  { name: 'Realtor.com', status: 'green' },
  { name: 'Apple Business Connect', status: 'yellow' },
  { name: 'Bing Places', status: 'green' },
  { name: 'Yelp', status: 'red' },
  { name: 'FastExpert', status: 'green' },
  { name: 'HomeLight', status: 'yellow' },
  { name: 'Homes.com', status: 'red' },
];

const dotColors: Record<Status, string> = {
  green: '#22C55E',
  yellow: '#EAB308',
  red: '#EF4444',
};

const statusLabels: Record<Status, string> = {
  green: 'Live',
  yellow: 'Pending',
  red: 'Not Started',
};

export default function PlatformCompletionTracker() {
  const liveCount = platforms.filter(p => p.status === 'green').length;
  const total = platforms.length;
  const percentage = (liveCount / total) * 100;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold" style={{ color: '#0A1929' }}>Platform Completion</h3>
        <span className="text-sm font-bold" style={{ color: '#00BFA6' }}>{liveCount}/{total} Platforms</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-3 rounded-full bg-gray-100 mb-5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${percentage}%`, background: 'linear-gradient(90deg, #00BFA6, #00E5C3)' }}
        />
      </div>

      {/* Platform List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {platforms.map((p) => (
          <div key={p.name} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-100">
            <div
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: dotColors[p.status] }}
            />
            <span className="text-sm font-medium flex-1 truncate" style={{ color: '#0A1929' }}>{p.name}</span>
            <span className="text-xs text-gray-400 shrink-0">{statusLabels[p.status]}</span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100">
        {(['green', 'yellow', 'red'] as Status[]).map((s) => (
          <div key={s} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: dotColors[s] }} />
            <span className="text-xs text-gray-500">{statusLabels[s]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
