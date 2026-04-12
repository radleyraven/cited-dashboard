"use client";

/*
  /30-days — Citation Guarantee™ Progress
  Shows 90-day timeline, Foundation Score movement, milestone tracking
  Built: April 12, 2026
*/

export default function GuaranteePage() {
  const data = { startScore: 24, currentScore: 24, dayNumber: 12, startDate: "March 31, 2026", targetScore: 44 };

  const milestones = [
    { day: 0, label: "Baseline Scan", desc: "Full PRISM scan + Foundation Score set", status: "done" as const, date: "Mar 31" },
    { day: 7, label: "Platform Check", desc: "Day 7 Quick scan — early signal check", status: "done" as const, date: "Apr 7" },
    { day: 14, label: "LinkedIn Re-Index", desc: "LinkedIn content expected to index by now", status: "upcoming" as const, date: "Apr 14" },
    { day: 30, label: "First Full Re-Scan", desc: "Full PRISM scan — first score movement measured", status: "locked" as const, date: "Apr 30" },
    { day: 60, label: "Second Full Scan", desc: "Month 2 report — trajectory confirmed", status: "locked" as const, date: "May 30" },
    { day: 90, label: "Guarantee Evaluation", desc: "Final score. +20 points or next month is free.", status: "locked" as const, date: "Jun 29" },
  ];

  const pct = Math.min(100, (data.dayNumber / 90) * 100);
  const card: React.CSSProperties = { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "20px 24px" };

  return (
    <div style={{ minHeight: "100vh", background: "#0A1929", fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif' }}>
      <header style={{ padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: 5, color: "#00BFA6" }}>CITED</div>
          <div style={{ fontSize: 10, color: "#4a6380", letterSpacing: 1.5, textTransform: "uppercase", marginTop: 2 }}>Citation Guarantee™</div>
        </div>
        <a href="/dashboard" style={{ fontSize: 13, color: "#4a6380", textDecoration: "none" }}>← Dashboard</a>
      </header>
      <div style={{ height: 3, background: "linear-gradient(90deg, #00BFA6, #D4A830, #00BFA6)" }} />

      <main style={{ maxWidth: 600, margin: "0 auto", padding: "40px 20px 64px" }}>

        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#fff", margin: "0 0 6px" }}>Your Citation Guarantee™ Progress</h1>
        <p style={{ fontSize: 14, color: "#94a3b8", margin: "0 0 32px" }}>+20 Foundation Score points in 90 days — or your next month is free.</p>

        {/* Progress ring */}
        <div style={{ ...card, textAlign: "center", marginBottom: 24, padding: "32px 24px" }}>
          <div style={{ position: "relative", width: 150, height: 150, margin: "0 auto 16px" }}>
            <svg width="150" height="150" viewBox="0 0 150 150" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="75" cy="75" r="65" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
              <circle cx="75" cy="75" r="65" fill="none" stroke="#D4A830" strokeWidth="8" strokeLinecap="round"
                strokeDasharray={`${(pct / 100) * 408.4} 408.4`} />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 36, fontWeight: 900, color: "#fff", lineHeight: 1 }}>Day {data.dayNumber}</span>
              <span style={{ fontSize: 13, color: "#4a6380", marginTop: 4 }}>of 90</span>
            </div>
          </div>
          <p style={{ fontSize: 12, color: "#4a6380", margin: 0 }}>Started {data.startDate}</p>
        </div>

        {/* Score comparison */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 12, marginBottom: 32, alignItems: "center" }}>
          <div style={{ ...card, textAlign: "center" }}>
            <p style={{ fontSize: 10, color: "#4a6380", letterSpacing: 1.5, textTransform: "uppercase", margin: "0 0 8px" }}>Starting Score</p>
            <p style={{ fontSize: 36, fontWeight: 900, color: "#94a3b8", margin: 0 }}>{data.startScore}</p>
          </div>
          <div style={{ fontSize: 24, color: "#D4A830" }}>→</div>
          <div style={{ ...card, textAlign: "center" }}>
            <p style={{ fontSize: 10, color: "#4a6380", letterSpacing: 1.5, textTransform: "uppercase", margin: "0 0 8px" }}>Current Score</p>
            <p style={{ fontSize: 36, fontWeight: 900, color: "#fff", margin: 0 }}>{data.currentScore}</p>
          </div>
        </div>

        <div style={{ ...card, textAlign: "center", marginBottom: 32, borderColor: "rgba(212,168,48,0.15)", background: "rgba(212,168,48,0.04)" }}>
          <p style={{ fontSize: 13, color: "#D4A830", margin: 0 }}>
            Target: <strong>{data.targetScore}</strong> (+20 points) by Day 90 · Score data updates at Day 30, 60, and 90 scans
          </p>
        </div>

        {/* Timeline */}
        <div>
          <p style={{ fontSize: 11, color: "#4a6380", letterSpacing: 2, textTransform: "uppercase", margin: "0 0 16px" }}>Milestones</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {milestones.map((m, i) => (
              <div key={i} style={{ display: "flex", gap: 16 }}>
                {/* Timeline line + dot */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 20 }}>
                  <div style={{
                    width: 14, height: 14, borderRadius: "50%", flexShrink: 0,
                    background: m.status === "done" ? "#00BFA6" : m.status === "upcoming" ? "#D4A830" : "rgba(255,255,255,0.1)",
                    border: m.status === "done" ? "2px solid #00BFA6" : m.status === "upcoming" ? "2px solid #D4A830" : "2px solid rgba(255,255,255,0.1)",
                  }} />
                  {i < milestones.length - 1 && (
                    <div style={{ width: 2, flex: 1, minHeight: 40, background: m.status === "done" ? "rgba(0,191,166,0.3)" : "rgba(255,255,255,0.06)" }} />
                  )}
                </div>
                {/* Content */}
                <div style={{ paddingBottom: i < milestones.length - 1 ? 24 : 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: m.status === "locked" ? "#4a6380" : "#fff" }}>Day {m.day}: {m.label}</span>
                    {m.status === "done" && <span style={{ fontSize: 10, fontWeight: 700, color: "#00BFA6", background: "rgba(0,191,166,0.12)", padding: "2px 8px", borderRadius: 8 }}>✓ Done</span>}
                    {m.status === "upcoming" && <span style={{ fontSize: 10, fontWeight: 700, color: "#D4A830", background: "rgba(212,168,48,0.12)", padding: "2px 8px", borderRadius: 8 }}>Next</span>}
                    {m.status === "locked" && <span style={{ fontSize: 10, fontWeight: 700, color: "#4a6380", background: "rgba(255,255,255,0.04)", padding: "2px 8px", borderRadius: 8 }}>Upcoming</span>}
                  </div>
                  <p style={{ fontSize: 13, color: "#94a3b8", margin: "0 0 2px", lineHeight: 1.5 }}>{m.desc}</p>
                  <p style={{ fontSize: 11, color: "#4a6380", margin: 0 }}>{m.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Guarantee footer */}
        <div style={{ ...card, marginTop: 32, textAlign: "center", borderColor: "rgba(0,191,166,0.15)", background: "rgba(0,191,166,0.04)" }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: "#00BFA6", margin: "0 0 6px" }}>The Citation Guarantee™</p>
          <p style={{ fontSize: 13, color: "#94a3b8", margin: 0, lineHeight: 1.6 }}>
            If your Foundation Score doesn&apos;t improve by at least 20 points within 90 days, your next month of service is free. No questions. No fine print.
          </p>
        </div>

        <p style={{ fontSize: 11, color: "#4a6380", textAlign: "center", marginTop: 40 }}>Cited · AI Citation Optimization™ · Powered by PRISM™</p>
      </main>
    </div>
  );
}
