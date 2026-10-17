"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { Plus, ArrowUpRight, Check } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";
import { formatKsh, productHref, type ProductCard as Card } from "@/lib/catalog";
import { addToCart, flyToCart } from "@/lib/cart";

export function ProductCard({
  product: p,
  priority = false,
  compare,
  dark = false,
}: {
  product: Card;
  priority?: boolean;
  compare?: { checked: boolean; onToggle: () => void; disabled: boolean };
  dark?: boolean;
}) {
  const card = useRef<HTMLDivElement>(null);
  const imgWrap = useRef<HTMLDivElement>(null);
  const [color, setColor] = useState(0);
  const [added, setAdded] = useState(false);
  const image = p.images[color] ?? p.image;
  const href = productHref(p);

  // Subtle 3D tilt that follows the pointer.
  useGSAP(
    () => {
      const el = card.current!;
      if (!window.matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)").matches) return;
      gsap.set(el, { transformPerspective: 900 });
      const rx = gsap.quickTo(el, "rotationX", { duration: 0.6, ease: "power3" });
      const ry = gsap.quickTo(el, "rotationY", { duration: 0.6, ease: "power3" });
      const ix = gsap.quickTo(imgWrap.current, "x", { duration: 0.8, ease: "power3" });
      const iy = gsap.quickTo(imgWrap.current, "y", { duration: 0.8, ease: "power3" });
      const move = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        rx(-py * 6);
        ry(px * 8);
        ix(px * 14);
        iy(py * 14);
      };
      const leave = () => {
        rx(0);
        ry(0);
        ix(0);
        iy(0);
      };
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerleave", leave);
      return () => {
        el.removeEventListener("pointermove", move);
        el.removeEventListener("pointerleave", leave);
      };
    },
    { scope: card },
  );

  const switchColor = (i: number) => {
    if (i === color) return;
    const el = imgWrap.current;
    if (el && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.fromTo(el, { scale: 0.92, autoAlpha: 0.4 }, { scale: 1, autoAlpha: 1, duration: 0.6 });
    }
    setColor(i);
  };

  const quickAdd = () => {
    if (!p.quickAdd) return;
    flyToCart(imgWrap.current, image?.src ?? null);
    addToCart({
      slug: p.slug,
      family: p.family,
      title: p.title,
      image: image?.src ?? null,
      price: p.quickAdd.price,
      condition: p.quickAdd.condition,
      storage: p.quickAdd.storage,
      ram: p.quickAdd.ram,
      color: image?.color ?? p.colors[0]?.name ?? null,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };

  const price = p.priceFrom ?? p.refurbFrom;

  return (
    <div
      ref={card}
      data-card
      className={`group relative flex h-full flex-col rounded-[28px] p-3 will-change-transform ${
        dark ? "bg-ink-2 text-white" : "bg-white"
      }`}
    >
      <Link href={href} className="relative block overflow-hidden rounded-[22px] bg-paper" data-cursor="View" aria-label={p.title}>
        <div className="relative aspect-[4/5]">
          <div ref={imgWrap} className="absolute inset-6">
            {image && (
              <Image
                src={image.src}
                alt={image.alt}
                fill
                preload={priority}
                sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 70vw"
                className="object-contain mix-blend-multiply transition-transform duration-[1.2s] ease-[var(--ease-expo)] group-hover:scale-[1.06]"
              />
            )}
          </div>
        </div>
        <div className="absolute left-3 top-3 flex gap-1.5">
          {p.isNew && <span className="rounded-full bg-ink px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wider text-white">New</span>}
          {p.conditions.includes("refurb") && (
            <span className="rounded-full bg-white px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wider text-ink">Ex-UK</span>
          )}
          {!p.inStock && <span className="rounded-full bg-white/80 px-2.5 py-1 text-[0.65rem] font-semibold text-mute">Out of stock</span>}
        </div>
        <span className="absolute right-3 top-3 grid h-9 w-9 translate-y-1 place-items-center rounded-full bg-white opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          <ArrowUpRight className="h-4 w-4 text-ink" />
        </span>
      </Link>

      <div className="flex flex-1 flex-col px-2 pb-1 pt-4">
        {p.colors.length > 1 && (
          <div className="mb-3 flex items-center gap-1.5" role="radiogroup" aria-label="Colour">
            {p.colors.slice(0, 6).map((c) => {
              const idx = p.images.findIndex((im) => im.color === c.name);
              const on = idx === color;
              return (
                <button
                  key={c.name}
                  role="radio"
                  aria-checked={on}
                  aria-label={c.name}
                  title={c.name}
                  onClick={() => idx >= 0 && switchColor(idx)}
                  className={`h-4 w-4 rounded-full border transition-transform duration-300 hover:scale-125 ${
                    on ? "ring-2 ring-accent ring-offset-2" : ""
                  } ${dark ? "border-white/20 ring-offset-ink-2" : "border-black/10"}`}
                  style={{ background: c.hex }}
                />
              );
            })}
            {p.colors.length > 6 && <span className="text-xs text-mute">+{p.colors.length - 6}</span>}
          </div>
        )}
        <Link href={href} className="text-[1.05rem] font-semibold leading-snug tracking-tight">
          {p.title}
        </Link>
        <p className={`mt-1 line-clamp-2 text-sm ${dark ? "text-white/50" : "text-mute"}`}>{p.summary.replace(/\.\.\.$/, "…")}</p>

        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <div>
            <p className={`text-xs ${dark ? "text-white/50" : "text-mute"}`}>{price ? (p.priceFrom ? "From" : "Ex-UK from") : "Coming soon"}</p>
            <p className="text-lg font-bold tracking-tight tabular-nums">{price ? formatKsh(price) : "Price on request"}</p>
          </div>
          {p.quickAdd && p.inStock ? (
            <button
              onClick={quickAdd}
              className={`grid h-11 w-11 shrink-0 place-items-center rounded-full transition-all duration-500 ${
                added ? "bg-[#22c55e] text-white" : dark ? "bg-white text-ink hover:bg-accent hover:text-white" : "bg-ink text-white hover:bg-accent"
              }`}
              aria-label={`Add ${p.title} to bag`}
            >
              {added ? <Check className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            </button>
          ) : (
            <Link
              href={href}
              className={`flex h-11 shrink-0 items-center rounded-full px-4 text-sm font-semibold transition-colors ${
                dark ? "bg-white/10 hover:bg-white hover:text-ink" : "bg-paper hover:bg-ink hover:text-white"
              }`}
            >
              {price ? "Options" : "Enquire"}
            </Link>
          )}
        </div>

        {compare && (
          <label className={`mt-3 flex cursor-pointer items-center gap-2 border-t pt-3 text-sm ${dark ? "border-white/10" : "border-line"} ${compare.disabled && !compare.checked ? "opacity-40" : ""}`}>
            <input
              type="checkbox"
              checked={compare.checked}
              disabled={compare.disabled && !compare.checked}
              onChange={compare.onToggle}
              className="h-4 w-4 accent-[var(--color-accent)]"
            />
            Compare
          </label>
        )}
      </div>
    </div>
  );
}
