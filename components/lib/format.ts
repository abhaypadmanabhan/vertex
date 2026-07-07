/**
 * Number / date formatting per padzy dataviz rules. Used everywhere data renders.
 * All output is meant for a mono context (tabular figures).
 */

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** Prose date: `6 Jul 2026`. Returns the raw string if unparseable. */
export function formatDateProse(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** Data date: `2026-07-06` (24h contexts / tables). */
export function formatDateData(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())}`;
}

/** Abbreviate at scale: `12.4k`, `20.9M`, `1.12B`. One decimal. */
export function abbreviate(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `${(n / 1e3).toFixed(1)}k`;
  return String(n);
}

/** Two-digit index for editorial kickers: `01`, `02`, … */
export function pad2(n: number): string {
  return String(n).padStart(2, "0");
}
