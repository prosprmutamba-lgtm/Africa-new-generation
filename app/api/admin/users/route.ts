import { z } from "zod";
import { ok, readJson, route } from "@/lib/cms/api";
import { logAudit } from "@/lib/cms/audit";
import { createUser, listUsers, toPublic } from "@/lib/cms/users";

export const dynamic = "force-dynamic";

const body = z.object({
  email: z.string().trim().max(200).email("Enter a valid email address."),
  name: z.string().trim().min(1, "Enter a name.").max(100),
  role: z.enum(["admin", "editor"]),
  password: z.string().max(200),
});

export const GET = route({ role: "admin" }, async () => ok({ users: (await listUsers()).map(toPublic) }));

export const POST = route({ role: "admin" }, async (req, user) => {
  const input = body.parse(await readJson(req, 20_000));
  const rec = await createUser(input, user?.email ?? null);
  await logAudit(user?.email ?? "?", `Created ${input.role} account`, rec.email);
  return ok({ user: toPublic(rec) }, { status: 201 });
});
