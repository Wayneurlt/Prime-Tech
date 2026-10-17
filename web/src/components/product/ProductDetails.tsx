"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { Play, Truck, RotateCcw, ShieldCheck, Repeat2 } from "lucide-react";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";
import type { SpecGroup } from "@/lib/catalog";
import { SITE } from "@/lib/site";
import { Reveal, SplitReveal } from "@/components/motion/primitives";

const TABS = ["Overview", "Specifications", "Trade-in", "Delivery & returns"] as const;
type Tab = (typeof TABS)[number];

function Video({ id, title, label }: { id: string; title: string; label: string }) {
  const [play, setPlay] = useState(false);
  return (
    <figure className="group">
      <div className="relative aspect-video overflow-hidden rounded-3xl bg-ink">
        {play ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
            title={title}
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        ) : (
          <button onClick={() => setPlay(true)} className="absolute inset-0" data-cursor="Play" aria-label={`Play: ${title}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover opacity-80 transition-transform duration-[1.2s] ease-[var(--ease-expo)] group-hover:scale-105"
            />
            <span className="absolute inset-0 grid place-items-center">
              <span className="grid h-16 w-16 place-items-center rounded-full bg-white/90 text-ink backdrop-blur transition-transform duration-500 group-hover:scale-110">
                <Play className="ml-1 h-6 w-6 fill-current" />
              </span>
            </span>
          </button>
        )}
      </div>
      <figcaption className="mt-3">
        <span className="eyebrow text-accent">{label}</span>
        <p className="mt-1 font-semibold leading-snug">{title}</p>
      </figcaption>
    </figure>
  );
}

export function ProductDetails({
  title,
  keyFeatures,
  specs,
  reviews,
  officialVideo,
  heroImage,
}: {
  title: string;
  keyFeatures: string[];
  specs: SpecGroup[];
  reviews: { name: string; title: string; id: string }[];
  officialVideo: string | null;
  heroImage: string | null;
}) {
  const root = useRef<HTMLElement>(null);
  const [tab, setTab] = useState<Tab>("Overview");

  // Sliding tab indicator + panel cross-fade.
  useGSAP(
    () => {
      const btn = root.current!.querySelector<HTMLElement>(`[data-tab="${tab}"]`);
      const bar = root.current!.querySelector<HTMLElement>("[data-indicator]");
      if (btn && bar) gsap.to(bar, { x: btn.offsetLeft, width: btn.offsetWidth, duration: 0.6 });
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.fromTo("[data-panel] > *", { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.9, stagger: 0.06 });
      });
      return () => mm.revert();
    },
    { dependencies: [tab], scope: root },
  );

  const videos = [
    ...(officialVideo ? [{ id: officialVideo, title: `${title}: official film`, label: "Apple" }] : []),
    ...reviews.map((r) => ({ id: r.id, title: r.title, label: r.name })),
  ];

  return (
    <section ref={root} id="overview" className="scroll-mt-28 bg-paper py-20 sm:py-28">
      <div className="container-x">
        <div className="relative mb-14 flex gap-1 overflow-x-auto border-b border-ink/10 no-scrollbar" role="tablist">
          {TABS.map((t) => (
            <button
              key={t}
              data-tab={t}
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={`shrink-0 px-4 pb-4 pt-2 text-[0.95rem] font-semibold transition-colors ${tab === t ? "text-ink" : "text-mute hover:text-ink"}`}
            >
              {t}
            </button>
          ))}
          <span data-indicator className="absolute bottom-0 left-0 h-[2px] w-24 bg-accent" />
        </div>

        <div data-panel role="tabpanel">
          {tab === "Overview" && (
            <div className="grid gap-14 lg:grid-cols-[1fr_1fr]">
              <div>
                <p className="eyebrow text-mute">Product highlights</p>
                <SplitReveal className="mt-4 text-h2 font-bold" type="words">
                  {title}. <span className="serif-accent text-accent">Powerful by design.</span>
                </SplitReveal>
                <Reveal as="ol" className="mt-10 divide-y divide-ink/10 border-y border-ink/10" stagger={0.06} y={24}>
                  {(keyFeatures.length ? keyFeatures : ["Genuine Apple product", "Warranty support from Prime Tech", "Same-day delivery in Nairobi"]).map((f, i) => (
                    <li key={f} className="flex gap-5 py-5">
                      <span className="font-mono text-sm text-accent">{String(i + 1).padStart(2, "0")}</span>
                      <span className="text-lg leading-snug">{f}</span>
                    </li>
                  ))}
                </Reveal>
              </div>
              {heroImage && (
                <div className="relative aspect-square overflow-hidden rounded-[32px] bg-paper-2 lg:sticky lg:top-28">
                  <Image src={heroImage} alt={title} fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-contain p-10 mix-blend-multiply" />
                </div>
              )}
            </div>
          )}

          {tab === "Specifications" && (
            <div className="grid gap-x-12 gap-y-10 md:grid-cols-2">
              {specs.length === 0 && <p className="text-mute">Full specifications available on request. Ask us on WhatsApp.</p>}
              {specs.map((g) => (
                <div key={g.group} className="rounded-3xl bg-white p-6 sm:p-8">
                  <h3 className="text-lg font-semibold">{g.group}</h3>
                  <dl className="mt-4 divide-y divide-line">
                    {g.rows.map((r) => (
                      <div key={r.label} className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-4 py-3 text-sm">
                        <dt className="text-mute">{r.label}</dt>
                        <dd className="break-words">{r.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
            </div>
          )}

          {tab === "Trade-in" && (
            <div className="grid items-center gap-10 rounded-[32px] bg-ink p-8 text-white sm:p-14 lg:grid-cols-[1.4fr_1fr]">
              <div>
                <Repeat2 className="h-8 w-8 text-accent-2" />
                <h3 className="mt-6 text-h2 font-bold">Put your old device towards the {title}.</h3>
                <p className="mt-4 max-w-lg text-white/60">
                  We accept eligible iPhones and Samsung phones in excellent, good, fair or even cracked condition. Tell us what you have and we&apos;ll
                  confirm your credit on WhatsApp. Final value is confirmed after a quick inspection in store.
                </p>
              </div>
              <Link href="/trade-in" className="btn btn-light justify-self-start lg:justify-self-end">
                <span>Start a trade-in</span>
              </Link>
            </div>
          )}

          {tab === "Delivery & returns" && (
            <div className="grid gap-5 md:grid-cols-3">
              {[
                { icon: Truck, t: "Delivery", d: `Same-day delivery within the Nairobi Metropolitan area. Free on orders above KSh 50,000. We also deliver to ${SITE.deliveryAreas.replace("Nairobi Metropolitan Area, ", "")}` },
                { icon: ShieldCheck, t: "Warranty", d: "Every device is genuine and covered by official manufacturer warranty, with local service centre support." },
                { icon: RotateCcw, t: "Returns", d: "Unused, complete purchases can be returned within 7 days of delivery or in-store purchase with proof of purchase. Talk to us first so we can confirm the return route." },
              ].map(({ icon: Icon, t, d }) => (
                <div key={t} className="rounded-3xl bg-white p-8">
                  <Icon className="h-6 w-6 text-accent" />
                  <h3 className="mt-5 text-xl font-semibold">{t}</h3>
                  <p className="mt-2 text-mute">{d}</p>
                </div>
              ))}
              <Link href="/returns" className="link-underline justify-self-start text-sm font-semibold md:col-span-3">
                Read the full returns & refunds policy →
              </Link>
            </div>
          )}
        </div>

        {videos.length > 0 && (
          <div className="mt-24">
            <p className="eyebrow text-mute">Expert reviews</p>
            <SplitReveal className="mt-4 text-h2 font-bold" type="words">
              Don&apos;t just take <span className="serif-accent">our word</span> for it.
            </SplitReveal>
            <Reveal className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4" stagger={0.08}>
              {videos.map((v) => (
                <Video key={v.id} {...v} />
              ))}
            </Reveal>
          </div>
        )}
      </div>
    </section>
  );
}
