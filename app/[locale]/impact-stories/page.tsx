import type { Metadata } from "next";
import { getSite } from "@/lib/site/site";
import { pageMeta } from "@/lib/site/metadata";
import { localeOf } from "@/lib/site/page";
import { StoriesBody } from "@/components/site/page-bodies";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const site = await getSite(await localeOf(params));
  return pageMeta(site, { title: site.t("impactStories.seoTitle"), description: site.t("impactStories.seoDescription"), path: "/impact-stories" });
}

export default async function Page({ params }: Props) {
  const site = await getSite(await localeOf(params));
  return <StoriesBody site={site} />;
}
