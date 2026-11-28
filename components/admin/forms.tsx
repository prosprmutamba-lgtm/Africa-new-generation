"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import Link from "next/link";
import { Pencil } from "lucide-react";
import { GroupEditor, type FieldDef } from "./group-editor";

export interface SettingsData {
  settings: Record<string, any>;
  custom: string[];
  revs: Record<string, number>;
}

const g = (d: SettingsData, name: string) => ({ group: name, initial: d.settings[name], rev: d.revs[name] ?? 0, custom: d.custom.includes(name) });

/* ───────── Contact & social ───────── */

export function ContactForms({ data }: { data: SettingsData }) {
  const org: FieldDef[] = [
    { name: "name", label: "Full organization name" },
    { name: "shortName", label: "Short name", hint: "Used in page titles and social sharing." },
    { name: "tagline", label: "Tagline", full: true },
    { name: "legalType", label: "Organization type", hint: "For search engines, e.g. NGO." },
    { name: "founded", label: "Year founded", placeholder: "2020", hint: "4 digits. Please confirm the exact year." },
  ];
  const contact: FieldDef[] = [
    { name: "phone", label: "Phone number", hint: "The “call” link is created automatically." },
    { name: "whatsapp", label: "WhatsApp number", hint: "Leave empty if you do not use WhatsApp." },
    { name: "email", label: "Public email address", type: "email", full: true },
    { name: "address.line1", label: "Address line 1" },
    { name: "address.line2", label: "Address line 2" },
    { name: "address.district", label: "District / region" },
    { name: "address.country", label: "Country" },
    { name: "mapEmbedUrl", label: "Google Maps embed link", full: true, hint: "In Google Maps: Share → Embed a map → copy the link inside src=\"…\"." },
    { name: "coordinates.lat", label: "Latitude", type: "number", hint: "e.g. 0.6167" },
    { name: "coordinates.lng", label: "Longitude", type: "number", hint: "e.g. 30.55" },
  ];
  const social: FieldDef[] = [
    { name: "linkedin", label: "LinkedIn", placeholder: "https://www.linkedin.com/…" },
    { name: "facebook", label: "Facebook", placeholder: "https://www.facebook.com/…" },
    { name: "instagram", label: "Instagram", placeholder: "https://www.instagram.com/…" },
    { name: "youtube", label: "YouTube", placeholder: "https://www.youtube.com/@…" },
  ];
  const footer: FieldDef[] = [
    { name: "showContactColumn", label: "Show the contact column", type: "toggle" },
    { name: "showProgramsColumn", label: "Show the programs column", type: "toggle" },
    { name: "showSocialLinks", label: "Show social media icons", type: "toggle" },
    { name: "maxProgramsShown", label: "Programs listed in the footer", type: "number", hint: "0 to 9." },
  ];
  return (
    <>
      <GroupEditor kind="object" title="Organization" description="Name and basic facts used across the site and by search engines." fields={org} {...g(data, "organization")} />
      <GroupEditor kind="object" title="Contact details" description="Phone, email, address and map shown in the header, footer and on the Contact page." fields={contact} {...g(data, "contact")} />
      <GroupEditor kind="object" title="Social media links" description="Full links, starting with https://." fields={social} {...g(data, "social")} />
      <GroupEditor kind="object" title="Footer" description="Which blocks the footer shows." fields={footer} {...g(data, "footer")} />
    </>
  );
}

/* ───────── Menu & home page ───────── */

const SECTION_NAMES: Record<string, string> = {
  hero: "Hero banner (top of the page)",
  stats: "Impact numbers",
  aboutPreview: "About us preview",
  programsPreview: "Programs preview",
  impactPreview: "Impact stories preview",
  galleryPreview: "Gallery preview",
  partners: "Partners",
  news: "News",
  newsletter: "Newsletter sign-up",
  testimonials: "Testimonials",
  faq: "Frequently asked questions",
};

export function NavigationForms({ data, navLabels, statLabels }: { data: SettingsData; navLabels: Record<string, string>; statLabels: Record<string, string> }) {
  const options = Object.entries(navLabels).map(([key, label]) => ({ value: key, label: `${label}` }));
  const menuFields: FieldDef[] = [
    { name: "key", label: "Menu label", type: "select", options, hint: "The words come from Texts → Menu labels (editable in both languages)." },
    { name: "href", label: "Links to", hint: "A page path such as /about, or a full https:// link." },
    { name: "visible", label: "Show in the menu", type: "toggle" },
    { name: "highlight", label: "Show as a highlighted button", type: "toggle" },
  ];
  return (
    <>
      <GroupEditor
        kind="list"
        title="Main menu"
        description="Order, visibility and links of the header menu (desktop and mobile)."
        fields={menuFields}
        itemTitle={(it) => navLabels[it.key] ?? it.key}
        canRemove
        addLabel="Add a menu item"
        newItem={() => {
          const used = new Set((data.settings.menu as any[]).map((m) => m.key));
          const free = Object.keys(navLabels).find((k) => !used.has(k)) ?? Object.keys(navLabels)[0];
          return { key: free, href: "/", highlight: false, visible: true };
        }}
        {...g(data, "menu")}
      />
      <GroupEditor
        kind="list"
        title="Home page sections"
        description="Reorder the sections of the home page or hide the ones you do not need yet."
        fields={[{ name: "visible", label: "Show this section", type: "toggle" }]}
        itemTitle={(it) => SECTION_NAMES[it.id] ?? it.id}
        {...g(data, "homeSections")}
      />
      <GroupEditor
        kind="list"
        title="Impact figures (home page)"
        description="Enter only figures you can stand behind. A figure left empty is not shown, and the whole section stays hidden until at least one figure is filled in. The labels are edited under Texts → Home page → Stats."
        fields={[{ name: "value", label: "Number", placeholder: "e.g. 1,200 or 85%", hint: "Up to 20 characters." }]}
        itemTitle={(it) => statLabels[it.id] ?? it.id}
        {...g(data, "stats")}
      />
    </>
  );
}

/* ───────── Programs ───────── */

export function ProgramsForm({ data, titles }: { data: SettingsData; titles: Record<string, string> }) {
  const fields: FieldDef[] = [
    { name: "visible", label: "Show this program on the site", type: "toggle" },
    { name: "coverImage", label: "Cover image", type: "image", hint: "Shown on program cards. Landscape photos work best." },
  ];
  return (
    <GroupEditor
      kind="list"
      title="Programs"
      description="Order, visibility and cover images. Titles, descriptions, objectives and activities are edited under Texts."
      fields={fields}
      itemTitle={(it) => titles[it.key] ?? it.key}
      itemExtra={() => (
        <Link href="/admin/content?section=programs" className="mr-1 inline-flex items-center gap-1 rounded-xl px-2 py-1 text-sm text-brand-blue-600 hover:bg-brand-blue-50">
          <Pencil className="h-4 w-4" /> Edit texts
        </Link>
      )}
      {...g(data, "programs")}
    />
  );
}

/* ───────── Gallery ───────── */

export function GalleryForm({ data }: { data: SettingsData }) {
  const fields: FieldDef[] = [
    { name: "src", label: "Image", type: "image", syncSize: { width: "width", height: "height" }, hint: "For a video, use its cover image here. You can remove the image while keeping this gallery entry." },
    { name: "type", label: "Type", type: "select", options: [{ value: "photo", label: "Photo" }, { value: "video", label: "Video" }] },
    { name: "category", label: "Category", placeholder: "education", hint: "Lowercase word, e.g. education, health, community." },
    { name: "alt", label: "Description (for screen readers)", full: true, hint: "Say what the picture shows." },
    { name: "videoUrl", label: "Video embed link", full: true, showIf: (it) => it.type === "video", hint: "YouTube: https://www.youtube.com/embed/VIDEO_ID (use the part after v= in the normal link)." },
    { name: "thumbnail", label: "Video thumbnail", type: "image", showIf: (it) => it.type === "video" },
    { name: "width", label: "Width (px)", type: "number", hint: "Filled in automatically when you pick an image." },
    { name: "height", label: "Height (px)", type: "number" },
    { name: "visible", label: "Show in the gallery", type: "toggle" },
  ];
  return (
    <GroupEditor
      kind="list"
      title="Gallery items"
      description="Photos and videos shown on the Gallery page and in the home page preview."
      fields={fields}
      itemTitle={(it, i) => `${i + 1}. ${it.alt || "New item"}`}
      canRemove
      addLabel="Add a photo or video"
      emptyText="No gallery items yet. Add your first photo."
      newItem={() => ({ id: `g-${Date.now().toString(36)}`, type: "photo", category: "community", src: "", thumbnail: "", alt: "", width: "", height: "", videoUrl: "", visible: true })}
      {...g(data, "gallery")}
    />
  );
}

/* ───────── Logo, partners, testimonial photos ───────── */

export function BrandingForms({ data }: { data: SettingsData }) {
  const logo: FieldDef[] = [
    { name: "path", label: "Full-colour logo (light backgrounds)", type: "image", required: true, hint: "Official ANG logo, colour version. Use the files supplied with the graphic charter; do not edit or recolour them." },
    { name: "pathDark", label: "White logo (dark and blue backgrounds)", type: "image", required: true, hint: "Official white version — used over the hero photo, dark bands and the footer." },
    { name: "pathMono", label: "Black logo (one-colour use)", type: "image", hint: "Official black version, for one-colour contexts. Optional." },
    { name: "mark", label: "Icon only (no text)", type: "image", required: true, hint: "Only if an official emblem-only file exists; otherwise reuse the main logo file." },
    { name: "width", label: "Display width (px)", type: "number", hint: "Keep the original proportions." },
    { name: "height", label: "Display height (px)", type: "number", hint: "Keep the original proportions." },
  ];
  const images: FieldDef[] = [
    { name: "heroSlide1", label: "Home banner — slide 1", type: "image", hint: "Wide photo (about 1920×1080). Empty or missing = branded colour background." },
    { name: "heroSlide2", label: "Home banner — slide 2", type: "image" },
    { name: "heroSlide3", label: "Home banner — slide 3", type: "image" },
    { name: "aboutMain", label: "About — main photo", type: "image", hint: "Used on the home page and the About page." },
    { name: "aboutSecondary", label: "Home — second, smaller photo", type: "image" },
    { name: "ctaBackground", label: "Closing banners — background photo", type: "image" },
    { name: "ogDefault", label: "Default sharing image (social networks)", type: "image", hint: "About 1200×630." },
  ];
  const partners: FieldDef[] = [
    { name: "name", label: "Partner name" },
    { name: "website", label: "Website (optional)", placeholder: "https://…", hint: "Makes the logo a link." },
    { name: "logo", label: "Logo", type: "image", required: true },
    { name: "visible", label: "Show on the home page", type: "toggle" },
  ];
  const testimonials: FieldDef[] = [
    { name: "id", label: "ID", lockExisting: true, hint: "Must match the ID of the testimonial under Texts → Home page → Testimonials." },
    { name: "avatar", label: "Photo (optional)", type: "image" },
  ];
  return (
    <>
      <GroupEditor kind="object" title="Logo" description="The logo variants used by the header and footer. The browser tab icon (favicon) is a file in the code and is not changed here." fields={logo} {...g(data, "logo")} />
      <GroupEditor kind="object" title="Site photos" description="The large pictures of the public site. A photo that is missing or removed is replaced by a branded colour block, never by a broken image." fields={images} {...g(data, "images")} />
      <GroupEditor
        kind="list"
        title="Partners"
        description="Logos shown in the “Our partners” section of the home page. Placeholder entries (“Partner One”…) are never shown to visitors."
        fields={partners}
        itemTitle={(it, i) => it.name || `Partner ${i + 1}`}
        canRemove
        addLabel="Add a partner"
        emptyText="No partners yet."
        newItem={() => ({ id: `partner-${Date.now().toString(36)}`, name: "", logo: "", website: "", visible: true })}
        {...g(data, "partners")}
      />
      <GroupEditor
        kind="list"
        title="Testimonial photos"
        description="Photos for the testimonials. The quotes themselves are edited under Texts."
        fields={testimonials}
        itemTitle={(it) => `Testimonial ${it.id}`}
        canRemove
        addLabel="Add a photo entry"
        newItem={() => ({ id: "", avatar: "" })}
        {...g(data, "testimonials")}
      />
    </>
  );
}

/* ───────── Buttons & links ───────── */

export function LinksForm({ data, slots }: { data: SettingsData; slots: Record<string, { where: string; label: string; section: string }> }) {
  const fields: FieldDef[] = [
    { name: "href", label: "Destination", hint: "A site page such as /contact, an anchor such as #how-to-give, or a full https:// link." },
    { name: "newTab", label: "Open in a new tab", type: "toggle" },
    { name: "visible", label: "Show this button", type: "toggle" },
  ];
  return (
    <GroupEditor
      kind="list"
      title="Buttons & links"
      description="Where each call-to-action button of the site leads, and whether it is shown. The words on a button are edited under Texts (use “Edit text”). Menu items are managed under Menu & home page."
      fields={fields}
      itemTitle={(it) => `${slots[it.id]?.where ?? it.id} — “${slots[it.id]?.label ?? ""}”`}
      itemExtra={(it) => (
        <Link href={`/admin/content?section=${slots[it.id]?.section ?? ""}`} className="mr-1 inline-flex items-center gap-1 rounded-xl px-2 py-1 text-sm text-brand-blue-600 hover:bg-brand-blue-50">
          <Pencil className="h-4 w-4" /> Edit text
        </Link>
      )}
      {...g(data, "links")}
    />
  );
}
