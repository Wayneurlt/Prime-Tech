"use client";

import { useSyncExternalStore } from "react";
import type Lenis from "lenis";

/* Pathname store: written by <RouteWatcher> (inside Suspense), read anywhere
   without suspending, so layout chrome stays in the static shell. */
let pathname = "";
const subs = new Set<() => void>();

export function setPathname(p: string) {
  if (p === pathname) return;
  pathname = p;
  subs.forEach((fn) => fn());
}

export function usePathnameValue() {
  return useSyncExternalStore(
    (fn) => {
      subs.add(fn);
      return () => subs.delete(fn);
    },
    () => pathname,
    () => "",
  );
}

/* Shared Lenis instance so any component can scroll or lock the page. */
let lenis: Lenis | null = null;
export const setLenis = (l: Lenis | null) => {
  lenis = l;
};
export const getLenis = () => lenis;

export function lockScroll(locked: boolean) {
  if (lenis) {
    if (locked) lenis.stop();
    else lenis.start();
  }
  document.documentElement.style.overflow = locked ? "hidden" : "";
}

export function scrollToTop(immediate = true) {
  if (lenis) lenis.scrollTo(0, { immediate, force: true });
  else window.scrollTo({ top: 0, behavior: immediate ? "instant" : "smooth" });
}
