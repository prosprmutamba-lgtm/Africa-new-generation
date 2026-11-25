import { siteConfig } from "@/config/site";
import { contactConfig, socialLinks } from "@/config/contact";
import { mainNav } from "@/config/menu";
import { footerConfig } from "@/config/footer";
import { logoConfig } from "@/config/logo";
import { programs } from "@/config/programs";
import { partners } from "@/config/partners";
import { testimonialsConfig } from "@/config/testimonials";
import { galleryItems } from "@/config/gallery";
import { HOME_SECTION_IDS, STAT_IDS, type Settings } from "./schemas";
import { LINK_SLOTS } from "./link-slots";

/**
 * The shipped values, read from the existing config/*.ts files. These are the
 * starting point of the admin: whatever an administrator has not changed keeps
 * following these files, and "Reset to default" returns here.
 */
export function buildDefaultSettings(): Settings {
  return {
    organization: {
      name: siteConfig.organization.name,
      shortName: siteConfig.organization.shortName,
      tagline: siteConfig.organization.tagline,
      legalType: siteConfig.organization.legalType,
      founded: siteConfig.organization.founded,
    },
    contact: {
      phone: contactConfig.phone,
      phoneHref: contactConfig.phoneHref,
      whatsapp: contactConfig.whatsapp,
      whatsappHref: contactConfig.whatsappHref,
      email: contactConfig.email,
      emailHref: contactConfig.emailHref,
      address: { ...contactConfig.address },
      mapEmbedUrl: contactConfig.mapEmbedUrl,
      coordinates: { ...contactConfig.coordinates },
    },
    social: { ...socialLinks },
    footer: { ...footerConfig },
    logo: { ...logoConfig, pathMono: "" },
    menu: mainNav.map((m) => ({
      key: m.key,
      href: m.href,
      highlight: m.highlight,
      visible: true,
    })),
    programs: programs.map((p) => ({
      slug: p.slug,
      key: p.key,
      hasDedicatedPage: p.hasDedicatedPage,
      visible: true,
      coverImage: p.image ?? "",
    })),
    partners: partners.map((p, i) => ({
      id: `partner-${i + 1}`,
      name: p.name,
      logo: p.logo,
      website: p.website ?? "",
      visible: true,
    })),
    testimonials: testimonialsConfig.map((t) => ({
      id: t.id,
      avatar: t.avatar ?? "",
    })),
    gallery: galleryItems.map((g) => ({
      id: g.id,
      type: g.type,
      category: g.category,
      src: g.src,
      thumbnail: g.thumbnail ?? "",
      alt: g.alt,
      width: g.width,
      height: g.height,
      videoUrl: g.videoUrl ?? "",
      visible: true,
    })),
    homeSections: HOME_SECTION_IDS.map((id) => ({ id, visible: true })),
    links: LINK_SLOTS.map((l) => ({
      id: l.id,
      href: l.href,
      newTab: false,
      visible: true,
    })),
    images: {
      heroSlide1: "/images/programs/child-protection/hero.jpg",
      heroSlide2: "/images/impact-stories/amina-education/cover.jpg",
      heroSlide3: "/images/programs/agriculture/hero.jpg",
      aboutMain: "/images/team/director.jpg",
      aboutSecondary: "/images/team/programs-lead.jpg",
      ctaBackground: "/images/programs/child-protection/hero.jpg",
      ogDefault: "/images/programs/child-protection/hero.jpg",
    },
    stats: STAT_IDS.map((id) => ({ id, value: "" })),
  };
}