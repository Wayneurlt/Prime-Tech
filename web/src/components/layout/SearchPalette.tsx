"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Search, CornerDownLeft } from "lucide-react";
import { gsap } from "@/lib/gsap";
import { formatKsh } from "@/lib/catalog";
import { lockScroll } from "@/lib/route";

export type SearchItem = {
  title: string;
  href: string;
  family: string;
  image: string | null;
  price: number | null;
};

const SUGGESTED = [
  "iPhone 18 Pro Max",
  "MacBook Air",
  "AirPods Pro",
  "Apple Watch Ultra",
  "iPad Pro",
];

function score(item: SearchItem, q: string) {
  const t = item.title.toLowerCase();
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.every((w) => t.includes(w) || item.family.includes(w))) return -1;
  return (t.startsWith(terms[0]) ? 10 : 0) - t.length / 100;
}

export function SearchPalette({ items }: { items: SearchItem[] }) {
  const router = useRouter();
  const root = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);

  const results = useMemo(() => {
    if (!q.trim()) return items.slice(0, 6);
    return items
      .map((i) => ({ i, s: score(i, q) }))
      .filter((x) => x.s >= 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 8)
      .map((x) => x.i);
  }, [items, q]);

  useEffect(() => {
    const show = () => setOpen(true);
    const key = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("pt:search", show);
    window.addEventListener("keydown", key);
    return () => {
      window.removeEventListener("pt:search", show);
      window.removeEventListener("keydown", key);
    };
  }, []);

  useEffect(() => {
    const el = root.current!;
    if (open) {
      lockScroll(true);
      gsap.set(el, { display: "flex" });
      gsap.fromTo(
        el,
        { backgroundColor: "rgba(8,9,11,0)" },
        { backgroundColor: "rgba(8,9,11,0.55)", duration: 0.4 },
      );
      gsap.fromTo(
        el.querySelector("[data-box]"),
        { y: -30, scale: 0.96, autoAlpha: 0 },
        { y: 0, scale: 1, autoAlpha: 1, duration: 0.6 },
      );
      requestAnimationFrame(() => input.current?.focus());
    } else if (el.style.display === "flex") {
      lockScroll(false);
      gsap.to(el.querySelector("[data-box]"), {
        y: -20,
        autoAlpha: 0,
        duration: 0.25,
        ease: "power2.in",
      });
      gsap.to(el, {
        backgroundColor: "rgba(8,9,11,0)",
        duration: 0.3,
        onComplete: () => {
          gsap.set(el, { display: "none" });
          setQ("");
        },
      });
    }
  }, [open]);

  useEffect(() => {
    if (!root.current) return;
    gsap.fromTo(
      root.current.querySelectorAll("[data-result]"),
      { x: -10, autoAlpha: 0 },
      { x: 0, autoAlpha: 1, duration: 0.4, stagger: 0.025 },
    );
  }, [results]);

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <div
      ref={root}
      className="fixed inset-0 z-[80] hidden items-start justify-center px-4 pt-[12vh] backdrop-blur-sm"
      style={{ display: "none" }}
      onClick={(e) => e.target === e.currentTarget && setOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Search products"
      data-lenis-prevent
    >
      <div
        data-box
        className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl"
      >
        <div className="flex items-center gap-3 border-b border-line px-5">
          <Search className="h-5 w-5 text-mute" />
          <input
            ref={input}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setSel(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setSel((s) => Math.min(s + 1, results.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSel((s) => Math.max(s - 1, 0));
              } else if (e.key === "Enter" && results[sel]) {
                go(results[sel].href);
              }
            }}
            placeholder="Search iPhone, MacBook, AirPods…"
            className="h-16 flex-1 bg-transparent text-lg outline-none placeholder:text-mute-2"
            aria-label="Search"
          />
          <kbd className="rounded-md border border-line px-2 py-0.5 font-mono text-[0.65rem] text-mute">
            ESC
          </kbd>
        </div>

        {!q && (
          <div className="flex flex-wrap gap-2 px-5 pt-4">
            {SUGGESTED.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setQ(s);
                  setSel(0);
                }}
                className="chip text-xs"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <ul className="max-h-[50vh] overflow-y-auto p-3">
          <li className="eyebrow px-3 pb-2 pt-2 text-mute">
            {q ? `${results.length} results` : "Popular right now"}
          </li>
          {results.map((r, i) => (
            <li key={r.href} data-result>
              <button
                onMouseEnter={() => setSel(i)}
                onClick={() => go(r.href)}
                className={`flex w-full items-center gap-4 rounded-2xl p-2.5 text-left transition-colors ${
                  i === sel ? "bg-paper" : ""
                }`}
              >
                <span className="relative h-14 w-14 shrink-0 rounded-xl bg-paper">
                  {r.image && (
                    <Image
                      src={r.image}
                      alt=""
                      fill
                      sizes="56px"
                      className="object-contain p-1 mix-blend-multiply"
                    />
                  )}
                </span>
                <span className="flex-1">
                  <span className="block font-semibold leading-tight">
                    {r.title}
                  </span>
                  <span className="text-sm text-mute">
                    {r.price
                      ? `From ${formatKsh(r.price)}`
                      : "Price on request"}
                  </span>
                </span>
                {i === sel && (
                  <CornerDownLeft className="mr-2 h-4 w-4 text-mute" />
                )}
              </button>
            </li>
          ))}
          {q && results.length === 0 && (
            <li className="px-3 py-10 text-center text-mute">
              No products match “{q}”. Try a model name like “iPhone 16”.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
