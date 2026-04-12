/*
  Client Stats — Central Source of Truth (CITED-094)
  All client-facing stats pulled from this file until Supabase migration.
  MLS data is ground truth. Never override with estimated/scraped numbers.
  
  Future: Replace with Supabase query → cited_clients.stats_json
  Built: April 12, 2026
*/

export interface ClientStats {
  careerVolume: string;
  careerDeals: number;
  corridorVolume: string;
  corridorDeals: number;
  corridorZip: string;
  avgDOM: number;
  saleToListRatio: number;
  pctAboveAsking: number;
  primaryMarkets: string[];
  secondaryMarkets: string[];
  brokerage: string;
  brokerageDRE: string;
  agentDRE: string;
  yearsInMarket: number;
  lastUpdated: string;
  source: string;
}

// Radley Raven — Client Zero (MLS-verified April 7, 2026)
export const RADLEY_STATS: ClientStats = {
  careerVolume: "$91.7M",
  careerDeals: 33,
  corridorVolume: "$44.8M",
  corridorDeals: 11,
  corridorZip: "92130",
  avgDOM: 28,
  saleToListRatio: 96,
  pctAboveAsking: 24,
  primaryMarkets: ["Carmel Valley", "Carlsbad", "Rancho Santa Fe"],
  secondaryMarkets: ["La Jolla", "Solana Beach", "Encinitas"],
  brokerage: "The Oppenheim Group",
  brokerageDRE: "01983697",
  agentDRE: "02041346",
  yearsInMarket: 10,
  lastUpdated: "2026-04-07",
  source: "MLS — CRS Property Report",
};

// Helper: all markets as a comma-separated string
export function allMarkets(stats: ClientStats): string {
  return [...stats.primaryMarkets, ...stats.secondaryMarkets].join(", ");
}

// Helper: stat line for bios
export function statLine(stats: ClientStats): string {
  return `${stats.corridorDeals} closed in Carmel Valley ${stats.corridorZip} — ${stats.corridorVolume} in a single ZIP code. ${stats.avgDOM}-day median DOM. ${stats.saleToListRatio}% sale-to-list ratio.`;
}
