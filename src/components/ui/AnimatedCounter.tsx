import { useEffect, useRef, useState } from "react";
import { useInView, useMotionValue, animate } from "motion/react";

type Props = {
  to: number;
  duration?: number;
  suffix?: string;
  className?: string;
};

/** Counts from 0 → `to` once, when scrolled into view. */
export const AnimatedCounter = ({ to, duration = 1.6, suffix = "", className }: Props) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const mv = useMotionValue(0);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(mv, to, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, to, duration, mv]);

  return (
    <span ref={ref} className={className}>
      {display}
      {suffix}
    </span>
  );
};
