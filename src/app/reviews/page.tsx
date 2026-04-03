'use client';

import { useState } from 'react';
import Link from 'next/link';

const REVIEW_RESPONSES = [
  {
    label: 'Option A',
    badge: 'Recommended',
    text: `Thank you so much for the kind words — it means a lot. I love what I do, and working with great clients like you makes it even better. If you ever need anything real estate related down the road, don't hesitate to reach out. Really appreciate you taking the time to leave this review!`,
  },
  {
    label: 'Option B',
    badge: 'Shorter',
    text: `Really appreciate this — thank you! It was a great experience working together. Always here if you need anything.`,
  },
  {
    label: 'Option C',
    badge: 'Generic',
    text: `Thank you for the wonderful review! I truly appreciate you taking the time — it means more than you know. Looking forward to staying connected!`,
  },
];

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
        copied
          ? 'bg-teal text-white'
          : 'bg-cobalt text-white hover:bg-cobalt/90'
      }`}
    >
      {copied ? (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Copied ✓
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          {label}
        </>
      )}
    </button>
  );
}

export default function ReviewsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="text-white" style={{ background: '#0A1929' }}>
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-widest" style={{ color: '#00BFA6' }}>CITED</h1>
            <p className="text-sm text-gray-400 mt-1">Review Responses</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">← Dashboard</Link>
            <Link href="/articles" className="text-sm text-gray-400 hover:text-white transition-colors">Articles</Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Review Response Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full" style={{ background: '#D4A830', color: '#0A1929' }}>
                GBP REVIEW
              </span>
              <span className="text-sm text-gray-500">Pending Response</span>
            </div>
            <h2 className="text-lg font-bold text-gray-900">Review from M</h2>
            <p className="text-sm text-gray-500 mt-1">Choose a response option below, copy it, and paste it into Google Business Profile.</p>
          </div>

          {/* Response Options */}
          <div className="divide-y divide-gray-100">
            {REVIEW_RESPONSES.map((response, i) => (
              <div key={i} className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{response.label}</span>
                    <span
                      className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${
                        response.badge === 'Recommended'
                          ? 'bg-teal/10 text-teal'
                          : response.badge === 'Shorter'
                          ? 'bg-blue-50 text-blue-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {response.badge}
                    </span>
                  </div>
                  <CopyButton text={response.text} label="Copy Response" />
                </div>
                <p className="text-gray-700 leading-relaxed bg-gray-50 rounded-lg p-4 border border-gray-100">
                  {response.text}
                </p>
              </div>
            ))}
          </div>

          {/* Open GBP Link */}
          <div className="p-6 border-t border-gray-100" style={{ background: '#f8f9fa' }}>
            <a
              href="https://business.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg font-semibold text-sm transition-all duration-200"
              style={{ background: '#D4A830', color: '#0A1929' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Open Google Business Profile →
            </a>
          </div>
        </div>

        {/* Why Reviews Matter for AI Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span className="text-2xl">🤖</span>
              Why Responding to Reviews Matters for AI Visibility
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-gray-700 leading-relaxed">
              AI models like ChatGPT, Gemini, and Perplexity pull from publicly available data to recommend professionals. Google Business Profile reviews — and your responses to them — are a key data source.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <h3 className="font-semibold text-cobalt mb-2">📍 Signals You Send</h3>
                <ul className="text-sm text-gray-600 space-y-1.5">
                  <li>• <strong>Active engagement</strong> — you respond, which signals an active business</li>
                  <li>• <strong>Keyword reinforcement</strong> — your responses contain relevant terms (real estate, location, specialty)</li>
                  <li>• <strong>Recency</strong> — recent responses boost your profile's freshness signal</li>
                </ul>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <h3 className="font-semibold text-cobalt mb-2">🎯 How AI Uses It</h3>
                <ul className="text-sm text-gray-600 space-y-1.5">
                  <li>• AI models index GBP data when generating recommendations</li>
                  <li>• Responded-to reviews carry more weight than unresponded ones</li>
                  <li>• Consistent engagement patterns build authority over time</li>
                </ul>
              </div>
            </div>
            <div className="mt-4 p-4 rounded-lg border-l-4" style={{ borderColor: '#D4A830', background: '#FFFBEB' }}>
              <p className="text-sm text-gray-700">
                <strong>Bottom line:</strong> Every review response is a micro-investment in your AI discoverability. The agents recommending &quot;best real estate agent in La Jolla&quot; are reading these. Make them count.
              </p>
            </div>
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
