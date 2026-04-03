'use client';

import { useState } from 'react';
import Link from 'next/link';

const ARTICLE_TITLE = `The Carlsbad Nobody Talks About: La Costa, Aviara, and Where the Real Value Is in 2026`;

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

const FEED_TEASER = `Most Carlsbad buyers only look at 92008. Here's what they're missing in 92011 and 92009 — and why the zip code you overlook might be the one you should buy in.`;

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

export default function ArticlesPage() {
  const fullArticle = `${ARTICLE_TITLE}\n\n${ARTICLE_BODY}\n\n${ARTICLE_HASHTAGS}`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="text-white" style={{ background: '#0A1929' }}>
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
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

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">

        {/* LinkedIn Publishing Instructions */}
        <div className="rounded-xl mb-8 overflow-hidden" style={{ background: '#0A1929', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="px-6 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" style={{ color: '#00BFA6' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h2 className="text-sm font-bold uppercase tracking-widest" style={{ color: '#00BFA6' }}>How to Publish Your Article on LinkedIn</h2>
            </div>
          </div>
          <div className="px-6 py-5">
            <ol className="space-y-3">
              {[
                <>Click <span className="font-semibold text-white">"Copy Full Article"</span> below</>,
                <>Open LinkedIn → click <span className="font-semibold text-white">"Write article"</span> <span className="text-gray-400">(not "Start a post")</span></>,
                <>Set the title <span className="text-gray-400">(copy button provided below)</span></>,
                <>Paste the article body</>,
                <>Add hashtags at the bottom of the article <span className="text-gray-400">(copy button provided below)</span></>,
                <>Add a cover image <span className="text-gray-400">(download from below or use your own)</span></>,
                <>Click <span className="font-semibold text-white">Publish</span> → LinkedIn will show <span className="font-semibold" style={{ color: '#D4A830' }}>"Tell your network what your article is about…"</span> — paste the <span className="font-semibold text-white">Feed Teaser</span> there <span className="text-gray-400">(copy button provided below)</span></>,
                <>Copy the published article URL → send to your <span className="font-semibold text-white">Cited team</span> for PRISM tracking</>,
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5" style={{ background: '#00BFA6', color: '#0A1929' }}>
                    {i + 1}
                  </span>
                  <span className="text-sm leading-relaxed" style={{ color: '#CBD5E1' }}>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Article Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Article Header */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full mb-3" style={{ background: '#D4A830', color: '#0A1929' }}>
                  ARTICLE
                </span>
                <h2 className="text-xl font-bold text-gray-900 leading-tight">{ARTICLE_TITLE}</h2>
              </div>
            </div>
            {/* Copy Buttons Row */}
            <div className="flex flex-wrap gap-3 mt-4">
              <CopyButton text={fullArticle} label="Copy Full Article" />
              <CopyButton text={ARTICLE_TITLE} label="Copy Title" />
              <CopyButton text={ARTICLE_HASHTAGS} label="Copy Hashtags" />
              <CopyButton text={FEED_TEASER} label="Feed Teaser — paste in LinkedIn's 'Tell your network what your article is about...' box" />
            </div>
          </div>

          {/* Feed Teaser */}
          <div className="px-6 py-4 border-b border-gray-100" style={{ background: '#f8f9fa' }}>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Feed Teaser</p>
            <p className="text-gray-700 italic">{FEED_TEASER}</p>
          </div>

          {/* Article Body */}
          <div className="px-6 py-6">
            <div className="prose prose-gray max-w-none">
              {ARTICLE_BODY.split('\n\n').map((paragraph, i) => {
                // Check if it's a section header (short line, no period at end)
                const isHeader = paragraph.length < 80 && !paragraph.endsWith('.') && !paragraph.startsWith('→') && !paragraph.startsWith('Most') && !paragraph.startsWith('I\'ve') && !paragraph.startsWith('Here\'s') && !paragraph.startsWith('What') && !paragraph.startsWith('The buyers') && !paragraph.startsWith('For the') && !paragraph.startsWith('But') && !paragraph.startsWith('La Costa') && !paragraph.startsWith('Santalina') && !paragraph.startsWith('All') && !paragraph.startsWith('If you');
                const isFrameworkItem = paragraph.startsWith('→');
                
                if (isHeader) {
                  return <h3 key={i} className="text-lg font-bold text-cobalt mt-8 mb-3">{paragraph}</h3>;
                }
                if (isFrameworkItem) {
                  return (
                    <div key={i} className="pl-4 border-l-4 my-2" style={{ borderColor: '#D4A830' }}>
                      <p className="text-gray-800 font-medium">{paragraph}</p>
                    </div>
                  );
                }
                return <p key={i} className="text-gray-700 leading-relaxed mb-4">{paragraph}</p>;
              })}
            </div>
          </div>

          {/* Hashtags */}
          <div className="px-6 py-4 border-t border-gray-100" style={{ background: '#f8f9fa' }}>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Hashtags</p>
            <div className="flex flex-wrap gap-2">
              {ARTICLE_HASHTAGS.split(' ').map((tag, i) => (
                <span key={i} className="inline-block px-3 py-1 text-sm rounded-full bg-cobalt/10 text-cobalt font-medium">
                  {tag}
                </span>
              ))}
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
