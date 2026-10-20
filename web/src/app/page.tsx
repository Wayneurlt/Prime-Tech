import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import {
  FAMILIES,
  familyStartingPrice,
  type FamilySlug,
  getFamilyMeta,
  getProduct,
  getProducts,
  newestProducts,
  productHref,
  toCard,
} from "@/lib/catalog";
import { HeroFan } from "@/components/home/HeroFan";
import { MobileHero, type HeroSlide } from "@/components/home/MobileHero";
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

  const panels = FAMILIES.map((f) => ({
    slug: f.slug,
    name: f.name,
    tagline: f.tagline,
    image: f.image,
    tone: f.tone,
    count: getProducts(f.slug).length,
    from: familyStartingPrice(f.slug),
  }));

  const heroPrice = hero.priceFrom ?? Number(hero.variants[0]?.price);
  const family = (slug: FamilySlug) => FAMILIES.find((f) => f.slug === slug)!;
  const slides: HeroSlide[] = [
    {
      key: "iphone",
      tab: "iPhone",
      eyebrow: "New arrival",
      title: "iPhone 18 Pro Max",
      tagline: "Four colours. Pick yours.",
      image: "/images/iphone-editorial.webp",
      tone: "dark",
      glow: "rgba(90,150,255,0.32)",
      zoom: 1.25,
      href: productHref(hero),
      cta: "Buy now",
      from: heroPrice,
    },
    ...(
      [
        { slug: "ipad", tab: "iPad", title: "iPad", image: "/images/ipad-editorial.webp", tone: "light", glow: "rgba(255,80,170,0.22)", zoom: 1.15, cta: "Shop iPad" },
        { slug: "mac", tab: "Mac", title: "MacBook", image: "/images/macbook-editorial.webp", tone: "dark", glow: "rgba(170,185,215,0.3)", zoom: 1.2, cta: "Shop Mac" },
        { slug: "apple-watch", tab: "Watch", title: "Apple Watch", image: "/images/watch-editorial.webp", tone: "light", glow: "rgba(255,140,60,0.22)", zoom: 1.2, cta: "Shop Watch" },
        { slug: "airpods", tab: "AirPods", title: "AirPods", image: "/images/airpods-editorial.webp", tone: "dark", glow: "rgba(120,170,255,0.28)", zoom: 0.95, cta: "Shop AirPods" },
      ] as const
    ).map(({ slug, ...s }) => ({
      ...s,
      key: slug,
      eyebrow: family(slug).nav,
      tagline: family(slug).tagline,
      href: `/${slug}`,
      from: familyStartingPrice(slug),
    })),
  ];

  return (
    <>
      <div className="max-lg:hidden">
        <HeroFan
          href={productHref(hero)}
          price={heroPrice}
          product={{ slug: hero.slug, family: hero.family, title: hero.title }}
        />
      </div>
      <div className="lg:hidden">
        <MobileHero slides={slides} />
      </div>
      {/* On mobile the panel overlaps the slider slightly; on desktop it simply follows the hero. */}
      <div className="relative z-10 -mt-7 bg-white shadow-[0_-20px_60px_-24px_rgba(0,0,0,0.35)] lg:mt-0">
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
