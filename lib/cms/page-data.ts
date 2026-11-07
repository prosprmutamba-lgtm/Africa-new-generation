import { loadSettings } from "./runtime";
import { getMergedMessages } from "./messages";
import { getAt, isPlainObject, type Json } from "./messages-diff";
import { LINK_SLOTS } from "./link-slots";

/** Settings in the plain shape the admin forms expect. */
export async function adminSettingsData() {
  const eff = await loadSettings();
  return { settings: eff.settings as unknown as Record<string, unknown>, custom: eff.custom as string[], revs: eff.revs as Record<string, number> };
}

/** English texts the admin shows as labels (menu names, program titles). */
export async function englishLabels() {
  const en = (await getMergedMessages("en")) as Json;
  const obj = isPlainObject(en) ? en : {};
  const strs = (o: Json | undefined): Record<string, string> =>
    isPlainObject(o) ? Object.fromEntries(Object.entries(o).filter(([, v]) => typeof v === "string") as Array<[string, string]>) : {};
  const programs = isPlainObject(obj.programs) ? obj.programs : {};
  const programTitles: Record<string, string> = {};
  for (const [k, v] of Object.entries(programs)) if (isPlainObject(v) && typeof v.title === "string") programTitles[k] = v.title;
  const statLabels: Record<string, string> = {};
  if (isPlainObject(obj.home) && isPlainObject(obj.home.stats)) for (const [k, v] of Object.entries(obj.home.stats)) if (typeof v === "string") statLabels[k] = v;
  const linkSlots: Record<string, { where: string; label: string; section: string }> = {};
  for (const l of LINK_SLOTS) {
    const label = getAt(en, l.labelKey);
    linkSlots[l.id] = { where: l.where, label: typeof label === "string" ? label : "", section: l.labelKey.split(".")[0] as string };
  }
  return { navLabels: strs(obj.nav), programTitles, statLabels, linkSlots };
}
