import profileData from "./profile.json";
import experiencesData from "./experiences.json";

export type SocialIcon = "linkedin" | "github" | "mail" | "twitter";

export type Profile = {
  name: string;
  shortName: string;
  location: string;
  headline: string;
  rotatingRoles: string[];
  bio: string;
  availability?: { status: "open" | "freelance" | "closed"; label: string };
  stats: { label: string; value: number; suffix?: string }[];
  social: { label: string; icon: SocialIcon; href: string }[];
  techMarquee: string[];
  resumeUrl?: string;
  portfolioUrl?: string;
  phone?: string;
  timezone?: string;
  calendarUrl?: string;
  photo?: string;
};

export type Experience = {
  id: string;
  company: string;
  role: string;
  type: string;
  location?: string;
  /** ISO month "YYYY-MM" */
  startDate: string;
  /** ISO month "YYYY-MM" or null for present */
  endDate: string | null;
  logo?: string;
  website?: string;
  summary: string;
  companyProfile?: string;
  achievements?: string[];
  techStack?: string[];
};

export const profile: Profile = profileData as Profile;
export const experiences: Experience[] = experiencesData as Experience[];

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export const formatMonth = (iso: string): string => {
  const [y, m] = iso.split("-").map(Number);
  return `${MONTHS[m - 1]} ${y}`;
};

export const formatRange = (start: string, end: string | null): string => {
  return `${formatMonth(start)} — ${end ? formatMonth(end) : "Present"}`;
};

export const durationLabel = (start: string, end: string | null): string => {
  const [sy, sm] = start.split("-").map(Number);
  const e = end ? end.split("-").map(Number) : (() => {
    const d = new Date();
    return [d.getFullYear(), d.getMonth() + 1];
  })();
  const months = (e[0] - sy) * 12 + (e[1] - sm) + 1;
  if (months < 12) return `${months} mo${months === 1 ? "" : "s"}`;
  const yrs = Math.floor(months / 12);
  const rem = months % 12;
  return rem === 0
    ? `${yrs} yr${yrs === 1 ? "" : "s"}`
    : `${yrs} yr${yrs === 1 ? "" : "s"} ${rem} mo`;
};
