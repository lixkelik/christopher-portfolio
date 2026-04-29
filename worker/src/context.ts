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
import achievementsData from "../../src/data/achievements.json";
import certificationsData from "../../src/data/certifications.json";
import educationData from "../../src/data/education.json";
import toolkitData from "../../src/data/toolkit.json";

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

// Slimmed achievement shape — drops images/links; keeps only what the LLM
// needs to answer "what has Christopher won / been certified in" questions.
type Achievement = {
  title: string;
  issuer: string;
  year: number;
  category: string;
  summary: string;
  tags?: string[];
};

// Slimmed certification shape — drops image path; keeps just the facts.
type Certification = {
  title: string;
  issuer: string;
  year: number;
  tags?: string[];
};

type Education = {
  school: string;
  degree: string;
  major: string;
  startYear: number;
  endYear: number;
  honors?: string;
  gpa?: number;
  gpaScale?: number;
  publication?: { title: string; venue: string; url: string };
  highlights?: string[];
};

type ToolkitData = {
  categories: { id: string; label: string; items: { name: string }[] }[];
};

const profile = profileData as Profile;
const experiences = experiencesData as Experience[];
const projects = projectsData as Project[];
const skillGroups = skillsData as SkillGroup[];
const achievements = achievementsData as Achievement[];
const certifications = certificationsData as Certification[];
const education = educationData as Education;
const toolkit = (toolkitData as ToolkitData).categories;

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
    // [LEAN] Cap to top 3 achievements to keep context lean.
    // For richer context (all bullets + an "Achievements:" header), comment
    // out the line below and uncomment the block beneath it.
    if (e.achievements?.length) {
      e.achievements.slice(0, 3).forEach((a) => push(`- ${a}`));
    }
    // --- RICHER CONTEXT (uncomment to use, then comment out the line above) ---
    // if (e.achievements?.length) {
    //   push("Achievements:");
    //   e.achievements.forEach((a) => push(`- ${a}`));
    // }
    // --------------------------------------------------------------------------
    if (e.techStack?.length) push(`Tech: ${e.techStack.join(", ")}`);
    blank();
  });

  push("## Projects");
  projects.forEach((p) => {
    const meta = [p.status, p.role, p.timeline].filter(Boolean).join(" · ");
    push(`### ${p.title} — ${p.tagline}${meta ? ` (${meta})` : ""}`);
    push(p.summary);
    if (p.features?.length) {
      push("Features:");
      p.features.forEach((f) => push(`- ${f}`));
    }
    if (p.techStack?.length)
      push(`Tech: ${p.techStack.map((t) => t.name).join(", ")}`);
    if (p.metrics?.length)
      push(
        `Metrics: ${p.metrics.map((m) => `${m.label} ${m.value}`).join(", ")}`
      );
    // [LEAN] `problem` and `tags` are omitted to save tokens (they largely
    // duplicate `summary` / `techStack`). Uncomment the block below for the
    // richest possible project context.
    // --- RICHER CONTEXT (uncomment to use) ---
    // if (p.problem) push(`Problem: ${p.problem}`);
    // if (p.tags?.length) push(`Tags: ${p.tags.join(", ")}`);
    // -----------------------------------------
    blank();
  });

  push("## Skills");
  skillGroups.forEach((g) => {
    push(`### ${g.title}`);
    push(g.blurb);
    push(g.skills.map((s) => `${s.name} (${s.tier})`).join(", "));
    blank();
  });

  // [LEAN] Compact one-liner format — full narratives live on the site itself.
  // For richer context (per-achievement summary paragraphs), comment out the
  // block below and uncomment the block beneath it.
  push(`## Achievements (${achievements.length} total)`);
  achievements.forEach((a) => {
    push(`- ${a.title} — ${a.issuer} (${a.year}) [${a.category}]`);
  });
  blank();
  // --- RICHER CONTEXT (uncomment to use, then comment out the block above) ---
  // push(`## Achievements (${achievements.length} total)`);
  // achievements.forEach((a) => {
  //   push(`### ${a.title} — ${a.issuer} (${a.year})`);
  //   push(`Category: ${a.category}`);
  //   push(a.summary);
  //   blank();
  // });
  // ---------------------------------------------------------------------------

  push(`## Certifications (${certifications.length} total)`);
  certifications.forEach((c) => {
    const tags = c.tags?.length ? ` [${c.tags.join(", ")}]` : "";
    push(`- ${c.title} — ${c.issuer} (${c.year})${tags}`);
  });
  blank();

  push(`## Education`);
  push(
    `${education.degree} — ${education.school} (${education.startYear}–${education.endYear})`
  );
  push(`Major: ${education.major}`);
  if (education.honors) push(`Honors: ${education.honors}`);
  if (typeof education.gpa === "number")
    push(
      `GPA: ${education.gpa}${education.gpaScale ? ` / ${education.gpaScale}` : ""}`
    );
  if (education.publication?.url) {
    push(
      `Publication: "${education.publication.title}" — ${education.publication.venue} (${education.publication.url})`
    );
  }
  if (education.highlights?.length) {
    push("Highlights:");
    education.highlights.forEach((h) => push(`- ${h}`));
  }
  blank();

  push(`## Daily Toolkit`);
  toolkit.forEach((cat) => {
    push(`- ${cat.label}: ${cat.items.map((i) => i.name).join(", ")}`);
  });
  blank();

  return lines.join("\n").trim();
};

export const PORTFOLIO_CONTEXT = buildMarkdown();
