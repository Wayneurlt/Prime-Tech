import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import {
  FAMILIES,
  familyStartingPrice,
  getFamilyMeta,
  getProduct,
  getProducts,
  newestProducts,
  productHref,
  toCard,
} from "@/lib/catalog";
import { Hero } from "@/components/home/Hero";
import { CategoryScroller } from "@/components/home/CategoryScroller";
import { ProductRail } from "@/components/home/ProductRail";
import { TradeInFeature } from "@/components/home/TradeInFeature";
import { FinanceFeature } from "@/components/home/FinanceFeature";
import { TrustMarquee } from "@/components/sections/TrustMarquee";
import { Stats } from "@/components/sections/Stats";
import { Faq } from "@/components/sections/Faq";
import { ClosingCta } from "@/components/sections/ClosingCta";
import { SplitReveal } from "@/components/motion/primitives";

export default function Home() {
  const hero = getProduct("iphone", "iphone-18-pro-max")!;
  const pro = getProduct("iphone", "iphone-18-pro")!;
  const specs = hero.specs as {
    processor: { soc: string };
    display: { size_in: number; refresh_hz: number };
    battery: { typical_use_hours: number };
    connectivity: { wifi: string };
  };

  const chips = [
    { label: "Chip", value: specs.processor.soc },
    { label: "Display", value: `${specs.display.size_in}″ · ${specs.display.refresh_hz}Hz` },
    { label: "Cameras", value: "3 × 48MP Fusion" },
    { label: "Battery", value: `Up to ${specs.battery.typical_use_hours} hrs` },
    { label: "Wireless", value: specs.connectivity.wifi.split(" (")[0] },
  ];

  const panels = FAMILIES.map((f) => ({
    slug: f.slug,
    name: f.name,
    tagline: f.tagline,
    image: f.image,
    tone: f.tone,
    count: getProducts(f.slug).length,
    from: familyStartingPrice(f.slug),
  }));

  return (
    <>
      <Hero
        href={productHref(hero)}
        price={hero.priceFrom ?? Number(hero.variants[0]?.price)}
        product={{ slug: hero.slug, family: hero.family, title: hero.title }}
        chips={chips}
      />
      {/* Panel that slides up over the pinned hero (desktop: over a full screen; mobile: a soft overlap). */}
      <div className="relative z-10 -mt-7 bg-white shadow-[0_-20px_60px_-24px_rgba(0,0,0,0.35)] lg:[html[data-motion]_&]:-mt-[100svh]">
        <TrustMarquee />
      </div>
      <CategoryScroller panels={panels} />

      <section className="bg-paper pb-24 pt-8 sm:pb-32">
        <div className="container-x mb-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow text-mute">Newest essentials</p>
            <SplitReveal className="mt-5 max-w-3xl text-h2 font-bold" type="words">
              Selected by our experts for <span className="serif-accent">performance</span> and precision.
            </SplitReveal>
          </div>
          <Link href="/iphone" className="group flex items-center gap-2 font-semibold">
            <span className="link-underline">View all products</span>
            <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>
        <ProductRail products={newestProducts(10).map(toCard)} />
      </section>

      <TradeInFeature />
      <FinanceFeature featured={{ title: pro.title, price: pro.priceFrom ?? 0 }} />
      <Stats models={getProducts().length} />
      <Faq items={getFamilyMeta("iphone").faqs} />
      <ClosingCta />
    </>
  );
}
