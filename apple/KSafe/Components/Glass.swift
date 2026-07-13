import SwiftUI

/// Smoked-glass panel: ultra-thin material over the dark canvas, a lit top
/// edge, and a soft drop shadow. The core surface of the design.
struct GlassCard: ViewModifier {
    var radius: CGFloat = 28

    func body(content: Content) -> some View {
        content
            .background {
                RoundedRectangle(cornerRadius: radius, style: .continuous)
                    .fill(.ultraThinMaterial)
                    .overlay {
                        RoundedRectangle(cornerRadius: radius, style: .continuous)
                            .strokeBorder(Theme.glassStroke, lineWidth: 1)
                    }
                    .shadow(color: Color.black.opacity(0.35), radius: 18, x: 0, y: 10)
            }
    }
}

extension View {
    func glassCard(radius: CGFloat = 28) -> some View {
        return modifier(GlassCard(radius: radius))
    }
}

/// A moving specular highlight masked to its content — the "liquid" in the
/// liquid metal. Applied to the hero numeral and the primary button.
struct Shimmer: ViewModifier {
    @State private var phase: CGFloat = -0.7

    func body(content: Content) -> some View {
        content
            .overlay {
                GeometryReader { geo in
                    LinearGradient(
                        colors: [.clear, Color.white.opacity(0.55), .clear],
                        startPoint: .leading,
                        endPoint: .trailing
                    )
                    .frame(width: geo.size.width * 0.55)
                    .offset(x: phase * geo.size.width * 1.7)
                    .blur(radius: 6)
                }
                .mask(content)
                .allowsHitTesting(false)
            }
            .onAppear {
                withAnimation(.linear(duration: 3.2).repeatForever(autoreverses: false)) {
                    phase = 1.0
                }
            }
    }
}

extension View {
    func shimmer() -> some View {
        return modifier(Shimmer())
    }
}

/// Every tappable element springs down slightly while pressed.
struct PressableStyle: ButtonStyle {
    var scale: CGFloat = 0.96

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? scale : 1.0)
            .animation(.spring(response: 0.3, dampingFraction: 0.55), value: configuration.isPressed)
    }
}

/// Magazine-style small-caps kicker.
struct SectionLabel: View {
    let text: String

    var body: some View {
        Text(text.uppercased())
            .font(.system(size: 11, weight: .semibold))
            .tracking(2.5)
            .foregroundStyle(Theme.label3)
    }
}

/// The slowly breathing canvas: deep graphite with drifting metallic and
/// emerald blooms sunk behind every screen.
struct LiquidBackground: View {
    @State private var drift = false

    var body: some View {
        ZStack {
            Theme.bg

            Circle()
                .fill(
                    RadialGradient(
                        colors: [Color(white: 0.55).opacity(0.30), .clear],
                        center: .center,
                        startRadius: 0,
                        endRadius: 260
                    )
                )
                .frame(width: 520, height: 520)
                .blur(radius: 60)
                .offset(x: drift ? -80 : -150, y: drift ? -310 : -250)

            Circle()
                .fill(
                    RadialGradient(
                        colors: [Theme.emerald.opacity(0.15), .clear],
                        center: .center,
                        startRadius: 0,
                        endRadius: 230
                    )
                )
                .frame(width: 460, height: 460)
                .blur(radius: 70)
                .offset(x: drift ? 150 : 90, y: drift ? 230 : 320)

            Circle()
                .fill(
                    RadialGradient(
                        colors: [Theme.copper.opacity(0.10), .clear],
                        center: .center,
                        startRadius: 0,
                        endRadius: 210
                    )
                )
                .frame(width: 420, height: 420)
                .blur(radius: 70)
                .offset(x: drift ? -140 : -90, y: drift ? 420 : 480)
        }
        .ignoresSafeArea()
        .onAppear {
            withAnimation(.easeInOut(duration: 9).repeatForever(autoreverses: true)) {
                drift = true
            }
        }
    }
}
