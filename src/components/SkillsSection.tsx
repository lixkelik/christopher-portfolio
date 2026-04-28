import { motion } from "motion/react";
import {
  Cloud,
  Code,
  Database,
  Layers,
  LineChart,
  Smartphone,
  Wrench,
} from "lucide-react";
import { skillGroups, type SkillIcon, type SkillTier } from "../data/skills";
import { cn } from "../lib/utils";

const ICON_MAP: Record<
  SkillIcon,
  React.ComponentType<{ size?: number; className?: string }>
> = {
  smartphone: Smartphone,
  layers: Layers,
  cloud: Cloud,
  "line-chart": LineChart,
  code: Code,
  database: Database,
  wrench: Wrench,
};

const TIER_LABEL: Record<SkillTier, string> = {
  core: "Core",
  comfortable: "Comfortable",
  learning: "Learning",
};

export const SkillsSection = () => {
  return (
    <section id="skills" className="py-24 px-4 relative">
      <div className="container mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            What I <span className="text-primary">Work With</span>
          </h2>
          <p className="text-foreground/70 max-w-xl mx-auto text-sm md:text-base">
            Grouped by where they live in my stack. Dots show how much I
            actually reach for them.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 mb-10 text-xs text-foreground/60">
          {(["core", "comfortable", "learning"] as SkillTier[]).map((t) => (
            <span key={t} className="inline-flex items-center gap-2">
              <TierDots tier={t} />
              <span>{TIER_LABEL[t]}</span>
            </span>
          ))}
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {skillGroups.map((g, i) => {
            const Icon = ICON_MAP[g.icon] ?? Code;
            return (
              <motion.div
                key={g.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10% 0px" }}
                transition={{
                  duration: 0.5,
                  delay: i * 0.05,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="rounded-2xl border border-border bg-card/70 backdrop-blur-sm p-5 md:p-6 hover:border-primary/40 hover:shadow-[0_0_20px_hsl(var(--primary)/0.15)] transition"
              >
                <div className="flex items-start gap-3 mb-4 text-left">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                    <Icon size={20} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-base md:text-lg leading-tight">
                      {g.title}
                    </h3>
                    <p className="text-xs md:text-sm text-foreground/60 mt-0.5">
                      {g.blurb}
                    </p>
                  </div>
                </div>

                <ul className="flex flex-wrap gap-2">
                  {g.skills.map((s) => (
                    <li
                      key={s.name}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs md:text-[13px] transition",
                        s.tier === "core" &&
                          "border-primary/40 bg-primary/10 text-foreground",
                        s.tier === "comfortable" &&
                          "border-border bg-card/60 text-foreground/85",
                        s.tier === "learning" &&
                          "border-dashed border-border text-foreground/60"
                      )}
                      title={TIER_LABEL[s.tier]}
                    >
                      <TierDots tier={s.tier} />
                      {s.name}
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const TierDots = ({ tier }: { tier: SkillTier }) => {
  const filled = tier === "core" ? 2 : tier === "comfortable" ? 1 : 0;
  return (
    <span className="inline-flex gap-0.5" aria-hidden="true">
      {[0, 1].map((i) => (
        <span
          key={i}
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            i < filled ? "bg-primary" : "bg-foreground/20"
          )}
        />
      ))}
    </span>
  );
};
