/**
 * Business WhatsApp number. 0-prefix Nigerian numbers are converted to 234.
 */
const WHATSAPP_NUMBER = "08033298274";
const PRODUCTION_URL = "https://eatritewithlulu.com";

function firstValidUrl(...candidates: (string | undefined)[]) {
  for (const candidate of candidates) {
    const value = candidate?.trim().replace(/\/$/, "");
    if (!value) continue;
    const href = /^https?:\/\//i.test(value) ? value : `https://${value}`;
    try {
      const url = new URL(href);
      if (url.protocol === "http:" || url.protocol === "https:") {
        return url.origin;
      }
    } catch {
      // Try the next candidate.
    }
  }
  return PRODUCTION_URL;
}

export function getSiteUrl() {
  return firstValidUrl(
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_URL,
    process.env.NODE_ENV === "production" ? PRODUCTION_URL : "http://localhost:3000",
  );
}

export const siteConfig = {
  name: "EatriteWithLulu",
  tagline: "Healthy Meals Made Simple",
  title: "EatriteWithLulu — Healthy Meals Made Simple",
  description:
    "Healthy, delicious and convenient meal plans designed to make eating better easier. Choose your plan and get started with EatriteWithLulu.",
  url: getSiteUrl(),
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || WHATSAPP_NUMBER,
} as const;
