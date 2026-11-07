import { z } from "zod";
import { ApiError, clientIp, ok, readJson, route } from "@/lib/cms/api";
import { cookieOptions, issueSessionToken } from "@/lib/cms/auth";
import { logAudit } from "@/lib/cms/audit";
import { verifyAgainstDummy, verifyPassword } from "@/lib/cms/password";
import { loginAllowed, recordLoginFailure, recordLoginSuccess } from "@/lib/cms/rate-limit";
import { COOKIE_NAME, SESSION_TTL_SEC, isSecretConfigured } from "@/lib/cms/session-token";
import { bootstrapAdminFromEnv, getUserByEmail, recordLogin, toPublic } from "@/lib/cms/users";

export const dynamic = "force-dynamic";

const body = z.object({ email: z.string().trim().max(200), password: z.string().max(400) });

export const POST = route({ role: null }, async (req) => {
  if (!isSecretConfigured())
    throw new ApiError(500, "Sign-in is not configured on the server: ADMIN_SESSION_SECRET is missing. See docs/ADMIN.md.");
  const { email: rawEmail, password } = body.parse(await readJson(req, 10_000));
  const email = rawEmail.toLowerCase();
  const keys = [`ip:${clientIp(req)}`, `email:${email}`];

  const gate = loginAllowed(keys);
  if (!gate.allowed) {
    throw new ApiError(429, `Too many failed attempts. Try again in ${Math.max(1, Math.ceil(gate.retryAfterSec / 60))} minutes.`);
  }

  await bootstrapAdminFromEnv();
  const user = await getUserByEmail(email);
  let valid = false;
  if (user && !user.disabled) valid = await verifyPassword(password, user.passwordHash);
  else await verifyAgainstDummy(password);

  if (!user || !valid) {
    recordLoginFailure(keys);
    throw new ApiError(401, "Incorrect email or password.");
  }

  recordLoginSuccess(`email:${email}`);
  await recordLogin(user.id);
  await logAudit(user.email, "Signed in");
  const res = ok({ ok: true, user: toPublic(user) });
  res.cookies.set(COOKIE_NAME, await issueSessionToken(user), cookieOptions(SESSION_TTL_SEC));
  return res;
});
