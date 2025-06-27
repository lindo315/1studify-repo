/*
  # Create profile trigger for new users

  1. Functions
    - Create function to automatically create profile when user signs up
  
  2. Triggers
    - Trigger to create profile on user creation
*/

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
  RETURN new;
END;
$$ language plpgsql security definer;

-- Create trigger to automatically create profile when user confirms email
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW
  WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
  EXECUTE FUNCTION public.handle_new_user();