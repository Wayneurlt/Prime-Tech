"use client";

import Link from "next/link";
import { useRef } from "react";
import { ArrowUp, MessageCircle, Phone, Mail, MapPin } from "lucide-react";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";
import { getLenis } from "@/lib/route";
import { FAMILIES } from "@/lib/catalog";
import { NAV_COMPANY, NAV_SERVICES, SITE, whatsappLink } from "@/lib/site";
import { LogoMark } from "@/components/Logo";
import { Magnetic } from "@/components/motion/primitives";

export function Footer() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.from("[data-word] > span", {
          yPercent: 100,
          stagger: 0.04,
          ease: "expo",
          duration: 1.4,
          scrollTrigger: { trigger: "[data-word]", start: "top 98%", once: true },
        });
        gsap.from("[data-col]", {
          y: 40,
          autoAlpha: 0,
          stagger: 0.08,
          duration: 1.1,
          scrollTrigger: { trigger: root.current, start: "top 80%", once: true },
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  const toTop = () => {
    const l = getLenis();
    if (l) l.scrollTo(0, { duration: 1.8 });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer ref={root} data-header-dark className="relative overflow-hidden bg-ink pt-24 text-white">
      <div className="container-x">
        <div className="grid gap-12 border-b border-line-dark pb-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1.3fr]">
          <div data-col className="max-w-sm">
            <LogoMark className="h-10 w-auto" />
            <p className="mt-6 text-lg leading-snug text-white/70">
              Genuine Apple devices, honest advice and flexible payment, from our store on Mama Ngina Street to your door anywhere in Kenya.
            </p>
            <Magnetic className="mt-8 inline-block">
              <a href={whatsappLink("Hello Prime Tech!")} target="_blank" rel="noreferrer" className="btn btn-primary" data-cursor="Chat">
                <MessageCircle className="h-4 w-4" />
                <span>WhatsApp us</span>
              </a>
            </Magnetic>
          </div>

          <div data-col>
            <p className="eyebrow text-white/40">Shop</p>
            <ul className="mt-5 space-y-2.5">
              {FAMILIES.map((f) => (
                <li key={f.slug}>
                  <Link href={`/${f.slug}`} className="link-underline text-white/80 hover:text-white">
                    {f.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div data-col>
            <p className="eyebrow text-white/40">Services</p>
            <ul className="mt-5 space-y-2.5">
              {[...NAV_SERVICES, { href: "/cart", label: "Your bag" }].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="link-underline text-white/80 hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="eyebrow mt-10 text-white/40">Company</p>
            <ul className="mt-5 space-y-2.5">
              {NAV_COMPANY.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="link-underline text-white/80 hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div data-col>
            <p className="eyebrow text-white/40">Hours</p>
            <ul className="mt-5 space-y-3 text-white/80">
              {SITE.hours.map((h) => (
                <li key={h.days}>
                  <span className="block text-sm text-white/50">{h.days}</span>
                  {h.time}
                </li>
              ))}
            </ul>
          </div>

          <div data-col>
            <p className="eyebrow text-white/40">Visit & contact</p>
            <ul className="mt-5 space-y-4 text-white/80">
              <li className="flex gap-3">
                <MapPin className="mt-1 h-4 w-4 shrink-0 text-accent" />
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SITE.mapQuery)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white"
                >
                  {SITE.address.line1}, {SITE.address.line2}, {SITE.address.city}
                </a>
              </li>
              <li className="flex gap-3">
                <Phone className="mt-1 h-4 w-4 shrink-0 text-accent" />
                <a href={SITE.phoneHref} className="hover:text-white">
                  {SITE.phone}
                </a>
              </li>
              <li className="flex gap-3">
                <Mail className="mt-1 h-4 w-4 shrink-0 text-accent" />
                <a href={`mailto:${SITE.email}`} className="break-all hover:text-white">
                  {SITE.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-start justify-between gap-6 py-8 text-sm text-white/40 sm:flex-row sm:items-center">
          <p>© {SITE.name} · Est. {SITE.established}. Independent Apple products retailer.</p>
          <nav className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Policies">
            {[
              { href: "/terms", label: "Terms" },
              { href: "/privacy", label: "Privacy" },
              { href: "/returns", label: "Returns & refunds" },
            ].map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-white">
                {l.label}
              </Link>
            ))}
          </nav>
          <p className="max-w-md text-xs">
            Apple, iPhone, Mac, iPad, Apple Watch and AirPods are trademarks of Apple Inc. Prime Tech is an independent retailer.
          </p>
          <button onClick={toTop} className="group flex items-center gap-2 text-white/70 hover:text-white" data-cursor="Top">
            Back to top
            <span className="grid h-9 w-9 place-items-center rounded-full border border-white/20 transition-transform duration-500 group-hover:-translate-y-1">
              <ArrowUp className="h-4 w-4" />
            </span>
          </button>
        </div>
      </div>

      <div className="relative select-none" aria-hidden>
        <div className="flex items-end justify-center gap-[2vw] px-4">
          <div data-word className="flex overflow-hidden text-[19vw] font-black leading-[0.78] tracking-[-0.06em] text-white">
            {"PRIMETECH".split("").map((c, i) => (
              <span key={i} className={`inline-block ${i === 5 ? "ml-[3vw]" : ""}`}>
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
