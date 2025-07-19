# DailyZen

A comprehensive lifestyle and productivity app built with React Native and Expo.

## Features

- **Habit Tracker**: Build and maintain healthy habits with streak tracking
- **Task Manager**: Organize your to-dos with priorities and categories
- **Expense Tracker**: Monitor spending with detailed categorization
- **Water Intake**: Stay hydrated with intake logging and reminders
- **Fuel & Mileage**: Track vehicle fuel consumption and mileage
- **QR Scanner**: Scan QR codes and barcodes with history
- **Pomodoro Timer**: Focus sessions with break cycles
- **Daily Quotes**: Inspirational quotes and wisdom
- **This or That**: Fun polls and decision games
- **Multiple Themes**: Choose from 5 beautiful themes

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file with your Supabase credentials:
   ```
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Run the development server: `npm run dev`

## Tech Stack

- **Frontend**: React Native, Expo SDK 51
- **Navigation**: Expo Router
- **Database**: Supabase
- **State Management**: Zustand
- **Styling**: StyleSheet (React Native)
- **Icons**: Lucide React Native

## Project Structure

```
app/                    # App routes (Expo Router)
├── (auth)/            # Authentication screens
├── (onboarding)/      # Onboarding flow
├── (tabs)/            # Main app tabs
└── tools/             # Individual tool screens

components/            # Reusable components
├── dashboard/         # Dashboard-specific components
├── icons/             # Icon components
└── ui/                # UI components

context/               # React contexts
hooks/                 # Custom hooks
lib/                   # Utilities and configurations
store/                 # Zustand stores
types/                 # TypeScript type definitions
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License