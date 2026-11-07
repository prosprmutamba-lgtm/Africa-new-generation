/**
 * ────────────────────────────────────────────────────────────
 * LOGO CONFIGURATION
 * ────────────────────────────────────────────────────────────
 * Points at the logo files in /public/logo/ — see the README.md in that
 * folder for exact replacement instructions and recommended dimensions.
 * The favicon lives separately at /app/favicon.ico (Next.js's App Router
 * auto-detects a file with that exact name/location).
 * ────────────────────────────────────────────────────────────
 */

export const logoConfig = {
  /** Used on light backgrounds (solid header, footer content areas). */
  path: "/logo/logo-placeholder.svg",
  /** Used on dark backgrounds (transparent header over the hero, footer). */
  pathDark: "/logo/logo-placeholder-dark.svg",
  /** Icon-only mark, no wordmark — for tight spaces / future favicon regen. */
  mark: "/logo/logo-mark.svg",
  favicon: "/favicon.ico",
  width: 160,
  height: 48,
} as const;

export type LogoConfig = typeof logoConfig;
