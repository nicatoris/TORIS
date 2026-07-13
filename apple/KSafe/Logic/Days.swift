import Foundation

/// Local-calendar-day helpers. Day keys are "yyyy-MM-dd" strings in the
/// user's timezone, so a drink at 11pm and one at 1am land on different
/// days — matching lived experience, and matching the data model of the
/// original app.
enum Days {
    private static let formatter: DateFormatter = {
        let f = DateFormatter()
        f.calendar = Calendar(identifier: .gregorian)
        f.locale = Locale(identifier: "en_US_POSIX")
        f.dateFormat = "yyyy-MM-dd"
        return f
    }()

    static var today: String {
        return key(for: Date())
    }

    static func key(for date: Date) -> String {
        return formatter.string(from: date)
    }

    /// Local midnight for a day key.
    static func date(from key: String) -> Date {
        return formatter.date(from: key) ?? Date()
    }

    static func add(_ days: Int, to key: String) -> String {
        let base = date(from: key)
        let shifted = Calendar.current.date(byAdding: .day, value: days, to: base) ?? base
        return formatter.string(from: shifted)
    }

    /// Whole-day difference `a - b` (a later => positive). Rounded from the
    /// raw interval so DST-shortened days still count as one day, matching
    /// the original implementation's Math.round(ms / 86400000).
    static func between(_ a: String, _ b: String) -> Int {
        let interval = date(from: a).timeIntervalSince(date(from: b))
        return Int((interval / 86400.0).rounded())
    }

    /// e.g. "July 6, 2026"
    static func formatLong(_ key: String) -> String {
        return date(from: key).formatted(.dateTime.month(.wide).day().year())
    }

    /// e.g. "Mon, Jul 6"
    static func formatShort(_ key: String) -> String {
        return date(from: key).formatted(.dateTime.weekday(.abbreviated).month(.abbreviated).day())
    }

    /// e.g. "Jul 6" — used on the date chips.
    static func formatChip(_ key: String) -> String {
        return date(from: key).formatted(.dateTime.month(.abbreviated).day())
    }

    static func weekdayAbbrev(_ key: String) -> String {
        return date(from: key).formatted(.dateTime.weekday(.abbreviated))
    }

    static func dayNumber(_ key: String) -> Int {
        return Calendar.current.component(.day, from: date(from: key))
    }

    static func monthTitle(_ key: String) -> String {
        return date(from: key).formatted(.dateTime.month(.wide).year())
    }

    static func relativeLabel(_ key: String) -> String {
        let diff = between(today, key)
        if diff == 0 { return "Today" }
        if diff == 1 { return "Yesterday" }
        if diff == -1 { return "Tomorrow" }
        if diff > 1 { return "\(diff) days ago" }
        return "in \(-diff) days"
    }
}
