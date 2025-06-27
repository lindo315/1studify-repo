/*
  # Enhanced Studify Database Schema - Production Ready

  1. Enhanced Tables
    - Enhanced profiles with XP and level system
    - User preferences for personalization
    - Enhanced sessions with recordings
    - Session files for document sharing
    - Call sessions for video calling
    - Achievements and gamification
    - Transactions for payments
    - Enhanced reviews with tags

  2. New Features
    - Gamification system (XP, levels, achievements)
    - File sharing capabilities
    - Video call management
    - Payment processing
    - Enhanced matching with scores
    - User preferences and settings

  3. Security
    - Comprehensive RLS policies for all tables
    - Proper access controls for sensitive data
    - Secure file upload handling
*/

-- Add new columns to existing profiles table if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'xp') THEN
    ALTER TABLE profiles ADD COLUMN xp integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'level') THEN
    ALTER TABLE profiles ADD COLUMN level integer DEFAULT 1;
  END IF;
END $$;

-- Create user preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  learning_style jsonb DEFAULT '{"type": "visual"}'::jsonb,
  availability_schedule jsonb DEFAULT '{"slots": []}'::jsonb,
  notification_settings jsonb DEFAULT '{"email": true, "push": true}'::jsonb,
  privacy_settings jsonb DEFAULT '{"profile_visible": true}'::jsonb,
  match_preferences jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Add new columns to existing matches table if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'matches' AND column_name = 'match_score') THEN
    ALTER TABLE matches ADD COLUMN match_score integer DEFAULT 0;
  END IF;
END $$;

-- Add new columns to existing messages table if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'message_type') THEN
    ALTER TABLE messages ADD COLUMN message_type text DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system'));
  END IF;
END $$;

-- Add new columns to existing study_plans table if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'study_plans' AND column_name = 'difficulty_level') THEN
    ALTER TABLE study_plans ADD COLUMN difficulty_level text DEFAULT 'intermediate' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced'));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'study_plans' AND column_name = 'estimated_hours') THEN
    ALTER TABLE study_plans ADD COLUMN estimated_hours integer DEFAULT 0;
  END IF;
END $$;

-- Add new columns to existing sessions table if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessions' AND column_name = 'recording_url') THEN
    ALTER TABLE sessions ADD COLUMN recording_url text;
  END IF;
END $$;

-- Create session files table
CREATE TABLE IF NOT EXISTS session_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES sessions(id) ON DELETE CASCADE,
  file_type text NOT NULL CHECK (file_type IN ('recording', 'document', 'whiteboard', 'screenshot')),
  file_url text NOT NULL,
  file_name text,
  file_size bigint,
  uploaded_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

-- Create call sessions table
CREATE TABLE IF NOT EXISTS call_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE,
  participants jsonb NOT NULL,
  status text DEFAULT 'connecting' CHECK (status IN ('connecting', 'active', 'ended')),
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  duration_seconds integer,
  recording_url text
);

-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text NOT NULL,
  points integer DEFAULT 0,
  icon_url text,
  requirements jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create user achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id uuid REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at timestamptz DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES sessions(id),
  payer_id uuid REFERENCES profiles(id),
  payee_id uuid REFERENCES profiles(id),
  amount numeric(10,2) NOT NULL,
  currency text DEFAULT 'USD',
  status text CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method text,
  transaction_fee numeric(10,2),
  stripe_payment_intent_id text,
  created_at timestamptz DEFAULT now()
);

-- Add new columns to existing reviews table if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'tags') THEN
    ALTER TABLE reviews ADD COLUMN tags jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Enable Row Level Security on new tables
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for new tables only if they don't exist

-- User preferences policies
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_preferences' AND policyname = 'Users can manage own preferences') THEN
    CREATE POLICY "Users can manage own preferences"
      ON user_preferences FOR ALL
      TO authenticated
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- Session files policies
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'session_files' AND policyname = 'Users can read session files for their sessions') THEN
    CREATE POLICY "Users can read session files for their sessions"
      ON session_files FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM sessions
          JOIN study_plans ON sessions.study_plan_id = study_plans.id
          WHERE sessions.id = session_id
          AND (study_plans.student_id = auth.uid() OR study_plans.tutor_id = auth.uid())
        )
      );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'session_files' AND policyname = 'Users can upload files to their sessions') THEN
    CREATE POLICY "Users can upload files to their sessions"
      ON session_files FOR INSERT
      TO authenticated
      WITH CHECK (
        uploaded_by = auth.uid() AND
        EXISTS (
          SELECT 1 FROM sessions
          JOIN study_plans ON sessions.study_plan_id = study_plans.id
          WHERE sessions.id = session_id
          AND (study_plans.student_id = auth.uid() OR study_plans.tutor_id = auth.uid())
        )
      );
  END IF;
END $$;

-- Call sessions policies
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'call_sessions' AND policyname = 'Users can read their call sessions') THEN
    CREATE POLICY "Users can read their call sessions"
      ON call_sessions FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM conversations
          JOIN matches ON conversations.match_id = matches.id
          WHERE conversations.id = conversation_id
          AND (matches.student_id = auth.uid() OR matches.tutor_id = auth.uid())
        )
      );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'call_sessions' AND policyname = 'Users can create call sessions for their conversations') THEN
    CREATE POLICY "Users can create call sessions for their conversations"
      ON call_sessions FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM conversations
          JOIN matches ON conversations.match_id = matches.id
          WHERE conversations.id = conversation_id
          AND (matches.student_id = auth.uid() OR matches.tutor_id = auth.uid())
        )
      );
  END IF;
END $$;

-- Achievements policies
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'achievements' AND policyname = 'Anyone can read achievements') THEN
    CREATE POLICY "Anyone can read achievements"
      ON achievements FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- User achievements policies
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_achievements' AND policyname = 'Users can read their achievements') THEN
    CREATE POLICY "Users can read their achievements"
      ON user_achievements FOR SELECT
      TO authenticated
      USING (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_achievements' AND policyname = 'System can award achievements') THEN
    CREATE POLICY "System can award achievements"
      ON user_achievements FOR INSERT
      TO authenticated
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- Transactions policies
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'transactions' AND policyname = 'Users can read their transactions') THEN
    CREATE POLICY "Users can read their transactions"
      ON transactions FOR SELECT
      TO authenticated
      USING (payer_id = auth.uid() OR payee_id = auth.uid());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'transactions' AND policyname = 'Users can create transactions they are involved in') THEN
    CREATE POLICY "Users can create transactions they are involved in"
      ON transactions FOR INSERT
      TO authenticated
      WITH CHECK (payer_id = auth.uid() OR payee_id = auth.uid());
  END IF;
END $$;

-- Insert enhanced sample subjects (only if they don't exist)
INSERT INTO subjects (name, category) VALUES
  ('React Development', 'STEM'),
  ('Machine Learning', 'STEM'),
  ('Creative Writing', 'Humanities'),
  ('Business Administration', 'Business'),
  ('Marketing', 'Business'),
  ('Finance', 'Business')
ON CONFLICT (name) DO NOTHING;

-- Insert sample achievements (only if they don't exist)
INSERT INTO achievements (name, description, category, points, requirements) VALUES
  ('First Connection', 'Made your first tutor match', 'social', 100, '{"matches": 1}'),
  ('Study Streak', 'Completed 7 consecutive days of study sessions', 'study', 200, '{"consecutive_days": 7}'),
  ('Knowledge Seeker', 'Completed 10 study sessions', 'progress', 150, '{"sessions_completed": 10}'),
  ('Top Performer', 'Achieved 90%+ average in assessments', 'achievement', 300, '{"average_score": 90}'),
  ('Helpful Tutor', 'Received 5-star rating from 10 students', 'social', 250, '{"five_star_ratings": 10}'),
  ('Subject Master', 'Completed advanced level in any subject', 'achievement', 400, '{"advanced_completion": 1}')
ON CONFLICT (name) DO NOTHING;

-- Create triggers for updated_at on new tables only if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_preferences_updated_at') THEN
    CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Update the handle_new_user function to include user preferences
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Insert profile if it doesn't exist
  INSERT INTO public.profiles (id, email, first_name, last_name, role, university, major)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'first_name', ''),
    COALESCE(new.raw_user_meta_data->>'last_name', ''),
    COALESCE(new.raw_user_meta_data->>'role', 'student'),
    new.raw_user_meta_data->>'university',
    new.raw_user_meta_data->>'major'
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- Create default user preferences if they don't exist
  INSERT INTO public.user_preferences (user_id)
  VALUES (new.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN new;
END;
$$ language plpgsql security definer;

-- Create indexes for better performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_verified ON profiles(verified);
CREATE INDEX IF NOT EXISTS idx_profiles_xp ON profiles(xp);
CREATE INDEX IF NOT EXISTS idx_profiles_level ON profiles(level);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_tutor_subjects_tutor_id ON tutor_subjects(tutor_id);
CREATE INDEX IF NOT EXISTS idx_matches_student_id ON matches(student_id);
CREATE INDEX IF NOT EXISTS idx_matches_tutor_id ON matches(tutor_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_score ON matches(match_score);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_type ON messages(message_type);
CREATE INDEX IF NOT EXISTS idx_sessions_study_plan_id ON sessions(study_plan_id);
CREATE INDEX IF NOT EXISTS idx_sessions_scheduled_at ON sessions(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_session_files_session_id ON session_files(session_id);
CREATE INDEX IF NOT EXISTS idx_call_sessions_conversation_id ON call_sessions(conversation_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON user_achievements(achievement_id);
CREATE INDEX IF NOT EXISTS idx_transactions_payer_id ON transactions(payer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_payee_id ON transactions(payee_id);
CREATE INDEX IF NOT EXISTS idx_transactions_session_id ON transactions(session_id);