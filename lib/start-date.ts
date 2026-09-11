const LAGOS = "Africa/Lagos";
const CUTOFF_HOUR = 22;

type LagosDate = {
  year: number;
  month: number;
  day: number;
};

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function lagosNow(now: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: LAGOS,
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  const weekday = get("weekday");
  const dayIndex = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(
    weekday,
  );

  return {
    dayIndex,
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    hour: Number(get("hour")),
    afterCutoff: Number(get("hour")) >= CUTOFF_HOUR,
  };
}

function addCalendarDays(date: LagosDate, days: number): LagosDate {
  const next = new Date(Date.UTC(date.year, date.month - 1, date.day + days));
  return {
    year: next.getUTCFullYear(),
    month: next.getUTCMonth() + 1,
    day: next.getUTCDate(),
  };
}

export function toDateInputFromParts(date: LagosDate) {
  return `${date.year}-${pad(date.month)}-${pad(date.day)}`;
}

export function addDaysToDateInput(value: string, days: number) {
  const [year, month, day] = value.split("-").map(Number);
  return toDateInputFromParts(addCalendarDays({ year, month, day }, days));
}

/**
 * Kitchen runs weekdays only. Orders at or after 10pm Lagos miss the next day.
 * Mon–Wed: before 10pm → next weekday; after 10pm → skip a day.
 * Thu after 10pm, Fri, and Sat → Monday.
 * Sun before 10pm → Monday; after 10pm → Tuesday.
 */
export function getPlanStartDateInput(now = new Date()) {
  const lagos = lagosNow(now);
  let offset = 1;

  switch (lagos.dayIndex) {
    case 1:
    case 2:
    case 3:
      offset = lagos.afterCutoff ? 2 : 1;
      break;
    case 4:
      offset = lagos.afterCutoff ? 4 : 1;
      break;
    case 5:
      offset = 3;
      break;
    case 6:
      offset = 2;
      break;
    case 0:
    default:
      offset = lagos.afterCutoff ? 2 : 1;
      break;
  }

  return toDateInputFromParts(addCalendarDays(lagos, offset));
}

export function formatLagosDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("en-NG", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: LAGOS,
  }).format(new Date(Date.UTC(year, month - 1, day, 12)));
}
