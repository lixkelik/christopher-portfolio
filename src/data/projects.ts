import projectsData from "./projects.json";
import type { Project } from "./types";

export type { Project } from "./types";

export const projects: Project[] = projectsData as Project[];

export const getProjectById = (id: string): Project | undefined =>
  projects.find((p) => p.id === id);

export const allTags = (): string[] =>
  Array.from(new Set(projects.flatMap((p) => p.tags))).sort();

export const getNeighbors = (id: string): { prev?: Project; next?: Project } => {
  const idx = projects.findIndex((p) => p.id === id);
  if (idx === -1) return {};
  return {
    prev: idx > 0 ? projects[idx - 1] : undefined,
    next: idx < projects.length - 1 ? projects[idx + 1] : undefined,
  };
};
