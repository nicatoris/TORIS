import React, { useMemo } from "react";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useKratom } from "@/store/KratomStore";
import { PaperBackground } from "@/components/PaperBackground";
import { ProgressRing } from "@/components/ProgressRing";
import { Icon, IconName } from "@/components/Icon";
import { ModalHeader, SectionLabel } from "@/components/ui";
import { evaluateMedals, EvaluatedMedal, TIER_META } from "@/lib/medals";
import { formatLong } from "@/lib/dates";
import { palette, serif, shadow } from "@/lib/theme";

export default function Medals() {
  const insets = useSafeAreaInsets();
  const { stats, schedule, earnedMedals } = useKratom();

  const medals = useMemo(
    () => evaluateMedals({ stats, hasSchedule: !!schedule }, earnedMedals),
    [stats, schedule, earnedMedals],
  );
  const earnedCount = medals.filter((m) => m.earned).length;

  return (
    <View className="flex-1 bg-paper">
      <PaperBackground />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 20,
          paddingHorizontal: 22,
          paddingBottom: insets.bottom + 32,
        }}
      >
        <ModalHeader title="Medals" subtitle={`${earnedCount} of ${medals.length} earned`} />

        <View className="mb-4 flex-row gap-3">
          <StreakCard icon="flame" label="Current streak" value={stats.currentStreak} />
          <StreakCard icon="trophy" label="Longest streak" value={stats.longestStreak} />
        </View>

        {stats.recordsBroken > 0 ? (
          <Animated.View entering={FadeInDown} className="mb-4">
            <View
              className="flex-row items-center gap-3 rounded-3xl border p-4"
              style={{
                borderColor: `${palette.accent}33`,
                backgroundColor: palette.accentSoft,
                ...shadow.card,
              }}
            >
              <Icon name="sparkle" size={22} color={palette.accent} />
              <Text className="flex-1 text-[13px] font-medium" style={{ color: palette.accent }}>
                You've beaten your personal best {stats.recordsBroken}{" "}
                {stats.recordsBroken === 1 ? "time" : "times"}. Keep climbing.
              </Text>
            </View>
          </Animated.View>
        ) : null}

        <View className="mb-3">
          <SectionLabel>Collection</SectionLabel>
        </View>
        <View className="flex-row flex-wrap justify-between">
          {medals.map((m, i) => (
            <Animated.View
              key={m.id}
              entering={FadeInDown.duration(360).delay(i * 45)}
              style={{ width: "48.5%" }}
              className="mb-3"
            >
              <MedalCard medal={m} index={i} />
            </Animated.View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function StreakCard({
  icon,
  label,
  value,
}: {
  icon: IconName;
  label: string;
  value: number;
}) {
  return (
    <View
      className="flex-1 items-center rounded-3xl border border-ink-900/[0.06] bg-paper-card py-6"
      style={shadow.card}
    >
      <View
        className="h-11 w-11 items-center justify-center rounded-full"
        style={{ backgroundColor: palette.accentSoft }}
      >
        <Icon name={icon} size={22} color={palette.accent} />
      </View>
      <Text
        className="mt-3 text-[34px] text-ink-900"
        style={{ fontFamily: serif, letterSpacing: -0.5 }}
      >
        {value}
      </Text>
      <Text className="text-[11px] uppercase tracking-wide text-ink-400">{label}</Text>
    </View>
  );
}

function MedalCard({ medal, index }: { medal: EvaluatedMedal; index: number }) {
  const tier = TIER_META[medal.tier];
  const pct = Math.min(1, medal.current / medal.target);
  const ringColor = medal.earned ? tier.ring : palette.accent;

  return (
    <View
      className="h-full items-center rounded-3xl border px-3 py-5"
      style={{
        borderColor: medal.earned ? `${tier.ring}66` : palette.hairline,
        backgroundColor: medal.earned ? `${tier.glow}22` : palette.card,
        ...shadow.card,
      }}
    >
      <ProgressRing
        progress={medal.earned ? 1 : pct}
        size={78}
        strokeWidth={5}
        from={ringColor}
        to={ringColor}
        trackColor="rgba(26,26,21,0.08)"
        delay={300 + index * 45}
      >
        <Text style={{ fontSize: 30, opacity: medal.earned ? 1 : 0.32 }}>{medal.emoji}</Text>
      </ProgressRing>

      <Text
        className="mt-3 text-center text-[14px] font-semibold"
        style={{ color: medal.earned ? palette.label : palette.label2 }}
      >
        {medal.title}
      </Text>
      <Text className="mt-0.5 text-center text-[11px] leading-[15px] text-ink-400">
        {medal.description}
      </Text>

      <View className="mt-2">
        {medal.earned ? (
          <View className="flex-row items-center gap-1">
            <Icon name="check" size={12} color={tier.ring} strokeWidth={2.4} />
            <Text className="text-[10px] font-semibold" style={{ color: tier.ring }}>
              {medal.earnedAt
                ? formatLong(new Date(medal.earnedAt).toISOString().slice(0, 10))
                : "Earned"}
            </Text>
          </View>
        ) : (
          <Text className="text-[11px] font-medium text-ink-400">
            {medal.current} / {medal.target}
          </Text>
        )}
      </View>
    </View>
  );
}
