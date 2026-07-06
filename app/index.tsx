import React from "react";
import { ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useKratom } from "@/store/KratomStore";
import { GridCalendar } from "@/components/GridCalendar";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { PressableScale } from "@/components/PressableScale";
import { Button, Card, SectionLabel } from "@/components/ui";
import { formatLong, relativeLabel } from "@/lib/dates";

export default function Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { stats, drinks } = useKratom();

  return (
    <View className="flex-1 bg-ink-900">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingHorizontal: 20,
          paddingBottom: 120,
        }}
      >
        {/* Brand */}
        <Animated.View
          entering={FadeInDown.duration(400)}
          className="mb-6 flex-row items-center justify-between"
        >
          <View>
            <Text className="text-2xl font-extrabold tracking-tight text-white">
              K<Text className="text-leaf-400">Safe</Text>
            </Text>
            <Text className="text-xs text-ink-500">
              Kratom & extract intake tracker
            </Text>
          </View>
          <PressableScale
            haptic="light"
            onPress={() => router.push("/schedule")}
            style={{ borderRadius: 999 }}
          >
            <View className="h-11 w-11 items-center justify-center rounded-full border border-ink-600 bg-ink-800">
              <Text className="text-lg">🛡️</Text>
            </View>
          </PressableScale>
        </Animated.View>

        {/* Days-since counter */}
        <Animated.View entering={FadeInDown.duration(450).delay(60)}>
          <Card className="items-center overflow-hidden">
            <SectionLabel>Kratom-free</SectionLabel>
            <View className="flex-row items-end">
              <AnimatedCounter
                value={stats.daysSinceLast}
                style={{
                  color: "#6EE7B7",
                  fontSize: 96,
                  lineHeight: 104,
                  fontWeight: "900",
                  textAlign: "center",
                  minWidth: 120,
                }}
              />
            </View>
            <Text className="-mt-1 text-base font-semibold text-ink-500">
              {stats.daysSinceLast === 1 ? "day" : "days"} of no kratom
            </Text>

            {stats.hasData ? (
              <Text className="mt-3 text-xs text-ink-500">
                Last logged {relativeLabel(stats.lastDrinkDay!).toLowerCase()} ·{" "}
                {formatLong(stats.lastDrinkDay!)}
              </Text>
            ) : (
              <Text className="mt-3 text-center text-xs text-ink-500">
                No kratom logged yet — add your first drink to begin tracking.
              </Text>
            )}
          </Card>
        </Animated.View>

        {/* Schedule status */}
        <Animated.View
          entering={FadeInDown.duration(450).delay(120)}
          className="mt-4"
        >
          <ScheduleStatus />
        </Animated.View>

        {/* Streak stats */}
        <Animated.View
          entering={FadeInDown.duration(450).delay(180)}
          className="mt-4 flex-row gap-3"
        >
          <MiniStat
            label="Current streak"
            value={stats.currentStreak}
            emoji="🔥"
          />
          <MiniStat
            label="Longest streak"
            value={stats.longestStreak}
            emoji="🏅"
          />
        </Animated.View>

        {/* Calendar */}
        <Animated.View
          entering={FadeInDown.duration(450).delay(240)}
          className="mt-4"
        >
          <Card>
            <View className="mb-3 flex-row items-center justify-between">
              <SectionLabel>Intake calendar</SectionLabel>
              <Text className="text-xs text-ink-500">
                {drinks.length} total {drinks.length === 1 ? "drink" : "drinks"}
              </Text>
            </View>
            <GridCalendar
              drinks={drinks}
              onSelectDay={(day) => router.push(`/day/${day}`)}
            />
          </Card>
        </Animated.View>

        {/* Nav buttons */}
        <Animated.View
          entering={FadeInDown.duration(450).delay(300)}
          className="mt-4 flex-row gap-3"
        >
          <NavTile
            emoji="📜"
            label="History"
            onPress={() => router.push("/history")}
          />
          <NavTile
            emoji="🏆"
            label="Medals"
            onPress={() => router.push("/medals")}
          />
        </Animated.View>
      </ScrollView>

      {/* Add drink — fixed bottom */}
      <View
        style={{ paddingBottom: insets.bottom + 12 }}
        className="absolute inset-x-0 bottom-0 px-5 pt-3"
      >
        <View className="absolute inset-0 bg-ink-900/80" />
        <Button
          label="Add kratom drink"
          icon="＋"
          onPress={() => router.push("/add-drink")}
        />
      </View>
    </View>
  );
}

function MiniStat({
  label,
  value,
  emoji,
}: {
  label: string;
  value: number;
  emoji: string;
}) {
  return (
    <Card className="flex-1 flex-row items-center gap-3 p-4">
      <Text className="text-2xl">{emoji}</Text>
      <View>
        <Text className="text-2xl font-extrabold text-white">{value}</Text>
        <Text className="text-[11px] text-ink-500">{label}</Text>
      </View>
    </Card>
  );
}

function NavTile({
  emoji,
  label,
  onPress,
}: {
  emoji: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <PressableScale onPress={onPress} className="flex-1" style={{ borderRadius: 24 }}>
      <View className="flex-1 flex-row items-center gap-3 rounded-3xl border border-ink-600/60 bg-ink-800 p-4">
        <Text className="text-2xl">{emoji}</Text>
        <Text className="text-base font-bold text-white">{label}</Text>
      </View>
    </PressableScale>
  );
}

function ScheduleStatus() {
  const router = useRouter();
  const { schedule, stats } = useKratom();

  if (!schedule) {
    return (
      <PressableScale onPress={() => router.push("/schedule")} style={{ borderRadius: 24 }}>
        <View className="flex-row items-center gap-3 rounded-3xl border border-dashed border-ink-600 bg-ink-800/60 p-4">
          <Text className="text-2xl">🛡️</Text>
          <View className="flex-1">
            <Text className="text-sm font-bold text-white">
              Create a Safe Schedule
            </Text>
            <Text className="text-xs text-ink-500">
              Set how many kratom-free days you want between drinks.
            </Text>
          </View>
          <Text className="text-lg text-ink-500">›</Text>
        </View>
      </PressableScale>
    );
  }

  const eligible = stats.canDrink;
  return (
    <PressableScale onPress={() => router.push("/schedule")} style={{ borderRadius: 24 }}>
      <View
        className={`rounded-3xl border p-5 ${
          eligible
            ? "border-leaf-500/40 bg-leaf-500/10"
            : "border-tea-500/40 bg-tea-500/10"
        }`}
      >
        <View className="flex-row items-center justify-between">
          <SectionLabel>Safe Schedule · {schedule.daysOff}d off</SectionLabel>
          <Text className="text-lg">{eligible ? "✅" : "⏳"}</Text>
        </View>
        {eligible ? (
          <Text className="text-lg font-extrabold text-leaf-300">
            You can drink kratom today
          </Text>
        ) : (
          <>
            <Text className="text-lg font-extrabold text-tea-400">
              Hold off — {stats.daysUntilEligible}{" "}
              {stats.daysUntilEligible === 1 ? "day" : "days"} to go
            </Text>
            <Text className="mt-1 text-xs text-ink-500">
              Eligible again {formatLong(stats.nextEligibleDay!)}
            </Text>
          </>
        )}
        <Text className="mt-3 text-xs text-ink-500">
          Tap to modify or delete your schedule
          {schedule.notifyEnabled ? " · 🔔 reminders on" : ""}
        </Text>
      </View>
    </PressableScale>
  );
}
