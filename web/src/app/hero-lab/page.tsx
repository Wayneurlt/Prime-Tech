import type { Metadata } from "next";
import { FAMILIES, familyStartingPrice, getProduct, getProducts, productHref } from "@/lib/catalog";
import { HeroFan } from "@/components/home/HeroFan";
import { TrustMarquee } from "@/components/sections/TrustMarquee";
import { CategoryScroller } from "@/components/home/CategoryScroller";

export const metadata: Metadata = { title: "Hero lab", robots: { index: false } };

/** Preview of the alternative home hero, for side-by-side comparison with "/". */
export default function HeroLab() {
  const hero = getProduct("iphone", "iphone-18-pro-max")!;
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
      <HeroFan
        href={productHref(hero)}
        price={hero.priceFrom ?? Number(hero.variants[0]?.price)}
        product={{ slug: hero.slug, family: hero.family, title: hero.title }}
      />
      <TrustMarquee />
      <CategoryScroller panels={panels} />
    </>
  );
}
