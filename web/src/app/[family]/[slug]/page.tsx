import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  flattenSpecs,
  formatKsh,
  getFamily,
  getProduct,
  getProducts,
  lowestPrice,
  productHref,
  toCard,
} from "@/lib/catalog";
import { SITE } from "@/lib/site";
import { ProductView } from "@/components/product/ProductView";
import { ProductDetails } from "@/components/product/ProductDetails";
import { ProductRail } from "@/components/home/ProductRail";
import { TrustMarquee } from "@/components/sections/TrustMarquee";
import { SplitReveal } from "@/components/motion/primitives";

export function generateStaticParams() {
  return getProducts().map((p) => ({ family: p.family, slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[family]/[slug]">): Promise<Metadata> {
  const { family, slug } = await params;
  const p = getProduct(family, slug);
  if (!p) return {};
  const price = lowestPrice(p);
  return {
    title: `${p.title}${price ? ` – ${formatKsh(price)}` : ""}`,
    description: `${p.summary} Buy the genuine ${p.title} in Kenya at Prime Tech with warranty, same-day Nairobi delivery and Lipa Pole Pole.`,
    alternates: { canonical: productHref(p) },
    openGraph: { images: p.images[0] ? [{ url: p.images[0].src, alt: p.images[0].alt }] : [] },
  };
}

export default async function ProductPage({ params }: PageProps<"/[family]/[slug]">) {
  const { family, slug } = await params;
  const p = getProduct(family, slug);
  const f = getFamily(family);
  if (!p || !f) notFound();

  const accessories = getProducts("accessories").filter((a) => lowestPrice(a)).slice(0, 8);
  const related = getProducts(p.family)
    .filter((x) => x.slug !== p.slug && lowestPrice(x))
    .slice(0, 8);
  const price = lowestPrice(p);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.title,
    description: p.summary,
    brand: { "@type": "Brand", name: "Apple" },
    image: p.images.map((i) => `${SITE.url}${i.src}`),
    ...(price && {
      offers: {
        "@type": "AggregateOffer",
        priceCurrency: "KES",
        lowPrice: price,
        highPrice: Math.max(...p.variants.map((v) => v.price), price),
        availability: p.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        seller: { "@type": "Organization", name: SITE.name },
      },
    }),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProductView
        key={`pv-${p.slug}`}
        product={{
          slug: p.slug,
          family: p.family,
          title: p.title,
          summary: p.summary,
          isNew: p.isNew,
          inStock: p.inStock,
          images: p.images,
          colors: p.colors,
          variants: p.variants,
          priceFrom: p.priceFrom,
        }}
        familyName={f.name}
      />
      <ProductDetails
        key={`pd-${p.slug}`}
        title={p.title}
        keyFeatures={p.keyFeatures}
        specs={flattenSpecs(p.specs)}
        reviews={p.reviews}
        officialVideo={p.officialVideo}
        heroImage={p.images[1]?.src ?? p.images[0]?.src ?? null}
      />
      <TrustMarquee />
      {p.family !== "accessories" && accessories.length > 0 && (
        <section className="bg-paper py-24">
          <div className="container-x mb-10 flex items-end justify-between gap-6">
            <div>
              <p className="eyebrow text-mute">Complete your setup</p>
              <SplitReveal className="mt-4 text-h2 font-bold" type="words">
                Engineered to work <span className="serif-accent">together.</span>
              </SplitReveal>
            </div>
          </div>
          <ProductRail products={accessories.map(toCard)} />
        </section>
      )}
      {related.length > 0 && (
        <section className="bg-white py-24">
          <div className="container-x mb-10">
            <p className="eyebrow text-mute">More {f.name}</p>
            <SplitReveal className="mt-4 text-h2 font-bold" type="words">
              You might also like
            </SplitReveal>
          </div>
          <ProductRail products={related.map(toCard)} />
          <div className="container-x mt-4">
            <Link href={`/${f.slug}`} className="link-underline font-semibold">
              View all {f.name} →
            </Link>
          </div>
        </section>
      )}
    </>
  );
}
