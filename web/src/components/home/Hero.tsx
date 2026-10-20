"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Check,
  ShoppingBag,
} from "lucide-react";
import { gsap, SplitText, useGSAP, DESKTOP, MOTION_OK } from "@/lib/gsap";
import { whenRevealed } from "@/lib/intro";
import { formatKsh } from "@/lib/catalog";
import { financePlan } from "@/lib/site";
import { addToCart, flyToCart, openCart } from "@/lib/cart";
import { Magnetic } from "@/components/motion/primitives";

type Props = {
  href: string;
  price: number;
  product: { slug: string; family: string; title: string };
  chips: { label: string; value: string }[];
};

/* Left-to-right order of the phones in the original photograph. */
const PHONES = [
  {
    name: "Black",
    file: "black",
    swatch: "#2b2b2e",
    text: "#c9cbd1",
    glow: "rgba(170,175,190,0.34)",
  },
  {
    name: "Silver",
    file: "silver",
    swatch: "#e3e4e5",
    text: "#eceef1",
    glow: "rgba(235,238,245,0.3)",
  },
  {
    name: "Glacier",
    file: "glacier",
    swatch: "#b9cfe6",
    text: "#b9d2f0",
    glow: "rgba(100,160,255,0.45)",
  },
  {
    name: "Burgundy",
    file: "burgundy",
    swatch: "#6b2333",
    text: "#d4627c",
    glow: "rgba(215,45,90,0.45)",
  },
];

/* Layout in phone-widths (xPercent of each phone element), so it scales with any viewport. */
const FAN = (i: number, spacing: number) => (i - 1.5) * spacing;
const SPREAD_EXTRA = 45; // extra gap opened by the scroll story

export function Hero({ href, price, product, chips }: Props) {
  const root = useRef<HTMLElement>(null);
  const phones = useRef<(HTMLButtonElement | null)[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [glowIdx, setGlowIdx] = useState(2);
  const [added, setAdded] = useState(false);
  const selectedRef = useRef<number | null>(null);
  const introDone = useRef(false);
  const storyActive = useRef(false);
  const { monthly } = financePlan(price);

  // Phones overlap slightly on small screens (like the product photo) so each can be larger.
  const spacing = () =>
    window.matchMedia("(min-width: 768px)").matches ? 118 : 76;
  const reduce = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const desktop = () => window.matchMedia("(min-width: 1024px)").matches;

  /** Positions the "mode" layer of every phone: fanned line-up, or one in focus. */
  const layout = useCallback((focus: number | null, instant = false) => {
    const dur = instant || reduce() ? 0 : 1.1;
    const s = spacing();
    phones.current.forEach((el, i) => {
      if (!el) return;
      const mode = el.querySelector<HTMLElement>("[data-mode]");
      if (focus === null) {
        gsap.to(mode, {
          x: 0,
          xPercent: FAN(i, s),
          yPercent: 0,
          scale: 1,
          autoAlpha: 1,
          duration: dur,
          ease: "expo.inOut",
          delay: dur ? Math.abs(i - 1.5) * 0.04 : 0,
          overwrite: "auto",
        });
      } else if (i === focus) {
        gsap.to(mode, {
          x: 0,
          xPercent: desktop() ? -78 : 0,
          yPercent: desktop() ? -2 : -62,
          scale: desktop() ? 1.32 : 1.28,
          autoAlpha: 1,
          duration: dur,
          ease: "expo.inOut",
          overwrite: "auto",
        });
      } else {
        const dir = i < focus ? -1 : 1;
        gsap.to(mode, {
          x: 0,
          xPercent: dir * (360 + Math.abs(i - focus) * 60),
          yPercent: 6,
          scale: 0.8,
          autoAlpha: 0,
          duration: dur,
          ease: "expo.inOut",
          overwrite: "auto",
        });
      }
    });
    // Glow follows the active phone.
    const target = focus ?? null;
    if (target !== null) {
      gsap.to("[data-h-glow]", {
        xPercent: desktop() ? -78 * (1 / 2.4) - 50 : -50,
        duration: dur,
        ease: "expo.inOut",
        overwrite: "auto",
      });
    }
  }, []);

  /* ---------- entrance: stacked in the centre, then fan out ---------- */
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const split = SplitText.create("[data-h-title]", {
          type: "chars,words",
          mask: "words",
        });
        const modes = phones.current.map((p) =>
          p?.querySelector("[data-mode]"),
        );
        const s = spacing();
        gsap.set(modes, {
          x: 0,
          xPercent: (i) => (i - 1.5) * 7,
          yPercent: 18,
          rotate: (i) => (i - 1.5) * 3,
          scale: 0.86,
          autoAlpha: 0,
        });
        const tl = gsap
          .timeline({
            paused: true,
            onComplete: () => void (introDone.current = true),
          })
          .set("[data-intro]", { visibility: "visible" })
          .from(
            split.chars,
            { yPercent: 120, rotate: 6, duration: 1.3, stagger: 0.022 },
            0,
          )
          .fromTo(
            "[data-h-fade]",
            { y: 26, autoAlpha: 0 },
            {
              y: 0,
              autoAlpha: 1,
              duration: 1.1,
              stagger: 0.08,
              clearProps: "transform,translate",
            },
            0.5,
          )
          .to(
            modes,
            {
              yPercent: 0,
              autoAlpha: 1,
              duration: 1.1,
              stagger: 0.06,
              ease: "power3.out",
            },
            0.15,
          )
          .to(
            modes,
            {
              xPercent: (i) => FAN(i, s),
              rotate: 0,
              scale: 1,
              duration: 1.6,
              ease: "expo.inOut",
              stagger: { each: 0.05, from: "center" },
            },
            0.95,
          )
          .fromTo(
            "[data-h-glow]",
            { scale: 0.3, autoAlpha: 0 },
            { scale: 1, autoAlpha: 1, duration: 2.2 },
            0.6,
          )
          .fromTo(
            "[data-h-floor]",
            { scaleX: 0, autoAlpha: 0 },
            { scaleX: 1, autoAlpha: 1, duration: 1.6 },
            1,
          );
        const cancel = whenRevealed(() => tl.play());
        return () => {
          cancel();
          split.revert();
        };
      });

      // Scroll story: phones spread, spec cards slot into the gaps (desktop only).
      mm.add(DESKTOP, () => {
        const spreads = phones.current.map((p) =>
          p?.querySelector("[data-spread]"),
        );
        gsap
          .timeline({
            scrollTrigger: {
              trigger: root.current,
              start: "top top",
              // 120% story + 80% hold (time to look at the line-up) + 100% hand-off.
              // The hand-off length is matched by the next section's -100svh margin.
              end: "+=300%",
              pin: true,
              scrub: 1,
              anticipatePin: 1,
              onUpdate: (st) => {
                const active = st.progress > 0.02;
                if (active && !storyActive.current) {
                  // Reset any hover state so the line-up reads cleanly while it spreads.
                  phones.current.forEach(
                    (o) =>
                      o &&
                      gsap.to(o.querySelector("[data-tilt]"), {
                        autoAlpha: 1,
                        scale: 1,
                        yPercent: 0,
                        rotationX: 0,
                        rotationY: 0,
                        duration: 0.5,
                        overwrite: "auto",
                      }),
                  );
                }
                storyActive.current = active;
                if (active && selectedRef.current !== null) close();
              },
            },
          })
          .to(
            "[data-h-copy]",
            { yPercent: -40, autoAlpha: 0, ease: "power2.in", duration: 0.35 },
            0,
          )
          .to("[data-h-hint]", { autoAlpha: 0, duration: 0.1 }, 0)
          .to("[data-h-glow]", { autoAlpha: 0, duration: 0.3 }, 0.05)
          .to(
            spreads,
            {
              xPercent: (i) => (i - 1.5) * SPREAD_EXTRA,
              ease: "power2.inOut",
              duration: 0.6,
            },
            0.1,
          )
          .to(
            "[data-h-stage]",
            { scale: 0.88, yPercent: -12, ease: "power2.inOut", duration: 0.6 },
            0.1,
          )
          .fromTo(
            "[data-h-spec]",
            { autoAlpha: 0, y: 24 },
            {
              autoAlpha: 1,
              y: 0,
              stagger: 0.04,
              duration: 0.18,
              ease: "power3.out",
            },
            0.62,
          )
          .fromTo(
            "[data-h-name]",
            { autoAlpha: 0, y: 16 },
            { autoAlpha: 1, y: 0, stagger: 0.05, duration: 0.25 },
            0.6,
          )
          .fromTo(
            "[data-h-closing]",
            { autoAlpha: 0, y: 30 },
            { autoAlpha: 1, y: 0, duration: 0.3 },
            0.5,
          )
          // Hand-off: the hero sinks back while the next panel slides over it.
          .to(
            "[data-h-depth]",
            {
              scale: 0.95,
              yPercent: -2,
              borderRadius: 24,
              ease: "power2.in",
              duration: 0.83,
            },
            1.67, // timeline units: 1 = 120% of scroll, so the hold spans 1 → 1.67
          )
          .to(
            "[data-h-dim]",
            { opacity: 0.45, ease: "power2.in", duration: 0.83 },
            1.67,
          );
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  /* ---------- hover: lift + tilt toward the pointer, dim the others ---------- */
  useEffect(() => {
    const fine = window.matchMedia(
      "(pointer: fine) and (prefers-reduced-motion: no-preference)",
    ).matches;
    const cleanups: (() => void)[] = [];
    phones.current.forEach((el, i) => {
      if (!el) return;
      const tilt = el.querySelector<HTMLElement>("[data-tilt]")!;
      gsap.set(tilt, { transformPerspective: 900, transformOrigin: "50% 80%" });
      const enter = () => {
        if (selectedRef.current !== null || storyActive.current) return;
        setGlowIdx(i);
        gsap.to(tilt, {
          yPercent: -5,
          scale: 1.04,
          duration: 0.7,
          ease: "expo",
          overwrite: "auto",
        });
        phones.current.forEach((o, j) => {
          if (o && j !== i)
            gsap.to(o.querySelector("[data-tilt]"), {
              autoAlpha: 0.45,
              scale: 0.97,
              duration: 0.6,
              overwrite: "auto",
            });
        });
      };
      const move = (e: PointerEvent) => {
        if (!fine || selectedRef.current !== null || storyActive.current)
          return;
        const r = tilt.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        gsap.to(tilt, {
          rotationY: px * 22,
          rotationX: -py * 14,
          duration: 0.6,
          ease: "power3",
          overwrite: "auto",
        });
      };
      const leave = () => {
        gsap.to(tilt, {
          yPercent: 0,
          scale: 1,
          rotationY: 0,
          rotationX: 0,
          duration: 0.9,
          ease: "expo",
          overwrite: "auto",
        });
        phones.current.forEach((o, j) => {
          if (o && j !== i)
            gsap.to(o.querySelector("[data-tilt]"), {
              autoAlpha: 1,
              scale: 1,
              duration: 0.6,
              overwrite: "auto",
            });
        });
      };
      el.addEventListener("pointerenter", enter);
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerleave", leave);
      el.addEventListener("focus", enter);
      el.addEventListener("blur", leave);
      cleanups.push(() => {
        el.removeEventListener("pointerenter", enter);
        el.removeEventListener("pointermove", move);
        el.removeEventListener("pointerleave", leave);
        el.removeEventListener("focus", enter);
        el.removeEventListener("blur", leave);
      });
    });
    return () => cleanups.forEach((c) => c());
  }, []);

  // Glow slides behind whichever phone is active.
  useGSAP(
    () => {
      if (selectedRef.current !== null) return;
      gsap.to("[data-h-glow]", {
        xPercent:
          FAN(glowIdx, typeof window === "undefined" ? 118 : spacing()) / 2.4 -
          50,
        "--glow": PHONES[glowIdx].glow,
        duration: 1.1,
        ease: "expo",
        overwrite: "auto",
      });
    },
    { dependencies: [glowIdx], scope: root },
  );

  /* ---------- focus mode ---------- */
  const select = (i: number) => {
    if (!introDone.current && !reduce()) return;
    if (selectedRef.current === i) return;
    selectedRef.current = i;
    setSelected(i);
    setGlowIdx(i);
    phones.current.forEach(
      (o) =>
        o &&
        gsap.to(o.querySelector("[data-tilt]"), {
          autoAlpha: 1,
          scale: 1,
          rotationX: 0,
          rotationY: 0,
          yPercent: 0,
          duration: 0.6,
          overwrite: "auto",
        }),
    );
    gsap.to("[data-h-glow]", { "--glow": PHONES[i].glow, duration: 1 });
    gsap.to("[data-h-copy]", {
      autoAlpha: 0,
      y: -24,
      duration: reduce() ? 0 : 0.5,
      ease: "power2.in",
    });
    layout(i);
  };

  function close() {
    if (selectedRef.current === null) return;
    selectedRef.current = null;
    setSelected(null);
    gsap.to("[data-h-copy]", {
      autoAlpha: 1,
      y: 0,
      duration: reduce() ? 0 : 0.8,
      delay: reduce() ? 0 : 0.25,
      ease: "expo",
    });
    layout(null);
  }

  // Panel entrance whenever a phone is chosen.
  useGSAP(
    () => {
      if (selected === null || reduce()) return;
      gsap.fromTo(
        "[data-h-panel] > *",
        { y: 30, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.9,
          stagger: 0.06,
          delay: 0.35,
          ease: "expo",
        },
      );
    },
    { dependencies: [selected], scope: root },
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-apply the line-up on breakpoint changes (spacing differs on mobile).
  useEffect(() => {
    if (reduce()) {
      introDone.current = true;
      layout(null, true);
    }
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = () =>
      introDone.current && layout(selectedRef.current, true);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [layout]);

  const chosen = selected !== null ? PHONES[selected] : null;
  const buy = () => {
    if (!chosen || selected === null) return;
    const image = `/products/${product.family}/${product.slug}/${chosen.file}.webp`;
    flyToCart(phones.current[selected], image);
    addToCart({
      slug: product.slug,
      family: product.family,
      title: product.title,
      image,
      price,
      condition: "new",
      storage: 256,
      ram: null,
      color: chosen.name,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
    window.setTimeout(() => openCart.open("click"), 950);
  };

  return (
    <div>
      <section
        ref={root}
        data-header-dark
        className="hero-pw relative h-svh min-h-[720px] overflow-hidden bg-ink text-white [--pw:min(29vw,27vh)] md:[--pw:min(21vh,19vw)] lg:min-h-0 lg:[--pw:min(18vh,16vw)]"
      >
        <div
          data-h-depth
          className="grain absolute inset-0 overflow-hidden bg-black"
          onClick={(e) => {
            if (selected !== null && e.target === e.currentTarget) close();
          }}
        >
          {/* Copy */}
          <div
            data-h-copy
            className="container-x relative z-20 flex flex-col items-center pt-[calc(var(--header-h)+4.5rem)] text-center lg:pt-[calc(var(--header-h)+3.5rem)]"
          >
            <p
              data-h-fade
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
              data-h-title
              data-intro
              className="mt-4 text-[clamp(3rem,8.6vw,7.5rem)] font-bold leading-[0.9] tracking-[-0.05em]"
            >
              iPhone 18 Pro Max<span className="text-accent">.</span>
            </h1>
            <p
              data-h-fade
              data-intro
              className="mt-4 max-w-xl text-lg text-white/65 sm:text-xl"
            >
              Four gorgeous colours.{" "}
              <span className="serif-accent text-white">Pick yours.</span>
            </p>
            <div
              data-h-fade
              data-intro
              className="mt-7 flex flex-wrap items-center justify-center gap-3"
            >
              <Magnetic>
                <Link href={href} className="btn btn-primary">
                  <span>Buy now</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Magnetic>
              <p className="order-last basis-full text-sm text-white/50 lg:order-none lg:basis-auto">
                From <span className="text-white">{formatKsh(price)}</span> or{" "}
                <span className="text-white">{formatKsh(monthly)}/mo</span>
              </p>
              {/* Colour picker: opens the same focus view as tapping a phone */}
              <div
                className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] p-1.5 backdrop-blur-md lg:pl-4"
                role="group"
                aria-label="Pick your colour"
              >
                <span className="eyebrow hidden text-[0.62rem] text-white/50 lg:inline">
                  Pick your colour
                </span>
                <span className="flex gap-1.5">
                  {PHONES.map((ph, i) => (
                    <button
                      key={ph.name}
                      type="button"
                      onClick={() => select(i)}
                      onMouseEnter={() =>
                        selectedRef.current === null && setGlowIdx(i)
                      }
                      aria-label={`Show ${ph.name}`}
                      title={ph.name}
                      className={`h-7 w-7 rounded-full border border-white/25 transition-transform duration-300 hover:scale-110 ${glowIdx === i ? "ring-2 ring-white/80 ring-offset-2 ring-offset-black" : ""}`}
                      style={{ background: ph.swatch }}
                    />
                  ))}
                </span>
              </div>
            </div>
          </div>

          {/* Stage */}
          <div
            data-h-stage
            className="pointer-events-none absolute inset-x-0 bottom-[7vh] top-[50%] sm:top-[48%] md:bottom-[4vh] lg:top-[47%]"
          >
            <div
              data-h-glow
              data-intro
              className="absolute left-1/2 top-[45%] aspect-square w-[calc(var(--pw)*2.4)] -translate-y-1/2 rounded-full"
              style={{
                ["--glow" as string]: PHONES[2].glow,
                background:
                  "radial-gradient(closest-side, var(--glow), transparent)",
              }}
            />
            <div
              data-h-floor
              data-intro
              className="absolute inset-x-[8%] bottom-[6%] h-px bg-gradient-to-r from-transparent via-white/25 to-transparent"
            />

            {PHONES.map((p, i) => (
              <button
                key={p.name}
                ref={(el) => {
                  phones.current[i] = el;
                }}
                type="button"
                onClick={() => (selected === i ? close() : select(i))}
                aria-label={
                  selected === i
                    ? `Close ${p.name}`
                    : `View iPhone 18 Pro Max in ${p.name}`
                }
                aria-pressed={selected === i}
                className="pointer-events-none absolute bottom-[6%] left-[calc(50%-var(--pw)/2)] w-[var(--pw)] cursor-pointer outline-none focus-visible:[&_img]:drop-shadow-[0_0_24px_rgba(30,144,255,0.9)]"
                style={{
                  zIndex:
                    selected === i ? 10 : 4 - Math.abs(Math.round(i - 1.5)),
                }}
              >
                <span data-spread className="block">
                  <span
                    data-mode
                    data-intro
                    className="block"
                    style={{ translate: `${FAN(i, 118)}% 0` }}
                  >
                    <span data-tilt className="pointer-events-auto block">
                      <Image
                        src={`/images/hero/phone-${p.file}.webp`}
                        alt=""
                        width={318}
                        height={694}
                        preload
                        sizes="(min-width: 1024px) 24vh, 30vw"
                        className="h-auto w-full select-none drop-shadow-[0_30px_40px_rgba(0,0,0,0.6)]"
                        draggable={false}
                      />
                    </span>
                    {/* Floor reflection */}
                    <span
                      aria-hidden
                      className="pointer-events-none -mt-px block aspect-[318/130] overflow-hidden opacity-25 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]"
                    >
                      <Image
                        src={`/images/hero/phone-${p.file}.webp`}
                        alt=""
                        width={318}
                        height={694}
                        sizes="10vw"
                        className="h-auto w-full -scale-y-100"
                        draggable={false}
                      />
                    </span>
                    <span
                      data-h-name
                      className="eyebrow invisible absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap text-white/70 opacity-0"
                    >
                      {p.name}
                    </span>
                  </span>
                </span>
              </button>
            ))}
          </div>

          {/* Focus panel */}
          {chosen && (
            <div
              data-h-panel
              className="absolute inset-x-0 bottom-[5vh] z-20 flex flex-col items-center px-4 text-center lg:inset-x-auto lg:bottom-auto lg:left-[calc(50%+var(--pw)*0.55)] lg:top-1/2 lg:-translate-y-1/2 lg:items-start lg:text-left"
            >
              <p className="eyebrow text-white/50">iPhone 18 Pro Max</p>
              <p
                className="serif-accent mt-1 text-[clamp(3rem,6vw,5.5rem)] leading-none"
                style={{ color: chosen.text }}
              >
                {chosen.name}
              </p>
              <p className="mt-4 text-sm text-white/60 lg:text-base">
                256GB from{" "}
                <span className="font-semibold text-white">
                  {formatKsh(price)}
                </span>{" "}
                · or {formatKsh(monthly)}/mo
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2.5 lg:justify-start">
                <button
                  onClick={buy}
                  className={`btn ${added ? "bg-[#22c55e] text-white" : "btn-primary"}`}
                >
                  {added ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <ShoppingBag className="h-4 w-4" />
                  )}
                  <span>{added ? "Added" : `Buy in ${chosen.name}`}</span>
                </button>
                <Link href={href} className="btn btn-ghost text-white">
                  <span>View details</span>
                </Link>
              </div>
              <button
                onClick={close}
                className="mt-5 flex items-center gap-2 text-sm text-white/60 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" /> All colours
              </button>
            </div>
          )}

          {/* End of the scroll story */}
          <div
            data-h-closing
            className="pointer-events-none invisible absolute inset-x-0 top-[calc(var(--header-h)+3.5rem)] z-10 hidden text-center opacity-0 lg:block"
          >
            <p className="eyebrow text-white/45">Pro, in every colour</p>
            <p className="mt-3 text-[clamp(2.4rem,4.4vw,4rem)] font-bold leading-none tracking-[-0.04em]">
              Built for{" "}
              <span className="serif-accent text-accent-2">
                Apple Intelligence.
              </span>
            </p>
            <dl className="mx-auto mt-7 flex w-fit items-stretch divide-x divide-white/15">
              {chips.slice(0, 4).map((c) => (
                <div key={c.label} data-h-spec className="px-7 text-center">
                  <dt className="eyebrow text-[0.65rem] text-white/50">
                    {c.label}
                  </dt>
                  <dd className="mt-1.5 whitespace-nowrap text-xl font-semibold tracking-tight">
                    {c.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div
            className={`absolute bottom-5 left-1/2 z-10 hidden -translate-x-1/2 transition-opacity duration-500 lg:block ${selected !== null ? "opacity-0" : ""}`}
          >
            <div
              data-h-hint
              className="flex items-center gap-2 text-xs text-white/45"
            >
              Tap a phone to explore its colour · Scroll for specs{" "}
              <ArrowDown className="h-3.5 w-3.5" />
            </div>
          </div>
          <div
            data-h-dim
            aria-hidden
            className="pointer-events-none absolute inset-0 z-40 bg-black opacity-0"
          />
        </div>
      </section>
    </div>
  );
}
