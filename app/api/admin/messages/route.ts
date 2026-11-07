import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ApiError, ok, readJson, route } from "@/lib/cms/api";
import { logAudit } from "@/lib/cms/audit";
import { LOCALES, getBaseMessages, readOverrides, type MessageLocale, type OverridesDoc } from "@/lib/cms/messages";
import { applyOverrides, arrayLengthMismatches, validateOverrides, type Overrides } from "@/lib/cms/messages-diff";
import { store } from "@/lib/cms/store";

export const dynamic = "force-dynamic";

const part = z.object({ values: z.record(z.unknown()), rev: z.number().int().min(0) });
const body = z.object({ locales: z.object({ en: part.optional(), fr: part.optional() }) });

/** Saves the text changes of one or both languages. Always sends the COMPLETE set of changes for a language. */
export const PUT = route({}, async (req, user) => {
  const { locales } = body.parse(await readJson(req, 2_000_000));
  const incoming = (Object.keys(locales) as MessageLocale[]).filter((l) => locales[l]);
  if (incoming.length === 0) throw new ApiError(400, "Nothing to save.");

  const bases = Object.fromEntries(await Promise.all(LOCALES.map(async (l) => [l, await getBaseMessages(l)] as const)));
  const next: Record<string, Overrides> = {};
  const errors: string[] = [];

  for (const l of LOCALES) {
    const sent = locales[l];
    if (sent) {
      const v = validateOverrides(bases[l]!, sent.values);
      if (v.ok) next[l] = v.value;
      else errors.push(...v.errors.map((e) => `[${l.toUpperCase()}] ${e}`));
    } else {
      next[l] = (await readOverrides(l)).data.values ?? {};
    }
  }
  if (errors.length) throw new ApiError(422, errors.slice(0, 5).join(" "));

  const mismatches = arrayLengthMismatches(
    applyOverrides(bases.en!, next.en as Overrides),
    applyOverrides(bases.fr!, next.fr as Overrides)
  );
  if (mismatches.length)
    throw new ApiError(422, `English and French lists must have the same number of items (check: ${mismatches.slice(0, 3).join(", ")}).`);

  const revs: Record<string, number> = {};
  for (const l of incoming) {
    const sent = locales[l]!;
    const env = await store.update<OverridesDoc>(`messages.${l}`, { values: {} }, () => ({ values: next[l] as Overrides }), {
      expectedRev: sent.rev,
      user: user?.email ?? null,
    });
    revs[l] = env.rev;
  }
  await logAudit(user?.email ?? "?", "Saved texts", incoming.map((l) => l.toUpperCase()).join(" + "));
  revalidatePath("/", "layout");
  revalidatePath("/sitemap.xml");
  return ok({ ok: true, revs });
});
