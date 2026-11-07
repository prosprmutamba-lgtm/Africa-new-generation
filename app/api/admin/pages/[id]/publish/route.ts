import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ok, readJson, route } from "@/lib/cms/api";
import { logAudit } from "@/lib/cms/audit";
import { pageReadiness, setPublished } from "@/lib/cms/pages";

export const dynamic = "force-dynamic";
type Ctx = { params: Promise<{ id: string }> };

const body = z.object({ published: z.boolean() });

/** Publish / unpublish. Publishing is refused until the page is complete in at least one language. */
export const POST = route<Ctx>({}, async (req, user, ctx) => {
  const { published } = body.parse(await readJson(req, 2_000));
  const page = await setPublished((await ctx.params).id, published, user?.email ?? "?");
  await logAudit(user?.email ?? "?", published ? "Published page" : "Unpublished page", `/${page.slug}`);
  revalidatePath("/", "layout");
  revalidatePath("/sitemap.xml");
  return ok({ page, readiness: pageReadiness(page) });
});
