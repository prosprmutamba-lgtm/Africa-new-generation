import { revalidatePath } from "next/cache";
import { ApiError, ok, route } from "@/lib/cms/api";
import { logAudit } from "@/lib/cms/audit";
import { MAX_BYTES, MediaError, deleteMedia, mediaUrl, saveUpload } from "@/lib/cms/media";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ name: string }> };

/** Replace the content of an existing file (same URL, same type). */
export const PUT = route<Ctx>({}, async (req, user, ctx) => {
  const { name } = await ctx.params;
  if (Number(req.headers.get("content-length") ?? 0) > MAX_BYTES + 1_000_000)
    throw new ApiError(413, `The file is too large. The maximum is ${MAX_BYTES / 1048576} MB.`);
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) throw new ApiError(400, "No file was received.");
  try {
    const rec = await saveUpload({ bytes: Buffer.from(await file.arrayBuffer()), originalName: file.name, user: user?.email ?? "?", replace: name });
    await logAudit(user?.email ?? "?", "Replaced image", rec.name);
    revalidatePath("/", "layout");
    return ok({ file: rec, url: mediaUrl(rec.name) });
  } catch (err) {
    if (err instanceof MediaError) throw new ApiError(err.status, err.message);
    throw err;
  }
});

export const DELETE = route<Ctx>({}, async (req, user, ctx) => {
  const { name } = await ctx.params;
  const force = new URL(req.url).searchParams.get("force") === "1";
  try {
    await deleteMedia(name, force);
  } catch (err) {
    if (err instanceof MediaError) return Response.json({ error: err.message, usages: err.usages }, { status: err.status });
    throw err;
  }
  await logAudit(user?.email ?? "?", "Deleted image", name);
  revalidatePath("/", "layout");
  return ok();
});
