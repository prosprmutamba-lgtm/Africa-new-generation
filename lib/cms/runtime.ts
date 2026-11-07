import { cache } from "react";
import { store } from "./store";
import { buildDefaultSettings } from "./defaults";
import { GROUP_NAMES, GROUP_SCHEMAS, type GroupName, type Settings } from "./schemas";

export type SettingsDoc = Partial<Record<GroupName, unknown>> & { _rev?: Partial<Record<GroupName, number>> };

export interface EffectiveSettings {
  settings: Settings;
  /** Groups that an administrator has customised (the rest still follow config/*.ts). */
  custom: GroupName[];
  /** Per-group revision numbers, used to detect two people editing the same group. */
  revs: Partial<Record<GroupName, number>>;
}

export async function loadSettings(): Promise<EffectiveSettings> {
  const defaults = buildDefaultSettings();
  const env = await store.read<SettingsDoc>("settings", {});
  const settings: Settings = { ...defaults };
  const custom: GroupName[] = [];
  for (const g of GROUP_NAMES) {
    if (!(g in env.data)) continue;
    // Re-validate on read: a hand-edited or damaged file must never break the public site.
    const parsed = GROUP_SCHEMAS[g].safeParse(env.data[g]);
    if (parsed.success) {
      (settings as unknown as Record<string, unknown>)[g] = parsed.data;
      custom.push(g);
    } else {
      console.error(`[cms] stored "${g}" settings are invalid; using shipped defaults`, parsed.error.flatten());
    }
  }
  // Sections / buttons added by a newer version are appended so older saved data keeps working.
  const known = new Set(settings.homeSections.map((x) => x.id));
  settings.homeSections = [...settings.homeSections, ...defaults.homeSections.filter((x) => !known.has(x.id))];
  const knownLinks = new Set(settings.links.map((x) => x.id));
  settings.links = [...settings.links, ...defaults.links.filter((x) => !knownLinks.has(x.id))];
  return { settings, custom, revs: env.data._rev ?? {} };
}

/** Per-request cached read for server components. */
export const getEffectiveSettings = cache(loadSettings);

/**
 * Drop-in replacement for `siteConfig` (config/site.ts) in async server code:
 *   const siteConfig = await getSiteConfig();
 * Same shape, but values come from the admin when customised.
 * Hidden menu items / programs are already filtered out.
 */
export async function getSiteConfig() {
  const { settings } = await getEffectiveSettings();
  const base = buildDefaultSettings();
  return {
    organization: settings.organization,
    contact: settings.contact,
    social: settings.social,
    links: { siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://www.angfoundation.org" },
    i18n: { locales: ["en", "fr"] as const, defaultLocale: "en" as const },
    mainNav: settings.menu.filter((m) => m.visible).map(({ key, href, highlight }) => ({ key, href, highlight })),
    programs: settings.programs
      .filter((p) => p.visible)
      .map(({ slug, key, hasDedicatedPage }) => ({ slug, key, hasDedicatedPage })),
    programCovers: Object.fromEntries(settings.programs.map((p) => [p.slug, p.coverImage])),
    logo: { ...settings.logo, favicon: base.logo.favicon },
    footer: settings.footer,
  };
}

export async function getGallery() {
  const { settings } = await getEffectiveSettings();
  return settings.gallery
    .filter((g) => g.visible)
    .map(({ visible: _v, thumbnail, videoUrl, ...g }) => ({
      ...g,
      ...(thumbnail ? { thumbnail } : {}),
      ...(videoUrl ? { videoUrl } : {}),
    }));
}

export async function getPartners() {
  const { settings } = await getEffectiveSettings();
  return settings.partners
    .filter((p) => p.visible)
    .map((p) => ({ name: p.name, logo: p.logo, ...(p.website ? { website: p.website } : {}) }));
}

export async function getTestimonialAvatars() {
  const { settings } = await getEffectiveSettings();
  return settings.testimonials.map((t) => ({ id: t.id, ...(t.avatar ? { avatar: t.avatar } : {}) }));
}

/** Ordered list of home-page section ids that should be shown. */
export async function getVisibleHomeSections(): Promise<string[]> {
  const { settings } = await getEffectiveSettings();
  return settings.homeSections.filter((s) => s.visible).map((s) => s.id);
}
