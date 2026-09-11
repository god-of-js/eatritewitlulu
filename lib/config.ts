/**
 * Business WhatsApp number. 0-prefix Nigerian numbers are converted to 234.
 */
const WHATSAPP_NUMBER = "08033298274";

export const siteConfig = {
  name: "EatriteWithLulu",
  tagline: "Healthy Meals Made Simple",
  title: "EatriteWithLulu — Healthy Meals Made Simple",
  description:
    "Healthy, delicious and convenient meal plans designed to make eating better easier. Choose your plan and get started with EatriteWithLulu.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://eatritewithlulu.com",
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || WHATSAPP_NUMBER,
} as const;

export function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}
