import { create } from 'zustand';
import { ToolConfig } from '@/types/global';

interface AppState {
  isOnboardingComplete: boolean;
  dashboardTools: ToolConfig[];
  searchQuery: string;
  notifications: any[];
  setOnboardingComplete: (complete: boolean) => void;
  updateToolOrder: (tools: ToolConfig[]) => void;
  setSearchQuery: (query: string) => void;
  addNotification: (notification: any) => void;
  removeNotification: (id: string) => void;
}

const defaultTools: ToolConfig[] = [
  {
    id: 'habits',
    name: 'Habit Tracker',
    icon: 'target',
    route: '/tools/habits',
    description: 'Track daily habits and build streaks',
    isPremium: false,
    isEnabled: true,
    order: 0,
  },
  {
    id: 'todos',
    name: 'To-Do List',
    icon: 'check-square',
    route: '/tools/todos',
    description: 'Manage tasks and stay organized',
    isPremium: false,
    isEnabled: true,
    order: 1,
  },
  {
    id: 'expenses',
    name: 'Expense Tracker',
    icon: 'dollar-sign',
    route: '/tools/expenses',
    description: 'Track spending and budgets',
    isPremium: false,
    isEnabled: true,
    order: 2,
  },
  {
    id: 'water',
    name: 'Water Intake',
    icon: 'droplets',
    route: '/tools/water',
    description: 'Stay hydrated with reminders',
    isPremium: false,
    isEnabled: true,
    order: 3,
  },
  {
    id: 'fuel',
    name: 'Fuel & Mileage',
    icon: 'fuel',
    route: '/tools/fuel',
    description: 'Track vehicle fuel and mileage',
    isPremium: false,
    isEnabled: true,
    order: 4,
  },
  {
    id: 'scanner',
    name: 'QR Scanner',
    icon: 'qr-code',
    route: '/tools/scanner',
    description: 'Scan QR codes and barcodes',
    isPremium: false,
    isEnabled: true,
    order: 5,
  },
  {
    id: 'quotes',
    name: 'Daily Quotes',
    icon: 'quote',
    route: '/tools/quotes',
    description: 'Inspirational quotes and wisdom',
    isPremium: false,
    isEnabled: true,
    order: 6,
  },
  {
    id: 'pomodoro',
    name: 'Pomodoro Timer',
    icon: 'timer',
    route: '/tools/pomodoro',
    description: 'Focus timer with break cycles',
    isPremium: false,
    isEnabled: true,
    order: 7,
  },
  {
    id: 'polls',
    name: 'This or That',
    icon: 'vote',
    route: '/tools/polls',
    description: 'Fun polls and decision games',
    isPremium: false,
    isEnabled: true,
    order: 8,
  },
  {
    id: 'utilities',
    name: 'Utility Pack',
    icon: 'calculator',
    route: '/tools/utilities',
    description: 'BMI, age calculator and more',
    isPremium: true,
    isEnabled: true,
    order: 9,
  },
];

export const useAppStore = create<AppState>((set) => ({
  isOnboardingComplete: false,
  dashboardTools: defaultTools,
  searchQuery: '',
  notifications: [],
  setOnboardingComplete: (complete) => set({ isOnboardingComplete: complete }),
  updateToolOrder: (tools) => set({ dashboardTools: tools }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  addNotification: (notification) => 
    set((state) => ({ notifications: [...state.notifications, notification] })),
  removeNotification: (id) => 
    set((state) => ({ notifications: state.notifications.filter(n => n.id !== id) })),
}));