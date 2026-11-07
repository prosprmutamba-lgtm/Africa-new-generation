import { randomUUID } from "node:crypto";
import { store } from "./store";
import { hashPassword, passwordProblem } from "./password";

export type Role = "admin" | "editor";

export interface UserRecord {
  id: string;
  email: string;
  name: string;
  role: Role;
  passwordHash: string;
  /** Bumped on password change / disable: invalidates every existing session of this user. */
  sessionVersion: number;
  disabled: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

export type PublicUser = Omit<UserRecord, "passwordHash">;

interface UsersDoc {
  users: UserRecord[];
}

export class UserError extends Error {
  constructor(
    message: string,
    public status = 400
  ) {
    super(message);
  }
}

export const toPublic = ({ passwordHash: _h, ...rest }: UserRecord): PublicUser => rest;

const EMPTY: UsersDoc = { users: [] };
const normEmail = (e: string) => e.trim().toLowerCase();

export async function listUsers(): Promise<UserRecord[]> {
  return (await store.read(`users`, EMPTY)).data.users;
}

export async function getUserById(id: string): Promise<UserRecord | undefined> {
  return (await listUsers()).find((u) => u.id === id);
}

export async function getUserByEmail(email: string): Promise<UserRecord | undefined> {
  const e = normEmail(email);
  return (await listUsers()).find((u) => u.email === e);
}

const activeAdmins = (users: UserRecord[]) => users.filter((u) => u.role === "admin" && !u.disabled);

export async function createUser(input: { email: string; name: string; role: Role; password: string }, actor: string | null) {
  const email = normEmail(input.email);
  const problem = passwordProblem(input.password, email);
  if (problem) throw new UserError(problem, 422);
  const passwordHash = await hashPassword(input.password);
  const rec: UserRecord = {
    id: randomUUID(),
    email,
    name: input.name.trim(),
    role: input.role,
    passwordHash,
    sessionVersion: 1,
    disabled: false,
    createdAt: new Date().toISOString(),
    lastLoginAt: null,
  };
  await store.update<UsersDoc>(
    "users",
    EMPTY,
    (d) => {
      if (d.users.some((u) => u.email === email)) throw new UserError("A user with this email already exists.", 409);
      d.users.push(rec);
      return d;
    },
    { user: actor }
  );
  return rec;
}

export async function updateUser(
  id: string,
  patch: { name?: string; role?: Role; disabled?: boolean; password?: string },
  actor: string | null
) {
  const passwordHash = patch.password !== undefined ? await hashPassword(patch.password) : undefined;
  let result: UserRecord | undefined;
  await store.update<UsersDoc>(
    "users",
    EMPTY,
    (d) => {
      const u = d.users.find((x) => x.id === id);
      if (!u) throw new UserError("User not found.", 404);
      if (patch.name !== undefined) u.name = patch.name.trim();
      if (patch.role !== undefined) u.role = patch.role;
      if (patch.disabled !== undefined) u.disabled = patch.disabled;
      if (passwordHash) u.passwordHash = passwordHash;
      if (passwordHash || patch.disabled === true || patch.role !== undefined) u.sessionVersion += 1;
      if (activeAdmins(d.users).length === 0) throw new UserError("At least one active administrator must remain.", 409);
      result = u;
      return d;
    },
    { user: actor }
  );
  return result as UserRecord;
}

export async function deleteUser(id: string, actor: string | null) {
  await store.update<UsersDoc>(
    "users",
    EMPTY,
    (d) => {
      if (!d.users.some((u) => u.id === id)) throw new UserError("User not found.", 404);
      d.users = d.users.filter((u) => u.id !== id);
      if (activeAdmins(d.users).length === 0) throw new UserError("At least one active administrator must remain.", 409);
      return d;
    },
    { user: actor }
  );
}

export async function recordLogin(id: string) {
  await store.update<UsersDoc>("users", EMPTY, (d) => {
    const u = d.users.find((x) => x.id === id);
    if (u) u.lastLoginAt = new Date().toISOString();
    return d;
  });
}

/**
 * First-account provisioning without a terminal (e.g. hosting panels with no SSH).
 * Only acts while NO account exists, and only if ADMIN_BOOTSTRAP_EMAIL and
 * ADMIN_BOOTSTRAP_PASSWORD are set. Remove both variables after the first sign-in.
 */
export async function bootstrapAdminFromEnv(): Promise<void> {
  const email = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim();
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD;
  if (!email || !password) return;
  if ((await listUsers()).length > 0) return;
  try {
    await createUser({ email, name: process.env.ADMIN_BOOTSTRAP_NAME?.trim() || "Administrator", role: "admin", password }, "bootstrap");
    console.warn(`[cms] Created the first administrator (${email}) from ADMIN_BOOTSTRAP_*. Remove those variables now.`);
  } catch (err) {
    console.error("[cms] ADMIN_BOOTSTRAP_* could not create the first administrator:", err instanceof Error ? err.message : err);
  }
}
