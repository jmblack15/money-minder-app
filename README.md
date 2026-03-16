# Money Minder — Mobile App

Personal finance app built with **Expo + React Native**. Connects to a local REST backend.

## Tech Stack

| Layer | Library |
|---|---|
| Framework | Expo SDK 54 / React Native 0.81 |
| Navigation | Expo Router 6 (file-based) |
| State (server) | TanStack React Query |
| State (client) | Zustand |
| HTTP | Axios (with silent token refresh) |
| Auth storage | expo-secure-store |
| Charts | react-native-svg |
| Animations | react-native-reanimated |
| Gestures | react-native-gesture-handler |

## Prerequisites

- Node.js >= 18
- Expo CLI (`npm i -g expo-cli`)
- Expo Go app on your phone **or** an iOS/Android emulator
- Backend running (default: `http://localhost:3000`)

## Installation

```bash
# 1. Clone and enter the project
cd money-minder-app

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env and set EXPO_PUBLIC_API_URL

# 4. Start the dev server
npx expo start
```

## Environment Variables

Create a `.env` file in the project root (copy from `.env.example`):

```env
# URL of your backend API
EXPO_PUBLIC_API_URL=http://localhost:3000
```

> **Physical device tip:** Replace `localhost` with your machine's LAN IP address
> (e.g., `http://192.168.1.100:3000`) so that Expo Go can reach the backend.

## Project Structure

```
app/
  (auth)/           Login and Register screens
  (tabs)/           Main tab screens:
    index           Dashboard
    transactions    Transaction list + filters
    budgets         Budget management
    goals           Savings goals
    reports         Charts and reports
    accounts        Account management
  transaction/
    new             New transaction form (modal)
    [id]            Transaction detail / delete (modal)

components/ui/      Reusable design system components
constants/
  colors.ts         Design token palette
  types.ts          All TypeScript interfaces
hooks/              React Query hooks for each resource
services/api.ts     Axios instance with JWT interceptors
store/
  authStore.ts      Zustand auth store (tokens + user)
  financeStore.ts   Zustand finance store (accounts, categories, filters)
```

## Features

- Dark mode first design
- JWT authentication with automatic silent refresh
- Secure token storage (Keychain / Keystore)
- Dashboard with balance, account cards, and recent transactions
- Infinite scroll transaction list with swipe-to-delete
- Filters by type, account, and category (persisted in store)
- Budget tracking with color-coded progress bars
- Savings goals with contribution workflow
- Reports with bar chart and category breakdown
- Pull-to-refresh on all screens
- Skeleton loaders (no generic spinners)
- Haptic feedback on key actions

## Available Scripts

```bash
npx expo start          # Start dev server
npx expo start --ios    # Open iOS simulator
npx expo start --android # Open Android emulator
npx expo lint           # Run ESLint
```
