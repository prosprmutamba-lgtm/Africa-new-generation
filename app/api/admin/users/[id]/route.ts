import { z } from "zod";
import { ApiError, ok, readJson, route } from "@/lib/cms/api";
import { logAudit } from "@/lib/cms/audit";
import { passwordProblem } from "@/lib/cms/password";
import { deleteUser, getUserById, toPublic, updateUser } from "@/lib/cms/users";

export const dynamic = "force-dynamic";
type Ctx = { params: Promise<{ id: string }> };

const patch = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  role: z.enum(["admin", "editor"]).optional(),
  disabled: z.boolean().optional(),
  password: z.string().max(200).optional(),
});

export const PATCH = route<Ctx>({ role: "admin" }, async (req, me, ctx) => {
  const { id } = await ctx.params;
  const input = patch.parse(await readJson(req, 20_000));
  const target = await getUserById(id);
  if (!target) throw new ApiError(404, "User not found.");
  if (id === me?.id && (input.disabled === true || (input.role && input.role !== "admin")))
    throw new ApiError(409, "You cannot disable or demote your own account. Ask another administrator.");
  if (input.password !== undefined) {
    const problem = passwordProblem(input.password, target.email);
    if (problem) throw new ApiError(422, problem, { password: problem });
  }
  const rec = await updateUser(id, input, me?.email ?? null);
  const what = [input.role && "role", input.disabled !== undefined && (input.disabled ? "disabled" : "enabled"), input.password && "password reset", input.name && "name"]
    .filter(Boolean)
    .join(", ");
  await logAudit(me?.email ?? "?", `Updated account (${what})`, rec.email);
  return ok({ user: toPublic(rec) });
});

export const DELETE = route<Ctx>({ role: "admin" }, async (_req, me, ctx) => {
  const { id } = await ctx.params;
  if (id === me?.id) throw new ApiError(409, "You cannot delete your own account.");
  const target = await getUserById(id);
  await deleteUser(id, me?.email ?? null);
  await logAudit(me?.email ?? "?", "Deleted account", target?.email);
  return ok();
});
