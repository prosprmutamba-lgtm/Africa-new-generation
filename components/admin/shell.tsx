"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Compass, ExternalLink, Link2, Mail, FileText, Heart, Image as ImageIcon, Images, LayoutDashboard, Layers, LogOut, Menu, Palette, Settings, User, Users, X } from "lucide-react";
import { api, cx } from "./ui";

interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
  adminOnly?: boolean;
}
interface NavGroup {
  title: string;
  items: NavItem[];
}

const ic = "h-[18px] w-[18px]";
const NAV: NavGroup[] = [
  { title: "Overview", items: [{ href: "/admin", label: "Dashboard", icon: <LayoutDashboard className={ic} /> }] },
  {
    title: "Content",
    items: [
      { href: "/admin/pages", label: "Pages", icon: <Layers className={ic} /> },
      { href: "/admin/content", label: "Texts (EN / FR)", icon: <FileText className={ic} /> },
      { href: "/admin/programs", label: "Programs", icon: <Heart className={ic} /> },
      { href: "/admin/gallery", label: "Gallery", icon: <Images className={ic} /> },
    ],
  },
  {
    title: "Site",
    items: [
      { href: "/admin/navigation", label: "Menu & home page", icon: <Compass className={ic} /> },
      { href: "/admin/links", label: "Buttons & links", icon: <Link2 className={ic} /> },
      { href: "/admin/settings", label: "Contact & social", icon: <Settings className={ic} /> },
      { href: "/admin/branding", label: "Logo & partners", icon: <Palette className={ic} /> },
      { href: "/admin/media", label: "Media library", icon: <ImageIcon className={ic} /> },
      { href: "/admin/messages", label: "Messages", icon: <Mail className={ic} /> },
    ],
  },
  {
    title: "Team",
    items: [
      { href: "/admin/users", label: "Users", icon: <Users className={ic} />, adminOnly: true },
      { href: "/admin/account", label: "My account", icon: <User className={ic} /> },
    ],
  },
];

export function Shell({ user, children }: { user: { name: string; email: string; role: "admin" | "editor" }; children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  async function signOut() {
    setSigningOut(true);
    try {
      await api("/api/admin/logout", { method: "POST" });
    } finally {
      window.location.href = "/admin/login";
    }
  }

  const nav = (
    <nav aria-label="Admin" className="flex-1 overflow-y-auto px-3 pb-4">
      {NAV.map((g) => {
        const items = g.items.filter((i) => !i.adminOnly || user.role === "admin");
        if (!items.length) return null;
        return (
          <div key={g.title} className="mt-5 first:mt-0">
            <p className="px-3 pb-1 text-xs font-medium text-muted-foreground">{g.title}</p>
            <ul className="space-y-0.5">
              {items.map((i) => {
                const active = i.href === "/admin" ? pathname === "/admin" : pathname.startsWith(i.href);
                return (
                  <li key={i.href}>
                    <Link
                      href={i.href}
                      onClick={() => setOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={cx(
                        "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-blue-500",
                        active ? "bg-white font-medium text-brand-blue-600 shadow-card" : "text-brand-navy/80 hover:bg-white/60"
                      )}
                    >
                      <span className={active ? "text-brand-blue-500" : "text-brand-navy/50"}>{i.icon}</span>
                      {i.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#EEF3FC_0%,#E1EAF9_58%,#F8F3E6_100%)] text-brand-navy lg:flex">
      {/* desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-white/60 bg-white/45 backdrop-blur-xl lg:flex">
        <div className="px-6 py-6">
          <p className="font-heading text-lg font-semibold leading-tight">Africa New Generation (ANG)</p>
          <p className="text-xs text-muted-foreground">Website admin</p>
        </div>
        {nav}
        <div className="border-t border-white/60 p-3">
          <a href="/en" target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-brand-navy/80 hover:bg-white/60">
            <ExternalLink className="h-4 w-4" /> View the site
          </a>
        </div>
      </aside>

      {/* mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button aria-label="Close menu" className="absolute inset-0 bg-brand-navy/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-[#EAF1FA] shadow-soft">
            <div className="flex items-center justify-between px-6 py-5">
              <p className="font-heading text-lg font-semibold">Africa New Generation (ANG)</p>
              <button aria-label="Close menu" onClick={() => setOpen(false)} className="rounded-lg p-1 hover:bg-white/60">
                <X className="h-5 w-5" />
              </button>
            </div>
            {nav}
          </div>
        </div>
      )}

      <div className="min-w-0 flex-1">
        <header className="flex items-center gap-3 px-4 py-4 sm:px-8">
          <button aria-label="Open menu" onClick={() => setOpen(true)} className="rounded-xl border border-white/70 bg-white/70 p-2 lg:hidden">
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-muted-foreground">Welcome back,</p>
            <p className="truncate font-heading text-lg font-semibold leading-tight">{user.name}</p>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <a href="/en" target="_blank" rel="noreferrer" className="rounded-xl border border-white/70 bg-white/70 px-3 py-1.5 text-sm hover:bg-white">
              View EN
            </a>
            <a href="/fr" target="_blank" rel="noreferrer" className="rounded-xl border border-white/70 bg-white/70 px-3 py-1.5 text-sm hover:bg-white">
              View FR
            </a>
          </div>
          <button
            onClick={signOut}
            disabled={signingOut}
            className="inline-flex items-center gap-2 rounded-xl border border-white/70 bg-white/70 px-3 py-1.5 text-sm hover:bg-white disabled:opacity-60"
          >
            <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Sign out</span>
          </button>
        </header>
        <main className="px-4 pb-16 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
