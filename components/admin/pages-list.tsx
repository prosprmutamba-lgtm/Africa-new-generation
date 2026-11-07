"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Copy, ExternalLink, Plus, Trash2 } from "lucide-react";
import { Badge, Button, Card, TextField, api, errorText, formatDate, useConfirm, useToast } from "./ui";

export interface PageSummary {
  id: string;
  slug: string;
  status: "draft" | "published";
  title: { en: string; fr: string };
  ready: { en: boolean; fr: boolean };
  issueCount: number;
  updatedAt: string;
  updatedBy: string;
}

const slugify = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

function LangChip({ loc, page }: { loc: "en" | "fr"; page: PageSummary }) {
  const live = page.status === "published" && page.ready[loc];
  if (live) return <Badge tone="green">{loc.toUpperCase()} live</Badge>;
  if (page.ready[loc]) return <Badge tone="blue">{loc.toUpperCase()} ready</Badge>;
  return <Badge tone="gold">{loc.toUpperCase()} incomplete</Badge>;
}

export function PagesList({ initial }: { initial: PageSummary[] }) {
  const toast = useToast();
  const confirm = useConfirm();
  const [pages, setPages] = useState(initial);
  const [open, setOpen] = useState(false);
  const [titleEn, setTitleEn] = useState("");
  const [titleFr, setTitleFr] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);

  async function reload() {
    const r = await api<{ pages: PageSummary[] }>("/api/admin/pages");
    setPages(r.pages);
  }

  async function create(e: FormEvent) {
    e.preventDefault();
    setBusy("create");
    setErrors({});
    try {
      const r = await api<{ page: { id: string } }>("/api/admin/pages", { method: "POST", json: { slug, title: { en: titleEn, fr: titleFr } } });
      window.location.href = `/admin/pages/${r.page.id}`;
    } catch (err) {
      const fields = (err as { fields?: Record<string, string> }).fields;
      setErrors(fields ?? { slug: errorText(err) });
      setBusy(null);
    }
  }

  async function act(p: PageSummary, what: "publish" | "unpublish" | "duplicate" | "delete") {
    if (what === "delete") {
      const ok = await confirm({ title: "Delete this page?", body: `“${p.title.en || p.title.fr || p.slug}” (/${p.slug}) will be permanently removed and its address will stop working.`, confirmLabel: "Delete page", danger: true });
      if (!ok) return;
    }
    if (what === "unpublish") {
      const ok = await confirm({ title: "Unpublish this page?", body: "Visitors will get a “page not found” until you publish it again. Nothing is deleted.", confirmLabel: "Unpublish" });
      if (!ok) return;
    }
    setBusy(p.id);
    try {
      if (what === "delete") await api(`/api/admin/pages/${p.id}`, { method: "DELETE" });
      else if (what === "duplicate") await api("/api/admin/pages", { method: "POST", json: { copyFrom: p.id } });
      else await api(`/api/admin/pages/${p.id}/publish`, { method: "POST", json: { published: what === "publish" } });
      await reload();
      toast({ type: "success", text: { publish: "Page published.", unpublish: "Page unpublished.", duplicate: "Page duplicated as a draft.", delete: "Page deleted." }[what] });
    } catch (err) {
      toast({ type: "error", text: errorText(err) });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-6">
      {!open ? (
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> New page
        </Button>
      ) : (
        <Card className="p-5 sm:p-6">
          <h2 className="font-heading text-lg">Create a page</h2>
          <p className="text-sm text-muted-foreground">You can add the content, the other language and the menu position on the next screen. The page stays a draft until you publish it.</p>
          <form onSubmit={create} className="mt-4 grid gap-4 sm:grid-cols-2" noValidate>
            <TextField
              label="Title (English)"
              value={titleEn}
              onChange={(v) => {
                setTitleEn(v);
                if (!slugTouched) setSlug(slugify(v));
              }}
              error={errors["title.en"]}
            />
            <TextField label="Title (Français)" value={titleFr} onChange={setTitleFr} error={errors["title.fr"]} hint="Can stay empty for now — the page will simply not be shown in French." />
            <div className="sm:col-span-2">
              <TextField
                label="Page address"
                value={slug}
                onChange={(v) => {
                  setSlug(v.toLowerCase());
                  setSlugTouched(true);
                }}
                error={errors.slug}
                hint={`The page will live at /en/${slug || "your-address"} and /fr/${slug || "your-address"}. Lowercase letters, numbers and dashes.`}
              />
            </div>
            <div className="flex gap-2 sm:col-span-2">
              <Button type="submit" loading={busy === "create"} disabled={!slug || (!titleEn && !titleFr)}>
                Create and edit
              </Button>
              <Button variant="secondary" onClick={() => setOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="overflow-hidden">
        {pages.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">No custom pages yet. Create one for a program, an event or a campaign.</p>
        ) : (
          <ul className="divide-y divide-border">
            {pages.map((p) => (
              <li key={p.id} className="p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link href={`/admin/pages/${p.id}`} className="block truncate font-medium text-brand-blue-600 hover:underline">
                      {p.title.en || p.title.fr || p.slug}
                    </Link>
                    <p className="truncate text-sm text-muted-foreground">/{p.slug}</p>
                    <p className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <Badge tone={p.status === "published" ? "green" : "neutral"}>{p.status === "published" ? "Published" : "Draft"}</Badge>
                      <LangChip loc="en" page={p} />
                      <LangChip loc="fr" page={p} />
                      <span className="text-xs text-muted-foreground">Edited {formatDate(p.updatedAt)} · {p.updatedBy}</span>
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/admin/pages/${p.id}`} className="rounded-xl border border-border bg-white px-3 py-1.5 text-sm hover:bg-muted">
                      Edit
                    </Link>
                    <a href={`/en/${p.slug}?preview=1`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-xl border border-border bg-white px-3 py-1.5 text-sm hover:bg-muted">
                      <ExternalLink className="h-3.5 w-3.5" /> Preview EN
                    </a>
                    <a href={`/fr/${p.slug}?preview=1`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-xl border border-border bg-white px-3 py-1.5 text-sm hover:bg-muted">
                      <ExternalLink className="h-3.5 w-3.5" /> Preview FR
                    </a>
                    {p.status === "published" ? (
                      <Button small variant="secondary" disabled={busy === p.id} onClick={() => act(p, "unpublish")}>Unpublish</Button>
                    ) : (
                      <Button small disabled={busy === p.id} onClick={() => act(p, "publish")}>Publish</Button>
                    )}
                    <Button small variant="ghost" aria-label={`Duplicate ${p.slug}`} disabled={busy === p.id} onClick={() => act(p, "duplicate")}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button small variant="ghost" aria-label={`Delete ${p.slug}`} disabled={busy === p.id} className="text-red-700 hover:bg-red-50" onClick={() => act(p, "delete")}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
