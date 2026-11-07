import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { locales } from "@/lib/i18n";

interface BuildMetadataParams {
  title: string;
  description: string;
  locale: string;
  /** Path without locale prefix, e.g. "/about" or "/programs/education". Root is "". */
  path?: string;
  image?: string;
}

/**
 * Builds a full per-page Metadata object (title, description, canonical +
 * language alternates, Open Graph, Twitter Card) from a single set of
 * inputs. Next.js does NOT deep-merge nested metadata objects like
 * `openGraph` between a page and its parent layout — if a page only
 * returns { title, description }, its Open Graph tags silently fall back
 * to the root layout's generic ones. Every page's generateMetadata should
 * call this instead of returning a bare object, so social shares and
 * search results always show that page's actual title/description.
 */
export function buildPageMetadata({
  title,
  description,
  locale,
  path = "",
  image = "/images/og/default-og.jpg",
}: BuildMetadataParams): Metadata {
  const url = `${siteConfig.links.siteUrl}/${locale}${path}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: Object.fromEntries(locales.map((l) => [l, `${siteConfig.links.siteUrl}/${l}${path}`])),
    },
    openGraph: {
      title,
      description,
      url,
      siteName: siteConfig.organization.shortName,
      images: [image],
      locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}
