'use client';

import { useState } from 'react';
import Link from 'next/link';

const ARTICLE_TITLE = `San Diego's North County Coast in 2026: What Buyers and Sellers Need to Know About Carmel Valley, Carlsbad & Rancho Santa Fe`;

const ARTICLE_BODY = `San Diego County just recorded its lowest home sales volume in over 35 years — 1,615 closings in January 2026. If you're trying to understand what that means for North County specifically, the picture is more nuanced than the countywide headlines suggest.

I've worked Carmel Valley, Carlsbad, and Rancho Santa Fe across dozens of transactions. These three markets behave differently from each other and very differently from the broader county numbers. Here's what's actually happening.

Carmel Valley: The 92130 Standoff

Carmel Valley is experiencing what I'd call a motivated seller / patient buyer standoff. Sellers still have 2021-era price expectations baked in. Buyers — many of them tech-adjacent, dual-income households — are rate-sensitive and in no hurry. The result: properties that would have moved in two weeks in 2022 are now sitting 45-75 days.

What this means for buyers: this is the most negotiating leverage Carmel Valley has offered in four years. A property sitting 60+ days has had the reality conversation with its agent. There's room to negotiate price, credits, and terms that didn't exist 24 months ago.

What this means for sellers: aspirational pricing is the enemy right now. A Carmel Valley home priced correctly from day one still sells — and faster than you'd expect given the headlines. The trap is the 2-3 price reductions that leave value on the table and stigmatize the listing. The data is clear: price it right the first time.

Carlsbad: The Coastal Resilience Story

Carlsbad is holding better than the broader county. The coastal lifestyle premium — beaches, the village feel, the school district — continues to attract buyers who are less rate-sensitive than the typical SD buyer. Inventory remains tight relative to demand, especially in the $1.2M-$2.2M range.

The micromarket gap worth knowing: West Carlsbad (beachside, 92008) commands a meaningful premium over East Carlsbad (92009, 92010) on a per-square-foot basis. That gap has actually widened in the current market as lifestyle buyers prioritize walkability and beach access over square footage.

For buyers in Carlsbad: the window to find well-priced inventory is real but narrow. When a correctly priced property hits in 92008, it moves fast — multiple offers are still happening on the right homes.

For sellers in Carlsbad: you have more leverage here than in most SD submarkets, but it's not 2022. Buyers are more discerning. Presentation and staging matter more than they did. A well-staged, properly priced Carlsbad home outperforms the market. An overpriced one sits.

Rancho Santa Fe: Its Own Universe

RSF doesn't follow county trends — it follows wealth trends. The buyer pool here is largely insulated from rate sensitivity: executives, multi-property owners, international buyers. What drives RSF is confidence, not rates.

Current RSF dynamic: low inventory, selective buyers, and a meaningful quality premium. Homes that are truly special — views, privacy, architectural distinction — are still transacting at strong prices. Generic RSF inventory at top-of-market pricing is sitting.

The RSF insight that most buyers miss: the covenant (the original RSF ranch land governed by the RSF Association) versus surrounding communities (Cielo, The Crosby, Fairbanks Ranch) is not just a prestige distinction — it's a fundamentally different buying experience in terms of architectural review, lot size, and resale liquidity. Buyers who don't know this distinction often overpay in the covenant or underpay elsewhere.

The Through-Line Across All Three

In all three markets, the theme is the same: quality wins, aspirational pricing loses. Buyers have more options and more patience than they did two years ago. Sellers who accept this reality are transacting. Those who don't are waiting.

If you're evaluating a move in any of these markets — whether buying, selling, or just tracking values — I'm happy to pull current comps and walk you through what the data actually shows for your specific neighborhood or price range.

Radley Raven is a real estate agent with the Oppenheim Group specializing in Carmel Valley, Carlsbad, Rancho Santa Fe, and San Diego's North County coastal communities.`;

const ARTICLE_HASHTAGS = `#CarmelValley #Carlsbad #RanchoSantaFe #SanDiegoRealEstate #NorthCountySanDiego #RealEstateMarket2026`;

const FEED_TEASER = `San Diego's broader market numbers are masking what's actually happening in North County. Here's a ground-level look at Carmel Valley, Carlsbad, and Rancho Santa Fe — what's different in each market and what it means if you're buying or selling in 2026.`;

const POST_COPY = `Just published: what's actually happening in Carmel Valley, Carlsbad, and Rancho Santa Fe right now — and why the countywide headlines are missing the real story. North County data + ground-level insight. Link below 👇

https://www.linkedin.com/pulse/san-diegos-north-county-coast-2026-what-buyers-sellers-radley-raven-4zu6c`;

const POST_COMMENT = `Happy to pull current comps for any of these markets if you're evaluating a move — just drop a comment or reach out directly.`;

const GBP_POST = `North County San Diego market update — Carmel Valley, Carlsbad & Rancho Santa Fe in 2026.

San Diego County hit its lowest sales volume in 35+ years. But North County tells a more nuanced story.

📍 Carmel Valley (92130): Buyers have the most negotiating leverage in four years. Properties priced right still sell. Aspirational pricing = price reductions + stigmatized listings.

📍 Carlsbad: Holding stronger than the county. Coastal lifestyle premium persists. 92008 (Village/beach) remains competitive with tight inventory. 92009/92011 offer value for buyers willing to look east.

📍 Rancho Santa Fe: Follows wealth, not rates. Truly exceptional homes are still transacting. Generic inventory at top-of-market pricing is sitting.

The theme across all three: quality wins, aspirational pricing loses.

Thinking about buying or selling in North County? I can pull current comps for your specific neighborhood and price range.

Radley Raven | Oppenheim Group | North County San Diego`;

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        setCopied(true);
      } catch {
        return;
      }
    }
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSelectText = () => {
    const button = document.activeElement as HTMLElement;
    const parent = button?.closest('[data-content]');
    if (parent) {
      const range = document.createRange();
      range.selectNodeContents(parent);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  };

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <button
        onClick={handleCopy}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200"
        style={{ background: '#00BFA6', color: '#ffffff' }}
        onMouseEnter={e => { if (!copied) (e.currentTarget as HTMLButtonElement).style.opacity = '0.85'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
      >
        {copied ? (
          <>
            <svg className="w-4 h-4" fill="none" stroke="#22C55E" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span style={{ color: '#22C55E' }}>Copied ✓</span>
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
      <button
        onClick={handleSelectText}
        className="text-xs underline transition-colors"
        style={{ color: '#999' }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#00BFA6'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#999'; }}
      >
        Select text manually
      </button>
    </div>
  );
}

export default function NorthCountyCoastPage() {
  const fullArticle = `${ARTICLE_TITLE}\n\nBy Radley Raven, Real Estate Agent | Oppenheim Group\n\n${ARTICLE_BODY}\n\n${ARTICLE_HASHTAGS}`;

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
            <Link href="/articles" className="text-sm text-gray-400 hover:text-white transition-colors">All Articles</Link>
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
                <>Add a cover image <span className="text-gray-400">(aerial or street-level shot of Carlsbad coastline, Carmel Valley, or RSF estate — 1200x644px)</span></>,
                <>Click <span className="font-semibold text-white">Publish</span> → LinkedIn will show <span className="font-semibold" style={{ color: '#D4A830' }}>"Tell your network what your article is about…"</span> — paste the <span className="font-semibold text-white">Feed Teaser</span> there <span className="text-gray-400">(copy button below)</span></>,
                <>Copy the published article URL → send to your <span className="font-semibold text-white">Cited team</span> for PRISM tracking</>,
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5" style={{ background: '#00BFA6', color: '#ffffff' }}>
                    {i + 1}
                  </span>
                  <span className="text-sm leading-relaxed" style={{ color: '#ffffff' }}>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Step 1: Article Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Article Header */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full mb-3" style={{ background: '#D4A830', color: '#0A1929' }}>
                  STEP 1: LINKEDIN ARTICLE
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
            {/* Open LinkedIn — right under copy buttons */}
            <div className="mt-3">
              <a
                href="https://www.linkedin.com/in/radleyraven/recent-activity/articles/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 hover:opacity-90"
                style={{ background: '#0A66C2', color: '#ffffff' }}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                Post to LinkedIn →
              </a>
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
                const trimmed = paragraph.trim();
                // Section headers: short, no trailing period, not a byline/narrative sentence
                const isHeader = trimmed.length < 80 &&
                  !trimmed.endsWith('.') &&
                  !trimmed.startsWith('San Diego') &&
                  !trimmed.startsWith('I\'ve') &&
                  !trimmed.startsWith('Carmel Valley is') &&
                  !trimmed.startsWith('What this') &&
                  !trimmed.startsWith('Carlsbad is') &&
                  !trimmed.startsWith('The micromarket') &&
                  !trimmed.startsWith('For buyers') &&
                  !trimmed.startsWith('For sellers') &&
                  !trimmed.startsWith('RSF doesn') &&
                  !trimmed.startsWith('Current RSF') &&
                  !trimmed.startsWith('The RSF') &&
                  !trimmed.startsWith('In all three') &&
                  !trimmed.startsWith('If you') &&
                  !trimmed.startsWith('Radley Raven is');

                if (isHeader) {
                  return <h3 key={i} className="text-lg font-bold text-black mt-8 mb-3">{trimmed}</h3>;
                }
                return <p key={i} className="text-gray-700 leading-relaxed mb-4">{trimmed}</p>;
              })}
            </div>
          </div>

          {/* Hashtags */}
          <div className="px-6 py-4 border-t border-gray-100" style={{ background: '#f8f9fa' }}>
            <p className="text-sm font-semibold uppercase tracking-wide mb-2" style={{ color: '#D4A830' }}>Hashtags</p>
            <div className="flex flex-wrap gap-2">
              {ARTICLE_HASHTAGS.split(' ').map((tag, i) => (
                <span key={i} className="inline-block px-3 py-1 text-sm rounded-full font-medium" style={{ background: 'rgba(0,191,166,0.1)', color: '#00BFA6' }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Step 2: Share to LinkedIn Feed */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-8">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-5 h-5" style={{ color: '#D4A830' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <h2 className="text-lg font-bold" style={{ color: '#D4A830' }}>Step 2: Share to Your LinkedIn Feed</h2>
            </div>
            <p className="text-sm text-gray-500 mt-1">After publishing the article, share it as a post to push it into your connections' feeds.</p>
            <div className="flex flex-wrap gap-3 mt-4">
              <CopyButton text={POST_COPY} label="Copy Post" />
              <CopyButton text={POST_COMMENT} label="Copy Comment" />
            </div>
            <div className="mt-3">
              <a
                href="https://www.linkedin.com/in/radleyraven/recent-activity/articles/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 hover:opacity-90"
                style={{ background: '#0A66C2', color: '#ffffff' }}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                Post to LinkedIn →
              </a>
            </div>
          </div>

          <div className="px-6 py-5 border-b border-gray-100">
            <p className="text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: '#D4A830' }}>Post Copy</p>
            <div className="rounded-lg p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-line" style={{ background: '#f8f9fa', border: '1px solid #e5e7eb' }}>
              {POST_COPY}
            </div>
          </div>

          <div className="px-6 py-5">
            <p className="text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: '#D4A830' }}>Post Comment</p>
            <div className="rounded-lg p-4 text-sm text-gray-700 leading-relaxed" style={{ background: '#f8f9fa', border: '1px solid #e5e7eb' }}>
              {POST_COMMENT}
            </div>
          </div>
        </div>

        {/* Step 3: Google Business Profile */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-8">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-5 h-5" style={{ color: '#D4A830' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <h2 className="text-lg font-bold" style={{ color: '#D4A830' }}>Step 3: Post to Google Business Profile</h2>
            </div>
            <p className="text-sm text-gray-500 mt-1">GBP posts are short-form (max 1,500 characters). This is a condensed version of the article optimized for Google&apos;s AI.</p>
            <div className="mt-4">
              <a
                href="https://business.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 hover:opacity-90"
                style={{ background: '#00BFA6', color: '#ffffff' }}
              >
                Open Google Business Profile →
              </a>
            </div>
            <div className="mt-3">
              <CopyButton text={GBP_POST} label="Copy Post" />
            </div>
          </div>

          {/* GBP Posting Instructions */}
          <div className="px-6 py-5 border-b border-gray-100" style={{ background: '#f8f9fa' }}>
            <p className="text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: '#D4A830' }}>How to Post</p>
            <ol className="space-y-2">
              {[
                <>Click <span className="font-semibold">&quot;Posts&quot;</span> tab on your GBP dashboard</>,
                <>Click <span className="font-semibold">&quot;+ Add post&quot;</span> <span className="text-gray-500">(blue button, top right)</span></>,
                <>Select <span className="font-semibold">&quot;Update&quot;</span> as the post type</>,
                <>Paste your post in the <span className="font-semibold">&quot;Description&quot;</span> field <span className="text-gray-500">(0/1,500 characters)</span></>,
                <>Click <span className="font-semibold">&quot;Select images and videos&quot;</span> to add a photo</>,
                <>Click <span className="font-semibold">&quot;Add more details&quot;</span> → <span className="font-semibold">&quot;+ Button&quot;</span> → select <span className="font-semibold">&quot;Learn more&quot;</span> → paste your LinkedIn article URL</>,
                <>Click <span className="font-semibold">&quot;Post&quot;</span></>,
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: '#D4A830', color: '#0A1929' }}>
                    {i + 1}
                  </span>
                  <span className="text-sm text-gray-700 leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="px-6 py-5">
            <p className="text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: '#D4A830' }}>GBP Post</p>
            <div className="rounded-lg p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-line" style={{ background: '#f8f9fa', border: '1px solid #e5e7eb' }}>
              {GBP_POST}
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
