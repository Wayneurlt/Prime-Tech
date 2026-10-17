import { ArrowUpRight } from "lucide-react";
import { SITE } from "@/lib/site";
import { ClipReveal } from "@/components/motion/primitives";

export function MapEmbed({ className = "min-h-[420px]" }: { className?: string }) {
  const q = encodeURIComponent(SITE.mapQuery);
  return (
    <ClipReveal className={`group relative overflow-hidden rounded-[28px] bg-paper ${className}`} from="inset(8% 8% 8% 8% round 28px)" to="inset(0% 0% 0% 0% round 28px)">
      <iframe
        title="Map showing the Prime Tech store on Mama Ngina Street, Nairobi"
        src={`https://maps.google.com/maps?q=${q}&z=17&output=embed`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="absolute inset-0 h-full w-full grayscale transition-[filter] duration-700 group-hover:grayscale-0"
      />
      <a
        href={`https://www.google.com/maps/dir/?api=1&destination=${q}`}
        target="_blank"
        rel="noreferrer"
        className="btn btn-dark absolute bottom-5 left-5 h-11! text-sm"
      >
        <span>Get directions</span>
        <ArrowUpRight className="h-4 w-4" />
      </a>
    </ClipReveal>
  );
}
