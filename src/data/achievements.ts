import achievementsData from "./achievements.json";

export type AchievementImage = {
  src: string;
  caption?: string;
};

export type Achievement = {
  /** URL-safe slug, also used as React key. */
  id: string;
  title: string;
  /** Awarding body / institution. */
  issuer: string;
  year: number;
  /** e.g. "Competition", "Certification", "Award", "Scholarship" */
  category: string;
  summary: string;
  tags?: string[];
  /** 1–3 images. First is the "front" card; the others fan out behind. */
  images: AchievementImage[];
  /** Optional verification / details URL. */
  link?: string;
};

export const achievements: Achievement[] = achievementsData as Achievement[];

export const achievementsCount = (): number => achievements.length;
