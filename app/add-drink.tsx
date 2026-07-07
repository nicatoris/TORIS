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
  withSpring,
} from "react-native-reanimated";
import { useKratom } from "@/store/KratomStore";
import { PressableScale } from "@/components/PressableScale";
import { AuroraBackground } from "@/components/AuroraBackground";
import { SuccessBurst } from "@/components/SuccessBurst";
import { Icon } from "@/components/Icon";
import { Button, ModalHeader, SectionLabel } from "@/components/ui";
import { haptics } from "@/lib/haptics";
import { addDays, formatShort, relativeLabel, todayKey } from "@/lib/dates";
import { DrinkType, DRINK_META } from "@/lib/types";
import { palette, springs } from "@/lib/theme";

export default function AddDrink() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addDrink } = useKratom();

  const [type, setType] = useState<DrinkType | null>(null);
  const [date, setDate] = useState<string>(todayKey());
  const [note, setNote] = useState("");
  const [success, setSuccess] = useState<string | null>(null);

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
    setSuccess(`${DRINK_META[type].label} logged`);
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <View className="flex-1 bg-ink-900">
        <AuroraBackground />
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingTop: 20,
            paddingHorizontal: 20,
            paddingBottom: insets.bottom + 120,
          }}
        >
          <ModalHeader title="Add a drink" subtitle="Log what you had and when." />

          <SectionLabel>What did you drink?</SectionLabel>
          <View className="mb-7 mt-3 flex-row gap-3">
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

          <SectionLabel>When</SectionLabel>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-2 mt-3 -mx-1"
            contentContainerStyle={{ paddingHorizontal: 4, gap: 8 }}
          >
            {days.map((d) => {
              const selected = d === date;
              const rel = relativeLabel(d);
              const top = rel === "Today" || rel === "Yesterday" ? rel : formatShort(d).split(",")[0];
              return (
                <PressableScale
                  key={d}
                  haptic="selection"
                  onPress={() => setDate(d)}
                  style={{ borderRadius: 20 }}
                >
                  <View
                    className="items-center rounded-[20px] border px-4 py-3"
                    style={{
                      borderColor: selected ? `${palette.accent}66` : "rgba(255,255,255,0.06)",
                      backgroundColor: selected ? `${palette.accent}14` : "rgba(255,255,255,0.02)",
                    }}
                  >
                    <Text
                      className="text-[11px] font-semibold"
                      style={{ color: selected ? palette.accent : palette.label3 }}
                    >
                      {top}
                    </Text>
                    <Text
                      className="text-[15px] font-semibold"
                      style={{ color: selected ? palette.label : palette.label2 }}
                    >
                      {formatShort(d).split(" ").slice(1).join(" ")}
                    </Text>
                  </View>
                </PressableScale>
              );
            })}
          </ScrollView>
          <Text className="mb-7 text-xs text-ink-500">
            {relativeLabel(date)} · {formatShort(date)}
          </Text>

          <SectionLabel>Note</SectionLabel>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Dose, brand, how you felt…"
            placeholderTextColor={palette.label3}
            multiline
            className="mt-3 min-h-[70px] rounded-3xl border border-white/[0.06] bg-white/[0.02] px-4 py-3.5 text-[15px] text-white"
            style={{ textAlignVertical: "top" }}
          />
        </ScrollView>

        <View
          style={{ paddingBottom: insets.bottom + 12 }}
          className="absolute inset-x-0 bottom-0 border-t border-white/[0.06] bg-ink-900/80 px-5 pt-3"
        >
          <Button
            label={canSave ? "Log drink" : "Choose a type first"}
            icon={canSave ? "check" : undefined}
            disabled={!canSave}
            onPress={save}
          />
        </View>

        {success ? (
          <SuccessBurst label={success} onDone={() => router.back()} />
        ) : null}
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
  const isExtract = type === "extract";
  const color = isExtract ? palette.extract : palette.accent;

  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  React.useEffect(() => {
    scale.value = withSpring(selected ? 1.02 : 1, springs.press);
  }, [selected, scale]);

  return (
    <Animated.View style={style} className="flex-1">
      <PressableScale onPress={onSelect} haptic="none" style={{ borderRadius: 28 }}>
        <View
          className="items-center overflow-hidden rounded-4xl border px-4 py-6"
          style={{
            borderColor: selected ? `${color}80` : "rgba(255,255,255,0.06)",
            backgroundColor: selected ? `${color}12` : "rgba(255,255,255,0.02)",
          }}
        >
          {selected ? (
            <Animated.View
              entering={FadeIn.duration(200)}
              className="absolute right-3 top-3 h-6 w-6 items-center justify-center rounded-full"
              style={{ backgroundColor: color }}
            >
              <Icon name="check" size={14} color="#04140D" strokeWidth={2.6} />
            </Animated.View>
          ) : null}
          <View
            className="h-16 w-16 items-center justify-center rounded-full"
            style={{ backgroundColor: `${color}1A` }}
          >
            <Icon name={isExtract ? "flask" : "leaf"} size={30} color={color} strokeWidth={1.8} />
          </View>
          <Text className="mt-4 text-[17px] font-bold text-white">{meta.label}</Text>
          <Text className="mt-1 text-center text-[11px] leading-4 text-ink-500">
            {meta.blurb}
          </Text>
        </View>
      </PressableScale>
    </Animated.View>
  );
}
