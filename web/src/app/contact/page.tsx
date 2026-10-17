import type { Metadata } from "next";
import { Phone, Mail, Clock, MapPin, MessageCircle } from "lucide-react";
import { SITE, whatsappLink } from "@/lib/site";
import { ContactForm } from "@/components/contact/ContactForm";
import { MapEmbed } from "@/components/sections/MapEmbed";
import { Reveal, SplitReveal } from "@/components/motion/primitives";
import { Faq } from "@/components/sections/Faq";
import { getFamilyMeta } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Contact us – Call, WhatsApp or visit our Nairobi store",
  description:
    "Call or WhatsApp Prime Tech to order genuine Apple iPhone, MacBook, iPad and Apple Watch in Kenya. Visit us at Norwich Union House, Mama Ngina Street, Nairobi.",
};

export default function ContactPage() {
  return (
    <>
      <section className="bg-paper pb-24 pt-[calc(var(--header-h)+5rem)]">
        <div className="container-x">
          <Reveal intro y={14}>
            <p className="eyebrow text-accent">Get in touch</p>
          </Reveal>
          <SplitReveal as="h1" className="mt-5 max-w-4xl text-display font-bold" type="chars" intro>
            Let&apos;s <span className="serif-accent">talk</span> tech.
          </SplitReveal>
          <Reveal intro delay={0.35} y={20}>
            <p className="mt-6 max-w-lg text-xl text-mute">Reach out to our team. We usually reply on WhatsApp within minutes during store hours.</p>
          </Reveal>

          <div className="mt-16 grid gap-6 lg:grid-cols-[1.15fr_1fr]">
            <Reveal intro delay={0.45} self y={50}>
              <ContactForm />
            </Reveal>
            <Reveal intro delay={0.55} className="grid gap-4 sm:grid-cols-2" stagger={0.08}>
              <a href={SITE.phoneHref} className="group rounded-[28px] bg-ink p-7 text-white transition-transform duration-500 hover:-translate-y-1">
                <Phone className="h-5 w-5 text-accent-2" />
                <p className="mt-6 text-sm text-white/50">Talk to us</p>
                <p className="mt-1 text-xl font-semibold tracking-tight">{SITE.phone}</p>
              </a>
              <a
                href={whatsappLink("Hello Prime Tech!")}
                target="_blank"
                rel="noreferrer"
                className="group rounded-[28px] bg-[#25d366] p-7 text-white transition-transform duration-500 hover:-translate-y-1"
              >
                <MessageCircle className="h-5 w-5" />
                <p className="mt-6 text-sm text-white/80">WhatsApp</p>
                <p className="mt-1 text-xl font-semibold tracking-tight">Chat with us</p>
              </a>
              <a href={`mailto:${SITE.email}`} className="rounded-[28px] bg-white p-7 transition-transform duration-500 hover:-translate-y-1 sm:col-span-2">
                <Mail className="h-5 w-5 text-accent" />
                <p className="mt-6 text-sm text-mute">Email</p>
                <p className="mt-1 break-all text-xl font-semibold tracking-tight">{SITE.email}</p>
              </a>
              <div className="rounded-[28px] bg-white p-7 sm:col-span-2">
                <Clock className="h-5 w-5 text-accent" />
                <p className="mt-6 text-sm text-mute">Working hours</p>
                <dl className="mt-2 space-y-1">
                  {SITE.hours.map((h) => (
                    <div key={h.days} className="flex justify-between gap-4">
                      <dt>{h.days}</dt>
                      <dd className="font-semibold">{h.time}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-3 text-xs text-mute">Hours may vary on holidays. Please call to confirm.</p>
              </div>
            </Reveal>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_2fr]">
            <Reveal className="rounded-[28px] bg-white p-7" self y={30}>
              <MapPin className="h-5 w-5 text-accent" />
              <p className="mt-6 text-sm text-mute">Visit our store</p>
              <p className="mt-1 text-xl font-semibold tracking-tight">{SITE.address.line1}</p>
              <p className="mt-1 text-mute">
                {SITE.address.line2}
                <br />
                {SITE.address.city}
              </p>
            </Reveal>
            <MapEmbed className="min-h-[360px]" />
          </div>
        </div>
      </section>
      <Faq items={getFamilyMeta("iphone").faqs} />
    </>
  );
}
