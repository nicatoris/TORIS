import SwiftUI

private struct CheckShape: Shape {
    func path(in rect: CGRect) -> Path {
        var p = Path()
        p.move(to: CGPoint(x: rect.minX, y: rect.midY))
        p.addLine(to: CGPoint(x: rect.width * 0.36, y: rect.maxY))
        p.addLine(to: CGPoint(x: rect.maxX, y: rect.minY))
        return p
    }
}

/// Celebratory confirmation: the screen frosts over, an emerald ring draws
/// itself around a checkmark that strokes in, then everything settles and
/// hands control back (~1.2s total).
struct SuccessOverlay: View {
    let label: String
    var onDone: () -> Void

    @State private var visible = false
    @State private var ring: CGFloat = 0
    @State private var check: CGFloat = 0

    var body: some View {
        ZStack {
            Rectangle()
                .fill(.ultraThinMaterial)
                .ignoresSafeArea()
                .opacity(visible ? 1 : 0)

            VStack(spacing: 16) {
                ZStack {
                    Circle()
                        .trim(from: 0, to: ring)
                        .stroke(
                            Theme.emeraldMetal,
                            style: StrokeStyle(lineWidth: 4, lineCap: .round)
                        )
                        .rotationEffect(.degrees(-90))
                        .frame(width: 96, height: 96)
                        .shadow(color: Theme.emerald.opacity(0.5), radius: 12)

                    CheckShape()
                        .trim(from: 0, to: check)
                        .stroke(
                            Theme.emeraldMetal,
                            style: StrokeStyle(lineWidth: 5, lineCap: .round, lineJoin: .round)
                        )
                        .frame(width: 42, height: 32)
                }

                Text(label)
                    .font(.system(size: 17, weight: .semibold))
                    .foregroundStyle(Theme.label)
                    .opacity(Double(check))
            }
            .scaleEffect(visible ? 1 : 0.7)
        }
        .task {
            withAnimation(.spring(response: 0.35, dampingFraction: 0.7)) { visible = true }
            withAnimation(.easeOut(duration: 0.5)) { ring = 1 }
            try? await Task.sleep(nanoseconds: 300_000_000)
            withAnimation(.easeOut(duration: 0.35)) { check = 1 }
            try? await Task.sleep(nanoseconds: 750_000_000)
            withAnimation(.easeIn(duration: 0.2)) { visible = false }
            try? await Task.sleep(nanoseconds: 220_000_000)
            onDone()
        }
    }
}
