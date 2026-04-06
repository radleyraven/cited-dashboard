"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

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
  reviewPlatforms: string[];
  reviewOther: string;
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
  reviewPlatforms: [],
  reviewOther: "",
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

      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#fff" }}>
        <div className="max-w-lg w-full text-center">
          <div
            className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
            style={{ background: "#00BFA6" }}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-4" style={{ color: "#0A1929" }}>
            Thank You!
          </h1>
          <p className="text-lg mb-2" style={{ color: "#0A1929" }}>
            Your intake is complete.
          </p>
          <p className="mb-6" style={{ color: "#555" }}>
            Your full Citation Score audit begins now and will be delivered within 24–72 hours. We will be in touch.
          </p>
          <div className="rounded-lg p-4 inline-block" style={{ background: "#F0FDF9", border: "1px solid #00BFA6" }}>
            <p className="text-sm font-medium" style={{ color: "#00BFA6" }}>
              Submission received
            </p>
          </div>
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
            <Field label="Primary markets you serve — cities" required>
              <textarea
                required
                rows={3}
                value={form.primaryMarkets}
                onChange={(e) => set("primaryMarkets", e.target.value)}
                className={`${inputClass} ${inputFocusRing}`}
                style={inputStyle}
              />
            </Field>
            <Field label="Specific neighborhoods within those markets">
              <textarea
                rows={3}
                placeholder="e.g., Rancho Pacifica, La Costa Oaks, Bird Rock"
                value={form.neighborhoods}
                onChange={(e) => set("neighborhoods", e.target.value)}
                className={`${inputClass} ${inputFocusRing}`}
                style={inputStyle}
              />
            </Field>
            <Field label="How many years in your market?">
              <input
                type="text"
                value={form.yearsInMarket}
                onChange={(e) => set("yearsInMarket", e.target.value)}
                className={`${inputClass} ${inputFocusRing}`}
                style={inputStyle}
              />
            </Field>
          </Section>

          {/* Section 3 */}
          <Section number={3} title="Your Story">
            <Field label="Top 3–5 transactions you are most proud of">
              <textarea
                rows={4}
                value={form.topTransactions}
                onChange={(e) => set("topTransactions", e.target.value)}
                className={`${inputClass} ${inputFocusRing}`}
                style={inputStyle}
              />
            </Field>
            <Field label="What makes you different from other agents in your market?" required>
              <textarea
                required
                rows={4}
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

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg py-4 text-white font-semibold text-base transition-opacity disabled:opacity-60"
            style={{ background: "#00BFA6" }}
          >
            {submitting ? "Submitting..." : "Submit Intake Form"}
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

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-1" style={{ color: "#0A1929" }}>
        {label}
        {required && <span style={{ color: "#DC2626" }}> *</span>}
      </span>
      {children}
    </label>
  );
}
