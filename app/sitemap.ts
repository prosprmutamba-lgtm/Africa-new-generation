import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n";
import { getSiteConfig } from "@/lib/cms/runtime";
import { getMergedMessages } from "@/lib/cms/messages";
import { listLivePages } from "@/lib/cms/pages";

/**
 * Generates /sitemap.xml covering every static page and every impact
 * story detail page, in both locales, with hreflang alternates so search
 * engines understand the EN/FR pairing.
 *
 * Programs come from the admin settings (hidden programs are left out) and
 * stories from the merged messages, so stories added in the dashboard are listed.
 * Revalidated whenever something is saved in the admin.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteConfig = await getSiteConfig();
  const en = (await getMergedMessages("en")) as unknown as { impactStories: { items: { slug: string }[] } };

  const staticPaths = [
    "",
    "/about",
    "/programs",
    "/impact-stories",
    "/gallery",
    "/make-a-difference",
    "/contact",
    ...siteConfig.programs.map((p) => `/programs/${p.slug}`),
  ];

  const base = siteConfig.links.siteUrl;
  const storySlugs = en.impactStories.items.map((s) => s.slug);
  const allPaths = [...staticPaths, ...storySlugs.map((slug) => `/impact-stories/${slug}`)];

  const custom = (await listLivePages()).flatMap((p) =>
    p.locales.map((locale) => ({
      url: `${base}/${locale}/${p.slug}`,
      lastModified: new Date(p.updatedAt),
      changeFrequency: "monthly" as MetadataRoute.Sitemap[number]["changeFrequency"],
      priority: 0.6,
      // only link the language versions that are actually published
      alternates: { languages: Object.fromEntries(p.locales.map((l) => [l, `${base}/${l}/${p.slug}`])) },
    }))
  );

  const builtIn = allPaths.flatMap((path) =>
    locales.map((locale) => ({
      url: `${base}/${locale}${path}`,
      lastModified: new Date(),
      changeFrequency: (path === "" ? "weekly" : "monthly") as MetadataRoute.Sitemap[number]["changeFrequency"],
      priority: path === "" ? 1 : path.split("/").length > 2 ? 0.6 : 0.8,
      alternates: {
        languages: Object.fromEntries(locales.map((l) => [l, `${base}/${l}${path}`])),
      },
    }))
  );

  return [...builtIn, ...custom];
}
