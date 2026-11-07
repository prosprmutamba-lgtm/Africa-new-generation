import { requirePageUser } from "@/lib/cms/auth";
import { listUsers, toPublic } from "@/lib/cms/users";
import { UsersManager } from "@/components/admin/users-manager";
import { PageHeader } from "@/components/admin/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Users" };

export default async function UsersPage() {
  const me = await requirePageUser("admin"); // editors are redirected; the API enforces it again
  const users = (await listUsers()).map(toPublic);
  return (
    <>
      <PageHeader title="Users" description="Who can sign in to this dashboard." />
      <UsersManager initial={users} meId={me.id} />
    </>
  );
}
