"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { whatsappLink } from "@/lib/site";

const TOPICS = ["Buying a device", "Lipa Pole Pole", "Trade-in", "Warranty & repairs", "Something else"];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="group relative block">
      {children}
      <span className="pointer-events-none absolute left-5 top-4 origin-left text-mute transition-all duration-300 group-focus-within:-translate-y-2.5 group-focus-within:scale-75 group-focus-within:text-accent group-has-[:not(:placeholder-shown)]:-translate-y-2.5 group-has-[:not(:placeholder-shown)]:scale-75">
        {label}
      </span>
    </label>
  );
}

export function ContactForm() {
  const [name, setName] = useState("");
  const [topic, setTopic] = useState(TOPICS[0]);
  const [message, setMessage] = useState("");
  const ready = name.trim().length > 1 && message.trim().length > 3;

  const href = whatsappLink(`Hello Prime Tech, my name is ${name.trim()}.\nTopic: ${topic}\n\n${message.trim()}`);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (ready) window.open(href, "_blank", "noopener");
      }}
      className="rounded-[32px] bg-white p-7 sm:p-10"
    >
      <p className="text-2xl font-semibold tracking-tight">Send us a message</p>
      <p className="mt-1 text-mute">It opens in WhatsApp, so you&apos;ll get a reply from a real person, fast.</p>

      <fieldset className="mt-8">
        <legend className="sr-only">Topic</legend>
        <div className="flex flex-wrap gap-2">
          {TOPICS.map((t) => (
            <button type="button" key={t} className="chip" aria-pressed={topic === t} onClick={() => setTopic(t)}>
              {t}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="mt-6 space-y-4">
        <Field label="Full name">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder=" "
            autoComplete="name"
            className="h-16 w-full rounded-2xl border border-line bg-paper px-5 pt-4 outline-none transition-colors focus:border-accent focus:bg-white"
          />
        </Field>
        <Field label="How can we help?">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder=" "
            rows={6}
            className="w-full resize-none rounded-2xl border border-line bg-paper px-5 pb-4 pt-8 outline-none transition-colors focus:border-accent focus:bg-white"
          />
        </Field>
      </div>

      <button type="submit" disabled={!ready} className="btn btn-primary mt-6 w-full" data-cursor="Send">
        <MessageCircle className="h-4 w-4" />
        <span>Open WhatsApp</span>
      </button>
    </form>
  );
}
