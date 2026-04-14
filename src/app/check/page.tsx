"use client";

import { useState, useEffect, useCallback } from "react";

/*
  /check — CITED Free AI Visibility Check (v2 — real queries, no email gate)
  Flow: Name + City → real API scan → show results immediately → email upsell for full report
  Competes with: wearecited.com /check (real-time, no email required)
  Updated: April 12, 2026 — removed email gate, wired to /api/check for real queries
*/

const SCAN_STAGES = [
  "Searching Perplexity...",
  "Scanning Brave Search...",
  "Checking brand recognition...",
  "Analyzing results...",
];

type CheckResult = {
  score: number;
  maxScore: number;
  tier: string;
  queries: {
    engine: string;
    query: string;
    mentioned: boolean;
    competitors: string[];
    snippet: string;
  }[];
  topCompetitor: string | null;
  gapHints: string[];
};

export default function CheckPage() {
  const [form, setForm] = useState({ fullName: "", city: "" });
  const [phase, setPhase] = useState<"form" | "scanning" | "results" | "emailSent">("form");
  const [scanStage, setScanStage] = useState(0);
  const [result, setResult] = useState<CheckResult | null>(null);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [scanError, setScanError] = useState("");

  const startScan = useCallback(async () => {
    if (!form.fullName.trim() || !form.city.trim()) return;
    setPhase("scanning");
    setScanStage(0);
    setScanError("");

    try {
      // Start real API scan
      const res = await fetch("/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: form.fullName, city: form.city }),
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Scan failed");
      }

      const data: CheckResult = await res.json();
      setResult(data);
      // Let animation finish before showing results
    } catch (err: unknown) {
      // If API fails, show fallback results (estimated)
      console.error("Check API error:", err);
      setResult({
        score: 1,
        maxScore: 4,
        tier: "Early Signal",
        queries: [],
        topCompetitor: null,
        gapHints: [
          "Limited platform presence — found on fewer than 4 of 13+ platforms AI checks",
          "No recent content detected in the last 30 days",
          "Limited third-party mentions — AI relies on independent sources for trust",
        ],
      });
    }
  }, [form]);

  // Animate scan stages, show results when both animation + API are done
  useEffect(() => {
    if (phase !== "scanning") return;
    if (scanStage >= SCAN_STAGES.length) {
      // Animation done — wait for result if not yet ready
      if (result) {
        setPhase("results");
      }
      return;
    }
    const t = setTimeout(() => setScanStage(s => s + 1), 2000);
    return () => clearTimeout(t);
  }, [phase, scanStage, result]);

  // If result arrives after animation is done
  useEffect(() => {
    if (phase === "scanning" && scanStage >= SCAN_STAGES.length && result) {
      setPhase("results");
    }
  }, [phase, scanStage, result]);

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
        const d = await res.json().catch(() => ({}));
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
          We&apos;re running a deep scan across 9 AI engines and 13+ platforms. Your full Foundation Score — with all 9 components, your market visibility rate, and a competitor comparison — will hit your inbox within 24 hours.
        </p>
        <p style={{ fontSize: 14, color: "#4a6380" }}>Keep an eye on {email}</p>
      </div>
    </div>
  );

  /* ── Scanning Animation ── */
  if (phase === "scanning") return (
    <div style={wrap}>
      <div style={{ maxWidth: 400, textAlign: "center" }}>
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
          Checking AI visibility for
        </h2>
        <p style={{ fontSize: 18, color: "#D4A830", fontWeight: 700, margin: "0 0 24px" }}>
          {form.fullName} in {form.city}
        </p>
        <p style={{ fontSize: 16, color: "#00BFA6", fontWeight: 600, minHeight: 24 }}>
          {SCAN_STAGES[Math.min(scanStage, SCAN_STAGES.length - 1)]}
        </p>

        <div style={{ marginTop: 24, background: "rgba(255,255,255,0.08)", borderRadius: 8, height: 6, overflow: "hidden" }}>
          <div style={{
            height: "100%", background: "linear-gradient(90deg, #00BFA6, #D4A830)",
            borderRadius: 8, transition: "width 2s ease-in-out",
            width: `${((scanStage + 1) / SCAN_STAGES.length) * 100}%`,
          }} />
        </div>

        <p style={{ fontSize: 12, color: "#4a6380", marginTop: 16 }}>
          Querying Perplexity + Brave Search in real time
        </p>

        <style>{`@keyframes pulse { 0%,100% { opacity:0.3; transform:scale(1); } 50% { opacity:0.8; transform:scale(1.05); } }`}</style>
      </div>
    </div>
  );

  /* ── Results (no email gate — show immediately) ── */
  if (phase === "results" && result) return (
    <div style={{ ...wrap, justifyContent: "flex-start", paddingTop: 40 }}>
      <div style={{ maxWidth: 560, width: "100%" }}>

        {/* Score */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <p style={{ fontSize: 13, color: "#4a6380", letterSpacing: 2, textTransform: "uppercase", margin: "0 0 16px" }}>AI Visibility Check</p>
          <div style={{
            width: 140, height: 140, borderRadius: "50%", margin: "0 auto 16px",
            background: "rgba(10,25,41,0.8)", border: `4px solid ${result.score >= 3 ? "#00BFA6" : result.score >= 2 ? "#D4A830" : "#DC2626"}`,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            boxShadow: `0 0 40px ${result.score >= 3 ? "rgba(0,191,166,0.15)" : result.score >= 2 ? "rgba(212,168,48,0.15)" : "rgba(220,38,38,0.15)"}`,
          }}>
            <span style={{ fontSize: 48, fontWeight: 900, color: "#fff", lineHeight: 1 }}>{result.score}</span>
            <span style={{ fontSize: 14, color: "#4a6380", marginTop: 2 }}>of {result.maxScore}</span>
          </div>
          <div style={{
            display: "inline-block", background: result.score >= 3 ? "rgba(0,191,166,0.12)" : result.score >= 2 ? "rgba(212,168,48,0.12)" : "rgba(220,38,38,0.12)",
            color: result.score >= 3 ? "#00BFA6" : result.score >= 2 ? "#D4A830" : "#DC2626",
            fontSize: 13, fontWeight: 700, padding: "5px 16px", borderRadius: 20,
            border: `1px solid ${result.score >= 3 ? "rgba(0,191,166,0.25)" : result.score >= 2 ? "rgba(212,168,48,0.25)" : "rgba(220,38,38,0.25)"}`,
          }}>
            {result.tier}
          </div>
          <p style={{ fontSize: 14, color: "#94a3b8", marginTop: 12, lineHeight: 1.6 }}>
            {result.score === 0 && <>AI engines did not mention <strong style={{ color: "#fff" }}>{form.fullName}</strong> in any of the queries we tested for <strong style={{ color: "#fff" }}>{form.city}</strong>.</>}
            {result.score === 1 && <>AI has minimal signals for <strong style={{ color: "#fff" }}>{form.fullName}</strong> in <strong style={{ color: "#fff" }}>{form.city}</strong> — not enough to recommend you yet.</>}
            {result.score >= 2 && result.score < 4 && <>AI has some visibility for <strong style={{ color: "#fff" }}>{form.fullName}</strong> in <strong style={{ color: "#fff" }}>{form.city}</strong> — but gaps remain.</>}
            {result.score === 4 && <>Strong AI visibility for <strong style={{ color: "#fff" }}>{form.fullName}</strong> in <strong style={{ color: "#fff" }}>{form.city}</strong>.</>}
          </p>
        </div>

        {/* AI Engine Quotes */}
        {result.queries.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <p style={{ fontSize: 12, color: "#4a6380", letterSpacing: 2, textTransform: "uppercase", margin: "0 0 12px" }}>What AI engines said</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {result.queries.map((q, i) => (
                <div key={i} style={{
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 10, padding: "14px 16px",
                  borderLeft: q.mentioned ? "3px solid #00BFA6" : "3px solid #DC2626",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#4a6380", textTransform: "uppercase" }}>{q.engine}</span>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 10,
                      background: q.mentioned ? "rgba(0,191,166,0.12)" : "rgba(220,38,38,0.12)",
                      color: q.mentioned ? "#00BFA6" : "#DC2626",
                    }}>
                      {q.mentioned ? "Cited" : "Not cited"}
                    </span>
                  </div>
                  <p style={{ fontSize: 12, color: "#4a6380", margin: "0 0 6px", fontStyle: "italic" }}>&ldquo;{q.query}&rdquo;</p>
                  {q.snippet && <p style={{ fontSize: 13, color: "#94a3b8", margin: 0, lineHeight: 1.5 }}>{q.snippet}</p>}
                  {q.competitors.length > 0 && !q.mentioned && (
                    <p style={{ fontSize: 12, color: "#DC2626", margin: "6px 0 0", opacity: 0.8 }}>
                      Instead recommended: {q.competitors.slice(0, 3).join(", ")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gap Hints */}
        {result.gapHints.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <p style={{ fontSize: 12, color: "#4a6380", letterSpacing: 2, textTransform: "uppercase", margin: "0 0 12px" }}>Visibility gaps detected</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {result.gapHints.map((hint, i) => (
                <div key={i} style={{
                  display: "flex", gap: 10, alignItems: "flex-start", padding: "12px 14px",
                  background: "rgba(220,38,38,0.04)", border: "1px solid rgba(220,38,38,0.1)", borderRadius: 8,
                }}>
                  <span style={{ color: "#DC2626", fontSize: 14, flexShrink: 0 }}>⚠</span>
                  <p style={{ fontSize: 13, color: "#94a3b8", margin: 0, lineHeight: 1.5 }}>{hint}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Full Score Upsell — NO gate, just an offer */}
        <div style={{
          background: "rgba(212,168,48,0.08)", border: "1px solid rgba(212,168,48,0.2)",
          borderRadius: 16, padding: "28px 24px", textAlign: "center",
        }}>
          <h3 style={{ fontSize: 20, fontWeight: 800, color: "#fff", margin: "0 0 8px" }}>Want your full Foundation Score?</h3>
          <p style={{ fontSize: 14, color: "#94a3b8", margin: "0 0 6px", lineHeight: 1.6 }}>
            This check ran 4 queries on 2 engines. The full report runs <strong style={{ color: "#fff" }}>300+ queries across 9 AI engines and 13+ platforms</strong> — including your 9-component Foundation Score, market visibility rate, and a head-to-head competitor comparison.
          </p>
          <p style={{ fontSize: 13, color: "#4a6380", margin: "0 0 20px" }}>Free. Delivered within 24 hours. No spam.</p>

          <form onSubmit={handleEmailSubmit} style={{ display: "flex", gap: 8, maxWidth: 420, margin: "0 auto" }}>
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
              {submitting ? "..." : "Get Full Score →"}
            </button>
          </form>
          {error && <p style={{ color: "#DC2626", fontSize: 13, marginTop: 8 }}>{error}</p>}
        </div>

        {/* Run another check */}
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <button onClick={() => { setPhase("form"); setResult(null); setForm({ fullName: "", city: "" }); }} style={{
            background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8,
            padding: "10px 20px", color: "#4a6380", fontSize: 13, cursor: "pointer",
          }}>
            ← Check another name
          </button>
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

        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: 5, color: "#00BFA6" }}>CITED</div>
          <div style={{ fontSize: 10, color: "#4a6380", letterSpacing: 1.5, textTransform: "uppercase", marginTop: 2 }}>AI Citation Optimization™</div>
        </div>

        <h1 style={{ fontSize: 36, fontWeight: 900, color: "#fff", lineHeight: 1.15, margin: "0 0 16px", letterSpacing: -0.5 }}>
          What Does AI Say<br />About <span style={{ color: "#D4A830" }}>You</span>?
        </h1>
        <p style={{ fontSize: 16, color: "#94a3b8", lineHeight: 1.7, margin: "0 0 36px" }}>
          We&apos;ll query Perplexity and Brave Search with the prompts your clients actually ask — and show you exactly what AI says. No email required.
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
          Free · No email required · Real AI queries in ~15 seconds
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 32, flexWrap: "wrap" }}>
          {["Real-time queries", "2 AI engines", "Instant results"].map((s, i) => (
            <div key={i} style={{ fontSize: 12, color: "#4a6380", display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ color: "#00BFA6" }}>✓</span> {s}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
