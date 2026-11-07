import type { ReactNode } from "react";

/**
 * Minimal pass-through root layout. The REAL root layout (html/body,
 * fonts, NextIntlClientProvider, Header/Footer) lives in
 * app/[locale]/layout.tsx, since every real page is locale-prefixed.
 *
 * This file exists only because Next.js requires a root layout.tsx to
 * exist for its own routing internals (not-found/error resolution) to
 * work correctly — without it, app/not-found.tsx and app/global-error.tsx
 * fail with "doesn't have a root layout" even though they define their
 * own <html>/<body>. Do not add <html>/<body> here — that would double
 * them up with app/[locale]/layout.tsx's.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
