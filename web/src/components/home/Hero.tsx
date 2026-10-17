"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { ArrowRight, ArrowDown } from "lucide-react";
import { gsap, SplitText, useGSAP, DESKTOP, MOTION_OK } from "@/lib/gsap";
import { whenRevealed } from "@/lib/intro";
import { formatKsh } from "@/lib/catalog";
import { financePlan } from "@/lib/site";
import { Magnetic } from "@/components/motion/primitives";

type Props = {
  href: string;
  price: number;
  chips: { label: string; value: string }[];
};

/* Order matches the phones in the hero photograph, left to right. */
const FINISHES = [
  { name: "Black", hex: "#2b2b2e", glow: "rgba(170,170,185,0.32)", x: "18.5%" },
  { name: "Silver", hex: "#e3e4e5", glow: "rgba(255,255,255,0.3)", x: "39.5%" },
  {
    name: "Glacier",
    hex: "#b9cfe6",
    glow: "rgba(110,165,255,0.42)",
    x: "60.5%",
  },
  {
    name: "Burgundy",
    hex: "#6b2333",
    glow: "rgba(210,40,85,0.42)",
    x: "81.5%",
  },
];

const CHIP_POS = [
  "left-[4%] top-[18%]",
  "right-[5%] top-[14%]",
  "left-[7%] bottom-[22%]",
  "right-[4%] bottom-[28%]",
];

export function Hero({ href, price, chips }: Props) {
  const root = useRef<HTMLElement>(null);
  const [finish, setFinish] = useState(2);
  const { monthly } = financePlan(price);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // Entrance, after preloader / page curtain.
      mm.add(MOTION_OK, () => {
        const split = SplitText.create("[data-title]", {
          type: "chars,words",
          mask: "words",
        });
        gsap.set("[data-title]", { visibility: "visible" });
        const tl = gsap
          .timeline({ paused: true })
          .set("[data-intro]", { visibility: "visible" })
          .fromTo(
            "[data-stage]",
            { yPercent: 18, scale: 1.12, autoAlpha: 0, filter: "blur(18px)" },
            {
              yPercent: 0,
              scale: 1,
              autoAlpha: 1,
              filter: "blur(0px)",
              duration: 2.2,
            },
            0,
          )
          .from(
            split.chars,
            { yPercent: 120, rotate: 6, duration: 1.4, stagger: 0.025 },
            0.15,
          )
          .from(
            "[data-fade]",
            { y: 30, autoAlpha: 0, duration: 1.2, stagger: 0.08 },
            0.6,
          )
          .from(
            "[data-glow]",
            { scale: 0.2, autoAlpha: 0, duration: 2.4 },
            0.3,
          );
        const cancel = whenRevealed(() => tl.play());
        return () => {
          cancel();
          split.revert();
        };
      });

      // Pinned scroll story on desktop.
      mm.add(DESKTOP, () => {
        gsap
          .timeline({
            scrollTrigger: {
              trigger: root.current,
              start: "top top",
              end: "+=130%",
              pin: true,
              scrub: 1,
              anticipatePin: 1,
            },
          })
          .to(
            "[data-copy]",
            { y: -160, autoAlpha: 0, ease: "power2.in", duration: 0.4 },
            0,
          )
          .to(
            "[data-stage-inner]",
            { scale: 1.32, yPercent: -16, ease: "power1.inOut", duration: 1 },
            0,
          )
          .fromTo(
            "[data-chip]",
            { autoAlpha: 0, y: 40, scale: 0.9 },
            { autoAlpha: 1, y: 0, scale: 1, stagger: 0.08, duration: 0.3 },
            0.35,
          )
          .fromTo(
            "[data-finish-label]",
            { autoAlpha: 0, y: 20 },
            { autoAlpha: 1, y: 0, stagger: 0.05, duration: 0.25 },
            0.55,
          )
          .to("[data-hint]", { autoAlpha: 0, duration: 0.1 }, 0);
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  // Spotlight follows the chosen finish.
  useGSAP(
    () => {
      gsap.to("[data-glow]", {
        left: FINISHES[finish].x,
        "--glow": FINISHES[finish].glow,
        duration: 1.2,
        ease: "expo",
      });
    },
    { dependencies: [finish], scope: root },
  );

  return (
    <div>
      <section
        ref={root}
        data-header-dark
        className="grain relative h-svh min-h-[720px] overflow-hidden bg-black text-white"
      >
        <div
          data-copy
          className="container-x relative z-10 flex flex-col items-center pt-[calc(var(--header-h)+5.5rem)] text-center lg:pt-[calc(var(--header-h)+4rem)]"
        >
          <p
            data-intro
            className="eyebrow flex items-center gap-2 text-white/60"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inset-0 animate-ping rounded-full bg-accent" />
              <span className="relative h-2 w-2 rounded-full bg-accent" />
            </span>
            New arrival · In stock now
          </p>
          <h1
            data-title
            data-intro
            className="mt-5 text-[clamp(3.2rem,9.5vw,8.25rem)] font-bold leading-[0.9] tracking-[-0.05em]"
          >
            iPhone 18 Pro Max<span className="text-accent">.</span>
          </h1>
          <p
            data-fade
            data-intro
            className="mt-5 max-w-xl text-lg text-white/65 sm:text-xl"
          >
            Four gorgeous colours.{" "}
            <span className="serif-accent text-white">
              Built for Apple Intelligence.
            </span>
          </p>
          <div
            data-fade
            data-intro
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            <Magnetic>
              <Link href={href} className="btn btn-primary" data-cursor="Buy">
                <span>Buy now</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Magnetic>
            <Link
              href={`${href}#overview`}
              className="btn btn-ghost text-white"
            >
              <span>Learn more</span>
            </Link>
          </div>
          <div
            data-fade
            data-intro
            className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3"
          >
            <div
              className="flex items-center gap-2.5"
              role="radiogroup"
              aria-label="Preview finishes"
            >
              {FINISHES.map((f, i) => (
                <button
                  key={f.name}
                  role="radio"
                  aria-checked={finish === i}
                  aria-label={f.name}
                  onMouseEnter={() => setFinish(i)}
                  onFocus={() => setFinish(i)}
                  onClick={() => setFinish(i)}
                  className={`h-4 w-4 rounded-full border border-white/25 transition-transform duration-500 ${finish === i ? "scale-125 ring-2 ring-white/70 ring-offset-2 ring-offset-black" : "hover:scale-110"}`}
                  style={{ background: f.hex }}
                />
              ))}
              <span className="ml-1 w-16 text-left text-sm text-white/60">
                {FINISHES[finish].name}
              </span>
            </div>
            <span className="hidden h-4 w-px bg-white/15 sm:block" />
            <p className="text-sm text-white/50">
              From <span className="text-white">{formatKsh(price)}</span> or{" "}
              <span className="text-white">{formatKsh(monthly)}/mo</span> with
              Lipa Pole Pole
            </p>
          </div>
        </div>

        {/* Product stage */}
        <div
          data-stage
          data-intro
          className="absolute inset-x-0 bottom-0 top-[60%] sm:top-[56%] lg:top-[54%]"
        >
          <div
            data-stage-inner
            className="relative h-full w-full origin-bottom [mask-image:linear-gradient(to_bottom,transparent,black_14%)]"
          >
            {/* Desktop: wide photograph, labels and glow positioned over each phone. */}
            <div className="relative mx-auto hidden aspect-[1672/941] h-full max-w-full lg:block">
              <div
                data-glow
                className="pointer-events-none absolute top-[55%] z-10 aspect-square w-[42%] -translate-x-1/2 -translate-y-1/2 rounded-full mix-blend-screen"
                style={{
                  left: FINISHES[2].x,
                  ["--glow" as string]: FINISHES[2].glow,
                  background:
                    "radial-gradient(closest-side, var(--glow), transparent)",
                }}
              />
              <Image
                src="/images/iphone-editorial.webp"
                alt="iPhone 18 Pro Max in Black, Silver, Glacier and Burgundy"
                fill
                preload
                sizes="(min-width: 1024px) 90vw, 1px"
                className="object-contain"
              />
              {FINISHES.map((f) => (
                <span
                  key={f.name}
                  data-finish-label
                  className="eyebrow invisible absolute bottom-[4%] -translate-x-1/2 text-white/70"
                  style={{ left: f.x }}
                >
                  {f.name}
                </span>
              ))}
            </div>
            {/* Mobile: square photograph. */}
            <div className="relative mx-auto aspect-square h-full max-w-full lg:hidden">
              <Image
                src="/images/hero-iphone-18-pro-max-1024.webp"
                alt="iPhone 18 Pro Max in four finishes"
                fill
                preload
                sizes="(max-width: 1023px) 100vw, 1px"
                className="object-contain"
              />
            </div>
          </div>

          {chips.slice(0, CHIP_POS.length).map((c, i) => (
            <div
              key={c.label}
              data-chip
              className={`invisible absolute hidden rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-3.5 backdrop-blur-xl lg:block ${CHIP_POS[i]}`}
            >
              <p className="eyebrow text-white/45">{c.label}</p>
              <p className="mt-1 text-xl font-semibold tracking-tight">
                {c.value}
              </p>
            </div>
          ))}
        </div>

        <div
          data-hint
          className="absolute bottom-6 left-6 hidden items-center gap-3 text-white/50 lg:flex"
        >
          <span className="relative h-10 w-[1.5px] overflow-hidden bg-white/15">
            <span className="absolute inset-x-0 top-0 h-1/2 animate-[scrollhint_1.8s_ease-in-out_infinite] bg-white" />
          </span>
          <span className="eyebrow">Scroll</span>
          <ArrowDown className="h-3.5 w-3.5" />
        </div>
      </section>
    </div>
  );
}
