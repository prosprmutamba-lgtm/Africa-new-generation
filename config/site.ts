/**
 * ────────────────────────────────────────────────────────────
 * AFRICA NEW GENERATION (ANG) — SITE CONFIGURATION (aggregator)
 * ────────────────────────────────────────────────────────────
 * `siteConfig` composes the dedicated config files below into one
 * object, purely so existing code (siteConfig.contact.phone,
 * siteConfig.mainNav, siteConfig.programs, etc.) keeps working
 * unchanged. If you're editing content, go straight to the specific
 * file — you don't need to touch this one:
 *
 *   config/contact.ts        phone, email, address, map, social links
 *   config/menu.ts            header + mobile navigation
 *   config/footer.ts          footer section visibility/limits
 *   config/programs.ts        the 9 program slugs + which have full pages
 *   config/gallery.ts         every gallery photo/video
 *   config/partners.ts        partner/sponsor logos
 *   config/testimonials.ts    testimonial avatars (text is in locales/*.json)
 *   config/logo.ts            logo file paths
 *
 * All display TEXT (headings, descriptions, button labels) lives in
 * /locales/en.json and /locales/fr.json — never hardcoded in components.
 * ────────────────────────────────────────────────────────────
 */

import { contactConfig, socialLinks } from "./contact";
import { mainNav } from "./menu";
import { programs } from "./programs";
import { logoConfig } from "./logo";

export const siteConfig = {
  organization: {
    name: "Africa New Generation (ANG)",
    shortName: "Africa New Generation (ANG)",
    tagline: "Refugee-Led. Community-Driven.",
    legalType: "NGO", // used for schema.org Organization type
    founded: "2020", // TODO: confirm exact founding year
  },

  contact: contactConfig,
  social: socialLinks,

  links: {
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://www.angfoundation.org",
  },

  i18n: {
    locales: ["en", "fr"] as const,
    defaultLocale: "en" as const,
  },

  mainNav,
  programs,
  logo: logoConfig,
} as const;

export type SiteConfig = typeof siteConfig;
