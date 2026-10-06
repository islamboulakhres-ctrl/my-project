import { FALLBACK_CENTER } from "./data";

export type PracticeProfile = {
  name: string;
  firm: string;
  photo: string | null;
  bio: string;
  specialties: string[];
  languages: string[];
  price: number;
  pricing: "Per hour" | "Per filing" | "Monthly retainer";
  freeIntro: boolean;
  days: string[];
  slots: string[];
  slotMinutes: number;
  holiday: boolean;
  holidayUntil: string;
  autoAccept: boolean;
  remote: boolean;
  homeVisits: boolean;
  maxClients: number;
  responseHours: number;
  address: string;
  lng: number;
  lat: number;
  onboarded: boolean;
};

export const DAYS = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"] as const;

export const SLOTS = [
  "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00",
] as const;

export const SPECIALTIES = [
  "VAT & IRG", "Corporate tax", "Payroll", "Audit", "Freelancers",
  "Micro-enterprise", "E-commerce", "Import/Export", "Bookkeeping", "Startups",
] as const;

export const LANGUAGES = ["Arabic", "French", "English", "Tamazight"] as const;

export const DEFAULT_PROFILE: PracticeProfile = {
  name: "",
  firm: "",
  photo: null,
  bio: "",
  specialties: ["VAT & IRG", "Freelancers"],
  languages: ["Arabic", "French"],
  price: 2500,
  pricing: "Per filing",
  freeIntro: true,
  days: ["Sun", "Mon", "Tue", "Wed", "Thu"],
  slots: ["09:00", "10:00", "11:00", "14:00", "15:00"],
  slotMinutes: 45,
  holiday: false,
  holidayUntil: "",
  autoAccept: false,
  remote: true,
  homeVisits: false,
  maxClients: 25,
  responseHours: 4,
  address: "Alger Centre",
  lng: FALLBACK_CENTER.lng,
  lat: FALLBACK_CENTER.lat,
  onboarded: false,
};

const KEY = "fisco.practice";

export function readProfile(): PracticeProfile {
  if (typeof window === "undefined") return DEFAULT_PROFILE;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
  return DEFAULT_PROFILE;
}

export function writeProfile(p: PracticeProfile) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}

export const dzd = (n: number) =>
  `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(n)} DA`;
