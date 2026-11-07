import { store } from "./store";

export interface AuditEntry {
  at: string;
  user: string;
  action: string;
  target?: string;
}
interface AuditDoc {
  entries: AuditEntry[];
}
const EMPTY: AuditDoc = { entries: [] };
const KEEP = 300;

/** Never lets a logging failure break the action being logged. */
export async function logAudit(user: string, action: string, target?: string) {
  try {
    await store.update<AuditDoc>("audit", EMPTY, (d) => {
      d.entries.unshift({ at: new Date().toISOString(), user, action, ...(target ? { target } : {}) });
      d.entries = d.entries.slice(0, KEEP);
      return d;
    });
  } catch (err) {
    console.error("[cms] audit log failed", err);
  }
}

export async function recentAudit(limit = 10): Promise<AuditEntry[]> {
  return (await store.read<AuditDoc>("audit", EMPTY)).data.entries.slice(0, limit);
}
