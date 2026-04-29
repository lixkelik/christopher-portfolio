export type ProjectStatus = "Live" | "In Progress" | "Archived" | "Concept";

export type GalleryImage = {
  src: string;
  caption?: string;
  /** Optional aspect hint, e.g. "portrait" | "landscape" | "square" */
  aspect?: "portrait" | "landscape" | "square";
};

export type ProjectLinks = {
  demo?: string;
  github?: string;
  appStore?: string;
  playStore?: string;
  figma?: string;
  caseStudy?: string;
  paper?: string;
};

export type TechItem = {
  name: string;
  /** Optional simple-icons slug (e.g. "flutter", "firebase") */
  icon?: string;
};

export type ProjectMetric = {
  label: string;
  value: string;
};

export type Project = {
  /** URL-safe slug, also used as React key. */
  id: string;
  title: string;
  /** Short one-liner shown beside title. */
  tagline: string;
  /** 1–2 sentence blurb shown on the card. */
  summary: string;
  /** Card cover image (path relative to /public, e.g. "projects/aura.webp"). */
  cover: string;
  /** Detail page gallery. Include the cover here too if you want it in the gallery. */
  gallery: GalleryImage[];
  tags: string[];
  category?: string;
  role?: string;
  timeline?: string;
  team?: string;
  /** Long-form description / problem statement. Plain text, supports newlines. */
  problem?: string;
  features?: string[];
  techStack?: TechItem[];
  learnings?: string[];
  links?: ProjectLinks;
  status?: ProjectStatus;
  featured?: boolean;
  /** Optional embedded video (YouTube/Vimeo URL). */
  videoUrl?: string;
  metrics?: ProjectMetric[];
};
