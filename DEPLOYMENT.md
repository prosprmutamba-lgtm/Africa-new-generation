# Deployment

The site needs a **Node.js server** (it reads and writes the admin data at run time). A static export is not possible.

## Environment variables (set them in your hosting panel — never commit them)

| Variable | Required | Meaning |
|---|---|---|
| `ADMIN_SESSION_SECRET` | **yes** | ≥ 32 random characters. `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"` |
| `CMS_DATA_DIR` | **yes** | A folder **outside** the deployed application folder, e.g. `/home/<user>/ang-data`. Holds every edit, page, account, message and uploaded image. |
| `NEXT_PUBLIC_SITE_URL` | recommended | Public address, e.g. `https://www.your-domain.org` (sitemap, canonical links, sharing) |
| `CMS_UPLOAD_DIR`, `CMS_MAX_UPLOAD_MB` | no | See `.env.example` |
| `ADMIN_BOOTSTRAP_EMAIL` / `_NAME` / `_PASSWORD` | first deploy only | Creates the first administrator when no terminal is available. **Delete them after the first sign-in.** |

## Hostinger

Hostinger runs Next.js on its **Node.js web apps**, available on **Business web hosting and Cloud plans** (not on the
entry-level Premium plan); a VPS also works. Check the plan page for the current list.

1. hPanel → Websites → Add website → **Node.js Apps**; import the GitHub repository or upload this project's ZIP (without `node_modules`, `.next`, `data`).
2. Build command `npm run build`, start command `npm run start`, Node 20 or 22.
3. Add the environment variables above. Use HTTPS.
4. Open `https://<domain>/admin/login`, sign in, create real accounts, then remove `ADMIN_BOOTSTRAP_*`.

### To confirm on your plan before launch

1. **Persistence:** edit a text and upload an image, then redeploy or restart: both must still be there. If not, the data folder is not safe on your plan — ask me for a MySQL driver (the storage is isolated in `lib/cms/store.ts`) and note that uploaded images would then need persistent disk or object storage.
2. **One running instance only** (login throttling and write locking are per process).
3. **Upload size limit** of the hosting proxy; lower `CMS_MAX_UPLOAD_MB` if large uploads fail.
4. **Email:** the contact form stores messages in the dashboard (Admin → Messages). It does not send email by itself.

## Other hosts

Any host that runs `npm run build` + `npm run start` with a persistent folder for `CMS_DATA_DIR` works (VPS, Railway/Render with a volume, Docker with a mounted volume). Platforms with a read-only or ephemeral file system (such as serverless functions) do not suit the file-based admin store.

## Backups

Back up the `CMS_DATA_DIR` folder (JSON files + `uploads/`). Restoring it restores the whole site content.
