/**
 * Login throttling, in memory (one Node process — the supported setup).
 * 8 failures per email or 30 per IP within 15 minutes locks that key for 15 minutes.
 */
interface Bucket {
  count: number;
  first: number;
  lockedUntil: number;
}
const WINDOW = 15 * 60 * 1000;
const buckets = new Map<string, Bucket>();

function limitFor(key: string) {
  return key.startsWith("ip:") ? 30 : 8;
}

function purge(now: number) {
  if (buckets.size < 5000) return;
  for (const [k, b] of buckets) if (b.lockedUntil < now && now - b.first > WINDOW) buckets.delete(k);
}

export function loginAllowed(keys: string[]): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now();
  let retry = 0;
  for (const k of keys) {
    const b = buckets.get(k);
    if (b && b.lockedUntil > now) retry = Math.max(retry, Math.ceil((b.lockedUntil - now) / 1000));
  }
  return { allowed: retry === 0, retryAfterSec: retry };
}

export function recordLoginFailure(keys: string[]) {
  const now = Date.now();
  purge(now);
  for (const k of keys) {
    let b = buckets.get(k);
    if (!b || now - b.first > WINDOW) b = { count: 0, first: now, lockedUntil: 0 };
    b.count += 1;
    if (b.count >= limitFor(k)) b.lockedUntil = now + WINDOW;
    buckets.set(k, b);
  }
}

export function recordLoginSuccess(emailKey: string) {
  buckets.delete(emailKey);
}
