"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Copy, ImagePlus, RefreshCw, Trash2, Upload, X } from "lucide-react";
import { ApiFail, Badge, Button, Card, Spinner, api, cx, errorText, formatBytes, formatDate, useConfirm, useToast } from "./ui";

export interface MediaFile {
  name: string;
  originalName: string;
  kind: string;
  size: number;
  width: number | null;
  height: number | null;
  uploadedBy: string;
  uploadedAt: string;
  updatedAt: string;
}

const ACCEPT = "image/jpeg,image/png,image/webp,image/gif,image/svg+xml";
const OK_TYPES = ACCEPT.split(",");

/** Upload (POST) or replace (PUT) with progress. The server re-validates everything. */
export function uploadFile(file: File, opts: { replace?: string; maxMb: number; onProgress?: (pct: number) => void }): Promise<{ file: MediaFile; url: string }> {
  return new Promise((resolve, reject) => {
    if (file.size > opts.maxMb * 1048576) return reject(new ApiFail(`“${file.name}” is ${(file.size / 1048576).toFixed(1)} MB. The maximum is ${opts.maxMb} MB — resize or compress it first.`, 413));
    if (file.type && !OK_TYPES.includes(file.type)) return reject(new ApiFail(`“${file.name}” is not a supported image. Use JPG, PNG, WebP, GIF or SVG.`, 415));
    const fd = new FormData();
    fd.set("file", file);
    const xhr = new XMLHttpRequest();
    xhr.open(opts.replace ? "PUT" : "POST", opts.replace ? `/api/admin/media/${encodeURIComponent(opts.replace)}` : "/api/admin/media");
    xhr.upload.onprogress = (e) => e.lengthComputable && opts.onProgress?.(Math.round((e.loaded / e.total) * 100));
    xhr.onerror = () => reject(new ApiFail("Upload failed: cannot reach the server. Check your connection and try again.", 0));
    xhr.onload = () => {
      let data: { file: MediaFile; url: string; error?: string } | null = null;
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        /* non-JSON error page */
      }
      if (xhr.status === 401) window.location.href = "/admin/login";
      if (xhr.status >= 200 && xhr.status < 300 && data) resolve(data);
      else reject(new ApiFail(data?.error ?? (xhr.status === 413 ? "The file is too large for the server." : "Upload failed. Please try again."), xhr.status));
    };
    xhr.send(fd);
  });
}

/* ───────────────────────── picker dialog + field ───────────────────────── */

export function MediaPicker({ open, onClose, onPick }: { open: boolean; onClose: () => void; onPick: (file: { url: string; width: number | null; height: number | null }) => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const toast = useToast();
  const [files, setFiles] = useState<MediaFile[] | null>(null);
  const [maxMb, setMaxMb] = useState(8);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setError(null);
    api<{ files: MediaFile[]; maxMb: number }>("/api/admin/media")
      .then((r) => {
        setFiles(r.files);
        setMaxMb(r.maxMb);
      })
      .catch((e) => setError(errorText(e)));
  }, [open]);

  async function onFile(f: File | undefined) {
    if (!f) return;
    setProgress(0);
    try {
      const r = await uploadFile(f, { maxMb, onProgress: setProgress });
      toast({ type: "success", text: "Image uploaded." });
      onPick({ url: r.url, width: r.file.width, height: r.file.height });
    } catch (e) {
      toast({ type: "error", text: errorText(e) });
    } finally {
      setProgress(null);
    }
  }

  return (
    <dialog ref={ref} onClose={onClose} className="w-[min(52rem,calc(100vw-2rem))] rounded-2xl border border-white/70 bg-white p-0 text-brand-navy shadow-soft backdrop:bg-brand-navy/40">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2 className="font-heading text-lg font-semibold">Choose an image</h2>
        <button aria-label="Close" onClick={onClose} className="rounded-lg p-1 hover:bg-muted">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="max-h-[70vh] overflow-y-auto p-5">
        <label className="mb-4 flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-brand-blue-200 bg-brand-blue-50/60 px-4 py-4 text-sm font-medium text-brand-blue-600 hover:bg-brand-blue-50">
          {progress !== null ? <Spinner /> : <Upload className="h-4 w-4" />}
          {progress !== null ? `Uploading… ${progress}%` : `Upload a new image (JPG, PNG, WebP, GIF, SVG — up to ${maxMb} MB)`}
          <input type="file" accept={ACCEPT} className="sr-only" disabled={progress !== null} onChange={(e) => onFile(e.target.files?.[0])} />
        </label>
        {error && <p role="alert" className="mb-3 text-sm text-red-700">{error}</p>}
        {!files && !error && (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Spinner /> Loading your images…
          </p>
        )}
        {files && files.length === 0 && <p className="text-sm text-muted-foreground">No uploaded images yet. Upload your first one above.</p>}
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {files?.map((f) => (
            <li key={f.name}>
              <button
                onClick={() => onPick({ url: `/media/${f.name}`, width: f.width, height: f.height })}
                className="group block w-full overflow-hidden rounded-xl border border-border bg-muted text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-blue-500"
              >
                <span className="flex aspect-[4/3] items-center justify-center bg-[repeating-conic-gradient(#f1f5f9_0%_25%,#fff_0%_50%)] bg-[length:16px_16px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/media/${f.name}?v=${encodeURIComponent(f.updatedAt)}`} alt="" className="max-h-full max-w-full object-contain" loading="lazy" />
                </span>
                <span className="block truncate px-2 py-1.5 text-xs">{f.originalName}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </dialog>
  );
}

export function ImageField({
  label,
  value,
  onChange,
  hint,
  error,
  required,
}: {
  label: string;
  value: string;
  onChange: (url: string, media?: { width: number | null; height: number | null }) => void;
  hint?: string;
  error?: string;
  required?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [broken, setBroken] = useState(false);
  useEffect(() => setBroken(false), [value]);

  return (
    <div>
      <p className="mb-1 text-sm font-medium">{label}</p>
      <div className={cx("flex items-center gap-3 rounded-xl border bg-white p-2", error ? "border-red-400" : "border-input")}>
        <span className="flex h-16 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[repeating-conic-gradient(#f1f5f9_0%_25%,#fff_0%_50%)] bg-[length:12px_12px]">
          {value && !broken ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="max-h-full max-w-full object-contain" onError={() => setBroken(true)} />
          ) : (
            <span className="px-1 text-center text-[10px] text-muted-foreground">{value ? "Preview unavailable" : "No image"}</span>
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-muted-foreground" title={value}>
            {value || "Nothing selected"}
          </p>
          <div className="mt-1 flex flex-wrap gap-2">
            <Button small variant="secondary" onClick={() => setOpen(true)}>
              <ImagePlus className="h-4 w-4" /> {value ? "Change" : "Choose or upload"}
            </Button>
            {!required && value && (
              <Button small variant="ghost" onClick={() => onChange("")}>
                Remove
              </Button>
            )}
          </div>
        </div>
      </div>
      <details className="mt-1">
        <summary className="cursor-pointer text-xs text-muted-foreground">Use an existing site path instead</summary>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value.trim())}
          placeholder="/images/example.jpg"
          aria-label={`${label}: site path`}
          className="mt-1 w-full rounded-lg border border-input bg-white px-2 py-1.5 text-xs"
        />
      </details>
      {hint && !error && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      {error && <p role="alert" className="mt-1 text-xs font-medium text-red-700">{error}</p>}
      <MediaPicker
        open={open}
        onClose={() => setOpen(false)}
        onPick={(f) => {
          setOpen(false);
          onChange(f.url, { width: f.width, height: f.height });
        }}
      />
    </div>
  );
}

/* ───────────────────────── library page ───────────────────────── */

interface Pending {
  id: string;
  name: string;
  pct: number;
  error?: string;
}

export function MediaLibrary({ initial, maxMb }: { initial: MediaFile[]; maxMb: number }) {
  const toast = useToast();
  const confirm = useConfirm();
  const [files, setFiles] = useState(initial);
  const [pending, setPending] = useState<Pending[]>([]);
  const [drag, setDrag] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [usedBy, setUsedBy] = useState<{ file: string; usages: string[] } | null>(null);
  const replaceRef = useRef<HTMLInputElement>(null);
  const replaceTarget = useRef<string | null>(null);

  const reload = useCallback(async () => {
    const r = await api<{ files: MediaFile[] }>("/api/admin/media");
    setFiles(r.files);
  }, []);

  async function handleFiles(list: FileList | File[]) {
    const arr = Array.from(list);
    for (const f of arr) {
      const id = Math.random().toString(36).slice(2);
      setPending((p) => [...p, { id, name: f.name, pct: 0 }]);
      try {
        await uploadFile(f, { maxMb, onProgress: (pct) => setPending((p) => p.map((x) => (x.id === id ? { ...x, pct } : x))) });
        setPending((p) => p.filter((x) => x.id !== id));
        toast({ type: "success", text: `“${f.name}” uploaded.` });
      } catch (e) {
        setPending((p) => p.map((x) => (x.id === id ? { ...x, error: errorText(e) } : x)));
      }
    }
    await reload().catch(() => undefined);
  }

  async function replace(file: File | undefined) {
    const name = replaceTarget.current;
    if (!file || !name) return;
    setBusy(name);
    try {
      await uploadFile(file, { replace: name, maxMb });
      toast({ type: "success", text: "Image replaced. The new version is live on the site." });
      await reload();
    } catch (e) {
      toast({ type: "error", text: errorText(e) });
    } finally {
      setBusy(null);
      if (replaceRef.current) replaceRef.current.value = "";
    }
  }

  async function remove(f: MediaFile, force = false) {
    if (!force) {
      const ok = await confirm({ title: "Delete this image?", body: `“${f.originalName}” will be permanently removed. This cannot be undone.`, confirmLabel: "Delete image", danger: true });
      if (!ok) return;
    }
    setBusy(f.name);
    try {
      await api(`/api/admin/media/${encodeURIComponent(f.name)}${force ? "?force=1" : ""}`, { method: "DELETE" });
      setFiles((x) => x.filter((i) => i.name !== f.name));
      setUsedBy(null);
      toast({ type: "success", text: "Image deleted." });
    } catch (e) {
      if (e instanceof ApiFail && e.status === 409 && e.data?.usages) setUsedBy({ file: f.name, usages: e.data.usages });
      else toast({ type: "error", text: errorText(e) });
    } finally {
      setBusy(null);
    }
  }

  async function copy(name: string) {
    try {
      await navigator.clipboard.writeText(`/media/${name}`);
      toast({ type: "success", text: "Path copied." });
    } catch {
      toast({ type: "error", text: `Copy failed. The path is /media/${name}` });
    }
  }

  return (
    <div>
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          void handleFiles(e.dataTransfer.files);
        }}
        className={cx(
          "flex cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed px-4 py-10 text-center transition-colors",
          drag ? "border-brand-blue-500 bg-brand-blue-50" : "border-brand-blue-200 bg-white/60 hover:bg-white/80"
        )}
      >
        <Upload className="h-6 w-6 text-brand-blue-500" />
        <span className="font-medium">Drop images here, or click to choose</span>
        <span className="text-xs text-muted-foreground">JPG, PNG, WebP, GIF or SVG · up to {maxMb} MB each</span>
        <input type="file" multiple accept={ACCEPT} className="sr-only" onChange={(e) => e.target.files && void handleFiles(e.target.files)} />
      </label>

      {pending.length > 0 && (
        <ul className="mt-3 space-y-2" aria-live="polite">
          {pending.map((p) => (
            <li key={p.id} className={cx("rounded-xl border px-3 py-2 text-sm", p.error ? "border-red-200 bg-red-50 text-red-900" : "border-white/70 bg-white/70")}>
              <div className="flex items-center justify-between gap-3">
                <span className="truncate">{p.name}</span>
                {p.error ? (
                  <button className="text-xs underline" onClick={() => setPending((x) => x.filter((i) => i.id !== p.id))}>
                    Dismiss
                  </button>
                ) : (
                  <span className="text-xs text-muted-foreground">{p.pct}%</span>
                )}
              </div>
              {p.error ? <p role="alert" className="mt-1 text-xs">{p.error}</p> : <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full bg-brand-blue-500 transition-all" style={{ width: `${p.pct}%` }} /></div>}
            </li>
          ))}
        </ul>
      )}

      {usedBy && (
        <div role="alertdialog" className="mt-4 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
          <p className="font-medium">This image is still used on the site:</p>
          <ul className="mt-1 list-disc pl-5">{usedBy.usages.map((u) => <li key={u}>{u}</li>)}</ul>
          <p className="mt-2">Deleting it would leave a broken image there. Replace it in those places first, or use “Replace file” to swap the picture without breaking anything.</p>
          <div className="mt-3 flex gap-2">
            <Button small variant="secondary" onClick={() => setUsedBy(null)}>Keep the image</Button>
            <Button small variant="danger" onClick={() => { const f = files.find((x) => x.name === usedBy.file); if (f) void remove(f, true); }}>Delete anyway</Button>
          </div>
        </div>
      )}

      <input ref={replaceRef} type="file" accept={ACCEPT} className="sr-only" aria-label="Choose the replacement file" onChange={(e) => void replace(e.target.files?.[0])} />

      {files.length === 0 ? (
        <Card className="mt-6 p-8 text-center text-sm text-muted-foreground">No images uploaded yet. Images you upload here can be used for the logo, programs, gallery and partners.</Card>
      ) : (
        <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {files.map((f) => (
            <li key={f.name}>
              <Card className="overflow-hidden">
                <div className="relative flex aspect-[16/10] items-center justify-center bg-[repeating-conic-gradient(#f1f5f9_0%_25%,#fff_0%_50%)] bg-[length:16px_16px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/media/${f.name}?v=${encodeURIComponent(f.updatedAt)}`} alt={f.originalName} className="max-h-full max-w-full object-contain" loading="lazy" />
                  {busy === f.name && <span className="absolute inset-0 flex items-center justify-center bg-white/70"><Spinner className="h-6 w-6" /></span>}
                </div>
                <div className="p-4">
                  <p className="truncate font-medium" title={f.originalName}>{f.originalName}</p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                    <Badge>{f.kind.toUpperCase()}</Badge>
                    {f.width && f.height ? `${f.width}×${f.height}px · ` : ""}{formatBytes(f.size)}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{formatDate(f.uploadedAt)} · {f.uploadedBy}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button small variant="secondary" onClick={() => copy(f.name)}><Copy className="h-4 w-4" /> Copy path</Button>
                    <Button small variant="secondary" disabled={busy === f.name} onClick={() => { replaceTarget.current = f.name; replaceRef.current?.click(); }}><RefreshCw className="h-4 w-4" /> Replace file</Button>
                    <Button small variant="ghost" disabled={busy === f.name} onClick={() => void remove(f)} className="text-red-700 hover:bg-red-50"><Trash2 className="h-4 w-4" /> Delete</Button>
                  </div>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
