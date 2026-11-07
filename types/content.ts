/**
 * Shared content types used across program cards, impact story cards,
 * gallery components, and the "Make a Difference" ways-to-help cards.
 * Actual content data will be added in later phases (Phase 4+); these
 * types let components be built now against a stable contract.
 */

export interface ProgramSummary {
  slug: string;
  title: string;
  shortDescription: string;
  coverImage: string;
  hasDedicatedPage: boolean;
  icon?: string;
}

export interface ImpactStorySummary {
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  location?: string;
  programSlug?: string;
}

export type GalleryCategory = "all" | "photos" | "videos";

export interface GalleryItem {
  id: string;
  type: "photo" | "video";
  category: string;
  src: string;
  thumbnail?: string;
  alt: string;
  width: number;
  height: number;
  videoUrl?: string; // for type: "video" — YouTube/Vimeo embed or self-hosted path
}

export interface WayToHelp {
  key: "donate" | "volunteer" | "partner" | "majorDonor" | "corporateSponsorship";
  title: string;
  description: string;
  ctaLabel: string;
  href: string;
  icon?: string;
}

export interface TimelineStep {
  id: string;
  date: string; // e.g. "2021" or "Phase 1 — Q1 2021"
  title: string;
  description: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}
