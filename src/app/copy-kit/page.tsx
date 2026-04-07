'use client';

import { useState } from 'react';
import Link from 'next/link';
import SignOutButton from '@/components/SignOutButton';

interface Platform {
  id: string;
  name: string;
  badge: 'You Update';
  sections: { title?: string; text: string }[];
  instructions?: string[];
  additionalItems?: string[];
}

const platforms: Platform[] = [
  {
    id: 'linkedin',
    name: 'LinkedIn',
    badge: 'You Update',
    sections: [
      {
        title: 'Headline',
        text: `Luxury Real Estate Agent | Carlsbad · Encinitas · Solana Beach | Listing Specialist & Buyer Advocate | Compass | La Costa & Encinitas Ranch Expert`,
      },
      {
        title: 'About',
        text: `If you're selling a home in Carlsbad, Encinitas, or Solana Beach, you need an agent who knows exactly how to make your property stand out — because presentation is everything in today's market. I'm Maria Santos, a listing specialist with Compass serving the North County San Diego coastal corridor. For the past 7 years, I've helped sellers in Carlsbad and Encinitas achieve top dollar by combining meticulous presentation strategy with deep hyperlocal market knowledge. I live in La Costa — these aren't just my markets, they're my neighborhood. $48M+ in closed transactions. CA License #02041346 | Compass.`,
      },
    ],
    instructions: [
      'Go to linkedin.com/in/[your-profile]',
      'Click Edit profile → Edit Headline (paste headline) → Edit About section (paste about text)',
      'Click Save',
    ],
    additionalItems: [
      'Profile photo — professional headshot (your face should be 60%+ of frame)',
      'Banner image — a Carlsbad/North County lifestyle or listing photo',
      'Featured section — link to your Cited article or best listing',
      'Skills — add: Real Estate, Luxury Homes, Carlsbad, Encinitas, Home Staging, Buyer Representation',
    ],
  },
  {
    id: 'zillow',
    name: 'Zillow',
    badge: 'You Update',
    sections: [
      {
        text: `I'm Maria Santos, a real estate agent with Compass specializing in luxury home sales and listings in Carlsbad, Encinitas, and Solana Beach. I've spent 7 years building deep expertise in North County San Diego's coastal markets — particularly La Costa, La Costa Oaks, Encinitas Ranch, and Carlsbad Village. I live in La Costa, which means when you ask me about the best streets, the school districts, or where the new development is happening — I know from experience. My specialty is presentation: strategic staging, photography, and pre-market prep that creates competitive offers. $48M+ in career transactions. CA License #02041346 | Compass.`,
      },
    ],
    instructions: [
      'Go to zillow.com/profile/[your-username]',
      'Click Edit Profile → Agent Bio → paste bio',
      'Click Save',
    ],
    additionalItems: [
      'Profile photo — same professional headshot used on LinkedIn',
      'Service areas — add every city and ZIP code you serve (La Costa, Encinitas Ranch, Carlsbad Village, etc.)',
      'Languages — add all languages you speak fluently',
    ],
  },
  {
    id: 'yelp',
    name: 'Yelp',
    badge: 'You Update',
    sections: [
      {
        text: `Maria Santos is a real estate agent with Compass in Carlsbad, California, specializing in luxury home listings and buyer representation in Carlsbad, Encinitas, and Solana Beach. With 7 years of active experience in North County San Diego — including La Costa, La Costa Oaks, Encinitas Ranch, and Carlsbad Village — Maria is one of the most knowledgeable listing agents in the Carlsbad area. She lives in La Costa and brings an insider perspective to every property she represents. $48M+ in closed transactions. CA License #02041346 | Compass.`,
      },
    ],
    instructions: [
      'Go to biz.yelp.com',
      'Click Business Information → Business Description → paste bio',
      'Click Save',
    ],
    additionalItems: [
      'Business hours — set your standard availability (e.g., Mon–Sat 9am–6pm)',
      'Service area — add all cities/ZIP codes you serve',
      'Photos — upload at least 5 photos (headshot, neighborhood shots, listing photos)',
    ],
  },
  {
    id: 'realtordotcom',
    name: 'Realtor.com',
    badge: 'You Update',
    sections: [
      {
        text: `Maria Santos is a Carlsbad-based real estate agent with Compass specializing in luxury listings and buyer representation across Carlsbad, Encinitas, and Solana Beach. With 7 years of hyperlocal expertise in La Costa, Encinitas Ranch, and the North County coastal corridor, Maria brings deep neighborhood knowledge and a signature focus on home presentation to every transaction. $48M+ in career volume. CA License #02041346.`,
      },
    ],
    instructions: [
      'Go to realtor.com/realestateagents',
      'Click Edit Profile → About Me → paste bio',
      'Click Save',
    ],
    additionalItems: [
      'Profile photo — professional headshot',
      'Service areas — list every city you actively serve',
      'Languages — add all languages you speak fluently',
    ],
  },
  {
    id: 'fastexpert',
    name: 'FastExpert',
    badge: 'You Update',
    sections: [
      {
        text: `Carlsbad listing specialist with 7 years of North County San Diego expertise. I help sellers in Carlsbad, Encinitas, and Solana Beach achieve top dollar through strategic home presentation and hyperlocal pricing. My neighborhoods: La Costa, La Costa Oaks, Encinitas Ranch, Carlsbad Village. $48M+ in career transactions. CA License #02041346 | Compass.`,
      },
    ],
    instructions: [
      'Go to fastexpert.com/agents',
      'Click Edit Profile → Bio → paste bio',
      'Click Save',
    ],
    additionalItems: [
      'Profile photo — same professional headshot used on other platforms',
      'Service areas — add all target cities and ZIP codes',
    ],
  },
  {
    id: 'gbp',
    name: 'Google Business Profile',
    badge: 'You Update',
    sections: [
      {
        title: 'Business Description',
        text: `Maria Santos is a luxury real estate agent with Compass serving Carlsbad, Encinitas, and Solana Beach. With 7 years of hyperlocal expertise in La Costa, Encinitas Ranch, and the North County coastal corridor, Maria specializes in listing representation and buyer advocacy across Carlsbad's most sought-after neighborhoods. Known for her eye for presentation and deep knowledge of local market dynamics, Maria helps sellers in Carlsbad and Encinitas achieve top dollar through strategic staging, pricing, and marketing. Licensed in California (#02041346).`,
      },
    ],
    instructions: [
      'Go to business.google.com → Claim or create your business',
      'Add your business name, category (Real Estate Agency), and address',
      'Paste the description above into the "Business description" field',
      'Set your hours, phone number, and website URL',
    ],
    additionalItems: [
      'Business hours — set your standard availability',
      'Address — must match exactly across all platforms (NAP consistency)',
      'Photos — upload 10+ photos: headshot, neighborhood, exterior, interior',
      'Logo — upload your personal or brokerage logo',
      'Category — select "Real Estate Agency" as primary',
    ],
  },
  {
    id: 'bing',
    name: 'Bing Places',
    badge: 'You Update',
    sections: [
      {
        title: 'Business Description',
        text: `Maria Santos is a luxury real estate agent with Compass serving Carlsbad, Encinitas, and Solana Beach. With 7 years of hyperlocal expertise in La Costa, Encinitas Ranch, and the North County coastal corridor, Maria specializes in listing representation and buyer advocacy. Known for her presentation expertise and deep local knowledge, Maria helps sellers achieve top dollar in Carlsbad and Encinitas. CA License #02041346.`,
      },
    ],
    instructions: [
      'Go to bingplaces.com → Sign in with Microsoft account',
      'Search for your business or click "Add new business"',
      'Paste the description above, set your category to "Real Estate Agency"',
      'Add your phone, website, and service area',
      'Verify via phone call or postcard',
    ],
    additionalItems: [
      'Service area — add all target cities',
      'Hours — set standard availability',
      'Photos — same headshot and neighborhood photos as GBP',
    ],
  },
  {
    id: 'apple',
    name: 'Apple Business Connect',
    badge: 'You Update',
    sections: [
      {
        title: 'Business Description',
        text: `Maria Santos, luxury real estate agent with Compass. Specializing in Carlsbad, Encinitas, and Solana Beach. 7 years of North County San Diego expertise across La Costa, Encinitas Ranch, and the coastal corridor. Listing specialist known for presentation and pricing accuracy. CA License #02041346.`,
      },
    ],
    instructions: [
      'Go to businessconnect.apple.com → Sign in with Apple ID',
      'Search for your business listing or create a new one',
      'Paste the description, set category to "Real Estate Agent"',
      'Upload your headshot as the business photo',
      'Verify via phone — Apple will call the number on file',
    ],
    additionalItems: [
      'Phone number — must match all other platforms exactly (NAP)',
      'Website — link to your brokerage profile page',
      'Hours — by appointment',
      'Profile photo — professional headshot',
    ],
  },
  {
    id: 'homes',
    name: 'Homes.com',
    badge: 'You Update',
    sections: [
      {
        title: 'Agent Bio',
        text: `Maria Santos is a Carlsbad-based listing specialist with Compass, serving Carlsbad, Encinitas, and Solana Beach. With 7 years of hyperlocal expertise across La Costa, La Costa Oaks, and Encinitas Ranch, Maria brings deep neighborhood knowledge and a signature focus on presentation to every listing. $48M+ in career transactions. CA License #02041346.`,
      },
    ],
    instructions: [
      'Go to homes.com → search your name → click "Claim this profile"',
      'Or create a new profile at homes.com/real-estate-agents',
      'Paste the bio above into your profile description',
      'Add your markets, license number, and contact info',
      'Upload your professional headshot',
    ],
    additionalItems: [
      'Service areas — all target cities and zip codes',
      'Profile photo — same headshot as other platforms',
      'Specialties — Listing Specialist, Luxury Homes, Buyer Representation',
    ],
  },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-200"
      style={{
        background: copied ? '#00BFA6' : 'transparent',
        color: copied ? 'white' : '#00BFA6',
        border: `1.5px solid #00BFA6`,
      }}
    >
      {copied ? '✓ Copied!' : 'Copy Bio'}
    </button>
  );
}

export default function CopyKitPage() {
  const [approved, setApproved] = useState<Record<string, boolean>>({});
  // Progressive reveal: starts at 1 (only LinkedIn visible)
  const [revealedCount, setRevealedCount] = useState(1);

  const toggleApprove = (id: string, index: number) => {
    const currentlyApproved = approved[id] || false;
    const next = !currentlyApproved;
    setApproved(prev => ({ ...prev, [id]: next }));
    if (next) {
      // Reveal the next platform when checking a platform
      setRevealedCount(prev => Math.max(prev, index + 2));
    }
  };

  const approvedCount = Object.values(approved).filter(Boolean).length;
  const progressPercent = Math.round((approvedCount / platforms.length) * 100);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="text-white" style={{ background: '#0A1929' }}>
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
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
              <Link href="/copy-kit" className="text-sm font-semibold transition-colors" style={{ color: '#00BFA6' }}>Copy Kit</Link>
            </div>
            <div className="text-right">
              <div className="font-semibold">Radley Raven</div>
              <div className="text-sm text-gray-400">The Oppenheim Group · Carlsbad</div>
              <SignOutButton />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold" style={{ color: '#0A1929' }}>Your Platform Copy</h2>
          <p className="text-gray-500 mt-2 max-w-2xl">
            Review the optimized copy for each platform, paste it in, and post it. Platforms are ordered by AI citation impact — start with LinkedIn.
          </p>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1.5">
              <div className="text-sm font-medium" style={{ color: '#00BFA6' }}>
                {approvedCount} of {platforms.length} platforms reviewed &amp; posted
              </div>
              <button
                onClick={() => setRevealedCount(platforms.length)}
                className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors"
              >
                Skip ahead — show all
              </button>
            </div>
            <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%`, background: '#00BFA6' }}
              />
            </div>
          </div>
        </div>

        {/* Platform Cards */}
        <div className="space-y-6">
          {platforms.map((platform, index) => {
            const isApproved = approved[platform.id] || false;
            const isVisible = index < revealedCount;
            const allText = platform.sections.map(s => s.text).join('\n\n');

            return (
              <div
                key={platform.id}
                className="transition-all duration-500 overflow-hidden"
                style={{
                  maxHeight: isVisible ? '2000px' : '0px',
                  opacity: isVisible ? 1 : 0,
                  marginBottom: isVisible ? undefined : '0',
                }}
              >
                <div
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                  style={isApproved ? { borderColor: '#00BFA6', borderWidth: 2 } : {}}
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold" style={{ color: '#0A1929' }}>{platform.name}</h3>
                      <span
                        className="text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={{ background: '#FFF8E6', color: '#D4A830' }}
                      >
                        {platform.badge}
                      </span>
                    </div>
                    {isApproved && (
                      <span className="text-sm font-semibold" style={{ color: '#00BFA6' }}>✓ Reviewed &amp; Posted</span>
                    )}
                  </div>

                  <div className="px-6 py-5 space-y-4">
                    {/* Bio Sections */}
                    {platform.sections.map((section, i) => (
                      <div key={i}>
                        {section.title && (
                          <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                            {section.title}
                          </div>
                        )}
                        <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 leading-relaxed border border-gray-100">
                          {section.text}
                        </div>
                      </div>
                    ))}

                    {/* How to update instructions */}
                    {platform.instructions ? (
                      <div className="rounded-lg p-4 border border-gray-100" style={{ background: '#F8F9FA' }}>
                        <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">How to update</div>
                        <ol className="space-y-1">
                          {platform.instructions.map((step, i) => (
                            <li key={i} className="text-sm text-gray-600 flex gap-2">
                              <span className="font-semibold shrink-0" style={{ color: '#00BFA6' }}>{i + 1}.</span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    ) : null}

                    {/* Additional items to update */}
                    {platform.additionalItems && platform.additionalItems.length > 0 && (
                      <div className="rounded-lg p-4 border border-gray-100" style={{ background: '#F8F9FA' }}>
                        <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Additional items to update</div>
                        <ul className="space-y-1">
                          {platform.additionalItems.map((item, i) => (
                            <li key={i} className="text-sm text-gray-600 flex gap-2">
                              <span className="shrink-0" style={{ color: '#00BFA6' }}>·</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2">
                      <CopyButton text={allText} />
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <div
                          className="w-5 h-5 rounded flex items-center justify-center shrink-0 transition-colors"
                          style={isApproved ? { background: '#00BFA6' } : { border: '2px solid #D1D5DB' }}
                          onClick={() => toggleApprove(platform.id, index)}
                        >
                          {isApproved && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span
                          className="text-sm font-medium"
                          style={{ color: isApproved ? '#00BFA6' : '#6B7280' }}
                          onClick={() => toggleApprove(platform.id, index)}
                        >
                          I&apos;ve reviewed and posted this ✓
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-10 text-center text-sm text-gray-400">
          Cited · AI Visibility for Professionals · citedagent.com
        </div>
      </main>
    </div>
  );
}
