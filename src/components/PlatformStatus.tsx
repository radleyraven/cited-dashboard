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
  { name: 'Yelp', status: 'red', note: 'Not yet claimed' },
  { name: 'FastExpert', status: 'green', note: 'Profile complete' },
  { name: 'HomeLight', status: 'yellow', note: 'Waiting on support' },
  { name: 'Homes.com', status: 'red', note: 'Not yet claimed' },
];

const statusColors: Record<Status, string> = {
  green: 'bg-green-500',
  yellow: 'bg-yellow-400',
  red: 'bg-red-500',
};

const statusLabels: Record<Status, string> = {
  green: 'Live',
  yellow: 'Pending',
  red: 'Not Started',
};

export default function PlatformStatus() {
  const liveCount = platforms.filter(p => p.status === 'green').length;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold" style={{ color: '#0A1929' }}>Platform Status</h3>
        <span className="text-sm text-gray-500">{liveCount}/{platforms.length} live</span>
      </div>
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
    </div>
  );
}
