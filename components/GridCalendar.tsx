import React, { useMemo } from "react";
import { View, Text } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { Drink } from "@/lib/types";
import { addDays, dayKey, fromDayKey, todayKey, WEEKDAYS } from "@/lib/dates";
import { PressableScale } from "./PressableScale";

interface Props {
  drinks: Drink[];
  weeks?: number;
  onSelectDay?: (day: string) => void;
}

interface Cell {
  key: string;
  inRange: boolean;
  isToday: boolean;
  hasDrink: boolean;
  hasExtract: boolean;
  count: number;
}

/**
 * A compact contribution-style heatmap: columns are weeks (Sun–Sat rows).
 * Days with kratom light up — purple for extract, green for leaf tea.
 */
export function GridCalendar({ drinks, weeks = 18, onSelectDay }: Props) {
  const { columns } = useMemo(() => {
    const byDay = new Map<string, Drink[]>();
    for (const d of drinks) {
      const list = byDay.get(d.date) ?? [];
      list.push(d);
      byDay.set(d.date, list);
    }

    const today = todayKey();
    // Anchor the grid to the *end* of the current week (Saturday) so the last
    // column is the live week with today in it.
    const todayDate = fromDayKey(today);
    const endOfWeek = addDays(today, 6 - todayDate.getDay());
    const totalDays = weeks * 7;
    const start = addDays(endOfWeek, -(totalDays - 1));

    const cols: Cell[][] = [];
    for (let w = 0; w < weeks; w++) {
      const col: Cell[] = [];
      for (let r = 0; r < 7; r++) {
        const key = addDays(start, w * 7 + r);
        const entries = byDay.get(key) ?? [];
        col.push({
          key,
          inRange: key <= today,
          isToday: key === today,
          hasDrink: entries.length > 0,
          hasExtract: entries.some((e) => e.type === "extract"),
          count: entries.length,
        });
      }
      cols.push(col);
    }
    return { columns: cols };
  }, [drinks, weeks]);

  return (
    <Animated.View entering={FadeIn.duration(400)}>
      <View className="flex-row">
        {/* Weekday rail */}
        <View className="mr-1.5 justify-between py-[1px]">
          {WEEKDAYS.map((d, i) => (
            <Text
              key={d}
              className="h-[14px] text-[9px] leading-[14px] text-ink-500"
            >
              {i % 2 === 1 ? d[0] : ""}
            </Text>
          ))}
        </View>

        <View className="flex-1 flex-row justify-between">
          {columns.map((col, ci) => (
            <View key={ci} className="justify-between">
              {col.map((cell) => (
                <DayCell key={cell.key} cell={cell} onSelectDay={onSelectDay} />
              ))}
            </View>
          ))}
        </View>
      </View>

      {/* Legend */}
      <View className="mt-4 flex-row items-center justify-end gap-3.5">
        <Legend color="rgba(255,255,255,0.08)" label="Clean" />
        <Legend color="#34E0A1" label="Leaf tea" />
        <Legend color="#C08BFF" label="Extract" />
      </View>
    </Animated.View>
  );
}

function DayCell({
  cell,
  onSelectDay,
}: {
  cell: Cell;
  onSelectDay?: (day: string) => void;
}) {
  const base = cell.hasDrink
    ? cell.hasExtract
      ? "#C08BFF"
      : "#34E0A1"
    : cell.inRange
      ? "rgba(255,255,255,0.05)"
      : "rgba(255,255,255,0.015)";

  return (
    <PressableScale
      haptic="selection"
      activeScale={0.78}
      disabled={!cell.inRange}
      onPress={() => cell.inRange && onSelectDay?.(cell.key)}
      style={{
        width: 14,
        height: 14,
        borderRadius: 4.5,
        marginVertical: 1.5,
        backgroundColor: base,
        borderWidth: cell.isToday ? 1.5 : 0,
        borderColor: "#7BF0C4",
      }}
    >
      <View />
    </PressableScale>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View className="flex-row items-center gap-1.5">
      <View
        style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: color }}
      />
      <Text className="text-[10px] text-ink-500">{label}</Text>
    </View>
  );
}

export function currentDayKey(): string {
  return dayKey();
}
