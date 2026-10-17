import type { MetadataRoute } from "next";
import { FAMILIES, getProducts, productHref } from "@/lib/catalog";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/lipa-polepole", "/trade-in", "/about", "/contact", "/terms", "/privacy", "/returns"];
  return [
    ...pages.map((p) => ({ url: `${SITE.url}${p}`, changeFrequency: "weekly" as const, priority: p ? 0.7 : 1 })),
    ...FAMILIES.map((f) => ({ url: `${SITE.url}/${f.slug}`, changeFrequency: "daily" as const, priority: 0.9 })),
    ...getProducts().map((p) => ({ url: `${SITE.url}${productHref(p)}`, changeFrequency: "weekly" as const, priority: 0.8 })),
  ];
}
