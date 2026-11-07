import { requirePageUser } from "@/lib/cms/auth";
import { adminSettingsData } from "@/lib/cms/page-data";
import { GalleryForm } from "@/components/admin/forms";
import { NotWiredNotice } from "@/components/admin/not-wired";
import { PageHeader } from "@/components/admin/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Gallery" };

export default async function GalleryPage() {
  await requirePageUser();
  const data = await adminSettingsData();
  return (
    <>
      <PageHeader title="Gallery" description="Add, remove, reorder and describe the photos and videos of the gallery." />
      <NotWiredNotice feature="gallery" what="the gallery" />
      <GalleryForm data={data} />
    </>
  );
}
