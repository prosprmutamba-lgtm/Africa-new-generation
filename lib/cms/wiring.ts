/**
 * Which admin features are connected to the PUBLIC site (all of them in this version: the public
 * components in components/site read every setting through lib/site/site.ts).
 *
 * Saving in the admin always works and persists. But a saved value only changes the
 * public site once the corresponding page/component reads it from lib/cms/runtime.ts
 * (see docs/ADMIN_WIRING.md for the exact one-line change per component).
 *
 * Until a flag is true, the admin shows an honest "saved, not yet shown on the site"
 * notice on that screen. After you connect a component, set its flag to true.
 */
export const WIRED = {
  /** All page texts: connected via lib/i18n-request.ts (merged into next-intl messages). */
  texts: true,
  /** sitemap.xml: connected (hidden programs left out, new stories included). */
  sitemap: true,
  /** Custom pages (created in Admin → Pages): public route app/[locale]/[...rest]/page.tsx. */
  customPages: true,

  /** Header/footer/contact page read siteConfig (config/site.ts) directly. */
  menu: true,
  contact: true,
  social: true,
  organization: true,
  footer: true,
  logo: true,
  /** Home page sections order/visibility. */
  homeSections: true,
  /** Program cover images + hiding a program from lists. */
  programs: true,
  gallery: true,
  partners: true,
  testimonialPhotos: true,
  /** Links to custom pages in the header / footer (the pages themselves are already served at /<locale>/<slug>). */
  pageLinks: true,
  /** Buttons & links, site images, impact figures, contact form + newsletter inbox. */
  links: true,
  images: true,
  stats: true,
  inbox: true,
} as const;

export type WiringKey = keyof typeof WIRED;
