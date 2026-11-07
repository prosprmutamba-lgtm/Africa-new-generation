import { z } from "zod";
import { addInbox } from "@/lib/cms/inbox";
import { emailField, handlePublicForm } from "@/lib/cms/public-form";

export const dynamic = "force-dynamic";

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: emailField,
  phone: z.string().trim().max(40).optional().default(""),
  subject: z.string().trim().min(2).max(150),
  message: z.string().trim().min(10).max(5000),
});

/** Contact form: stored for the team (Admin → Messages). No email is sent by this route. */
export async function POST(req: Request) {
  return handlePublicForm(req, {
    name: "contact",
    schema,
    limit: 5,
    save: async (d, locale) => {
      await addInbox({ kind: "contact", locale, name: d.name, email: d.email, phone: d.phone, subject: d.subject, message: d.message });
    },
  });
}
