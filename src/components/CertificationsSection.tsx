import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Award, ExternalLink, ScrollText, Star } from "lucide-react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

import { certifications, type Certification } from "../data/certifications";
import { assetUrl } from "../lib/utils";

// Auto-scroll speed in px/s
const SCROLL_SPEED = 40;

export const CertificationsSection = () => {
  const [paused, setPaused] = useState(false);
  const [userScrolling, setUserScrolling] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const userScrollTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Lightbox state
  const [lbOpen, setLbOpen] = useState(false);
  const [lbIndex, setLbIndex] = useState(0);

  const total = certifications.length;

  // Lightbox slides — one per certification, in source order.
  const slides = useMemo(
    () =>
      certifications.map((c) => ({
        src: assetUrl(c.image),
        title: `${c.title} — ${c.issuer}`,
      })),
    []
  );

  const openImage = (idx: number) => {
    setLbIndex(idx);
    setLbOpen(true);
  };

  // Auto-scroll logic: advances scrollLeft at a steady rate, wraps around
  // by duplicating items. Pauses when user hovers or manually scrolls.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || paused || userScrolling) return;

    let raf: number;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      el.scrollLeft += SCROLL_SPEED * dt;

      // Infinite loop: when we've scrolled past the first half, jump back
      const halfWidth = el.scrollWidth / 2;
      if (el.scrollLeft >= halfWidth) {
        el.scrollLeft -= halfWidth;
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(raf);
  }, [paused, userScrolling]);

  // Detect real user interaction (wheel / touch / drag) and pause auto-scroll.
  // We don't use onScroll because programmatic scrollLeft changes also fire it.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const pauseAutoScroll = () => {
      setUserScrolling(true);
      if (userScrollTimer.current) clearTimeout(userScrollTimer.current);
      userScrollTimer.current = setTimeout(() => setUserScrolling(false), 2000);
    };

    el.addEventListener("wheel", pauseAutoScroll, { passive: true });
    el.addEventListener("touchstart", pauseAutoScroll, { passive: true });
    el.addEventListener("pointerdown", pauseAutoScroll);

    return () => {
      el.removeEventListener("wheel", pauseAutoScroll);
      el.removeEventListener("touchstart", pauseAutoScroll);
      el.removeEventListener("pointerdown", pauseAutoScroll);
    };
  }, []);

  if (total === 0) return null;

  return (
    <section id="certifications" className="py-24 px-4 relative">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary/80 uppercase tracking-wider">
            <ScrollText size={14} />
            {total} certification{total === 1 ? "" : "s"}
          </span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
          Verified <span className="text-primary">Certifications</span>
        </h2>
        <p className="text-center text-foreground/70 mb-10 max-w-2xl mx-auto">
          Badges and certificates from cloud providers, training programs, and
          official issuers. Hover to pause, tap any image to enlarge, or click
          a title to verify.
        </p>

        {/* Scrollable row — auto-scrolls unless user is hovering or manually scrolling */}
        <div
          ref={scrollRef}
          className="relative overflow-x-auto no-scrollbar [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="flex w-max py-4">
            {/* Render list twice for seamless infinite loop */}
            {[0, 1].map((half) => (
              <ul
                key={half}
                aria-hidden={half === 1 ? "true" : undefined}
                className="flex gap-6 sm:gap-8 pr-6 sm:pr-8 shrink-0"
              >
                {certifications.map((c, i) => (
                  <li key={`${half}-${c.id}`}>
                    <CertCard cert={c} onImageClick={() => openImage(i)} />
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lbOpen && (
          <Lightbox
            open={lbOpen}
            close={() => setLbOpen(false)}
            index={lbIndex}
            slides={slides}
          />
        )}
      </AnimatePresence>
    </section>
  );
};

// ----------------------------------------------------------------------------
// Single certification card (image + title + year)
// ----------------------------------------------------------------------------

const CertCard = ({
  cert,
  onImageClick,
}: {
  cert: Certification;
  onImageClick: () => void;
}) => {
  const titleContent = (
    <span className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-foreground/85 group-hover:text-primary transition-colors">
      {cert.title}
      {cert.credentialUrl && (
        <ExternalLink
          size={11}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        />
      )}
    </span>
  );

  return (
    <div className="w-[200px] sm:w-[220px] flex flex-col items-center text-center select-none">
      {/* Image — click to open in lightbox */}
      <motion.button
        type="button"
        onClick={onImageClick}
        whileHover={{ y: -4 }}
        whileTap={{ y: -2 }}
        transition={{ type: "spring", stiffness: 320, damping: 22 }}
        className={`relative block w-full aspect-[4/3] rounded-xl overflow-hidden bg-card shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${
          cert.featured
            ? "border-2 border-amber-400/60 ring-2 ring-amber-400/20 shadow-[0_0_18px_rgba(251,191,36,0.25)]"
            : "border border-border ring-1 ring-primary/10"
        }`}
        aria-label={`Open ${cert.title} certificate image`}
      >
        {cert.featured && (
          <span className="absolute top-2 right-2 z-10 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-400/90 text-[10px] font-bold text-amber-950 uppercase tracking-wide shadow-sm">
            <Star size={10} fill="currentColor" />
            Featured
          </span>
        )}
        <img
          src={assetUrl(cert.image)}
          alt={cert.title}
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
          draggable={false}
        />
      </motion.button>

      {/* Title — links to credential URL if present */}
      <div className="mt-3 w-full px-1">
        {cert.credentialUrl ? (
          <a
            href={cert.credentialUrl}
            target="_blank"
            rel="noreferrer"
            className="group block"
          >
            {titleContent}
          </a>
        ) : (
          <span className="block">{titleContent}</span>
        )}
        <p className="text-[11px] text-foreground/55 mt-0.5 inline-flex items-center gap-1 justify-center">
          <Award size={11} />
          {cert.issuer} · {cert.year}
        </p>
      </div>
    </div>
  );
};
