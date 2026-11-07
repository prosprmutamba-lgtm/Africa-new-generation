import { requirePageUser } from "@/lib/cms/auth";
import { listInbox } from "@/lib/cms/inbox";
import { InboxManager } from "@/components/admin/inbox-manager";
import { PageHeader } from "@/components/admin/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Messages" };

export default async function MessagesPage() {
  await requirePageUser();
  return (
    <>
      <PageHeader title="Messages" description="Messages sent through the Contact page and addresses collected by the newsletter forms. No email is sent automatically: check this page, or add an email notification (see docs/ADMIN.md)." />
      <InboxManager initial={await listInbox()} />
    </>
  );
}
