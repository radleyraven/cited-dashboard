'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface CitedItem {
  label: string;
  note?: string;
}

interface ClientItem {
  label: string;
  href?: string;
  external?: boolean;
}

const citedCompletedItems: CitedItem[] = [
  { label: 'Citation Score Audit completed' },
  { label: 'Positioning statement written' },
  { label: 'Google Business Profile optimized' },
  { label: 'LinkedIn profile rewritten', note: '(copy in My Platforms — you paste)' },
  { label: 'Zillow bio rewritten', note: '(copy in My Platforms — you paste)' },
  { label: 'Yelp profile created', note: '(copy in My Platforms — you paste)' },
  { label: 'Realtor.com bio updated', note: '(copy in My Platforms — you paste)' },
  { label: 'Article 1 written and published' },
];

const clientTodoItems: ClientItem[] = [
  { label: 'Approve your positioning statement', href: '/positioning' },
  { label: 'Review + post Article 1', href: '/articles' },
  { label: 'Request 5 GBP reviews from past clients', href: '/reviews' },
  { label: 'Paste your optimized platform copy', href: '/copy-kit' },
];

// localStorage keys that sync with other pages
const CLIENT_ITEM_KEYS = [
  'cited_checklist_positioning',
  'cited_checklist_article1',   // set by /articles when LinkedIn posted
  'cited_checklist_reviews',
  'cited_checklist_platforms',
];

export default function DeliverablesChecklist() {
  const [clientDone, setClientDone] = useState<boolean[]>(clientTodoItems.map(() => false));

  // Load persisted state from localStorage (including cross-page sync)
  useEffect(() => {
    setClientDone(CLIENT_ITEM_KEYS.map(key => localStorage.getItem(key) === 'true'));
  }, []);

  const toggleClient = (i: number) => {
    setClientDone(prev => {
      const next = prev.map((v, idx) => idx === i ? !v : v);
      localStorage.setItem(CLIENT_ITEM_KEYS[i], String(next[i]));
      return next;
    });
  };

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-lg font-semibold" style={{ color: '#0A1929' }}>Your Score Is Moving</h3>
        <p className="text-sm text-gray-500 mt-0.5">Track what&apos;s been done and what&apos;s next</p>
      </div>

      {/* Section A: Cited-completed */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-semibold" style={{ color: '#0A1929' }}>✅ Cited Has Done This</span>
        </div>
        <div className="space-y-1.5">
          {citedCompletedItems.map((item, i) => (
            <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg bg-teal-50">
              <div className="w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5" style={{ background: '#00BFA6' }}>
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm text-gray-600">{item.label}</span>
                {item.note && (
                  <div className="text-xs text-gray-400 mt-0.5">{item.note}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section B: Client to-do */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-semibold" style={{ color: '#0A1929' }}>Your Turn</span>
          <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: '#FFF3CD', color: '#D4A830' }}>
            {clientTodoItems.length - clientDone.filter(Boolean).length} left
          </span>
        </div>
        <div className="space-y-1.5">
          {clientTodoItems.map((item, i) => {
            const done = clientDone[i];
            const rowContent = (
              <div
                className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors hover:bg-gray-50 cursor-pointer`}
                onClick={() => toggleClient(i)}
              >
                <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 transition-colors ${
                  done ? '' : 'border-2 border-gray-300'
                }`} style={done ? { background: '#00BFA6' } : {}}>
                  {done && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className={`text-sm flex-1 ${done ? 'text-gray-600' : 'text-gray-800 font-medium'}`}>
                  {item.label}
                </span>
                {!done && item.href && (
                  <span className="text-xs shrink-0 font-semibold" style={{ color: '#00BFA6' }}>→</span>
                )}
              </div>
            );

            if (item.href && !done) {
              return (
                <Link key={i} href={item.href} className="block" onClick={e => e.stopPropagation()}>
                  {rowContent}
                </Link>
              );
            }

            return <div key={i}>{rowContent}</div>;
          })}
        </div>
      </div>
    </div>
  );
}
