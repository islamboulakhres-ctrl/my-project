import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  FileText,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { BlurFade } from "@/components/motion/BlurFade";
import { AnimatedNumber } from "@/components/motion/AnimatedNumber";
import { Card, Label, Chip } from "@/components/kit";
import { AreaTrend, Bars, Donut, Heatmap } from "@/components/charts/Charts";
import { ACTIVITY, CADENCE, CATEGORIES, HEATMAP, KPIS, SERIES, eur } from "@/lib/data";
import { sfx } from "@/lib/sfx";

export const Route = createFileRoute("/activity")({
  head: () => ({
    meta: [
      { title: "Spending analytics — taxpayer dashboard" },
      {
        name: "description",
        content:
          "Interactive spending analytics: trend, weekday cadence, category split and capture consistency.",
      },
      { property: "og:title", content: "Spending analytics — taxpayer dashboard" },
      {
        property: "og:description",
        content: "Trend, cadence, category split and capture consistency in one view.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Activity,
});

const RANGES = ["1W", "1M", "4M", "1Y", "ALL"] as const;
const EASE = [0.16, 1, 0.3, 1] as const;

function Activity() {
  const [range, setRange] = useState<(typeof RANGES)[number]>("1Y");
  const [active, setActive] = useState<number | null>(null);
  const [cadence, setCadence] = useState<number | null>(null);
  const [cat, setCat] = useState<number | null>(null);

  const series = SERIES[range] ?? [];
  const total = series.reduce((s, p) => s + p.value, 0);
  const point = active === null ? undefined : series[active];
  const catRow = cat === null ? undefined : CATEGORIES[cat];
  const docsTotal = CADENCE.reduce((s, d) => s + d.value, 0);

  return (
    <div>
      <PageHeader title="Analytics" back />
      <div className="mx-auto w-full max-w-[1180px] px-3.5 pb-32">
        {/* ---------- hero trend ---------- */}
        <BlurFade>
          <Card tone="ink" className="overflow-hidden p-5">
            <div className="flex items-start justify-between">
              <div>
                <Label className="text-ink-foreground">
                  {point ? point.label : range}
                </Label>
                <div className="num mt-1.5 text-[36px] leading-none tracking-tight">
                  <AnimatedNumber value={point ? point.value : total} format={eur} />
                </div>
              </div>
              <Chip tone="positive" className="mt-1">
                <TrendingUp className="size-3" /> +9,4%
              </Chip>
            </div>

            <div className="-mx-1 mt-4 text-primary">
              <AreaTrend
                data={series}
                height={176}
                activeIndex={active}
                onActive={(i) => {
                  sfx("tap");
                  setActive(i);
                }}
              />
            </div>

            <div className="mt-1 flex justify-between px-1 text-[10px] font-bold text-ink-foreground/40">
              {series.map((p, i) => (
                <span key={`${p.label}-${i}`} className={i === active ? "text-ink-foreground" : ""}>
                  {p.label}
                </span>
              ))}
            </div>

            {/* range pill */}
            <div className="mt-4 flex rounded-full bg-ink-foreground/10 p-1">
              {RANGES.map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    sfx("tap");
                    setRange(r);
                    setActive(null);
                  }}
                  className="relative flex-1 py-2 text-[11.5px] font-extrabold tracking-wide"
                >
                  {range === r && (
                    <motion.span
                      layoutId="range-pill"
                      className="absolute inset-0 rounded-full bg-ink-foreground"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span
                    className={
                      range === r
                        ? "relative text-ink"
                        : "relative text-ink-foreground/55"
                    }
                  >
                    {r}
                  </span>
                </button>
              ))}
            </div>
          </Card>
        </BlurFade>

        {/* ---------- KPI row ---------- */}
        <div className="mt-2.5 grid grid-cols-3 gap-2.5">
          {KPIS.map((k, i) => (
            <BlurFade key={k.label} delay={0.05 + i * 0.05} className="h-full">
              <Card className="h-full p-3">
                <Label className="text-[9px]">{k.label}</Label>
                <div className="num mt-1.5 text-[15px] leading-none">
                  <AnimatedNumber value={k.value} format={eur} />
                </div>
                <div
                  className={`mt-1.5 flex items-center gap-1 text-[10px] font-bold ${
                    k.trend >= 0 ? "text-positive" : "text-muted-foreground"
                  }`}
                >
                  {k.trend >= 0 ? (
                    <TrendingUp className="size-3" />
                  ) : (
                    <TrendingDown className="size-3" />
                  )}
                  {k.trend > 0 ? "+" : ""}
                  {k.trend}%
                </div>
              </Card>
            </BlurFade>
          ))}
        </div>

        {/* ---------- bento: cadence + split ---------- */}
        <div className="mt-2.5 grid gap-2.5 lg:grid-cols-2">
          <BlurFade delay={0.12}>
            <Card className="h-full p-4">
              <div className="flex items-baseline justify-between">
                <Label>Capture cadence</Label>
                <span className="num text-[12px] font-bold text-muted-foreground">
                  {cadence === null ? `${docsTotal} docs` : `${CADENCE[cadence]?.value} docs`}
                </span>
              </div>
              <div className="mt-3">
                <Bars
                  data={CADENCE}
                  tone="light"
                  activeIndex={cadence}
                  onActive={(i) => {
                    sfx("tap");
                    setCadence(i);
                  }}
                />
              </div>
            </Card>
          </BlurFade>

          <BlurFade delay={0.16}>
            <Card className="h-full p-4">
              <Label>Category split</Label>
              <div className="mt-3 flex items-center gap-4">
                <div className="relative shrink-0 text-primary">
                  <Donut data={CATEGORIES} activeIndex={cat} />
                  <div className="absolute inset-0 grid place-content-center text-center">
                    <span className="num text-[15px] leading-none">
                      {catRow ? `${catRow.share}%` : "100%"}
                    </span>
                    <span className="mt-1 block max-w-[70px] truncate text-[9.5px] font-bold text-muted-foreground">
                      {catRow ? catRow.name : "of spend"}
                    </span>
                  </div>
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  {CATEGORIES.map((c, i) => (
                    <button
                      key={c.name}
                      onClick={() => {
                        sfx("tap");
                        setCat(cat === i ? null : i);
                      }}
                      className="flex w-full items-center gap-2 text-left"
                    >
                      <span
                        className="size-2 shrink-0 rounded-full bg-primary"
                        style={{ opacity: 1 - i * 0.13 }}
                      />
                      <span
                        className={`min-w-0 flex-1 truncate text-[12px] font-bold ${
                          cat != null && cat !== i ? "opacity-40" : ""
                        }`}
                      >
                        {c.name}
                      </span>
                      <span className="num text-[11.5px] text-muted-foreground">
                        {eur(c.value)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          </BlurFade>
        </div>

        {/* ---------- consistency heatmap ---------- */}
        <BlurFade delay={0.2} className="mt-2.5 block">
          <Card className="p-4">
            <div className="flex items-baseline justify-between">
              <Label>Consistency · 14 weeks</Label>
              <span className="text-[11px] font-bold text-positive">21-day streak</span>
            </div>
            <div className="mt-3 text-primary">
              <Heatmap values={HEATMAP} weeks={14} />
            </div>
          </Card>
        </BlurFade>

        {/* ---------- activity list ---------- */}
        <BlurFade delay={0.24} className="mt-5 block">
          <h2 className="px-1 text-[17px] font-extrabold tracking-tight">Movements</h2>
          <Card className="mt-2 divide-y divide-border/70 p-1.5">
            {ACTIVITY.map((a, i) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, x: -10, filter: "blur(6px)" }}
                whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                viewport={{ once: true }}
                transition={{ delay: 0.04 * i, duration: 0.45, ease: EASE }}
                className="flex items-center gap-3 px-2.5 py-2.5"
              >
                <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-secondary/80">
                  {a.kind === "document" ? (
                    <FileText className="size-4" />
                  ) : a.kind === "appointment" ? (
                    <Clock className="size-4" />
                  ) : a.amount > 0 ? (
                    <ArrowDownLeft className="size-4 text-positive" />
                  ) : (
                    <ArrowUpRight className="size-4" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[14px] font-bold">{a.title}</div>
                  <div className="truncate text-[11.5px] text-muted-foreground">
                    {a.sub} · {a.date} {a.time}
                  </div>
                </div>
                <div className="num shrink-0 text-[14px]">
                  {a.amount === 0
                    ? "—"
                    : `${a.amount > 0 ? "+" : "−"}${eur(Math.abs(a.amount))}`}
                </div>
              </motion.div>
            ))}
          </Card>
        </BlurFade>
      </div>
    </div>
  );
}
