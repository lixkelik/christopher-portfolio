import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Award,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Images,
  Trophy,
  ZoomIn,
} from "lucide-react";
import Lightbox from "yet-another-react-lightbox";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";

import { achievements, type Achievement } from "../data/achievements";
import { assetUrl, cn } from "../lib/utils";

// How long to dwell on each card before auto-advancing.
const AUTO_ADVANCE_MS = 4500;
// How many items are visible on each side of the active card.
const SIDE_DEPTH = 2;
// Horizontal pixel spacing between adjacent slots, per breakpoint.
const SPACING_DESKTOP = 200;
const SPACING_MOBILE = 110;
// Min swipe distance (px) to trigger a step in either direction.
const SWIPE_THRESHOLD = 50;

export const AchievementsSection = () => {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [spacing, setSpacing] = useState(SPACING_DESKTOP);

  // Lightbox state
  const [lbOpen, setLbOpen] = useState(false);
  const [lbIndex, setLbIndex] = useState(0);
  const [lbSlides, setLbSlides] = useState<{ src: string; title?: string }[]>(
    []
  );

  const total = achievements.length;
  const advanceTimer = useRef<number | null>(null);

  // Track viewport so we can shrink slot spacing on small screens.
  useEffect(() => {
    const apply = () => {
      setSpacing(window.innerWidth < 640 ? SPACING_MOBILE : SPACING_DESKTOP);
    };
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, []);

  // Auto-advance loop — pauses on hover, when lightbox is open, or when
  // there's only a single item.
  useEffect(() => {
    if (paused || lbOpen || total <= 1) return;
    advanceTimer.current = window.setTimeout(() => {
      setActive((i) => (i + 1) % total);
    }, AUTO_ADVANCE_MS);
    return () => {
      if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
    };
  }, [active, paused, lbOpen, total]);

  const go = (delta: 1 | -1) => {
    setActive((i) => (i + delta + total) % total);
  };

  const jumpTo = (target: number) => {
    if (target === active) return;
    setActive(target);
  };

  const openLightbox = (achievement: Achievement, startIndex: number) => {
    setLbSlides(
      achievement.images.map((img) => ({
        src: assetUrl(img.src),
        title: img.caption,
      }))
    );
    setLbIndex(startIndex);
    setLbOpen(true);
  };

  // Compute the signed shortest offset from `active` for every achievement,
  // wrapping around so the carousel feels infinite.
  const slots = useMemo(() => {
    return achievements.map((item, i) => {
      let offset = i - active;
      if (offset > total / 2) offset -= total;
      if (offset < -total / 2) offset += total;
      return { item, index: i, offset };
    });
  }, [active, total]);

  if (total === 0) return null;
  const activeItem = achievements[active];

  // ----- Touch swipe ---------------------------------------------------------
  const touchStartX = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < SWIPE_THRESHOLD) return;
    go(dx < 0 ? 1 : -1);
  };

  return (
    <section
      id="achievements"
      className="py-24 px-4 relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary/80 uppercase tracking-wider">
            <Trophy size={14} />
            {total} achievement{total === 1 ? "" : "s"}
          </span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
          Honors & <span className="text-primary">Achievements</span>
        </h2>
        <p className="text-center text-foreground/70 mb-6 max-w-2xl mx-auto">
          Competitions won, awards earned, and milestones reached along the
          way. Tap any card to see the full proof.
        </p>

        {/* Coverflow carousel */}
        <div className="relative">
          <NavButton direction="left" onClick={() => go(-1)} disabled={total <= 1} />
          <NavButton direction="right" onClick={() => go(1)} disabled={total <= 1} />

          <div
            className="relative h-[260px] sm:h-[300px] flex items-center justify-center"
            style={{ perspective: 1400 }}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            {slots.map(({ item, index, offset }) => {
              const isActive = offset === 0;
              const abs = Math.abs(offset);
              const visible = abs <= SIDE_DEPTH;
              // Stack farther cards behind nearer ones; active is on top.
              const z = 50 - abs;
              return (
                <CoverCard
                  key={item.id}
                  item={item}
                  isActive={isActive}
                  offset={offset}
                  spacing={spacing}
                  zIndex={z}
                  visible={visible}
                  onClick={() => {
                    if (!visible) return;
                    if (isActive) openLightbox(item, 0);
                    else jumpTo(index);
                  }}
                />
              );
            })}
          </div>

          {/* Active item meta — animates on change */}
          <div className="mt-4 min-h-[120px] text-center px-2">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeItem.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-primary/80 uppercase tracking-wider mb-2">
                  <Award size={12} />
                  {activeItem.category}
                </span>
                <h3 className="text-lg sm:text-xl font-bold leading-snug text-foreground">
                  {activeItem.title}
                </h3>
                <p className="text-sm text-foreground/70 mt-1">
                  {activeItem.issuer}
                </p>
                <div className="flex items-center justify-center gap-3 mt-2 text-xs text-foreground/60">
                  <span className="inline-flex items-center gap-1">
                    <Calendar size={12} />
                    {activeItem.year}
                  </span>
                  {activeItem.link && (
                    <>
                      <span aria-hidden>·</span>
                      <a
                        href={activeItem.link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 hover:text-primary transition-colors"
                      >
                        Verify <ExternalLink size={11} />
                      </a>
                    </>
                  )}
                </div>
                {activeItem.summary && (
                  <p className="text-xs sm:text-sm text-foreground/60 mt-3 max-w-xl mx-auto line-clamp-3">
                    {activeItem.summary}
                  </p>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dots indicator */}
          {total > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {achievements.map((a, i) => (
                <button
                  key={a.id}
                  onClick={() => jumpTo(i)}
                  aria-label={`Go to achievement ${i + 1}`}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    i === active
                      ? "w-8 bg-primary"
                      : "w-1.5 bg-foreground/20 hover:bg-foreground/40"
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lbOpen && (
          <Lightbox
            open={lbOpen}
            close={() => setLbOpen(false)}
            index={lbIndex}
            slides={lbSlides}
            plugins={lbSlides.length > 1 ? [Thumbnails] : []}
          />
        )}
      </AnimatePresence>
    </section>
  );
};

// ----------------------------------------------------------------------------
// One card in the coverflow stack. Renders the achievement's main image and
// animates between offset slots whenever `active` changes.
// ----------------------------------------------------------------------------

const CoverCard = ({
  item,
  isActive,
  offset,
  spacing,
  zIndex,
  visible,
  onClick,
}: {
  item: Achievement;
  isActive: boolean;
  offset: number;
  spacing: number;
  zIndex: number;
  visible: boolean;
  onClick: () => void;
}) => {
  const abs = Math.abs(offset);
  // Tilt sides toward the center; active stays flat.
  const rotateY = isActive ? 0 : offset > 0 ? -28 : 28;
  // Each step away from active = smaller and dimmer.
  const scale = isActive ? 1 : abs === 1 ? 0.78 : 0.6;
  const opacity = !visible ? 0 : isActive ? 1 : abs === 1 ? 0.65 : 0.3;
  const x = offset * spacing;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      aria-label={
        isActive
          ? `Open ${item.title} images`
          : `Switch to ${item.title}`
      }
      className={cn(
        "absolute top-1/2 left-1/2 w-[260px] sm:w-[320px] aspect-[4/3]",
        "rounded-2xl overflow-hidden border border-border bg-card",
        "shadow-2xl ring-1 ring-primary/10 focus:outline-none",
        "focus-visible:ring-2 focus-visible:ring-primary/60",
        isActive && "group/active cursor-zoom-in",
        !visible && "pointer-events-none"
      )}
      style={{
        transformStyle: "preserve-3d",
        zIndex,
        // Pull the layout origin to the centre of the row.
        marginLeft: "-160px",
        marginTop: "-120px",
      }}
      animate={{
        x,
        scale,
        opacity,
        rotateY,
        filter: isActive ? "blur(0px)" : abs === 1 ? "blur(0.5px)" : "blur(2px)",
      }}
      transition={{ type: "spring", stiffness: 220, damping: 28, mass: 0.9 }}
    >
      <img
        src={assetUrl(item.images[0].src)}
        alt={item.images[0].caption ?? item.title}
        className="w-full h-full object-cover"
        loading="lazy"
        decoding="async"
        draggable={false}
      />
      {!isActive && (
        <div className="absolute inset-0 bg-background/30" />
      )}

      {/* Affordances on the ACTIVE card so users know it's interactive
          and can hold multiple photos. */}
      {isActive && (
        <>
          {/* Image-count badge — always visible top-right */}
          <span
            className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 rounded-full bg-background/85 backdrop-blur-sm border border-border px-2 py-0.5 text-[11px] font-semibold text-foreground/85 shadow-sm"
            aria-label={`${item.images.length} photo${item.images.length === 1 ? "" : "s"}`}
          >
            <Images size={11} />
            {item.images.length}
          </span>

          {/* Hover overlay prompting the user to open the gallery */}
          <div className="absolute inset-0 flex items-end justify-center opacity-0 group-hover/active:opacity-100 transition-opacity duration-200 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-t from-background/75 via-background/10 to-transparent" />
            <span className="relative mb-4 inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-3 py-1.5 text-xs font-semibold shadow-lg">
              <ZoomIn size={13} />
              {item.images.length > 1
                ? `View ${item.images.length} photos`
                : "View photo"}
            </span>
          </div>
        </>
      )}
    </motion.button>
  );
};

// ----------------------------------------------------------------------------
// Carousel arrow button
// ----------------------------------------------------------------------------

const NavButton = ({
  direction,
  onClick,
  disabled,
}: {
  direction: "left" | "right";
  onClick: () => void;
  disabled?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-label={direction === "left" ? "Previous achievement" : "Next achievement"}
    className={cn(
      "absolute top-1/2 -translate-y-1/2 z-20 h-11 w-11 rounded-full",
      "border border-border bg-card/85 backdrop-blur-sm shadow-lg",
      "flex items-center justify-center text-foreground/70 hover:text-primary hover:border-primary/40 transition-colors",
      "disabled:opacity-30 disabled:cursor-not-allowed",
      // Vertically center on the carousel band, not the section.
      direction === "left" ? "left-0 sm:left-2" : "right-0 sm:right-2"
    )}
    style={{ top: "130px" }}
  >
    {direction === "left" ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
  </button>
);
