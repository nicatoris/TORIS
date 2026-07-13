# KSafe 🌿

A modern, sleek **kratom & mitragynine‑extract intake tracker** for iOS, built
with Expo. KSafe helps you monitor consumption, keep a mindful "Safe Schedule,"
and reduce withdrawal symptoms and portion dependence — with smooth animations,
haptics, and a satisfying medals system to keep you motivated.

## Features

- **Days‑free counter** — a big animated number showing days since your last
  kratom, front and center on the home screen.
- **Minimalist grid calendar** — a contribution‑style heatmap. Each day you
  drink lights up (💜 purple for extract, 💚 green for leaf tea). Tap any day
  for details.
- **Add a drink** — a quick popup to log **Extract** or **Leaf Tea**, today or
  any past date, with an optional note.
- **Safe Schedule** — set how many kratom‑free days you want between drinks.
  The home screen tells you whether you can drink today or how long to wait,
  and can send a local **push notification** the moment you become eligible.
  Modify or delete it anytime.
- **Full history** — browse every logged drink grouped by month; tap a day to
  see details and **delete** entries.
- **Medals & streaks** — track your **current** and **longest** kratom‑free
  streaks and earn medals for:
  - keeping a streak of at least 3 days (with silver/gold/platinum tiers),
  - beating your previous best streak,
  - consistently honoring your Safe Schedule.

## Tech stack

- **Expo** (SDK 52) + **Expo Router** (file‑based navigation, modal routes)
- **NativeWind v4** (Tailwind CSS for React Native) for styling
- **react‑native‑reanimated** for smooth, UI‑thread animations
- **expo‑haptics** for tactile feedback
- **expo‑notifications** for eligibility reminders
- **AsyncStorage** for local persistence (all data stays on device)

## Project structure

```
app/
  _layout.tsx        Root stack + providers, modal presentation
  index.tsx          Home: counter, schedule status, calendar, nav
  add-drink.tsx      Log a drink (type + date + note)
  schedule.tsx       Create / modify / delete the Safe Schedule
  history.tsx        Full intake history grouped by month
  medals.tsx         Streaks + medal collection
  day/[date].tsx     Per‑day details, delete entries
components/          Reusable UI (calendar, buttons, animated counter…)
lib/                 Pure logic: dates, stats/streaks, medals, haptics, notifications
store/               KratomStore — context + persistence + derived state
```

All tracking numbers (streaks, records, eligibility, medals) are **pure
functions** of the stored drinks + schedule, so the UI can never drift out of
sync with the data.

## Getting started

```bash
npm install
npx expo start        # then press "i" for the iOS simulator, or scan the QR
```

To generate the branded app icon / splash assets from scratch:

```bash
node scripts/gen-assets.js
```

## Run on your iPhone with Expo Go

KSafe runs in **Expo Go** — every library it uses is bundled in the Expo Go
runtime, and there's no custom native code. Run the dev server on your own
computer (not a cloud container, which your phone can't reach):

1. Install **Expo Go** from the App Store. It must support **SDK 52** (the
   current App Store build does; if it only supports a newer SDK, upgrade the
   project's Expo version).
2. On your Mac/PC:
   ```bash
   npm install
   npx expo start
   ```
3. Keep the computer and iPhone on the **same Wi‑Fi**, then open the **Camera**
   app and scan the QR code in the terminal. It opens in Expo Go.

On different networks? Use a tunnel:

```bash
npx expo start --tunnel
```

Notes:
- The **Safe Schedule reminder** uses a *local* notification, which works in
  Expo Go (iOS will prompt for permission). Only *remote push* is unsupported
  in Expo Go — and this app doesn't use it, so you may just see a harmless
  warning.
- Haptics and the liquid‑glass blur render fully on a real device.

## Shipping a TestFlight build

Builds go out via **GitHub Actions + Fastlane**, not Expo's cloud build
service (EAS) — the CI runner uses a real macOS box with Xcode, generating
the native iOS project fresh from this repo (`npx expo prebuild`) each run.
The app's code never changes for this; only the build path does.

**One-time setup, done once by you:**

1. **Apple Developer Program** membership ($99/yr) — required by Apple for
   any TestFlight distribution, regardless of build tooling.
2. Create an **App Store Connect API key**: App Store Connect → Users and
   Access → Integrations → App Store Connect API → **Generate API Key**
   (role: **App Manager** or **Admin**). Note the **Key ID** and **Issuer
   ID**, and download the `.p8` file — Apple only lets you download it once.
3. Create the app record in App Store Connect (My Apps → **+** → New App)
   using bundle ID `com.ksafe.app`, if it doesn't exist yet.
4. In this repo's **Settings → Secrets and variables → Actions**, add:
   | Secret | Value |
   |---|---|
   | `ASC_KEY_ID` | the Key ID from step 2 |
   | `ASC_ISSUER_ID` | the Issuer ID from step 2 |
   | `ASC_KEY_CONTENT` | the `.p8` file's contents, base64‑encoded: `base64 -i AuthKey_XXXXX.p8 \| pbcopy` |
   | `APPLE_TEAM_ID` | your 10‑character Apple Developer Team ID |

**Every time you want a new TestFlight build:** open this repo on GitHub →
**Actions** tab → **iOS – Build & Upload to TestFlight** → **Run workflow**.
It's manual‑only by design (it submits a real build to Apple), takes
roughly 15–25 minutes, and the build shows up in TestFlight a little after
that once Apple finishes processing it.

Locally on a Mac, the same pipeline is `npx expo prebuild --platform ios &&
cd ios && pod install && cd .. && bundle exec fastlane ios
release_testflight` (with the same four env vars exported).

## Disclaimer

KSafe is a self‑tracking aid, not medical advice. If you're managing kratom
dependence or withdrawal, please consult a qualified healthcare professional.
