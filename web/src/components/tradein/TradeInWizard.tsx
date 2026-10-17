"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, MessageCircle, Repeat2, ChevronDown, Save } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";
import { formatKsh } from "@/lib/catalog";
import { whatsappLink } from "@/lib/site";

export type UpgradeDevice = { title: string; image: string | null; price: number | null };

const STEPS = ["Current device", "Desired device", "Contact info", "Review & confirm"];
const STORAGES = ["64GB", "128GB", "256GB", "512GB", "1TB", "2TB"];
const CONDITIONS = [
  { id: "Excellent", copy: "No scratches, looks brand new, fully functional." },
  { id: "Good", copy: "Minor signs of wear, no deep scratches." },
  { id: "Fair", copy: "Visible scratches, scuffs, or dents." },
  { id: "Cracked", copy: "Cracked screen, back glass, or casing." },
] as const;
const SAMSUNG = [
  "Galaxy S25 Ultra", "Galaxy S25+", "Galaxy S25", "Galaxy S24 Ultra", "Galaxy S24+", "Galaxy S24", "Galaxy S23 Ultra",
  "Galaxy S23", "Galaxy Z Fold6", "Galaxy Z Flip6", "Galaxy Z Fold5", "Galaxy Z Flip5", "Galaxy A55",
];

type Draft = {
  brand: "Apple" | "Samsung";
  model: string;
  storage: string;
  condition: string;
  target: string;
  name: string;
  phone: string;
  notes: string;
};

const EMPTY: Draft = { brand: "Apple", model: "", storage: "", condition: "", target: "", name: "", phone: "", notes: "" };
const KEY = "pt-tradein-draft";

/** Little phone drawing whose wear marks draw in for the chosen condition. */
function ConditionArt({ level, active }: { level: number; active: boolean }) {
  const ref = useRef<SVGSVGElement>(null);
  useGSAP(
    () => {
      if (!active) return;
      gsap.fromTo(ref.current!.querySelectorAll("[data-mark]"), { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.8, stagger: 0.08, ease: "power2.out" });
      gsap.fromTo(ref.current, { rotate: -8, scale: 0.9 }, { rotate: 0, scale: 1, duration: 0.9, ease: "elastic.out(1, 0.5)" });
    },
    { dependencies: [active] },
  );
  return (
    <svg ref={ref} viewBox="0 0 40 64" className="h-14 w-9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="2" width="34" height="60" rx="7" />
      <path d="M16 7h8" />
      {level === 0 && <path data-mark d="M27 18l2 -4l2 4l4 2l-4 2l-2 4l-2 -4l-4 -2z" strokeWidth="1.4" />}
      {level >= 1 && <path data-mark d="M10 20l6 -3" strokeWidth="1.2" />}
      {level >= 2 && <path data-mark d="M24 40l7 -4M12 48l5 2M26 22l4 3" strokeWidth="1.2" />}
      {level >= 3 && <path data-mark d="M20 28l-4 8l6 4l-5 9M22 40l7 6" strokeWidth="1.4" />}
    </svg>
  );
}

export function TradeInWizard({ iphones, upgrades }: { iphones: string[]; upgrades: UpgradeDevice[] }) {
  const root = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const [d, setD] = useState<Draft>(EMPTY);
  const [saved, setSaved] = useState(false);
  const dir = useRef(1);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      // Restore a saved draft after hydration (localStorage is browser-only).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setD({ ...EMPTY, ...JSON.parse(raw) });
    } catch {}
  }, []);

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((x) => ({ ...x, [k]: v }));

  // Slide between steps.
  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.fromTo(panel.current, { x: 60 * dir.current, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.8 });
      gsap.fromTo(panel.current!.querySelectorAll("[data-field]"), { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.06, delay: 0.1 });
      gsap.to("[data-progress]", { scaleX: (step + 1) / STEPS.length, duration: 0.9 });
    },
    { dependencies: [step], scope: root },
  );

  const valid = [
    !!(d.model && d.condition),
    !!d.target,
    d.name.trim().length > 1 && d.phone.replace(/\D/g, "").length >= 9,
    true,
  ];

  const go = (n: number) => {
    dir.current = n > step ? 1 : -1;
    setStep(n);
    root.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const save = () => {
    try {
      localStorage.setItem(KEY, JSON.stringify(d));
    } catch {}
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  const target = upgrades.find((u) => u.title === d.target);
  const message = `Hello Prime Tech, I'd like to trade in my device.\n\nCurrent device: ${d.brand} ${d.model}${d.storage ? `, ${d.storage}` : ""}\nCondition: ${d.condition}\nUpgrade to: ${d.target || "Not sure yet"}\n\nName: ${d.name}\nPhone: ${d.phone}${d.notes ? `\nNotes: ${d.notes}` : ""}`;
  const models = d.brand === "Apple" ? iphones : SAMSUNG;

  return (
    <div ref={root} className="scroll-mt-28 grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="rounded-[32px] bg-white p-6 sm:p-10">
        {/* Stepper */}
        <ol className="grid grid-cols-4 gap-2">
          {STEPS.map((s, i) => (
            <li key={s}>
              <button
                onClick={() => i < step && go(i)}
                disabled={i > step}
                className={`flex w-full flex-col gap-2 text-left text-xs sm:text-sm ${i <= step ? "text-ink" : "text-mute"}`}
              >
                <span
                  className={`grid h-8 w-8 place-items-center rounded-full font-mono text-xs transition-colors duration-500 ${
                    i < step ? "bg-accent text-white" : i === step ? "bg-ink text-white" : "bg-paper"
                  }`}
                >
                  {i < step ? <Check className="h-4 w-4" /> : i + 1}
                </span>
                <span className="hidden font-medium sm:block">{s}</span>
              </button>
            </li>
          ))}
        </ol>
        <div className="mt-6 h-1 overflow-hidden rounded-full bg-paper">
          <div data-progress className="h-full origin-left scale-x-0 rounded-full bg-accent" />
        </div>

        <div ref={panel} className="mt-10">
          <p data-field className="eyebrow text-mute">
            Step {String(step + 1).padStart(2, "0")} of 04
          </p>

          {step === 0 && (
            <>
              <h2 data-field className="mt-3 text-3xl font-bold tracking-tight">Tell us about the device you want to trade in</h2>
              <p data-field className="mt-2 text-mute">Share the details we need before confirming next steps on WhatsApp or in store.</p>

              <fieldset data-field className="mt-8">
                <legend className="mb-3 font-semibold">1. Brand</legend>
                <div className="grid grid-cols-2 gap-3">
                  {(["Apple", "Samsung"] as const).map((b) => (
                    <button
                      key={b}
                      aria-pressed={d.brand === b}
                      onClick={() => setD((x) => ({ ...x, brand: b, model: "" }))}
                      className={`h-14 rounded-2xl border font-semibold transition-all duration-300 ${d.brand === b ? "border-ink bg-ink text-white" : "border-line hover:border-ink"}`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </fieldset>

              <label data-field className="mt-7 block">
                <span className="mb-3 block font-semibold">2. Device model</span>
                <span className="relative block">
                  <select
                    value={d.model}
                    onChange={(e) => set("model", e.target.value)}
                    className="h-14 w-full appearance-none rounded-2xl border border-line bg-paper px-5 pr-12 outline-none focus:border-accent"
                  >
                    <option value="">Select your model…</option>
                    {models.map((m) => (
                      <option key={m}>{m}</option>
                    ))}
                    <option>Other / not listed</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-5 top-1/2 h-4 w-4 -translate-y-1/2 text-mute" />
                </span>
              </label>

              <fieldset data-field className="mt-7">
                <legend className="mb-3 font-semibold">3. Storage capacity</legend>
                <div className="flex flex-wrap gap-2">
                  {STORAGES.map((s) => (
                    <button key={s} className="chip h-11!" aria-pressed={d.storage === s} onClick={() => set("storage", s)}>
                      {s}
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset data-field className="mt-7">
                <legend className="mb-3 font-semibold">4. Device condition</legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  {CONDITIONS.map((c, i) => {
                    const on = d.condition === c.id;
                    return (
                      <button
                        key={c.id}
                        aria-pressed={on}
                        onClick={() => set("condition", c.id)}
                        className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-300 ${on ? "border-accent bg-accent/5 ring-1 ring-accent" : "border-line hover:border-ink"}`}
                      >
                        <span className={on ? "text-accent" : "text-ink/40"}>
                          <ConditionArt level={i} active={on} />
                        </span>
                        <span>
                          <span className="block font-semibold">{c.id}</span>
                          <span className="text-sm text-mute">{c.copy}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            </>
          )}

          {step === 1 && (
            <>
              <h2 data-field className="mt-3 text-3xl font-bold tracking-tight">What would you like to upgrade to?</h2>
              <p data-field className="mt-2 text-mute">Pick a device. Your trade-in credit comes straight off its price.</p>
              <div data-field className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3">
                {upgrades.map((u) => {
                  const on = d.target === u.title;
                  return (
                    <button
                      key={u.title}
                      aria-pressed={on}
                      onClick={() => set("target", u.title)}
                      className={`group relative rounded-2xl border p-3 text-left transition-all duration-300 ${on ? "border-accent ring-1 ring-accent" : "border-line hover:border-ink"}`}
                    >
                      <span className="relative block aspect-square rounded-xl bg-paper">
                        {u.image && <Image src={u.image} alt="" fill sizes="200px" className="object-contain p-3 mix-blend-multiply transition-transform duration-700 group-hover:scale-105" />}
                      </span>
                      <span className="mt-3 block text-sm font-semibold leading-tight">{u.title}</span>
                      <span className="text-xs text-mute">{u.price ? `From ${formatKsh(u.price)}` : "Price on request"}</span>
                      {on && (
                        <span className="absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full bg-accent text-white">
                          <Check className="h-3.5 w-3.5" />
                        </span>
                      )}
                    </button>
                  );
                })}
                <button
                  aria-pressed={d.target === "Not sure yet"}
                  onClick={() => set("target", "Not sure yet")}
                  className={`grid place-items-center rounded-2xl border border-dashed p-6 text-center text-sm font-semibold transition-all ${d.target === "Not sure yet" ? "border-accent text-accent" : "border-ink/20 text-mute hover:border-ink hover:text-ink"}`}
                >
                  Not sure yet,
                  <br />
                  help me choose
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 data-field className="mt-3 text-3xl font-bold tracking-tight">How can we reach you?</h2>
              <p data-field className="mt-2 text-mute">We&apos;ll send your quote and next steps on WhatsApp.</p>
              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                <label data-field className="block">
                  <span className="mb-2 block font-semibold">Full name</span>
                  <input value={d.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" className="h-14 w-full rounded-2xl border border-line bg-paper px-5 outline-none focus:border-accent" />
                </label>
                <label data-field className="block">
                  <span className="mb-2 block font-semibold">Phone / WhatsApp</span>
                  <input value={d.phone} onChange={(e) => set("phone", e.target.value)} type="tel" autoComplete="tel" placeholder="07xx xxx xxx" className="h-14 w-full rounded-2xl border border-line bg-paper px-5 outline-none focus:border-accent" />
                </label>
                <label data-field className="block sm:col-span-2">
                  <span className="mb-2 block font-semibold">
                    Anything else? <span className="font-normal text-mute">(optional)</span>
                  </span>
                  <textarea value={d.notes} onChange={(e) => set("notes", e.target.value)} rows={4} placeholder="Battery health, accessories included, preferred visit time…" className="w-full rounded-2xl border border-line bg-paper p-5 outline-none focus:border-accent" />
                </label>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2 data-field className="mt-3 text-3xl font-bold tracking-tight">Review & confirm</h2>
              <p data-field className="mt-2 text-mute">Check your details, then send them to our team on WhatsApp.</p>
              <dl data-field className="mt-8 divide-y divide-line rounded-2xl border border-line">
                {[
                  ["Trading in", `${d.brand} ${d.model}${d.storage ? ` · ${d.storage}` : ""}`],
                  ["Condition", d.condition],
                  ["Upgrading to", d.target],
                  ["Name", d.name],
                  ["Phone", d.phone],
                  ...(d.notes ? [["Notes", d.notes]] : []),
                ].map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[140px_1fr] gap-4 p-4 text-sm">
                    <dt className="text-mute">{k}</dt>
                    <dd className="font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
              <a data-field href={whatsappLink(message)} target="_blank" rel="noreferrer" className="btn btn-primary mt-8 w-full sm:w-auto" data-cursor="Send">
                <MessageCircle className="h-4 w-4" />
                <span>Send trade-in request on WhatsApp</span>
              </a>
            </>
          )}
        </div>

        <div className="mt-10 flex items-center justify-between gap-3 border-t border-line pt-6">
          {step > 0 ? (
            <button onClick={() => go(step - 1)} className="btn btn-ghost h-12!">
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
          ) : (
            <button onClick={save} className="btn btn-ghost h-12!">
              {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              <span>{saved ? "Saved" : "Save progress"}</span>
            </button>
          )}
          {step < 3 && (
            <button onClick={() => valid[step] && go(step + 1)} disabled={!valid[step]} className="btn btn-dark h-12!">
              <span>Next step</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Summary */}
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="rounded-[32px] bg-ink p-7 text-white">
          <p className="eyebrow text-white/45">Trade-in summary</p>
          <div className="mt-6 rounded-2xl bg-white/[0.06] p-5">
            <p className="text-xs text-white/45">Your device</p>
            <p className="mt-1 text-lg font-semibold">{d.model ? `${d.brand} ${d.model}` : "Select a device"}</p>
            <p className="text-sm text-white/50">{[d.storage, d.condition].filter(Boolean).join(" · ") || "Add details"}</p>
          </div>
          <div className="relative z-10 -my-3 mx-auto grid h-10 w-10 place-items-center rounded-full bg-accent">
            <Repeat2 className="h-4 w-4" />
          </div>
          <div className="flex items-center gap-4 rounded-2xl bg-white p-5 text-ink">
            {target?.image && (
              <span className="relative h-16 w-16 shrink-0 rounded-xl bg-paper">
                <Image src={target.image} alt="" fill sizes="64px" className="object-contain p-1.5 mix-blend-multiply" />
              </span>
            )}
            <span>
              <span className="block text-xs text-mute">New upgrade</span>
              <span className="block font-semibold">{d.target || "Select a device"}</span>
              {target?.price && <span className="text-sm text-mute">From {formatKsh(target.price)}</span>}
            </span>
          </div>
          <p className="mt-6 text-sm text-white/50">
            <span className="font-semibold text-white">Price guarantee.</span> Final pricing is confirmed after physical verification of your device.
          </p>
        </div>
      </aside>
    </div>
  );
}
