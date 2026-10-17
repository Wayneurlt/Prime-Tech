"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { ChevronRight, MessageCircle, ShieldCheck, Truck, Repeat2, Wallet, Check, ShoppingBag } from "lucide-react";
import { gsap, SplitText, useGSAP, MOTION_OK } from "@/lib/gsap";
import { whenRevealed } from "@/lib/intro";
import { conditionLabel, formatKsh, storageLabel, type Condition, type Product } from "@/lib/catalog";
import { FINANCE, financePlan, whatsappLink } from "@/lib/site";
import { addToCart, flyToCart, openCart } from "@/lib/cart";
import { Odometer } from "@/components/motion/Odometer";
import { Magnetic } from "@/components/motion/primitives";

type P = Pick<Product, "slug" | "family" | "title" | "summary" | "isNew" | "inStock" | "images" | "colors" | "variants" | "priceFrom">;

export function ProductView({ product: p, familyName }: { product: P; familyName: string }) {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);

  const conditions = useMemo(() => [...new Set(p.variants.map((v) => v.condition))].sort() as Condition[], [p.variants]);
  const [cond, setCond] = useState<Condition>(conditions[0] ?? "new");
  const condVariants = p.variants.filter((v) => v.condition === cond);
  const storages = [...new Set(condVariants.map((v) => v.storage).filter((s): s is number => !!s))].sort((a, b) => a - b);
  const [storage, setStorage] = useState<number | null>(storages[0] ?? null);
  const activeStorage = storage !== null && storages.includes(storage) ? storage : storages[0] ?? null;
  const rams = [
    ...new Set(condVariants.filter((v) => activeStorage === null || v.storage === activeStorage).map((v) => v.ram).filter((r): r is number => !!r)),
  ].sort((a, b) => a - b);
  const [ram, setRam] = useState<number | null>(rams[0] ?? null);
  const activeRam = ram !== null && rams.includes(ram) ? ram : rams[0] ?? null;

  const variantFor = (s: number | null, r: number | null) =>
    condVariants.find((v) => (s === null || v.storage === s) && (r === null || v.ram === r || v.ram === null)) ??
    condVariants.find((v) => s === null || v.storage === s);
  const variant = variantFor(activeStorage, activeRam);
  const basePrice = condVariants.length ? Math.min(...condVariants.map((v) => v.price)) : null;
  const price = variant?.price ?? basePrice;
  const inStock = variant ? variant.inStock : p.inStock;

  const colorNames = p.colors.length ? p.colors : p.images.map((i) => ({ name: i.color ?? "Default", hex: "#ccc" }));
  const [colorIdx, setColorIdx] = useState(0);
  const imageFor = (i: number) => p.images.find((im) => im.color === colorNames[i]?.name) ?? p.images[i] ?? p.images[0];
  const image = imageFor(colorIdx);
  const [prevImage, setPrevImage] = useState(image);
  const [added, setAdded] = useState(false);

  const plan = price ? financePlan(price) : null;
  const eligible = price ? price >= FINANCE.minPrice : false;

  // Entrance.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const split = SplitText.create("[data-ptitle]", { type: "words,chars", mask: "words" });
        const tl = gsap
          .timeline({ paused: true })
          .set("[data-intro]", { visibility: "visible" })
          .fromTo("[data-stage]", { clipPath: "inset(18% 18% 18% 18% round 32px)", scale: 0.96 }, { clipPath: "inset(0% 0% 0% 0% round 32px)", scale: 1, duration: 1.6, ease: "inOut" }, 0)
          .from("[data-main-img]", { scale: 1.25, yPercent: 8, duration: 2 }, 0)
          .from(split.chars, { yPercent: 110, duration: 1.1, stagger: 0.02 }, 0.3)
          .fromTo("[data-buy] > *", { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1, stagger: 0.06, clearProps: "transform,translate,rotate,scale,opacity,visibility" }, 0.45)
          .fromTo("[data-thumb]", { y: 20, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.05, clearProps: "transform,translate,rotate,scale,opacity,visibility" }, 0.8);
        const cancel = whenRevealed(() => tl.play());
        return () => {
          cancel();
          split.revert();
        };
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  // Colour change: circular reveal from the swatch that was clicked.
  const pickColor = (i: number, e?: React.MouseEvent) => {
    if (i === colorIdx) return;
    setPrevImage(image);
    setColorIdx(i);
    const el = stage.current?.querySelector<HTMLElement>("[data-next]");
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = stage.current!.getBoundingClientRect();
    const x = e ? ((e.clientX - r.left) / r.width) * 100 : 50;
    const y = e ? Math.min(100, ((e.clientY - r.top) / r.height) * 100) : 100;
    gsap.fromTo(el, { clipPath: `circle(0% at ${x}% ${y}%)` }, { clipPath: `circle(150% at ${x}% ${y}%)`, duration: 1.2, ease: "inOut" });
    gsap.fromTo(el.querySelector("img"), { scale: 1.15, rotate: -3 }, { scale: 1, rotate: 0, duration: 1.4 });
  };

  const add = () => {
    if (!price) return;
    flyToCart(stage.current, image?.src ?? null);
    addToCart({
      slug: p.slug,
      family: p.family,
      title: p.title,
      image: image?.src ?? null,
      price,
      condition: cond,
      storage: activeStorage,
      ram: activeRam,
      color: colorNames[colorIdx]?.name ?? null,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2000);
  };

  const buyNow = () => {
    add();
    window.setTimeout(() => openCart.open("click"), 900);
  };

  const options = [
    conditionLabel(cond),
    activeStorage ? storageLabel(activeStorage) : null,
    activeRam ? `${activeRam}GB RAM` : null,
    colorNames[colorIdx]?.name,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <section ref={root} className="bg-white pb-20 pt-[calc(var(--header-h)+3.5rem)]">
      <div className="container-x">
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-sm text-mute">
          <Link href="/" className="hover:text-ink">Store</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href={`/${p.family}`} className="hover:text-ink">{familyName}</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="truncate text-ink" aria-current="page">{p.title}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
          {/* Gallery */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <div ref={stage} data-stage data-intro className="relative aspect-square overflow-hidden rounded-[32px] bg-paper">
              {prevImage && (
                <Image src={prevImage.src} alt="" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-contain p-8 mix-blend-multiply sm:p-14" aria-hidden />
              )}
              <div data-next className="absolute inset-0 bg-paper">
                {image && (
                  <Image
                    key={image.src}
                    data-main-img
                    src={image.src}
                    alt={image.alt}
                    fill
                    preload
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-contain p-8 mix-blend-multiply sm:p-14"
                  />
                )}
              </div>
              <div className="absolute left-5 top-5 flex gap-2">
                {p.isNew && <span className="rounded-full bg-ink px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">New</span>}
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${inStock ? "bg-[#22c55e]/15 text-[#15803d]" : "bg-ink/5 text-mute"}`}>
                  {inStock ? "In stock" : "Out of stock"}
                </span>
              </div>
            </div>
            {p.images.length > 1 && (
              <div className="mt-4 flex gap-3 overflow-x-auto no-scrollbar">
                {colorNames.map((c, i) => {
                  const im = imageFor(i);
                  return (
                    <button
                      key={c.name}
                      data-thumb
                      onClick={(e) => pickColor(i, e)}
                      className={`relative h-20 w-20 shrink-0 rounded-2xl bg-paper transition-[opacity,box-shadow] duration-500 ${i === colorIdx ? "ring-2 ring-accent" : "opacity-70 hover:opacity-100"}`}
                      aria-label={`Show ${c.name}`}
                    >
                      {im && <Image src={im.src} alt="" fill sizes="80px" className="object-contain p-2 mix-blend-multiply" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Buy box */}
          <div>
            <h1 data-ptitle data-intro className="text-[clamp(2.5rem,5vw,4.25rem)] font-bold leading-[0.95] tracking-[-0.04em]">
              {p.title}
            </h1>
            <div data-buy>
              <p className="mt-5 max-w-lg text-lg text-mute">{p.summary}</p>

              <div className="mt-8 flex items-end gap-4">
                {price ? (
                  <p className="text-[2.6rem] font-bold leading-none tracking-tight">
                    <Odometer value={price} prefix="KSh " />
                  </p>
                ) : (
                  <p className="text-3xl font-bold tracking-tight">Price on request</p>
                )}
              </div>
              {plan && eligible && (
                <p className="mt-3 text-sm text-mute">
                  Or <span className="font-semibold text-ink">{formatKsh(plan.monthly)}/mo</span> for {plan.months} months after a{" "}
                  {formatKsh(plan.deposit)} deposit with Lipa Pole Pole.{" "}
                  <Link href={`/lipa-polepole?price=${price}`} className="font-semibold text-accent underline-offset-4 hover:underline">
                    See plan
                  </Link>
                </p>
              )}

              {conditions.length > 1 && (
                <fieldset className="mt-9">
                  <legend className="eyebrow mb-3 text-mute">Condition</legend>
                  <div className="grid grid-cols-2 gap-3">
                    {conditions.map((c) => {
                      const from = Math.min(...p.variants.filter((v) => v.condition === c).map((v) => v.price));
                      return (
                        <button
                          key={c}
                          onClick={() => setCond(c)}
                          aria-pressed={cond === c}
                          className={`rounded-2xl border p-4 text-left transition-all duration-300 ${cond === c ? "border-ink bg-ink text-white" : "border-line hover:border-ink"}`}
                        >
                          <span className="block font-semibold">{conditionLabel(c)}</span>
                          <span className={`text-sm ${cond === c ? "text-white/60" : "text-mute"}`}>From {formatKsh(from)}</span>
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              )}

              {storages.length > 0 && (
                <fieldset className="mt-8">
                  <legend className="eyebrow mb-3 text-mute">Storage</legend>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {storages.map((s) => {
                      const sp = variantFor(s, null)?.price ?? 0;
                      const diff = basePrice ? sp - basePrice : 0;
                      return (
                        <button
                          key={s}
                          onClick={() => setStorage(s)}
                          aria-pressed={activeStorage === s}
                          className={`rounded-2xl border px-3 py-3.5 text-center transition-all duration-300 ${
                            activeStorage === s ? "border-accent bg-accent/5 ring-1 ring-accent" : "border-line hover:border-ink"
                          }`}
                        >
                          <span className="block font-semibold">{storageLabel(s)}</span>
                          <span className="text-xs text-mute">{diff > 0 ? `+ ${formatKsh(diff)}` : "Base"}</span>
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              )}

              {rams.length > 1 && (
                <fieldset className="mt-8">
                  <legend className="eyebrow mb-3 text-mute">Memory</legend>
                  <div className="flex flex-wrap gap-2">
                    {rams.map((r) => (
                      <button key={r} className="chip h-11!" aria-pressed={activeRam === r} onClick={() => setRam(r)}>
                        {r}GB
                      </button>
                    ))}
                  </div>
                </fieldset>
              )}

              {colorNames.length > 1 && (
                <fieldset className="mt-8">
                  <legend className="eyebrow mb-3 text-mute">
                    Colour · <span className="normal-case tracking-normal text-ink">{colorNames[colorIdx]?.name}</span>
                  </legend>
                  <div className="flex flex-wrap gap-3">
                    {colorNames.map((c, i) => (
                      <button
                        key={c.name}
                        onClick={(e) => pickColor(i, e)}
                        aria-label={c.name}
                        aria-pressed={i === colorIdx}
                        title={c.name}
                        className={`h-10 w-10 rounded-full border border-black/10 transition-transform duration-300 hover:scale-110 ${i === colorIdx ? "ring-2 ring-accent ring-offset-[3px]" : ""}`}
                        style={{ background: c.hex }}
                      />
                    ))}
                  </div>
                </fieldset>
              )}

              <div className="mt-10 grid gap-3 sm:grid-cols-2">
                {price ? (
                  <>
                    <button onClick={add} disabled={!inStock} className={`btn ${added ? "bg-[#22c55e] text-white" : "btn-dark"} h-14!`} data-cursor="Add">
                      {added ? <Check className="h-5 w-5" /> : <ShoppingBag className="h-5 w-5" />}
                      <span>{added ? "Added to bag" : "Add to bag"}</span>
                    </button>
                    <Magnetic className="block">
                      <button onClick={buyNow} disabled={!inStock} className="btn btn-primary h-14! w-full">
                        <span>Buy now</span>
                      </button>
                    </Magnetic>
                  </>
                ) : null}
                <a
                  href={whatsappLink(`Hello Prime Tech, I'm interested in the ${p.title} (${options}). Is it available?`)}
                  target="_blank"
                  rel="noreferrer"
                  className={`btn btn-ghost h-14! ${price ? "sm:col-span-2" : "sm:col-span-2 btn-primary border-0"}`}
                >
                  <MessageCircle className="h-5 w-5" />
                  <span>{price ? "Ask about this on WhatsApp" : "Enquire on WhatsApp"}</span>
                </a>
              </div>

              <ul className="mt-10 grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2">
                {[
                  { icon: ShieldCheck, t: "Genuine & warrantied", s: "Authentic Apple with warranty support" },
                  { icon: Truck, t: "Same-day in Nairobi", s: "Insured countrywide delivery" },
                  { icon: Repeat2, t: "Trade in & save", s: <Link href="/trade-in" className="underline-offset-4 hover:underline">Value your old device</Link> },
                  { icon: Wallet, t: "Lipa Pole Pole", s: `${FINANCE.depositRate * 100}% deposit, pay monthly` },
                ].map(({ icon: Icon, t, s }) => (
                  <li key={t} className="flex gap-3 bg-white p-5">
                    <Icon className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                    <span>
                      <span className="block text-sm font-semibold">{t}</span>
                      <span className="text-sm text-mute">{s}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
