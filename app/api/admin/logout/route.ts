import { ok, route } from "@/lib/cms/api";
import { cookieOptions } from "@/lib/cms/auth";
import { COOKIE_NAME } from "@/lib/cms/session-token";

export const dynamic = "force-dynamic";

export const POST = route({ role: null }, async () => {
  const res = ok();
  res.cookies.set(COOKIE_NAME, "", { ...cookieOptions(0), maxAge: 0 });
  return res;
});
