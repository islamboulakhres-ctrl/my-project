import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef, type ReactNode } from "react";
import { useCalmValue } from "@/lib/motion-prefs";

type Props = {
  children: ReactNode;
  delay?: number;
  y?: number;
  blur?: number;
  className?: string;
  once?: boolean;
  inView?: boolean;
};

/** Bugatti-style blur + rise reveal. Used across every screen for entrance motion. */
export function BlurFade({
  children,
  delay = 0,
  y = 18,
  blur = 12,
  className,
  once = true,
  inView = false,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, { once, margin: "-8% 0px -8% 0px" });
  const reduce = useReducedMotion() || useCalmValue();
  const active = inView ? visible : true;

  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y, filter: `blur(${blur}px)` }}
      animate={
        active
          ? { opacity: 1, y: 0, filter: "blur(0px)" }
          : { opacity: 0, y, filter: `blur(${blur}px)` }
      }
      transition={{ duration: 0.75, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
