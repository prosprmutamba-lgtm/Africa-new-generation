import { ok, route } from "@/lib/cms/api";

export const dynamic = "force-dynamic";

export const GET = route({}, async (_req, user) => ok({ user }));
