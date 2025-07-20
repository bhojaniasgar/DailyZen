export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  theme_preference: ThemeName;
  onboarding_completed?: boolean;
  premium_status?: boolean;
  created_at: string;
  updated_at: string;
}

export type ThemeName = 'calm-blue' | 'solar-dark' | 'nature-green' | 'sunset-orange' | 'minimal-white' | 'purple-dream' | 'rose-gold' | 'ocean-blue';

export interface Theme {
  name: ThemeName;
  displayName: string;
  colors: {
    primary: string;
    primaryDark: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    card: string;
    shadow: string;
  };
}

export interface Habit {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  icon: string;
  color: string;
  frequency: 'daily' | 'weekly' | 'custom';
  target_count: number;
  streak_count: number;
  best_streak?: number;
  reminder_time?: string;
  reminder_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface HabitEntry {
  id: string;
  habit_id: string;
  date: string;
  completed: boolean;
  count: number;
  notes?: string;
  created_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  due_date?: string;
  completed: boolean;
  completed_at?: string;
  recurring: boolean;
  recurring_pattern?: string;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: string;
  user_id: string;
  amount: number;
  category: string;
  description?: string;
  date: string;
  created_at: string;
}

export interface WaterEntry {
  id: string;
  user_id: string;
  amount: number;
  date: string;
  created_at: string;
}

export interface FuelEntry {
  id: string;
  user_id: string;
  vehicle_name?: string;
  odometer: number;
  fuel_amount: number;
  fuel_cost: number;
  date: string;
  location?: string;
  notes?: string;
  created_at: string;
}

export interface Quote {
  id: string;
  text: string;
  author: string;
  category: string;
  tags?: string[];
  is_favorited?: boolean;
}

export interface PomodoroSession {
  id: string;
  user_id: string;
  duration: number;
  session_type: 'work' | 'short_break' | 'long_break';
  completed: boolean;
  date: string;
  created_at: string;
}

export interface Poll {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  votes_a: number;
  votes_b: number;
  created_at: string;
}

export interface UserPollVote {
  id: string;
  user_id: string;
  poll_id: string;
  choice: 'a' | 'b';
  created_at: string;
}

export interface ToolConfig {
  id: string;
  name: string;
  icon: string;
  route: string;
  description: string;
  isPremium: boolean;
  isEnabled: boolean;
  order: number;
}

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'habit' | 'task' | 'expense' | 'quote' | 'tool';
  route?: string;
  data?: any;
}