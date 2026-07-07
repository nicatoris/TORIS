import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { fromDayKey } from "./dates";

const ELIGIBLE_ID_KEY = "ksafe-eligible";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/** Ask for permission; returns true if granted. */
export async function requestNotificationPermission(): Promise<boolean> {
  const settings = await Notifications.getPermissionsAsync();
  let granted =
    settings.granted ||
    settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
  if (!granted) {
    const req = await Notifications.requestPermissionsAsync();
    granted =
      req.granted ||
      req.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
  }
  if (granted && Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("eligibility", {
      name: "Safe Schedule",
      importance: Notifications.AndroidImportance.DEFAULT,
      lightColor: "#30D158",
    });
  }
  return granted;
}

/** Cancel any pending eligibility reminder. */
export async function cancelEligibilityReminder(): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(ELIGIBLE_ID_KEY);
  } catch {
    // no-op: nothing scheduled
  }
}

/**
 * Schedule a local reminder for the morning the user becomes eligible again.
 * Replaces any previously scheduled reminder. No-ops for past/now dates.
 */
export async function scheduleEligibilityReminder(
  eligibleDayKey: string | null,
): Promise<void> {
  await cancelEligibilityReminder();
  if (!eligibleDayKey) return;

  const target = fromDayKey(eligibleDayKey);
  target.setHours(9, 0, 0, 0); // 9am on the eligible day
  if (target.getTime() <= Date.now()) return;

  await Notifications.scheduleNotificationAsync({
    identifier: ELIGIBLE_ID_KEY,
    content: {
      title: "Your Safe Schedule is complete 🌿",
      body: "You've reached your no-kratom goal. Stay mindful if you choose to drink today.",
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: target,
      channelId: "eligibility",
    },
  });
}
