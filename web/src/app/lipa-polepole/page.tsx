import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Clock, IdCard, Smartphone, Phone } from "lucide-react";
import { getProducts, lowestPrice } from "@/lib/catalog";
import { FINANCE, SITE } from "@/lib/site";
import { Calculator } from "@/components/finance/Calculator";
import { Reveal, SplitReveal, Parallax, Magnetic } from "@/components/motion/primitives";
import { Faq } from "@/components/sections/Faq";
import { ClosingCta } from "@/components/sections/ClosingCta";
import { formatKsh } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Lipa Pole Pole – Pay monthly for iPhone, Mac & iPad",
  description: `Own the latest Apple device with Lipa Pole Pole at Prime Tech. Pay a ${FINANCE.depositRate * 100}% deposit, take it home the same day and clear the balance monthly via M-Pesa.`,
};

const STEPS = [
  { icon: Smartphone, title: "Select your device", copy: "Browse our collection and pick the iPhone, Mac or iPad that fits your ambition." },
  { icon: IdCard, title: "Apply & pay the deposit", copy: `Bring your ID, get approved in minutes and pay a ${FINANCE.depositRate * 100}% deposit via M-Pesa or card.` },
  { icon: BadgeCheck, title: "Pick up & pay monthly", copy: "Collect your device immediately and clear the balance in easy monthly M-Pesa payments." },
];

const FAQS = [
  { question: "Who can apply for Lipa Pole Pole?", answer: "You need a valid ID and a few basic details. Our team confirms eligibility when you apply, which usually takes under 15 minutes." },
  { question: "Which devices qualify?", answer: `Any device priced from ${formatKsh(FINANCE.minPrice)} or more, including iPhone, Mac, iPad and Apple Watch.` },
  { question: "How much is the deposit?", answer: `The deposit is ${FINANCE.depositRate * 100}% of the device price, paid at pick-up via M-Pesa or card. The balance is spread over your chosen term.` },
  { question: "Can I combine Lipa Pole Pole with a trade-in?", answer: "Ask our team when you apply. If you have a device to trade in, we'll explain how its value can work alongside your plan." },
];

export default function LipaPolePolePage() {
  const devices = getProducts()
    .filter((p) => ["iphone", "mac", "ipad"].includes(p.family) && (p.priceFrom ?? 0) >= FINANCE.minPrice)
    .slice(0, 40)
    .map((p) => ({ title: p.title, price: lowestPrice(p)! }))
    .filter((d) => d.price >= FINANCE.minPrice)
    .sort((a, b) => b.price - a.price);

  return (
    <>
      <section data-header-dark className="grain relative overflow-hidden bg-ink pb-24 pt-[calc(var(--header-h)+6rem)] text-white">
        <div className="pointer-events-none absolute -right-40 -top-20 h-[60vmax] w-[60vmax] rounded-full bg-accent/25 blur-[140px]" />
        <div className="container-x relative grid items-center gap-14 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <Reveal intro y={16}>
              <p className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-1.5 text-sm text-white/70">
                <span className="h-2 w-2 rounded-full bg-[#22c55e]" /> Lipa Pole Pole enabled
              </p>
            </Reveal>
            <SplitReveal as="h1" className="mt-6 text-[clamp(3rem,6.6vw,6.75rem)] font-bold leading-[0.95] tracking-[-0.045em]" type="chars" intro>
              Own it now.
              <br />
              <span className="serif-accent text-accent-2">Pay pole pole.</span>
            </SplitReveal>
            <Reveal intro delay={0.4} className="mt-8" y={24}>
              <p className="max-w-lg text-xl text-white/65">
                Own the latest Apple technology with manageable monthly payments. Simple, transparent, and built around you.
              </p>
              <div className="mt-10 flex flex-wrap gap-3">
                <Magnetic>
                  <a href="#calculator" className="btn btn-primary" data-cursor="Plan">
                    <span>Calculate my plan</span>
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Magnetic>
                <Link href="/iphone" className="btn btn-ghost text-white">
                  <span>View products</span>
                </Link>
              </div>
            </Reveal>
          </div>
          <Reveal intro delay={0.2} self y={60} scale={0.94}>
            <div className="relative aspect-[4/3] overflow-hidden rounded-[32px]">
              <Parallax className="absolute inset-0" speed={0.08} scale={1.15}>
                <Image src="/images/financing-iphone-18-editorial.webp" alt="iPhone lineup on stone steps" fill preload sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
              </Parallax>
              <div className="absolute bottom-5 left-5 right-5 flex items-center gap-4 rounded-2xl bg-white/90 p-4 text-ink backdrop-blur-xl">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-accent text-white">
                  <Clock className="h-5 w-5" />
                </span>
                <span>
                  <span className="block font-semibold">Approval in under 15 minutes</span>
                  <span className="text-sm text-mute">Just your ID and basic details</span>
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="calculator" className="scroll-mt-24 bg-paper py-24 sm:py-32">
        <div className="container-x">
          <Reveal self y={60}>
            <Calculator devices={devices} />
          </Reveal>
        </div>
      </section>

      <section className="bg-white py-24 sm:py-32">
        <div className="container-x">
          <p className="eyebrow text-mute">How it works</p>
          <SplitReveal className="mt-5 max-w-3xl text-h2 font-bold" type="words">
            Three steps from <span className="serif-accent">wishlist</span> to in your hand.
          </SplitReveal>
          <Reveal className="mt-16 grid gap-5 md:grid-cols-3" stagger={0.12}>
            {STEPS.map(({ icon: Icon, title, copy }, i) => (
              <div key={title} className="group relative overflow-hidden rounded-[28px] bg-paper p-8 transition-colors duration-500 hover:bg-ink hover:text-white">
                <span className="absolute -right-4 -top-8 text-[9rem] font-black leading-none text-ink/[0.04] transition-colors duration-500 group-hover:text-white/[0.06]">
                  {i + 1}
                </span>
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white text-accent shadow-sm transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-10 text-2xl font-semibold tracking-tight">{title}</h3>
                <p className="mt-3 text-mute transition-colors duration-500 group-hover:text-white/60">{copy}</p>
              </div>
            ))}
          </Reveal>
          <Reveal className="mt-10 flex flex-wrap items-center justify-between gap-6 rounded-[28px] border border-line p-8" self y={30}>
            <div>
              <p className="text-xl font-semibold tracking-tight">Ready to start? Our specialists are standing by.</p>
              <p className="mt-1 text-mute">Help choosing the right plan, in store or on WhatsApp.</p>
            </div>
            <a href={SITE.phoneHref} className="btn btn-dark">
              <Phone className="h-4 w-4" />
              <span>Talk to an advisor</span>
            </a>
          </Reveal>
        </div>
      </section>

      <Faq items={FAQS} title="Lipa Pole Pole, explained." />
      <ClosingCta />
    </>
  );
}
