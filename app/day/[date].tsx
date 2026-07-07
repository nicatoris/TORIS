import React from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useKratom } from "@/store/KratomStore";
import { PressableScale } from "@/components/PressableScale";
import { Button, Card, DrinkBadge, EmptyState, ModalHeader } from "@/components/ui";
import { haptics } from "@/lib/haptics";
import { formatLong, relativeLabel } from "@/lib/dates";
import { DRINK_META } from "@/lib/types";

export default function DayDetail() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const day = String(date);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { drinksForDay, deleteDrink } = useKratom();

  const drinks = drinksForDay(day);

  function confirmDelete(id: string, label: string) {
    Alert.alert(
      "Delete this entry?",
      `Remove the ${label} logged on ${formatLong(day)}? This can't be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteDrink(id);
            haptics.warning();
            // If that was the last entry for the day, close the sheet.
            if (drinksForDay(day).length <= 1) router.back();
          },
        },
      ],
    );
  }

  return (
    <View className="flex-1 bg-ink-900">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 20,
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 100,
        }}
      >
        <ModalHeader title={relativeLabel(day)} subtitle={formatLong(day)} />

        {drinks.length === 0 ? (
          <EmptyState
            emoji="🍃"
            title="No kratom this day"
            body="You didn't log any kratom or extract on this date — a clean day."
          />
        ) : (
          drinks.map((d, i) => (
            <Animated.View
              key={d.id}
              entering={FadeInDown.duration(300).delay(i * 60)}
              className="mb-3"
            >
              <Card>
                <View className="flex-row items-start justify-between">
                  <View className="flex-row items-center gap-3">
                    <Text className="text-3xl">{DRINK_META[d.type].emoji}</Text>
                    <View>
                      <Text className="text-lg font-bold text-white">
                        {DRINK_META[d.type].label}
                      </Text>
                      <Text className="text-xs text-ink-500">
                        Logged{" "}
                        {new Date(d.createdAt).toLocaleTimeString([], {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </Text>
                    </View>
                  </View>
                  <DrinkBadge type={d.type} />
                </View>

                {d.note ? (
                  <Text className="mt-3 rounded-2xl bg-ink-700 px-4 py-3 text-sm leading-5 text-ink-500">
                    “{d.note}”
                  </Text>
                ) : null}

                <PressableScale
                  haptic="none"
                  onPress={() => confirmDelete(d.id, DRINK_META[d.type].label)}
                  className="mt-3 self-start"
                  style={{ borderRadius: 999 }}
                >
                  <View className="flex-row items-center gap-1.5 rounded-full border border-danger-500/40 bg-danger-500/10 px-4 py-2">
                    <Text className="text-xs">🗑️</Text>
                    <Text className="text-xs font-bold text-danger-400">
                      Delete entry
                    </Text>
                  </View>
                </PressableScale>
              </Card>
            </Animated.View>
          ))
        )}
      </ScrollView>

      <View
        style={{ paddingBottom: insets.bottom + 12 }}
        className="absolute inset-x-0 bottom-0 border-t border-white/[0.06] bg-ink-900 px-5 pt-3"
      >
        <Button label="Close" variant="secondary" onPress={() => router.back()} />
      </View>
    </View>
  );
}
