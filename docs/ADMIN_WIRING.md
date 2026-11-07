# How the public site reads the dashboard

Every public page gets its data from one function, `getSite(locale)` in `lib/site/site.ts`:

```
getSite(locale) = shipped texts (locales/*.json) + text edits  →  site.t("key")
                + settings (menu, contact, social, footer, logo, programs, gallery, partners, photos, figures…)
                + editable buttons                              →  site.link("slot")
                + custom pages placed in the menu/footer
```

It is rendered per request (`export const dynamic = "force-dynamic"` in `app/[locale]/layout.tsx`), so a change saved in
the dashboard is visible on the next page load, without a rebuild.

## What each public part reads

| Public part | File | Reads (dashboard screen) |
|---|---|---|
| All wording on every page | every component via `site.t()` | Texts |
| Top bar (phone, email, place), footer contact column | `components/site/header.tsx`, `footer.tsx` | Contact & social |
| Main menu (order, visibility, links, highlight) and mobile menu | `header.tsx`, `nav-links.tsx`, `mobile-menu.tsx` | Menu & home page |
| Header "Donate" button | `header.tsx` | Buttons & links (`header.donate`) |
| Logo (colour on light, white on dark) | `components/site/logo.tsx` | Logo & partners |
| Footer blocks, programs list, social icons | `footer.tsx` | Contact & social (Footer, Social) |
| Pages placed in menu / footer | `lib/site/site.ts` (`listNavPages`) | Pages |
| Home sections: order and visibility | `app/[locale]/page.tsx` | Menu & home page |
| Hero slides (text) and photos | `home-sections.tsx` (`HeroSection`) | Texts + Logo & partners → Site photos |
| Impact figures | `StatsSection` | Menu & home page → Impact figures (hidden until filled) |
| Programs: list, order, visibility, covers | `home-sections.tsx`, `page-bodies.tsx`, `footer.tsx` | Programs |
| Program pages (full template / summary) | `app/[locale]/programs/[slug]/page.tsx` | Texts (`programs.<key>.*`) + Programs |
| Impact stories and their detail pages | `app/[locale]/impact-stories/**` | Texts (`impactStories.items`) |
| Gallery (page + home preview) | `GalleryBody`, `GalleryPreview` | Gallery |
| Partners | `PartnersSection` (placeholders never shown) | Logo & partners |
| Testimonials (text and photos) | `TestimonialsSection` | Texts + Logo & partners |
| Every call-to-action button (21 slots) | `components/site/ui.tsx` (`CtaLink`) | Buttons & links (destination, hide, new tab) + Texts (wording) |
| Contact form / newsletter | `contact-form.tsx`, `newsletter-form.tsx` → `app/api/contact`, `app/api/newsletter` | Messages |
| Pages created in the dashboard | `app/[locale]/[...rest]/page.tsx`, `components/blocks/render.tsx` | Pages |
| `sitemap.xml` | `app/sitemap.ts` | Pages, Programs, Texts |

## Defence in depth

Links are always rendered through `components/site/smart-link.tsx` (language prefix, safe external links; anything that is not a normal link becomes `#`) and images through `components/site/safe-image.tsx` (only local paths; a missing file becomes a branded placeholder). Text is rendered as plain text by React, so nothing typed in the dashboard can inject HTML.

## Adding a new editable button

1. Add one entry to `lib/cms/link-slots.ts` (id, where it appears, the text key, the default destination).
2. Render it with `<CtaLink site={site} slot="your.id" label={t("your.text.key")} />`.

It then appears in Admin → Buttons & links automatically.

## Known limits of this reconstruction

* The original page components were not available; the public pages were rebuilt from the configuration files, the English and French texts and the brand charter. Their layout is new, so it will not match any earlier layout pixel for pixel.
* The "Back to programs / stories" links point to fixed addresses (the text is editable).
* The favicon is a file in the code, not editable at run time.
