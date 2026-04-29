import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(...inputs));
}

/**
 * Resolve a public asset path to a URL that works under any Vite `base`.
 *
 * Accepts paths like "projects/aura.webp" or "/projects/aura.png" and
 * prefixes Vite's BASE_URL so deployments under a sub-path
 * (e.g. GitHub Pages /christopher-portfolio/) keep working.
 */
export function assetUrl(path: string): string {
  if (!path) return path;
  if (/^(?:[a-z]+:)?\/\//i.test(path) || path.startsWith("data:")) return path;
  const base = import.meta.env.BASE_URL || "/";
  const cleanBase = base.endsWith("/") ? base : `${base}/`;
  const cleanPath = path.replace(/^\/+/, "");
  return `${cleanBase}${cleanPath}`;
}

/**
 * Parse "owner/repo" out of a GitHub URL.
 */
export function parseGithubRepo(url?: string): { owner: string; repo: string } | null {
  if (!url) return null;
  const m = url.match(/github\.com\/([^/]+)\/([^/?#]+)/i);
  if (!m) return null;
  return { owner: m[1], repo: m[2].replace(/\.git$/, "") };
}
