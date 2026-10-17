"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { X, Columns3 } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";
import { formatKsh, productHref, storageLabel, type FamilySlug, type ProductCard as Card } from "@/lib/catalog";
import { lockScroll } from "@/lib/route";

export type CompareData = Record<string, { key: string; group: string; label: string; value: string }[]>;

export function CompareTray({
  selected,
  data,
  onRemove,
  onClear,
}: {
  family: FamilySlug;
  selected: Card[];
  data: CompareData;
  onRemove: (slug: string) => void;
  onClear: () => void;
}) {
  const tray = useRef<HTMLDivElement>(null);
  const modal = useRef<HTMLDivElement>(null);
  const [wantOpen, setOpen] = useState(false);
  const open = wantOpen && selected.length >= 2;
  const shown = selected.length > 0;

  useGSAP(
    () => {
      gsap.to(tray.current, { y: 0, yPercent: shown ? 0 : 140, autoAlpha: shown ? 1 : 0, duration: 0.7, ease: shown ? "expo" : "power3.in" });
    },
    { dependencies: [shown] },
  );

  useEffect(() => {
    const el = modal.current!;
    if (open) {
      lockScroll(true);
      gsap.set(el, { display: "flex" });
      gsap.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 });
      gsap.fromTo(el.querySelector("[data-box]"), { y: 60, scale: 0.97 }, { y: 0, scale: 1, duration: 0.8 });
      gsap.fromTo(el.querySelectorAll("[data-col]"), { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.08, delay: 0.15 });
    } else if (el.style.display === "flex") {
      lockScroll(false);
      gsap.to(el, { autoAlpha: 0, duration: 0.3, onComplete: () => void gsap.set(el, { display: "none" }) });
    }
  }, [open]);


  const rows = useMemo(() => {
    const keys: { key: string; group: string; label: string }[] = [];
    const seen = new Set<string>();
    selected.forEach((p) =>
      (data[p.slug] ?? []).forEach((r) => {
        if (!seen.has(r.key)) {
          seen.add(r.key);
          keys.push(r);
        }
      }),
    );
    return keys;
  }, [selected, data]);

  return (
    <>
      <div
        ref={tray}
        className="invisible fixed inset-x-3 bottom-4 z-40 mx-auto flex max-w-3xl items-center gap-3 rounded-full bg-ink p-2 pl-4 text-white shadow-2xl sm:pl-6"
        role="region"
        aria-label="Compare products"
      >
        <Columns3 className="hidden h-5 w-5 text-accent-2 sm:block" />
        <div className="flex flex-1 items-center gap-2 overflow-x-auto no-scrollbar">
          {selected.map((p) => (
            <span key={p.slug} className="flex shrink-0 items-center gap-2 rounded-full bg-white/10 py-1 pl-1 pr-2">
              <span className="relative h-8 w-8 rounded-full bg-white">
                {p.image && <Image src={p.image.src} alt="" fill sizes="32px" className="object-contain p-0.5" />}
              </span>
              <span className="max-w-[9rem] truncate text-sm">{p.title}</span>
              <button onClick={() => onRemove(p.slug)} aria-label={`Remove ${p.title} from compare`}>
                <X className="h-3.5 w-3.5 text-white/60 hover:text-white" />
              </button>
            </span>
          ))}
          {selected.length < 3 && <span className="shrink-0 text-sm text-white/40">Add {3 - selected.length} more</span>}
        </div>
        <button onClick={onClear} className="hidden text-sm text-white/60 hover:text-white sm:block">
          Clear
        </button>
        <button onClick={() => setOpen(true)} disabled={selected.length < 2} className="btn btn-primary h-11! shrink-0 px-5! text-sm">
          <span>Compare</span>
        </button>
      </div>

      <div
        ref={modal}
        className="fixed inset-0 z-[85] items-end justify-center bg-ink/60 p-0 backdrop-blur-md sm:items-center sm:p-6"
        style={{ display: "none" }}
        onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        role="dialog"
        aria-modal="true"
        aria-label="Compare products"
        data-lenis-prevent
      >
        <div data-box className="max-h-[92vh] w-full max-w-6xl overflow-auto rounded-t-[28px] bg-white sm:rounded-[28px]">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-white/90 px-6 py-4 backdrop-blur">
            <p className="text-lg font-semibold">Compare {selected.length} models</p>
            <button onClick={() => setOpen(false)} className="grid h-10 w-10 place-items-center rounded-full bg-paper" aria-label="Close compare">
              <X className="h-5 w-5" />
            </button>
          </div>
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr>
                <th className="w-48 p-4" />
                {selected.map((p) => (
                  <th key={p.slug} data-col className="p-4 text-left align-top font-normal">
                    <div className="relative mb-4 aspect-square w-full max-w-[180px] rounded-2xl bg-paper">
                      {p.image && <Image src={p.image.src} alt={p.image.alt} fill sizes="180px" className="object-contain p-3 mix-blend-multiply" />}
                    </div>
                    <p className="text-base font-semibold">{p.title}</p>
                    <p className="text-mute">{p.priceFrom ?? p.refurbFrom ? `From ${formatKsh((p.priceFrom ?? p.refurbFrom)!)}` : "Price on request"}</p>
                    <Link href={productHref(p)} className="mt-3 inline-block text-sm font-semibold text-accent">
                      View product →
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-line">
                <th className="p-4 text-left font-medium text-mute">Storage</th>
                {selected.map((p) => (
                  <td key={p.slug} className="p-4">{p.storages.map(storageLabel).join(", ") || "—"}</td>
                ))}
              </tr>
              <tr className="border-t border-line">
                <th className="p-4 text-left font-medium text-mute">Colours</th>
                {selected.map((p) => (
                  <td key={p.slug} className="p-4">
                    <span className="flex flex-wrap gap-1.5">
                      {p.colors.map((c) => (
                        <span key={c.name} title={c.name} className="h-4 w-4 rounded-full border border-black/10" style={{ background: c.hex }} />
                      ))}
                    </span>
                  </td>
                ))}
              </tr>
              {rows.map((r, i) => (
                <tr key={r.key} className="border-t border-line">
                  <th className="p-4 text-left align-top font-medium text-mute">
                    {(i === 0 || rows[i - 1].group !== r.group) && <span className="eyebrow mb-1 block text-[0.62rem] text-accent">{r.group}</span>}
                    {r.label}
                  </th>
                  {selected.map((p) => (
                    <td key={p.slug} className="p-4 align-top">
                      {data[p.slug]?.find((x) => x.key === r.key)?.value ?? "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
