#!/usr/bin/env node
/**
 * Static check of the Next.js server/client boundary (the mistakes that only show up when the page opens):
 *  1. a SERVER file calls/uses a non-component value imported from a "use client" file (e.g. a helper function);
 *  2. a SERVER file uses React hooks or event handlers (they need "use client");
 *  3. a CLIENT file imports a server-only module (fs, next/headers, the content store…);
 *  4. a SERVER file passes a function as a prop to a client component (functions cannot be serialised).
 * Run:  npm run check:boundaries      (exit code 1 if something is found)
 */
import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import path from "node:path";

const ROOTS = ["app", "components", "lib", "hooks"];
const EXTS = ["", ".ts", ".tsx", "/index.ts", "/index.tsx"];
const SERVER_ONLY = /^(node:|fs$|path$|crypto$|next\/headers$|next\/cache$|server-only$|@\/lib\/cms\/(store|auth|api|pages|media|users|runtime|messages|audit|inbox|defaults|public-form|paths|password|rate-limit|throttle)$|@\/lib\/site\/(site|metadata|page)$)/;

const files = [];
(function walk(d) {
  if (!existsSync(d)) return;
  for (const n of readdirSync(d)) {
    if (n === "node_modules" || n === ".next") continue;
    const p = path.join(d, n);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(ts|tsx)$/.test(n) && !n.endsWith(".d.ts")) files.push(p);
  }
})(".");
const rel = files.filter((f) => ROOTS.some((r) => f.startsWith(r + path.sep)));
const src = new Map(rel.map((f) => [path.normalize(f), readFileSync(f, "utf8")]));
const isClient = (s) => /^\s*(?:\/\*[\s\S]*?\*\/\s*|\/\/[^\n]*\n\s*)*["']use client["']/.test(s);

function resolve(from, spec) {
  const base = spec.startsWith("@/") ? spec.slice(2) : path.join(path.dirname(from), spec);
  for (const e of EXTS) {
    const p = path.normalize(base + e);
    if (src.has(p)) return p;
  }
  return null;
}

/** Value exports of a module (types ignored). */
function valueExports(s) {
  const out = new Set();
  for (const m of s.matchAll(/export\s+(?:async\s+)?(?:function|const|let|var|class)\s+([A-Za-z0-9_$]+)/g)) out.add(m[1]);
  for (const m of s.matchAll(/export\s*\{([^}]*)\}/g)) for (const part of m[1].split(",")) { const t = part.trim(); if (t && !t.startsWith("type ")) out.add(t.split(/\s+as\s+/).pop().trim()); }
  return out;
}

const problems = [];
const add = (file, msg) => problems.push(`${file}: ${msg}`);

for (const [file, s] of src) {
  const client = isClient(s);
  const imports = [...s.matchAll(/import\s+(type\s+)?(?:(\w+)\s*,?\s*)?(?:\{([^}]*)\})?\s*from\s*["']([^"']+)["']/g)];

  if (client) {
    for (const m of imports) if (!m[1] && SERVER_ONLY.test(m[4])) add(file, `client file imports server-only module "${m[4]}"`);
    continue;
  }

  // 2. hooks / event handlers in a server file
  const stripped = s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
  const hook = stripped.match(/\buse(State|Effect|LayoutEffect|Ref|Context|Memo|Callback|Reducer|Id|Pathname|Router|SearchParams|Transition|Toast|Confirm)\s*\(/);
  if (hook && !/export\s+const\s+use\w+/.test(stripped)) add(file, `server file calls the hook use${hook[1]}() (needs "use client")`);
  const handler = stripped.match(/\s(on[A-Z][A-Za-z]*)=\{/);
  if (handler) add(file, `server file sets the event handler ${handler[1]} (needs "use client")`);

  // 1 + 4. what is taken from client modules
  for (const m of imports) {
    if (m[1]) continue; // import type
    const target = resolve(file, m[4]);
    if (!target || !isClient(src.get(target))) continue;
    const exported = valueExports(src.get(target));
    const names = (m[3] ?? "").split(",").map((x) => x.trim()).filter((x) => x && !x.startsWith("type ")).map((x) => x.split(/\s+as\s+/).pop().trim());
    for (const n of names) {
      if (!exported.has(n)) continue;
      if (!/^[A-Z]/.test(n)) add(file, `server file imports the non-component "${n}" from the client module ${m[4]} — move it to a plain module`);
      else {
        // a component: it must not receive function props from a server file
        for (const t of stripped.matchAll(new RegExp(`<${n}\\b([^>]*?)(?:/>|>)`, "gs"))) {
          if (/=\{\s*(?:async\s*)?(?:\([^)]*\)|[A-Za-z_$][\w$]*)\s*=>/.test(t[1]) || /=\{\s*function\b/.test(t[1])) add(file, `function passed as a prop to the client component <${n}> (cannot be serialised)`);
        }
      }
    }
  }
}

if (problems.length) {
  console.error(`Server/client boundary problems (${problems.length}):\n` + problems.map((p) => "  - " + p).join("\n"));
  process.exit(1);
}
console.log(`Server/client boundary check passed (${src.size} files, ${[...src.values()].filter(isClient).length} client modules).`);
