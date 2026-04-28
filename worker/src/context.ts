/**
 * Builds the Markdown portfolio context bundled INTO the worker.
 *
 * The JSON files are imported from src/data/ at build time — wrangler/esbuild
 * inlines them so the worker carries its own copy. The browser no longer
 * needs to send the knowledge base on every request.
 *
 * Whenever you edit profile/experiences/projects/skills JSON, run:
 *   cd worker && npx wrangler deploy
 */

import profileData from "../../src/data/profile.json";
import experiencesData from "../../src/data/experiences.json";
import projectsData from "../../src/data/projects.json";
import skillsData from "../../src/data/skills.json";

type Social = { label: string; icon: string; href: string };
type Profile = {
  name: string;
  location: string;
  headline: string;
  rotatingRoles: string[];
  bio: string;
  availability?: { label: string };
  timezone?: string;
  portfolioUrl?: string;
  social: Social[];
};

type Experience = {
  company: string;
  role: string;
  type: string;
  location?: string;
  startDate: string;
  endDate: string | null;
  summary: string;
  achievements?: string[];
  techStack?: string[];
};

type Project = {
  title: string;
  tagline: string;
  summary: string;
  status?: string;
  role?: string;
  timeline?: string;
  problem?: string;
  features?: string[];
  techStack?: { name: string }[];
  tags?: string[];
  metrics?: { label: string; value: string }[];
};

type SkillGroup = {
  title: string;
  blurb: string;
  skills: { name: string; tier: string }[];
};

const profile = profileData as Profile;
const experiences = experiencesData as Experience[];
const projects = projectsData as Project[];
const skillGroups = skillsData as SkillGroup[];

const buildMarkdown = (): string => {
  const lines: string[] = [];
  const push = (s: string) => lines.push(s);
  const blank = () => lines.push("");

  push(`# ${profile.name}`);
  push(`${profile.headline} — based in ${profile.location}`);
  if (profile.timezone) push(`Timezone: ${profile.timezone}`);
  if (profile.availability?.label)
    push(`Availability: ${profile.availability.label}`);
  blank();
  push(`Roles: ${profile.rotatingRoles.join(", ")}`);
  blank();
  push(`Bio: ${profile.bio}`);
  blank();

  push("## Contact");
  const email = profile.social
    .find((s) => s.icon === "mail")
    ?.href?.replace(/^mailto:/, "");
  const linkedin = profile.social.find((s) => s.icon === "linkedin")?.href;
  const github = profile.social.find((s) => s.icon === "github")?.href;
  if (email) push(`- Email: ${email}`);
  if (linkedin) push(`- LinkedIn: ${linkedin}`);
  if (github) push(`- GitHub: ${github}`);
  if (profile.portfolioUrl) push(`- Portfolio: ${profile.portfolioUrl}`);
  blank();

  push("## Experience");
  experiences.forEach((e) => {
    const period = `${e.startDate} → ${e.endDate ?? "present"}`;
    push(`### ${e.role} @ ${e.company} (${period})`);
    if (e.type || e.location)
      push([e.type, e.location].filter(Boolean).join(" · "));
    push(e.summary);
    if (e.achievements?.length) {
      push("Achievements:");
      e.achievements.forEach((a) => push(`- ${a}`));
    }
    if (e.techStack?.length) push(`Tech: ${e.techStack.join(", ")}`);
    blank();
  });

  push("## Projects");
  projects.forEach((p) => {
    const meta = [p.status, p.role, p.timeline].filter(Boolean).join(" · ");
    push(`### ${p.title} — ${p.tagline}${meta ? ` (${meta})` : ""}`);
    push(p.summary);
    if (p.problem) push(`Problem: ${p.problem}`);
    if (p.features?.length) {
      push("Features:");
      p.features.forEach((f) => push(`- ${f}`));
    }
    if (p.techStack?.length)
      push(`Tech: ${p.techStack.map((t) => t.name).join(", ")}`);
    if (p.tags?.length) push(`Tags: ${p.tags.join(", ")}`);
    if (p.metrics?.length)
      push(
        `Metrics: ${p.metrics.map((m) => `${m.label} ${m.value}`).join(", ")}`
      );
    blank();
  });

  push("## Skills");
  skillGroups.forEach((g) => {
    push(`### ${g.title}`);
    push(g.blurb);
    push(g.skills.map((s) => `${s.name} (${s.tier})`).join(", "));
    blank();
  });

  return lines.join("\n").trim();
};

export const PORTFOLIO_CONTEXT = buildMarkdown();
