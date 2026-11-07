# Africa New Generation (ANG) — Website

Official website of **Africa New Generation (ANG)**, a refugee-led organization based in Kyaka II Refugee
Settlement, Kyegegwa District, Western Uganda — protection, inclusion, education, advocacy and sustainable
development. Public site in **English and French**, with a secure **admin dashboard** (`/admin`) that lets
non-developers manage the whole site.

## What is in this project

| Part | Where | Notes |
|---|---|---|
| Public site (EN / FR) | `app/[locale]/**`, `components/site/**` | Home, About, Programs (+ one page per program), Impact stories (+ detail), Gallery, Make a Difference, Contact, 404, plus pages created in the dashboard |
| Admin dashboard | `app/admin/**`, `components/admin/**`, `app/api/admin/**` | Texts, pages & blocks, programs, gallery, menu, buttons & links, logo, photos, partners, media, messages, users |
| Content engine | `lib/cms/**` | Storage, validation, authentication, media, page builder |
| Public ⇄ admin glue | `lib/site/**` | `getSite(locale)` — what every public page reads |
| Starting content | `locales/en.json`, `locales/fr.json`, `config/*.ts` | Shipped defaults; the admin stores only the differences |
| Brand | `tailwind.config.ts`, `app/globals.css`, `lib/fonts.ts` | Official charter: blue `#004CC0`, yellow `#F3AC02`, red `#DE2325`, anthracite `#282C37`, white; **Anton** headlines, **Montserrat** body |

## Tech stack (what the code actually uses)

Next.js 15 (App Router) · TypeScript · Tailwind CSS · next-intl (routing/middleware) · zod · lucide-react ·
Node.js ≥ 18.18. No database server: the admin keeps its data in a folder (see `docs/ADMIN.md`).
`package.json` still lists some libraries from the original starter (Radix UI, Framer Motion, React Hook Form,
embla, lightbox…) that this version does not use; they are harmless and can be removed later.

## Quick start

```bash
npm install
cp .env.example .env.local
npm run admin -- create --email you@example.org --name "Your Name"   # first administrator
npm run dev                                                          # http://localhost:3000
```

* Public site: `http://localhost:3000/en` and `/fr`
* Dashboard: `http://localhost:3000/admin`

## Documentation

* **[INSTALLATION.md](INSTALLATION.md)** — install, run, verify locally
* **[DEPLOYMENT.md](DEPLOYMENT.md)** — deploy (Hostinger and others), what to configure
* **[CONTENT_GUIDE.md](CONTENT_GUIDE.md)** — how to change every part of the site from the dashboard
* **[PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)** — annotated folder tree
* **[docs/ADMIN.md](docs/ADMIN.md)** — dashboard: architecture, configuration, security, limits
* **[docs/ADMIN_WIRING.md](docs/ADMIN_WIRING.md)** — which public component reads which admin setting
* **[docs/V1_CHECKLIST.md](docs/V1_CHECKLIST.md)** — what is manageable today, what is verified, what remains

## Organization name

The organization is always written **Africa New Generation (ANG)** (site, dashboard, metadata, texts). It is
set once in `config/site.ts` (and can be changed in Admin → Contact & social → Organization).
