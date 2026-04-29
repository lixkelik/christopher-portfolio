import { Wrench } from "lucide-react";
import { toolkit } from "../data/toolkit";

export const ToolkitSection = () => {
  return (
    <section id="toolkit" className="py-24 px-4 relative">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary/80 uppercase tracking-wider">
            <Wrench size={14} />
            Daily Toolkit
          </span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
          What I <span className="text-primary">Use</span>
        </h2>
        <p className="text-center text-foreground/70 mb-12 max-w-2xl mx-auto">
          The tools, languages, and platforms I reach for every day to ship
          production mobile apps.
        </p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {toolkit.map((cat) => (
            <div
              key={cat.id}
              className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-5 text-left"
            >
              <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground/55 mb-3">
                {cat.label}
              </h3>
              <ul className="flex flex-wrap gap-2">
                {cat.items.map((item) => {
                  const src = item.iconUrl
                    ? item.iconUrl
                    : item.icon
                      ? `https://cdn.simpleicons.org/${item.icon}`
                      : null;
                  return (
                    <li key={`${cat.id}-${item.name}`}>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border bg-background/60 text-xs font-medium text-foreground/85">
                        {src && (
                          <img
                            src={src}
                            alt=""
                            aria-hidden="true"
                            loading="lazy"
                            decoding="async"
                            width={14}
                            height={14}
                            className="h-3.5 w-3.5 object-contain"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).style.display =
                                "none";
                            }}
                          />
                        )}
                        {item.name}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
