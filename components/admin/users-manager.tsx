"use client";

import { useState, type FormEvent } from "react";
import { KeyRound, Trash2, UserCheck, UserX } from "lucide-react";
import { Badge, Button, Card, SelectField, TextField, api, errorText, formatDate, useConfirm, useToast } from "./ui";

interface U {
  id: string;
  email: string;
  name: string;
  role: "admin" | "editor";
  disabled: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

function generatePassword() {
  const bytes = new Uint8Array(18);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function UsersManager({ initial, meId }: { initial: U[]; meId: string }) {
  const toast = useToast();
  const confirm = useConfirm();
  const [users, setUsers] = useState(initial);
  const [form, setForm] = useState({ name: "", email: "", role: "editor", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [created, setCreated] = useState<{ email: string; password: string } | null>(null);
  const [resetFor, setResetFor] = useState<string | null>(null);
  const [newPw, setNewPw] = useState("");
  const [resetErr, setResetErr] = useState<string | undefined>();

  const replace = (u: U) => setUsers((list) => list.map((x) => (x.id === u.id ? u : x)));

  async function add(e: FormEvent) {
    e.preventDefault();
    setBusy("add");
    setErrors({});
    setFormError(null);
    try {
      const r = await api<{ user: U }>("/api/admin/users", { method: "POST", json: form });
      setUsers((l) => [...l, r.user]);
      setCreated({ email: form.email, password: form.password });
      setForm({ name: "", email: "", role: "editor", password: "" });
    } catch (err) {
      const fields = (err as { fields?: Record<string, string> }).fields;
      if (fields) setErrors(fields);
      setFormError(errorText(err));
    } finally {
      setBusy(null);
    }
  }

  async function patch(u: U, body: object, okText: string) {
    setBusy(u.id);
    try {
      const r = await api<{ user: U }>(`/api/admin/users/${u.id}`, { method: "PATCH", json: body });
      replace(r.user);
      toast({ type: "success", text: okText });
      return true;
    } catch (err) {
      toast({ type: "error", text: errorText(err) });
      return false;
    } finally {
      setBusy(null);
    }
  }

  async function toggleDisabled(u: U) {
    if (!u.disabled) {
      const ok = await confirm({ title: `Disable ${u.name}?`, body: "They are signed out immediately and cannot sign in until you enable the account again.", confirmLabel: "Disable account", danger: true });
      if (!ok) return;
    }
    await patch(u, { disabled: !u.disabled }, u.disabled ? "Account enabled." : "Account disabled.");
  }

  async function remove(u: U) {
    const ok = await confirm({ title: `Delete ${u.name}?`, body: `The account ${u.email} is permanently deleted. Their past edits stay on the site.`, confirmLabel: "Delete account", danger: true });
    if (!ok) return;
    setBusy(u.id);
    try {
      await api(`/api/admin/users/${u.id}`, { method: "DELETE" });
      setUsers((l) => l.filter((x) => x.id !== u.id));
      toast({ type: "success", text: "Account deleted." });
    } catch (err) {
      toast({ type: "error", text: errorText(err) });
    } finally {
      setBusy(null);
    }
  }

  async function reset(u: U) {
    setResetErr(undefined);
    setBusy(u.id);
    try {
      const r = await api<{ user: U }>(`/api/admin/users/${u.id}`, { method: "PATCH", json: { password: newPw } });
      replace(r.user);
      setCreated({ email: u.email, password: newPw });
      setResetFor(null);
      setNewPw("");
      toast({ type: "success", text: "Password changed. They were signed out everywhere." });
    } catch (err) {
      setResetErr(errorText(err));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-6">
      {created && (
        <div role="status" className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950">
          <p className="font-medium">Password for {created.email}</p>
          <p className="mt-1 break-all rounded-lg bg-white px-3 py-2 font-mono">{created.password}</p>
          <p className="mt-2">Copy it now and send it through a private channel — it is not shown again. They can change it under “My account”.</p>
          <Button small variant="secondary" className="mt-2" onClick={() => setCreated(null)}>I have copied it</Button>
        </div>
      )}

      <Card className="p-5 sm:p-6">
        <h2 className="font-heading text-lg font-semibold">Add a team member</h2>
        <p className="text-sm text-muted-foreground"><strong>Editors</strong> can change content and images. <strong>Administrators</strong> can also manage accounts.</p>
        <form onSubmit={add} className="mt-4 grid gap-4 sm:grid-cols-2" noValidate>
          <TextField label="Full name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} error={errors.name} />
          <TextField label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} error={errors.email} />
          <SelectField label="Role" value={form.role} onChange={(v) => setForm({ ...form, role: v })} options={[{ value: "editor", label: "Editor" }, { value: "admin", label: "Administrator" }]} />
          <div>
            <TextField label="Temporary password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} error={errors.password} hint="At least 12 characters." />
            <button type="button" className="mt-1 text-xs text-brand-blue-600 hover:underline" onClick={() => setForm({ ...form, password: generatePassword() })}>Generate a strong password</button>
          </div>
          {formError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900 sm:col-span-2">{formError}</p>}
          <div className="sm:col-span-2">
            <Button type="submit" loading={busy === "add"}>Create account</Button>
          </div>
        </form>
      </Card>

      <Card className="overflow-hidden">
        <ul className="divide-y divide-border">
          {users.map((u) => (
            <li key={u.id} className="p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">{u.name} {u.id === meId && <span className="text-xs text-muted-foreground">(you)</span>}</p>
                  <p className="truncate text-sm text-muted-foreground">{u.email}</p>
                  <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                    <Badge tone={u.role === "admin" ? "blue" : "neutral"}>{u.role === "admin" ? "Administrator" : "Editor"}</Badge>
                    {u.disabled && <Badge tone="red">Disabled</Badge>}
                    {u.lastLoginAt ? `Last sign-in ${formatDate(u.lastLoginAt)}` : "Has not signed in yet"}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    aria-label={`Role of ${u.name}`}
                    value={u.role}
                    disabled={u.id === meId || busy === u.id}
                    onChange={(e) => patch(u, { role: e.target.value }, "Role updated.")}
                    className="rounded-xl border border-input bg-white px-2 py-1.5 text-sm disabled:bg-muted"
                  >
                    <option value="editor">Editor</option>
                    <option value="admin">Administrator</option>
                  </select>
                  <Button small variant="secondary" disabled={busy === u.id} onClick={() => { setResetFor(resetFor === u.id ? null : u.id); setNewPw(""); setResetErr(undefined); }}><KeyRound className="h-4 w-4" /> Reset password</Button>
                  {u.id !== meId && (
                    <>
                      <Button small variant="secondary" disabled={busy === u.id} onClick={() => toggleDisabled(u)}>{u.disabled ? <><UserCheck className="h-4 w-4" /> Enable</> : <><UserX className="h-4 w-4" /> Disable</>}</Button>
                      <Button small variant="ghost" aria-label={`Delete ${u.name}`} disabled={busy === u.id} className="text-red-700 hover:bg-red-50" onClick={() => remove(u)}><Trash2 className="h-4 w-4" /></Button>
                    </>
                  )}
                </div>
              </div>
              {resetFor === u.id && (
                <div className="mt-3 flex flex-wrap items-end gap-3 rounded-xl bg-muted/70 p-3">
                  <div className="min-w-[16rem] flex-1">
                    <TextField label="New password" value={newPw} onChange={setNewPw} error={resetErr} hint="At least 12 characters. They are signed out everywhere." />
                    <button type="button" className="mt-1 text-xs text-brand-blue-600 hover:underline" onClick={() => setNewPw(generatePassword())}>Generate a strong password</button>
                  </div>
                  <Button loading={busy === u.id} disabled={!newPw} onClick={() => reset(u)}>Set password</Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
