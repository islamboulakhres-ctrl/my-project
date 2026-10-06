import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { ArrowUpRight, TrendingUp } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { AnimatedNumber } from "@/components/motion/AnimatedNumber";
import { BlurFade } from "@/components/motion/BlurFade";
import { Card, Label } from "@/components/kit";
import { SERIES, eur } from "@/lib/data";
import { sfx } from "@/lib/sfx";

const RANGES = ["1M", "4M", "1Y"] as const;
type Range = (typeof RANGES)[number];

/**
 * Editorial analytics block — column architecture instead of a stroked curve,
 * so nothing can ever clip against the card edges. Each column is a rounded
 * gradient bar with a hover/tap readout.
 */
export function AnalyticsPanel({
  title,
  value,
  delta,
  caption,
  stats,
}: {
  title: string;
  value: number;
  delta: string;
  caption: string;
  stats: { k: string; v: number | string }[];
}) {
  const [range, setRange] = useState<Range>("1Y");
  const [hover, setHover] = useState<number | null>(null);
  const data = SERIES[range] ?? SERIES["1Y"] ?? [];

  const { bars, min, max } = useMemo(() => {
    const values = data.map((d) => d.value);
    const lo = Math.min(...values);
    const hi = Math.max(...values);
    const span = hi - lo || 1;
    return {
      bars: data.map((d) => ({
        ...d,
        // never fully empty, never full-bleed: 18%..100% of the plot height
        pct: 18 + ((d.value - lo) / span) * 82,
      })),
      min: lo,
      max: hi,
    };
  }, [data]);

  const focus = hover === null ? null : (bars[hover] ?? null);
  const shown = focus ? focus.value : value;

  return (
    <BlurFade>
      <Card tone="ink" className="relative overflow-hidden p-5 sm:p-6">
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -top-24 -left-10 size-64 rounded-full"
          style={{
            background:
              "radial-gradient(closest-side, oklch(0.78 0.15 44 / 0.28), transparent)",
          }}
          animate={{ opacity: [0.5, 0.9, 0.5], scale: [1, 1.1, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Label className="text-ink-foreground">{title}</Label>
              {focus && (
                <span className="rounded-full bg-ink-foreground/12 px-2 py-0.5 text-[10px] font-bold tracking-[0.14em] uppercase text-ink-foreground/70">
                  {focus.label}
                </span>
              )}
            </div>
            <div className="num mt-2 text-[34px] leading-none tracking-tight sm:text-[46px]">
              <AnimatedNumber value={shown} format={(n) => eur(n)} duration={0.6} />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px] font-bold">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-primary-foreground">
                <TrendingUp className="size-3" />
                {delta}
              </span>
              <span className="text-ink-foreground/50">{caption}</span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <div className="flex rounded-full bg-ink-foreground/10 p-0.5">
              {RANGES.map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    sfx("tick");
                    setRange(r);
                    setHover(null);
                  }}
                  onPointerEnter={() => sfx("hover")}
                  className={`relative rounded-full px-2.5 py-1 text-[11px] font-bold ${
                    r === range ? "text-ink" : "text-ink-foreground/55"
                  }`}
                >
                  {r === range && (
                    <motion.span
                      layoutId="analytics-range"
                      className="absolute inset-0 rounded-full bg-ink-foreground"
                      transition={{ type: "spring", stiffness: 460, damping: 36 }}
                    />
                  )}
                  <span className="relative z-10">{r}</span>
                </button>
              ))}
            </div>
            <Link
              to="/activity"
              aria-label="Open insights"
              onClick={() => sfx("open")}
              className="press grid size-9 place-items-center rounded-full bg-ink-foreground/12 transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </div>

        {/* column chart — pure layout, no strokes, so it can never be clipped */}
        <div
          className="relative mt-6 px-1"
          onPointerLeave={() => setHover(null)}
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 bottom-6 flex flex-col justify-between">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className="h-px w-full bg-ink-foreground/8" />
            ))}
          </div>

          <div className="relative flex h-[160px] items-end gap-[3px] sm:h-[210px]">
            {bars.map((b, i) => {
              const on = hover === i;
              return (
                <button
                  key={`${b.label}-${i}`}
                  aria-label={`${b.label} ${eur(b.value)}`}
                  onPointerEnter={() => {
                    if (!on) sfx("hover");
                    setHover(i);
                  }}
                  onClick={() => {
                    sfx("chart");
                    setHover(i);
                  }}
                  className="group relative flex h-full min-w-0 flex-1 items-end"
                >
                  <motion.span
                    key={`${range}-${b.label}`}
                    initial={{ height: "0%", opacity: 0 }}
                    animate={{ height: `${b.pct}%`, opacity: 1 }}
                    transition={{
                      delay: i * 0.035,
                      duration: 0.8,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className={`w-full rounded-t-[6px] transition-colors ${
                      on
                        ? "bg-primary"
                        : "bg-gradient-to-t from-primary/15 to-primary/60"
                    }`}
                  />
                  {on && (
                    <motion.span
                      initial={{ opacity: 0, y: 6, filter: "blur(6px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      style={{ bottom: `calc(${b.pct}% + 8px)` }}
                      className="num pointer-events-none absolute left-1/2 z-10 -translate-x-1/2 rounded-full bg-ink-foreground px-2.5 py-1 text-[11px] font-bold whitespace-nowrap text-ink"
                    >
                      {eur(b.value)}
                    </motion.span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-2 flex items-center justify-between text-[10px] font-bold tracking-[0.12em] uppercase text-ink-foreground/40">
            <span>{bars[0]?.label}</span>
            <span className="num normal-case tracking-normal">
              {eur(min)} – {eur(max)}
            </span>
            <span>{bars[bars.length - 1]?.label}</span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3 border-t border-ink-foreground/10 pt-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.k}
              initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.2 + i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="min-w-0"
            >
              <div className="num text-[22px] leading-none">
                {typeof s.v === "number" ? <AnimatedNumber value={s.v} /> : s.v}
              </div>
              <div className="mt-1 truncate text-[10px] font-bold tracking-[0.14em] uppercase text-ink-foreground/45">
                {s.k}
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
    </BlurFade>
  );
}
