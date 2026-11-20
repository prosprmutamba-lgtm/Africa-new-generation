# Installation

## Requirements

* **Node.js 18.18 or newer** (20 or 22 recommended) and npm
* **Internet access the first time** you run `npm install` and the first build/dev start (npm packages and the two brand fonts, Anton and Montserrat, are downloaded once; after the build they are served from your own domain). To work fully offline, see the "local fonts" note in `lib/fonts.ts`.

## 1. Install

```bash
npm install
cp .env.example .env.local
```

In development you do not need to fill `.env.local`. For production see DEPLOYMENT.md.

## 2. Create the first administrator

```bash
npm run admin -- create --email you@example.org --name "Your Name"
```

You type a password (at least 12 characters). Other commands: `npm run admin -- list`, `npm run admin -- reset-password --email you@example.org`.
The data is created in `./data` (git-ignored): delete that folder to start again from the shipped content.

## 3. Run

```bash
npm run dev          # development, http://localhost:3000
```

* `http://localhost:3000/` redirects to `/en`; `/fr` is the French version
* `http://localhost:3000/admin` is the dashboard

## 4. Verify the project (recommended before deploying)

```bash
npm run check:boundaries   # server/client boundary check (also runs automatically before `npm run build`)
npm run typecheck    # TypeScript
npm run lint         # ESLint (warnings are expected for <img> in a few components)
npm run build        # production build
npm run start        # serve the production build on port 3000
```

If one of these commands prints an error, send me the full message: it is the quickest way to get it fixed.

## 5. Pictures

The project ships without photographs. Every large picture is optional: a missing file is replaced by a
branded colour block, never a broken image. Add pictures from the dashboard (**Media library**, then
**Logo & partners → Site photos**, **Gallery**, **Programs**) — nothing needs to be copied into the code.

If you prefer files in the repository, the conventional locations are `public/images/hero/`, `public/images/about/`,
`public/images/programs/<slug>/{cover,hero}.jpg`, `public/images/impact-stories/<slug>/cover.jpg`,
`public/images/team/<photo>.jpg`, `public/images/gallery/...` and the logo files in `public/logo/`.
