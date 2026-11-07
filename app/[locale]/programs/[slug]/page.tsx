import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/cms/auth";
import { findPageForLocale } from "@/lib/cms/pages";
import { getSite, programView, visiblePrograms } from "@/lib/site/site";
import { pageMeta } from "@/lib/site/metadata";
import { localeOf } from "@/lib/site/page";
import { ProgramBody } from "@/components/site/page-bodies";
import { PageView } from "@/components/blocks/render";

type Props = { params: Promise<{ locale: string; slug: string }>; searchParams: Promise<{ preview?: string }> };

/**
 * /programs/<slug>: one of the programs of the organization, OR a page created in the admin
 * with that address (e.g. programs/livelihood-week). Anything else is a 404.
 */
async function resolve({ params, searchParams }: Props) {
  const locale = await localeOf(params);
  const { slug } = await params;
  const site = await getSite(locale);
  const program = visiblePrograms(site).find((p) => p.slug === slug);
  if (program) return { kind: "program" as const, site, slug, program };
  const sp = await searchParams;
  const preview = sp.preview === "1" && (await getCurrentUser()) !== null;
  const found = await findPageForLocale(locale, `programs/${slug.toLowerCase()}`, preview);
  return found ? { kind: "custom" as const, site, found, preview } : null;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const r = await resolve(props);
  if (!r) return { title: "Not found", robots: { index: false } };
  if (r.kind === "custom") {
    const { page } = r.found;
    return { title: page.seo.title[r.site.locale].trim() || page.title[r.site.locale], description: page.seo.description[r.site.locale].trim() || undefined, robots: r.preview || !r.found.visible ? { index: false } : undefined };
  }
  const v = programView(r.site, r.program);
  return pageMeta(r.site, { title: `${v.title} | ${r.site.settings.organization.name}`, description: v.short, path: `/programs/${r.slug}`, image: v.cover });
}

export default async function ProgramPage(props: Props) {
  const r = await resolve(props);
  if (!r) notFound();
  if (r.kind === "custom") {
    const { page, readiness, visible } = r.found;
    const loc = r.site.locale;
    return <PageView title={page.title[loc]} blocks={page.blocks} locale={loc} preview={r.preview ? { status: page.status, visible, issues: readiness.issues } : undefined} />;
  }
  return <ProgramBody site={r.site} slug={r.slug} />;
}
