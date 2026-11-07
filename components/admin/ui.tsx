"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";

/* ───────────────────────── helpers ───────────────────────── */

export const cx = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(" ");

export class ApiFail extends Error {
  constructor(
    message: string,
    public status: number,
    public fields?: Record<string, string>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public data?: any
  ) {
    super(message);
  }
}

/** fetch wrapper: JSON in/out, readable errors, redirects to sign-in when the session has expired. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function api<T = any>(url: string, init: Omit<RequestInit, "body"> & { json?: unknown; body?: BodyInit } = {}): Promise<T> {
  const { json, ...rest } = init;
  const headers = new Headers(rest.headers);
  let body = rest.body;
  if (json !== undefined) {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(json);
  }
  let res: Response;
  try {
    res = await fetch(url, { ...rest, headers, body, credentials: "same-origin" });
  } catch {
    throw new ApiFail("Cannot reach the server. Check your internet connection and try again.", 0);
  }
  const data = await res.json().catch(() => null);
  if (res.status === 401 && !url.includes("/api/admin/login")) {
    window.location.href = "/admin/login";
    throw new ApiFail("Your session has expired. Please sign in again.", 401);
  }
  if (!res.ok) throw new ApiFail(data?.error ?? "Something went wrong. Please try again.", res.status, data?.fields, data);
  return data as T;
}

export const errorText = (e: unknown) => (e instanceof Error ? e.message : "Something went wrong. Please try again.");

// Re-exported for the client components of the dashboard; server components import them from "@/lib/cms/format".
export { formatBytes, formatDate } from "@/lib/cms/format";

/* ───────────────────────── toasts ───────────────────────── */

type ToastInput = { type: "success" | "error"; text: string };
const ToastCtx = createContext<(t: ToastInput) => void>(() => undefined);
export const useToast = () => useContext(ToastCtx);

/* ───────────────────────── confirm dialog ───────────────────────── */

export interface ConfirmOptions {
  title: string;
  body?: ReactNode;
  confirmLabel?: string;
  danger?: boolean;
}
const ConfirmCtx = createContext<(o: ConfirmOptions) => Promise<boolean>>(() => Promise.resolve(false));
export const useConfirm = () => useContext(ConfirmCtx);

export function AdminProviders({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Array<ToastInput & { id: string }>>([]);
  const push = useCallback((t: ToastInput) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((x) => [...x, { ...t, id }]);
    setTimeout(() => setToasts((x) => x.filter((i) => i.id !== id)), t.type === "error" ? 9000 : 4500);
  }, []);

  const [ask, setAsk] = useState<{ opts: ConfirmOptions; resolve: (v: boolean) => void } | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const confirm = useCallback((opts: ConfirmOptions) => new Promise<boolean>((resolve) => setAsk({ opts, resolve })), []);
  useEffect(() => {
    const d = dialogRef.current;
    if (ask && d && !d.open) d.showModal();
  }, [ask]);
  const close = (v: boolean) => {
    dialogRef.current?.close();
    ask?.resolve(v);
    setAsk(null);
  };

  return (
    <ToastCtx.Provider value={push}>
      <ConfirmCtx.Provider value={confirm}>
        {children}
        <div aria-live="polite" className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2">
          {toasts.map((t) => (
            <div
              key={t.id}
              role={t.type === "error" ? "alert" : "status"}
              className={cx(
                "pointer-events-auto rounded-xl border px-4 py-3 text-sm shadow-soft backdrop-blur",
                t.type === "success" ? "border-emerald-200 bg-emerald-50/95 text-emerald-900" : "border-red-200 bg-red-50/95 text-red-900"
              )}
            >
              {t.text}
            </div>
          ))}
        </div>
        <dialog
          ref={dialogRef}
          onCancel={(e) => {
            e.preventDefault();
            close(false);
          }}
          className="w-[min(28rem,calc(100vw-2rem))] rounded-2xl border border-white/70 bg-white p-0 text-brand-navy shadow-soft backdrop:bg-brand-navy/40"
        >
          {ask && (
            <div className="p-6">
              <h2 className="font-heading text-lg font-semibold">{ask.opts.title}</h2>
              {ask.opts.body && <div className="mt-2 text-sm text-muted-foreground">{ask.opts.body}</div>}
              <div className="mt-6 flex justify-end gap-2">
                <Button variant="secondary" onClick={() => close(false)} autoFocus>
                  Cancel
                </Button>
                <Button variant={ask.opts.danger ? "danger" : "primary"} onClick={() => close(true)}>
                  {ask.opts.confirmLabel ?? "Confirm"}
                </Button>
              </div>
            </div>
          )}
        </dialog>
      </ConfirmCtx.Provider>
    </ToastCtx.Provider>
  );
}

/* ───────────────────────── primitives ───────────────────────── */

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cx("rounded-2xl border border-white/70 bg-white/70 shadow-card backdrop-blur-md", className)}>{children}</section>;
}

export function Spinner({ className }: { className?: string }) {
  return (
    <svg className={cx("h-4 w-4 animate-spin", className)} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

type Variant = "primary" | "secondary" | "danger" | "ghost";
const variants: Record<Variant, string> = {
  primary: "bg-brand-blue-500 text-white hover:bg-brand-blue-600 disabled:bg-brand-blue-500/50",
  secondary: "border border-border bg-white text-brand-navy hover:bg-muted disabled:opacity-50",
  danger: "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-600/50",
  ghost: "text-brand-blue-500 hover:bg-brand-blue-50 disabled:opacity-50",
};

export function Button({
  variant = "primary",
  loading,
  small,
  className,
  children,
  disabled,
  type = "button",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; loading?: boolean; small?: boolean }) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue-500 disabled:cursor-not-allowed",
        small ? "px-3 py-1.5 text-sm" : "px-4 py-2.5 text-sm",
        variants[variant],
        className
      )}
      {...rest}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "gold" | "blue" | "green" | "red" }) {
  const tones = {
    neutral: "bg-muted text-muted-foreground",
    gold: "bg-brand-gold-50 text-brand-gold-700",
    blue: "bg-brand-blue-50 text-brand-blue-600",
    green: "bg-emerald-50 text-emerald-700",
    red: "bg-red-50 text-red-700",
  };
  return <span className={cx("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", tones[tone])}>{children}</span>;
}

const inputBase =
  "w-full rounded-xl border bg-white px-3 py-2 text-sm text-brand-navy placeholder:text-muted-foreground/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-brand-blue-500 disabled:bg-muted";

function FieldShell({ id, label, hint, error, children }: { id: string; label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium">
        {label}
      </label>
      {children}
      {hint && !error && <p id={`${id}-hint`} className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      {error && (
        <p id={`${id}-err`} role="alert" className="mt-1 text-xs font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

interface BaseFieldProps {
  label: string;
  hint?: string;
  error?: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function TextField({ label, hint, error, value, onChange, disabled, placeholder, type = "text", autoComplete }: BaseFieldProps & { type?: string; autoComplete?: string }) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} hint={hint} error={error}>
      <input
        id={id}
        type={type}
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-err` : hint ? `${id}-hint` : undefined}
        onChange={(e) => onChange(e.target.value)}
        className={cx(inputBase, error ? "border-red-400" : "border-input")}
      />
    </FieldShell>
  );
}

export function TextAreaField({ label, hint, error, value, onChange, disabled, placeholder, rows = 3 }: BaseFieldProps & { rows?: number }) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} hint={hint} error={error}>
      <textarea
        id={id}
        rows={rows}
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        aria-invalid={!!error}
        onChange={(e) => onChange(e.target.value)}
        className={cx(inputBase, "resize-y leading-relaxed", error ? "border-red-400" : "border-input")}
      />
    </FieldShell>
  );
}

export function SelectField({ label, hint, error, value, onChange, disabled, options }: Omit<BaseFieldProps, "placeholder"> & { options: Array<{ value: string; label: string }> }) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} hint={hint} error={error}>
      <select id={id} value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} className={cx(inputBase, error ? "border-red-400" : "border-input")}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

export function Toggle({ label, hint, checked, onChange, disabled }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  const id = useId();
  return (
    <div className="flex items-start gap-3">
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cx(
          "relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue-500 disabled:opacity-50",
          checked ? "bg-brand-blue-500" : "bg-brand-navy/25"
        )}
      >
        <span className={cx("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all", checked ? "left-[22px]" : "left-0.5")} />
      </button>
      <label htmlFor={id} className="text-sm">
        <span className="font-medium">{label}</span>
        {hint && <span className="block text-xs text-muted-foreground">{hint}</span>}
      </label>
    </div>
  );
}

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-brand-navy">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions}
    </div>
  );
}

/** Warn before leaving the page with unsaved edits. */
export function useUnsavedWarning(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);
}
