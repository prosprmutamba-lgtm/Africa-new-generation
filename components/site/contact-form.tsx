"use client";

import { useId, useState, type FormEvent } from "react";

export interface ContactLabels {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  submit: string;
  sending: string;
  thankYou: string;
  sendAnother: string;
  genericError: string;
  errors: { name: string; email: string; subject: string; message: string };
}

type Fields = { name: string; email: string; phone: string; subject: string; message: string };
const EMPTY: Fields = { name: "", email: "", phone: "", subject: "", message: "" };
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Posts to /api/contact; messages are stored for the team in Admin → Messages. */
export function ContactForm({ locale, labels }: { locale: string; labels: ContactLabels }) {
  const uid = useId();
  const [v, setV] = useState<Fields>(EMPTY);
  const [website, setWebsite] = useState(""); // honeypot
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({});
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  const set = (k: keyof Fields) => (val: string) => {
    setV((x) => ({ ...x, [k]: val }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  async function submit(e: FormEvent) {
    e.preventDefault();
    const err: Partial<Record<keyof Fields, string>> = {};
    if (v.name.trim().length < 2) err.name = labels.errors.name;
    if (!EMAIL.test(v.email.trim())) err.email = labels.errors.email;
    if (v.subject.trim().length < 2) err.subject = labels.errors.subject;
    if (v.message.trim().length < 10) err.message = labels.errors.message;
    setErrors(err);
    if (Object.keys(err).length) return;
    setState("sending");
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...v, locale, website }) });
      if (res.ok) {
        setState("done");
        setV(EMPTY);
        return;
      }
      if (res.status === 422) {
        const data = (await res.json().catch(() => null)) as { fields?: Record<string, string> } | null;
        const mapped: Partial<Record<keyof Fields, string>> = {};
        for (const k of Object.keys(data?.fields ?? {}) as Array<keyof Fields>) if (k in labels.errors) mapped[k] = labels.errors[k as keyof ContactLabels["errors"]];
        setErrors(mapped);
        setState("idle");
        return;
      }
      setState("error");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div role="status" className="rounded-3xl border border-brand-blue-100 bg-brand-blue-50 p-8">
        <p className="font-heading text-2xl text-brand-navy">{labels.thankYou}</p>
        <button type="button" onClick={() => setState("idle")} className="mt-5 rounded-full border-2 border-brand-blue-500 px-6 py-2.5 text-sm font-semibold text-brand-blue-500 hover:bg-white">
          {labels.sendAnother}
        </button>
      </div>
    );
  }

  const field = (k: keyof Fields, label: string, opts: { type?: string; area?: boolean; required?: boolean; autoComplete?: string } = {}) => {
    const id = `${uid}-${k}`;
    const common = {
      id,
      value: v[k],
      onChange: (e: { target: { value: string } }) => set(k)(e.target.value),
      "aria-invalid": !!errors[k],
      "aria-describedby": errors[k] ? `${id}-err` : undefined,
      required: opts.required,
      autoComplete: opts.autoComplete,
      className: `w-full rounded-xl border bg-white px-4 py-3 text-sm text-brand-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-blue-500 ${errors[k] ? "border-brand-red" : "border-input"}`,
    };
    return (
      <div className={opts.area ? "sm:col-span-2" : ""}>
        <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-brand-navy">
          {label}
          {opts.required && <span className="text-brand-red" aria-hidden="true"> *</span>}
        </label>
        {opts.area ? <textarea rows={6} {...common} /> : <input type={opts.type ?? "text"} {...common} />}
        {errors[k] && (
          <p id={`${id}-err`} role="alert" className="mt-1.5 text-sm font-medium text-brand-red">
            {errors[k]}
          </p>
        )}
      </div>
    );
  };

  return (
    <form onSubmit={submit} noValidate className="grid gap-5 sm:grid-cols-2">
      {field("name", labels.name, { required: true, autoComplete: "name" })}
      {field("email", labels.email, { type: "email", required: true, autoComplete: "email" })}
      {field("phone", labels.phone, { type: "tel", autoComplete: "tel" })}
      {field("subject", labels.subject, { required: true })}
      {field("message", labels.message, { area: true, required: true })}
      <input type="text" name="website" value={website} onChange={(e) => setWebsite(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      {state === "error" && (
        <p role="alert" className="rounded-xl border border-brand-red/40 bg-red-50 px-4 py-3 text-sm text-brand-red sm:col-span-2">
          {labels.genericError}
        </p>
      )}
      <div className="sm:col-span-2">
        <button type="submit" disabled={state === "sending"} className="rounded-full bg-brand-blue-500 px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-blue-600 disabled:opacity-60">
          {state === "sending" ? labels.sending : labels.submit}
        </button>
      </div>
    </form>
  );
}
