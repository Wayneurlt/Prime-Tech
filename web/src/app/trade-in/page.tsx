import type { Metadata } from "next";
import { getProducts, lowestPrice } from "@/lib/catalog";
import { TradeInWizard } from "@/components/tradein/TradeInWizard";
import { Reveal, SplitReveal } from "@/components/motion/primitives";
import { TrustMarquee } from "@/components/sections/TrustMarquee";
import { ClosingCta } from "@/components/sections/ClosingCta";

export const metadata: Metadata = {
  title: "Trade in your iPhone or Samsung",
  description:
    "Trade in your old iPhone or Samsung at Prime Tech Kenya and put the credit towards a new iPhone, Mac or iPad. Get a quote on WhatsApp in minutes.",
};

export default function TradeInPage() {
  const iphones = getProducts("iphone").map((p) => p.title);
  const upgrades = [...getProducts("iphone").slice(0, 7), ...getProducts("mac").slice(0, 3), ...getProducts("ipad").slice(0, 2)].map((p) => ({
    title: p.title,
    image: p.images[0]?.src ?? null,
    price: lowestPrice(p),
  }));

  return (
    <>
      <section className="bg-paper pb-24 pt-[calc(var(--header-h)+5rem)]">
        <div className="container-x">
          <div className="mb-14 grid items-end gap-8 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <p className="eyebrow text-accent">Trade in</p>
              <SplitReveal as="h1" className="mt-5 text-display font-bold" type="chars" intro>
                Old phone. <span className="serif-accent">New credit.</span>
              </SplitReveal>
            </div>
            <Reveal intro delay={0.3} y={20}>
              <p className="text-lg text-mute">
                Upgrade to the latest iPhone or Mac seamlessly. Tell us what you have in four quick steps and we&apos;ll come back with your offer on
                WhatsApp. Up to <span className="font-semibold text-ink">KSh 85,000</span> for an iPhone 14 Pro Max in good condition.
              </p>
            </Reveal>
          </div>
          <Reveal intro delay={0.4} self y={50}>
            <TradeInWizard iphones={iphones} upgrades={upgrades} />
          </Reveal>
        </div>
      </section>
      <TrustMarquee />
      <ClosingCta />
    </>
  );
}
