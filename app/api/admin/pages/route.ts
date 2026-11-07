import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ok, readJson, route } from "@/lib/cms/api";
import { logAudit } from "@/lib/cms/audit";
import { createPage, duplicatePage, listPages, pageReadiness, pageMetaSchema } from "@/lib/cms/pages";

export const dynamic = "force-dynamic";

const create = z.object({
  slug: pageMetaSchema.shape.slug,
  title: z.object({ en: z.string().trim().max(120), fr: z.string().trim().max(120) }),
});
const body = z.union([z.object({ copyFrom: z.string().min(1).max(40) }), create]);

export const GET = route({}, async () => {
  const pages = await listPages();
  return ok({
    pages: pages.map((p) => {
      const r = pageReadiness(p);
      return { id: p.id, slug: p.slug, status: p.status, title: p.title, nav: p.nav, ready: r.ready, issueCount: r.issues.length, updatedAt: p.updatedAt, updatedBy: p.updatedBy };
    }),
  });
});

export const POST = route({}, async (req, user) => {
  const input = body.parse(await readJson(req, 20_000));
  const page = "copyFrom" in input ? await duplicatePage(input.copyFrom, user?.email ?? "?") : await createPage(input, user?.email ?? "?");
  await logAudit(user?.email ?? "?", "copyFrom" in input ? "Duplicated page" : "Created page", `/${page.slug}`);
  revalidatePath("/sitemap.xml");
  return ok({ page, readiness: pageReadiness(page) }, { status: 201 });
});
