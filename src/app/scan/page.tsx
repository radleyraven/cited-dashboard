"use client";

import { useState } from "react";

/*
  /scan — CITED Lite Scan Entry Point
  Cold traffic → name + market + email → prospect record created → Jett runs Quick PRISM → score email sent
  Awareness level: L1-2 (problem aware, evaluating solutions)
  Built: April 9, 2026
*/

export default function ScanPage() {
  const [form, setForm] = useState({ fullName: "", market: "", email: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.fullName.trim() || !form.market.trim() || !form.email.trim()) return;
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Submission failed");
      }
      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  const inp: React.CSSProperties = {
    width: "100%", padding: "14px 16px", borderRadius: "8px", border: "1px solid #D1D5DB",
    fontSize: "15px", color: "#0A1929", background: "#fff", outline: "none",
    boxSizing: "border-box" as const,
  };

  if (submitted) return (
    <div style={{ minHeight: "100vh", background: "#0A1929", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ maxWidth: "480px", textAlign: "center" }}>
        <div style={{
          width: "80px", height: "80px", borderRadius: "50%", margin: "0 auto 24px",
          background: "rgba(0,191,166,0.15)", border: "2px solid #00BFA6",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#00BFA6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#fff", margin: "0 0 12px" }}>Your score is being calculated.</h1>
        <p style={{ fontSize: "16px", color: "#94a3b8", lineHeight: 1.7, margin: "0 0 24px" }}>
          We&apos;re running your Citation Score now. You&apos;ll receive it by email within 24 hours — including your score, your top competitor&apos;s score, and the 3 biggest gaps holding you back.
        </p>
        <p style={{ fontSize: "14px", color: "#4a6380", margin: 0 }}>
          Keep an eye on {form.email}
        </p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4f8", fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif' }}>

      {/* Header */}
      <header style={{ background: "#0A1929", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: "18px", fontWeight: 800, letterSpacing: "5px", color: "#00BFA6" }}>CITED</div>
          <div style={{ fontSize: "10px", color: "#4a6380", letterSpacing: "1.5px", textTransform: "uppercase", marginTop: "2px" }}>AI Citation Optimization™</div>
        </div>
        <div style={{ fontSize: "11px", color: "#4a6380" }}>Powered by <span style={{ color: "#00BFA6", fontWeight: 700 }}>PRISM™</span></div>
      </header>
      <div style={{ height: "3px", background: "linear-gradient(90deg, #00BFA6, #D4A830, #00BFA6)" }} />

      <main style={{ maxWidth: "480px", margin: "0 auto", padding: "48px 20px 64px" }}>

        {/* Context */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ display: "inline-block", background: "rgba(212,168,48,0.12)", color: "#D4A830", fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", padding: "5px 14px", borderRadius: "20px", marginBottom: "20px", border: "1px solid rgba(212,168,48,0.25)" }}>
            Free Citation Score
          </div>
          <h1 style={{ fontSize: "32px", fontWeight: 900, color: "#0A1929", lineHeight: 1.2, margin: "0 0 16px", letterSpacing: "-0.5px" }}>
            Find out where AI ranks you<br />
            <span style={{ color: "#00BFA6" }}>in your market.</span>
          </h1>
          <p style={{ fontSize: "16px", color: "#4a5568", lineHeight: 1.7, margin: 0 }}>
            We&apos;ll run your Citation Score — a 0–100 measure of your AI citation visibility — and show you exactly how you compare to the top agent in your market.
          </p>
        </div>

        {/* Form */}
        <div style={{ background: "#fff", borderRadius: "16px", padding: "32px 28px", boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)" }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#0A1929", marginBottom: "6px" }}>
                  Your full name <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <input
                  type="text" required value={form.fullName}
                  onChange={(e) => setForm(p => ({ ...p, fullName: e.target.value }))}
                  placeholder="e.g., Sarah Johnson"
                  style={inp}
                  onFocus={(e) => { e.target.style.borderColor = "#00BFA6"; e.target.style.boxShadow = "0 0 0 3px rgba(0,191,166,0.1)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "#D1D5DB"; e.target.style.boxShadow = "none"; }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#0A1929", marginBottom: "6px" }}>
                  Your primary market <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <input
                  type="text" required value={form.market}
                  onChange={(e) => setForm(p => ({ ...p, market: e.target.value }))}
                  placeholder="e.g., Carmel Valley, Carlsbad, La Jolla"
                  style={inp}
                  onFocus={(e) => { e.target.style.borderColor = "#00BFA6"; e.target.style.boxShadow = "0 0 0 3px rgba(0,191,166,0.1)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "#D1D5DB"; e.target.style.boxShadow = "none"; }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#0A1929", marginBottom: "6px" }}>
                  Your email <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <input
                  type="email" required value={form.email}
                  onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="you@yourbrokerage.com"
                  style={inp}
                  onFocus={(e) => { e.target.style.borderColor = "#00BFA6"; e.target.style.boxShadow = "0 0 0 3px rgba(0,191,166,0.1)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "#D1D5DB"; e.target.style.boxShadow = "none"; }}
                />
              </div>

              {error && (
                <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "8px", padding: "10px 14px" }}>
                  <p style={{ color: "#DC2626", fontSize: "13px", margin: 0 }}>{error}</p>
                </div>
              )}

              <button type="submit" disabled={submitting} style={{
                width: "100%", padding: "16px", background: "#00BFA6", color: "#fff",
                border: "none", borderRadius: "10px", fontSize: "16px", fontWeight: 700,
                cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.7 : 1,
                marginTop: "8px",
              }}>
                {submitting ? "Submitting..." : "Run My Free Citation Score →"}
              </button>

              <p style={{ fontSize: "12px", color: "#94a3b8", textAlign: "center", margin: 0, lineHeight: 1.5 }}>
                Results delivered by email within 24 hours. No spam, no sales calls.
                Your score + your top competitor&apos;s score + 3 gaps to close.
              </p>
            </div>
          </form>
        </div>

        {/* What you'll get */}
        <div style={{ marginTop: "32px", display: "flex", flexDirection: "column", gap: "12px" }}>
          {[
            { icon: "📊", text: "Your Citation Score (0–100) — how visible you are across ChatGPT, Perplexity, Gemini, and Claude" },
            { icon: "🥊", text: "Your top competitor's score — the gap between you and the agent AI recommends instead" },
            { icon: "🔍", text: "Your 3 biggest gaps — the specific platforms and signals holding your score back" },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", gap: "12px", alignItems: "flex-start", background: "#fff", borderRadius: "10px", padding: "14px 16px", border: "1px solid #e8edf2" }}>
              <span style={{ fontSize: "20px", flexShrink: 0 }}>{item.icon}</span>
              <p style={{ fontSize: "13px", color: "#374151", lineHeight: 1.6, margin: 0 }}>{item.text}</p>
            </div>
          ))}
        </div>

        <p style={{ fontSize: "12px", color: "#94a3b8", textAlign: "center", margin: "24px 0 0", lineHeight: 1.6 }}>
          Cited · AI Citation Optimization™ for Professionals · Powered by PRISM™
        </p>
      </main>
    </div>
  );
}
