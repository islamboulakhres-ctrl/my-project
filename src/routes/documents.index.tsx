import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowUpRight,
  FileText,
  LayoutGrid,
  Plus,
  Rows3,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { AnimatedNumber } from "@/components/motion/AnimatedNumber";
import { Label } from "@/components/kit";
import { eur, type Doc } from "@/lib/data";
import { useStore } from "@/lib/app-store";
import { sfx } from "@/lib/sfx";
import { DocumentsListSkeleton } from "@/components/Skeletons";

export const Route = createFileRoute("/documents/")({
  head: () => ({
    meta: [
      { title: "Documents — Fisco" },
      {
        name: "description",
        content:
          "Every invoice, receipt and tax form you scanned, sorted and ready to send.",
      },
      { property: "og:title", content: "Documents — Fisco" },
      {
        property: "og:description",
        content: "Invoices, receipts and tax forms in one organized vault.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  pendingComponent: DocumentsListSkeleton,
  component: Documents,
});

const EASE = [0.16, 1, 0.3, 1] as const;
const FILTERS = ["All", "Stored", "Pending", "Sent"] as const;
const SORTS = ["Recent", "Value", "Pages"] as const;

type Filter = (typeof FILTERS)[number];
type Sort = (typeof SORTS)[number];

const STATUS_COLOR: Record<Doc["status"], string> = {
  stored: "bg-iris",
  pending: "bg-primary",
  sent: "bg-positive",
};

function Documents() {
  const { docs } = useStore();
  const [filter, setFilter] = useState<Filter>("All");
  const [sort, setSort] = useState<Sort>("Recent");
  const [dense, setDense] = useState(false);
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    const out = docs.filter((d) => {
      const byFilter = filter === "All" || d.status === filter.toLowerCase();
      const term = q.trim().toLowerCase();
      const byQuery =
        !term ||
        d.merchant.toLowerCase().includes(term) ||
        d.category.toLowerCase().includes(term);
      return byFilter && byQuery;
    });
    if (sort === "Value") out.sort((a, b) => b.amount - a.amount);
    if (sort === "Pages") out.sort((a, b) => b.pages - a.pages);
    return out;
  }, [docs, filter, q, sort]);

  const total = list.reduce((s, d) => s + d.amount, 0);
  const pages = list.reduce((s, d) => s + d.pages, 0);
  const counts = {
    stored: docs.filter((d) => d.status === "stored").length,
    pending: docs.filter((d) => d.status === "pending").length,
    sent: docs.filter((d) => d.status === "sent").length,
  };
  const all = Math.max(1, docs.length);

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden">
      {/* ambient light field */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="drift-a absolute -top-40 -left-24 size-[520px] rounded-full bg-primary/16 blur-[110px]" />
        <div className="drift-b absolute top-1/3 -right-32 size-[460px] rounded-full bg-iris/14 blur-[120px]" />
        <div className="drift-a absolute bottom-0 left-1/4 size-[420px] rounded-full bg-positive/10 blur-[120px]" />
      </div>

      <PageHeader title="Vault" back />

      <div className="mx-auto w-full max-w-[1180px] flex-1 px-4 pb-32">
        {/* ---------- hero ---------- */}
        <motion.section
          initial={{ opacity: 0, y: 22, filter: "blur(14px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, ease: EASE }}
          className="glass-ink sheen relative mt-3 overflow-hidden rounded-4xl p-5 sm:p-6"
        >
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="min-w-0">
              <Label className="text-ink-foreground/70">
                {filter === "All" ? "Whole vault" : filter} · {list.length} documents
              </Label>
              <div className="num mt-2 text-[38px] leading-none sm:text-[46px]">
                <AnimatedNumber value={total} format={eur} />
              </div>
              <div className="mt-1.5 text-[12.5px] text-ink-foreground/55">
                {pages} scanned pages in this view
              </div>
            </div>

            <Link
              to="/scan"
              onClick={() => sfx("open")}
              onPointerEnter={() => sfx("hover")}
              className="press group inline-flex h-11 items-center gap-2 rounded-full bg-ink-foreground px-5 text-[13px] font-bold text-ink"
            >
              <Plus className="size-4 transition-transform group-hover:rotate-90" />
              Capture
            </Link>
          </div>

          {/* distribution ribbon */}
          <div className="mt-5 flex h-1.5 gap-1 overflow-hidden rounded-full">
            {(["sent", "pending", "stored"] as const).map((k, i) => (
              <motion.span
                key={k}
                initial={{ width: 0 }}
                animate={{ width: `${(counts[k] / all) * 100}%` }}
                transition={{ delay: 0.25 + i * 0.1, duration: 1, ease: EASE }}
                className={`h-full rounded-full ${STATUS_COLOR[k]}`}
              />
            ))}
          </div>
          <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1">
            {(["sent", "pending", "stored"] as const).map((k) => (
              <span
                key={k}
                className="inline-flex items-center gap-1.5 text-[10.5px] font-bold tracking-[0.1em] text-ink-foreground/60 uppercase"
              >
                <i className={`size-1.5 rounded-full ${STATUS_COLOR[k]}`} />
                {k} · {counts[k]}
              </span>
            ))}
          </div>
        </motion.section>

        {/* ---------- command bar ---------- */}
        <motion.div
          initial={{ opacity: 0, y: 14, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ delay: 0.12, duration: 0.7, ease: EASE }}
          className="glass sticky top-[54px] z-20 mt-3 rounded-3xl p-2"
        >
          <div className="flex items-center gap-2">
            <div className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-full bg-card/60 px-3.5">
              <Search className="size-4 shrink-0 opacity-45" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search merchant or category"
                className="min-w-0 flex-1 bg-transparent text-[13px] font-medium outline-none placeholder:text-muted-foreground"
              />
              <AnimatePresence>
                {q && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    onClick={() => {
                      sfx("tap");
                      setQ("");
                    }}
                    aria-label="Clear search"
                    className="grid size-5 place-items-center rounded-full bg-foreground/10"
                  >
                    <X className="size-3" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={() => {
                sfx("pop");
                setDense((d) => !d);
              }}
              aria-label={dense ? "Grid view" : "List view"}
              className="press grid size-10 shrink-0 place-items-center rounded-full bg-card/60"
            >
              <motion.span
                key={String(dense)}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ duration: 0.35, ease: EASE }}
              >
                {dense ? <LayoutGrid className="size-4" /> : <Rows3 className="size-4" />}
              </motion.span>
            </button>
          </div>

          <div className="no-scrollbar mt-2 flex items-center gap-1.5 overflow-x-auto px-0.5 pb-0.5">
            {FILTERS.map((f) => (
              <Pill key={f} active={f === filter} onClick={() => setFilter(f)} id="doc-filter">
                {f}
              </Pill>
            ))}
            <span className="mx-1 h-4 w-px shrink-0 bg-foreground/10" />
            <SlidersHorizontal className="size-3.5 shrink-0 opacity-40" />
            {SORTS.map((s) => (
              <Pill key={s} active={s === sort} onClick={() => setSort(s)} id="doc-sort" subtle>
                {s}
              </Pill>
            ))}
          </div>
        </motion.div>

        {/* ---------- results ---------- */}
        <motion.div
          layout
          className={
            dense
              ? "mt-3 grid gap-2"
              : "mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3"
          }
        >
          <AnimatePresence mode="popLayout">
            {list.map((d, i) => (
              <motion.div
                key={d.id}
                layout
                initial={{ opacity: 0, y: 20, filter: "blur(12px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                transition={{ delay: Math.min(i, 8) * 0.035, duration: 0.55, ease: EASE }}
              >
                <motion.div whileHover={{ y: -3 }} transition={{ type: "spring", stiffness: 380, damping: 26 }}>
                  <Link
                    to="/documents/$id"
                    params={{ id: d.id }}
                    onPointerEnter={() => sfx("hover")}
                    onClick={() => sfx("open")}
                    preload="intent"
                    className="press glass group relative block overflow-hidden rounded-3xl"
                  >
                    {/* tint aura */}
                    <span
                      aria-hidden
                      className={`pointer-events-none absolute -top-16 -right-10 size-40 rounded-full bg-gradient-to-br opacity-70 blur-3xl transition-opacity duration-500 group-hover:opacity-100 ${d.tint}`}
                    />
                    <div
                      className={`relative flex items-center gap-3 ${dense ? "p-3" : "p-4"}`}
                    >
                      <div className="relative grid size-11 shrink-0 place-items-center rounded-2xl bg-card/80 shadow-soft">
                        <FileText className="size-[16px]" strokeWidth={1.9} />
                        <span
                          className={`absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full ring-2 ring-card ${STATUS_COLOR[d.status]}`}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[14px] leading-tight font-extrabold tracking-tight">
                          {d.merchant}
                        </div>
                        <div className="mt-1 flex items-center gap-1.5 text-[11px] font-semibold text-foreground/45">
                          <span className="rounded-full bg-foreground/6 px-2 py-0.5">
                            {d.category}
                          </span>
                          <span>{d.pages}p</span>
                          <span className="opacity-50">·</span>
                          <span>{d.date}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="num text-[15px] leading-none">
                          {d.amount === 0 ? "—" : eur(d.amount)}
                        </div>
                        <span className="mt-1.5 inline-block text-[9.5px] font-bold tracking-[0.14em] uppercase opacity-45">
                          {d.status}
                        </span>
                      </div>

                      <ArrowUpRight className="size-4 shrink-0 opacity-25 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-70" />
                    </div>
                  </Link>
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        <AnimatePresence>
          {list.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 14, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0 }}
              className="glass mt-3 grid place-items-center gap-2 rounded-3xl p-12 text-center"
            >
              <div className="breathe grid size-12 place-items-center rounded-2xl bg-card/70">
                <FileText className="size-5 opacity-40" />
              </div>
              <Label>Nothing in this view</Label>
              <button
                onClick={() => {
                  sfx("tap");
                  setQ("");
                  setFilter("All");
                }}
                className="text-[12.5px] font-bold text-primary"
              >
                Reset filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Pill({
  children,
  active,
  onClick,
  id,
  subtle,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  id: string;
  subtle?: boolean;
}) {
  return (
    <button
      onClick={() => {
        sfx("pop");
        onClick();
      }}
      onPointerEnter={() => sfx("hover")}
      className={`press relative shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-bold tracking-tight transition-colors ${
        active
          ? subtle
            ? "text-foreground"
            : "text-primary-foreground"
          : "text-muted-foreground"
      }`}
    >
      {active && (
        <motion.span
          layoutId={id}
          className={`absolute inset-0 rounded-full ${subtle ? "bg-card shadow-soft" : "bg-primary shadow-[var(--shadow-accent)]"}`}
          transition={{ type: "spring", stiffness: 440, damping: 34 }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </button>
  );
}
