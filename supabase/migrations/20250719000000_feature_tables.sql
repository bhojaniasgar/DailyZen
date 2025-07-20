-- Create todos table
CREATE TABLE IF NOT EXISTS todos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  completed BOOLEAN DEFAULT FALSE,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create water_tracking table
CREATE TABLE IF NOT EXISTS water_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  amount_ml INTEGER NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create fuel_tracking table
CREATE TABLE IF NOT EXISTS fuel_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  amount_liters DECIMAL(10,2) NOT NULL,
  price_per_liter DECIMAL(10,2) NOT NULL,
  mileage_km DECIMAL(10,2),
  vehicle_name TEXT,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add new columns to profiles table for app preferences
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS biometrics_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Add RLS policies
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel_tracking ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can only access their own todos" ON todos
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own expenses" ON expenses
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own water tracking" ON water_tracking
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own fuel tracking" ON fuel_tracking
  FOR ALL USING (auth.uid() = user_id);
