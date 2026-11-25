/**
 * PROGRAMS CONFIGURATION
 * Images are served from /images/programs/<slug>/.
 */

export interface ProgramConfigItem {
  slug: string;
  key: string;
  hasDedicatedPage: boolean;
  image?: string;
}

export const programs: ProgramConfigItem[] = [
  {
    slug: "child-protection",
    key: "childProtection",
    hasDedicatedPage: true,
    image: "/images/programs/child-protection/hero.jpg",
  },
  {
    slug: "women-empowerment",
    key: "womenEmpowerment",
    hasDedicatedPage: true,
    image: "/images/programs/women-empowerment/hero.jpg",
  },
  {
    slug: "disability-inclusion",
    key: "disabilityInclusion",
    hasDedicatedPage: true,
    image: "/images/programs/disability-inclusion/hero.jpg",
  },
  {
    slug: "youth-development",
    key: "youthDevelopment",
    hasDedicatedPage: false,
    image: "/images/programs/youth-development/hero.jpg",
  },
  {
    slug: "education",
    key: "education",
    hasDedicatedPage: false,
    image: "/images/programs/education/hero.jpg",
  },
  {
    slug: "health",
    key: "health",
    hasDedicatedPage: false,
  },
  {
    slug: "livelihood",
    key: "livelihood",
    hasDedicatedPage: false,
    image: "/images/programs/livelihood/hero.jpg",
  },
  {
    slug: "agriculture",
    key: "agriculture",
    hasDedicatedPage: false,
    image: "/images/programs/agriculture/hero.jpg",
  },
  {
    slug: "climate-action",
    key: "climateAction",
    hasDedicatedPage: false,
    image: "/images/programs/climate-action/hero.jpg",
  },
];