"use client";

import { useState, type FormEvent } from "react";
import { Button, TextField, api, errorText } from "./ui";

export function LoginForm({ configured }: { configured: boolean }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api("/api/admin/login", { method: "POST", json: { email, password } });
      window.location.href = "/admin"; // full load so the new cookie is used from the first request
    } catch (err) {
      setError(errorText(err));
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
      {!configured && (
        <p role="alert" className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          The server is missing its ADMIN_SESSION_SECRET setting, so sign-in cannot work yet. See docs/ADMIN.md, section “Configuration”.
        </p>
      )}
      <TextField label="Email" type="email" autoComplete="username" value={email} onChange={setEmail} />
      <TextField label="Password" type="password" autoComplete="current-password" value={password} onChange={setPassword} />
      {error && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      )}
      <Button type="submit" loading={busy} disabled={!email || !password} className="w-full">
        {busy ? "Signing in…" : "Sign in"}
      </Button>
      <p className="text-center text-xs text-muted-foreground">Forgot your password? Ask an administrator to reset it.</p>
    </form>
  );
}
