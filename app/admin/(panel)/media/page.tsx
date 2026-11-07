import { requirePageUser } from "@/lib/cms/auth";
import { MAX_BYTES, listMedia } from "@/lib/cms/media";
import { MediaLibrary } from "@/components/admin/media";
import { PageHeader } from "@/components/admin/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Media library" };

export default async function MediaPage() {
  await requirePageUser();
  const files = await listMedia();
  return (
    <>
      <PageHeader title="Media library" description="Upload, preview, replace and delete images. Pick them from the logo, program, gallery and partner screens." />
      <MediaLibrary initial={files} maxMb={MAX_BYTES / 1048576} />
    </>
  );
}
