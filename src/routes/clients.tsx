import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { AlertCircle, ChevronRight, FileText, Search } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { BlurFade } from "@/components/motion/BlurFade";
import { Avatar, Card, Chip, Label, Meter, Segmented } from "@/components/kit";
import { TAXPAYERS } from "@/lib/taxpayers";
import { eur } from "@/lib/data";
import { sfx } from "@/lib/sfx";

export const Route = createFileRoute("/clients")({
  head: () => ({
    meta: [
      { title: "Your taxpayers — practice client list" },
      {
        name: "description",
        content:
          "Every taxpayer you file for, with documents received, open items and filing progress.",
      },
      { property: "og:title", content: "Your taxpayers — Fisco for accountants" },
      {
        property: "og:description",
        content: "Track filing progress and open items per taxpayer.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Clients,
});

const EASE = [0.16, 1, 0.3, 1] as const;
const FILTERS = ["All", "Needs action", "On track"] as const;

function Clients() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");

  const clients = useMemo(
    () =>
      TAXPAYERS.filter((c) =>
        `${c.name} ${c.kind} ${c.city}`.toLowerCase().includes(q.trim().toLowerCase()),
      ).filter((c) =>
        filter === "All" ? true : filter === "Needs action" ? c.open > 0 : c.open === 0,
      ),
    [q, filter],
  );

  const openItems = TAXPAYERS.reduce((s, c) => s + c.open, 0);

  return (
    <div>
      <PageHeader title="Taxpayers" right={<span />} />
      <div className="mx-auto w-full max-w-[980px] px-4 pt-4 pb-32">
        <BlurFade>
          <div className="glass flex flex-wrap items-center gap-2 rounded-[26px] p-3">
            <div className="flex h-11 min-w-[200px] flex-1 items-center gap-2 rounded-full bg-card/70 px-4">
              <Search className="size-4 opacity-45" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search a taxpayer"
                className="min-w-0 flex-1 bg-transparent text-[13px] font-medium outline-none placeholder:text-muted-foreground"
              />
            </div>
            <Segmented options={FILTERS} value={filter} onChange={setFilter} />
          </div>
        </BlurFade>

        <BlurFade delay={0.05} className="mt-2.5 block">
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { k: "Taxpayers", v: `${TAXPAYERS.length}` },
              { k: "Open items", v: `${openItems}` },
              { k: "Documents", v: `${TAXPAYERS.reduce((s, c) => s + c.docs, 0)}` },
            ].map((s) => (
              <Card key={s.k} tone="glass" className="p-3.5">
                <Label>{s.k}</Label>
                <div className="num mt-1 text-[20px] leading-none font-bold">{s.v}</div>
              </Card>
            ))}
          </div>
        </BlurFade>

        <div className="mt-3 grid gap-2.5 md:grid-cols-2 xl:grid-cols-3">
          {clients.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: Math.min(0.04 * i, 0.24), duration: 0.5, ease: EASE }}
            >
              <Link
                to="/chat"
                onPointerEnter={() => sfx("hover")}
                onClick={() => sfx("reveal")}
                className="press block h-full"
              >
                <Card tone="glass" className="h-full p-4">
                  <div className="flex items-center gap-3">
                    <Avatar src={c.photo} initials={c.initials} size={42} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[14px] font-extrabold">{c.name}</div>
                      <div className="truncate text-[11.5px] text-muted-foreground">
                        {c.kind} · {c.city}
                      </div>
                    </div>
                    <ChevronRight className="size-4 opacity-40" />
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    <Chip tone={c.open > 0 ? "accent" : "positive"}>
                      {c.open > 0 ? (
                        <>
                          <AlertCircle className="size-3" /> {c.open} open items
                        </>
                      ) : (
                        "All clear"
                      )}
                    </Chip>
                    <Chip>{c.plan}</Chip>
                    <Chip>
                      <FileText className="size-3" /> {c.docs}
                    </Chip>
                  </div>

                  <div className="mt-3.5">
                    <div className="flex items-baseline justify-between text-[11.5px]">
                      <Label>Filing progress</Label>
                      <span className="num font-bold">{c.progress}%</span>
                    </div>
                    <Meter value={c.progress} delay={0.05 * i} className="mt-1.5" />
                  </div>

                  <div className="mt-3 flex items-baseline justify-between border-t border-border/70 pt-3">
                    <span className="text-[11px] text-muted-foreground">
                      VAT due {c.vatDue} · {c.lastActive}
                    </span>
                    <span className="num text-[14px] font-bold">{eur(c.billed)}</span>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {clients.length === 0 && (
          <div className="glass mt-6 rounded-[26px] p-8 text-center text-[13px] text-muted-foreground">
            No taxpayer matches that search.
          </div>
        )}
      </div>
    </div>
  );
}
