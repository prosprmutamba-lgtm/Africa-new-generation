import type { Metadata } from "next";
import { getSite } from "@/lib/site/site";
import { pageMeta } from "@/lib/site/metadata";
import { localeOf } from "@/lib/site/page";
import { GalleryBody } from "@/components/site/page-bodies";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const site = await getSite(await localeOf(params));
  return pageMeta(site, { title: site.t("gallery.seoTitle"), description: site.t("gallery.seoDescription"), path: "/gallery" });
}

export default async function Page({ params }: Props) {
  const site = await getSite(await localeOf(params));
  return <GalleryBody site={site} />;
}
