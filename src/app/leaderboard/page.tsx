"use client";

import { useState } from "react";

/*
  /leaderboard — City AI Agent Rankings
  Public competitive trigger. Agent searches their market → sees competitors ranked → doesn't see themselves → urgency.
  Competes with: wearecited.com City AI Leaderboard
  Built: April 11, 2026
*/

type AgentEntry = { name: string; firm: string; mentions: number };
type PlatformData = { chatgpt: AgentEntry[]; perplexity: AgentEntry[]; gemini: AgentEntry[]; grok: AgentEntry[] };
type Platform = keyof PlatformData;

const PLATFORMS: { key: Platform; label: string }[] = [
  { key: "chatgpt", label: "ChatGPT" },
  { key: "perplexity", label: "Perplexity" },
  { key: "gemini", label: "Gemini" },
  { key: "grok", label: "Grok" },
];

const MARKETS = ["Carmel Valley", "Carlsbad", "Rancho Santa Fe", "La Jolla", "Encinitas", "Solana Beach"];

/* Mock data — realistic fictional agents, varied counts per platform */
const DATA: Record<string, PlatformData> = {
  "Carmel Valley": {
    chatgpt: [
      { name: "Michelle Torres", firm: "Compass", mentions: 5 },
      { name: "David Kline", firm: "Berkshire Hathaway", mentions: 4 },
      { name: "Sarah Whitfield", firm: "Coldwell Banker", mentions: 3 },
      { name: "Jason Park", firm: "eXp Realty", mentions: 2 },
    ],
    perplexity: [
      { name: "Michelle Torres", firm: "Compass", mentions: 5 },
      { name: "Lauren McCarthy", firm: "Sotheby's", mentions: 4 },
      { name: "David Kline", firm: "Berkshire Hathaway", mentions: 3 },
      { name: "Brian Novak", firm: "RE/MAX", mentions: 2 },
      { name: "Angela Reeves", firm: "Keller Williams", mentions: 1 },
    ],
    gemini: [
      { name: "David Kline", firm: "Berkshire Hathaway", mentions: 4 },
      { name: "Sarah Whitfield", firm: "Coldwell Banker", mentions: 3 },
      { name: "Michelle Torres", firm: "Compass", mentions: 2 },
    ],
    grok: [
      { name: "Lauren McCarthy", firm: "Sotheby's", mentions: 4 },
      { name: "Michelle Torres", firm: "Compass", mentions: 3 },
      { name: "Brian Novak", firm: "RE/MAX", mentions: 1 },
    ],
  },
  "Carlsbad": {
    chatgpt: [
      { name: "Ryan Ellsworth", firm: "Compass", mentions: 5 },
      { name: "Nicole Brennan", firm: "Berkshire Hathaway", mentions: 4 },
      { name: "Mark Salazar", firm: "Coldwell Banker", mentions: 3 },
      { name: "Tanya Voss", firm: "Keller Williams", mentions: 2 },
      { name: "Chris Landry", firm: "eXp Realty", mentions: 1 },
    ],
    perplexity: [
      { name: "Nicole Brennan", firm: "Berkshire Hathaway", mentions: 5 },
      { name: "Ryan Ellsworth", firm: "Compass", mentions: 3 },
      { name: "Tanya Voss", firm: "Keller Williams", mentions: 2 },
    ],
    gemini: [
      { name: "Ryan Ellsworth", firm: "Compass", mentions: 4 },
      { name: "Mark Salazar", firm: "Coldwell Banker", mentions: 3 },
      { name: "Nicole Brennan", firm: "Berkshire Hathaway", mentions: 3 },
      { name: "Chris Landry", firm: "eXp Realty", mentions: 1 },
    ],
    grok: [
      { name: "Nicole Brennan", firm: "Berkshire Hathaway", mentions: 4 },
      { name: "Ryan Ellsworth", firm: "Compass", mentions: 2 },
    ],
  },
  "Rancho Santa Fe": {
    chatgpt: [
      { name: "Victoria Haines", firm: "Sotheby's", mentions: 5 },
      { name: "Gregory Ashford", firm: "Willis Allen", mentions: 4 },
      { name: "Diana Castellano", firm: "Compass", mentions: 3 },
    ],
    perplexity: [
      { name: "Victoria Haines", firm: "Sotheby's", mentions: 5 },
      { name: "Diana Castellano", firm: "Compass", mentions: 4 },
      { name: "Gregory Ashford", firm: "Willis Allen", mentions: 3 },
      { name: "James Everett", firm: "Berkshire Hathaway", mentions: 2 },
    ],
    gemini: [
      { name: "Gregory Ashford", firm: "Willis Allen", mentions: 4 },
      { name: "Victoria Haines", firm: "Sotheby's", mentions: 3 },
    ],
    grok: [
      { name: "Victoria Haines", firm: "Sotheby's", mentions: 3 },
      { name: "Diana Castellano", firm: "Compass", mentions: 2 },
      { name: "James Everett", firm: "Berkshire Hathaway", mentions: 1 },
    ],
  },
  "La Jolla": {
    chatgpt: [
      { name: "Katherine Merrill", firm: "Pacific Sotheby's", mentions: 5 },
      { name: "Robert Liang", firm: "Compass", mentions: 4 },
      { name: "Stephanie Cruz", firm: "Berkshire Hathaway", mentions: 3 },
      { name: "Derek Fontaine", firm: "Coldwell Banker", mentions: 2 },
    ],
    perplexity: [
      { name: "Robert Liang", firm: "Compass", mentions: 5 },
      { name: "Katherine Merrill", firm: "Pacific Sotheby's", mentions: 4 },
      { name: "Stephanie Cruz", firm: "Berkshire Hathaway", mentions: 3 },
    ],
    gemini: [
      { name: "Katherine Merrill", firm: "Pacific Sotheby's", mentions: 5 },
      { name: "Derek Fontaine", firm: "Coldwell Banker", mentions: 3 },
      { name: "Robert Liang", firm: "Compass", mentions: 2 },
      { name: "Mia Tanaka", firm: "Douglas Elliman", mentions: 1 },
    ],
    grok: [
      { name: "Robert Liang", firm: "Compass", mentions: 4 },
      { name: "Katherine Merrill", firm: "Pacific Sotheby's", mentions: 2 },
    ],
  },
  "Encinitas": {
    chatgpt: [
      { name: "Tyler Goodwin", firm: "Compass", mentions: 4 },
      { name: "Alicia Duran", firm: "Berkshire Hathaway", mentions: 3 },
      { name: "Ben Harrington", firm: "Keller Williams", mentions: 2 },
    ],
    perplexity: [
      { name: "Alicia Duran", firm: "Berkshire Hathaway", mentions: 5 },
      { name: "Tyler Goodwin", firm: "Compass", mentions: 4 },
      { name: "Chloe Simmons", firm: "RE/MAX", mentions: 2 },
      { name: "Ben Harrington", firm: "Keller Williams", mentions: 1 },
    ],
    gemini: [
      { name: "Tyler Goodwin", firm: "Compass", mentions: 3 },
      { name: "Alicia Duran", firm: "Berkshire Hathaway", mentions: 3 },
    ],
    grok: [
      { name: "Chloe Simmons", firm: "RE/MAX", mentions: 3 },
      { name: "Tyler Goodwin", firm: "Compass", mentions: 2 },
      { name: "Alicia Duran", firm: "Berkshire Hathaway", mentions: 1 },
    ],
  },
  "Solana Beach": {
    chatgpt: [
      { name: "Patricia Keane", firm: "Willis Allen", mentions: 4 },
      { name: "Andrew Moss", firm: "Compass", mentions: 3 },
      { name: "Rachel Kim", firm: "Coldwell Banker", mentions: 2 },
    ],
    perplexity: [
      { name: "Andrew Moss", firm: "Compass", mentions: 5 },
      { name: "Patricia Keane", firm: "Willis Allen", mentions: 3 },
      { name: "Rachel Kim", firm: "Coldwell Banker", mentions: 2 },
    ],
    gemini: [
      { name: "Patricia Keane", firm: "Willis Allen", mentions: 4 },
      { name: "Andrew Moss", firm: "Compass", mentions: 2 },
    ],
    grok: [
      { name: "Andrew Moss", firm: "Compass", mentions: 3 },
      { name: "Patricia Keane", firm: "Willis Allen", mentions: 2 },
    ],
  },
};

export default function LeaderboardPage() {
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [activePlatform, setActivePlatform] = useState<Platform>("chatgpt");
  const [searchInput, setSearchInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredMarkets = MARKETS.filter(m =>
    m.toLowerCase().includes(searchInput.toLowerCase())
  );

  const selectCity = (city: string) => {
    setSelectedCity(city);
    setSearchInput(city);
    setShowSuggestions(false);
    setActivePlatform("chatgpt");
  };

  const cityData = selectedCity ? DATA[selectedCity] : null;
  const agents = cityData ? cityData[activePlatform] : [];
  const maxSlots = 5;
  const emptySlots = Math.max(0, maxSlots - agents.length);

  return (
    <div style={{
      minHeight: "100vh", background: "#0A1929",
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
    }}>
      {/* Header */}
      <header style={{ padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: 5, color: "#00BFA6" }}>CITED</div>
          <div style={{ fontSize: 10, color: "#4a6380", letterSpacing: 1.5, textTransform: "uppercase", marginTop: 2 }}>AI Citation Optimization™</div>
        </div>
        <a href="/check" style={{ fontSize: 13, color: "#D4A830", textDecoration: "none", fontWeight: 600 }}>Check My Visibility →</a>
      </header>
      <div style={{ height: 3, background: "linear-gradient(90deg, #00BFA6, #D4A830, #00BFA6)" }} />

      <main style={{ maxWidth: 640, margin: "0 auto", padding: "48px 20px 64px" }}>

        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h1 style={{ fontSize: 34, fontWeight: 900, color: "#fff", lineHeight: 1.15, margin: "0 0 14px", letterSpacing: -0.5 }}>
            Who Does AI Recommend<br />in <span style={{ color: "#D4A830" }}>Your Market</span>?
          </h1>
          <p style={{ fontSize: 15, color: "#94a3b8", lineHeight: 1.7, margin: 0 }}>
            See which agents ChatGPT, Perplexity, Gemini, and Grok actually name when buyers and sellers ask for recommendations.
          </p>
        </div>

        {/* Search */}
        <div style={{ position: "relative", marginBottom: 40 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ flex: 1, position: "relative" }}>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => { setSearchInput(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Enter a city or market..."
                style={{
                  width: "100%", padding: "14px 16px", borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.15)", fontSize: 15, color: "#fff",
                  background: "rgba(255,255,255,0.07)", outline: "none", boxSizing: "border-box" as const,
                }}
              />
              {showSuggestions && searchInput && filteredMarkets.length > 0 && (
                <div style={{
                  position: "absolute", top: "100%", left: 0, right: 0, marginTop: 4,
                  background: "#0d2137", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8,
                  overflow: "hidden", zIndex: 10,
                }}>
                  {filteredMarkets.map(m => (
                    <button key={m} onClick={() => selectCity(m)} style={{
                      display: "block", width: "100%", padding: "12px 16px", border: "none",
                      background: "transparent", color: "#fff", fontSize: 14, textAlign: "left",
                      cursor: "pointer",
                    }}
                      onMouseEnter={(e) => { (e.target as HTMLElement).style.background = "rgba(255,255,255,0.06)"; }}
                      onMouseLeave={(e) => { (e.target as HTMLElement).style.background = "transparent"; }}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick select chips */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
            {MARKETS.map(m => (
              <button key={m} onClick={() => selectCity(m)} style={{
                padding: "6px 14px", borderRadius: 20, border: "1px solid",
                borderColor: selectedCity === m ? "#D4A830" : "rgba(255,255,255,0.12)",
                background: selectedCity === m ? "rgba(212,168,48,0.12)" : "transparent",
                color: selectedCity === m ? "#D4A830" : "#4a6380",
                fontSize: 12, fontWeight: 600, cursor: "pointer",
              }}>
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {selectedCity && cityData && (
          <>
            {/* Platform tabs */}
            <div style={{ display: "flex", gap: 0, marginBottom: 24, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              {PLATFORMS.map(p => (
                <button key={p.key} onClick={() => setActivePlatform(p.key)} style={{
                  flex: 1, padding: "12px 8px", background: "transparent", border: "none",
                  borderBottom: activePlatform === p.key ? "2px solid #D4A830" : "2px solid transparent",
                  color: activePlatform === p.key ? "#D4A830" : "#4a6380",
                  fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.15s",
                }}>
                  {p.label}
                </button>
              ))}
            </div>

            {/* Agent list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {agents.map((a, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 14, padding: "14px 16px",
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 10,
                }}>
                  {/* Rank */}
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%", background: "rgba(212,168,48,0.15)",
                    border: "1px solid #D4A830", display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14, fontWeight: 800, color: "#D4A830", flexShrink: 0,
                  }}>
                    {i + 1}
                  </div>

                  {/* Agent info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 15, fontWeight: 700, color: "#fff", margin: 0 }}>{a.name}</p>
                    <p style={{ fontSize: 12, color: "#4a6380", margin: "2px 0 8px" }}>{a.firm}</p>
                    {/* Frequency bar */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{
                          height: "100%", borderRadius: 3, background: "#00BFA6",
                          width: `${(a.mentions / 5) * 100}%`, transition: "width 0.3s",
                        }} />
                      </div>
                      <span style={{ fontSize: 11, color: "#4a6380", whiteSpace: "nowrap" }}>
                        {a.mentions} of 5
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Empty slots */}
              {Array.from({ length: emptySlots }).map((_, i) => (
                <div key={`empty-${i}`} style={{
                  display: "flex", alignItems: "center", gap: 14, padding: "14px 16px",
                  background: "rgba(255,255,255,0.01)", border: "1px dashed rgba(255,255,255,0.06)",
                  borderRadius: 10,
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)", display: "flex",
                    alignItems: "center", justifyContent: "center",
                    fontSize: 14, fontWeight: 800, color: "#4a6380", flexShrink: 0,
                  }}>
                    {agents.length + i + 1}
                  </div>
                  <div>
                    <p style={{ fontSize: 14, color: "#4a6380", margin: 0, fontStyle: "italic" }}>??? — Not cited</p>
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.15)", margin: "2px 0 0" }}>This slot is empty. AI didn&apos;t recommend anyone else.</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Methodology note */}
            <p style={{ fontSize: 11, color: "#4a6380", margin: "16px 0 0", lineHeight: 1.5, textAlign: "center" }}>
              Based on 5 recommendation queries per AI engine for &ldquo;{selectedCity}&rdquo;.
              Rankings reflect mention frequency, not quality ranking.
              AI results vary — this is a point-in-time snapshot.
            </p>
          </>
        )}

        {/* Not on the list CTA */}
        {selectedCity && (
          <div style={{
            marginTop: 40, background: "rgba(212,168,48,0.06)", border: "1px solid rgba(212,168,48,0.2)",
            borderRadius: 16, padding: "28px 24px", textAlign: "center",
          }}>
            <h3 style={{ fontSize: 22, fontWeight: 800, color: "#fff", margin: "0 0 8px" }}>Not on the list?</h3>
            <p style={{ fontSize: 14, color: "#94a3b8", margin: "0 0 20px", lineHeight: 1.6 }}>
              Most agents are invisible to AI. Only 1.2% of businesses get recommended by ChatGPT.
              Find out exactly where you stand — and what it takes to get on the list.
            </p>
            <a href="/check" style={{
              display: "inline-block", padding: "14px 32px", background: "#D4A830", color: "#0A1929",
              borderRadius: 10, fontSize: 15, fontWeight: 700, textDecoration: "none",
            }}>
              Check My Visibility →
            </a>
          </div>
        )}

        {/* Empty state */}
        {!selectedCity && (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <p style={{ fontSize: 48, margin: "0 0 16px" }}>🔍</p>
            <p style={{ fontSize: 16, color: "#4a6380", lineHeight: 1.6 }}>
              Select a market above to see who AI recommends.
            </p>
          </div>
        )}

        <p style={{ fontSize: 11, color: "#4a6380", textAlign: "center", marginTop: 40, lineHeight: 1.5 }}>
          Cited · AI Citation Optimization™ · Powered by PRISM™
        </p>
      </main>
    </div>
  );
}
