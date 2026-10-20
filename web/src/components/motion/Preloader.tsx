"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { releaseReveal } from "@/lib/intro";
import { lockScroll } from "@/lib/route";
import { LOGO_PATHS } from "@/components/Logo";

/**
 * First-visit intro: the PT monogram draws itself, a counter runs to 100,
 * then the screen splits open. An inline script in <head> marks returning
 * visitors with html[data-seen], which hides this via CSS before paint.
 */
export function Preloader() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const html = document.documentElement;
      if (html.hasAttribute("data-seen")) {
        releaseReveal();
        return;
      }
      try {
        sessionStorage.setItem("pt-seen", "1");
      } catch {}

      lockScroll(true);
      const count = { v: 0 };
      const counter = root.current!.querySelector("[data-count]")!;
      const tl = gsap.timeline({
        onComplete: () => {
          lockScroll(false);
          html.setAttribute("data-seen", "");
        },
      });

      tl.set("[data-stroke]", { drawSVG: "0%", fillOpacity: 0 })
        .set("[data-hide]", { visibility: "visible" })
        .to("[data-stroke]", { drawSVG: "100%", duration: 1.4, ease: "power2.inOut", stagger: 0.18 })
        .to(count, {
          v: 100,
          duration: 1.9,
          ease: "power3.inOut",
          onUpdate: () => {
            counter.textContent = String(Math.round(count.v)).padStart(3, "0");
          },
        }, 0)
        .to("[data-progress]", { scaleX: 1, duration: 1.9, ease: "power3.inOut" }, 0)
        .to("[data-stroke]", { fillOpacity: 1, strokeOpacity: 0, duration: 0.5, ease: "power2.out" }, 1.45)
        .from("[data-word] span", { yPercent: 110, duration: 0.9, stagger: 0.035 }, 1.2)
        .to("[data-inner]", { scale: 0.92, autoAlpha: 0, duration: 0.6, ease: "power3.in" }, "+=0.15")
        .add(() => releaseReveal(), "-=0.15")
        .to("[data-half='top']", { yPercent: -100, duration: 1.1, ease: "inOut" }, "<0.25")
        .to("[data-half='bottom']", { yPercent: 100, duration: 1.1, ease: "inOut" }, "<")
        .set(root.current, { display: "none" });
      // Play the intro at ~2x: the full sequence, done in under two seconds.
      tl.timeScale(1.9);
    },
    { scope: root },
  );

  return (
    <div ref={root} className="preloader fixed inset-0 z-[100] text-white" aria-hidden>
      <div data-half="top" className="absolute inset-x-0 top-0 h-1/2 bg-ink" />
      <div data-half="bottom" className="absolute inset-x-0 bottom-0 h-1/2 bg-ink" />
      <div data-inner className="absolute inset-0 grid place-items-center">
        <div className="flex flex-col items-center gap-8">
          <svg data-hide viewBox="-4 -4 353 280" className="invisible h-24 w-auto sm:h-28" fill="white">
            {LOGO_PATHS.map((d) => (
              <path key={d} d={d} data-stroke stroke="white" strokeWidth={2} fillOpacity={0} />
            ))}
          </svg>
          <div data-word data-hide className="invisible flex overflow-hidden text-2xl font-extrabold tracking-[-0.01em] sm:text-3xl">
            {"PRIME TECH".split("").map((c, i) => (
              <span key={i} className="inline-block whitespace-pre">
                {c}
              </span>
            ))}
          </div>
        </div>
        <div className="absolute inset-x-6 bottom-8 flex items-end justify-between sm:inset-x-12">
          <span className="eyebrow text-white/50">Genuine Apple · Nairobi</span>
          <span data-count className="font-mono text-5xl font-light tabular-nums sm:text-7xl">
            000
          </span>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-[2px] bg-white/10">
          <div data-progress className="h-full origin-left scale-x-0 bg-accent" />
        </div>
      </div>
    </div>
  );
}
