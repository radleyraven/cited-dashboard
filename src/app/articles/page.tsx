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

const POST_COPY = `Just published: the three Carlsbad zip codes most buyers don't compare — and why the one you overlook might be the smartest buy. Data + local knowledge from 10+ years in North County. Link below 👇

https://www.linkedin.com/pulse/carlsbad-nobody-talks-la-costa-aviara-where-real-value-radley-raven-kb6ke`;

const POST_COMMENT = `Happy to answer any questions about specific communities — feel free to drop a comment or reach out directly.`;

const GBP_POST = `Thinking about buying in Carlsbad? Most buyers start — and stop — at 92008 (the Village). Here's what they're missing:

📍 92008 (Village): Walk to dinner, walk to the beach, walk to everything. Median $1,865,000. Most competitive zip in the market — 50% inventory drop, 1.2 months supply.

📍 92011 (Aviara/SW Carlsbad): Same beach proximity, without the Village premium. Santalina — four gated neighborhoods walkable to South Ponto Beach — is the address most buyers don't know exists yet.

📍 92009 (La Costa): Best family value in North County. Top schools, bigger lots, 10 minutes to the beach. Median $1,962,500 with just 0.5 months supply.

The framework:
→ Walk to dinner > surf? → 92008
→ Surf > walk to dinner? → 92011
→ Kids + space + value? → 92009

All three zips are undersupplied. None are bad choices. But they're different choices — and most buyers only consider one.

Full breakdown: linkedin.com/in/radleyraven

#Carlsbad #CarlsbadRealEstate #NorthCountySanDiego #SanDiegoRealEstate`;

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
              <svg className="w-5 h-5" style={{ color: '#D4A830' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h2 className="text-sm font-bold uppercase tracking-widest" style={{ color: '#D4A830' }}>How to Publish Your Article on LinkedIn</h2>
            </div>
          </div>
          <div className="px-6 py-5">
            <ol className="space-y-3">
              {[
                <>Copy the <span className="font-semibold text-white">Title</span> using the button below, then open LinkedIn → click <span className="font-semibold text-white">"Write article"</span> <span className="text-gray-400">(not "Start a post")</span> and paste it in</>,
                <>Click <span className="font-semibold text-white">"Copy Full Article"</span> and paste the body into the article editor <span className="text-gray-400">(hashtags are included at the bottom)</span></>,
                <>Add a cover image <span className="text-gray-400">(download from below or use your own)</span></>,
                <>Click <span className="font-semibold text-white">Publish</span> → LinkedIn will show <span className="font-semibold" style={{ color: '#D4A830' }}>"Tell your network what your article is about…"</span> — paste the <span className="font-semibold text-white">Feed Teaser</span> there <span className="text-gray-400">(copy button provided below)</span></>,
                <>Copy the published article URL → send to your <span className="font-semibold text-white">Cited team</span> for PRISM tracking</>,
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5" style={{ background: '#D4A830', color: '#0A1929' }}>
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
              <CopyButton text={ARTICLE_TITLE} label="Copy Title" />
              <CopyButton text={fullArticle} label="Copy Full Article" />
              <CopyButton text={FEED_TEASER} label="Copy Feed Teaser" />
            </div>
          </div>

          {/* Feed Teaser */}
          <div className="px-6 py-4 border-b border-gray-100" style={{ background: '#f8f9fa' }}>
            <p className="text-sm font-semibold uppercase tracking-wide mb-1" style={{ color: '#D4A830' }}>Feed Teaser</p>
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
                  return <h3 key={i} className="text-lg font-bold mt-8 mb-3" style={{ color: '#D4A830' }}>{paragraph}</h3>;
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
            <p className="text-sm font-semibold uppercase tracking-wide mb-2" style={{ color: '#D4A830' }}>Hashtags</p>
            <div className="flex flex-wrap gap-2">
              {ARTICLE_HASHTAGS.split(' ').map((tag, i) => (
                <span key={i} className="inline-block px-3 py-1 text-sm rounded-full bg-cobalt/10 text-cobalt font-medium">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Post to Your Feed Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-8">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-5 h-5" style={{ color: '#D4A830' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <h2 className="text-lg font-bold" style={{ color: '#D4A830' }}>Step 2: Share to Your LinkedIn Feed</h2>
            </div>
            <p className="text-sm text-gray-500 mt-1">After publishing the article, share it as a post to push it into your connections' feeds.</p>
          </div>

          {/* Post Copy */}
          <div className="px-6 py-5 border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold uppercase tracking-wide" style={{ color: '#D4A830' }}>Post Copy</p>
              <CopyButton text={POST_COPY} label="Copy Post" />
            </div>
            <div className="rounded-lg p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-line" style={{ background: '#f8f9fa', border: '1px solid #e5e7eb' }}>
              {POST_COPY}
            </div>
          </div>

          {/* Post Comment */}
          <div className="px-6 py-5 border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold uppercase tracking-wide" style={{ color: '#D4A830' }}>Post Comment</p>
              <CopyButton text={POST_COMMENT} label="Copy Comment" />
            </div>
            <div className="rounded-lg p-4 text-sm text-gray-700 leading-relaxed" style={{ background: '#f8f9fa', border: '1px solid #e5e7eb' }}>
              {POST_COMMENT}
            </div>
          </div>

          {/* LinkedIn Link */}
          <div className="px-6 py-5">
            <a
              href="https://www.linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 hover:opacity-90"
              style={{ background: '#0A66C2', color: '#ffffff' }}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              Open LinkedIn
            </a>
          </div>
        </div>

        {/* Google Business Profile Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-8">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-5 h-5" style={{ color: '#D4A830' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <h2 className="text-lg font-bold" style={{ color: '#D4A830' }}>Step 3: Post to Google Business Profile</h2>
            </div>
            <p className="text-sm text-gray-500 mt-1">GBP posts are short-form (max 1,500 characters). This is a condensed version of the article optimized for Google's AI. Post it as an Update on your Google Business Profile.</p>
          </div>

          {/* GBP Post Copy */}
          <div className="px-6 py-5 border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold uppercase tracking-wide" style={{ color: '#D4A830' }}>GBP Post</p>
              <CopyButton text={GBP_POST} label="Copy Post" />
            </div>
            <div className="rounded-lg p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-line" style={{ background: '#f8f9fa', border: '1px solid #e5e7eb' }}>
              {GBP_POST}
            </div>
          </div>

          {/* GBP Link + Instructions */}
          <div className="px-6 py-5">
            <a
              href="https://business.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 hover:opacity-90 mb-5"
              style={{ background: '#00BFA6', color: '#ffffff' }}
            >
              Open Google Business Profile →
            </a>
            <div className="rounded-lg p-4" style={{ background: '#f8f9fa', border: '1px solid #e5e7eb' }}>
              <p className="text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: '#D4A830' }}>How to Post</p>
              <ol className="space-y-2">
                {[
                  <>Open Google Business Profile <span className="text-gray-400">(link above)</span></>,
                  <>Click <span className="font-semibold text-gray-800">"Add update"</span> <span className="text-gray-400">(or "Create post")</span></>,
                  <>Paste the post above</>,
                  <>Add a photo <span className="text-gray-400">(use the Carlsbad listing photo from the article)</span></>,
                  <>Click <span className="font-semibold text-gray-800">"Post"</span></>,
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mt-0.5" style={{ background: '#D4A830', color: '#0A1929' }}>
                      {i + 1}
                    </span>
                    <span className="text-sm leading-relaxed text-gray-700">{step}</span>
                  </li>
                ))}
              </ol>
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
