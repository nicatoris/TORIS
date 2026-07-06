import { Stats } from "./stats";

export type MedalTier = "bronze" | "silver" | "gold" | "platinum";

export interface MedalContext {
  stats: Stats;
  hasSchedule: boolean;
}

export interface MedalDef {
  id: string;
  title: string;
  description: string;
  emoji: string;
  tier: MedalTier;
  /** Which of the three reward themes this medal belongs to */
  group: "streak" | "record" | "schedule";
  isEarned: (c: MedalContext) => boolean;
  /** Progress toward earning, for the "not yet" state */
  progress: (c: MedalContext) => { current: number; target: number };
}

export const TIER_META: Record<
  MedalTier,
  { label: string; ring: string; text: string; glow: string }
> = {
  bronze: { label: "Bronze", ring: "#B45309", text: "#FCD9A8", glow: "#F59E0B" },
  silver: { label: "Silver", ring: "#94A3B8", text: "#E2E8F0", glow: "#CBD5E1" },
  gold: { label: "Gold", ring: "#EAB308", text: "#FDE68A", glow: "#FCD34D" },
  platinum: { label: "Platinum", ring: "#22D3EE", text: "#CFFAFE", glow: "#67E8F9" },
};

const streakMedal = (
  id: string,
  title: string,
  emoji: string,
  tier: MedalTier,
  target: number,
): MedalDef => ({
  id,
  title,
  description: `Reach a ${target}-day no-kratom streak`,
  emoji,
  tier,
  group: "streak",
  isEarned: (c) => c.stats.longestStreak >= target,
  progress: (c) => ({ current: Math.min(c.stats.longestStreak, target), target }),
});

const scheduleMedal = (
  id: string,
  title: string,
  emoji: string,
  tier: MedalTier,
  target: number,
): MedalDef => ({
  id,
  title,
  description: `Honor your Safe Schedule ${target}${target === 1 ? " time" : " times"}`,
  emoji,
  tier,
  group: "schedule",
  isEarned: (c) => c.hasSchedule && c.stats.scheduleSuccesses >= target,
  progress: (c) => ({
    current: Math.min(c.stats.scheduleSuccesses, target),
    target,
  }),
});

/** The full medal catalog, ordered for display. */
export const MEDALS: MedalDef[] = [
  streakMedal("fresh_start", "Fresh Start", "🌱", "bronze", 3),
  streakMedal("clear_week", "Clear Week", "🌿", "silver", 7),
  streakMedal("fortnight", "Fortnight Free", "🍃", "silver", 14),
  streakMedal("full_moon", "Full Moon", "🌕", "gold", 30),
  streakMedal("season", "Turned Season", "🏔️", "platinum", 90),
  {
    id: "record_breaker",
    title: "Record Breaker",
    description: "Beat your previous best streak",
    emoji: "🚀",
    tier: "gold",
    group: "record",
    isEarned: (c) => c.stats.recordsBroken >= 1,
    progress: (c) => ({ current: Math.min(c.stats.recordsBroken, 1), target: 1 }),
  },
  {
    id: "relentless",
    title: "Relentless",
    description: "Set 3 new personal-best streaks",
    emoji: "🏆",
    tier: "platinum",
    group: "record",
    isEarned: (c) => c.stats.recordsBroken >= 3,
    progress: (c) => ({ current: Math.min(c.stats.recordsBroken, 3), target: 3 }),
  },
  scheduleMedal("disciplined", "Disciplined", "🎯", "bronze", 1),
  scheduleMedal("consistent", "Consistent", "⚖️", "silver", 5),
  scheduleMedal("iron_will", "Iron Will", "🛡️", "gold", 10),
];

export interface EvaluatedMedal extends MedalDef {
  earned: boolean;
  earnedAt: number | null;
  current: number;
  target: number;
}

/** Evaluate every medal against current context + when-earned timestamps. */
export function evaluateMedals(
  ctx: MedalContext,
  earnedMedals: Record<string, number>,
): EvaluatedMedal[] {
  return MEDALS.map((m) => {
    const earned = m.isEarned(ctx);
    const { current, target } = m.progress(ctx);
    return {
      ...m,
      earned,
      earnedAt: earnedMedals[m.id] ?? null,
      current,
      target,
    };
  });
}

/** Ids of every medal currently satisfied by the context. */
export function earnedMedalIds(ctx: MedalContext): string[] {
  return MEDALS.filter((m) => m.isEarned(ctx)).map((m) => m.id);
}
