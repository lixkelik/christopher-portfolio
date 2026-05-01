import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  Briefcase,
  ChevronRight,
  Code2,
  FolderKanban,
  GraduationCap,
  Home as HomeIcon,
  Mail,
  Menu,
  ScrollText,
  Trophy,
  Wrench,
  Compass,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "../lib/utils";
import { ThemeToggle } from "./ThemeToggle";

type NavItem = {
  name: string;
  href: string;
  icon: LucideIcon;
};

const navItems: NavItem[] = [
  { name: "Home", href: "#hero", icon: HomeIcon },
  { name: "Experience", href: "#experience", icon: Briefcase },
  { name: "Education", href: "#education", icon: GraduationCap },
  { name: "Projects", href: "#projects", icon: FolderKanban },
  { name: "Achievements", href: "#achievements", icon: Trophy },
  { name: "Certifications", href: "#certifications", icon: ScrollText },
  { name: "Skills", href: "#skills", icon: Code2 },
  { name: "Toolkit", href: "#toolkit", icon: Wrench },
  { name: "Seeking", href: "#seeking", icon: Compass },
  { name: "Contact", href: "#contact", icon: Mail },
];

// Section ids in nav order — used to track which one is in view.
const sectionIds = navItems.map((i) => i.href.replace("#", ""));

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeId, setActiveId] = useState<string>("hero");
  const location = useLocation();
  const navigate = useNavigate();
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Track scroll for navbar styling
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Track which section is currently in view (only on home)
  useEffect(() => {
    if (location.pathname !== "/") return;
    if (observerRef.current) observerRef.current.disconnect();
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: [0, 0.25, 0.5, 1] }
    );
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    observerRef.current = observer;
    return () => observer.disconnect();
  }, [location.pathname]);

  // Lock body scroll while drawer is open
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  // Close drawer on Escape
  useEffect(() => {
    if (!isMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isMenuOpen]);

  const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
    e.preventDefault();
    setIsMenuOpen(false);
    if (location.pathname === "/") {
      const id = hash.replace("#", "");
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth" });
      history.replaceState(null, "", `/${hash}`);
    } else {
      navigate(`/${hash}`);
    }
  };

  return (
    <>
      <header
        className={cn(
          "fixed w-full z-40 transition-all duration-300",
          scrolled ? "py-3 bg-background/80 backdrop-blur-md shadow-xs" : "py-5"
        )}
      >
      <div className="container flex items-center justify-between">
        <Link
          to="/"
          className="text-base sm:text-xl font-bold text-primary flex items-center"
        >
          <span className="relative z-10">
            <span className="text-glow text-foreground">Christopher </span>
            Portfolio
          </span>
        </Link>

        {/* DESKTOP NAV */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navItems.map((item) => {
            const isActive =
              location.pathname === "/" && activeId === item.href.slice(1);
            return (
              <a
                key={item.name}
                href={`/${item.href}`}
                onClick={(e) => handleNav(e, item.href)}
                className={cn(
                  "relative px-2.5 py-1.5 text-[13.5px] xl:text-[15px] rounded-full transition-colors whitespace-nowrap",
                  isActive
                    ? "text-primary"
                    : "text-foreground/70 hover:text-foreground"
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-full bg-primary/10 ring-1 ring-primary/20"
                    transition={{ type: "spring", stiffness: 400, damping: 35 }}
                  />
                )}
                <span className="relative">{item.name}</span>
              </a>
            );
          })}
          <div className="ml-2">
            <ThemeToggle />
          </div>
        </nav>

        {/* MOBILE: theme + burger */}
        <div className="lg:hidden flex items-center gap-1 z-50">
          <ThemeToggle />
          <button
            onClick={() => setIsMenuOpen((p) => !p)}
            className="p-2 text-foreground"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-nav"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      </header>

      {/* MOBILE DRAWER (slide from right) — rendered OUTSIDE <header> so the
          header's backdrop-blur (which creates a containing block) doesn't
          collapse our `fixed` drawer to the header's height. */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.button
              type="button"
              aria-label="Close menu"
              onClick={() => setIsMenuOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden fixed inset-0 z-30 bg-background/60 backdrop-blur-sm"
            />

            {/* Drawer */}
            <motion.nav
              id="mobile-nav"
              key="drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 38 }}
              className="lg:hidden fixed inset-y-0 right-0 z-40 w-[78%] max-w-[320px] h-screen bg-background border-l border-border shadow-2xl flex flex-col"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <span className="text-xs font-semibold uppercase tracking-wider text-foreground/50">
                  Navigation
                </span>
              </div>

              {/* Items */}
              <ul className="flex-1 overflow-y-auto py-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    location.pathname === "/" &&
                    activeId === item.href.slice(1);
                  return (
                    <li key={item.name}>
                      <a
                        href={`/${item.href}`}
                        onClick={(e) => handleNav(e, item.href)}
                        className={cn(
                          "group flex items-center gap-3 px-5 py-3 transition-colors",
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-foreground/85 hover:bg-foreground/5"
                        )}
                      >
                        <Icon
                          size={18}
                          className={cn(
                            isActive ? "text-primary" : "text-foreground/55"
                          )}
                        />
                        <span className="flex-1 text-base font-medium">
                          {item.name}
                        </span>
                        <ChevronRight
                          size={16}
                          className={cn(
                            "transition-transform",
                            isActive
                              ? "text-primary translate-x-0.5"
                              : "text-foreground/30 group-hover:translate-x-0.5"
                          )}
                        />
                      </a>
                    </li>
                  );
                })}
              </ul>

              {/* Drawer footer */}
              <div className="px-5 py-4 border-t border-border text-[11px] text-foreground/50">
                © {new Date().getFullYear()} Christopher Atika
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
