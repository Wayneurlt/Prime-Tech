"use client";

import { useRef } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";
import type { ProductCard as Card } from "@/lib/catalog";
import { ProductCard } from "@/components/product/ProductCard";

/** Horizontally scrolling, draggable row of product cards. */
export function ProductRail({ products, dark = false }: { products: Card[]; dark?: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const rail = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.fromTo(
          "[data-rail-item]",
          { x: 160, autoAlpha: 0 },
          { x: 0, autoAlpha: 1, duration: 1.4, stagger: 0.08, scrollTrigger: { trigger: root.current, start: "top 85%", once: true } },
        );
      });

      // Mouse drag to scroll.
      const el = rail.current!;
      let down = false;
      let startX = 0;
      let startScroll = 0;
      let moved = false;
      const onDown = (e: PointerEvent) => {
        if (e.pointerType !== "mouse") return;
        down = true;
        moved = false;
        startX = e.clientX;
        startScroll = el.scrollLeft;
      };
      const onMove = (e: PointerEvent) => {
        if (!down) return;
        const dx = e.clientX - startX;
        if (Math.abs(dx) > 5) moved = true;
        el.scrollLeft = startScroll - dx;
      };
      const onUp = () => {
        down = false;
      };
      const onClick = (e: MouseEvent) => {
        if (moved) {
          e.preventDefault();
          e.stopPropagation();
          moved = false;
        }
      };
      el.addEventListener("pointerdown", onDown);
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      el.addEventListener("click", onClick, true);
      return () => {
        mm.revert();
        el.removeEventListener("pointerdown", onDown);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        el.removeEventListener("click", onClick, true);
      };
    },
    { scope: root },
  );

  const nudge = (dir: 1 | -1) => {
    const el = rail.current!;
    const card = el.querySelector<HTMLElement>("[data-rail-item]");
    const step = (card?.offsetWidth ?? 320) + 20;
    el.scrollBy({ left: dir * step * 2, behavior: "smooth" });
  };

  return (
    <div ref={root} className="relative">
      <div
        ref={rail}
        data-cursor="Drag"
        className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-4 sm:px-8 xl:px-14"
        style={{ scrollPaddingInline: "16px" }}
      >
        {products.map((p, i) => (
          <div key={p.slug} data-rail-item className="w-[78vw] shrink-0 snap-start sm:w-[44vw] lg:w-[30vw] xl:w-[23vw]">
            <ProductCard product={p} priority={i < 2} dark={dark} />
          </div>
        ))}
      </div>
      <div className="container-x mt-6 flex justify-end gap-2">
        {[-1, 1].map((d) => (
          <button
            key={d}
            onClick={() => nudge(d as 1 | -1)}
            className={`grid h-12 w-12 place-items-center rounded-full border transition-colors ${
              dark ? "border-white/20 hover:bg-white hover:text-ink" : "border-ink/15 hover:bg-ink hover:text-white"
            }`}
            aria-label={d < 0 ? "Previous products" : "Next products"}
          >
            {d < 0 ? <ArrowLeft className="h-5 w-5" /> : <ArrowRight className="h-5 w-5" />}
          </button>
        ))}
      </div>
    </div>
  );
}
