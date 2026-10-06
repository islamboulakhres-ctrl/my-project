import { useCallback, useEffect, useState } from "react";

const KEY = "fisco.calm";

/** Devices that will visibly struggle with stacked glass + idle motion. */
function lowPower(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return true;
    const nav = navigator as Navigator & { deviceMemory?: number };
    if (typeof nav.deviceMemory === "number" && nav.deviceMemory <= 4) return true;
    if (typeof nav.hardwareConcurrency === "number" && nav.hardwareConcurrency <= 4) return true;
  } catch {
    /* ignore */
  }
  return false;
}

function read(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const stored = window.localStorage.getItem(KEY);
    if (stored !== null) return stored === "1";
  } catch {
    return false;
  }
  /* no explicit choice yet — start calm on weak hardware */
  return lowPower();
}

function apply(on: boolean) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset["calm"] = on ? "true" : "false";
}

/** Global "Reduce motion" preference — calmer animations, cheaper glass. */
export function useCalm(): [boolean, (next: boolean) => void] {
  const [calm, setCalm] = useState(false);

  useEffect(() => {
    const v = read();
    setCalm(v);
    apply(v);
  }, []);

  const set = useCallback((next: boolean) => {
    setCalm(next);
    apply(next);
    try {
      window.localStorage.setItem(KEY, next ? "1" : "0");
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new CustomEvent("fisco:calm", { detail: next }));
  }, []);

  useEffect(() => {
    const onChange = (e: Event) => setCalm(Boolean((e as CustomEvent).detail));
    window.addEventListener("fisco:calm", onChange);
    return () => window.removeEventListener("fisco:calm", onChange);
  }, []);

  return [calm, set];
}

/** Read-only variant for components that only need to soften their motion. */
export function useCalmValue(): boolean {
  const [calm] = useCalm();
  return calm;
}
