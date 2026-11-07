import { z } from "zod";
import { addInbox } from "@/lib/cms/inbox";
import { emailField, handlePublicForm } from "@/lib/cms/public-form";

export const dynamic = "force-dynamic";

const schema = z.object({ email: emailField });

/** Newsletter sign-up: the address is stored once (Admin → Messages → Newsletter). */
export async function POST(req: Request) {
  return handlePublicForm(req, {
    name: "newsletter",
    schema,
    limit: 8,
    save: async (d, locale) => {
      await addInbox({ kind: "newsletter", locale, name: "", email: d.email, phone: "", subject: "", message: "" });
    },
  });
}
