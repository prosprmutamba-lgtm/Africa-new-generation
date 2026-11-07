import type { GalleryItem } from "@/types/content";

/**
 * ────────────────────────────────────────────────────────────
 * GALLERY CONFIGURATION
 * ────────────────────────────────────────────────────────────
 * Every photo and video shown on the Gallery page and the Home page
 * gallery preview. `alt` text is written directly here (rather than in
 * locales/*.json) since each entry is a one-off caption tied to a
 * specific placeholder image, not reusable UI copy — update the caption
 * whenever you replace the underlying image.
 *
 * To add a new photo:  add an object with a unique id, category, and the
 *   image path under /public/images/gallery/photos/.
 * To add a new video:  same, but type: "video", plus a thumbnail image
 *   and a videoUrl (YouTube/Vimeo embed URL).
 * To remove an item:   delete its object below.
 *
 * Dimensions must match the actual image file so Next/Image (and the
 * masonry layout) size correctly without layout shift — if you replace
 * an image with different dimensions, update width/height here too.
 * ────────────────────────────────────────────────────────────
 */

export const galleryItems: GalleryItem[] = [
  { id: "g-edu-1", type: "photo", category: "education", src: "/images/gallery/photos/education-01.jpg", alt: "Children in a classroom setting", width: 800, height: 1000 },
  { id: "g-edu-2", type: "photo", category: "education", src: "/images/gallery/photos/education-02.jpg", alt: "Students during a learning activity", width: 800, height: 800 },
  { id: "g-edu-3", type: "photo", category: "education", src: "/images/gallery/photos/education-03.jpg", alt: "A teacher supporting a student", width: 800, height: 700 },

  { id: "g-health-1", type: "photo", category: "health", src: "/images/gallery/photos/health-01.jpg", alt: "Community health outreach session", width: 800, height: 1100 },
  { id: "g-health-2", type: "photo", category: "health", src: "/images/gallery/photos/health-02.jpg", alt: "Health education session for families", width: 800, height: 650 },
  { id: "g-health-3", type: "photo", category: "health", src: "/images/gallery/photos/health-03.jpg", alt: "Maternal health support visit", width: 800, height: 600 },

  { id: "g-live-1", type: "photo", category: "livelihood", src: "/images/gallery/photos/livelihood-01.jpg", alt: "Vocational training session", width: 800, height: 1000 },
  { id: "g-live-2", type: "photo", category: "livelihood", src: "/images/gallery/photos/livelihood-02.jpg", alt: "A small business supported by the livelihood program", width: 800, height: 800 },
  { id: "g-live-3", type: "photo", category: "livelihood", src: "/images/gallery/photos/livelihood-03.jpg", alt: "Community members at a skills workshop", width: 800, height: 700 },

  { id: "g-comm-1", type: "photo", category: "community", src: "/images/gallery/photos/community-01.jpg", alt: "Community gathering in the settlement", width: 800, height: 1100 },
  { id: "g-comm-2", type: "photo", category: "community", src: "/images/gallery/photos/community-02.jpg", alt: "Families gathered for a community event", width: 800, height: 650 },
  { id: "g-comm-3", type: "photo", category: "community", src: "/images/gallery/photos/community-03.jpg", alt: "Community leaders in discussion", width: 800, height: 600 },

  { id: "g-youth-1", type: "photo", category: "youth", src: "/images/gallery/photos/youth-01.jpg", alt: "Youth mentorship session", width: 800, height: 1000 },
  { id: "g-youth-2", type: "photo", category: "youth", src: "/images/gallery/photos/youth-02.jpg", alt: "Young people in a leadership workshop", width: 800, height: 800 },
  { id: "g-youth-3", type: "photo", category: "youth", src: "/images/gallery/photos/youth-03.jpg", alt: "Youth group activity", width: 800, height: 700 },

  { id: "g-agri-1", type: "photo", category: "agriculture", src: "/images/gallery/photos/agriculture-01.jpg", alt: "Community members working a small farm plot", width: 800, height: 1100 },
  { id: "g-agri-2", type: "photo", category: "agriculture", src: "/images/gallery/photos/agriculture-02.jpg", alt: "Sustainable farming training session", width: 800, height: 650 },
  { id: "g-agri-3", type: "photo", category: "agriculture", src: "/images/gallery/photos/agriculture-03.jpg", alt: "Harvest from a household farming plot", width: 800, height: 600 },

  {
    id: "g-video-1",
    type: "video",
    category: "community",
    src: "/images/gallery/videos-thumbnails/video-01.jpg",
    thumbnail: "/images/gallery/videos-thumbnails/video-01.jpg",
    alt: "Video: A day in Kyaka II Settlement",
    width: 800,
    height: 450,
    videoUrl: "https://www.youtube.com/embed/REPLACE_WITH_VIDEO_ID",
  },
  {
    id: "g-video-2",
    type: "video",
    category: "education",
    src: "/images/gallery/videos-thumbnails/video-02.jpg",
    thumbnail: "/images/gallery/videos-thumbnails/video-02.jpg",
    alt: "Video: Inside our Education program",
    width: 800,
    height: 450,
    videoUrl: "https://www.youtube.com/embed/REPLACE_WITH_VIDEO_ID",
  },
  {
    id: "g-video-3",
    type: "video",
    category: "livelihood",
    src: "/images/gallery/videos-thumbnails/video-03.jpg",
    thumbnail: "/images/gallery/videos-thumbnails/video-03.jpg",
    alt: "Video: Meet a Livelihood program graduate",
    width: 800,
    height: 450,
    videoUrl: "https://www.youtube.com/embed/REPLACE_WITH_VIDEO_ID",
  },
];
