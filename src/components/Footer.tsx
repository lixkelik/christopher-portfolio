import { Link } from "react-router-dom";
import {
  ArrowUp,
  Github,
  Linkedin,
  Mail,
  type LucideIcon,
} from "lucide-react";
import { profile } from "../data/profile";
import { cn } from "../lib/utils";

// Map social `icon` slugs from profile.json to Lucide icons.
const SOCIAL_ICONS: Record<string, LucideIcon> = {
  linkedin: Linkedin,
  github: Github,
  mail: Mail,
};

const QUICK_LINKS = [
  { name: "Experience", href: "#experience" },
  { name: "Education", href: "#education" },
  { name: "Projects", href: "#projects" },
  { name: "Achievements", href: "#achievements" },
  { name: "Certifications", href: "#certifications" },
  { name: "Skills", href: "#skills" },
  { name: "Toolkit", href: "#toolkit" },
  { name: "Contact", href: "#contact" },
];

export const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-border bg-card/40 mt-12">
      <div className="container mx-auto max-w-6xl px-4 py-12">
        {/* Top: brand + nav + connect */}
        <div className="grid gap-10 md:grid-cols-12 text-center md:text-left">
          {/* Brand */}
          <div className="md:col-span-5 flex flex-col items-center md:items-start">
            <Link
              to="/"
              className="text-lg font-bold text-foreground hover:text-primary transition-colors"
            >
              {profile.shortName} Portfolio
            </Link>
            <p className="mt-3 text-sm text-foreground/70 max-w-sm leading-relaxed">
              {profile.headline}
            </p>
            {profile.location && (
              <p className="mt-3 text-xs text-foreground/55">
                {profile.location}
              </p>
            )}
          </div>

          {/* Quick links */}
          <nav
            aria-label="Footer navigation"
            className="md:col-span-4 flex flex-col items-center md:items-start"
          >
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground/50 mb-3">
              Explore
            </h3>
            <ul className="grid grid-cols-2 gap-x-8 gap-y-2 text-center md:text-left">
              {QUICK_LINKS.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="text-sm text-foreground/75 hover:text-primary transition-colors"
                  >
                    {l.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Connect */}
          <div className="md:col-span-3 flex flex-col items-center md:items-start">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground/50 mb-3">
              Connect
            </h3>
            <ul className="flex flex-wrap justify-center md:justify-start gap-2">
              {profile.social.map((s) => {
                const Icon = SOCIAL_ICONS[s.icon] ?? Mail;
                const isMail = s.icon === "mail";
                return (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      target={isMail ? undefined : "_blank"}
                      rel={isMail ? undefined : "noreferrer"}
                      aria-label={s.label}
                      title={s.label}
                      className={cn(
                        "inline-flex items-center justify-center h-10 w-10 rounded-full",
                        "border border-border bg-background/60 text-foreground/70",
                        "hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-colors"
                      )}
                    >
                      <Icon size={16} aria-hidden="true" />
                    </a>
                  </li>
                );
              })}
            </ul>
            {profile.availability?.label && (
              <p className="mt-4 flex items-center gap-2 text-xs text-foreground/65">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <span>{profile.availability.label}</span>
              </p>
            )}
          </div>
        </div>

        {/* Divider + bottom row */}
        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-xs text-foreground/55">
            © {year} {profile.name}. All rights reserved.
          </p>
          <p className="text-xs text-foreground/45">
            Built with love ❤️
          </p>
          <a
            href="#hero"
            aria-label="Back to top"
            className="inline-flex items-center gap-1.5 text-xs text-foreground/65 hover:text-primary transition-colors group"
          >
            Back to top
            <span className="grid place-items-center h-7 w-7 rounded-full bg-primary/10 group-hover:bg-primary/20 text-primary transition-colors">
              <ArrowUp size={14} />
            </span>
          </a>
        </div>
      </div>
    </footer>
  );
};
