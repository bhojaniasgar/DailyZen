-- Drop existing policy
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create new policy with correct permissions
CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
TO authenticated
USING (true)
WITH CHECK (auth.uid() = id);

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
