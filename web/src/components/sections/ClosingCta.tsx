import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { Magnetic, SplitReveal, Reveal } from "@/components/motion/primitives";
import { whatsappLink } from "@/lib/site";

export function ClosingCta({
  title = (
    <>
      Find the right device <span className="serif-accent text-accent">for you.</span>
    </>
  ),
  copy = "Explore our products or speak with the Prime Tech team for help choosing an option that suits your needs.",
}: {
  title?: React.ReactNode;
  copy?: string;
}) {
  return (
    <section className="relative overflow-hidden bg-paper py-28 sm:py-40">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[60vmax] w-[60vmax] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(30,144,255,0.14),transparent)]" />
      <div className="container-x relative text-center">
        <SplitReveal className="mx-auto max-w-5xl text-display font-bold" type="words" stagger={0.06}>
          {title}
        </SplitReveal>
        <Reveal className="mt-8" y={20}>
          <p className="mx-auto max-w-xl text-lg text-mute">{copy}</p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Magnetic>
              <Link href="/iphone" className="btn btn-dark">
                <span>Shop devices</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Magnetic>
            <Magnetic>
              <a href={whatsappLink("Hello Prime Tech, can you help me choose a device?")} target="_blank" rel="noreferrer" className="btn btn-ghost">
                <MessageCircle className="h-4 w-4" />
                <span>Talk to an advisor</span>
              </a>
            </Magnetic>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
