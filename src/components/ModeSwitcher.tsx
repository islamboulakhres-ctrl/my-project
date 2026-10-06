import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeftRight, Landmark, Receipt } from "lucide-react";
import { useStore, type Role } from "@/lib/app-store";
import { sfx } from "@/lib/sfx";

const EASE = [0.16, 1, 0.3, 1] as const;

const COPY: Record<Role, { title: string; line: string; icon: typeof Receipt }> = {
  taxpayer: { title: "Your books", line: "capture · track · send", icon: Receipt },
  accountant: { title: "Practice", line: "review · file · advise", icon: Landmark },
};

/** Shared hook: swaps role behind a cinematic intro transition. */
export function useModeSwitch() {
  const { role, setRole } = useStore();
  const navigate = useNavigate();
  const [entering, setEntering] = useState<Role | null>(null);

  const switchTo = useCallback(
    (next: Role) => {
      if (entering) return;
      if (next === role) {
        sfx("tap");
        return;
      }
      sfx("mode");
      setEntering(next);
      // prepare the new route behind the overlay while text is still fully readable
      window.setTimeout(() => {
        setRole(next);
        navigate({ to: "/" });
      }, 5000);
      window.setTimeout(() => sfx("bloom"), 1000);
      // hold the text clear, then fade the overlay out to reveal the new screen
      window.setTimeout(() => {
        setEntering(null);
        sfx("reveal");
      }, 6000);
    },
    [entering, navigate, role, setRole],
  );

  const toggle = useCallback(
    () => switchTo(role === "taxpayer" ? "accountant" : "taxpayer"),
    [role, switchTo],
  );

  return { role, entering, switchTo, toggle };
}

/** Full-screen intro, rendered in a portal so no header/stacking context clips it. */
export function ModeIntro({ entering }: { entering: Role | null }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {entering && (
        <motion.div
          className="pointer-events-none fixed inset-0 z-[200] grid place-items-center overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.06 }}
          transition={{ duration: 1.6, ease: EASE }}
        >
          <motion.span
            className="absolute rounded-full bg-ink"
            initial={{ width: 0, height: 0 }}
            animate={{ width: "280vmax", height: "280vmax" }}
            transition={{ duration: 1.4, ease: EASE }}
          />
          <motion.span
            aria-hidden
            className="absolute size-[46vmin] rounded-full"
            style={{
              background:
                "conic-gradient(from 180deg, oklch(0.78 0.15 44), oklch(0.85 0.09 92), oklch(0.8 0.08 210), oklch(0.78 0.15 44))",
              filter: "blur(34px)",
            }}
            initial={{ scale: 0.15, opacity: 0 }}
            animate={{ scale: [0.15, 1.35, 1.05], opacity: [0, 0.75, 0.35], rotate: 220 }}
            transition={{ duration: 4.8, ease: EASE }}
          />
          <div className="relative text-center">
            <motion.div
              initial={{ opacity: 0, y: 16, filter: "blur(14px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.5, duration: 0.7, ease: EASE }}
              className="text-[11px] font-bold tracking-[0.34em] text-ink-foreground/55 uppercase"
            >
              Entering
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 28, letterSpacing: "0.2em", filter: "blur(18px)" }}
              animate={{ opacity: 1, y: 0, letterSpacing: "-0.04em", filter: "blur(0px)" }}
              transition={{ delay: 0.7, duration: 1.0, ease: EASE }}
              className="mt-2 text-[40px] leading-none font-extrabold text-ink-foreground sm:text-[56px]"
            >
              {COPY[entering].title}
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, y: 10, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 1.3, duration: 0.8, ease: EASE }}
              className="serif mt-1 text-[20px] text-ink-foreground/60 sm:text-[26px]"
            >
              {COPY[entering].line}
            </motion.div>
            <motion.div
              aria-hidden
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ delay: 1.8, duration: 0.9, ease: EASE }}
              className="mx-auto mt-6 h-px w-[160px] origin-center bg-ink-foreground/25"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

/** Header pill: one tap flips to the other world with the intro transition. */
export function ModeSwitchButton({ className }: { className?: string }) {
  const { role, entering, toggle } = useModeSwitch();
  const other = role === "taxpayer" ? "accountant" : "taxpayer";
  return (
    <>
      <button
        type="button"
        aria-label={`Switch to ${other} mode`}
        title={`Switch to ${other} mode`}
        onClick={toggle}
        className={`press glass grid size-10 place-items-center rounded-2xl ${className ?? ""}`}
      >
        <ArrowLeftRight className="size-[17px]" strokeWidth={2} />
      </button>
      <ModeIntro entering={entering} />
    </>
  );
}

/** Profile card: pick a world explicitly, same intro transition. */
export function ModeSwitchCard() {
  const { role, entering, switchTo } = useModeSwitch();
  return (
    <>
      <div className="mt-2 grid gap-2.5">
        {(Object.keys(COPY) as Role[]).map((r) => {
          const active = r === role;
          const Icon = COPY[r].icon;
          return (
            <button
              key={r}
              type="button"
              onClick={() => switchTo(r)}
              className={`press flex items-center gap-3.5 rounded-3xl border p-3.5 text-left transition-colors ${
                active
                  ? "border-primary/40 bg-primary/10"
                  : "border-border/70 bg-card/70 hover:bg-card"
              }`}
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-ink text-ink-foreground">
                <Icon className="size-5" strokeWidth={1.9} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15.5px] leading-tight font-extrabold capitalize">
                  {r}
                </span>
                <span className="block text-[12px] font-semibold text-muted-foreground">
                  {COPY[r].line}
                </span>
              </span>
              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-bold tracking-[0.14em] uppercase ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                {active ? "Current" : "Enter"}
              </span>
            </button>
          );
        })}
      </div>
      <ModeIntro entering={entering} />
    </>
  );
}
