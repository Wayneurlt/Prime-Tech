"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { MessageCircle } from "lucide-react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { getLenis } from "@/lib/route";
import { whatsappLink } from "@/lib/site";
import { SplitReveal, Reveal } from "@/components/motion/primitives";

export type Policy = {
  title: string;
  intro: string;
  version: string | null;
  sections: { id: string; title: string; html: string }[];
};

const LINKS = [
  { href: "/terms", label: "Terms & Conditions" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/returns", label: "Returns & Refunds" },
];

export function PolicyPage({ policy, path }: { policy: Policy; path: string }) {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(policy.sections[0]?.id);

  useGSAP(
    () => {
      const triggers = policy.sections.map((s) =>
        ScrollTrigger.create({
          trigger: `#${s.id}`,
          start: "top 45%",
          end: "bottom 45%",
          onToggle: (self) => self.isActive && setActive(s.id),
        }),
      );
      gsap.to("[data-progress]", {
        scaleY: 1,
        ease: "none",
        scrollTrigger: { trigger: "[data-article]", start: "top 40%", end: "bottom 60%", scrub: true },
      });
      return () => triggers.forEach((t) => t.kill());
    },
    { scope: root },
  );

  const jump = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const l = getLenis();
    if (l) l.scrollTo(el, { offset: -120, duration: 1.4 });
    else el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section ref={root} className="bg-white pb-28 pt-[calc(var(--header-h)+5rem)]">
      <div className="container-x">
        <p className="eyebrow text-accent">Prime Tech policy centre</p>
        <SplitReveal as="h1" className="mt-5 max-w-4xl text-h1 font-bold" type="chars" intro>
          {policy.title}
        </SplitReveal>
        <Reveal intro className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-4" y={20}>
          <p className="max-w-xl text-lg text-mute">{policy.intro}</p>
          {policy.version && (
            <p className="rounded-full bg-paper px-4 py-2 text-sm">
              Current version · <span className="font-semibold">{policy.version}</span>
            </p>
          )}
        </Reveal>
        <nav className="mt-10 flex flex-wrap gap-2" aria-label="Policies">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="chip" aria-pressed={l.href === path}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="mt-16 grid gap-14 lg:grid-cols-[300px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-32">
              <p className="eyebrow mb-4 text-mute">In this policy</p>
              <div className="relative pl-5">
                <span className="absolute inset-y-0 left-0 w-[2px] bg-ink/10">
                  <span data-progress className="block h-full origin-top scale-y-0 bg-accent" />
                </span>
                <ul className="space-y-1">
                  {policy.sections.map((s, i) => (
                    <li key={s.id}>
                      <button
                        onClick={() => jump(s.id)}
                        className={`flex gap-3 py-1.5 text-left text-sm transition-colors ${active === s.id ? "font-semibold text-ink" : "text-mute hover:text-ink"}`}
                      >
                        <span className="font-mono text-xs text-accent">{String(i + 1).padStart(2, "0")}</span>
                        {s.title}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 rounded-3xl bg-ink p-6 text-white">
                <p className="text-sm text-white/70">Need help interpreting a policy or resolving an order issue?</p>
                <a href={whatsappLink("Hello Prime Tech, I have a question about your policies.")} target="_blank" rel="noreferrer" className="btn btn-primary mt-4 h-11! w-full text-sm">
                  <MessageCircle className="h-4 w-4" />
                  <span>Talk to Prime Tech</span>
                </a>
              </div>
            </div>
          </aside>

          <article data-article className="max-w-3xl">
            {policy.sections.map((s, i) => (
              <Reveal key={s.id} self y={30} className="scroll-mt-32 border-t border-line py-10 first:border-t-0 first:pt-0">
                <section id={s.id} className="grid gap-4 sm:grid-cols-[64px_1fr]">
                  <span className="font-mono text-sm text-accent">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{s.title}</h2>
                    <div
                      className="mt-5 space-y-4 text-[1.02rem] leading-relaxed text-ink/80 [&_a]:font-semibold [&_a]:text-accent [&_li]:relative [&_li]:pl-6 [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:top-[0.7em] [&_li]:before:h-1.5 [&_li]:before:w-1.5 [&_li]:before:rounded-full [&_li]:before:bg-accent [&_ol]:space-y-2.5 [&_strong]:font-semibold [&_strong]:text-ink [&_ul]:space-y-2.5 [&_.note]:rounded-2xl [&_.note]:bg-paper [&_.note]:p-5 [&_.note]:text-ink"
                      dangerouslySetInnerHTML={{ __html: s.html }}
                    />
                  </div>
                </section>
              </Reveal>
            ))}
          </article>
        </div>
      </div>
    </section>
  );
}
