'use client';

interface CitationScoreProps {
  score: number;
  maxScore?: number;
}

export default function CitationScore({ score, maxScore = 100 }: CitationScoreProps) {
  const percentage = (score / maxScore) * 100;
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-52 h-52">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
          {/* Background circle */}
          <circle
            cx="100" cy="100" r={radius}
            fill="none" stroke="#f3f4f6" strokeWidth="12"
          />
          {/* Score arc */}
          <circle
            cx="100" cy="100" r={radius}
            fill="none" stroke="#DC2626" strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        {/* Score number centered */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-bold" style={{ color: '#DC2626' }}>{score}</span>
          <span className="text-sm text-gray-400 mt-1">/ {maxScore}</span>
        </div>
      </div>
      <h3 className="mt-4 text-lg font-semibold" style={{ color: '#0A1929' }}>Citation Score</h3>
      <p className="text-sm text-gray-500">Overall platform visibility</p>
    </div>
  );
}
