"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

/* ═══════════════════════════════════════════════════════════════
   CITED Intake Form — Progressive Disclosure (Template 17)
   15 cards, cognitive effort sequencing, pre-fill, conditional logic
   Built: April 8, 2026 | Spec: references/cited-intake-config.md
   ═══════════════════════════════════════════════════════════════ */

// ── Types ──────────────────────────────────────────────────────

type FormData = {
  fullName: string;
  email: string;
  phone: string;
  brokerage: string;
  title: string;
  licenseNumber: string;
  brokerageAddress: string;
  yearsInMarket: string;
  primaryMarkets: string;
  primaryMarketZip: string;
  neighborhoods: string;
  brokerageProfileUrl: string;
  personalWebsiteUrl: string;
  audienceFocus: string;
  differentiator: string;
  voiceCapture: string;
  transaction1: string;
  transaction2: string;
  transaction3: string;
  mlsFile: File | null;
  headshotFile: File | null;
  landscapeFile: File | null;
  // Platforms — Y/N/NotSure + URL
  gbpStatus: string;
  linkedinUrl: string;
  linkedinStatus: string;
  yelpUrl: string;
  yelpStatus: string;
  zillowUrl: string;
  zillowStatus: string;
  realtorUrl: string;
  realtorStatus: string;
  youtubeUrl: string;
  youtubeStatus: string;
  fastexpertUrl: string;
  fastexpertStatus: string;
  additionalPlatforms: string;
  reviewPlatforms: string[];
  reviewOther: string;
  termsAccepted: boolean;
  skippedFields: string[];
};

const STORAGE_KEY = "cited-intake-progress";
const TOTAL_CARDS = 15;

// ── Card definitions ───────────────────────────────────────────

type CardDef = {
  id: number;
  title: string;
  phase: string;
  type: string;
  skippable: boolean;
};

const CARDS: CardDef[] = [
  { id: 1, title: "Your Identity", phase: "momentum", type: "confirm", skippable: false },
  { id: 2, title: "Your Practice", phase: "momentum", type: "confirm", skippable: false },
  { id: 3, title: "", phase: "momentum", type: "reward", skippable: false },
  { id: 4, title: "Your Markets", phase: "context", type: "input", skippable: false },
  { id: 5, title: "Online Presence", phase: "context", type: "input", skippable: true },
  { id: 6, title: "Your Audience", phase: "context", type: "choice", skippable: false },
  { id: 7, title: "", phase: "context", type: "reward", skippable: false },
  { id: 8, title: "What Makes You Different", phase: "depth", type: "thinking", skippable: true },
  { id: 9, title: "Your Voice", phase: "depth", type: "thinking", skippable: true },
  { id: 10, title: "Your Best Work", phase: "depth", type: "thinking", skippable: true },
  { id: 11, title: "Your Photos", phase: "media", type: "upload", skippable: true },
  { id: 12, title: "Platform Presence", phase: "platforms", type: "platform", skippable: true },
  { id: 13, title: "Review Preferences", phase: "close", type: "choice", skippable: true },
  { id: 14, title: "Review & Submit", phase: "close", type: "summary", skippable: false },
  { id: 15, title: "", phase: "close", type: "celebration", skippable: false },
];

const REVIEW_OPTIONS = ["Google Business Profile", "Yelp", "Zillow", "Realtor.com"];

// ── Helper: count pre-filled fields ────────────────────────────

function countPreFilled(form: FormData): number {
  let count = 0;
  if (form.fullName) count++;
  if (form.email) count++;
  if (form.brokerage) count++;
  if (form.primaryMarkets) count++;
  if (form.linkedinUrl) count++;
  if (form.zillowUrl) count++;
  if (form.yelpUrl) count++;
  if (form.realtorUrl) count++;
  if (form.fastexpertUrl) count++;
  if (form.brokerageAddress) count++;
  if (form.youtubeUrl) count++;
  return count;
}

// ── Google Sign In Button ──────────────────────────────────────

function GoogleSignInButton({ redirectTo }: { redirectTo: string }) {
  const handleGoogleSignIn = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
  };
  return (
    <button onClick={handleGoogleSignIn} style={{
      display: "flex", alignItems: "center", justifyContent: "center", gap: "12px",
      width: "100%", padding: "14px 24px", background: "#00BFA6", border: "none",
      borderRadius: "8px", fontSize: "15px", fontWeight: 700, color: "#fff", cursor: "pointer",
    }}>
      <svg width="20" height="20" viewBox="0 0 24 24">
        <path fill="rgba(255,255,255,0.9)" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="rgba(255,255,255,0.9)" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="rgba(255,255,255,0.9)" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="rgba(255,255,255,0.9)" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      Continue to Dashboard with Google
    </button>
  );
}

// ── Main Form Component ────────────────────────────────────────

function IntakeForm() {
  const searchParams = useSearchParams();

  // Initialize form with pre-fill from URL params
  const [form, setForm] = useState<FormData>(() => {
    // Try localStorage first (resume)
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          // Restore everything except File objects
          return { ...getInitialForm(searchParams), ...parsed, mlsFile: null, headshotFile: null, landscapeFile: null };
        }
      } catch { /* ignore */ }
    }
    return getInitialForm(searchParams);
  });

  const [currentCard, setCurrentCard] = useState<number>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY + "-card");
        if (saved) return parseInt(saved, 10) || 1;
      } catch { /* ignore */ }
    }
    return 1;
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [animating, setAnimating] = useState(false);
  const [slideDir, setSlideDir] = useState<"forward" | "back">("forward");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const preFillCount = countPreFilled(form);
  const progressPercent = Math.max(7, Math.round(((currentCard - 1 + (preFillCount > 0 ? 1 : 0)) / TOTAL_CARDS) * 100));

  // Auto-save to localStorage on every change
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const { mlsFile, headshotFile, landscapeFile, ...saveable } = form;
      void mlsFile; void headshotFile; void landscapeFile;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saveable));
      localStorage.setItem(STORAGE_KEY + "-card", String(currentCard));
    } catch { /* ignore */ }
  }, [form, currentCard]);

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const addSkipped = useCallback((field: string) => {
    setForm((prev) => ({
      ...prev,
      skippedFields: prev.skippedFields.includes(field) ? prev.skippedFields : [...prev.skippedFields, field],
    }));
  }, []);

  // ── Navigation ─────────────────────────────────────────────

  function goToCard(target: number, direction: "forward" | "back" = "forward") {
    if (animating) return;
    setSlideDir(direction);
    setAnimating(true);
    setValidationErrors([]);
    setTimeout(() => {
      setCurrentCard(target);
      setAnimating(false);
    }, 150);
  }

  function next() {
    const errors = validateCard(currentCard, form);
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }
    setValidationErrors([]);
    goToCard(currentCard + 1, "forward");
  }

  function back() {
    if (currentCard > 1) goToCard(currentCard - 1, "back");
  }

  function skip(field?: string) {
    if (field) addSkipped(field);
    goToCard(currentCard + 1, "forward");
  }

  function goToCardDirect(cardId: number) {
    goToCard(cardId, cardId < currentCard ? "back" : "forward");
  }

  // ── Validation (on advance only — Silver's pattern) ────────

  function validateCard(cardId: number, f: FormData): string[] {
    const errs: string[] = [];
    switch (cardId) {
      case 1:
        if (!f.fullName.trim()) errs.push("Full name is required");
        if (!f.email.trim()) errs.push("Email is required");
        if (f.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) errs.push("Enter a valid email address");
        break;
      case 2:
        if (!f.brokerage.trim()) errs.push("Brokerage name is required");
        if (!f.licenseNumber.trim()) errs.push("License number is required (CA DRE compliance)");
        break;
      case 4:
        if (!f.primaryMarkets.trim()) errs.push("At least one primary market is required");
        break;
      case 6:
        if (!f.audienceFocus) errs.push("Please select your audience focus");
        break;
      case 14:
        if (!f.termsAccepted) errs.push("Please accept the Terms of Service and Privacy Policy");
        break;
    }
    return errs;
  }

  // ── Submit ─────────────────────────────────────────────────

  async function handleSubmit() {
    const errors = validateCard(14, form);
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          brokerage: form.brokerage,
          title: form.title,
          licenseNumber: form.licenseNumber,
          brokerageAddress: form.brokerageAddress,
          yearsInMarket: form.yearsInMarket,
          primaryMarkets: form.primaryMarkets,
          primaryMarketZip: form.primaryMarketZip,
          neighborhoods: form.neighborhoods,
          brokerageProfileUrl: form.brokerageProfileUrl,
          personalWebsiteUrl: form.personalWebsiteUrl,
          audienceFocus: form.audienceFocus,
          differentiator: form.differentiator,
          voiceCapture: form.voiceCapture,
          topTransactions: [form.transaction1, form.transaction2, form.transaction3].filter(Boolean).join("\n"),
          reviewPlatforms: form.reviewPlatforms,
          reviewOther: form.reviewOther,
          gbpStatus: form.gbpStatus,
          linkedinUrl: form.linkedinUrl,
          zillowUrl: form.zillowUrl,
          yelpUrl: form.yelpUrl,
          realtorUrl: form.realtorUrl,
          fastexpertUrl: form.fastexpertUrl,
          youtubeUrl: form.youtubeUrl,
          additionalPlatforms: form.additionalPlatforms,
          skippedFields: form.skippedFields,
          intakeCompletionPct: 100,
          termsAccepted: form.termsAccepted,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Submission failed");
      }

      // Upload files (non-blocking)
      const supabase = createSupabaseBrowserClient();
      const email = form.email.trim();

      if (form.headshotFile) {
        try {
          const name = `${email}/${Date.now()}-headshot-${form.headshotFile.name}`;
          await supabase.storage.from("headshots").upload(name, form.headshotFile, { cacheControl: "3600", upsert: false });
        } catch { console.warn("Headshot upload failed — intake saved."); }
      }
      if (form.landscapeFile) {
        try {
          const name = `${email}/${Date.now()}-landscape-${form.landscapeFile.name}`;
          await supabase.storage.from("headshots").upload(name, form.landscapeFile, { cacheControl: "3600", upsert: false });
        } catch { console.warn("Landscape upload failed — intake saved."); }
      }
      if (form.mlsFile) {
        try {
          const name = `${email}/${Date.now()}-mls-${form.mlsFile.name}`;
          await supabase.storage.from("mls-uploads").upload(name, form.mlsFile, { cacheControl: "3600", upsert: false });
        } catch { console.warn("MLS upload failed — intake saved."); }
      }

      // Send magic link (non-blocking)
      try {
        await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: "https://citedagent.com/auth/callback?next=/" },
        });
      } catch { console.warn("Magic link send failed — intake saved."); }

      // Clear saved progress
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_KEY + "-card");

      setSubmitted(true);
      goToCard(15, "forward");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Render ─────────────────────────────────────────────────

  const card = CARDS[currentCard - 1];
  const isPreFilled = (val: string) => {
    // Check if value came from URL params (pre-fill)
    const paramVal = searchParams.get(urlParamMap[val as keyof typeof urlParamMap] || "");
    return !!paramVal;
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa" }}>
      {/* Progress bar */}
      {currentCard < 15 && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50 }}>
          <div style={{ height: "4px", background: "#e2e8f0" }}>
            <div style={{
              height: "100%", background: "#00BFA6",
              width: `${progressPercent}%`,
              transition: "width 0.3s ease",
            }} />
          </div>
          <div style={{
            background: "#0A1929", padding: "8px 16px",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <span style={{ color: "#00BFA6", fontSize: "13px", fontWeight: 700, letterSpacing: "1px" }}>CITED</span>
            <span style={{ color: "#94a3b8", fontSize: "12px" }}>
              Step {currentCard} of {TOTAL_CARDS - 1}{card.title ? ` — ${card.title}` : ""}
              {preFillCount > 0 && currentCard <= 2 && (
                <span style={{ color: "#00BFA6", marginLeft: "8px" }}>✅ {preFillCount} fields from your audit</span>
              )}
            </span>
          </div>
        </div>
      )}

      {/* Card container */}
      <div style={{
        maxWidth: "560px", margin: "0 auto", padding: currentCard < 15 ? "80px 16px 32px" : "0 16px",
        minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: currentCard === 15 ? "center" : "flex-start",
      }}>
        {/* Back button */}
        {currentCard > 1 && currentCard < 15 && (
          <button onClick={back} style={{
            background: "none", border: "none", color: "#64748b", fontSize: "13px",
            cursor: "pointer", padding: "8px 0", marginBottom: "8px", textAlign: "left",
          }}>
            ← Back
          </button>
        )}

        {/* Validation errors */}
        {validationErrors.length > 0 && (
          <div style={{
            background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "8px",
            padding: "12px 16px", marginBottom: "16px",
          }}>
            {validationErrors.map((err, i) => (
              <p key={i} style={{ color: "#DC2626", fontSize: "13px", margin: i > 0 ? "4px 0 0" : 0 }}>{err}</p>
            ))}
          </div>
        )}

        {error && (
          <div style={{
            background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "8px",
            padding: "12px 16px", marginBottom: "16px",
          }}>
            <p style={{ color: "#DC2626", fontSize: "13px", margin: 0 }}>{error}</p>
          </div>
        )}

        {/* Card content with animation */}
        <div style={{
          background: card?.type === "celebration" ? "transparent" : "#fff",
          borderRadius: card?.type === "celebration" ? 0 : "16px",
          boxShadow: card?.type === "celebration" ? "none" : "0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)",
          padding: card?.type === "celebration" ? 0 : "32px 28px",
          opacity: animating ? 0 : 1,
          transform: animating ? (slideDir === "forward" ? "translateY(12px)" : "translateY(-12px)") : "translateY(0)",
          transition: "opacity 0.15s ease, transform 0.15s ease",
        }}>
          {renderCard(currentCard, form, set, next, skip, handleSubmit, submitting, submitted, goToCardDirect, searchParams)}
        </div>
      </div>
    </div>
  );
}

// ── URL param mapping for pre-fill detection ───────────────────

const urlParamMap: Record<string, string> = {
  fullName: "fullName", email: "email", brokerage: "brokerage",
  primaryMarkets: "primaryMarkets", linkedinUrl: "linkedinUrl",
  zillowUrl: "zillowUrl", yelpUrl: "yelpUrl", realtorUrl: "realtorUrl",
  fastexpertUrl: "fastexpertUrl", youtubeUrl: "youtubeUrl",
  brokerageAddress: "brokerageAddress",
};

// ── Initial form from URL params ───────────────────────────────

function getInitialForm(sp: ReturnType<typeof useSearchParams>): FormData {
  return {
    fullName: sp.get("fullName") || "",
    email: sp.get("email") || "",
    phone: "",
    brokerage: sp.get("brokerage") || "",
    title: "",
    licenseNumber: "",
    brokerageAddress: sp.get("brokerageAddress") || "",
    yearsInMarket: sp.get("yearsInMarket") || "",
    primaryMarkets: sp.get("primaryMarkets") || "",
    primaryMarketZip: "",
    neighborhoods: "",
    brokerageProfileUrl: sp.get("brokerageProfileUrl") || "",
    personalWebsiteUrl: sp.get("personalWebsiteUrl") || "",
    audienceFocus: "",
    differentiator: "",
    voiceCapture: "",
    transaction1: "",
    transaction2: "",
    transaction3: "",
    mlsFile: null,
    headshotFile: null,
    landscapeFile: null,
    gbpStatus: "",
    linkedinUrl: sp.get("linkedinUrl") || "",
    linkedinStatus: sp.get("linkedinUrl") ? "yes" : "",
    yelpUrl: sp.get("yelpUrl") || "",
    yelpStatus: sp.get("yelpUrl") ? "yes" : "",
    zillowUrl: sp.get("zillowUrl") || "",
    zillowStatus: sp.get("zillowUrl") ? "yes" : "",
    realtorUrl: sp.get("realtorUrl") || "",
    realtorStatus: sp.get("realtorUrl") ? "yes" : "",
    youtubeUrl: sp.get("youtubeUrl") || "",
    youtubeStatus: "",
    fastexpertUrl: sp.get("fastexpertUrl") || "",
    fastexpertStatus: sp.get("fastexpertUrl") ? "yes" : "",
    additionalPlatforms: "",
    reviewPlatforms: [],
    reviewOther: "",
    termsAccepted: false,
    skippedFields: [],
  };
}

// ── Card Renderer ──────────────────────────────────────────────

function renderCard(
  cardId: number,
  form: FormData,
  set: <K extends keyof FormData>(key: K, value: FormData[K]) => void,
  next: () => void,
  skip: (field?: string) => void,
  handleSubmit: () => void,
  submitting: boolean,
  submitted: boolean,
  goToCard: (id: number) => void,
  searchParams: ReturnType<typeof useSearchParams>,
) {
  switch (cardId) {
    // ── Card 1: Identity (Confirm) ─────────────────────────
    case 1:
      return (
        <div>
          <CardHeader title="Let&apos;s confirm your details" subtitle={searchParams.get("fullName") ? "Most of this is already filled in from your audit." : "Tell us about yourself so we can get started."} />
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <FieldGroup label="Full Name" required prefilled={!!searchParams.get("fullName")}>
              <TextInput value={form.fullName} onChange={(v) => set("fullName", v)} />
            </FieldGroup>
            <FieldGroup label="Email" required prefilled={!!searchParams.get("email")}>
              <TextInput value={form.email} onChange={(v) => set("email", v)} type="email" />
            </FieldGroup>
            <FieldGroup label="Phone" hint="Optional — we'll use email for everything important">
              <TextInput value={form.phone} onChange={(v) => set("phone", v)} type="tel" />
            </FieldGroup>
          </div>
          <NextButton onClick={next} />
        </div>
      );

    // ── Card 2: Practice (Confirm) ─────────────────────────
    case 2:
      return (
        <div>
          <CardHeader title="Your practice" subtitle="Confirm or update your brokerage details." />
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <FieldGroup label="Brokerage / Company" required prefilled={!!searchParams.get("brokerage")}>
              <TextInput value={form.brokerage} onChange={(v) => set("brokerage", v)} />
            </FieldGroup>
            <FieldGroup label="Title / Role" hint="e.g., Luxury Real Estate Agent">
              <TextInput value={form.title} onChange={(v) => set("title", v)} />
            </FieldGroup>
            <FieldGroup label="License #" required hint="CA DRE # — required on all advertising">
              <TextInput value={form.licenseNumber} onChange={(v) => set("licenseNumber", v)} />
            </FieldGroup>
            <FieldGroup label="Brokerage office address" prefilled={!!searchParams.get("brokerageAddress")}
              hint="Must match exactly across all platforms — AI uses this to verify you">
              <TextInput value={form.brokerageAddress} onChange={(v) => set("brokerageAddress", v)} />
            </FieldGroup>
            <FieldGroup label="Years in your market">
              <select value={form.yearsInMarket} onChange={(e) => set("yearsInMarket", e.target.value)}
                style={{ ...selectStyle }}>
                <option value="">Select...</option>
                {["1-3", "3-5", "5-10", "10-15", "15-20", "20+"].map((v) => (
                  <option key={v} value={v}>{v} years</option>
                ))}
              </select>
            </FieldGroup>
          </div>
          <NextButton onClick={next} />
        </div>
      );

    // ── Card 3: Micro-Reward ───────────────────────────────
    case 3:
      return (
        <MicroReward
          message="CITED can now start building your optimization plan. Your profiles across 12 platforms will be built from this data."
          onContinue={next}
        />
      );

    // ── Card 4: Markets ────────────────────────────────────
    case 4:
      return (
        <div>
          <CardHeader title="Where do you work?" subtitle="These markets drive all your AI visibility targeting." />
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <FieldGroup label="Primary markets — cities" required prefilled={!!searchParams.get("primaryMarkets")}
              hint="e.g., Carmel Valley, Carlsbad, Rancho Santa Fe">
              <TextArea value={form.primaryMarkets} onChange={(v) => set("primaryMarkets", v)} rows={2} />
            </FieldGroup>
            <FieldGroup label="Primary market ZIP code" hint="The ZIP where most of your deals close (e.g., 92130)">
              <TextInput value={form.primaryMarketZip} onChange={(v) => set("primaryMarketZip", v)} inputMode="numeric" />
            </FieldGroup>
            <FieldGroup label="Specific neighborhoods" hint="The more specific, the better — feeds directly into AI query targeting">
              <TextArea value={form.neighborhoods} onChange={(v) => set("neighborhoods", v)} rows={2}
                placeholder="e.g., Pacific Highlands Ranch, La Costa Oaks, Bird Rock" />
            </FieldGroup>
          </div>
          <NextButton onClick={next} />
        </div>
      );

    // ── Card 5: Online Presence ────────────────────────────
    case 5:
      return (
        <div>
          <CardHeader title="Your web presence" subtitle="Links we'll use for optimization. Leave blank if you don't have these." />
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <FieldGroup label="Brokerage profile page" hint="Your page on your brokerage website">
              <TextInput value={form.brokerageProfileUrl} onChange={(v) => set("brokerageProfileUrl", v)} type="url"
                placeholder="https://yourbrokerage.com/agents/your-name" />
            </FieldGroup>
            <FieldGroup label="Personal agent website" hint="Your own domain — highest AI citation value. Leave blank if not live.">
              <TextInput value={form.personalWebsiteUrl} onChange={(v) => set("personalWebsiteUrl", v)} type="url"
                placeholder="https://yourname.com" />
            </FieldGroup>
          </div>
          <NextButton onClick={next} />
          <SkipButton onClick={() => skip("onlinePresence")} />
        </div>
      );

    // ── Card 6: Audience Focus ─────────────────────────────
    case 6:
      return (
        <div>
          <CardHeader title="Who do you primarily work with?" subtitle="This drives all article framing and bio language." />
          <RadioGroup
            options={[
              { value: "sellers", label: "Primarily sellers" },
              { value: "buyers", label: "Primarily buyers" },
              { value: "both", label: "Both equally" },
            ]}
            selected={form.audienceFocus}
            onChange={(v) => set("audienceFocus", v)}
          />
          <NextButton onClick={next} />
        </div>
      );

    // ── Card 7: Micro-Reward ───────────────────────────────
    case 7:
      return (
        <MicroReward
          message={`Great — we now know your markets and audience. Here's what we'll run: ${form.primaryMarkets || "your market"} luxury queries across ChatGPT, Perplexity, Gemini, and Claude.`}
          onContinue={next}
        />
      );

    // ── Card 8: Differentiator (Thinking) ──────────────────
    case 8:
      return (
        <div>
          <CardHeader title="What makes you different?" subtitle="This is the most important question. It feeds your entire positioning." />
          <FieldGroup label="" hint={"Think about: your approach, your track record, what you do that others don\u2019t. Don\u2019t worry about perfect wording \u2014 we\u2019ll craft your positioning statement from this."}>
            <TextArea value={form.differentiator} onChange={(v) => set("differentiator", v)} rows={4}
              placeholder={"e.g., \"I specialize in off-market properties in RSF\" or \"My clients\u2019 homes sell 15% faster than market average.\""} />
          </FieldGroup>
          <NextButton onClick={next} label="Continue →" />
          <SkipButton onClick={() => skip("differentiator")} label="Skip for now — I'll think about this →" />
        </div>
      );

    // ── Card 9: Voice Capture (Thinking) ───────────────────
    case 9:
      return (
        <div>
          <CardHeader title="What do clients say about you?" subtitle="This helps us write in your voice — not a generic agent voice." />
          <FieldGroup label="" hint="What's the compliment you hear most? What do clients tell their friends?">
            <TextArea value={form.voiceCapture} onChange={(v) => set("voiceCapture", v)} rows={3}
              placeholder='e.g., "Clients always say I made a stressful process feel easy."' />
          </FieldGroup>
          <NextButton onClick={next} />
          <SkipButton onClick={() => skip("voiceCapture")} />
        </div>
      );

    // ── Card 10: Best Work (Thinking) ──────────────────────
    case 10:
      return (
        <div>
          <CardHeader title="Your 3 most notable transactions" subtitle="These build credibility in your AI profiles and articles." />
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <FieldGroup label="Transaction 1" hint="Address, price, and what made it memorable">
              <TextInput value={form.transaction1} onChange={(v) => set("transaction1", v)}
                placeholder="e.g., 7911 Calle Posada, Carlsbad — $2.1M — Sold 8% above asking" />
            </FieldGroup>
            <FieldGroup label="Transaction 2">
              <TextInput value={form.transaction2} onChange={(v) => set("transaction2", v)} />
            </FieldGroup>
            <FieldGroup label="Transaction 3">
              <TextInput value={form.transaction3} onChange={(v) => set("transaction3", v)} />
            </FieldGroup>
            <FieldGroup label="MLS data export" hint="CSV, PDF, or Excel — we'll extract stats automatically">
              <FileInput accept=".csv,.pdf,.xlsx,.xls" file={form.mlsFile} onChange={(f) => set("mlsFile", f)} icon="📎" />
            </FieldGroup>
          </div>
          <NextButton onClick={next} />
          <SkipButton onClick={() => skip("transactions")} />
        </div>
      );

    // ── Card 11: Photos (Upload) ───────────────────────────
    case 11:
      return (
        <div>
          <CardHeader title="Your photos" subtitle="We'll resize for all 12 platforms. You can always add these later." />
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <FieldGroup label="Professional headshot" hint="Minimum 400×400px, JPG or PNG">
              <FileInput accept="image/*" file={form.headshotFile} onChange={(f) => set("headshotFile", f)} icon="📷" label="Choose headshot" />
            </FieldGroup>
            <FieldGroup label="Landscape / market photo" hint="One great shot — property, neighborhood, or market. We'll create all banners from this.">
              <FileInput accept="image/*" file={form.landscapeFile} onChange={(f) => set("landscapeFile", f)} icon="🖼" label="Choose landscape photo" />
            </FieldGroup>
          </div>
          <NextButton onClick={next} />
          <SkipButton onClick={() => skip(form.headshotFile ? "landscape_photo" : "headshot")} label={"Skip \u2014 I\u2019ll add photos later \u2192"} />
        </div>
      );

    // ── Card 12: Platform Presence ─────────────────────────
    case 12: {
      const platforms = [
        { key: "gbp", label: "Google Business Profile", statusKey: "gbpStatus" as keyof FormData, urlKey: null, note: "No URL needed \u2014 we\u2019ll find your listing" },
        { key: "linkedin", label: "LinkedIn", statusKey: "linkedinStatus" as keyof FormData, urlKey: "linkedinUrl" as keyof FormData },
        { key: "yelp", label: "Yelp", statusKey: "yelpStatus" as keyof FormData, urlKey: "yelpUrl" as keyof FormData },
        { key: "zillow", label: "Zillow", statusKey: "zillowStatus" as keyof FormData, urlKey: "zillowUrl" as keyof FormData },
        { key: "realtor", label: "Realtor.com", statusKey: "realtorStatus" as keyof FormData, urlKey: "realtorUrl" as keyof FormData },
        { key: "youtube", label: "YouTube", statusKey: "youtubeStatus" as keyof FormData, urlKey: "youtubeUrl" as keyof FormData },
        { key: "fastexpert", label: "FastExpert", statusKey: "fastexpertStatus" as keyof FormData, urlKey: "fastexpertUrl" as keyof FormData },
      ];
      return (
        <div>
          <CardHeader title="Your platform presence" subtitle="We found some during your audit. Confirm or add any we missed. Leave anything blank \u2014 Jett will find it." />
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {platforms.map((p) => (
              <div key={p.key}>
                <PlatformCheck
                  label={p.label}
                  status={form[p.statusKey] as string}
                  url={p.urlKey ? (form[p.urlKey] as string) : undefined}
                  prefilled={p.urlKey ? !!searchParams.get(p.urlKey as string) : false}
                  onStatusChange={(v) => set(p.statusKey, v)}
                  onUrlChange={p.urlKey ? (v) => set(p.urlKey!, v) : undefined}
                />
                {"note" in p && p.note && (
                  <p style={{ fontSize: "11px", color: "#94a3b8", margin: "4px 0 0 16px" }}>{p.note as string}</p>
                )}
              </div>
            ))}
            <FieldGroup label="Additional platforms" hint="HomeLight, Bing Places, Apple Business, Homes.com, etc.">
              <TextArea value={form.additionalPlatforms} onChange={(v) => set("additionalPlatforms", v)} rows={2}
                placeholder="Paste any other profile URLs here" />
            </FieldGroup>
          </div>
          <NextButton onClick={next} />
          <SkipButton onClick={() => skip("platforms")} label="Skip platforms — Jett will find them →" />
        </div>
      );
    }

    // ── Card 13: Review Preferences ────────────────────────
    case 13:
      return (
        <div>
          <CardHeader title="Where should we help drive reviews?" subtitle="We'll include review links in your copy kit. Start with 1-2." />
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {REVIEW_OPTIONS.map((platform) => (
              <label key={platform} style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", padding: "10px 12px", borderRadius: "8px", background: form.reviewPlatforms.includes(platform) ? "rgba(0,191,166,0.06)" : "transparent", border: `1px solid ${form.reviewPlatforms.includes(platform) ? "#00BFA6" : "#e2e8f0"}`, transition: "all 0.15s" }}>
                <input type="checkbox" checked={form.reviewPlatforms.includes(platform)}
                  onChange={() => {
                    const updated = form.reviewPlatforms.includes(platform)
                      ? form.reviewPlatforms.filter((p) => p !== platform)
                      : [...form.reviewPlatforms, platform];
                    set("reviewPlatforms", updated);
                  }}
                  style={{ accentColor: "#00BFA6", width: "18px", height: "18px" }} />
                <span style={{ fontSize: "14px", color: "#0A1929" }}>{platform}</span>
              </label>
            ))}
          </div>
          <NextButton onClick={next} />
          <SkipButton onClick={() => skip("reviewPreferences")} />
        </div>
      );

    // ── Card 14: Summary ───────────────────────────────────
    case 14:
      return (
        <div>
          <CardHeader title="Review & submit" subtitle="Everything look right? Click any section to make changes." />
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <SummarySection title="Your Info" onEdit={() => goToCard(1)}>
              <SummaryRow label="Name" value={form.fullName} />
              <SummaryRow label="Email" value={form.email} />
              <SummaryRow label="Phone" value={form.phone || "Not provided"} />
              <SummaryRow label="Brokerage" value={form.brokerage} />
              <SummaryRow label="License #" value={form.licenseNumber} />
            </SummarySection>
            <SummarySection title="Markets" onEdit={() => goToCard(4)}>
              <SummaryRow label="Markets" value={form.primaryMarkets} />
              <SummaryRow label="ZIP" value={form.primaryMarketZip || "—"} />
              <SummaryRow label="Neighborhoods" value={form.neighborhoods || "—"} />
              <SummaryRow label="Audience" value={form.audienceFocus || "—"} />
            </SummarySection>
            <SummarySection title="Your Story" onEdit={() => goToCard(8)}>
              <SummaryRow label="Differentiator" value={form.differentiator || "⚠️ Skipped"} />
              <SummaryRow label="Voice" value={form.voiceCapture || "Skipped"} />
              <SummaryRow label="Transactions" value={[form.transaction1, form.transaction2, form.transaction3].filter(Boolean).length + " provided"} />
            </SummarySection>
            <SummarySection title="Photos & Platforms" onEdit={() => goToCard(11)}>
              <SummaryRow label="Headshot" value={form.headshotFile ? "✅ Uploaded" : "⚠️ Not yet"} />
              <SummaryRow label="Landscape" value={form.landscapeFile ? "✅ Uploaded" : "Not yet"} />
              <SummaryRow label="Platforms" value={`${[form.gbpStatus, form.linkedinStatus, form.yelpStatus, form.zillowStatus, form.realtorStatus, form.youtubeStatus, form.fastexpertStatus].filter((s) => s === "yes").length} confirmed`} />
            </SummarySection>

            {form.skippedFields.length > 0 && (
              <div style={{ background: "rgba(212,168,48,0.08)", border: "1px solid rgba(212,168,48,0.2)", borderRadius: "8px", padding: "12px 16px" }}>
                <p style={{ fontSize: "13px", color: "#92710a", margin: 0 }}>
                  ⚠️ You skipped {form.skippedFields.length} item{form.skippedFields.length > 1 ? "s" : ""}: {form.skippedFields.join(", ")}. We&apos;ll follow up so you can add {form.skippedFields.length > 1 ? "these" : "this"}.
                </p>
              </div>
            )}
          </div>

          {/* Trust signal */}
          <p style={{ fontSize: "12px", color: "#94a3b8", textAlign: "center", margin: "20px 0 12px", lineHeight: 1.6 }}>
            Your data is used exclusively to optimize your AI visibility across search platforms.
            We never share or sell your personal information.{" "}
            <a href="/privacy" style={{ color: "#64748b" }}>Privacy Policy</a> · <a href="/terms" style={{ color: "#64748b" }}>Terms</a>
          </p>

          {/* Terms */}
          <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer", marginBottom: "16px" }}>
            <input type="checkbox" checked={form.termsAccepted} onChange={(e) => set("termsAccepted", e.target.checked)}
              style={{ accentColor: "#00BFA6", width: "18px", height: "18px", marginTop: "2px", flexShrink: 0 }} />
            <span style={{ fontSize: "13px", color: "#0A1929", lineHeight: 1.5 }}>
              I agree to Cited&apos;s <a href="/terms" style={{ color: "#00BFA6" }}>Terms of Service</a> and <a href="/privacy" style={{ color: "#00BFA6" }}>Privacy Policy</a>, and understand the first 90 days are free.
            </span>
          </label>

          <button onClick={handleSubmit} disabled={submitting}
            style={{
              width: "100%", padding: "16px", background: "#00BFA6", color: "#fff",
              border: "none", borderRadius: "10px", fontSize: "16px", fontWeight: 700,
              cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.6 : 1,
              transition: "opacity 0.15s",
            }}>
            {submitting ? "Submitting..." : "Start My Optimization →"}
          </button>
        </div>
      );

    // ── Card 15: Celebration ───────────────────────────────
    case 15:
      return (
        <div style={{ textAlign: "center", padding: "40px 20px", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", background: "#0A1929" }}>
          <div style={{
            width: "80px", height: "80px", borderRadius: "50%", margin: "0 auto 24px",
            background: "rgba(0,191,166,0.15)", border: "2px solid #00BFA6",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#00BFA6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <h1 style={{ fontSize: "32px", fontWeight: 800, color: "#fff", margin: "0 0 8px", letterSpacing: "-0.5px" }}>
            You&apos;re all set. 🎉
          </h1>
          <p style={{ fontSize: "16px", color: "#00BFA6", fontWeight: 600, margin: "0 0 28px" }}>
            Welcome to CITED.
          </p>

          <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "24px", marginBottom: "28px", textAlign: "left" }}>
            {[
              ["①", "We're building your positioning statement now. You'll review it within 48 hours."],
              ["②", "Your optimized platform copy will be ready for review shortly after."],
              ["③", "Your first article brief arrives once positioning is approved."],
            ].map(([num, text], i) => (
              <div key={i} style={{ display: "flex", gap: "12px", marginBottom: i < 2 ? "14px" : 0, alignItems: "flex-start" }}>
                <span style={{ color: "#00BFA6", fontWeight: 700, fontSize: "16px", flexShrink: 0 }}>{num}</span>
                <p style={{ fontSize: "14px", color: "#cbd5e1", lineHeight: 1.7, margin: 0 }}>{text}</p>
              </div>
            ))}
          </div>

          <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 20px" }}>
            We handle 87% of the work. You provide 15 minutes a month.
          </p>

          <GoogleSignInButton redirectTo="https://citedagent.com/auth/callback?next=/" />

          <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "16px 0" }}>
            <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.1)" }} />
            <span style={{ fontSize: "12px", color: "#4a6380" }}>or</span>
            <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.1)" }} />
          </div>

          <p style={{ fontSize: "13px", color: "#4a6380", margin: 0 }}>
            Check your email for a dashboard access link, or{" "}
            <a href="/login" style={{ color: "#00BFA6", textDecoration: "none", fontWeight: 600 }}>go to the login page →</a>
          </p>
        </div>
      );

    default:
      return null;
  }
}

// ═══════════════════════════════════════════════════════════════
// REUSABLE COMPONENTS
// ═══════════════════════════════════════════════════════════════

const inputBaseStyle: React.CSSProperties = {
  width: "100%", padding: "12px 14px", borderRadius: "8px",
  border: "1px solid #D1D5DB", fontSize: "14px", color: "#0A1929",
  background: "#FAFAFA", outline: "none", transition: "border-color 0.15s",
};

const selectStyle: React.CSSProperties = {
  ...inputBaseStyle, appearance: "none" as const,
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394a3b8' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center",
  paddingRight: "32px",
};

function TextInput({ value, onChange, type = "text", placeholder, inputMode }: {
  value: string; onChange: (v: string) => void; type?: string; placeholder?: string; inputMode?: string;
}) {
  return (
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder} inputMode={inputMode as never}
      style={inputBaseStyle}
      onFocus={(e) => { e.target.style.borderColor = "#00BFA6"; }}
      onBlur={(e) => { e.target.style.borderColor = "#D1D5DB"; }}
    />
  );
}

function TextArea({ value, onChange, rows = 3, placeholder }: {
  value: string; onChange: (v: string) => void; rows?: number; placeholder?: string;
}) {
  return (
    <textarea value={value} onChange={(e) => onChange(e.target.value)}
      rows={rows} placeholder={placeholder}
      style={{ ...inputBaseStyle, resize: "vertical" as const }}
      onFocus={(e) => { e.target.style.borderColor = "#00BFA6"; }}
      onBlur={(e) => { e.target.style.borderColor = "#D1D5DB"; }}
    />
  );
}

function FileInput({ accept, file, onChange, icon = "📎", label = "Choose file" }: {
  accept: string; file: File | null; onChange: (f: File | null) => void; icon?: string; label?: string;
}) {
  return (
    <label style={{
      display: "flex", alignItems: "center", gap: "12px",
      border: "1px solid #D1D5DB", borderRadius: "8px",
      padding: "12px 16px", cursor: "pointer", background: "#FAFAFA",
    }}>
      <input type="file" accept={accept} style={{ display: "none" }}
        onChange={(e) => onChange(e.target.files?.[0] ?? null)} />
      <span style={{ fontSize: "20px" }}>{icon}</span>
      <span style={{ fontSize: "14px", color: file ? "#0A1929" : "#94a3b8" }}>
        {file ? file.name : label}
      </span>
    </label>
  );
}

function FieldGroup({ label, required, hint, prefilled, children }: {
  label: string; required?: boolean; hint?: string; prefilled?: boolean; children: React.ReactNode;
}) {
  return (
    <div>
      {label && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
          <span style={{ fontSize: "14px", fontWeight: 600, color: "#0A1929" }}>
            {label}{required && <span style={{ color: "#DC2626" }}> *</span>}
          </span>
          {prefilled && (
            <span style={{
              fontSize: "11px", fontWeight: 600, color: "#00BFA6",
              background: "rgba(0,191,166,0.08)", padding: "2px 8px",
              borderRadius: "10px", whiteSpace: "nowrap",
            }}>
              ✅ From your audit
            </span>
          )}
        </div>
      )}
      {hint && <p style={{ fontSize: "12px", color: "#94a3b8", margin: "0 0 6px", lineHeight: 1.4 }}>{hint}</p>}
      {children}
    </div>
  );
}

function CardHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div style={{ marginBottom: "24px" }}>
      <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#0A1929", margin: "0 0 6px", letterSpacing: "-0.3px" }}>{title}</h2>
      <p style={{ fontSize: "14px", color: "#64748b", margin: 0, lineHeight: 1.5 }}>{subtitle}</p>
    </div>
  );
}

function NextButton({ onClick, label = "Continue →" }: { onClick: () => void; label?: string }) {
  return (
    <button onClick={onClick} style={{
      width: "100%", padding: "14px", background: "#00BFA6", color: "#fff",
      border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: 700,
      cursor: "pointer", marginTop: "24px", transition: "opacity 0.15s",
    }}>
      {label}
    </button>
  );
}

function SkipButton({ onClick, label = "Skip for now →" }: { onClick: () => void; label?: string }) {
  return (
    <button onClick={onClick} style={{
      width: "100%", padding: "10px", background: "none", color: "#94a3b8",
      border: "none", fontSize: "13px", cursor: "pointer", marginTop: "8px",
    }}>
      {label}
    </button>
  );
}

function MicroReward({ message, onContinue }: { message: string; onContinue: () => void }) {
  return (
    <div style={{ textAlign: "center", padding: "16px 0" }}>
      <div style={{
        width: "56px", height: "56px", borderRadius: "50%", margin: "0 auto 16px",
        background: "rgba(0,191,166,0.1)", display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00BFA6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <p style={{ fontSize: "15px", color: "#0A1929", lineHeight: 1.6, margin: "0 0 24px", fontWeight: 500 }}>
        {message}
      </p>
      <NextButton onClick={onContinue} />
    </div>
  );
}

function RadioGroup({ options, selected, onChange }: {
  options: { value: string; label: string }[]; selected: string; onChange: (v: string) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {options.map((opt) => (
        <label key={opt.value} onClick={() => onChange(opt.value)} style={{
          display: "flex", alignItems: "center", gap: "12px", cursor: "pointer",
          padding: "14px 16px", borderRadius: "10px",
          background: selected === opt.value ? "rgba(0,191,166,0.06)" : "#FAFAFA",
          border: `2px solid ${selected === opt.value ? "#00BFA6" : "#e2e8f0"}`,
          transition: "all 0.15s",
        }}>
          <div style={{
            width: "20px", height: "20px", borderRadius: "50%",
            border: `2px solid ${selected === opt.value ? "#00BFA6" : "#cbd5e1"}`,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            {selected === opt.value && <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#00BFA6" }} />}
          </div>
          <span style={{ fontSize: "15px", color: "#0A1929", fontWeight: selected === opt.value ? 600 : 400 }}>{opt.label}</span>
        </label>
      ))}
    </div>
  );
}

function PlatformCheck({ label, status, url, prefilled, onStatusChange, onUrlChange }: {
  label: string; status: string; url?: string; prefilled?: boolean;
  onStatusChange: (v: string) => void; onUrlChange?: (v: string) => void;
}) {
  return (
    <div style={{ border: "1px solid #e2e8f0", borderRadius: "10px", padding: "14px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: status === "yes" && onUrlChange ? "10px" : 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "14px", fontWeight: 600, color: "#0A1929" }}>{label}</span>
          {prefilled && url && (
            <span style={{ fontSize: "10px", color: "#00BFA6", background: "rgba(0,191,166,0.08)", padding: "2px 6px", borderRadius: "8px" }}>✅ Found</span>
          )}
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          {(["yes", "no", "not_sure"] as const).map((val) => (
            <button key={val} onClick={() => onStatusChange(val)} style={{
              padding: "6px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: 600,
              border: `1px solid ${status === val ? "#00BFA6" : "#e2e8f0"}`,
              background: status === val ? "rgba(0,191,166,0.08)" : "#fff",
              color: status === val ? "#00BFA6" : "#94a3b8",
              cursor: "pointer", transition: "all 0.15s",
            }}>
              {val === "yes" ? "Yes" : val === "no" ? "No" : "Not sure"}
            </button>
          ))}
        </div>
      </div>
      {status === "yes" && onUrlChange && (
        <TextInput value={url || ""} onChange={onUrlChange} type="url" placeholder={`https://${label.toLowerCase().replace(/\s/g, "")}.com/...`} />
      )}
    </div>
  );
}

function SummarySection({ title, onEdit, children }: { title: string; onEdit: () => void; children: React.ReactNode }) {
  return (
    <div style={{ border: "1px solid #e2e8f0", borderRadius: "10px", padding: "14px 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <span style={{ fontSize: "14px", fontWeight: 700, color: "#0A1929" }}>{title}</span>
        <button onClick={onEdit} style={{
          background: "none", border: "none", color: "#00BFA6", fontSize: "12px",
          fontWeight: 600, cursor: "pointer",
        }}>Change</button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>{children}</div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", gap: "8px", fontSize: "13px" }}>
      <span style={{ color: "#94a3b8", minWidth: "90px" }}>{label}</span>
      <span style={{ color: value.startsWith("⚠️") ? "#D4A830" : "#0A1929", fontWeight: value.startsWith("⚠️") ? 600 : 400 }}>
        {value || "—"}
      </span>
    </div>
  );
}

// ── Page Export ─────────────────────────────────────────────────

export default function IntakePage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif", color: "#64748b" }}>
        Loading...
      </div>
    }>
      <IntakeForm />
    </Suspense>
  );
}
