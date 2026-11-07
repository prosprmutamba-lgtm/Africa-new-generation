import type { Metadata } from "next";
import { getSite } from "@/lib/site/site";
import { pageMeta } from "@/lib/site/metadata";
import { localeOf } from "@/lib/site/page";
import { DonateBody } from "@/components/site/page-bodies";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const site = await getSite(await localeOf(params));
  return pageMeta(site, { title: site.t("makeADifference.seoTitle"), description: site.t("makeADifference.seoDescription"), path: "/make-a-difference" });
}

export default async function Page({ params }: Props) {
  const site = await getSite(await localeOf(params));
  return <DonateBody site={site} />;
}
