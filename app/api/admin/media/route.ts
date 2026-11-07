import { ApiError, ok, route } from "@/lib/cms/api";
import { logAudit } from "@/lib/cms/audit";
import { MAX_BYTES, listMedia, saveUpload, mediaUrl, MediaError } from "@/lib/cms/media";

export const dynamic = "force-dynamic";

export const GET = route({}, async () => ok({ files: await listMedia(), maxMb: MAX_BYTES / 1048576 }));

export const POST = route({}, async (req, user) => {
  if (Number(req.headers.get("content-length") ?? 0) > MAX_BYTES + 1_000_000)
    throw new ApiError(413, `The file is too large. The maximum is ${MAX_BYTES / 1048576} MB.`);
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) throw new ApiError(400, "No file was received.");
  try {
    const rec = await saveUpload({ bytes: Buffer.from(await file.arrayBuffer()), originalName: file.name, user: user?.email ?? "?" });
    await logAudit(user?.email ?? "?", "Uploaded image", rec.name);
    return ok({ file: rec, url: mediaUrl(rec.name) }, { status: 201 });
  } catch (err) {
    if (err instanceof MediaError) throw new ApiError(err.status, err.message);
    throw err;
  }
});
