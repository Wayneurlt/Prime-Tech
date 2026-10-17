/** The PT monogram, redrawn as SVG so each stroke can be animated. */
export const LOGO_PATHS = [
  "M65 2H341L319 35H65C45 35 37 55 37 73C37 97 57 113 77 113H132V145H77C35 145 3 115 3 73C3 33 35 2 65 2Z",
  "M80 47H166V270L132 213V78H50C50 60 63 47 80 47Z",
  "M179 47H324L296 78H216V213L179 270Z",
];

export function LogoMark({ className, title = "Prime Tech" }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 345 272" className={className} role="img" aria-label={title} fill="currentColor">
      {LOGO_PATHS.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark className="h-7 w-auto" title="" />
      <span className="flex flex-col leading-none">
        <span className="text-[0.95rem] font-extrabold tracking-[-0.01em]">PRIME TECH</span>
        <span className="mt-0.5 text-[0.55rem] font-medium tracking-[0.42em] opacity-70">KENYA</span>
      </span>
    </span>
  );
}
