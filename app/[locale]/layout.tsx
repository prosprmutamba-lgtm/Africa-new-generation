import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { fontVariables } from "@/lib/fonts";
import { siteConfig } from "@/config/site";
import { getSite } from "@/lib/site/site";
import { localeOf } from "@/lib/site/page";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import "../globals.css";

/**
 * Public site shell. Rendered per request from the content store, so a change saved in the
 * admin is visible immediately (no rebuild, no stale cache).
 */
export const dynamic = "force-dynamic";

type Props = { children: ReactNode; params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
  const locale = await localeOf(params);
  const { t } = await getSite(locale);
  return {
    metadataBase: new URL(siteConfig.links.siteUrl),
    title: t("seo.defaultTitle"),
    description: t("seo.defaultDescription"),
    applicationName: siteConfig.organization.name,
    openGraph: { siteName: siteConfig.organization.name, locale: locale === "fr" ? "fr_FR" : "en_US", type: "website" },
  };
}

export const viewport: Viewport = { themeColor: "#004CC0", width: "device-width", initialScale: 1 };

export default async function LocaleLayout({ children, params }: Props) {
  const locale = await localeOf(params);
  const site = await getSite(locale);
  return (
    <html lang={locale} className={fontVariables}>
      <body className="flex min-h-screen flex-col bg-background font-body text-foreground antialiased">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-brand-gold focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-brand-navy">
          {site.t("common.skipToContent")}
        </a>
        <Header site={site} />
        <main id="main" tabIndex={-1} className="flex-1 outline-none">
          {children}
        </main>
        <Footer site={site} />
      </body>
    </html>
  );
}
