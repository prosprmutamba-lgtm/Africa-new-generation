import type { Metadata } from "next";
import type { ReactNode } from "react";
import { fontVariables } from "@/lib/fonts";
import "../globals.css";

export const metadata: Metadata = {
  title: { default: "Admin — Africa New Generation (ANG)", template: "%s · ANG Admin" },
  robots: { index: false, follow: false },
};

/**
 * The admin lives outside app/[locale] on purpose: it has its own <html>/<body>,
 * is not translated, and is excluded from locale routing (see middleware.ts).
 */
export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={fontVariables}>
      <body className="min-h-screen bg-background font-body antialiased">{children}</body>
    </html>
  );
}
