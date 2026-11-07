"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useMemo, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, ChevronDown, Copy, RotateCcw, Search, Trash2 } from "lucide-react";
import { ApiFail, Badge, Button, Card, api, cx, errorText, useConfirm, useToast, useUnsavedWarning } from "./ui";
import { diffToOverrides, getAt, isPlainObject, setAt, type Json } from "@/lib/cms/messages-diff";

type Locale = "en" | "fr";
type Trees = Record<Locale, Json>;

const SECTION_LABELS: Record<string, string> = {
  nav: "Menu labels",
  common: "Common words & buttons",
  home: "Home page",
  about: "About page",
  programs: "Programs",
  impactStories: "Impact stories",
  gallery: "Gallery page",
  makeADifference: "Make a Difference (donations)",
  contact: "Contact page",
  notFound: "“Page not found”",
  footer: "Footer",
  seo: "Search engines & sharing",
};

const TECHNICAL = new Set(["slug", "id", "programSlug", "key"]);

function humanize(seg: string): string {
  if (/^\d+$/.test(seg)) return `Item ${Number(seg) + 1}`;
  const spaced = seg.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/_/g, " ").toLowerCase();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function itemTitle(item: Json | undefined, i: number): string {
  if (typeof item === "string") return item.length > 70 ? `${item.slice(0, 70)}…` : item || `Item ${i + 1}`;
  if (isPlainObject(item)) {
    for (const k of ["title", "name", "question", "headline", "quoteName", "label", "heading", "slug", "id"]) {
      const v = item[k];
      if (typeof v === "string" && v.trim()) return v.length > 70 ? `${v.slice(0, 70)}…` : v;
    }
  }
  return `Item ${i + 1}`;
}

function collectStrings(node: Json, prefix: string, out: string[]) {
  if (typeof node === "string") out.push(prefix);
  else if (Array.isArray(node)) node.forEach((n, i) => collectStrings(n, prefix ? `${prefix}.${i}` : String(i), out));
  else if (isPlainObject(node)) for (const k of Object.keys(node)) collectStrings(node[k] as Json, prefix ? `${prefix}.${k}` : k, out);
}

function uniqueCopy(existing: Json[], value: string): string {
  const taken = new Set(existing.map((e) => (isPlainObject(e) ? [e.id, e.slug] : [])).flat());
  let candidate = `${value}-copy`;
  for (let n = 2; taken.has(candidate); n++) candidate = `${value}-copy-${n}`;
  return candidate;
}

/* ───────────────────────── one editable text, both languages ───────────────────────── */

function StringRow({
  path,
  label,
  en,
  fr,
  changed,
  breadcrumb,
  onChange,
  onReset,
}: {
  path: string;
  label: string;
  en: string;
  fr: string;
  changed: boolean;
  breadcrumb?: boolean;
  onChange: (l: Locale, v: string) => void;
  onReset: () => void;
}) {
  const last = path.split(".").pop() ?? "";
  const rows = (chars: number) => Math.min(Math.max(Math.ceil(chars / 62), 1), 9);
  const area = "w-full resize-y rounded-xl border border-input bg-white px-3 py-2 text-sm leading-relaxed text-brand-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-blue-500";
  return (
    <div className={cx("rounded-xl border bg-white/70 p-3", changed ? "border-brand-gold-300" : "border-border")}>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium">
          {label}
          {breadcrumb && <span className="ml-2 font-normal text-xs text-muted-foreground">{path.split(".").map(humanize).join(" › ")}</span>}
        </p>
        <div className="flex items-center gap-2">
          {TECHNICAL.has(last) && <span className="text-xs text-muted-foreground">Technical: also used in web addresses and links</span>}
          {changed && (
            <>
              <Badge tone="gold">Edited</Badge>
              <button onClick={onReset} className="inline-flex items-center gap-1 text-xs text-brand-blue-600 hover:underline" title="Go back to the original text in both languages">
                <RotateCcw className="h-3 w-3" /> Restore original
              </button>
            </>
          )}
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="block text-xs text-muted-foreground">
          English
          <textarea aria-label={`${label} (English)`} value={en} rows={rows(Math.max(en.length, fr.length))} onChange={(e) => onChange("en", e.target.value)} className={cx(area, "mt-1")} />
        </label>
        <label className="block text-xs text-muted-foreground">
          Français
          <textarea aria-label={`${label} (Français)`} value={fr} rows={rows(Math.max(en.length, fr.length))} onChange={(e) => onChange("fr", e.target.value)} className={cx(area, "mt-1")} />
        </label>
      </div>
    </div>
  );
}

/* ───────────────────────── editor ───────────────────────── */

export function ContentEditor({ base, initial, revs: initialRevs, initialSection }: { base: Trees; initial: Trees; revs: Record<Locale, number>; initialSection?: string }) {
  const toast = useToast();
  const confirm = useConfirm();
  const sections = useMemo(() => Object.keys(base.en as object), [base]);
  const [section, setSection] = useState(initialSection && sections.includes(initialSection) ? initialSection : (sections[0] as string));
  const [draft, setDraft] = useState<Trees>(initial);
  const [saved, setSaved] = useState<Trees>(initial);
  const [revs, setRevs] = useState(initialRevs);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [banner, setBanner] = useState<{ text: string; conflict?: boolean } | null>(null);

  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(saved), [draft, saved]);
  useUnsavedWarning(dirty);

  /** edited vs the original shipped files, per section (for the little counters) */
  const changedPaths = useMemo(() => {
    const all = new Set<string>();
    for (const l of ["en", "fr"] as Locale[]) for (const p of Object.keys(diffToOverrides(base[l], draft[l]))) all.add(p);
    return all;
  }, [base, draft]);
  const unsavedCount = useMemo(() => {
    let n = 0;
    for (const l of ["en", "fr"] as Locale[]) n += Object.keys(diffToOverrides(saved[l], draft[l])).length;
    return n;
  }, [saved, draft]);
  const countFor = (sec: string) => [...changedPaths].filter((p) => p === sec || p.startsWith(`${sec}.`)).length;
  const isChanged = (path: string) => [...changedPaths].some((p) => p === path || p.startsWith(`${path}.`) || path.startsWith(`${p}.`));

  /* edits */
  const setString = (path: string, l: Locale, v: string) => setDraft((d) => ({ ...d, [l]: setAt(d[l], path, v) }));
  const restore = (path: string) => setDraft((d) => ({ en: setAt(d.en, path, getAt(base.en, path) as Json), fr: setAt(d.fr, path, getAt(base.fr, path) as Json) }));

  function editList(path: string, fn: (arr: Json[], l: Locale) => Json[]) {
    setDraft((d) => {
      const out = { ...d };
      for (const l of ["en", "fr"] as Locale[]) {
        const arr = getAt(d[l], path);
        if (Array.isArray(arr)) out[l] = setAt(d[l], path, fn(arr.slice(), l));
      }
      return out;
    });
  }
  const move = (path: string, i: number, dir: -1 | 1) =>
    editList(path, (arr) => {
      const j = i + dir;
      if (j < 0 || j >= arr.length) return arr;
      [arr[i], arr[j]] = [arr[j] as Json, arr[i] as Json];
      return arr;
    });
  const duplicate = (path: string, i: number) =>
    editList(path, (arr) => {
      const copy = JSON.parse(JSON.stringify(arr[i])) as Json;
      if (isPlainObject(copy)) {
        // The copy needs its own id/slug (use the English one for both languages so they stay joined)
        const enArr = getAt(draft.en, path) as Json[];
        const enItem = enArr?.[i];
        for (const k of ["id", "slug"]) {
          const v = isPlainObject(enItem) ? enItem[k] : undefined;
          if (typeof v === "string") copy[k] = uniqueCopy(enArr, v);
        }
      }
      arr.splice(i + 1, 0, copy);
      return arr;
    });
  async function remove(path: string, i: number) {
    const arr = getAt(draft.en, path) as Json[];
    const ok = await confirm({
      title: "Remove this item?",
      body: `“${itemTitle(arr[i], i)}” will be removed from BOTH languages once you save. Use “Restore original” on the list if you change your mind before saving.`,
      confirmLabel: "Remove item",
      danger: true,
    });
    if (ok) editList(path, (a) => (a.splice(i, 1), a));
  }

  async function save() {
    setBanner(null);
    const locales: Record<string, { values: unknown; rev: number }> = {};
    for (const l of ["en", "fr"] as Locale[]) {
      if (JSON.stringify(draft[l]) !== JSON.stringify(saved[l])) locales[l] = { values: diffToOverrides(base[l], draft[l]), rev: revs[l] };
    }
    setBusy(true);
    try {
      const r = await api<{ revs: Partial<Record<Locale, number>> }>("/api/admin/messages", { method: "PUT", json: { locales } });
      setRevs((cur) => ({ ...cur, ...r.revs }) as Record<Locale, number>);
      setSaved(draft);
      toast({ type: "success", text: "Texts saved. The change is live on both language versions." });
    } catch (e) {
      setBanner({ text: errorText(e), conflict: e instanceof ApiFail && e.status === 409 });
    } finally {
      setBusy(false);
    }
  }

  /* rendering */
  const row = (path: string, breadcrumb = false): ReactNode => {
    const en = getAt(draft.en, path);
    const fr = getAt(draft.fr, path);
    if (typeof en !== "string" || typeof fr !== "string") return null;
    return (
      <StringRow
        key={path}
        path={path}
        label={humanize(path.split(".").pop() ?? "")}
        en={en}
        fr={fr}
        changed={isChanged(path)}
        breadcrumb={breadcrumb}
        onChange={(l, v) => setString(path, l, v)}
        onReset={() => restore(path)}
      />
    );
  };

  const node = (path: string, depth: number): ReactNode => {
    const en = getAt(draft.en, path);
    if (typeof en === "string") return row(path);

    if (Array.isArray(en)) {
      const label = humanize(path.split(".").pop() ?? "");
      const listChanged = isChanged(path);
      return (
        <div key={path} className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold">
              {label} <span className="font-normal text-muted-foreground">({en.length} {en.length === 1 ? "item" : "items"}, same in both languages)</span>
            </h3>
            {listChanged && (
              <button onClick={() => restore(path)} className="inline-flex items-center gap-1 text-xs text-brand-blue-600 hover:underline">
                <RotateCcw className="h-3 w-3" /> Restore original list
              </button>
            )}
          </div>
          <ol className="space-y-2">
            {en.map((item, i) => {
              const controls = (
                <div className="flex shrink-0 items-center">
                  <Button small variant="ghost" aria-label="Move up" disabled={i === 0} onClick={() => move(path, i, -1)}><ArrowUp className="h-4 w-4" /></Button>
                  <Button small variant="ghost" aria-label="Move down" disabled={i === en.length - 1} onClick={() => move(path, i, 1)}><ArrowDown className="h-4 w-4" /></Button>
                  <Button small variant="ghost" aria-label="Duplicate item" title="Duplicate (adds a copy after this item)" onClick={() => duplicate(path, i)}><Copy className="h-4 w-4" /></Button>
                  <Button small variant="ghost" aria-label="Remove item" className="text-red-700 hover:bg-red-50" disabled={en.length <= 1} onClick={() => remove(path, i)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              );
              if (typeof item === "string") {
                return (
                  <li key={`${path}.${i}`} className="flex items-start gap-2">
                    <div className="min-w-0 flex-1">{row(`${path}.${i}`)}</div>
                    {controls}
                  </li>
                );
              }
              return (
                <li key={`${path}.${i}`} className="rounded-xl border border-border bg-white/50">
                  <details open={en.length <= 2}>
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2">
                      <span className="flex min-w-0 items-center gap-2">
                        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="truncate text-sm font-medium">{itemTitle(item, i)}</span>
                      </span>
                      {controls}
                    </summary>
                    <div className="space-y-3 border-t border-border p-3">{node(`${path}.${i}`, depth + 1)}</div>
                  </details>
                </li>
              );
            })}
          </ol>
        </div>
      );
    }

    if (isPlainObject(en)) {
      const keys = Object.keys(en);
      const strings = keys.filter((k) => typeof en[k] === "string");
      const others = keys.filter((k) => typeof en[k] !== "string");
      return (
        <div key={path} className="space-y-3">
          {strings.map((k) => row(`${path}.${k}`))}
          {others.map((k) => (
            <div key={k} className={cx(depth >= 1 && "rounded-xl border border-border/70 bg-white/40 p-3")}>
              {!Array.isArray(en[k]) && <h3 className="mb-2 text-sm font-semibold">{humanize(k)}</h3>}
              {node(`${path}.${k}`, depth + 1)}
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const q = query.trim().toLowerCase();
  const matches = useMemo(() => {
    if (!q) return [];
    const all: string[] = [];
    collectStrings(draft.en, "", all);
    return all
      .filter((p) => {
        const e = getAt(draft.en, p) as string;
        const f = getAt(draft.fr, p) as string;
        return p.toLowerCase().includes(q) || e.toLowerCase().includes(q) || (typeof f === "string" && f.toLowerCase().includes(q));
      })
      .slice(0, 40);
  }, [q, draft]);

  async function resetSection() {
    const ok = await confirm({ title: `Restore “${SECTION_LABELS[section] ?? humanize(section)}” to the original texts?`, body: "All edits in this section (both languages) go back to the delivered texts once you save.", confirmLabel: "Restore section", danger: true });
    if (ok) restore(section);
  }

  return (
    <div>
      {banner && (
        <div role="alert" className={cx("mb-4 rounded-xl border px-4 py-3 text-sm", banner.conflict ? "border-amber-300 bg-amber-50 text-amber-950" : "border-red-200 bg-red-50 text-red-900")}>
          {banner.text}
          {banner.conflict && <button className="ml-2 font-medium underline" onClick={() => window.location.reload()}>Reload this page</button>}
        </div>
      )}

      <div className="mb-4 flex items-center gap-2 rounded-xl border border-input bg-white px-3 py-2">
        <Search className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search every text, in either language…" aria-label="Search texts" className="w-full bg-transparent text-sm outline-none" />
        {query && <button className="text-xs text-muted-foreground hover:underline" onClick={() => setQuery("")}>Clear</button>}
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <nav aria-label="Text sections" className="lg:w-60 lg:shrink-0">
          <ul className="flex flex-wrap gap-1.5 lg:flex-col lg:gap-0.5">
            {sections.map((s) => {
              const n = countFor(s);
              const active = !q && s === section;
              return (
                <li key={s}>
                  <button
                    onClick={() => { setSection(s); setQuery(""); }}
                    aria-current={active ? "true" : undefined}
                    className={cx("flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-sm transition-colors", active ? "bg-white font-medium text-brand-blue-600 shadow-card" : "hover:bg-white/60")}
                  >
                    <span>{SECTION_LABELS[s] ?? humanize(s)}</span>
                    {n > 0 && <Badge tone="gold">{n}</Badge>}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="min-w-0 flex-1 pb-24">
          {q ? (
            <Card className="p-5">
              <h2 className="mb-3 font-heading text-lg font-semibold">{matches.length ? `${matches.length}${matches.length === 40 ? "+" : ""} matching texts` : "No text matches your search"}</h2>
              <div className="space-y-3">{matches.map((p) => row(p, true))}</div>
            </Card>
          ) : (
            <Card className="p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-heading text-lg font-semibold">{SECTION_LABELS[section] ?? humanize(section)}</h2>
                {countFor(section) > 0 && <Button small variant="ghost" onClick={resetSection}><RotateCcw className="h-4 w-4" /> Restore original texts</Button>}
              </div>
              {node(section, 0)}
            </Card>
          )}
        </div>
      </div>

      <div className={cx("fixed inset-x-0 bottom-0 z-30 border-t border-white/70 bg-white/90 px-4 py-3 shadow-soft backdrop-blur-md transition-transform sm:px-8", dirty ? "translate-y-0" : "translate-y-full")} aria-hidden={!dirty}>
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 lg:pl-64">
          <p className="text-sm"><span className="font-medium">{unsavedCount} unsaved {unsavedCount === 1 ? "change" : "changes"}</span> <span className="text-muted-foreground">— not on the site until you save.</span></p>
          <div className="flex gap-2">
            <Button variant="secondary" disabled={busy} onClick={() => { setDraft(saved); setBanner(null); }}>Discard</Button>
            <Button loading={busy} onClick={save}>{busy ? "Saving…" : "Save texts"}</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
