import { requirePageUser } from "@/lib/cms/auth";
import { adminSettingsData, englishLabels } from "@/lib/cms/page-data";
import { NavigationForms } from "@/components/admin/forms";
import { NotWiredNotice } from "@/components/admin/not-wired";
import { PageHeader } from "@/components/admin/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Menu & home page" };

export default async function NavigationPage() {
  await requirePageUser();
  const [data, { navLabels, statLabels }] = await Promise.all([adminSettingsData(), englishLabels()]);
  return (
    <>
      <PageHeader title="Menu & home page" description="Choose what appears in the menu and which sections the home page shows, and in what order." />
      <NotWiredNotice feature="menu" what="the menu" />
      <NotWiredNotice feature="homeSections" what="the home page sections" />
      <NavigationForms data={data} navLabels={navLabels} statLabels={statLabels} />
    </>
  );
}
