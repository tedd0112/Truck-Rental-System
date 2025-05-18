-- Create profiles table with all required fields
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone_number TEXT,
  avatar_url TEXT,
  user_type TEXT NOT NULL DEFAULT 'passenger',
  license_number TEXT,
  license_expiry TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Profiles are viewable by everyone" 
ON profiles FOR SELECT USING (true);

CREATE POLICY "Profiles can be inserted by the user" 
ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Profiles can be updated by the user" 
ON profiles FOR UPDATE USING (auth.uid() = id);
