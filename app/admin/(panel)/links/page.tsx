import { requirePageUser } from "@/lib/cms/auth";
import { adminSettingsData, englishLabels } from "@/lib/cms/page-data";
import { LinksForm } from "@/components/admin/forms";
import { PageHeader } from "@/components/admin/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Buttons & links" };

export default async function LinksPage() {
  await requirePageUser();
  const [data, { linkSlots }] = await Promise.all([adminSettingsData(), englishLabels()]);
  return (
    <>
      <PageHeader title="Buttons & links" description="Change where the buttons of the site lead, hide the ones you do not want, or open them in a new tab. Button wording is in Texts." />
      <LinksForm data={data} slots={linkSlots} />
    </>
  );
}
