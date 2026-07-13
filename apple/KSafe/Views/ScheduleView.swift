import SwiftUI

struct ScheduleView: View {
    @Environment(KratomStore.self) private var store
    @Environment(\.dismiss) private var dismiss

    @State private var days: Int = 3
    @State private var mgLimit: Int = 0
    @State private var notify: Bool = false
    @State private var saving = false
    @State private var loaded = false

    private var isEditing: Bool {
        return store.schedule != nil
    }

    var body: some View {
        ZStack {
            LiquidBackground()

            ScrollView(showsIndicators: false) {
                VStack(alignment: .leading, spacing: 14) {
                    ModalHeader(
                        title: "Safe Schedule",
                        subtitle: "The kratom-free window you want between drinks."
                    )
                    daysCard
                    mgLimitCard
                    notifyCard
                    if isEditing, store.stats.lastDrinkDay != nil {
                        rightNowCard
                    }
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 40)
            }
        }
        .safeAreaInset(edge: .bottom) { dock }
        .onAppear {
            if !loaded {
                loaded = true
                days = store.schedule?.daysOff ?? 3
                mgLimit = store.schedule?.mgLimit ?? 0
                notify = store.schedule?.notifyEnabled ?? false
            }
        }
    }

    // MARK: - Cards

    private var daysCard: some View {
        VStack(spacing: 18) {
            SectionLabel(text: "Days off between drinks")
            HStack(spacing: 28) {
                stepButton(symbol: "minus") {
                    days = max(1, days - 1)
                }
                VStack(spacing: 0) {
                    Text("\(days)")
                        .font(.system(size: 74, weight: .thin))
                        .monospacedDigit()
                        .foregroundStyle(Theme.silver)
                        .contentTransition(.numericText())
                        .animation(.spring(response: 0.35, dampingFraction: 0.8), value: days)
                    Text(days == 1 ? "day" : "days")
                        .font(.system(size: 13))
                        .foregroundStyle(Theme.label2)
                }
                .frame(minWidth: 110)
                stepButton(symbol: "plus") {
                    days = min(90, days + 1)
                }
            }
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 28)
        .glassCard()
    }

    private var mgLimitCard: some View {
        VStack(spacing: 18) {
            SectionLabel(text: "Daily extract limit")
            HStack(spacing: 28) {
                stepButton(symbol: "minus") {
                    mgLimit = max(0, mgLimit - 25)
                }
                VStack(spacing: 0) {
                    if mgLimit > 0 {
                        HStack(alignment: .firstTextBaseline, spacing: 4) {
                            Text("\(mgLimit)")
                                .font(.system(size: 60, weight: .thin))
                                .monospacedDigit()
                                .foregroundStyle(Theme.silver)
                                .contentTransition(.numericText())
                            Text("mg")
                                .font(.system(size: 16, weight: .semibold))
                                .foregroundStyle(Theme.label2)
                        }
                        Text("of extract per day")
                            .font(.system(size: 13))
                            .foregroundStyle(Theme.label2)
                    } else {
                        Text("No limit")
                            .font(.system(size: 32, weight: .light))
                            .foregroundStyle(Theme.label3)
                            .frame(height: 62)
                        Text("extract not capped")
                            .font(.system(size: 13))
                            .foregroundStyle(Theme.label2)
                    }
                }
                .frame(minWidth: 140)
                .animation(.spring(response: 0.35, dampingFraction: 0.8), value: mgLimit)
                stepButton(symbol: "plus") {
                    mgLimit = min(1000, mgLimit + 25)
                }
            }
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 28)
        .glassCard()
    }

    private var notifyCard: some View {
        HStack(spacing: 12) {
            Image(systemName: notify ? "bell" : "bell.slash")
                .font(.system(size: 17))
                .foregroundStyle(Theme.label2)
                .frame(width: 40, height: 40)
                .background(Circle().fill(Color.white.opacity(0.05)))
            VStack(alignment: .leading, spacing: 2) {
                Text("Remind me when eligible")
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundStyle(Theme.label)
                Text("A nudge the morning your window opens")
                    .font(.system(size: 12))
                    .foregroundStyle(Theme.label3)
            }
            Spacer()
            Toggle("", isOn: $notify)
                .labelsHidden()
                .tint(Theme.emerald)
                .onChange(of: notify) { _, _ in
                    Haptics.light()
                }
        }
        .padding(16)
        .glassCard()
    }

    private var rightNowCard: some View {
        let stats = store.stats
        return VStack(alignment: .leading, spacing: 6) {
            SectionLabel(text: "Right now")
            Text(stats.canDrink
                 ? "You're eligible to drink today."
                 : "\(stats.daysUntilEligible) more \(stats.daysUntilEligible == 1 ? "day" : "days") · opens \(Days.formatLong(stats.nextEligibleDay ?? ""))")
                .font(.system(size: 15, weight: .semibold))
                .foregroundStyle(stats.canDrink ? Theme.emerald : Theme.warn)
            if mgLimit > 0 {
                Text("\(stats.todayExtractMg) of \(mgLimit) mg extract used today")
                    .font(.system(size: 13, weight: .medium))
                    .foregroundStyle(stats.todayExtractMg > mgLimit ? Theme.danger : Theme.label2)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(18)
        .glassCard()
    }

    private func stepButton(symbol: String, action: @escaping () -> Void) -> some View {
        Button {
            Haptics.selection()
            action()
        } label: {
            Image(systemName: symbol)
                .font(.system(size: 19, weight: .semibold))
                .foregroundStyle(Theme.label)
                .frame(width: 54, height: 54)
                .background {
                    Circle().fill(.ultraThinMaterial)
                    Circle().strokeBorder(Theme.glassStroke, lineWidth: 1)
                }
        }
        .buttonStyle(PressableStyle(scale: 0.9))
    }

    private var dock: some View {
        VStack(spacing: 8) {
            Button {
                Task {
                    saving = true
                    await store.setSchedule(daysOff: days, notifyEnabled: notify, mgLimit: mgLimit)
                    Haptics.success()
                    saving = false
                    dismiss()
                }
            } label: {
                HStack(spacing: 8) {
                    Image(systemName: "shield")
                        .font(.system(size: 15, weight: .semibold))
                    Text(saving ? "Saving…" : (isEditing ? "Update schedule" : "Create schedule"))
                        .font(.system(size: 17, weight: .semibold))
                }
                .foregroundStyle(Color(hex: 0x04140D))
                .frame(maxWidth: .infinity)
                .padding(.vertical, 16)
                .background(Capsule().fill(Theme.emeraldMetal))
            }
            .buttonStyle(PressableStyle())
            .disabled(saving)

            if isEditing {
                Button {
                    Haptics.warning()
                    store.clearSchedule()
                    dismiss()
                } label: {
                    HStack(spacing: 7) {
                        Image(systemName: "trash")
                            .font(.system(size: 13, weight: .semibold))
                        Text("Delete schedule")
                            .font(.system(size: 16, weight: .semibold))
                    }
                    .foregroundStyle(Theme.danger)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 15)
                    .background(Capsule().fill(Theme.danger.opacity(0.12)))
                }
                .buttonStyle(PressableStyle())
            }
        }
        .padding(.horizontal, 20)
        .padding(.top, 10)
        .padding(.bottom, 6)
        .background {
            Rectangle()
                .fill(.ultraThinMaterial)
                .overlay(alignment: .top) {
                    Rectangle().fill(Color.white.opacity(0.12)).frame(height: 0.5)
                }
                .ignoresSafeArea()
        }
    }
}
