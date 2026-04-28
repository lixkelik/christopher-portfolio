import { useState } from "react";
import { motion } from "motion/react";
import { ExternalLink, MapPin } from "lucide-react";
import { durationLabel, experiences, formatRange } from "../data/profile";
import type { Experience } from "../data/profile";
import { assetUrl, cn } from "../lib/utils";

export const ExperienceSection = () => {
  return (
    <section id="experience" className="py-24 px-4 relative">
      <div className="container mx-auto max-w-4xl text-left">
        <div className="mb-14 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Where I've <span className="text-primary">Worked</span>
          </h2>
          <p className="text-foreground/70 max-w-xl mx-auto">
            A short timeline of the teams I've shipped with. Tap any card to
            flip and meet the company behind the role.
          </p>
        </div>

        <ol className="relative border-l-2 border-border ml-3 md:ml-6 space-y-10">
          {experiences.map((exp, i) => (
            <TimelineItem key={exp.id} exp={exp} index={i} />
          ))}
        </ol>
      </div>
    </section>
  );
};

const TimelineItem = ({ exp, index }: { exp: Experience; index: number }) => {
  const [flipped, setFlipped] = useState(false);
  const isPresent = exp.endDate === null;

  return (
    <motion.li
      initial={{ opacity: 0, x: -16 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="relative pl-6 md:pl-10"
    >
      {/* Timeline dot */}
      <span
        className={cn(
          "absolute -left-[9px] top-3 h-4 w-4 rounded-full border-2 border-background ring-2",
          isPresent
            ? "bg-primary ring-primary animate-pulse"
            : "bg-card ring-border"
        )}
        aria-hidden="true"
      />

      {/* Flip card — click to flip. Both faces share one grid cell so the
          parent naturally sizes to the TALLER face. No JS measurement needed. */}
      <button
        type="button"
        onClick={() => setFlipped((v) => !v)}
        aria-pressed={flipped}
        aria-label={`${exp.role} at ${exp.company}`}
        className="group relative w-full text-left [perspective:1200px] cursor-pointer"
      >
        <div
          className={cn(
            "relative grid w-full transition-transform duration-700 [transform-style:preserve-3d]",
            flipped && "[transform:rotateY(180deg)]"
          )}
        >
          {/* FRONT */}
          <div
            className="[grid-area:1/1] [backface-visibility:hidden] rounded-2xl border border-border bg-card/70 backdrop-blur-sm p-5 md:p-6 shadow-sm group-hover:shadow-[0_0_20px_hsl(var(--primary)/0.25)] transition-shadow"
          >
            <div className="flex items-start gap-4">
              <Logo src={exp.logo} alt={exp.company} />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="text-base md:text-xl font-semibold">{exp.role}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    {exp.type}
                  </span>
                </div>
                <p className="text-primary font-medium">{exp.company}</p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-foreground/60 mt-1">
                  <span>{formatRange(exp.startDate, exp.endDate)}</span>
                  <span>·</span>
                  <span>{durationLabel(exp.startDate, exp.endDate)}</span>
                  {exp.location && (
                    <>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={12} /> {exp.location}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <p className="mt-4 text-sm md:text-[0.95rem] text-foreground/80 leading-relaxed">
              {exp.summary}
            </p>

            {exp.achievements && exp.achievements.length > 0 && (
              <ul className="mt-4 space-y-1.5">
                {exp.achievements.map((a) => (
                  <li
                    key={a}
                    className="text-xs md:text-sm text-foreground/85 flex gap-2"
                  >
                    <span className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            )}

            {exp.techStack && exp.techStack.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {exp.techStack.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 text-[11px] border rounded-full bg-card/60"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}

            <span className="mt-4 block text-[11px] uppercase tracking-wider text-foreground/40 group-hover:text-primary transition">
              Tap to meet {exp.company} ↻
            </span>
          </div>

          {/* BACK — company profile only */}
          <div
            className="[grid-area:1/1] [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-2xl border border-primary/30 bg-card/90 backdrop-blur-md p-5 md:p-6 shadow-[0_0_20px_hsl(var(--primary)/0.2)] flex flex-col"
          >
            <div className="flex items-center gap-3 mb-4">
              <Logo src={exp.logo} alt={exp.company} />
              <div className="flex-1 min-w-0">
                <p className="text-lg font-semibold truncate">{exp.company}</p>
                {exp.website && (
                  <a
                    href={exp.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                  >
                    Visit site <ExternalLink size={10} />
                  </a>
                )}
              </div>
            </div>

            {exp.companyProfile && (
              <p className="text-sm md:text-[0.95rem] text-foreground/80 leading-relaxed">
                {exp.companyProfile}
              </p>
            )}

            <span className="mt-auto pt-4 text-[11px] uppercase tracking-wider text-foreground/40">
              Tap to flip back ↺
            </span>
          </div>
        </div>
      </button>
    </motion.li>
  );
};

const Logo = ({
  src,
  alt,
  small,
}: {
  src?: string;
  alt: string;
  small?: boolean;
}) => {
  const [errored, setErrored] = useState(false);
  const size = small ? "h-8 w-8" : "h-12 w-12";
  if (!src || errored) {
    return (
      <div
        className={cn(
          size,
          "shrink-0 rounded-lg border border-border bg-primary/10 text-primary font-bold flex items-center justify-center"
        )}
      >
        {alt.charAt(0)}
      </div>
    );
  }
  return (
    <img
      src={assetUrl(src)}
      alt={alt}
      onError={() => setErrored(true)}
      className={cn(
        size,
        "shrink-0 rounded-lg object-cover border border-border bg-card"
      )}
    />
  );
};
