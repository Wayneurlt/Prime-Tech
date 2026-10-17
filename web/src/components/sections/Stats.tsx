import { CountUp, Reveal } from "@/components/motion/primitives";
import { SITE } from "@/lib/site";

export function Stats({ models }: { models: number }) {
  const stats = [
    { value: 10, suffix: "k+", label: "Devices sold", sub: "and counting since " + SITE.established },
    { value: 98, suffix: "%", label: "Happy clients", sub: "who'd buy from us again" },
    { value: models, suffix: "", label: "Models to choose from", sub: "across six Apple families" },
    { value: SITE.established, suffix: "", label: "Established", sub: "on Mama Ngina Street, Nairobi" },
  ];
  return (
    <section className="bg-white py-20 sm:py-28">
      <Reveal className="container-x grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4" stagger={0.1}>
        {stats.map((s) => (
          <div key={s.label} className="border-t border-ink/10 pt-6">
            <p className="text-[clamp(3rem,7vw,6rem)] font-bold leading-none tracking-[-0.05em]">
              <CountUp value={s.value} format={false} />
              <span className="text-accent">{s.suffix}</span>
            </p>
            <p className="mt-4 font-semibold">{s.label}</p>
            <p className="text-sm text-mute">{s.sub}</p>
          </div>
        ))}
      </Reveal>
    </section>
  );
}
