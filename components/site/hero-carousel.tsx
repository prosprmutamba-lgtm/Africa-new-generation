"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Photo } from "./safe-image";

export interface HeroSlide {
  eyebrow: string;
  headline: string;
  subtitle: string;
  image: string;
}

/** Last two words of the headline are highlighted in the brand yellow (as in the reference layout). */
function Headline({ text }: { text: string }) {
  const words = text.trim().split(/\s+/);
  if (words.length < 4) return <>{text}</>;
  const head = words.slice(0, -2).join(" ");
  const tail = words.slice(-2).join(" ");
  return (
    <>
      {head} <span className="text-brand-gold">{tail}</span>
    </>
  );
}

export function HeroCarousel({
  slides,
  labels,
  children,
}: {
  slides: HeroSlide[];
  labels: { previous: string; next: string; goTo: string };
  children: ReactNode;
}) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const n = slides.length;
  const go = useCallback((k: number) => setI(((k % n) + n) % n), [n]);

  useEffect(() => {
    if (n < 2 || paused) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    timer.current = setInterval(() => setI((x) => (x + 1) % n), 8000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [n, paused]);

  if (n === 0) return null;
  const s = slides[i] as HeroSlide;

  return (
    <section
      aria-roledescription="carousel"
      className="relative isolate overflow-hidden rounded-b-[2rem] bg-brand-navy text-white sm:rounded-b-[3rem]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {slides.map((sl, k) => (
        <div
          key={k}
          className={`absolute inset-0 -z-20 transition-opacity duration-700 ${
            k === i ? "opacity-100" : "opacity-0"
          }`}
        >
          <Photo
            src={sl.image}
            alt=""
            className="h-full w-full"
            priority={k === 0}
          />
        </div>
      ))}

      <div
        className="absolute inset-0 -z-10 bg-gradient-to-r from-brand-navy/95 via-brand-navy/70 to-brand-navy/20"
        aria-hidden="true"
      />

      <div className="mx-auto flex min-h-[560px] w-full max-w-7xl flex-col justify-center px-4 py-20 sm:min-h-[680px] sm:px-6 lg:px-8">
        <div
          key={i}
          role="group"
          aria-roledescription="slide"
          aria-label={`${i + 1} / ${n}`}
          className="max-w-3xl animate-[fadeUp_.6s_ease-out]"
        >
          <p className="mb-5 inline-flex items-center gap-3 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-brand-gold backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-brand-red" aria-hidden="true" />
            {s.eyebrow}
          </p>

          <h1 className="font-heading text-4xl leading-[1.05] sm:text-6xl lg:text-7xl">
            <Headline text={s.headline} />
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg">
            {s.subtitle}
          </p>

          <div className="mt-9 flex flex-wrap gap-3">{children}</div>
        </div>

        {n > 1 && (
          <div className="mt-12 flex items-center gap-4">
            <button
              type="button"
              onClick={() => go(i - 1)}
              aria-label={labels.previous}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/40 transition-colors hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-gold"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>

            <div className="flex items-center gap-2">
              {slides.map((_, k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => go(k)}
                  aria-label={`${labels.goTo} ${k + 1}`}
                  aria-current={k === i ? "true" : undefined}
                  className={`h-2.5 rounded-full transition-all ${
                    k === i
                      ? "w-8 bg-brand-gold"
                      : "w-2.5 bg-white/50 hover:bg-white/80"
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => go(i + 1)}
              aria-label={labels.next}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/40 transition-colors hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-gold"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}