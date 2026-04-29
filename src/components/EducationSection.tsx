import { useState } from "react";
import { AnimatePresence } from "motion/react";
import { Award, ExternalLink, FileText, GraduationCap } from "lucide-react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

import { education } from "../data/education";
import { assetUrl } from "../lib/utils";

export const EducationSection = () => {
  const [lbOpen, setLbOpen] = useState(false);
  const e = education;

  return (
    <section id="education" className="py-24 px-4 relative">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary/80 uppercase tracking-wider">
            <GraduationCap size={14} />
            Education
          </span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
          Where I <span className="text-primary">Studied</span>
        </h2>
        <p className="text-center text-foreground/70 mb-10 max-w-2xl mx-auto">
          Formal training that shaped how I think about software.
        </p>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-card/70 backdrop-blur-sm p-5 md:p-7 shadow-sm">
          {/* Header row */}
          <div className="flex flex-col sm:flex-row items-start gap-4">
            {e.logo && (
              <img
                src={assetUrl(e.logo)}
                alt={`${e.school} logo`}
                className="h-14 w-14 rounded-xl object-contain bg-background border border-border p-1 shrink-0"
                loading="lazy"
                decoding="async"
                onError={(ev) => {
                  (ev.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            )}
            <div className="flex-1 min-w-0 text-left">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 className="text-lg md:text-xl font-semibold">
                  {e.degree}
                </h3>
                {e.honors && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-primary px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                    <Award size={11} />
                    {e.honors}
                  </span>
                )}
              </div>
              <p className="text-primary font-medium">{e.school}</p>
              <p className="text-xs text-foreground/60 mt-1">
                {e.major} · {e.startYear}–{e.endYear}
                {typeof e.gpa === "number" && (
                  <>
                    {" "}· GPA{" "}
                    <span className="font-semibold text-foreground/85">
                      {e.gpa.toFixed(2)}
                      {e.gpaScale ? ` / ${e.gpaScale.toFixed(1)}` : ""}
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Highlights */}
          {e.highlights && e.highlights.length > 0 && (
            <ul className="mt-5 space-y-1.5 text-left">
              {e.highlights.map((h) => (
                <li
                  key={h}
                  className="text-sm text-foreground/85 flex gap-2"
                >
                  <span className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          )}

          {/* Actions */}
          <div className="mt-6 flex flex-wrap gap-2 justify-center sm:justify-start">
            {e.certificate && (
              <button
                type="button"
                onClick={() => setLbOpen(true)}
                className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border border-border bg-background/60 hover:border-primary/40 hover:text-primary transition-colors"
              >
                <Award size={14} />
                View {e.honors ?? "Certificate"}
              </button>
            )}
            {e.publication?.url && (
              <a
                href={e.publication.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border border-border bg-background/60 hover:border-primary/40 hover:text-primary transition-colors"
                title={e.publication.title}
              >
                <FileText size={14} />
                Read {e.publication.venue} Paper
                <ExternalLink size={11} />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox for the cum-laude certificate */}
      <AnimatePresence>
        {lbOpen && e.certificate && (
          <Lightbox
            open={lbOpen}
            close={() => setLbOpen(false)}
            slides={[
              {
                src: assetUrl(e.certificate.image),
                alt: e.certificate.caption,
              },
            ]}
          />
        )}
      </AnimatePresence>
    </section>
  );
};
