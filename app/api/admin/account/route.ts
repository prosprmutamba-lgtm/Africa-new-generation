import { z } from "zod";
import { ApiError, ok, readJson, route } from "@/lib/cms/api";
import { logAudit } from "@/lib/cms/audit";
import { cookieOptions, issueSessionToken } from "@/lib/cms/auth";
import { passwordProblem, verifyPassword } from "@/lib/cms/password";
import { COOKIE_NAME, SESSION_TTL_SEC } from "@/lib/cms/session-token";
import { getUserById, updateUser } from "@/lib/cms/users";

export const dynamic = "force-dynamic";

const body = z.object({ currentPassword: z.string().max(400), newPassword: z.string().max(200) });

/** Change your own password. Signs out every other session, keeps this one. */
export const POST = route({}, async (req, me) => {
  const { currentPassword, newPassword } = body.parse(await readJson(req, 10_000));
  const rec = me ? await getUserById(me.id) : undefined;
  if (!rec || !(await verifyPassword(currentPassword, rec.passwordHash)))
    throw new ApiError(422, "Your current password is incorrect.", { currentPassword: "Incorrect password." });
  const problem = passwordProblem(newPassword, rec.email);
  if (problem) throw new ApiError(422, problem, { newPassword: problem });
  const updated = await updateUser(rec.id, { password: newPassword }, rec.email);
  await logAudit(rec.email, "Changed own password");
  const res = ok();
  res.cookies.set(COOKIE_NAME, await issueSessionToken(updated), cookieOptions(SESSION_TTL_SEC));
  return res;
});
