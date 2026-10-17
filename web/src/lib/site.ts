export const SITE = {
  name: "Prime Tech Kenya",
  shortName: "Prime Tech",
  url: "https://primetech.ke",
  phone: "+254 703 829 443",
  phoneHref: "tel:+254703829443",
  whatsapp: "254703829443",
  email: "primetechke21@gmail.com",
  address: {
    line1: "Norwich Union House, 4th Floor, Suite 15",
    line2: "Mama Ngina Street (opposite Hilton Hotel)",
    city: "Nairobi, Kenya",
  },
  mapQuery: "Norwich Union House, Mama Ngina Street, Nairobi",
  hours: [
    { days: "Monday – Saturday", time: "9am – 7pm" },
    { days: "Sundays & public holidays", time: "11am – 5pm" },
  ],
  established: 2020,
  freeDeliveryThreshold: 50000,
  deliveryAreas: "Nairobi Metropolitan Area, Nakuru, Mombasa, and countrywide courier delivery.",
};

/** Lipa Pole Pole terms used by every calculator on the site. */
export const FINANCE = {
  depositRate: 0.4,
  minPrice: 30000,
  terms: [3, 6, 9, 12],
  defaultTerm: 12,
};

export function financePlan(price: number, months = FINANCE.defaultTerm) {
  const deposit = Math.round(price * FINANCE.depositRate);
  const balance = price - deposit;
  return { deposit, balance, monthly: Math.ceil(balance / months), months };
}

export function whatsappLink(message?: string) {
  const base = `https://wa.me/${SITE.whatsapp}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export const NAV_SERVICES = [
  { href: "/lipa-polepole", label: "Lipa Polepole" },
  { href: "/trade-in", label: "Trade In" },
];

export const NAV_COMPANY = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];
