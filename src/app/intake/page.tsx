"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

/* ═══════════════════════════════════════════════════════════════
   CITED Intake Form — Progressive Disclosure (Template 17)
   v3.0 — Batch 4 fixes April 9, 2026
   Spec: references/cited-intake-config.md
   ═══════════════════════════════════════════════════════════════ */

// ── Platform definitions ───────────────────────────────────────

const PLATFORMS = [
  // High Impact
  { key: "personalsite", label: "Personal Website", impact: "high" as const, statusKey: "personalsiteStatus", urlKey: "personalWebsiteUrl" },
  { key: "gbp", label: "Google Business Profile", impact: "high" as const, statusKey: "gbpStatus", urlKey: "gbpUrl" },
  { key: "linkedin", label: "LinkedIn", impact: "high" as const, statusKey: "linkedinStatus", urlKey: "linkedinUrl" },
  { key: "yelp", label: "Yelp", impact: "high" as const, statusKey: "yelpStatus", urlKey: "yelpUrl" },
  { key: "bing", label: "Bing Places", impact: "high" as const, statusKey: "bingStatus", urlKey: "bingUrl" },
  // Medium Impact
  { key: "zillow", label: "Zillow", impact: "medium" as const, statusKey: "zillowStatus", urlKey: "zillowUrl" },
  { key: "realtor", label: "Realtor.com", impact: "medium" as const, statusKey: "realtorStatus", urlKey: "realtorUrl" },
  { key: "fastexpert", label: "FastExpert", impact: "medium" as const, statusKey: "fastexpertStatus", urlKey: "fastexpertUrl" },
  { key: "foursquare", label: "Foursquare", impact: "medium" as const, statusKey: "foursquareStatus", urlKey: "foursquareUrl" },
  { key: "youtube", label: "YouTube", impact: "medium" as const, statusKey: "youtubeStatus", urlKey: "youtubeUrl" },
  // Supporting
  { key: "homescom", label: "Homes.com", impact: "supporting" as const, statusKey: "homescomStatus", urlKey: "homescomUrl" },
  { key: "homelight", label: "HomeLight", impact: "supporting" as const, statusKey: "homelightStatus", urlKey: "homelightUrl" },
  { key: "apple", label: "Apple Business Connect", impact: "supporting" as const, statusKey: "appleStatus", urlKey: "appleUrl" },
  { key: "x", label: "X (Twitter)", impact: "supporting" as const, statusKey: "xStatus", urlKey: "xUrl" },
] as const;

const IMPACT_LABELS = { high: "High Impact", medium: "Medium Impact", supporting: "Supporting" } as const;
const IMPACT_COLORS = { high: "#dc2626", medium: "#ca8a04", supporting: "#16a34a" } as const;

const PLATFORM_START_CARD = 8;
const SUMMARY_CARD = PLATFORM_START_CARD + PLATFORMS.length; // 22
const CELEBRATION_CARD = SUMMARY_CARD + 1; // 23
const TOTAL_CARDS = CELEBRATION_CARD;

// Fields that came from PRISM scan (show "From CITED PRISM Scan" badge)
const PRISM_FOUND_FIELDS = new Set([
  "brokerage", "brokerageAddress", "primaryMarkets",
  "brokerDre", "brokerName",
  "gbpUrl", "linkedinUrl", "zillowUrl", "yelpUrl", "realtorUrl",
  "fastexpertUrl", "youtubeUrl", "brokerageProfileUrl",
]);

const STORAGE_KEY = "cited-intake-v2";

// ── Types ──────────────────────────────────────────────────────

type FormData = {
  signupEmail: string;
  fullName: string;
  email: string;
  phone: string;
  brokerage: string;
  title: string;
  licenseNumber: string;
  brokerDre: string;
  brokerName: string;
  brokerageAddress: string;
  yearsInMarket: string;
  primaryMarkets: string;
  primaryMarketZips: string;
  neighborhoods: string;
  brokerageProfileUrl: string;
  personalWebsiteUrl: string;
  audienceFocus: string;
  differentiator: string;
  voiceCapture: string;
  transactions: string[];
  mlsFile: File | null;
  mlsDoneForYou: boolean;
  headshotFile: File | null;
  landscapeFile: File | null;
  // Platform statuses + URLs
  gbpStatus: string; gbpUrl: string;
  linkedinStatus: string; linkedinUrl: string;
  yelpStatus: string; yelpUrl: string;
  bingStatus: string; bingUrl: string;
  foursquareStatus: string; foursquareUrl: string;
  zillowStatus: string; zillowUrl: string;
  realtorStatus: string; realtorUrl: string;
  youtubeStatus: string; youtubeUrl: string;
  fastexpertStatus: string; fastexpertUrl: string;
  homelightStatus: string; homelightUrl: string;
  appleStatus: string; appleUrl: string;
  homescomStatus: string; homescomUrl: string;
  xStatus: string; xUrl: string;
  personalsiteStatus: string;
  additionalPlatforms: string;
  reviewPlatforms: string[];
  reviewOther: string;
  termsAccepted: boolean;
  skippedFields: string[];
  [key: string]: string | string[] | boolean | File | null;
};

// ── Initial form from URL params ───────────────────────────────

function getInitialForm(sp: ReturnType<typeof useSearchParams>): FormData {
  return {
    signupEmail: sp.get("email") || "",
    fullName: sp.get("fullName") || "",
    email: sp.get("email") || "",
    phone: "",
    brokerage: sp.get("brokerage") || "",
    title: "",
    licenseNumber: sp.get("licenseNumber") || "",
    brokerDre: sp.get("brokerDre") || "",
    brokerName: sp.get("brokerName") || "",
    brokerageAddress: sp.get("brokerageAddress") || "",
    yearsInMarket: sp.get("yearsInMarket") || "",
    primaryMarkets: sp.get("primaryMarkets") || "",
    primaryMarketZips: "",
    neighborhoods: "",
    brokerageProfileUrl: sp.get("brokerageProfileUrl") || "",
    personalWebsiteUrl: sp.get("personalWebsiteUrl") || "",
    audienceFocus: "",
    differentiator: "",
    voiceCapture: "",
    transactions: [""],
    mlsFile: null,
    mlsDoneForYou: true, // CA/WA default
    headshotFile: null,
    landscapeFile: null,
    gbpStatus: sp.get("gbpStatus") || "",
    gbpUrl: sp.get("gbpUrl") || "",
    linkedinStatus: sp.get("linkedinUrl") ? "yes" : "",
    linkedinUrl: sp.get("linkedinUrl") || "",
    yelpStatus: sp.get("yelpUrl") ? "yes" : "",
    yelpUrl: sp.get("yelpUrl") || "",
    bingStatus: "",
    bingUrl: "",
    foursquareStatus: "",
    foursquareUrl: "",
    zillowStatus: sp.get("zillowUrl") ? "yes" : "",
    zillowUrl: sp.get("zillowUrl") || "",
    realtorStatus: sp.get("realtorUrl") ? "yes" : "",
    realtorUrl: sp.get("realtorUrl") || "",
    youtubeStatus: sp.get("youtubeUrl") ? "yes" : "",
    youtubeUrl: sp.get("youtubeUrl") || "",
    fastexpertStatus: sp.get("fastexpertUrl") ? "yes" : "",
    fastexpertUrl: sp.get("fastexpertUrl") || "",
    homelightStatus: "",
    homelightUrl: "",
    appleStatus: "",
    appleUrl: "",
    homescomStatus: "",
    homescomUrl: "",
    xStatus: "",
    personalsiteStatus: sp.get("personalWebsiteUrl") ? "yes" : "",
    xUrl: "",
    additionalPlatforms: "",
    reviewPlatforms: [],
    reviewOther: "",
    termsAccepted: false,
    skippedFields: [],
  };
}

// ── Count pre-filled PRISM fields ──────────────────────────────

function countPreFilled(sp: ReturnType<typeof useSearchParams>): number {
  let count = 0;
  PRISM_FOUND_FIELDS.forEach((f) => { if (sp.get(f)) count++; });
  return count;
}

// ── Google Sign In Button ──────────────────────────────────────

function GoogleSignInButton({ redirectTo }: { redirectTo: string }) {
  const handleGoogleSignIn = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo } });
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
  const preFillCount = countPreFilled(searchParams);
  const hasPrefill = preFillCount > 0;

  const [form, setForm] = useState<FormData>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
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
  const [dreLooking, setDreLooking] = useState(false);
  const [dreResult, setDreResult] = useState<string>("");
  const [error, setError] = useState("");
  const [animating, setAnimating] = useState(false);
  const [slideDir, setSlideDir] = useState<"forward" | "back">("forward");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const progressPercent = Math.max(7, Math.round(((currentCard - 1) / (TOTAL_CARDS - 1)) * 100));

  // Debounced auto-save on every form change (500ms)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try {
        const { mlsFile, headshotFile, landscapeFile, ...saveable } = form;
        void mlsFile; void headshotFile; void landscapeFile;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(saveable));
        localStorage.setItem(STORAGE_KEY + "-card", String(currentCard));
      } catch { /* ignore */ }
    }, 500);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
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

  // ── DRE Lookup ─────────────────────────────────────────────

  async function lookupDre(licenseId: string) {
    if (!licenseId || licenseId.replace(/\D/g, '').length < 7) return;
    setDreLooking(true);
    setDreResult("");
    try {
      const res = await fetch(`/api/dre-lookup?licenseId=${encodeURIComponent(licenseId.trim())}`);
      if (!res.ok) {
        const d = await res.json();
        setDreResult(`⚠ ${d.error || 'Not found'}`);
        return;
      }
      const data = await res.json();
      if (data.broker_name) set("brokerage", data.broker_name);
      if (data.broker_license_id) set("brokerDre", data.broker_license_id);
      if (data.broker_name) set("brokerName", data.broker_name);
      // Agent mailing address → brokerageAddress (NAP consistency, NOT broker HQ)
      if (data.mailing_address) set("brokerageAddress", data.mailing_address);
      setDreResult(`✓ Found — ${data.broker_name || data.full_name}`);
    } catch {
      setDreResult("⚠ Lookup failed — try again");
    } finally {
      setDreLooking(false);
    }
  }

  // ── Navigation ─────────────────────────────────────────────

  function goTo(target: number, dir: "forward" | "back" = "forward") {
    if (animating || target < 1 || target > TOTAL_CARDS) return;
    setSlideDir(dir);
    setAnimating(true);
    setValidationErrors([]);
    setTimeout(() => { setCurrentCard(target); setAnimating(false); }, 150);
  }

  // Save in-progress data to Supabase (non-blocking, after Card 1 when we have email)
  async function saveProgress(f: FormData, cardNum: number) {
    if (!f.email.trim()) return; // need email to upsert
    const signupEmail = (f.signupEmail || f.email).trim().toLowerCase();
    const contactEmail = f.email.trim().toLowerCase();
    try {
      await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signupEmail, fullName: f.fullName, email: f.email, phone: f.phone,
          brokerage: f.brokerage, title: f.title, licenseNumber: f.licenseNumber,
          brokerageAddress: f.brokerageAddress, brokerDre: f.brokerDre, brokerName: f.brokerName, yearsInMarket: f.yearsInMarket,
          primaryMarkets: f.primaryMarkets, primaryMarketZip: f.primaryMarketZips,
          neighborhoods: f.neighborhoods, brokerageProfileUrl: f.brokerageProfileUrl,
          personalWebsiteUrl: f.personalWebsiteUrl, audienceFocus: f.audienceFocus,
          differentiator: f.differentiator, voiceCapture: f.voiceCapture,
          topTransactions: f.transactions.filter(Boolean).map(t => t.replace("||", " — ")).join("\n"),
          gbpStatus: f.gbpStatus, linkedinUrl: f.linkedinUrl, zillowUrl: f.zillowUrl,
          yelpUrl: f.yelpUrl, realtorUrl: f.realtorUrl, fastexpertUrl: f.fastexpertUrl,
          youtubeUrl: f.youtubeUrl, skippedFields: f.skippedFields,
          intakeCompletionPct: Math.round((cardNum / TOTAL_CARDS) * 100),
          reviewPlatforms: f.reviewPlatforms,
        }),
      });
    } catch { /* non-blocking — localStorage is the fallback */ }
  }

  function next() {
    const errs = validateCard(currentCard, form);
    if (errs.length > 0) { setValidationErrors(errs); return; }
    setValidationErrors([]);
    // Save to Supabase after Card 1 (we have email by then)
    if (currentCard >= 1 && form.email.trim()) {
      saveProgress(form, currentCard + 1);
    }
    goTo(currentCard + 1, "forward");
  }

  function back() { if (currentCard > 1) goTo(currentCard - 1, "back"); }

  function skip(field?: string) {
    if (field) addSkipped(field);
    goTo(currentCard + 1, "forward");
  }

  function jumpTo(id: number) { goTo(id, id < currentCard ? "back" : "forward"); }

  // ── Validation ─────────────────────────────────────────────

  function validateCard(id: number, f: FormData): string[] {
    const errs: string[] = [];
    if (id === 1) {
      if (!f.fullName.trim()) errs.push("Full name is required");
      if (!f.email.trim()) errs.push("Email is required");
      if (f.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) errs.push("Enter a valid email address");
      if (!f.phone.trim()) errs.push("Phone number is required");
    }
    if (id === 2) {
      if (!f.brokerage.trim()) errs.push("Brokerage name is required");
      if (!f.licenseNumber.trim()) errs.push("License number is required (CA DRE compliance)");
    }
    if (id === SUMMARY_CARD) {
      if (!f.termsAccepted) errs.push("Please accept the Terms of Service and Privacy Policy");
    }
    return errs;
  }

  // ── Submit ─────────────────────────────────────────────────

  async function handleSubmit() {
    const errs = validateCard(SUMMARY_CARD, form);
    if (errs.length > 0) { setValidationErrors(errs); return; }
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signupEmail: form.signupEmail, fullName: form.fullName, email: form.email, phone: form.phone,
          brokerage: form.brokerage, title: form.title, licenseNumber: form.licenseNumber,
          brokerageAddress: form.brokerageAddress, brokerDre: form.brokerDre, brokerName: form.brokerName, yearsInMarket: form.yearsInMarket,
          primaryMarkets: form.primaryMarkets, primaryMarketZip: form.primaryMarketZips,
          neighborhoods: form.neighborhoods,
          brokerageProfileUrl: form.brokerageProfileUrl, personalWebsiteUrl: form.personalWebsiteUrl,
          audienceFocus: form.audienceFocus, differentiator: form.differentiator,
          voiceCapture: form.voiceCapture,
          topTransactions: form.transactions.filter(Boolean).join("\n"),
          reviewPlatforms: form.reviewPlatforms, reviewOther: form.reviewOther,
          gbpStatus: form.gbpStatus,
          linkedinUrl: form.linkedinUrl, zillowUrl: form.zillowUrl, yelpUrl: form.yelpUrl,
          realtorUrl: form.realtorUrl, fastexpertUrl: form.fastexpertUrl,
          youtubeUrl: form.youtubeUrl, additionalPlatforms: form.additionalPlatforms,
          skippedFields: form.skippedFields, intakeCompletionPct: 100, termsAccepted: form.termsAccepted,
        }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Submission failed"); }

      const supabase = createSupabaseBrowserClient();
      const email = form.email.trim();
      if (form.headshotFile) {
        try { await supabase.storage.from("headshots").upload(`${email}/${Date.now()}-headshot-${form.headshotFile.name}`, form.headshotFile, { cacheControl: "3600", upsert: false }); } catch { /* non-blocking */ }
      }
      if (form.landscapeFile) {
        try { await supabase.storage.from("headshots").upload(`${email}/${Date.now()}-landscape-${form.landscapeFile.name}`, form.landscapeFile, { cacheControl: "3600", upsert: false }); } catch { /* non-blocking */ }
      }
      if (form.mlsFile) {
        try { await supabase.storage.from("mls-uploads").upload(`${email}/${Date.now()}-mls-${form.mlsFile.name}`, form.mlsFile, { cacheControl: "3600", upsert: false }); } catch { /* non-blocking */ }
      }
      try { await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: "https://citedagent.com/auth/callback?next=/copy-kit" } }); } catch { /* non-blocking */ }

      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_KEY + "-card");
      goTo(CELEBRATION_CARD, "forward");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  // ── isPrismPrefilled helper ────────────────────────────────

  function isPrefilled(field: string): boolean {
    return PRISM_FOUND_FIELDS.has(field) && !!searchParams.get(field);
  }

  // ── Card title helper ──────────────────────────────────────

  function getCardTitle(id: number): string {
    if (id === 1) return "Your Details";
    if (id === 2) return "Your Practice";
    if (id === 3) return "";
    if (id === 4) return "What Makes You Different";
    if (id === 5) return "Your Voice";
    if (id === 6) return "Notable Work";
    if (id === 7) return "Your Photos";
    if (id >= PLATFORM_START_CARD && id < SUMMARY_CARD) return PLATFORMS[id - PLATFORM_START_CARD].label;
    if (id === SUMMARY_CARD) return "Review & Submit";
    return "";
  }

  const isCelebration = currentCard === CELEBRATION_CARD;
  const isReward = currentCard === 3;

  // ── Render ─────────────────────────────────────────────────

  return (
    <div style={{ minHeight: "100vh", background: isCelebration ? "#0A1929" : "#f8f9fa" }}>
      {/* Top header - CITED logo + step */}
      {!isCelebration && (
        <div style={{ position: "sticky", top: 0, zIndex: 50, background: "#0A1929", padding: "12px 20px" }}>
          <div style={{ maxWidth: "640px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "#00BFA6", fontSize: "15px", fontWeight: 800, letterSpacing: "1.5px" }}>CITED</span>
            <span style={{ color: "#94a3b8", fontSize: "13px" }}>
              {progressPercent}% complete
              {getCardTitle(currentCard) && ` — ${getCardTitle(currentCard)}`}
            </span>
          </div>
        </div>
      )}

      {/* Card container */}
      <div style={{
        maxWidth: "720px", width: "100%", margin: "0 auto",
        padding: isCelebration ? "0 20px" : "24px 20px 40px",
        minHeight: isCelebration ? "100vh" : "auto",
        display: isCelebration ? "flex" : "block",
        flexDirection: "column", justifyContent: "center",
      }}>
        {/* Progress bar — above card, same width */}
        {!isCelebration && (
          <div style={{ marginBottom: "4px" }}>
            <div style={{ height: "6px", background: "#e2e8f0", borderRadius: "3px", overflow: "hidden" }}>
              <div style={{
                height: "100%", background: "linear-gradient(90deg, #00BFA6, #00e6c8)",
                width: `${progressPercent}%`, transition: "width 0.4s ease",
                borderRadius: "3px",
              }} />
            </div>
            {preFillCount > 0 && currentCard <= 2 && (
              <p style={{ fontSize: "12px", color: "#00BFA6", margin: "6px 0 0", textAlign: "right" }}>
                {preFillCount} fields from your PRISM Scan
              </p>
            )}
          </div>
        )}

        {/* Back button */}
        {currentCard > 1 && !isCelebration && (
          <button onClick={back} style={{
            background: "none", border: "none", color: "#64748b", fontSize: "13px",
            cursor: "pointer", padding: "8px 0", marginBottom: "8px",
          }}>{"← Back"}</button>
        )}

        {/* Validation errors */}
        {validationErrors.length > 0 && (
          <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "8px", padding: "12px 16px", marginBottom: "16px" }}>
            {validationErrors.map((e, i) => <p key={i} style={{ color: "#DC2626", fontSize: "13px", margin: i > 0 ? "4px 0 0" : 0 }}>{e}</p>)}
          </div>
        )}
        {error && (
          <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "8px", padding: "12px 16px", marginBottom: "16px" }}>
            <p style={{ color: "#DC2626", fontSize: "13px", margin: 0 }}>{error}</p>
          </div>
        )}

        {/* Card with animation */}
        <div style={{
          background: (isCelebration || isReward) ? "transparent" : "#fff",
          borderRadius: isCelebration ? 0 : "16px",
          boxShadow: (isCelebration || isReward) ? "none" : "0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)",
          padding: isCelebration ? 0 : (isReward ? "20px 28px" : "32px 28px"),
          opacity: animating ? 0 : 1,
          transform: animating ? (slideDir === "forward" ? "translateY(12px)" : "translateY(-12px)") : "translateY(0)",
          transition: "opacity 0.15s ease, transform 0.15s ease",
        }}>
          {renderCardContent({
            cardId: currentCard, form, set, next, skip, back, jumpTo,
            handleSubmit, submitting, searchParams, isPrefilled, hasPrefill, addSkipped,
            dreLooking, dreResult, lookupDre,
          })}
        </div>
      </div>
    </div>
  );
}

// ── Card Content Renderer ──────────────────────────────────────

type CardProps = {
  cardId: number; form: FormData;
  set: <K extends keyof FormData>(key: K, value: FormData[K]) => void;
  next: () => void; skip: (f?: string) => void; back: () => void; jumpTo: (id: number) => void;
  handleSubmit: () => void; submitting: boolean;
  searchParams: ReturnType<typeof useSearchParams>;
  isPrefilled: (f: string) => boolean; hasPrefill: boolean;
  addSkipped: (f: string) => void;
  dreLooking: boolean; dreResult: string;
  lookupDre: (licenseId: string) => void;
};

function renderCardContent(p: CardProps) {
  const { cardId, form, set, next, skip, jumpTo, handleSubmit, submitting, searchParams, isPrefilled, hasPrefill, dreLooking, dreResult, lookupDre } = p;

  // ── Card 1: Identity ───────────────────────────────────────
  if (cardId === 1) return (
    <div>
      <CardHeader title="Let's confirm your details"
        subtitle={hasPrefill ? "Most of this is already filled in from your PRISM Scan." : "Tell us about yourself so we can get started."} />
      <Fields>
        <FieldGroup label="Full Name" required>
          <TextInput value={form.fullName} onChange={(v) => set("fullName", v)} />
        </FieldGroup>
        <FieldGroup label="Email" required hint={form.signupEmail && form.email !== form.signupEmail ? `Account email: ${form.signupEmail}` : undefined}>
          <TextInput value={form.email} onChange={(v) => set("email", v)} type="email" />
        </FieldGroup>
        <FieldGroup label="Phone" required>
          <TextInput value={form.phone} onChange={(v) => {
            const digits = v.replace(/\D/g, '').slice(0, 10);
            let formatted = digits;
            if (digits.length > 6) formatted = `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
            else if (digits.length > 3) formatted = `(${digits.slice(0,3)}) ${digits.slice(3)}`;
            else if (digits.length > 0) formatted = `(${digits}`;
            set("phone", formatted);
          }} type="tel" placeholder="(858) 555-1234" />
        </FieldGroup>
      </Fields>
      <NextButton onClick={next} />
    </div>
  );

  // ── Card 2: Practice ───────────────────────────────────────
  if (cardId === 2) return (
    <div>
      <CardHeader title="About Your Business" subtitle="Confirm or update your brokerage details." />
      <Fields>
        <FieldGroup label="Brokerage / Company" required prefilled={isPrefilled("brokerage")}>
          <TextInput value={form.brokerage} onChange={(v) => set("brokerage", v)} />
        </FieldGroup>
        <FieldGroup label="Title / Role" hint="e.g., Luxury Real Estate Agent">
          <TextInput value={form.title} onChange={(v) => set("title", v)} />
        </FieldGroup>
        <FieldGroup label="Your DRE #" required hint="CA DRE # — required on all advertising">
          <div style={{ display: "flex", gap: "8px", alignItems: "stretch" }}>
            <div style={{ flex: 1 }}>
              <TextInput value={form.licenseNumber} onChange={(v) => {
                set("licenseNumber", v);
                // Auto-lookup on blur-like behavior: when 8 digits entered
                if (v.replace(/\D/g, '').length === 8) lookupDre(v);
              }} />
            </div>
            <button onClick={() => lookupDre(form.licenseNumber)} disabled={dreLooking || form.licenseNumber.replace(/\D/g, '').length < 7}
              style={{
                padding: "0 16px", background: dreLooking ? "#94a3b8" : "#00BFA6", color: "#fff",
                border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600,
                cursor: dreLooking ? "not-allowed" : "pointer", whiteSpace: "nowrap",
                opacity: form.licenseNumber.replace(/\D/g, '').length < 7 ? 0.5 : 1,
              }}>
              {dreLooking ? "..." : "Look up"}
            </button>
          </div>
          {dreResult && (
            <p style={{
              fontSize: "12px", margin: "6px 0 0",
              color: dreResult.startsWith("✓") ? "#00BFA6" : "#D4A830",
              fontWeight: 600,
            }}>{dreResult}</p>
          )}
        </FieldGroup>
        <FieldGroup label="Broker DRE #" prefilled={isPrefilled("brokerDre")} hint="Your brokerage's license number — required on all advertising">
          <TextInput value={form.brokerDre} onChange={(v) => set("brokerDre", v)} />
        </FieldGroup>
        <FieldGroup label="Brokerage office address" prefilled={isPrefilled("brokerageAddress")}
          hint="Must match exactly across all platforms — AI uses this to verify you">
          <TextInput value={form.brokerageAddress} onChange={(v) => set("brokerageAddress", v)} />
        </FieldGroup>
        <FieldGroup label="Years in your market">
          <select value={form.yearsInMarket} onChange={(e) => set("yearsInMarket", e.target.value)} style={selectStyle}>
            <option value="">Select...</option>
            {["1-2", "3-4", "5-9", "10-14", "15-19", "20+"].map((v) => <option key={v} value={v}>{v} years</option>)}
          </select>
        </FieldGroup>
      </Fields>
      <NextButton onClick={next} />
    </div>
  );

  // ── Card 3: Micro-Reward ───────────────────────────────────
  if (cardId === 3) return (
    <MicroReward
      message="Great — we've got your details. Next up: what makes you stand out."
      nextHint="This is the most important part of the intake."
      onContinue={next}
    />
  );

  // ── Card 4: Differentiator ─────────────────────────────────
  if (cardId === 4) return (
    <div>
      <CardHeader title="What makes you different?"
        subtitle="Just a quick 1–2 sentences on what separates you from the pack. Don't overthink it — write what comes to mind and we'll extract the gold." />
      <FieldGroup label="" hint="Your approach, your track record, what you do that others don't. This feeds your entire positioning — we'll craft it from here.">
        <TextArea value={form.differentiator} onChange={(v) => set("differentiator", v)} rows={4}
          placeholder={'e.g., "I specialize in off-market properties in RSF" or "My clients\u2019 homes sell 15% faster than market average."'} />
      </FieldGroup>
      <NextButton onClick={next} />
      <SkipButton onClick={() => skip("differentiator")} label={"Skip for now — I'll think about this →"} />
    </div>
  );

  // ── Card 5: Voice Capture ──────────────────────────────────
  if (cardId === 5) return (
    <div>
      <CardHeader title="What do clients say about you?"
        subtitle="This helps us write in your voice — not a generic agent voice." />
      <FieldGroup label="" hint="What's the compliment you hear most? What do clients tell their friends?">
        <TextArea value={form.voiceCapture} onChange={(v) => set("voiceCapture", v)} rows={3}
          placeholder={'e.g., "Clients always say I made a stressful process feel easy."'} />
      </FieldGroup>
      <NextButton onClick={next} />
      <SkipButton onClick={() => skip("voiceCapture")} />
    </div>
  );

  // ── Card 6: Notable Transaction ────────────────────────────
  if (cardId === 6) return (
    <div>
      <CardHeader title="One deal you want to be known for"
        subtitle="This becomes the hero deal in your bio and articles." />
      <Fields>
        {form.transactions.map((tx, i) => {
          const parts = tx.split("||");
          const addr = parts[0] || "";
          const story = parts[1] || "";
          return (
            <div key={i} style={{ background: "#f8f9fa", borderRadius: "10px", padding: "14px 16px", display: "flex", flexDirection: "column", gap: "10px" }}>
              {form.transactions.length > 1 && (
                <p style={{ fontSize: "12px", fontWeight: 700, color: "#94a3b8", margin: 0, textTransform: "uppercase", letterSpacing: "0.5px" }}>Deal {i + 1}</p>
              )}
              <FieldGroup label="Address & price" hint="e.g., 7911 Calle Posada, Carlsbad — $2.1M">
                <TextInput value={addr} onChange={(v) => { const u = [...form.transactions]; u[i] = v + "||" + story; set("transactions", u); }} />
              </FieldGroup>
              <FieldGroup label="What made it memorable" hint="e.g., Sold 8% above asking in 12 days, multiple offers">
                <TextInput value={story} onChange={(v) => { const u = [...form.transactions]; u[i] = addr + "||" + v; set("transactions", u); }} />
              </FieldGroup>
            </div>
          );
        })}
        {form.transactions.length < 3 && (
          <button onClick={() => set("transactions", [...form.transactions, ""])} style={{
            background: "none", border: "1px dashed #cbd5e1", borderRadius: "8px",
            padding: "10px", color: "#00BFA6", fontSize: "13px", fontWeight: 600,
            cursor: "pointer", width: "100%",
          }}>+ Add another notable deal</button>
        )}
        {/* MLS — done for CA/WA, upload for others */}
        <div style={{ marginTop: "8px", padding: "12px 16px", background: "#f0fdf9", borderRadius: "8px", border: "1px solid rgba(0,191,166,0.15)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div onClick={() => set("mlsDoneForYou", !form.mlsDoneForYou)} style={{
                width: "20px", height: "20px", borderRadius: "4px", cursor: "pointer", flexShrink: 0,
                background: form.mlsDoneForYou ? "#00BFA6" : "#fff",
                border: `2px solid ${form.mlsDoneForYou ? "#00BFA6" : "#cbd5e1"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {form.mlsDoneForYou && <span style={{ color: "#fff", fontSize: "14px", lineHeight: 1 }}>✓</span>}
              </div>
              <span style={{ fontSize: "13px", color: "#0A1929", fontWeight: 500 }}>MLS transaction data</span>
            </div>
            <span style={{ fontSize: "12px", color: form.mlsDoneForYou ? "#00BFA6" : "#94a3b8", fontWeight: 600 }}>
              {form.mlsDoneForYou ? "CITED handles this" : "Upload needed"}
            </span>
          </div>
          {!form.mlsDoneForYou && (
            <div style={{ marginTop: "12px" }}>
              <FileInput accept=".csv,.pdf,.xlsx,.xls" file={form.mlsFile} onChange={(f) => set("mlsFile", f)} icon={"📎"} label="Upload MLS export (CSV, PDF, or Excel)" />
            </div>
          )}
        </div>
      </Fields>
      <NextButton onClick={next} />
      <SkipButton onClick={() => skip("transactions")} />
    </div>
  );

  // ── Card 7: Photos ─────────────────────────────────────────
  if (cardId === 7) return (
    <div>
      <CardHeader title="Your photos" subtitle="We'll resize for all 13+ platforms. You can always add these later." />
      <Fields>
        <FieldGroup label="Professional headshot" hint="Minimum 400×400px, JPG or PNG">
          <FileInput accept="image/*" file={form.headshotFile} onChange={(f) => set("headshotFile", f)} icon={"📷"} label="Choose headshot" />
        </FieldGroup>
        <FieldGroup label="Landscape / market photo" hint="One great shot — property, neighborhood, or market. We'll create all banners from this.">
          <FileInput accept="image/*" file={form.landscapeFile} onChange={(f) => set("landscapeFile", f)} icon={"🖼"} label="Choose landscape photo" />
        </FieldGroup>
      </Fields>
      <NextButton onClick={next} />
      <SkipButton onClick={() => {
        if (!form.headshotFile) p.addSkipped("headshot");
        if (!form.landscapeFile) p.addSkipped("landscape_photo");
        skip();
      }} label={"Skip — I'll add photos later →"} />
    </div>
  );

  // ── Cards 8-21: Individual Platform Cards ──────────────────
  if (cardId >= PLATFORM_START_CARD && cardId < SUMMARY_CARD) {
    const idx = cardId - PLATFORM_START_CARD;
    const plat = PLATFORMS[idx];
    const statusVal = form[plat.statusKey] as string;
    const urlVal = plat.urlKey ? (form[plat.urlKey] as string) : "";
    const urlPrefilled = plat.urlKey ? isPrefilled(plat.urlKey) : false;

    return (
      <div>
        <div style={{ marginBottom: "20px" }}>
          <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#0A1929", margin: "0 0 6px" }}>{plat.label}</h2>
          <span style={{ fontSize: "11px", fontWeight: 700, color: IMPACT_COLORS[plat.impact], background: `${IMPACT_COLORS[plat.impact]}10`, padding: "3px 10px", borderRadius: "10px", letterSpacing: "0.3px" }}>
            {IMPACT_LABELS[plat.impact]}
          </span>
        </div>

        <p style={{ fontSize: "14px", color: "#475569", margin: "0 0 16px" }}>Do you have a {plat.label} profile?</p>

        <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
          {(["yes", "no", "not_sure"] as const).map((val) => (
            <button key={val} onClick={() => {
              set(plat.statusKey as keyof FormData, val);
              if (val !== "yes") setTimeout(() => next(), 300);
            }} style={{
              flex: 1, padding: "12px", borderRadius: "10px", fontSize: "14px", fontWeight: 600,
              border: `2px solid ${statusVal === val ? "#00BFA6" : "#e2e8f0"}`,
              background: statusVal === val ? "rgba(0,191,166,0.06)" : "#fff",
              color: statusVal === val ? "#00BFA6" : "#64748b",
              cursor: "pointer", transition: "all 0.15s",
            }}>
              {val === "yes" ? "Yes" : val === "no" ? "No" : "Not sure"}
            </button>
          ))}
        </div>

        {statusVal === "yes" && plat.urlKey && (
          <FieldGroup label="Profile URL" prefilled={urlPrefilled}>
            <TextInput value={urlVal} onChange={(v) => set(plat.urlKey as keyof FormData, v)} type="url"
              placeholder={`https://${plat.label.toLowerCase().replace(/\s+/g, "")}.com/...`} />
          </FieldGroup>
        )}



        {statusVal === "yes" && <NextButton onClick={next} />}
        {!statusVal && <SkipButton onClick={() => { skip(plat.key + "_platform"); }} label="Skip — CITED will find it →" />}
      </div>
    );
  }

  // ── Summary Card ────────────────────────────────────────────
  if (cardId === SUMMARY_CARD) return (
    <div>
      <CardHeader title="Review & submit" subtitle="Everything look right? Tap any section to make changes." />
      <Fields gap={12}>
        <SummarySection title="About You" onEdit={() => jumpTo(1)}>
          <SumRow label="Name" value={form.fullName} />
          <SumRow label="Email" value={form.email} />
          <SumRow label="Phone" value={form.phone || "—"} />
          <SumRow label="Brokerage" value={form.brokerage} />
          <SumRow label="License" value={form.licenseNumber} />
        </SummarySection>
        <SummarySection title="Your Story" onEdit={() => jumpTo(4)}>
          <SumRow label="What makes you different" value={form.differentiator ? (form.differentiator.length > 80 ? form.differentiator.slice(0, 80) + "..." : form.differentiator) : "⚠️ Skipped"} />
          <SumRow label="Client voice" value={form.voiceCapture ? (form.voiceCapture.length > 60 ? form.voiceCapture.slice(0, 60) + "..." : form.voiceCapture) : "Skipped"} />
          <SumRow label="Notable deals" value={form.transactions.filter(Boolean).length > 0 ? `${form.transactions.filter(Boolean).length} provided` : "Skipped"} />
        </SummarySection>
        <SummarySection title="Photos & Platforms" onEdit={() => jumpTo(7)}>
          <SumRow label="Headshot" value={form.headshotFile ? "✅ Uploaded" : "⚠️ Not yet"} />
          <SumRow label="Landscape" value={form.landscapeFile ? "✅ Uploaded" : "Not yet"} />
          <SumRow label="Platforms" value={`${countPlatformsConfirmed(form)} confirmed`} />
        </SummarySection>

        {form.skippedFields.length > 0 && (
          <div style={{ background: "rgba(212,168,48,0.08)", border: "1px solid rgba(212,168,48,0.2)", borderRadius: "8px", padding: "12px 16px" }}>
            <p style={{ fontSize: "13px", color: "#92710a", margin: 0 }}>
              You skipped {form.skippedFields.length} item{form.skippedFields.length > 1 ? "s" : ""}. We'll follow up so you can add {form.skippedFields.length > 1 ? "these" : "this"} later.
            </p>
          </div>
        )}
      </Fields>

      <p style={{ fontSize: "12px", color: "#94a3b8", textAlign: "center", margin: "20px 0 12px", lineHeight: 1.6 }}>
        Your data is used exclusively to optimize your AI citation visibility. We never share or sell your information.{" "}
        <a href="/privacy" style={{ color: "#64748b" }}>Privacy Policy</a>{" · "}
        <a href="/terms" style={{ color: "#64748b" }}>Terms</a>
      </p>

      <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer", marginBottom: "16px" }}>
        <input type="checkbox" checked={form.termsAccepted} onChange={(e) => set("termsAccepted", e.target.checked)}
          style={{ accentColor: "#00BFA6", width: "18px", height: "18px", marginTop: "2px", flexShrink: 0 }} />
        <span style={{ fontSize: "13px", color: "#0A1929", lineHeight: 1.5 }}>
          I agree to CITED&apos;s <a href="/terms" style={{ color: "#00BFA6" }}>Terms of Service</a> and{" "}
          <a href="/privacy" style={{ color: "#00BFA6" }}>Privacy Policy</a>, and understand the first 90 days are free.
        </span>
      </label>

      <button onClick={handleSubmit} disabled={submitting} style={{
        width: "100%", padding: "16px", background: "#00BFA6", color: "#fff", border: "none",
        borderRadius: "10px", fontSize: "16px", fontWeight: 700, cursor: submitting ? "not-allowed" : "pointer",
        opacity: submitting ? 0.6 : 1,
      }}>
        {submitting ? "Submitting..." : "Start My Optimization →"}
      </button>
    </div>
  );

  // ── Celebration Card ────────────────────────────────────────
  if (cardId === CELEBRATION_CARD) {
    const firstName = form.fullName.split(" ")[0] || "there";
    return (
    <div style={{ textAlign: "center", padding: "20px 0" }}>
      {/* Animated check circle with pulse */}
      <style>{`
        @keyframes checkPulse {
          0% { transform: scale(0.6); opacity: 0; }
          60% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes confettiDrop {
          0% { transform: translateY(-20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .check-circle { animation: checkPulse 0.5s ease forwards; }
        .confetti-bar { animation: confettiDrop 0.6s ease 0.3s both; }
      `}</style>
      <div className="check-circle" style={{
        width: "96px", height: "96px", borderRadius: "50%", margin: "0 auto 20px",
        background: "linear-gradient(135deg, rgba(0,191,166,0.25), rgba(0,230,200,0.1))",
        border: "3px solid #00BFA6", display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#00BFA6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      {/* Confetti accent */}
      <div className="confetti-bar" style={{ display: "flex", justifyContent: "center", gap: "6px", marginBottom: "20px" }}>
        {["#00BFA6", "#D4A830", "#00BFA6", "#fff", "#00BFA6", "#D4A830", "#00BFA6"].map((c, i) => (
          <div key={i} style={{ width: "8px", height: "8px", borderRadius: "2px", background: c, opacity: 0.7, transform: `rotate(${i * 15}deg)` }} />
        ))}
      </div>

      <h1 style={{ fontSize: "30px", fontWeight: 800, color: "#fff", margin: "0 0 6px" }}>
        Welcome to CITED, {firstName}.
      </h1>
      <p style={{ fontSize: "16px", color: "#00BFA6", fontWeight: 600, margin: "0 0 28px" }}>
        Your business &amp; visibility audit has started.
      </p>

      {/* Next steps */}
      <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "24px", marginBottom: "24px", textAlign: "left" }}>
        <p style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", letterSpacing: "1.5px", margin: "0 0 16px", textTransform: "uppercase" }}>What happens next</p>
        {[
          ["①", "We're analyzing your markets, your competitors, and your current AI visibility right now."],
          ["②", "Your positioning statement will be ready for review within 48 hours."],
          ["③", "Your optimized profiles and first article brief follow from there."],
        ].map(([num, text], i) => (
          <div key={i} style={{ display: "flex", gap: "14px", marginBottom: i < 2 ? "16px" : 0, alignItems: "flex-start" }}>
            <span style={{ color: "#00BFA6", fontWeight: 800, fontSize: "18px", flexShrink: 0, lineHeight: 1.3 }}>{num}</span>
            <p style={{ fontSize: "14px", color: "#cbd5e1", lineHeight: 1.7, margin: 0 }}>{text}</p>
          </div>
        ))}
      </div>

      <p style={{ fontSize: "14px", color: "#94a3b8", margin: "0 0 24px" }}>
        We&apos;ll be in touch personally within 24 hours.
      </p>

      <a href={`/score/${form.fullName.toLowerCase().replace(/\s+/g, '-')}`} style={{ display: "inline-block", background: "#00BFA6", color: "#fff", fontWeight: 700, fontSize: "15px", padding: "14px 36px", borderRadius: "10px", textDecoration: "none" }}>
        View My Score →
      </a>
    </div>
  );}

  return null;
}

// ── Helper: count platforms confirmed ────────────────────────

function countPlatformsConfirmed(form: FormData): number {
  return PLATFORMS.filter((p) => form[p.statusKey] === "yes").length;
}

// ═══════════════════════════════════════════════════════════════
// REUSABLE COMPONENTS
// ═══════════════════════════════════════════════════════════════

const inputBaseStyle: React.CSSProperties = {
  width: "100%", padding: "12px 14px", borderRadius: "8px",
  border: "1px solid #D1D5DB", fontSize: "14px", color: "#0A1929",
  background: "#FAFAFA", outline: "none", transition: "border-color 0.15s",
  boxSizing: "border-box",
};

const selectStyle: React.CSSProperties = {
  ...inputBaseStyle,
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394a3b8' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center", paddingRight: "32px",
  appearance: "none" as const,
};

function Fields({ children, gap = 16 }: { children: React.ReactNode; gap?: number }) {
  return <div style={{ display: "flex", flexDirection: "column", gap: `${gap}px` }}>{children}</div>;
}

function TextInput({ value, onChange, type = "text", placeholder, inputMode }: {
  value: string; onChange: (v: string) => void; type?: string; placeholder?: string; inputMode?: string;
}) {
  return (
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder} inputMode={inputMode as never} style={inputBaseStyle}
      onFocus={(e) => { e.target.style.borderColor = "#00BFA6"; }}
      onBlur={(e) => { e.target.style.borderColor = "#D1D5DB"; }} />
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
      onBlur={(e) => { e.target.style.borderColor = "#D1D5DB"; }} />
  );
}

function FileInput({ accept, file, onChange, icon = "📎", label = "Choose file" }: {
  accept: string; file: File | null; onChange: (f: File | null) => void; icon?: string; label?: string;
}) {
  return (
    <label style={{
      display: "flex", alignItems: "center", gap: "12px", border: "1px solid #D1D5DB",
      borderRadius: "8px", padding: "12px 16px", cursor: "pointer", background: "#FAFAFA",
    }}>
      <input type="file" accept={accept} style={{ display: "none" }}
        onChange={(e) => onChange(e.target.files?.[0] ?? null)} />
      <span style={{ fontSize: "20px" }}>{icon}</span>
      <span style={{ fontSize: "14px", color: file ? "#0A1929" : "#94a3b8" }}>{file ? file.name : label}</span>
    </label>
  );
}

function FieldGroup({ label, required, hint, prefilled, children }: {
  label: string; required?: boolean; hint?: string; prefilled?: boolean; children: React.ReactNode;
}) {
  return (
    <div>
      {label && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "14px", fontWeight: 600, color: "#0A1929" }}>
            {label}{required && <span style={{ color: "#DC2626" }}> *</span>}
          </span>
          {prefilled && (
            <span style={{
              fontSize: "11px", fontWeight: 600, color: "#00BFA6",
              background: "rgba(0,191,166,0.08)", padding: "2px 8px", borderRadius: "10px",
            }}>From CITED PRISM Scan</span>
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
      width: "100%", padding: "14px", background: "#00BFA6", color: "#fff", border: "none",
      borderRadius: "10px", fontSize: "15px", fontWeight: 700, cursor: "pointer", marginTop: "24px",
    }}>{label}</button>
  );
}

function SkipButton({ onClick, label = "Skip for now →" }: { onClick: () => void; label?: string }) {
  return (
    <button onClick={onClick} style={{
      width: "100%", padding: "10px", background: "none", color: "#94a3b8",
      border: "none", fontSize: "13px", cursor: "pointer", marginTop: "8px",
    }}>{label}</button>
  );
}

function MicroReward({ message, nextHint, onContinue }: { message: string; nextHint: string; onContinue: () => void }) {
  return (
    <div style={{ textAlign: "center", padding: "8px 0" }}>
      <div style={{
        width: "52px", height: "52px", borderRadius: "50%", margin: "0 auto 16px",
        background: "rgba(0,191,166,0.1)", display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00BFA6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </div>
      <p style={{ fontSize: "15px", color: "#0A1929", lineHeight: 1.6, margin: "0 0 8px", fontWeight: 500 }}>{message}</p>
      <p style={{ fontSize: "13px", color: "#94a3b8", margin: "0 0 20px" }}>{nextHint}</p>
      <NextButton onClick={onContinue} label="Keep going →" />
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

function SummarySection({ title, onEdit, children }: { title: string; onEdit: () => void; children: React.ReactNode }) {
  return (
    <div style={{ border: "1px solid #e2e8f0", borderRadius: "10px", padding: "14px 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
        <span style={{ fontSize: "13px", fontWeight: 700, color: "#0A1929", textTransform: "uppercase", letterSpacing: "0.5px" }}>{title}</span>
        <button onClick={onEdit} style={{ background: "none", border: "none", color: "#00BFA6", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>Change</button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>{children}</div>
    </div>
  );
}

function SumRow({ label, value }: { label: string; value: string }) {
  const isWarning = value.includes("⚠");
  return (
    <div style={{ display: "flex", fontSize: "13px", lineHeight: 1.5, gap: "8px" }}>
      <span style={{ color: "#94a3b8", minWidth: "100px", maxWidth: "140px", flexShrink: 0 }}>{label}</span>
      <span style={{ color: isWarning ? "#D4A830" : "#0A1929", fontWeight: isWarning ? 600 : 400, wordBreak: "break-word" }}>{value || "—"}</span>
    </div>
  );
}

// ── Page Export ─────────────────────────────────────────────────

export default function IntakePage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>Loading...</div>}>
      <IntakeForm />
    </Suspense>
  );
}
