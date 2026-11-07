/**
 * ────────────────────────────────────────────────────────────
 * FOOTER CONFIGURATION
 * ────────────────────────────────────────────────────────────
 * Controls *how much* of other configs the footer displays — it doesn't
 * duplicate content, it just points at menu.ts / programs.ts / contact.ts
 * and says how many items to show and which columns are visible. Footer
 * link labels and headings are translated text (footer.* in
 * locales/*.json); the footer's own copy (description, column headings)
 * lives there, not here.
 * ────────────────────────────────────────────────────────────
 */

export const footerConfig = {
  /** How many programs to list in the footer's "Programs" column. */
  maxProgramsShown: 6,
  /** Toggle whole sections on/off without touching Footer.tsx. */
  showSocialLinks: true,
  showContactColumn: true,
  showProgramsColumn: true,
} as const;

export type FooterConfig = typeof footerConfig;
