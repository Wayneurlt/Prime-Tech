"use client";

import Image from "next/image";
import { useRef } from "react";
import { ArrowDown } from "lucide-react";
import { gsap, SplitText, useGSAP, MOTION_OK } from "@/lib/gsap";
import { whenRevealed } from "@/lib/intro";
import { formatKsh, type Family } from "@/lib/catalog";

export function CategoryHero({ family: f, count, from }: { family: Family; count: number; from: number | null }) {
  const root = useRef<HTMLElement>(null);
  const dark = f.tone === "dark";

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const split = SplitText.create("[data-title]", { type: "chars", mask: "chars" });
        const tl = gsap
          .timeline({ paused: true })
          .set("[data-intro]", { visibility: "visible" })
          .from(split.chars, { yPercent: 110, duration: 1.4, stagger: 0.04 }, 0)
          .from("[data-fade]", { y: 24, autoAlpha: 0, duration: 1.1, stagger: 0.08 }, 0.3)
          .fromTo("[data-media]", { clipPath: "inset(30% 20% 30% 20% round 32px)" }, { clipPath: "inset(0% 0% 0% 0% round 32px)", duration: 1.8, ease: "inOut" }, 0.1)
          .from("[data-media] img", { scale: 1.3, duration: 2.2 }, 0.1);
        const cancel = whenRevealed(() => tl.play());

        gsap.to("[data-media] img", {
          yPercent: 12,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
        });
        gsap.to("[data-title]", {
          yPercent: -30,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
        });
        return () => {
          cancel();
          split.revert();
        };
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      data-header-dark={dark ? "" : undefined}
      className={`relative overflow-hidden pb-14 pt-[calc(var(--header-h)+5rem)] ${dark ? "bg-black text-white" : "bg-white text-ink"}`}
    >
      <div className="container-x grid items-end gap-10 lg:grid-cols-[1fr_1.15fr]">
        <div className="pb-4">
          <p data-intro className={`eyebrow ${dark ? "text-white/50" : "text-mute"}`}>
            Shop · {count} models
          </p>
          <h1 data-title data-intro className="mt-4 text-[clamp(3.5rem,11vw,10rem)] font-bold leading-[0.85] tracking-[-0.055em]">
            {f.name}
          </h1>
          <p data-fade data-intro className="mt-6 text-2xl font-medium tracking-tight sm:text-3xl">
            {f.tagline}
          </p>
          <p data-fade data-intro className={`mt-4 max-w-md text-lg ${dark ? "text-white/60" : "text-mute"}`}>
            {f.intro}
          </p>
          <div data-fade data-intro className="mt-8 flex flex-wrap items-center gap-4">
            {from && (
              <span className={`rounded-full px-5 py-2.5 text-sm ${dark ? "bg-white/10" : "bg-paper"}`}>
                From <span className="font-semibold">{formatKsh(from)}</span>
              </span>
            )}
            <a href="#products" className={`flex items-center gap-2 text-sm font-semibold ${dark ? "text-white" : "text-ink"}`}>
              Browse all <ArrowDown className="h-4 w-4" />
            </a>
          </div>
        </div>
        <div data-media data-intro className={`relative aspect-[16/11] overflow-hidden rounded-[32px] ${dark ? "bg-black" : "bg-white"}`}>
          <Image src={f.image} alt={`${f.name} lineup`} fill preload sizes="(min-width: 1024px) 55vw, 100vw" className="object-contain" />
        </div>
      </div>
    </section>
  );
}
