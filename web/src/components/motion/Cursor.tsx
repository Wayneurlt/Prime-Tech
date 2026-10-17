"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

/**
 * Two-part cursor for fine pointers. Elements with [data-cursor="label"]
 * expand the ring and show the label ("View", "Drag", ...).
 */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)");
    if (!mq.matches) return;
    document.documentElement.classList.add("has-cursor");

    const dx = gsap.quickTo(dot.current, "x", { duration: 0.12, ease: "power3" });
    const dy = gsap.quickTo(dot.current, "y", { duration: 0.12, ease: "power3" });
    const rx = gsap.quickTo(ring.current, "x", { duration: 0.5, ease: "power3" });
    const ry = gsap.quickTo(ring.current, "y", { duration: 0.5, ease: "power3" });
    let current: Element | null = null;
    let shown = false;

    const move = (e: PointerEvent) => {
      if (!shown) {
        shown = true;
        gsap.to([dot.current, ring.current], { autoAlpha: 1, duration: 0.3 });
      }
      dx(e.clientX);
      dy(e.clientY);
      rx(e.clientX);
      ry(e.clientY);

      const target = (e.target as Element).closest?.("[data-cursor], a, button, [role=button], input, select, textarea, label");
      if (target === current) return;
      current = target;
      const text = target?.getAttribute("data-cursor");
      if (text) {
        label.current!.textContent = text;
        gsap.to(ring.current, { scale: 2.6, backgroundColor: "rgba(30,144,255,0.92)", borderColor: "rgba(30,144,255,0)", duration: 0.45 });
        gsap.to(label.current, { autoAlpha: 1, duration: 0.25 });
        gsap.to(dot.current, { scale: 0, duration: 0.25 });
      } else if (target) {
        gsap.to(ring.current, { scale: 1.6, backgroundColor: "rgba(30,144,255,0.12)", borderColor: "rgba(30,144,255,0.6)", duration: 0.45 });
        gsap.to(label.current, { autoAlpha: 0, duration: 0.15 });
        gsap.to(dot.current, { scale: 0.6, duration: 0.25 });
      } else {
        gsap.to(ring.current, { scale: 1, backgroundColor: "rgba(30,144,255,0)", borderColor: "rgba(127,127,127,0.55)", duration: 0.45 });
        gsap.to(label.current, { autoAlpha: 0, duration: 0.15 });
        gsap.to(dot.current, { scale: 1, duration: 0.25 });
      }
    };
    const leave = () => {
      shown = false;
      gsap.to([dot.current, ring.current], { autoAlpha: 0, duration: 0.3 });
    };
    const down = () => gsap.to(ring.current, { scale: "*=0.85", duration: 0.2 });
    const up = () => gsap.to(ring.current, { scale: "/=0.85", duration: 0.3 });

    window.addEventListener("pointermove", move);
    document.addEventListener("pointerleave", leave);
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      document.documentElement.classList.remove("has-cursor");
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed left-0 top-0 z-[95] hidden lg:block">
      <div
        ref={ring}
        className="invisible absolute -left-5 -top-5 grid h-10 w-10 place-items-center rounded-full border border-[rgba(127,127,127,0.55)] opacity-0"
      >
        <span ref={label} className="invisible text-[0.32rem] font-semibold uppercase tracking-[0.12em] text-white opacity-0" />
      </div>
      <div ref={dot} className="invisible absolute -left-[3px] -top-[3px] h-1.5 w-1.5 rounded-full bg-accent opacity-0" />
    </div>
  );
}
