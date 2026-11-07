# V1 checklist

Legend: ✅ managed in the dashboard **and** read by the public site · 🟡 partly · ⬜ not managed (reason given).

"Verified" = exercised by automated tests in my build environment (see the last section). Nothing could be run
inside `npm install` / `next build` / `next dev` there; that part is for your computer (INSTALLATION.md §4).

## Public site: what can be managed without code

| Item | Status | Where |
|---|---|---|
| All wording of all pages, EN and FR (titles, paragraphs, button text, menu labels, footer text, programs, stories, FAQ, testimonials, news, SEO titles/descriptions) | ✅ | Texts |
| Create / edit / preview / publish / unpublish / duplicate / delete pages; address (slug); SEO; EN/FR with the missing language reported | ✅ | Pages |
| Page blocks: heading, text, image + caption, buttons, cards, key figures, testimonials, FAQ, call to action | ✅ | Pages |
| Pages in the main menu / footer, with link text and order | ✅ | Pages → Navigation |
| Main menu: order, visibility, destination, highlighted item | ✅ | Menu & home page |
| Destination, visibility and new-tab flag of every call-to-action button (21) | ✅ | Buttons & links |
| Button wording | ✅ | Texts |
| Home page sections: show/hide/reorder (11) | ✅ | Menu & home page |
| Home hero photos, About photos, closing-banner photo, default sharing image | ✅ | Logo & partners → Site photos |
| Impact figures (left empty = hidden) | ✅ | Menu & home page |
| Programs: visibility, order, cover picture; wording | ✅ | Programs, Texts |
| New programs / new pages | ✅ via custom pages (`programs/<address>` is supported) | Pages |
| Gallery photos and videos (add, remove, reorder, description, category, embed link) | ✅ | Gallery |
| Partners (name, logo, link, visibility) | ✅ | Logo & partners |
| Testimonial photos | ✅ | Logo & partners |
| Logo: colour, white, black variants (official files to upload) | ✅ | Logo & partners |
| Phone, WhatsApp, email, address, map, coordinates | ✅ | Contact & social |
| Social links, footer blocks, organization name and founding year | ✅ | Contact & social |
| Contact messages and newsletter sign-ups | ✅ | Messages |
| Pictures: upload, replace, preview, delete (with in-use protection) | ✅ | Media library |
| Users, roles, passwords | ✅ | Users, My account |

## Not managed from the dashboard (and why)

| Item | Why |
|---|---|
| Layout/structure of the existing pages (what blocks appear in what order on About, Programs…) | It is page code. Home sections and custom-page blocks are reorderable. |
| Favicon / browser-tab icon | A file in the code (`app/`). |
| Story pictures, program hero pictures, team photos by file name | The text structure has no image field; they follow naming conventions (see docs/ADMIN.md §8). Program covers, gallery, hero and about photos are managed. |
| Destination of the "Back to programs / stories" links | Structural navigation (the text is editable). |
| Email notification of contact messages | Messages are stored in the dashboard; sending email needs a mail service you choose. |
| Online payment | The site lists bank and mobile-money details (editable in Texts). No payment processor is integrated. |

## Verified automatically in my environment

| Area | Checks |
|---|---|
| Storage, texts, settings, sessions, passwords, media | 40 |
| API routes (auth, roles, CSRF, limits) | 34 |
| Page builder (validation, completeness per language, publish rules, API) | 21 |
| Public rendering of custom pages (blocks, languages, safety) | 5 |
| Public site pages in EN and FR, all programs and stories: no raw keys, language prefix, one `h1`, `alt` on images, no old name; admin ⇄ site connection (hide a button, re-point a link, reorder home sections, edit a text, contact/social/footer, programs, gallery, partners, photos, logo, custom pages in the menu) | 16 |
| Public forms (validation, honeypot, rate limit, cross-site refusal) and admin inbox | 10 |
| **Every admin server page** (dashboard, texts, settings, menu, buttons, programs, gallery, logo, media, messages, pages, page editor, account, users, login, layout) rendered with a real session and React in development mode: no error, no warning; redirects when signed out; editor limits | 19 |
| First administrator from environment variables | 4 |
| **Public site hydrated in Chromium** (React development build): 18 pages × 2 languages with zero console errors, warnings or hydration mismatches; hero slider, mobile menu, language switch, gallery filters and lightbox, contact form (FR), newsletter | 8 (36 page loads) |
| Dashboard in Chromium — texts, settings, media, users | 33 |
| Dashboard in Chromium — page builder | 22 |
| Dashboard in Chromium — buttons & links, figures, photos, messages | 12 |
| Server/client boundary audit of all 128 TypeScript files (`npm run check:boundaries`, also confirmed to flag the exact mistake of an earlier version) | pass |
| `tailwind.config.ts` loads as an ES module and as CommonJS (animate plugin imported, no `require`) | pass |

## Still to test on your computer

1. `npm install`, `npm run typecheck`, `npm run lint`, `npm run build`, `npm run dev`: **never run in my environment** (no network, incomplete packages). Fix anything these report (send me the output).
2. **Visual review** of the public site and the dashboard at phone / tablet / desktop widths: I could not render the stylesheet (Tailwind was not installable), so colours, spacing and the look of the reference-inspired layout are unverified.
3. Brand fonts (Anton, Montserrat) load correctly (needs internet at build) and headlines look right.
4. The language switcher, mobile menu, hero slider and gallery lightbox in a real browser on the real build.
5. Upload the official **logo files** (colour, white, black) and your **photos**.
6. Hostinger: persistence of the data folder across a redeploy (DEPLOYMENT.md), HTTPS cookie sign-in, upload size.
7. Enter the real **impact figures**, replace the placeholder **partners**, **gallery video links** and temporary **social accounts**; confirm the contact details, map and founding year.
8. Accessibility pass (keyboard, screen reader) on the real site.
