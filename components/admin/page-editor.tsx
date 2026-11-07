"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ChevronDown, Copy, ExternalLink, Plus, Trash2 } from "lucide-react";
import { ApiFail, Badge, Button, Card, SelectField, TextAreaField, TextField, Toggle, api, cx, errorText, useConfirm, useToast, useUnsavedWarning } from "./ui";
import { ImageField } from "./media";
import { BLOCK_SPECS, BLOCK_TYPES, emptyItem, newBlock, pageReadiness, type Block, type BlockType, type FieldSpec, type PageLocale, type Readiness } from "@/lib/cms/blocks";
import type { PageRecord } from "@/lib/cms/pages";

type Meta = Pick<PageRecord, "slug" | "title" | "seo" | "nav">;
const LOCS: PageLocale[] = ["en", "fr"];
const LOC_NAME: Record<PageLocale, string> = { en: "English", fr: "Français" };
const rid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 8)}`;
const metaOf = (p: PageRecord): Meta => ({ slug: p.slug, title: p.title, seo: p.seo, nav: p.nav });
const setIn = (o: any, path: string, v: any): any => {
  const [h, ...r] = path.split(".");
  return { ...o, [h as string]: r.length ? setIn(o[h as string], r.join("."), v) : v };
};

/* ───────────────────────── one field (shared or per-language) ───────────────────────── */

function FieldCtl({
  spec,
  en,
  fr,
  errEn,
  errFr,
  onChange,
  onMedia,
}: {
  spec: FieldSpec;
  en: any;
  fr: any;
  errEn?: string;
  errFr?: string;
  onChange: (loc: PageLocale | "both", v: any) => void;
  onMedia?: (m: { width: number | null; height: number | null }) => void;
}) {
  const one = (loc: PageLocale | "both", value: any, error: string | undefined, label: string) => {
    switch (spec.kind) {
      case "toggle":
        return <Toggle label={label} checked={!!value} onChange={(c) => onChange(loc, c)} />;
      case "select":
        return <SelectField label={label} value={String(value ?? "")} options={spec.options ?? []} error={error} onChange={(v) => onChange(loc, v)} />;
      case "image":
        return (
          <ImageField
            label={label}
            value={String(value ?? "")}
            error={error}
            required={spec.required}
            hint={spec.hint}
            onChange={(url, media) => {
              onChange(loc, url);
              if (media && onMedia) onMedia(media);
            }}
          />
        );
      case "textarea":
        return <TextAreaField label={label} value={String(value ?? "")} error={error} hint={spec.hint} rows={4} onChange={(v) => onChange(loc, v)} />;
      default:
        return <TextField label={label} value={String(value ?? "")} error={error} hint={spec.hint} onChange={(v) => onChange(loc, v)} />;
    }
  };
  if (!spec.translatable) return <div>{one("both", en, errEn, spec.label + (spec.required ? " *" : ""))}</div>;
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {one("en", en, errEn, `${spec.label}${spec.required ? " *" : ""} — English`)}
      {one("fr", fr, errFr, `${spec.label}${spec.required ? " *" : ""} — Français`)}
    </div>
  );
}

/* ───────────────────────── editor ───────────────────────── */

export function PageEditor({ initialPage, initialReadiness }: { initialPage: PageRecord; initialReadiness: Readiness }) {
  const toast = useToast();
  const confirm = useConfirm();
  void initialReadiness; // the editor recomputes it live from the same function the server uses
  const [page, setPage] = useState(initialPage);
  const [meta, setMeta] = useState<Meta>(metaOf(initialPage));
  const [blocks, setBlocks] = useState<Block[]>(initialPage.blocks);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [banner, setBanner] = useState<{ text: string; conflict?: boolean } | null>(null);
  const [busy, setBusy] = useState<"save" | "publish" | null>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const dirty = useMemo(() => JSON.stringify({ meta, blocks }) !== JSON.stringify({ meta: metaOf(page), blocks: page.blocks }), [meta, blocks, page]);
  useUnsavedWarning(dirty);
  const readiness = useMemo(() => pageReadiness({ title: meta.title, blocks }), [meta.title, blocks]);
  /** What visitors actually get right now = the SAVED version. */
  const savedReady = useMemo(() => pageReadiness({ title: page.title, blocks: page.blocks }).ready, [page.title, page.blocks]);
  const published = page.status === "published";

  /* ---- block operations ---- */
  const upd = (id: string, fn: (b: Block) => Block) => setBlocks((bs) => bs.map((b) => (b.id === id ? fn(b) : b)));
  const setBlockField = (id: string, key: string, loc: PageLocale | "both", v: any) =>
    upd(id, (b) => ({ ...b, data: loc === "both" ? { en: { ...b.data.en, [key]: v }, fr: { ...b.data.fr, [key]: v } } : { ...b.data, [loc]: { ...b.data[loc], [key]: v } } }));
  const setItemField = (id: string, k: number, key: string, loc: PageLocale | "both", v: any) =>
    upd(id, (b) => {
      const patch = (l: PageLocale) => ({ ...b.data[l], items: (b.data[l].items as any[]).map((it, i) => (i === k ? { ...it, [key]: v } : it)) });
      return { ...b, data: loc === "both" ? { en: patch("en"), fr: patch("fr") } : { ...b.data, [loc]: patch(loc) } };
    });
  const editItems = (id: string, fn: (items: any[]) => any[]) => upd(id, (b) => ({ ...b, data: { en: { ...b.data.en, items: fn((b.data.en.items as any[]).slice()) }, fr: { ...b.data.fr, items: fn((b.data.fr.items as any[]).slice()) } } }));
  const moveBlock = (i: number, d: -1 | 1) =>
    setBlocks((bs) => {
      const j = i + d;
      if (j < 0 || j >= bs.length) return bs;
      const n = bs.slice();
      [n[i], n[j]] = [n[j] as Block, n[i] as Block];
      return n;
    });
  const addBlock = (type: BlockType) => {
    const b = newBlock(type, rid("b"), () => rid("i"));
    setBlocks((bs) => [...bs, b]);
  };
  const dupBlock = (i: number) =>
    setBlocks((bs) => {
      const src = bs[i] as Block;
      const copy: Block = JSON.parse(JSON.stringify(src));
      copy.id = rid("b");
      for (const l of LOCS) copy.data[l].items = undefined as any;
      const ids = ((src.data.en.items as any[]) ?? []).map(() => rid("i"));
      for (const l of LOCS) if (src.data[l].items) copy.data[l].items = (src.data[l].items as any[]).map((it, k) => ({ ...it, id: ids[k] }));
      const n = bs.slice();
      n.splice(i + 1, 0, copy);
      return n;
    });
  async function delBlock(i: number) {
    const b = blocks[i] as Block;
    const ok = await confirm({ title: "Delete this block?", body: `The “${BLOCK_SPECS[b.type].label}” block is removed from both languages once you save.`, confirmLabel: "Delete block", danger: true });
    if (ok) setBlocks((bs) => bs.filter((_, k) => k !== i));
  }

  /* ---- save / publish ---- */
  async function save(): Promise<boolean> {
    setBanner(null);
    setBusy("save");
    try {
      const r = await api<{ page: PageRecord }>(`/api/admin/pages/${page.id}`, { method: "PUT", json: { rev: page.rev, meta, blocks } });
      setPage(r.page);
      setMeta(metaOf(r.page));
      setBlocks(r.page.blocks);
      setErrors({});
      toast({ type: "success", text: "Page saved." });
      return true;
    } catch (e) {
      if (e instanceof ApiFail && e.fields) setErrors(e.fields);
      setBanner({ text: errorText(e), conflict: e instanceof ApiFail && e.status === 409 });
      return false;
    } finally {
      setBusy(null);
    }
  }

  async function setPublished(next: boolean) {
    if (next && dirty && !(await save())) return;
    if (!next) {
      const ok = await confirm({ title: "Unpublish this page?", body: "Visitors will get a “page not found” until you publish it again.", confirmLabel: "Unpublish" });
      if (!ok) return;
    }
    setBanner(null);
    setBusy("publish");
    try {
      const r = await api<{ page: PageRecord }>(`/api/admin/pages/${page.id}/publish`, { method: "POST", json: { published: next } });
      setPage(r.page);
      toast({ type: "success", text: next ? "Published. The page is live in every language that is complete." : "Page unpublished." });
    } catch (e) {
      setBanner({ text: errorText(e) });
    } finally {
      setBusy(null);
    }
  }

  const err = (k: string) => errors[k];
  const shared = readiness.issues.filter((i) => i.locale === "all");
  const previewHref = (l: PageLocale) => `/${l}/${page.slug}?preview=1`;

  return (
    <div className="pb-24">
      {/* action bar */}
      <div className="sticky top-0 z-20 -mx-4 mb-6 border-b border-white/70 bg-white/80 px-4 py-3 backdrop-blur-md sm:-mx-8 sm:px-8">
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/admin/pages" className="text-sm text-brand-blue-600 hover:underline">← All pages</Link>
          <h1 className="min-w-0 flex-1 truncate font-heading text-xl">{meta.title.en || meta.title.fr || "Untitled page"}</h1>
          <Badge tone={published ? "green" : "neutral"}>{published ? "Published" : "Draft"}</Badge>
          {dirty && <Badge tone="gold">Unsaved changes</Badge>}
          <a href={previewHref("en")} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-xl border border-border bg-white px-3 py-1.5 text-sm hover:bg-muted"><ExternalLink className="h-3.5 w-3.5" /> Preview EN</a>
          <a href={previewHref("fr")} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-xl border border-border bg-white px-3 py-1.5 text-sm hover:bg-muted"><ExternalLink className="h-3.5 w-3.5" /> Preview FR</a>
          <Button variant="secondary" onClick={save} loading={busy === "save"} disabled={!dirty || busy !== null}>Save</Button>
          {published ? (
            <Button variant="secondary" onClick={() => setPublished(false)} loading={busy === "publish"} disabled={busy !== null}>Unpublish</Button>
          ) : (
            <Button onClick={() => setPublished(true)} loading={busy === "publish"} disabled={busy !== null || (!readiness.ready.en && !readiness.ready.fr)}>Publish</Button>
          )}
        </div>
        {dirty && <p className="mt-1 text-xs text-muted-foreground">Previews show the last saved version — save first to see your latest changes.</p>}
      </div>

      {banner && (
        <div role="alert" className={cx("mb-4 rounded-xl border px-4 py-3 text-sm", banner.conflict ? "border-amber-300 bg-amber-50 text-amber-950" : "border-red-200 bg-red-50 text-red-900")}>
          {banner.text}
          {banner.conflict && <button className="ml-2 font-medium underline" onClick={() => window.location.reload()}>Reload this page</button>}
        </div>
      )}

      {/* language completeness */}
      <Card className="mb-6 p-5">
        <h2 className="font-heading text-lg">Languages</h2>
        <p className="text-sm text-muted-foreground">A page is shown in a language only once it is published <em>and</em> complete in that language. Missing texts are never translated automatically.</p>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          {LOCS.map((l) => {
            const mine = readiness.issues.filter((i) => i.locale === l);
            const live = published && savedReady[l];
            return (
              <div key={l} data-testid={`lang-${l}`} className="rounded-xl border border-border bg-white/70 p-3">
                <p className="flex items-center gap-2 text-sm font-medium">
                  {LOC_NAME[l]}
                  {readiness.ready[l] ? (
                    live && !dirty ? <Badge tone="green">Live</Badge> : published ? <Badge tone="blue">Complete — save to make it live</Badge> : <Badge tone="blue">Complete — ready to publish</Badge>
                  ) : (
                    <Badge tone="gold">{live ? "Incomplete — still live with the last saved version" : "Incomplete"}</Badge>
                  )}
                </p>
                {!readiness.ready[l] && (
                  <ul className="mt-2 list-disc space-y-0.5 pl-5 text-xs text-muted-foreground">
                    {[...mine, ...shared].slice(0, 8).map((i, k) => <li key={k}>{i.message}</li>)}
                    {mine.length + shared.length > 8 && <li>…and {mine.length + shared.length - 8} more</li>}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* settings */}
      <Card className="mb-6 p-5 sm:p-6">
        <h2 className="font-heading text-lg">Page settings</h2>
        <div className="mt-4 space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <TextField label="Title — English *" value={meta.title.en} error={err("title.en")} onChange={(v) => setMeta((m) => setIn(m, "title.en", v))} />
            <TextField label="Title — Français *" value={meta.title.fr} error={err("title.fr")} onChange={(v) => setMeta((m) => setIn(m, "title.fr", v))} />
          </div>
          <TextField
            label="Page address"
            value={meta.slug}
            error={err("slug")}
            onChange={(v) => setMeta((m) => ({ ...m, slug: v.toLowerCase() }))}
            hint={`Live at /en/${meta.slug || "…"} and /fr/${meta.slug || "…"}. Changing it breaks links that point to the old address.`}
          />
          <fieldset className="rounded-xl border border-border p-4">
            <legend className="px-1 text-sm font-medium">Navigation</legend>
            <div className="grid gap-4 md:grid-cols-3">
              <SelectField label="Show a link in" value={meta.nav.placement} onChange={(v) => setMeta((m) => setIn(m, "nav.placement", v))} options={[{ value: "none", label: "Nowhere (only reachable by link)" }, { value: "header", label: "The main menu" }, { value: "footer", label: "The footer" }]} />
              <TextField label="Link text — English" value={meta.nav.label.en} error={err("nav.label.en")} hint="Empty = page title" onChange={(v) => setMeta((m) => setIn(m, "nav.label.en", v))} />
              <TextField label="Link text — Français" value={meta.nav.label.fr} error={err("nav.label.fr")} hint="Empty = page title" onChange={(v) => setMeta((m) => setIn(m, "nav.label.fr", v))} />
              <TextField label="Order" value={String(meta.nav.order)} error={err("nav.order")} hint="Lower numbers come first" onChange={(v) => setMeta((m) => setIn(m, "nav.order", v === "" ? 0 : Number(v) || 0))} />
            </div>
          </fieldset>
          <fieldset className="rounded-xl border border-border p-4">
            <legend className="px-1 text-sm font-medium">Search engines & sharing (SEO)</legend>
            <div className="grid gap-4 md:grid-cols-2">
              <TextField label="SEO title — English" value={meta.seo.title.en} error={err("seo.title.en")} hint="Empty = page title" onChange={(v) => setMeta((m) => setIn(m, "seo.title.en", v))} />
              <TextField label="SEO title — Français" value={meta.seo.title.fr} error={err("seo.title.fr")} hint="Empty = page title" onChange={(v) => setMeta((m) => setIn(m, "seo.title.fr", v))} />
              <TextAreaField label="Description — English" value={meta.seo.description.en} error={err("seo.description.en")} hint="About 150 characters." onChange={(v) => setMeta((m) => setIn(m, "seo.description.en", v))} />
              <TextAreaField label="Description — Français" value={meta.seo.description.fr} error={err("seo.description.fr")} hint="About 150 characters." onChange={(v) => setMeta((m) => setIn(m, "seo.description.fr", v))} />
              <div className="md:col-span-2">
                <ImageField label="Sharing image (optional)" value={meta.seo.image} error={err("seo.image")} onChange={(url) => setMeta((m) => setIn(m, "seo.image", url))} />
              </div>
            </div>
          </fieldset>
        </div>
      </Card>

      {/* blocks */}
      <h2 className="mb-3 font-heading text-lg">Content</h2>
      {blocks.length === 0 && <p className="mb-4 rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground">This page is empty. Add your first block below: start with a heading, then some text or an image.</p>}
      <ol className="space-y-4">
        {blocks.map((b, i) => {
          const spec = BLOCK_SPECS[b.type];
          const summary = (() => {
            const f = spec.fields.find((x) => x.translatable && x.kind !== "select");
            const v = f ? String(b.data.en[f.key] ?? "") : "";
            return v.length > 60 ? `${v.slice(0, 60)}…` : v;
          })();
          const shut = collapsed.has(b.id);
          const blockIssues = readiness.issues.filter((x) => x.blockId === b.id);
          return (
            <li key={b.id} data-block-type={b.type}>
              <Card className="p-4 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    aria-expanded={!shut}
                    onClick={() => setCollapsed((s) => { const n = new Set(s); if (n.has(b.id)) n.delete(b.id); else n.add(b.id); return n; })}
                    className="flex min-w-0 items-center gap-2 text-left"
                  >
                    <ChevronDown className={cx("h-4 w-4 shrink-0 transition-transform", shut && "-rotate-90")} />
                    <span className="font-medium">{i + 1}. {spec.label}</span>
                    {summary && <span className="truncate text-sm text-muted-foreground">— {summary}</span>}
                    {blockIssues.length > 0 && <Badge tone="gold">{blockIssues.length} to complete</Badge>}
                  </button>
                  <div className="flex items-center">
                    <Button small variant="ghost" aria-label="Move block up" disabled={i === 0} onClick={() => moveBlock(i, -1)}><ArrowUp className="h-4 w-4" /></Button>
                    <Button small variant="ghost" aria-label="Move block down" disabled={i === blocks.length - 1} onClick={() => moveBlock(i, 1)}><ArrowDown className="h-4 w-4" /></Button>
                    <Button small variant="ghost" aria-label="Duplicate block" onClick={() => dupBlock(i)}><Copy className="h-4 w-4" /></Button>
                    <Button small variant="ghost" aria-label="Delete block" className="text-red-700 hover:bg-red-50" onClick={() => delBlock(i)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>

                {!shut && (
                  <div className="mt-4 space-y-4">
                    {spec.fields.filter((f) => !f.hidden).map((f) => (
                      <FieldCtl
                        key={f.key}
                        spec={f}
                        en={b.data.en[f.key]}
                        fr={b.data.fr[f.key]}
                        errEn={err(`blocks.${i}.en.${f.key}`)}
                        errFr={err(`blocks.${i}.fr.${f.key}`)}
                        onChange={(loc, v) => setBlockField(b.id, f.key, loc, v)}
                        onMedia={f.key === "src" ? (m) => { if (m.width && m.height) { setBlockField(b.id, "width", "both", m.width); setBlockField(b.id, "height", "both", m.height); } } : undefined}
                      />
                    ))}

                    {spec.list && (
                      <div>
                        <p className="mb-2 text-sm font-medium">{spec.list.label} <span className="font-normal text-muted-foreground">(same items in both languages)</span></p>
                        {err(`blocks.${i}.items`) && <p role="alert" className="mb-2 text-xs font-medium text-red-700">{err(`blocks.${i}.items`)}</p>}
                        <ol className="space-y-3">
                          {(b.data.en.items as any[]).map((it, k) => (
                            <li key={it.id} className="rounded-xl border border-border bg-white/70 p-3">
                              <div className="mb-2 flex items-center justify-between">
                                <p className="text-sm font-medium">{spec.list!.itemLabel} {k + 1}</p>
                                <div className="flex items-center">
                                  <Button small variant="ghost" aria-label={`Move ${spec.list!.itemLabel.toLowerCase()} up`} disabled={k === 0} onClick={() => editItems(b.id, (a) => { if (k > 0) [a[k - 1], a[k]] = [a[k], a[k - 1]]; return a; })}><ArrowUp className="h-4 w-4" /></Button>
                                  <Button small variant="ghost" aria-label={`Move ${spec.list!.itemLabel.toLowerCase()} down`} disabled={k === (b.data.en.items as any[]).length - 1} onClick={() => editItems(b.id, (a) => { if (k < a.length - 1) [a[k + 1], a[k]] = [a[k], a[k + 1]]; return a; })}><ArrowDown className="h-4 w-4" /></Button>
                                  <Button small variant="ghost" aria-label={`Remove ${spec.list!.itemLabel.toLowerCase()}`} className="text-red-700 hover:bg-red-50" disabled={(b.data.en.items as any[]).length <= 1} onClick={() => editItems(b.id, (a) => a.filter((_, x) => x !== k))}><Trash2 className="h-4 w-4" /></Button>
                                </div>
                              </div>
                              <div className="space-y-3">
                                {spec.list!.fields.map((f) => (
                                  <FieldCtl
                                    key={f.key}
                                    spec={f}
                                    en={it[f.key]}
                                    fr={(b.data.fr.items as any[])[k]?.[f.key]}
                                    errEn={err(`blocks.${i}.items.${k}.en.${f.key}`)}
                                    errFr={err(`blocks.${i}.items.${k}.fr.${f.key}`)}
                                    onChange={(loc, v) => setItemField(b.id, k, f.key, loc, v)}
                                  />
                                ))}
                              </div>
                            </li>
                          ))}
                        </ol>
                        {(b.data.en.items as any[]).length < spec.list.max && (
                          <Button small variant="secondary" className="mt-3" onClick={() => { const id = rid("i"); editItems(b.id, (a) => [...a, emptyItem(spec.list!, id)]); }}>
                            <Plus className="h-4 w-4" /> Add {spec.list.itemLabel.toLowerCase()}
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            </li>
          );
        })}
      </ol>

      <Card className="mt-6 p-5">
        <h2 className="font-heading text-lg">Add a block</h2>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {BLOCK_TYPES.map((t) => (
            <li key={t}>
              <button type="button" onClick={() => addBlock(t)} className="h-full w-full rounded-xl border border-border bg-white p-3 text-left transition-colors hover:border-brand-blue-300 hover:bg-brand-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-blue-500" aria-label={`Add block: ${BLOCK_SPECS[t].label}`}>
                <span className="flex items-center gap-2 font-medium"><Plus className="h-4 w-4 text-brand-blue-500" /> {BLOCK_SPECS[t].label}</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">{BLOCK_SPECS[t].description}</span>
              </button>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
