"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, ChevronDown } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";
import { formatKsh } from "@/lib/catalog";
import { FINANCE, financePlan, whatsappLink } from "@/lib/site";
import { Odometer } from "@/components/motion/Odometer";

export type DeviceOption = { title: string; price: number };

const MIN = FINANCE.minPrice;
const MAX = 600000;

export function Calculator({ devices }: { devices: DeviceOption[] }) {
  const root = useRef<HTMLDivElement>(null);
  const [price, setPrice] = useState(185000);
  const [device, setDevice] = useState("");
  const [months, setMonths] = useState(FINANCE.defaultTerm);
  const plan = financePlan(price, months);

  // Prefill from ?price= when arriving from a product page.
  useEffect(() => {
    const p = Number(new URLSearchParams(window.location.search).get("price"));
    // Read after hydration so the prerendered HTML stays identical for every visitor.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (p >= MIN && p <= 2_000_000) setPrice(p);
  }, []);

  // Payment timeline bars grow to their share whenever the plan changes.
  useGSAP(
    () => {
      const bars = gsap.utils.toArray<HTMLElement>("[data-bar]");
      const max = Math.max(plan.deposit, plan.monthly);
      bars.forEach((b) => {
        const v = Number(b.dataset.value);
        gsap.to(b, { scaleY: Math.max(0.06, v / max), duration: 0.9, ease: "expo" });
      });
      gsap.fromTo("[data-bar-wrap]", { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.02, overwrite: true });
    },
    { dependencies: [plan.deposit, plan.monthly, months], scope: root },
  );

  const fill = `${((Math.min(price, MAX) - MIN) / (MAX - MIN)) * 100}%`;
  const message = `Hello Prime Tech, I'd like to apply for Lipa Pole Pole.\n\nDevice: ${device || "Not chosen yet"}\nPrice: ${formatKsh(price)}\nDeposit (${FINANCE.depositRate * 100}%): ${formatKsh(plan.deposit)}\nTerm: ${months} months (about ${formatKsh(plan.monthly)}/month)`;

  return (
    <div ref={root} className="grid overflow-hidden rounded-[36px] bg-white shadow-[0_40px_100px_-40px_rgba(0,0,0,0.25)] lg:grid-cols-[1.05fr_1fr]">
      <div className="p-7 sm:p-12">
        <p className="eyebrow text-accent">Financing calculator</p>
        <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Plan your payments.</h2>
        <p className="mt-3 text-mute">Choose a device or enter a price, pick a term, and see exactly what you&apos;ll pay. No hidden fees.</p>

        <label className="mt-9 block">
          <span className="eyebrow text-mute">Pick a device</span>
          <span className="relative mt-3 block">
            <select
              value={device}
              onChange={(e) => {
                setDevice(e.target.value);
                const d = devices.find((x) => x.title === e.target.value);
                if (d) setPrice(d.price);
              }}
              className="h-14 w-full appearance-none rounded-2xl border border-line bg-paper px-5 pr-12 font-medium outline-none focus:border-accent"
            >
              <option value="">Any device…</option>
              {devices.map((d) => (
                <option key={d.title} value={d.title}>
                  {d.title} — {formatKsh(d.price)}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-5 top-1/2 h-4 w-4 -translate-y-1/2 text-mute" />
          </span>
        </label>

        <label className="mt-8 block">
          <span className="eyebrow flex justify-between text-mute">
            <span>Device price</span>
          </span>
          <span className="mt-3 flex h-16 items-center rounded-2xl border border-line bg-paper px-5 focus-within:border-accent">
            <span className="mr-2 text-mute">KSh</span>
            <input
              type="number"
              inputMode="numeric"
              min={MIN}
              step={1000}
              value={price}
              onChange={(e) => {
                setDevice("");
                setPrice(Math.max(0, Number(e.target.value)));
              }}
              onBlur={() => setPrice((p) => Math.max(MIN, p))}
              className="w-full bg-transparent text-2xl font-bold tracking-tight outline-none tabular-nums"
              aria-label="Device price in Kenya shillings"
            />
          </span>
          <input
            type="range"
            className="range mt-5"
            min={MIN}
            max={MAX}
            step={1000}
            value={Math.min(price, MAX)}
            style={{ ["--fill" as string]: fill }}
            onChange={(e) => {
              setDevice("");
              setPrice(Number(e.target.value));
            }}
            aria-label="Device price slider"
          />
          <span className="mt-2 flex justify-between text-xs text-mute">
            <span>{formatKsh(MIN)}</span>
            <span>{formatKsh(MAX)}+</span>
          </span>
        </label>

        <fieldset className="mt-8">
          <legend className="eyebrow mb-3 text-mute">Repayment term</legend>
          <div className="grid grid-cols-4 gap-2">
            {FINANCE.terms.map((t) => (
              <button
                key={t}
                onClick={() => setMonths(t)}
                aria-pressed={months === t}
                className={`h-14 rounded-2xl border font-semibold transition-all duration-300 ${months === t ? "border-ink bg-ink text-white" : "border-line hover:border-ink"}`}
              >
                {t} <span className="text-xs font-normal opacity-60">mo</span>
              </button>
            ))}
          </div>
        </fieldset>
        {price < MIN && <p className="mt-4 text-sm text-[#dc2626]">Lipa Pole Pole is available on devices from {formatKsh(MIN)}.</p>}
      </div>

      <div className="flex flex-col bg-ink p-7 text-white sm:p-12">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="eyebrow text-white/45">Deposit ({FINANCE.depositRate * 100}%)</p>
            <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              <Odometer value={plan.deposit} prefix="KSh " />
            </p>
            <p className="mt-1 text-sm text-white/45">Payable at pick-up</p>
          </div>
          <div>
            <p className="eyebrow text-white/45">Monthly</p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-accent-2 sm:text-4xl">
              <Odometer value={plan.monthly} prefix="KSh " />
            </p>
            <p className="mt-1 text-sm text-white/45">for {months} months via M-Pesa</p>
          </div>
        </div>

        <div className="mt-10 flex-1">
          <p className="eyebrow text-white/45">Your payment timeline</p>
          <div className="mt-5 flex h-40 items-end gap-1.5">
            <div data-bar-wrap className="flex h-full flex-1 flex-col items-center justify-end gap-2">
              <div data-bar data-value={plan.deposit} className="w-full origin-bottom rounded-t-lg bg-accent" style={{ height: "100%" }} />
              <span className="font-mono text-[0.6rem] text-white/50">Dep.</span>
            </div>
            {Array.from({ length: months }, (_, i) => (
              <div key={i} data-bar-wrap className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                <div data-bar data-value={plan.monthly} className="w-full origin-bottom rounded-t-lg bg-white/25" style={{ height: "100%" }} />
                <span className="font-mono text-[0.6rem] text-white/40">{i + 1}</span>
              </div>
            ))}
          </div>
        </div>

        <dl className="mt-8 space-y-2 border-t border-white/10 pt-6 text-sm">
          <div className="flex justify-between">
            <dt className="text-white/50">Device price</dt>
            <dd className="font-semibold tabular-nums">{formatKsh(price)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-white/50">Balance after deposit</dt>
            <dd className="font-semibold tabular-nums">{formatKsh(plan.balance)}</dd>
          </div>
        </dl>

        <a href={whatsappLink(message)} target="_blank" rel="noreferrer" className="btn btn-primary mt-8 w-full">
          <MessageCircle className="h-4 w-4" />
          <span>Send details via WhatsApp</span>
        </a>
        <p className="mt-3 text-center text-xs text-white/40">Indicative figures. Final terms are confirmed by a Prime Tech advisor.</p>
      </div>
    </div>
  );
}
