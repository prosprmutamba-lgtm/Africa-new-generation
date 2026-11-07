import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import type { Site } from "./site";

/** Per-page metadata from the (editable) texts: title + description + canonical/alternate languages + social image. */
export function pageMeta(site: Site, o: { title: string; description: string; path?: string; image?: string }): Metadata {
  return buildPageMetadata({
    title: o.title,
    description: o.description,
    locale: site.locale,
    path: o.path ?? "",
    image: o.image || site.settings.images.ogDefault || undefined,
  });
}
