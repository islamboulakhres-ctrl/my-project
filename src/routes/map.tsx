import { createFileRoute, Link, ClientOnly } from "@tanstack/react-router";
import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Crosshair,
  Navigation,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { BottomSheet, type SheetState } from "@/components/BottomSheet";
import { BlurFade } from "@/components/motion/BlurFade";
import { Avatar, Btn, Chip, IconBtn, Live, Stars } from "@/components/kit";
import { fmtKm } from "@/lib/geo";
import { sfx } from "@/lib/sfx";
import { useStore } from "@/lib/app-store";
import { useIsMobile } from "@/hooks/use-mobile";
import { MapSkeleton } from "@/components/map/MapSkeleton";

const MapCanvas = lazy(() => import("@/components/map/MapCanvas"));

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "Accountants near you — Fisco" },
      {
        name: "description",
        content:
          "A real map of verified accountants around you, ranked by distance and availability.",
      },
      { property: "og:title", content: "Accountants near you — Fisco" },
      {
        property: "og:description",
        content: "Find and pick a verified accountant close to you.",
      },
    ],
  }),
  component: MapScreen,
});

/** Snap heights follow the viewport so the sheet can never swallow the screen. */
function useSnaps() {
  const [snaps, setSnaps] = useState({ collapsed: 128, half: 330, full: 520 });
  useEffect(() => {
    const compute = () => {
      const h = window.innerHeight;
      setSnaps({
        collapsed: 128,
        half: Math.round(Math.min(Math.max(h * 0.42, 260), 380)),
        full: Math.round(Math.min(h * 0.72, h - 132)),
      });
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);
  return snaps;
}

const EASE = [0.16, 1, 0.3, 1] as const;
const FILTERS = ["Nearest", "Open now", "Top rated"] as const;
const RADII = [2, 5, 10, 25] as const;

function MapScreen() {
  const { ranked, position, choose, chosenId, locating, requestLocation } = useStore();
  const [selected, setSelected] = useState<string | null>(chosenId);
  const [sheet, setSheet] = useState<SheetState>("half");
  const isMobile = useIsMobile();
  const SNAPS = useSnaps();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("Nearest");
  const [route, setRoute] = useState<{ km: number; min: number } | null>(null);
  const [radius, setRadius] = useState<(typeof RADII)[number] | null>(null);

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    const filtered = ranked.filter((a) => {
      const match = `${a.firm} ${a.name} ${a.specialties.join(" ")}`
        .toLowerCase()
        .includes(term);
      const byFilter = filter === "Open now" ? a.availableNow : true;
      const byRadius = radius === null ? true : a.km <= radius;
      return match && byFilter && byRadius;
    });
    return filter === "Top rated"
      ? [...filtered].sort((x, y) => y.rating - x.rating)
      : filtered;
  }, [ranked, q, filter, radius]);

  const items = useMemo(
    () =>
      list.map((a) => ({
        id: a.id,
        firm: a.firm,
        photo: a.photo,
        initials: a.initials,
        lng: a.lng,
        lat: a.lat,
        km: a.km,
        availableNow: a.availableNow,
      })),
    [list],
  );

  const active = list.find((a) => a.id === selected) ?? null;

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden">
      <ClientOnly fallback={<MapSkeleton />}>
        <Suspense fallback={<MapSkeleton />}>
          <MapCanvas
            user={position}
            items={items}
            selectedId={selected}
            onSelect={(id) => {
              sfx(id ? "reveal" : "swipe");
              setSelected(id);
            }}
            onRoute={(r) => {
              if (r) sfx("route");
              setRoute(r);
            }}
            padBottom={isMobile ? SNAPS[sheet] + 40 : 40}
            padLeft={isMobile ? 0 : 440}
            className="absolute inset-0"
          />
        </Suspense>
      </ClientOnly>

      {/* soft vignette so the floating chrome stays readable over the map */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-40"
        style={{
          background:
            "linear-gradient(to bottom, oklch(0.955 0.005 275 / 0.85), transparent)",
        }}
      />

      {/* floating search + controls */}
      <BlurFade className="pointer-events-none absolute inset-x-0 top-0 z-20 px-4 pt-4 md:pl-[440px]">
        <div className="pointer-events-auto mx-auto w-full max-w-[720px]">
          <div className="flex items-center gap-2">
            <div className="glass flex h-11 flex-1 items-center gap-2 rounded-full px-4">
              <Search className="size-4 opacity-45" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Firm, name or specialty"
                className="min-w-0 flex-1 bg-transparent text-[13px] font-medium outline-none placeholder:text-muted-foreground"
              />
              {q && (
                <button
                  onClick={() => setQ("")}
                  className="text-[11px] font-bold text-muted-foreground"
                >
                  Clear
                </button>
              )}
            </div>
            <IconBtn
              aria-label="Center on my location"
              onClick={requestLocation}
              className="size-11"
            >
              <Crosshair className={locating ? "size-[17px] animate-spin" : "size-[17px]"} />
            </IconBtn>
          </div>

          <div className="no-scrollbar mt-2 flex gap-1.5 overflow-x-auto">
            {FILTERS.map((f) => {
              const on = f === filter;
              return (
                <button
                  key={f}
                  onClick={() => {
                    sfx("tap");
                    setFilter(f);
                  }}
                  className={`press relative shrink-0 rounded-full px-3 py-1.5 text-[11.5px] font-bold ${
                    on ? "text-primary-foreground" : "glass text-foreground/70"
                  }`}
                >
                  {on && (
                    <motion.span
                      layoutId="map-filter"
                      className="absolute inset-0 rounded-full bg-primary"
                      transition={{ type: "spring", stiffness: 440, damping: 34 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    {f === "Nearest" && <Navigation className="size-3" />}
                    {f === "Open now" && <Live />}
                    {f === "Top rated" && <SlidersHorizontal className="size-3" />}
                    {f}
                  </span>
                </button>
              );
            })}
          </div>

          {/* distance radius */}
          <div className="no-scrollbar mt-1.5 flex gap-1.5 overflow-x-auto">
            <button
              onClick={() => {
                sfx("tap");
                setRadius(null);
              }}
              className={`press shrink-0 rounded-full px-3 py-1.5 text-[11px] font-bold ${
                radius === null ? "bg-ink text-ink-foreground" : "glass text-foreground/70"
              }`}
            >
              Any km
            </button>
            {RADII.map((r) => (
              <button
                key={r}
                onClick={() => {
                  sfx("tap");
                  setRadius(radius === r ? null : r);
                }}
                className={`press num shrink-0 rounded-full px-3 py-1.5 text-[11px] font-bold ${
                  radius === r ? "bg-ink text-ink-foreground" : "glass text-foreground/70"
                }`}
              >
                ≤ {r} km
              </button>
            ))}
          </div>
        </div>
      </BlurFade>

      {/* live route readout — sits just above the sheet so it never covers the filters */}
      <AnimatePresence>
        {active && route && (
          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.94, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 14, scale: 0.94, filter: "blur(10px)" }}
            transition={{ duration: 0.5, ease: EASE }}
            style={{ bottom: isMobile ? SNAPS[sheet] + 18 : 116 }}
            className="glass-ink pointer-events-none absolute left-1/2 z-40 flex -translate-x-1/2 items-center rounded-full px-3.5 py-2 whitespace-nowrap shadow-lg md:left-[calc(50%+200px)]"

          >
            <Navigation className="mr-2 size-3.5 text-primary" />
            <span className="num text-[13px]">{route.km.toFixed(1)} km</span>
            <span className="mx-2 opacity-30">·</span>
            <span className="num text-[13px]">{route.min} min drive</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* sheet (mobile) / side panel (desktop) */}
      {isMobile ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex justify-center">
          <div className="w-full max-w-[720px]">
            <BottomSheet
              snaps={SNAPS}
              state={sheet}
              onStateChange={(s) => {
                if (s !== sheet) sfx("whoosh");
                setSheet(s);
              }}
              onToggle={() => {
                sfx("whoosh");
                setSheet(sheet === "collapsed" ? "half" : "collapsed");
              }}
              collapsed={sheet === "collapsed"}
            >
          <AnimatePresence mode="wait" initial={false}>
            {active ? (
              <motion.div
                key={active.id}
                initial={{ opacity: 0, y: 18, filter: "blur(12px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -12, filter: "blur(12px)" }}
                transition={{ duration: 0.45, ease: EASE }}
                className="px-4 pb-28"
              >
                <div className="flex items-start gap-3">
                  <Avatar
                    src={active.photo}
                    initials={active.initials}
                    size={54}
                    ring={active.id === chosenId}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="truncate text-[18px] leading-tight font-extrabold">
                        {active.firm}
                      </h2>
                      {active.availableNow && <Live />}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-muted-foreground">
                      <Stars rating={active.rating} className="text-foreground" />
                      <span className="opacity-40">·</span>
                      <span className="num">{fmtKm(active.km)}</span>
                      <span className="opacity-40">·</span>
                      <span>{active.name}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {active.specialties.slice(0, 3).map((s) => (
                    <Chip key={s}>{s}</Chip>
                  ))}
                </div>

                <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
                  {active.bio}
                </p>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Btn
                    onClick={() => {
                      sfx("select");
                      choose(active.id);
                    }}
                    variant={active.id === chosenId ? "ghost" : "accent"}
                  >
                    {active.id === chosenId ? (
                      <>
                        <Check className="size-4" /> Your accountant
                      </>
                    ) : (
                      "Choose"
                    )}
                  </Btn>
                  <Link to="/accountants/$id" params={{ id: active.id }}>
                    <Btn variant="ink" className="w-full">
                      Profile
                    </Btn>
                  </Link>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0, y: 14, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, filter: "blur(10px)" }}
                transition={{ duration: 0.4, ease: EASE }}
                className="px-4 pb-28"
              >
                <div className="flex items-baseline justify-between">
                  <h2 className="text-[17px] font-extrabold">
                    {list.length} nearby
                  </h2>
                  <span className="text-[11px] font-bold tracking-wide uppercase text-muted-foreground">
                    {filter}
                  </span>
                </div>
                <div className="mt-2 divide-y divide-border/70">
                  {list.map((a, i) => (
                    <motion.button
                      key={a.id}
                      onClick={() => {
                        sfx("reveal");
                        setSelected(a.id);
                      }}
                      initial={{ opacity: 0, x: -12, filter: "blur(8px)" }}
                      animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                      transition={{ delay: 0.04 * i, duration: 0.5, ease: EASE }}
                      className="flex w-full items-center gap-3 py-3 text-left"
                    >
                      <Avatar src={a.photo} initials={a.initials} size={40} />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[14px] font-bold">{a.firm}</div>
                        <div className="mt-0.5 flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
                          <Stars rating={a.rating} className="text-foreground" />
                          <span className="opacity-40">·</span>
                          <span>{a.availableNow ? "Open now" : a.nextSlot}</span>
                        </div>
                      </div>
                      <span className="num text-[13px] text-muted-foreground">
                        {fmtKm(a.km)}
                      </span>
                    </motion.button>
                  ))}
                  {list.length === 0 && (
                    <p className="py-6 text-center text-[13px] text-muted-foreground">
                      Nothing matches that search yet.
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
            </BottomSheet>
          </div>
        </div>
      ) : (
        <div className="pointer-events-none absolute inset-y-0 left-0 z-30 hidden w-[400px] p-5 md:block">
          <div className="glass pointer-events-auto no-scrollbar flex h-full flex-col overflow-y-auto rounded-[30px] pt-5">
        <AnimatePresence mode="wait" initial={false}>
          {active ? (
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: 18, filter: "blur(12px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -12, filter: "blur(12px)" }}
              transition={{ duration: 0.45, ease: EASE }}
              className="px-4 pb-28"
            >
              <div className="flex items-start gap-3">
                <Avatar
                  src={active.photo}
                  initials={active.initials}
                  size={54}
                  ring={active.id === chosenId}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="truncate text-[18px] leading-tight font-extrabold">
                      {active.firm}
                    </h2>
                    {active.availableNow && <Live />}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-muted-foreground">
                    <Stars rating={active.rating} className="text-foreground" />
                    <span className="opacity-40">·</span>
                    <span className="num">{fmtKm(active.km)}</span>
                    <span className="opacity-40">·</span>
                    <span>{active.name}</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {active.specialties.slice(0, 3).map((s) => (
                  <Chip key={s}>{s}</Chip>
                ))}
              </div>

              <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
                {active.bio}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <Btn
                  onClick={() => {
                    sfx("select");
                    choose(active.id);
                  }}
                  variant={active.id === chosenId ? "ghost" : "accent"}
                >
                  {active.id === chosenId ? (
                    <>
                      <Check className="size-4" /> Your accountant
                    </>
                  ) : (
                    "Choose"
                  )}
                </Btn>
                <Link to="/accountants/$id" params={{ id: active.id }}>
                  <Btn variant="ink" className="w-full">
                    Profile
                  </Btn>
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 14, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(10px)" }}
              transition={{ duration: 0.4, ease: EASE }}
              className="px-4 pb-28"
            >
              <div className="flex items-baseline justify-between">
                <h2 className="text-[17px] font-extrabold">
                  {list.length} nearby
                </h2>
                <span className="text-[11px] font-bold tracking-wide uppercase text-muted-foreground">
                  {filter}
                </span>
              </div>
              <div className="mt-2 divide-y divide-border/70">
                {list.map((a, i) => (
                  <motion.button
                    key={a.id}
                    onClick={() => {
                      sfx("reveal");
                      setSelected(a.id);
                    }}
                    initial={{ opacity: 0, x: -12, filter: "blur(8px)" }}
                    animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                    transition={{ delay: 0.04 * i, duration: 0.5, ease: EASE }}
                    className="flex w-full items-center gap-3 py-3 text-left"
                  >
                    <Avatar src={a.photo} initials={a.initials} size={40} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[14px] font-bold">{a.firm}</div>
                      <div className="mt-0.5 flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
                        <Stars rating={a.rating} className="text-foreground" />
                        <span className="opacity-40">·</span>
                        <span>{a.availableNow ? "Open now" : a.nextSlot}</span>
                      </div>
                    </div>
                    <span className="num text-[13px] text-muted-foreground">
                      {fmtKm(a.km)}
                    </span>
                  </motion.button>
                ))}
                {list.length === 0 && (
                  <p className="py-6 text-center text-[13px] text-muted-foreground">
                    Nothing matches that search yet.
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
