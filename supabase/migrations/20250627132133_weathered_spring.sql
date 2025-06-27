/*
  # Enhanced Studify Database Schema with Production Features

  1. New Tables
    - Enhanced existing tables with additional fields
    - Added user preferences and settings
    - Added session files and recordings
    - Added achievements and gamification
    - Added payment transactions
    - Added call sessions for video calling
    - Added user levels and XP system

  2. Security
    - Enable RLS on all tables
    - Add comprehensive policies for all user interactions
    - Secure file access and payment data

  3. Performance
    - Added proper indexes for common queries
    - Optimized foreign key relationships
*/

-- Create profiles table with enhanced fields
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('student', 'tutor')),
  university text,
  major text,
  bio text,
  avatar_url text,
  rating numeric(3,2) CHECK (rating >= 0 AND rating <= 5),
  hourly_rate numeric(10,2) CHECK (hourly_rate >= 0),
  verified boolean DEFAULT false,
  xp integer DEFAULT 0,
  level integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

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

-- Create subjects table
CREATE TABLE IF NOT EXISTS subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  category text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create tutor_subjects table
CREATE TABLE IF NOT EXISTS tutor_subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  subject_id uuid REFERENCES subjects(id) ON DELETE CASCADE,
  proficiency_level text NOT NULL CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(tutor_id, subject_id)
);

-- Create matches table
CREATE TABLE IF NOT EXISTS matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  tutor_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'matched', 'rejected')),
  match_score integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(student_id, tutor_id)
);

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid REFERENCES matches(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  message_type text DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
  created_at timestamptz DEFAULT now()
);

-- Create study_plans table
CREATE TABLE IF NOT EXISTS study_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  tutor_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  subject text NOT NULL,
  description text,
  goals jsonb DEFAULT '[]'::jsonb,
  progress integer DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  difficulty_level text DEFAULT 'intermediate' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  estimated_hours integer DEFAULT 0,
  due_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  study_plan_id uuid REFERENCES study_plans(id) ON DELETE CASCADE,
  scheduled_at timestamptz NOT NULL,
  duration_minutes integer NOT NULL CHECK (duration_minutes > 0),
  type text NOT NULL CHECK (type IN ('video', 'in_person')),
  location text,
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  notes text,
  recording_url text,
  created_at timestamptz DEFAULT now()
);

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

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  reviewee_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  session_id uuid REFERENCES sessions(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  tags jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  UNIQUE(reviewer_id, session_id)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutor_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow profile creation during signup"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = id AND
    NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid())
  );

-- User preferences policies
CREATE POLICY "Users can manage own preferences"
  ON user_preferences FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Subjects policies (read-only for all authenticated users)
CREATE POLICY "Anyone can read subjects"
  ON subjects FOR SELECT
  TO authenticated
  USING (true);

-- Tutor subjects policies
CREATE POLICY "Anyone can read tutor subjects"
  ON tutor_subjects FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Tutors can manage their subjects"
  ON tutor_subjects FOR ALL
  TO authenticated
  USING (tutor_id = auth.uid())
  WITH CHECK (tutor_id = auth.uid());

-- Matches policies
CREATE POLICY "Users can read their matches"
  ON matches FOR SELECT
  TO authenticated
  USING (student_id = auth.uid() OR tutor_id = auth.uid());

CREATE POLICY "Students can create matches"
  ON matches FOR INSERT
  TO authenticated
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Users can update their matches"
  ON matches FOR UPDATE
  TO authenticated
  USING (student_id = auth.uid() OR tutor_id = auth.uid());

-- Conversations policies
CREATE POLICY "Users can read their conversations"
  ON conversations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM matches 
      WHERE matches.id = match_id 
      AND (matches.student_id = auth.uid() OR matches.tutor_id = auth.uid())
    )
  );

CREATE POLICY "Users can create conversations for their matches"
  ON conversations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM matches 
      WHERE matches.id = match_id 
      AND (matches.student_id = auth.uid() OR matches.tutor_id = auth.uid())
    )
  );

-- Messages policies
CREATE POLICY "Users can read messages in their conversations"
  ON messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      JOIN matches ON conversations.match_id = matches.id
      WHERE conversations.id = conversation_id
      AND (matches.student_id = auth.uid() OR matches.tutor_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages in their conversations"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM conversations
      JOIN matches ON conversations.match_id = matches.id
      WHERE conversations.id = conversation_id
      AND (matches.student_id = auth.uid() OR matches.tutor_id = auth.uid())
    )
  );

-- Study plans policies
CREATE POLICY "Users can read their study plans"
  ON study_plans FOR SELECT
  TO authenticated
  USING (student_id = auth.uid() OR tutor_id = auth.uid());

CREATE POLICY "Students and tutors can create study plans"
  ON study_plans FOR INSERT
  TO authenticated
  WITH CHECK (student_id = auth.uid() OR tutor_id = auth.uid());

CREATE POLICY "Users can update their study plans"
  ON study_plans FOR UPDATE
  TO authenticated
  USING (student_id = auth.uid() OR tutor_id = auth.uid());

-- Sessions policies
CREATE POLICY "Users can read sessions for their study plans"
  ON sessions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM study_plans
      WHERE study_plans.id = study_plan_id
      AND (study_plans.student_id = auth.uid() OR study_plans.tutor_id = auth.uid())
    )
  );

CREATE POLICY "Users can manage sessions for their study plans"
  ON sessions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM study_plans
      WHERE study_plans.id = study_plan_id
      AND (study_plans.student_id = auth.uid() OR study_plans.tutor_id = auth.uid())
    )
  );

-- Session files policies
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

-- Call sessions policies
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

-- Achievements policies
CREATE POLICY "Anyone can read achievements"
  ON achievements FOR SELECT
  TO authenticated
  USING (true);

-- User achievements policies
CREATE POLICY "Users can read their achievements"
  ON user_achievements FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can award achievements"
  ON user_achievements FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Transactions policies
CREATE POLICY "Users can read their transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (payer_id = auth.uid() OR payee_id = auth.uid());

CREATE POLICY "Users can create transactions they're involved in"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (payer_id = auth.uid() OR payee_id = auth.uid());

-- Reviews policies
CREATE POLICY "Anyone can read reviews"
  ON reviews FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create reviews for their sessions"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    reviewer_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM sessions
      JOIN study_plans ON sessions.study_plan_id = study_plans.id
      WHERE sessions.id = session_id
      AND (study_plans.student_id = auth.uid() OR study_plans.tutor_id = auth.uid())
    )
  );

-- Insert enhanced sample subjects
INSERT INTO subjects (name, category) VALUES
  ('Mathematics', 'STEM'),
  ('Calculus I', 'STEM'),
  ('Calculus II', 'STEM'),
  ('Linear Algebra', 'STEM'),
  ('Statistics', 'STEM'),
  ('Computer Science', 'STEM'),
  ('Python Programming', 'STEM'),
  ('JavaScript', 'STEM'),
  ('React Development', 'STEM'),
  ('Data Structures', 'STEM'),
  ('Algorithms', 'STEM'),
  ('Machine Learning', 'STEM'),
  ('Physics', 'STEM'),
  ('Chemistry', 'STEM'),
  ('Organic Chemistry', 'STEM'),
  ('Biology', 'STEM'),
  ('English Literature', 'Humanities'),
  ('Creative Writing', 'Humanities'),
  ('History', 'Humanities'),
  ('Psychology', 'Social Sciences'),
  ('Economics', 'Social Sciences'),
  ('Business Administration', 'Business'),
  ('Marketing', 'Business'),
  ('Finance', 'Business')
ON CONFLICT (name) DO NOTHING;

-- Insert sample achievements
INSERT INTO achievements (name, description, category, points, requirements) VALUES
  ('First Connection', 'Made your first tutor match', 'social', 100, '{"matches": 1}'),
  ('Study Streak', 'Completed 7 consecutive days of study sessions', 'study', 200, '{"consecutive_days": 7}'),
  ('Knowledge Seeker', 'Completed 10 study sessions', 'progress', 150, '{"sessions_completed": 10}'),
  ('Top Performer', 'Achieved 90%+ average in assessments', 'achievement', 300, '{"average_score": 90}'),
  ('Helpful Tutor', 'Received 5-star rating from 10 students', 'social', 250, '{"five_star_ratings": 10}'),
  ('Subject Master', 'Completed advanced level in any subject', 'achievement', 400, '{"advanced_completion": 1}')
ON CONFLICT (name) DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_study_plans_updated_at BEFORE UPDATE ON study_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role, university, major)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'first_name', ''),
    COALESCE(new.raw_user_meta_data->>'last_name', ''),
    COALESCE(new.raw_user_meta_data->>'role', 'student'),
    new.raw_user_meta_data->>'university',
    new.raw_user_meta_data->>'major'
  );
  
  -- Create default user preferences
  INSERT INTO public.user_preferences (user_id)
  VALUES (new.id);
  
  RETURN new;
END;
$$ language plpgsql security definer;

-- Create trigger to automatically create profile when user confirms email
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW
  WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
  EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_verified ON profiles(verified);
CREATE INDEX IF NOT EXISTS idx_tutor_subjects_tutor_id ON tutor_subjects(tutor_id);
CREATE INDEX IF NOT EXISTS idx_matches_student_id ON matches(student_id);
CREATE INDEX IF NOT EXISTS idx_matches_tutor_id ON matches(tutor_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_sessions_study_plan_id ON sessions(study_plan_id);
CREATE INDEX IF NOT EXISTS idx_sessions_scheduled_at ON sessions(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);