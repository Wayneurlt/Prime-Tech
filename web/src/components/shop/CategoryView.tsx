"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { SlidersHorizontal, Search, X, RotateCcw, ChevronDown } from "lucide-react";
import { gsap, Flip, useGSAP, MOTION_OK } from "@/lib/gsap";
import { formatKsh, storageLabel, type FamilySlug, type ProductCard as Card } from "@/lib/catalog";
import { lockScroll } from "@/lib/route";
import { ProductCard } from "@/components/product/ProductCard";
import { CompareTray, type CompareData } from "./Compare";

type Sort = "newest" | "price-asc" | "price-desc";
type Cond = "all" | "new" | "refurb";

const PAGE = 12;

function priceFor(p: Card, cond: Cond) {
  if (cond === "new") return p.priceFrom;
  if (cond === "refurb") return p.refurbFrom;
  const list = [p.priceFrom, p.refurbFrom].filter((n): n is number => !!n);
  return list.length ? Math.min(...list) : null;
}

export function CategoryView({
  family,
  familyName,
  products,
  compare,
}: {
  family: FamilySlug;
  familyName: string;
  products: Card[];
  compare: CompareData;
}) {
  const root = useRef<HTMLElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  const flipState = useRef<Flip.FlipState | null>(null);

  const bounds = useMemo(() => {
    const prices = products.flatMap((p) => [p.priceFrom, p.refurbFrom]).filter((n): n is number => !!n);
    const max = Math.ceil(Math.max(...prices, 10000) / 5000) * 5000;
    return { min: 0, max };
  }, [products]);

  const options = useMemo(() => {
    const storages = [...new Set(products.flatMap((p) => p.storages))].sort((a, b) => a - b);
    const rams = [...new Set(products.flatMap((p) => p.rams))].sort((a, b) => a - b);
    const colorCount = new Map<string, { hex: string; n: number }>();
    products.forEach((p) =>
      p.colors.forEach((c) => colorCount.set(c.name, { hex: c.hex, n: (colorCount.get(c.name)?.n ?? 0) + 1 })),
    );
    const colors = [...colorCount.entries()].sort((a, b) => b[1].n - a[1].n).slice(0, 14).map(([name, v]) => ({ name, hex: v.hex }));
    const hasRefurb = products.some((p) => p.conditions.includes("refurb"));
    return { storages, rams, colors, hasRefurb };
  }, [products]);

  const [q, setQ] = useState("");
  const [sort, setSort] = useState<Sort>("newest");
  const [cond, setCond] = useState<Cond>("all");
  const [maxPrice, setMaxPrice] = useState(bounds.max);
  const [storages, setStorages] = useState<number[]>([]);
  const [rams, setRams] = useState<number[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [limit, setLimit] = useState(PAGE);
  const [drawer, setDrawer] = useState(false);
  const [compareList, setCompareList] = useState<string[]>([]);

  const filtered = useMemo(() => {
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    const list = products.filter((p) => {
      if (terms.length && !terms.every((t) => p.title.toLowerCase().includes(t))) return false;
      if (cond !== "all" && !p.conditions.includes(cond)) return false;
      const price = priceFor(p, cond);
      if (maxPrice < bounds.max && (price === null || price > maxPrice)) return false;
      if (storages.length && !p.storages.some((s) => storages.includes(s))) return false;
      if (rams.length && !p.rams.some((r) => rams.includes(r))) return false;
      if (colors.length && !p.colors.some((c) => colors.includes(c.name))) return false;
      return true;
    });
    if (sort !== "newest") {
      const dir = sort === "price-asc" ? 1 : -1;
      list.sort((a, b) => {
        const pa = priceFor(a, cond);
        const pb = priceFor(b, cond);
        if (pa === null) return 1;
        if (pb === null) return -1;
        return (pa - pb) * dir;
      });
    }
    return list;
  }, [products, q, cond, maxPrice, storages, rams, colors, sort, bounds.max]);

  const visible = filtered.slice(0, limit);
  const activeCount =
    (cond !== "all" ? 1 : 0) + (maxPrice < bounds.max ? 1 : 0) + storages.length + rams.length + colors.length;

  /** Capture card positions, then apply the state change; layout effect animates the difference. */
  function update(fn: () => void) {
    if (grid.current && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      flipState.current = Flip.getState(grid.current.querySelectorAll("[data-flip-id]"));
    }
    fn();
  }

  useLayoutEffect(() => {
    const state = flipState.current;
    if (!state || !grid.current) return;
    flipState.current = null;
    Flip.from(state, {
      targets: grid.current.querySelectorAll("[data-flip-id]"),
      duration: 0.8,
      ease: "expo",
      stagger: 0.02,
      absolute: true,
      onEnter: (els) => gsap.fromTo(els, { autoAlpha: 0, scale: 0.85, y: 30 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.8, stagger: 0.03 }),
    });
  }, [filtered, limit]);

  // Initial grid reveal.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.from("[data-flip-id]", {
          y: 80,
          autoAlpha: 0,
          duration: 1.2,
          stagger: { each: 0.06, grid: "auto" },
          scrollTrigger: { trigger: grid.current, start: "top 85%", once: true },
        });
        gsap.fromTo("[data-toolbar] > *", { y: 20, autoAlpha: 0 }, {
          y: 0,
          autoAlpha: 1,
          clearProps: "transform,translate,rotate,scale,opacity,visibility",
          duration: 1,
          stagger: 0.06,
          scrollTrigger: { trigger: root.current, start: "top 85%", once: true },
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  // Mobile filter drawer.
  useGSAP(
    () => {
      const el = root.current!.querySelector<HTMLElement>("[data-drawer]")!;
      if (drawer) {
        lockScroll(true);
        gsap.set(el, { display: "block" });
        gsap.fromTo(el.querySelector("[data-sheet]"), { yPercent: 100 }, { yPercent: 0, duration: 0.7 });
        gsap.fromTo(el.querySelector("[data-scrim]"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 });
      } else if (el.style.display === "block") {
        lockScroll(false);
        gsap.to(el.querySelector("[data-sheet]"), { yPercent: 100, duration: 0.5, ease: "power3.in" });
        gsap.to(el.querySelector("[data-scrim]"), { autoAlpha: 0, duration: 0.4, onComplete: () => void gsap.set(el, { display: "none" }) });
      }
    },
    { dependencies: [drawer], scope: root },
  );

  const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const reset = () =>
    update(() => {
      setCond("all");
      setMaxPrice(bounds.max);
      setStorages([]);
      setRams([]);
      setColors([]);
      setQ("");
    });

  const fill = `${(maxPrice / bounds.max) * 100}%`;

  const filters = (
    <div className="space-y-9">
      {options.hasRefurb && (
        <fieldset>
          <legend className="eyebrow mb-3 text-mute">Condition</legend>
          <div className="flex flex-wrap gap-2">
            {(["all", "new", "refurb"] as Cond[]).map((c) => (
              <button key={c} className="chip" aria-pressed={cond === c} onClick={() => update(() => setCond(c))}>
                {c === "all" ? "All" : c === "new" ? "New" : "Ex-UK"}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <fieldset>
        <legend className="eyebrow mb-3 flex w-full justify-between text-mute">
          <span>Max price</span>
          <span className="normal-case tracking-normal text-ink">{maxPrice >= bounds.max ? "Any" : formatKsh(maxPrice)}</span>
        </legend>
        <input
          type="range"
          className="range"
          min={5000}
          max={bounds.max}
          step={5000}
          value={maxPrice}
          style={{ ["--fill" as string]: fill }}
          onChange={(e) => update(() => setMaxPrice(Number(e.target.value)))}
          aria-label="Maximum price"
        />
        <div className="mt-2 flex justify-between text-xs text-mute">
          <span>KSh 5,000</span>
          <span>{formatKsh(bounds.max)}</span>
        </div>
      </fieldset>

      {options.storages.length > 1 && (
        <fieldset>
          <legend className="eyebrow mb-3 text-mute">Storage</legend>
          <div className="flex flex-wrap gap-2">
            {options.storages.map((s) => (
              <button key={s} className="chip" aria-pressed={storages.includes(s)} onClick={() => update(() => setStorages(toggle(storages, s)))}>
                {storageLabel(s)}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {options.rams.length > 1 && (
        <fieldset>
          <legend className="eyebrow mb-3 text-mute">Memory</legend>
          <div className="flex flex-wrap gap-2">
            {options.rams.map((r) => (
              <button key={r} className="chip" aria-pressed={rams.includes(r)} onClick={() => update(() => setRams(toggle(rams, r)))}>
                {r}GB
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {options.colors.length > 1 && (
        <fieldset>
          <legend className="eyebrow mb-3 text-mute">Colour</legend>
          <div className="flex flex-wrap gap-2.5">
            {options.colors.map((c) => {
              const on = colors.includes(c.name);
              return (
                <button
                  key={c.name}
                  title={c.name}
                  aria-label={c.name}
                  aria-pressed={on}
                  onClick={() => update(() => setColors(toggle(colors, c.name)))}
                  className={`h-8 w-8 rounded-full border border-black/10 transition-transform duration-300 hover:scale-110 ${on ? "ring-2 ring-accent ring-offset-2" : ""}`}
                  style={{ background: c.hex }}
                />
              );
            })}
          </div>
        </fieldset>
      )}

      {activeCount > 0 && (
        <button onClick={reset} className="flex items-center gap-2 text-sm font-semibold text-accent">
          <RotateCcw className="h-4 w-4" /> Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <section ref={root} id="products" className="scroll-mt-24 bg-paper pb-24 pt-10">
      <div className="container-x">
        <div data-toolbar className="relative z-20 mb-8 flex lg:sticky lg:top-[84px] flex-wrap items-center gap-3 rounded-[28px] border border-white/60 bg-paper/90 p-2 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.25)] backdrop-blur-xl">
          <label className="flex h-12 min-w-0 flex-1 items-center gap-3 rounded-full border border-line bg-white px-5 sm:max-w-sm">
            <Search className="h-4 w-4 shrink-0 text-mute" />
            <input
              value={q}
              onChange={(e) => update(() => setQ(e.target.value))}
              placeholder={`Search ${familyName}`}
              className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-mute-2"
              aria-label={`Search ${familyName}`}
            />
            {q && (
              <button onClick={() => update(() => setQ(""))} aria-label="Clear search">
                <X className="h-4 w-4 text-mute" />
              </button>
            )}
          </label>
          <button onClick={() => setDrawer(true)} className="chip h-12! lg:hidden">
            <SlidersHorizontal className="h-4 w-4" /> Filters {activeCount > 0 && <span className="rounded-full bg-accent px-1.5 text-xs text-white">{activeCount}</span>}
          </button>
          <p className="ml-auto hidden text-sm text-mute sm:block" aria-live="polite">
            <span className="font-semibold text-ink tabular-nums">{filtered.length}</span> of {products.length} products
          </p>
          <label className="relative">
            <span className="sr-only">Sort by</span>
            <select
              value={sort}
              onChange={(e) => update(() => setSort(e.target.value as Sort))}
              className="h-12 appearance-none rounded-full border border-line bg-white pl-5 pr-11 text-sm font-medium outline-none"
            >
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to high</option>
              <option value="price-desc">Price: High to low</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-mute" />
          </label>
        </div>

        <div className="grid gap-10 lg:grid-cols-[260px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-[170px]">{filters}</div>
          </aside>

          <div>
            <div ref={grid} className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {visible.map((p, i) => (
                <div key={p.slug} data-flip-id={p.slug}>
                  <ProductCard
                    product={p}
                    priority={i < 3}
                    compare={{
                      checked: compareList.includes(p.slug),
                      disabled: compareList.length >= 3,
                      onToggle: () => setCompareList(toggle(compareList, p.slug)),
                    }}
                  />
                </div>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="rounded-[28px] bg-white px-6 py-20 text-center">
                <p className="text-2xl font-semibold tracking-tight">No matches.</p>
                <p className="mt-2 text-mute">Try removing a filter, or ask us on WhatsApp. We can often source it.</p>
                <button onClick={reset} className="btn btn-dark mt-6">
                  <span>Reset filters</span>
                </button>
              </div>
            )}

            {filtered.length > limit && (
              <div className="mt-12 flex flex-col items-center gap-4">
                <div className="h-1 w-48 overflow-hidden rounded-full bg-ink/10">
                  <div className="h-full rounded-full bg-ink transition-[width] duration-700" style={{ width: `${(limit / filtered.length) * 100}%` }} />
                </div>
                <p className="text-sm text-mute">
                  Showing {limit} of {filtered.length}
                </p>
                <button onClick={() => update(() => setLimit(limit + PAGE))} className="btn btn-dark">
                  <span>Load more</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      <div data-drawer className="fixed inset-0 z-[70] lg:hidden" style={{ display: "none" }} data-lenis-prevent>
        <div data-scrim className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={() => setDrawer(false)} />
        <div data-sheet className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-[28px] bg-white p-6 pb-28">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-xl font-semibold">Filters</p>
            <button onClick={() => setDrawer(false)} className="grid h-10 w-10 place-items-center rounded-full bg-paper" aria-label="Close filters">
              <X className="h-5 w-5" />
            </button>
          </div>
          {filters}
          <div className="fixed inset-x-0 bottom-0 border-t border-line bg-white p-4">
            <button onClick={() => setDrawer(false)} className="btn btn-dark w-full">
              <span>Show {filtered.length} products</span>
            </button>
          </div>
        </div>
      </div>

      <CompareTray
        family={family}
        selected={compareList.map((s) => products.find((p) => p.slug === s)!).filter(Boolean)}
        data={compare}
        onRemove={(slug) => setCompareList(compareList.filter((s) => s !== slug))}
        onClear={() => setCompareList([])}
      />
    </section>
  );
}
