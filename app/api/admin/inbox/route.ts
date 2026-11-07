import { z } from "zod";
import { ApiError, ok, readJson, route } from "@/lib/cms/api";
import { logAudit } from "@/lib/cms/audit";
import { listInbox, markRead, removeInbox } from "@/lib/cms/inbox";

export const dynamic = "force-dynamic";

const csvCell = (v: string) => `"${v.replace(/"/g, '""').replace(/^([=+\-@])/, "'$1")}"`; // neutralise spreadsheet formulas

export const GET = route({}, async (req) => {
  const items = await listInbox();
  if (new URL(req.url).searchParams.get("export") === "newsletter") {
    const rows = items.filter((i) => i.kind === "newsletter");
    const csv = ["email,language,subscribed_at", ...rows.map((r) => [csvCell(r.email), r.locale, r.createdAt].join(","))].join("\r\n");
    return new Response(csv, { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": 'attachment; filename="newsletter-subscribers.csv"' } });
  }
  return ok({ items });
});

const patch = z.object({ id: z.string().min(1).max(40), read: z.boolean() });
export const PATCH = route({}, async (req) => {
  const { id, read } = patch.parse(await readJson(req, 2_000));
  await markRead(id, read);
  return ok();
});

export const DELETE = route({}, async (req, user) => {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) throw new ApiError(400, "Missing message.");
  await removeInbox(id);
  await logAudit(user?.email ?? "?", "Deleted message", id);
  return ok();
});
