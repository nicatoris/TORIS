import React, { useMemo } from "react";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useKratom } from "@/store/KratomStore";
import { Card, ModalHeader, SectionLabel } from "@/components/ui";
import { evaluateMedals, EvaluatedMedal, TIER_META } from "@/lib/medals";
import { formatLong } from "@/lib/dates";

export default function Medals() {
  const insets = useSafeAreaInsets();
  const { stats, schedule, earnedMedals } = useKratom();

  const medals = useMemo(
    () =>
      evaluateMedals(
        { stats, hasSchedule: !!schedule },
        earnedMedals,
      ),
    [stats, schedule, earnedMedals],
  );

  const earnedCount = medals.filter((m) => m.earned).length;

  return (
    <View className="flex-1 bg-ink-900">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 20,
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 32,
        }}
      >
        <ModalHeader
          title="Medals"
          subtitle={`${earnedCount} of ${medals.length} earned`}
        />

        {/* Streak headline */}
        <View className="mb-5 flex-row gap-3">
          <StreakCard
            emoji="🔥"
            label="Current streak"
            value={stats.currentStreak}
            accent="text-leaf-400"
          />
          <StreakCard
            emoji="🏅"
            label="Longest streak"
            value={stats.longestStreak}
            accent="text-gold-400"
          />
        </View>

        {stats.recordsBroken > 0 ? (
          <Animated.View entering={FadeInDown} className="mb-5">
            <Card className="flex-row items-center gap-3 border-gold-500/30 bg-gold-500/10">
              <Text className="text-2xl">🚀</Text>
              <Text className="flex-1 text-sm font-semibold text-gold-400">
                You've beaten your personal best {stats.recordsBroken}{" "}
                {stats.recordsBroken === 1 ? "time" : "times"}. Keep climbing.
              </Text>
            </Card>
          </Animated.View>
        ) : null}

        <SectionLabel>Collection</SectionLabel>
        <View className="flex-row flex-wrap justify-between">
          {medals.map((m, i) => (
            <Animated.View
              key={m.id}
              entering={FadeInDown.duration(300).delay(i * 40)}
              style={{ width: "48.5%" }}
              className="mb-3"
            >
              <MedalCard medal={m} />
            </Animated.View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function StreakCard({
  emoji,
  label,
  value,
  accent,
}: {
  emoji: string;
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <Card className="flex-1 items-center py-5">
      <Text className="text-3xl">{emoji}</Text>
      <Text className={`mt-1 text-4xl font-black ${accent}`}>{value}</Text>
      <Text className="text-[11px] text-ink-500">{label}</Text>
    </Card>
  );
}

function MedalCard({ medal }: { medal: EvaluatedMedal }) {
  const tier = TIER_META[medal.tier];
  const pct = Math.min(1, medal.current / medal.target);

  return (
    <View
      className="h-full rounded-3xl border p-4"
      style={{
        borderColor: medal.earned ? `${tier.ring}66` : "#2E2E31",
        backgroundColor: medal.earned ? `${tier.glow}14` : "#151517",
      }}
    >
      <View className="flex-row items-center justify-between">
        <Text style={{ fontSize: 34, opacity: medal.earned ? 1 : 0.35 }}>
          {medal.emoji}
        </Text>
        {medal.earned ? (
          <View
            className="rounded-full px-2 py-0.5"
            style={{ backgroundColor: `${tier.glow}22` }}
          >
            <Text
              className="text-[9px] font-bold uppercase tracking-wider"
              style={{ color: tier.text }}
            >
              {tier.label}
            </Text>
          </View>
        ) : (
          <Text className="text-base text-ink-500">🔒</Text>
        )}
      </View>

      <Text
        className="mt-3 text-base font-bold"
        style={{ color: medal.earned ? "#FFFFFF" : "#64748B" }}
      >
        {medal.title}
      </Text>
      <Text className="mt-0.5 text-[11px] leading-4 text-ink-500">
        {medal.description}
      </Text>

      <View className="mt-3">
        {medal.earned ? (
          <Text className="text-[10px] font-semibold" style={{ color: tier.text }}>
            {medal.earnedAt
              ? `Earned ${formatLong(new Date(medal.earnedAt).toISOString().slice(0, 10))}`
              : "Earned"}
          </Text>
        ) : (
          <>
            <View className="h-1.5 overflow-hidden rounded-full bg-ink-600">
              <View
                className="h-full rounded-full bg-leaf-500"
                style={{ width: `${pct * 100}%` }}
              />
            </View>
            <Text className="mt-1 text-[10px] text-ink-500">
              {medal.current} / {medal.target}
            </Text>
          </>
        )}
      </View>
    </View>
  );
}
