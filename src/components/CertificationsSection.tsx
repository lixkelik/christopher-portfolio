import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Award, ExternalLink, ScrollText } from "lucide-react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

import { certifications, type Certification } from "../data/certifications";
import { assetUrl, cn } from "../lib/utils";

// The CSS `marquee` keyframe animates translateX from 0 → -50%.
// For a seamless loop we need to render TWO identical halves: the second half
// scrolls in exactly when the first half scrolls out. To keep the loop seamless
// on wide displays even when there are only a few certifications, we make each
// half itself contain enough copies of the list to be wider than any viewport.
const CARD_PX = 220 + 32; // card width + gap
const TARGET_HALF_PX = 2400; // ~ widest realistic viewport, padded

export const CertificationsSection = () => {
  const [paused, setPaused] = useState(false);
  // Lightbox state
  const [lbOpen, setLbOpen] = useState(false);
  const [lbIndex, setLbIndex] = useState(0);

  const total = certifications.length;

  // How many copies of the cert list to put inside ONE half of the marquee.
  const copiesPerHalf = useMemo(
    () => Math.max(2, Math.ceil(TARGET_HALF_PX / (total * CARD_PX))),
    [total]
  );

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

        {/* Marquee — pauses on hover so users can read & click. The two halves
            are identical; together they make the -50% loop seamless. */}
        <div
          className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div
            className={cn(
              "flex w-max animate-marquee py-4",
              paused && "[animation-play-state:paused]"
            )}
          >
            {[0, 1].map((half) => (
              <ul
                key={half}
                aria-hidden={half === 1 ? "true" : undefined}
                className="flex gap-6 sm:gap-8 pr-6 sm:pr-8 shrink-0"
              >
                {Array.from({ length: copiesPerHalf }).flatMap((_, copy) =>
                  certifications.map((c, i) => (
                    <li key={`${half}-${copy}-${c.id}`}>
                      <CertCard cert={c} onImageClick={() => openImage(i)} />
                    </li>
                  ))
                )}
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
        className="block w-full aspect-[4/3] rounded-xl overflow-hidden border border-border bg-card shadow-md ring-1 ring-primary/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
        aria-label={`Open ${cert.title} certificate image`}
      >
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
