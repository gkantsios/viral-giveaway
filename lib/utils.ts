import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  // Simple className merger without clsx dep - just join and filter
  return inputs
    .flat()
    .filter(Boolean)
    .join(" ");
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function generateReferralCode(): string {
  return Math.random().toString(36).substring(2, 10);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function isGiveawayActive(giveaway: {
  status: string;
  startDate: Date | null;
  endDate: Date | null;
}): boolean {
  if (giveaway.status !== "PUBLISHED") return false;
  const now = new Date();
  if (giveaway.startDate && now < giveaway.startDate) return false;
  if (giveaway.endDate && now > giveaway.endDate) return false;
  return true;
}
