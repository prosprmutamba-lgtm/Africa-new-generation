#!/usr/bin/env node
/**
 * Administrator accounts from the command line (no web "setup" page exists on purpose).
 *
 *   node scripts/admin-cli.mjs create --email you@example.org --name "Your Name" [--role admin|editor]
 *   node scripts/admin-cli.mjs reset-password --email you@example.org
 *   node scripts/admin-cli.mjs list
 *
 * The password is typed at a hidden prompt. For automation, set ADMIN_PASSWORD in the environment.
 * CMS_DATA_DIR is read from the environment or from .env.local / .env in the project folder.
 * Run it while nobody is saving in the dashboard (it writes users.json directly).
 */
import { promises as fs, existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { randomBytes, randomUUID, scrypt } from "node:crypto";
import readline from "node:readline";

for (const f of [".env.local", ".env"]) {
  if (existsSync(f)) {
    for (const line of readFileSync(f, "utf8").split(/\r?\n/)) {
      const m = /^\s*(CMS_DATA_DIR)\s*=\s*(.*?)\s*$/.exec(line);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
}
const DATA_DIR = path.resolve(process.env.CMS_DATA_DIR || path.join(process.cwd(), "data"));
const FILE = path.join(DATA_DIR, "users.json");

const args = process.argv.slice(2);
const cmd = args[0];
const opt = (name) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};

function hash(password) {
  const N = 16384, R = 8, P = 1, salt = randomBytes(16);
  return new Promise((res, rej) =>
    scrypt(password.normalize("NFKC"), salt, 64, { N, r: R, p: P, maxmem: 128 * N * R * 2 }, (e, key) =>
      e ? rej(e) : res(`scrypt$${N}$${R}$${P}$${salt.toString("base64")}$${key.toString("base64")}`)
    )
  );
}

function problem(pw, email) {
  if (pw.length < 12) return "Use at least 12 characters.";
  if (pw.length > 200) return "Use at most 200 characters.";
  if (/^(.)\1+$/.test(pw)) return "Choose a password that is not one repeated character.";
  if (email && pw.toLowerCase() === email.toLowerCase()) return "The password must not be your email address.";
  return null;
}

function ask(question, hidden) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    if (hidden) {
      rl._writeToOutput = (s) => {
        if (s.includes(question)) rl.output.write(s);
        else if (s.includes("\n") || s.includes("\r")) rl.output.write("\n");
      };
    }
    rl.question(question, (a) => {
      rl.close();
      resolve(a);
    });
  });
}

async function readPassword(email) {
  if (process.env.ADMIN_PASSWORD) {
    const p = problem(process.env.ADMIN_PASSWORD, email);
    if (p) fail(p);
    return process.env.ADMIN_PASSWORD;
  }
  const a = await ask("New password (min 12 characters): ", true);
  const p = problem(a, email);
  if (p) fail(p);
  const b = await ask("Repeat the password: ", true);
  if (a !== b) fail("The two passwords do not match.");
  return a;
}

function fail(msg) {
  console.error(`\nError: ${msg}`);
  process.exit(1);
}

async function load() {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8"));
  } catch (e) {
    if (e.code === "ENOENT") return { rev: 0, updatedAt: null, updatedBy: null, data: { users: [] } };
    throw e;
  }
}

async function save(env) {
  env.rev += 1;
  env.updatedAt = new Date().toISOString();
  env.updatedBy = "cli";
  await fs.mkdir(DATA_DIR, { recursive: true, mode: 0o700 });
  const tmp = `${FILE}.${randomBytes(6).toString("hex")}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(env, null, 2), { mode: 0o600 });
  await fs.rename(tmp, FILE);
}

const emailOk = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e || "");

if (cmd === "list") {
  const env = await load();
  if (!env.data.users.length) console.log("No accounts yet. Create one with: node scripts/admin-cli.mjs create --email ... --name ...");
  for (const u of env.data.users) console.log(`${u.email}\t${u.role}\t${u.disabled ? "disabled" : "active"}\t${u.name}`);
} else if (cmd === "create") {
  const email = (opt("email") || "").trim().toLowerCase();
  const name = (opt("name") || "").trim();
  const role = opt("role") || "admin";
  if (!emailOk(email)) fail("Provide a valid --email.");
  if (!name) fail('Provide --name "Full Name".');
  if (!["admin", "editor"].includes(role)) fail("--role must be admin or editor.");
  const env = await load();
  if (env.data.users.some((u) => u.email === email)) fail("An account with this email already exists. Use reset-password.");
  const password = await readPassword(email);
  env.data.users.push({
    id: randomUUID(), email, name, role, passwordHash: await hash(password),
    sessionVersion: 1, disabled: false, createdAt: new Date().toISOString(), lastLoginAt: null,
  });
  await save(env);
  console.log(`\nCreated ${role} account for ${email} in ${FILE}`);
} else if (cmd === "reset-password") {
  const email = (opt("email") || "").trim().toLowerCase();
  const env = await load();
  const user = env.data.users.find((u) => u.email === email);
  if (!user) fail("No account with this email. Run: node scripts/admin-cli.mjs list");
  const password = await readPassword(email);
  user.passwordHash = await hash(password);
  user.sessionVersion += 1; // signs this user out everywhere
  user.disabled = false;
  await save(env);
  console.log(`\nPassword updated for ${email}. All their sessions were signed out.`);
} else {
  console.log("Usage:\n  node scripts/admin-cli.mjs create --email you@example.org --name \"Your Name\" [--role admin|editor]\n  node scripts/admin-cli.mjs reset-password --email you@example.org\n  node scripts/admin-cli.mjs list");
  process.exit(cmd ? 1 : 0);
}
