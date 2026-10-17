import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { FAMILIES, getProducts, lowestPrice, productHref, familyStartingPrice } from "@/lib/catalog";
import { SITE } from "@/lib/site";
import { Header, type MenuData } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SearchPalette, type SearchItem } from "@/components/layout/SearchPalette";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { WhatsAppFab } from "@/components/layout/WhatsAppFab";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { PageTransition, RouteWatcher } from "@/components/motion/PageTransition";
import { Preloader } from "@/components/motion/Preloader";
import { Cursor } from "@/components/motion/Cursor";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Prime Tech Kenya – Genuine iPhone, MacBook, iPad & Apple Watch in Nairobi",
    template: "%s | Prime Tech Kenya",
  },
  description:
    "Buy genuine Apple iPhone, MacBook, iPad, Apple Watch and AirPods in Kenya. Warranty support, same-day Nairobi delivery, Lipa Pole Pole financing and trade-in.",
  openGraph: { type: "website", siteName: SITE.name, locale: "en_KE" },
};

export const viewport: Viewport = {
  themeColor: "#08090b",
};

/* Runs before paint: enables motion-only CSS and skips the preloader for returning visitors. */
const bootScript = `try{var d=document.documentElement,r=matchMedia('(prefers-reduced-motion: reduce)').matches;if(!r)d.setAttribute('data-motion','');if(r||sessionStorage.getItem('pt-seen'))d.setAttribute('data-seen','')}catch(e){}`;

function menuData(): MenuData {
  return FAMILIES.map((f) => {
    const items = getProducts(f.slug);
    return {
      slug: f.slug,
      name: f.name,
      nav: f.nav,
      tagline: f.tagline,
      count: items.length,
      from: familyStartingPrice(f.slug),
      items: items.slice(0, 4).map((p) => ({
        title: p.title,
        href: productHref(p),
        image: p.images[0]?.src ?? null,
        price: lowestPrice(p),
      })),
    };
  });
}

function searchItems(): SearchItem[] {
  return getProducts().map((p) => ({
    title: p.title,
    href: productHref(p),
    family: p.family,
    image: p.images[0]?.src ?? null,
    price: lowestPrice(p),
  }));
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-KE"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${instrument.variable} antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
        <noscript>
          <style>{`.preloader{display:none}`}</style>
        </noscript>
      </head>
      <body className="min-h-screen">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-white">
          Skip to content
        </a>
        <Preloader />
        <Header menu={menuData()} />
        <main id="main">{children}</main>
        <Footer />
        <CartDrawer />
        <SearchPalette items={searchItems()} />
        <WhatsAppFab />
        <PageTransition />
        <Cursor />
        <SmoothScroll />
        <Suspense fallback={null}>
          <RouteWatcher />
        </Suspense>
      </body>
    </html>
  );
}
