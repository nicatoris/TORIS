import Foundation

struct Milestone: Equatable {
    let days: Int
    let name: String
}

/// Every derived tracking number, computed as a pure function of the stored
/// drinks + schedule so the UI can never drift out of sync with the data.
struct Stats {
    var hasData: Bool
    var drinkDays: [String]
    var lastDrinkDay: String?
    var daysSinceLast: Int
    var currentStreak: Int
    var longestStreak: Int
    var recordsBroken: Int
    var scheduleSuccesses: Int
    var canDrink: Bool
    var nextEligibleDay: String?
    var daysUntilEligible: Int
    var todayExtractMg: Int
    var mgLimit: Int?
    var mgRemaining: Int?
    var overMgLimit: Bool

    static let milestones: [Milestone] = [
        Milestone(days: 3, name: "Fresh Start"),
        Milestone(days: 7, name: "Clear Week"),
        Milestone(days: 14, name: "Fortnight Free"),
        Milestone(days: 30, name: "Full Moon"),
        Milestone(days: 90, name: "Turned Season"),
    ]

    static func nextMilestone(after current: Int) -> Milestone? {
        return milestones.first { $0.days > current }
    }

    static func compute(drinks: [Drink], schedule: Schedule?) -> Stats {
        let today = Days.today
        let drinkDays = Array(Set(drinks.map { $0.date })).sorted()
        let hasData = !drinkDays.isEmpty
        let lastDrinkDay = drinkDays.last

        // Completed no-kratom gaps between consecutive drink days, plus the
        // ongoing gap from the last drink until today.
        var offStreaks: [Int] = []
        if drinkDays.count > 1 {
            for i in 1..<drinkDays.count {
                offStreaks.append(Days.between(drinkDays[i], drinkDays[i - 1]) - 1)
            }
        }
        var ongoing = 0
        if let last = lastDrinkDay {
            ongoing = max(0, Days.between(today, last))
        }

        let allStreaks = offStreaks + [ongoing]
        let longestStreak = hasData ? (allStreaks.max() ?? 0) : 0

        // Records broken: walk streaks chronologically; count each time a new
        // value strictly beats the running best once a meaningful best (>=3)
        // exists.
        var runningMax = 0
        var recordsBroken = 0
        for s in allStreaks {
            if runningMax >= 3 && s > runningMax { recordsBroken += 1 }
            if s > runningMax { runningMax = s }
        }

        // Schedule honored cycles: completed gaps that met the required days.
        var scheduleSuccesses = 0
        if let sched = schedule, sched.daysOff > 0 {
            for off in offStreaks where off >= sched.daysOff {
                scheduleSuccesses += 1
            }
        }

        // Eligibility
        var canDrink = true
        var nextEligibleDay: String? = nil
        var daysUntilEligible = 0
        if let sched = schedule, sched.daysOff > 0, let last = lastDrinkDay {
            let eligibleOn = Days.add(sched.daysOff, to: last)
            let remaining = Days.between(eligibleOn, today)
            if remaining > 0 {
                canDrink = false
                nextEligibleDay = eligibleOn
                daysUntilEligible = remaining
            }
        }

        // Today's extract intake vs. the schedule's daily mg limit.
        var todayExtractMg = 0
        for d in drinks where d.type == .extract && d.date == today {
            todayExtractMg += d.mg ?? 0
        }
        var mgLimit: Int? = nil
        if let limit = schedule?.mgLimit, limit > 0 { mgLimit = limit }
        var mgRemaining: Int? = nil
        if let limit = mgLimit { mgRemaining = max(0, limit - todayExtractMg) }
        let overMgLimit = mgLimit != nil && todayExtractMg > (mgLimit ?? 0)

        return Stats(
            hasData: hasData,
            drinkDays: drinkDays,
            lastDrinkDay: lastDrinkDay,
            daysSinceLast: ongoing,
            currentStreak: ongoing,
            longestStreak: longestStreak,
            recordsBroken: recordsBroken,
            scheduleSuccesses: scheduleSuccesses,
            canDrink: canDrink,
            nextEligibleDay: nextEligibleDay,
            daysUntilEligible: daysUntilEligible,
            todayExtractMg: todayExtractMg,
            mgLimit: mgLimit,
            mgRemaining: mgRemaining,
            overMgLimit: overMgLimit
        )
    }
}
