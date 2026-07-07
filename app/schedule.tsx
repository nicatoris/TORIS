import React, { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeIn } from "react-native-reanimated";
import { useKratom } from "@/store/KratomStore";
import { PressableScale } from "@/components/PressableScale";
import { AuroraBackground } from "@/components/AuroraBackground";
import { Toggle } from "@/components/Toggle";
import { Icon } from "@/components/Icon";
import { Button, Card, ModalHeader, SectionLabel } from "@/components/ui";
import { haptics } from "@/lib/haptics";
import { formatLong } from "@/lib/dates";
import { palette } from "@/lib/theme";

const PRESETS = [1, 2, 3, 5, 7, 14];

export default function ScheduleScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { schedule, stats, setSchedule, clearSchedule } = useKratom();

  const [days, setDays] = useState<number>(schedule?.daysOff ?? 3);
  const [notify, setNotify] = useState<boolean>(schedule?.notifyEnabled ?? false);
  const [saving, setSaving] = useState(false);
  const isEditing = !!schedule;

  function bump(delta: number) {
    haptics.selection();
    setDays((d) => Math.min(90, Math.max(1, d + delta)));
  }

  async function save() {
    setSaving(true);
    await setSchedule(days, notify);
    haptics.success();
    setSaving(false);
    router.back();
  }

  async function remove() {
    await clearSchedule();
    haptics.warning();
    router.back();
  }

  return (
    <View className="flex-1 bg-ink-900">
      <AuroraBackground />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 20,
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 150,
        }}
      >
        <ModalHeader
          title="Safe Schedule"
          subtitle="The kratom-free window you want between drinks."
        />

        {/* Stepper */}
        <View className="items-center rounded-4xl border border-white/[0.06] bg-white/[0.02] py-8">
          <SectionLabel>Days off between drinks</SectionLabel>
          <View className="mt-4 flex-row items-center gap-7">
            <StepButton icon="minus" onPress={() => bump(-1)} />
            <View className="items-center" style={{ minWidth: 116 }}>
              <Text
                className="text-[76px] font-light"
                style={{ color: palette.label, letterSpacing: -3, lineHeight: 82 }}
              >
                {days}
              </Text>
              <Text className="-mt-1 text-[13px] text-ink-500">
                {days === 1 ? "day" : "days"}
              </Text>
            </View>
            <StepButton icon="plus" onPress={() => bump(1)} />
          </View>

          <View className="mt-6 flex-row flex-wrap justify-center gap-2 px-4">
            {PRESETS.map((p) => {
              const on = days === p;
              return (
                <PressableScale
                  key={p}
                  haptic="selection"
                  onPress={() => {
                    haptics.selection();
                    setDays(p);
                  }}
                  style={{ borderRadius: 999 }}
                >
                  <View
                    className="rounded-full border px-4 py-2"
                    style={{
                      borderColor: on ? `${palette.accent}66` : "rgba(255,255,255,0.07)",
                      backgroundColor: on ? `${palette.accent}14` : "transparent",
                    }}
                  >
                    <Text
                      className="text-[13px] font-semibold"
                      style={{ color: on ? palette.accent : palette.label2 }}
                    >
                      {p}d
                    </Text>
                  </View>
                </PressableScale>
              );
            })}
          </View>
        </View>

        {/* Notifications */}
        <Card className="mt-3 flex-row items-center justify-between">
          <View className="flex-1 flex-row items-center gap-3 pr-4">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-white/[0.04]">
              <Icon name={notify ? "bell" : "bellOff"} size={19} color={palette.label2} />
            </View>
            <View className="flex-1">
              <Text className="text-[15px] font-semibold text-white">
                Remind me when eligible
              </Text>
              <Text className="mt-0.5 text-xs text-ink-500">
                A nudge the morning your window opens
              </Text>
            </View>
          </View>
          <Toggle value={notify} onChange={setNotify} />
        </Card>

        {isEditing && stats.lastDrinkDay ? (
          <Animated.View entering={FadeIn} className="mt-3">
            <Card>
              <SectionLabel>Right now</SectionLabel>
              <Text
                className="mt-1.5 text-[15px] font-semibold"
                style={{ color: stats.canDrink ? palette.accent : palette.warn }}
              >
                {stats.canDrink
                  ? "You're eligible to drink today."
                  : `${stats.daysUntilEligible} more ${stats.daysUntilEligible === 1 ? "day" : "days"} · opens ${formatLong(stats.nextEligibleDay!)}`}
              </Text>
            </Card>
          </Animated.View>
        ) : null}
      </ScrollView>

      <View
        style={{ paddingBottom: insets.bottom + 12 }}
        className="absolute inset-x-0 bottom-0 gap-2 border-t border-white/[0.06] bg-ink-900/80 px-5 pt-3"
      >
        <Button
          label={saving ? "Saving…" : isEditing ? "Update schedule" : "Create schedule"}
          icon="shield"
          disabled={saving}
          onPress={save}
        />
        {isEditing ? (
          <Button label="Delete schedule" variant="danger" icon="trash" onPress={remove} />
        ) : null}
      </View>
    </View>
  );
}

function StepButton({
  icon,
  onPress,
}: {
  icon: "plus" | "minus";
  onPress: () => void;
}) {
  return (
    <PressableScale haptic="none" onPress={onPress} activeScale={0.9} style={{ borderRadius: 999 }}>
      <View className="h-14 w-14 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04]">
        <Icon name={icon} size={22} color={palette.label} strokeWidth={2.2} />
      </View>
    </PressableScale>
  );
}
