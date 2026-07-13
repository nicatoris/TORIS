import SwiftUI

enum Route: Identifiable {
    case addDrink
    case schedule
    case history
    case medals
    case day(String)

    var id: String {
        switch self {
        case .addDrink: return "addDrink"
        case .schedule: return "schedule"
        case .history: return "history"
        case .medals: return "medals"
        case .day(let key): return "day-\(key)"
        }
    }
}

struct HomeView: View {
    @Environment(KratomStore.self) private var store
    @State private var route: Route?

    var body: some View {
        let stats = store.stats
        ZStack {
            LiquidBackground()

            ScrollView(showsIndicators: false) {
                VStack(spacing: 12) {
                    masthead
                    hero(stats)
                    progressRule(stats)
                    streakStrip(stats)
                    scheduleStatus(stats)
                    calendarCard
                    navList
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 24)
            }
        }
        .safeAreaInset(edge: .bottom) { dock }
        .sheet(item: $route) { destination(for: $0) }
    }

    @ViewBuilder
    private func destination(for route: Route) -> some View {
        Group {
            switch route {
            case .addDrink:
                AddDrinkView()
            case .schedule:
                ScheduleView()
            case .history:
                HistoryView()
            case .medals:
                MedalsView()
            case .day(let key):
                NavigationStack { DayDetailView(day: key) }
            }
        }
        .preferredColorScheme(.dark)
        .presentationDragIndicator(.visible)
    }

    // MARK: - Sections

    private var masthead: some View {
        HStack {
            Text("KSafe")
                .font(.system(size: 22, weight: .bold))
                .foregroundStyle(Theme.silver)
            Spacer()
            Button {
                Haptics.light()
                route = .schedule
            } label: {
                Image(systemName: "shield")
                    .font(.system(size: 16, weight: .medium))
                    .foregroundStyle(Theme.label2)
                    .frame(width: 40, height: 40)
                    .glassCard(radius: 20)
            }
            .buttonStyle(PressableStyle())
        }
        .padding(.top, 6)
    }

    private func hero(_ stats: Stats) -> some View {
        VStack(spacing: 6) {
            SectionLabel(text: "Kratom-free for")
                .padding(.top, 26)

            Text("\(stats.daysSinceLast)")
                .font(.system(size: 110, weight: .thin))
                .monospacedDigit()
                .tracking(-2)
                .foregroundStyle(Theme.silver)
                .shimmer()
                .contentTransition(.numericText())
                .animation(.spring(response: 0.8, dampingFraction: 0.9), value: stats.daysSinceLast)

            Text(stats.daysSinceLast == 1 ? "day" : "days")
                .font(.system(size: 15))
                .foregroundStyle(Theme.label2)

            if stats.todayExtractMg > 0 {
                mgPill(stats)
                    .padding(.top, 10)
            }
        }
    }

    private func mgPill(_ stats: Stats) -> some View {
        let over = stats.overMgLimit
        let tint = over ? Theme.danger : Theme.copper
        var text = "\(stats.todayExtractMg)"
        if let limit = stats.mgLimit { text += " / \(limit)" }
        text += " mg extract today"

        return HStack(spacing: 7) {
            Image(systemName: "testtube.2")
                .font(.system(size: 12, weight: .semibold))
            Text(text)
                .font(.system(size: 13, weight: .semibold))
        }
        .foregroundStyle(tint)
        .padding(.horizontal, 14)
        .padding(.vertical, 8)
        .background {
            Capsule().fill(tint.opacity(0.14))
            Capsule().strokeBorder(tint.opacity(0.3), lineWidth: 1)
        }
    }

    private func progressRule(_ stats: Stats) -> some View {
        var progress = 0.0
        var caption = "Log your first drink to begin"
        var goal = ""
        var tint = Theme.emerald

        if stats.hasData {
            if let schedule = store.schedule {
                if stats.canDrink {
                    progress = 1
                    caption = "You're clear to drink today"
                } else {
                    progress = Double(schedule.daysOff - stats.daysUntilEligible) / Double(schedule.daysOff)
                    caption = "\(stats.daysUntilEligible) \(stats.daysUntilEligible == 1 ? "day" : "days") until your window opens"
                    goal = "\(schedule.daysOff)D"
                    tint = Theme.warn
                }
            } else if let milestone = Stats.nextMilestone(after: stats.currentStreak) {
                progress = Double(stats.currentStreak) / Double(milestone.days)
                let left = milestone.days - stats.currentStreak
                caption = "\(left) \(left == 1 ? "day" : "days") to \(milestone.name)"
                goal = milestone.name.uppercased()
            } else {
                progress = 1
                caption = "Every milestone cleared"
            }
        }

        return VStack(spacing: 8) {
            HStack {
                Text(caption)
                    .font(.system(size: 13, weight: .medium))
                    .foregroundStyle(stats.canDrink && store.schedule != nil ? Theme.emerald : Theme.label2)
                Spacer()
                if !goal.isEmpty {
                    Text(goal)
                        .font(.system(size: 11, weight: .semibold))
                        .tracking(1)
                        .foregroundStyle(Theme.label3)
                }
            }
            MetalProgressBar(progress: progress, tint: tint)
        }
        .padding(.top, 14)
    }

    private func streakStrip(_ stats: Stats) -> some View {
        HStack(spacing: 0) {
            stat(icon: "flame.fill", value: stats.currentStreak, label: "Current streak")
            Rectangle()
                .fill(Color.white.opacity(0.08))
                .frame(width: 1, height: 40)
            stat(icon: "trophy.fill", value: stats.longestStreak, label: "Longest streak")
        }
        .padding(.vertical, 18)
        .glassCard()
        .padding(.top, 12)
    }

    private func stat(icon: String, value: Int, label: String) -> some View {
        VStack(spacing: 3) {
            HStack(spacing: 6) {
                Image(systemName: icon)
                    .font(.system(size: 13))
                    .foregroundStyle(Theme.emerald)
                Text("\(value)")
                    .font(.system(size: 26, weight: .semibold))
                    .monospacedDigit()
                    .foregroundStyle(Theme.label)
            }
            Text(label)
                .font(.system(size: 11))
                .foregroundStyle(Theme.label3)
        }
        .frame(maxWidth: .infinity)
    }

    @ViewBuilder
    private func scheduleStatus(_ stats: Stats) -> some View {
        if let schedule = store.schedule {
            let eligible = stats.canDrink
            let tint = eligible ? Theme.emerald : Theme.warn
            Button {
                Haptics.light()
                route = .schedule
            } label: {
                HStack(spacing: 12) {
                    Image(systemName: eligible ? "leaf" : "bell")
                        .font(.system(size: 18, weight: .medium))
                        .foregroundStyle(tint)
                        .frame(width: 44, height: 44)
                        .background(Circle().fill(tint.opacity(0.14)))

                    VStack(alignment: .leading, spacing: 2) {
                        SectionLabel(text: "Safe Schedule · \(schedule.daysOff)d")
                        Text(eligible
                             ? "Clear to drink today"
                             : "Hold off — \(stats.daysUntilEligible) \(stats.daysUntilEligible == 1 ? "day" : "days") to go")
                            .font(.system(size: 15, weight: .semibold))
                            .foregroundStyle(tint)
                        if !eligible, let next = stats.nextEligibleDay {
                            Text("Opens \(Days.formatLong(next))")
                                .font(.system(size: 12))
                                .foregroundStyle(Theme.label3)
                        }
                    }
                    Spacer()
                    Image(systemName: "chevron.right")
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundStyle(Theme.label3)
                }
                .padding(16)
                .glassCard()
            }
            .buttonStyle(PressableStyle())
        } else {
            Button {
                Haptics.light()
                route = .schedule
            } label: {
                HStack(spacing: 12) {
                    Image(systemName: "shield")
                        .font(.system(size: 17))
                        .foregroundStyle(Theme.label2)
                        .frame(width: 40, height: 40)
                        .background(Circle().fill(Color.white.opacity(0.05)))
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Create a Safe Schedule")
                            .font(.system(size: 15, weight: .semibold))
                            .foregroundStyle(Theme.label)
                        Text("Set kratom-free days between drinks")
                            .font(.system(size: 12))
                            .foregroundStyle(Theme.label3)
                    }
                    Spacer()
                    Image(systemName: "chevron.right")
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundStyle(Theme.label3)
                }
                .padding(16)
                .background {
                    RoundedRectangle(cornerRadius: 28, style: .continuous)
                        .strokeBorder(Color.white.opacity(0.14), style: StrokeStyle(lineWidth: 1, dash: [5, 4]))
                        .background {
                            RoundedRectangle(cornerRadius: 28, style: .continuous)
                                .fill(Color.white.opacity(0.02))
                        }
                }
            }
            .buttonStyle(PressableStyle())
        }
    }

    private var calendarCard: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack {
                SectionLabel(text: "Intake calendar")
                Spacer()
                Text("\(store.drinks.count) logged")
                    .font(.system(size: 12))
                    .foregroundStyle(Theme.label3)
            }
            GridCalendar(drinks: store.drinks) { day in
                route = .day(day)
            }
        }
        .padding(18)
        .glassCard()
    }

    private var navList: some View {
        VStack(spacing: 0) {
            navRow(icon: "clock.arrow.circlepath", label: "Intake history") {
                route = .history
            }
            Rectangle()
                .fill(Color.white.opacity(0.06))
                .frame(height: 1)
                .padding(.leading, 66)
            navRow(icon: "trophy", label: "Medals & streaks") {
                route = .medals
            }
        }
        .glassCard()
    }

    private func navRow(icon: String, label: String, action: @escaping () -> Void) -> some View {
        Button {
            Haptics.light()
            action()
        } label: {
            HStack(spacing: 12) {
                Image(systemName: icon)
                    .font(.system(size: 16, weight: .medium))
                    .foregroundStyle(Theme.label)
                    .frame(width: 36, height: 36)
                    .background(Circle().fill(Color.white.opacity(0.05)))
                Text(label)
                    .font(.system(size: 16, weight: .medium))
                    .foregroundStyle(Theme.label)
                Spacer()
                Image(systemName: "chevron.right")
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundStyle(Theme.label3)
            }
            .padding(.horizontal, 18)
            .padding(.vertical, 14)
            .contentShape(Rectangle())
        }
        .buttonStyle(PressableStyle(scale: 0.98))
    }

    private var dock: some View {
        Button {
            Haptics.medium()
            route = .addDrink
        } label: {
            HStack(spacing: 8) {
                Image(systemName: "plus")
                    .font(.system(size: 17, weight: .bold))
                Text("Add kratom drink")
                    .font(.system(size: 17, weight: .semibold))
            }
            .foregroundStyle(Color(hex: 0x04140D))
            .frame(maxWidth: .infinity)
            .padding(.vertical, 16)
            .background {
                Capsule().fill(Theme.emeraldMetal)
                Capsule().strokeBorder(
                    LinearGradient(
                        colors: [Color.white.opacity(0.6), Color.white.opacity(0.05)],
                        startPoint: .top,
                        endPoint: .bottom
                    ),
                    lineWidth: 1
                )
            }
            .shadow(color: Theme.emerald.opacity(0.35), radius: 16, x: 0, y: 6)
            .shimmer()
        }
        .buttonStyle(PressableStyle())
        .padding(.horizontal, 20)
        .padding(.top, 10)
        .padding(.bottom, 6)
        .background {
            Rectangle()
                .fill(.ultraThinMaterial)
                .overlay(alignment: .top) {
                    Rectangle()
                        .fill(Color.white.opacity(0.12))
                        .frame(height: 0.5)
                }
                .ignoresSafeArea()
        }
    }
}
