"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";
import { whenRevealed } from "@/lib/intro";
import { formatKsh } from "@/lib/catalog";

export type HeroSlide = {
  key: string;
  /** Short name for the tab row. */
  tab: string;
  eyebrow: string;
  title: string;
  tagline: string;
  image: string;
  tone: "dark" | "light";
  /** Colour of the glow behind the product. */
  glow: string;
  /** How far to enlarge the photo so the products, not its backdrop, fill the stage. */
  zoom: number;
  href: string;
  cta: string;
  from: number | null;
};

const AUTOPLAY = 5.5; // seconds per slide

/** Mobile/tablet home hero: a swipeable, auto-advancing slider across the product families. */
export function MobileHero({ slides }: { slides: HeroSlide[] }) {
  const root = useRef<HTMLElement>(null);
  const [index, setIndex] = useState(0);
  const indexRef = useRef(0);
  const swap = useRef<gsap.core.Timeline | null>(null);
  const timer = useRef<gsap.core.Timeline | null>(null);
  const visible = useRef(true);
  const held = useRef(false);
  const start = useRef<{ x: number; y: number } | null>(null);
  const dragging = useRef(false);

  const reduce = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const layers = () =>
    gsap.utils.toArray<HTMLElement>("[data-s-slide]", root.current);
  const bars = () =>
    gsap.utils.toArray<HTMLElement>("[data-s-bar]", root.current);
  // Element lookups rather than selector strings: the reveal callback can run outside the useGSAP scope.
  const q = (sel: string) => root.current!.querySelectorAll<HTMLElement>(sel);

  /** Fills the active tab's bar and slowly pushes in on the product; when full, moves on. */
  const runTimer = (i: number) => {
    timer.current?.kill();
    bars().forEach((b, j) => gsap.set(b, { scaleX: j < i ? 1 : 0 }));
    if (reduce()) return;
    timer.current = gsap
      .timeline({
        paused: !visible.current || held.current,
        onComplete: () => go(i + 1, 1),
      })
      .fromTo(bars()[i], { scaleX: 0 }, { scaleX: 1, duration: AUTOPLAY, ease: "none" }, 0)
      .fromTo(
        layers()[i].querySelector("[data-s-kb]"),
        { scale: 1 },
        { scale: 1.07, duration: AUTOPLAY, ease: "none" },
        0,
      );
  };

  /** Reveal of a slide's copy and image. */
  const enter = (el: HTMLElement, dir: number) =>
    gsap
      .timeline()
      .fromTo(
        el.querySelector("[data-s-img]"),
        { x: 0, xPercent: dir * 22, scale: 1.12 },
        { xPercent: 0, scale: 1, duration: 1.3, ease: "expo.out" },
        0,
      )
      .fromTo(
        el.querySelector("[data-s-glow]"),
        { scale: 0.5, autoAlpha: 0 },
        { scale: 1, autoAlpha: 1, duration: 1.4, ease: "expo.out" },
        0.1,
      )
      .fromTo(
        el.querySelectorAll("[data-s-line]"),
        { x: 0, yPercent: 70, autoAlpha: 0 },
        {
          yPercent: 0,
          autoAlpha: 1,
          duration: 0.9,
          stagger: 0.07,
          ease: "expo.out",
        },
        0.25,
      );

  function go(next: number, dir: number) {
    const n = slides.length;
    const to = ((next % n) + n) % n;
    const from = indexRef.current;
    if (to === from) return;
    swap.current?.progress(1);
    indexRef.current = to;
    setIndex(to);
    const all = layers();
    const out = all[from];
    const inn = all[to];
    runTimer(to);
    if (reduce()) {
      gsap.set(out, { autoAlpha: 0, zIndex: 0 });
      gsap.set(inn, { autoAlpha: 1, zIndex: 2, clipPath: "none" });
      return;
    }
    gsap.set(all, { zIndex: 0 });
    gsap.set(out, { zIndex: 1 });
    gsap.set(inn, { zIndex: 2, autoAlpha: 1 });
    // The new slide wipes in from the side it was swiped from; the old one drifts away beneath it.
    swap.current = gsap
      .timeline({
        onComplete: () => void gsap.set(out, { autoAlpha: 0 }),
      })
      .fromTo(
        inn,
        {
          clipPath:
            dir > 0 ? "inset(0% 0% 0% 100%)" : "inset(0% 100% 0% 0%)",
        },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 1,
          ease: "expo.inOut",
        },
        0,
      )
      .to(
        out.querySelector("[data-s-img]"),
        { xPercent: -dir * 18, scale: 0.94, duration: 1, ease: "expo.inOut" },
        0,
      )
      .to(
        out.querySelectorAll("[data-s-line]"),
        { autoAlpha: 0, duration: 0.4, ease: "power2.in" },
        0,
      )
      .add(enter(inn, dir), 0.35);
  }

  /* First slide: wait for the preloader, then reveal and start the clock. */
  useGSAP(
    () => {
      const all = layers();
      gsap.set(all, { autoAlpha: (i) => (i === 0 ? 1 : 0) });
      gsap.set(all[0], { zIndex: 2 });
      if (reduce()) {
        gsap.set(q("[data-intro]"), { visibility: "visible" });
        return;
      }
      const cancel = whenRevealed(() => {
        gsap.set(q("[data-intro]"), { visibility: "visible" });
        enter(all[0], 1);
        gsap.fromTo(
          q("[data-s-ui]"),
          { y: 20, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.9, delay: 0.5, ease: "expo.out" },
        );
        runTimer(0);
      });
      return cancel;
    },
    { scope: root },
  );

  /* Pause while the hero is off screen. */
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => {
      visible.current = e.isIntersecting;
      if (e.isIntersecting && !held.current) timer.current?.resume();
      else timer.current?.pause();
    });
    io.observe(root.current!);
    return () => {
      io.disconnect();
      timer.current?.kill();
    };
  }, []);

  /* Drag: the slide follows the finger, then commits or springs back. Holding pauses the clock. */
  const current = () => layers()[indexRef.current];
  const follow = (dx: number, dur = 0) => {
    const el = current();
    gsap.to(el.querySelector("[data-s-img]"), { x: dx * 0.45, duration: dur, ease: "expo", overwrite: "auto" });
    gsap.to(el.querySelectorAll("[data-s-line]"), { x: dx * 0.2, duration: dur, ease: "expo", overwrite: "auto" });
  };
  const release = () => {
    held.current = false;
    start.current = null;
    if (dragging.current) follow(0, 0.7);
    dragging.current = false;
    if (visible.current) timer.current?.resume();
  };
  const onDown = (e: React.PointerEvent) => {
    start.current = { x: e.clientX, y: e.clientY };
    held.current = true;
    timer.current?.pause();
  };
  const onMove = (e: React.PointerEvent) => {
    const s = start.current;
    if (!s || reduce()) return;
    const dx = e.clientX - s.x;
    if (!dragging.current && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(e.clientY - s.y))
      dragging.current = true;
    if (dragging.current) follow(dx);
  };
  const onUp = (e: React.PointerEvent) => {
    const s = start.current;
    if (s) {
      const dx = e.clientX - s.x;
      const dy = e.clientY - s.y;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.2) {
        held.current = false;
        start.current = null;
        dragging.current = false;
        go(indexRef.current + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
        return;
      }
    }
    release();
  };

  const active = slides[index];
  const dark = active.tone === "dark";

  return (
    <section
      ref={root}
      aria-roledescription="carousel"
      aria-label="Featured products"
      className="relative h-svh min-h-[600px] touch-pan-y select-none overflow-hidden bg-black"
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={release}
    >
      {slides.map((s, i) => (
        <div
          key={s.key}
          data-s-slide
          data-header-dark={s.tone === "dark" ? "" : undefined}
          role="group"
          aria-roledescription="slide"
          aria-label={`${i + 1} of ${slides.length}: ${s.title}`}
          aria-hidden={i !== index}
          className={`absolute inset-0 flex flex-col pb-[calc(1.75rem+8.5rem)] ${s.tone === "dark" ? "bg-black text-white" : "bg-white text-ink"} ${i === 0 ? "" : "invisible"}`}
        >
          <div className="container-x relative z-10 shrink-0 pt-[calc(var(--header-h)+2.5rem)] sm:pt-[calc(var(--header-h)+4.5rem)]">
            <div className="overflow-hidden">
              <p
                data-s-line
                data-intro
                className={`eyebrow flex items-center gap-2 ${s.tone === "dark" ? "text-white/55" : "text-mute"}`}
              >
                <span className="h-px w-6 bg-current opacity-50" />
                {s.eyebrow}
              </p>
            </div>
            <div className="overflow-hidden pb-1">
              <h2
                data-s-line
                data-intro
                className="mt-3 text-[clamp(2.9rem,13vw,5.5rem)] font-bold leading-[0.92] tracking-[-0.05em]"
              >
                {s.title}
                <span className="text-accent">.</span>
              </h2>
            </div>
            <div className="overflow-hidden">
              <p
                data-s-line
                data-intro
                className={`serif-accent mt-1 text-[1.6rem] leading-tight sm:text-3xl ${s.tone === "dark" ? "text-white/80" : "text-ink/75"}`}
              >
                {s.tagline}
              </p>
            </div>
          </div>

          {/* Stage: the photo enlarged so its backdrop bleeds off the edges, under a glow in the slide's colour. */}
          <div className="relative min-h-0 flex-1">
            <div data-s-img data-intro className="absolute inset-0">
              <div data-s-kb className="absolute inset-0">
                <div className="absolute inset-0" style={{ scale: s.zoom }}>
                  <Image
                    src={s.image}
                    alt=""
                    fill
                    preload={i === 0}
                    sizes="(min-width: 640px) 100vw, 150vw"
                    className="object-contain"
                    draggable={false}
                  />
                </div>
              </div>
            </div>
            {/* Blended over the photo (screen on black, multiply on white) so it tints evenly without showing the photo's edges. */}
            <div
              data-s-glow
              data-intro
              aria-hidden
              className={`pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[130%] -translate-x-1/2 -translate-y-1/2 rounded-full ${s.tone === "dark" ? "mix-blend-screen" : "mix-blend-multiply"}`}
              style={{ background: `radial-gradient(closest-side, ${s.glow}, transparent)` }}
            />
          </div>
        </div>
      ))}

      {/* Shared controls, re-coloured per slide */}
      <div
        data-s-ui
        data-intro
        className={`container-x absolute inset-x-0 bottom-[calc(1.75rem+1rem)] z-10 transition-colors duration-700 ${dark ? "text-white" : "text-ink"}`}
      >
        <div className="flex items-center justify-between gap-4">
          <Link
            href={active.href}
            className={`btn ${dark ? "btn-primary" : "btn-dark"}`}
          >
            <span>{active.cta}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          {active.from !== null && (
            <p
              className={`text-right text-sm leading-tight ${dark ? "text-white/55" : "text-mute"}`}
            >
              From
              <br />
              <span className={`font-semibold ${dark ? "text-white" : "text-ink"}`}>
                {formatKsh(active.from)}
              </span>
            </p>
          )}
        </div>
        <div className="mt-5 flex gap-1.5" role="tablist">
          {slides.map((s, i) => (
            <button
              key={s.key}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Show ${s.title}`}
              onClick={() => go(i, i > index ? 1 : -1)}
              className={`flex-1 pb-1 pt-2 text-left text-[0.7rem] font-semibold tracking-tight transition-opacity duration-500 ${i === index ? "opacity-100" : "opacity-45"}`}
            >
              {s.tab}
              <span
                className={`relative mt-1.5 block h-[3px] overflow-hidden rounded-full ${dark ? "bg-white/20" : "bg-ink/15"}`}
              >
                <span
                  data-s-bar
                  className={`absolute inset-0 origin-left rounded-full ${dark ? "bg-white" : "bg-ink"}`}
                  style={{ transform: "scaleX(0)" }}
                />
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
