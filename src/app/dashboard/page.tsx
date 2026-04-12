"use client";

/*
  /dashboard — Client Home Screen (CITED-123)
  Foundation Score + Market Visibility + Narrative Quality + Quick Actions
  Built: April 12, 2026
*/

export default function DashboardPage() {
  const client = { name: "Radley Raven", slug: "radley-raven", score: 24, tier: "Early Signal", lastScan: "April 11, 2026", daysInProgram: 12, visibility: 6, narrativeGrade: "B" };

  const actions = [
    { label: "Score Details", href: `/score/${client.slug}`, icon: "📊" },
    { label: "Copy Kit", href: "/copy-kit", icon: "✍️" },
    { label: "Articles", href: "/articles", icon: "📄" },
    { label: "Platform Status", href: "/audit", icon: "🔍" },
  ];

  const activity = [
    { date: "Apr 11", text: "PRISM Scan completed — Foundation Score: 24/100", color: "#00BFA6" },
    { date: "Apr 9", text: "LinkedIn bio optimized — definition-first structure applied", color: "#D4A830" },
    { date: "Apr 2", text: "Article 2 published — 'The Carlsbad Nobody Talks About'", color: "#00BFA6" },
  ];

  const card: React.CSSProperties = { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "20px 24px" };

  return (
    <div style={{ minHeight: "100vh", background: "#0A1929", fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif' }}>
      <header style={{ padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: 5, color: "#00BFA6" }}>CITED</div>
          <div style={{ fontSize: 10, color: "#4a6380", letterSpacing: 1.5, textTransform: "uppercase", marginTop: 2 }}>Dashboard</div>
        </div>
        <span style={{ fontSize: 14, color: "#94a3b8" }}>{client.name}</span>
      </header>
      <div style={{ height: 3, background: "linear-gradient(90deg, #00BFA6, #D4A830, #00BFA6)" }} />

      <main style={{ maxWidth: 720, margin: "0 auto", padding: "32px 20px 64px" }}>

        {/* Hero — Foundation Score */}
        <div style={{ ...card, textAlign: "center", marginBottom: 24, padding: "32px 24px" }}>
          <p style={{ fontSize: 11, color: "#4a6380", letterSpacing: 2, textTransform: "uppercase", margin: "0 0 16px" }}>Foundation Score</p>
          <div style={{ width: 130, height: 130, borderRadius: "50%", margin: "0 auto 14px", background: "rgba(10,25,41,0.8)", border: "4px solid #D4A830", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: "0 0 30px rgba(212,168,48,0.12)" }}>
            <span style={{ fontSize: 44, fontWeight: 900, color: "#fff", lineHeight: 1 }}>{client.score}</span>
            <span style={{ fontSize: 13, color: "#4a6380", marginTop: 2 }}>of 100</span>
          </div>
          <div style={{ display: "inline-block", background: "rgba(212,168,48,0.12)", color: "#D4A830", fontSize: 12, fontWeight: 700, padding: "4px 14px", borderRadius: 16, border: "1px solid rgba(212,168,48,0.25)" }}>{client.tier}</div>
          <p style={{ fontSize: 12, color: "#4a6380", margin: "10px 0 0" }}>Last scan: {client.lastScan}</p>
        </div>

        {/* 3 Metric Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
          {/* Visibility */}
          <div style={card}>
            <p style={{ fontSize: 10, color: "#4a6380", letterSpacing: 1.5, textTransform: "uppercase", margin: "0 0 8px" }}>Visibility</p>
            <p style={{ fontSize: 28, fontWeight: 800, color: "#fff", margin: "0 0 6px" }}>{client.visibility}%</p>
            <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${client.visibility}%`, background: "#DC2626", borderRadius: 2, minWidth: 4 }} />
            </div>
            <p style={{ fontSize: 10, color: "#4a6380", margin: "4px 0 0" }}>of AI queries</p>
          </div>
          {/* Narrative */}
          <div style={card}>
            <p style={{ fontSize: 10, color: "#4a6380", letterSpacing: 1.5, textTransform: "uppercase", margin: "0 0 8px" }}>Narrative</p>
            <p style={{ fontSize: 28, fontWeight: 800, color: "#D4A830", margin: "0 0 6px" }}>{client.narrativeGrade}</p>
            <p style={{ fontSize: 10, color: "#4a6380", margin: 0 }}>accuracy grade</p>
          </div>
          {/* Days */}
          <div style={card}>
            <p style={{ fontSize: 10, color: "#4a6380", letterSpacing: 1.5, textTransform: "uppercase", margin: "0 0 8px" }}>Day</p>
            <p style={{ fontSize: 28, fontWeight: 800, color: "#00BFA6", margin: "0 0 6px" }}>{client.daysInProgram}</p>
            <p style={{ fontSize: 10, color: "#4a6380", margin: 0 }}>of 90 (guarantee)</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginBottom: 32 }}>
          {actions.map((a, i) => (
            <a key={i} href={a.href} style={{ ...card, display: "flex", alignItems: "center", gap: 12, textDecoration: "none", cursor: "pointer" }}>
              <span style={{ fontSize: 24 }}>{a.icon}</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{a.label}</span>
            </a>
          ))}
        </div>

        {/* Recent Activity */}
        <div>
          <p style={{ fontSize: 11, color: "#4a6380", letterSpacing: 2, textTransform: "uppercase", margin: "0 0 12px" }}>Recent Activity</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {activity.map((a, i) => (
              <div key={i} style={{ ...card, display: "flex", gap: 12, alignItems: "flex-start", padding: "12px 16px", borderLeft: `3px solid ${a.color}` }}>
                <span style={{ fontSize: 11, color: "#4a6380", whiteSpace: "nowrap", minWidth: 48 }}>{a.date}</span>
                <p style={{ fontSize: 13, color: "#94a3b8", margin: 0, lineHeight: 1.5 }}>{a.text}</p>
              </div>
            ))}
          </div>
        </div>

        <p style={{ fontSize: 11, color: "#4a6380", textAlign: "center", marginTop: 40 }}>Cited · AI Citation Optimization™ · Powered by PRISM™</p>
      </main>
    </div>
  );
}
