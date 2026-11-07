"use client";

import { useState, type FormEvent } from "react";
import { Button, Card, TextField, api, errorText, useToast } from "./ui";

export function AccountForm({ name, email, role }: { name: string; email: string; role: string }) {
  const toast = useToast();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [again, setAgain] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (next !== again) return setErrors({ again: "The two passwords do not match." });
    setBusy(true);
    setErrors({});
    try {
      await api("/api/admin/account", { method: "POST", json: { currentPassword: current, newPassword: next } });
      setCurrent("");
      setNext("");
      setAgain("");
      toast({ type: "success", text: "Password changed. Other devices were signed out." });
    } catch (err) {
      const fields = (err as { fields?: Record<string, string> }).fields;
      setErrors(fields ?? { currentPassword: errorText(err) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-xl space-y-6">
      <Card className="p-5 sm:p-6">
        <h2 className="font-heading text-lg font-semibold">Your details</h2>
        <dl className="mt-3 grid grid-cols-[7rem_1fr] gap-y-1.5 text-sm">
          <dt className="text-muted-foreground">Name</dt><dd>{name}</dd>
          <dt className="text-muted-foreground">Email</dt><dd>{email}</dd>
          <dt className="text-muted-foreground">Role</dt><dd>{role === "admin" ? "Administrator" : "Editor"}</dd>
        </dl>
      </Card>
      <Card className="p-5 sm:p-6">
        <h2 className="font-heading text-lg font-semibold">Change your password</h2>
        <form onSubmit={submit} className="mt-4 space-y-4" noValidate>
          <TextField label="Current password" type="password" autoComplete="current-password" value={current} onChange={setCurrent} error={errors.currentPassword} />
          <TextField label="New password" type="password" autoComplete="new-password" value={next} onChange={setNext} error={errors.newPassword} hint="At least 12 characters. A few random words work well." />
          <TextField label="Repeat the new password" type="password" autoComplete="new-password" value={again} onChange={setAgain} error={errors.again} />
          <Button type="submit" loading={busy} disabled={!current || !next || !again}>Change password</Button>
        </form>
      </Card>
    </div>
  );
}
