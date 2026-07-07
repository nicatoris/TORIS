import { Drink, Schedule } from "./types";
import { addDays, daysBetween, todayKey } from "./dates";

export interface Stats {
  /** Whether any drinks have ever been logged */
  hasData: boolean;
  /** Unique sorted day keys the user consumed kratom (ascending) */
  drinkDays: string[];
  /** Most recent consumption day key, or null */
  lastDrinkDay: string | null;
  /** Whole no-kratom days since the last drink (0 if drank today) */
  daysSinceLast: number;
  /** Current ongoing no-kratom streak (== daysSinceLast) */
  currentStreak: number;
  /** Longest no-kratom streak ever recorded (including the ongoing one) */
  longestStreak: number;
  /** Number of times the user set a new personal-best streak (>=3) */
  recordsBroken: number;
  /** Completed schedule cycles honored (only when a schedule exists) */
  scheduleSuccesses: number;
  /** Schedule-derived eligibility */
  canDrink: boolean;
  /** Day key the user becomes eligible again, or null when already eligible */
  nextEligibleDay: string | null;
  /** Days remaining until eligible (0 when eligible) */
  daysUntilEligible: number;
}

export const STREAK_MILESTONES: { days: number; name: string }[] = [
  { days: 3, name: "Fresh Start" },
  { days: 7, name: "Clear Week" },
  { days: 14, name: "Fortnight Free" },
  { days: 30, name: "Full Moon" },
  { days: 90, name: "Turned Season" },
];

/** The next streak milestone above `current`, or null once all are cleared. */
export function nextMilestone(current: number) {
  return STREAK_MILESTONES.find((m) => m.days > current) ?? null;
}

/** Distinct, ascending list of local day keys that have at least one drink. */
export function uniqueDrinkDays(drinks: Drink[]): string[] {
  const set = new Set(drinks.map((d) => d.date));
  return [...set].sort();
}

/**
 * Compute all derived tracking numbers from raw drinks + schedule. Everything
 * is a pure function of persisted data so the UI never drifts out of sync.
 */
export function computeStats(drinks: Drink[], schedule: Schedule | null): Stats {
  const today = todayKey();
  const drinkDays = uniqueDrinkDays(drinks);
  const hasData = drinkDays.length > 0;
  const lastDrinkDay = hasData ? drinkDays[drinkDays.length - 1] : null;

  // No-kratom "off streaks": the completed gaps between consecutive drink days
  // plus the ongoing gap from the last drink until today.
  const offStreaks: number[] = [];
  for (let i = 1; i < drinkDays.length; i++) {
    // Days with no kratom strictly between two drink days.
    offStreaks.push(daysBetween(drinkDays[i], drinkDays[i - 1]) - 1);
  }
  const ongoing = lastDrinkDay
    ? Math.max(0, daysBetween(today, lastDrinkDay))
    : 0;

  const daysSinceLast = ongoing;
  const currentStreak = ongoing;

  const allStreaks = [...offStreaks, ongoing];
  const longestStreak = allStreaks.length ? Math.max(...allStreaks) : 0;

  // Records broken: walk streaks chronologically; count each time a new value
  // strictly beats the running best once a meaningful best (>=3) exists.
  let runningMax = 0;
  let recordsBroken = 0;
  for (const s of allStreaks) {
    if (runningMax >= 3 && s > runningMax) recordsBroken++;
    if (s > runningMax) runningMax = s;
  }

  // Schedule honored cycles: completed gaps that met the required days off.
  let scheduleSuccesses = 0;
  if (schedule && schedule.daysOff > 0) {
    for (const off of offStreaks) {
      if (off >= schedule.daysOff) scheduleSuccesses++;
    }
  }

  // Eligibility
  let canDrink = true;
  let nextEligibleDay: string | null = null;
  let daysUntilEligible = 0;
  if (schedule && schedule.daysOff > 0 && lastDrinkDay) {
    const eligibleOn = addDays(lastDrinkDay, schedule.daysOff);
    const remaining = daysBetween(eligibleOn, today);
    if (remaining > 0) {
      canDrink = false;
      nextEligibleDay = eligibleOn;
      daysUntilEligible = remaining;
    }
  }

  return {
    hasData,
    drinkDays,
    lastDrinkDay,
    daysSinceLast,
    currentStreak,
    longestStreak,
    recordsBroken,
    scheduleSuccesses,
    canDrink,
    nextEligibleDay,
    daysUntilEligible,
  };
}
