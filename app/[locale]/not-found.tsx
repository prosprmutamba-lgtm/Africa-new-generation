import { getLocale } from "next-intl/server";
import { getSite } from "@/lib/site/site";
import { NotFoundBody } from "@/components/site/page-bodies";

/** Localised “page not found”, rendered inside the normal header and footer. */
export default async function NotFound() {
  let locale: "en" | "fr" = "en";
  try {
    locale = (await getLocale()) === "fr" ? "fr" : "en";
  } catch {
    /* no locale in context: default language */
  }
  return <NotFoundBody site={await getSite(locale)} />;
}
