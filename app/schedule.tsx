import React, { useState } from "react";
import { ScrollView, Switch, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeIn } from "react-native-reanimated";
import { useKratom } from "@/store/KratomStore";
import { PressableScale } from "@/components/PressableScale";
import { Button, Card, ModalHeader, SectionLabel } from "@/components/ui";
import { haptics } from "@/lib/haptics";
import { formatLong } from "@/lib/dates";

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
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 20,
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 140,
        }}
      >
        <ModalHeader
          title="Safe Schedule"
          subtitle="Set the kratom-free window you want to keep between drinks."
        />

        {/* Big day stepper */}
        <Card className="items-center">
          <SectionLabel>Days off between drinks</SectionLabel>
          <View className="flex-row items-center gap-6">
            <StepButton label="−" onPress={() => bump(-1)} />
            <View className="items-center" style={{ minWidth: 120 }}>
              <Text className="text-7xl font-black text-leaf-300">{days}</Text>
              <Text className="-mt-1 text-sm text-ink-500">
                {days === 1 ? "day" : "days"}
              </Text>
            </View>
            <StepButton label="+" onPress={() => bump(1)} />
          </View>

          <View className="mt-5 flex-row flex-wrap justify-center gap-2">
            {PRESETS.map((p) => (
              <PressableScale
                key={p}
                haptic="selection"
                onPress={() => setDays(p)}
                style={{ borderRadius: 999 }}
              >
                <View
                  className={`rounded-full border px-4 py-2 ${
                    days === p
                      ? "border-leaf-400 bg-leaf-500/15"
                      : "border-ink-600 bg-ink-800"
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      days === p ? "text-leaf-300" : "text-ink-500"
                    }`}
                  >
                    {p}d
                  </Text>
                </View>
              </PressableScale>
            ))}
          </View>
        </Card>

        {/* Notification toggle */}
        <Card className="mt-4 flex-row items-center justify-between">
          <View className="flex-1 pr-4">
            <Text className="text-base font-bold text-white">
              Remind me when eligible 🔔
            </Text>
            <Text className="mt-1 text-xs text-ink-500">
              Get a notification the morning your kratom-free goal is complete.
            </Text>
          </View>
          <Switch
            value={notify}
            onValueChange={(v) => {
              haptics.light();
              setNotify(v);
            }}
            trackColor={{ false: "#39393D", true: "#30D158" }}
            thumbColor="#FFFFFF"
            ios_backgroundColor="#39393D"
          />
        </Card>

        {/* Live preview */}
        {isEditing && stats.lastDrinkDay ? (
          <Animated.View entering={FadeIn} className="mt-4">
            <Card>
              <SectionLabel>Right now</SectionLabel>
              {stats.canDrink ? (
                <Text className="text-base font-bold text-leaf-300">
                  You're eligible to drink kratom today.
                </Text>
              ) : (
                <Text className="text-base font-bold text-warn-400">
                  {stats.daysUntilEligible} more{" "}
                  {stats.daysUntilEligible === 1 ? "day" : "days"} · eligible{" "}
                  {formatLong(stats.nextEligibleDay!)}
                </Text>
              )}
            </Card>
          </Animated.View>
        ) : null}
      </ScrollView>

      <View
        style={{ paddingBottom: insets.bottom + 12 }}
        className="absolute inset-x-0 bottom-0 gap-2 border-t border-white/[0.06] bg-ink-900 px-5 pt-3"
      >
        <Button
          label={saving ? "Saving…" : isEditing ? "Update schedule" : "Create schedule"}
          icon="🛡️"
          disabled={saving}
          onPress={save}
        />
        {isEditing ? (
          <Button label="Delete schedule" variant="danger" onPress={remove} />
        ) : null}
      </View>
    </View>
  );
}

function StepButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <PressableScale haptic="none" onPress={onPress} style={{ borderRadius: 999 }}>
      <View className="h-14 w-14 items-center justify-center rounded-full border border-ink-600 bg-ink-700">
        <Text className="text-3xl font-light text-white">{label}</Text>
      </View>
    </PressableScale>
  );
}
