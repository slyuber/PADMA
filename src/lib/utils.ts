export function fmt(n: number): string {
  return n.toLocaleString("en-CA", { maximumFractionDigits: 0 });
}

export function fmtDollars(n: number): string {
  return "$" + n.toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function fmtPct(n: number): string {
  return (n * 100).toFixed(1) + "%";
}

export function fmtK(n: number): string {
  if (n >= 1000) return "$" + (n / 1000).toFixed(1) + "k";
  return fmtDollars(n);
}

export function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export const CHART_COLORS = {
  green: "#2d6a4f",
  greenLight: "#40916c",
  greenPale: "#95d5b2",
  gold: "#b08600",
  goldLight: "#d4a72c",
  chili: "#c1121f",
  jade: "#0f766e",
  jadeLight: "#14b8a6",
  charcoal: "#44403c",
  muted: "#a8a29e",
  rice: "#faf6f0",
} as const;

export const CATEGORY_COLORS: Record<string, string> = {
  "Starters": "#40916c",
  "Soups": "#14b8a6",
  "Veggie & Tofu": "#2d6a4f",
  "Plant-Based Meat": "#c1121f",
  "Rice & Noodles": "#d4a72c",
  "Sides": "#a8a29e",
  "Lunch Special": "#b08600",
  "Coffee": "#78350f",
  "Tea": "#6d6024",
  "Drinks": "#0f766e",
  "Desserts": "#9f1239",
  "Extras": "#78716c",
};

export function dayOfWeekShort(dateStr: string): string {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("en-CA", { weekday: "short" });
}
