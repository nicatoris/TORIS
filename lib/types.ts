export type DrinkType = "extract" | "leaf";

export interface Drink {
  /** Stable unique id */
  id: string;
  /** What was consumed */
  type: DrinkType;
  /** Local calendar day key: YYYY-MM-DD */
  date: string;
  /** Epoch ms of when the entry was logged */
  createdAt: number;
  /** Optional free-form note */
  note?: string;
  /** Mitragynine extract dose in mg (extract drinks only) */
  mg?: number;
}

export interface Schedule {
  /** Number of no-kratom days required before the next drink is "allowed" */
  daysOff: number;
  /** Epoch ms the schedule was created / last edited */
  createdAt: number;
  /** Whether to fire a local notification when the user becomes eligible */
  notifyEnabled: boolean;
  /** Daily extract limit in mg; 0 / undefined means no limit */
  mgLimit?: number;
}

/** Quick-pick extract doses shown when logging. */
export const EXTRACT_MG_PRESETS = [30, 50, 100];

export interface PersistedState {
  drinks: Drink[];
  schedule: Schedule | null;
  /** medalId -> epoch ms first earned */
  earnedMedals: Record<string, number>;
  hasOnboarded: boolean;
}

export const DRINK_META: Record<
  DrinkType,
  { label: string; emoji: string; blurb: string }
> = {
  extract: {
    label: "Extract",
    emoji: "🧪",
    blurb: "Concentrated mitragynine extract",
  },
  leaf: {
    label: "Leaf Tea",
    emoji: "🍵",
    blurb: "Brewed kratom leaf tea",
  },
};
