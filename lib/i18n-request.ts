import { getRequestConfig } from "next-intl/server";
import type { AbstractIntlMessages } from "next-intl";
import { notFound } from "next/navigation";
import { locales, type Locale } from "@/lib/i18n";
import { getMergedMessages } from "@/lib/cms/messages";

/**
 * next-intl request config (registered in next.config.js).
 * `requestLocale` (not the deprecated `locale` param) is the current next-intl API.
 *
 * Messages = the shipped /locales/<lang>.json PLUS any text changes saved in the
 * admin dashboard. This single hook is what makes every edited title, paragraph,
 * button label, programme description, story, FAQ and testimonial appear on the site.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale;

  if (!locale || !locales.includes(locale as Locale)) {
    notFound();
  }

  return {
    locale,
    messages: (await getMergedMessages(locale as Locale)) as unknown as AbstractIntlMessages,
  };
});
