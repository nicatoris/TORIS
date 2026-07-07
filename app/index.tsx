import React from "react";
import { ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useKratom } from "@/store/KratomStore";
import { GridCalendar } from "@/components/GridCalendar";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { PressableScale } from "@/components/PressableScale";
import { AuroraBackground } from "@/components/AuroraBackground";
import { ProgressRing } from "@/components/ProgressRing";
import { Glass } from "@/components/Glass";
import { Icon, IconName } from "@/components/Icon";
import { SectionLabel } from "@/components/ui";
import { formatLong, relativeLabel } from "@/lib/dates";
import { nextMilestone } from "@/lib/stats";
import { palette } from "@/lib/theme";

export default function Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { stats, schedule, drinks } = useKratom();

  // Ring + caption context
  let ringProgress = 0;
  let caption = "Log your first drink to begin";
  let ringTo = palette.accentDeep;
  if (!stats.hasData) {
    ringProgress = 0;
  } else if (schedule) {
    if (stats.canDrink) {
      ringProgress = 1;
      caption = "You're clear to drink today";
    } else {
      ringProgress = (schedule.daysOff - stats.daysUntilEligible) / schedule.daysOff;
      caption = `${stats.daysUntilEligible} ${stats.daysUntilEligible === 1 ? "day" : "days"} until your window opens`;
      ringTo = palette.warn;
    }
  } else {
    const m = nextMilestone(stats.currentStreak);
    if (m) {
      ringProgress = stats.currentStreak / m.days;
      const left = m.days - stats.currentStreak;
      caption = `${left} ${left === 1 ? "day" : "days"} to ${m.name}`;
    } else {
      ringProgress = 1;
      caption = "Every milestone cleared";
    }
  }

  return (
    <View className="flex-1 bg-ink-900">
      <AuroraBackground />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 10,
          paddingHorizontal: 20,
          paddingBottom: 130,
        }}
      >
        {/* Top bar */}
        <Animated.View
          entering={FadeIn.duration(500)}
          className="mb-2 h-11 flex-row items-center justify-between"
        >
          <Text className="text-[19px] font-bold tracking-tight text-white">
            K<Text style={{ color: palette.accent }}>Safe</Text>
          </Text>
          <PressableScale
            haptic="light"
            onPress={() => router.push("/schedule")}
            style={{ borderRadius: 999 }}
          >
            <View className="h-10 w-10 items-center justify-center rounded-full border border-white/[0.07] bg-white/[0.03]">
              <Icon name="shield" size={19} color={palette.label2} />
            </View>
          </PressableScale>
        </Animated.View>

        {/* Hero ring */}
        <Animated.View
          entering={FadeInDown.duration(600).delay(80)}
          className="items-center pb-2 pt-6"
        >
          <ProgressRing progress={ringProgress} to={ringTo} size={244} strokeWidth={9}>
            <View className="items-center">
              <AnimatedCounter
                value={stats.daysSinceLast}
                style={{
                  color: palette.label,
                  fontSize: 88,
                  lineHeight: 92,
                  fontWeight: "300",
                  letterSpacing: -3,
                  textAlign: "center",
                  minWidth: 110,
                }}
              />
              <Text className="mt-1 text-[11px] font-semibold uppercase tracking-[3px] text-ink-500">
                {stats.daysSinceLast === 1 ? "Day" : "Days"} kratom-free
              </Text>
            </View>
          </ProgressRing>

          <Animated.Text
            entering={FadeIn.duration(500).delay(700)}
            className="mt-5 text-[15px] font-medium"
            style={{ color: stats.canDrink && schedule ? palette.accent : palette.label2 }}
          >
            {caption}
          </Animated.Text>
          {stats.hasData ? (
            <Text className="mt-1 text-xs text-ink-500">
              Last logged {relativeLabel(stats.lastDrinkDay!).toLowerCase()}
            </Text>
          ) : null}
        </Animated.View>

        {/* Streak strip */}
        <Animated.View
          entering={FadeInDown.duration(500).delay(180)}
          className="mt-6"
        >
          <View className="flex-row items-center rounded-4xl border border-white/[0.06] bg-white/[0.02] py-4">
            <Stat icon="flame" label="Current streak" value={stats.currentStreak} />
            <View className="h-9 w-px bg-white/[0.07]" />
            <Stat icon="trophy" label="Longest streak" value={stats.longestStreak} />
          </View>
        </Animated.View>

        {/* Schedule status */}
        <Animated.View entering={FadeInDown.duration(500).delay(240)} className="mt-3">
          <ScheduleStatus />
        </Animated.View>

        {/* Calendar */}
        <Animated.View entering={FadeInDown.duration(500).delay(300)} className="mt-3">
          <View className="rounded-4xl border border-white/[0.06] bg-white/[0.02] p-5">
            <View className="mb-4 flex-row items-center justify-between">
              <SectionLabel>Intake calendar</SectionLabel>
              <Text className="text-xs text-ink-500">
                {drinks.length} logged
              </Text>
            </View>
            <GridCalendar
              drinks={drinks}
              onSelectDay={(day) => router.push(`/day/${day}`)}
            />
          </View>
        </Animated.View>

        {/* Nav */}
        <Animated.View
          entering={FadeInDown.duration(500).delay(360)}
          className="mt-3 flex-row gap-3"
        >
          <NavTile icon="history" label="History" onPress={() => router.push("/history")} />
          <NavTile icon="trophy" label="Medals" onPress={() => router.push("/medals")} />
        </Animated.View>
      </ScrollView>

      {/* Add drink dock */}
      <Glass
        topHairline
        intensity={40}
        className="px-5 pt-3"
        style={{ position: "absolute", left: 0, right: 0, bottom: 0 }}
      >
        <View style={{ paddingBottom: insets.bottom + 12 }}>
          <PressableScale
            haptic="medium"
            onPress={() => router.push("/add-drink")}
            style={{ borderRadius: 999 }}
          >
            <View
              className="flex-row items-center justify-center gap-2 rounded-full py-[17px]"
              style={{ backgroundColor: palette.accent }}
            >
              <Icon name="plus" size={20} color="#04140D" strokeWidth={2.4} />
              <Text className="text-[17px] font-bold" style={{ color: "#04140D" }}>
                Add kratom drink
              </Text>
            </View>
          </PressableScale>
        </View>
      </Glass>
    </View>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: IconName;
  label: string;
  value: number;
}) {
  return (
    <View className="flex-1 items-center">
      <View className="flex-row items-center gap-1.5">
        <Icon name={icon} size={15} color={palette.accent} />
        <Text className="text-2xl font-semibold text-white">{value}</Text>
      </View>
      <Text className="mt-0.5 text-[11px] text-ink-500">{label}</Text>
    </View>
  );
}

function NavTile({
  icon,
  label,
  onPress,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
}) {
  return (
    <PressableScale onPress={onPress} className="flex-1" style={{ borderRadius: 28 }}>
      <View className="flex-1 flex-row items-center gap-3 rounded-4xl border border-white/[0.06] bg-white/[0.02] p-[18px]">
        <Icon name={icon} size={20} color={palette.label} />
        <Text className="text-[16px] font-semibold text-white">{label}</Text>
        <View className="flex-1 items-end">
          <Icon name="chevronRight" size={16} color={palette.label3} />
        </View>
      </View>
    </PressableScale>
  );
}

function ScheduleStatus() {
  const router = useRouter();
  const { schedule, stats } = useKratom();

  if (!schedule) {
    return (
      <PressableScale onPress={() => router.push("/schedule")} style={{ borderRadius: 28 }}>
        <View className="flex-row items-center gap-3 rounded-4xl border border-dashed border-white/[0.1] bg-white/[0.02] p-[18px]">
          <View className="h-9 w-9 items-center justify-center rounded-full bg-white/[0.04]">
            <Icon name="shield" size={18} color={palette.label2} />
          </View>
          <View className="flex-1">
            <Text className="text-[15px] font-semibold text-white">
              Create a Safe Schedule
            </Text>
            <Text className="mt-0.5 text-xs text-ink-500">
              Set kratom-free days between drinks
            </Text>
          </View>
          <Icon name="chevronRight" size={16} color={palette.label3} />
        </View>
      </PressableScale>
    );
  }

  const eligible = stats.canDrink;
  const accent = eligible ? palette.accent : palette.warn;
  return (
    <PressableScale onPress={() => router.push("/schedule")} style={{ borderRadius: 28 }}>
      <View
        className="flex-row items-center gap-3 overflow-hidden rounded-4xl border p-[18px]"
        style={{
          borderColor: `${accent}30`,
          backgroundColor: `${accent}0F`,
        }}
      >
        <View
          className="h-11 w-11 items-center justify-center rounded-full"
          style={{ backgroundColor: `${accent}1F` }}
        >
          <Icon name={eligible ? "leaf" : "bell"} size={20} color={accent} />
        </View>
        <View className="flex-1">
          <Text className="text-[11px] font-semibold uppercase tracking-widest text-ink-500">
            Safe Schedule · {schedule.daysOff}d
          </Text>
          <Text className="mt-0.5 text-[15px] font-bold" style={{ color: accent }}>
            {eligible
              ? "Clear to drink today"
              : `Hold off — ${stats.daysUntilEligible} ${stats.daysUntilEligible === 1 ? "day" : "days"} to go`}
          </Text>
          {!eligible ? (
            <Text className="mt-0.5 text-xs text-ink-500">
              Opens {formatLong(stats.nextEligibleDay!)}
            </Text>
          ) : null}
        </View>
        <Icon name="chevronRight" size={16} color={palette.label3} />
      </View>
    </PressableScale>
  );
}
