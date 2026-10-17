"use client";

/**
 * Gate for above-the-fold entrance animations. While the preloader or the
 * page-transition curtain covers the screen the gate is closed; queued
 * callbacks run the moment the new page becomes visible.
 */
let blocked =
  typeof document !== "undefined" && !document.documentElement.hasAttribute("data-seen");
const queue = new Set<() => void>();

export function blockReveal() {
  blocked = true;
}

export function releaseReveal() {
  blocked = false;
  const fns = [...queue];
  queue.clear();
  fns.forEach((fn) => fn());
}

export function whenRevealed(fn: () => void) {
  if (!blocked) {
    fn();
    return () => {};
  }
  queue.add(fn);
  return () => {
    queue.delete(fn);
  };
}
