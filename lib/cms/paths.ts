import path from "node:path";

/**
 * Where the admin data lives. IMPORTANT for production: point CMS_DATA_DIR at a
 * folder OUTSIDE the deployed application folder, otherwise a redeploy can wipe
 * every edit and every uploaded image. See docs/ADMIN.md.
 */
export const DATA_DIR = path.resolve(process.env.CMS_DATA_DIR || path.join(process.cwd(), "data"));
export const UPLOAD_DIR = path.resolve(process.env.CMS_UPLOAD_DIR || path.join(DATA_DIR, "uploads"));
export const MAX_UPLOAD_MB = Math.min(Math.max(Number(process.env.CMS_MAX_UPLOAD_MB) || 8, 1), 50);
