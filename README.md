# مخزن الكهربائيات - Electrical Warehouse Manager

An Arabic-first inventory management app for electrical parts warehouses, built with Expo (React Native) and the liquid-glass design aesthetic.

## Features

- **Search & Browse** — Find electrical parts by name, code, or shelf location
- **Barcode Scanning** — Scan barcodes to find items instantly using expo-camera
- **Dispense Items** — Withdraw items with quantity tracking and receipt generation
- **Thermal Receipt Printing** — Generate 80mm thermal receipt slips (MIV permits) as PDF via expo-print
- **Low-Stock Alerts** — Visual indicators for items running low
- **Daily Movement Reports** — View and export transaction reports by date range
- **Full RTL Support** — Every screen is right-to-left Arabic-first

## Tech Stack

- Expo SDK 54
- expo-router (file-based navigation)
- Zustand + AsyncStorage (local state persistence)
- expo-camera (barcode scanning)
- expo-print + expo-sharing (PDF receipt generation)
- @expo-google-fonts/cairo (Arabic typography)
- lucide-react-native (icons)
- react-native-reanimated (animations)

## Design System

**Colors:** Kangaro Crimson (#E5284B) + Creamy Ivory (#FAF6EE)
**Font:** Cairo (Regular, Medium, Bold)
**Layout:** RTL, 8px spacing system, 16px card radius

## Getting Started

```bash
npm install
npx expo start
```

Scan with Expo Go to test the UI, navigation, and forms. Camera and printing features require a development build or EAS build.

## Project Structure

```
app/                  # expo-router screens
  _layout.tsx         # Root: fonts, RTL, store init
  index.tsx           # Home screen
  scan.tsx            # Barcode scanner
  item/[id].tsx       # Item details + dispense
  item/new.tsx        # Add new item
  confirm/[txId].tsx  # Success + print receipt
  reports/index.tsx   # Daily movement report
  shelves/[code].tsx  # Shelf detail

src/
  components/          # Reusable UI components
  lib/                 # Utilities (storage, id, print)
  store/               # Zustand store
  theme/               # Colors and typography
  types/               # TypeScript interfaces
```

## License

MIT