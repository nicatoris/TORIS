import Foundation
import UserNotifications

/// The Safe Schedule eligibility reminder — one pending local notification,
/// re-synced whenever drinks or the schedule change.
enum Reminder {
    static let identifier = "ksafe-eligible"

    static func requestPermission() async -> Bool {
        let center = UNUserNotificationCenter.current()
        let settings = await center.notificationSettings()
        if settings.authorizationStatus == .authorized || settings.authorizationStatus == .provisional {
            return true
        }
        let granted = try? await center.requestAuthorization(options: [.alert, .sound])
        return granted ?? false
    }

    /// Replace any pending reminder with one at 9am on the eligible day.
    static func sync(eligibleDay: String?, enabled: Bool) async {
        let center = UNUserNotificationCenter.current()
        center.removePendingNotificationRequests(withIdentifiers: [identifier])
        guard enabled, let day = eligibleDay else { return }

        var comps = Calendar.current.dateComponents([.year, .month, .day], from: Days.date(from: day))
        comps.hour = 9
        comps.minute = 0
        guard let fireDate = Calendar.current.date(from: comps), fireDate > Date() else { return }

        let content = UNMutableNotificationContent()
        content.title = "Your Safe Schedule is complete 🌿"
        content.body = "You've reached your no-kratom goal. Stay mindful if you choose to drink today."
        content.sound = .default

        let trigger = UNCalendarNotificationTrigger(dateMatching: comps, repeats: false)
        let request = UNNotificationRequest(identifier: identifier, content: content, trigger: trigger)
        try? await center.add(request)
    }
}
