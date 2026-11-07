import { promises as fs } from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { store } from "./store";
import { UPLOAD_DIR, MAX_UPLOAD_MB } from "./paths";

export type MediaKind = "jpg" | "png" | "webp" | "gif" | "svg";

export const MIME: Record<MediaKind, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  svg: "image/svg+xml",
};

export interface MediaRecord {
  name: string;
  originalName: string;
  kind: MediaKind;
  size: number;
  width: number | null;
  height: number | null;
  uploadedBy: string;
  uploadedAt: string;
  updatedAt: string;
}
interface MediaDoc {
  files: Record<string, MediaRecord>;
}
const EMPTY: MediaDoc = { files: {} };

export class MediaError extends Error {
  constructor(
    message: string,
    public status = 422,
    public usages?: string[]
  ) {
    super(message);
  }
}

export const MAX_BYTES = MAX_UPLOAD_MB * 1024 * 1024;
export const NAME_RE = /^[a-z0-9][a-z0-9._-]{0,120}$/;

export function mediaUrl(name: string) {
  return `/media/${name}`;
}

/* ───────── type detection (by content, never by file extension) ───────── */

export function detectKind(b: Buffer): MediaKind | null {
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpg";
  if (b.length >= 8 && b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (b.length >= 6 && /^GIF8[79]a$/.test(b.subarray(0, 6).toString("latin1"))) return "gif";
  if (b.length >= 12 && b.subarray(0, 4).toString("latin1") === "RIFF" && b.subarray(8, 12).toString("latin1") === "WEBP") return "webp";
  const head = b.subarray(0, 2048).toString("utf8").trimStart().toLowerCase();
  if (head.startsWith("<svg") || (head.startsWith("<?xml") && b.toString("utf8", 0, 4096).toLowerCase().includes("<svg"))) return "svg";
  return null;
}

/** SVG can carry script. Uploaded SVGs must be plain vector art. (They are also served with a sandboxing CSP.) */
export function svgProblem(b: Buffer): string | null {
  const s = b.toString("utf8").toLowerCase();
  if (!/<svg[\s>]/.test(s)) return "This file is not a valid SVG.";
  if (/<script|<foreignobject|<iframe|<embed|<object|<!entity|javascript:|\bon[a-z]+\s*=|<!doctype[^>]*\[/.test(s))
    return "This SVG contains scripts or embedded content and cannot be uploaded. Export a plain SVG, or use PNG.";
  return null;
}

/* ───────── pixel size from the file header ───────── */

export function readDimensions(b: Buffer, kind: MediaKind): { width: number; height: number } | null {
  try {
    if (kind === "png") return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
    if (kind === "gif") return { width: b.readUInt16LE(6), height: b.readUInt16LE(8) };
    if (kind === "jpg") {
      let i = 2;
      while (i + 9 < b.length) {
        if (b[i] !== 0xff) {
          i += 1;
          continue;
        }
        const marker = b[i + 1] as number;
        if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker))
          return { height: b.readUInt16BE(i + 5), width: b.readUInt16BE(i + 7) };
        i += 2 + b.readUInt16BE(i + 2);
      }
      return null;
    }
    if (kind === "webp") {
      const chunk = b.subarray(12, 16).toString("latin1");
      if (chunk === "VP8 ") return { width: b.readUInt16LE(26) & 0x3fff, height: b.readUInt16LE(28) & 0x3fff };
      if (chunk === "VP8L") {
        const bits = b.readUInt32LE(21);
        return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
      }
      if (chunk === "VP8X") return { width: 1 + b.readUIntLE(24, 3), height: 1 + b.readUIntLE(27, 3) };
      return null;
    }
    const s = b.toString("utf8", 0, 4096);
    const w = /<svg[^>]*\swidth="([\d.]+)(px)?"/i.exec(s)?.[1];
    const h = /<svg[^>]*\sheight="([\d.]+)(px)?"/i.exec(s)?.[1];
    if (w && h) return { width: Math.round(Number(w)), height: Math.round(Number(h)) };
    const vb = /viewBox="[\d.\-]+[ ,]+[\d.\-]+[ ,]+([\d.]+)[ ,]+([\d.]+)"/i.exec(s);
    if (vb) return { width: Math.round(Number(vb[1])), height: Math.round(Number(vb[2])) };
  } catch {
    /* header shorter than expected */
  }
  return null;
}

/* ───────── naming ───────── */

export function slugifyName(original: string): string {
  const base = original.replace(/\.[^.]*$/, "");
  const s = base
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/, "");
  return s || "file";
}

const EXT: Record<MediaKind, string> = { jpg: "jpg", png: "png", webp: "webp", gif: "gif", svg: "svg" };

/* ───────── operations ───────── */

export async function saveUpload(input: { bytes: Buffer; originalName: string; user: string; replace?: string }): Promise<MediaRecord> {
  const { bytes, originalName, user, replace } = input;
  if (bytes.length === 0) throw new MediaError("The file is empty.");
  if (bytes.length > MAX_BYTES) throw new MediaError(`The file is too large (${(bytes.length / 1048576).toFixed(1)} MB). The maximum is ${MAX_UPLOAD_MB} MB.`, 413);
  const kind = detectKind(bytes);
  if (!kind) throw new MediaError("Unsupported file. Upload a JPG, PNG, WebP, GIF or SVG image.", 415);
  if (kind === "svg") {
    const problem = svgProblem(bytes);
    if (problem) throw new MediaError(problem, 415);
  }
  const dims = readDimensions(bytes, kind);
  if (kind !== "svg" && (!dims || dims.width < 1 || dims.height < 1)) throw new MediaError("This image file looks damaged. Try exporting it again.");

  let name: string;
  if (replace) {
    if (!NAME_RE.test(replace)) throw new MediaError("Invalid file name.", 400);
    const onDisk = await fs.stat(path.join(UPLOAD_DIR, replace)).catch(() => null);
    if (!onDisk) throw new MediaError("The file to replace no longer exists.", 404);
    const existingExt = path.extname(replace).slice(1);
    if (existingExt !== EXT[kind] && !(existingExt === "jpeg" && kind === "jpg"))
      throw new MediaError(`The replacement must be the same type (.${existingExt}). Upload it as a new file instead.`);
    name = replace;
  } else {
    name = `${slugifyName(originalName)}-${randomBytes(4).toString("hex")}.${EXT[kind]}`;
  }

  await fs.mkdir(UPLOAD_DIR, { recursive: true, mode: 0o750 });
  const target = path.join(UPLOAD_DIR, name);
  const tmp = `${target}.${randomBytes(4).toString("hex")}.tmp`;
  await fs.writeFile(tmp, bytes, { mode: 0o640 });
  await fs.rename(tmp, target);

  const now = new Date().toISOString();
  let rec!: MediaRecord;
  await store.update<MediaDoc>("media", EMPTY, (d) => {
    const prev = d.files[name];
    rec = {
      name,
      originalName: prev?.originalName ?? originalName.slice(0, 200),
      kind,
      size: bytes.length,
      width: dims?.width ?? null,
      height: dims?.height ?? null,
      uploadedBy: prev?.uploadedBy ?? user,
      uploadedAt: prev?.uploadedAt ?? now,
      updatedAt: now,
    };
    d.files[name] = rec;
    return d;
  });
  return rec;
}

export async function listMedia(): Promise<MediaRecord[]> {
  const index = (await store.read<MediaDoc>("media", EMPTY)).data.files;
  let names: string[] = [];
  try {
    names = (await fs.readdir(UPLOAD_DIR)).filter((n) => NAME_RE.test(n));
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
  }
  const out: MediaRecord[] = [];
  for (const name of names) {
    const known = index[name];
    if (known) {
      out.push(known);
      continue;
    }
    // A file copied into the uploads folder by hand: still list it.
    const st = await fs.stat(path.join(UPLOAD_DIR, name));
    const ext = path.extname(name).slice(1).toLowerCase();
    const kind = (ext === "jpeg" ? "jpg" : ext) as MediaKind;
    if (!(kind in MIME)) continue;
    out.push({
      name,
      originalName: name,
      kind,
      size: st.size,
      width: null,
      height: null,
      uploadedBy: "—",
      uploadedAt: st.mtime.toISOString(),
      updatedAt: st.mtime.toISOString(),
    });
  }
  return out.sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
}

/** Where is this file used? Looks in the admin's own settings and text changes. */
export async function findMediaUsages(name: string): Promise<string[]> {
  const needle = mediaUrl(name);
  const found: string[] = [];
  const settings = (await store.read<Record<string, unknown>>("settings", {})).data;
  for (const [group, value] of Object.entries(settings)) if (JSON.stringify(value).includes(needle)) found.push(`Settings → ${group}`);
  for (const loc of ["en", "fr"] as const) {
    const doc = (await store.read<{ values: Record<string, unknown> }>(`messages.${loc}`, { values: {} })).data;
    if (JSON.stringify(doc.values ?? {}).includes(needle)) found.push(`Texts (${loc.toUpperCase()})`);
  }
  const pages = (await store.read<{ pages: Array<{ title: { en: string }; slug: string }> }>("pages", { pages: [] })).data.pages;
  for (const pg of pages) if (JSON.stringify(pg).includes(needle)) found.push(`Page “${pg.title.en || pg.slug}” (/${pg.slug})`);
  return found;
}

export async function deleteMedia(name: string, force: boolean): Promise<void> {
  if (!NAME_RE.test(name)) throw new MediaError("Invalid file name.", 400);
  const usages = await findMediaUsages(name);
  if (usages.length && !force) throw new MediaError("This file is still used on the site.", 409, usages);
  await fs.rm(path.join(UPLOAD_DIR, name), { force: true });
  await store.update<MediaDoc>("media", EMPTY, (d) => {
    delete d.files[name];
    return d;
  });
}

export async function readMediaFile(name: string): Promise<{ bytes: Buffer; kind: MediaKind; mtime: Date } | null> {
  if (!NAME_RE.test(name)) return null;
  const ext = path.extname(name).slice(1).toLowerCase();
  const kind = (ext === "jpeg" ? "jpg" : ext) as MediaKind;
  if (!(kind in MIME)) return null;
  try {
    const file = path.join(UPLOAD_DIR, name);
    const [bytes, st] = await Promise.all([fs.readFile(file), fs.stat(file)]);
    return { bytes, kind, mtime: st.mtime };
  } catch {
    return null;
  }
}
