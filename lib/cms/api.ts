import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { COOKIE_NAME } from "./session-token";
import { userFromToken, hasRole } from "./auth";
import { ConflictError } from "./store";
import { UserError, type PublicUser, type Role } from "./users";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public fields?: Record<string, string>
  ) {
    super(message);
  }
}

export const ok = (data: unknown = { ok: true }, init?: ResponseInit) => NextResponse.json(data, init);

function readCookie(req: Request, name: string): string | undefined {
  const raw = req.headers.get("cookie");
  if (!raw) return undefined;
  for (const part of raw.split(";")) {
    const i = part.indexOf("=");
    if (i > 0 && part.slice(0, i).trim() === name) return decodeURIComponent(part.slice(i + 1).trim());
  }
  return undefined;
}

/**
 * CSRF defence for every write. Cookies are SameSite=Strict already; this adds an
 * explicit check that the request really comes from our own pages.
 */
export function assertSameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (!origin || !host) throw new ApiError(403, "Request blocked: missing origin.");
  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    throw new ApiError(403, "Request blocked: invalid origin.");
  }
  if (originHost !== host.split(",")[0]?.trim()) throw new ApiError(403, "Request blocked: cross-site request.");
}

export function clientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}

function zodFields(err: ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".") || "_";
    if (!(key in out)) out[key] = issue.message;
  }
  return out;
}

interface RouteOptions {
  /** Minimum role. `null` = public endpoint (login). Default "editor". */
  role?: Role | null;
}

/**
 * Wraps a route handler: same-origin check on writes, server-side authentication and
 * role check, and uniform JSON errors. Every /api/admin route goes through this.
 */
export function route<Ctx = { params: Promise<Record<string, string | string[] | undefined>> }>(
  opts: RouteOptions,
  fn: (req: Request, user: PublicUser | null, ctx: Ctx) => Promise<Response>
) {
  const role = opts.role === undefined ? "editor" : opts.role;
  return async (req: Request, ctx: Ctx): Promise<Response> => {
    try {
      if (!["GET", "HEAD"].includes(req.method)) assertSameOrigin(req);
      let user: PublicUser | null = null;
      if (role !== null) {
        user = await userFromToken(readCookie(req, COOKIE_NAME));
        if (!user) throw new ApiError(401, "Your session has expired. Please sign in again.");
        if (!hasRole(user, role)) throw new ApiError(403, "You do not have permission to do this.");
      }
      const res = await fn(req, user, ctx);
      res.headers.set("Cache-Control", "no-store");
      return res;
    } catch (err) {
      if (err instanceof ApiError) return NextResponse.json({ error: err.message, fields: err.fields }, { status: err.status });
      if (err instanceof ZodError)
        return NextResponse.json({ error: "Please fix the highlighted fields.", fields: zodFields(err) }, { status: 422 });
      if (err instanceof ConflictError) return NextResponse.json({ error: err.message }, { status: 409 });
      if (err instanceof UserError) return NextResponse.json({ error: err.message }, { status: err.status });
      console.error("[cms] unexpected error", err);
      return NextResponse.json({ error: "Something went wrong on the server. Nothing was lost; please try again." }, { status: 500 });
    }
  };
}

export async function readJson(req: Request, maxBytes = 1_500_000): Promise<unknown> {
  const len = Number(req.headers.get("content-length") ?? 0);
  if (len > maxBytes) throw new ApiError(413, "The request is too large.");
  try {
    return await req.json();
  } catch {
    throw new ApiError(400, "The request body is not valid JSON.");
  }
}
