"use client";

import { useRef } from "react";
import { MessageCircle } from "lucide-react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { whatsappLink } from "@/lib/site";

/** Floating WhatsApp button that appears after the first screen. */
export function WhatsAppFab() {
  const ref = useRef<HTMLAnchorElement>(null);
  useGSAP(() => {
    const show = gsap.fromTo(ref.current, { scale: 0, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.6, ease: "back.out(2)", paused: true });
    const st = ScrollTrigger.create({
      start: () => window.innerHeight * 0.6,
      end: "max",
      onToggle: (self) => (self.isActive ? show.play() : show.reverse()),
    });
    return () => st.kill();
  });
  return (
    <a
      ref={ref}
      href={whatsappLink("Hello Prime Tech, I have a question.")}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with Prime Tech on WhatsApp"
      className="invisible fixed bottom-5 right-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-[#25d366] text-white opacity-0 shadow-[0_10px_30px_-5px_rgba(37,211,102,0.6)] sm:bottom-8 sm:right-8 [.pt-buybar_&]:bottom-24"
    >
      <span className="absolute inset-0 animate-ping rounded-full bg-[#25d366] opacity-25" />
      <MessageCircle className="relative h-6 w-6" />
    </a>
  );
}
