/**
 * Pure formatting helpers. Deliberately NOT in a "use client" file: server components (the dashboard
 * page) call them directly, and client components import them from here too.
 * Dates are shown in UTC on purpose: the same text is produced on the server and in the browser,
 * so React never reports a hydration mismatch because of time zones.
 */
export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1048576) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1048576).toFixed(1)} MB`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "UTC" }) + " UTC";
}
