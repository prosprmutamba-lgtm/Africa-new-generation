import { siteConfig } from "@/config/site";

/**
 * Locale constants ONLY. This file is imported by middleware.ts, which runs in
 * the Edge runtime and cannot read files — so the request config that loads the
 * messages (and merges the admin's text changes) lives in lib/i18n-request.ts.
 */
export const locales = siteConfig.i18n.locales;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = siteConfig.i18n.defaultLocale;
