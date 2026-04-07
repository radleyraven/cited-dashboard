'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import SignOutButton from '@/components/SignOutButton';

const QUESTIONS = [
  {
    id: 'q1',
    label: "What's one thing buyers or sellers moving to your area are always surprised to discover — something that isn't obvious from Zillow?",
    hint: 'A neighborhood dynamic, hidden gem, school zone, or lifestyle detail',
  },
  {
    id: 'q2',
    label: "What's the biggest mistake sellers in your market make that costs them money or time?",
    hint: 'Real example is fine — no names needed',
  },
  {
    id: 'q3',
    label: 'Pick your top two neighborhoods and compare them — what\'s different about the vibe, buyers, price points, tradeoffs?',
    hint: 'Your market insight, not a data dump',
  },
  {
    id: 'q4',
    label: 'What does exceptional presentation mean to you? One specific thing you do that other agents skip.',
    hint: 'This becomes your differentiator in the article',
  },
  {
    id: 'q5',
    label: "What's your honest read on your market right now? What are you seeing on the ground?",
    hint: '2-3 sentences is plenty',
  },
];

const ARTICLE_NUMBER = 1;

export default function BriefPage() {
  const [answers, setAnswers] = useState<Record<string, string>>({
    q1: '', q2: '', q3: '', q4: '', q5: '',
  });
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const activeRef = useRef<HTMLDivElement>(null);

  const handleChange = (id: string, value: string) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
  };

  const handleNext = () => {
    const currentQ = QUESTIONS[currentQuestion - 1];
    if (!answers[currentQ.id]?.trim()) {
      setError('Please answer this question before moving on.');
      return;
    }
    setError(null);
    setCurrentQuestion(prev => prev + 1);
  };

  const handleEdit = (questionNum: number) => {
    setCurrentQuestion(questionNum);
    setError(null);
  };

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentQuestion]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic validation — all 5 questions required
    for (const q of QUESTIONS) {
      if (!answers[q.id]?.trim()) {
        setError(`Please answer all 5 questions before submitting.`);
        return;
      }
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientEmail: 'client@citedagent.com', // replaced server-side with session email when auth is wired
          articleNumber: ARTICLE_NUMBER,
          ...answers,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.');
        return;
      }

      setSubmitted(true);
    } catch {
      setError('Network error — please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="text-white" style={{ background: '#0A1929' }}>
        <div className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <Link href="/">
              <h1 className="text-2xl font-bold tracking-widest cursor-pointer" style={{ color: '#00BFA6' }}>CITED</h1>
            </Link>
            <p className="text-sm text-gray-400 mt-1">AI Visibility Dashboard</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <Link href="/articles" className="text-sm text-gray-400 hover:text-white transition-colors">Articles</Link>
              <Link href="/reviews" className="text-sm text-gray-400 hover:text-white transition-colors">Reviews</Link>
              <Link href="/copy-kit" className="text-sm text-gray-400 hover:text-white transition-colors">Copy Kit</Link>
            </div>
            <div className="text-right">
              <div className="font-semibold">Radley Raven</div>
              <div className="text-sm text-gray-400">The Oppenheim Group · Carlsbad</div>
              <SignOutButton />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">
        {submitted ? (
          /* ── Success state ─────────────────────────────────────────────── */
          <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-10 text-center">
            <div className="text-4xl mb-4">✅</div>
            <h2 className="text-2xl font-bold mb-3" style={{ color: '#0A1929' }}>
              Brief received.
            </h2>
            <p className="text-gray-600 text-base leading-relaxed">
              Article {ARTICLE_NUMBER} will be in your dashboard within 48 hours.
            </p>
            <div className="mt-8">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90"
                style={{ background: '#00BFA6' }}
              >
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        ) : (
          /* ── Form ─────────────────────────────────────────────────────── */
          <>
            <div className="mb-8">
              <h2 className="text-3xl font-bold" style={{ color: '#0A1929' }}>
                Article {ARTICLE_NUMBER} Brief
              </h2>
              <p className="text-gray-500 mt-2 text-base leading-relaxed">
                5 questions — 10 minutes. Your answers are the raw material. We write the article.
              </p>
            </div>

            {/* Progress indicator */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#00BFA6' }}>
                  Question {currentQuestion} of {QUESTIONS.length}
                </span>
                <span className="text-xs text-gray-400">
                  {Math.round((currentQuestion / QUESTIONS.length) * 100)}% complete
                </span>
              </div>
              <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(currentQuestion / QUESTIONS.length) * 100}%`,
                    background: '#00BFA6',
                  }}
                />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {QUESTIONS.map((q, i) => {
                const qNum = i + 1;
                const isActive = qNum === currentQuestion;
                const isPast = qNum < currentQuestion;

                // Future questions are hidden
                if (!isActive && !isPast) return null;

                if (isPast) {
                  // Read-only previous answer with edit link
                  return (
                    <div
                      key={q.id}
                      className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 opacity-70 hover:opacity-90 transition-opacity"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-bold uppercase tracking-widest block mb-1" style={{ color: '#00BFA6' }}>
                            Question {qNum}
                          </span>
                          <p className="text-sm font-semibold text-gray-700 leading-snug mb-2">{q.label}</p>
                          <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">{answers[q.id]}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleEdit(qNum)}
                          className="flex-shrink-0 text-xs font-medium underline underline-offset-2 text-gray-400 hover:text-teal-500 transition-colors mt-1"
                        >
                          edit
                        </button>
                      </div>
                    </div>
                  );
                }

                // Active question
                return (
                  <div
                    key={q.id}
                    ref={activeRef}
                    className="bg-white rounded-xl shadow-md border-2 p-6 transition-all"
                    style={{ borderColor: '#00BFA6' }}
                  >
                    <label className="block mb-1">
                      <span className="text-xs font-bold uppercase tracking-widest mb-1 block" style={{ color: '#00BFA6' }}>
                        Question {qNum}
                      </span>
                      <span className="text-base font-semibold text-gray-900 leading-snug block mb-1">
                        {q.label}
                      </span>
                      <span className="text-sm text-gray-400 block mb-3">{q.hint}</span>
                    </label>
                    <textarea
                      rows={4}
                      value={answers[q.id]}
                      onChange={e => handleChange(q.id, e.target.value)}
                      placeholder="Your answer…"
                      autoFocus
                      className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 placeholder-gray-300 outline-none transition-all focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                    />

                    {error && (
                      <div className="mt-3 rounded-lg px-4 py-3 text-sm font-medium" style={{ background: '#fff0f0', color: '#b91c1c', border: '1px solid #fecaca' }}>
                        {error}
                      </div>
                    )}

                    <div className="mt-4 flex justify-end">
                      {qNum < QUESTIONS.length ? (
                        <button
                          type="button"
                          onClick={handleNext}
                          className="px-6 py-3 rounded-xl font-bold text-white text-sm transition-all duration-200 hover:opacity-90"
                          style={{ background: '#00BFA6' }}
                        >
                          Next →
                        </button>
                      ) : (
                        <button
                          type="submit"
                          disabled={submitting}
                          className="px-6 py-3 rounded-xl font-bold text-white text-sm transition-all duration-200 hover:opacity-90 disabled:opacity-60"
                          style={{ background: submitting ? '#9ca3af' : '#00BFA6' }}
                        >
                          {submitting ? 'Submitting…' : 'Submit Brief →'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </form>
          </>
        )}

        <div className="mt-10 text-center text-sm text-gray-400">
          Cited · AI Visibility for Professionals · citedagent.com
        </div>
      </main>
    </div>
  );
}
