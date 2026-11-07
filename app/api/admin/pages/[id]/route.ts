import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ApiError, ok, readJson, route } from "@/lib/cms/api";
import { logAudit } from "@/lib/cms/audit";
import { validateBlocks } from "@/lib/cms/blocks";
import { deletePage, getPage, pageMetaSchema, pageReadiness, updatePage } from "@/lib/cms/pages";

export const dynamic = "force-dynamic";
type Ctx = { params: Promise<{ id: string }> };

const putBody = z.object({ rev: z.number().int().min(0), meta: z.unknown(), blocks: z.unknown() });

const refresh = () => {
  revalidatePath("/", "layout");
  revalidatePath("/sitemap.xml");
};

export const GET = route<Ctx>({}, async (_req, _user, ctx) => {
  const page = await getPage((await ctx.params).id);
  if (!page) throw new ApiError(404, "This page does not exist.");
  return ok({ page, readiness: pageReadiness(page) });
});

export const PUT = route<Ctx>({}, async (req, user, ctx) => {
  const { id } = await ctx.params;
  const input = putBody.parse(await readJson(req, 2_000_000));
  const meta = pageMetaSchema.parse(input.meta);
  const blocks = validateBlocks(input.blocks);
  if (!blocks.ok) throw new ApiError(422, "Please fix the highlighted fields.", blocks.errors);
  const page = await updatePage(id, meta, blocks.blocks, input.rev, user?.email ?? "?");
  await logAudit(user?.email ?? "?", "Saved page", `/${page.slug}`);
  refresh();
  return ok({ page, readiness: pageReadiness(page) });
});

export const DELETE = route<Ctx>({}, async (_req, user, ctx) => {
  const page = await deletePage((await ctx.params).id, user?.email ?? "?");
  await logAudit(user?.email ?? "?", "Deleted page", `/${page.slug}`);
  refresh();
  return ok();
});
