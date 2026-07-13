import SwiftUI

@main
struct KSafeApp: App {
    @State private var store = KratomStore()

    var body: some Scene {
        WindowGroup {
            HomeView()
                .environment(store)
                .preferredColorScheme(.dark)
                .tint(Theme.emerald)
        }
    }
}
