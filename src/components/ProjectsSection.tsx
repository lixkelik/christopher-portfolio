import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  Calendar,
  ExternalLink,
  Github,
  Images,
  Search,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { allTags, projects } from "../data/projects";
import type { Project, ProjectStatus } from "../data/types";
import { assetUrl, cn } from "../lib/utils";

const STATUS_DOT: Record<ProjectStatus, string> = {
  Live: "bg-emerald-500",
  "In Progress": "bg-amber-500",
  Concept: "bg-sky-500",
  Archived: "bg-zinc-500",
};

export const ProjectsSection = () => {
  const [query, setQuery] = useState("");
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const tags = useMemo(() => allTags(), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter((p) => {
      const matchesQuery =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q));
      const matchesTags =
        activeTags.length === 0 || activeTags.some((t) => p.tags.includes(t));
      return matchesQuery && matchesTags;
    });
  }, [query, activeTags]);

  const isFiltering = activeTags.length > 0 || query.trim().length > 0;

  // Promote one "hero" project to a wide card — first featured (or first
  // overall) — only when not actively filtering, so filtered results stay
  // predictable.
  const { hero, rest } = useMemo(() => {
    if (isFiltering || filtered.length === 0) {
      return { hero: null as Project | null, rest: filtered };
    }
    const heroIdx = filtered.findIndex((p) => p.featured);
    const idx = heroIdx === -1 ? 0 : heroIdx;
    return {
      hero: filtered[idx],
      rest: filtered.filter((_, i) => i !== idx),
    };
  }, [filtered, isFiltering]);

  const toggleTag = (tag: string) =>
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );

  const reset = () => {
    setQuery("");
    setActiveTags([]);
  };

  return (
    <section id="projects" className="py-24 px-4 relative">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
          Featured <span className="text-primary">Projects</span>
        </h2>
        <p className="text-center text-foreground/70 mb-10 max-w-2xl mx-auto">
          Hand-picked work showing how I think and ship. Tap any card for the
          full case study.
        </p>

        {/* Filter bar */}
        <div className="flex flex-col gap-4 mb-10">
          <div className="relative max-w-md mx-auto w-full">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, tag, or keyword…"
              aria-label="Search projects"
              className="w-full pl-9 pr-9 py-2 rounded-full border border-border bg-card/40 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-foreground"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {tags.map((tag) => {
              const active = activeTags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={cn(
                    "px-3 py-1 text-xs font-medium border rounded-full transition",
                    active
                      ? "bg-primary text-primary-foreground border-primary shadow-[0_0_10px_rgba(139,92,246,0.5)]"
                      : "bg-card/40 hover:bg-card border-border"
                  )}
                >
                  {tag}
                </button>
              );
            })}
            {isFiltering && (
              <button
                onClick={reset}
                className="px-3 py-1 text-xs font-medium border border-dashed rounded-full hover:bg-card transition"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Hero project (only when not filtering) */}
        {hero && (
          <div className="mb-8">
            <HeroCard project={hero} />
          </div>
        )}

        {/* Standard grid */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <AnimatePresence mode="popLayout">
            {rest.map((project, i) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10, scale: 0.97 }}
                transition={{
                  duration: 0.45,
                  delay: i * 0.05,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <ProjectCard project={project} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty state with tag suggestions */}
        {filtered.length === 0 && (
          <div className="text-center mt-12 space-y-4">
            <p className="text-foreground/70">No projects match your filter.</p>
            <div className="flex flex-wrap justify-center gap-2">
              <span className="text-xs text-foreground/50 self-center mr-1">
                Try:
              </span>
              {tags.slice(0, 5).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setQuery("");
                    setActiveTags([t]);
                  }}
                  className="px-3 py-1 text-xs font-medium border rounded-full bg-card/40 hover:bg-card transition"
                >
                  {t}
                </button>
              ))}
              <button
                onClick={reset}
                className="px-3 py-1 text-xs font-medium border border-dashed rounded-full hover:bg-card transition"
              >
                Reset all
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

/* ------------------------- Hero (wide) card ------------------------- */
const HeroCard = ({ project }: { project: Project }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        to={`/projects/${project.id}`}
        className="group grid md:grid-cols-2 rounded-2xl overflow-hidden border border-border bg-card/70 backdrop-blur-sm hover:border-primary/50 hover:shadow-[0_0_30px_hsl(var(--primary)/0.2)] transition text-left"
      >
        <div className="relative aspect-[16/10] md:aspect-auto md:min-h-[320px] overflow-hidden">
          <CoverImage
            src={project.cover}
            alt={project.title}
            layoutId={`project-cover-${project.id}`}
          />
          <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-primary text-primary-foreground shadow-md">
            <Sparkles size={12} /> Featured
          </span>
          {project.gallery.length > 1 && (
            <span className="absolute top-4 right-4 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-black/60 text-white backdrop-blur-sm">
              <Images size={12} />
              {project.gallery.length}
            </span>
          )}
        </div>

        <div className="p-6 md:p-8 flex flex-col">
          {project.status && <StatusPill status={project.status} />}

          <h3 className="text-2xl md:text-3xl font-semibold mt-3 mb-2 group-hover:text-primary transition-colors">
            {project.title}
          </h3>
          {project.tagline && (
            <p className="text-foreground/65 text-sm md:text-base mb-4">
              {project.tagline}
            </p>
          )}

          <p className="text-foreground/80 text-sm md:text-[0.95rem] leading-relaxed line-clamp-4 mb-5">
            {project.summary}
          </p>

          <MetaRow project={project} />

          {project.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {project.tags.slice(0, 5).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 text-xs font-medium border rounded-full bg-card/60"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="mt-auto pt-6 flex items-center justify-between">
            <span className="text-sm text-primary font-medium inline-flex items-center gap-1.5">
              Read case study
              <ArrowRight
                size={14}
                className="group-hover:translate-x-1 transition-transform"
              />
            </span>
            <CardLinks project={project} />
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

/* --------------------------- Standard card --------------------------- */
const ProjectCard = ({ project }: { project: Project }) => {
  return (
    <Link
      to={`/projects/${project.id}`}
      className="group bg-card/70 backdrop-blur-sm rounded-2xl overflow-hidden border border-border hover:border-primary/50 hover:shadow-[0_0_20px_hsl(var(--primary)/0.18)] transition h-full text-left flex flex-col"
    >
      <div className="relative h-48 overflow-hidden">
        <CoverImage
          src={project.cover}
          alt={project.title}
          layoutId={`project-cover-${project.id}`}
          className="group-hover:scale-105 transition-transform duration-500"
        />
        {project.gallery.length > 1 && (
          <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-black/60 text-white backdrop-blur-sm">
            <Images size={12} />
            {project.gallery.length}
          </span>
        )}
        {project.featured && (
          <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-primary text-primary-foreground">
            <Sparkles size={11} /> Featured
          </span>
        )}
      </div>
      <div className="p-5 flex flex-col flex-1">
        {project.status && <StatusPill status={project.status} />}

        <h3 className="text-lg font-semibold mt-2 mb-1 group-hover:text-primary transition-colors">
          {project.title}
        </h3>
        <p className="text-foreground/70 text-sm mb-3 line-clamp-2">
          {project.summary}
        </p>

        <MetaRow project={project} compact />

        {project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {project.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-[11px] font-medium border rounded-full bg-card/60"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto pt-4 flex justify-between items-center">
          <span className="text-xs text-primary font-medium inline-flex items-center gap-1">
            View case study
            <ArrowRight
              size={12}
              className="group-hover:translate-x-1 transition-transform"
            />
          </span>
          <CardLinks project={project} />
        </div>
      </div>
    </Link>
  );
};

/* ----------------------------- Shared bits ----------------------------- */
const StatusPill = ({ status }: { status: ProjectStatus }) => (
  <span className="inline-flex self-start items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border border-border bg-background/60">
    <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_DOT[status])} />
    {status}
  </span>
);

const MetaRow = ({
  project,
  compact,
}: {
  project: Project;
  compact?: boolean;
}) => {
  if (!project.role && !project.timeline) return null;
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-3 gap-y-1 text-foreground/60",
        compact ? "text-[11px]" : "text-xs"
      )}
    >
      {project.role && (
        <span className="inline-flex items-center gap-1">
          <User size={compact ? 11 : 12} />
          {project.role}
        </span>
      )}
      {project.timeline && (
        <span className="inline-flex items-center gap-1">
          <Calendar size={compact ? 11 : 12} />
          {project.timeline}
        </span>
      )}
    </div>
  );
};

const CardLinks = ({ project }: { project: Project }) => (
  <div className="flex space-x-3">
    {project.links?.demo && (
      <a
        href={project.links.demo}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="text-foreground/70 hover:text-primary transition-colors"
        aria-label="Live demo"
      >
        <ExternalLink size={16} />
      </a>
    )}
    {project.links?.github && (
      <a
        href={project.links.github}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="text-foreground/70 hover:text-primary transition-colors"
        aria-label="Source code"
      >
        <Github size={16} />
      </a>
    )}
  </div>
);

/* --------------------- Cover image with skeleton --------------------- */
const CoverImage = ({
  src,
  alt,
  layoutId,
  className,
}: {
  src: string;
  alt: string;
  layoutId?: string;
  className?: string;
}) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <>
      <div
        aria-hidden="true"
        className={cn(
          "absolute inset-0 bg-gradient-to-br from-card via-muted/40 to-card animate-pulse",
          loaded && "opacity-0 transition-opacity duration-500"
        )}
      />
      <motion.img
        layoutId={layoutId}
        src={assetUrl(src)}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={cn(
          "w-full h-full object-cover",
          !loaded && "opacity-0",
          loaded && "opacity-100 transition-opacity duration-500",
          className
        )}
      />
    </>
  );
};
