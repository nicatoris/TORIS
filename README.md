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

## Disclaimer

KSafe is a self‑tracking aid, not medical advice. If you're managing kratom
dependence or withdrawal, please consult a qualified healthcare professional.
