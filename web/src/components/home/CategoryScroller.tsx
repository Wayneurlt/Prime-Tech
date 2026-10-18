"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { gsap, useGSAP, DESKTOP, MOTION_OK } from "@/lib/gsap";
import { formatKsh, type FamilySlug } from "@/lib/catalog";

export type CategoryPanel = {
  slug: FamilySlug;
  name: string;
  tagline: string;
  image: string;
  tone: "dark" | "light";
  count: number;
  from: number | null;
};

/**
 * Horizontal, pinned category gallery on desktop; a vertical stack of
 * revealing cards on smaller screens.
 */
export function CategoryScroller({ panels }: { panels: CategoryPanel[] }) {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(DESKTOP, () => {
        const distance = () => track.current!.scrollWidth - window.innerWidth;
        const scroll = gsap.to(track.current, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        });
        gsap.utils.toArray<HTMLElement>("[data-panel]").forEach((panel) => {
          gsap.fromTo(
            panel.querySelector("[data-img]"),
            { xPercent: 12, scale: 1.15 },
            {
              xPercent: -12,
              scale: 1,
              ease: "none",
              scrollTrigger: {
                trigger: panel,
                containerAnimation: scroll,
                start: "left right",
                end: "right left",
                scrub: true,
              },
            },
          );
          gsap.fromTo(panel.querySelectorAll("[data-panel-text] > *"), { y: 60, autoAlpha: 0 }, {
            y: 0,
            autoAlpha: 1,
            stagger: 0.06,
            duration: 1,
            clearProps: "transform,translate,rotate,scale,opacity,visibility",
            scrollTrigger: {
              trigger: panel,
              containerAnimation: scroll,
              start: "left 70%",
              once: true,
            },
          });
        });
        gsap.to("[data-progress]", {
          scaleX: 1,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: () => `+=${distance()}`,
            scrub: true,
          },
        });
      });
      mm.add(
        "(max-width: 1023px) and (prefers-reduced-motion: no-preference)",
        () => {
          gsap.utils.toArray<HTMLElement>("[data-panel]").forEach((panel) => {
            gsap.from(panel, {
              y: 80,
              autoAlpha: 0,
              duration: 1.2,
              scrollTrigger: { trigger: panel, start: "top 90%", once: true },
            });
          });
        },
      );
      mm.add(MOTION_OK, () => {
        gsap.from("[data-intro-line] > *", {
          yPercent: 110,
          duration: 1.2,
          stagger: 0.1,
          scrollTrigger: {
            trigger: root.current,
            start: "top 75%",
            once: true,
          },
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div>
      <section
        ref={root}
        className="relative overflow-hidden bg-paper py-20 lg:flex lg:h-svh lg:items-center lg:py-0"
      >
        <div
          ref={track}
          className="flex flex-col gap-5 px-4 sm:px-8 lg:w-max lg:flex-row lg:items-stretch lg:gap-6 lg:pl-14 lg:pr-[8vw]"
        >
          <div className="flex shrink-0 flex-col justify-between lg:w-[34vw] lg:py-[14vh] lg:pr-10">
            <div>
              <p className="eyebrow text-mute">Shop by category</p>
              <h2 className="mt-5 text-h2 font-bold" data-intro-line>
                <span className="block overflow-hidden">
                  <span className="block">The complete</span>
                </span>
                <span className="block overflow-hidden">
                  <span className="block">
                    Apple{" "}
                    <span className="serif-accent text-accent">ecosystem.</span>
                  </span>
                </span>
              </h2>
              <p className="mt-6 max-w-sm text-lg text-mute">
                Six families, {panels.reduce((s, p) => s + p.count, 0)} models,
                one trusted store. Pick a lane and we&apos;ll handle the rest.
              </p>
            </div>
            <div className="mt-10 hidden items-center gap-4 lg:flex">
              <span className="h-[2px] w-40 overflow-hidden rounded-full bg-ink/10">
                <span
                  data-progress
                  className="block h-full origin-left scale-x-0 bg-accent"
                />
              </span>
              <span className="eyebrow text-mute">Keep scrolling →</span>
            </div>
          </div>

          {panels.map((p, i) => {
            const dark = p.tone === "dark";
            return (
              <Link
                key={p.slug}
                href={`/${p.slug}`}
                data-panel
                className={`group relative flex h-[68svh] min-h-[440px] shrink-0 flex-col overflow-hidden rounded-[32px] lg:h-[78vh] lg:w-[min(62vw,860px)] ${
                  dark ? "bg-black text-white" : "bg-white text-ink"
                }`}
              >
                <div className="absolute inset-0 overflow-hidden">
                  <div data-img className="absolute inset-[-6%] top-[18%]">
                    <Image
                      src={p.image}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 62vw, 100vw"
                      className="object-contain transition-transform duration-[1.4s] ease-[var(--ease-expo)] group-hover:scale-105"
                    />
                  </div>
                </div>
                <div
                  data-panel-text
                  className="relative z-10 flex items-start justify-between gap-6 p-7 sm:p-10"
                >
                  <div>
                    <p
                      className={`eyebrow ${dark ? "text-white/50" : "text-mute"}`}
                    >
                      {String(i + 1).padStart(2, "0")} /{" "}
                      {String(panels.length).padStart(2, "0")}
                    </p>
                    <h3 className="mt-3 text-[clamp(2.4rem,5vw,4.5rem)] font-bold leading-none tracking-[-0.04em]">
                      {p.name}
                    </h3>
                    <p
                      className={`mt-3 text-lg ${dark ? "text-white/65" : "text-mute"}`}
                    >
                      {p.tagline}
                    </p>
                  </div>
                  <span
                    className={`grid h-14 w-14 shrink-0 place-items-center rounded-full transition-all duration-700 ease-[var(--ease-expo)] group-hover:rotate-45 ${
                      dark ? "bg-white text-ink" : "bg-ink text-white"
                    }`}
                  >
                    <ArrowUpRight className="h-5 w-5" />
                  </span>
                </div>
                <div className="relative z-10 mt-auto flex items-center justify-between p-7 sm:p-10">
                  <span
                    className={`rounded-full px-4 py-2 text-sm font-medium backdrop-blur-md ${dark ? "bg-white/10" : "bg-ink/5"}`}
                  >
                    {p.count} models
                  </span>
                  {p.from && (
                    <span
                      className={`rounded-full px-4 py-2 text-sm backdrop-blur-md ${dark ? "bg-black/40 text-white/70" : "bg-white/70 text-mute"}`}
                    >
                      From{" "}
                      <span
                        className={`font-semibold ${dark ? "text-white" : "text-ink"}`}
                      >
                        {formatKsh(p.from)}
                      </span>
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
