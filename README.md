# Prime Tech Kenya

A rebuild of [primetech.ke](https://primetech.ke) with a motion-led design: GSAP scroll stories, page transitions and micro-interactions on top of a fast, statically prerendered Next.js storefront.

The app lives in [`web/`](web/).

## Stack

- **Next.js 16** (App Router, Cache Components, Turbopack) with React 19 and TypeScript
- **Tailwind CSS 4** for styling, with design tokens in `src/app/globals.css`
- **GSAP 3.15** (ScrollTrigger, SplitText, Flip, DrawSVG, CustomEase) and `@gsap/react`
- **Lenis** for smooth scrolling, synced to the GSAP ticker
- **lucide-react** icons

## Getting started

```bash
cd web
npm install
npm run dev        # http://localhost:3000
npm run build && npm start   # production build (prerenders ~127 pages)
```

## What's inside

| Route | Highlights |
| --- | --- |
| `/` | Pinned iPhone 18 Pro Max hero with finish spotlight and spec chips, scroll-velocity marquee, horizontal category gallery, draggable product rail, scrubbed trade-in credit counter, Lipa Pole Pole step line, stats, FAQ |
| `/[family]` | iPhone, Mac, iPad, Apple Watch, AirPods, Accessories. Filters (condition, price, storage, memory, colour), Flip-animated sorting and filtering, compare up to 3 models |
| `/[family]/[slug]` | 99 product pages. Colour change with circular reveal, rolling-digit price, storage and RAM pricing, fly-to-bag, specs, expert review videos, related rails |
| `/lipa-polepole` | Live financing calculator with payment timeline chart, WhatsApp application |
| `/trade-in` | 4-step wizard with animated condition illustrations and live summary |
| `/about`, `/contact` | Floating product hero, scroll-highlighted story, map, WhatsApp contact form |
| `/terms`, `/privacy`, `/returns` | Policy centre with scroll-tracked table of contents |
| `/cart` | Bag with WhatsApp checkout (also available as a slide-out drawer) |

Site-wide: first-visit preloader (the PT monogram draws itself), curtain page transitions, custom cursor, magnetic buttons, ⌘K product search, mega menu, header that adapts to dark sections, and a floating WhatsApp button.

## Motion and accessibility

- Every animation runs inside `gsap.matchMedia()`; with `prefers-reduced-motion` the site renders static, with no preloader, curtain or smooth scroll.
- Entrance animations wait on a shared gate (`src/lib/intro.ts`), so heroes play when the preloader or curtain lifts, not underneath it.
- Pinned sections are wrapped in a React-owned element so ScrollTrigger's pin-spacer never conflicts with React's DOM.

## Data

Product data (`web/src/data/catalog.json`) and images (`web/public/products`) were imported from the current primetech.ke catalogue: 99 products with variants, colours and specs. Business details (phone, address, hours, financing terms) live in `web/src/lib/site.ts`.
