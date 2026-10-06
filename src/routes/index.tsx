import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  ChevronRight,
  Clock,
  FileText,
  Inbox,
  LineChart,
  ScanLine,
  Send,
  Users,
} from "lucide-react";
import { BlurFade } from "@/components/motion/BlurFade";
import { Avatar, Card, Chip, Label, Meter, Stars } from "@/components/kit";
import { AnalyticsPanel } from "@/components/AnalyticsPanel";
import { ModeSwitchButton } from "@/components/ModeSwitcher";
import { ACTIVITY, CATEGORIES, eur } from "@/lib/data";
import { fmtKm } from "@/lib/geo";
import { useStore } from "@/lib/app-store";
import { sfx } from "@/lib/sfx";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Fisco — Your documents, your accountant, one place" },
      {
        name: "description",
        content:
          "Scan invoices, track purchases and send everything to a nearby accountant in seconds.",
      },
      { property: "og:title", content: "Fisco — Your accounting, organized" },
      {
        property: "og:description",
        content:
          "Scan invoices, track purchases and send everything to a nearby accountant in seconds.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const EASE = [0.16, 1, 0.3, 1] as const;

/** Wide, editorial action row — replaces the old square stacked buttons. */
function ActionCard({
  to,
  icon: Icon,
  eyebrow,
  title,
  badge,
  tone = "light",
}: {
  to: "/scan" | "/send" | "/inbox" | "/clients" | "/practice";
  icon: typeof Send;
  eyebrow: string;
  title: string;
  badge?: string | undefined;
  tone?: "light" | "accent";
}) {
  return (
    <Link to={to} onClick={() => sfx("pop")} className="press block h-full">
      <Card
        tone={tone}
        className="group relative flex h-full items-center gap-3.5 overflow-hidden p-4"
      >
        <span
          className={`grid size-11 shrink-0 place-items-center rounded-2xl ${
            tone === "accent"
              ? "bg-primary-foreground/15 text-primary-foreground"
              : "bg-ink text-ink-foreground"
          }`}
        >
          <Icon className="size-[18px]" strokeWidth={2} />
        </span>
        <span className="min-w-0 flex-1">
          <span
            className={`block text-[10px] font-bold tracking-[0.18em] uppercase ${
              tone === "accent" ? "text-primary-foreground/70" : "opacity-50"
            }`}
          >
            {eyebrow}
          </span>
          <span className="mt-0.5 block truncate text-[16px] leading-tight font-extrabold tracking-[-0.02em]">
            {title}
          </span>
        </span>
        {badge && (
          <span
            className={`num shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${
              tone === "accent"
                ? "bg-primary-foreground/20 text-primary-foreground"
                : "bg-secondary/80"
            }`}
          >
            {badge}
          </span>
        )}
        <ChevronRight
          className={`size-4 shrink-0 transition-transform group-hover:translate-x-0.5 ${
            tone === "accent" ? "text-primary-foreground/70" : "opacity-40"
          }`}
        />
      </Card>
    </Link>
  );
}

function TopBar({ label, mode }: { label: string; mode: string }) {
  const [month, ...rest] = label.split(" ");
  return (
    <BlurFade>
      <div className="glass relative overflow-hidden rounded-[30px] px-5 py-6 sm:px-8 sm:py-8">
        {/* two soft light fields drifting under the glass */}
        <motion.span
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-10 size-64 rounded-full blur-2xl"
          style={{
            background:
              "radial-gradient(closest-side, oklch(0.78 0.15 44 / 0.18), transparent)",
          }}
          animate={{ x: [0, -18, 0], y: [0, 12, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.span
          aria-hidden
          className="pointer-events-none absolute -bottom-28 -left-16 size-72 rounded-full blur-2xl"
          style={{
            background:
              "radial-gradient(closest-side, oklch(0.72 0.11 250 / 0.16), transparent)",
          }}
          animate={{ x: [0, 22, 0], y: [0, -10, 0] }}
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
          <div className="min-w-0">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, ease: EASE }}
              className="block truncate text-[9.5px] font-semibold tracking-[0.34em] text-muted-foreground uppercase"
            >
              {mode} — 2026
            </motion.span>

            <h1 className="mt-2.5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <motion.span
                initial={{ opacity: 0, y: 16, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.9, ease: EASE }}
                className="serif text-[38px] leading-[1] font-normal sm:text-[52px]"
              >
                {month}
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.12, ease: EASE }}
                className="truncate text-[11.5px] font-medium tracking-[0.3em] text-muted-foreground uppercase"
              >
                {rest.join(" ")}
              </motion.span>
            </h1>

            <motion.span
              aria-hidden
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.4, delay: 0.35, ease: EASE }}
              className="mt-5 block h-px w-full origin-left bg-gradient-to-r from-foreground/20 to-transparent"
            />
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <ModeSwitchButton />
            <Link
              to="/profile"
              aria-label="Profile"
              onPointerEnter={() => sfx("hover")}
              onClick={() => sfx("open")}
              className="press grid size-10 place-items-center rounded-full border border-border/70 bg-card/70 text-[11.5px] font-bold backdrop-blur-xl"
            >
              MB
            </Link>
          </div>
        </div>
      </div>
    </BlurFade>
  );
}


function Home() {
  const { role } = useStore();
  return role === "accountant" ? <AccountantHome /> : <TaxpayerHome />;
}

/* ------------------------------- accountant ------------------------------ */

function AccountantHome() {
  const { ranked, docs } = useStore();
  const queue = docs.filter((d) => d.status === "pending").length;

  return (
    <div className="mx-auto w-full max-w-[1180px] px-4 pt-5 pb-32">
      <TopBar label="Practice overview" mode="Accountant" />

      <div className="mt-5 grid gap-2.5 lg:grid-cols-[1.35fr_1fr]">
        <AnalyticsPanel
          title="Fees invoiced"
          value={18640}
          delta="+8.1%"
          caption="vs February"
          stats={[
            { k: "Filings", v: 34 },
            { k: "In queue", v: queue },
            { k: "Clients", v: ranked.length },
          ]}
        />

        <div className="grid content-start gap-2.5">
          <BlurFade delay={0.1}>
            <ActionCard
              to="/inbox"
              icon={Inbox}
              eyebrow="Review"
              title="Client inbox"
              badge={queue ? String(queue) : undefined}
              tone="accent"
            />
          </BlurFade>
          <BlurFade delay={0.14}>
            <ActionCard to="/clients" icon={Users} eyebrow="Portfolio" title="Your clients" />
          </BlurFade>
          <BlurFade delay={0.18}>
            <ActionCard
              to="/practice"
              icon={LineChart}
              eyebrow="Performance"
              title="Practice metrics"
            />
          </BlurFade>
          <BlurFade delay={0.22}>
            <Card className="flex items-center gap-3 p-4">
              <div className="grid size-10 shrink-0 place-items-center rounded-2xl bg-secondary/80">
                <Clock className="size-[17px]" strokeWidth={1.9} />
              </div>
              <div className="min-w-0 flex-1">
                <Label>Next deadline</Label>
                <div className="mt-0.5 truncate text-[14px] font-extrabold">
                  G50 · monthly VAT — 20 Mar
                </div>
              </div>
              <Chip tone="accent">9 clients</Chip>
            </Card>
          </BlurFade>
        </div>
      </div>

      <BlurFade delay={0.08} inView className="mt-7">
        <div className="flex items-end justify-between">
          <div>
            <Label>Needs attention</Label>
            <h2 className="mt-1 text-[20px] font-extrabold">Waiting on you</h2>
          </div>
          <Link to="/inbox" className="text-[12px] font-bold text-primary">
            Open inbox
          </Link>
        </div>
        <Card className="mt-3 divide-y divide-border/70 p-1.5">
          {ACTIVITY.slice(0, 5).map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, x: -10, filter: "blur(8px)" }}
              whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              viewport={{ once: true }}
              transition={{ delay: 0.04 * i, duration: 0.5, ease: EASE }}
              className="flex items-center gap-3 px-2.5 py-2.5"
            >
              <Avatar
                src={ranked[i % ranked.length]?.photo}
                initials={ranked[i % ranked.length]?.initials ?? "—"}
                size={34}
              />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13.5px] font-bold">{a.title}</div>
                <div className="truncate text-[11.5px] text-muted-foreground">{a.sub}</div>
              </div>
              <span className="num text-[13px]">
                {a.amount === 0 ? "—" : eur(Math.abs(a.amount))}
              </span>
            </motion.div>
          ))}
        </Card>
      </BlurFade>
    </div>
  );
}

/* -------------------------------- taxpayer ------------------------------- */

function TaxpayerHome() {
  const { ranked, chosenId, docs, appointment } = useStore();
  const nearest = ranked[0];
  const chosen = ranked.find((a) => a.id === chosenId) ?? nearest;
  const sent = docs.filter((d) => d.status === "sent").length;
  const pending = docs.filter((d) => d.status === "pending").length;
  const top = CATEGORIES.slice(0, 3);

  return (
    <div className="mx-auto w-full max-w-[1180px] px-4 pt-5 pb-32">
      <TopBar label="March overview" mode="Taxpayer" />

      <div className="mt-5 grid gap-2.5 lg:grid-cols-[1.35fr_1fr]">
        <AnalyticsPanel
          title="Purchases this month"
          value={4820.4}
          delta="+12.4%"
          caption="vs February"
          stats={[
            { k: "Docs", v: docs.length },
            { k: "Sent", v: sent },
            { k: "Pending", v: pending },
          ]}
        />

        <div className="grid content-start gap-2.5">
          <BlurFade delay={0.1}>
            <ActionCard
              to="/scan"
              icon={ScanLine}
              eyebrow="Capture"
              title="Scan an invoice"
              tone="accent"
            />
          </BlurFade>
          <BlurFade delay={0.14}>
            <ActionCard
              to="/send"
              icon={Send}
              eyebrow="Hand off"
              title="Send to accountant"
              badge={pending ? String(pending) : undefined}
            />
          </BlurFade>

          <BlurFade delay={0.18}>
            <Card className="flex items-center gap-3 p-4">
              <div className="relative grid size-10 shrink-0 place-items-center rounded-2xl bg-secondary/80">
                <Clock className="size-[17px]" strokeWidth={1.9} />
                <motion.span
                  aria-hidden
                  className="absolute inset-0 rounded-2xl border border-primary/40"
                  animate={{ opacity: [0, 0.8, 0], scale: [0.9, 1.08, 0.9] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
              <div className="min-w-0 flex-1">
                <Label>{appointment ? "Confirmed" : "Next slot"}</Label>
                <div className="mt-0.5 truncate text-[14px] font-extrabold">
                  {appointment
                    ? `${appointment.day} · ${appointment.slot}`
                    : (chosen?.nextSlot ?? "No slot")}
                </div>
              </div>
              <Link
                to="/book/$id"
                params={{ id: chosen?.id ?? "" }}
                className="press rounded-full bg-ink px-3.5 py-2 text-[12px] font-bold text-ink-foreground"
              >
                {appointment ? "Manage" : "Book"}
              </Link>
            </Card>
          </BlurFade>

          <BlurFade delay={0.22}>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <Label>Your accountant</Label>
                <Link to="/map" className="text-[11px] font-bold text-primary">
                  Change
                </Link>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <Avatar src={chosen?.photo} initials={chosen?.initials ?? "—"} size={46} ring />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[14.5px] font-extrabold">{chosen?.firm}</div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
                    <Stars rating={chosen?.rating ?? 0} className="text-foreground" />
                    <span className="opacity-40">·</span>
                    <span className="num">{chosen ? fmtKm(chosen.km) : ""}</span>
                  </div>
                </div>
                <Link
                  to="/accountants/$id"
                  params={{ id: chosen?.id ?? "" }}
                  aria-label="Open profile"
                  className="press grid size-9 place-items-center rounded-full bg-secondary/80"
                >
                  <ChevronRight className="size-4" />
                </Link>
              </div>
            </Card>
          </BlurFade>
        </div>
      </div>

      <BlurFade delay={0.26} className="mt-2.5">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <Label>Where it goes</Label>
            <Link to="/activity" className="text-[11px] font-bold text-primary">
              Insights
            </Link>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-3 sm:gap-5">
            {top.map((c, i) => (
              <div key={c.name}>
                <div className="flex items-baseline justify-between text-[12.5px]">
                  <span className="font-bold">{c.name}</span>
                  <span className="num text-[12px] text-muted-foreground">{eur(c.value)}</span>
                </div>
                <Meter value={c.share} delay={0.1 * i} className="mt-1.5" />
              </div>
            ))}
          </div>
        </Card>
      </BlurFade>

      {/* ---------- nearby rail ---------- */}
      <BlurFade delay={0.08} inView className="mt-7">
        <div className="flex items-end justify-between">
          <div>
            <Label>Nearest to you</Label>
            <h2 className="mt-1 text-[20px] font-extrabold">Around the corner</h2>
          </div>
          <Link to="/map" className="text-[12px] font-bold text-primary">
            Open map
          </Link>
        </div>
        <div className="no-scrollbar -mx-4 mt-3 flex gap-2.5 overflow-x-auto px-4 pb-2">
          {ranked.slice(0, 6).map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 22, filter: "blur(12px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true }}
              transition={{ delay: 0.05 * i, duration: 0.65, ease: EASE }}
            >
              <Link to="/accountants/$id" params={{ id: a.id }} className="press block">
                <Card
                  tone={i === 0 ? "ink" : "light"}
                  className="w-[176px] shrink-0 overflow-hidden p-3.5"
                >
                  <div className="flex items-center gap-2.5">
                    <Avatar src={a.photo} initials={a.initials} size={34} />
                    <div className="min-w-0">
                      <div className="truncate text-[13px] font-extrabold">{a.firm}</div>
                      <div className="num text-[11px] opacity-55">{fmtKm(a.km)}</div>
                    </div>
                  </div>
                  <div className="num mt-4 text-[22px] leading-none">{a.rating.toFixed(1)}</div>
                  <div className="mt-1 text-[10px] font-bold tracking-[0.12em] uppercase opacity-45">
                    {a.reviews} reviews
                  </div>
                  <div className="mt-3">
                    <Chip tone={i === 0 ? "ink" : a.availableNow ? "positive" : "light"}>
                      {a.availableNow ? "Open now" : a.nextSlot}
                    </Chip>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </BlurFade>

      {/* ---------- recent ---------- */}
      <BlurFade delay={0.08} inView className="mt-7">
        <div className="flex items-end justify-between">
          <Label>Latest</Label>
          <Link to="/documents" className="text-[12px] font-bold text-primary">
            All documents
          </Link>
        </div>
        <Card className="mt-3 divide-y divide-border/70 p-1.5">
          {ACTIVITY.slice(0, 5).map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, x: -10, filter: "blur(8px)" }}
              whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              viewport={{ once: true }}
              transition={{ delay: 0.04 * i, duration: 0.5, ease: EASE }}
              className="flex items-center gap-3 px-2.5 py-2.5"
            >
              <div className="grid size-9 place-items-center rounded-xl bg-secondary/80">
                <FileText className="size-[15px]" strokeWidth={1.9} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13.5px] font-bold">{a.title}</div>
                <div className="truncate text-[11.5px] text-muted-foreground">{a.sub}</div>
              </div>
              <span className="num text-[13px]">
                {a.amount === 0 ? "—" : eur(Math.abs(a.amount))}
              </span>
            </motion.div>
          ))}
        </Card>
      </BlurFade>
    </div>
  );
}
