"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { X, Minus, Plus, Trash2, MessageCircle, Check, ShoppingBag } from "lucide-react";
import { gsap } from "@/lib/gsap";
import { lockScroll, usePathnameValue } from "@/lib/route";
import { useCart, cartTotals, openCart, setQty, removeFromCart, checkoutLink, itemOptions } from "@/lib/cart";
import { formatKsh } from "@/lib/catalog";
import { SITE } from "@/lib/site";

export function CartDrawer() {
  const root = useRef<HTMLDivElement>(null);
  const toast = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const cart = useCart();
  const { subtotal, count, freeDelivery } = cartTotals(cart);
  const pathname = usePathnameValue();

  useEffect(() => {
    const fn = (reason: "click" | "added") => {
      if (reason === "click") return setOpen(true);
      const el = toast.current!;
      gsap.killTweensOf(el);
      gsap
        .timeline()
        .fromTo(el, { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.6, delay: 0.7 })
        .to(el, { y: 20, autoAlpha: 0, duration: 0.4, ease: "power2.in" }, "+=2.6");
    };
    openCart.listeners.add(fn);
    return () => {
      openCart.listeners.delete(fn);
    };
  }, []);

  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    const el = root.current!;
    const panel = el.querySelector("[data-panel]");
    if (open) {
      lockScroll(true);
      gsap.set(el, { visibility: "visible" });
      gsap.to(el.querySelector("[data-scrim]"), { autoAlpha: 1, duration: 0.4 });
      gsap.fromTo(panel, { x: 0, xPercent: 100 }, { x: 0, xPercent: 0, duration: 0.8 });
      gsap.fromTo(el.querySelectorAll("[data-line]"), { x: 40, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.7, stagger: 0.06, delay: 0.2 });
    } else if (el.style.visibility === "visible") {
      lockScroll(false);
      gsap.to(el.querySelector("[data-scrim]"), { autoAlpha: 0, duration: 0.4 });
      gsap.to(panel, { xPercent: 100, duration: 0.55, ease: "inOut", onComplete: () => void gsap.set(el, { visibility: "hidden" }) });
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const remaining = SITE.freeDeliveryThreshold - subtotal;

  return (
    <>
      <div
        ref={toast}
        className="invisible fixed bottom-6 left-1/2 z-[70] flex -translate-x-1/2 items-center gap-3 rounded-full bg-ink py-2 pl-2 pr-5 text-sm text-white opacity-0 shadow-2xl"
        role="status"
      >
        <span className="grid h-8 w-8 place-items-center rounded-full bg-accent">
          <Check className="h-4 w-4" />
        </span>
        Added to your bag
        <button onClick={() => setOpen(true)} className="font-semibold text-accent-2 underline-offset-4 hover:underline">
          View bag
        </button>
      </div>

      <div ref={root} className="invisible fixed inset-0 z-[75]" role="dialog" aria-modal="true" aria-label="Shopping bag" data-lenis-prevent>
        <div data-scrim className="invisible absolute inset-0 bg-ink/50 opacity-0 backdrop-blur-sm" onClick={() => setOpen(false)} />
        <aside data-panel className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-line px-6 py-5">
            <p className="text-lg font-semibold">
              Your bag <span className="text-mute">({count})</span>
            </p>
            <button onClick={() => setOpen(false)} className="grid h-10 w-10 place-items-center rounded-full hover:bg-paper" aria-label="Close bag">
              <X className="h-5 w-5" />
            </button>
          </div>

          {cart.length > 0 && (
            <div className="border-b border-line px-6 py-4 text-sm">
              <p className="text-mute">
                {freeDelivery ? (
                  <span className="font-medium text-ink">You&apos;ve unlocked free delivery in Nairobi.</span>
                ) : (
                  <>
                    Add <span className="font-semibold text-ink">{formatKsh(remaining)}</span> more for free Nairobi delivery.
                  </>
                )}
              </p>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-paper">
                <div
                  className="h-full rounded-full bg-accent transition-[width] duration-700 ease-[var(--ease-expo)]"
                  style={{ width: `${Math.min(100, (subtotal / SITE.freeDeliveryThreshold) * 100)}%` }}
                />
              </div>
            </div>
          )}

          <ul className="flex-1 overflow-y-auto px-6">
            {cart.length === 0 && (
              <li className="flex h-full flex-col items-center justify-center gap-4 py-20 text-center" data-line>
                <span className="grid h-16 w-16 place-items-center rounded-full bg-paper">
                  <ShoppingBag className="h-6 w-6 text-mute" />
                </span>
                <p className="font-semibold">Your bag is empty</p>
                <Link href="/iphone" className="btn btn-dark !h-11 text-sm" onClick={() => setOpen(false)}>
                  <span>Start shopping</span>
                </Link>
              </li>
            )}
            {cart.map((i) => (
              <li key={i.id} data-line className="flex gap-4 border-b border-line py-5">
                <Link href={`/${i.family}/${i.slug}`} className="relative h-24 w-24 shrink-0 rounded-2xl bg-paper">
                  {i.image && <Image src={i.image} alt="" fill sizes="96px" className="object-contain p-2 mix-blend-multiply" />}
                </Link>
                <div className="flex flex-1 flex-col">
                  <p className="font-semibold leading-tight">{i.title}</p>
                  <p className="mt-1 text-xs text-mute">{itemOptions(i)}</p>
                  <div className="mt-auto flex items-center justify-between pt-3">
                    <div className="flex items-center rounded-full border border-line">
                      <button className="grid h-8 w-8 place-items-center" onClick={() => setQty(i.id, i.qty - 1)} aria-label="Decrease quantity">
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-6 text-center text-sm tabular-nums">{i.qty}</span>
                      <button className="grid h-8 w-8 place-items-center" onClick={() => setQty(i.id, i.qty + 1)} aria-label="Increase quantity">
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="font-semibold tabular-nums">{formatKsh(i.price * i.qty)}</p>
                  </div>
                </div>
                <button onClick={() => removeFromCart(i.id)} className="self-start text-mute hover:text-ink" aria-label={`Remove ${i.title}`}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>

          {cart.length > 0 && (
            <div className="border-t border-line p-6">
              <div className="flex items-baseline justify-between">
                <span className="text-mute">Subtotal</span>
                <span className="text-2xl font-bold tracking-tight tabular-nums">{formatKsh(subtotal)}</span>
              </div>
              <p className="mt-1 text-xs text-mute">Pay with M-Pesa, card or bank transfer. Lipa Pole Pole available.</p>
              <a href={checkoutLink(cart)} target="_blank" rel="noreferrer" className="btn btn-primary mt-5 w-full">
                <MessageCircle className="h-4 w-4" />
                <span>Checkout on WhatsApp</span>
              </a>
              <Link href="/cart" className="btn btn-ghost mt-2 w-full text-ink">
                <span>View full bag</span>
              </Link>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
