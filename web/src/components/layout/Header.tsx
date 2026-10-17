"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Search, ShoppingBag, ArrowUpRight } from "lucide-react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { Logo } from "@/components/Logo";
import { usePathnameValue } from "@/lib/route";
import { useCart, cartTotals, openCart } from "@/lib/cart";
import { NAV_SERVICES } from "@/lib/site";
import type { FamilySlug } from "@/lib/catalog";
import { MobileMenu } from "./MobileMenu";
import { formatKsh } from "@/lib/catalog";

export type MenuData = {
  slug: FamilySlug;
  name: string;
  nav: string;
  tagline: string;
  count: number;
  from: number | null;
  items: { title: string; href: string; image: string | null; price: number | null }[];
}[];

export function openSearch() {
  window.dispatchEvent(new CustomEvent("pt:search"));
}

export function Header({ menu }: { menu: MenuData }) {
  const root = useRef<HTMLElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const pathname = usePathnameValue();
  const cart = useCart();
  const { count } = cartTotals(cart);
  const [active, setActive] = useState<FamilySlug | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const closeTimer = useRef<number>(0);

  // Close everything on route change.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setActive(null);
    setMenuOpen(false);
  }

  // Switch to the dark theme while a [data-header-dark] section sits under the bar.
  useEffect(() => {
    let raf = 0;
    const check = () => {
      raf = 0;
      const below = document
        .elementsFromPoint(window.innerWidth / 2, 84)
        .find((el) => !root.current?.contains(el));
      setDark(!!below?.closest("[data-header-dark]"));
    };
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    check();
    const t = window.setInterval(check, 500);
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);
    return () => {
      cancelAnimationFrame(raf);
      window.clearInterval(t);
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", queue);
    };
  }, [pathname]);

  // Hide on scroll down, show on scroll up; collapse the promo bar.
  useGSAP(
    () => {
      const bar = root.current!.querySelector("[data-promo]");
      const hide = gsap.to(root.current, { yPercent: -130, duration: 0.5, ease: "power3.inOut", paused: true });
      const st = ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate(self) {
          const y = self.scroll();
          gsap.to(bar, { height: y > 40 ? 0 : "auto", autoAlpha: y > 40 ? 0 : 1, duration: 0.4, overwrite: true });
          if (y < 120 || self.direction === -1) hide.reverse();
          else if (!panel.current?.matches(":hover")) hide.play();
        },
      });
      return () => st.kill();
    },
    { scope: root },
  );

  // Mega-menu open/close animation.
  useGSAP(
    () => {
      const el = panel.current!;
      if (active) {
        gsap.set(el, { display: "block" });
        gsap.fromTo(el, { clipPath: "inset(0 0 100% 0 round 24px)" }, { clipPath: "inset(0 0 0% 0 round 24px)", duration: 0.7, overwrite: true });
        gsap.fromTo(el.querySelectorAll("[data-mega-item]"), { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.05, delay: 0.08, overwrite: true });
      } else {
        gsap.to(el, {
          clipPath: "inset(0 0 100% 0 round 24px)",
          duration: 0.45,
          ease: "power3.in",
          overwrite: true,
          onComplete: () => {
            gsap.set(el, { display: "none" });
          },
        });
      }
    },
    { dependencies: [active], scope: root },
  );

  const enter = (slug: FamilySlug) => {
    window.clearTimeout(closeTimer.current);
    setActive(slug);
  };
  const leave = () => {
    closeTimer.current = window.setTimeout(() => setActive(null), 160);
  };

  const current = menu.find((m) => m.slug === active);

  return (
    <>
      <header ref={root} className="fixed inset-x-0 top-0 z-50">
        <div data-promo className="overflow-hidden bg-ink text-white">
          <p className="container-x flex h-9 items-center justify-center gap-2 text-center text-[0.78rem]">
            <span className="text-white/70">
              <span className="sm:hidden">Free Nairobi delivery over KSh 50k.</span>
              <span className="hidden sm:inline">Free delivery in Nairobi on orders above KSh 50,000.</span>
            </span>
            <Link href="/iphone" className="font-semibold underline-offset-4 hover:underline">
              Shop now
            </Link>
          </p>
        </div>

        <div className="container-x pt-3" onMouseLeave={leave}>
          <nav
            aria-label="Main"
            data-theme={dark ? "dark" : "light"}
            className={`relative flex h-15 items-center justify-between gap-4 rounded-full border pl-5 pr-2 text-fg shadow-[0_8px_40px_-12px_rgba(0,0,0,0.25)] backdrop-blur-2xl backdrop-saturate-150 transition-colors duration-500 ${
              dark ? "border-white/10 bg-ink/55" : "border-white/40 bg-white/75"
            }`}
          >
            <Link href="/" aria-label="Prime Tech Kenya home" className="shrink-0">
              <Logo />
            </Link>

            <ul className="hidden items-center gap-0.5 lg:flex">
              {menu.map((m) => {
                const on = pathname.startsWith(`/${m.slug}`);
                return (
                  <li key={m.slug} onMouseEnter={() => enter(m.slug)}>
                    <Link
                      href={`/${m.slug}`}
                      className={`relative rounded-full px-3 py-2 text-[0.88rem] font-medium transition-colors hover:bg-fg/5 ${
                        on ? "text-fg" : "text-fg/70"
                      }`}
                      aria-current={on ? "page" : undefined}
                    >
                      {m.nav}
                      {on && <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-accent" />}
                    </Link>
                  </li>
                );
              })}
              <li aria-hidden className="mx-2 hidden h-5 w-px bg-fg/10 xl:block" />
              {NAV_SERVICES.map((s) => (
                <li key={s.href} className="hidden xl:block" onMouseEnter={() => setActive(null)}>
                  <Link
                    href={s.href}
                    className={`rounded-full px-3 py-2 text-[0.88rem] font-medium transition-colors hover:bg-fg/5 ${
                      pathname === s.href ? "text-accent" : "text-fg/70"
                    }`}
                  >
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-1">
              <button
                onClick={openSearch}
                className="group flex h-11 items-center gap-2 rounded-full px-3 text-fg/70 transition-colors hover:bg-fg/5 hover:text-fg"
                aria-label="Search products"
              >
                <Search className="h-[18px] w-[18px]" />
                <kbd className="hidden rounded-md border border-fg/10 px-1.5 font-mono text-[0.65rem] text-fg/50 2xl:inline">
                  ⌘K
                </kbd>
              </button>
              <button
                onClick={() => openCart.open("click")}
                className="relative grid h-11 w-11 place-items-center rounded-full text-fg/80 transition-colors hover:bg-fg/5 hover:text-fg"
                aria-label={`Open bag, ${count} item${count === 1 ? "" : "s"}`}
              >
                <span id="cart-target" className="grid place-items-center">
                  <ShoppingBag className="h-[19px] w-[19px]" />
                </span>
                {count > 0 && (
                  <span className="absolute right-1 top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-accent px-1 text-[0.62rem] font-bold text-white">
                    {count}
                  </span>
                )}
              </button>
              <Link href="/contact" className={`btn ${dark ? "btn-light" : "btn-dark"} ml-1 hidden h-11! px-5! text-[0.85rem] md:inline-flex`}>
                <span>Contact</span>
              </Link>
              <button
                onClick={() => setMenuOpen(true)}
                className="ml-1 grid h-11 w-11 place-items-center rounded-full bg-fg text-fg-inv xl:hidden"
                aria-label="Open menu"
                aria-expanded={menuOpen}
              >
                <span className="flex w-4 flex-col gap-[5px]">
                  <span className="h-[1.5px] w-full bg-current" />
                  <span className="h-[1.5px] w-2/3 bg-current" />
                </span>
              </button>
            </div>
          </nav>

          {/* Mega menu */}
          <div
            ref={panel}
            onMouseEnter={() => window.clearTimeout(closeTimer.current)}
            className="absolute inset-x-4 top-full mt-2 sm:inset-x-8 xl:inset-x-14"
            style={{ display: "none" }}
          >
            <div className="mx-auto max-w-[1328px] rounded-3xl border border-white/40 bg-white/90 p-6 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
              {current && (
                <div className="grid grid-cols-[260px_1fr] gap-8">
                  <div data-mega-item className="flex flex-col justify-between rounded-2xl bg-ink p-6 text-white">
                    <div>
                      <p className="eyebrow text-white/50">{current.count} models</p>
                      <p className="mt-3 text-3xl font-bold tracking-tight">{current.name}</p>
                      <p className="mt-2 text-sm text-white/60">{current.tagline}</p>
                    </div>
                    <div>
                      {current.from && <p className="mb-4 text-sm text-white/60">From {formatKsh(current.from)}</p>}
                      <Link href={`/${current.slug}`} className="btn btn-light !h-11 w-full text-sm">
                        <span>Shop all {current.name}</span>
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                  <ul className="grid grid-cols-4 gap-4">
                    {current.items.map((it) => (
                      <li key={it.href} data-mega-item>
                        <Link
                          href={it.href}
                          className="group flex h-full flex-col rounded-2xl bg-paper p-4 transition-colors hover:bg-paper-2"
                          data-cursor="View"
                        >
                          <div className="relative aspect-square">
                            {it.image && (
                              <Image
                                src={it.image}
                                alt=""
                                fill
                                sizes="200px"
                                className="object-contain mix-blend-multiply transition-transform duration-700 ease-[var(--ease-expo)] group-hover:scale-105"
                              />
                            )}
                          </div>
                          <p className="mt-3 text-sm font-semibold leading-tight">{it.title}</p>
                          <p className="mt-1 text-xs text-mute">{it.price ? `From ${formatKsh(it.price)}` : "Price on request"}</p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} menu={menu} />
    </>
  );
}
