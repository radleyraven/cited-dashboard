'use client';

import { useState } from 'react';
import Link from 'next/link';
import SignOutButton from '@/components/SignOutButton';

interface Platform {
  id: string;
  name: string;
  badge: 'Cited Updates' | 'You Update';
  sections: { title?: string; text: string }[];
  instructions?: string[];
  gbpNote?: string;
}

const platforms: Platform[] = [
  {
    id: 'gbp',
    name: 'Google Business Profile',
    badge: 'Cited Updates',
    sections: [
      {
        text: `Maria Santos is a luxury real estate agent with Compass serving Carlsbad, Encinitas, and Solana Beach. With 7 years of hyperlocal expertise in La Costa, Encinitas Ranch, and the North County coastal corridor, Maria specializes in listing representation and buyer advocacy across Carlsbad's most sought-after neighborhoods. Known for her eye for presentation and deep knowledge of local market dynamics, Maria helps sellers in Carlsbad and Encinitas achieve top dollar through strategic staging, pricing, and marketing. Licensed in California (#02041346).`,
      },
    ],
    gbpNote: "We handle this one. Jett will update your GBP directly once you add us as manager (instructions sent separately).",
  },
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

  const toggleApprove = (id: string) => {
    setApproved(prev => ({ ...prev, [id]: !prev[id] }));
  };

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
          <h2 className="text-3xl font-bold" style={{ color: '#0A1929' }}>Your Optimized Bios</h2>
          <p className="text-gray-500 mt-2 max-w-2xl">
            Review each bio, approve it, then copy and paste it into your platform profile.
            GBP is the only platform we update directly — you&apos;ll need to update the others yourself.
          </p>
          <div className="mt-3 text-sm font-medium" style={{ color: '#00BFA6' }}>
            {Object.values(approved).filter(Boolean).length} of {platforms.length} platforms approved
          </div>
        </div>

        {/* Platform Cards */}
        <div className="space-y-6">
          {platforms.map((platform) => {
            const isApproved = approved[platform.id] || false;
            const allText = platform.sections.map(s => s.text).join('\n\n');

            return (
              <div
                key={platform.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                style={isApproved ? { borderColor: '#00BFA6', borderWidth: 2 } : {}}
              >
                {/* Card Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold" style={{ color: '#0A1929' }}>{platform.name}</h3>
                    <span
                      className="text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={
                        platform.badge === 'Cited Updates'
                          ? { background: '#E6FAF7', color: '#00BFA6' }
                          : { background: '#FFF8E6', color: '#D4A830' }
                      }
                    >
                      {platform.badge}
                    </span>
                  </div>
                  {isApproved && (
                    <span className="text-sm font-semibold" style={{ color: '#00BFA6' }}>✓ Updated</span>
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

                  {/* GBP Note or Instructions */}
                  {platform.gbpNote ? (
                    <div className="rounded-lg p-4 text-sm" style={{ background: '#E6FAF7', color: '#00796B' }}>
                      <span className="font-semibold">ℹ️ Note: </span>{platform.gbpNote}
                    </div>
                  ) : platform.instructions ? (
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

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2">
                    <CopyButton text={allText} />
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <div
                        className="w-5 h-5 rounded flex items-center justify-center shrink-0 transition-colors"
                        style={isApproved ? { background: '#00BFA6' } : { border: '2px solid #D1D5DB' }}
                        onClick={() => toggleApprove(platform.id)}
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
                        onClick={() => toggleApprove(platform.id)}
                      >
                        I&apos;ve updated this platform ✓
                      </span>
                    </label>
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
