/**
 * Signed session tokens using Web Crypto only, so the SAME code runs in the
 * Edge middleware and in the Node server.
 * Token = base64url(payload) + "." + base64url(HMAC-SHA256(payload)).
 */
export interface SessionPayload {
  /** user id */
  uid: string;
  /** user's sessionVersion at login; bumping it on the user revokes the session */
  sv: number;
  /** expiry, seconds since epoch */
  exp: number;
}

const enc = new TextEncoder();

function toB64Url(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64Url(s: string): Uint8Array | null {
  try {
    const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
    const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/") + pad);
    return Uint8Array.from(bin, (c) => c.charCodeAt(0));
  } catch {
    return null;
  }
}

function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

export async function signSession(payload: SessionPayload, secret: string): Promise<string> {
  const body = toB64Url(enc.encode(JSON.stringify(payload)));
  const sig = await crypto.subtle.sign("HMAC", await hmacKey(secret), enc.encode(body));
  return `${body}.${toB64Url(new Uint8Array(sig))}`;
}

export async function verifySession(token: string | undefined, secret: string): Promise<SessionPayload | null> {
  if (!token || token.length > 2000) return null;
  const [body, sig, extra] = token.split(".");
  if (!body || !sig || extra !== undefined) return null;
  const sigBytes = fromB64Url(sig);
  if (!sigBytes) return null;
  // crypto.subtle.verify compares in constant time
  const ok = await crypto.subtle.verify("HMAC", await hmacKey(secret), sigBytes as BufferSource, enc.encode(body));
  if (!ok) return null;
  const raw = fromB64Url(body);
  if (!raw) return null;
  try {
    const p = JSON.parse(new TextDecoder().decode(raw)) as Partial<SessionPayload>;
    if (typeof p.uid !== "string" || typeof p.sv !== "number" || typeof p.exp !== "number") return null;
    if (p.exp * 1000 < Date.now()) return null;
    return { uid: p.uid, sv: p.sv, exp: p.exp };
  } catch {
    return null;
  }
}

/** Reads the signing secret. In production a missing/short secret is a hard error (no insecure fallback). */
export function sessionSecret(): string {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (s && s.length >= 32) return s;
  if (process.env.NODE_ENV === "development") return "dev-only-secret-never-use-in-production-0123456789abcdef";
  throw new Error("ADMIN_SESSION_SECRET is missing or shorter than 32 characters.");
}

export function isSecretConfigured(): boolean {
  try {
    sessionSecret();
    return true;
  } catch {
    return false;
  }
}

export const COOKIE_NAME = "ang_admin_session";
export const SESSION_TTL_SEC = 8 * 60 * 60;
