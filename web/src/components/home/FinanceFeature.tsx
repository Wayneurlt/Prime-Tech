"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";
import { ClipReveal, SplitReveal, Parallax } from "@/components/motion/primitives";
import { FINANCE, financePlan } from "@/lib/site";
import { formatKsh } from "@/lib/catalog";

const STEPS = [
  {
    title: "Choose your device",
    copy: `Pick any iPhone, Mac, iPad or Watch priced above ${formatKsh(FINANCE.minPrice)}.`,
  },
  {
    title: `Pay a ${FINANCE.depositRate * 100}% deposit`,
    copy: "Bring your ID, complete a quick application and pay the deposit via M-Pesa or card.",
  },
  {
    title: "Walk out, pay monthly",
    copy: "Take your device home the same day and clear the balance in easy M-Pesa instalments.",
  },
];

export function FinanceFeature({ featured }: { featured: { title: string; price: number } }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const steps = gsap.utils.toArray<HTMLElement>("[data-step]");
        gsap.fromTo(
          "[data-line]",
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: { trigger: "[data-steps]", start: "top 70%", end: "bottom 60%", scrub: 0.6 },
          },
        );
        steps.forEach((s) => {
          gsap
            .timeline({ scrollTrigger: { trigger: s, start: "top 68%", toggleActions: "play none none reverse" } })
            .to(s.querySelector("[data-dot]"), { backgroundColor: "#1e90ff", color: "#fff", borderColor: "#1e90ff", scale: 1.1, duration: 0.5 })
            .fromTo(s.querySelector("[data-body]"), { autoAlpha: 0.25, x: -10 }, { autoAlpha: 1, x: 0, duration: 0.8 }, 0);
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} className="bg-paper py-24 sm:py-32">
      <div className="container-x grid items-center gap-16 lg:grid-cols-[1.1fr_1fr]">
        <ClipReveal className="relative aspect-[4/3] overflow-hidden rounded-[32px]" from="inset(10% 18% 10% 18% round 32px)" to="inset(0% 0% 0% 0% round 32px)">
          <Parallax className="absolute inset-0" speed={0.08} scale={1.18}>
            <Image src="/images/financing-iphone-18-editorial.webp" alt="iPhone lineup displayed in a premium studio" fill sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
          </Parallax>
          <div className="absolute bottom-5 left-5 rounded-2xl bg-white/85 px-5 py-4 backdrop-blur-xl">
            <p className="eyebrow text-mute">{featured.title} from</p>
            <p className="text-2xl font-bold tracking-tight">{formatKsh(financePlan(featured.price).monthly)}<span className="text-base font-medium text-mute">/mo</span></p>
          </div>
        </ClipReveal>

        <div>
          <p className="eyebrow text-accent">Flexible financing</p>
          <SplitReveal className="mt-5 text-h2 font-bold" type="words">
            Lipa Pole Pole with <span className="serif-accent">Prime Tech.</span>
          </SplitReveal>
          <p className="mt-5 max-w-lg text-lg text-mute">
            Own the latest technology now and pay in affordable monthly instalments. Three simple steps, transparent from day one.
          </p>

          <ol data-steps className="relative mt-12 space-y-10 pl-16">
            <span className="absolute bottom-6 left-[22px] top-6 w-[2px] bg-ink/10" aria-hidden>
              <span data-line className="block h-full origin-top bg-accent" />
            </span>
            {STEPS.map((s, i) => (
              <li key={s.title} data-step className="relative">
                <span
                  data-dot
                  className="absolute -left-16 top-0 grid h-11 w-11 place-items-center rounded-full border border-ink/15 bg-paper font-mono text-sm font-semibold"
                >
                  {i + 1}
                </span>
                <div data-body>
                  <h3 className="text-xl font-semibold tracking-tight">{s.title}</h3>
                  <p className="mt-1.5 text-mute">{s.copy}</p>
                </div>
              </li>
            ))}
          </ol>

          <Link href="/lipa-polepole" className="btn btn-dark mt-12" data-cursor="Plan">
            <span>Calculate my plan</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
