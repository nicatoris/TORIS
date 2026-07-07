import "@/global.css";
import React from "react";
import { View, ActivityIndicator } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { KratomProvider, useKratom } from "@/store/KratomStore";

const MODAL = {
  presentation: "modal" as const,
  animation: "slide_from_bottom" as const,
};

function RootNavigator() {
  const { ready } = useKratom();

  if (!ready) {
    return (
      <View className="flex-1 items-center justify-center bg-paper">
        <ActivityIndicator color="#2F5D45" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#F4F1E9" },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="add-drink" options={MODAL} />
      <Stack.Screen name="history" options={MODAL} />
      <Stack.Screen name="medals" options={MODAL} />
      <Stack.Screen name="schedule" options={MODAL} />
      <Stack.Screen name="day/[date]" options={MODAL} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <KratomProvider>
          <StatusBar style="dark" />
          <RootNavigator />
        </KratomProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
