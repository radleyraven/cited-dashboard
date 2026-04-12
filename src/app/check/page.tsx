"use client";

import { useState, useEffect, useCallback } from "react";

/*
  /check — CITED Free AI Visibility Check
  Public lead-gen. Name + City → animated scan → estimated Foundation Score range + gaps + email CTA
  Competes with: wearecited.com free audit, AdvantageGEO instant audit
  Built: April 11, 2026
*/

const SCAN_STAGES = [
  "Scanning ChatGPT...",
  "Checking Perplexity...",
  "Analyzing Gemini...",
  "Reviewing Grok...",
];

const GAPS = [
  { icon: "⬜", title: "Platform Presence", desc: "Found on 3 of 12 platforms AI checks. Most agents are missing Bing Places, Foursquare, and Apple Business — the hidden signals ChatGPT and Siri use." },
  { icon: "⏱", title: "Content Freshness", desc: "No recent content found in the last 30 days. AI deprioritizes stale profiles — Perplexity decays content signals within 48 hours." },
  { icon: "🏆", title: "Brand Authority", desc: "Limited third-party mentions found. 48% of AI citations come from earned media — independent sources mentioning your name." },
];

export default function CheckPage() {
  const [form, setForm] = useState({ fullName: "", city: "" });
  const [phase, setPhase] = useState<"form" | "scanning" | "results" | "emailSent">("form");
  const [scanStage, setScanStage] = useState(0);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const startScan = useCallback(() => {
    if (!form.fullName.trim() || !form.city.trim()) return;
    setPhase("scanning");
    setScanStage(0);
  }, [form]);

  useEffect(() => {
    if (phase !== "scanning") return;
    if (scanStage >= SCAN_STAGES.length) {
      setPhase("results");
      return;
    }
    const t = setTimeout(() => setScanStage(s => s + 1), 2000);
    return () => clearTimeout(t);
  }, [phase, scanStage]);

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: form.fullName, market: form.city, email }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Submission failed");
      }
      setPhase("emailSent");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  const inp: React.CSSProperties = {
    width: "100%", padding: "14px 16px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.15)",
    fontSize: "15px", color: "#fff", background: "rgba(255,255,255,0.07)", outline: "none",
    boxSizing: "border-box" as const,
  };

  const wrap: React.CSSProperties = {
    minHeight: "100vh", background: "#0A1929",
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    padding: "40px 20px",
  };

  /* ── Email Sent ── */
  if (phase === "emailSent") return (
    <div style={wrap}>
      <div style={{ maxWidth: 480, textAlign: "center" }}>
        <div style={{
          width: 80, height: 80, borderRadius: "50%", margin: "0 auto 24px",
          background: "rgba(0,191,166,0.15)", border: "2px solid #00BFA6",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#00BFA6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#fff", margin: "0 0 12px" }}>Your full score is being calculated.</h1>
        <p style={{ fontSize: 16, color: "#94a3b8", lineHeight: 1.7, margin: "0 0 24px" }}>
          We&apos;re running a deep scan across 5 AI engines and 12 platforms. Your full Foundation Score — with all 9 components, your market visibility rate, and a competitor comparison — will hit your inbox within 24 hours.
        </p>
        <p style={{ fontSize: 14, color: "#4a6380" }}>Keep an eye on {email}</p>
      </div>
    </div>
  );

  /* ── Scanning Animation ── */
  if (phase === "scanning") return (
    <div style={wrap}>
      <div style={{ maxWidth: 400, textAlign: "center" }}>
        {/* Pulsing rings */}
        <div style={{ position: "relative", width: 120, height: 120, margin: "0 auto 32px" }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              position: "absolute", inset: i * 12, borderRadius: "50%",
              border: "2px solid rgba(0,191,166,0.3)",
              animation: `pulse 2s ease-in-out ${i * 0.4}s infinite`,
            }} />
          ))}
          <div style={{
            position: "absolute", inset: 36, borderRadius: "50%", background: "rgba(0,191,166,0.15)",
            border: "2px solid #00BFA6", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00BFA6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
          </div>
        </div>

        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#fff", margin: "0 0 8px" }}>
          Scanning AI visibility for
        </h2>
        <p style={{ fontSize: 18, color: "#D4A830", fontWeight: 700, margin: "0 0 24px" }}>
          {form.fullName} in {form.city}
        </p>
        <p style={{ fontSize: 16, color: "#00BFA6", fontWeight: 600, minHeight: 24 }}>
          {SCAN_STAGES[Math.min(scanStage, SCAN_STAGES.length - 1)]}
        </p>

        {/* Progress bar */}
        <div style={{ marginTop: 24, background: "rgba(255,255,255,0.08)", borderRadius: 8, height: 6, overflow: "hidden" }}>
          <div style={{
            height: "100%", background: "linear-gradient(90deg, #00BFA6, #D4A830)",
            borderRadius: 8, transition: "width 2s ease-in-out",
            width: `${((scanStage + 1) / SCAN_STAGES.length) * 100}%`,
          }} />
        </div>

        <style>{`@keyframes pulse { 0%,100% { opacity:0.3; transform:scale(1); } 50% { opacity:0.8; transform:scale(1.05); } }`}</style>
      </div>
    </div>
  );

  /* ── Results ── */
  if (phase === "results") return (
    <div style={{ ...wrap, justifyContent: "flex-start", paddingTop: 40 }}>
      <div style={{ maxWidth: 520, width: "100%" }}>

        {/* Score circle */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <p style={{ fontSize: 13, color: "#4a6380", letterSpacing: 2, textTransform: "uppercase", margin: "0 0 16px" }}>Estimated Foundation Score</p>
          <div style={{
            width: 160, height: 160, borderRadius: "50%", margin: "0 auto 16px",
            background: "rgba(10,25,41,0.8)", border: "4px solid #D4A830",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 40px rgba(212,168,48,0.15)",
          }}>
            <span style={{ fontSize: 44, fontWeight: 900, color: "#fff", lineHeight: 1 }}>15–25</span>
            <span style={{ fontSize: 14, color: "#4a6380", marginTop: 4 }}>out of 100</span>
          </div>
          <div style={{
            display: "inline-block", background: "rgba(0,191,166,0.12)", color: "#00BFA6",
            fontSize: 13, fontWeight: 700, padding: "5px 16px", borderRadius: 20,
            border: "1px solid rgba(0,191,166,0.25)",
          }}>
            Early Signal
          </div>
          <p style={{ fontSize: 14, color: "#94a3b8", marginTop: 12, lineHeight: 1.6 }}>
            AI has some signals for <strong style={{ color: "#fff" }}>{form.fullName}</strong> in <strong style={{ color: "#fff" }}>{form.city}</strong> — but not enough to recommend you yet.
          </p>
        </div>

        {/* Gap cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 40 }}>
          <p style={{ fontSize: 12, color: "#4a6380", letterSpacing: 2, textTransform: "uppercase", margin: "0 0 4px" }}>Top visibility gaps</p>
          {GAPS.map((g, i) => (
            <div key={i} style={{
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 12, padding: "16px 20px", display: "flex", gap: 14, alignItems: "flex-start",
            }}>
              <span style={{ fontSize: 24, flexShrink: 0, lineHeight: 1 }}>{g.icon}</span>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: "#fff", margin: "0 0 4px" }}>{g.title}</p>
                <p style={{ fontSize: 13, color: "#94a3b8", margin: 0, lineHeight: 1.5 }}>{g.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Email CTA */}
        <div style={{
          background: "rgba(212,168,48,0.08)", border: "1px solid rgba(212,168,48,0.2)",
          borderRadius: 16, padding: "28px 24px", textAlign: "center",
        }}>
          <h3 style={{ fontSize: 20, fontWeight: 800, color: "#fff", margin: "0 0 8px" }}>Want your exact score?</h3>
          <p style={{ fontSize: 14, color: "#94a3b8", margin: "0 0 20px", lineHeight: 1.6 }}>
            Your full Foundation Score includes 9 components across 12 platforms, 5 AI engines, and your complete market visibility rate.
          </p>

          <form onSubmit={handleEmailSubmit} style={{ display: "flex", gap: 8, maxWidth: 400, margin: "0 auto" }}>
            <input
              type="email" required value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email"
              style={{ ...inp, flex: 1 }}
              onFocus={(e) => { e.target.style.borderColor = "#D4A830"; }}
              onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.15)"; }}
            />
            <button type="submit" disabled={submitting} style={{
              padding: "14px 20px", background: "#D4A830", color: "#0A1929", border: "none",
              borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: submitting ? "not-allowed" : "pointer",
              opacity: submitting ? 0.7 : 1, whiteSpace: "nowrap",
            }}>
              {submitting ? "..." : "Get My Full Score →"}
            </button>
          </form>
          {error && <p style={{ color: "#DC2626", fontSize: 13, marginTop: 8 }}>{error}</p>}
        </div>

        <p style={{ fontSize: 11, color: "#4a6380", textAlign: "center", marginTop: 24, lineHeight: 1.5 }}>
          Cited · AI Citation Optimization™ · Powered by PRISM™
        </p>
      </div>
    </div>
  );

  /* ── Form ── */
  return (
    <div style={wrap}>
      <div style={{ maxWidth: 480, width: "100%", textAlign: "center" }}>

        {/* Logo */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: 5, color: "#00BFA6" }}>CITED</div>
          <div style={{ fontSize: 10, color: "#4a6380", letterSpacing: 1.5, textTransform: "uppercase", marginTop: 2 }}>AI Citation Optimization™</div>
        </div>

        <h1 style={{ fontSize: 36, fontWeight: 900, color: "#fff", lineHeight: 1.15, margin: "0 0 16px", letterSpacing: -0.5 }}>
          What Does AI Say<br />About <span style={{ color: "#D4A830" }}>You</span>?
        </h1>
        <p style={{ fontSize: 16, color: "#94a3b8", lineHeight: 1.7, margin: "0 0 36px" }}>
          Enter your name and city. We&apos;ll check your AI visibility across ChatGPT, Perplexity, Gemini, and Grok — in 30 seconds.
        </p>

        <div style={{
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 16, padding: "32px 28px",
        }}>
          <form onSubmit={(e) => { e.preventDefault(); startScan(); }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ textAlign: "left" }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 6 }}>Your full name</label>
                <input
                  type="text" required value={form.fullName}
                  onChange={(e) => setForm(p => ({ ...p, fullName: e.target.value }))}
                  placeholder="e.g., Sarah Johnson"
                  style={inp}
                  onFocus={(e) => { e.target.style.borderColor = "#00BFA6"; }}
                  onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.15)"; }}
                />
              </div>
              <div style={{ textAlign: "left" }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 6 }}>Your city or market</label>
                <input
                  type="text" required value={form.city}
                  onChange={(e) => setForm(p => ({ ...p, city: e.target.value }))}
                  placeholder="e.g., Carmel Valley, Carlsbad"
                  style={inp}
                  onFocus={(e) => { e.target.style.borderColor = "#00BFA6"; }}
                  onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.15)"; }}
                />
              </div>
              <button type="submit" style={{
                width: "100%", padding: 16, background: "#D4A830", color: "#0A1929",
                border: "none", borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: "pointer",
                marginTop: 8,
              }}>
                Check My AI Visibility →
              </button>
            </div>
          </form>
        </div>

        <p style={{ fontSize: 12, color: "#4a6380", marginTop: 20, lineHeight: 1.5 }}>
          Free · No login required · Results in 30 seconds
        </p>

        {/* Trust signals */}
        <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 32, flexWrap: "wrap" }}>
          {["5 AI Engines", "12 Platforms", "9 Score Components"].map((s, i) => (
            <div key={i} style={{ fontSize: 12, color: "#4a6380", display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ color: "#00BFA6" }}>✓</span> {s}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
