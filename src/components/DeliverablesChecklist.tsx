'use client';

interface Deliverable {
  label: string;
  done: boolean;
}

const deliverables: Deliverable[] = [
  { label: 'Platform Copy Kit (PDF)', done: true },
  { label: 'Platform Copy Kit (Paste-Ready HTML)', done: true },
  { label: 'GBP optimized & verified', done: true },
  { label: 'LinkedIn headline + about optimized', done: true },
  { label: 'Zillow bio updated', done: true },
  { label: 'Realtor.com Pro profile updated', done: true },
  { label: 'Apple Business Connect claimed', done: false },
  { label: 'Bing Places verified', done: true },
  { label: 'FastExpert profile + FAQs complete', done: true },
  { label: 'HomeLight profile claimed', done: false },
  { label: 'Yelp business claimed', done: false },
  { label: 'Homes.com profile claimed', done: false },
  { label: 'Citation Score baseline established', done: true },
  { label: 'Monthly monitoring report #1', done: false },
];

export default function DeliverablesChecklist() {
  const doneCount = deliverables.filter(d => d.done).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold" style={{ color: '#0A1929' }}>Deliverables</h3>
        <span className="text-sm text-gray-500">{doneCount}/{deliverables.length} complete</span>
      </div>
      <div className="space-y-2">
        {deliverables.map((d, i) => (
          <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors">
            <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${
              d.done ? 'bg-green-500' : 'border-2 border-gray-300'
            }`}>
              {d.done && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span className={`text-sm ${d.done ? 'text-gray-500 line-through' : 'text-gray-800 font-medium'}`}>
              {d.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
