import { requirePageUser } from "@/lib/cms/auth";
import { adminSettingsData } from "@/lib/cms/page-data";
import { BrandingForms } from "@/components/admin/forms";
import { NotWiredNotice } from "@/components/admin/not-wired";
import { PageHeader } from "@/components/admin/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Logo & partners" };

export default async function BrandingPage() {
  await requirePageUser();
  const data = await adminSettingsData();
  return (
    <>
      <PageHeader title="Logo & partners" description="The logo variants, the partner logos and the testimonial photos." />
      <NotWiredNotice feature="logo" what="the logo" />
      <NotWiredNotice feature="partners" what="partners" />
      <NotWiredNotice feature="testimonialPhotos" what="testimonial photos" />
      <BrandingForms data={data} />
    </>
  );
}
