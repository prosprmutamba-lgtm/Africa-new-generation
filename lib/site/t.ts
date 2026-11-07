import { getAt, type Json } from "@/lib/cms/messages-diff";

/**
 * Tiny translation helper over the MERGED messages (shipped JSON + admin edits).
 * Public components receive `t` as a prop, so they stay plain React and fully testable.
 *   t("home.hero.headline")           → string
 *   t("footer.copyright", { year })   → replaces {year}
 *   t.raw("about.values.items")       → the array / object itself
 * A missing key returns "" (so nothing like "home.hero.x" is ever shown to visitors) and is reported through onMissing.
 */
export type T = {
  (key: string, vars?: Record<string, string | number>): string;
  raw: (key: string) => Json | undefined;
  has: (key: string) => boolean;
  list: (key: string) => Array<Record<string, Json>>;
  strings: (key: string) => string[];
};

export function makeT(messages: Json, onMissing?: (key: string) => void): T {
  const t = ((key: string, vars?: Record<string, string | number>) => {
    const v = getAt(messages, key);
    if (typeof v !== "string") {
      onMissing?.(key);
      return "";
    }
    return vars ? v.replace(/\{(\w+)\}/g, (m, name: string) => (name in vars ? String(vars[name]) : m)) : v;
  }) as T;
  t.raw = (key) => getAt(messages, key);
  t.has = (key) => typeof getAt(messages, key) === "string";
  t.list = (key) => {
    const v = getAt(messages, key);
    return Array.isArray(v) ? (v.filter((x) => typeof x === "object" && x !== null && !Array.isArray(x)) as Array<Record<string, Json>>) : [];
  };
  t.strings = (key) => {
    const v = getAt(messages, key);
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
  };
  return t;
}

export function formatDate(iso: string, locale: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(d);
}

export const str = (v: Json | undefined): string => (typeof v === "string" ? v : "");
