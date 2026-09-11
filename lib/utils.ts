export function formatDate(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return value.toString();
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function addDays(start: Date, days: number) {
  const next = new Date(start);
  next.setDate(next.getDate() + days);
  return next;
}

export function toDateInput(value: Date) {
  return value.toISOString().slice(0, 10);
}

export function isActiveSubscription(
  status: string,
  endDate: string,
  today = new Date(),
) {
  if (status !== "active") return false;
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  return end >= today;
}

export function safeNextPath(
  value: string | null | undefined,
  fallback = "/account",
) {
  if (!value) return fallback;
  if (!value.startsWith("/") || value.startsWith("//")) return fallback;
  return value;
}
