"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, ShoppingBag } from "lucide-react";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";
import { whenRevealed } from "@/lib/intro";
import { formatKsh } from "@/lib/catalog";
import { financePlan } from "@/lib/site";
import { addToCart, flyToCart, openCart } from "@/lib/cart";
import { Odometer } from "@/components/motion/Odometer";

type Props = {
  href: string;
  price: number;
  product: { slug: string; family: string; title: string };
};

const PHONES = [
  { name: "Black", file: "black", swatch: "#2b2b2e", tint: "rgba(150,155,175,0.38)", ink: "#c9cbd1" },
  { name: "Silver", file: "silver", swatch: "#e3e4e5", tint: "rgba(225,230,240,0.32)", ink: "#eceef1" },
  { name: "Glacier", file: "glacier", swatch: "#b9cfe6", tint: "rgba(90,150,255,0.5)", ink: "#b9d2f0" },
  { name: "Burgundy", file: "burgundy", swatch: "#6b2333", tint: "rgba(210,40,85,0.5)", ink: "#e07890" },
];

/* Slots of the hand, front to back: the front card, the rest fanned out behind it.
   x/y are percentages of one phone's size; rotation pivots at the bottom edge. */
type Slot = { x: number; y: number; r: number; s: number; z: number; b: number };
// The fan extends right of the front card, so the whole hand is shifted left to stay centred.
const HAND_SHIFT = -39;
function slots(mobile: boolean): Slot[] {
  const k = mobile ? 0.82 : 1;
  return [
    { x: HAND_SHIFT, y: 0, r: -4, s: 1, z: 40, b: 1 },
    { x: HAND_SHIFT + 34 * k, y: 2, r: 5, s: 0.93, z: 30, b: 0.8 },
    { x: HAND_SHIFT + 64 * k, y: 4, r: 13, s: 0.86, z: 20, b: 0.68 },
    { x: HAND_SHIFT + 90 * k, y: 6, r: 21, s: 0.79, z: 10, b: 0.58 },
  ];
}
const vars = (sl: Slot) => ({ x: 0, y: 0, xPercent: sl.x, yPercent: sl.y, rotation: sl.r, scale: sl.s, zIndex: sl.z, filter: `brightness(${sl.b})` });

/** Server-rendered transform that matches the slot, so the first paint is already the fan. */
const css = (sl: Slot) => ({
  transform: `translate(${sl.x}%, ${sl.y}%) rotate(${sl.r}deg) scale(${sl.s})`,
  zIndex: sl.z,
  filter: `brightness(${sl.b})`,
});

const INITIAL = [2, 0, 3, 1]; // front: Glacier, left: Black, right: Burgundy, back: Silver

export function HeroFan({ href, price, product }: Props) {
  const root = useRef<HTMLElement>(null);
  const phones = useRef<(HTMLButtonElement | null)[]>([]);
  const order = useRef<number[]>([...INITIAL]); // order[slot] = phone index
  const busy = useRef(false);
  const [front, setFront] = useState(INITIAL[0]);
  const [added, setAdded] = useState(false);
  const { monthly } = financePlan(price);
  const active = PHONES[front];

  const isMobile = () => !window.matchMedia("(min-width: 768px)").matches;
  const reduce = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function place(instant: boolean) {
    const sl = slots(isMobile());
    order.current.forEach((phoneIdx, slot) => {
      const el = phones.current[phoneIdx];
      if (el) gsap[instant ? "set" : "to"](el, { ...vars(sl[slot]), ...(instant ? {} : { duration: 1.1, ease: "expo.inOut", overwrite: "auto" }) });
    });
  }

  /* ---------- entrance ---------- */
  useGSAP(
    () => {
      place(true);
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const els = phones.current.filter(Boolean);
        gsap.set(els, { x: 0, y: 0, xPercent: -10, yPercent: 90, rotation: (i) => (i - 1.5) * 4, scale: 0.92, autoAlpha: 0, filter: "brightness(1)" });
        const tl = gsap
          .timeline({ paused: true })
          .set("[data-intro]", { visibility: "visible" })
          .from("[data-f-giant]", { yPercent: 30, autoAlpha: 0, scale: 0.92, duration: 1.8, ease: "expo" }, 0)
          // Phones rise stacked in the centre, then deal out into the fan.
          .to(els, { yPercent: 0, autoAlpha: 1, duration: 1.1, stagger: 0.07, ease: "power3.out" }, 0.15)
          .add(() => place(false), 1.05)
          .from("[data-f-fade]", { y: 24, autoAlpha: 0, duration: 1.1, stagger: 0.08, clearProps: "transform,translate" }, 0.6)
          .from("[data-f-glow]", { scale: 0.4, autoAlpha: 0, duration: 2 }, 0.3);
        const cancel = whenRevealed(() => tl.play());

        // Depth on scroll: lettering drifts faster than the phones.
        gsap.to("[data-f-giant]", { yPercent: -35, ease: "none", scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true } });
        gsap.to("[data-f-fan]", { yPercent: -8, scale: 1.04, ease: "none", scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true } });
        return cancel;
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  // Re-layout when crossing the mobile breakpoint.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = () => place(true);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- pointer tilt (desktop) ---------- */
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)").matches) return;
    const el = root.current!;
    const fan = el.querySelector<HTMLElement>("[data-f-fan]")!;
    const giant = el.querySelector<HTMLElement>("[data-f-giant-wrap]")!;
    gsap.set(fan, { transformPerspective: 1200 });
    const ry = gsap.quickTo(fan, "rotationY", { duration: 1, ease: "power3" });
    const rx = gsap.quickTo(fan, "rotationX", { duration: 1, ease: "power3" });
    const gx = gsap.quickTo(giant, "x", { duration: 1.2, ease: "power3" });
    const move = (e: PointerEvent) => {
      const px = e.clientX / window.innerWidth - 0.5;
      const py = e.clientY / window.innerHeight - 0.5;
      ry(px * 12);
      rx(-py * 6);
      gx(-px * 40);
    };
    el.addEventListener("pointermove", move);
    return () => el.removeEventListener("pointermove", move);
  }, []);

  /* ---------- shuffle a colour to the front ---------- */
  const choose = (phoneIdx: number) => {
    if (busy.current || order.current[0] === phoneIdx) return;
    const from = order.current.indexOf(phoneIdx);
    const next = [...order.current];
    [next[0], next[from]] = [phoneIdx, next[0]];
    order.current = next;
    setFront(phoneIdx);
    gsap.to(root.current, { "--tint": PHONES[phoneIdx].tint, duration: reduce() ? 0 : 1.2, ease: "power2.inOut" });
    if (reduce()) return place(true);

    busy.current = true;
    const sl = slots(isMobile());
    const el = phones.current[phoneIdx]!;
    next.forEach((idx, slot) => {
      if (idx !== phoneIdx) gsap.to(phones.current[idx], { ...vars(sl[slot]), duration: 1.1, ease: "expo.inOut", overwrite: "auto" });
    });
    // The chosen phone lifts out of the fan in an arc, then settles in front.
    gsap
      .timeline({ onComplete: () => void (busy.current = false) })
      .set(el, { zIndex: 50 })
      .to(el, { yPercent: -22, rotation: -8, scale: 0.95, filter: "brightness(1)", duration: 0.45, ease: "power2.out" })
      .to(el, { ...vars(sl[0]), duration: 0.75, ease: "expo.out" });
    gsap.fromTo("[data-f-name]", { yPercent: 60, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.8, ease: "expo", delay: 0.2 });
  };

  const buy = () => {
    const image = `/products/${product.family}/${product.slug}/${active.file}.webp`;
    flyToCart(phones.current[front], image);
    addToCart({ slug: product.slug, family: product.family, title: product.title, image, price, condition: "new", storage: 256, ram: null, color: active.name });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
    window.setTimeout(() => openCart.open("click"), 950);
  };

  const sl0 = slots(false);
  const swatches = (
    <div className="flex items-center gap-2" role="radiogroup" aria-label="Colour">
      {PHONES.map((p, i) => (
        <button
          key={p.name}
          type="button"
          role="radio"
          aria-checked={front === i}
          aria-label={p.name}
          title={p.name}
          onClick={() => choose(i)}
          className={`h-8 w-8 rounded-full border border-white/25 transition-transform duration-300 hover:scale-110 ${front === i ? "ring-2 ring-white ring-offset-[3px] ring-offset-black" : ""}`}
          style={{ background: p.swatch }}
        />
      ))}
    </div>
  );

  return (
    <section
      ref={root}
      data-header-dark
      className="grain relative flex h-svh min-h-[680px] flex-col overflow-clip bg-black text-white [--fw:min(42vw,36vh)] md:[--fw:min(24vh,26vw)]"
      style={{ ["--tint" as string]: PHONES[INITIAL[0]].tint }}
    >
      {/* Colour wash */}
      <div
        data-f-glow
        data-intro
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 55% 50% at 50% 58%, var(--tint), transparent 70%)" }}
      />

      {/* Top copy */}
      <div className="container-x relative z-20 pt-[calc(var(--header-h)+2.5rem)] text-center md:pt-[calc(var(--header-h)+2.75rem)]">
        <p data-f-fade data-intro className="eyebrow flex items-center justify-center gap-2 text-white/60">
          <span className="relative flex h-2 w-2">
            <span className="absolute inset-0 animate-ping rounded-full bg-accent" />
            <span className="relative h-2 w-2 rounded-full bg-accent" />
          </span>
          New arrival · In stock in Nairobi
        </p>
        <h1 data-f-fade data-intro className="mt-3 text-[clamp(1.9rem,4vw,3.4rem)] font-bold leading-none tracking-[-0.04em]">
          iPhone 18 Pro Max<span className="text-accent">.</span>
        </h1>
      </div>

      {/* Stage: giant lettering behind, fan of phones in front */}
      <div className="relative flex-1">
        <div data-f-giant-wrap aria-hidden className="pointer-events-none absolute inset-x-0 top-[6%] flex justify-center md:top-1/2 md:-translate-y-[62%]">
          <p
            data-f-giant
            data-intro
            className="select-none text-center text-[30vw] font-black leading-[0.8] tracking-[-0.06em] md:whitespace-nowrap md:text-[21vw]"
            style={{
              backgroundImage: "linear-gradient(180deg, rgba(255,255,255,0.95) 10%, var(--tint) 75%, rgba(255,255,255,0) 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            PRO
            <br className="md:hidden" /> MAX
          </p>
        </div>

        <div data-f-fan data-intro className="absolute inset-x-0 bottom-[3%] top-0 md:bottom-[6%]">
          {/* floor shadow */}
          <div aria-hidden className="absolute bottom-[1%] left-1/2 h-8 w-[calc(var(--fw)*2.2)] -translate-x-1/2 rounded-[50%] bg-black/70 blur-2xl" />
          {PHONES.map((p, i) => {
            const slot = INITIAL.indexOf(i);
            return (
              <button
                key={p.name}
                ref={(el) => {
                  phones.current[i] = el;
                }}
                type="button"
                onClick={() => choose(i)}
                aria-label={front === i ? `iPhone 18 Pro Max in ${p.name}` : `Bring ${p.name} to the front`}
                className="absolute bottom-0 left-[calc(50%-var(--fw)/2)] w-[var(--fw)] origin-bottom cursor-pointer outline-none [&:focus-visible_img]:drop-shadow-[0_0_20px_rgba(30,144,255,0.9)]"
                style={css(sl0[slot])}
              >
                <Image
                  src={`/images/hero/phone-${p.file}.webp`}
                  alt=""
                  width={318}
                  height={694}
                  preload={i === INITIAL[0]}
                  sizes="(min-width: 768px) 20vw, 46vw"
                  draggable={false}
                  className="h-auto w-full select-none drop-shadow-[0_40px_50px_rgba(0,0,0,0.65)]"
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="container-x relative z-20 pb-6 md:pb-8">
        <div className="flex flex-col items-center gap-4 md:flex-row md:items-end md:justify-between">
          <div data-f-fade data-intro className="flex flex-col items-center gap-3 md:items-start">
            <p className="overflow-hidden leading-none">
              <span data-f-name className="serif-accent block text-[2.4rem] md:text-5xl" style={{ color: active.ink }}>
                {active.name}
              </span>
            </p>
            {swatches}
          </div>

          <div data-f-fade data-intro className="flex w-full flex-col items-center gap-3 md:w-auto md:flex-row md:items-center md:gap-5">
            <p className="text-center text-sm text-white/55 md:text-right">
              <span className="block text-2xl font-bold tracking-tight text-white md:text-3xl">
                <Odometer value={price} prefix="KSh " />
              </span>
              or {formatKsh(monthly)}/mo with Lipa Pole Pole
            </p>
            <div className="flex w-full gap-2 md:w-auto">
              <button onClick={buy} className={`btn flex-1 md:flex-none ${added ? "bg-[#22c55e] text-white" : "btn-primary"}`}>
                {added ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
                <span>{added ? "Added" : `Buy in ${active.name}`}</span>
              </button>
              <Link href={href} className="btn btn-ghost text-white" aria-label="iPhone 18 Pro Max details">
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
