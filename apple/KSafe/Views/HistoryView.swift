import SwiftUI

struct HistoryView: View {
    @Environment(KratomStore.self) private var store

    private struct DaySummary: Identifiable {
        let day: String
        let drinks: [Drink]
        let types: [DrinkType]
        let extractMg: Int
        var id: String { day }
    }

    private var sections: [(title: String, days: [DaySummary])] {
        var byDay: [String: [Drink]] = [:]
        for d in store.drinks {
            byDay[d.date, default: []].append(d)
        }
        let summaries = byDay
            .map { key, list in
                DaySummary(
                    day: key,
                    drinks: list,
                    types: DrinkType.allCases.filter { t in list.contains { $0.type == t } },
                    extractMg: list.reduce(0) { $0 + ($1.mg ?? 0) }
                )
            }
            .sorted { $0.day > $1.day }

        var groups: [(title: String, days: [DaySummary])] = []
        for summary in summaries {
            let title = Days.monthTitle(summary.day)
            if let last = groups.indices.last, groups[last].title == title {
                groups[last].days.append(summary)
            } else {
                groups.append((title: title, days: [summary]))
            }
        }
        return groups
    }

    var body: some View {
        NavigationStack {
            ZStack {
                LiquidBackground()

                ScrollView(showsIndicators: false) {
                    VStack(alignment: .leading, spacing: 10) {
                        ModalHeader(
                            title: "Intake history",
                            subtitle: historySubtitle
                        )

                        if store.drinks.isEmpty {
                            EmptyStateView(
                                icon: "clock.arrow.circlepath",
                                title: "Nothing logged yet",
                                body: "Your kratom and extract history will appear here once you add a drink."
                            )
                        } else {
                            ForEach(sections, id: \.title) { section in
                                SectionLabel(text: section.title)
                                    .padding(.top, 12)
                                ForEach(section.days) { summary in
                                    NavigationLink(value: summary.day) {
                                        dayRow(summary)
                                    }
                                    .buttonStyle(PressableStyle(scale: 0.98))
                                }
                            }
                        }
                    }
                    .padding(.horizontal, 20)
                    .padding(.bottom, 30)
                }
            }
            .navigationDestination(for: String.self) { day in
                DayDetailView(day: day)
            }
            .toolbar(.hidden, for: .navigationBar)
        }
    }

    private var historySubtitle: String {
        let count = store.drinks.count
        let dayCount = Set(store.drinks.map { $0.date }).count
        let drinkWord = count == 1 ? "drink" : "drinks"
        let dayWord = dayCount == 1 ? "day" : "days"
        return "\(count) \(drinkWord) logged across \(dayCount) \(dayWord)"
    }

    private func dayRow(_ summary: DaySummary) -> some View {
        var subtitle = "\(Days.relativeLabel(summary.day)) · \(summary.drinks.count) \(summary.drinks.count == 1 ? "drink" : "drinks")"
        if summary.extractMg > 0 { subtitle += " · \(summary.extractMg) mg" }

        return HStack(spacing: 12) {
            Text("\(Days.dayNumber(summary.day))")
                .font(.system(size: 18, weight: .semibold))
                .monospacedDigit()
                .foregroundStyle(Theme.label)
                .frame(width: 46, height: 46)
                .background {
                    RoundedRectangle(cornerRadius: 14, style: .continuous)
                        .fill(Color.white.opacity(0.05))
                }

            VStack(alignment: .leading, spacing: 2) {
                Text(Days.formatShort(summary.day))
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundStyle(Theme.label)
                Text(subtitle)
                    .font(.system(size: 12))
                    .foregroundStyle(Theme.label3)
            }

            Spacer()

            HStack(spacing: 6) {
                ForEach(summary.types) { t in
                    DrinkBadge(type: t)
                }
            }

            Image(systemName: "chevron.right")
                .font(.system(size: 12, weight: .semibold))
                .foregroundStyle(Theme.label3)
        }
        .padding(12)
        .glassCard(radius: 22)
    }
}

struct DrinkBadge: View {
    let type: DrinkType

    var body: some View {
        HStack(spacing: 5) {
            Image(systemName: type.symbol)
                .font(.system(size: 10, weight: .semibold))
            Text(type.label)
                .font(.system(size: 11, weight: .semibold))
        }
        .foregroundStyle(type.tint)
        .padding(.horizontal, 10)
        .padding(.vertical, 6)
        .background(Capsule().fill(type.tint.opacity(0.14)))
    }
}

struct EmptyStateView: View {
    let icon: String
    let title: String
    let body_: String

    init(icon: String, title: String, body: String) {
        self.icon = icon
        self.title = title
        self.body_ = body
    }

    var body: some View {
        VStack(spacing: 14) {
            Image(systemName: icon)
                .font(.system(size: 26))
                .foregroundStyle(Theme.label2)
                .frame(width: 64, height: 64)
                .glassCard(radius: 32)
            Text(title)
                .font(.system(size: 17, weight: .semibold))
                .foregroundStyle(Theme.label)
            Text(body_)
                .font(.system(size: 13))
                .foregroundStyle(Theme.label3)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 60)
        .padding(.horizontal, 24)
    }
}
