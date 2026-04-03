import baseline from "@/data/prism-scans/2026-03-24-baseline.json";
import rescan1 from "@/data/prism-scans/2026-03-28-rescan1.json";

export function getPrismScans() {
  return {
    latest: (rescan1 as any).composite_score,
    history: [
      { date: (baseline as any).scan_date, score: (baseline as any).composite_score },
      { date: (rescan1 as any).scan_date, score: (rescan1 as any).composite_score },
    ],
  };
}
