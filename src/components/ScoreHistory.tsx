'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ScoreHistoryProps {
  history: { date: string; score: number }[];
}

export default function ScoreHistory({ history }: ScoreHistoryProps) {
  // Ensure there's always at least a baseline starting point
  const safeHistory = history.length > 0 ? history : [{ date: 'Start', score: 0 }];

  // Always label the first data point "Start" (Day 0 baseline), rest as Month 1, Month 2, etc.
  const data = safeHistory.map((h, i) => {
    if (i === 0) {
      return { date: 'Start', score: Math.round(h.score * 10) };
    }
    return {
      date: `Month ${i}`,
      score: Math.round(h.score * 10),
    };
  });

  const singlePoint = safeHistory.length === 1;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold" style={{ color: '#0A1929' }}>Score History</h3>
        <span className="text-sm text-gray-500">PRISM scans</span>
      </div>

      {singlePoint && (
        <p className="text-xs text-gray-400 mb-3">(next re-scan in ~30 days)</p>
      )}

      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#DC2626" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#DC2626" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#888' }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#888' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ borderRadius: '8px', border: '1px solid #eee', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
              labelStyle={{ fontWeight: 600, color: '#0A1929' }}
            />
            <Area type="monotone" dataKey="score" stroke="#DC2626" strokeWidth={2.5} fill="url(#scoreGradient)" dot={{ fill: '#DC2626', strokeWidth: 0, r: 4 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
