"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Images of the site may not exist yet (photos are added over time). These components show a
 * branded placeholder instead of a broken-image icon. The effect also catches images that
 * failed BEFORE the page became interactive (a plain onError would miss those).
 */
function useBroken() {
  const ref = useRef<HTMLImageElement>(null);
  const [broken, setBroken] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (el && el.complete && el.naturalWidth === 0) setBroken(true);
  }, []);
  return { ref, broken, onError: () => setBroken(true) };
}

const PLACEHOLDER = "bg-[linear-gradient(135deg,#004CC0_0%,#0A3A8C_62%,#282C37_100%)]";

export function Placeholder({ label, className = "" }: { label?: string; className?: string }) {
  return (
    <div className={`absolute inset-0 flex items-center justify-center overflow-hidden ${PLACEHOLDER} ${className}`} aria-hidden="true">
      <span className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
      <span className="absolute -bottom-12 -left-8 h-32 w-32 rounded-full bg-brand-gold/25" />
      {label ? <span className="relative font-heading text-3xl uppercase tracking-wide text-white/80">{label}</span> : null}
      <span className="absolute inset-x-0 bottom-0 h-1 bg-brand-gold" />
    </div>
  );
}

/** A picture filling its (relatively positioned, sized) parent. */
export function Photo({ src, alt, className = "", label, priority, children }: { src?: string; alt: string; className?: string; label?: string; priority?: boolean; children?: ReactNode }) {
  const { ref, broken, onError } = useBroken();
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!src || broken ? (
        <Placeholder label={label} />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img ref={ref} src={src} alt={alt} loading={priority ? "eager" : "lazy"} decoding="async" onError={onError} className="absolute inset-0 h-full w-full object-cover" />
      )}
      {children}
    </div>
  );
}

/** An inline image (logo, avatar) with a custom fallback. */
export function ImgWithFallback({ src, alt, className = "", width, height, fallback }: { src: string; alt: string; className?: string; width?: number; height?: number; fallback: ReactNode }) {
  const { ref, broken, onError } = useBroken();
  if (!src || broken) return <>{fallback}</>;
  // eslint-disable-next-line @next/next/no-img-element
  return <img ref={ref} src={src} alt={alt} width={width} height={height} onError={onError} className={className} decoding="async" />;
}
