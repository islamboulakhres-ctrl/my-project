import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  BadgeCheck,
  CalendarClock,
  Clock,
  MapPin,
  MessageSquare,
  Phone,
  ShieldCheck,
  Star,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { BlurFade } from "@/components/motion/BlurFade";
import { AnimatedNumber } from "@/components/motion/AnimatedNumber";
import { Avatar, Btn, Card, Chip, Label, Live, Meter, Stars } from "@/components/kit";
import { Bars } from "@/components/charts/Charts";
import { ACCOUNTANTS } from "@/lib/data";
import { fmtKm } from "@/lib/geo";
import { useStore } from "@/lib/app-store";
import { sfx } from "@/lib/sfx";

export const Route = createFileRoute("/accountants/$id")({
  loader: ({ params }) => {
    const accountant = ACCOUNTANTS.find((a) => a.id === params.id);
    if (!accountant) throw notFound();
    return { accountant };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Accountant unavailable" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const a = loaderData.accountant;
    const description = `${a.firm} · ${a.specialties.join(", ")} · ${a.address}. Rated ${a.rating}/5 by ${a.reviews} clients.`;
    return {
      meta: [
        { title: `${a.firm} — verified accountant` },
        { name: "description", content: description },
        { property: "og:title", content: `${a.firm} — verified accountant` },
        { property: "og:description", content: description },
        { property: "og:type", content: "profile" },
        { name: "twitter:card", content: "summary_large_image" },
        { property: "og:image", content: a.photo },
        { name: "twitter:image", content: a.photo },
      ],
    };
  },
  component: AccountantDetail,
});

const EASE = [0.16, 1, 0.3, 1] as const;

const LOAD = [
  { label: "Sun", value: 7 },
  { label: "Mon", value: 11 },
  { label: "Tue", value: 9 },
  { label: "Wed", value: 13 },
  { label: "Thu", value: 6 },
];

const REVIEWS = [
  {
    name: "Ilyes B.",
    initials: "IB",
    rating: 5,
    when: "2 weeks ago",
    text: "Handled my quarterly VAT in two days. Clear answers, no jargon.",
  },
  {
    name: "Sarah M.",
    initials: "SM",
    rating: 5,
    when: "1 month ago",
    text: "I send receipts from the app and everything comes back filed. Zero stress.",
  },
  {
    name: "Walid T.",
    initials: "WT",
    rating: 4,
    when: "2 months ago",
    text: "Very thorough on deductions. Slightly busy at month end.",
  },
];

const BREAKDOWN = [
  { label: "Responsiveness", value: 96 },
  { label: "Accuracy", value: 92 },
  { label: "Value", value: 88 },
];

function AccountantDetail() {
  const { accountant } = Route.useLoaderData();
  const { ranked, choose, chosenId } = useStore();
  const withDistance = ranked.find((a) => a.id === accountant.id);
  const mine = chosenId === accountant.id;

  return (
    <div>
      <PageHeader title={accountant.firm} back />

      <div className="mx-auto w-full max-w-[760px] px-3.5 pb-36">
        {/* ---------- hero ---------- */}
        <BlurFade>
          <div className="glass relative overflow-hidden rounded-[30px]">
            {/* ambient wash, drifting under the glass */}
            <motion.div
              aria-hidden
              className="pointer-events-none absolute -top-24 -right-16 size-72 rounded-full blur-2xl"
              style={{
                background:
                  "radial-gradient(closest-side, oklch(0.78 0.15 44 / 0.22), transparent)",
              }}
              animate={{ x: [0, -20, 0], y: [0, 14, 0] }}
              transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              aria-hidden
              className="pointer-events-none absolute -bottom-28 -left-16 size-72 rounded-full blur-2xl"
              style={{
                background:
                  "radial-gradient(closest-side, oklch(0.68 0.13 265 / 0.18), transparent)",
              }}
              animate={{ x: [0, 24, 0], y: [0, -12, 0] }}
              transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="relative p-5 sm:p-6">
              <div className="flex items-center gap-3.5">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0, filter: "blur(12px)" }}
                  animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
                  transition={{ duration: 0.7, ease: EASE }}
                >
                  <Avatar
                    src={accountant.photo}
                    initials={accountant.initials}
                    size={72}
                    ring={mine}
                  />
                </motion.div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h2 className="serif truncate text-[26px] leading-[1.05] sm:text-[30px]">
                      {accountant.name}
                    </h2>
                    {accountant.verified && (
                      <BadgeCheck className="size-4 shrink-0 text-primary" />
                    )}
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-muted-foreground">
                    <Stars rating={accountant.rating} className="text-foreground" />
                    <span className="opacity-40">·</span>
                    <span className="num">{accountant.reviews} reviews</span>
                    {withDistance && (
                      <>
                        <span className="opacity-40">·</span>
                        <span className="num">{fmtKm(withDistance.km)}</span>
                      </>
                    )}
                  </div>
                  <div className="mt-2 flex items-center gap-1.5 text-[11.5px] font-bold">
                    {accountant.availableNow ? (
                      <>
                        <Live /> Open now
                      </>
                    ) : (
                      <span className="text-muted-foreground">
                        Next · {accountant.nextSlot}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <motion.span
                aria-hidden
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1.3, delay: 0.3, ease: EASE }}
                className="mt-5 block h-px w-full origin-left bg-gradient-to-r from-foreground/18 to-transparent"
              />

              {/* stat strip */}
              <div className="mt-5 grid grid-cols-3 gap-2.5">
                {[
                  { k: "Rating", v: accountant.rating, f: (n: number) => n.toFixed(1) },
                  { k: "Clients", v: accountant.reviews, f: (n: number) => `${Math.round(n)}` },
                  { k: "Reply", v: 2, f: (n: number) => `${Math.round(n)} h` },
                ].map((s, i) => (
                  <motion.div
                    key={s.k}
                    initial={{ opacity: 0, y: 14, filter: "blur(10px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ delay: 0.1 + i * 0.07, duration: 0.6, ease: EASE }}
                    className="rounded-2xl border border-border/50 bg-card/40 px-3 py-3 backdrop-blur-xl"
                  >
                    <div className="num text-[18px] leading-none">
                      <AnimatedNumber value={s.v} format={s.f} />
                    </div>
                    <Label className="mt-1.5 block text-[8.5px]">
                      {s.k}
                    </Label>
                  </motion.div>
                ))}
              </div>

              <p className="mt-4 text-[13px] leading-relaxed text-muted-foreground">
                {accountant.bio}
              </p>

              <div className="mt-3.5 flex flex-wrap gap-1.5">
                {accountant.specialties.map((s, i) => (
                  <motion.span
                    key={s}
                    initial={{ opacity: 0, y: 8, filter: "blur(6px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ delay: 0.18 + 0.05 * i, duration: 0.5, ease: EASE }}
                    className="rounded-full border border-border/60 bg-card/50 px-2.5 py-1 text-[11px] font-bold backdrop-blur-xl"
                  >
                    {s}
                  </motion.span>
                ))}
              </div>
            </div>
          </div>
        </BlurFade>

        {/* ---------- score breakdown + workload ---------- */}
        <div className="mt-2.5 grid gap-2.5 lg:grid-cols-2">
          <BlurFade delay={0.08}>
            <Card className="h-full p-4">
              <Label>Client scores</Label>
              <div className="mt-3 space-y-3">
                {BREAKDOWN.map((b, i) => (
                  <div key={b.label}>
                    <div className="flex items-baseline justify-between text-[12px] font-bold">
                      <span>{b.label}</span>
                      <span className="num text-muted-foreground">{b.value}%</span>
                    </div>
                    <Meter value={b.value} delay={0.1 + i * 0.1} className="mt-1.5" />
                  </div>
                ))}
              </div>
            </Card>
          </BlurFade>

          <BlurFade delay={0.12}>
            <Card className="h-full p-4">
              <div className="flex items-baseline justify-between">
                <Label>Weekly availability</Label>
                <Chip tone="accent">
                  <CalendarClock className="size-3" /> {accountant.nextSlot}
                </Chip>
              </div>
              <div className="mt-3">
                <Bars data={LOAD} tone="light" height={116} />
              </div>
            </Card>
          </BlurFade>
        </div>

        {/* ---------- practice facts ---------- */}
        <BlurFade delay={0.16} className="mt-2.5 block">
          <div className="grid gap-2.5 sm:grid-cols-2">
            {[
              { icon: MapPin, label: "Address", value: accountant.address },
              { icon: Clock, label: "Hours", value: accountant.hours },
              {
                icon: ShieldCheck,
                label: "Registration",
                value: accountant.verified ? "Ordre des experts · verified" : "Pending verification",
              },
              { icon: Phone, label: "Contact", value: "In-app messaging" },
            ].map((row) => (
              <motion.div
                key={row.label}
                whileHover={{ y: -2 }}
                onPointerEnter={() => sfx("hover")}
                transition={{ type: "spring", stiffness: 320, damping: 26 }}
                className="glass flex items-center gap-3 rounded-[22px] p-3.5"
              >
                <div className="grid size-10 shrink-0 place-items-center rounded-2xl bg-secondary/80">
                  <row.icon className="size-4" strokeWidth={1.9} />
                </div>
                <div className="min-w-0">
                  <Label className="text-[9px]">{row.label}</Label>
                  <div className="truncate text-[13px] font-bold">{row.value}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </BlurFade>

        {/* ---------- reviews ---------- */}
        <BlurFade delay={0.2} className="mt-5 block">
          <div className="flex items-baseline justify-between px-1">
            <h2 className="text-[17px] font-extrabold tracking-tight">Reviews</h2>
            <span className="num flex items-center gap-1 text-[12px] font-bold">
              <Star className="size-3.5 fill-primary text-primary" />
              {accountant.rating.toFixed(1)}
            </span>
          </div>
          <div className="mt-2 grid gap-2.5">
            {REVIEWS.map((r, i) => (
              <motion.div
                key={r.name}
                initial={{ opacity: 0, y: 16, filter: "blur(10px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true }}
                transition={{ delay: 0.05 * i, duration: 0.55, ease: EASE }}
              >
                <Card className="p-3.5">
                  <div className="flex items-center gap-2.5">
                    <Avatar initials={r.initials} size={34} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13px] font-bold">{r.name}</div>
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <Stars rating={r.rating} className="text-foreground" />
                        <span className="opacity-40">·</span>
                        {r.when}
                      </div>
                    </div>
                    <MessageSquare className="size-3.5 shrink-0 opacity-30" />
                  </div>
                  <p className="mt-2 text-[12.5px] leading-relaxed text-muted-foreground">
                    {r.text}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </BlurFade>
      </div>

      {/* ---------- sticky action bar ---------- */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.25, ease: EASE }}
        className="fixed inset-x-0 bottom-[92px] z-40 px-3.5"
      >
        <div className="glass mx-auto flex max-w-[760px] gap-2 rounded-[26px] p-2">
          <Btn
            className="flex-1"
            variant={mine ? "ghost" : "accent"}
            onClick={() => {
              sfx("select");
              choose(accountant.id);
            }}
          >
            {mine ? "Your accountant" : "Choose"}
          </Btn>
          <Link to="/book/$id" params={{ id: accountant.id }} className="flex-1">
            <Btn variant="ink" className="w-full" onClick={() => sfx("tap")}>
              Book a slot
            </Btn>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
