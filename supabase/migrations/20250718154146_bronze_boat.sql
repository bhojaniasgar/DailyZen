/*
  # Complete DailyZen Database Schema

  1. New Tables
    - `profiles` - User profiles with theme preferences
    - `habits` - Habit tracking with streaks
    - `habit_entries` - Daily habit completion records
    - `tasks` - To-do items with priorities and categories
    - `expenses` - Expense tracking with categories
    - `water_entries` - Water intake logging
    - `fuel_entries` - Vehicle fuel and mileage tracking
    - `pomodoro_sessions` - Focus timer sessions
    - `polls` - Community polls for This or That game
    - `user_poll_votes` - User voting records
    - `quotes` - Motivational quotes database
    - `user_quote_favorites` - User favorite quotes
    - `scan_history` - QR/Barcode scan history

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
    - Add policies for public data like quotes and polls

  3. Indexes
    - Add performance indexes for frequently queried columns
    - Add composite indexes for date-based queries
*/

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text DEFAULT '',
  avatar_url text,
  theme_preference text DEFAULT 'calm-blue',
  notification_settings jsonb DEFAULT '{"habits": true, "tasks": true, "water": true, "quotes": true, "pomodoro": true}'::jsonb,
  onboarding_completed boolean DEFAULT false,
  premium_status boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habits table
CREATE TABLE IF NOT EXISTS habits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  icon text DEFAULT 'target',
  color text DEFAULT '#3B82F6',
  frequency text DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekly', 'custom')),
  target_count integer DEFAULT 1,
  streak_count integer DEFAULT 0,
  best_streak integer DEFAULT 0,
  reminder_time time,
  reminder_enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habit entries table
CREATE TABLE IF NOT EXISTS habit_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id uuid REFERENCES habits(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  completed boolean DEFAULT false,
  count integer DEFAULT 0,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  UNIQUE(habit_id, date)
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  category text DEFAULT 'general',
  due_date timestamptz,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  recurring boolean DEFAULT false,
  recurring_pattern text,
  parent_task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  amount decimal(10,2) NOT NULL,
  category text NOT NULL,
  description text DEFAULT '',
  date date NOT NULL,
  payment_method text DEFAULT 'cash',
  tags text[] DEFAULT ARRAY[]::text[],
  receipt_url text,
  created_at timestamptz DEFAULT now()
);

-- Water entries table
CREATE TABLE IF NOT EXISTS water_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  amount integer NOT NULL, -- in ml
  date date NOT NULL,
  time time DEFAULT CURRENT_TIME,
  created_at timestamptz DEFAULT now()
);

-- Fuel entries table
CREATE TABLE IF NOT EXISTS fuel_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  vehicle_name text DEFAULT 'My Vehicle',
  odometer integer NOT NULL,
  fuel_amount decimal(8,2) NOT NULL,
  fuel_cost decimal(8,2) NOT NULL,
  fuel_type text DEFAULT 'gasoline',
  date date NOT NULL,
  location text DEFAULT '',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Pomodoro sessions table
CREATE TABLE IF NOT EXISTS pomodoro_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  session_type text NOT NULL CHECK (session_type IN ('work', 'short_break', 'long_break')),
  duration integer NOT NULL, -- in minutes
  completed boolean DEFAULT false,
  interrupted boolean DEFAULT false,
  task_description text DEFAULT '',
  date date NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Polls table (public data)
CREATE TABLE IF NOT EXISTS polls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  option_a text NOT NULL,
  option_b text NOT NULL,
  option_a_image text,
  option_b_image text,
  votes_a integer DEFAULT 0,
  votes_b integer DEFAULT 0,
  category text DEFAULT 'general',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz
);

-- User poll votes table
CREATE TABLE IF NOT EXISTS user_poll_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  poll_id uuid REFERENCES polls(id) ON DELETE CASCADE NOT NULL,
  choice text NOT NULL CHECK (choice IN ('a', 'b')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, poll_id)
);

-- Quotes table (public data)
CREATE TABLE IF NOT EXISTS quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  text text NOT NULL,
  author text NOT NULL,
  category text DEFAULT 'motivation',
  tags text[] DEFAULT ARRAY[]::text[],
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- User quote favorites table
CREATE TABLE IF NOT EXISTS user_quote_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  quote_id uuid REFERENCES quotes(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, quote_id)
);

-- Scan history table
CREATE TABLE IF NOT EXISTS scan_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  scan_type text NOT NULL CHECK (scan_type IN ('qr', 'barcode')),
  scan_data text NOT NULL,
  scan_result jsonb,
  title text,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE pomodoro_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quote_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- RLS Policies for habits
CREATE POLICY "Users can manage own habits"
  ON habits FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own habit entries"
  ON habit_entries FOR ALL
  TO authenticated
  USING (auth.uid() = (SELECT user_id FROM habits WHERE id = habit_id));

-- RLS Policies for tasks
CREATE POLICY "Users can manage own tasks"
  ON tasks FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for expenses
CREATE POLICY "Users can manage own expenses"
  ON expenses FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for water entries
CREATE POLICY "Users can manage own water entries"
  ON water_entries FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for fuel entries
CREATE POLICY "Users can manage own fuel entries"
  ON fuel_entries FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for pomodoro sessions
CREATE POLICY "Users can manage own pomodoro sessions"
  ON pomodoro_sessions FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for polls (public read, admin write)
CREATE POLICY "Anyone can read polls"
  ON polls FOR SELECT
  TO authenticated
  USING (is_active = true);

-- RLS Policies for user poll votes
CREATE POLICY "Users can manage own poll votes"
  ON user_poll_votes FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for quotes (public read)
CREATE POLICY "Anyone can read quotes"
  ON quotes FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for user quote favorites
CREATE POLICY "Users can manage own quote favorites"
  ON user_quote_favorites FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for scan history
CREATE POLICY "Users can manage own scan history"
  ON scan_history FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_entries_habit_id ON habit_entries(habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_entries_date ON habit_entries(date);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_water_entries_user_id ON water_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_water_entries_date ON water_entries(date);
CREATE INDEX IF NOT EXISTS idx_fuel_entries_user_id ON fuel_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_fuel_entries_date ON fuel_entries(date);
CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_user_id ON pomodoro_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_date ON pomodoro_sessions(date);
CREATE INDEX IF NOT EXISTS idx_user_poll_votes_user_id ON user_poll_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_poll_votes_poll_id ON user_poll_votes(poll_id);
CREATE INDEX IF NOT EXISTS idx_scan_history_user_id ON scan_history(user_id);
CREATE INDEX IF NOT EXISTS idx_scan_history_created_at ON scan_history(created_at);

-- Insert sample quotes
INSERT INTO quotes (text, author, category, tags) VALUES
  ('The only way to do great work is to love what you do.', 'Steve Jobs', 'motivation', ARRAY['work', 'passion']),
  ('Life is what happens to you while you''re busy making other plans.', 'John Lennon', 'life', ARRAY['planning', 'mindfulness']),
  ('The future belongs to those who believe in the beauty of their dreams.', 'Eleanor Roosevelt', 'dreams', ARRAY['future', 'belief']),
  ('Success is not final, failure is not fatal: it is the courage to continue that counts.', 'Winston Churchill', 'success', ARRAY['courage', 'persistence']),
  ('The only impossible journey is the one you never begin.', 'Tony Robbins', 'motivation', ARRAY['journey', 'beginning']),
  ('In the middle of difficulty lies opportunity.', 'Albert Einstein', 'challenges', ARRAY['opportunity', 'growth']),
  ('Believe you can and you''re halfway there.', 'Theodore Roosevelt', 'confidence', ARRAY['belief', 'mindset']),
  ('The best time to plant a tree was 20 years ago. The second best time is now.', 'Chinese Proverb', 'action', ARRAY['time', 'action']),
  ('Your limitation—it''s only your imagination.', 'Unknown', 'motivation', ARRAY['limitations', 'imagination']),
  ('Push yourself, because no one else is going to do it for you.', 'Unknown', 'motivation', ARRAY['self-improvement', 'effort'])
ON CONFLICT DO NOTHING;

-- Insert sample polls
INSERT INTO polls (question, option_a, option_b, category) VALUES
  ('What''s your preferred way to start the day?', 'Coffee', 'Tea', 'lifestyle'),
  ('Which season do you enjoy most?', 'Spring', 'Autumn', 'preferences'),
  ('What''s more important for productivity?', 'Morning routine', 'Evening routine', 'productivity'),
  ('Which type of exercise do you prefer?', 'Cardio', 'Strength training', 'fitness'),
  ('What''s your ideal way to relax?', 'Reading a book', 'Watching movies', 'relaxation'),
  ('Which work environment suits you better?', 'Home office', 'Coffee shop', 'work'),
  ('What''s your preferred learning style?', 'Visual', 'Auditory', 'learning'),
  ('Which meal is most important to you?', 'Breakfast', 'Dinner', 'food'),
  ('What''s your ideal vacation?', 'Beach', 'Mountains', 'travel'),
  ('Which technology do you use most?', 'Smartphone', 'Laptop', 'technology')
ON CONFLICT DO NOTHING;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_habits_updated_at BEFORE UPDATE ON habits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();