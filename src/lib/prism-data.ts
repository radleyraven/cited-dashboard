import fs from "fs";

const SCAN_DIR =
  "/Users/rrmacmini/.openclaw/workspace/references/cited-clients/radley_raven/data/prism-scans";

export function getPrismScans() {
  const baseline = JSON.parse(
    fs.readFileSync(`${SCAN_DIR}/2026-03-24-baseline.json`, "utf8")
  );
  const rescan1 = JSON.parse(
    fs.readFileSync(`${SCAN_DIR}/2026-03-28-rescan1.json`, "utf8")
  );

  return {
    latest: rescan1.composite_score,
    history: [
      { date: baseline.scan_date, score: baseline.composite_score },
      { date: rescan1.scan_date, score: rescan1.composite_score },
    ],
  };
}
