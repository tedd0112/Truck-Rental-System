-- Create profiles table to store additional user information
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  first_name TEXT,
  last_name TEXT,
  email TEXT UNIQUE NOT NULL,
  phone_number TEXT,
  avatar_url TEXT,
  user_type TEXT NOT NULL CHECK (user_type IN ('passenger', 'driver')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trucks table
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
  location JSONB NOT NULL,
  features TEXT[] NOT NULL,
  availability BOOLEAN DEFAULT TRUE,
  owner_id UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  truck_id UUID REFERENCES trucks(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  total_cost DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  pickup_location JSONB NOT NULL,
  dropoff_location JSONB NOT NULL,
  payment_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trucks ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone" 
ON profiles FOR SELECT USING (true);

CREATE POLICY "Profiles can be inserted by the user" 
ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Profiles can be updated by the user" 
ON profiles FOR UPDATE USING (auth.uid() = id);

-- Trucks policies
CREATE POLICY "Trucks are viewable by everyone" 
ON trucks FOR SELECT USING (true);

CREATE POLICY "Trucks can be inserted by authenticated users" 
ON trucks FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Trucks can be updated by their owners" 
ON trucks FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Trucks can be deleted by their owners" 
ON trucks FOR DELETE USING (auth.uid() = owner_id);

-- Bookings policies
CREATE POLICY "Bookings are viewable by the customer or truck owner" 
ON bookings FOR SELECT USING (
  auth.uid() = user_id OR 
  auth.uid() IN (
    SELECT owner_id FROM trucks WHERE id = truck_id
  )
);

CREATE POLICY "Bookings can be inserted by authenticated users" 
ON bookings FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Bookings can be updated by the customer or truck owner" 
ON bookings FOR UPDATE USING (
  auth.uid() = user_id OR 
  auth.uid() IN (
    SELECT owner_id FROM trucks WHERE id = truck_id
  )
);

CREATE POLICY "Bookings can be deleted by the customer" 
ON bookings FOR DELETE USING (auth.uid() = user_id);

-- Create storage bucket for truck images
INSERT INTO storage.buckets (id, name, public) VALUES ('truck-images', 'truck-images', true);

-- Allow public access to truck images
CREATE POLICY "Truck images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'truck-images');

-- Allow authenticated users to upload truck images
CREATE POLICY "Users can upload truck images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'truck-images' AND auth.uid() IS NOT NULL);

-- Allow users to update their own truck images
CREATE POLICY "Users can update their own truck images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'truck-images' AND auth.uid() = owner);

-- Allow users to delete their own truck images
CREATE POLICY "Users can delete their own truck images"
ON storage.objects FOR DELETE
USING (bucket_id = 'truck-images' AND auth.uid() = owner);
