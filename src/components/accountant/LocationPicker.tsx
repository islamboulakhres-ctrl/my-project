import { useEffect, useRef, useState } from "react";
import { Map as MLMap, setWorkerUrl } from "maplibre-gl";
import mapWorkerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import "maplibre-gl/dist/maplibre-gl.css";
import { motion } from "motion/react";
import { sfx } from "@/lib/sfx";

setWorkerUrl(mapWorkerUrl);

const STYLE = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

type Props = {
  lng: number;
  lat: number;
  onChange: (c: { lng: number; lat: number }) => void;
  className?: string;
};

/**
 * Drop-anchor picker: the map moves under a fixed pin. The pin lifts while the
 * map is in motion and lands with a ripple when the gesture settles.
 */
export default function LocationPicker({ lng, lat, onChange, className }: Props) {
  const holder = useRef<HTMLDivElement>(null);
  const map = useRef<MLMap | null>(null);
  const [moving, setMoving] = useState(false);
  const [ripple, setRipple] = useState(0);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!holder.current || map.current) return;
    const m = new MLMap({
      container: holder.current,
      style: STYLE,
      center: [lng, lat],
      zoom: 13.4,
      attributionControl: { compact: true },
      dragRotate: false,
      pitchWithRotate: false,
    });
    m.touchZoomRotate.disableRotation();
    m.on("movestart", () => setMoving(true));
    m.on("moveend", () => {
      setMoving(false);
      setRipple((r) => r + 1);
      sfx("pop");
      const c = m.getCenter();
      onChangeRef.current({ lng: +c.lng.toFixed(5), lat: +c.lat.toFixed(5) });
    });
    map.current = m;

    const ro = new ResizeObserver(() => m.resize());
    ro.observe(holder.current);
    const raf = requestAnimationFrame(() => m.resize());
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      m.remove();
      map.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={className} style={{ position: "relative", overflow: "hidden" }}>
      <div ref={holder} style={{ position: "absolute", inset: 0 }} />

      {/* fixed anchor */}
      <div className="pointer-events-none absolute inset-0 grid place-items-center">
        <div className="relative -translate-y-3">
          <motion.div
            animate={{ y: moving ? -16 : 0, scale: moving ? 1.06 : 1 }}
            transition={{ type: "spring", stiffness: 420, damping: 26 }}
            className="relative z-10 grid size-11 place-items-center rounded-full bg-primary text-primary-foreground"
            style={{ boxShadow: "var(--shadow-accent)" }}
          >
            <svg viewBox="0 0 24 24" className="size-5 fill-current">
              <path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" />
            </svg>
          </motion.div>
          <motion.span
            aria-hidden
            className="absolute left-1/2 z-0 h-4 w-px -translate-x-1/2 bg-foreground/45"
            style={{ top: 40 }}
            animate={{ scaleY: moving ? 1.9 : 1, opacity: moving ? 0.9 : 0.5 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
          />
          <motion.span
            key={ripple}
            aria-hidden
            className="absolute left-1/2 size-6 -translate-x-1/2 rounded-full border-2 border-primary/70"
            style={{ top: 52 }}
            initial={{ scale: 0.3, opacity: 0.9 }}
            animate={{ scale: 2.4, opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          />
          <motion.span
            aria-hidden
            className="absolute left-1/2 size-2 -translate-x-1/2 rounded-full bg-foreground/60"
            style={{ top: 56 }}
            animate={{ scale: moving ? 0.6 : 1, opacity: moving ? 0.35 : 0.7 }}
          />
        </div>
      </div>

      {/* coordinate readout */}
      <motion.div
        animate={{ y: moving ? 4 : 0, opacity: moving ? 0.75 : 1 }}
        className="glass-ink pointer-events-none absolute inset-x-3 bottom-3 flex items-center justify-between rounded-full px-4 py-2 text-[11px] font-bold"
      >
        <span>{moving ? "Drop the anchor…" : "Anchor set"}</span>
        <span className="num opacity-70">
          {lat.toFixed(4)}, {lng.toFixed(4)}
        </span>
      </motion.div>
    </div>
  );
}
