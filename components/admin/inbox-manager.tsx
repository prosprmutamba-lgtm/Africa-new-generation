"use client";

import { useState } from "react";
import { Download, Mail, MailOpen, Trash2 } from "lucide-react";
import { Badge, Button, Card, api, cx, errorText, formatDate, useConfirm, useToast } from "./ui";

export interface InboxEntry {
  id: string;
  kind: "contact" | "newsletter";
  createdAt: string;
  locale: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  read: boolean;
}

export function InboxManager({ initial }: { initial: InboxEntry[] }) {
  const toast = useToast();
  const confirm = useConfirm();
  const [items, setItems] = useState(initial);
  const [tab, setTab] = useState<"contact" | "newsletter">("contact");
  const [open, setOpen] = useState<string | null>(null);
  const contacts = items.filter((i) => i.kind === "contact");
  const subs = items.filter((i) => i.kind === "newsletter");
  const unread = contacts.filter((c) => !c.read).length;

  async function setRead(id: string, read: boolean) {
    try {
      await api("/api/admin/inbox", { method: "PATCH", json: { id, read } });
      setItems((l) => l.map((i) => (i.id === id ? { ...i, read } : i)));
    } catch (e) {
      toast({ type: "error", text: errorText(e) });
    }
  }
  async function remove(i: InboxEntry) {
    const ok = await confirm({ title: i.kind === "contact" ? "Delete this message?" : "Remove this subscriber?", body: `${i.email} will be removed permanently.`, confirmLabel: "Delete", danger: true });
    if (!ok) return;
    try {
      await api(`/api/admin/inbox?id=${encodeURIComponent(i.id)}`, { method: "DELETE" });
      setItems((l) => l.filter((x) => x.id !== i.id));
      toast({ type: "success", text: "Deleted." });
    } catch (e) {
      toast({ type: "error", text: errorText(e) });
    }
  }

  return (
    <div>
      <div role="tablist" aria-label="Message types" className="mb-5 flex gap-2">
        {([["contact", `Contact messages${unread ? ` (${unread} new)` : ""}`], ["newsletter", `Newsletter (${subs.length})`]] as const).map(([id, label]) => (
          <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={cx("rounded-full px-5 py-2 text-sm font-semibold", tab === id ? "bg-brand-blue-500 text-white" : "bg-white text-brand-navy ring-1 ring-border hover:bg-brand-blue-50")}>
            {label}
          </button>
        ))}
      </div>

      {tab === "contact" ? (
        contacts.length === 0 ? (
          <Card className="p-8 text-center text-sm text-muted-foreground">No messages yet. Messages sent through the Contact page appear here.</Card>
        ) : (
          <Card className="overflow-hidden">
            <ul className="divide-y divide-border">
              {contacts.map((c) => (
                <li key={c.id} className="p-4 sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <button type="button" aria-expanded={open === c.id} onClick={() => { setOpen(open === c.id ? null : c.id); if (!c.read) void setRead(c.id, true); }} className="min-w-0 flex-1 text-left">
                      <p className={cx("truncate", c.read ? "font-medium" : "font-bold")}>{c.subject}</p>
                      <p className="truncate text-sm text-muted-foreground">{c.name} · {c.email} · {formatDate(c.createdAt)} · {c.locale.toUpperCase()}</p>
                    </button>
                    <div className="flex items-center gap-2">
                      {!c.read && <Badge tone="gold">New</Badge>}
                      <Button small variant="ghost" aria-label={c.read ? "Mark as unread" : "Mark as read"} onClick={() => setRead(c.id, !c.read)}>{c.read ? <Mail className="h-4 w-4" /> : <MailOpen className="h-4 w-4" />}</Button>
                      <Button small variant="ghost" aria-label="Delete message" className="text-red-700 hover:bg-red-50" onClick={() => remove(c)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                  {open === c.id && (
                    <div className="mt-4 rounded-xl bg-muted/70 p-4 text-sm">
                      <p className="whitespace-pre-wrap">{c.message}</p>
                      {c.phone && <p className="mt-3 text-muted-foreground">Phone: {c.phone}</p>}
                      <a href={`mailto:${c.email}?subject=${encodeURIComponent(`Re: ${c.subject}`)}`} className="mt-4 inline-block rounded-xl bg-brand-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-blue-600">Reply by email</a>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </Card>
        )
      ) : (
        <Card className="p-5 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">{subs.length} subscriber{subs.length === 1 ? "" : "s"}. Each address is stored once.</p>
            {subs.length > 0 && (
              <a href="/api/admin/inbox?export=newsletter" className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-2 text-sm font-medium hover:bg-muted"><Download className="h-4 w-4" /> Download CSV</a>
            )}
          </div>
          {subs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No subscribers yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {subs.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <span className="min-w-0 truncate">{s.email} <span className="text-muted-foreground">· {s.locale.toUpperCase()} · {formatDate(s.createdAt)}</span></span>
                  <Button small variant="ghost" aria-label={`Remove ${s.email}`} className="text-red-700 hover:bg-red-50" onClick={() => remove(s)}><Trash2 className="h-4 w-4" /></Button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}
    </div>
  );
}
