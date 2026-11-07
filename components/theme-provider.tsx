"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from "next-themes";

/**
 * Dark mode preparation.
 *
 * All color tokens in app/globals.css already have `.dark` overrides, and
 * every component reads colors via those CSS variables (bg-background,
 * text-foreground, bg-card, etc.) rather than hardcoded brand-navy/white
 * classes wherever a surface color is involved — with a few deliberate
 * exceptions (e.g. header, hero, footer are permanently on a navy/blue
 * treatment by brand design, not meant to flip with the site theme).
 *
 * This provider is wired but NOT mounted in the root layout yet, and no
 * theme toggle UI exists — an NGO donation site defaults to light mode
 * for donor trust and legibility. To enable dark mode later:
 *   1. Wrap the app in <ThemeProvider> inside app/[locale]/layout.tsx
 *   2. Add a toggle button (see next-themes docs) — a natural place is
 *      the header, next to the language switcher
 *   3. Audit any component using literal `bg-white` / `text-brand-navy`
 *      outside of the intentionally-fixed brand surfaces above
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="light" enableSystem={false} {...props}>
      {children}
    </NextThemesProvider>
  );
}
