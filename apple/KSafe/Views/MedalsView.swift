import SwiftUI

struct MedalsView: View {
    @Environment(KratomStore.self) private var store

    private var medals: [EvaluatedMedal] {
        return Medals.evaluate(ctx: store.medalContext, earnedDates: store.earnedMedals)
    }

    var body: some View {
        let stats = store.stats
        let earnedCount = medals.filter { $0.earned }.count

        ZStack {
            LiquidBackground()

            ScrollView(showsIndicators: false) {
                VStack(alignment: .leading, spacing: 14) {
                    ModalHeader(title: "Medals", subtitle: "\(earnedCount) of \(medals.count) earned")

                    HStack(spacing: 12) {
                        streakCard(icon: "flame.fill", value: stats.currentStreak, label: "Current streak")
                        streakCard(icon: "trophy.fill", value: stats.longestStreak, label: "Longest streak")
                    }

                    if stats.recordsBroken > 0 {
                        recordsBanner(stats.recordsBroken)
                    }

                    SectionLabel(text: "Collection")
                        .padding(.top, 6)

                    LazyVGrid(
                        columns: [GridItem(.flexible(), spacing: 12), GridItem(.flexible(), spacing: 12)],
                        spacing: 12
                    ) {
                        ForEach(medals) { medal in
                            medalCard(medal)
                        }
                    }
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 40)
            }
        }
    }

    private func streakCard(icon: String, value: Int, label: String) -> some View {
        VStack(spacing: 10) {
            Image(systemName: icon)
                .font(.system(size: 19))
                .foregroundStyle(Theme.emerald)
                .frame(width: 44, height: 44)
                .background(Circle().fill(Theme.emerald.opacity(0.13)))
            Text("\(value)")
                .font(.system(size: 34, weight: .thin))
                .monospacedDigit()
                .foregroundStyle(Theme.silver)
            Text(label)
                .font(.system(size: 11))
                .foregroundStyle(Theme.label3)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 22)
        .glassCard()
    }

    private func recordsBanner(_ count: Int) -> some View {
        HStack(spacing: 12) {
            Image(systemName: "sparkles")
                .font(.system(size: 18))
                .foregroundStyle(Theme.emerald)
            Text("You've beaten your personal best \(count) \(count == 1 ? "time" : "times"). Keep climbing.")
                .font(.system(size: 13, weight: .medium))
                .foregroundStyle(Theme.emerald)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(16)
        .background {
            RoundedRectangle(cornerRadius: 24, style: .continuous)
                .fill(Theme.emerald.opacity(0.10))
            RoundedRectangle(cornerRadius: 24, style: .continuous)
                .strokeBorder(Theme.emerald.opacity(0.25), lineWidth: 1)
        }
    }

    private func medalCard(_ medal: EvaluatedMedal) -> some View {
        let tint = medal.earned ? medal.tier.ring : Theme.emerald
        let progress = medal.earned ? 1.0 : Double(medal.current) / Double(max(medal.target, 1))

        return VStack(spacing: 10) {
            ZStack {
                ProgressRing(progress: progress, tint: tint, size: 74, lineWidth: 5)
                Text(medal.emoji)
                    .font(.system(size: 30))
                    .opacity(medal.earned ? 1 : 0.35)
                    .saturation(medal.earned ? 1 : 0.2)
            }

            VStack(spacing: 3) {
                Text(medal.title)
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundStyle(medal.earned ? Theme.label : Theme.label2)
                Text(medal.description)
                    .font(.system(size: 11))
                    .foregroundStyle(Theme.label3)
                    .multilineTextAlignment(.center)
            }

            if medal.earned {
                HStack(spacing: 4) {
                    Image(systemName: "checkmark")
                        .font(.system(size: 9, weight: .bold))
                    Text(medal.earnedAt.map { $0.formatted(date: .abbreviated, time: .omitted) } ?? medal.tier.label)
                        .font(.system(size: 10, weight: .semibold))
                }
                .foregroundStyle(medal.tier.ring)
            } else {
                Text("\(medal.current) / \(medal.target)")
                    .font(.system(size: 11, weight: .medium))
                    .monospacedDigit()
                    .foregroundStyle(Theme.label3)
            }
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 18)
        .padding(.horizontal, 10)
        .background {
            RoundedRectangle(cornerRadius: 26, style: .continuous)
                .fill(medal.earned ? AnyShapeStyle(medal.tier.ring.opacity(0.08)) : AnyShapeStyle(.ultraThinMaterial))
            RoundedRectangle(cornerRadius: 26, style: .continuous)
                .strokeBorder(
                    medal.earned ? AnyShapeStyle(medal.tier.ring.opacity(0.4)) : AnyShapeStyle(Theme.glassStroke),
                    lineWidth: 1
                )
        }
    }
}
