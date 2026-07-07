import React from "react";
import { Text, View, ViewProps } from "react-native";
import { useRouter } from "expo-router";
import { PressableScale } from "./PressableScale";
import { Icon, IconName } from "./Icon";
import { DrinkType } from "@/lib/types";
import { palette, serif, shadow } from "@/lib/theme";

/** Floating white surface with a soft editorial shadow + hairline. */
export function Card({
  children,
  className = "",
  style,
  ...rest
}: ViewProps & { className?: string }) {
  return (
    <View
      {...rest}
      style={[shadow.card, style]}
      className={`rounded-3xl border border-ink-900/[0.06] bg-paper-card p-5 ${className}`}
    >
      {children}
    </View>
  );
}

/** Magazine-style kicker label. */
export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text className="text-[11px] font-semibold uppercase tracking-[2.5px] text-ink-400">
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
    secondary: palette.card,
    ghost: "transparent",
    danger: "rgba(180,68,60,0.10)",
  };
  const fg: Record<NonNullable<ButtonProps["variant"]>, string> = {
    primary: palette.onAccent,
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
          borderWidth: variant === "secondary" || variant === "ghost" ? 1 : 0,
          borderColor: palette.hairline,
          ...(variant === "primary" ? shadow.card : null),
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
        <Text
          className="text-[32px] text-ink-900"
          style={{ fontFamily: serif, letterSpacing: -0.5 }}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text className="mt-1.5 text-[13px] text-ink-500">{subtitle}</Text>
        ) : null}
      </View>
      <PressableScale
        haptic="light"
        onPress={() => router.back()}
        style={{ borderRadius: 999 }}
      >
        <View
          className="h-9 w-9 items-center justify-center rounded-full border border-ink-900/[0.06] bg-paper-card"
          style={shadow.card}
        >
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
      style={{ backgroundColor: `${color}16` }}
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
      <View
        className="h-16 w-16 items-center justify-center rounded-full border border-ink-900/[0.06] bg-paper-card"
        style={shadow.card}
      >
        <Icon name={icon} size={28} color={palette.label2} />
      </View>
      <Text
        className="mt-5 text-center text-[20px] text-ink-900"
        style={{ fontFamily: serif }}
      >
        {title}
      </Text>
      <Text className="mt-1.5 text-center text-[13px] leading-5 text-ink-500">
        {body}
      </Text>
    </View>
  );
}
