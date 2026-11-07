import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/cms/auth";
import { isSecretConfigured } from "@/lib/cms/session-token";
import { LoginForm } from "@/components/admin/login-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sign in" };

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/admin");
  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(135deg,#EEF3FC_0%,#E1EAF9_58%,#F8F3E6_100%)] px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-white/70 bg-white/75 p-8 shadow-soft backdrop-blur-xl">
        <p className="font-heading text-xl font-semibold text-brand-navy">Africa New Generation (ANG)</p>
        <h1 className="mt-6 font-heading text-2xl font-semibold text-brand-navy">Sign in to manage the website</h1>
        <p className="mt-1 text-sm text-muted-foreground">Use the email and password of your admin account.</p>
        <LoginForm configured={isSecretConfigured()} />
      </div>
    </main>
  );
}
