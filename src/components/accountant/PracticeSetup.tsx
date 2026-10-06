import { lazy, Suspense, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  Clock,
  Coins,
  Globe,
  MapPin,
  Palmtree,
  Sparkle,
  User,
  Zap,
} from "lucide-react";
import {
  DAYS,
  LANGUAGES,
  SLOTS,
  SPECIALTIES,
  dzd,
  type PracticeProfile,
} from "@/lib/practice-profile";
import { sfx } from "@/lib/sfx";

const LocationPicker = lazy(() => import("./LocationPicker"));

const EASE = [0.16, 1, 0.3, 1] as const;

const STEPS = [
  { key: "identity", title: "Who you are", hint: "Name, photo and story", icon: User },
  { key: "place", title: "Where you work", hint: "Drop your anchor", icon: MapPin },
  { key: "price", title: "What you charge", hint: "Rate and intro call", icon: Coins },
  { key: "time", title: "When you're open", hint: "Days and slots", icon: Clock },
  { key: "extras", title: "How you work", hint: "Holiday and options", icon: Zap },
] as const;

/* ------------------------------ primitives ------------------------------- */

export function Toggle({ on }: { on: boolean }) {
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

function OptionRow({
  icon: Icon,
  label,
  hint,
  on,
  onToggle,
}: {
  icon: typeof Zap;
  label: string;
  hint: string;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        sfx("pop");
        onToggle();
      }}
      onPointerEnter={() => sfx("hover")}
      aria-pressed={on}
      className="press flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors hover:bg-secondary/50"
    >
      <span
        className={`grid size-9 shrink-0 place-items-center rounded-2xl transition-colors ${
          on ? "bg-primary/12 text-primary" : "bg-secondary/80 text-foreground/55"
        }`}
      >
        <Icon className="size-4" strokeWidth={1.9} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13.5px] font-bold">{label}</span>
        <span className="block truncate text-[11px] text-muted-foreground">{hint}</span>
      </span>
      <Toggle on={on} />
    </button>
  );
}

function Pill({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.94 }}
      onPointerEnter={() => sfx("hover")}
      onClick={() => {
        sfx("tick");
        onClick();
      }}
      className={`press relative rounded-full px-3.5 py-1.5 text-[12px] font-bold transition-colors ${
        active ? "text-primary-foreground" : "bg-secondary/70 text-foreground/65"
      }`}
    >
      {active && (
        <motion.span
          layoutId={`pill-${String(children)}`}
          className="absolute inset-0 rounded-full bg-primary"
          transition={{ type: "spring", stiffness: 480, damping: 34 }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  area,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  area?: boolean;
}) {
  const [focus, setFocus] = useState(false);
  const Cmp = area ? "textarea" : "input";
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
        transition={{ duration: 0.22 }}
      />
      <span className="absolute top-2.5 left-4 text-[9.5px] font-bold tracking-[0.16em] text-muted-foreground uppercase">
        {label}
      </span>
      <Cmp
        value={value}
        placeholder={placeholder}
        rows={area ? 3 : undefined}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
          onChange(e.target.value)
        }
        className={`w-full resize-none rounded-2xl bg-card/70 px-4 pt-7 pb-2.5 text-[14px] font-semibold outline-none placeholder:font-medium placeholder:text-muted-foreground/60 ${
          area ? "min-h-[104px]" : "h-16"
        }`}
      />
    </label>
  );
}

/* --------------------------------- form ---------------------------------- */

export function PracticeSetup({
  value,
  onSave,
  onClose,
  mode = "onboard",
}: {
  value: PracticeProfile;
  onSave: (p: PracticeProfile) => void;
  onClose?: () => void;
  mode?: "onboard" | "edit";
}) {
  const [p, setP] = useState<PracticeProfile>(value);
  const [step, setStep] = useState(0);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof PracticeProfile>(k: K, v: PracticeProfile[K]) =>
    setP((prev) => ({ ...prev, [k]: v }));

  const toggleIn = (k: "specialties" | "languages" | "days" | "slots", v: string) =>
    setP((prev) => ({
      ...prev,
      [k]: prev[k].includes(v) ? prev[k].filter((x) => x !== v) : [...prev[k], v],
    }));

  const complete = useMemo(() => {
    const flags = [
      p.name.trim().length > 1,
      p.firm.trim().length > 1,
      p.days.length > 0 && p.slots.length > 0,
      p.price > 0,
      p.specialties.length > 0,
    ];
    return Math.round((flags.filter(Boolean).length / flags.length) * 100);
  }, [p]);

  const canNext = step === 0 ? p.name.trim().length > 1 && p.firm.trim().length > 1 : true;
  const last = step === STEPS.length - 1;

  const next = () => {
    if (!canNext) return;
    if (last) {
      sfx("success");
      setSaved(true);
      window.setTimeout(() => onSave({ ...p, onboarded: true }), 620);
      return;
    }
    sfx("whoosh");
    setStep((s) => s + 1);
  };

  const pickPhoto = (f: File | undefined) => {
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      set("photo", String(reader.result));
      sfx("reveal");
    };
    reader.readAsDataURL(f);
  };

  const Icon = STEPS[step]!.icon;

  return (
    <div className="relative mx-auto flex w-full max-w-[560px] flex-col">
      {/* header */}
      <div className="flex items-center gap-3 px-1 pb-3">
        <motion.span
          key={step}
          initial={{ scale: 0.7, opacity: 0, rotate: -12 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 420, damping: 26 }}
          className="grid size-11 place-items-center rounded-2xl bg-ink text-ink-foreground"
        >
          <Icon className="size-5" strokeWidth={2} />
        </motion.span>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-bold tracking-[0.26em] uppercase opacity-45">
            {mode === "edit" ? "Practice profile" : `Step ${step + 1} of ${STEPS.length}`}
          </div>
          <div className="serif truncate text-[24px] leading-none">{STEPS[step]!.title}</div>
        </div>
        {onClose && (
          <button
            onClick={() => {
              sfx("close");
              onClose();
            }}
            className="press glass rounded-full px-3.5 py-2 text-[12px] font-bold"
          >
            Later
          </button>
        )}
      </div>

      {/* progress rail */}
      <div className="mb-3 flex items-center gap-1.5 px-1">
        {STEPS.map((s, i) => (
          <button
            key={s.key}
            onClick={() => {
              sfx("tick");
              setStep(i);
            }}
            className="h-1.5 flex-1 overflow-hidden rounded-full bg-foreground/10"
            aria-label={s.title}
          >
            <motion.span
              className="block h-full rounded-full bg-primary"
              initial={false}
              animate={{ width: i <= step ? "100%" : "0%" }}
              transition={{ duration: 0.5, ease: EASE }}
            />
          </button>
        ))}
      </div>

      {/* card */}
      <div className="glass relative overflow-hidden rounded-[30px] p-4">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={STEPS[step]!.key}
            initial={{ opacity: 0, x: 26, filter: "blur(12px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: -26, filter: "blur(12px)" }}
            transition={{ duration: 0.38, ease: EASE }}
            className="grid gap-3"
          >
            {step === 0 && (
              <>
                <div className="flex items-center gap-4">
                  <motion.button
                    type="button"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => {
                      sfx("tap");
                      fileRef.current?.click();
                    }}
                    className="relative grid size-20 shrink-0 place-items-center overflow-hidden rounded-full bg-secondary text-muted-foreground"
                  >
                    {p.photo ? (
                      <img src={p.photo} alt="" className="absolute inset-0 size-full object-cover" />
                    ) : (
                      <Camera className="size-6" strokeWidth={1.8} />
                    )}
                    <motion.span
                      aria-hidden
                      className="absolute inset-[-5px] rounded-full border border-primary/40"
                      animate={{ scale: [1, 1.08, 1], opacity: [0.6, 0.2, 0.6] }}
                      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </motion.button>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13.5px] font-bold">Profile photo</div>
                    <p className="mt-0.5 text-[11.5px] text-muted-foreground">
                      Taxpayers pick faster when they can see who they're writing to.
                    </p>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => pickPhoto(e.target.files?.[0])}
                    />
                  </div>
                </div>
                <Field label="Full name" value={p.name} onChange={(v) => set("name", v)} placeholder="Nadia Belkacem" />
                <Field label="Practice name" value={p.firm} onChange={(v) => set("firm", v)} placeholder="Cabinet El Amel" />
                <Field label="Short bio" area value={p.bio} onChange={(v) => set("bio", v)} placeholder="Chartered accountant focused on freelancers…" />
                <div>
                  <div className="mb-2 text-[10px] font-bold tracking-[0.18em] uppercase opacity-50">
                    Specialties
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {SPECIALTIES.map((s) => (
                      <Pill key={s} active={p.specialties.includes(s)} onClick={() => toggleIn("specialties", s)}>
                        {s}
                      </Pill>
                    ))}
                  </div>
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <p className="px-1 text-[12px] text-muted-foreground">
                  Move the map — the anchor drops exactly where clients will find you.
                </p>
                <Suspense
                  fallback={
                    <div className="h-[280px] animate-pulse rounded-[24px] bg-secondary/70" />
                  }
                >
                  <LocationPicker
                    lng={p.lng}
                    lat={p.lat}
                    onChange={(c) => setP((prev) => ({ ...prev, ...c }))}
                    className="h-[280px] rounded-[24px]"
                  />
                </Suspense>
                <Field label="Street address" value={p.address} onChange={(v) => set("address", v)} placeholder="12 Rue Didouche Mourad" />
              </>
            )}

            {step === 2 && (
              <>
                <div className="rounded-[24px] bg-card/60 p-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[10px] font-bold tracking-[0.18em] uppercase opacity-50">
                      Your rate
                    </span>
                    <motion.span
                      key={p.price}
                      initial={{ y: -6, opacity: 0.4 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="num text-[26px] leading-none font-bold"
                    >
                      {dzd(p.price)}
                    </motion.span>
                  </div>
                  <input
                    type="range"
                    min={500}
                    max={20000}
                    step={250}
                    value={p.price}
                    onChange={(e) => set("price", Number(e.target.value))}
                    onPointerUp={() => sfx("tick")}
                    className="mt-4 w-full accent-[var(--primary)]"
                  />
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {(["Per hour", "Per filing", "Monthly retainer"] as const).map((m) => (
                      <Pill key={m} active={p.pricing === m} onClick={() => set("pricing", m)}>
                        {m}
                      </Pill>
                    ))}
                  </div>
                </div>
                <OptionRow
                  icon={Sparkle}
                  label="Free 15-min intro call"
                  hint="Shown as a badge on your profile"
                  on={p.freeIntro}
                  onToggle={() => set("freeIntro", !p.freeIntro)}
                />
                <div className="rounded-[24px] bg-card/60 p-4">
                  <div className="flex items-baseline justify-between text-[12.5px]">
                    <span className="font-bold">Reply within</span>
                    <span className="num font-bold">{p.responseHours} h</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={48}
                    value={p.responseHours}
                    onChange={(e) => set("responseHours", Number(e.target.value))}
                    className="mt-3 w-full accent-[var(--primary)]"
                  />
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div>
                  <div className="mb-2 text-[10px] font-bold tracking-[0.18em] uppercase opacity-50">
                    Working days
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {DAYS.map((d) => (
                      <Pill key={d} active={p.days.includes(d)} onClick={() => toggleIn("days", d)}>
                        {d}
                      </Pill>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="mb-2 text-[10px] font-bold tracking-[0.18em] uppercase opacity-50">
                    Bookable slots
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {SLOTS.map((s) => (
                      <Pill key={s} active={p.slots.includes(s)} onClick={() => toggleIn("slots", s)}>
                        {s}
                      </Pill>
                    ))}
                  </div>
                </div>
                <div className="rounded-[24px] bg-card/60 p-4">
                  <div className="flex items-baseline justify-between text-[12.5px]">
                    <span className="font-bold">Appointment length</span>
                    <span className="num font-bold">{p.slotMinutes} min</span>
                  </div>
                  <input
                    type="range"
                    min={15}
                    max={120}
                    step={15}
                    value={p.slotMinutes}
                    onChange={(e) => set("slotMinutes", Number(e.target.value))}
                    className="mt-3 w-full accent-[var(--primary)]"
                  />
                </div>
                <div className="rounded-[24px] bg-card/60 p-4 text-[12px] text-muted-foreground">
                  <span className="font-bold text-foreground">{p.days.length * p.slots.length}</span>{" "}
                  meeting slots per week · {p.slotMinutes} min each
                </div>
              </>
            )}

            {step === 4 && (
              <>
                <motion.div
                  animate={{
                    backgroundColor: p.holiday
                      ? "color-mix(in oklab, var(--primary) 12%, transparent)"
                      : "color-mix(in oklab, var(--card) 60%, transparent)",
                  }}
                  className="rounded-[24px] p-1"
                >
                  <OptionRow
                    icon={Palmtree}
                    label="Holiday mode"
                    hint={p.holiday ? "Hidden from search, bookings paused" : "You're accepting work"}
                    on={p.holiday}
                    onToggle={() => set("holiday", !p.holiday)}
                  />
                  <AnimatePresence initial={false}>
                    {p.holiday && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.35, ease: EASE }}
                        className="overflow-hidden px-3 pb-3"
                      >
                        <label className="flex items-center justify-between gap-3 rounded-2xl bg-card/70 px-4 py-3">
                          <span className="text-[12.5px] font-bold">Back on</span>
                          <input
                            type="date"
                            value={p.holidayUntil}
                            onChange={(e) => set("holidayUntil", e.target.value)}
                            className="num bg-transparent text-[13px] font-bold outline-none"
                          />
                        </label>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                <div className="grid">
                  <OptionRow
                    icon={Zap}
                    label="Auto-accept bookings"
                    hint="Confirm requests without reviewing them"
                    on={p.autoAccept}
                    onToggle={() => set("autoAccept", !p.autoAccept)}
                  />
                  <OptionRow
                    icon={Globe}
                    label="Remote consultations"
                    hint="Video and chat appointments"
                    on={p.remote}
                    onToggle={() => set("remote", !p.remote)}
                  />
                  <OptionRow
                    icon={MapPin}
                    label="Client visits"
                    hint="You travel to the client's office"
                    on={p.homeVisits}
                    onToggle={() => set("homeVisits", !p.homeVisits)}
                  />
                </div>

                <div className="rounded-[24px] bg-card/60 p-4">
                  <div className="flex items-baseline justify-between text-[12.5px]">
                    <span className="font-bold">Client capacity</span>
                    <span className="num font-bold">{p.maxClients}</span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={120}
                    step={5}
                    value={p.maxClients}
                    onChange={(e) => set("maxClients", Number(e.target.value))}
                    className="mt-3 w-full accent-[var(--primary)]"
                  />
                </div>

                <div>
                  <div className="mb-2 text-[10px] font-bold tracking-[0.18em] uppercase opacity-50">
                    Languages
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {LANGUAGES.map((l) => (
                      <Pill key={l} active={p.languages.includes(l)} onClick={() => toggleIn("languages", l)}>
                        {l}
                      </Pill>
                    ))}
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {/* footer */}
        <div className="mt-4 flex items-center gap-2">
          {step > 0 && (
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                sfx("close");
                setStep((s) => s - 1);
              }}
              className="press glass grid size-12 place-items-center rounded-full"
              aria-label="Back"
            >
              <ArrowLeft className="size-4" />
            </motion.button>
          )}
          <motion.button
            whileHover={{ y: canNext ? -2 : 0 }}
            whileTap={{ scale: canNext ? 0.985 : 1 }}
            disabled={!canNext || saved}
            onClick={next}
            className="press flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-primary text-[14px] font-bold text-primary-foreground disabled:opacity-45"
            style={{ boxShadow: "var(--shadow-accent)" }}
          >
            {saved ? (
              <>
                <Check className="size-4" /> Saved
              </>
            ) : last ? (
              <>
                {mode === "edit" ? "Save profile" : "Open my practice"} <Check className="size-4" />
              </>
            ) : (
              <>
                Continue <ArrowRight className="size-4" />
              </>
            )}
          </motion.button>
        </div>

        <div className="mt-3 flex items-center gap-2 px-1">
          <span className="text-[10px] font-bold tracking-[0.18em] uppercase opacity-45">
            Profile {complete}%
          </span>
          <span className="h-1 flex-1 overflow-hidden rounded-full bg-foreground/10">
            <motion.span
              className="block h-full rounded-full bg-positive"
              animate={{ width: `${complete}%` }}
              transition={{ duration: 0.5, ease: EASE }}
            />
          </span>
        </div>

        <AnimatePresence>
          {saved && (
            <motion.span
              className="pointer-events-none absolute inset-0 rounded-[30px] bg-primary/18"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.55, ease: EASE }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
