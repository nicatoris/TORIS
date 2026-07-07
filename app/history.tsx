import React, { useMemo } from "react";
import { SectionList, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useKratom } from "@/store/KratomStore";
import { PressableScale } from "@/components/PressableScale";
import { DrinkBadge, EmptyState, ModalHeader } from "@/components/ui";
import { formatShort, fromDayKey, MONTHS, relativeLabel } from "@/lib/dates";
import { Drink, DrinkType } from "@/lib/types";

interface DaySummary {
  day: string;
  drinks: Drink[];
  types: DrinkType[];
}

export default function History() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { drinks } = useKratom();

  const sections = useMemo(() => {
    const byDay = new Map<string, Drink[]>();
    for (const d of drinks) {
      const list = byDay.get(d.date) ?? [];
      list.push(d);
      byDay.set(d.date, list);
    }

    const summaries: DaySummary[] = [...byDay.entries()]
      .map(([day, list]) => ({
        day,
        drinks: list,
        types: [...new Set(list.map((d) => d.type))],
      }))
      .sort((a, b) => (a.day < b.day ? 1 : -1)); // newest first

    // Group into month sections.
    const groups = new Map<string, DaySummary[]>();
    for (const s of summaries) {
      const d = fromDayKey(s.day);
      const key = `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
      const arr = groups.get(key) ?? [];
      arr.push(s);
      groups.set(key, arr);
    }
    return [...groups.entries()].map(([title, data]) => ({ title, data }));
  }, [drinks]);

  return (
    <View className="flex-1 bg-ink-900">
      <View style={{ paddingTop: 20, paddingHorizontal: 20 }}>
        <ModalHeader
          title="Intake history"
          subtitle={`${drinks.length} ${drinks.length === 1 ? "drink" : "drinks"} logged across ${
            new Set(drinks.map((d) => d.date)).size
          } ${new Set(drinks.map((d) => d.date)).size === 1 ? "day" : "days"}`}
        />
      </View>

      {drinks.length === 0 ? (
        <EmptyState
          emoji="📜"
          title="Nothing logged yet"
          body="Your kratom and extract history will appear here once you add a drink."
        />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.day}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: insets.bottom + 24,
          }}
          stickySectionHeadersEnabled={false}
          renderSectionHeader={({ section }) => (
            <Text className="mb-2 mt-4 text-xs font-bold uppercase tracking-widest text-ink-500">
              {section.title}
            </Text>
          )}
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInDown.duration(300).delay(index * 30)}>
              <DayRow summary={item} onPress={() => router.push(`/day/${item.day}`)} />
            </Animated.View>
          )}
        />
      )}
    </View>
  );
}

function DayRow({
  summary,
  onPress,
}: {
  summary: DaySummary;
  onPress: () => void;
}) {
  return (
    <PressableScale onPress={onPress} className="mb-2.5" style={{ borderRadius: 20 }}>
      <View className="flex-row items-center gap-3 rounded-4xl border border-white/[0.06] bg-ink-800 p-4">
        <View className="h-12 w-12 items-center justify-center rounded-xl bg-ink-700">
          <Text className="text-lg font-extrabold text-white">
            {fromDayKey(summary.day).getDate()}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-sm font-bold text-white">
            {formatShort(summary.day)}
          </Text>
          <Text className="text-xs text-ink-500">
            {relativeLabel(summary.day)} ·{" "}
            {summary.drinks.length} {summary.drinks.length === 1 ? "drink" : "drinks"}
          </Text>
        </View>
        <View className="flex-row gap-1.5">
          {summary.types.map((t) => (
            <DrinkBadge key={t} type={t} />
          ))}
        </View>
        <Text className="ml-1 text-lg text-ink-500">›</Text>
      </View>
    </PressableScale>
  );
}
