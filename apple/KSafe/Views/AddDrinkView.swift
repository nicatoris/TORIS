import SwiftUI

struct AddDrinkView: View {
    @Environment(KratomStore.self) private var store
    @Environment(\.dismiss) private var dismiss

    @State private var type: DrinkType?
    @State private var dateKey: String = Days.today
    @State private var mgText: String = ""
    @State private var note: String = ""
    @State private var successLabel: String?

    private var mg: Int? {
        return Int(mgText)
    }

    private var days: [String] {
        let today = Days.today
        return (0..<30).map { Days.add(-$0, to: today) }
    }

    var body: some View {
        ZStack {
            LiquidBackground()

            ScrollView(showsIndicators: false) {
                VStack(alignment: .leading, spacing: 24) {
                    ModalHeader(title: "Add a drink", subtitle: "Log what you had and when.")

                    typeSection
                    if type == .extract {
                        doseSection
                            .transition(.opacity.combined(with: .move(edge: .top)))
                    }
                    dateSection
                    noteSection
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 40)
            }
        }
        .safeAreaInset(edge: .bottom) { saveDock }
        .overlay {
            if let label = successLabel {
                SuccessOverlay(label: label) { dismiss() }
            }
        }
        .animation(.spring(response: 0.4, dampingFraction: 0.8), value: type)
    }

    // MARK: - Sections

    private var typeSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            SectionLabel(text: "What did you drink?")
            HStack(spacing: 12) {
                ForEach(DrinkType.allCases) { t in
                    typeCard(t)
                }
            }
        }
    }

    private func typeCard(_ t: DrinkType) -> some View {
        let selected = type == t
        return Button {
            Haptics.selection()
            type = t
            if t != .extract { mgText = "" }
        } label: {
            VStack(spacing: 12) {
                Image(systemName: t.symbol)
                    .font(.system(size: 26, weight: .medium))
                    .foregroundStyle(t.tint)
                    .frame(width: 60, height: 60)
                    .background(Circle().fill(t.tint.opacity(0.14)))

                VStack(spacing: 3) {
                    Text(t.label)
                        .font(.system(size: 17, weight: .bold))
                        .foregroundStyle(Theme.label)
                    Text(t.blurb)
                        .font(.system(size: 11))
                        .foregroundStyle(Theme.label3)
                        .multilineTextAlignment(.center)
                }
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 22)
            .padding(.horizontal, 10)
            .background {
                RoundedRectangle(cornerRadius: 26, style: .continuous)
                    .fill(selected ? AnyShapeStyle(t.tint.opacity(0.10)) : AnyShapeStyle(.ultraThinMaterial))
                RoundedRectangle(cornerRadius: 26, style: .continuous)
                    .strokeBorder(selected ? AnyShapeStyle(t.tint.opacity(0.7)) : AnyShapeStyle(Theme.glassStroke), lineWidth: selected ? 1.5 : 1)
            }
            .overlay(alignment: .topTrailing) {
                if selected {
                    Image(systemName: "checkmark")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundStyle(Color(hex: 0x0A0B0E))
                        .frame(width: 22, height: 22)
                        .background(Circle().fill(t.tint))
                        .padding(10)
                        .transition(.scale.combined(with: .opacity))
                }
            }
        }
        .buttonStyle(PressableStyle())
    }

    private var doseSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            SectionLabel(text: "Extract dose")
            HStack(spacing: 10) {
                ForEach(extractMgPresets, id: \.self) { preset in
                    let on = mg == preset
                    Button {
                        Haptics.selection()
                        mgText = String(preset)
                    } label: {
                        HStack(alignment: .firstTextBaseline, spacing: 3) {
                            Text("\(preset)")
                                .font(.system(size: 18, weight: .bold))
                                .foregroundStyle(on ? Theme.copper : Theme.label)
                            Text("mg")
                                .font(.system(size: 11, weight: .semibold))
                                .foregroundStyle(on ? Theme.copper : Theme.label3)
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 15)
                        .background {
                            RoundedRectangle(cornerRadius: 18, style: .continuous)
                                .fill(on ? AnyShapeStyle(Theme.copper.opacity(0.12)) : AnyShapeStyle(.ultraThinMaterial))
                            RoundedRectangle(cornerRadius: 18, style: .continuous)
                                .strokeBorder(on ? AnyShapeStyle(Theme.copper.opacity(0.7)) : AnyShapeStyle(Theme.glassStroke), lineWidth: on ? 1.5 : 1)
                        }
                    }
                    .buttonStyle(PressableStyle())
                }
            }

            HStack {
                TextField("Custom amount", text: $mgText)
                    .keyboardType(.numberPad)
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundStyle(Theme.label)
                    .onChange(of: mgText) { _, newValue in
                        let filtered = String(newValue.filter { $0.isNumber }.prefix(4))
                        if filtered != newValue { mgText = filtered }
                    }
                Text("mg")
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundStyle(Theme.label3)
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 15)
            .glassCard(radius: 18)
        }
    }

    private var dateSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            SectionLabel(text: "When")
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    ForEach(days, id: \.self) { day in
                        dateChip(day)
                    }
                }
            }
            Text("\(Days.relativeLabel(dateKey)) · \(Days.formatShort(dateKey))")
                .font(.system(size: 12))
                .foregroundStyle(Theme.label3)
        }
    }

    private func dateChip(_ day: String) -> some View {
        let selected = day == dateKey
        let rel = Days.relativeLabel(day)
        let top = (rel == "Today" || rel == "Yesterday") ? rel : Days.weekdayAbbrev(day)
        return Button {
            Haptics.selection()
            dateKey = day
        } label: {
            VStack(spacing: 2) {
                Text(top)
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundStyle(selected ? Theme.emerald : Theme.label3)
                Text(Days.formatChip(day))
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundStyle(selected ? Theme.label : Theme.label2)
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 11)
            .background {
                RoundedRectangle(cornerRadius: 18, style: .continuous)
                    .fill(selected ? AnyShapeStyle(Theme.emerald.opacity(0.12)) : AnyShapeStyle(.ultraThinMaterial))
                RoundedRectangle(cornerRadius: 18, style: .continuous)
                    .strokeBorder(selected ? AnyShapeStyle(Theme.emerald.opacity(0.7)) : AnyShapeStyle(Theme.glassStroke), lineWidth: 1)
            }
        }
        .buttonStyle(PressableStyle())
    }

    private var noteSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            SectionLabel(text: "Note")
            TextField("Dose, brand, how you felt…", text: $note, axis: .vertical)
                .lineLimit(3...5)
                .font(.system(size: 15))
                .foregroundStyle(Theme.label)
                .padding(16)
                .glassCard(radius: 22)
        }
    }

    private var saveDock: some View {
        let ready = type != nil
        return Button {
            save()
        } label: {
            HStack(spacing: 8) {
                if ready {
                    Image(systemName: "checkmark")
                        .font(.system(size: 15, weight: .bold))
                }
                Text(ready ? "Log drink" : "Choose a type first")
                    .font(.system(size: 17, weight: .semibold))
            }
            .foregroundStyle(ready ? Color(hex: 0x04140D) : Theme.label3)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 16)
            .background {
                if ready {
                    Capsule().fill(Theme.emeraldMetal)
                } else {
                    Capsule().fill(Color.white.opacity(0.06))
                }
            }
        }
        .buttonStyle(PressableStyle())
        .disabled(!ready)
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

    private func save() {
        guard let type = type else {
            Haptics.warning()
            return
        }
        store.addDrink(type: type, date: dateKey, note: note, mg: mg)
        Haptics.success()
        var label = "\(type.label) logged"
        if type == .extract, let mg = mg, mg > 0 { label += " · \(mg) mg" }
        successLabel = label
    }
}

/// Shared modal header: big title, subtitle, and a glass close button.
struct ModalHeader: View {
    let title: String
    var subtitle: String?

    @Environment(\.dismiss) private var dismiss

    var body: some View {
        HStack(alignment: .top) {
            VStack(alignment: .leading, spacing: 5) {
                Text(title)
                    .font(.system(size: 32, weight: .bold))
                    .foregroundStyle(Theme.silver)
                if let subtitle = subtitle {
                    Text(subtitle)
                        .font(.system(size: 13))
                        .foregroundStyle(Theme.label2)
                }
            }
            Spacer()
            Button {
                Haptics.light()
                dismiss()
            } label: {
                Image(systemName: "xmark")
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundStyle(Theme.label2)
                    .frame(width: 34, height: 34)
                    .background(Circle().fill(Color.white.opacity(0.07)))
            }
            .buttonStyle(PressableStyle())
        }
        .padding(.top, 24)
    }
}
