/**
 * Reference-counted body scroll lock.
 *
 * Multiple overlays (role picker + sign-in curtain) can be open at once. Each
 * one naively saving/restoring `body.style.overflow` leaves the page locked
 * forever when they unmount out of order — that is what broke scrolling app
 * wide. A shared counter makes lock/unlock order-independent.
 */
let count = 0;
let previous = "";

export function lockScroll(): () => void {
  if (typeof document === "undefined") return () => {};
  if (count === 0) {
    previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
  count += 1;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    count = Math.max(0, count - 1);
    if (count === 0) document.body.style.overflow = previous;
  };
}
