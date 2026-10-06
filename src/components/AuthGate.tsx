import { useEffect, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Fingerprint, Loader2, Lock, Mail, ShieldCheck, Sparkle } from "lucide-react";
import { useStore } from "@/lib/app-store";
import { lockScroll } from "@/lib/scroll-lock";
import { sfx } from "@/lib/sfx";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Glass sign-in curtain shown once a world (role) has been chosen. */
export function AuthGate() {
  const { role, user, signIn } = useStore();
  /* the curtain exists from the very first paint (the role picker sits on top of
     it), so signing in never flashes the app underneath */
  const open = !user;

  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!open) return;
    return lockScroll();
  }, [open]);

  const valid = /\S+@\S+\.\S+/.test(email) && pass.length >= 4 && (mode === "in" || name.trim());

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!valid || busy) return;
    sfx("confirm");
    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      setDone(true);
      sfx("success");
      window.setTimeout(() => sfx("whoosh"), 220);
      window.setTimeout(() => signIn(email, mode === "up" ? name : undefined), 480);
    }, 650);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[95] overflow-hidden bg-background"
          initial={false}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          {/* drifting light bodies behind the glass */}
          <motion.span
            aria-hidden
            className="pointer-events-none absolute -top-24 -left-16 size-[62vmin] rounded-full"
            style={{
              background:
                "conic-gradient(from 140deg, oklch(0.78 0.15 44), oklch(0.85 0.09 92), oklch(0.8 0.08 210), oklch(0.78 0.15 44))",
              filter: "blur(44px)",
              opacity: 0.5,
            }}
            animate={{ x: [0, 40, 0], y: [0, 26, 0], rotate: 360 }}
            transition={{ duration: 44, repeat: Infinity, ease: "linear" }}
          />
          <motion.span
            aria-hidden
            className="pointer-events-none absolute -right-20 -bottom-24 size-[54vmin] rounded-full"
            style={{
              background:
                "radial-gradient(circle at 40% 40%, oklch(0.7 0.16 300), transparent 68%)",
              filter: "blur(40px)",
              opacity: 0.45,
            }}
            animate={{ x: [0, -30, 0], y: [0, -20, 0] }}
            transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="relative mx-auto flex h-[100dvh] w-full max-w-[520px] flex-col justify-center px-5">
            {/* brand */}
            <motion.div
              initial={{ opacity: 0, y: 18, filter: "blur(14px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.55, ease: EASE }}
              className="mb-5 flex items-center gap-3"
            >
              <motion.span
                className="grid size-11 place-items-center rounded-2xl bg-ink text-ink-foreground"
                animate={{ rotate: [0, 6, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              >
                <Sparkle className="size-5" strokeWidth={2} />
              </motion.span>
              <div>
                <div className="text-[11px] font-bold tracking-[0.28em] uppercase opacity-45">
                  {role === "accountant" ? "Practice access" : "Taxpayer access"}
                </div>
                <div className="serif text-[26px] leading-none">Welcome back</div>
              </div>
            </motion.div>

            {/* card */}
            <motion.div
              layout
              initial={{ opacity: 0, y: 34, filter: "blur(18px)", scale: 0.97 }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
              transition={{ duration: 0.6, delay: 0.05, ease: EASE }}
              className="glass relative overflow-hidden rounded-[34px] p-5"
            >
              {/* mode switch */}
              <div className="relative mb-4 flex rounded-full bg-foreground/6 p-1">
                {(["in", "up"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      sfx("tick");
                      setMode(m);
                    }}
                    onPointerEnter={() => sfx("hover")}
                    className="relative flex-1 rounded-full py-2 text-[12.5px] font-bold tracking-tight"
                  >
                    {mode === m && (
                      <motion.span
                        layoutId="auth-pill"
                        className="absolute inset-0 rounded-full bg-card shadow-soft"
                        transition={{ type: "spring", stiffness: 460, damping: 36 }}
                      />
                    )}
                    <span
                      className={
                        mode === m
                          ? "relative z-10 text-foreground"
                          : "relative z-10 text-muted-foreground"
                      }
                    >
                      {m === "in" ? "Sign in" : "Create account"}
                    </span>
                  </button>
                ))}
              </div>

              <form onSubmit={submit} className="grid gap-2.5">
                <AnimatePresence initial={false}>
                  {mode === "up" && (
                    <motion.div
                      key="name"
                      initial={{ opacity: 0, height: 0, filter: "blur(10px)" }}
                      animate={{ opacity: 1, height: "auto", filter: "blur(0px)" }}
                      exit={{ opacity: 0, height: 0, filter: "blur(10px)" }}
                      transition={{ duration: 0.45, ease: EASE }}
                    >
                      <Field
                        icon={<Fingerprint className="size-4" />}
                        label="Full name"
                        value={name}
                        onChange={setName}
                        type="text"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <Field
                  icon={<Mail className="size-4" />}
                  label="Email"
                  value={email}
                  onChange={setEmail}
                  type="email"
                />
                <Field
                  icon={<Lock className="size-4" />}
                  label="Password"
                  value={pass}
                  onChange={setPass}
                  type="password"
                />

                <motion.button
                  type="submit"
                  disabled={!valid || busy || done}
                  whileHover={{ y: valid ? -2 : 0 }}
                  whileTap={{ scale: valid ? 0.985 : 1 }}
                  onPointerEnter={() => {
                    if (valid) sfx("hover");
                  }}
                  className="press mt-1.5 flex h-13 items-center justify-center gap-2 rounded-full bg-primary text-[14.5px] font-bold text-primary-foreground disabled:opacity-45"
                  style={{ boxShadow: "var(--shadow-accent)" }}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {done ? (
                      <motion.span
                        key="done"
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-2"
                      >
                        <ShieldCheck className="size-4" /> Verified
                      </motion.span>
                    ) : busy ? (
                      <motion.span
                        key="busy"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2"
                      >
                        <Loader2 className="size-4 animate-spin" /> Securing session
                      </motion.span>
                    ) : (
                      <motion.span
                        key="idle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2"
                      >
                        {mode === "in" ? "Sign in" : "Create account"}
                        <ArrowRight className="size-4" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </form>

              <div className="mt-4 flex items-center gap-3">
                <span className="h-px flex-1 bg-foreground/10" />
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-40">
                  or
                </span>
                <span className="h-px flex-1 bg-foreground/10" />
              </div>

              <div className="mt-3 grid gap-2">
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.985 }}
                  onPointerEnter={() => sfx("hover")}
                  onClick={() => {
                    sfx("pop");
                    setEmail("demo@fisco.app");
                    setPass("demo1234");
                  }}
                  className="press glass flex h-12 items-center justify-center gap-2 rounded-full text-[13px] font-bold"
                >
                  <Sparkle className="size-4 text-primary" /> Use demo credentials
                </motion.button>
              </div>

              <p className="mt-4 text-center text-[11px] font-semibold text-muted-foreground">
                Protected session · your documents stay private
              </p>

              {/* success wash */}
              <AnimatePresence>
                {done && (
                  <motion.span
                    className="pointer-events-none absolute inset-0 rounded-[34px] bg-primary/18"
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: EASE }}
                  />
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({
  icon,
  label,
  value,
  onChange,
  type,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type: string;
}) {
  const [focus, setFocus] = useState(false);
  const lifted = focus || value.length > 0;
  return (
    <label className="relative block">
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl"
        animate={{
          boxShadow: focus
            ? "0 0 0 2px color-mix(in oklab, var(--primary) 45%, transparent)"
            : "0 0 0 1px color-mix(in oklab, var(--foreground) 8%, transparent)",
        }}
        transition={{ duration: 0.25 }}
      />
      <span className="absolute top-1/2 left-4 -translate-y-1/2 text-muted-foreground">{icon}</span>
      <motion.span
        className="pointer-events-none absolute left-11 font-semibold text-muted-foreground"
        animate={{
          top: lifted ? 9 : "50%",
          y: lifted ? 0 : "-50%",
          fontSize: lifted ? 10 : 13,
          letterSpacing: lifted ? "0.14em" : "0em",
          opacity: lifted ? 0.6 : 0.85,
        }}
        transition={{ duration: 0.28, ease: EASE }}
      >
        <span className={lifted ? "uppercase" : ""}>{label}</span>
      </motion.span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => {
          setFocus(true);
          sfx("tap");
        }}
        onBlur={() => setFocus(false)}
        className="h-14 w-full rounded-2xl bg-card/70 pt-4 pr-4 pb-1 pl-11 text-[14px] font-semibold outline-none"
      />
    </label>
  );
}
