/**
 * Pure helpers shared by the server and the admin text editor (no Node imports).
 *
 * Text overrides are stored as a flat map  "dotted.path" -> value  that is laid
 * over locales/<lang>.json. Paths walk objects by key and arrays by index
 * ("home.news.items.0.title"). The editor never stores "what the admin clicked":
 * it stores the DIFFERENCE between the shipped file and the edited copy, so
 * resetting a field is simply editing it back to the shipped text.
 */

export type Json = string | number | boolean | null | Json[] | { [k: string]: Json };
export type Overrides = Record<string, Json>;

export function isPlainObject(v: unknown): v is { [k: string]: Json } {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

export function getAt(root: Json, path: string): Json | undefined {
  let cur: Json | undefined = root;
  for (const seg of path.split(".")) {
    if (Array.isArray(cur)) {
      if (!/^\d+$/.test(seg)) return undefined;
      cur = cur[Number(seg)];
    } else if (isPlainObject(cur)) {
      cur = Object.prototype.hasOwnProperty.call(cur, seg) ? cur[seg] : undefined;
    } else return undefined;
    if (cur === undefined) return undefined;
  }
  return cur;
}

/** Immutable set: returns a new tree with `value` written at `path`. */
export function setAt<T extends Json>(root: T, path: string, value: Json): T {
  const segs = path.split(".");
  const walk = (node: Json, i: number): Json => {
    if (i === segs.length) return value;
    const seg = segs[i] as string;
    if (Array.isArray(node)) {
      const copy = node.slice();
      copy[Number(seg)] = walk(copy[Number(seg)] as Json, i + 1);
      return copy;
    }
    if (isPlainObject(node)) return { ...node, [seg]: walk(node[seg] as Json, i + 1) };
    throw new Error(`Cannot write at ${path}`);
  };
  return walk(root, 0) as T;
}

export function deepEqual(a: Json | undefined, b: Json | undefined): boolean {
  if (a === b) return true;
  if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((v, i) => deepEqual(v, b[i]));
  if (isPlainObject(a) && isPlainObject(b)) {
    const ka = Object.keys(a);
    return ka.length === Object.keys(b).length && ka.every((k) => deepEqual(a[k], b[k]));
  }
  return false;
}

/**
 * Compare the shipped messages (`base`) with an edited copy (`draft`).
 *  - strings that differ  -> one override per string path;
 *  - arrays whose LENGTH changed (item added/removed) -> the whole array;
 *  - arrays of the same length -> compared item by item (so reordering is
 *    expressed as per-item text changes, and untouched items keep following
 *    the shipped file).
 */
export function diffToOverrides(base: Json, draft: Json, prefix = "", out: Overrides = {}): Overrides {
  if (Array.isArray(base) && Array.isArray(draft)) {
    if (base.length !== draft.length) {
      out[prefix] = draft;
      return out;
    }
    base.forEach((b, i) => diffToOverrides(b, draft[i] as Json, prefix ? `${prefix}.${i}` : String(i), out));
    return out;
  }
  if (isPlainObject(base) && isPlainObject(draft)) {
    for (const k of Object.keys(base)) {
      if (k in draft) diffToOverrides(base[k] as Json, draft[k] as Json, prefix ? `${prefix}.${k}` : k, out);
    }
    return out;
  }
  if (!deepEqual(base, draft)) out[prefix] = draft;
  return out;
}

/** Lay overrides over the shipped messages. Shorter paths first, so a whole-array override wins over nothing deeper. */
export function applyOverrides<T extends Json>(base: T, overrides: Overrides): T {
  const entries = Object.entries(overrides).sort((a, b) => a[0].split(".").length - b[0].split(".").length);
  let out: Json = base;
  for (const [path, value] of entries) {
    if (path === "" || getAt(out, path) === undefined) continue; // stale key (text removed from the shipped file) — ignore
    out = setAt(out, path, value);
  }
  return out as T;
}

const MAX_TEXT = 20000;

function validLeafTree(v: Json, allowedKeys: Set<string> | null, depth = 0): boolean {
  if (typeof v === "string") return v.length <= MAX_TEXT;
  if (Array.isArray(v)) return depth < 3 && v.length <= 200 && v.every((x) => validLeafTree(x, allowedKeys, depth + 1));
  if (isPlainObject(v)) {
    if (depth >= 3) return false;
    return Object.entries(v).every(
      ([k, x]) => (allowedKeys === null || allowedKeys.has(k)) && validLeafTree(x, null, depth + 1)
    );
  }
  return false;
}

/** Server-side validation of an overrides map against the shipped messages. */
export function validateOverrides(base: Json, overrides: unknown): { ok: true; value: Overrides } | { ok: false; errors: string[] } {
  if (!isPlainObject(overrides)) return { ok: false, errors: ["Text changes must be an object."] };
  const errors: string[] = [];
  const value: Overrides = {};
  if (JSON.stringify(overrides).length > 600_000) return { ok: false, errors: ["Too many text changes in one save."] };
  for (const [path, v] of Object.entries(overrides)) {
    const target = getAt(base, path);
    if (path === "" || target === undefined) {
      errors.push(`"${path}" is not a known text.`);
    } else if (typeof target === "string") {
      if (typeof v !== "string") errors.push(`"${path}" must be text.`);
      else if (v.length > MAX_TEXT) errors.push(`"${path}" is too long (max ${MAX_TEXT} characters).`);
      else value[path] = v;
    } else if (Array.isArray(target)) {
      const sample = target.find(isPlainObject);
      const keys = sample ? new Set(Object.keys(sample)) : null;
      const sampleIsObject = sample !== undefined;
      if (!Array.isArray(v)) errors.push(`"${path}" must be a list.`);
      else if (v.some((x) => (sampleIsObject ? !isPlainObject(x) : typeof x !== "string"))) {
        errors.push(`"${path}" has items of the wrong kind.`);
      } else if (!validLeafTree(v as Json, keys)) errors.push(`"${path}" contains invalid or oversized content.`);
      else value[path] = v as Json;
    } else {
      errors.push(`"${path}" cannot be replaced directly.`);
    }
  }
  return errors.length ? { ok: false, errors } : { ok: true, value };
}

/** Paths where two message trees have lists of different length (EN and FR lists must stay parallel). */
export function arrayLengthMismatches(a: Json, b: Json, prefix = "", out: string[] = []): string[] {
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) out.push(prefix);
    else a.forEach((x, i) => arrayLengthMismatches(x, b[i] as Json, prefix ? `${prefix}.${i}` : String(i), out));
  } else if (isPlainObject(a) && isPlainObject(b)) {
    for (const k of Object.keys(a)) if (k in b) arrayLengthMismatches(a[k] as Json, b[k] as Json, prefix ? `${prefix}.${k}` : k, out);
  }
  return out;
}
