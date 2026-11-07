"use client";

import { useState, type FormEvent } from "react";

export interface NewsletterLabels {
  placeholder: string;
  cta: string;
  sending: string;
  success: string;
  error: string;
  invalid: string;
}

/** Posts to /api/newsletter. The address is stored for the team (Admin → Messages); nothing is faked. */
export function NewsletterForm({ locale, labels, tone = "band" }: { locale: string; labels: NewsletterLabels; tone?: "band" | "footer" }) {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [state, setState] = useState<"idle" | "sending" | "done" | "invalid" | "error">("idle");

  async function submit(e: FormEvent) {
    e.preventDefault();
    setState("sending");
    try {
      const res = await fetch("/api/newsletter", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, locale, website }) });
      setState(res.ok ? "done" : res.status === 422 ? "invalid" : "error");
      if (res.ok) setEmail("");
    } catch {
      setState("error");
    }
  }

  const msgId = `nl-msg-${tone}`;
  return (
    <form onSubmit={submit} noValidate className="w-full">
      <div className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor={`nl-${tone}`} className="sr-only">
          {labels.placeholder}
        </label>
        <input
          id={`nl-${tone}`}
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={labels.placeholder}
          aria-describedby={msgId}
          aria-invalid={state === "invalid"}
          className="min-w-0 flex-1 rounded-full border-2 border-transparent bg-white px-5 py-3 text-sm text-brand-navy placeholder:text-muted-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-gold"
        />
        <input type="text" name="website" value={website} onChange={(e) => setWebsite(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
        <button type="submit" disabled={state === "sending" || !email} className={`rounded-full px-6 py-3 text-sm font-semibold transition-colors disabled:opacity-60 ${tone === "footer" ? "bg-brand-gold text-brand-navy hover:bg-brand-gold-600" : "bg-brand-navy text-white hover:bg-brand-navy/90"}`}>
          {state === "sending" ? labels.sending : labels.cta}
        </button>
      </div>
      <p id={msgId} role={state === "invalid" || state === "error" ? "alert" : "status"} aria-live="polite" className="mt-3 min-h-[1.25rem] text-sm">
        {state === "done" && labels.success}
        {state === "invalid" && labels.invalid}
        {state === "error" && labels.error}
      </p>
    </form>
  );
}
