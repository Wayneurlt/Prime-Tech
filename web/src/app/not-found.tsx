import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FAMILIES } from "@/lib/catalog";
import { SplitReveal, Reveal } from "@/components/motion/primitives";

export default function NotFound() {
  return (
    <section data-header-dark className="grain relative flex min-h-svh items-center overflow-hidden bg-ink pt-[var(--header-h)] text-white">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[70vmax] w-[70vmax] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(30,144,255,0.22),transparent)]" />
      <div className="container-x relative py-24 text-center">
        <SplitReveal as="p" className="text-[clamp(7rem,28vw,22rem)] font-black leading-[0.8] tracking-[-0.07em]" type="chars" intro>
          404
        </SplitReveal>
        <Reveal intro delay={0.3} y={20}>
          <h1 className="mt-8 text-3xl font-bold tracking-tight sm:text-4xl">
            This page took a <span className="serif-accent text-accent-2">different route.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-md text-white/60">The page you&apos;re looking for doesn&apos;t exist or has moved. Try one of these instead.</p>
          <div className="mt-10 flex flex-wrap justify-center gap-2">
            {FAMILIES.map((f) => (
              <Link key={f.slug} href={`/${f.slug}`} className="rounded-full border border-white/15 px-5 py-2.5 text-sm transition-colors hover:bg-white hover:text-ink">
                {f.name}
              </Link>
            ))}
          </div>
          <Link href="/" className="btn btn-primary mt-10">
            <span>Back to home</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
