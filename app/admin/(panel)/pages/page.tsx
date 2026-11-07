import { requirePageUser } from "@/lib/cms/auth";
import { listPages, pageReadiness } from "@/lib/cms/pages";
import { PagesList } from "@/components/admin/pages-list";
import { NotWiredNotice } from "@/components/admin/not-wired";
import { PageHeader } from "@/components/admin/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Pages" };

export default async function PagesPage() {
  await requirePageUser();
  const pages = (await listPages()).map((p) => {
    const r = pageReadiness(p);
    return { id: p.id, slug: p.slug, status: p.status, title: p.title, ready: r.ready, issueCount: r.issues.length, updatedAt: p.updatedAt, updatedBy: p.updatedBy };
  });
  return (
    <>
      <PageHeader title="Pages" description="Create new pages (a program, an event, a campaign…), build them from simple blocks, preview them and publish them in English and French." />
      <NotWiredNotice feature="pageLinks" what="menu and footer links to your pages" />
      <PagesList initial={pages} />
    </>
  );
}
