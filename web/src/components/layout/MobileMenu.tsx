"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { X, ArrowUpRight, Phone, MessageCircle } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";
import { lockScroll } from "@/lib/route";
import { NAV_COMPANY, NAV_SERVICES, SITE, whatsappLink } from "@/lib/site";
import type { MenuData } from "./Header";

export function MobileMenu({ open, onClose, menu }: { open: boolean; onClose: () => void; menu: MenuData }) {
  const root = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline>(null);

  useGSAP(
    () => {
      tl.current = gsap
        .timeline({ paused: true })
        .set(root.current, { visibility: "visible" })
        .fromTo(root.current, { clipPath: "circle(0% at calc(100% - 48px) 72px)" }, { clipPath: "circle(150% at calc(100% - 48px) 72px)", duration: 1, ease: "inOut" })
        .fromTo("[data-m-link]", { yPercent: 120 }, { yPercent: 0, duration: 0.9, stagger: 0.04 }, "-=0.55")
        .fromTo("[data-m-fade]", { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.06 }, "-=0.7");
    },
    { scope: root },
  );

  useEffect(() => {
    const t = tl.current;
    if (!t) return;
    if (open) {
      lockScroll(true);
      t.timeScale(1).play();
    } else if (t.progress() > 0) {
      lockScroll(false);
      t.timeScale(1.6).reverse();
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const links = [
    ...menu.map((m) => ({ href: `/${m.slug}`, label: m.name, meta: `${m.count}` })),
    ...NAV_SERVICES.map((s) => ({ ...s, meta: "" })),
    ...NAV_COMPANY.map((s) => ({ ...s, meta: "" })),
  ];

  return (
    <div
      ref={root}
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      aria-hidden={!open}
      className="invisible fixed inset-0 z-[60] overflow-y-auto bg-ink text-white xl:hidden"
      data-lenis-prevent
    >
      <div className="container-x flex min-h-full flex-col pb-8 pt-6">
        <div className="flex items-center justify-between" data-m-fade>
          <span className="eyebrow text-white/50">Menu</span>
          <button onClick={onClose} className="grid h-12 w-12 place-items-center rounded-full bg-white text-ink" aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="mt-8 flex-1">
          <ul>
            {links.map((l, i) => (
              <li key={l.href} className="overflow-hidden border-b border-white/10">
                <Link href={l.href} onClick={onClose} className="group flex items-baseline justify-between py-3" data-m-link>
                  <span className="flex items-baseline gap-4">
                    <span className="font-mono text-xs text-white/40">{String(i + 1).padStart(2, "0")}</span>
                    <span className="text-[2.1rem] font-semibold leading-none tracking-tight transition-colors group-hover:text-accent sm:text-5xl">
                      {l.label}
                    </span>
                  </span>
                  {l.meta && <sup className="font-mono text-xs text-white/40">{l.meta}</sup>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-10 grid gap-3 sm:grid-cols-2" data-m-fade>
          <a href={whatsappLink("Hello Prime Tech, I need help choosing a device.")} target="_blank" rel="noreferrer" className="btn btn-primary">
            <MessageCircle className="h-4 w-4" />
            <span>Chat on WhatsApp</span>
          </a>
          <a href={SITE.phoneHref} className="btn btn-ghost">
            <Phone className="h-4 w-4" />
            <span>{SITE.phone}</span>
          </a>
        </div>
        <p className="mt-6 flex items-center gap-1 text-sm text-white/50" data-m-fade>
          {SITE.address.line1}, {SITE.address.city}
          <ArrowUpRight className="h-3.5 w-3.5" />
        </p>
      </div>
    </div>
  );
}
