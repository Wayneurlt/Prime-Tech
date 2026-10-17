"use client";

import { useRef, type ElementType, type ReactNode, type CSSProperties } from "react";
import { gsap, ScrollTrigger, SplitText, useGSAP, MOTION_OK } from "@/lib/gsap";
import { whenRevealed } from "@/lib/intro";

type Common = {
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  id?: string;
};

/**
 * Reveals direct children (or itself) as they scroll into view.
 * `intro` plays on page entry instead of on scroll.
 */
export function Reveal({
  as: Tag = "div",
  className,
  style,
  children,
  id,
  y = 40,
  stagger = 0.08,
  delay = 0,
  self = false,
  intro = false,
  start = "top 85%",
  scale,
}: Common & {
  y?: number;
  stagger?: number;
  delay?: number;
  self?: boolean;
  intro?: boolean;
  start?: string;
  scale?: number;
}) {
  const ref = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const targets = self ? [ref.current] : gsap.utils.toArray<HTMLElement>(ref.current!.children);
        const from = { y, autoAlpha: 0, ...(scale ? { scale } : {}) };
        const to = { y: 0, autoAlpha: 1, scale: 1, duration: 1.2, stagger, delay, clearProps: "transform,translate,rotate,scale,opacity,visibility" };
        if (intro) {
          gsap.set(targets, from);
          // GSAP now owns visibility; drop the pre-hydration CSS gate so clearProps can't re-hide it.
          ref.current!.removeAttribute("data-intro");
          gsap.set(ref.current, { visibility: "visible" });
          const cancel = whenRevealed(() => gsap.to(targets, to));
          return cancel;
        }
        gsap.fromTo(targets, from, { ...to, scrollTrigger: { trigger: ref.current, start, once: true } });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );
  return (
    <Tag ref={ref} className={className} style={style} id={id} data-intro={intro ? "" : undefined}>
      {children}
    </Tag>
  );
}

/** Masked line/word/char reveal for headings using SplitText. */
export function SplitReveal({
  as: Tag = "h2",
  className,
  style,
  children,
  id,
  type = "lines",
  stagger,
  delay = 0,
  intro = false,
  scrub = false,
}: Common & {
  type?: "lines" | "words" | "chars";
  stagger?: number;
  delay?: number;
  intro?: boolean;
  scrub?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        let cancel = () => {};
        const split = SplitText.create(ref.current, {
          type: type === "chars" ? "lines,words,chars" : type === "words" ? "lines,words" : "lines",
          mask: "lines",
          linesClass: "split-line",
          autoSplit: true,
          onSplit(self) {
            const targets = type === "chars" ? self.chars : type === "words" ? self.words : self.lines;
            const each = stagger ?? (type === "chars" ? 0.018 : type === "words" ? 0.05 : 0.1);
            if (scrub) {
              return gsap.fromTo(
                targets,
                { yPercent: 105, opacity: 0.2 },
                {
                  yPercent: 0,
                  opacity: 1,
                  stagger: each,
                  ease: "none",
                  scrollTrigger: { trigger: ref.current, start: "top 90%", end: "bottom 55%", scrub: 0.6 },
                },
              );
            }
            const vars = { yPercent: 0, rotate: 0, duration: 1.25, stagger: each, delay };
            gsap.set(ref.current, { visibility: "visible" });
            if (intro) {
              const tween = gsap.fromTo(targets, { yPercent: 110, rotate: 2 }, { ...vars, paused: true });
              cancel = whenRevealed(() => tween.play());
              return tween;
            }
            return gsap.fromTo(targets, { yPercent: 110, rotate: 2 }, {
              ...vars,
              scrollTrigger: { trigger: ref.current, start: "top 88%", once: true },
            });
          },
        });
        return () => {
          cancel();
          split.revert();
        };
      });
      return () => mm.revert();
    },
    { scope: ref },
  );
  return (
    <Tag ref={ref} className={className} style={style} id={id} data-intro={intro ? "" : undefined}>
      {children}
    </Tag>
  );
}

/** Paragraph whose words light up one by one as it scrolls through the viewport. */
export function ScrubText({ as: Tag = "p", className, style, children }: Common) {
  const ref = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const split = SplitText.create(ref.current, { type: "words" });
        gsap.fromTo(
          split.words,
          { opacity: 0.14 },
          {
            opacity: 1,
            stagger: 0.1,
            ease: "none",
            scrollTrigger: { trigger: ref.current, start: "top 80%", end: "bottom 45%", scrub: true },
          },
        );
        return () => split.revert();
      });
      return () => mm.revert();
    },
    { scope: ref },
  );
  return (
    <Tag ref={ref} className={className} style={style}>
      {children}
    </Tag>
  );
}

/** Vertical parallax on scroll for the wrapped element. */
export function Parallax({
  as: Tag = "div",
  className,
  style,
  children,
  speed = 0.15,
  scale = 1,
}: Common & { speed?: number; scale?: number }) {
  const ref = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.fromTo(
          ref.current,
          { yPercent: -speed * 100, scale },
          {
            yPercent: speed * 100,
            scale,
            ease: "none",
            scrollTrigger: { trigger: ref.current!.parentElement, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      });
      return () => mm.revert();
    },
    { scope: ref },
  );
  return (
    <Tag ref={ref} className={className} style={style}>
      {children}
    </Tag>
  );
}

/** Image/content reveal through an expanding clip-path. */
export function ClipReveal({
  as: Tag = "div",
  className,
  style,
  children,
  from = "inset(12% 12% 12% 12% round 28px)",
  to = "inset(0% 0% 0% 0% round 28px)",
  scrub = true,
}: Common & { from?: string; to?: string; scrub?: boolean }) {
  const ref = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.fromTo(
          ref.current,
          { clipPath: from },
          {
            clipPath: to,
            ease: scrub ? "none" : "expo",
            duration: scrub ? undefined : 1.6,
            scrollTrigger: scrub
              ? { trigger: ref.current, start: "top 95%", end: "top 25%", scrub: 0.5 }
              : { trigger: ref.current, start: "top 85%", once: true },
          },
        );
      });
      return () => mm.revert();
    },
    { scope: ref },
  );
  return (
    <Tag ref={ref} className={className} style={style}>
      {children}
    </Tag>
  );
}

/** Animated number that counts up when it enters the viewport. */
export function CountUp({
  value,
  prefix = "",
  suffix = "",
  className,
  duration = 2,
  format = true,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  duration?: number;
  format?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const fmt = (n: number) => `${prefix}${format ? Math.round(n).toLocaleString("en-KE") : Math.round(n)}${suffix}`;
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const o = { v: 0 };
        ref.current!.textContent = fmt(0);
        gsap.to(o, {
          v: value,
          duration,
          ease: "power3.out",
          onUpdate: () => {
            if (ref.current) ref.current.textContent = fmt(o.v);
          },
          scrollTrigger: { trigger: ref.current, start: "top 90%", once: true },
        });
        return () => {
          if (ref.current) ref.current.textContent = fmt(value);
        };
      });
      return () => mm.revert();
    },
    { dependencies: [value] },
  );
  return (
    <span ref={ref} className={`tabular-nums ${className ?? ""}`}>
      {fmt(value)}
    </span>
  );
}

/** Pulls its child toward the pointer; springs back on leave. */
export function Magnetic({
  children,
  strength = 0.35,
  className = "inline-block",
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  useGSAP(
    () => {
      const el = ref.current!;
      if (!window.matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)").matches) return;
      const xTo = gsap.quickTo(el, "x", { duration: 0.8, ease: "elastic.out(1, 0.4)" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.8, ease: "elastic.out(1, 0.4)" });
      const move = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * strength);
        yTo((e.clientY - (r.top + r.height / 2)) * strength);
      };
      const leave = () => {
        xTo(0);
        yTo(0);
      };
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerleave", leave);
      return () => {
        el.removeEventListener("pointermove", move);
        el.removeEventListener("pointerleave", leave);
      };
    },
    { scope: ref },
  );
  return (
    <span ref={ref} className={className}>
      {children}
    </span>
  );
}

/** Infinite marquee whose speed and direction follow scroll velocity. */
export function Marquee({
  children,
  className,
  speed = 40,
  reverse = false,
}: {
  children: ReactNode;
  className?: string;
  speed?: number;
  reverse?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const track = ref.current!.querySelector<HTMLElement>("[data-track]")!;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const width = track.scrollWidth / 2;
        const tween = gsap.fromTo(
          track,
          { x: reverse ? -width : 0 },
          { x: reverse ? 0 : -width, duration: width / speed, ease: "none", repeat: -1 },
        );
        let dir = 1;
        const st = ScrollTrigger.create({
          trigger: ref.current,
          start: "top bottom",
          end: "bottom top",
          onUpdate: (self) => {
            const v = self.getVelocity();
            if (Math.abs(v) > 30) dir = v > 0 ? 1 : -1;
            const boost = gsap.utils.clamp(1, 5, 1 + Math.abs(v) / 600);
            gsap.to(tween, { timeScale: dir * boost, duration: 0.2, overwrite: true });
            gsap.to(tween, { timeScale: dir, duration: 1.2, delay: 0.25 });
          },
        });
        return () => st.kill();
      });
      return () => mm.revert();
    },
    { scope: ref },
  );
  return (
    <div ref={ref} className={`overflow-hidden ${className ?? ""}`}>
      <div data-track className="flex w-max">
        <div className="flex shrink-0">{children}</div>
        <div className="flex shrink-0" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}
