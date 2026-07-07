import React from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useKratom } from "@/store/KratomStore";
import { PressableScale } from "@/components/PressableScale";
import { PaperBackground } from "@/components/PaperBackground";
import { Icon } from "@/components/Icon";
import { Button, Card, DrinkBadge, EmptyState, ModalHeader } from "@/components/ui";
import { haptics } from "@/lib/haptics";
import { formatLong, relativeLabel } from "@/lib/dates";
import { palette, shadow } from "@/lib/theme";

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
            if (drinksForDay(day).length <= 1) router.back();
          },
        },
      ],
    );
  }

  return (
    <View className="flex-1 bg-paper">
      <PaperBackground />
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
            icon="leaf"
            title="A clean day"
            body="No kratom or extract logged on this date."
          />
        ) : (
          drinks.map((d, i) => {
            const isExtract = d.type === "extract";
            const color = isExtract ? palette.extract : palette.accent;
            return (
              <Animated.View
                key={d.id}
                entering={FadeInDown.duration(360).delay(i * 70)}
                className="mb-3"
              >
                <Card>
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-3">
                      <View
                        className="h-12 w-12 items-center justify-center rounded-full"
                        style={{ backgroundColor: `${color}1A` }}
                      >
                        <Icon
                          name={isExtract ? "flask" : "leaf"}
                          size={24}
                          color={color}
                          strokeWidth={1.8}
                        />
                      </View>
                      <View>
                        <Text className="text-[17px] font-bold text-ink-900">
                          {isExtract ? "Extract" : "Leaf Tea"}
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
                    <Text className="mt-3 rounded-2xl bg-ink-900/[0.03] px-4 py-3 text-[14px] leading-5 text-ink-700">
                      “{d.note}”
                    </Text>
                  ) : null}

                  <PressableScale
                    haptic="none"
                    onPress={() => confirmDelete(d.id, isExtract ? "Extract" : "Leaf Tea")}
                    className="mt-3 self-start"
                    style={{ borderRadius: 999 }}
                  >
                    <View
                      className="flex-row items-center gap-1.5 rounded-full px-4 py-2"
                      style={{ backgroundColor: "rgba(180,68,60,0.10)" }}
                    >
                      <Icon name="trash" size={14} color={palette.danger} strokeWidth={2} />
                      <Text className="text-xs font-semibold" style={{ color: palette.danger }}>
                        Delete entry
                      </Text>
                    </View>
                  </PressableScale>
                </Card>
              </Animated.View>
            );
          })
        )}
      </ScrollView>

      <View
        style={{ paddingBottom: insets.bottom + 12, ...shadow.float }}
        className="absolute inset-x-0 bottom-0 border-t border-ink-900/[0.06] bg-paper px-5 pt-3"
      >
        <Button label="Close" variant="secondary" onPress={() => router.back()} />
      </View>
    </View>
  );
}
