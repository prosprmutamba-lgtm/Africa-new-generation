# Admin dashboard (`/admin`)

A secure dashboard that lets non-developers edit the website: texts in English and French, menu, home-page sections, programs, gallery, partners, logo, contact details and images — without touching code.

> **Status.** The dashboard, its storage, security, media handling, the page builder **and the public site
> that reads from it** are in this project. Every setting in the dashboard is read by the public pages through
> `lib/site/site.ts` (see [ADMIN_WIRING.md](./ADMIN_WIRING.md)); [V1_CHECKLIST.md](./V1_CHECKLIST.md) lists what is
> managed, what was verified automatically and what still has to be tested on your computer.

## 1. How it works

| Concern | Choice |
|---|---|
| Where it lives | `app/admin/*` (own layout, not translated, not under `/en` `/fr`). API under `app/api/admin/*`. |
| Content storage | Small JSON documents in `CMS_DATA_DIR` (texts changes, settings, accounts, activity log). Written atomically, one writer at a time. Isolated in `lib/cms/store.ts` behind a `DocStore` interface so a MySQL driver can replace it without touching anything else. |
| Texts | Your `locales/en.json` and `locales/fr.json` stay the source. The admin stores only the **differences**, laid over them by `lib/i18n-request.ts`. Anything not edited keeps following the files; "Restore original" works everywhere. |
| Settings | Menu, contact, social, footer, logo, programs (visibility/order/cover), partners, testimonial photos, gallery, home sections. Defaults are read from `config/*.ts`; saving a section stores a full copy; "Reset to original" deletes it. |
| Media | Uploaded to `CMS_UPLOAD_DIR` and served by `app/media/[name]/route.ts` at `/media/<file>`. (Files added to `/public` after a build are not reliably served by `next start`, so uploads do not live there.) JPG, PNG, WebP, GIF, SVG; default max 8 MB. |
| Auth | Email + password. Passwords hashed with scrypt. Signed, `HttpOnly`, `SameSite=Strict`, `Secure` session cookie (8 h). |
| Roles | **Administrator**: everything, incl. user accounts. **Editor**: content, settings and media, no accounts. |
| Custom pages | Created in **Admin → Pages**, stored in `pages.json`, served by `app/[locale]/[...rest]/page.tsx` at `/<locale>/<slug>`. Real routes (about, programs, contact…) always win. |
| Publishing | Every save revalidates the public site, so it appears without a rebuild. |

## 2. Configuration

Copy `.env.example` to `.env.local` (development) or set the variables in your hosting panel (production). **Never commit secrets.**

| Variable | Required | Purpose |
|---|---|---|
| `ADMIN_SESSION_SECRET` | **Production: yes** | ≥ 32 random characters. Signs session cookies. Generate: `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`. Changing it signs everyone out. In production a missing secret disables sign-in (there is no insecure default). |
| `CMS_DATA_DIR` | **Production: yes** | Folder for the admin data. **Must be outside the deployed app folder** (e.g. `/home/<user>/ang-data`) so redeploys never erase edits/uploads. Dev default: `./data`. The folder must be writable by the Node process. |
| `CMS_UPLOAD_DIR` | no | Separate folder for uploads (default `<CMS_DATA_DIR>/uploads`). |
| `CMS_MAX_UPLOAD_MB` | no | Upload limit, default 8 (max 50). Your hosting/proxy may impose its own lower limit. |
| `ADMIN_COOKIE_SECURE` | no | Set to `false` only to test the production build over plain `http://`. |
| `ADMIN_BOOTSTRAP_EMAIL` / `_NAME` / `_PASSWORD` | no | Create the first administrator without a terminal. See §4. |
| `NEXT_PUBLIC_SITE_URL` | recommended | Public site URL (already used by SEO/sitemap). |

## 3. Local development

```bash
npm install
cp .env.example .env.local          # in dev, ADMIN_SESSION_SECRET may stay empty
npm run admin -- create --email you@example.org --name "Your Name"   # asks for a password (min 12 chars)
npm run dev
# open http://localhost:3000/admin
```

Data is created in `./data` (git-ignored). Delete that folder to start from scratch.

## 4. First administrator, new accounts, lost passwords

There is deliberately **no public "sign up" or "setup" page**.

* **With a terminal** (SSH, or your PC): `npm run admin -- create --email … --name "…"` (add `--role editor` for an editor). The password is typed at a hidden prompt (or set `ADMIN_PASSWORD` for scripts).
* **Without a terminal**: set `ADMIN_BOOTSTRAP_EMAIL`, `ADMIN_BOOTSTRAP_NAME`, `ADMIN_BOOTSTRAP_PASSWORD`, deploy, sign in once, then **delete the three variables**. They only work while no account exists.
* **More accounts**: Dashboard → Users (administrators only). A generated password is shown once.
* **Forgot your password**: another administrator resets it in Users. If nobody can sign in: `npm run admin -- reset-password --email you@example.org` (needs a terminal on the server, using the same `CMS_DATA_DIR`).
* **Change your own password**: My account. Other devices are signed out.
* **Disable / delete / demote** someone: Users. It takes effect immediately (their session stops working at once). The last active administrator cannot be removed.
* **Sign everyone out**: change `ADMIN_SESSION_SECRET`.
* `npm run admin -- list` shows accounts.

Run the CLI when nobody is saving in the dashboard (it edits `users.json` directly).

## 5. Using the dashboard

* **Dashboard** — numbers, a "still to finish" list built from the real placeholders in the delivered config (placeholder videos/partners/logo, temporary social accounts, unconfirmed founding year and map), what is connected to the public site, recent activity.
* **Texts** — every string of both languages side by side, with search. Lists (stories, FAQs, testimonials, news…) can be reordered, duplicated and removed; they always change in both languages together. A bar at the bottom shows unsaved changes.
* **Pages** — create a page (e.g. a program, an event, the Livelihood week), build it from blocks, preview it, publish or unpublish it, duplicate or delete it. See §5b.
* **Buttons & links** — destination, visibility and "new tab" for every call-to-action button of the site (the wording stays in Texts).
* **Messages** — contact-form messages (read/unread, reply by email, delete) and newsletter sign-ups (CSV download).
* **Programs** — show/hide, order, cover image. Names/descriptions are in Texts.
* **Gallery**, **Logo & partners**, **Menu & home page**, **Contact & social** — forms with per-field errors, "Save", "Discard", "Reset to original".
* **Media library** — drag-and-drop upload with progress, preview, copy path, replace file (same URL), delete (blocked with an explanation while the image is in use).
* **Users / My account**.

## 5b. Pages and blocks

1. **Admin → Pages → New page.** Give an English and/or French title and an address (slug, e.g. `livelihood-week`). It is created as a **draft**.
2. **Page settings**: titles, address, navigation placement (none / main menu / footer, with link text and order), SEO title/description/sharing image per language.
3. **Content** is a list of blocks you can add, move, duplicate and delete: *Heading, Text, Image (with description and caption), Buttons/links, Cards, Key figures, Testimonials, FAQ, Call to action*. Images, links and numbers are typed once and shared by both languages; texts are typed per language, side by side.
4. **Languages card**: shows, live, what is still missing in English and in French. A page is shown in a language only when it is published **and** complete in that language. Nothing is translated automatically; a language left unfinished simply returns "not found" for visitors.
5. **Preview EN / Preview FR** opens the real public page (`?preview=1`) with a banner listing what is missing. It works only for signed-in users, shows drafts, and always shows the **last saved** version — save first.
6. **Publish** is refused until at least one language is complete. **Unpublish** hides the page without deleting it.
7. Addresses that already exist as site routes (`about`, `programs`, `contact`, `programs/<existing>`, `impact-stories/<existing>`, `admin`, `api`, `media`, `en`, `fr`) are refused. Addresses may have up to three levels (`news/summer/camp`).
8. An image used by a page cannot be deleted from the media library without an explicit "Delete anyway".

Pages placed in the **main menu** or the **footer** (Page settings → Navigation) appear there automatically, in the languages in which they are live. They are also listed in `sitemap.xml`.

## 6. Deploying on Hostinger

Hostinger's Node.js web apps (Next.js supported; Node 18/20/22/24; deploy from GitHub or a ZIP upload) are available on **Business web hosting and Cloud plans** — not on the entry-level Premium plan. A VPS also works. Check the current plan page when you buy.

1. In hPanel → Websites → Add website → **Node.js Apps**; connect the GitHub repo or upload the project ZIP **without** `node_modules`, `.next`, `.git`, `data`.
2. Set the environment variables of §2 in the app's settings (`ADMIN_SESSION_SECRET`, `CMS_DATA_DIR`, and `ADMIN_BOOTSTRAP_*` for the first account).
3. Use HTTPS (the session cookie is `Secure`).
4. Sign in at `https://<your-domain>/admin/login`, create real accounts, remove `ADMIN_BOOTSTRAP_*`.

### Things to confirm on your plan before launch (I could not verify them)

1. **Does a folder outside the app folder survive a redeploy, and can the app write to it?** Test: edit one text and upload one image, redeploy (or restart), check both are still there. If anything is lost → the file store is not safe on your plan; use the managed MySQL of a Cloud plan (or Supabase) and a MySQL `DocStore` driver (not included — the interface is ready in `lib/cms/store.ts`; uploads would then need object storage or a persistent disk).
2. **Single running instance.** Login throttling and write locking are per process. Do not scale to several instances writing the same folder.
3. **Upload size limit** of the hosting proxy (if uploads of a few MB fail with "too large", lower `CMS_MAX_UPLOAD_MB` or raise the proxy limit).
4. **Terminal access** (only needed for `reset-password`; otherwise use another administrator).
5. **Build/start command**: the app uses the standard `next build` / `next start`.

## 7. Security summary

* Every `/api/admin/*` route and every admin page check the session **on the server**, re-reading the account each time (disabled accounts and role changes apply immediately). `middleware.ts` only adds a fast redirect.
* Writes require a same-origin `Origin` header (CSRF), JSON is validated with zod, URLs are restricted (no `javascript:`, images must be local paths, videos YouTube/Vimeo embeds only).
* Uploads: type detected from file **content** (not the name), size limit, SVG with scripts refused and SVG served with a sandboxing CSP, file names generated server-side, path traversal impossible.
* Login: constant-ish timing for unknown emails, identical error messages, lock after 8 failed tries per email / 30 per IP for 15 minutes.
* Secrets only in environment variables; the admin never sends hashes to the browser. Admin responses are `no-store`, `X-Robots-Tag: noindex`, not framable, and `/admin` is disallowed in `robots.txt`.

**Not included:** two-factor authentication, email-based password reset, per-field version history (the activity log records who saved what and when, not the previous values), a Content-Security-Policy for the public site.

## 8. Known limits

* New **programs** and new **pages** need code (each has its own route). The dashboard edits existing ones.
* Story/program **images** that are part of the code's folder structure (`/public/images/...`) are referenced by path; use "Use an existing site path" in the image picker for those.
* Story and program **pictures** follow file naming conventions (`public/images/impact-stories/<slug>/cover.jpg`, `public/images/programs/<slug>/hero.jpg`) because the text structure has no field for them; program **covers** are chosen in the dashboard. Team photos are set by file name or by pasting a `/media/...` path in Texts → About → Leadership.
* Impact figures are empty until you enter them; the original starter had no numbers in the texts and none are invented.
* The contact form stores messages in the dashboard; it does not send email. Add a notification later (webhook or SMTP) if needed.
* The admin interface is in English only.
* The page builder has fixed block types (no free-form HTML, no custom layout) by design; text is plain (paragraphs and line breaks, no inline bold/links — use a Buttons block for links).
* A page cannot have different images/links per language (they are shared); texts can differ.
* No scheduled publishing and no page version history.

## 9. Brand charter (colours, fonts, logos)

* Colours follow the official charter: blue `#004CC0` (brand), yellow `#F3AC02`, red `#DE2325`, anthracite `#282C37`, white. They are defined once in `tailwind.config.ts` (`brand.blue/gold/red/navy`) and `app/globals.css` (CSS variables). `brand.navy` keeps its historical key but now holds the anthracite.
* Fonts: **Anton** for headlines (`font-heading`), **Montserrat** for everything else (`font-body`), declared in `lib/fonts.ts` via `next/font/google` (downloaded at build time, served from your domain — the build machine needs internet access once). `lib/fonts.ts` contains the exact steps to switch to local font files instead. Anton has a single weight, so bold is deliberately never synthesised.
* Logos: use only the official files. Upload the **full-colour**, **white** and **black** versions in *Admin → Logo & partners*; the site never recolours or reshapes them. The charter image itself is not a usable logo file — the original SVG/PNG files are needed.
