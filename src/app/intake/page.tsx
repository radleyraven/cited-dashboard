"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
const supabase = createSupabaseBrowserClient();

type FormData = {
  fullName: string;
  email: string;
  phone: string;
  brokerage: string;
  title: string;
  licenseNumber: string;
  primaryMarkets: string;
  neighborhoods: string;
  yearsInMarket: string;
  topTransactions: string;
  differentiator: string;
  mlsFile: File | null;
  reviewPlatforms: string[];
  reviewOther: string;
  termsAccepted: boolean;
  // Platforms ordered by PRISM priority
  linkedinUrl: string;
  zillowUrl: string;
  yelpUrl: string;
  realtorUrl: string;
  fastexpertUrl: string;
  homelightUrl: string;
  websiteUrl: string;
  youtubeUrl: string;
  // Optional channels
  instagramHandle: string;
  otherPlatforms: string;
  gbpStatus: "" | "added" | "no-gbp";
};

const initialForm: FormData = {
  fullName: "",
  email: "",
  phone: "",
  brokerage: "",
  title: "",
  licenseNumber: "",
  primaryMarkets: "",
  neighborhoods: "",
  yearsInMarket: "",
  topTransactions: "",
  differentiator: "",
  mlsFile: null,
  reviewPlatforms: [],
  reviewOther: "",
  termsAccepted: false,
  linkedinUrl: "",
  zillowUrl: "",
  yelpUrl: "",
  realtorUrl: "",
  fastexpertUrl: "",
  homelightUrl: "",
  websiteUrl: "",
  youtubeUrl: "",
  instagramHandle: "",
  otherPlatforms: "",
  gbpStatus: "",
};

const REVIEW_OPTIONS = [
  "Google Business Profile",
  "Zillow",
  "Yelp",
  "Realtor.com",
  "FastExpert",
  "HomeLight",
];

function IntakeForm() {
  const searchParams = useSearchParams();
  // Hide MLS upload for CA/WA RE agents — Radley pulls MLS data directly
  const hideMLSUpload = searchParams.get('hideMLSUpload') === 'true';

  const [form, setForm] = useState<FormData>(() => {
    // Pre-fill from URL params (passed from score page audit data)
    return {
      ...initialForm,
      fullName: searchParams.get('fullName') || '',
      email: searchParams.get('email') || '',
      brokerage: searchParams.get('brokerage') || '',
      primaryMarkets: searchParams.get('primaryMarkets') || '',
      zillowUrl: searchParams.get('zillowUrl') || '',
      linkedinUrl: searchParams.get('linkedinUrl') || '',
      yelpUrl: searchParams.get('yelpUrl') || '',
      realtorUrl: searchParams.get('realtorUrl') || '',
      fastexpertUrl: searchParams.get('fastexpertUrl') || '',
      websiteUrl: searchParams.get('websiteUrl') || '',
      youtubeUrl: searchParams.get('youtubeUrl') || '',
      yearsInMarket: searchParams.get('yearsInMarket') || '',
      topTransactions: searchParams.get('topTransactions') || '',
    };
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleReviewPlatform(platform: string) {
    setForm((prev) => {
      const platforms = prev.reviewPlatforms.includes(platform)
        ? prev.reviewPlatforms.filter((p) => p !== platform)
        : [...prev.reviewPlatforms, platform];
      return { ...prev, reviewPlatforms: platforms };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Submission failed");
      }

      // Upload MLS file to Supabase Storage — non-blocking, intake already saved.
      if (form.mlsFile) {
        try {
          const supabaseStorage = createSupabaseBrowserClient();
          const fileName = `${form.email}/${Date.now()}-${form.mlsFile.name}`;
          await supabaseStorage.storage.from('mls-uploads').upload(fileName, form.mlsFile, {
            cacheControl: '3600',
            upsert: false,
          });
        } catch {
          // Don't block on upload error — intake is already saved
          console.warn('MLS file upload failed — intake was still saved.');
        }
      }

      // Send magic link — non-blocking. Intake is already saved above.
      try {
        await supabase.auth.signInWithOtp({
          email: form.email.trim(),
          options: {
            emailRedirectTo: "https://citedagent.com/auth/callback?next=/",
          },
        });
      } catch {
        // Auth failure is non-fatal — intake was saved, user can log in later.
        console.warn("Magic link send failed — intake was still saved.");
      }

      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#0A1929" }}>
        <div className="max-w-lg w-full text-center">
          {/* Teal check circle */}
          <div
            className="w-20 h-20 rounded-full mx-auto mb-8 flex items-center justify-center"
            style={{ background: "rgba(0,191,166,0.15)", border: "2px solid #00BFA6" }}
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#00BFA6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <h1 style={{ fontSize: "32px", fontWeight: 800, color: "#fff", margin: "0 0 12px", letterSpacing: "-0.5px" }}>
            You&apos;re in. 🎉
          </h1>

          <p style={{ fontSize: "16px", color: "#00BFA6", fontWeight: 600, margin: "0 0 24px" }}>
            Welcome to Cited.
          </p>

          <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "24px", marginBottom: "24px", textAlign: "left" }}>
            <div style={{ display: "flex", gap: "12px", marginBottom: "14px", alignItems: "flex-start" }}>
              <span style={{ color: "#00BFA6", fontWeight: 700, flexShrink: 0 }}>→</span>
              <p style={{ fontSize: "14px", color: "#cbd5e1", lineHeight: 1.7, margin: 0 }}>
                <strong style={{ color: "#fff" }}>Your bios are being built now.</strong> Optimized profiles for Google, LinkedIn, Zillow, Yelp, and Realtor.com — ready within 72 hours.
              </p>
            </div>
            <div style={{ display: "flex", gap: "12px", marginBottom: "14px", alignItems: "flex-start" }}>
              <span style={{ color: "#00BFA6", fontWeight: 700, flexShrink: 0 }}>→</span>
              <p style={{ fontSize: "14px", color: "#cbd5e1", lineHeight: 1.7, margin: 0 }}>
                <strong style={{ color: "#fff" }}>Check your email</strong> — your dashboard access link is on its way.
              </p>
            </div>
            <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
              <span style={{ color: "#00BFA6", fontWeight: 700, flexShrink: 0 }}>→</span>
              <p style={{ fontSize: "14px", color: "#cbd5e1", lineHeight: 1.7, margin: 0 }}>
                We&apos;ll be in touch personally within 24 hours.
              </p>
            </div>
          </div>

          <p style={{ fontSize: "12px", color: "#4a6380" }}>
            Cited · AI Visibility for Real Estate Professionals · citedagent.com
          </p>
        </div>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-lg border px-4 py-3 text-sm outline-none transition-colors focus:ring-2";
  const inputStyle = {
    borderColor: "#D1D5DB",
    color: "#0A1929",
    background: "#FAFAFA",
  };
  const inputFocusRing = "focus:ring-[#00BFA6]/30 focus:border-[#00BFA6]";

  return (
    <div className="min-h-screen" style={{ background: "#fff" }}>
      {/* Header */}
      <header className="py-8" style={{ background: "#0A1929" }}>
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: "#00BFA6" }}>
            CITED
          </h1>
          <p className="mt-1 text-sm" style={{ color: "#94A3B8" }}>
            Client Intake Form
          </p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10">
        <p className="mb-8 text-sm" style={{ color: "#555" }}>
          Complete the form below so we can build your personalized AI visibility strategy.
          Fields marked with <span style={{ color: "#DC2626" }}>*</span> are required.
        </p>

        {error && (
          <div className="mb-6 rounded-lg p-4 text-sm" style={{ background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Section 1 */}
          <Section number={1} title="Contact Information">
            <Field label="Full Name" required>
              <input
                type="text"
                required
                value={form.fullName}
                onChange={(e) => set("fullName", e.target.value)}
                className={`${inputClass} ${inputFocusRing}`}
                style={inputStyle}
              />
            </Field>
            <Field label="Email" required>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                className={`${inputClass} ${inputFocusRing}`}
                style={inputStyle}
              />
            </Field>
            <Field label="Phone" required>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                className={`${inputClass} ${inputFocusRing}`}
                style={inputStyle}
              />
            </Field>
            <Field label="Brokerage / Company" required>
              <input
                type="text"
                required
                value={form.brokerage}
                onChange={(e) => set("brokerage", e.target.value)}
                className={`${inputClass} ${inputFocusRing}`}
                style={inputStyle}
              />
            </Field>
            <Field label="Title / Role">
              <input
                type="text"
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                className={`${inputClass} ${inputFocusRing}`}
                style={inputStyle}
              />
            </Field>
            <Field label="License #" required>
              <input
                type="text"
                required
                value={form.licenseNumber}
                onChange={(e) => set("licenseNumber", e.target.value)}
                className={`${inputClass} ${inputFocusRing}`}
                style={inputStyle}
              />
            </Field>
          </Section>

          {/* Section 2 */}
          <Section number={2} title="Markets & Neighborhoods">
            <Field label="Primary markets you serve — cities" required hint="List the cities or areas where you actively work. This is how we target your AI visibility.">
              <textarea
                required
                rows={2}
                placeholder="e.g., Carlsbad, Encinitas, Solana Beach"
                value={form.primaryMarkets}
                onChange={(e) => set("primaryMarkets", e.target.value)}
                className={`${inputClass} ${inputFocusRing}`}
                style={inputStyle}
              />
            </Field>
            <Field label="Specific neighborhoods within those markets" hint="The more specific, the better. These feed directly into your AI query targeting.">
              <textarea
                rows={2}
                placeholder="e.g., Rancho Pacifica, La Costa Oaks, Bird Rock, Aviara"
                value={form.neighborhoods}
                onChange={(e) => set("neighborhoods", e.target.value)}
                className={`${inputClass} ${inputFocusRing}`}
                style={inputStyle}
              />
            </Field>
            <Field label="How many years in your market?">
              <input
                type="text"
                placeholder="e.g., 7"
                value={form.yearsInMarket}
                onChange={(e) => set("yearsInMarket", e.target.value)}
                className={`${inputClass} ${inputFocusRing}`}
                style={inputStyle}
              />
            </Field>
          </Section>

          {/* Section 3 */}
          <Section number={3} title="Your Story">
            <Field label="Top 3–5 transactions you are most proud of" hint="Address, sale price, and one sentence on why it was notable. These become the proof points in your AI-optimized bio.">
              <textarea
                rows={4}
                placeholder="e.g., 4656 Whispering Woods Ct, Carlsbad — $2.1M, multiple offers, sold in 6 days&#10;7452 Neptune Ave, Carlsbad — $3.4M luxury listing, represented seller&#10;14473 Emerald Ridge, RSF — $4.8M, off-market deal"
                value={form.topTransactions}
                onChange={(e) => set("topTransactions", e.target.value)}
                className={`${inputClass} ${inputFocusRing}`}
                style={inputStyle}
              />
            </Field>
            {!hideMLSUpload && (
              <Field label="Upload your MLS transaction history" hint="CSV, PDF, or Excel from your MLS. We'll extract DOM, deal concentration, volume trends, and positioning data — no formatting needed.">
                <label style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  border: '1px solid #D1D5DB', borderRadius: '8px',
                  padding: '12px 16px', cursor: 'pointer',
                  background: '#FAFAFA', transition: 'border-color 0.15s'
                }}>
                  <input
                    type="file"
                    accept=".csv,.pdf,.xlsx,.xls"
                    style={{ display: 'none' }}
                    onChange={(e) => set('mlsFile', e.target.files?.[0] ?? null)}
                  />
                  <span style={{ fontSize: '20px' }}>📎</span>
                  <span style={{ fontSize: '14px', color: form.mlsFile ? '#0A1929' : '#94a3b8' }}>
                    {form.mlsFile ? form.mlsFile.name : 'Choose file or drag and drop'}
                  </span>
                </label>
              </Field>
            )}
            <Field label="What makes you different from other agents in your market?" required hint="2–3 sentences is perfect. Think: your specialty, your market knowledge, or how you work with clients.">
              <textarea
                required
                rows={3}
                placeholder="e.g., I specialize in luxury listings in Carlsbad and La Costa. I've lived here for 15 years and know every neighborhood intimately. Clients tell me I'm calm under pressure and always available."
                value={form.differentiator}
                onChange={(e) => set("differentiator", e.target.value)}
                className={`${inputClass} ${inputFocusRing}`}
                style={inputStyle}
              />
            </Field>
          </Section>

          {/* Section 4 */}
          <Section number={4} title="Review Preferences">
            <p className="text-sm mb-3" style={{ color: "#555" }}>
              Where would you like us to help drive reviews?
            </p>
            <div className="space-y-2">
              {REVIEW_OPTIONS.map((platform) => (
                <label key={platform} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.reviewPlatforms.includes(platform)}
                    onChange={() => toggleReviewPlatform(platform)}
                    className="w-4 h-4 rounded"
                    style={{ accentColor: "#00BFA6" }}
                  />
                  <span className="text-sm" style={{ color: "#0A1929" }}>{platform}</span>
                </label>
              ))}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.reviewPlatforms.includes("Other")}
                  onChange={() => toggleReviewPlatform("Other")}
                  className="w-4 h-4 rounded"
                  style={{ accentColor: "#00BFA6" }}
                />
                <span className="text-sm" style={{ color: "#0A1929" }}>Other</span>
              </label>
              {form.reviewPlatforms.includes("Other") && (
                <input
                  type="text"
                  placeholder="Please specify"
                  value={form.reviewOther}
                  onChange={(e) => set("reviewOther", e.target.value)}
                  className={`${inputClass} ${inputFocusRing} ml-7`}
                  style={{ ...inputStyle, width: "calc(100% - 1.75rem)" }}
                />
              )}
            </div>
          </Section>

          {/* Section 5 — Platforms ordered by PRISM priority */}
          <Section number={5} title="Existing Platform Presence">
            <p className="text-sm mb-4" style={{ color: "#64748b" }}>
              Share any profiles you already have. We&apos;ll optimize them — or build them from scratch if they&apos;re missing.
            </p>
            <Field label="LinkedIn profile URL">
              <input type="url" value={form.linkedinUrl} onChange={(e) => set("linkedinUrl", e.target.value)} className={`${inputClass} ${inputFocusRing}`} style={inputStyle} placeholder="https://linkedin.com/in/..." />
            </Field>
            <Field label="Zillow profile URL">
              <input type="url" value={form.zillowUrl} onChange={(e) => set("zillowUrl", e.target.value)} className={`${inputClass} ${inputFocusRing}`} style={inputStyle} placeholder="https://zillow.com/profile/..." />
            </Field>
            <Field label="Yelp profile URL">
              <input type="url" value={form.yelpUrl} onChange={(e) => set("yelpUrl", e.target.value)} className={`${inputClass} ${inputFocusRing}`} style={inputStyle} placeholder="https://yelp.com/biz/..." />
            </Field>
            <Field label="Realtor.com profile URL">
              <input type="url" value={form.realtorUrl} onChange={(e) => set("realtorUrl", e.target.value)} className={`${inputClass} ${inputFocusRing}`} style={inputStyle} placeholder="https://realtor.com/realestateagents/..." />
            </Field>
            <Field label="FastExpert profile URL">
              <input type="url" value={form.fastexpertUrl} onChange={(e) => set("fastexpertUrl", e.target.value)} className={`${inputClass} ${inputFocusRing}`} style={inputStyle} placeholder="https://fastexpert.com/agents/..." />
            </Field>
            <Field label="HomeLight profile URL">
              <input type="url" value={form.homelightUrl} onChange={(e) => set("homelightUrl", e.target.value)} className={`${inputClass} ${inputFocusRing}`} style={inputStyle} placeholder="https://homelight.com/..." />
            </Field>
            <Field label="Personal website URL">
              <input type="url" value={form.websiteUrl} onChange={(e) => set("websiteUrl", e.target.value)} className={`${inputClass} ${inputFocusRing}`} style={inputStyle} placeholder="https://" />
            </Field>
            <Field label="YouTube channel URL">
              <input type="url" value={form.youtubeUrl} onChange={(e) => set("youtubeUrl", e.target.value)} className={`${inputClass} ${inputFocusRing}`} style={inputStyle} placeholder="https://" />
            </Field>

            {/* Optional channels */}
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
              <p className="text-xs font-semibold mb-3" style={{ color: '#94a3b8', letterSpacing: '1px', textTransform: 'uppercase' }}>Optional — Additional Channels</p>
              <Field label="Instagram handle">
                <input type="text" value={form.instagramHandle} onChange={(e) => set("instagramHandle", e.target.value)} className={`${inputClass} ${inputFocusRing}`} style={inputStyle} placeholder="@yourhandle" />
              </Field>
              <Field label="Any other platforms or profiles">
                <textarea rows={2} value={form.otherPlatforms} onChange={(e) => set("otherPlatforms", e.target.value)} className={`${inputClass} ${inputFocusRing}`} style={inputStyle} placeholder="Bing Places, Apple Business, Expertise.com, etc." />
              </Field>
            </div>
          </Section>

          {/* GBP Access — removed from intake. Requested separately after Day 1 affirm text. */}

          {/* Legal footer links */}
          <div style={{ textAlign: 'center', fontSize: '12px', color: '#94a3b8', paddingBottom: '4px' }}>
            <a href="/privacy" style={{ color: '#64748b', textDecoration: 'none', marginRight: '16px' }}>Privacy Policy</a>
            <a href="/terms" style={{ color: '#64748b', textDecoration: 'none' }}>Terms of Service</a>
          </div>

          {/* Terms of Service */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              required
              checked={form.termsAccepted}
              onChange={(e) => set("termsAccepted", e.target.checked)}
              className="w-4 h-4 rounded mt-0.5 shrink-0"
              style={{ accentColor: "#00BFA6" }}
            />
            <span className="text-sm" style={{ color: "#0A1929" }}>
              I agree to Cited&apos;s{" "}
              <a href="/terms" style={{ color: "#00BFA6", textDecoration: "underline" }}>
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="/privacy" style={{ color: "#00BFA6", textDecoration: "underline" }}>
                Privacy Policy
              </a>
              , and understand the first 90 days are free.
            </span>
          </label>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || !form.termsAccepted}
            className="w-full rounded-lg py-4 text-white font-semibold text-base transition-opacity disabled:opacity-60"
            style={{ background: "#00BFA6" }}
          >
            {submitting ? "Submitting..." : "Submit & Create My Account"}
          </button>
        </form>
      </main>
    </div>
  );
}

export default function IntakePage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', color: '#64748b' }}>Loading...</div>}>
      <IntakeForm />
    </Suspense>
  );
}

/* ── Helper Components ── */

function Section({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-center gap-3 mb-5">
        <span
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
          style={{ background: "#00BFA6", color: "#fff" }}
        >
          {number}
        </span>
        <h2 className="text-lg font-bold" style={{ color: "#0A1929" }}>
          {title}
        </h2>
      </div>
      <div className="space-y-4 pl-11">{children}</div>
    </section>
  );
}

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-1" style={{ color: "#0A1929" }}>
        {label}
        {required && <span style={{ color: "#DC2626" }}> *</span>}
      </span>
      {hint && <span className="block text-xs mb-2" style={{ color: "#94a3b8" }}>{hint}</span>}
      {children}
    </label>
  );
}
