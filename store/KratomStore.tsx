import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { todayKey } from "@/lib/dates";
import { earnedMedalIds } from "@/lib/medals";
import {
  cancelEligibilityReminder,
  requestNotificationPermission,
  scheduleEligibilityReminder,
} from "@/lib/notifications";
import { computeStats, Stats } from "@/lib/stats";
import { Drink, DrinkType, PersistedState, Schedule } from "@/lib/types";

const STORAGE_KEY = "ksafe:v1";

const EMPTY: PersistedState = {
  drinks: [],
  schedule: null,
  earnedMedals: {},
  hasOnboarded: false,
};

interface KratomContextValue {
  ready: boolean;
  drinks: Drink[];
  schedule: Schedule | null;
  earnedMedals: Record<string, number>;
  stats: Stats;
  addDrink: (input: {
    type: DrinkType;
    date: string;
    note?: string;
    mg?: number;
  }) => void;
  deleteDrink: (id: string) => void;
  drinksForDay: (day: string) => Drink[];
  setSchedule: (
    daysOff: number,
    notifyEnabled: boolean,
    mgLimit?: number,
  ) => Promise<void>;
  clearSchedule: () => Promise<void>;
  toggleScheduleNotify: (enabled: boolean) => Promise<void>;
  resetAll: () => void;
}

const KratomContext = createContext<KratomContextValue | null>(null);

function makeId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function KratomProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PersistedState>(EMPTY);
  const [ready, setReady] = useState(false);
  const hydrated = useRef(false);

  // Hydrate once on mount.
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<PersistedState>;
          setState({ ...EMPTY, ...parsed });
        }
      } catch {
        // corrupt / missing store -> start fresh
      } finally {
        hydrated.current = true;
        setReady(true);
      }
    })();
  }, []);

  // Persist whenever state changes (after hydration).
  useEffect(() => {
    if (!hydrated.current) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state]);

  const stats = useMemo(
    () => computeStats(state.drinks, state.schedule),
    [state.drinks, state.schedule],
  );

  // Auto-award medals: whenever the derived context earns a medal we haven't
  // recorded yet, stamp it with the time it was earned.
  useEffect(() => {
    if (!ready) return;
    const ids = earnedMedalIds({ stats, hasSchedule: !!state.schedule });
    const missing = ids.filter((id) => !(id in state.earnedMedals));
    if (missing.length === 0) return;
    const now = Date.now();
    setState((s) => {
      const next = { ...s.earnedMedals };
      for (const id of missing) if (!(id in next)) next[id] = now;
      return { ...s, earnedMedals: next };
    });
  }, [ready, stats, state.schedule, state.earnedMedals]);

  const addDrink = useCallback(
    ({
      type,
      date,
      note,
      mg,
    }: {
      type: DrinkType;
      date: string;
      note?: string;
      mg?: number;
    }) => {
      const drink: Drink = {
        id: makeId(),
        type,
        date,
        createdAt: Date.now(),
        note: note?.trim() ? note.trim() : undefined,
        mg: type === "extract" && mg && mg > 0 ? Math.round(mg) : undefined,
      };
      setState((s) => ({
        ...s,
        hasOnboarded: true,
        drinks: [...s.drinks, drink].sort((a, b) =>
          a.date === b.date ? a.createdAt - b.createdAt : a.date < b.date ? -1 : 1,
        ),
      }));
    },
    [],
  );

  const deleteDrink = useCallback((id: string) => {
    setState((s) => ({ ...s, drinks: s.drinks.filter((d) => d.id !== id) }));
  }, []);

  const drinksForDay = useCallback(
    (day: string) => state.drinks.filter((d) => d.date === day),
    [state.drinks],
  );

  // Keep the scheduled reminder aligned with the current eligibility date.
  const syncReminder = useCallback(
    async (schedule: Schedule | null) => {
      if (schedule?.notifyEnabled) {
        const s = computeStats(state.drinks, schedule);
        await scheduleEligibilityReminder(s.nextEligibleDay);
      } else {
        await cancelEligibilityReminder();
      }
    },
    [state.drinks],
  );

  const setSchedule = useCallback(
    async (daysOff: number, notifyEnabled: boolean, mgLimit?: number) => {
      let allowNotify = notifyEnabled;
      if (notifyEnabled) {
        allowNotify = await requestNotificationPermission();
      }
      const schedule: Schedule = {
        daysOff: Math.max(1, Math.round(daysOff)),
        createdAt: Date.now(),
        notifyEnabled: allowNotify,
        mgLimit: mgLimit && mgLimit > 0 ? Math.round(mgLimit) : undefined,
      };
      setState((s) => ({ ...s, schedule }));
      await syncReminder(schedule);
    },
    [syncReminder],
  );

  const clearSchedule = useCallback(async () => {
    setState((s) => ({ ...s, schedule: null }));
    await cancelEligibilityReminder();
  }, []);

  const toggleScheduleNotify = useCallback(
    async (enabled: boolean) => {
      let allow = enabled;
      if (enabled) allow = await requestNotificationPermission();
      let updated: Schedule | null = null;
      setState((s) => {
        if (!s.schedule) return s;
        updated = { ...s.schedule, notifyEnabled: allow };
        return { ...s, schedule: updated };
      });
      await syncReminder(updated);
    },
    [syncReminder],
  );

  const resetAll = useCallback(() => {
    setState(EMPTY);
    cancelEligibilityReminder().catch(() => {});
  }, []);

  // Re-sync reminders whenever drinks change and a notifying schedule exists,
  // so logging a drink pushes the reminder out to the new eligible date.
  useEffect(() => {
    if (!ready) return;
    if (state.schedule?.notifyEnabled) {
      scheduleEligibilityReminder(stats.nextEligibleDay).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, stats.nextEligibleDay, state.schedule?.notifyEnabled]);

  const value: KratomContextValue = {
    ready,
    drinks: state.drinks,
    schedule: state.schedule,
    earnedMedals: state.earnedMedals,
    stats,
    addDrink,
    deleteDrink,
    drinksForDay,
    setSchedule,
    clearSchedule,
    toggleScheduleNotify,
    resetAll,
  };

  return (
    <KratomContext.Provider value={value}>{children}</KratomContext.Provider>
  );
}

export function useKratom(): KratomContextValue {
  const ctx = useContext(KratomContext);
  if (!ctx) throw new Error("useKratom must be used within KratomProvider");
  return ctx;
}

/** Convenience: is `day` (key) today? */
export function isToday(day: string): boolean {
  return day === todayKey();
}
