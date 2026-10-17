"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { ArrowRight, Repeat2 } from "lucide-react";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";
import { SplitReveal, Magnetic } from "@/components/motion/primitives";

const CREDIT = 85000;

export function TradeInFeature() {
  const root = useRef<HTMLElement>(null);
  const amount = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const o = { v: 0 };
        const tl = gsap.timeline({
          scrollTrigger: { trigger: "[data-stage]", start: "top 85%", end: "bottom 45%", scrub: 0.8 },
        });
        tl.fromTo("[data-old]", { xPercent: 0, rotate: -4 }, { xPercent: -38, rotate: -14, scale: 0.86, autoAlpha: 0.35, ease: "power1.inOut" }, 0)
          .fromTo("[data-new]", { xPercent: 70, rotate: 16, autoAlpha: 0 }, { xPercent: 12, rotate: 4, autoAlpha: 1, ease: "power2.out" }, 0)
          .fromTo("[data-swap]", { rotate: 0, scale: 0.6 }, { rotate: 360, scale: 1, ease: "none" }, 0)
          .to(o, {
            v: CREDIT,
            ease: "power1.out",
            onUpdate: () => {
              if (amount.current) amount.current.textContent = Math.round(o.v / 500) * 500 > 0 ? (Math.round(o.v / 500) * 500).toLocaleString("en-KE") : "0";
            },
          }, 0)
          .fromTo("[data-bar]", { scaleX: 0 }, { scaleX: 1, ease: "none" }, 0);
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} data-header-dark className="grain relative overflow-hidden bg-ink py-24 text-white sm:py-32">
      <div className="pointer-events-none absolute -left-40 top-1/3 h-[50vmax] w-[50vmax] rounded-full bg-accent/20 blur-[120px]" />
      <div className="container-x relative grid items-center gap-16 lg:grid-cols-2">
        <div>
          <p className="eyebrow flex items-center gap-2 text-white/50">
            <Repeat2 className="h-4 w-4 text-accent" /> Trade in
          </p>
          <SplitReveal className="mt-5 text-h1 font-bold" type="words">
            Your old device is worth <span className="serif-accent text-accent-2">more</span> than you think.
          </SplitReveal>
          <p className="mt-6 max-w-md text-lg text-white/60">
            Upgrade to the latest iPhone or Mac without the full price tag. Tell us what you have, get a quote on WhatsApp, and we&apos;ll knock it straight off your new device.
          </p>
          <Magnetic className="mt-10 inline-block">
            <Link href="/trade-in" className="btn btn-light" data-cursor="Value">
              <span>Check my device&apos;s value</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Magnetic>
        </div>

        <div data-stage className="relative">
          <div className="relative mx-auto aspect-[5/4] max-w-xl">
            <div data-old className="absolute left-[4%] top-[8%] w-[52%] rounded-[28px] bg-white p-5 shadow-2xl">
              <div className="relative aspect-square">
                <Image src="/products/iphone/iphone-14/purple.webp" alt="An older iPhone" fill sizes="300px" className="object-contain" />
              </div>
              <p className="mt-2 text-center text-sm font-medium text-ink/60">Your current iPhone</p>
            </div>
            <div data-new className="absolute right-[2%] top-[2%] w-[56%] rounded-[28px] bg-white p-5 shadow-[0_40px_80px_-20px_rgba(30,144,255,0.5)]">
              <div className="relative aspect-square">
                <Image src="/products/iphone/iphone-18-pro-max/glacier.webp" alt="iPhone 18 Pro Max in Glacier" fill sizes="320px" className="object-contain" />
              </div>
              <p className="mt-2 text-center text-sm font-semibold text-ink">iPhone 18 Pro Max</p>
            </div>
            <span data-swap className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-accent shadow-xl">
              <Repeat2 className="h-7 w-7" />
            </span>
          </div>

          <div className="relative mx-auto -mt-6 max-w-md rounded-3xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur-xl">
            <p className="eyebrow text-white/50">Estimated credit</p>
            <p className="mt-2 text-5xl font-bold tracking-tight sm:text-6xl">
              <span className="text-white/50">KSh </span>
              <span ref={amount} className="tabular-nums">
                {CREDIT.toLocaleString("en-KE")}
              </span>
              <span className="align-top text-2xl text-accent-2">*</span>
            </p>
            <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/10">
              <div data-bar className="h-full origin-left rounded-full bg-gradient-to-r from-accent to-accent-2" />
            </div>
            <p className="mt-3 text-xs text-white/45">*Up to KSh 85,000 for an iPhone 14 Pro Max in good condition. Final value confirmed after inspection.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
