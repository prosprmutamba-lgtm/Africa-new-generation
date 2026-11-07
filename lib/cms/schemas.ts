import { z } from "zod";
import { LINK_SLOT_IDS } from "./link-slots";

/* ───────── building blocks ───────── */

export const text = (max = 300) => z.string().trim().max(max, `Maximum ${max} characters.`);

/** A link: site path, anchor, https URL, mailto: or tel:. Blocks javascript: and friends. */
export const href = text(500).refine(
  (v) => v === "" || /^(\/(?!\/)|#|https?:\/\/|mailto:|tel:)/i.test(v),
  "Use a site path like /about, or a link starting with https://, mailto: or tel:."
);

const httpsUrl = text(500).refine((v) => v === "" || /^https:\/\/\S+$/i.test(v), "Must start with https://");

/** Local image path only (media library or /images/...). Remote images are not allowed by next/image config. */
export const imagePath = text(500)
  .refine((v) => v === "" || /^\/[A-Za-z0-9._~\-/]+$/.test(v), "Pick an image from the media library, or use a site path like /images/photo.jpg.")
  .refine((v) => !v.includes(".."), "Invalid path.");

const requiredImage = imagePath.refine((v) => v !== "", "An image is required.");

const videoUrl = text(500).refine(
  (v) =>
    v === "" ||
    /^https:\/\/(www\.youtube\.com\/embed\/|www\.youtube-nocookie\.com\/embed\/|player\.vimeo\.com\/video\/)[A-Za-z0-9_-]+(\?[A-Za-z0-9_=&.-]*)?$/.test(v),
  "Use a YouTube or Vimeo EMBED link, e.g. https://www.youtube.com/embed/VIDEO_ID"
);

const id = z.string().trim().regex(/^[a-z0-9][a-z0-9-]{0,59}$/, "Use lowercase letters, numbers and dashes only.");

/* ───────── settings groups ───────── */

export const organizationSchema = z.object({
  name: text(200).min(1, "Required."),
  shortName: text(100).min(1, "Required."),
  tagline: text(200),
  legalType: text(50),
  founded: z.string().trim().regex(/^(\d{4})?$/, "Use a 4-digit year, e.g. 2020."),
});

export const contactInputSchema = z.object({
  phone: text(40).min(5, "Enter a phone number."),
  whatsapp: text(40),
  email: z.string().trim().max(200).email("Enter a valid email address."),
  address: z.object({
    line1: text(120),
    line2: text(120),
    district: text(120),
    country: text(120).min(1, "Required."),
  }),
  mapEmbedUrl: text(600).refine(
    (v) => v === "" || /^https:\/\/(www\.google\.com|maps\.google\.com)\/maps/i.test(v),
    "Must be a Google Maps embed link (https://www.google.com/maps...)."
  ),
  coordinates: z.object({
    lat: z.coerce.number().min(-90).max(90),
    lng: z.coerce.number().min(-180).max(180),
  }),
});

const digits = (s: string) => s.replace(/[^\d]/g, "");

/** Contact as stored/used by the site: the user edits the base fields, the links are derived. */
export const contactSchema = contactInputSchema.transform((c) => ({
  ...c,
  phoneHref: `tel:+${digits(c.phone)}`,
  whatsappHref: c.whatsapp ? `https://wa.me/${digits(c.whatsapp)}` : "",
  emailHref: `mailto:${c.email}`,
  address: {
    ...c.address,
    full: [c.address.line1, c.address.line2, c.address.district, c.address.country].filter(Boolean).join(", "),
  },
}));

export const socialSchema = z.object({
  linkedin: httpsUrl,
  facebook: httpsUrl,
  instagram: httpsUrl,
  youtube: httpsUrl,
});

export const footerSchema = z.object({
  maxProgramsShown: z.coerce.number().int().min(0).max(9),
  showSocialLinks: z.boolean(),
  showContactColumn: z.boolean(),
  showProgramsColumn: z.boolean(),
});

export const logoSchema = z.object({
  path: requiredImage,
  pathDark: requiredImage,
  mark: requiredImage,
  /** Official black (one-colour) variant of the logo. Optional. */
  pathMono: imagePath.default(""),
  favicon: text(200),
  width: z.coerce.number().int().min(16).max(800),
  height: z.coerce.number().int().min(16).max(400),
});

export const menuSchema = z
  .array(
    z.object({
      key: z.string().trim().regex(/^[a-zA-Z][a-zA-Z0-9]*$/, "Invalid label."),
      href: href.refine((v) => v !== "", "Required."),
      highlight: z.boolean(),
      visible: z.boolean(),
    })
  )
  .min(1, "Keep at least one menu item.")
  .max(12, "Maximum 12 menu items.");

export const programsSchema = z
  .array(
    z.object({
      slug: z.string().trim().regex(/^[a-z0-9-]+$/),
      key: z.string().trim().regex(/^[a-zA-Z0-9]+$/),
      hasDedicatedPage: z.boolean(),
      visible: z.boolean(),
      coverImage: imagePath,
    })
  )
  .max(30);

export const partnersSchema = z
  .array(
    z.object({
      id,
      name: text(120).min(1, "Required."),
      logo: requiredImage,
      website: httpsUrl,
      visible: z.boolean(),
    })
  )
  .max(40, "Maximum 40 partners.");

export const testimonialsSchema = z
  .array(z.object({ id, avatar: imagePath }))
  .max(40, "Maximum 40 entries.");

export const gallerySchema = z
  .array(
    z
      .object({
        id,
        type: z.enum(["photo", "video"]),
        category: z.string().trim().regex(/^[a-z0-9-]{1,40}$/, "Use lowercase letters, numbers and dashes."),
        src: requiredImage,
        thumbnail: imagePath,
        alt: text(200).min(1, "Describe the image (used by screen readers)."),
        width: z.coerce.number().int().min(50).max(10000),
        height: z.coerce.number().int().min(50).max(10000),
        videoUrl,
        visible: z.boolean(),
      })
      .refine((g) => g.type !== "video" || g.videoUrl !== "", { message: "A video needs an embed link.", path: ["videoUrl"] })
  )
  .max(300, "Maximum 300 gallery items.");

export const HOME_SECTION_IDS = [
  "hero",
  "stats",
  "aboutPreview",
  "programsPreview",
  "impactPreview",
  "galleryPreview",
  "partners",
  "testimonials",
  "news",
  "faq",
  "newsletter",
] as const;

export const homeSectionsSchema = z.array(
  z.object({ id: z.enum(HOME_SECTION_IDS), visible: z.boolean() })
);

export const linksSchema = z.array(
  z.object({
    id: z.enum(LINK_SLOT_IDS),
    href: href.refine((v) => v !== "", "Required."),
    newTab: z.boolean(),
    visible: z.boolean(),
  })
);

/** Site-wide pictures (all optional: an empty or missing file falls back to a branded placeholder). */
export const imagesSchema = z.object({
  heroSlide1: imagePath,
  heroSlide2: imagePath,
  heroSlide3: imagePath,
  aboutMain: imagePath,
  aboutSecondary: imagePath,
  ctaBackground: imagePath,
  ogDefault: imagePath,
});

export const STAT_IDS = ["livesReached", "programsRunning", "communitiesServed", "yearsOfService"] as const;
/** Impact figures. Empty by default: figures are never invented. A figure left empty is not shown. */
export const statsSchema = z.array(z.object({ id: z.enum(STAT_IDS), value: text(20) }));

export const GROUP_SCHEMAS = {
  organization: organizationSchema,
  contact: contactSchema,
  social: socialSchema,
  footer: footerSchema,
  logo: logoSchema,
  menu: menuSchema,
  programs: programsSchema,
  partners: partnersSchema,
  testimonials: testimonialsSchema,
  gallery: gallerySchema,
  homeSections: homeSectionsSchema,
  links: linksSchema,
  images: imagesSchema,
  stats: statsSchema,
} as const;

export type GroupName = keyof typeof GROUP_SCHEMAS;
export const GROUP_NAMES = Object.keys(GROUP_SCHEMAS) as GroupName[];

export type Organization = z.infer<typeof organizationSchema>;
export type Contact = z.output<typeof contactSchema>;
export type Social = z.infer<typeof socialSchema>;
export type FooterSettings = z.infer<typeof footerSchema>;
export type LogoSettings = z.infer<typeof logoSchema>;
export type MenuItem = z.infer<typeof menuSchema>[number];
export type ProgramSetting = z.infer<typeof programsSchema>[number];
export type PartnerSetting = z.infer<typeof partnersSchema>[number];
export type TestimonialSetting = z.infer<typeof testimonialsSchema>[number];
export type GalleryEntry = z.output<typeof gallerySchema>[number];
export type HomeSection = z.infer<typeof homeSectionsSchema>[number];

export interface Settings {
  organization: Organization;
  contact: Contact;
  social: Social;
  footer: FooterSettings;
  logo: LogoSettings;
  menu: MenuItem[];
  programs: ProgramSetting[];
  partners: PartnerSetting[];
  testimonials: TestimonialSetting[];
  gallery: GalleryEntry[];
  homeSections: HomeSection[];
  links: z.output<typeof linksSchema>;
  images: z.infer<typeof imagesSchema>;
  stats: z.infer<typeof statsSchema>;
}
