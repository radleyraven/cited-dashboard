'use client';

type Status = 'green' | 'yellow' | 'red';

interface Platform {
  name: string;
  status: Status;
  note: string;
}

const platforms: Platform[] = [
  { name: 'Google Business Profile', status: 'green', note: 'Live & verified' },
  { name: 'LinkedIn', status: 'green', note: 'Optimized' },
  { name: 'Zillow', status: 'green', note: 'Bio strong' },
  { name: 'Realtor.com', status: 'green', note: '95% complete' },
  { name: 'Apple Business Connect', status: 'yellow', note: 'Verification pending' },
  { name: 'Bing Places', status: 'green', note: 'Claimed & verified' },
  { name: 'Yelp', status: 'red', note: 'Ready to boost your score' },
  { name: 'FastExpert', status: 'green', note: 'Profile complete' },
  { name: 'HomeLight', status: 'yellow', note: 'Waiting on support' },
  { name: 'Homes.com', status: 'red', note: 'Ready to boost your score' },
];

const statusColors: Record<Status, string> = {
  green: 'bg-green-500',
  yellow: 'bg-yellow-400',
  red: 'bg-red-500',
};

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

export default function PlatformStatus() {
  const liveCount = platforms.filter(p => p.status === 'green').length;
  const total = platforms.length;
  const percentage = (liveCount / total) * 100;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold" style={{ color: '#0A1929' }}>Platforms Powering Your Score</h3>
        <span className="text-sm font-bold" style={{ color: '#00BFA6' }}>{liveCount}/{total} Live</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-3 rounded-full bg-gray-100 mb-5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${percentage}%`, background: 'linear-gradient(90deg, #00BFA6, #00E5C3)' }}
        />
      </div>

      {/* Platform Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {platforms.map((p) => (
          <div key={p.name} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
            <div className={`w-3 h-3 rounded-full shrink-0 ${statusColors[p.status]}`} />
            <div className="min-w-0">
              <div className="font-medium text-sm truncate" style={{ color: '#0A1929' }}>{p.name}</div>
              <div className="text-xs text-gray-400">{p.note}</div>
            </div>
            <span className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 shrink-0">
              {statusLabels[p.status]}
            </span>
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
