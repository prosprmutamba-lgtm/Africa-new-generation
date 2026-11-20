"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useMemo, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { ApiFail, Badge, Button, Card, SelectField, TextAreaField, TextField, Toggle, api, cx, errorText, useConfirm, useToast, useUnsavedWarning } from "./ui";
import { ImageField } from "./media";

export interface FieldDef {
  /** dotted path inside the object / list item, e.g. "address.line1" */
  name: string;
  label: string;
  type?: "text" | "textarea" | "number" | "toggle" | "image" | "select" | "email";
  hint?: string;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  required?: boolean;
  /** greyed out once the item has been saved (e.g. an ID that other content refers to) */
  lockExisting?: boolean;
  disabled?: boolean;
  full?: boolean;
  showIf?: (item: any) => boolean;
  /** image fields: copy the picked image's pixel size into these sibling fields */
  syncSize?: { width: string; height: string };
}

const getDeep = (o: any, path: string) => path.split(".").reduce((a, k) => (a == null ? a : a[k]), o);
function setDeep(o: any, path: string, v: any): any {
  const [head, ...rest] = path.split(".");
  if (!head) return o;
  return { ...o, [head]: rest.length ? setDeep(o?.[head] ?? {}, rest.join("."), v) : v };
}
const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

interface Common {
  group: string;
  title: string;
  description?: string;
  initial: any;
  rev: number;
  custom: boolean;
  fields: FieldDef[];
}
interface ObjectMode extends Common {
  kind: "object";
}
interface ListMode extends Common {
  kind: "list";
  itemTitle: (item: any, index: number) => string;
  newItem?: () => any;
  canRemove?: boolean;
  itemExtra?: (item: any) => ReactNode;
  addLabel?: string;
  emptyText?: string;
}

function FieldInput({ f, item, error, onChange, isNew }: { f: FieldDef; item: any; error?: string; onChange: (name: string, v: any) => void; isNew: boolean }) {
  const v = getDeep(item, f.name);
  const disabled = f.disabled || (f.lockExisting && !isNew);
  switch (f.type) {
    case "toggle":
      return <Toggle label={f.label} hint={f.hint} checked={!!v} disabled={disabled} onChange={(c) => onChange(f.name, c)} />;
    case "image":
      return (
        <ImageField
          label={f.label}
          hint={f.hint}
          error={error}
          required={f.required}
          value={String(v ?? "")}
          onChange={(url, media) => {
            onChange(f.name, url);
            if (f.syncSize && media?.width && media?.height) {
              onChange(f.syncSize.width, String(media.width));
              onChange(f.syncSize.height, String(media.height));
            }
          }}
        />
      );
    case "select":
      return <SelectField label={f.label} hint={f.hint} error={error} value={String(v ?? "")} disabled={disabled} options={f.options ?? []} onChange={(x) => onChange(f.name, x)} />;
    case "textarea":
      return <TextAreaField label={f.label} hint={f.hint} error={error} value={String(v ?? "")} disabled={disabled} placeholder={f.placeholder} onChange={(x) => onChange(f.name, x)} />;
    default:
      return (
        <TextField
          label={f.label}
          hint={f.hint}
          error={error}
          type={f.type === "email" ? "email" : "text"}
          value={String(v ?? "")}
          disabled={disabled}
          placeholder={f.placeholder}
          onChange={(x) => onChange(f.name, x)}
        />
      );
  }
}

export function GroupEditor(props: ObjectMode | ListMode) {
  const { group, title, description, fields } = props;
  const toast = useToast();
  const confirm = useConfirm();
  const [value, setValue] = useState<any>(() => clone(props.initial));
  const [saved, setSaved] = useState<any>(() => clone(props.initial));
  const [rev, setRev] = useState(props.rev);
  const [custom, setCustom] = useState(props.custom);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [banner, setBanner] = useState<{ text: string; conflict?: boolean } | null>(null);
  const [busy, setBusy] = useState<"save" | "reset" | null>(null);

  const dirty = useMemo(() => JSON.stringify(value) !== JSON.stringify(saved), [value, saved]);
  useUnsavedWarning(dirty);

  const isList = props.kind === "list";
  const setField = (prefix: string) => (name: string, v: any) => {
    setValue((cur: any) => (isList ? cur.map((it: any, i: number) => (String(i) === prefix ? setDeep(it, name, v) : it)) : setDeep(cur, name, v)));
    setErrors((e) => {
      const k = prefix ? `${prefix}.${name}` : name;
      if (!(k in e)) return e;
      const rest = { ...e };
      delete rest[k];
      return rest;
    });
  };

  function clientCheck(): Record<string, string> {
    const out: Record<string, string> = {};
    const items: any[] = isList ? value : [value];
    items.forEach((it, i) => {
      for (const f of fields) {
        if (f.showIf && !f.showIf(it)) continue;
        if (f.type === "number" && String(getDeep(it, f.name) ?? "").trim() === "") out[isList ? `${i}.${f.name}` : f.name] = "Enter a number.";
      }
    });
    return out;
  }

  async function save() {
    setBanner(null);
    const local = clientCheck();
    if (Object.keys(local).length) {
      setErrors(local);
      return setBanner({ text: "Please fix the highlighted fields." });
    }
    setBusy("save");
    try {
      const r = await api<{ rev: number; value: any }>("/api/admin/settings", { method: "PUT", json: { group, value, rev } });
      setValue(clone(r.value));
      setSaved(clone(r.value));
      setRev(r.rev);
      setCustom(true);
      setErrors({});
      toast({ type: "success", text: `${title} saved. The change is live on the site.` });
    } catch (e) {
      if (e instanceof ApiFail && e.fields) setErrors(e.fields);
      setBanner({ text: errorText(e), conflict: e instanceof ApiFail && e.status === 409 });
    } finally {
      setBusy(null);
    }
  }

  async function reset() {
    const ok = await confirm({
      title: `Reset “${title}” to the original values?`,
      body: "Your changes to this section will be discarded and the site goes back to the values it was delivered with.",
      confirmLabel: "Reset section",
      danger: true,
    });
    if (!ok) return;
    setBusy("reset");
    setBanner(null);
    try {
      const r = await api<{ rev: number; value: any }>(`/api/admin/settings?group=${group}`, { method: "DELETE" });
      setValue(clone(r.value));
      setSaved(clone(r.value));
      setRev(r.rev);
      setCustom(false);
      setErrors({});
      toast({ type: "success", text: `${title} reset to the original values.` });
    } catch (e) {
      setBanner({ text: errorText(e) });
    } finally {
      setBusy(null);
    }
  }

  const move = (i: number, d: -1 | 1) =>
    setValue((cur: any[]) => {
      const j = i + d;
      if (j < 0 || j >= cur.length) return cur;
      const next = cur.slice();
      [next[i], next[j]] = [next[j] as any, next[i] as any];
      return next;
    });

  async function removeAt(i: number) {
    const ok = await confirm({ title: "Remove this item?", body: `“${(props as ListMode).itemTitle(value[i], i)}” will be removed from the list once you save.`, confirmLabel: "Remove", danger: true });
    if (ok) setValue((cur: any[]) => cur.filter((_, k) => k !== i));
  }

  const fieldGrid = (item: any, prefix: string, isNew: boolean) => (
    <div className="grid gap-4 sm:grid-cols-2">
      {fields.map((f) =>
        f.showIf && !f.showIf(item) ? null : (
          <div key={f.name} className={cx(f.full || f.type === "image" || f.type === "textarea" ? "sm:col-span-2" : "")}>
            <FieldInput f={f} item={item} isNew={isNew} error={errors[prefix ? `${prefix}.${f.name}` : f.name]} onChange={setField(prefix)} />
          </div>
        )
      )}
    </div>
  );

  return (
    <Card className="mb-6 p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="font-heading text-lg font-semibold">{title}</h2>
          {description && <p className="mt-0.5 max-w-2xl text-sm text-muted-foreground">{description}</p>}
        </div>
        <div className="flex items-center gap-2">
          {dirty && <Badge tone="gold">Unsaved changes</Badge>}
          <Badge tone={custom ? "blue" : "neutral"}>{custom ? "Edited" : "Original values"}</Badge>
        </div>
      </div>

      {banner && (
        <div role="alert" className={cx("mb-4 rounded-xl border px-3 py-2 text-sm", banner.conflict ? "border-amber-300 bg-amber-50 text-amber-950" : "border-red-200 bg-red-50 text-red-900")}>
          {banner.text}
          {banner.conflict && (
            <button className="ml-2 font-medium underline" onClick={() => window.location.reload()}>
              Reload this page
            </button>
          )}
        </div>
      )}

      {props.kind === "object" ? (
        fieldGrid(value, "", false)
      ) : (
        <>
          {value.length === 0 && <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">{props.emptyText ?? "Nothing here yet."}</p>}
          <ol className="space-y-3">
            {value.map((item: any, i: number) => (
              <li key={`${item.id ?? item.key ?? item.slug ?? "i"}-${i}`} className={cx("rounded-xl border bg-white/80 p-4", item.visible === false ? "border-dashed border-border opacity-80" : "border-border")}>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <p className="min-w-0 truncate font-medium">
                    {props.itemTitle(item, i)}
                    {item.visible === false && <span className="ml-2 align-middle"><Badge>Hidden</Badge></span>}
                  </p>
                  <div className="flex items-center gap-1">
                    {props.itemExtra?.(item)}
                    <Button small variant="ghost" aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)}>
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button small variant="ghost" aria-label="Move down" disabled={i === value.length - 1} onClick={() => move(i, 1)}>
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    {props.canRemove && (
                      <Button small variant="ghost" aria-label="Remove" className="text-red-700 hover:bg-red-50" onClick={() => removeAt(i)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                {fieldGrid(item, String(i), !!item._new)}
              </li>
            ))}
          </ol>
          {props.newItem && (
            <Button variant="secondary" className="mt-3" onClick={() => setValue((cur: any[]) => [...cur, { ...props.newItem!(), _new: true }])}>
              <Plus className="h-4 w-4" /> {props.addLabel ?? "Add item"}
            </Button>
          )}
        </>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-border pt-4">
        <Button onClick={save} loading={busy === "save"} disabled={!dirty || busy !== null}>
          {busy === "save" ? "Saving…" : "Save changes"}
        </Button>
        <Button variant="secondary" disabled={!dirty || busy !== null} onClick={() => { setValue(clone(saved)); setErrors({}); setBanner(null); }}>
          Discard changes
        </Button>
        <span className="flex-1" />
        {custom && (
          <Button variant="ghost" loading={busy === "reset"} disabled={busy !== null} onClick={reset} className="text-red-700 hover:bg-red-50">
            Reset to original
          </Button>
        )}
      </div>
    </Card>
  );
}
