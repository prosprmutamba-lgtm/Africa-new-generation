import { notFound } from "next/navigation";
import { requirePageUser } from "@/lib/cms/auth";
import { getPage, pageReadiness } from "@/lib/cms/pages";
import { PageEditor } from "@/components/admin/page-editor";

export const dynamic = "force-dynamic";
export const metadata = { title: "Edit page" };

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePageUser();
  const page = await getPage((await params).id);
  if (!page) notFound();
  return <PageEditor initialPage={page} initialReadiness={pageReadiness(page)} />;
}
