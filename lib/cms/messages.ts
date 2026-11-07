import { store } from "./store";
import { applyOverrides, type Json, type Overrides } from "./messages-diff";

export const LOCALES = ["en", "fr"] as const;
export type MessageLocale = (typeof LOCALES)[number];

export function isLocale(v: string): v is MessageLocale {
  return (LOCALES as readonly string[]).includes(v);
}

export interface OverridesDoc {
  values: Overrides;
}

export async function getBaseMessages(locale: MessageLocale): Promise<Json> {
  return ((await import(`../../locales/${locale}.json`)) as { default: Json }).default;
}

export async function readOverrides(locale: MessageLocale) {
  return store.read<OverridesDoc>(`messages.${locale}`, { values: {} });
}

/** The messages the public site uses: shipped file + admin overrides. Never throws on bad overrides. */
export async function getMergedMessages(locale: MessageLocale): Promise<Json> {
  const base = await getBaseMessages(locale);
  try {
    const { data } = await readOverrides(locale);
    return applyOverrides(base, data.values ?? {});
  } catch (err) {
    console.error(`[cms] could not read text overrides for ${locale}; serving shipped texts`, err);
    return base;
  }
}
