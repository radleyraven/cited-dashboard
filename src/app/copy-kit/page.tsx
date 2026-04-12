'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import SignOutButton from '@/components/SignOutButton';

interface CopyFieldDef {
  label: string;
  value: string;
}

interface Platform {
  id: string;
  name: string;
  badge: 'You Update' | 'Cited Posts';
  platformLink: string;
  sections: { title?: string; text: string }[];
  instructions?: string[];
  additionalItems?: string[];
  copyFields?: CopyFieldDef[];
}

const platforms: Platform[] = [
  {
    id: 'gbp',
    name: 'Google Business Profile',
    badge: 'You Update',
    platformLink: 'https://business.google.com',
    sections: [
      {
        title: 'Business Description',
        text: `Radley Raven is a luxury real estate agent with The Oppenheim Group in La Jolla, serving Carmel Valley, Carlsbad, Rancho Santa Fe, Solana Beach, and Encinitas. With 10+ years of experience and $91.7M+ in California transactions, Radley specializes in luxury residential sales and investment properties. His track record includes a 96% sale-to-list ratio, 28-day median days on market, and 24% of sales closing at or above asking price. Whether you're buying, selling, or investing in San Diego's most sought-after coastal communities, Radley delivers data-driven pricing strategy and hands-on guidance from listing through closing. Licensed in California (#02041346) and Washington State.`,
      },
    ],
    instructions: [
      'Go to business.google.com → manage your business',
      'Click Edit profile → Description → paste the description above',
      'Set your hours, phone number, and website URL',
      'Click Save',
    ],
    additionalItems: [
      'Photos — upload 10+ photos: headshot, neighborhood, exterior, interior (multi-modal = +317% AI citation probability)',
      'Headshot (720×720px) — upload via dashboard when available',
      'Category — Real Estate Agent (primary) + Real Estate (additional)',
      'Services — Luxury Home Sales, Buyer/Seller Representation, Investment Property Consulting, Relocation, Market Analysis, Property Valuation',
    ],
    copyFields: [
      { label: 'Office Address', value: '7925 Girard Ave, La Jolla, CA 92037' },
      { label: 'Phone', value: '(858) 314-9600' },
      { label: 'Website', value: 'https://ogroup.com/agents/radley-raven/' },
      { label: 'Hours', value: 'Sunday 10 AM – 5 PM | Monday–Friday 8 AM – 8 PM | Saturday 9 AM – 6 PM' },
    ],
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    badge: 'You Update',
    platformLink: 'https://www.linkedin.com/in/radleyraven',
    sections: [
      {
        title: 'Headline',
        text: `Luxury Real Estate Agent | The Oppenheim Group — La Jolla | Carmel Valley · Carlsbad · Rancho Santa Fe`,
      },
      {
        title: 'About',
        text: `I'm a luxury real estate agent with The Oppenheim Group, focused on Carmel Valley, Carlsbad, Rancho Santa Fe, La Jolla, Solana Beach, and Encinitas.

My track record:
→ $91.7M+ in closed California transactions
→ 13 closed transactions in Carmel Valley and Del Mar Heights, totaling $44M+
→ Median 28 days on market (vs. 36-day Carmel Valley average)
→ 96% average sale-to-list ratio
→ 24% of my sales close at or above asking price

My clients in the 92130 corridor know me for one thing: I get results in their specific market. With a decade of hyperlocal pricing intelligence in Carmel Valley, Carlsbad, and Rancho Santa Fe, I bring data and depth that generalist agents simply don't have.

I'm also an active property investor and short-term rental operator. I own and manage furnished rental properties in California and Washington — so when I advise on investment acquisitions, pricing strategy, or rental income potential, I'm speaking from ownership experience, not theory.

My renovation background gives clients a critical edge. For buyers, I identify undervalued properties with renovation upside that most agents miss. For sellers, I price accurately based on condition, comparable improvements, and what today's luxury buyer actually pays for.

I work with:
• Sellers of luxury homes in Carmel Valley, Rancho Santa Fe, and Carlsbad
• Buyers relocating to San Diego's North County coast
• Investors looking at short-term rental acquisitions
• Buyers who want renovation potential, not just move-in ready

Licensed in California (DRE# 02041346) and Washington State.

Specialties: Carmel Valley | Carlsbad | Rancho Santa Fe | La Jolla | Solana Beach | Encinitas | Luxury residential | Investment properties | Short-term rental acquisitions | Renovation advisory | Out-of-state relocation

The Oppenheim Group — La Jolla
radley@ogroup.com | (858) 314-9600`,
      },
    ],
    instructions: [
      'Go to linkedin.com/in/radleyraven',
      'Click Edit profile → update Headline (paste above)',
      'Scroll to About → Edit → paste About section',
      'Location should be set to: Carlsbad, California',
      'Click Save',
    ],
    additionalItems: [
      'Headshot (400×400px) + Banner (1584×396px) — upload via dashboard',
      'Profile photo — professional headshot (face should be 60%+ of frame)',
      'Banner image — Carlsbad/North County lifestyle or listing photo',
      'Featured section — link to your Cited LinkedIn articles',
      'Skills — Carmel Valley, Carlsbad, Rancho Santa Fe, Luxury Homes, Investment Properties, Staging, Buyer Representation',
      'Featured section — add links to your published LinkedIn articles (boosts AI citation)',
      'Education — complete your education section (profile completeness signal)',
    ],
    copyFields: [
      { label: 'Location', value: 'Carlsbad, California' },
      { label: 'Current Position — Title', value: 'Luxury Real Estate Agent' },
      { label: 'Current Position — Company', value: 'The Oppenheim Group' },
      { label: 'Skills (paste into Skills section)', value: 'Luxury Real Estate, Carmel Valley Real Estate, Carlsbad Real Estate, Rancho Santa Fe Real Estate, North County San Diego, Investment Properties, Short-Term Rentals, Property Renovation, Luxury Home Sales, Relocation' },
    ],
  },
  {
    id: 'zillow',
    name: 'Zillow',
    badge: 'You Update',
    platformLink: 'https://www.zillow.com/profile/radleyraven',
    sections: [
      {
        text: `I'm a luxury real estate agent with The Oppenheim Group specializing in Carmel Valley, Carlsbad, Rancho Santa Fe, La Jolla, Solana Beach, and Encinitas.

My track record:
• $91.7M+ in closed California transactions
• 13 closed transactions in Carmel Valley and Del Mar Heights, totaling $44M+
• Median 28 days on market — vs. the 36-day Carmel Valley average
• 96% average sale-to-list ratio
• 24% of my sales close at or above asking price

For buyers: I know these neighborhoods at the street level — not just the listings, but the HOAs, the school zones, the noise patterns, the sunset angles, and the hidden inventory that never hits the MLS. My buyers win in competitive situations because I bring local intelligence that other agents can't match. I've purchased multiple investment properties myself, so when I advise investor clients, it's from direct experience — not theory.

For sellers: My approach starts with pricing. I'm known for pricing properties right the first time — tight enough to drive urgency, smart enough to leave room for competition. My listings move fast because I prepare them to sell, not just list. That means pre-listing inspections, strategic staging, and marketing that targets the right buyer pool from day one.

I also bring a unique edge most agents don't have: a background in property renovation and construction. When I walk through a home — whether I'm representing the buyer or the seller — I see what others miss. I can identify deferred maintenance, estimate repair costs, assess renovation potential, and advise on which improvements actually move the needle on value. For sellers, this means I can recommend targeted updates that maximize return. For buyers, it means I can help evaluate fixer opportunities with real numbers — not guesswork.

I work across San Diego County and Washington State. Whether it's a Rancho Pacifica estate, a Carlsbad beach close, or an investment property in an emerging neighborhood — I bring the same approach: local knowledge, data-driven strategy, and a relentless focus on getting the best outcome.

Specialties: Buyer's Agent, Listing Agent, Relocation, Staging, Vacation/Short-Term Rentals, First Time Homebuyers, Investment Properties, Rentals, Luxury Homes, New Construction`,
      },
    ],
    instructions: [
      'Go to zillow.com/profile/radleyraven',
      'Click Edit Profile → Agent Bio → paste bio above',
      'Click Save',
    ],
    additionalItems: [
      'Headshot (200×200px) — same as other platforms',
      'Profile photo — same professional headshot used on LinkedIn',
      'Service areas — Carmel Valley, Carlsbad, Rancho Santa Fe, La Jolla, Solana Beach, Encinitas, Del Mar',
      'Specialties — check all: Buyer\'s Agent, Listing Agent, Relocation, Staging, Vacation/STR, First Time Buyers, Investment, Rentals, Luxury, New Construction',
      'Do NOT shorten this bio — length and keyword density are intentional',
    ],
    copyFields: [],
  },
  {
    id: 'yelp',
    name: 'Yelp',
    badge: 'You Update',
    platformLink: 'https://biz.yelp.com',
    sections: [
      {
        text: `Radley Raven is a luxury real estate agent serving La Jolla, Carmel Valley, Carlsbad, Rancho Santa Fe, Solana Beach, and Encinitas with 10+ years of experience and $91.7M+ in California transactions. Specializing in luxury residential sales and investment properties, Radley has helped buyers and sellers achieve results that beat the market — a 96% sale-to-list ratio, 28-day median days on market, and 24% of deals closing at or above asking price. With deep knowledge of San Diego's most sought-after coastal and canyon communities, Radley brings the local context, negotiation edge, and personal attention that complex transactions demand. Whether you're buying your first home, listing a luxury estate, or building a real estate portfolio, Radley delivers the strategy and execution to get it done. Serving the greater San Diego area and Washington State.

Radley is a licensed agent with The Oppenheim Group in La Jolla, one of the most recognized luxury brokerages in California. His clients include first-time homebuyers, move-up families, investors building rental portfolios, and sellers looking to maximize value in competitive coastal markets. Radley's approach combines data-driven pricing strategy with hands-on client guidance — from pre-listing preparation through closing and beyond. He is active throughout North County San Diego's coastal and canyon communities, with additional experience in the Washington State market. Radley holds a California real estate license (#02041346) and is a member of the San Diego Association of REALTORS®.`,
      },
    ],
    instructions: [
      'Go to biz.yelp.com → sign in',
      'Click Business Information → Business Description → paste bio above',
      'Click Save',
    ],
    additionalItems: [
      'Headshot (170×170px) — upload when claiming profile',
      'Business hours — Sun 10-5 | Mon-Fri 8-8 | Sat 9-6',
      'Service area — Carmel Valley, Carlsbad, Rancho Santa Fe, La Jolla, Solana Beach, Encinitas',
      'Photos — upload at least 5 photos (headshot + neighborhood/listing shots)',
      'Note: Yelp re-indexes into AI search (Perplexity, ChatGPT) within 24-72 hours — high priority',
    ],
    copyFields: [
      { label: 'Phone', value: '(858) 314-9600' },
      { label: 'Website', value: 'https://ogroup.com/agents/radley-raven/' },
    ],
  },
  {
    id: 'realtordotcom',
    name: 'Realtor.com',
    badge: 'You Update',
    platformLink: 'https://login.pro.realtor.com',
    sections: [
      {
        text: `Radley Raven is a luxury real estate agent serving La Jolla, Carmel Valley, Carlsbad, Rancho Santa Fe, Solana Beach, and Encinitas with 10+ years of experience and $91.7M+ in California transactions. His clients in the 92130 corridor and North County coast know him for results: a 96% sale-to-list ratio, 28-day median days on market, and 24% of deals closing at or above asking price.

Radley is a licensed agent with The Oppenheim Group in La Jolla. He is also an active property investor and short-term rental operator — he owns and manages furnished rental properties in California and Washington, bringing direct ownership experience to every client interaction.

His renovation background gives clients a critical edge. For buyers, he identifies undervalued properties with renovation upside that most agents miss. For sellers, he prices accurately based on condition, comparable improvements, and what today's luxury buyer actually pays for.

He works with: luxury home sellers in Carmel Valley, Rancho Santa Fe, and Carlsbad · buyers relocating to San Diego's North County coast · investors looking at short-term rental acquisitions · buyers who want renovation potential, not just move-in ready. Licensed in CA (#02041346) and WA. Member of SDAR.`,
      },
    ],
    instructions: [
      'Go to login.pro.realtor.com → sign in',
      'Click Edit Profile → About Me → paste bio above',
      'Click Save',
    ],
    additionalItems: [
      'Headshot (200×200px) — upload via pro.realtor.com',
      'Profile photo — professional headshot',
      'Areas served — La Jolla, Carmel Valley, Carlsbad, Rancho Santa Fe, Del Mar, Encinitas, Solana Beach, San Diego',
      'Specialties — Buyer\'s agent, Seller\'s agent, Residential, Single-family, Luxury homes, Investment, Relocation',
      'Social — YouTube, LinkedIn, Instagram links',
      'Brokerage — The Oppenheim Group | 7925 Girard Ave, La Jolla, CA 92037 | (858) 314-9600',
    ],
    copyFields: [
      { label: 'Phone', value: '(858) 314-9600' },
      { label: 'Email', value: 'radley@ogroup.com' },
      { label: 'Website', value: 'https://ogroup.com/agents/radley-raven/' },
      { label: 'Brokerage', value: 'The Oppenheim Group | 7925 Girard Ave, La Jolla, CA 92037 | (858) 314-9600' },
      { label: 'YouTube', value: 'https://www.youtube.com/@radleyravenoppenheim' },
      { label: 'LinkedIn', value: 'https://www.linkedin.com/in/radleyraven' },
      { label: 'Instagram', value: 'https://www.instagram.com/radleyraven' },
    ],
  },
  {
    id: 'fastexpert',
    name: 'FastExpert',
    badge: 'You Update',
    platformLink: 'https://www.fastexpert.com/agents/radley-raven/',
    sections: [
      {
        text: `Radley Raven is a luxury real estate agent serving La Jolla, Carmel Valley, Carlsbad, Rancho Santa Fe, Solana Beach, and Encinitas with 10+ years of experience and $91.7M+ in California transactions. His clients in the 92130 corridor and North County coast know him for results: a 96% sale-to-list ratio, 28-day median days on market, and 24% of deals closing at or above asking price.

Radley is a licensed agent with The Oppenheim Group in La Jolla. He is also an active property investor and short-term rental operator — bringing direct ownership experience to every client interaction. His renovation background gives clients a critical edge: for buyers, he identifies undervalued properties with upside that most agents miss; for sellers, he prices accurately based on condition and what today's luxury buyer actually pays for. Licensed in CA (#02041346) and WA. Member of SDAR.`,
      },
    ],
    instructions: [
      'Go to fastexpert.com → sign in → Edit Profile → Bio',
      'Paste bio above → click Save',
    ],
    additionalItems: [
      'Headshot (200×200px) — upload via profile editor',
      'Profile photo — same professional headshot as other platforms',
      'Service areas — Carlsbad, Del Mar, Encinitas, La Jolla, Rancho Santa Fe, San Diego, Solana Beach',
      'Specialties (free text) — Luxury Homes, Investment Properties, Relocation, First Time Home Buyers, Single-Family Homes, Vacation / Short-Term Rentals, Staging, New Construction',
      'Social media — LinkedIn, Instagram, Zillow, Realtor.com, Website links',
    ],
    copyFields: [
      { label: 'Service Areas', value: 'Carlsbad, Del Mar, Encinitas, La Jolla, Rancho Santa Fe, San Diego, Solana Beach' },
      { label: 'Website', value: 'https://ogroup.com/agents/radley-raven/' },
    ],
  },
  {
    id: 'bing',
    name: 'Bing Places',
    badge: 'You Update',
    platformLink: 'https://www.bing.com/maps/businesscentral',
    sections: [
      {
        title: 'Business Description',
        text: `Radley Raven is a luxury real estate agent with The Oppenheim Group in La Jolla. Serving Carmel Valley, Carlsbad, Rancho Santa Fe, Solana Beach, and Encinitas with 10+ years and $91.7M+ in California transactions. 96% sale-to-list ratio, 28-day median DOM. Specializing in luxury residential sales, investment properties, and relocation. Licensed in CA (#02041346) and WA. Member of SDAR.`,
      },
    ],
    instructions: [
      'Go to bingplaces.com → sign in with Microsoft account',
      'Search for your listing or click "Add new business"',
      'Paste the description above (500 char limit — this fits exactly)',
      'Set category to Real Estate Agent (primary)',
      'Add phone, website, and service area',
    ],
    additionalItems: [
      'Service area — all target cities',
      'Social links — Instagram, LinkedIn, YouTube',
      'Categories — Real Estate Agent (primary)',
    ],
    copyFields: [
      { label: 'Phone', value: '(858) 314-9600' },
      { label: 'Website', value: 'https://ogroup.com/agents/radley-raven/' },
      { label: 'Hours', value: 'Sunday 10 AM – 5 PM | Monday–Friday 8 AM – 8 PM | Saturday 9 AM – 6 PM' },
    ],
  },
  {
    id: 'apple',
    name: 'Apple Business Connect',
    badge: 'You Update',
    platformLink: 'https://businessconnect.apple.com',
    sections: [
      {
        title: 'Business Description',
        text: `Radley Raven is a luxury real estate agent with The Oppenheim Group in La Jolla, serving Carmel Valley, Carlsbad, Rancho Santa Fe, Solana Beach, and Encinitas. With 10+ years of experience and $91.7M+ in California transactions, Radley specializes in luxury residential sales and investment properties. His track record includes a 96% sale-to-list ratio, 28-day median days on market, and 24% of sales closing at or above asking price. Whether you're buying, selling, or investing in North County San Diego's most sought-after coastal and canyon communities, Radley delivers data-driven pricing strategy and hands-on guidance from pre-listing preparation through closing and beyond. Licensed in California (#02041346) and Washington State. Member of the San Diego Association of REALTORS®.`,
      },
    ],
    instructions: [
      'Go to businessconnect.apple.com → sign in with Apple ID',
      'Search for your listing or create a new one',
      'Paste the description, set category to "Real Estate Agent"',
      'Upload your headshot as the business photo',
      'Verify via phone — Apple will call the number on file',
    ],
    additionalItems: [
      'Attributes — Appointments Only, Wheelchair Accessible, Service Animals Welcome',
      'Categories — Real Estate Agent (primary)',
      'Status — Verification in review (1-5 days) — complete once approved',
    ],
    copyFields: [
      { label: 'Phone', value: '(858) 314-9600' },
      { label: 'Website', value: 'https://ogroup.com/agents/radley-raven/' },
      { label: 'Hours', value: 'Sunday 10 AM – 5 PM | Monday–Friday 8 AM – 8 PM | Saturday 9 AM – 6 PM' },
    ],
  },
  {
    id: 'homes',
    name: 'Homes.com',
    badge: 'You Update',
    platformLink: 'https://www.homes.com',
    sections: [
      {
        title: 'Agent Bio',
        text: `Radley Raven is a luxury real estate agent serving La Jolla, Carmel Valley, Carlsbad, Rancho Santa Fe, Solana Beach, and Encinitas with 10+ years of experience and $91.7M+ in California transactions. Specializing in luxury residential sales and investment properties, Radley has helped buyers and sellers achieve results that beat the market — a 96% sale-to-list ratio, 28-day median days on market, and 24% of deals closing at or above asking price. With deep knowledge of San Diego's most sought-after coastal and canyon communities, Radley brings the local context, negotiation edge, and personal attention that complex transactions demand. Whether you're buying your first home, listing a luxury estate, or building a real estate portfolio, Radley delivers the strategy and execution to get it done. Serving the greater San Diego area and Washington State.

Radley is a licensed agent with The Oppenheim Group in La Jolla, one of the most recognized luxury brokerages in California. His clients include first-time homebuyers, move-up families, investors building rental portfolios, and sellers looking to maximize value in competitive coastal markets. Radley's approach combines data-driven pricing strategy with hands-on client guidance — from pre-listing preparation through closing and beyond. He is active throughout North County San Diego's coastal and canyon communities, with additional experience in the Washington State market. Radley holds a California real estate license (#02041346) and is a member of the San Diego Association of REALTORS®.`,
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
      'Specialties — Listing Specialist, Luxury Homes, Buyer Representation, Investment Properties',
      'Note: Homes AI launched Feb 2026 — AI-powered agent discovery. Claim ASAP.',
    ],
    copyFields: [
      { label: 'Service Areas', value: 'Carmel Valley, Carlsbad, Rancho Santa Fe, La Jolla, Solana Beach, Encinitas, Del Mar' },
      { label: 'Website', value: 'https://ogroup.com/agents/radley-raven/' },
    ],
  },
  {
    id: 'foursquare',
    name: 'Foursquare',
    badge: 'You Update',
    platformLink: 'https://foursquare.com/add-place',
    sections: [
      {
        title: 'Business Description (300 chars)',
        text: `11 closed transactions in Carmel Valley — $44.8M in a single ZIP code. Luxury real estate agent with The Oppenheim Group in La Jolla. Serving Carmel Valley, Carlsbad, Rancho Santa Fe. 28-day median DOM. 96% sale-to-list ratio. Licensed CA #02041346.`,
      },
    ],
    instructions: [
      'Go to foursquare.com/add-place or search for your existing listing first',
      'If you have an existing listing: Jett will run the optimization script automatically — no action needed',
      'If no listing found: click Add a Place, fill in the fields using the copy above',
      'Why this matters: Foursquare feeds 60-70% of ChatGPT local results directly',
    ],
    additionalItems: [
      'Business name: Radley Raven — Real Estate Agent',
      'Category: Real Estate Agent',
      'Address: 7925 Girard Ave, La Jolla, CA 92037',
      'Phone: (858) 314-9600',
      'Website: https://ogroup.com/agents/radley-raven/',
    ],
    copyFields: [
      { label: 'Business Name', value: 'Radley Raven — Real Estate Agent' },
      { label: 'Phone', value: '(858) 314-9600' },
      { label: 'Website', value: 'https://ogroup.com/agents/radley-raven/' },
      { label: 'Address', value: '7925 Girard Ave, La Jolla, CA 92037' },
    ],
  },
  {
    id: 'homelight',
    name: 'HomeLight',
    badge: 'You Update',
    platformLink: 'https://www.homelight.com/agents/radley-raven-ca-02041346',
    sections: [
      {
        title: 'Bio',
        text: `Radley Raven is a luxury listing specialist with The Oppenheim Group in La Jolla — with 11 closed transactions in the Carmel Valley 92130 corridor, $44.8M in a single ZIP code, and a 28-day median days on market. He serves Carmel Valley, Carlsbad, Rancho Santa Fe, La Jolla, Solana Beach, and Encinitas — providing buyers and sellers across North County San Diego with data-driven pricing and hands-on representation that consistently outperforms the market.`,
      },
    ],
    instructions: [
      'Go to your HomeLight profile and update the bio above',
      'Sign the referral agreement to activate lead generation (required)',
      'Upload your professional headshot',
    ],
    additionalItems: [
      'Referral Agreement — UNSIGNED (required to receive referrals — sign at homelight.com portal)',
      'Specialties: Luxury Specialist, Investment Properties, Relocations, Vacation Home, Coastal Properties',
      'Min price: $500,000',
    ],
    copyFields: [
      { label: 'Review Request URL', value: 'https://www.homelight.com/reviews/new/radley-raven-ca-02041346' },
    ],
  },
  {
    id: 'x-twitter',
    name: 'X (Twitter)',
    badge: 'Cited Posts',
    platformLink: 'https://x.com',
    sections: [
      {
        title: 'Bio (160 characters)',
        text: `Luxury listing specialist in Carmel Valley & Carlsbad | Oppenheim Group | $91M+ in coastal transactions | radleyraven.com`,
      },
      {
        title: 'Pinned Post',
        text: `Carmel Valley sellers: 28-day median DOM, 96% sale-to-list ratio, 24% of deals above asking. That's what the right pricing strategy and market timing look like.\n\nFull breakdown of what's happening in North County San Diego → radleyraven.com`,
      },
    ],
    instructions: [
      'Update your bio at x.com/settings/profile (160 char limit)',
      'Pin the post above (or your best-performing market insight) to your profile',
      'Cited will post 2-4x/month via OAuth — market updates + article shares',
      'You can post independently anytime — we coordinate, not replace',
    ],
    additionalItems: [
      'Profile photo — same professional headshot as all platforms',
      'Header image — market/lifestyle photo from Drive media library',
      'Location — "La Jolla, CA" or "North County San Diego"',
      'Website link — your satellite site URL',
      'Why X matters: Grok (xAI) uses X posts as a unique co-citation signal. No other AI engine has this.',
    ],
    copyFields: [],
  },
];

function CopyButton({ text, label = 'Copy Bio' }: { text: string; label?: string }) {
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
      {copied ? '✓ Copied!' : label}
    </button>
  );
}

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const el = document.createElement('textarea');
      el.value = value;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100 flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-0.5">{label}</div>
          <div className="text-sm text-gray-700">{value}</div>
        </div>
        <button
          onClick={handleCopy}
          className="shrink-0 text-xs font-semibold px-2.5 py-1 rounded transition-all duration-200"
          style={{
            background: copied ? '#00BFA6' : 'transparent',
            color: copied ? 'white' : '#00BFA6',
            border: `1px solid #00BFA6`,
          }}
        >
          {copied ? '✓' : 'Copy'}
        </button>
      </div>
    </div>
  );
}

const PLATFORM_STORAGE_KEYS: Record<string, string> = {
  gbp: 'cited_checklist_gbp',
  linkedin: 'cited_checklist_linkedin',
  yelp: 'cited_checklist_yelp',
};

export default function CopyKitPage() {
  const [approved, setApproved] = useState<Record<string, boolean>>({});
  const [revealedCount, setRevealedCount] = useState(1);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Pre-populate approved state from localStorage on mount
  useEffect(() => {
    const stored: Record<string, boolean> = {};
    for (const [id, key] of Object.entries(PLATFORM_STORAGE_KEYS)) {
      if (localStorage.getItem(key) === 'true') {
        stored[id] = true;
      }
    }
    if (Object.keys(stored).length > 0) {
      setApproved(prev => ({ ...prev, ...stored }));
    }
  }, []);

  const toggleApprove = (id: string, index: number) => {
    const currentlyApproved = approved[id] || false;
    const next = !currentlyApproved;
    setApproved(prev => {
      const updated = { ...prev, [id]: next };

      // Sync individual platform keys to localStorage
      if (id in PLATFORM_STORAGE_KEYS) {
        localStorage.setItem(PLATFORM_STORAGE_KEYS[id], String(next));
      }

      // When ALL platforms are approved, set the "remaining" key
      const allApproved = platforms.every(p => updated[p.id]);
      if (allApproved) {
        localStorage.setItem('cited_checklist_platforms_remaining', 'true');
      }

      return updated;
    });
    if (next) {
      setRevealedCount(prev => Math.max(prev, index + 2));
      setTimeout(() => {
        const nextCard = cardRefs.current[index + 1];
        if (nextCard) nextCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
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
            <p className="text-sm text-gray-400 mt-1">AI Citation Dashboard</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <Link href="/articles" className="text-sm text-gray-400 hover:text-white transition-colors">Articles</Link>
              <Link href="/reviews" className="text-sm text-gray-400 hover:text-white transition-colors">Reviews</Link>
              <Link href="/audit" className="text-sm text-gray-400 hover:text-white transition-colors">Audit</Link>
              <Link href="/copy-kit" className="text-sm font-semibold transition-colors" style={{ color: '#00BFA6' }}>My Citation Profiles</Link>
            </div>
            {/* Score pill */}
            <Link href="/audit" style={{ textDecoration: 'none' }}>
              <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: '8px', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#DC2626', lineHeight: 1 }}>5</div>
                  <div style={{ fontSize: '9px', color: '#4a6380', letterSpacing: '0.5px' }}>/ 100</div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: '#00BFA6', letterSpacing: '1px', textTransform: 'uppercase' }}>Foundation Score</div>
                  <div style={{ fontSize: '9px', color: '#4a6380' }}>+2 pts · Day 13 · Apr 8</div>
                </div>
              </div>
            </Link>
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
          <h2 className="text-3xl font-bold" style={{ color: '#0A1929' }}>Your Citation Profiles</h2>
          <p className="text-gray-500 mt-2 max-w-2xl">
            Review your Citation Profiles for each platform, paste them in, and post them. Each card has a direct link to open the platform, copy button at top, and paste-ready fields for everything you need. Platforms ordered by AI citation impact — start with GBP and LinkedIn.
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
                ref={el => { cardRefs.current[index] = el; }}
                className="transition-all duration-500 overflow-hidden"
                style={{
                  maxHeight: isVisible ? '4000px' : '0px',
                  opacity: isVisible ? 1 : 0,
                  marginBottom: isVisible ? undefined : '0',
                }}
              >
                <div
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                  style={isApproved ? { borderColor: '#00BFA6', borderWidth: 2, backgroundColor: '#f0fdf9' } : {}}
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
                      <a
                        href={platform.platformLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-gray-400 hover:text-teal-400 transition-colors"
                      >
                        →
                      </a>
                    </div>
                    <div className="flex items-center gap-3">
                      {isApproved && (
                        <span className="text-sm font-semibold" style={{ color: '#00BFA6' }}>✓ Reviewed &amp; Posted</span>
                      )}
                      {platform.id !== 'linkedin' && (
                        <CopyButton text={allText} />
                      )}
                      {platform.id === 'linkedin' && (
                        <CopyButton text={allText} label="Copy All" />
                      )}
                    </div>
                  </div>

                  <div className="px-6 py-5 space-y-4">
                    {/* Bio Sections */}
                    {platform.sections.map((section, i) => (
                      <div key={i}>
                        {platform.id === 'linkedin' ? (
                          <div className="flex items-center justify-between mb-1">
                            {section.title && (
                              <div className="text-xs font-bold uppercase tracking-wider text-gray-400">
                                {section.title}
                              </div>
                            )}
                            <CopyButton
                              text={section.text}
                              label={section.title === 'Headline' ? 'Copy Headline' : 'Copy About'}
                            />
                          </div>
                        ) : (
                          section.title && (
                            <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                              {section.title}
                            </div>
                          )
                        )}
                        <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 leading-relaxed border border-gray-100 whitespace-pre-wrap">
                          {section.text}
                        </div>
                      </div>
                    ))}

                    {/* Paste-ready fields */}
                    {platform.copyFields && platform.copyFields.length > 0 && (
                      <div className="space-y-2">
                        {platform.copyFields.map((field, i) => (
                          <CopyField key={i} label={field.label} value={field.value} />
                        ))}
                      </div>
                    )}

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
                    <div className="pt-2 space-y-2">
                      <div
                        className={`flex items-center gap-3 rounded-lg p-3 cursor-pointer select-none transition-colors ${isApproved ? 'bg-teal-50' : 'bg-gray-50'}`}
                        onClick={() => toggleApprove(platform.id, index)}
                      >
                        <div
                          className="flex items-center justify-center shrink-0 transition-colors"
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 6,
                            ...(isApproved
                              ? { background: '#00BFA6' }
                              : { border: '2px solid #D4A830', background: 'white' }),
                          }}
                        >
                          {isApproved && (
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span className="font-semibold text-base" style={{ color: isApproved ? '#00BFA6' : '#374151' }}>
                          {isApproved ? 'Posted ✓' : 'Mark as posted to this platform'}
                        </span>
                      </div>
                      <div className="flex items-center justify-end">
                        <button
                          onClick={() => setRevealedCount(prev => Math.max(prev, index + 2))}
                          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          Skip for now →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-10 text-center text-sm text-gray-400">
          Cited · AI Citation Optimization™ for Professionals · citedagent.com · Powered by PRISM™
        </div>
      </main>
    </div>
  );
}
