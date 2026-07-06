import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

/** Thin wrappers so callers don't sprinkle platform checks everywhere. */
const enabled = Platform.OS !== "web";

export const haptics = {
  light() {
    if (enabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  },
  medium() {
    if (enabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  },
  heavy() {
    if (enabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  },
  selection() {
    if (enabled) Haptics.selectionAsync();
  },
  success() {
    if (enabled)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  },
  warning() {
    if (enabled)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  },
  error() {
    if (enabled)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  },
};
