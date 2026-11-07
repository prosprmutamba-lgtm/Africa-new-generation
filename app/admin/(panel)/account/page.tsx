import { requirePageUser } from "@/lib/cms/auth";
import { AccountForm } from "@/components/admin/account-form";
import { PageHeader } from "@/components/admin/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "My account" };

export default async function AccountPage() {
  const me = await requirePageUser();
  return (
    <>
      <PageHeader title="My account" />
      <AccountForm name={me.name} email={me.email} role={me.role} />
    </>
  );
}
