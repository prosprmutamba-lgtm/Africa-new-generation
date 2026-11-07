import type { Metadata } from "next";
import { getSite } from "@/lib/site/site";
import { pageMeta } from "@/lib/site/metadata";
import { localeOf } from "@/lib/site/page";
import { ContactBody } from "@/components/site/page-bodies";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const site = await getSite(await localeOf(params));
  return pageMeta(site, { title: site.t("contact.seoTitle"), description: site.t("contact.seoDescription"), path: "/contact" });
}

export default async function Page({ params }: Props) {
  const site = await getSite(await localeOf(params));
  return <ContactBody site={site} />;
}
