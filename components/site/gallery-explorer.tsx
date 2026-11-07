"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Play, X } from "lucide-react";
import { Photo } from "./safe-image";

export interface GalleryEntry {
  id: string;
  type: "photo" | "video";
  category: string;
  src: string;
  thumbnail: string;
  alt: string;
  width: number;
  height: number;
  videoUrl: string;
}

export interface GalleryLabels {
  all: string;
  photos: string;
  videos: string;
  emptyTitle: string;
  emptySubtitle: string;
  close: string;
  next: string;
  previous: string;
  viewPhoto: string;
  playVideo: string;
  videoSoon: string;
}

const human = (s: string) => s.replace(/-/g, " ").replace(/^./, (c) => c.toUpperCase());
/** Only real YouTube/Vimeo embeds are ever put in an iframe. */
const embeddable = (u: string) => /^https:\/\/(www\.youtube\.com\/embed\/|www\.youtube-nocookie\.com\/embed\/|player\.vimeo\.com\/video\/)[A-Za-z0-9_-]+/.test(u) && !u.includes("REPLACE_WITH_VIDEO_ID");

export function GalleryExplorer({ items, labels }: { items: GalleryEntry[]; labels: GalleryLabels }) {
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);

  const categories = useMemo(() => Array.from(new Set(items.map((i) => i.category))), [items]);
  const filtered = useMemo(
    () => items.filter((i) => (filter === "all" ? true : filter === "photos" ? i.type === "photo" : filter === "videos" ? i.type === "video" : i.category === filter)),
    [items, filter]
  );

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open !== null && !d.open) d.showModal();
    if (open === null && d.open) d.close();
  }, [open]);

  const step = useCallback((dir: 1 | -1) => setOpen((o) => (o === null || filtered.length === 0 ? o : (o + dir + filtered.length) % filtered.length)), [filtered.length]);
  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, step]);

  const current = open !== null ? filtered[open] : undefined;
  const tabs = [
    { id: "all", label: labels.all },
    { id: "photos", label: labels.photos },
    { id: "videos", label: labels.videos },
    ...categories.map((c) => ({ id: c, label: human(c) })),
  ];

  return (
    <div>
      <div role="group" aria-label={labels.all} className="mb-10 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button key={t.id} type="button" aria-pressed={filter === t.id} onClick={() => { setFilter(t.id); setOpen(null); }} className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-blue-500 ${filter === t.id ? "bg-brand-blue-500 text-white" : "bg-white text-brand-navy ring-1 ring-border hover:bg-brand-blue-50"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border p-12 text-center">
          <p className="font-heading text-2xl text-brand-navy">{labels.emptyTitle}</p>
          <p className="mt-2 text-muted-foreground">{labels.emptySubtitle}</p>
        </div>
      ) : (
        <ul className="columns-2 gap-4 md:columns-3">
          {filtered.map((g, k) => (
            <li key={g.id} className="mb-4 break-inside-avoid">
              <button type="button" onClick={() => setOpen(k)} aria-label={`${g.type === "video" ? labels.playVideo : labels.viewPhoto}: ${g.alt}`} className="group relative block w-full overflow-hidden rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-blue-500">
                <Photo src={g.type === "video" ? g.thumbnail || g.src : g.src} alt={g.alt} className="w-full transition-transform duration-500 group-hover:scale-[1.03]" >
                  <span className="block" style={{ aspectRatio: `${g.width} / ${g.height}` }} />
                  {g.type === "video" && (
                    <span className="absolute inset-0 flex items-center justify-center bg-brand-navy/30">
                      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-gold text-brand-navy shadow-soft">
                        <Play className="h-6 w-6" aria-hidden="true" />
                      </span>
                    </span>
                  )}
                </Photo>
              </button>
            </li>
          ))}
        </ul>
      )}

      <dialog ref={dialog} onClose={() => setOpen(null)} aria-label={current?.alt} className="m-auto w-[min(60rem,calc(100vw-1.5rem))] rounded-3xl bg-brand-navy p-0 text-white backdrop:bg-black/80">
        {current && (
          <div className="relative p-3 sm:p-5">
            <div className="flex justify-end pb-2">
              <button type="button" onClick={() => setOpen(null)} aria-label={labels.close} className="rounded-full p-2 hover:bg-white/10">
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <div className="flex items-center justify-center">
              {current.type === "video" ? (
                embeddable(current.videoUrl) ? (
                  <iframe src={current.videoUrl} title={current.alt} allow="accelerometer; encrypted-media; picture-in-picture" allowFullScreen className="aspect-video w-full rounded-2xl" />
                ) : (
                  <p className="p-16 text-center text-white/80">{labels.videoSoon}</p>
                )
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={current.src} alt={current.alt} className="max-h-[75vh] w-auto max-w-full rounded-2xl object-contain" />
              )}
            </div>
            <p className="mt-3 text-center text-sm text-white/80">{current.alt}</p>
            {filtered.length > 1 && (
              <>
                <button type="button" onClick={() => step(-1)} aria-label={labels.previous} className="absolute left-3 top-1/2 rounded-full bg-white/10 p-3 hover:bg-white/20">
                  <ChevronLeft className="h-6 w-6" aria-hidden="true" />
                </button>
                <button type="button" onClick={() => step(1)} aria-label={labels.next} className="absolute right-3 top-1/2 rounded-full bg-white/10 p-3 hover:bg-white/20">
                  <ChevronRight className="h-6 w-6" aria-hidden="true" />
                </button>
              </>
            )}
          </div>
        )}
      </dialog>
    </div>
  );
}
