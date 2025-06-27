/*
  # Fix Profile RLS Policy for Sign-up

  1. Security Changes
    - Update the profile insertion policy to allow users to create their own profile during sign-up
    - The policy now checks that the user ID matches the profile ID being inserted
*/

-- Drop the existing policy
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create a new policy that allows users to insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Also ensure we have a policy for public sign-up (during the brief moment between user creation and profile creation)
CREATE POLICY "Allow profile creation during signup"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = id AND
    NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid())
  );