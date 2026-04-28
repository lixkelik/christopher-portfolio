import { useEffect, useRef } from "react";
import { motion, useInView } from "motion/react";
import type { ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  /** Replay every time it scrolls into view (default: false → only once). */
  repeat?: boolean;
  as?: "div" | "section" | "article" | "li";
};

/**
 * Scroll-reveal wrapper. Fades + slides children up when first scrolled into view.
 */
export const Reveal = ({
  children,
  className,
  delay = 0,
  y = 24,
  repeat = false,
  as = "div",
}: RevealProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: !repeat, margin: "-10% 0px -10% 0px" });

  useEffect(() => {
    // no-op; placeholder for future analytics hook
  }, [inView]);

  const MotionTag = motion[as] as typeof motion.div;

  return (
    <MotionTag
      ref={ref}
      className={className}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </MotionTag>
  );
};
