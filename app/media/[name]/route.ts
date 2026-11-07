import { MIME, readMediaFile } from "@/lib/cms/media";

export const dynamic = "force-dynamic";

/**
 * Public route that serves uploaded images from the uploads folder
 * (files added to /public after the build are not reliably served by `next start`,
 * which is why uploads do not live there).
 */
export async function GET(req: Request, ctx: { params: Promise<{ name: string }> }) {
  const { name } = await ctx.params;
  const file = await readMediaFile(name);
  if (!file) return new Response("Not found", { status: 404 });

  const etag = `"${file.mtime.getTime().toString(36)}-${file.bytes.length.toString(36)}"`;
  const headers = new Headers({
    "Content-Type": MIME[file.kind],
    "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
    ETag: etag,
    "X-Content-Type-Options": "nosniff",
    "Cross-Origin-Resource-Policy": "same-site",
  });
  // An SVG opened directly must never be able to run script.
  if (file.kind === "svg") headers.set("Content-Security-Policy", "default-src 'none'; style-src 'unsafe-inline'; sandbox");
  if (req.headers.get("if-none-match") === etag) return new Response(null, { status: 304, headers });
  return new Response(new Uint8Array(file.bytes), { headers });
}
