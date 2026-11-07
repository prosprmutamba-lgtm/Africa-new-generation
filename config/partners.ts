/**
 * ────────────────────────────────────────────────────────────
 * PARTNERS CONFIGURATION
 * ────────────────────────────────────────────────────────────
 * Partner/sponsor logos shown in the Home page "Our Partners" section.
 * Names here are placeholders — replace with real partner names once
 * confirmed, and swap the logo files at the paths below (see
 * /public/images/partners/README.md for image specs).
 *
 * To add a partner: add a row with a name, logo path, and optional
 * website (makes the logo clickable, opens in a new tab).
 * To remove a partner: delete its row.
 * To reorder: reorder this array.
 * ────────────────────────────────────────────────────────────
 */

export interface Partner {
  name: string;
  logo: string;
  website?: string;
}

export const partners: Partner[] = [
  { name: "Partner One", logo: "/images/partners/partner-1.png" },
  { name: "Partner Two", logo: "/images/partners/partner-2.png" },
  { name: "Partner Three", logo: "/images/partners/partner-3.png" },
  { name: "Partner Four", logo: "/images/partners/partner-4.png" },
  { name: "Partner Five", logo: "/images/partners/partner-5.png" },
];
