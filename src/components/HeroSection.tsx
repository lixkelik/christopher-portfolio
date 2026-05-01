import { useEffect, useRef, useState } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring } from "motion/react";
import {
  ArrowRight,
  Briefcase,
  Download,
  FileText,
  Github,
  Linkedin,
  Mail,
  MapPin,
  Sparkles,
} from "lucide-react";
import { profile } from "../data/profile";
import { Typewriter } from "./ui/Typewriter";
import { AnimatedCounter } from "./ui/AnimatedCounter";
import { assetUrl } from "../lib/utils";

const ICONS = {
  linkedin: Linkedin,
  github: Github,
  mail: Mail,
} as const;

export const HeroSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(-1000);
  const my = useMotionValue(-1000);
  const sx = useSpring(mx, { stiffness: 80, damping: 20, mass: 0.5 });
  const sy = useSpring(my, { stiffness: 80, damping: 20, mass: 0.5 });

  // Cursor-follow spotlight overlay (works in both themes)
  const spotlight = useMotionTemplate`radial-gradient(420px circle at ${sx}px ${sy}px, hsl(var(--primary) / 0.18), transparent 70%)`;

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set(e.clientX - rect.left);
    my.set(e.clientY - rect.top);
  };

  const photoSrc = profile.photo ? assetUrl(profile.photo) : undefined;
  const lastName = profile.name.split(" ").slice(1).join(" ");

  return (
    <section
      id="hero"
      ref={ref}
      onMouseMove={onMove}
      className="relative min-h-screen flex items-center px-6 md:px-10 pt-28 pb-20 overflow-hidden"
    >
      {/* Cursor-follow spotlight — masked top + bottom so the glow always
          tapers softly before reaching the section edge (no hard horizon). */}
      <motion.div
        aria-hidden="true"
        style={{
          background: spotlight,
          maskImage:
            "linear-gradient(to bottom, transparent 0%, black 12%, black 78%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, black 12%, black 78%, transparent 100%)",
        }}
        className="pointer-events-none absolute inset-0 z-0"
      />

      {/* Subtle grid background, theme-aware */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.08] dark:opacity-[0.12] [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_75%)]"
      />

      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr] items-center text-left">
          {/* LEFT: copy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-6"
          >
            {profile.availability && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card/60 backdrop-blur-sm text-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-foreground/80">{profile.availability.label}</span>
              </div>
            )}

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.05]">
              <span className="block text-foreground/70 text-lg md:text-xl font-medium tracking-normal mb-3">
                Hi, I'm
              </span>
              <span className="text-foreground">{profile.shortName}</span>{" "}
              <span className="text-primary text-glow">{lastName}</span>
            </h1>

            <p className="text-xl md:text-2xl font-medium text-foreground/85 min-h-[2em]">
              <Typewriter words={profile.rotatingRoles} className="text-primary" />
            </p>

            <p className="text-base md:text-lg text-foreground/70 max-w-xl leading-relaxed">
              {profile.bio}
            </p>

            <div className="flex flex-wrap items-center gap-2 text-sm text-foreground/60">
              <MapPin size={14} />
              <span>{profile.location}</span>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <AskAiHeroButton />
              <a href="#projects" className="cosmic-button inline-flex items-center gap-2">
                View my work <ArrowRight size={16} />
              </a>
              <a
                href="#contact"
                className="px-6 py-2 rounded-full border border-border hover:border-primary hover:bg-card transition inline-flex items-center gap-2"
              >
                <Mail size={16} /> Get in touch
              </a>
              {profile.resumeUrl && (
                <a
                  href={assetUrl(profile.resumeUrl)}
                  download
                  className="px-6 py-2 rounded-full border border-border hover:border-primary hover:bg-card transition inline-flex items-center gap-2"
                >
                  <Download size={16} /> Resume
                </a>
              )}
              {profile.portfolioUrl && (
                <a
                  href={assetUrl(profile.portfolioUrl)}
                  download
                  className="px-6 py-2 rounded-full border border-border hover:border-primary hover:bg-card transition inline-flex items-center gap-2"
                >
                  <FileText size={16} /> Portfolio
                </a>
              )}
            </div>

            {/* Socials */}
            <div className="flex items-center gap-4 pt-2">
              {profile.social.map((s) => {
                const Icon = ICONS[s.icon as keyof typeof ICONS] ?? Mail;
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="p-2 rounded-full border border-border text-foreground/70 hover:text-primary hover:border-primary hover:shadow-[0_0_12px_hsl(var(--primary)/0.5)] transition"
                  >
                    <Icon size={16} />
                  </a>
                );
              })}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-6 max-w-md">
              {profile.stats.map((s) => (
                <div key={s.label}>
                  <div className="text-2xl md:text-3xl font-bold text-primary text-glow">
                    <AnimatedCounter to={s.value} suffix={s.suffix} />
                  </div>
                  <div className="text-xs uppercase tracking-wide text-foreground/60 mt-1">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* RIGHT: avatar / illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto w-full max-w-sm"
          >
            <Avatar
              src={photoSrc}
              initials={
                profile.shortName.slice(0, 1) +
                (profile.name.split(" ")[1]?.[0] ?? "")
              }
            />
            {/* Floating chips */}
            <FloatingChip className="-top-3 -left-3 hidden sm:flex" delay={0.4}>
              <Sparkles size={12} className="text-primary" /> Currently shipping
            </FloatingChip>
            <FloatingChip className="-bottom-3 -right-3 hidden sm:flex" delay={0.6}>
              <Briefcase size={12} className="text-primary" /> Traveloka
            </FloatingChip>
          </motion.div>
        </div>

        {/* Tech marquee — two identical tracks side-by-side so the -50%
            translate lands exactly on the start of the second track,
            making the loop perfectly seamless (no hard reset). */}
        <div className="mt-20 relative overflow-hidden border-y border-border py-4 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <div className="flex w-max animate-marquee">
            {[0, 1].map((track) => (
              <ul
                key={track}
                aria-hidden={track === 1 ? "true" : undefined}
                className="flex gap-12 whitespace-nowrap pr-12 shrink-0"
              >
                {profile.techMarquee.map((t) => (
                  <li
                    key={t}
                    className="text-sm font-medium text-foreground/50 hover:text-primary transition list-none"
                  >
                    {t}
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const FloatingChip = ({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className={`absolute z-10 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card/90 backdrop-blur-md border border-border text-xs font-medium shadow-lg animate-float ${className ?? ""}`}
  >
    {children}
  </motion.div>
);

const HeroSparkle = ({
  delay,
  top,
  left,
}: {
  delay: number;
  top: string;
  left: string;
}) => (
  <motion.span
    aria-hidden
    className="absolute pointer-events-none z-10"
    style={{ top, left }}
    initial={{ opacity: 0, scale: 0 }}
    animate={{
      opacity: [0, 1, 0],
      scale: [0, 1, 0],
      y: [0, -10, -16],
    }}
    transition={{
      duration: 2.4,
      repeat: Infinity,
      delay,
      ease: "easeOut",
    }}
  >
    <Sparkles size={10} className="text-fuchsia-400" />
  </motion.span>
);

// ----------------------------------------------------------------------------
// Hero "Ask AI" CTA. Reports its viewport visibility via custom events so
// AskMeWidget can show/hide the floating launcher accordingly. On click,
// reports its bounding rect so the floating launcher can fly in from here,
// then hides itself for the rest of the session (refresh restores it).
// ----------------------------------------------------------------------------

const AskAiHeroButton = () => {
  const wrapRef = useRef<HTMLSpanElement>(null);
  const [hidden, setHidden] = useState(false);

  // Watch viewport visibility; broadcast to the widget.
  useEffect(() => {
    if (hidden) {
      // We're not in the DOM tree visibly; tell widget the hero CTA is gone.
      window.dispatchEvent(
        new CustomEvent("ask-ai-hero-visibility", {
          detail: { visible: false },
        })
      );
      return;
    }
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((e) => e.isIntersecting);
        window.dispatchEvent(
          new CustomEvent("ask-ai-hero-visibility", { detail: { visible } })
        );
      },
      { threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hidden]);

  const handleClick = () => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (rect) {
      window.dispatchEvent(
        new CustomEvent("open-ask-ai", {
          detail: { from: { x: rect.left, y: rect.top, width: rect.width, height: rect.height } },
        })
      );
    } else {
      window.dispatchEvent(new CustomEvent("open-ask-ai"));
    }
    setHidden(true);
  };

  if (hidden) return null;

  return (
    <span ref={wrapRef} className="relative inline-flex">
      <motion.span
        aria-hidden="true"
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(168,85,247,0.45) 0%, rgba(236,72,153,0.30) 40%, transparent 70%)",
          filter: "blur(12px)",
        }}
        animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      />
      <HeroSparkle delay={0} top="-6px" left="-4px" />
      <HeroSparkle delay={0.8} top="60%" left="100%" />
      <HeroSparkle delay={1.6} top="100%" left="20%" />
      <button
        type="button"
        onClick={handleClick}
        aria-label="Open AI assistant"
        className="ai-pill-gradient relative px-6 py-2 rounded-full inline-flex items-center gap-2 text-sm font-semibold shadow-[0_8px_24px_-8px_rgba(168,85,247,0.6)] hover:scale-[1.03] active:scale-[0.97] transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400/60"
      >
        <Sparkles
          size={14}
          className="text-fuchsia-500 drop-shadow-[0_0_6px_rgba(236,72,153,0.6)]"
        />
        <span className="ai-pill-text">Ask AI about me</span>
      </button>
    </span>
  );
};

const Avatar = ({ src, initials }: { src?: string; initials: string }) => {
  const [errored, setErrored] = useState(false);
  return (
    <div className="relative aspect-square">
      {/* Glow ring */}
      <div
        aria-hidden="true"
        className="absolute -inset-4 rounded-full bg-[conic-gradient(from_180deg,hsl(var(--primary)/0.5),transparent_60%,hsl(var(--primary)/0.3))] blur-2xl opacity-70 animate-pulse-subtle"
      />
      <div className="relative h-full w-full rounded-full overflow-hidden border-2 border-border bg-card">
        {src && !errored ? (
          <img
            src={src}
            alt=""
            onError={() => setErrored(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <Monogram initials={initials} />
        )}
      </div>
    </div>
  );
};

const Monogram = ({ initials }: { initials: string }) => (
  <svg viewBox="0 0 200 200" className="h-full w-full">
    <defs>
      <linearGradient id="mono-bg" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.35" />
        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.05" />
      </linearGradient>
      <linearGradient id="mono-text" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stopColor="hsl(var(--primary))" />
        <stop offset="100%" stopColor="hsl(var(--foreground))" />
      </linearGradient>
    </defs>
    <rect width="200" height="200" fill="url(#mono-bg)" />
    {/* Animated orbits */}
    <g fill="none" stroke="hsl(var(--primary))" strokeOpacity="0.25" strokeWidth="1">
      <circle cx="100" cy="100" r="72">
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 100 100"
          to="360 100 100"
          dur="18s"
          repeatCount="indefinite"
        />
      </circle>
      <ellipse cx="100" cy="100" rx="84" ry="40">
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 100 100"
          to="-360 100 100"
          dur="22s"
          repeatCount="indefinite"
        />
      </ellipse>
    </g>
    <text
      x="50%"
      y="54%"
      dominantBaseline="middle"
      textAnchor="middle"
      fontFamily="ui-sans-serif, system-ui"
      fontWeight="800"
      fontSize="78"
      fill="url(#mono-text)"
    >
      {initials.toUpperCase()}
    </text>
  </svg>
);
