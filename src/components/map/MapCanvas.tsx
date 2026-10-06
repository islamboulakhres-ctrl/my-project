import { useEffect, useRef } from "react";
import { Map as MLMap, Marker, LngLatBounds, setWorkerUrl } from "maplibre-gl";
import mapWorkerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import "maplibre-gl/dist/maplibre-gl.css";
import type { LngLat } from "@/lib/geo";
import { fmtKm } from "@/lib/geo";

// Embedded/preview browsers can refuse maplibre's default blob worker, which
// silently kills tile loading (markers show, basemap stays white). Point the
// library at a real worker URL served by Vite instead.
setWorkerUrl(mapWorkerUrl);



export type MapItem = {
  id: string;
  firm: string;
  photo: string;
  initials: string;
  lng: number;
  lat: number;
  km: number;
  availableNow: boolean;
};

type Props = {
  user: LngLat;
  items: MapItem[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  padBottom?: number;
  padLeft?: number;
  className?: string;
  onRoute?: (r: { km: number; min: number } | null) => void;
};

const STYLE = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

/** Anchor-style pin: glass plate + stem + ground point. */
function pinEl(item: MapItem, nearest: boolean) {
  const el = document.createElement("button");
  el.type = "button";
  el.className = "pin";
  el.setAttribute("aria-label", item.firm);
  el.innerHTML = `
    <span class="pin__halo"></span>
    <span class="pin__plate">
      <span class="pin__avatar">
        <img src="${item.photo}" alt="" />
        ${item.availableNow ? '<i class="pin__dot"></i>' : ""}
      </span>
      <span class="pin__meta">
        <b>${item.firm}</b>
        <em>${fmtKm(item.km)}${nearest ? " · nearest" : ""}</em>
      </span>
    </span>
    <span class="pin__stem"></span>
    <span class="pin__tip"></span>`;
  return el;
}

export default function MapCanvas({
  user,
  items,
  selectedId,
  onSelect,
  padBottom = 0,
  padLeft = 0,
  className,
  onRoute,
}: Props) {
  const holder = useRef<HTMLDivElement>(null);
  const map = useRef<MLMap | null>(null);
  const ready = useRef(false);
  const markers = useRef<Record<string, Marker>>({});
  const userMarker = useRef<Marker | null>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const onRouteRef = useRef(onRoute);
  onRouteRef.current = onRoute;

  useEffect(() => {
    if (!holder.current || map.current) return;
    const m = new MLMap({
      container: holder.current,
      style: STYLE,
      center: [user.lng, user.lat],
      zoom: 12.8,
      attributionControl: { compact: true },
      dragRotate: false,
      pitchWithRotate: false,
    });
    m.touchZoomRotate.disableRotation();
    m.on("click", () => onSelectRef.current(null));
    m.on("load", () => {
      ready.current = true;
      m.addSource("route", {
        type: "geojson",
        data: { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: [] } },
      });
      m.addLayer({
        id: "route-casing",
        type: "line",
        source: "route",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": "#ffffff",
          "line-width": 9,
          "line-opacity": 0.9,
          "line-blur": 0.4,
        },
      });
      m.addLayer({
        id: "route-line",
        type: "line",
        source: "route",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": "#c4622d", "line-width": 4 },
      });
    });
    map.current = m;

    /* the sheet + safe areas change our box; keep the GL canvas in sync */
    const ro = new ResizeObserver(() => m.resize());
    ro.observe(holder.current);
    const raf = requestAnimationFrame(() => m.resize());

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      m.remove();
      map.current = null;
      ready.current = false;
      markers.current = {};
      userMarker.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  /* user location puck */
  useEffect(() => {
    const m = map.current;
    if (!m) return;
    if (!userMarker.current) {
      const el = document.createElement("div");
      el.className = "puck";
      el.innerHTML = `<span class="puck__pulse"></span><span class="puck__core"></span>`;
      userMarker.current = new Marker({ element: el })
        .setLngLat([user.lng, user.lat])
        .addTo(m);
    } else {
      userMarker.current.setLngLat([user.lng, user.lat]);
    }
    m.easeTo({ center: [user.lng, user.lat], duration: 1100, easing: (t) => 1 - Math.pow(1 - t, 3) });
  }, [user.lng, user.lat]);

  /* accountant pins, diffed against current items */
  useEffect(() => {
    const m = map.current;
    if (!m) return;
    const ids = new Set(items.map((i) => i.id));

    Object.entries(markers.current).forEach(([id, mk]) => {
      if (!ids.has(id)) {
        mk.getElement().classList.add("is-leaving");
        window.setTimeout(() => mk.remove(), 260);
        delete markers.current[id];
      }
    });

    items.forEach((item, index) => {
      const existing = markers.current[item.id];
      if (existing) {
        existing.setLngLat([item.lng, item.lat]);
        existing.getElement().classList.toggle("is-nearest", index === 0);
        return;
      }
      const el = pinEl(item, index === 0);
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        onSelectRef.current(item.id);
      });
      if (index === 0) el.classList.add("is-nearest");
      const mk = new Marker({ element: el, anchor: "bottom", offset: [0, -18] })
        .setLngLat([item.lng, item.lat])
        .addTo(m);
      markers.current[item.id] = mk;
      window.setTimeout(() => el.classList.add("is-in"), 40 + index * 70);
    });
  }, [items]);

  /* selection: camera + animated route from the user to the accountant */
  useEffect(() => {
    const m = map.current;
    Object.entries(markers.current).forEach(([id, mk]) =>
      mk.getElement().classList.toggle("is-active", id === selectedId),
    );

    const setRoute = (coords: [number, number][]) => {
      if (!m || !ready.current) return;
      const src = m.getSource("route") as
        | { setData: (d: unknown) => void }
        | undefined;
      src?.setData({
        type: "Feature",
        properties: {},
        geometry: { type: "LineString", coordinates: coords },
      });
    };

    if (!m || !selectedId) {
      setRoute([]);
      onRouteRef.current?.(null);
      return;
    }
    const target = items.find((i) => i.id === selectedId);
    if (!target) return;

    /* Frame both points (and later the whole route) instead of guessing a
       zoom level — works the same at 300 m and at 40 km. */
    const fitTo = (coords: [number, number][], duration = 1000) => {
      if (!coords.length) return;
      const bounds = coords.reduce(
        (b, c) => b.extend(c),
        new LngLatBounds(coords[0]!, coords[0]!),
      );
      const box = m.getContainer().getBoundingClientRect();
      const side = Math.max(24, Math.min(64, box.width * 0.12));
      const left = Math.min(padLeft + side, box.width * 0.55) || side;
      const bottom = Math.min(padBottom + 24, Math.max(40, box.height * 0.55));
      m.fitBounds(bounds, {
        padding: { top: 150, bottom, left, right: side },
        maxZoom: 15.2,
        duration,
        essential: true,
      });
    };

    fitTo([
      [user.lng, user.lat],
      [target.lng, target.lat],
    ]);

    let cancelled = false;
    let raf = 0;

    const draw = (path: [number, number][], km: number, min: number) => {
      if (cancelled) return;
      const start = performance.now();
      const dur = 900;
      const step = (now: number) => {
        if (cancelled) return;
        const t = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - t, 3);
        const count = Math.max(2, Math.round(path.length * eased));
        setRoute(path.slice(0, count));
        if (t < 1) raf = requestAnimationFrame(step);
        else onRouteRef.current?.({ km, min });
      };
      raf = requestAnimationFrame(step);
    };

    /* real route geometry, with a graceful straight-line fallback */
    const url = `https://router.project-osrm.org/route/v1/driving/${user.lng},${user.lat};${target.lng},${target.lat}?overview=full&geometries=geojson`;
    fetch(url)
      .then((r) => r.json())
      .then((j) => {
        const route = j?.routes?.[0];
        if (!route?.geometry?.coordinates?.length) throw new Error("no route");
        const coords = route.geometry.coordinates as [number, number][];
        fitTo(coords, 900);
        draw(coords, route.distance / 1000, Math.round(route.duration / 60));
      })
      .catch(() => {
        const steps = 48;
        const path: [number, number][] = Array.from({ length: steps + 1 }, (_, i) => {
          const t = i / steps;
          const lift = Math.sin(t * Math.PI) * 0.004;
          return [
            user.lng + (target.lng - user.lng) * t + lift,
            user.lat + (target.lat - user.lat) * t + lift,
          ];
        });
        draw(path, target.km, Math.max(4, Math.round(target.km * 3)));
      });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [selectedId, items, padBottom, padLeft, user.lng, user.lat]);

  // maplibre's own stylesheet sets `.maplibregl-map { position: relative }`,
  // which beats utility classes — pin the box with inline styles.
  return (
    <div
      ref={holder}
      className={className}
      style={{ position: "absolute", inset: 0, height: "100%", width: "100%" }}
    />
  );
}

