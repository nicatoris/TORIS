import React from "react";
import { Text, View, ViewProps } from "react-native";
import { useRouter } from "expo-router";
import { PressableScale } from "./PressableScale";
import { DrinkType, DRINK_META } from "@/lib/types";

/** Rounded surface card. */
export function Card({
  children,
  className = "",
  ...rest
}: ViewProps & { className?: string }) {
  return (
    <View
      {...rest}
      className={`rounded-4xl border border-white/[0.06] bg-ink-800 p-5 ${className}`}
    >
      {children}
    </View>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text className="mb-2 text-xs font-semibold uppercase tracking-widest text-ink-500">
      {children}
    </Text>
  );
}

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  icon?: string;
  disabled?: boolean;
  className?: string;
}

export function Button({
  label,
  onPress,
  variant = "primary",
  icon,
  disabled,
  className = "",
}: ButtonProps) {
  const styles: Record<NonNullable<ButtonProps["variant"]>, string> = {
    primary: "bg-leaf-500",
    secondary: "bg-ink-700",
    ghost: "bg-transparent border border-white/[0.08]",
    danger: "bg-danger-500/15",
  };
  const textStyles: Record<NonNullable<ButtonProps["variant"]>, string> = {
    primary: "text-white",
    secondary: "text-white",
    ghost: "text-ink-500",
    danger: "text-danger-400",
  };
  return (
    <PressableScale
      haptic={variant === "primary" ? "medium" : "light"}
      disabled={disabled}
      onPress={onPress}
      className={className}
      style={{ borderRadius: 999 }}
    >
      <View
        className={`flex-row items-center justify-center gap-2 rounded-full px-6 py-4 ${styles[variant]}`}
      >
        {icon ? <Text className="text-[17px]">{icon}</Text> : null}
        <Text className={`text-[17px] font-semibold ${textStyles[variant]}`}>
          {label}
        </Text>
      </View>
    </PressableScale>
  );
}

/** Header used at the top of modal screens with a close affordance. */
export function ModalHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  const router = useRouter();
  return (
    <View className="mb-5 flex-row items-start justify-between">
      <View className="flex-1 pr-4">
        <Text className="text-3xl font-extrabold text-white">{title}</Text>
        {subtitle ? (
          <Text className="mt-1 text-sm text-ink-500">{subtitle}</Text>
        ) : null}
      </View>
      <PressableScale
        haptic="light"
        onPress={() => router.back()}
        style={{ borderRadius: 999 }}
      >
        <View className="h-10 w-10 items-center justify-center rounded-full bg-ink-700">
          <Text className="text-lg text-ink-500">✕</Text>
        </View>
      </PressableScale>
    </View>
  );
}

export function DrinkBadge({ type }: { type: DrinkType }) {
  const meta = DRINK_META[type];
  const tint =
    type === "extract"
      ? "bg-extract-500/15 border-extract-500/40"
      : "bg-leaf-500/15 border-leaf-500/40";
  const text = type === "extract" ? "text-extract-400" : "text-leaf-400";
  return (
    <View
      className={`flex-row items-center gap-1.5 self-start rounded-full border px-3 py-1 ${tint}`}
    >
      <Text className="text-xs">{meta.emoji}</Text>
      <Text className={`text-xs font-semibold ${text}`}>{meta.label}</Text>
    </View>
  );
}

/** Empty-state block. */
export function EmptyState({
  emoji,
  title,
  body,
}: {
  emoji: string;
  title: string;
  body: string;
}) {
  return (
    <View className="items-center px-6 py-12">
      <Text className="text-5xl">{emoji}</Text>
      <Text className="mt-4 text-center text-lg font-bold text-white">
        {title}
      </Text>
      <Text className="mt-1.5 text-center text-sm leading-5 text-ink-500">
        {body}
      </Text>
    </View>
  );
}
