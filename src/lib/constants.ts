export const PAGE_SIZE = 9;

export const CATEGORIES = [
  "seo",
  "social-media",
  "content-marketing",
  "ppc",
  "analytics",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABELS: Record<Category, string> = {
  seo: "SEO",
  "social-media": "Social",
  "content-marketing": "Content",
  ppc: "PPC",
  analytics: "Analytics",
};

export const CATEGORY_DESCRIPTIONS: Record<Category, string> = {
  seo: "Search engine optimization strategies, techniques, and best practices.",
  "social-media": "Social media marketing tips and strategies for every platform.",
  "content-marketing": "Content marketing insights to attract and engage your audience.",
  ppc: "Pay-per-click advertising guides to maximize your ad spend.",
  analytics: "Marketing analytics and data-driven decision making.",
};

export function slugify(s: string): string {
  return s.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}
