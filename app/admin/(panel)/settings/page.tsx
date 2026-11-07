import { requirePageUser } from "@/lib/cms/auth";
import { adminSettingsData } from "@/lib/cms/page-data";
import { ContactForms } from "@/components/admin/forms";
import { NotWiredNotice } from "@/components/admin/not-wired";
import { PageHeader } from "@/components/admin/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Contact & social" };

export default async function SettingsPage() {
  await requirePageUser();
  const data = await adminSettingsData();
  return (
    <>
      <PageHeader title="Contact & social" description="Organization details, contact information, social media links and footer options." />
      <NotWiredNotice feature="contact" what="contact details, social links, organization info and footer options" />
      <ContactForms data={data} />
    </>
  );
}
