import SwiftUI

enum DrinkType: String, Codable, CaseIterable, Identifiable {
    case extract
    case leaf

    var id: String { rawValue }

    var label: String {
        switch self {
        case .extract: return "Extract"
        case .leaf: return "Leaf Tea"
        }
    }

    var blurb: String {
        switch self {
        case .extract: return "Concentrated mitragynine extract"
        case .leaf: return "Brewed kratom leaf tea"
        }
    }

    /// SF Symbol used everywhere this type appears.
    var symbol: String {
        switch self {
        case .extract: return "testtube.2"
        case .leaf: return "leaf"
        }
    }

    var tint: Color {
        switch self {
        case .extract: return Theme.copper
        case .leaf: return Theme.emerald
        }
    }
}

struct Drink: Codable, Identifiable, Equatable {
    let id: String
    let type: DrinkType
    var date: String
    let createdAt: Date
    var note: String?
    /// Mitragynine extract dose in mg (extract drinks only).
    var mg: Int?
}

struct Schedule: Codable, Equatable {
    var daysOff: Int
    var createdAt: Date
    var notifyEnabled: Bool
    /// Daily extract limit in mg; nil means no limit.
    var mgLimit: Int?
}

/// Quick-pick extract doses shown when logging.
let extractMgPresets: [Int] = [30, 50, 100]
