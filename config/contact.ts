/**
 * ────────────────────────────────────────────────────────────
 * CONTACT CONFIGURATION
 * ────────────────────────────────────────────────────────────
 * Every phone number, email, address, and social link on the site reads
 * from this one file — the header, footer, Contact page, and any future
 * schema.org structured data all pull from here. Change a value once,
 * it updates everywhere.
 *
 * NOTE: the social links below are the TEMPORARY placeholder accounts
 * provided at project start. Replace with the organization's official
 * accounts as soon as they exist — see each field's comment.
 * ────────────────────────────────────────────────────────────
 */

export const contactConfig = {
  phone: "+256 778 986 168",
  phoneHref: "tel:+256778986168",
  whatsapp: "+256778986168",
  whatsappHref: "https://wa.me/256778986168",
  email: "angfoundation1@gmail.com",
  emailHref: "mailto:angfoundation1@gmail.com",
  address: {
    line1: "Western Uganda",
    line2: "Kyaka II Refugee Settlement",
    district: "Kyegegwa District",
    country: "Uganda",
    full: "Western Uganda, Kyaka II Refugee Settlement, Kyegegwa District, Uganda",
  },
  // TODO: replace with final Google Maps embed / coordinates once confirmed
  mapEmbedUrl:
    "https://www.google.com/maps?q=Kyaka+II+Refugee+Settlement,+Kyegegwa+District,+Uganda&output=embed",
  coordinates: {
    lat: 0.6167, // approximate — TODO: confirm exact settlement coordinates
    lng: 30.55,
  },
} as const;

// TEMPORARY placeholder social accounts — replace with official ANG
// Foundation accounts when available.
export const socialLinks = {
  linkedin: "https://www.linkedin.com/in/ghost-design-lab-394501415",
  facebook: "https://www.facebook.com/",
  instagram: "https://www.instagram.com/fineart633/?hl=en",
  youtube: "https://www.youtube.com/@Ghostdesignlab",
} as const;

export type ContactConfig = typeof contactConfig;
export type SocialLinks = typeof socialLinks;
