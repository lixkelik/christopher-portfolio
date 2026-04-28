import { useState } from "react";
import { motion } from "motion/react";
import {
  CalendarClock,
  Check,
  Clock,
  Copy,
  Github,
  Linkedin,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { profile } from "../data/profile";

const ICONS = {
  linkedin: Linkedin,
  github: Github,
  mail: Mail,
} as const;

const emailFromSocial =
  profile.social
    .find((s) => s.icon === "mail")
    ?.href.replace(/^mailto:/, "") ?? "";

export const ContactSection = () => {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    if (!emailFromSocial) return;
    try {
      await navigator.clipboard.writeText(emailFromSocial);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore — fallback is the mailto link itself */
    }
  };

  return (
    <section id="contact" className="py-24 px-4 relative">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Let's <span className="text-primary">Build Something</span>
          </h2>
          <p className="text-foreground/70 text-sm md:text-base">
            Have an app idea, a role to fill, or just want to chat about mobile
            engineering? My inbox is open.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 min-w-0">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="min-w-0 rounded-2xl border border-border bg-card/70 backdrop-blur-sm p-6 md:p-7 flex flex-col"
          >
            {profile.availability && (
              <div className="inline-flex self-start items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-600 dark:text-emerald-400 mb-4">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                {profile.availability.label}
              </div>
            )}

            <h3 className="text-xl md:text-2xl font-semibold mb-1 text-left">
              Email is the fastest way
            </h3>
            <p className="text-sm text-foreground/65 text-left mb-5">
              I usually reply within 24 hours.
            </p>

            {emailFromSocial && (
              <div className="flex items-center gap-2 rounded-lg border border-border bg-background/60 px-3 py-2 mb-4">
                <Mail size={16} className="text-primary shrink-0" />
                <span className="font-mono text-xs md:text-sm truncate min-w-0 flex-1 text-left">
                  {emailFromSocial}
                </span>
                <button
                  type="button"
                  onClick={onCopy}
                  aria-label="Copy email to clipboard"
                  className="p-1.5 rounded-md hover:bg-card text-foreground/60 hover:text-primary transition shrink-0"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            )}

            <div className="flex flex-wrap gap-2 mt-auto">
              {emailFromSocial && (
                <a
                  href={`mailto:${emailFromSocial}?subject=Hello%20Christopher`}
                  className="cosmic-button inline-flex items-center gap-2"
                >
                  <Mail size={16} /> Email me
                </a>
              )}
              {profile.calendarUrl && (
                <a
                  href={profile.calendarUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2 rounded-full border border-border hover:border-primary hover:bg-card transition inline-flex items-center gap-2 text-sm"
                >
                  <CalendarClock size={16} /> Book a call
                </a>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.5, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
            className="min-w-0 rounded-2xl border border-border bg-card/70 backdrop-blur-sm p-6 md:p-7 flex flex-col"
          >
            <h3 className="text-xl md:text-2xl font-semibold mb-5 text-left">
              At a glance
            </h3>

            <ul className="space-y-4 text-left mb-6">
              {profile.phone && (
                <InfoRow
                  icon={Phone}
                  label="Phone"
                  value={profile.phone}
                  href={`tel:${profile.phone.replace(/[^\d+]/g, "")}`}
                />
              )}
              {profile.location && (
                <InfoRow icon={MapPin} label="Location" value={profile.location} />
              )}
              {profile.timezone && (
                <InfoRow icon={Clock} label="Timezone" value={profile.timezone} />
              )}
            </ul>

            <div className="mt-auto pt-4 border-t border-border">
              <p className="text-xs uppercase tracking-wider text-foreground/50 mb-3 text-left">
                Or find me on
              </p>
              <div className="flex items-center gap-3">
                {profile.social.map((s) => {
                  const Icon = ICONS[s.icon as keyof typeof ICONS] ?? Mail;
                  return (
                    <a
                      key={s.label}
                      href={s.href}
                      target={s.icon === "mail" ? undefined : "_blank"}
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      className="p-2.5 rounded-full border border-border text-foreground/70 hover:text-primary hover:border-primary hover:shadow-[0_0_12px_hsl(var(--primary)/0.5)] transition"
                    >
                      <Icon size={16} />
                    </a>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const InfoRow = ({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
  href?: string;
}) => {
  const content = (
    <>
      <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
        <Icon size={16} />
      </div>
      <div className="min-w-0">
        <div className="text-[11px] uppercase tracking-wider text-foreground/50">
          {label}
        </div>
        <div className="text-sm md:text-[0.95rem] text-foreground/85 truncate">
          {value}
        </div>
      </div>
    </>
  );

  return (
    <li>
      {href ? (
        <a href={href} className="flex items-center gap-3 hover:text-primary transition">
          {content}
        </a>
      ) : (
        <div className="flex items-center gap-3">{content}</div>
      )}
    </li>
  );
};
