import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Cpu, Wrench, ShieldCheck, Truck, Lock, Crown, MapPin, Clock, Phone, Mail, Navigation } from "lucide-react";
import { getProduct, getProducts } from "@/lib/catalog";
import { SITE } from "@/lib/site";
import { FloatingProducts } from "@/components/about/FloatingProducts";
import { Reveal, ScrubText, SplitReveal, Magnetic } from "@/components/motion/primitives";
import { Stats } from "@/components/sections/Stats";
import { ClosingCta } from "@/components/sections/ClosingCta";
import { MapEmbed } from "@/components/sections/MapEmbed";

export const metadata: Metadata = {
  title: "About us – Independent Apple products retailer in Kenya",
  description:
    "Prime Tech Kenya is a trusted Apple-focused store on Mama Ngina Street, Nairobi. Genuine iPhone, MacBook, iPad, Apple Watch and AirPods with warranty and same-day delivery.",
};

const OFFER = [
  { icon: Cpu, title: "Elite hardware", copy: "From workstation laptops to mobile powerhouses, we supply only the gold standard in tech." },
  { icon: Wrench, title: "Technical support", copy: "Our engineers provide end-to-end setup and troubleshooting, right up to enterprise deployments." },
  { icon: ShieldCheck, title: "Genuine warranty", copy: "Peace of mind with official manufacturer warranties and local service centre support." },
];

const WHY = [
  { icon: Truck, title: "Same-day delivery", copy: "Rapid fulfilment within the Nairobi Metropolitan area for all stock items." },
  { icon: Lock, title: "Secure payments", copy: "Protected payments with M-Pesa, card and bank transfer." },
  { icon: Crown, title: "Prime membership", copy: "Exclusive discounts and early access for our community members." },
];

export default function AboutPage() {
  const picks = [
    getProduct("iphone", "iphone-18-pro-max"),
    getProduct("mac", "macbook-air-13-m4-2025"),
    getProduct("airpods", "airpods-max-usb-c"),
    getProduct("ipad", "ipad-pro-11-m5-wifi-2025"),
    getProduct("apple-watch", "apple-watch-ultra-3-49mm"),
    getProduct("iphone", "iphone-17-pro-max"),
  ]
    .filter((p) => p && p.images[0])
    .map((p) => ({ src: p!.images[0].src, alt: p!.images[0].alt }));

  return (
    <>
      <section className="overflow-hidden bg-paper pb-10 pt-[calc(var(--header-h)+5.5rem)]">
        <div className="container-x text-center">
          <Reveal intro y={14}>
            <p className="eyebrow text-accent">About Prime Tech</p>
          </Reveal>
          <SplitReveal as="h1" className="mx-auto mt-6 max-w-5xl text-display font-bold" type="chars" intro>
            Technology made <span className="serif-accent text-accent">simpler.</span>
          </SplitReveal>
          <Reveal intro delay={0.4} y={20}>
            <p className="mx-auto mt-8 max-w-xl text-xl text-mute">
              Elevating the tech ecosystem in Kenya through precision-sourced hardware and unparalleled expertise.
            </p>
            <div className="mt-10 flex justify-center gap-3">
              <Magnetic>
                <Link href="/iphone" className="btn btn-dark">
                  <span>Explore collections</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Magnetic>
              <a href="#story" className="btn btn-ghost">
                <span>Our story</span>
              </a>
            </div>
          </Reveal>
        </div>
        <div className="container-x mt-16">
          <FloatingProducts images={picks} />
        </div>
      </section>

      <section id="story" className="scroll-mt-24 bg-white py-28 sm:py-40">
        <div className="container-x grid gap-12 lg:grid-cols-[280px_1fr]">
          <div>
            <p className="eyebrow text-mute">Identity · Who we are</p>
            <p className="mt-4 font-mono text-sm text-accent">Est. {SITE.established}</p>
          </div>
          <div>
            <ScrubText className="text-[clamp(1.75rem,3.6vw,3.25rem)] font-semibold leading-[1.15] tracking-[-0.03em]">
              Prime Tech Kenya is a technology retailer offering smartphones, laptops, tablets, wearables and accessories. We aim to make choosing and
              buying the right device clear, convenient and straightforward, bridging the gap between complex specifications and real-world use.
            </ScrubText>
            <Reveal className="mt-14 grid gap-8 text-lg text-mute sm:grid-cols-2" y={30}>
              <p>
                Established in {SITE.established}, Prime Tech has grown from a specialised boutique into a leading provider of consumer and enterprise
                electronics in the region.
              </p>
              <p>We focus on authentic global brands and local warranty support, so every device you buy from us is one you can rely on.</p>
            </Reveal>
          </div>
        </div>
      </section>

      <Stats models={getProducts().length} />

      <section data-header-dark className="grain relative overflow-hidden bg-ink py-28 text-white sm:py-36">
        <div className="container-x">
          <p className="eyebrow text-white/45">What we offer</p>
          <SplitReveal className="mt-5 max-w-3xl text-h2 font-bold" type="words">
            Curated selections across the <span className="serif-accent text-accent-2">digital spectrum.</span>
          </SplitReveal>
          <Reveal className="mt-16 grid gap-px overflow-hidden rounded-[32px] bg-white/10 md:grid-cols-3" stagger={0.1}>
            {OFFER.map(({ icon: Icon, title, copy }, i) => (
              <div key={title} className="group relative bg-ink p-10 transition-colors duration-700 hover:bg-ink-3">
                <span className="font-mono text-xs text-white/35">0{i + 1}</span>
                <Icon className="mt-10 h-10 w-10 text-accent-2 transition-transform duration-700 ease-[var(--ease-expo)] group-hover:-translate-y-2 group-hover:scale-110" strokeWidth={1.4} />
                <h3 className="mt-8 text-2xl font-semibold tracking-tight">{title}</h3>
                <p className="mt-3 text-white/55">{copy}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="bg-paper py-28 sm:py-36">
        <div className="container-x grid gap-16 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <p className="eyebrow text-mute">Why shop with us</p>
            <SplitReveal className="mt-5 text-h2 font-bold" type="words">
              Service that goes <span className="serif-accent">beyond the box.</span>
            </SplitReveal>
          </div>
          <Reveal className="space-y-4" stagger={0.1}>
            {WHY.map(({ icon: Icon, title, copy }) => (
              <div key={title} className="flex gap-6 rounded-[28px] bg-white p-7 transition-transform duration-500 hover:-translate-y-1">
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-accent/10 text-accent">
                  <Icon className="h-6 w-6" />
                </span>
                <div>
                  <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
                  <p className="mt-1 text-mute">{copy}</p>
                </div>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="bg-white py-28">
        <div className="container-x">
          <p className="eyebrow text-mute">Visit the store</p>
          <SplitReveal className="mt-5 text-h2 font-bold" type="words">
            Come say hello on <span className="serif-accent">Mama Ngina Street.</span>
          </SplitReveal>
          <div className="mt-14 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
            <Reveal className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1" stagger={0.08}>
              <div className="rounded-[28px] bg-paper p-7">
                <MapPin className="h-5 w-5 text-accent" />
                <p className="mt-4 font-semibold">Store location</p>
                <p className="mt-1 text-mute">
                  {SITE.address.line1}, {SITE.address.line2}, {SITE.address.city}
                </p>
              </div>
              <div className="rounded-[28px] bg-paper p-7">
                <Clock className="h-5 w-5 text-accent" />
                <p className="mt-4 font-semibold">Opening hours</p>
                {SITE.hours.map((h) => (
                  <p key={h.days} className="mt-1 text-mute">
                    {h.days}: <span className="text-ink">{h.time}</span>
                  </p>
                ))}
              </div>
              <div className="rounded-[28px] bg-paper p-7">
                <Phone className="h-5 w-5 text-accent" />
                <p className="mt-4 font-semibold">Contact details</p>
                <a href={SITE.phoneHref} className="mt-1 block text-mute hover:text-ink">{SITE.phone}</a>
                <a href={`mailto:${SITE.email}`} className="flex items-center gap-2 text-mute hover:text-ink">
                  <Mail className="h-3.5 w-3.5" /> {SITE.email}
                </a>
              </div>
              <div className="rounded-[28px] bg-paper p-7">
                <Navigation className="h-5 w-5 text-accent" />
                <p className="mt-4 font-semibold">Delivery areas</p>
                <p className="mt-1 text-mute">{SITE.deliveryAreas}</p>
              </div>
            </Reveal>
            <MapEmbed />
          </div>
        </div>
      </section>

      <ClosingCta />
    </>
  );
}
