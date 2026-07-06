import React, { useMemo, useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useKratom } from "@/store/KratomStore";
import { PressableScale } from "@/components/PressableScale";
import { Button, ModalHeader, SectionLabel } from "@/components/ui";
import { haptics } from "@/lib/haptics";
import { addDays, formatShort, relativeLabel, todayKey } from "@/lib/dates";
import { DrinkType, DRINK_META } from "@/lib/types";

export default function AddDrink() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addDrink } = useKratom();

  const [type, setType] = useState<DrinkType | null>(null);
  const [date, setDate] = useState<string>(todayKey());
  const [note, setNote] = useState("");

  // Last 30 days as selectable chips (most recent first).
  const days = useMemo(() => {
    const today = todayKey();
    return Array.from({ length: 30 }, (_, i) => addDays(today, -i));
  }, []);

  const canSave = type !== null;

  function save() {
    if (!type) {
      haptics.warning();
      return;
    }
    addDrink({ type, date, note });
    haptics.success();
    router.back();
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <View className="flex-1 bg-ink-900">
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingTop: 20,
            paddingHorizontal: 20,
            paddingBottom: insets.bottom + 120,
          }}
        >
          <ModalHeader
            title="Add a drink"
            subtitle="Log what you had and when."
          />

          <SectionLabel>What did you drink?</SectionLabel>
          <View className="mb-6 flex-row gap-3">
            {(Object.keys(DRINK_META) as DrinkType[]).map((t) => (
              <TypeCard
                key={t}
                type={t}
                selected={type === t}
                onSelect={() => {
                  haptics.selection();
                  setType(t);
                }}
              />
            ))}
          </View>

          <SectionLabel>When?</SectionLabel>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-2 -mx-1"
            contentContainerStyle={{ paddingHorizontal: 4, gap: 8 }}
          >
            {days.map((d) => {
              const selected = d === date;
              return (
                <PressableScale
                  key={d}
                  haptic="selection"
                  onPress={() => setDate(d)}
                  style={{ borderRadius: 18 }}
                >
                  <View
                    className={`items-center rounded-2xl border px-4 py-3 ${
                      selected
                        ? "border-leaf-400 bg-leaf-500/15"
                        : "border-ink-600 bg-ink-800"
                    }`}
                  >
                    <Text
                      className={`text-[11px] font-semibold ${
                        selected ? "text-leaf-300" : "text-ink-500"
                      }`}
                    >
                      {relativeLabel(d) === "Today" ||
                      relativeLabel(d) === "Yesterday"
                        ? relativeLabel(d)
                        : formatShort(d).split(",")[0]}
                    </Text>
                    <Text
                      className={`text-base font-bold ${
                        selected ? "text-white" : "text-ink-500"
                      }`}
                    >
                      {formatShort(d).split(" ").slice(1).join(" ")}
                    </Text>
                  </View>
                </PressableScale>
              );
            })}
          </ScrollView>
          <Text className="mb-6 text-xs text-ink-500">
            Selected: {relativeLabel(date)} · {formatShort(date)}
          </Text>

          <SectionLabel>Note (optional)</SectionLabel>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Dose, brand, how you felt…"
            placeholderTextColor="#3A4A5D"
            multiline
            className="min-h-[64px] rounded-2xl border border-ink-600 bg-ink-800 px-4 py-3 text-base text-white"
            style={{ textAlignVertical: "top" }}
          />
        </ScrollView>

        <View
          style={{ paddingBottom: insets.bottom + 12 }}
          className="absolute inset-x-0 bottom-0 border-t border-ink-700 bg-ink-900 px-5 pt-3"
        >
          <Button
            label={canSave ? "Log drink" : "Choose a type first"}
            icon={canSave ? "✓" : undefined}
            disabled={!canSave}
            onPress={save}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

function TypeCard({
  type,
  selected,
  onSelect,
}: {
  type: DrinkType;
  selected: boolean;
  onSelect: () => void;
}) {
  const meta = DRINK_META[type];
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  React.useEffect(() => {
    scale.value = withTiming(selected ? 1.03 : 1, { duration: 160 });
  }, [selected, scale]);

  const tint =
    type === "extract"
      ? selected
        ? "border-extract-400 bg-extract-500/15"
        : "border-ink-600 bg-ink-800"
      : selected
        ? "border-tea-400 bg-tea-500/15"
        : "border-ink-600 bg-ink-800";

  return (
    <Animated.View style={style} className="flex-1">
      <PressableScale onPress={onSelect} haptic="none" style={{ borderRadius: 24 }}>
        <View className={`items-center rounded-3xl border-2 px-4 py-6 ${tint}`}>
          <Text className="text-4xl">{meta.emoji}</Text>
          <Text className="mt-3 text-lg font-bold text-white">{meta.label}</Text>
          <Text className="mt-1 text-center text-[11px] leading-4 text-ink-500">
            {meta.blurb}
          </Text>
          {selected ? (
            <Animated.View entering={FadeIn.duration(200)} className="mt-3">
              <Text
                className={`text-xs font-bold ${
                  type === "extract" ? "text-extract-400" : "text-tea-400"
                }`}
              >
                ✓ Selected
              </Text>
            </Animated.View>
          ) : null}
        </View>
      </PressableScale>
    </Animated.View>
  );
}
