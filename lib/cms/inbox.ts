import { randomBytes } from "node:crypto";
import { store } from "./store";

/** Messages received through the public forms. Stored for the team in Admin → Messages. */
export type InboxKind = "contact" | "newsletter";

export interface InboxItem {
  id: string;
  kind: InboxKind;
  createdAt: string;
  locale: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  read: boolean;
}
interface InboxDoc {
  items: InboxItem[];
}
const EMPTY: InboxDoc = { items: [] };
const KEEP = 5000;

export async function addInbox(item: Omit<InboxItem, "id" | "createdAt" | "read">): Promise<{ duplicate: boolean }> {
  let duplicate = false;
  await store.update<InboxDoc>("inbox", EMPTY, (d) => {
    if (item.kind === "newsletter" && d.items.some((x) => x.kind === "newsletter" && x.email.toLowerCase() === item.email.toLowerCase())) {
      duplicate = true; // already subscribed: treat as success, store nothing
      return d;
    }
    d.items.unshift({ ...item, id: randomBytes(5).toString("hex"), createdAt: new Date().toISOString(), read: false });
    d.items = d.items.slice(0, KEEP);
    return d;
  });
  return { duplicate };
}

export async function listInbox(): Promise<InboxItem[]> {
  return (await store.read<InboxDoc>("inbox", EMPTY)).data.items;
}

export async function markRead(id: string, read: boolean) {
  await store.update<InboxDoc>("inbox", EMPTY, (d) => {
    const it = d.items.find((x) => x.id === id);
    if (it) it.read = read;
    return d;
  });
}

export async function removeInbox(id: string) {
  await store.update<InboxDoc>("inbox", EMPTY, (d) => ({ items: d.items.filter((x) => x.id !== id) }));
}
