import SwiftUI

/// Slim progress rule with a metallic fill and soft glow, animated on change.
struct MetalProgressBar: View {
    var progress: Double
    var tint: Color = Theme.emerald
    var height: CGFloat = 6

    var body: some View {
        GeometryReader { geo in
            ZStack(alignment: .leading) {
                Capsule()
                    .fill(Color.white.opacity(0.08))
                Capsule()
                    .fill(
                        LinearGradient(
                            colors: [tint.opacity(0.85), tint],
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    )
                    .frame(width: max(height, geo.size.width * min(max(progress, 0), 1)))
                    .shadow(color: tint.opacity(0.55), radius: 6, x: 0, y: 0)
            }
        }
        .frame(height: height)
        .animation(.spring(response: 0.9, dampingFraction: 0.9), value: progress)
    }
}

/// Gradient progress ring sweeping from 12 o'clock — used on medal cards.
struct ProgressRing: View {
    var progress: Double
    var tint: Color
    var size: CGFloat = 72
    var lineWidth: CGFloat = 5

    var body: some View {
        ZStack {
            Circle()
                .stroke(Color.white.opacity(0.08), lineWidth: lineWidth)
            Circle()
                .trim(from: 0, to: min(max(progress, 0), 1))
                .stroke(
                    LinearGradient(
                        colors: [tint.opacity(0.7), tint],
                        startPoint: .top,
                        endPoint: .bottom
                    ),
                    style: StrokeStyle(lineWidth: lineWidth, lineCap: .round)
                )
                .rotationEffect(.degrees(-90))
        }
        .frame(width: size, height: size)
        .animation(.spring(response: 0.9, dampingFraction: 0.9), value: progress)
    }
}

/// The contribution-style intake calendar: columns are weeks (Sun–Sat),
/// emerald for leaf tea, copper for extract, today ringed.
struct GridCalendar: View {
    let drinks: [Drink]
    var weeks: Int = 18
    var onSelect: (String) -> Void

    private struct Cell: Identifiable {
        let id: String
        let inRange: Bool
        let isToday: Bool
        let color: Color
        let tappable: Bool
    }

    private var columns: [[Cell]] {
        var byDay: [String: [Drink]] = [:]
        for d in drinks {
            byDay[d.date, default: []].append(d)
        }

        let today = Days.today
        let weekday = Calendar.current.component(.weekday, from: Days.date(from: today))
        let endOfWeek = Days.add(7 - weekday, to: today)
        let totalDays = weeks * 7
        let start = Days.add(-(totalDays - 1), to: endOfWeek)

        var cols: [[Cell]] = []
        for w in 0..<weeks {
            var col: [Cell] = []
            for r in 0..<7 {
                let key = Days.add(w * 7 + r, to: start)
                let entries = byDay[key] ?? []
                let inRange = key <= today
                var color = inRange ? Color.white.opacity(0.06) : Color.white.opacity(0.02)
                if !entries.isEmpty {
                    let hasExtract = entries.contains { $0.type == .extract }
                    color = hasExtract ? Theme.copper : Theme.emerald
                }
                col.append(Cell(id: key, inRange: inRange, isToday: key == today, color: color, tappable: inRange))
            }
            cols.append(col)
        }
        return cols
    }

    var body: some View {
        VStack(alignment: .trailing, spacing: 14) {
            HStack(alignment: .top, spacing: 6) {
                VStack(spacing: 3) {
                    ForEach(0..<7, id: \.self) { r in
                        Text(r == 1 ? "M" : (r == 3 ? "W" : (r == 5 ? "F" : " ")))
                            .font(.system(size: 9, weight: .medium))
                            .foregroundStyle(Theme.label3)
                            .frame(width: 10, height: 14)
                    }
                }
                HStack(spacing: 3) {
                    ForEach(Array(columns.enumerated()), id: \.offset) { pair in
                        VStack(spacing: 3) {
                            ForEach(pair.element) { cell in
                                RoundedRectangle(cornerRadius: 4.5, style: .continuous)
                                    .fill(cell.color)
                                    .frame(width: 14, height: 14)
                                    .overlay {
                                        if cell.isToday {
                                            RoundedRectangle(cornerRadius: 4.5, style: .continuous)
                                                .strokeBorder(Theme.emerald, lineWidth: 1.5)
                                        }
                                    }
                                    .onTapGesture {
                                        if cell.tappable {
                                            Haptics.selection()
                                            onSelect(cell.id)
                                        }
                                    }
                            }
                        }
                    }
                }
            }

            HStack(spacing: 14) {
                legend(color: Color.white.opacity(0.10), label: "Clean")
                legend(color: Theme.emerald, label: "Leaf tea")
                legend(color: Theme.copper, label: "Extract")
            }
        }
    }

    private func legend(color: Color, label: String) -> some View {
        HStack(spacing: 5) {
            RoundedRectangle(cornerRadius: 3, style: .continuous)
                .fill(color)
                .frame(width: 10, height: 10)
            Text(label)
                .font(.system(size: 10))
                .foregroundStyle(Theme.label3)
        }
    }
}
