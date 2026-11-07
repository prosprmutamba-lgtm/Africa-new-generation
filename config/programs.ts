/**
 * ────────────────────────────────────────────────────────────
 * PROGRAMS CONFIGURATION
 * ────────────────────────────────────────────────────────────
 * The structural list of all 9 programs — routing slug, translation key,
 * and whether it has a full dedicated page. Program TEXT (title,
 * description, objectives, etc.) lives in locales/*.json under
 * `programs.<key>.*`; program IMAGES live in
 * /public/images/programs/<slug>/ by convention (cover.jpg, hero.jpg,
 * gallery/photo-1.jpg, etc.) — this file is the index that ties a slug
 * to its translation key and image folder.
 *
 * To add a 10th program:
 *   1. Add a row below with a new slug/key.
 *   2. Add a matching `programs.<key>.*` block to locales/en.json + fr.json.
 *   3. Create /public/images/programs/<slug>/ with cover.jpg + hero.jpg.
 *   4. Create app/[locale]/programs/<slug>/page.tsx (copy an existing
 *      summary or dedicated program page as a starting point).
 *
 * `hasDedicatedPage: true` = full program page (Hero, Objectives,
 * Activities, Beneficiaries, Timeline, Galleries, Success Stories, CTA).
 * `hasDedicatedPage: false` = lighter summary page (see
 * components/programs/program-summary-page.tsx) — upgradeable to a full
 * page any time by adding `detail.*` content to the translation files
 * and switching that program's page.tsx to use ProgramPageTemplate.
 */

export interface ProgramConfigItem {
  slug: string;
  key: string;
  hasDedicatedPage: boolean;
}

export const programs: ProgramConfigItem[] = [
  { slug: "child-protection", key: "childProtection", hasDedicatedPage: true },
  { slug: "women-empowerment", key: "womenEmpowerment", hasDedicatedPage: true },
  { slug: "disability-inclusion", key: "disabilityInclusion", hasDedicatedPage: true },
  { slug: "youth-development", key: "youthDevelopment", hasDedicatedPage: false },
  { slug: "education", key: "education", hasDedicatedPage: false },
  { slug: "health", key: "health", hasDedicatedPage: false },
  { slug: "livelihood", key: "livelihood", hasDedicatedPage: false },
  { slug: "agriculture", key: "agriculture", hasDedicatedPage: false },
  { slug: "climate-action", key: "climateAction", hasDedicatedPage: false },
];
