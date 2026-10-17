"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { blockReveal, releaseReveal } from "@/lib/intro";
import { scrollToTop, setPathname, usePathnameValue } from "@/lib/route";
import { LogoMark } from "@/components/Logo";

/** Publishes the pathname to the store. Rendered inside <Suspense>. */
export function RouteWatcher() {
  const pathname = usePathname();
  useEffect(() => {
    setPathname(pathname);
  }, [pathname]);
  return null;
}

function shouldIntercept(e: MouseEvent, a: HTMLAnchorElement) {
  if (e.defaultPrevented || e.button !== 0) return false;
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return false;
  if (a.target && a.target !== "_self") return false;
  if (a.hasAttribute("download") || a.dataset.noTransition !== undefined) return false;
  const url = new URL(a.href, location.href);
  if (url.origin !== location.origin) return false;
  if (url.pathname === location.pathname) return false;
  return true;
}

export function PageTransition() {
  const router = useRouter();
  const pathname = usePathnameValue();
  const root = useRef<HTMLDivElement>(null);
  const covering = useRef(false);
  const fallback = useRef<number>(0);

  // Intercept internal link clicks: cover the screen, then navigate.
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onClick = (e: MouseEvent) => {
      if (reduce.matches || covering.current) return;
      const a = (e.target as HTMLElement).closest?.("a");
      if (!a || !shouldIntercept(e, a)) return;
      e.preventDefault();
      const url = new URL(a.href, location.href);
      const href = url.pathname + url.search + url.hash;
      covering.current = true;
      blockReveal();
      const panels = root.current!.querySelectorAll("[data-panel]");
      const mark = root.current!.querySelector("[data-mark]");
      gsap
        .timeline({
          onComplete: () => {
            scrollToTop();
            router.push(href, { scroll: false });
            fallback.current = window.setTimeout(reveal, 4000);
          },
        })
        .set(root.current, { visibility: "visible" })
        .fromTo(panels, { y: 0, yPercent: 100 }, { y: 0, yPercent: 0, duration: 0.75, ease: "inOut", stagger: 0.08 })
        .fromTo(mark, { autoAlpha: 0, scale: 0.8 }, { autoAlpha: 1, scale: 1, duration: 0.5 }, "-=0.25");
    };
    window.addEventListener("click", onClick, true);
    return () => window.removeEventListener("click", onClick, true);
  }, [router]);

  function reveal() {
    window.clearTimeout(fallback.current);
    if (!covering.current) return;
    const panels = [...root.current!.querySelectorAll("[data-panel]")].reverse();
    const mark = root.current!.querySelector("[data-mark]");
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      releaseReveal();
      gsap
        .timeline({
          onComplete: () => {
            covering.current = false;
            gsap.set(root.current, { visibility: "hidden" });
          },
        })
        .to(mark, { autoAlpha: 0, y: -20, duration: 0.35, ease: "power2.in" })
        .to(panels, { yPercent: -100, duration: 0.85, ease: "inOut", stagger: 0.08 }, "-=0.1");
    });
  }

  // New route committed: lift the curtain.
  useEffect(() => {
    if (!pathname) return;
    if (covering.current) reveal();
    else requestAnimationFrame(() => ScrollTrigger.refresh());
  }, [pathname]);

  return (
    <div
      ref={root}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[90] invisible"
    >
      <div data-panel className="absolute inset-0 bg-accent" />
      <div data-panel className="absolute inset-0 grid place-items-center bg-ink">
        <div data-mark className="opacity-0">
          <LogoMark className="h-16 w-auto text-white" />
        </div>
      </div>
    </div>
  );
}
