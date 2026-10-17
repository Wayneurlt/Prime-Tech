"use client";

import { useSyncExternalStore } from "react";
import { gsap } from "@/lib/gsap";
import { conditionLabel, formatKsh, storageLabel, type Condition } from "@/lib/catalog";
import { SITE, whatsappLink } from "@/lib/site";

export type CartItem = {
  id: string;
  slug: string;
  family: string;
  title: string;
  image: string | null;
  price: number;
  condition: Condition;
  storage: number | null;
  ram: number | null;
  color: string | null;
  qty: number;
};

const KEY = "pt-cart-v1";
const EMPTY: CartItem[] = [];
let items: CartItem[] = EMPTY;
let loaded = false;
const subs = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) items = JSON.parse(raw);
  } catch {}
}

function commit(next: CartItem[]) {
  items = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
  subs.forEach((fn) => fn());
}

export function useCart() {
  return useSyncExternalStore(
    (fn) => {
      subs.add(fn);
      return () => subs.delete(fn);
    },
    () => {
      load();
      return items;
    },
    () => EMPTY,
  );
}

export function cartId(i: Pick<CartItem, "slug" | "condition" | "storage" | "ram" | "color">) {
  return [i.slug, i.condition, i.storage ?? "-", i.ram ?? "-", i.color ?? "-"].join("|");
}

export function addToCart(item: Omit<CartItem, "id" | "qty">, qty = 1) {
  load();
  const id = cartId(item);
  const existing = items.find((i) => i.id === id);
  commit(
    existing
      ? items.map((i) => (i.id === id ? { ...i, qty: i.qty + qty } : i))
      : [...items, { ...item, id, qty }],
  );
  openCart.listeners.forEach((fn) => fn("added"));
}

export function setQty(id: string, qty: number) {
  commit(qty <= 0 ? items.filter((i) => i.id !== id) : items.map((i) => (i.id === id ? { ...i, qty } : i)));
}

export function removeFromCart(id: string) {
  commit(items.filter((i) => i.id !== id));
}

export function clearCart() {
  commit([]);
}

export function cartTotals(list: CartItem[]) {
  const subtotal = list.reduce((s, i) => s + i.price * i.qty, 0);
  const count = list.reduce((s, i) => s + i.qty, 0);
  return { subtotal, count, freeDelivery: subtotal >= SITE.freeDeliveryThreshold };
}

export function itemOptions(i: Pick<CartItem, "condition" | "storage" | "ram" | "color">) {
  return [
    conditionLabel(i.condition),
    i.storage ? storageLabel(i.storage) : null,
    i.ram ? `${i.ram}GB RAM` : null,
    i.color,
  ]
    .filter(Boolean)
    .join(" · ");
}

export function checkoutLink(list: CartItem[]) {
  const { subtotal } = cartTotals(list);
  const lines = list.map((i) => `• ${i.qty} × ${i.title} (${itemOptions(i)}) — ${formatKsh(i.price * i.qty)}`);
  return whatsappLink(
    `Hello Prime Tech, I'd like to order:\n${lines.join("\n")}\n\nTotal: ${formatKsh(subtotal)}\n\nPlease confirm availability and delivery.`,
  );
}

/* Cart drawer open signal. */
export const openCart = {
  listeners: new Set<(reason: "click" | "added") => void>(),
  open(reason: "click" | "added" = "click") {
    this.listeners.forEach((fn) => fn(reason));
  },
};

/** Flies a product image from `from` into the header cart icon. */
export function flyToCart(from: HTMLElement | null, src: string | null) {
  const target = document.getElementById("cart-target");
  if (!from || !target || !src || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const a = from.getBoundingClientRect();
  const b = target.getBoundingClientRect();
  const size = Math.min(a.width, a.height, 220);
  const img = document.createElement("img");
  img.src = src;
  img.alt = "";
  Object.assign(img.style, {
    position: "fixed",
    left: `${a.left + a.width / 2 - size / 2}px`,
    top: `${a.top + a.height / 2 - size / 2}px`,
    width: `${size}px`,
    height: `${size}px`,
    objectFit: "contain",
    zIndex: "120",
    pointerEvents: "none",
    borderRadius: "24px",
  });
  document.body.appendChild(img);
  const dx = b.left + b.width / 2 - (a.left + a.width / 2);
  const dy = b.top + b.height / 2 - (a.top + a.height / 2);
  gsap
    .timeline({ onComplete: () => img.remove() })
    .to(img, { x: dx, duration: 0.9, ease: "power2.in" }, 0)
    .to(img, { y: dy, duration: 0.9, ease: "back.in(1.6)" }, 0)
    .to(img, { scale: 0.08, rotate: 25, duration: 0.9, ease: "power3.in" }, 0)
    .to(img, { autoAlpha: 0, duration: 0.15 }, 0.8)
    .fromTo(target, { scale: 1 }, { scale: 1.35, duration: 0.18, yoyo: true, repeat: 1, ease: "power2.out" }, 0.85);
}
