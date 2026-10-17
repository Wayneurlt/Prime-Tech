"use client";

import { useRef, useState } from "react";
import { Plus } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";
import { Reveal, SplitReveal } from "@/components/motion/primitives";

type Item = { question: string; answer: string };

function Row({ item, open, onToggle, id }: { item: Item; open: boolean; onToggle: () => void; id: string }) {
  const body = useRef<HTMLDivElement>(null);
  const icon = useRef<HTMLSpanElement>(null);
  useGSAP(
    () => {
      gsap.to(body.current, { height: open ? "auto" : 0, duration: open ? 0.8 : 0.5, ease: open ? "expo" : "power3.inOut" });
      gsap.to(icon.current, { rotate: open ? 135 : 0, duration: 0.6 });
    },
    { dependencies: [open] },
  );
  return (
    <div className="border-b border-ink/10">
      <h3>
        <button
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={id}
          className="flex w-full items-center justify-between gap-6 py-6 text-left text-lg font-semibold tracking-tight sm:text-xl"
        >
          {item.question}
          <span ref={icon} className={`grid h-10 w-10 shrink-0 place-items-center rounded-full transition-colors ${open ? "bg-accent text-white" : "bg-paper"}`}>
            <Plus className="h-4 w-4" />
          </span>
        </button>
      </h3>
      <div ref={body} id={id} className="h-0 overflow-hidden" role="region">
        <p className="max-w-2xl pb-7 text-mute">{item.answer}</p>
      </div>
    </div>
  );
}

export function Faq({ items, title = "Questions, answered." }: { items: Item[]; title?: string }) {
  const [open, setOpen] = useState(0);
  if (!items.length) return null;
  return (
    <section className="bg-white py-24 sm:py-32">
      <div className="container-x grid gap-12 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <p className="eyebrow text-mute">FAQ</p>
          <SplitReveal className="mt-5 text-h2 font-bold" type="words">
            {title}
          </SplitReveal>
          <p className="mt-5 max-w-sm text-mute">Can&apos;t find what you&apos;re looking for? Our team replies on WhatsApp within minutes during store hours.</p>
        </div>
        <Reveal stagger={0.06}>
          {items.map((it, i) => (
            <Row key={it.question} item={it} id={`faq-${i}`} open={open === i} onToggle={() => setOpen(open === i ? -1 : i)} />
          ))}
        </Reveal>
      </div>
    </section>
  );
}
