import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  COOKIE_NAME,
  SESSION_TTL_SEC,
  sessionSecret,
  signSession,
  verifySession,
} from "./session-token";
import { getUserById, toPublic, type PublicUser, type Role } from "./users";

export function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "strict" as const,
    // Secure cookies need HTTPS. Set ADMIN_COOKIE_SECURE=false ONLY to test over plain http.
    secure: process.env.NODE_ENV === "production" && process.env.ADMIN_COOKIE_SECURE !== "false",
    path: "/",
    maxAge,
  };
}

export async function issueSessionToken(user: { id: string; sessionVersion: number }): Promise<string> {
  return signSession(
    { uid: user.id, sv: user.sessionVersion, exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SEC },
    sessionSecret()
  );
}

/** Verifies the token AND re-checks the user record, so disabling a user or changing a role takes effect immediately. */
export async function userFromToken(token: string | undefined): Promise<PublicUser | null> {
  let secret: string;
  try {
    secret = sessionSecret();
  } catch {
    return null;
  }
  const payload = await verifySession(token, secret);
  if (!payload) return null;
  const user = await getUserById(payload.uid);
  if (!user || user.disabled || user.sessionVersion !== payload.sv) return null;
  return toPublic(user);
}

export const hasRole = (user: PublicUser, min: Role) => min === "editor" || user.role === "admin";

/** For server components / layouts. */
export async function getCurrentUser(): Promise<PublicUser | null> {
  const jar = await cookies();
  return userFromToken(jar.get(COOKIE_NAME)?.value);
}

export async function requirePageUser(min: Role = "editor"): Promise<PublicUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (!hasRole(user, min)) redirect("/admin?denied=1");
  return user;
}
