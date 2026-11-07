/**
 * ────────────────────────────────────────────────────────────
 * MENU / NAVIGATION CONFIGURATION
 * ────────────────────────────────────────────────────────────
 * Drives the desktop header nav and the mobile menu (both read this
 * same array — there is only one menu to maintain, not two).
 *
 * `key` maps to a translation key in locales/*.json under `nav.*` — the
 * link LABEL is translated text, but the existence, order, URL, and
 * "highlight" (special button styling) of each item is configuration,
 * which is why it lives here rather than in the translation files.
 *
 * To add a menu item: add a row here AND a matching label in
 * `nav.<key>` in both locales/en.json and locales/fr.json.
 * To reorder the menu: reorder this array.
 * To remove an item: delete its row here (its translation key can stay
 * unused, or be removed too).
 * ────────────────────────────────────────────────────────────
 */

export interface MainNavItem {
  key: string;
  href: string;
  highlight: boolean;
}

export const mainNav: MainNavItem[] = [
  { key: "home", href: "/", highlight: false },
  { key: "about", href: "/about", highlight: false },
  { key: "programs", href: "/programs", highlight: false },
  { key: "impactStories", href: "/impact-stories", highlight: false },
  { key: "gallery", href: "/gallery", highlight: false },
  { key: "makeADifference", href: "/make-a-difference", highlight: true },
  { key: "contact", href: "/contact", highlight: false },
];
