import { cache } from "react";
import { getEffectiveSettings } from "@/lib/cms/runtime";
import { getMergedMessages } from "@/lib/cms/messages";
import { listNavPages } from "@/lib/cms/pages";
import { LINK_SLOTS } from "@/lib/cms/link-slots";
import type { PageLocale } from "@/lib/cms/blocks";
import { makeT } from "./t";
import type { NavEntry, Site } from "./views";

/** Everything a public page needs, in one call: texts + settings + editable links + navigation. */
export const getSite = cache(async (locale: PageLocale): Promise<Site> => {
  const [messages, eff, headerPages, footerPages] = await Promise.all([
    getMergedMessages(locale),
    getEffectiveSettings(),
    listNavPages(locale, "header").catch(() => []),
    listNavPages(locale, "footer").catch(() => []),
  ]);
  const settings = eff.settings;
  const t = makeT(messages);

  const menu: NavEntry[] = settings.menu
    .filter((m) => m.visible)
    .map((m) => ({ key: m.key, href: m.href, label: t(`nav.${m.key}`), highlight: m.highlight }));
  for (const p of headerPages) menu.push({ key: `page:${p.slug}`, href: p.href, label: p.label, highlight: false, custom: true });

  const bySlot = new Map(settings.links.map((l) => [l.id, l]));
  const defaults = new Map(LINK_SLOTS.map((l) => [l.id as string, l.href as string]));
  const link: Site["link"] = (id) => {
    const l = bySlot.get(id);
    if (!l) return { href: defaults.get(id) ?? "/", newTab: false };
    return l.visible ? { href: l.href, newTab: l.newTab } : null;
  };

  return {
    locale,
    messages,
    t,
    settings,
    menu,
    footerPages: footerPages.map((p) => ({ key: `page:${p.slug}`, href: p.href, label: p.label, highlight: false, custom: true })),
    link,
  };
});

export * from "./views";
