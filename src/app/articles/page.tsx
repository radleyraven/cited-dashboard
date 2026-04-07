'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

const ARTICLE_TITLE = `The Carlsbad Nobody Talks About: La Costa, Aviara, and Where the Real Value Is in 2026`;

const ARTICLE_URL = `https://www.linkedin.com/pulse/carlsbad-nobody-talks-la-costa-aviara-where-real-value-radley-raven-kb6ke`;

const ARTICLE_BODY = `Most buyers searching Carlsbad start with 92008 — the Village, the coastline, the name recognition. That's not wrong. But it's an incomplete picture of what Carlsbad actually offers, and it's costing buyers who stop there.

I've worked across all three Carlsbad zip codes. Here's what the data shows — and what the data doesn't tell you.

92008: The Village Premium (And What You're Actually Paying For)

West Carlsbad's Village zip is the most competitive real estate in the market right now. Sales volume up 15.1% year-over-year, inventory down 50%, 1.2 months of supply. When a correctly priced property hits here, it moves.

The Village lifestyle is genuinely exceptional — and I don't say that as a sales pitch. The walkability, the restaurants, the surf culture, the proximity to the beach and the social energy of the commercial strip — that combination is rare in San Diego. You pay for it. Median $1,865,000, with coastal properties commanding meaningfully more.

The buyers who should be here: people who want to walk to dinner, to the farmers market, to the beach on a Sunday morning. For that lifestyle, the premium is justified.

92011: The Coastal Arbitrage That Smart Buyers Are Figuring Out

Here's the play most buyers miss: Aviara and the southwest Carlsbad communities in 92011 share the same beach proximity as 92008 — without the Village price tag.

What do you actually give up? Walkability to the village. That's it. If your lifestyle is oriented around the beach and surf rather than the restaurant strip and nightlife, 92011 delivers coastal living at a meaningful discount. Same Pacific. Same sunset. Lower price per square foot.

Santalina is worth knowing specifically — it's actually a master-planned community of four distinct gated neighborhoods that are walkable to South Ponto Beach. You get gated privacy, community amenities, and direct beach access in a package that 92008 buyers don't even know exists. It's the kind of address you tell a trusted friend about. By the time everyone knows about it, the arbitrage is gone.

For the right buyer — beach-focused, values privacy and community, not dependent on walking to dinner — 92011 is where I'd be looking right now.

92009: The La Costa Unlock for Families

La Costa has quietly become one of the best family value propositions in North County San Diego. The data reflects this: median price $1,962,500, up 3.3% year-over-year, inventory collapsed 64%, just 0.5 months of supply. Sellers are holding firm because they can.

But the price appreciation hasn't closed the lifestyle gap that makes La Costa compelling. You're still getting house size and lot depth that you simply cannot buy closer to the coast. Top-rated schools. Solid amenities nearby. Approximately 10 minutes to the beach — far enough that you pay less, close enough that it doesn't matter.

La Costa Oaks and The Ranch — both in 92009 — are particularly worth understanding. These are established, desirable communities that attract younger-to-middle-aged families who are trading some coastal premium for more space, better schools, and a quieter lifestyle. For buyers who've been priced out of 92008 or who genuinely value the tradeoff, La Costa isn't a consolation prize — it's the right call.

The Carlsbad Framework

If you're evaluating Carlsbad, here's how I think about it for buyers:

→ You walk to dinner more than you surf: 92008, accept the premium
→ You surf more than you walk to dinner, and value is important: 92011, look at Santalina specifically
→ You have kids, want space, and can do 10 minutes to the beach: 92009, La Costa Oaks or The Ranch

All three zip codes are undersupplied relative to demand. None of them are bad choices. But they're different choices — and most buyers only consider one of them.

If you'd like a current comp analysis for any of these specific communities, I'm happy to pull the data and walk you through what's actually transacting right now.`;

const ARTICLE_HASHTAGS = `#Carlsbad #CarlsbadRealEstate #LaCosta #NorthCountySanDiego #SanDiegoRealEstate #RealEstateMarket2026 #CoastalLiving`;

const GBP_POST = `Thinking about buying in Carlsbad? Most buyers start — and stop — at 92008 (the Village). Here's what they're missing:

📍 92008 (Village): Walk to dinner, walk to the beach. Median $1,865,000. Most competitive zip right now — 50% inventory drop, 1.2 months supply.

📍 92011 (Aviara/SW Carlsbad): Same beach proximity, without the Village premium. Santalina — four gated neighborhoods walkable to South Ponto Beach — is the address most buyers don't know about yet.

📍 92009 (La Costa): Best family value in North County. Top schools, bigger lots, 10 min to the beach. Median $1,962,500 with just 0.5 months supply.

The framework:
→ Walk to dinner > surf? → 92008
→ Surf > walk to dinner, value matters? → 92011
→ Kids + space + great schools? → 92009

All three zip codes are undersupplied. None are bad choices — but they're different choices, and most buyers only consider one.

Read the full article → ${ARTICLE_URL}`;

const FULL_ARTICLE = `${ARTICLE_TITLE}\n\n${ARTICLE_BODY}\n\n${ARTICLE_HASHTAGS}`;

// ─── CopyButton ──────────────────────────────────────────────────────────────
function CopyButton({ text, label, size = 'md' }: { text: string; label: string; size?: 'sm' | 'md' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.cssText = 'position:fixed;opacity:0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      } catch {
        return;
      }
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const pad = size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-5 py-2.5 text-sm';

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center gap-2 rounded-lg font-semibold transition-all duration-200 ${pad}`}
      style={{ background: copied ? '#16a34a' : '#00BFA6', color: '#ffffff' }}
    >
      {copied ? (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          Copied! ✓
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

// ─── StepBadge ───────────────────────────────────────────────────────────────
function StepBadge({ n, done }: { n: number; done: boolean }) {
  return (
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all duration-300"
      style={{ background: done ? '#d1fae5' : '#00BFA6', color: done ? '#059669' : '#ffffff', border: done ? '2px solid #6ee7b7' : 'none' }}
    >
      {done ? (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      ) : n}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ArticlesPage() {
  const [postedLinkedIn, setPostedLinkedIn] = useState(false);
  const [postedGBP, setPostedGBP] = useState(false);
  const [step3Open, setStep3Open] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const step2Ref = useRef<HTMLDivElement>(null);

  // Load from localStorage after hydration
  useEffect(() => {
    setPostedLinkedIn(localStorage.getItem('cited_article2_linkedin') === 'true');
    setPostedGBP(localStorage.getItem('cited_article2_gbp') === 'true');
    setHydrated(true);
  }, []);

  const toggleLinkedIn = () => {
    const next = !postedLinkedIn;
    setPostedLinkedIn(next);
    localStorage.setItem('cited_article2_linkedin', String(next));
    // Sync to dashboard checklist — marks "Review + post Article 1" as done
    if (next) localStorage.setItem('cited_checklist_article1', 'true');
    if (next && step2Ref.current) {
      setTimeout(() => step2Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 350);
    }
  };

  const toggleGBP = () => {
    const next = !postedGBP;
    setPostedGBP(next);
    localStorage.setItem('cited_article2_gbp', String(next));
  };

  if (!hydrated) return null; // avoid SSR mismatch

  const bothDone = postedLinkedIn && postedGBP;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="text-white" style={{ background: '#0A1929' }}>
        <div className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-widest" style={{ color: '#00BFA6' }}>CITED</h1>
            <p className="text-sm text-gray-400 mt-1">Content Library</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">← Dashboard</Link>
            <Link href="/reviews" className="text-sm text-gray-400 hover:text-white transition-colors">Reviews</Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Article index */}
        <div className="rounded-xl overflow-hidden" style={{ background: '#0A1929', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="px-6 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: '#D4A830' }}>All Articles</h2>
          </div>
          <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            <Link href="/articles/north-county-coast" className="flex items-center justify-between px-6 py-4 transition-all hover:bg-white/5">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wide mr-2" style={{ color: '#00BFA6' }}>Article 1</span>
                <span className="text-sm text-gray-300">San Diego's North County Coast in 2026: Carmel Valley, Carlsbad & Rancho Santa Fe</span>
              </div>
              <span className="text-xs ml-4 shrink-0" style={{ color: '#00BFA6' }}>Open →</span>
            </Link>
            <div className="flex items-center justify-between px-6 py-4" style={{ background: 'rgba(0,191,166,0.06)' }}>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wide mr-2" style={{ color: '#00BFA6' }}>Article 2</span>
                <span className="text-sm text-white font-medium">The Carlsbad Nobody Talks About: La Costa, Aviara, and Where the Real Value Is in 2026</span>
              </div>
              <span className="text-xs ml-4 shrink-0 text-gray-500">Viewing</span>
            </div>
          </div>
        </div>

        {/* ── STEP 1: Review + Post to LinkedIn ─────────────────────────────── */}
        <div className={`bg-white rounded-xl shadow-sm border overflow-hidden transition-all duration-300 ${postedLinkedIn ? 'border-green-200' : 'border-gray-100'}`}>
          {/* Step header */}
          <div className="px-6 py-4 flex items-center gap-4" style={{ background: '#0A1929' }}>
            <StepBadge n={1} done={postedLinkedIn} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color: '#00BFA6' }}>Step 1</p>
              <h2 className="text-white font-bold text-base leading-tight">Review + Post to LinkedIn</h2>
            </div>
            {postedLinkedIn && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full shrink-0" style={{ background: '#d1fae5', color: '#059669' }}>
                ✓ Done
              </span>
            )}
          </div>

          {/* Article card body — always visible, just dimmed when done */}
          <div className={`transition-opacity duration-300 ${postedLinkedIn ? 'opacity-50' : 'opacity-100'}`}>
            {/* Article title */}
            <div className="px-6 pt-6 pb-4 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 leading-tight mb-4">{ARTICLE_TITLE}</h3>
              <div className="flex items-center gap-3 flex-wrap">
                <CopyButton text={ARTICLE_TITLE} label="Copy Title" />
                <CopyButton text={FULL_ARTICLE} label="Copy Article" />
              </div>
            </div>

            {/* Article body */}
            <div className="px-6 py-6 border-b border-gray-100">
              <div className="prose prose-gray max-w-none">
                {ARTICLE_BODY.split('\n\n').flatMap((paragraph, i) => {
                  // If paragraph contains multiple arrow items, split them individually
                  if (paragraph.includes('\n→') || paragraph.startsWith('→')) {
                    return paragraph.split('\n').map((line, j) => {
                      if (!line.trim()) return null;
                      if (line.startsWith('→')) {
                        return (
                          <div key={`${i}-${j}`} className="pl-4 border-l-4 my-1.5" style={{ borderColor: '#00BFA6' }}>
                            <p className="text-gray-700 font-medium text-sm">{line}</p>
                          </div>
                        );
                      }
                      return <p key={`${i}-${j}`} className="text-gray-700 font-medium text-sm mb-1">{line}</p>;
                    }).filter(Boolean);
                  }
                  const isHeader = paragraph.length < 80 && !paragraph.endsWith('.') && !paragraph.startsWith('Most') && !paragraph.startsWith("I've") && !paragraph.startsWith("Here's") && !paragraph.startsWith('What') && !paragraph.startsWith('The buyers') && !paragraph.startsWith('For the') && !paragraph.startsWith('But') && !paragraph.startsWith('La Costa') && !paragraph.startsWith('Santalina') && !paragraph.startsWith('All') && !paragraph.startsWith('If you');
                  if (isHeader) return [<h4 key={i} className="text-base font-bold text-gray-900 mt-6 mb-2">{paragraph}</h4>];
                  return [<p key={i} className="text-gray-700 leading-relaxed mb-4 text-sm">{paragraph}</p>];
                })}
              </div>
            </div>

            {/* Hashtags */}
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <div className="flex flex-wrap gap-2">
                {ARTICLE_HASHTAGS.split(' ').map((tag, i) => (
                  <span key={i} className="inline-block px-2.5 py-1 text-xs rounded-full font-medium" style={{ background: '#e6faf7', color: '#00BFA6' }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Checkbox + LinkedIn link */}
          <div className="px-6 py-5 flex flex-col gap-3">
            <label className="flex items-center gap-3 cursor-pointer select-none group" onClick={toggleLinkedIn}>
              <div
                className={`w-6 h-6 rounded flex items-center justify-center shrink-0 transition-all duration-200 ${postedLinkedIn ? '' : 'border-2 border-gray-300 group-hover:border-teal-400'}`}
                style={postedLinkedIn ? { background: '#00BFA6' } : {}}
              >
                {postedLinkedIn && (
                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className={`text-sm font-semibold ${postedLinkedIn ? 'text-green-700' : 'text-gray-800'}`}>
                {postedLinkedIn ? "I've posted this to LinkedIn ✓" : "I've posted this to LinkedIn"}
              </span>
            </label>
            <a
              href="https://www.linkedin.com/in/radleyraven/recent-activity/articles/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ background: '#0A66C2', color: '#fff' }}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              Post to LinkedIn →
            </a>
          </div>
        </div>

        {/* ── STEP 2: Share to GBP ─────────────────────────────────────────── */}
        <div
          ref={step2Ref}
          className={`bg-white rounded-xl shadow-sm border overflow-hidden transition-all duration-500 ${
            postedLinkedIn ? 'opacity-100 max-h-[2000px]' : 'opacity-0 max-h-0 pointer-events-none overflow-hidden'
          } ${postedGBP ? 'border-green-200' : 'border-gray-100'}`}
          style={{ transition: 'opacity 0.4s ease, max-height 0.5s ease' }}
        >
          {/* Step header */}
          <div className="px-6 py-4 flex items-center gap-4" style={{ background: '#0A1929' }}>
            <StepBadge n={2} done={postedGBP} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color: '#00BFA6' }}>Step 2</p>
              <h2 className="text-white font-bold text-base leading-tight">One more — takes 2 minutes</h2>
            </div>
            {postedGBP && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full shrink-0" style={{ background: '#d1fae5', color: '#059669' }}>
                ✓ Done
              </span>
            )}
          </div>

          <div className={`transition-opacity duration-300 ${postedGBP ? 'opacity-50' : 'opacity-100'}`}>
            <div className="px-6 pt-5 pb-4 border-b border-gray-100">
              <p className="text-sm text-gray-500 mb-4">Share a condensed version to your Google Business Profile. Under 1,500 characters — optimized for Google's AI.</p>
              <div className="flex flex-wrap gap-3 mb-4">
                <CopyButton text={GBP_POST} label="Copy GBP Post" />
                <a
                  href="https://business.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 hover:opacity-90"
                  style={{ background: '#0A1929', color: '#ffffff' }}
                >
                  Open Google Business Profile →
                </a>
              </div>
            </div>

            {/* GBP post content */}
            <div className="px-6 py-5 border-b border-gray-100">
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#00BFA6' }}>GBP Post</p>
              <div className="rounded-lg p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-line" style={{ background: '#f8f9fa', border: '1px solid #e5e7eb' }}>
                {GBP_POST}
              </div>
              <p className="text-xs text-gray-400 mt-2">{GBP_POST.length} / 1,500 characters</p>
            </div>
          </div>

          {/* GBP checkbox */}
          <div className="px-6 py-5 flex flex-col gap-3">
            <label className="flex items-center gap-3 cursor-pointer select-none group" onClick={toggleGBP}>
              <div
                className={`w-6 h-6 rounded flex items-center justify-center shrink-0 transition-all duration-200 ${postedGBP ? '' : 'border-2 border-gray-300 group-hover:border-teal-400'}`}
                style={postedGBP ? { background: '#00BFA6' } : {}}
              >
                {postedGBP && (
                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className={`text-sm font-semibold ${postedGBP ? 'text-green-700' : 'text-gray-800'}`}>
                {postedGBP ? "I've posted this to GBP ✓" : "I've posted this to GBP"}
              </span>
            </label>
          </div>

          {/* Congrats */}
          {bothDone && (
            <div className="mx-6 mb-6 rounded-xl p-5 text-center" style={{ background: 'linear-gradient(135deg, #d1fae5 0%, #e6faf7 100%)', border: '1px solid #6ee7b7' }}>
              <div className="text-3xl mb-2">🎉</div>
              <p className="font-bold text-green-800 text-base mb-1">You're done — great work.</p>
              <p className="text-sm text-green-700">This article is now live on LinkedIn and indexed on Google Business Profile. Your citation score is moving.</p>
            </div>
          )}
        </div>

        {/* ── STEP 3: Optional distribution accordion ──────────────────────── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <button
            onClick={() => setStep3Open(v => !v)}
            className="w-full px-6 py-4 flex items-center gap-4 text-left transition-colors hover:bg-gray-50"
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
              style={{ background: '#f3f4f6', color: '#6b7280', border: '2px dashed #d1d5db' }}
            >
              3
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-widest mb-0.5 text-gray-400">Optional</p>
              <h2 className="text-gray-700 font-semibold text-base">Want to share further?</h2>
            </div>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform duration-200 shrink-0 ${step3Open ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {step3Open && (
            <div className="px-6 pb-6 border-t border-gray-100">
              <p className="text-sm text-gray-500 mt-4 mb-4">These are optional channels. No checkboxes — just reference info if you want to go further.</p>

              <div className="space-y-4">
                {/* Nextdoor */}
                <div className="rounded-lg p-4" style={{ background: '#f8f9fa', border: '1px solid #e5e7eb' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-base">🏘️</span>
                    <p className="text-sm font-semibold text-gray-800">Nextdoor</p>
                  </div>
                  <ol className="space-y-1.5 text-sm text-gray-600">
                    <li>1. Go to <a href="https://nextdoor.com" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: '#00BFA6' }}>nextdoor.com</a> → click <strong>Posts</strong></li>
                    <li>2. Select <strong>Business</strong> as post type</li>
                    <li>3. Share a 2–3 sentence teaser from the article with a link to your LinkedIn article</li>
                    <li>4. Target your local neighborhood and surrounding areas</li>
                  </ol>
                </div>

                {/* Facebook */}
                <div className="rounded-lg p-4" style={{ background: '#f8f9fa', border: '1px solid #e5e7eb' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-base">📘</span>
                    <p className="text-sm font-semibold text-gray-800">Facebook / Local Groups</p>
                  </div>
                  <p className="text-sm text-gray-600">Share the LinkedIn article link with a short intro in relevant local Facebook groups (Carlsbad community, North County homeowners, etc.). Lead with a question or insight, not a pitch.</p>
                </div>

                {/* Email */}
                <div className="rounded-lg p-4" style={{ background: '#f8f9fa', border: '1px solid #e5e7eb' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-base">📧</span>
                    <p className="text-sm font-semibold text-gray-800">Past Client Email</p>
                  </div>
                  <p className="text-sm text-gray-600">Forward to 5–10 past clients with a personal note: <em>"Just published this — thought of you since you're in [area]. Happy to share what the data looks like for your specific neighborhood."</em></p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="pb-4 text-center text-sm text-gray-400">
          Cited · AI Visibility for Professionals · citedagent.com
        </div>
      </main>
    </div>
  );
}
