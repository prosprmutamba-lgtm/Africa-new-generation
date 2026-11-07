import { promises as fs } from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { DATA_DIR } from "./paths";

/**
 * Document store.
 *
 * The admin keeps a handful of small JSON documents (settings, text overrides,
 * users, audit log, media index). This file is the ONLY place that touches the
 * disk for them. It is deliberately behind the `DocStore` interface so a MySQL
 * driver (e.g. the database included with some Hostinger plans) can replace it
 * later without touching any other file.
 *
 * Guarantees of this file driver:
 *  - atomic writes (temp file + rename), so a crash never leaves half a file;
 *  - one writer at a time per document inside the Node process;
 *  - optimistic concurrency: callers can pass the `rev` they loaded and get a
 *    ConflictError if someone else saved in between.
 * It does NOT coordinate several Node processes writing the same folder — run a
 * single instance (the normal setup on a Node.js plan or a small VPS).
 */

export const DOC_NAMES = ["settings", "messages.en", "messages.fr", "users", "audit", "media", "pages", "inbox"] as const;
export type DocName = (typeof DOC_NAMES)[number];

export interface Envelope<T> {
  rev: number;
  updatedAt: string | null;
  updatedBy: string | null;
  data: T;
}

export class ConflictError extends Error {
  constructor() {
    super("This content was changed by someone else since you opened it. Reload the page and try again.");
    this.name = "ConflictError";
  }
}

export interface UpdateOptions {
  /** If set, the update fails with ConflictError unless the stored rev matches. */
  expectedRev?: number;
  /** Who is saving (email), recorded in the document envelope. */
  user?: string | null;
}

export interface DocStore {
  read<T>(name: DocName, fallback: T): Promise<Envelope<T>>;
  update<T>(name: DocName, fallback: T, mutate: (data: T) => T | Promise<T>, opts?: UpdateOptions): Promise<Envelope<T>>;
}

const locks = new Map<string, Promise<unknown>>();

function withLock<T>(name: string, fn: () => Promise<T>): Promise<T> {
  const prev = locks.get(name) ?? Promise.resolve();
  const run = prev.then(
    () => fn(),
    () => fn()
  );
  locks.set(
    name,
    run.catch(() => undefined)
  );
  return run;
}

function fileFor(name: DocName): string {
  if (!(DOC_NAMES as readonly string[]).includes(name)) throw new Error(`Unknown document: ${name}`);
  return path.join(DATA_DIR, `${name}.json`);
}

async function readEnvelope<T>(name: DocName, fallback: T): Promise<Envelope<T>> {
  const file = fileFor(name);
  let raw: string;
  try {
    raw = await fs.readFile(file, "utf8");
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      return { rev: 0, updatedAt: null, updatedBy: null, data: structuredClone(fallback) };
    }
    throw err;
  }
  // A corrupted file must stop the write (never silently replaced by defaults).
  const parsed = JSON.parse(raw) as Envelope<T>;
  if (typeof parsed !== "object" || parsed === null || typeof parsed.rev !== "number" || !("data" in parsed)) {
    throw new Error(`Document ${name}.json is not in the expected format.`);
  }
  return parsed;
}

export const fsStore: DocStore = {
  read: (name, fallback) => readEnvelope(name, fallback),

  update: (name, fallback, mutate, opts = {}) =>
    withLock(name, async () => {
      const current = await readEnvelope(name, fallback);
      if (opts.expectedRev !== undefined && opts.expectedRev !== current.rev) throw new ConflictError();
      const data = await mutate(structuredClone(current.data));
      const next: Envelope<typeof data> = {
        rev: current.rev + 1,
        updatedAt: new Date().toISOString(),
        updatedBy: opts.user ?? null,
        data,
      };
      await fs.mkdir(DATA_DIR, { recursive: true, mode: 0o700 });
      const file = fileFor(name);
      const tmp = `${file}.${randomBytes(6).toString("hex")}.tmp`;
      await fs.writeFile(tmp, JSON.stringify(next, null, 2), { mode: 0o600 });
      await fs.rename(tmp, file);
      return next;
    }),
};

export const store: DocStore = fsStore;
