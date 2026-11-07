/**
 * Every button / call-to-action link of the PUBLIC site that an administrator can
 * re-point or hide, without code. The button TEXT stays in the Texts editor
 * (`labelKey`, per language); this list is the destination, visibility and
 * "open in a new tab" flag. Pure module: shared by the site, the admin and the tests.
 */
export interface LinkSlot {
  id: string;
  /** Where the button appears (shown in the admin). */
  where: string;
  /** Message key holding the button's text (edited in Admin → Texts). */
  labelKey: string;
  /** Shipped destination (a site path, without the language prefix). */
  href: string;
}

export const LINK_SLOTS = [
  { id: "header.donate", where: "Header — highlighted button", labelKey: "nav.donate", href: "/make-a-difference" },
  { id: "hero.donate", where: "Home — hero, first button", labelKey: "home.hero.donateButton", href: "/make-a-difference" },
  { id: "hero.partner", where: "Home — hero, second button", labelKey: "home.hero.partnerButton", href: "/contact" },
  { id: "home.about", where: "Home — “Who we are” section", labelKey: "home.aboutPreview.cta", href: "/about" },
  { id: "home.programs", where: "Home — programs section", labelKey: "home.programsPreview.cta", href: "/programs" },
  { id: "home.stories", where: "Home — impact stories section", labelKey: "home.impactPreview.cta", href: "/impact-stories" },
  { id: "home.gallery", where: "Home — gallery section", labelKey: "home.galleryPreview.cta", href: "/gallery" },
  { id: "about.primary", where: "About page — closing banner, first button", labelKey: "about.cta.primaryLabel", href: "/make-a-difference" },
  { id: "about.secondary", where: "About page — closing banner, second button", labelKey: "about.cta.secondaryLabel", href: "/contact" },
  { id: "programs.primary", where: "Programs page — closing banner, first button", labelKey: "programs.cta.primaryLabel", href: "/make-a-difference" },
  { id: "programs.secondary", where: "Programs page — closing banner, second button", labelKey: "programs.cta.secondaryLabel", href: "/contact" },
  { id: "program.donate", where: "Each program page — closing banner, first button", labelKey: "common.donateNow", href: "/make-a-difference" },
  { id: "program.partner", where: "Each program page — closing banner, second button", labelKey: "common.becomeAPartner", href: "/contact" },
  { id: "program.contact", where: "Program pages without a dedicated page — contact link", labelKey: "nav.contact", href: "/contact" },
  { id: "stories.donate", where: "Impact stories — closing banner", labelKey: "impactStories.cta.buttonLabel", href: "/make-a-difference" },
  { id: "donate.donate", where: "Make a Difference — “Donate” card", labelKey: "makeADifference.donate.ctaLabel", href: "#how-to-give" },
  { id: "donate.volunteer", where: "Make a Difference — “Volunteer” card", labelKey: "makeADifference.volunteer.ctaLabel", href: "/contact" },
  { id: "donate.partner", where: "Make a Difference — “Partner” card", labelKey: "makeADifference.partner.ctaLabel", href: "/contact" },
  { id: "donate.majorDonor", where: "Make a Difference — “Major donor” card", labelKey: "makeADifference.majorDonor.ctaLabel", href: "/contact" },
  { id: "donate.corporate", where: "Make a Difference — “Corporate sponsorship” card", labelKey: "makeADifference.corporateSponsorship.ctaLabel", href: "/contact" },
  { id: "donate.fundraising", where: "Make a Difference — fundraising team banner", labelKey: "makeADifference.fundraisingTeam.ctaLabel", href: "/contact" },
  { id: "notFound.home", where: "“Page not found” — button", labelKey: "notFound.cta", href: "/" },
] as const satisfies readonly LinkSlot[];

export type LinkSlotId = (typeof LINK_SLOTS)[number]["id"];
export const LINK_SLOT_IDS = LINK_SLOTS.map((s) => s.id) as unknown as [LinkSlotId, ...LinkSlotId[]];

export interface LinkSetting {
  id: LinkSlotId;
  href: string;
  newTab: boolean;
  visible: boolean;
}
