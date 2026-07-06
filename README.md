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

## Disclaimer

KSafe is a self‑tracking aid, not medical advice. If you're managing kratom
dependence or withdrawal, please consult a qualified healthcare professional.
