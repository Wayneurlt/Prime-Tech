import { BadgeCheck, ShieldCheck, Truck, CreditCard, Repeat2, Wallet } from "lucide-react";
import { Marquee } from "@/components/motion/primitives";

const ITEMS = [
  { icon: BadgeCheck, title: "Genuine devices", sub: "100% authentic Apple" },
  { icon: ShieldCheck, title: "Warranty support", sub: "Official warranty cover" },
  { icon: Truck, title: "Countrywide delivery", sub: "Same-day in Nairobi" },
  { icon: CreditCard, title: "Secure payments", sub: "M-Pesa, card & bank" },
  { icon: Wallet, title: "Lipa Pole Pole", sub: "Pay monthly" },
  { icon: Repeat2, title: "Trade-in", sub: "Upgrade for less" },
];

export function TrustMarquee({ dark = false }: { dark?: boolean }) {
  return (
    <section
      aria-label="Why shop with Prime Tech"
      className={`border-y py-6 ${dark ? "border-white/10 bg-ink text-white" : "border-line bg-white"}`}
    >
      <Marquee speed={45}>
        {ITEMS.map(({ icon: Icon, title, sub }) => (
          <div key={title} className="flex items-center gap-4 px-8 sm:px-12">
            <span className={`grid h-11 w-11 place-items-center rounded-full ${dark ? "bg-white/10" : "bg-paper"}`}>
              <Icon className="h-5 w-5 text-accent" />
            </span>
            <span className="whitespace-nowrap">
              <span className="block font-semibold tracking-tight">{title}</span>
              <span className={`block text-sm ${dark ? "text-white/50" : "text-mute"}`}>{sub}</span>
            </span>
            <span className={`ml-8 text-2xl sm:ml-12 ${dark ? "text-white/20" : "text-ink/15"}`} aria-hidden>
              ✦
            </span>
          </div>
        ))}
      </Marquee>
    </section>
  );
}
