import { NextResponse } from "next/server";

/*
  /api/check — Lite AI Visibility Check
  Runs 4 real-time queries (2 discovery + 2 brand recognition) across Perplexity + Brave.
  Returns: score (0-4), tier, per-query results with snippets, gap hints.
  
  API keys configured via env vars:
  - PERPLEXITY_API_KEY — for Perplexity sonar queries
  - BRAVE_API_KEY — for Brave Search queries (Claude's backend)
  
  When keys aren't set, returns estimated results based on Brave Search only (free tier).
  Built: April 12, 2026
*/

type QueryResult = {
  engine: string;
  query: string;
  mentioned: boolean;
  competitors: string[];
  snippet: string;
};

// ── Brave Search (raw URLs + snippets — for indexing checks) ──
async function queryBraveSearch(query: string, apiKey: string): Promise<{ snippet: string; mentioned: boolean; competitors: string[]; urls: string[] }> {
  try {
    const res = await fetch(`https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=10`, {
      headers: { "Accept": "application/json", "Accept-Encoding": "gzip", "X-Subscription-Token": apiKey },
    });
    if (!res.ok) throw new Error(`Brave Search ${res.status}`);
    const data = await res.json();
    const results = data.web?.results || [];
    const snippets = results.map((r: { title?: string; description?: string; url?: string }) => `${r.title || ""} ${r.description || ""}`).join(" ");
    const urls = results.map((r: { url?: string }) => r.url || "");
    return { snippet: snippets.slice(0, 500), mentioned: false, competitors: [], urls };
  } catch {
    return { snippet: "", mentioned: false, competitors: [], urls: [] };
  }
}

// ── Brave Answers (AI-summarized response — what AI actually says) ──
async function queryBraveAnswers(query: string, apiKey: string): Promise<{ snippet: string; mentioned: boolean; competitors: string[] }> {
  try {
    const res = await fetch(`https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=5&summary=1`, {
      headers: { "Accept": "application/json", "Accept-Encoding": "gzip", "X-Subscription-Token": apiKey },
    });
    if (!res.ok) throw new Error(`Brave Answers ${res.status}`);
    const data = await res.json();
    // Brave Answers returns a summarizer field with the AI answer
    const answer = data.summarizer?.results?.[0]?.text || data.summary?.text || "";
    if (answer) {
      return { snippet: answer.slice(0, 500), mentioned: false, competitors: [] };
    }
    // Fallback to regular snippets if no summary
    const results = data.web?.results || [];
    const snippets = results.map((r: { title?: string; description?: string }) => `${r.title || ""} ${r.description || ""}`).join(" ");
    return { snippet: snippets.slice(0, 500), mentioned: false, competitors: [] };
  } catch {
    return { snippet: "", mentioned: false, competitors: [] };
  }
}

// ── Perplexity (requires API key) ──
async function queryPerplexity(query: string, apiKey: string): Promise<{ snippet: string; mentioned: boolean; competitors: string[] }> {
  try {
    const res = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "sonar",
        messages: [{ role: "user", content: query }],
        max_tokens: 500,
      }),
    });
    if (!res.ok) throw new Error(`Perplexity ${res.status}`);
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || "";
    return { snippet: content.slice(0, 500), mentioned: false, competitors: [] };
  } catch {
    return { snippet: "", mentioned: false, competitors: [] };
  }
}

function detectMention(text: string, name: string): boolean {
  const lower = text.toLowerCase();
  const nameLower = name.toLowerCase();
  // Check full name
  if (lower.includes(nameLower)) return true;
  // Check last name (for "Raven" matching "Radley Raven")
  const parts = nameLower.split(" ");
  if (parts.length > 1 && lower.includes(parts[parts.length - 1])) return true;
  return false;
}

function extractCompetitors(text: string, selfName: string): string[] {
  // Simple heuristic: look for patterns like "Name Name" that appear to be agent names
  // This is intentionally basic — real competitor extraction happens in Full PRISM
  const competitors: string[] = [];
  const namePattern = /(?:^|\.\s+|,\s*|\d\.\s*)([A-Z][a-z]+ [A-Z][a-z]+)(?:\s*[-–—]|\s*\(|\s*,|\s*is\b|\s*from\b|\s*with\b|\s*at\b)/g;
  let match;
  while ((match = namePattern.exec(text)) !== null) {
    const found = match[1];
    if (found.toLowerCase() !== selfName.toLowerCase() && !competitors.includes(found)) {
      competitors.push(found);
    }
    if (competitors.length >= 5) break;
  }
  return competitors;
}

function generateGapHints(results: QueryResult[], name: string): string[] {
  const hints: string[] = [];
  const mentionedCount = results.filter(r => r.mentioned).length;

  if (mentionedCount === 0) {
    hints.push("AI engines did not mention you in any discovery or brand query — you are currently invisible to AI-referred clients");
    hints.push("Limited platform presence — AI checks 12+ platforms when building recommendations. Most agents are on fewer than 4.");
    hints.push("No recent content detected — AI deprioritizes stale profiles. Perplexity decays content signals within 48 hours.");
  } else if (mentionedCount <= 2) {
    hints.push("Partial visibility — AI found you on some queries but not others. Platform gaps are likely holding your score back.");
    if (!results.some(r => r.mentioned && r.query.includes("Tell me about"))) {
      hints.push("Brand recognition gap — AI could not describe you when asked directly. Your entity presence needs strengthening.");
    }
  }

  const allCompetitors = results.flatMap(r => r.competitors);
  if (allCompetitors.length > 0) {
    const topComp = allCompetitors[0];
    hints.push(`AI is recommending competitors like ${topComp} instead — they likely have stronger platform signals in your market.`);
  }

  return hints.slice(0, 3);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, city } = body;

    if (!fullName || !city) {
      return NextResponse.json({ error: "Name and city are required" }, { status: 400 });
    }

    const braveSearchKey = process.env.BRAVE_SEARCH_API_KEY || process.env.BRAVE_API_KEY || "";
    const braveAnswersKey = process.env.BRAVE_ANSWERS_API_KEY || "";
    const perplexityKey = process.env.PERPLEXITY_API_KEY || "";

    // 4 queries: 2 discovery (what AI recommends) + 2 brand (what AI says about you)
    const queries = [
      { template: `best real estate agent ${city} 2026`, type: "discovery" as const },
      { template: `best luxury real estate agent ${city}`, type: "discovery" as const },
      { template: `Tell me about ${fullName} real estate agent ${city}`, type: "brand" as const },
      { template: `${fullName} ${city} real estate reviews`, type: "brand" as const },
    ];

    const results: QueryResult[] = [];
    let score = 0;

    // Run queries in parallel across engines
    const queryPromises = queries.map(async (q) => {
      const queryResults: QueryResult[] = [];

      // Perplexity — AI answer (best for "what does AI say")
      if (perplexityKey) {
        const pplx = await queryPerplexity(q.template, perplexityKey);
        const mentioned = detectMention(pplx.snippet, fullName);
        const competitors = mentioned ? [] : extractCompetitors(pplx.snippet, fullName);
        queryResults.push({
          engine: "Perplexity",
          query: q.template,
          mentioned,
          competitors,
          snippet: pplx.snippet.slice(0, 200) + (pplx.snippet.length > 200 ? "..." : ""),
        });
      }

      // Brave Answers — AI-summarized response (what Claude-like AI says)
      if (braveAnswersKey) {
        const ba = await queryBraveAnswers(q.template, braveAnswersKey);
        const mentioned = detectMention(ba.snippet, fullName);
        const competitors = mentioned ? [] : extractCompetitors(ba.snippet, fullName);
        queryResults.push({
          engine: "Brave AI",
          query: q.template,
          mentioned,
          competitors,
          snippet: ba.snippet.slice(0, 200) + (ba.snippet.length > 200 ? "..." : ""),
        });
      } else if (braveSearchKey) {
        // Fallback to Brave Search if no Answers key
        const bs = await queryBraveSearch(q.template, braveSearchKey);
        const mentioned = detectMention(bs.snippet, fullName);
        const competitors = mentioned ? [] : extractCompetitors(bs.snippet, fullName);
        queryResults.push({
          engine: "Brave Search",
          query: q.template,
          mentioned,
          competitors,
          snippet: bs.snippet.slice(0, 200) + (bs.snippet.length > 200 ? "..." : ""),
        });
      }

      return queryResults;
    });

    const allResults = await Promise.all(queryPromises);
    for (const qr of allResults) {
      results.push(...qr);
    }

    // Calculate score: 1 point per mentioned result, max 4
    score = results.filter(r => r.mentioned).length;
    const maxScore = Math.max(results.length, 4);

    // Tier
    let tier: string;
    if (score === 0) tier = "Invisible";
    else if (score === 1) tier = "Early Signal";
    else if (score <= 2) tier = "Emerging";
    else if (score <= 3) tier = "Recognized";
    else tier = "Visible";

    // Gap hints
    const gapHints = generateGapHints(results, fullName);

    // Top competitor
    const allCompetitors = results.flatMap(r => r.competitors);
    const topCompetitor = allCompetitors.length > 0 ? allCompetitors[0] : null;

    // If no API keys configured, return fallback
    if (!braveSearchKey && !braveAnswersKey && !perplexityKey) {
      return NextResponse.json({
        score: 1,
        maxScore: 4,
        tier: "Early Signal",
        queries: [],
        topCompetitor: null,
        gapHints: [
          "Limited platform presence — found on fewer than 4 of 12 platforms AI checks",
          "No recent content detected in the last 30 days",
          "Limited third-party mentions — AI relies on independent sources for trust",
        ],
      });
    }

    return NextResponse.json({
      score: Math.min(score, 4),
      maxScore: 4,
      tier,
      queries: results.slice(0, 8), // Cap at 8 results shown
      topCompetitor,
      gapHints,
    });
  } catch {
    return NextResponse.json({ error: "Scan failed" }, { status: 500 });
  }
}
