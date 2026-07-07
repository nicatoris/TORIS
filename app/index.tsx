import React from "react";
import { ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useKratom } from "@/store/KratomStore";
import { GridCalendar } from "@/components/GridCalendar";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { PressableScale } from "@/components/PressableScale";
import { PaperBackground } from "@/components/PaperBackground";
import { LinearProgress } from "@/components/LinearProgress";
import { Icon, IconName } from "@/components/Icon";
import { SectionLabel } from "@/components/ui";
import { formatLong, relativeLabel } from "@/lib/dates";
import { nextMilestone } from "@/lib/stats";
import { palette, serif, shadow } from "@/lib/theme";

export default function Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { stats, schedule, drinks } = useKratom();

  // Progress + caption context
  let progress = 0;
  let caption = "Log your first drink to begin";
  let goalLabel = "";
  let accent = palette.accent;
  if (!stats.hasData) {
    progress = 0;
  } else if (schedule) {
    if (stats.canDrink) {
      progress = 1;
      caption = "You're clear to drink today";
    } else {
      progress = (schedule.daysOff - stats.daysUntilEligible) / schedule.daysOff;
      caption = `${stats.daysUntilEligible} ${stats.daysUntilEligible === 1 ? "day" : "days"} until your window opens`;
      goalLabel = `${schedule.daysOff}d`;
      accent = palette.warn;
    }
  } else {
    const m = nextMilestone(stats.currentStreak);
    if (m) {
      progress = stats.currentStreak / m.days;
      const left = m.days - stats.currentStreak;
      caption = `${left} ${left === 1 ? "day" : "days"} to ${m.name}`;
      goalLabel = m.name;
    } else {
      progress = 1;
      caption = "Every milestone cleared";
    }
  }

  return (
    <View className="flex-1 bg-paper">
      <PaperBackground />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingHorizontal: 22,
          paddingBottom: 132,
        }}
      >
        {/* Masthead */}
        <Animated.View
          entering={FadeIn.duration(500)}
          className="mb-3 h-11 flex-row items-center justify-between"
        >
          <Text
            className="text-[22px] text-ink-900"
            style={{ fontFamily: serif, letterSpacing: -0.3 }}
          >
            KSafe
          </Text>
          <PressableScale
            haptic="light"
            onPress={() => router.push("/schedule")}
            style={{ borderRadius: 999 }}
          >
            <View
              className="h-10 w-10 items-center justify-center rounded-full border border-ink-900/[0.06] bg-paper-card"
              style={shadow.card}
            >
              <Icon name="shield" size={18} color={palette.label2} />
            </View>
          </PressableScale>
        </Animated.View>

        {/* Editorial hero */}
        <Animated.View
          entering={FadeInDown.duration(600).delay(60)}
          className="items-center pt-9 pb-4"
        >
          <Text className="text-[11px] font-semibold uppercase tracking-[3px] text-ink-400">
            Kratom-free for
          </Text>
          <View className="mt-2 flex-row items-end">
            <AnimatedCounter
              value={stats.daysSinceLast}
              style={{
                color: palette.label,
                fontFamily: serif,
                fontSize: 112,
                lineHeight: 118,
                letterSpacing: -2,
                textAlign: "center",
                minWidth: 90,
              }}
            />
          </View>
          <Text className="mt-1 text-[15px] text-ink-500">
            {stats.daysSinceLast === 1 ? "day" : "days"}
          </Text>
        </Animated.View>

        {/* Progress rule */}
        <Animated.View entering={FadeInDown.duration(600).delay(140)} className="mt-3">
          <View className="mb-2 flex-row items-center justify-between">
            <Text
              className="text-[13px] font-medium"
              style={{ color: stats.canDrink && schedule ? palette.accent : palette.label2 }}
            >
              {caption}
            </Text>
            {goalLabel ? (
              <Text className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">
                {goalLabel}
              </Text>
            ) : null}
          </View>
          <LinearProgress progress={progress} color={accent} />
        </Animated.View>

        {/* Stat pair */}
        <Animated.View entering={FadeInDown.duration(600).delay(200)} className="mt-6">
          <View
            className="flex-row items-center rounded-3xl border border-ink-900/[0.06] bg-paper-card py-5"
            style={shadow.card}
          >
            <Stat label="Current streak" value={stats.currentStreak} />
            <View className="h-10 w-px bg-ink-900/[0.08]" />
            <Stat label="Longest streak" value={stats.longestStreak} />
          </View>
        </Animated.View>

        {/* Schedule */}
        <Animated.View entering={FadeInDown.duration(600).delay(260)} className="mt-3">
          <ScheduleStatus />
        </Animated.View>

        {/* Calendar */}
        <Animated.View entering={FadeInDown.duration(600).delay(320)} className="mt-3">
          <View
            className="rounded-3xl border border-ink-900/[0.06] bg-paper-card p-5"
            style={shadow.card}
          >
            <View className="mb-4 flex-row items-center justify-between">
              <SectionLabel>Intake calendar</SectionLabel>
              <Text className="text-xs text-ink-400">{drinks.length} logged</Text>
            </View>
            <GridCalendar
              drinks={drinks}
              onSelectDay={(day) => router.push(`/day/${day}`)}
            />
          </View>
        </Animated.View>

        {/* Nav list */}
        <Animated.View entering={FadeInDown.duration(600).delay(380)} className="mt-3">
          <View
            className="overflow-hidden rounded-3xl border border-ink-900/[0.06] bg-paper-card"
            style={shadow.card}
          >
            <NavRow icon="history" label="Intake history" onPress={() => router.push("/history")} />
            <View className="ml-[68px] h-px bg-ink-900/[0.06]" />
            <NavRow icon="trophy" label="Medals & streaks" onPress={() => router.push("/medals")} />
          </View>
        </Animated.View>
      </ScrollView>

      {/* Dock */}
      <View
        style={{ paddingBottom: insets.bottom + 12, ...shadow.float }}
        className="absolute inset-x-0 bottom-0 border-t border-ink-900/[0.06] bg-paper px-5 pt-3"
      >
        <PressableScale
          haptic="medium"
          onPress={() => router.push("/add-drink")}
          style={{ borderRadius: 999 }}
        >
          <View
            className="flex-row items-center justify-center gap-2 rounded-full py-[17px]"
            style={{ backgroundColor: palette.accent, ...shadow.card }}
          >
            <Icon name="plus" size={20} color={palette.onAccent} strokeWidth={2.4} />
            <Text className="text-[17px] font-semibold" style={{ color: palette.onAccent }}>
              Add kratom drink
            </Text>
          </View>
        </PressableScale>
      </View>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View className="flex-1 items-center">
      <Text
        className="text-[30px] text-ink-900"
        style={{ fontFamily: serif, letterSpacing: -0.5 }}
      >
        {value}
      </Text>
      <Text className="mt-0.5 text-[11px] uppercase tracking-wide text-ink-400">
        {label}
      </Text>
    </View>
  );
}

function NavRow({
  icon,
  label,
  onPress,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
}) {
  return (
    <PressableScale onPress={onPress} activeScale={0.98} haptic="light">
      <View className="flex-row items-center gap-3 px-5 py-4">
        <View className="h-9 w-9 items-center justify-center rounded-full bg-ink-900/[0.04]">
          <Icon name={icon} size={19} color={palette.label} />
        </View>
        <Text className="flex-1 text-[16px] font-medium text-ink-900">{label}</Text>
        <Icon name="chevronRight" size={16} color={palette.label3} />
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
        <View
          className="flex-row items-center gap-3 rounded-3xl border border-dashed border-ink-900/20 bg-paper-card/60 p-4"
        >
          <View className="h-9 w-9 items-center justify-center rounded-full bg-ink-900/[0.04]">
            <Icon name="shield" size={18} color={palette.label2} />
          </View>
          <View className="flex-1">
            <Text className="text-[15px] font-semibold text-ink-900">
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
    <PressableScale onPress={() => router.push("/schedule")} style={{ borderRadius: 24 }}>
      <View
        className="flex-row items-center gap-3 rounded-3xl border border-ink-900/[0.06] bg-paper-card p-4"
        style={shadow.card}
      >
        <View
          className="h-11 w-11 items-center justify-center rounded-full"
          style={{ backgroundColor: `${accent}18` }}
        >
          <Icon name={eligible ? "leaf" : "bell"} size={20} color={accent} />
        </View>
        <View className="flex-1">
          <Text className="text-[11px] font-semibold uppercase tracking-widest text-ink-400">
            Safe Schedule · {schedule.daysOff}d
          </Text>
          <Text className="mt-0.5 text-[15px] font-semibold" style={{ color: accent }}>
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
