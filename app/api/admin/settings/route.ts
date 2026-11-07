import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ApiError, ok, readJson, route } from "@/lib/cms/api";
import { logAudit } from "@/lib/cms/audit";
import { buildDefaultSettings } from "@/lib/cms/defaults";
import { getBaseMessages } from "@/lib/cms/messages";
import { isPlainObject } from "@/lib/cms/messages-diff";
import { loadSettings, type SettingsDoc } from "@/lib/cms/runtime";
import { GROUP_NAMES, GROUP_SCHEMAS, type GroupName } from "@/lib/cms/schemas";
import { ConflictError, store } from "@/lib/cms/store";

export const dynamic = "force-dynamic";

const putBody = z.object({ group: z.enum(GROUP_NAMES as [GroupName, ...GroupName[]]), value: z.unknown(), rev: z.number().int().min(0) });

const unique = (ids: string[]) => new Set(ids).size === ids.length;

/** Cross-field rules a plain schema can't express. */
async function extraChecks(group: GroupName, value: unknown) {
  const list = Array.isArray(value) ? (value as Array<Record<string, unknown>>) : [];
  if (group === "menu") {
    const en = await getBaseMessages("en");
    const navKeys = isPlainObject(en) && isPlainObject(en.nav) ? Object.keys(en.nav) : [];
    const bad = list.find((m) => !navKeys.includes(String(m.key)));
    if (bad) throw new ApiError(422, `Menu label "${String(bad.key)}" does not exist. Add its text under Texts → nav first.`);
    if (!unique(list.map((m) => String(m.key)))) throw new ApiError(422, "Each menu label can only appear once.");
  }
  if (group === "programs") {
    const shipped = buildDefaultSettings().programs.map((p) => p.slug).sort();
    const got = list.map((p) => String(p.slug)).sort();
    if (JSON.stringify(shipped) !== JSON.stringify(got))
      throw new ApiError(422, "Programs cannot be added or removed here: each program needs its own page in the code. You can reorder, hide and change covers.");
  }
  if (group === "homeSections" && list.length !== buildDefaultSettings().homeSections.length)
    throw new ApiError(422, "Every home section must be listed once.");
  if (group === "links" && (list.length !== buildDefaultSettings().links.length || !unique(list.map((x) => String(x.id)))))
    throw new ApiError(422, "Every button must be listed exactly once.");
  if (group === "stats" && (list.length !== buildDefaultSettings().stats.length || !unique(list.map((x) => String(x.id)))))
    throw new ApiError(422, "Every figure must be listed exactly once.");
  if (["partners", "testimonials", "gallery", "homeSections"].includes(group)) {
    if (!unique(list.map((x) => String(x.id)))) throw new ApiError(422, "Each item needs a unique ID.");
  }
}

export const GET = route({}, async () => {
  const eff = await loadSettings();
  return ok({ settings: eff.settings, defaults: buildDefaultSettings(), custom: eff.custom, revs: eff.revs });
});

export const PUT = route({}, async (req, user) => {
  const { group, value, rev } = putBody.parse(await readJson(req));
  const parsed = GROUP_SCHEMAS[group].parse(value);
  await extraChecks(group, parsed);
  const env = await store.update<SettingsDoc>(
    "settings",
    {},
    (d) => {
      if ((d._rev?.[group] ?? 0) !== rev) throw new ConflictError();
      d[group] = parsed;
      d._rev = { ...d._rev, [group]: rev + 1 };
      return d;
    },
    { user: user?.email ?? null }
  );
  await logAudit(user?.email ?? "?", "Saved settings", group);
  revalidatePath("/", "layout");
  revalidatePath("/sitemap.xml");
  return ok({ ok: true, rev: env.data._rev?.[group] ?? rev + 1, value: parsed });
});

export const DELETE = route({}, async (req, user) => {
  const group = new URL(req.url).searchParams.get("group");
  if (!group || !(GROUP_NAMES as string[]).includes(group)) throw new ApiError(400, "Unknown settings group.");
  const g = group as GroupName;
  const env = await store.update<SettingsDoc>(
    "settings",
    {},
    (d) => {
      delete d[g];
      d._rev = { ...d._rev, [g]: (d._rev?.[g] ?? 0) + 1 };
      return d;
    },
    { user: user?.email ?? null }
  );
  await logAudit(user?.email ?? "?", "Reset settings to default", g);
  revalidatePath("/", "layout");
  revalidatePath("/sitemap.xml");
  return ok({ ok: true, rev: env.data._rev?.[g] ?? 0, value: buildDefaultSettings()[g] });
});
