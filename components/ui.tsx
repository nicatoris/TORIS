import React from "react";
import { Text, View, ViewProps } from "react-native";
import { useRouter } from "expo-router";
import { PressableScale } from "./PressableScale";
import { Icon, IconName } from "./Icon";
import { DrinkType } from "@/lib/types";
import { palette } from "@/lib/theme";

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
    <Text className="text-[11px] font-semibold uppercase tracking-[2px] text-ink-500">
      {children}
    </Text>
  );
}

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  icon?: IconName;
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
  const bg: Record<NonNullable<ButtonProps["variant"]>, string> = {
    primary: palette.accent,
    secondary: "rgba(255,255,255,0.06)",
    ghost: "transparent",
    danger: "rgba(255,94,87,0.12)",
  };
  const fg: Record<NonNullable<ButtonProps["variant"]>, string> = {
    primary: "#04140D",
    secondary: palette.label,
    ghost: palette.label2,
    danger: palette.danger,
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
        className="flex-row items-center justify-center gap-2 rounded-full py-[17px]"
        style={{
          backgroundColor: bg[variant],
          borderWidth: variant === "ghost" ? 1 : 0,
          borderColor: "rgba(255,255,255,0.1)",
        }}
      >
        {icon ? (
          <Icon name={icon} size={19} color={fg[variant]} strokeWidth={2.2} />
        ) : null}
        <Text className="text-[17px] font-semibold" style={{ color: fg[variant] }}>
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
    <View className="mb-6 flex-row items-start justify-between">
      <View className="flex-1 pr-4 pt-1">
        <Text className="text-[30px] font-bold tracking-tight text-white">
          {title}
        </Text>
        {subtitle ? (
          <Text className="mt-1 text-[13px] text-ink-500">{subtitle}</Text>
        ) : null}
      </View>
      <PressableScale
        haptic="light"
        onPress={() => router.back()}
        style={{ borderRadius: 999 }}
      >
        <View className="h-9 w-9 items-center justify-center rounded-full bg-white/[0.06]">
          <Icon name="close" size={18} color={palette.label2} />
        </View>
      </PressableScale>
    </View>
  );
}

export function DrinkBadge({ type }: { type: DrinkType }) {
  const isExtract = type === "extract";
  const color = isExtract ? palette.extract : palette.accent;
  return (
    <View
      className="flex-row items-center gap-1.5 self-start rounded-full px-3 py-1.5"
      style={{ backgroundColor: `${color}1A` }}
    >
      <Icon name={isExtract ? "flask" : "leaf"} size={13} color={color} strokeWidth={2} />
      <Text className="text-xs font-semibold" style={{ color }}>
        {isExtract ? "Extract" : "Leaf Tea"}
      </Text>
    </View>
  );
}

/** Empty-state block. */
export function EmptyState({
  icon,
  title,
  body,
}: {
  icon: IconName;
  title: string;
  body: string;
}) {
  return (
    <View className="items-center px-8 py-16">
      <View className="h-16 w-16 items-center justify-center rounded-full border border-white/[0.07] bg-white/[0.03]">
        <Icon name={icon} size={28} color={palette.label2} />
      </View>
      <Text className="mt-5 text-center text-[17px] font-semibold text-white">
        {title}
      </Text>
      <Text className="mt-1.5 text-center text-[13px] leading-5 text-ink-500">
        {body}
      </Text>
    </View>
  );
}
