import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  FAMILIES,
  compareRows,
  familyStartingPrice,
  formatKsh,
  getFamily,
  getFamilyMeta,
  getProducts,
  toCard,
} from "@/lib/catalog";
import { CategoryHero } from "@/components/shop/CategoryHero";
import { CategoryView } from "@/components/shop/CategoryView";
import { Faq } from "@/components/sections/Faq";
import { TrustMarquee } from "@/components/sections/TrustMarquee";
import { ClosingCta } from "@/components/sections/ClosingCta";

export function generateStaticParams() {
  return FAMILIES.map((f) => ({ family: f.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[family]">): Promise<Metadata> {
  const { family } = await params;
  const f = getFamily(family);
  if (!f) return {};
  const from = familyStartingPrice(f.slug);
  return {
    title: `${f.name} prices in Kenya`,
    description: `Shop genuine Apple ${f.name} in Kenya${from ? ` from ${formatKsh(from)}` : ""}. ${f.intro} Warranty, same-day Nairobi delivery, Lipa Pole Pole and trade-in.`,
  };
}

export default async function FamilyPage({ params }: PageProps<"/[family]">) {
  const { family } = await params;
  const f = getFamily(family);
  if (!f) notFound();

  const products = getProducts(f.slug);
  const from = familyStartingPrice(f.slug);
  const meta = getFamilyMeta(f.slug);
  const compare = Object.fromEntries(products.map((p) => [p.slug, compareRows(p)]));

  return (
    <>
      <CategoryHero key={`hero-${f.slug}`} family={f} count={products.length} from={from} />
      <CategoryView key={`view-${f.slug}`} family={f.slug} familyName={f.name} products={products.map(toCard)} compare={compare} />
      <TrustMarquee />
      <section className="bg-paper py-20">
        <div className="container-x max-w-4xl text-center">
          <p className="eyebrow text-mute">{f.name} prices in Kenya</p>
          <p className="mt-5 text-2xl leading-snug tracking-tight sm:text-3xl">
            {f.name} at Prime Tech starts from <span className="font-semibold">{from ? formatKsh(from) : "—"}</span>. Compare genuine
            Apple {f.name} models, storage options and stock, then pay your way with M-Pesa, card, trade-in or Lipa Pole Pole.
          </p>
        </div>
      </section>
      <Faq items={meta?.faqs ?? []} />
      <ClosingCta />
    </>
  );
}
