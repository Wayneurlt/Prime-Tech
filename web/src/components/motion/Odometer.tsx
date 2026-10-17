"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/**
 * Rolling-digit number. Each digit is a vertical strip of 0–9 that slides
 * to the new value, so price changes read like a mechanical counter.
 */
export function Odometer({ value, prefix = "", className = "" }: { value: number; prefix?: string; className?: string }) {
  const root = useRef<HTMLSpanElement>(null);
  const prev = useRef(new Map<string, number>());
  const text = Math.round(value).toLocaleString("en-KE");

  useGSAP(
    () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      // React has already rendered the new digit; roll from the previous one.
      root.current!.querySelectorAll<HTMLElement>("[data-strip]").forEach((strip, i) => {
        const key = strip.dataset.key!;
        const digit = Number(strip.dataset.digit);
        const from = prev.current.get(key);
        prev.current.set(key, digit);
        if (from === undefined || from === digit || reduce) return;
        gsap.fromTo(strip, { y: 0, yPercent: -from * 10 }, { y: 0, yPercent: -digit * 10, duration: 1.1, ease: "expo", delay: i * 0.03 });
      });
    },
    { dependencies: [text], scope: root },
  );

  // Key digits from the right so unchanged positions keep their strips.
  const chars = text.split("");
  const cell = "inline-block h-[1.1em] overflow-hidden align-top leading-[1.1em]";
  return (
    <span ref={root} className={`inline-flex whitespace-pre tabular-nums ${className}`} aria-label={`${prefix}${text}`} role="text">
      {prefix && (
        <span aria-hidden className={cell}>
          {prefix}
        </span>
      )}
      {chars.map((c, i) => {
        const key = String(chars.length - i);
        if (!/\d/.test(c)) {
          return (
            <span key={`s${key}`} aria-hidden className={cell}>
              {c}
            </span>
          );
        }
        return (
          <span key={`d${key}`} aria-hidden className={cell}>
            <span data-strip data-key={key} data-digit={c} className="block" style={{ transform: `translateY(${-Number(c) * 10}%)` }}>
              {Array.from({ length: 10 }, (_, n) => (
                <span key={n} className="block h-[1.1em]">
                  {n}
                </span>
              ))}
            </span>
          </span>
        );
      })}
    </span>
  );
}
