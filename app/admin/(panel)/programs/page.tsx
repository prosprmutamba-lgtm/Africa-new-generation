import { requirePageUser } from "@/lib/cms/auth";
import { adminSettingsData, englishLabels } from "@/lib/cms/page-data";
import { ProgramsForm } from "@/components/admin/forms";
import { NotWiredNotice } from "@/components/admin/not-wired";
import { PageHeader } from "@/components/admin/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Programs" };

export default async function ProgramsPage() {
  await requirePageUser();
  const [data, { programTitles }] = await Promise.all([adminSettingsData(), englishLabels()]);
  return (
    <>
      <PageHeader title="Programs" description="Show, hide, reorder and choose the cover image of each program. To change names, descriptions, objectives or activities, use “Edit texts”." />
      <NotWiredNotice feature="programs" what="program covers and visibility" />
      <ProgramsForm data={data} titles={programTitles} />
    </>
  );
}
