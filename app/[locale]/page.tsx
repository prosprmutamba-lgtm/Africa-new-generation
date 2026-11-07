import type { Metadata } from "next";
import { getVisibleHomeSections } from "@/lib/cms/runtime";
import { getSite } from "@/lib/site/site";
import { pageMeta } from "@/lib/site/metadata";
import { localeOf } from "@/lib/site/page";
import { HOME_RENDERERS } from "@/components/site/home-sections";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const site = await getSite(await localeOf(params));
  return pageMeta(site, { title: site.t("home.seoTitle"), description: site.t("home.seoDescription") });
}

/** The home page = the sections chosen (and ordered) in Admin → Menu & home page. */
export default async function HomePage({ params }: Props) {
  const site = await getSite(await localeOf(params));
  const order = await getVisibleHomeSections();
  return (
    <>
      {order.map((id) => {
        const Section = HOME_RENDERERS[id];
        return Section ? <Section key={id} site={site} /> : null;
      })}
    </>
  );
}
