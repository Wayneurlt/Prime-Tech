"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";
import { whenRevealed } from "@/lib/intro";

const SLOTS = [
  "left-[2%] top-[8%] w-[22%] rotate-[-8deg]",
  "left-[26%] top-[38%] w-[20%] rotate-[5deg]",
  "left-[50%] top-[4%] w-[24%] rotate-[-3deg]",
  "right-[2%] top-[30%] w-[21%] rotate-[9deg]",
  "left-[10%] bottom-[0%] w-[17%] rotate-[6deg]",
  "right-[24%] bottom-[2%] w-[18%] rotate-[-7deg]",
];

/** Product cards that float in, then drift apart with scroll on the About hero. */
export function FloatingProducts({ images }: { images: { src: string; alt: string }[] }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const cards = gsap.utils.toArray<HTMLElement>("[data-float]");
        gsap.set(root.current, { visibility: "visible" });
        gsap.set(cards, { y: 160, autoAlpha: 0, scale: 0.8 });
        const cancel = whenRevealed(() =>
          gsap.to(cards, { y: 0, autoAlpha: 1, scale: 1, duration: 1.6, stagger: 0.09, delay: 0.3, ease: "expo" }),
        );
        cards.forEach((c, i) => {
          gsap.to(c, {
            y: (i % 2 ? -1 : 1) * (80 + i * 25),
            x: (i < 3 ? -1 : 1) * 40,
            rotate: (i % 2 ? 1 : -1) * 12,
            ease: "none",
            scrollTrigger: { trigger: root.current, start: "top 60%", end: "bottom top", scrub: 1 },
          });
          gsap.to(c.querySelector("[data-bob]"), { y: -12, duration: 2.4 + i * 0.3, repeat: -1, yoyo: true, ease: "sine.inOut" });
        });
        return cancel;
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} data-intro className="relative mx-auto aspect-[16/8] w-full max-w-6xl">
      {images.slice(0, SLOTS.length).map((im, i) => (
        <div key={im.src} data-float className={`absolute ${SLOTS[i]}`}>
          <div data-bob className="aspect-square rounded-[28px] bg-white p-4 shadow-[0_30px_60px_-25px_rgba(0,0,0,0.3)]">
            <div className="relative h-full w-full">
              <Image src={im.src} alt={im.alt} fill sizes="22vw" className="object-contain" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
