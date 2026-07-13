import SwiftUI

enum MedalTier: String, Codable {
    case bronze
    case silver
    case gold
    case platinum

    var label: String {
        return rawValue.capitalized
    }

    /// Metallic ring/accent color for the dark liquid-metal theme.
    var ring: Color {
        switch self {
        case .bronze: return Color(hex: 0xC98A5E)
        case .silver: return Color(hex: 0xC7CCD4)
        case .gold: return Color(hex: 0xE7C868)
        case .platinum: return Color(hex: 0x8FDCE8)
        }
    }
}

struct MedalContext {
    let stats: Stats
    let hasSchedule: Bool
}

struct MedalDef: Identifiable {
    let id: String
    let title: String
    let description: String
    let emoji: String
    let tier: MedalTier
    let isEarned: (MedalContext) -> Bool
    let progress: (MedalContext) -> (current: Int, target: Int)
}

struct EvaluatedMedal: Identifiable {
    let id: String
    let title: String
    let description: String
    let emoji: String
    let tier: MedalTier
    let earned: Bool
    let earnedAt: Date?
    let current: Int
    let target: Int
}

enum Medals {
    private static func streak(_ id: String, _ title: String, _ emoji: String, _ tier: MedalTier, _ target: Int) -> MedalDef {
        return MedalDef(
            id: id,
            title: title,
            description: "Reach a \(target)-day no-kratom streak",
            emoji: emoji,
            tier: tier,
            isEarned: { ctx in ctx.stats.longestStreak >= target },
            progress: { ctx in (min(ctx.stats.longestStreak, target), target) }
        )
    }

    private static func honored(_ id: String, _ title: String, _ emoji: String, _ tier: MedalTier, _ target: Int) -> MedalDef {
        let times = target == 1 ? "time" : "times"
        return MedalDef(
            id: id,
            title: title,
            description: "Honor your Safe Schedule \(target) \(times)",
            emoji: emoji,
            tier: tier,
            isEarned: { ctx in ctx.hasSchedule && ctx.stats.scheduleSuccesses >= target },
            progress: { ctx in (min(ctx.stats.scheduleSuccesses, target), target) }
        )
    }

    static let all: [MedalDef] = [
        streak("fresh_start", "Fresh Start", "🌱", .bronze, 3),
        streak("clear_week", "Clear Week", "🌿", .silver, 7),
        streak("fortnight", "Fortnight Free", "🍃", .silver, 14),
        streak("full_moon", "Full Moon", "🌕", .gold, 30),
        streak("season", "Turned Season", "🏔️", .platinum, 90),
        MedalDef(
            id: "record_breaker",
            title: "Record Breaker",
            description: "Beat your previous best streak",
            emoji: "🚀",
            tier: .gold,
            isEarned: { ctx in ctx.stats.recordsBroken >= 1 },
            progress: { ctx in (min(ctx.stats.recordsBroken, 1), 1) }
        ),
        MedalDef(
            id: "relentless",
            title: "Relentless",
            description: "Set 3 new personal-best streaks",
            emoji: "🏆",
            tier: .platinum,
            isEarned: { ctx in ctx.stats.recordsBroken >= 3 },
            progress: { ctx in (min(ctx.stats.recordsBroken, 3), 3) }
        ),
        honored("disciplined", "Disciplined", "🎯", .bronze, 1),
        honored("consistent", "Consistent", "⚖️", .silver, 5),
        honored("iron_will", "Iron Will", "🛡️", .gold, 10),
    ]

    static func evaluate(ctx: MedalContext, earnedDates: [String: Date]) -> [EvaluatedMedal] {
        return all.map { def in
            let (current, target) = def.progress(ctx)
            return EvaluatedMedal(
                id: def.id,
                title: def.title,
                description: def.description,
                emoji: def.emoji,
                tier: def.tier,
                earned: def.isEarned(ctx),
                earnedAt: earnedDates[def.id],
                current: current,
                target: target
            )
        }
    }

    static func earnedIds(ctx: MedalContext) -> [String] {
        return all.filter { $0.isEarned(ctx) }.map { $0.id }
    }
}
