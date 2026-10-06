import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { CalendarClock, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { BlurFade } from "@/components/motion/BlurFade";
import { Card, Chip, Label, Meter } from "@/components/kit";
import { AnalyticsPanel } from "@/components/AnalyticsPanel";
import { CADENCE, eur } from "@/lib/data";

export const Route = createFileRoute("/practice")({
  head: () => ({
    meta: [
      { title: "Practice performance — filings, revenue, deadlines" },
      {
        name: "description",
        content:
          "Revenue, filing throughput and upcoming statutory deadlines for your practice.",
      },
      { property: "og:title", content: "Practice performance — Fisco" },
      {
        property: "og:description",
        content: "Revenue, throughput and deadlines at a glance.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Practice,
});

const DEADLINES = [
  { label: "G50 · monthly VAT", due: "20 Mar", clients: 9, urgency: 82 },
  { label: "Payroll declarations", due: "25 Mar", clients: 4, urgency: 54 },
  { label: "Q1 provisional tax", due: "05 Apr", clients: 12, urgency: 31 },
];

function Practice() {
  return (
    <div>
      <PageHeader title="Practice" right={<span />} />
      <div className="mx-auto w-full max-w-[1100px] px-4 pt-4 pb-32">
        <AnalyticsPanel
          title="Fees invoiced"
          value={18640}
          delta="+8.1%"
          caption="vs February"
          stats={[
            { k: "Filings", v: 34 },
            { k: "Clients", v: 12 },
            { k: "Overdue", v: 2 },
          ]}
        />

        <div className="mt-3 grid gap-2.5 lg:grid-cols-2">
          <BlurFade delay={0.08}>
            <Card className="h-full p-4">
              <div className="flex items-center justify-between">
                <Label>Weekly throughput</Label>
                <Chip tone="accent">
                  <TrendingUp className="size-3" /> steady
                </Chip>
              </div>
              <div className="mt-4 flex h-[130px] items-end gap-2">
                {CADENCE.map((d, i) => (
                  <div key={d.label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(d.value / 14) * 100}%` }}
                      transition={{ delay: 0.05 * i, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                      className="w-full rounded-t-lg bg-gradient-to-t from-primary/35 to-primary"
                    />
                    <span className="text-[10px] font-bold text-muted-foreground">
                      {d.label.slice(0, 1)}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </BlurFade>

          <BlurFade delay={0.12}>
            <Card className="h-full p-4">
              <div className="flex items-center justify-between">
                <Label>Upcoming deadlines</Label>
                <CalendarClock className="size-4 opacity-45" />
              </div>
              <div className="mt-3 grid gap-3.5">
                {DEADLINES.map((d, i) => (
                  <div key={d.label}>
                    <div className="flex items-baseline justify-between text-[12.5px]">
                      <span className="font-bold">{d.label}</span>
                      <span className="num text-muted-foreground">{d.due}</span>
                    </div>
                    <Meter value={d.urgency} delay={0.08 * i} className="mt-1.5" />
                    <div className="mt-1 text-[11px] text-muted-foreground">
                      {d.clients} clients affected
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </BlurFade>
        </div>

        <BlurFade delay={0.16} className="mt-3">
          <Card className="grid gap-3 p-4 sm:grid-cols-3">
            {[
              { k: "Avg fee / client", v: eur(1553) },
              { k: "Avg review time", v: "12 min" },
              { k: "Acceptance rate", v: "94%" },
            ].map((s) => (
              <div key={s.k} className="min-w-0">
                <Label>{s.k}</Label>
                <div className="num mt-1 text-[20px] leading-none font-bold">{s.v}</div>
              </div>
            ))}
          </Card>
        </BlurFade>
      </div>
    </div>
  );
}
