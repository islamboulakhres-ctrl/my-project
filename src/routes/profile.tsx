import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Bell,
  ChevronRight,
  Compass,
  FileText,
  MapPin,
  Shield,
  Volume2,
  Gauge,
  Palmtree,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { BlurFade } from "@/components/motion/BlurFade";
import { AnimatedNumber } from "@/components/motion/AnimatedNumber";
import { Avatar, Label } from "@/components/kit";
import { ModeSwitchCard } from "@/components/ModeSwitcher";
import { useStore } from "@/lib/app-store";
import { useCalm } from "@/lib/motion-prefs";
import { dzd } from "@/lib/practice-profile";
import { sfx, setMuted, isMuted } from "@/lib/sfx";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Your profile — Fisco" },
      {
        name: "description",
        content:
          "Your account, chosen accountant, document totals and privacy settings.",
      },
      { property: "og:title", content: "Your profile — Fisco" },
      {
        property: "og:description",
        content: "Manage your account and your accountant relationship.",
      },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Profile,
});

const EASE = [0.16, 1, 0.3, 1] as const;
const PREF_KEY = "fisco.prefs";

type Prefs = { notifications: boolean; sound: boolean };

function readPrefs(): Prefs {
  if (typeof window === "undefined") return { notifications: true, sound: true };
  try {
    const raw = window.localStorage.getItem(PREF_KEY);
    if (raw) return { notifications: true, sound: true, ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
  return { notifications: true, sound: true };
}

/* ------------------------------- primitives ------------------------------ */

function Toggle({ on }: { on: boolean }) {
  return (
    <span
      aria-hidden
      className={`relative flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-300 ${
        on ? "bg-primary" : "bg-foreground/12"
      }`}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 520, damping: 34 }}
        className="absolute size-5 rounded-full bg-card shadow-soft"
        style={{ left: on ? 22 : 2 }}
      />
    </span>
  );
}

function SettingRow({
  icon: Icon,
  label,
  hint,
  on,
  onToggle,
  delay = 0,
}: {
  icon: typeof Bell;
  label: string;
  hint: string;
  on: boolean;
  onToggle: () => void;
  delay?: number;
}) {
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 12, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ delay, duration: 0.55, ease: EASE }}
      onPointerEnter={() => sfx("hover")}
      onClick={onToggle}
      aria-pressed={on}
      className="press flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-left transition-colors hover:bg-secondary/50"
    >
      <span
        className={`grid size-10 shrink-0 place-items-center rounded-2xl transition-colors ${
          on ? "bg-primary/12 text-primary" : "bg-secondary/80 text-foreground/60"
        }`}
      >
        <Icon className="size-4" strokeWidth={1.9} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[14px] font-bold">{label}</span>
        <span className="block truncate text-[11.5px] text-muted-foreground">{hint}</span>
      </span>
      <Toggle on={on} />
    </motion.button>
  );
}

/* --------------------------------- page ---------------------------------- */

function Profile() {
  const { docs, ranked, chosenId, located, locating, requestLocation, role, practice, savePractice } =
    useStore();
  const chosen = ranked.find((a) => a.id === chosenId) ?? ranked[0];
  const total = docs.reduce((s, d) => s + d.amount, 0);
  const sent = docs.filter((d) => d.status === "sent").length;

  const [prefs, setPrefs] = useState<Prefs>({ notifications: true, sound: true });
  const [toast, setToast] = useState<string | null>(null);
  const [calm, setCalm] = useCalm();

  useEffect(() => {
    const p = readPrefs();
    setPrefs(p);
    setMuted(!p.sound);
  }, []);

  const save = (next: Prefs, message: string) => {
    setPrefs(next);
    setMuted(!next.sound);
    try {
      window.localStorage.setItem(PREF_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
    if (next.sound && isMuted() === false) sfx("select");
    setToast(message);
    window.setTimeout(() => setToast(null), 1800);
  };

  return (
    <div className="relative">
      <PageHeader title="Profile" back right={<span />} />

      {/* ambient wash behind the glass */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[460px] overflow-hidden"
      >
        <motion.span
          className="absolute -top-24 left-[-10%] size-[420px] rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(closest-side, oklch(0.78 0.15 44 / 0.22), transparent)",
          }}
          animate={{ x: [0, 60, 0], y: [0, 24, 0] }}
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.span
          className="absolute -top-10 right-[-12%] size-[420px] rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(closest-side, oklch(0.68 0.13 265 / 0.2), transparent)",
          }}
          animate={{ x: [0, -50, 0], y: [0, 30, 0] }}
          transition={{ duration: 32, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative mx-auto w-full max-w-[760px] px-4 pb-36">
        {/* ------------------------------ identity ----------------------------- */}
        <BlurFade>
          <div className="glass relative overflow-hidden rounded-[30px] px-5 py-7 sm:px-8">
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ scale: 0.85, opacity: 0, filter: "blur(12px)" }}
                animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
                transition={{ duration: 0.8, ease: EASE }}
                className="relative"
              >
                <span className="grid size-16 place-items-center rounded-full bg-ink text-[17px] font-bold text-ink-foreground">
                  MB
                </span>
                <motion.span
                  aria-hidden
                  className="absolute inset-[-6px] rounded-full border border-primary/35"
                  animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.15, 0.5] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                />
              </motion.div>
              <div className="min-w-0">
                <motion.div
                  initial={{ opacity: 0, y: 12, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.8, delay: 0.05, ease: EASE }}
                  className="serif truncate text-[30px] leading-[1] sm:text-[36px]"
                >
                  Malik Boulakhras
                </motion.div>
                <div className="mt-2 truncate text-[10px] font-semibold tracking-[0.28em] text-muted-foreground uppercase">
                  Freelancer — Micro-enterprise
                </div>
              </div>
            </div>

            <motion.span
              aria-hidden
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.3, delay: 0.3, ease: EASE }}
              className="mt-6 block h-px w-full origin-left bg-gradient-to-r from-foreground/18 to-transparent"
            />

            <div className="mt-5 grid grid-cols-3 gap-3">
              {[
                { k: "Documents", v: docs.length, f: (n: number) => `${Math.round(n)}` },
                {
                  k: "Tracked",
                  v: total,
                  f: (n: number) =>
                    `${new Intl.NumberFormat("fr-FR", {
                      notation: "compact",
                      maximumFractionDigits: 1,
                    }).format(n)} €`,
                },
                { k: "Filed", v: sent, f: (n: number) => `${Math.round(n)}` },
              ].map((s, i) => (
                <motion.div
                  key={s.k}
                  initial={{ opacity: 0, y: 14, filter: "blur(10px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ delay: 0.15 + i * 0.08, duration: 0.7, ease: EASE }}
                  className="min-w-0 rounded-2xl border border-border/50 bg-card/40 px-3 py-3 backdrop-blur-xl"
                >
                  <div className="num truncate text-[19px] leading-none">
                    <AnimatedNumber value={s.v} format={s.f} />
                  </div>
                  <div className="mt-2 truncate text-[8.5px] font-semibold tracking-[0.22em] text-muted-foreground uppercase">
                    {s.k}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </BlurFade>

        {/* -------------------------------- mode -------------------------------- */}
        <BlurFade delay={0.06} className="mt-6 block">
          <Label>Mode</Label>
          <ModeSwitchCard />
        </BlurFade>

        {/* ------------------------- practice (accountant) ---------------------- */}
        {role === "accountant" && (
          <BlurFade delay={0.08} className="mt-6 block">
            <Label>Your practice</Label>
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
              className="glass mt-2 rounded-[26px] p-4"
            >
              <div className="flex items-center gap-3">
                <Avatar
                  src={practice.photo ?? undefined}
                  initials={practice.name.slice(0, 2).toUpperCase() || "PR"}
                  size={48}
                  ring
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[15px] font-bold">
                    {practice.firm || "Set up your practice"}
                  </div>
                  <div className="truncate text-[12px] text-muted-foreground">
                    {practice.onboarded
                      ? `${dzd(practice.price)} · ${practice.pricing.toLowerCase()}`
                      : "Name, photo, location, rate and hours"}
                  </div>
                </div>
                <Link
                  to="/practice-profile"
                  onPointerEnter={() => sfx("hover")}
                  onClick={() => sfx("open")}
                  className="press rounded-full bg-ink px-4 py-2 text-[12px] font-bold text-ink-foreground"
                >
                  Edit
                </Link>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                    practice.holiday
                      ? "bg-primary/12 text-primary"
                      : "bg-positive/12 text-positive"
                  }`}
                >
                  <Palmtree className="size-3" />
                  {practice.holiday ? "Holiday mode on" : "Accepting clients"}
                </span>
                <span className="rounded-full bg-secondary/80 px-2.5 py-1 text-[11px] font-bold text-foreground/70">
                  {practice.days.length} days · {practice.slots.length} slots
                </span>
                <span className="rounded-full bg-secondary/80 px-2.5 py-1 text-[11px] font-bold text-foreground/70">
                  Replies in {practice.responseHours} h
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  sfx("pop");
                  savePractice({ ...practice, holiday: !practice.holiday });
                  setToast(practice.holiday ? "Holiday mode off" : "Holiday mode on");
                  window.setTimeout(() => setToast(null), 1800);
                }}
                className="press mt-3 flex w-full items-center justify-between rounded-2xl bg-card/60 px-4 py-3 text-left"
              >
                <span className="text-[13px] font-bold">Holiday mode</span>
                <Toggle on={practice.holiday} />
              </button>
            </motion.div>
          </BlurFade>
        )}

        {/* ---------------------------- accountant ------------------------------ */}
        <BlurFade delay={0.1} className="mt-6 block">
          <Label>Your accountant</Label>
          <motion.div
            whileHover={{ y: -2 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            className="glass mt-2 flex items-center gap-3 rounded-[26px] p-4"
          >
            <Avatar src={chosen?.photo} initials={chosen?.initials ?? "—"} size={48} ring />
            <div className="min-w-0 flex-1">
              <div className="truncate text-[15px] font-bold">{chosen?.firm}</div>
              <div className="truncate text-[12px] text-muted-foreground">{chosen?.name}</div>
            </div>
            <Link
              to="/map"
              onPointerEnter={() => sfx("hover")}
              onClick={() => sfx("open")}
              className="press rounded-full bg-ink px-4 py-2 text-[12px] font-bold text-ink-foreground"
            >
              Change
            </Link>
          </motion.div>
        </BlurFade>

        {/* ------------------------------ settings ------------------------------ */}
        <BlurFade delay={0.14} className="mt-6 block">
          <Label>Settings</Label>
          <div className="glass mt-2 divide-y divide-border/50 rounded-[26px] p-1.5">
            <SettingRow
              icon={Bell}
              label="Reminders"
              hint={prefs.notifications ? "Deadline alerts on" : "No alerts"}
              on={prefs.notifications}
              delay={0.02}
              onToggle={() =>
                save(
                  { ...prefs, notifications: !prefs.notifications },
                  prefs.notifications ? "Reminders off" : "Reminders on",
                )
              }
            />
            <SettingRow
              icon={Gauge}
              label="Reduce motion"
              hint={calm ? "Calm animations — maximum smoothness" : "Full cinematic motion"}
              on={calm}
              delay={0.1}
              onToggle={() => {
                setCalm(!calm);
                setToast(calm ? "Full motion on" : "Reduced motion on");
                window.setTimeout(() => setToast(null), 1800);
              }}
            />
            <SettingRow
              icon={Volume2}
              label="Sound effects"
              hint={prefs.sound ? "Interface sounds on" : "Muted"}
              on={prefs.sound}
              delay={0.06}
              onToggle={() =>
                save({ ...prefs, sound: !prefs.sound }, prefs.sound ? "Sound muted" : "Sound on")
              }
            />
            <motion.button
              type="button"
              initial={{ opacity: 0, y: 12, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.1, duration: 0.55, ease: EASE }}
              onPointerEnter={() => sfx("hover")}
              onClick={() => {
                sfx("tap");
                requestLocation();
                setToast(located ? "Location refreshed" : "Requesting location…");
                window.setTimeout(() => setToast(null), 1800);
              }}
              className="press flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-left transition-colors hover:bg-secondary/50"
            >
              <span
                className={`grid size-10 shrink-0 place-items-center rounded-2xl ${
                  located ? "bg-positive/12 text-positive" : "bg-secondary/80 text-foreground/60"
                }`}
              >
                <Compass className={`size-4 ${locating ? "animate-spin" : ""}`} strokeWidth={1.9} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-bold">Location</span>
                <span className="block truncate text-[11.5px] text-muted-foreground">
                  {locating ? "Locating…" : located ? "Precise distances on" : "Using city centre"}
                </span>
              </span>
              <span className="num shrink-0 text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
                {located ? "On" : "Off"}
              </span>
            </motion.button>

            {[
              { icon: FileText, label: "Document vault", to: "/documents" as const, hint: `${docs.length} files` },
              { icon: MapPin, label: "Nearby accountants", to: "/map" as const, hint: `${ranked.length} around you` },
              { icon: Shield, label: "Privacy & data", to: "/activity" as const, hint: "Stored on this device" },
            ].map((row, i) => (
              <motion.div
                key={row.label}
                initial={{ opacity: 0, y: 12, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ delay: 0.14 + i * 0.05, duration: 0.55, ease: EASE }}
              >
                <Link
                  to={row.to}
                  onPointerEnter={() => sfx("hover")}
                  onClick={() => sfx("open")}
                  className="press group flex items-center gap-3 rounded-2xl px-3.5 py-3 transition-colors hover:bg-secondary/50"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-secondary/80">
                    <row.icon className="size-4" strokeWidth={1.9} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-bold">{row.label}</span>
                    <span className="block truncate text-[11.5px] text-muted-foreground">
                      {row.hint}
                    </span>
                  </span>
                  <ChevronRight className="size-4 shrink-0 opacity-40 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </motion.div>
            ))}
          </div>
        </BlurFade>
      </div>

      {/* --------------------------- feedback toast --------------------------- */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 18, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 12, filter: "blur(10px)" }}
            transition={{ duration: 0.45, ease: EASE }}
            className="glass-ink fixed inset-x-0 bottom-[104px] z-40 mx-auto w-fit rounded-full px-4 py-2 text-[12px] font-bold"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
