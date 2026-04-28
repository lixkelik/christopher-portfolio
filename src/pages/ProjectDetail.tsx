import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { AnimatePresence, motion, useScroll, useSpring } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Github,
  FileText,
  Figma,
  Smartphone,
  Calendar,
  Users,
  Briefcase,
  Tag,
  PlayCircle,
} from "lucide-react";
import Lightbox from "yet-another-react-lightbox";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import { getNeighbors, getProjectById } from "../data/projects";
import { assetUrl } from "../lib/utils";
import { Background } from "../components/Background";
import { ThemeToggle } from "../components/ThemeToggle";
import { Footer } from "../components/Footer";
import { GithubStars } from "../components/ui/GithubStars";

const STATUS_COLORS: Record<string, string> = {
  Live: "bg-green-500/15 text-green-400 border-green-500/30",
  "In Progress": "bg-amber-500/15 text-amber-400 border-amber-500/30",
  Archived: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
  Concept: "bg-blue-500/15 text-blue-400 border-blue-500/30",
};

export const ProjectDetail = () => {
  const { slug = "" } = useParams<{ slug: string }>();
  const project = getProjectById(slug);

  // Reading-progress bar
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.2,
  });

  const [lbOpen, setLbOpen] = useState(false);
  const [lbIndex, setLbIndex] = useState(0);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    document.title = project ? `${project.title} — Christopher Felix` : "Project";
  }, [slug, project]);

  const slides = useMemo(
    () =>
      (project?.gallery ?? []).map((g) => ({
        src: assetUrl(g.src),
        title: g.caption,
      })),
    [project]
  );

  if (!project) return <Navigate to="/404" replace />;

  const { prev, next } = getNeighbors(project.id);
  const status = project.status ?? "Live";
  const statusClass = STATUS_COLORS[status] ?? STATUS_COLORS.Live;

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <div className="fixed top-2 right-4 z-50">
        <ThemeToggle />
      </div>
      <Background />

      {/* Reading progress bar */}
      <motion.div
        style={{ scaleX: progress }}
        className="fixed top-0 left-0 right-0 h-[3px] bg-primary origin-left z-50"
      />

      {/* Sticky back nav */}
      <div className="fixed top-4 left-4 z-40">
        <Link
          to="/#projects"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/70 backdrop-blur-md border border-border hover:bg-card transition shadow-sm"
        >
          <ArrowLeft size={16} /> Projects
        </Link>
      </div>

      <main className="pt-20 pb-24 px-4">
        <article className="container mx-auto max-w-5xl text-left">
          {/* HERO */}
          <section className="grid gap-10 md:grid-cols-2 items-center mb-16">
            <motion.div
              layoutId={`project-cover-${project.id}`}
              className="rounded-2xl overflow-hidden border border-border shadow-2xl bg-card"
            >
              <button
                onClick={() => {
                  setLbIndex(0);
                  setLbOpen(true);
                }}
                className="block w-full"
                aria-label="Open gallery"
              >
                <img
                  src={assetUrl(project.cover)}
                  alt={project.title}
                  className="w-full h-full object-cover aspect-[4/3]"
                />
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex flex-col gap-4"
            >
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`px-2 py-1 text-xs font-medium border rounded-full ${statusClass}`}
                >
                  {status}
                </span>
                {project.category && (
                  <span className="px-2 py-1 text-xs font-medium border rounded-full bg-card/60">
                    <Tag size={12} className="inline mr-1" />
                    {project.category}
                  </span>
                )}
                <GithubStars githubUrl={project.links?.github} />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                {project.title}
              </h1>
              <p className="text-lg text-foreground/70">{project.tagline}</p>

              <div className="flex flex-wrap gap-2 mt-2">
                {project.tags.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-1 text-xs font-medium border rounded-full bg-card/40"
                  >
                    {t}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap gap-3 mt-4">
                {project.links?.demo && (
                  <a
                    href={project.links.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cosmic-button inline-flex items-center gap-2"
                  >
                    <ExternalLink size={16} /> Live demo
                  </a>
                )}
                {project.links?.github && (
                  <a
                    href={project.links.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2 rounded-full border border-border hover:bg-card transition inline-flex items-center gap-2"
                  >
                    <Github size={16} /> Source
                  </a>
                )}
                {project.links?.figma && (
                  <a
                    href={project.links.figma}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2 rounded-full border border-border hover:bg-card transition inline-flex items-center gap-2"
                  >
                    <Figma size={16} /> Figma
                  </a>
                )}
                {project.links?.appStore && (
                  <a
                    href={project.links.appStore}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2 rounded-full border border-border hover:bg-card transition inline-flex items-center gap-2"
                  >
                    <Smartphone size={16} /> App Store
                  </a>
                )}
                {project.links?.playStore && (
                  <a
                    href={project.links.playStore}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2 rounded-full border border-border hover:bg-card transition inline-flex items-center gap-2"
                  >
                    <Smartphone size={16} /> Play Store
                  </a>
                )}
                {project.links?.paper && (
                  <a
                    href={project.links.paper}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2 rounded-full border border-border hover:bg-card transition inline-flex items-center gap-2"
                  >
                    <FileText size={16} /> Paper
                  </a>
                )}
              </div>
            </motion.div>
          </section>

          {/* META STRIP */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-16">
            <MetaCard icon={<Briefcase size={16} />} label="Role" value={project.role} />
            <MetaCard icon={<Calendar size={16} />} label="Timeline" value={project.timeline} />
            <MetaCard icon={<Users size={16} />} label="Team" value={project.team} />
            <MetaCard icon={<Tag size={16} />} label="Category" value={project.category} />
          </section>

          {/* PROBLEM */}
          {project.problem && (
            <Section title="Overview">
              <div className="prose-like text-foreground/80 leading-relaxed whitespace-pre-line">
                {project.problem}
              </div>
            </Section>
          )}

          {/* METRICS */}
          {project.metrics && project.metrics.length > 0 && (
            <Section title="Impact">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {project.metrics.map((m) => (
                  <div
                    key={m.label}
                    className="p-5 rounded-xl border border-border bg-card/60 text-center"
                  >
                    <div className="text-3xl font-bold text-primary text-glow">
                      {m.value}
                    </div>
                    <div className="text-xs uppercase tracking-wide text-foreground/60 mt-1">
                      {m.label}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* FEATURES */}
          {project.features && project.features.length > 0 && (
            <Section title="Key features">
              <ul className="grid md:grid-cols-2 gap-3">
                {project.features.map((f) => (
                  <li
                    key={f}
                    className="flex gap-3 p-4 rounded-xl border border-border bg-card/40"
                  >
                    <span className="mt-1 inline-block w-2 h-2 rounded-full bg-primary shrink-0" />
                    <span className="text-foreground/85">{f}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* TECH STACK */}
          {project.techStack && project.techStack.length > 0 && (
            <Section title="Tech stack">
              <div className="flex flex-wrap gap-2">
                {project.techStack.map((t) => (
                  <span
                    key={t.name}
                    className="px-3 py-1.5 text-sm border rounded-full bg-card/60"
                  >
                    {t.name}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {/* GALLERY */}
          {project.gallery.length > 0 && (
            <Section title="Gallery">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {project.gallery.map((g, i) => (
                  <motion.button
                    key={g.src}
                    onClick={() => {
                      setLbIndex(i);
                      setLbOpen(true);
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="overflow-hidden rounded-xl border border-border bg-card"
                  >
                    <img
                      src={assetUrl(g.src)}
                      alt={g.caption ?? `${project.title} screenshot ${i + 1}`}
                      className="w-full h-44 object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </motion.button>
                ))}
              </div>
            </Section>
          )}

          {/* VIDEO */}
          {project.videoUrl && (
            <Section title="Walkthrough">
              <div className="aspect-video rounded-xl overflow-hidden border border-border bg-black/40">
                <iframe
                  src={toEmbed(project.videoUrl)}
                  title={`${project.title} video`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            </Section>
          )}

          {/* LEARNINGS */}
          {project.learnings && project.learnings.length > 0 && (
            <Section title="What I learned">
              <ul className="space-y-3">
                {project.learnings.map((l) => (
                  <li
                    key={l}
                    className="flex gap-3 p-4 rounded-xl border border-border bg-card/40"
                  >
                    <PlayCircle size={18} className="text-primary mt-0.5 shrink-0" />
                    <span className="text-foreground/85">{l}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* PREV / NEXT */}
          <nav className="mt-20 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {prev ? (
              <Link
                to={`/projects/${prev.id}`}
                className="group p-5 rounded-xl border border-border hover:border-primary bg-card/40 transition"
              >
                <div className="text-xs uppercase tracking-wide text-foreground/60 mb-1">
                  ← Previous
                </div>
                <div className="font-semibold group-hover:text-primary">
                  {prev.title}
                </div>
              </Link>
            ) : (
              <div />
            )}
            {next ? (
              <Link
                to={`/projects/${next.id}`}
                className="group p-5 rounded-xl border border-border hover:border-primary bg-card/40 transition text-right"
              >
                <div className="text-xs uppercase tracking-wide text-foreground/60 mb-1">
                  Next →
                </div>
                <div className="font-semibold group-hover:text-primary">
                  {next.title}
                </div>
              </Link>
            ) : (
              <Link
                to="/#projects"
                className="group p-5 rounded-xl border border-border hover:border-primary bg-card/40 transition text-right inline-flex items-center justify-end gap-2"
              >
                All projects <ArrowRight size={16} />
              </Link>
            )}
          </nav>
        </article>
      </main>

      <Footer />

      <AnimatePresence>
        {lbOpen && (
          <Lightbox
            open={lbOpen}
            close={() => setLbOpen(false)}
            index={lbIndex}
            slides={slides}
            plugins={[Thumbnails]}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const MetaCard = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
}) => (
  <div className="p-4 rounded-xl border border-border bg-card/40">
    <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-foreground/60">
      {icon}
      {label}
    </div>
    <div className="mt-1 font-medium text-foreground/90">{value ?? "—"}</div>
  </div>
);

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <motion.section
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-10% 0px" }}
    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    className="mb-14"
  >
    <h2 className="text-2xl md:text-3xl font-bold mb-5">
      <span className="text-primary">#</span> {title}
    </h2>
    {children}
  </motion.section>
);

function toEmbed(url: string): string {
  // YouTube watch → embed
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  // Vimeo
  const vm = url.match(/vimeo\.com\/(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  return url;
}
