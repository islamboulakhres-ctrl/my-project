import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Receipt, Landmark } from "lucide-react";
import { useStore, type Role } from "@/lib/app-store";
import { lockScroll } from "@/lib/scroll-lock";
import { sfx, onAudioUnlock } from "@/lib/sfx";


const EASE = [0.16, 1, 0.3, 1] as const;

const CHOICES: { role: Role; title: string; hint: string; icon: typeof Receipt }[] = [
  { role: "taxpayer", title: "I pay", hint: "Scan · track · send", icon: Receipt },
  { role: "accountant", title: "I file", hint: "Receive · review · file", icon: Landmark },
];

/** Illustrated first-run role picker: art leads, copy stays minimal. */
export function RoleGate() {
  const { role, setRole } = useStore();
  /* open from the very first paint (SSR included) so no page ever flashes behind it */
  const open = !role;
  const [curtain, setCurtain] = useState(true);

  /* a soft chord as the intro blooms in — the cue schedule starts the moment
     audio is actually allowed, so nothing plays late or piles up */
  useEffect(() => {
    if (!open) return;
    /* no page scrollbar behind the picker */
    const unlock = lockScroll();
    const t = window.setTimeout(() => setCurtain(false), 1700);

    let timers: number[] = [];
    const play = () => {
      timers = [
        window.setTimeout(() => sfx("open"), 0),
        window.setTimeout(() => sfx("bloom"), 200),
        window.setTimeout(() => sfx("reveal"), 900),
        window.setTimeout(() => sfx("whoosh"), 1600),
        window.setTimeout(() => sfx("tick"), 2100),
        window.setTimeout(() => sfx("tick"), 2300),
      ];
    };
    const off = onAudioUnlock(play);
    return () => {
      off();
      unlock();
      window.clearTimeout(t);
      timers.forEach((x) => window.clearTimeout(x));
    };
  }, [open]);



  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] overflow-hidden bg-background"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.45, ease: EASE }}
        >
          {/* ---- cinematic ink curtain, same language as the mode intro ---- */}
          <AnimatePresence>
            {curtain && (
              <motion.div
                className="pointer-events-none absolute inset-0 z-20 grid place-items-center overflow-hidden"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 1.06 }}
                transition={{ duration: 0.8, ease: EASE }}
              >
                <span className="absolute inset-0 bg-ink" />
                <motion.span
                  aria-hidden
                  className="absolute size-[46vmin] rounded-full"
                  style={{
                    background:
                      "conic-gradient(from 180deg, oklch(0.78 0.15 44), oklch(0.85 0.09 92), oklch(0.8 0.08 210), oklch(0.78 0.15 44))",
                    filter: "blur(34px)",
                  }}
                  initial={{ scale: 0.15, opacity: 0 }}
                  animate={{ scale: [0.15, 1.3, 1.05], opacity: [0, 0.75, 0.4], rotate: 200 }}
                  transition={{ duration: 2.4, ease: EASE }}
                />
                <div className="relative text-center">
                  <motion.div
                    initial={{ opacity: 0, y: 14, filter: "blur(14px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ delay: 0.35, duration: 0.7, ease: EASE }}
                    className="text-[11px] font-bold tracking-[0.34em] text-ink-foreground/55 uppercase"
                  >
                    Welcome
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 26, filter: "blur(20px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ delay: 0.7, duration: 0.9, ease: EASE }}
                    className="mt-2 text-[34px] leading-[1.05] font-extrabold text-ink-foreground"
                  >
                    Choose your world
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    transition={{ delay: 1.2, duration: 0.8, ease: EASE }}
                    className="mx-auto mt-4 h-px w-24 origin-center bg-ink-foreground/25"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative mx-auto flex h-[100dvh] w-full max-w-[560px] flex-col overflow-hidden px-5 pt-5 pb-6">
            {/* ---- illustrated hero ---- */}
            <div className="relative min-h-0 flex-1">

              <motion.div
                aria-hidden
                initial={{ opacity: 0, scale: 0.88 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.9, delay: 1.35, ease: EASE }}
                className="absolute inset-0 grid place-items-center"
              >
                {/* orbiting halo */}
                <motion.div
                  className="absolute size-[74vw] max-w-[360px] rounded-full border border-foreground/8"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 46, repeat: Infinity, ease: "linear" }}
                >
                  <span className="absolute -top-1.5 left-1/2 size-3 -translate-x-1/2 rounded-full bg-primary" />
                </motion.div>
                <motion.div
                  className="absolute size-[54vw] max-w-[264px] rounded-full border border-foreground/8"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                >
                  <span className="absolute -bottom-1 left-1/2 size-2 -translate-x-1/2 rounded-full bg-ink" />
                </motion.div>

                {/* iridescent sphere */}
                <motion.div
                  className="size-[42vw] max-w-[210px] rounded-full"
                  style={{
                    background:
                      "radial-gradient(38% 38% at 34% 28%, oklch(1 0 0 / 0.95), transparent 62%), conic-gradient(from 210deg, oklch(0.78 0.15 44), oklch(0.85 0.09 92), oklch(0.8 0.08 210), oklch(0.78 0.15 44))",
                    filter: "saturate(1.15)",
                    boxShadow: "0 40px 90px -30px oklch(0.6 0.14 44 / 0.55)",
                  }}
                  animate={{ y: [0, -14, 0], rotate: [0, 8, 0] }}
                  transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* floating document cards */}
                {[
                  { x: -118, y: -108, r: -13, d: 0 },
                  { x: 112, y: -18, r: 10, d: 0.6 },
                  { x: -74, y: 104, r: 7, d: 1.2 },
                ].map((cardPos, i) => (
                  <motion.div
                    key={i}
                    className="glass absolute grid h-16 w-24 gap-1.5 rounded-2xl p-3"
                    style={{ x: cardPos.x, y: cardPos.y, rotate: cardPos.r }}
                    initial={{ opacity: 0, scale: 0.7, filter: "blur(14px)" }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      filter: "blur(0px)",
                      y: [cardPos.y, cardPos.y - 10, cardPos.y],
                    }}
                    transition={{
                      opacity: { duration: 0.8, delay: 1.5 + i * 0.1, ease: EASE },
                      scale: { duration: 0.8, delay: 1.5 + i * 0.1, ease: EASE },
                      filter: { duration: 0.8, delay: 1.5 + i * 0.1 },
                      y: {
                        duration: 7 + i,
                        delay: cardPos.d,
                        repeat: Infinity,
                        ease: "easeInOut",
                      },
                    }}
                  >
                    <span className="h-1.5 w-2/3 rounded-full bg-foreground/20" />
                    <span className="h-1.5 w-full rounded-full bg-foreground/10" />
                    <span className="h-1.5 w-1/2 rounded-full bg-primary/60" />
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* ---- choices ---- */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.5, ease: EASE }}
              className="text-[11px] font-bold tracking-[0.2em] uppercase opacity-45"
            >
              Choose your side
            </motion.div>

            <div className="mt-3 grid gap-2.5">
              {CHOICES.map((c, i) => (
                <motion.button
                  key={c.role}
                  onPointerEnter={() => sfx("hover")}
                  onClick={() => {
                    sfx("confirm");
                    window.setTimeout(() => sfx("success"), 160);
                    window.setTimeout(() => sfx("whoosh"), 320);
                    window.setTimeout(() => setRole(c.role), 120);
                  }}
                  initial={{ opacity: 0, y: 30, filter: "blur(16px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.6, delay: 1.6 + i * 0.1, ease: EASE }}
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.985 }}
                  className="glass group flex items-center gap-3.5 overflow-hidden rounded-[26px] p-4 text-left"
                >
                  <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-ink text-ink-foreground">
                    <c.icon className="size-5" strokeWidth={1.9} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[19px] leading-tight font-extrabold">
                      {c.title}
                    </span>
                    <span className="block text-[12px] font-semibold text-muted-foreground">
                      {c.hint}
                    </span>
                  </span>
                  <motion.span
                    aria-hidden
                    className="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground"
                    animate={{ x: [0, 3, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <ArrowRight className="size-4" />
                  </motion.span>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
