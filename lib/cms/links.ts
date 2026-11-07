/** Pure link helpers shared by the public renderer and the admin. */

export function isExternal(href: string): boolean {
  return /^(https?:)?\/\//i.test(href) || /^(mailto|tel):/i.test(href);
}

/** "/contact" → "/en/contact"; leaves external links, anchors, media files and already-localised paths alone. */
export function localizeHref(href: string, locale: string): string {
  if (!href.startsWith("/") || href.startsWith("//")) return href;
  if (href.startsWith("/media/")) return href;
  if (/^\/(en|fr)(\/|$|\?|#)/.test(href)) return href;
  return `/${locale}${href === "/" ? "" : href}`;
}

/** Defence in depth for rendering: anything that is not a normal link becomes "#". */
export function safeHref(href: string): string {
  return /^(\/(?!\/)|#|https?:\/\/|mailto:|tel:)/i.test(href) ? href : "#";
}

/** Only local image paths are ever rendered. */
export function safeSrc(src: string): string {
  return /^\/[^/\\]/.test(src) && !src.includes("..") ? src : "";
}
