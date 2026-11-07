import type { ReactNode } from "react";
import { requirePageUser } from "@/lib/cms/auth";
import { AdminProviders } from "@/components/admin/ui";
import { Shell } from "@/components/admin/shell";

export const dynamic = "force-dynamic";

/** Authoritative server-side check for every admin page: no valid, still-active account => back to sign-in. */
export default async function PanelLayout({ children }: { children: ReactNode }) {
  const user = await requirePageUser("editor");
  return (
    <AdminProviders>
      <Shell user={{ name: user.name, email: user.email, role: user.role }}>{children}</Shell>
    </AdminProviders>
  );
}
