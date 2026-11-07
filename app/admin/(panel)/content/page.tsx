import { requirePageUser } from "@/lib/cms/auth";
import { getBaseMessages, getMergedMessages, readOverrides } from "@/lib/cms/messages";
import { ContentEditor } from "@/components/admin/content-editor";
import { PageHeader } from "@/components/admin/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Texts" };

export default async function ContentPage({ searchParams }: { searchParams: Promise<{ section?: string }> }) {
  await requirePageUser();
  const { section } = await searchParams;
  const [baseEn, baseFr, effEn, effFr, ovEn, ovFr] = await Promise.all([
    getBaseMessages("en"),
    getBaseMessages("fr"),
    getMergedMessages("en"),
    getMergedMessages("fr"),
    readOverrides("en"),
    readOverrides("fr"),
  ]);
  return (
    <>
      <PageHeader
        title="Texts"
        description="Every title, paragraph, button label, program description, story, FAQ and testimonial of the site, in English and French side by side. Lists (such as stories or FAQs) always keep the same items in both languages."
      />
      <ContentEditor
        base={{ en: baseEn, fr: baseFr }}
        initial={{ en: effEn, fr: effFr }}
        revs={{ en: ovEn.rev, fr: ovFr.rev }}
        initialSection={section}
      />
    </>
  );
}
