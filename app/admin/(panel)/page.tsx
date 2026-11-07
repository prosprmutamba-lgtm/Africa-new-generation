import Link from "next/link";
import { AlertTriangle, CheckCircle2, Clock, FileText, ImageIcon, Images, Layers, Mail } from "lucide-react";
import { loadSettings } from "@/lib/cms/runtime";
import { readOverrides } from "@/lib/cms/messages";
import { listMedia } from "@/lib/cms/media";
import { listInbox } from "@/lib/cms/inbox";
import { recentAudit } from "@/lib/cms/audit";
import { WIRED } from "@/lib/cms/wiring";
import { requirePageUser } from "@/lib/cms/auth";
import { formatBytes, formatDate } from "@/lib/cms/format";
import { Card, PageHeader } from "@/components/admin/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard" };

const WIRING_LABELS: Array<[keyof typeof WIRED, string]> = [
  ["texts", "Page texts (EN / FR)"],
  ["customPages", "Custom pages (/<lang>/<slug>)"],
  ["pageLinks", "Menu/footer links to custom pages"],
  ["sitemap", "Sitemap"],
  ["menu", "Menu"],
  ["contact", "Contact details"],
  ["social", "Social links"],
  ["organization", "Organization info"],
  ["footer", "Footer options"],
  ["logo", "Logo"],
  ["homeSections", "Home page sections"],
  ["programs", "Program covers & visibility"],
  ["gallery", "Gallery"],
  ["links", "Buttons & links"],
  ["images", "Site photos"],
  ["stats", "Impact figures"],
  ["inbox", "Contact form & newsletter"],
  ["partners", "Partners"],
  ["testimonialPhotos", "Testimonial photos"],
];

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const [{ denied }, user] = await Promise.all([searchParams, requirePageUser()]);
  const [eff, en, fr, files, audit, inbox] = await Promise.all([loadSettings(), readOverrides("en"), readOverrides("fr"), listMedia(), recentAudit(8), listInbox()]);
  const unreadMessages = inbox.filter((i) => i.kind === "contact" && !i.read).length;
  const s = eff.settings;

  const textEdits = Object.keys(en.data.values ?? {}).length + Object.keys(fr.data.values ?? {}).length;
  const mediaBytes = files.reduce((n, f) => n + f.size, 0);
  const visiblePrograms = s.programs.filter((p) => p.visible).length;
  const galleryShown = s.gallery.filter((g) => g.visible).length;
  const videos = s.gallery.filter((g) => g.type === "video");

  const todo: Array<{ text: string; href: string }> = [];
  const placeholderVideos = videos.filter((v) => v.videoUrl.includes("REPLACE_WITH_VIDEO_ID")).length;
  if (placeholderVideos) todo.push({ text: `${placeholderVideos} gallery video${placeholderVideos > 1 ? "s still use" : " still uses"} a placeholder link`, href: "/admin/gallery" });
  const placeholderPartners = s.partners.filter((p) => /^partner (one|two|three|four|five)$/i.test(p.name)).length;
  if (placeholderPartners) todo.push({ text: `${placeholderPartners} partner${placeholderPartners > 1 ? "s have" : " has"} a placeholder name and logo`, href: "/admin/branding" });
  if (s.logo.path.includes("placeholder")) todo.push({ text: "The logo is still the placeholder", href: "/admin/branding" });
  if (!eff.custom.includes("social")) todo.push({ text: "Social media links are still the temporary accounts", href: "/admin/settings" });
  if (!eff.custom.includes("contact")) todo.push({ text: "Confirm the contact details and the map location", href: "/admin/settings" });
  if (!s.stats.some((x) => x.value.trim())) todo.push({ text: "Impact figures are not entered yet, so that home section is hidden", href: "/admin/navigation" });
  if (unreadMessages) todo.push({ text: `${unreadMessages} unread contact message${unreadMessages > 1 ? "s" : ""}`, href: "/admin/messages" });
  if (!eff.custom.includes("organization")) todo.push({ text: "Confirm the founding year", href: "/admin/settings" });

  const stats = [
    { label: "Texts edited", value: textEdits, sub: "in English and French", icon: <FileText className="h-5 w-5" />, href: "/admin/content" },
    { label: "Images uploaded", value: files.length, sub: formatBytes(mediaBytes), icon: <ImageIcon className="h-5 w-5" />, href: "/admin/media" },
    { label: "Programs shown", value: `${visiblePrograms}/${s.programs.length}`, sub: "visible on the site", icon: <Layers className="h-5 w-5" />, href: "/admin/programs" },
    { label: "Gallery items", value: galleryShown, sub: `${videos.length} video${videos.length === 1 ? "" : "s"}`, icon: <Images className="h-5 w-5" />, href: "/admin/gallery" },
    { label: "New messages", value: unreadMessages, sub: "from the Contact page", icon: <Mail className="h-5 w-5" />, href: "/admin/messages" },
  ];

  return (
    <>
      <PageHeader title="Dashboard" description={`Signed in as ${user.email}. Everything you save here is stored permanently and updates the public site.`} />

      {denied && (
        <p role="alert" className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          That page is only for administrators.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map((c) => (
          <Link key={c.label} href={c.href} className="group rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-blue-500">
            <Card className="h-full p-5 transition-shadow group-hover:shadow-soft">
              <div className="flex items-center justify-between text-brand-blue-500">{c.icon}</div>
              <p className="mt-3 font-heading text-3xl font-semibold text-brand-navy">{c.value}</p>
              <p className="text-sm font-medium">{c.label}</p>
              <p className="text-xs text-muted-foreground">{c.sub}</p>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="p-5 sm:p-6 lg:col-span-2">
          <h2 className="font-heading text-lg font-semibold">Still to finish</h2>
          {todo.length === 0 ? (
            <p className="mt-3 flex items-center gap-2 text-sm text-emerald-800"><CheckCircle2 className="h-4 w-4" /> Nothing left to confirm. The delivered placeholders have all been replaced.</p>
          ) : (
            <ul className="mt-3 divide-y divide-border">
              {todo.map((t) => (
                <li key={t.text}>
                  <Link href={t.href} className="flex items-center gap-3 py-2.5 text-sm hover:text-brand-blue-600">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-brand-gold-500" /> {t.text}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-5 sm:p-6">
          <h2 className="font-heading text-lg font-semibold">Connected to the public site</h2>
          <ul className="mt-3 space-y-1.5 text-sm">
            {WIRING_LABELS.map(([k, label]) => (
              <li key={k} className="flex items-center gap-2">
                {WIRED[k] ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Clock className="h-4 w-4 text-brand-gold-500" />}
                <span>{label}</span>
                {!WIRED[k] && <span className="text-xs text-muted-foreground">pending</span>}
              </li>
            ))}
          </ul>
          {!Object.values(WIRED).every(Boolean) && <p className="mt-3 text-xs text-muted-foreground">“Pending” items save correctly but need a developer to connect them to the page (docs/ADMIN_WIRING.md).</p>}
        </Card>
      </div>

      <Card className="mt-6 p-5 sm:p-6">
        <h2 className="font-heading text-lg font-semibold">Recent activity</h2>
        {audit.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Nothing yet. Changes made in the dashboard are listed here.</p>
        ) : (
          <ul className="mt-3 divide-y divide-border text-sm">
            {audit.map((a, i) => (
              <li key={`${a.at}-${i}`} className="flex flex-wrap items-baseline justify-between gap-2 py-2">
                <span><span className="font-medium">{a.action}</span>{a.target && <span className="text-muted-foreground"> · {a.target}</span>}<span className="text-muted-foreground"> — {a.user}</span></span>
                <time dateTime={a.at} className="text-xs text-muted-foreground">{formatDate(a.at)}</time>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
