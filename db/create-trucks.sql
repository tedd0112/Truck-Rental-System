-- Create trucks table if it doesn't exist
CREATE TABLE IF NOT EXISTS trucks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  size TEXT NOT NULL,
  capacity DECIMAL(10, 2) NOT NULL,
  description TEXT,
  daily_rate DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  location JSONB NOT NULL DEFAULT '{"address": "Not specified", "lat": 0, "lng": 0}'::jsonb,
  features TEXT[] NOT NULL DEFAULT '{}',
  availability BOOLEAN DEFAULT TRUE,
  owner_id UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE trucks ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow users to view all trucks
CREATE POLICY IF NOT EXISTS "Trucks are viewable by everyone" 
ON trucks FOR SELECT 
USING (true);

-- Allow users to insert their own trucks
CREATE POLICY IF NOT EXISTS "Trucks can be inserted by authenticated users" 
ON trucks FOR INSERT 
WITH CHECK (auth.uid() = owner_id);

-- Allow users to update their own trucks
CREATE POLICY IF NOT EXISTS "Trucks can be updated by their owners" 
ON trucks FOR UPDATE 
USING (auth.uid() = owner_id);

-- Allow users to delete their own trucks
CREATE POLICY IF NOT EXISTS "Trucks can be deleted by their owners" 
ON trucks FOR DELETE 
USING (auth.uid() = owner_id);
