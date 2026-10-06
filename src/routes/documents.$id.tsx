import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  BadgeCheck,
  Check,
  Copy,
  Download,
  FileText,
  Hash,
  Layers,
  Percent,
  Send,
  Share2,
  Sparkles,
  Loader2,
  Calendar,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { AnimatedNumber } from "@/components/motion/AnimatedNumber";
import { Label } from "@/components/kit";
import { eur } from "@/lib/data";
import { useStore } from "@/lib/app-store";
import { sfx } from "@/lib/sfx";
import { DocumentDetailSkeleton } from "@/components/Skeletons";
import { useCalmValue } from "@/lib/motion-prefs";

export const Route = createFileRoute("/documents/$id")({
  head: () => ({
    meta: [
      { title: "Document receipt — Fisco" },
      {
        name: "description",
        content:
          "Open a scanned invoice or receipt and read every line: merchant, line items, tax and total.",
      },
      { property: "og:title", content: "Document receipt — Fisco" },
      {
        property: "og:description",
        content: "Read every line of a scanned invoice or receipt.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  pendingComponent: DocumentDetailSkeleton,
  component: DocumentDetail,
});

const EASE = [0.16, 1, 0.3, 1] as const;

const LINE_LABELS = [
  "Goods & supplies",
  "Service fee",
  "Delivery",
  "Packaging",
  "Maintenance",
  "Consumables",
  "Subscription",
];

/** Deterministic breakdown so a document always reads back the same way. */
function breakdown(id: string, total: number, pages: number) {
  const seed = [...id].reduce((s, c) => s + c.charCodeAt(0), 0);
  const count = Math.max(2, Math.min(5, (seed % 4) + 2));
  const weights = Array.from({ length: count }, (_, i) => ((seed >> i) % 7) + 3);
  const sum = weights.reduce((a, b) => a + b, 0);
  const net = total / 1.19;
  const lines = weights.map((w, i) => ({
    label: LINE_LABELS[(seed + i * 3) % LINE_LABELS.length] ?? "Item",
    qty: ((seed + i) % 3) + 1,
    amount: Math.round(((net * w) / sum) * 100) / 100,
  }));
  return {
    lines,
    net: Math.round(net * 100) / 100,
    vat: Math.round((total - net) * 100) / 100,
    ref: `${id.toUpperCase()}-${(seed % 9000) + 1000}`,
    seed,
    pages,
  };
}

/* ------------------------------- small parts ------------------------------ */

function Stat({
  icon: Icon,
  k,
  v,
  i,
  calm,
}: {
  icon: typeof Hash;
  k: string;
  v: string;
  i: number;
  calm: boolean;
}) {
  return (
    <motion.div
      initial={calm ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: calm ? 0 : 0.12 + i * 0.04, duration: calm ? 0.15 : 0.35, ease: EASE }}
      className="glass min-w-0 rounded-2xl px-3 py-2.5"
    >
      <div className="flex items-center gap-1.5 opacity-45">
        <Icon className="size-3" strokeWidth={2.4} />
        <Label className="text-[8.5px] opacity-100">{k}</Label>
      </div>
      <div className="num mt-1 truncate text-[13px]">{v}</div>
    </motion.div>
  );
}

/** A stack of translucent pages that fans out — the scanned document itself. */
function PageStack({ pages, tint, calm }: { pages: number; tint: string; calm: boolean }) {
  const sheets = Math.min(4, Math.max(1, pages));
  return (
    <div className="relative grid h-[124px] w-[96px] shrink-0 place-items-center">
      {Array.from({ length: sheets }).map((_, i) => (
        <motion.div
          key={i}
          initial={calm ? false : { opacity: 0, y: 16, rotate: 0 }}
          animate={{ opacity: 1, y: 0, rotate: (i - (sheets - 1) / 2) * 6 }}
          transition={{ delay: calm ? 0 : 0.08 + i * 0.05, duration: calm ? 0.15 : 0.5, ease: EASE }}
          className={`glass absolute inset-0 grid content-start gap-1.5 rounded-2xl bg-gradient-to-br p-3 ${tint}`}
          style={{ zIndex: i }}
        >
          <span className="h-1.5 w-2/3 rounded-full bg-foreground/25" />
          <span className="h-1 w-full rounded-full bg-foreground/12" />
          <span className="h-1 w-5/6 rounded-full bg-foreground/12" />
          <span className="h-1 w-1/2 rounded-full bg-primary/50" />
          <span className="mt-auto h-1 w-2/3 rounded-full bg-foreground/10" />
        </motion.div>
      ))}
    </div>
  );
}

function DocumentDetail() {
  const { id } = useParams({ from: "/documents/$id" });
  const navigate = useNavigate();
  const { docs, markSent } = useStore();
  const doc = docs.find((d) => d.id === id);
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);
  const calm = useCalmValue();

  const data = useMemo(
    () => breakdown(id, doc?.amount ?? 0, doc?.pages ?? 1),
    [id, doc?.amount, doc?.pages],
  );

  if (!doc) {
    return (
      <div>
        <PageHeader title="Document" back />
        <div className="mx-auto max-w-[560px] px-4 pt-16 text-center text-sm text-muted-foreground">
          This document is no longer in your vault.
        </div>
      </div>
    );
  }

  const copyRef = async () => {
    sfx("tick");
    try {
      await navigator.clipboard.writeText(data.ref);
      setCopied(true);
      sfx("success");
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      sfx("error");
    }
  };

  const statusTone =
    doc.status === "sent"
      ? { dot: "bg-positive", text: "Filed with your accountant" }
      : doc.status === "pending"
        ? { dot: "bg-primary", text: "Waiting to be sent" }
        : { dot: "bg-iris", text: "Stored in your vault" };

  const maxLine = Math.max(...data.lines.map((l) => l.amount), 1);

  return (
    <div className="relative">
      <PageHeader title={doc.merchant} back />

      {/* document-tinted light behind the glass */}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-x-0 top-0 h-[300px] bg-gradient-to-b ${doc.tint} opacity-70 blur-2xl`}
        style={{ transform: "translateZ(0)" }}
      />

      <div className="relative mx-auto w-full max-w-[560px] px-4 pt-4 pb-44">
        {/* ------------------------------- hero ------------------------------- */}
        <motion.section
          initial={calm ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: calm ? 0.15 : 0.45, ease: EASE }}
          className={`glass relative overflow-hidden rounded-[30px] p-5 ${calm ? "" : "sheen"}`}
        >
          <div className="relative flex items-start gap-4">
            <PageStack pages={doc.pages} tint={doc.tint} calm={calm} />

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className={`size-1.5 rounded-full ${statusTone.dot}`} />
                <span className="truncate text-[10px] font-bold tracking-[0.16em] uppercase opacity-50">
                  {statusTone.text}
                </span>
              </div>

              <h2 className="serif mt-1.5 truncate text-[28px] leading-[1.05]">{doc.merchant}</h2>
              <div className="mt-0.5 text-[12px] font-semibold text-muted-foreground">
                {doc.category} · {doc.date}
              </div>

              <div className="num mt-4 text-[34px] leading-none">
                {doc.amount === 0 ? (
                  "—"
                ) : (
                  <AnimatedNumber value={doc.amount} format={(n) => eur(n)} duration={0.9} />
                )}
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
                <BadgeCheck className="size-3.5 text-positive" strokeWidth={2.3} />
                Read by AI · 98% confidence
              </div>
            </div>
          </div>
        </motion.section>

        {/* ------------------------------ meta grid ---------------------------- */}
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat icon={Hash} k="Reference" v={data.ref} i={0} calm={calm} />
          <Stat icon={Calendar} k="Issued" v={doc.date} i={1} calm={calm} />
          <Stat icon={Layers} k="Pages" v={`${doc.pages}`} i={2} calm={calm} />
          <Stat icon={Percent} k="VAT rate" v="19%" i={3} calm={calm} />
        </div>

        {/* ----------------------------- line items ---------------------------- */}
        <motion.section
          initial={calm ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: calm ? 0 : 0.1, duration: calm ? 0.15 : 0.45, ease: EASE }}
          className="glass mt-3 rounded-[28px] p-4"
        >
          <div className="flex items-center justify-between">
            <Label>Line items</Label>
            <span className="text-[11px] font-bold text-muted-foreground">
              {data.lines.length} entries
            </span>
          </div>

          <div className="mt-2.5 grid gap-1">
            {data.lines.map((l, i) => (
              <motion.div
                key={l.label + i}
                initial={calm || i > 5 ? false : { opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: calm ? 0 : 0.16 + i * 0.05, duration: calm ? 0.12 : 0.4, ease: EASE }}
                className="cv-auto relative overflow-hidden rounded-2xl px-3 py-2.5 transition-colors hover:bg-card/70"
              >
                {/* share-of-total bar, drawn behind the row */}
                <motion.span
                  aria-hidden
                  initial={calm ? false : { scaleX: 0 }}
                  animate={{ scaleX: l.amount / maxLine }}
                  transition={{ delay: calm ? 0 : 0.2 + i * 0.05, duration: calm ? 0.15 : 0.6, ease: EASE }}
                  className="absolute inset-y-0 left-0 w-full origin-left rounded-2xl bg-primary/8"
                />
                <div className="relative flex items-center gap-2">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-card/80">
                    <FileText className="size-3.5 opacity-60" strokeWidth={2} />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[13px] font-bold">{l.label}</span>
                  <span className="num text-[10.5px] opacity-45">×{l.qty}</span>
                  <span className="num shrink-0 text-[13.5px]">{eur(l.amount)}</span>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-3 grid gap-1.5 border-t border-border/70 pt-3">
            <Row k="Subtotal" v={eur(data.net)} />
            <Row k="VAT 19%" v={eur(data.vat)} />
            <div className="mt-1 flex items-center justify-between">
              <span className="text-[13px] font-extrabold">Total</span>
              <span className="num text-[19px]">{doc.amount === 0 ? "—" : eur(doc.amount)}</span>
            </div>
          </div>
        </motion.section>

        {/* ------------------------------ reference ---------------------------- */}
        <motion.section
          initial={calm ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: calm ? 0 : 0.16, duration: calm ? 0.15 : 0.45, ease: EASE }}
          className="glass-ink mt-3 flex items-center gap-3 rounded-[28px] p-4"
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-ink-foreground/12">
            <Sparkles className="size-4" strokeWidth={2} />
          </span>
          <div className="min-w-0 flex-1">
            <Label className="text-ink-foreground">Vault reference</Label>
            <div className="num mt-0.5 truncate text-[13.5px]">{data.ref}</div>
          </div>
          <button
            onClick={copyRef}
            onPointerEnter={() => sfx("hover")}
            aria-label="Copy reference"
            className="press grid size-10 shrink-0 place-items-center rounded-full bg-ink-foreground/12"
          >
            <AnimatePresence mode="wait" initial={false}>
              {copied ? (
                <motion.span
                  key="ok"
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.18 }}
                >
                  <Check className="size-4" strokeWidth={3} />
                </motion.span>
              ) : (
                <motion.span
                  key="copy"
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.18 }}
                >
                  <Copy className="size-4" />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </motion.section>

  {/* ------------------------------ action dock ---------------------------- */}
      <motion.div
        initial={calm ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: calm ? 0 : 0.2, duration: calm ? 0.15 : 0.45, ease: EASE }}
        className="mt-3"
      >
        <div className="glass flex items-center gap-1.5 rounded-full p-1.5">
          <DockBtn onClick={() => sfx("pop")} label="Save">
            <Download className="size-4" />
          </DockBtn>
          <DockBtn onClick={() => sfx("swipe")} label="Share">
            <Share2 className="size-4" />
          </DockBtn>
          <button
            onPointerEnter={() => sfx("hover")}
            disabled={sending}
            onClick={() => {
              if (sending) return;
              sfx("confirm");
              /* optimistic: the row flips to "sent" instantly */
              setSending(true);
              markSent([doc.id]);
              window.setTimeout(() => sfx("success"), 160);
              window.setTimeout(() => void navigate({ to: "/documents" }), 320);
            }}
            className="press flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-primary px-5 text-[13.5px] font-bold text-primary-foreground disabled:opacity-90"
            style={{ boxShadow: "var(--shadow-accent)" }}
          >
            {sending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
            {sending ? "Sending…" : "Send to accountant"}
          </button>
        </div>
      </motion.div>
      </div>

    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between text-[12.5px]">
      <span className="text-muted-foreground">{k}</span>
      <span className="num">{v}</span>
    </div>
  );
}

function DockBtn({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      onPointerEnter={() => sfx("hover")}
      aria-label={label}
      className="press grid size-11 place-items-center rounded-full bg-card/70 text-foreground"
    >
      {children}
    </button>
  );
}
