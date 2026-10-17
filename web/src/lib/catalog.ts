import catalog from "@/data/catalog.json";

export type Condition = "new" | "refurb";

export type Variant = {
  condition: Condition;
  storage: number | null;
  ram: number | null;
  price: number;
  inStock: boolean;
};

export type ProductImage = { src: string; color: string | null; alt: string };

export type Product = {
  slug: string;
  family: FamilySlug;
  title: string;
  summary: string;
  isNew: boolean;
  inStock: boolean;
  priceFrom: number | null;
  refurbFrom: number | null;
  images: ProductImage[];
  colors: { name: string; hex: string }[];
  variants: Variant[];
  storages: number[];
  rams: number[];
  conditions: Condition[];
  keyFeatures: string[];
  specs: Record<string, unknown>;
  officialVideo: string | null;
  reviews: { name: string; title: string; id: string }[];
};

/** Lightweight shape sent to client components (no specs payload). */
export type ProductCard = Pick<
  Product,
  | "slug"
  | "family"
  | "title"
  | "summary"
  | "isNew"
  | "inStock"
  | "priceFrom"
  | "refurbFrom"
  | "colors"
  | "storages"
  | "rams"
  | "conditions"
> & {
  image: ProductImage | null;
  images: ProductImage[];
  /** Set when the product has a single configuration and can be added straight from a card. */
  quickAdd: Omit<Variant, "inStock"> | null;
};

export type FamilySlug =
  | "iphone"
  | "mac"
  | "ipad"
  | "apple-watch"
  | "airpods"
  | "accessories";

export type Family = {
  slug: FamilySlug;
  name: string;
  nav: string;
  tagline: string;
  intro: string;
  image: string;
  tone: "dark" | "light";
};

export const FAMILIES: Family[] = [
  {
    slug: "iphone",
    name: "iPhone",
    nav: "iPhone",
    tagline: "The world's most personal device.",
    intro: "From the foldable iPhone Duo to dependable Ex-UK classics, every iPhone is genuine, tested and ready to go.",
    image: "/images/iphone-editorial.webp",
    tone: "dark",
  },
  {
    slug: "mac",
    name: "Mac",
    nav: "MacBooks",
    tagline: "Power for every possibility.",
    intro: "MacBook Air, MacBook Pro, iMac and Mac mini, configured with the memory and storage your work actually needs.",
    image: "/images/macbook-editorial.webp",
    tone: "dark",
  },
  {
    slug: "ipad",
    name: "iPad",
    nav: "iPads",
    tagline: "A canvas for every idea.",
    intro: "iPad Pro, iPad Air and iPad, in Wi-Fi and 5G models, for drawing, studying, working and everything in between.",
    image: "/images/ipad-editorial.webp",
    tone: "light",
  },
  {
    slug: "apple-watch",
    name: "Apple Watch",
    nav: "Watch",
    tagline: "The future of health.",
    intro: "Series, Ultra and SE in every size. Health insights, safety features and workouts on your wrist.",
    image: "/images/watch-editorial.webp",
    tone: "light",
  },
  {
    slug: "airpods",
    name: "AirPods",
    nav: "AirPods",
    tagline: "Immersive sound. Effortless.",
    intro: "AirPods, AirPods Pro and AirPods Max, with Active Noise Cancellation and Personalized Spatial Audio.",
    image: "/images/airpods-editorial.webp",
    tone: "dark",
  },
  {
    slug: "accessories",
    name: "Accessories",
    nav: "Accessories",
    tagline: "Complete your setup.",
    intro: "Apple Pencil, Magic Keyboard, AirTag, chargers and cables. Genuine accessories that just work.",
    image: "/images/accessories-editorial.webp",
    tone: "light",
  },
];

const products = catalog.products as unknown as Product[];
const familyMeta = catalog.families as Record<
  FamilySlug,
  { faqs: { question: string; answer: string }[]; startingPrice: number | null }
>;

export function getFamily(slug: string) {
  return FAMILIES.find((f) => f.slug === slug);
}

export function getFamilyMeta(slug: FamilySlug) {
  return familyMeta[slug];
}

export function getProducts(family?: FamilySlug) {
  return family ? products.filter((p) => p.family === family) : products;
}

export function getProduct(family: string, slug: string) {
  return products.find((p) => p.family === family && p.slug === slug);
}

export function toCard(p: Product): ProductCard {
  return {
    slug: p.slug,
    family: p.family,
    title: p.title,
    summary: p.summary,
    isNew: p.isNew,
    inStock: p.inStock,
    priceFrom: p.priceFrom,
    refurbFrom: p.refurbFrom,
    colors: p.colors,
    storages: p.storages,
    rams: p.rams,
    conditions: p.conditions,
    image: p.images[0] ?? null,
    images: p.images,
    quickAdd: quickAddVariant(p),
  };
}

function quickAddVariant(p: Product) {
  if (p.storages.length > 1 || p.rams.length > 1 || p.conditions.length !== 1) return null;
  const v = p.variants.filter((x) => x.inStock).sort((a, b) => a.price - b.price)[0];
  return v ? { condition: v.condition, storage: v.storage, ram: v.ram, price: v.price } : null;
}

/** Lowest price across new and Ex-UK stock, or null when price is on request. */
export function lowestPrice(p: Pick<Product, "priceFrom" | "refurbFrom">) {
  const prices = [p.priceFrom, p.refurbFrom].filter((n): n is number => !!n);
  return prices.length ? Math.min(...prices) : null;
}

export function familyStartingPrice(family: FamilySlug) {
  const prices = getProducts(family)
    .map(lowestPrice)
    .filter((n): n is number => n !== null);
  return prices.length ? Math.min(...prices) : null;
}

export function newestProducts(limit = 8) {
  const fresh = products.filter((p) => p.isNew && lowestPrice(p));
  const rest = products.filter((p) => !p.isNew && p.family === "iphone" && lowestPrice(p));
  return [...fresh, ...rest].slice(0, limit);
}

export function productHref(p: { family: string; slug: string }) {
  return `/${p.family}/${p.slug}`;
}

/** Compact spec rows for the compare table: the first few rows of each group. */
export function compareRows(p: Product, perGroup = 3) {
  return flattenSpecs(p.specs).flatMap((g) =>
    g.rows.slice(0, perGroup).map((r) => ({ key: `${g.group} · ${r.label}`, group: g.group, label: r.label, value: r.value })),
  );
}

/* ---------- formatting ---------- */

export function formatKsh(n: number) {
  return `KSh ${Math.round(n).toLocaleString("en-KE")}`;
}

export function storageLabel(gb: number) {
  return gb >= 1000 ? `${gb / 1000}TB` : `${gb}GB`;
}

export function conditionLabel(c: Condition) {
  return c === "refurb" ? "Ex-UK" : "New";
}

/* ---------- specs ---------- */

export type SpecGroup = { group: string; rows: { label: string; value: string }[] };

const LABELS: Record<string, string> = {
  soc: "Chip",
  mp: "Megapixels",
  ois: "Optical image stabilisation",
  af: "Autofocus",
  uwb: "Ultra Wideband",
  nfc: "NFC",
  usb: "USB",
  wifi: "Wi-Fi",
  os: "Software",
  sim: "SIM",
  ppi: "Pixel density (ppi)",
  hdr: "HDR",
  d_mm: "Depth (mm)",
  h_mm: "Height (mm)",
  w_mm: "Width (mm)",
  weight_g: "Weight (g)",
  size_in: "Size (inches)",
  refresh_hz: "Refresh rate (Hz)",
  capacity_mah: "Capacity (mAh)",
  qi2_w: "Qi2 (W)",
  magsafe_w: "MagSafe (W)",
  "5g": "5G",
  lte: "LTE",
};

function humanize(key: string) {
  if (LABELS[key]) return LABELS[key];
  const s = key.replace(/_/g, " ").replace(/\b(fps)\b/g, "FPS");
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatValue(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (Array.isArray(v)) {
    if (v.every((x) => typeof x !== "object")) {
      const uniq = [...new Set(v.map(String))];
      return uniq.join(", ");
    }
    return v.map(formatValue).filter(Boolean).join(" · ");
  }
  if (typeof v === "object") {
    return Object.entries(v as Record<string, unknown>)
      .map(([k, x]) => {
        const val = formatValue(x);
        if (!val) return "";
        return x === true ? humanize(k) : `${humanize(k)}: ${val}`;
      })
      .filter(Boolean)
      .join(" · ");
  }
  return String(v);
}

/** Turns the nested spec object into display groups of label/value rows. */
export function flattenSpecs(specs: Record<string, unknown>): SpecGroup[] {
  const groups: SpecGroup[] = [];
  for (const [group, value] of Object.entries(specs)) {
    if (group === "colors") continue;
    const rows: SpecGroup["rows"] = [];
    if (Array.isArray(value) && value.some((x) => typeof x === "object")) {
      value.forEach((item, i) => {
        const o = item as Record<string, unknown>;
        const label = typeof o.type === "string" ? humanize(o.type) : `#${i + 1}`;
        const rest = Object.fromEntries(Object.entries(o).filter(([k]) => k !== "type"));
        rows.push({ label, value: formatValue(rest) });
      });
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
        const val = formatValue(v);
        if (val) rows.push({ label: humanize(k), value: val });
      }
    } else {
      const val = formatValue(value);
      if (val) rows.push({ label: humanize(group), value: val });
    }
    if (rows.length) groups.push({ group: humanize(group), rows });
  }
  return groups;
}
