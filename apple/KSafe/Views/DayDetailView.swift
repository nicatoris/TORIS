import SwiftUI

struct DayDetailView: View {
    let day: String

    @Environment(KratomStore.self) private var store
    @Environment(\.dismiss) private var dismiss
    @State private var pendingDelete: Drink?

    private var entries: [Drink] {
        return store.drinks(on: day)
    }

    var body: some View {
        ZStack {
            LiquidBackground()

            ScrollView(showsIndicators: false) {
                VStack(alignment: .leading, spacing: 12) {
                    ModalHeader(title: Days.relativeLabel(day), subtitle: Days.formatLong(day))

                    if entries.isEmpty {
                        EmptyStateView(
                            icon: "leaf",
                            title: "A clean day",
                            body: "No kratom or extract logged on this date."
                        )
                    } else {
                        ForEach(entries) { drink in
                            entryCard(drink)
                        }
                    }
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 40)
            }
        }
        .toolbar(.hidden, for: .navigationBar)
        .alert(
            "Delete this entry?",
            isPresented: Binding(
                get: { pendingDelete != nil },
                set: { if !$0 { pendingDelete = nil } }
            ),
            presenting: pendingDelete
        ) { drink in
            Button("Delete", role: .destructive) {
                let remaining = entries.count
                store.deleteDrink(id: drink.id)
                Haptics.warning()
                if remaining <= 1 { dismiss() }
            }
            Button("Cancel", role: .cancel) {}
        } message: { drink in
            Text("Remove the \(drink.type.label) logged on \(Days.formatLong(day))? This can't be undone.")
        }
    }

    private func entryCard(_ drink: Drink) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 12) {
                Image(systemName: drink.type.symbol)
                    .font(.system(size: 20, weight: .medium))
                    .foregroundStyle(drink.type.tint)
                    .frame(width: 48, height: 48)
                    .background(Circle().fill(drink.type.tint.opacity(0.14)))

                VStack(alignment: .leading, spacing: 2) {
                    HStack(spacing: 0) {
                        Text(drink.type.label)
                            .font(.system(size: 17, weight: .bold))
                            .foregroundStyle(Theme.label)
                        if drink.type == .extract, let mg = drink.mg {
                            Text(" · \(mg) mg")
                                .font(.system(size: 17, weight: .bold))
                                .foregroundStyle(Theme.copper)
                        }
                    }
                    Text("Logged \(drink.createdAt.formatted(date: .omitted, time: .shortened))")
                        .font(.system(size: 12))
                        .foregroundStyle(Theme.label3)
                }

                Spacer()
                DrinkBadge(type: drink.type)
            }

            if let note = drink.note {
                Text("\u{201C}\(note)\u{201D}")
                    .font(.system(size: 14))
                    .foregroundStyle(Theme.label2)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(14)
                    .background {
                        RoundedRectangle(cornerRadius: 16, style: .continuous)
                            .fill(Color.white.opacity(0.04))
                    }
            }

            Button {
                pendingDelete = drink
            } label: {
                HStack(spacing: 6) {
                    Image(systemName: "trash")
                        .font(.system(size: 11, weight: .semibold))
                    Text("Delete entry")
                        .font(.system(size: 12, weight: .semibold))
                }
                .foregroundStyle(Theme.danger)
                .padding(.horizontal, 14)
                .padding(.vertical, 9)
                .background(Capsule().fill(Theme.danger.opacity(0.12)))
            }
            .buttonStyle(PressableStyle())
        }
        .padding(16)
        .glassCard()
    }
}
