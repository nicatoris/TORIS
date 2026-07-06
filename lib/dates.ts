/**
 * Date helpers that operate purely on *local* calendar days so a drink logged
 * at 11pm and one logged at 1am the next morning land on different days,
 * matching the user's lived experience. Day keys are `YYYY-MM-DD` strings.
 */

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Local YYYY-MM-DD key for a Date (defaults to now). */
export function dayKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Parse a YYYY-MM-DD key into a Date at local midnight. */
export function fromDayKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

/** Local midnight Date for a given day (defaults to today). */
export function startOfDay(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Whole-day difference `a - b` using local midnights (a later => positive). */
export function daysBetween(aKey: string, bKey: string): number {
  const a = fromDayKey(aKey).getTime();
  const b = fromDayKey(bKey).getTime();
  return Math.round((a - b) / MS_PER_DAY);
}

/** Add N days to a day key, returning a new key. */
export function addDays(key: string, n: number): string {
  const d = fromDayKey(key);
  d.setDate(d.getDate() + n);
  return dayKey(d);
}

/** Today's day key. */
export function todayKey(): string {
  return dayKey();
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** e.g. "Mon, Jul 6" */
export function formatShort(key: string): string {
  const d = fromDayKey(key);
  return `${WEEKDAYS[d.getDay()]}, ${MONTHS[d.getMonth()].slice(0, 3)} ${d.getDate()}`;
}

/** e.g. "July 6, 2026" */
export function formatLong(key: string): string {
  const d = fromDayKey(key);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

/** Human relative label for a day key vs today. */
export function relativeLabel(key: string): string {
  const diff = daysBetween(todayKey(), key);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff === -1) return "Tomorrow";
  if (diff > 1) return `${diff} days ago`;
  return `in ${Math.abs(diff)} days`;
}

export { MONTHS, WEEKDAYS, MS_PER_DAY };
