/**
 * ────────────────────────────────────────────────────────────
 * TESTIMONIALS CONFIGURATION
 * ────────────────────────────────────────────────────────────
 * Structural data only — order and optional avatar image per testimonial.
 * The actual quote/name/role TEXT lives in locales/*.json under
 * `home.testimonials.items` (it must be translated, so it can't live
 * here). This file's `id` values must match the `id` field of the
 * corresponding entry in both locales/en.json and locales/fr.json —
 * that's how the two are joined together on the Home page.
 *
 * To add a testimonial:
 *   1. Add an entry to `home.testimonials.items` in locales/en.json AND
 *      locales/fr.json, with a new unique `id`.
 *   2. Add a matching row here with that same `id` (and an avatar image,
 *      or omit `avatar` to show no photo).
 * To remove one: delete its entry from both locale files and from here.
 * To reorder: reorder the arrays (locale + this file don't need to be in
 * the same order — they're joined by `id`, not by position).
 * ────────────────────────────────────────────────────────────
 */

export interface TestimonialConfigItem {
  id: string;
  avatar?: string;
}

export const testimonialsConfig: TestimonialConfigItem[] = [
  { id: "t1", avatar: "/images/testimonials/t1.jpg" },
  { id: "t2", avatar: "/images/testimonials/t2.jpg" },
  { id: "t3", avatar: "/images/testimonials/t3.jpg" },
  { id: "t4", avatar: "/images/testimonials/t4.jpg" },
];
