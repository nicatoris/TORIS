import SwiftUI

extension Color {
    init(hex: UInt32) {
        self.init(
            .sRGB,
            red: Double((hex >> 16) & 0xFF) / 255.0,
            green: Double((hex >> 8) & 0xFF) / 255.0,
            blue: Double(hex & 0xFF) / 255.0,
            opacity: 1.0
        )
    }
}

/// Liquid Metal & Glass design tokens: a deep graphite canvas, smoked-glass
/// panels, silver gradient numerals with a moving specular highlight, and a
/// single emerald accent (copper for extract).
enum Theme {
    // Canvas
    static let bg = Color(hex: 0x0A0B0E)

    // Ink on dark glass
    static let label = Color(white: 0.97)
    static let label2 = Color(white: 0.64)
    static let label3 = Color(white: 0.42)

    // Accents
    static let emerald = Color(hex: 0x30D158)
    static let emeraldDeep = Color(hex: 0x1E9B45)
    static let copper = Color(hex: 0xD98E62)
    static let copperDeep = Color(hex: 0xB4623C)
    static let warn = Color(hex: 0xFFB340)
    static let danger = Color(hex: 0xFF5E57)

    /// Brushed-silver gradient for hero numerals and metallic text.
    static let silver = LinearGradient(
        colors: [
            Color(white: 0.99),
            Color(white: 0.80),
            Color(white: 0.94),
            Color(white: 0.58),
        ],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )

    /// Polished emerald used for the primary action and progress fills.
    static let emeraldMetal = LinearGradient(
        colors: [Color(hex: 0x7CF5A8), emerald, Color(hex: 0x18893C)],
        startPoint: .top,
        endPoint: .bottom
    )

    /// Hairline stroke that gives glass panels a lit top edge.
    static let glassStroke = LinearGradient(
        colors: [
            Color.white.opacity(0.38),
            Color.white.opacity(0.09),
            Color.white.opacity(0.03),
        ],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )
}
