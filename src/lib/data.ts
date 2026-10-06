export type Accountant = {
  id: string;
  name: string;
  firm: string;
  initials: string;
  photo: string;
  rating: number;
  reviews: number;
  verified: boolean;
  specialties: string[];
  address: string;
  lng: number;
  lat: number;
  nextSlot: string;
  availableNow: boolean;
  hours: string;
  bio: string;
};

/** Base coordinates (Algiers centre) used when geolocation is unavailable. */
export const FALLBACK_CENTER = { lng: 3.0588, lat: 36.7538 };

export const ACCOUNTANTS: Accountant[] = [
  {
    id: "el-amel",
    name: "Nadia Belkacem",
    firm: "Cabinet El Amel",
    initials: "NB",
    photo:
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200&q=80&auto=format&fit=crop&crop=faces",
    rating: 4.9,
    reviews: 214,
    verified: true,
    specialties: ["VAT & IRG", "Freelancers", "Micro-enterprise"],
    address: "12 Rue Didouche Mourad",
    lng: 3.0555,
    lat: 36.7595,
    nextSlot: "Today · 16:30",
    availableNow: true,
    hours: "Sun–Thu · 08:30 – 17:00",
    bio: "Chartered accountant focused on freelancers and micro-enterprises. Fast turnaround on quarterly VAT filings.",
  },
  {
    id: "meziane",
    name: "Yacine Meziane",
    firm: "Meziane & Associés",
    initials: "YM",
    photo:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80&auto=format&fit=crop&crop=faces",
    rating: 4.7,
    reviews: 168,
    verified: true,
    specialties: ["Corporate tax", "Payroll", "Audit"],
    address: "45 Boulevard Zighoud Youcef",
    lng: 3.0641,
    lat: 36.7712,
    nextSlot: "Tomorrow · 09:00",
    availableNow: false,
    hours: "Sun–Thu · 09:00 – 18:00",
    bio: "Full-service practice for SMEs. Payroll, statutory accounts and year-end audit support.",
  },
  {
    id: "hadj-fisc",
    name: "Amina Hadj",
    firm: "Hadj Fiscalité",
    initials: "AH",
    photo:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&q=80&auto=format&fit=crop&crop=faces",
    rating: 5,
    reviews: 92,
    verified: true,
    specialties: ["Tax advisory", "E-commerce", "Import/Export"],
    address: "3 Rue Hassiba Ben Bouali",
    lng: 3.0498,
    lat: 36.7481,
    nextSlot: "Today · 18:00",
    availableNow: true,
    hours: "Sat–Thu · 08:00 – 16:30",
    bio: "Advisory-first practice specialised in cross-border e-commerce and customs documentation.",
  },
  {
    id: "nord-conseil",
    name: "Karim Saïdi",
    firm: "Nord Conseil",
    initials: "KS",
    photo:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&q=80&auto=format&fit=crop&crop=faces",
    rating: 4.6,
    reviews: 341,
    verified: false,
    specialties: ["Bookkeeping", "Invoicing", "VAT"],
    address: "78 Rue de Tripoli, Hussein Dey",
    lng: 3.0912,
    lat: 36.7395,
    nextSlot: "Wed · 11:30",
    availableNow: false,
    hours: "Sun–Thu · 08:30 – 17:30",
    bio: "High-volume bookkeeping team. Ideal if you send large batches of receipts every month.",
  },
  {
    id: "atlas-audit",
    name: "Sofia Rahmani",
    firm: "Atlas Audit",
    initials: "SR",
    photo:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80&auto=format&fit=crop&crop=faces",
    rating: 4.8,
    reviews: 127,
    verified: true,
    specialties: ["Audit", "Corporate tax", "Grants"],
    address: "9 Chemin Sidi Yahia, Hydra",
    lng: 3.0325,
    lat: 36.7431,
    nextSlot: "Today · 15:00",
    availableNow: true,
    hours: "Sun–Thu · 09:00 – 17:00",
    bio: "Boutique audit firm. Works with scale-ups preparing for funding or public grants.",
  },
  {
    id: "cap-fiscal",
    name: "Omar Benali",
    firm: "Cap Fiscal",
    initials: "OB",
    photo:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80&auto=format&fit=crop&crop=faces",
    rating: 4.4,
    reviews: 58,
    verified: false,
    specialties: ["Freelancers", "Declarations"],
    address: "22 Rue Mohamed Belouizdad",
    lng: 3.0748,
    lat: 36.7524,
    nextSlot: "Thu · 14:00",
    availableNow: false,
    hours: "Sun–Thu · 08:00 – 16:00",
    bio: "Straightforward declaration filing for independent professionals and small retailers.",
  },
  {
    id: "orbis",
    name: "Lina Cherif",
    firm: "Orbis Compta",
    initials: "LC",
    photo:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80&auto=format&fit=crop&crop=faces",
    rating: 4.9,
    reviews: 203,
    verified: true,
    specialties: ["Startups", "Equity", "Payroll"],
    address: "5 Rue Larbi Ben M'hidi",
    lng: 3.0602,
    lat: 36.7827,
    nextSlot: "Tomorrow · 10:30",
    availableNow: false,
    hours: "Sun–Thu · 09:30 – 18:30",
    bio: "Startup-focused practice. Cap tables, payroll and monthly management accounts.",
  },
  {
    id: "sahel",
    name: "Réda Ouali",
    firm: "Sahel Gestion",
    initials: "RO",
    photo:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80&auto=format&fit=crop&crop=faces",
    rating: 4.5,
    reviews: 76,
    verified: true,
    specialties: ["Retail", "Stock", "VAT"],
    address: "31 Route de Ouled Fayet",
    lng: 2.9985,
    lat: 36.7538,
    nextSlot: "Today · 17:15",
    availableNow: true,
    hours: "Sat–Thu · 08:00 – 17:00",
    bio: "Retail and stock accounting, with in-person receipt drop-off if you prefer paper.",
  },
];

export type DocCategory =
  | "Invoice"
  | "Receipt"
  | "Payroll"
  | "Tax form"
  | "Contract";

export type Doc = {
  id: string;
  merchant: string;
  amount: number;
  date: string;
  category: DocCategory;
  status: "stored" | "sent" | "pending";
  pages: number;
  tint: string;
};

export const DOCUMENTS: Doc[] = [
  { id: "d1", merchant: "Numidis Wholesale", amount: 1289.4, date: "20 Mar", category: "Invoice", status: "sent", pages: 2, tint: "from-[#EAF7EE] to-[#D8EEDF]" },
  { id: "d2", merchant: "Sonelgaz", amount: 184.2, date: "18 Mar", category: "Receipt", status: "stored", pages: 1, tint: "from-[#FFF7DA] to-[#F6EAB6]" },
  { id: "d3", merchant: "Atelier Rive", amount: 640, date: "17 Mar", category: "Invoice", status: "pending", pages: 3, tint: "from-[#EDEFFB] to-[#DCE0F5]" },
  { id: "d4", merchant: "Payroll · March", amount: 3120, date: "15 Mar", category: "Payroll", status: "sent", pages: 4, tint: "from-[#F5EDF8] to-[#E7D9EE]" },
  { id: "d5", merchant: "G50 Declaration", amount: 0, date: "12 Mar", category: "Tax form", status: "stored", pages: 6, tint: "from-[#FDEDE8] to-[#F6DACF]" },
  { id: "d6", merchant: "Café Tantonville", amount: 42.5, date: "11 Mar", category: "Receipt", status: "stored", pages: 1, tint: "from-[#EAF4F8] to-[#D6E8F1]" },
  { id: "d7", merchant: "Studio Lumen", amount: 890, date: "09 Mar", category: "Contract", status: "sent", pages: 8, tint: "from-[#F1F2ED] to-[#E1E3DA]" },
  { id: "d8", merchant: "Djezzy Business", amount: 76.9, date: "05 Mar", category: "Receipt", status: "stored", pages: 1, tint: "from-[#FFF2F2] to-[#F5DEDE]" },
];

export type Activity = {
  id: string;
  title: string;
  sub: string;
  amount: number;
  date: string;
  time: string;
  kind: "purchase" | "document" | "appointment" | "refund";
  status: string;
};

export const ACTIVITY: Activity[] = [
  { id: "a1", title: "Numidis Wholesale", sub: "Purchase · Supplies", amount: -1289.4, date: "Today", time: "14:20", kind: "purchase", status: "Invoice attached" },
  { id: "a2", title: "Sent to Cabinet El Amel", sub: "4 documents", amount: 0, date: "Today", time: "11:05", kind: "document", status: "Delivered" },
  { id: "a3", title: "Appointment confirmed", sub: "Nadia Belkacem · 16:30", amount: 0, date: "Today", time: "09:42", kind: "appointment", status: "Confirmed" },
  { id: "a4", title: "Sonelgaz", sub: "Purchase · Utilities", amount: -184.2, date: "Yesterday", time: "18:30", kind: "purchase", status: "Receipt stored" },
  { id: "a5", title: "VAT credit", sub: "Tax office · Q4", amount: 2045, date: "Yesterday", time: "10:12", kind: "refund", status: "Received" },
  { id: "a6", title: "Atelier Rive", sub: "Purchase · Subcontracting", amount: -640, date: "17 Mar", time: "16:55", kind: "purchase", status: "Pending review" },
  { id: "a7", title: "Café Tantonville", sub: "Purchase · Meals", amount: -42.5, date: "11 Mar", time: "13:04", kind: "purchase", status: "Receipt stored" },
];

export const SERIES: Record<string, { label: string; value: number }[]> = {
  "1W": [
    { label: "M", value: 210 }, { label: "T", value: 380 }, { label: "W", value: 290 },
    { label: "T", value: 640 }, { label: "F", value: 420 }, { label: "S", value: 180 }, { label: "S", value: 96 },
  ],
  "1M": [
    { label: "W1", value: 1180 }, { label: "W2", value: 1640 }, { label: "W3", value: 980 }, { label: "W4", value: 1020 },
  ],
  "4M": [
    { label: "Dec", value: 3420 }, { label: "Jan", value: 4180 }, { label: "Feb", value: 3760 }, { label: "Mar", value: 4820 },
  ],
  "1Y": [
    { label: "Apr", value: 2980 }, { label: "May", value: 3240 }, { label: "Jun", value: 2760 },
    { label: "Jul", value: 3890 }, { label: "Aug", value: 3120 }, { label: "Sep", value: 4010 },
    { label: "Oct", value: 3580 }, { label: "Nov", value: 4290 }, { label: "Dec", value: 3420 },
    { label: "Jan", value: 4180 }, { label: "Feb", value: 3760 }, { label: "Mar", value: 4820 },
  ],
  ALL: [
    { label: "2022", value: 28400 }, { label: "2023", value: 36900 },
    { label: "2024", value: 41200 }, { label: "2025", value: 46800 },
  ],
};

export const CATEGORIES = [
  { name: "Supplies", value: 1840, share: 38 },
  { name: "Utilities", value: 920, share: 19 },
  { name: "Subcontracting", value: 780, share: 16 },
  { name: "Meals", value: 540, share: 11 },
  { name: "Transport", value: 430, share: 9 },
  { name: "Other", value: 310, share: 7 },
];

export const eur = (n: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(n);

/** Documents captured per weekday — used by the cadence bar chart. */
export const CADENCE = [
  { label: "Mon", value: 6 },
  { label: "Tue", value: 11 },
  { label: "Wed", value: 8 },
  { label: "Thu", value: 14 },
  { label: "Fri", value: 9 },
  { label: "Sat", value: 4 },
  { label: "Sun", value: 2 },
];

/** 14 weeks × 7 days of capture intensity for the consistency heatmap. */
export const HEATMAP: number[] = Array.from({ length: 98 }, (_, i) => {
  const wave = Math.sin(i / 6) * 0.5 + 0.5;
  const noise = ((i * 37) % 11) / 11;
  return Math.round((wave * 0.65 + noise * 0.35) * 6);
});

export const KPIS = [
  { label: "Deductible", value: 1840, hint: "+12% vs Feb", trend: 12 },
  { label: "VAT credit", value: 612.4, hint: "3 invoices", trend: 5 },
  { label: "Avg / doc", value: 268.3, hint: "18 documents", trend: -4 },
];
