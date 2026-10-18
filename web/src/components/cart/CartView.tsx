"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { Minus, Plus, Trash2, MessageCircle, ShoppingBag, ArrowRight, Wallet } from "lucide-react";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";
import { useCart, cartTotals, setQty, removeFromCart, clearCart, checkoutLink, itemOptions } from "@/lib/cart";
import { formatKsh } from "@/lib/catalog";
import { FINANCE, SITE, financePlan } from "@/lib/site";
import { SplitReveal } from "@/components/motion/primitives";

export function CartView() {
  const root = useRef<HTMLElement>(null);
  const cart = useCart();
  const { subtotal, count, freeDelivery } = cartTotals(cart);
  const plan = financePlan(subtotal);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.from("[data-row]", { y: 40, autoAlpha: 0, duration: 1, stagger: 0.07, delay: 0.2 });
        gsap.from("[data-summary]", { y: 40, autoAlpha: 0, duration: 1.1, delay: 0.3 });
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [cart.length > 0] },
  );

  const remove = (id: string, el: HTMLElement | null) => {
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return removeFromCart(id);
    gsap.to(el, { x: 80, autoAlpha: 0, height: 0, paddingTop: 0, paddingBottom: 0, duration: 0.6, ease: "power3.in", onComplete: () => removeFromCart(id) });
  };

  return (
    <section ref={root} className="min-h-[80vh] bg-paper pb-28 pt-[calc(var(--header-h)+5rem)]">
      <div className="container-x">
        <SplitReveal as="h1" className="text-h1 font-bold" type="chars" intro>
          Your bag.
        </SplitReveal>
        <p className="mt-3 text-mute">
          {count} item{count === 1 ? "" : "s"}
        </p>

        {cart.length === 0 ? (
          <div className="mt-14 flex flex-col items-center rounded-[32px] bg-white px-6 py-24 text-center">
            <span className="grid h-20 w-20 place-items-center rounded-full bg-paper">
              <ShoppingBag className="h-8 w-8 text-mute" />
            </span>
            <p className="mt-6 text-2xl font-semibold tracking-tight">Your bag is empty.</p>
            <p className="mt-2 text-mute">Free delivery in Nairobi on orders above {formatKsh(SITE.freeDeliveryThreshold)}.</p>
            <Link href="/iphone" className="btn btn-dark mt-8">
              <span>Start shopping</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_400px]">
            <ul className="rounded-[32px] bg-white px-6 sm:px-8">
              {cart.map((i) => (
                <li key={i.id} data-row className="flex gap-5 overflow-hidden border-b border-line py-7 last:border-b-0">
                  <Link href={`/${i.family}/${i.slug}`} className="relative h-28 w-28 shrink-0 rounded-2xl bg-paper sm:h-32 sm:w-32">
                    {i.image && <Image src={i.image} alt="" fill sizes="128px" className="object-contain p-3 mix-blend-multiply" />}
                  </Link>
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between gap-4">
                      <div>
                        <Link href={`/${i.family}/${i.slug}`} className="text-lg font-semibold tracking-tight hover:text-accent">
                          {i.title}
                        </Link>
                        <p className="mt-1 text-sm text-mute">{itemOptions(i)}</p>
                      </div>
                      <p className="text-lg font-semibold tabular-nums">{formatKsh(i.price * i.qty)}</p>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-4">
                      <div className="flex items-center rounded-full border border-line">
                        <button className="grid h-10 w-10 place-items-center" onClick={() => setQty(i.id, i.qty - 1)} aria-label="Decrease quantity">
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center tabular-nums">{i.qty}</span>
                        <button className="grid h-10 w-10 place-items-center" onClick={() => setQty(i.id, i.qty + 1)} aria-label="Increase quantity">
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <button
                        onClick={(e) => remove(i.id, (e.currentTarget as HTMLElement).closest("li"))}
                        className="flex items-center gap-2 text-sm text-mute hover:text-ink"
                      >
                        <Trash2 className="h-4 w-4" /> Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <aside data-summary className="lg:sticky lg:top-28 lg:self-start">
              <div className="rounded-[32px] bg-white p-8">
                <p className="text-xl font-semibold">Order summary</p>
                <dl className="mt-6 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-mute">Subtotal</dt>
                    <dd className="tabular-nums">{formatKsh(subtotal)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-mute">Nairobi delivery</dt>
                    <dd>{freeDelivery ? <span className="font-semibold text-[#15803d]">Free</span> : "Confirmed on WhatsApp"}</dd>
                  </div>
                </dl>
                <div className="mt-6 flex items-baseline justify-between border-t border-line pt-6">
                  <span className="font-semibold">Total</span>
                  <span className="text-3xl font-bold tracking-tight tabular-nums">{formatKsh(subtotal)}</span>
                </div>
                {subtotal >= FINANCE.minPrice && (
                  <p className="mt-4 flex gap-2 rounded-2xl bg-paper p-4 text-sm text-mute">
                    <Wallet className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    <span>
                      Or pay {formatKsh(plan.deposit)} today and about <span className="font-semibold text-ink">{formatKsh(plan.monthly)}/mo</span> with{" "}
                      <Link href={`/lipa-polepole?price=${subtotal}`} className="font-semibold text-accent">
                        Lipa Pole Pole
                      </Link>
                      .
                    </span>
                  </p>
                )}
                <a href={checkoutLink(cart)} target="_blank" rel="noreferrer" className="btn btn-primary mt-6 w-full">
                  <MessageCircle className="h-4 w-4" />
                  <span>Checkout on WhatsApp</span>
                </a>
                <p className="mt-3 text-center text-xs text-mute">Pay with M-Pesa, card or bank transfer once we confirm availability.</p>
                <button onClick={clearCart} className="mt-6 w-full text-center text-sm text-mute hover:text-ink">
                  Clear bag
                </button>
              </div>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}
