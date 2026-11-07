import { notFound } from "next/navigation";
import { PAGE_LOCALES, type PageLocale } from "@/lib/cms/blocks";

/** Validates the [locale] segment (anything but en/fr is a 404). */
export async function localeOf(params: Promise<{ locale: string }>): Promise<PageLocale> {
  const { locale } = await params;
  if (!(PAGE_LOCALES as readonly string[]).includes(locale)) notFound();
  return locale as PageLocale;
}
