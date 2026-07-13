import Foundation
import Observation

/// The single source of truth: raw drinks + schedule, persisted as JSON in
/// Application Support. Every derived number (streaks, eligibility, mg
/// totals, medals) is computed from this state, never stored alongside it.
@Observable
final class KratomStore {
    private(set) var drinks: [Drink] = []
    private(set) var schedule: Schedule?
    private(set) var earnedMedals: [String: Date] = [:]

    var stats: Stats {
        return Stats.compute(drinks: drinks, schedule: schedule)
    }

    var medalContext: MedalContext {
        return MedalContext(stats: stats, hasSchedule: schedule != nil)
    }

    init() {
        load()
    }

    // MARK: - Mutations

    func addDrink(type: DrinkType, date: String, note: String, mg: Int?) {
        var dose: Int? = nil
        if type == .extract, let mg = mg, mg > 0 { dose = mg }
        let trimmed = note.trimmingCharacters(in: .whitespacesAndNewlines)
        let drink = Drink(
            id: UUID().uuidString,
            type: type,
            date: date,
            createdAt: Date(),
            note: trimmed.isEmpty ? nil : trimmed,
            mg: dose
        )
        drinks.append(drink)
        drinks.sort { a, b in
            if a.date == b.date { return a.createdAt < b.createdAt }
            return a.date < b.date
        }
        didChange()
    }

    func deleteDrink(id: String) {
        drinks.removeAll { $0.id == id }
        didChange()
    }

    func drinks(on day: String) -> [Drink] {
        return drinks.filter { $0.date == day }
    }

    func setSchedule(daysOff: Int, notifyEnabled: Bool, mgLimit: Int) async {
        var allowNotify = notifyEnabled
        if notifyEnabled {
            allowNotify = await Reminder.requestPermission()
        }
        schedule = Schedule(
            daysOff: max(1, daysOff),
            createdAt: Date(),
            notifyEnabled: allowNotify,
            mgLimit: mgLimit > 0 ? mgLimit : nil
        )
        didChange()
    }

    func clearSchedule() {
        schedule = nil
        didChange()
    }

    // MARK: - Reactions

    private func didChange() {
        awardNewMedals()
        persist()
        let current = stats
        let notify = schedule?.notifyEnabled ?? false
        Task {
            await Reminder.sync(eligibleDay: current.nextEligibleDay, enabled: notify)
        }
    }

    private func awardNewMedals() {
        let ids = Medals.earnedIds(ctx: medalContext)
        let now = Date()
        for id in ids where earnedMedals[id] == nil {
            earnedMedals[id] = now
        }
    }

    // MARK: - Persistence

    private struct Persisted: Codable {
        var drinks: [Drink]
        var schedule: Schedule?
        var earnedMedals: [String: Date]
    }

    private static var fileURL: URL {
        let dir = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
        try? FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        return dir.appendingPathComponent("ksafe.json")
    }

    private func persist() {
        let snapshot = Persisted(drinks: drinks, schedule: schedule, earnedMedals: earnedMedals)
        if let data = try? JSONEncoder().encode(snapshot) {
            try? data.write(to: Self.fileURL, options: .atomic)
        }
    }

    private func load() {
        guard let data = try? Data(contentsOf: Self.fileURL),
              let snapshot = try? JSONDecoder().decode(Persisted.self, from: data)
        else { return }
        drinks = snapshot.drinks
        schedule = snapshot.schedule
        earnedMedals = snapshot.earnedMedals
    }
}
