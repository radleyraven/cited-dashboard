"use client";

import { useState } from "react";

/*
  /positioning — Positioning Statement Approval Gate (CITED-082)
  Nothing gets written until client approves positioning. This page IS the gate.
  Flow: PRISM scan → positioning drafted → client sees it here → approves or requests changes
  Built: April 12, 2026
*/

export default function PositioningPage() {
  const [approved, setApproved] = useState(false);
  const [requestingChanges, setRequestingChanges] = useState(false);
  const [changeNote, setChangeNote] = useState("");
  const [changeSent, setChangeSent] = useState(false);

  // Placeholder — will be pulled from Supabase per authenticated client
  const positioning = {
    ready: true,
    statement: "Radley Raven is the luxury listing specialist for Carlsbad and Carmel Valley — with 10+ years and $91M+ in North County coastal transactions — known for pricing accuracy and properties that move fast.",
    markets: ["Carmel Valley", "Carlsbad", "Rancho Santa Fe"],
    specialty: "Luxury listing specialist",
    differentiator: "Pricing accuracy and speed of sale",
    scanDate: "April 11, 2026",
  };

  const card: React.CSSProperties = { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "24px" };
  const inp: React.CSSProperties = { width: "100%", padding: "12px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.15)", fontSize: 14, color: "#fff", background: "rgba(255,255,255,0.07)", outline: "none", boxSizing: "border-box" as const, minHeight: 80, resize: "vertical" as const };

  return (
    <div style={{ minHeight: "100vh", background: "#0A1929", fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif' }}>
      <header style={{ padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: 5, color: "#00BFA6" }}>CITED</div>
          <div style={{ fontSize: 10, color: "#4a6380", letterSpacing: 1.5, textTransform: "uppercase", marginTop: 2 }}>AI Citation Optimization™</div>
        </div>
        <a href="/dashboard" style={{ fontSize: 13, color: "#4a6380", textDecoration: "none" }}>← Dashboard</a>
      </header>
      <div style={{ height: 3, background: "linear-gradient(90deg, #00BFA6, #D4A830, #00BFA6)" }} />

      <main style={{ maxWidth: 600, margin: "0 auto", padding: "40px 20px 64px" }}>

        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#fff", margin: "0 0 8px" }}>Your Positioning Statement</h1>
        <p style={{ fontSize: 14, color: "#94a3b8", margin: "0 0 32px", lineHeight: 1.6 }}>
          This is how we&apos;ll position you across every platform — your bios, your articles, your satellite site, your copy kit. Everything flows from this statement.
        </p>

        {!positioning.ready ? (
          <div style={{ ...card, textAlign: "center", padding: "48px 24px" }}>
            <p style={{ fontSize: 48, margin: "0 0 16px" }}>🔍</p>
            <p style={{ fontSize: 16, color: "#94a3b8", lineHeight: 1.6 }}>
              Your positioning statement will appear here after your PRISM scan is complete.
            </p>
          </div>
        ) : approved ? (
          <div style={{ ...card, textAlign: "center", padding: "40px 24px" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", margin: "0 auto 20px", background: "rgba(0,191,166,0.15)", border: "2px solid #00BFA6", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00BFA6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#fff", margin: "0 0 8px" }}>Positioning Approved</h2>
            <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.6, margin: "0 0 8px" }}>
              Your copy kit is now being built from this positioning. All bios, articles, and platform copy will be consistent with this statement.
            </p>
            <p style={{ fontSize: 12, color: "#4a6380" }}>Approved on {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
          </div>
        ) : (
          <>
            {/* Statement */}
            <div style={{ ...card, borderLeft: "3px solid #D4A830", marginBottom: 24 }}>
              <p style={{ fontSize: 11, color: "#D4A830", letterSpacing: 2, textTransform: "uppercase", margin: "0 0 12px", fontWeight: 700 }}>Positioning Statement</p>
              <p style={{ fontSize: 18, color: "#fff", lineHeight: 1.6, margin: 0, fontStyle: "italic" }}>
                &ldquo;{positioning.statement}&rdquo;
              </p>
            </div>

            {/* Details */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
              <div style={card}>
                <p style={{ fontSize: 10, color: "#4a6380", letterSpacing: 1.5, textTransform: "uppercase", margin: "0 0 6px" }}>Markets</p>
                <p style={{ fontSize: 14, color: "#fff", margin: 0 }}>{positioning.markets.join(" · ")}</p>
              </div>
              <div style={card}>
                <p style={{ fontSize: 10, color: "#4a6380", letterSpacing: 1.5, textTransform: "uppercase", margin: "0 0 6px" }}>Specialty</p>
                <p style={{ fontSize: 14, color: "#fff", margin: 0 }}>{positioning.specialty}</p>
              </div>
            </div>

            <div style={{ ...card, marginBottom: 32 }}>
              <p style={{ fontSize: 10, color: "#4a6380", letterSpacing: 1.5, textTransform: "uppercase", margin: "0 0 6px" }}>Differentiator</p>
              <p style={{ fontSize: 14, color: "#fff", margin: 0 }}>{positioning.differentiator}</p>
              <p style={{ fontSize: 11, color: "#4a6380", margin: "8px 0 0" }}>Based on PRISM scan: {positioning.scanDate}</p>
            </div>

            <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6, margin: "0 0 24px" }}>
              When you approve, we&apos;ll build your copy kit — platform-specific bios for all 12 platforms, article positioning, and satellite site copy — all derived from this statement. If something doesn&apos;t feel right, request changes and we&apos;ll revise.
            </p>

            {/* Actions */}
            {!requestingChanges ? (
              <div style={{ display: "flex", gap: 12 }}>
                <button onClick={() => setApproved(true)} style={{ flex: 1, padding: "14px 20px", background: "#D4A830", color: "#0A1929", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
                  Approve Positioning ✓
                </button>
                <button onClick={() => setRequestingChanges(true)} style={{ flex: 1, padding: "14px 20px", background: "transparent", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
                  Request Changes
                </button>
              </div>
            ) : changeSent ? (
              <div style={{ ...card, textAlign: "center" }}>
                <p style={{ fontSize: 14, color: "#00BFA6", margin: 0 }}>✓ Change request submitted. We&apos;ll revise and update this page within 24 hours.</p>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: 13, color: "#94a3b8", margin: "0 0 10px" }}>What would you change?</p>
                <textarea value={changeNote} onChange={(e) => setChangeNote(e.target.value)} placeholder="e.g., I'd emphasize sellers more than luxury, or add Del Mar to markets..." style={inp} />
                <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                  <button onClick={() => setChangeSent(true)} disabled={!changeNote.trim()} style={{ padding: "12px 20px", background: "#D4A830", color: "#0A1929", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer", opacity: changeNote.trim() ? 1 : 0.5 }}>
                    Submit Changes
                  </button>
                  <button onClick={() => { setRequestingChanges(false); setChangeNote(""); }} style={{ padding: "12px 20px", background: "transparent", color: "#4a6380", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 14, cursor: "pointer" }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        <p style={{ fontSize: 11, color: "#4a6380", textAlign: "center", marginTop: 40 }}>Cited · AI Citation Optimization™ · Powered by PRISM™</p>
      </main>
    </div>
  );
}
