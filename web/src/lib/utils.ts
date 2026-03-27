import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatPrice(amount: number, currency: string = "AED"): string {
  return `${amount.toLocaleString()} ${currency}`;
}

export function formatTimeRemaining(endTime: string): string {
  const diff = new Date(endTime).getTime() - Date.now();
  if (diff <= 0) return "ENDED";

  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  if (minutes > 60) {
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
  }

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function formatViewerCount(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

export function getCountryFlag(code: string): string {
  const flags: Record<string, string> = {
    AE: "\u{1F1E6}\u{1F1EA}",
    SA: "\u{1F1F8}\u{1F1E6}",
    QA: "\u{1F1F6}\u{1F1E6}",
    KW: "\u{1F1F0}\u{1F1FC}",
    OM: "\u{1F1F4}\u{1F1F2}",
    BH: "\u{1F1E7}\u{1F1ED}",
  };
  return flags[code] || "\u{1F30D}";
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}
