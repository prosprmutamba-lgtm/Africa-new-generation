import { NextResponse } from "next/server";
import { z } from "zod";
import { ApiError, assertSameOrigin, clientIp, readJson } from "./api";
import { tooMany } from "./throttle";

/**
 * Shared plumbing of the PUBLIC forms (contact, newsletter): same-origin check, throttling,
 * honeypot, validation. Field errors are returned as CODES ("email", "message"…) so the
 * browser can show them in the visitor's language from the translated texts.
 */
export async function handlePublicForm<T extends z.ZodTypeAny>(
  req: Request,
  opts: { name: string; schema: T; limit: number; save: (data: z.infer<T>, locale: string) => Promise<void> }
): Promise<Response> {
  try {
    assertSameOrigin(req);
    if (tooMany(`${opts.name}:${clientIp(req)}`, opts.limit, 10 * 60 * 1000)) throw new ApiError(429, "tooMany");
    const raw = (await readJson(req, 20_000)) as Record<string, unknown>;
    // Honeypot: real visitors never fill the hidden "website" field. Pretend success, store nothing.
    if (typeof raw?.website === "string" && raw.website.trim() !== "") return NextResponse.json({ ok: true });
    const parsed = opts.schema.safeParse(raw);
    if (!parsed.success) {
      const fields: Record<string, string> = {};
      for (const i of parsed.error.issues) fields[String(i.path[0] ?? "_")] = String(i.path[0] ?? "_");
      return NextResponse.json({ error: "invalid", fields }, { status: 422 });
    }
    const locale = raw?.locale === "fr" ? "fr" : "en";
    await opts.save(parsed.data, locale);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof ApiError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error(`[${opts.name}] form failed`, err);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}

export const emailField = z.string().trim().toLowerCase().max(200).email();
