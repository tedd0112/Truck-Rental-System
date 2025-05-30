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
CREATE OR REPLACE FUNCTION calculate_dynamic_price(
  origin_lat DECIMAL,
  origin_lng DECIMAL,
  dest_lat DECIMAL,
  dest_lng DECIMAL,
  vehicle_type_param VARCHAR(50),
  requested_time TIMESTAMP
) RETURNS JSON AS $$
DECLARE
  -- Route metrics
  distance_km DECIMAL;
  duration_minutes INT;
  
  -- Pricing components
  base_rate DECIMAL;
  per_km_rate DECIMAL;
  per_minute_rate DECIMAL;
  min_fare DECIMAL;
  vehicle_multiplier DECIMAL;
  time_multiplier DECIMAL := 1.0;
  area_multiplier DECIMAL := 1.0;
  
  -- Calculated values
  base_price DECIMAL;
  final_price DECIMAL;
  adjusted_final_price DECIMAL;
  
  -- API response
  google_maps_response JSON;
  route_available BOOLEAN;
  
  -- For logging
  calculation_details JSONB;
  model_id INT;
BEGIN
  -- Step 1: Get route metrics (simplified - implement real API call)
  google_maps_response := json_build_object(
    'distance_km', 45.2, -- Mock value, replace with actual API call
    'duration_minutes', 38, -- Mock value
    'route_available', true
  );
  
  -- Extract values from response
  distance_km := (google_maps_response->>'distance_km')::DECIMAL;
  duration_minutes := (google_maps_response->>'duration_minutes')::INT;
  route_available := (google_maps_response->>'route_available')::BOOLEAN;
  
  IF NOT route_available THEN
    RETURN json_build_object(
      'status', 'error',
      'message', 'No available route between locations'
    );
  END IF;
  
  -- Step 2: Get active pricing model
  SELECT 
    m.model_id, m.base_rate, m.per_km_rate, m.per_minute_rate, m.min_fare
  INTO 
    model_id, base_rate, per_km_rate, per_minute_rate, min_fare
  FROM pricing_models m
  WHERE m.is_active = TRUE 
  ORDER BY m.created_at DESC 
  LIMIT 1;
  
  -- Step 3: Get vehicle type multiplier
  SELECT vm.multiplier INTO vehicle_multiplier
  FROM vehicle_multipliers vm
  WHERE vm.vehicle_type = vehicle_type_param;
  
  -- Step 4: Apply time-based pricing factors
  SELECT COALESCE(
    (SELECT pf.multiplier 
     FROM pricing_factors pf
     WHERE pf.applies_to = 'time' 
       AND pf.time_range @> requested_time::TIMESTAMP
       AND pf.is_active = TRUE
     ORDER BY pf.multiplier DESC LIMIT 1),
    1.0
  ) INTO time_multiplier;
  
  -- Step 5: Calculate prices
  base_price := base_rate + (distance_km * per_km_rate) + (duration_minutes * per_minute_rate);
  final_price := base_price * vehicle_multiplier * time_multiplier * area_multiplier;
  
  -- Apply minimum fare using a separate variable
  adjusted_final_price := GREATEST(final_price, min_fare);
  
  -- Prepare calculation details for logging
  calculation_details := jsonb_build_object(
    'distance_km', distance_km,
    'duration_minutes', duration_minutes,
    'base_rate', base_rate,
    'per_km_rate', per_km_rate,
    'per_minute_rate', per_minute_rate,
    'vehicle_multiplier', vehicle_multiplier,
    'time_multiplier', time_multiplier,
    'area_multiplier', area_multiplier,
    'base_price', base_price,
    'final_price', final_price,
    'adjusted_final_price', adjusted_final_price,
    'min_fare', min_fare
  );
  
  -- Log the calculation
  INSERT INTO price_calculations (
    base_price,
    final_price,
    distance_km,
    duration_minutes,
    pricing_model_id,
    calculation_details
  ) VALUES (
    base_price,
    adjusted_final_price,
    distance_km,
    duration_minutes,
    model_id,
    calculation_details
  );
  
  RETURN json_build_object(
    'status', 'success',
    'price', adjusted_final_price,
    'currency', 'USD',
    'price_breakdown', calculation_details,
    'route_info', google_maps_response
  );
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'status', 'error',
    'message', SQLERRM,
    'detail', SQLSTATE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_google_maps_route(
  origin_lat DECIMAL,
  origin_lng DECIMAL,
  dest_lat DECIMAL,
  dest_lng DECIMAL
) RETURNS JSON AS $$
DECLARE
  api_key TEXT := 'YOUR_GOOGLE_MAPS_API_KEY';
  url TEXT;
  response JSON;
BEGIN
  -- Construct API URL
  url := format(
    'https://maps.googleapis.com/maps/api/directions/json?origin=%s,%s&destination=%s,%s&key=%s&mode=driving&units=metric',
    origin_lat, origin_lng, dest_lat, dest_lng, api_key
  );
  
  -- Make HTTP request (requires pg_net extension in Supabase)
  SELECT * FROM
    net.http_get(url::TEXT)
  INTO response;
  
  -- Parse response (simplified - implement proper parsing)
  RETURN json_build_object(
    'distance_km', (response->'routes'->0->'legs'->0->'distance'->>'value')::DECIMAL / 1000,
    'duration_minutes', (response->'routes'->0->'legs'->0->'duration'->>'value')::INT / 60,
    'route_available', (response->>'status') = 'OK',
    'polyline', response->'routes'->0->'overview_polyline'->>'points'
  );
END;
$$ LANGUAGE plpgsql;

-- PRICING MODELS TABLE
CREATE TABLE pricing_models (
  model_id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  base_rate DECIMAL(10,2) NOT NULL,
  per_km_rate DECIMAL(10,2) NOT NULL,
  per_minute_rate DECIMAL(10,2) NOT NULL,
  min_fare DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- VEHICLE TYPE MULTIPLIERS
CREATE TABLE vehicle_multipliers (
  vehicle_type VARCHAR(50) PRIMARY KEY,
  multiplier DECIMAL(10,2) NOT NULL
);

-- DYNAMIC PRICING FACTORS
CREATE TABLE pricing_factors (
  factor_id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  multiplier DECIMAL(10,2) NOT NULL,
  applies_to VARCHAR(50) NOT NULL, -- 'time' or 'area'
  time_range TSRANGE NULL, -- For time-based factors
  area GEOGRAPHY(POLYGON) NULL, -- For geographic areas
  is_active BOOLEAN DEFAULT TRUE
);

-- PRICING CALCULATION LOGS
CREATE TABLE price_calculations (
  calculation_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id INT REFERENCES bookings(booking_id),
  base_price DECIMAL(10,2) NOT NULL,
  final_price DECIMAL(10,2) NOT NULL,
  distance_km DECIMAL(10,2) NOT NULL,
  duration_minutes INT NOT NULL,
  pricing_model_id INT REFERENCES pricing_models(model_id),
  calculation_details JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE FUNCTION get_system_stats()
RETURNS TABLE (
  total_users INT,
  total_drivers INT,
  total_passengers INT,
  total_bookings INT,
  total_revenue DECIMAL,
  active_bookings INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM users) AS total_users,
    (SELECT COUNT(*) FROM users WHERE user_type = 'driver') AS total_drivers,
    (SELECT COUNT(*) FROM users WHERE user_type = 'passenger') AS total_passengers,
    (SELECT COUNT(*) FROM bookings) AS total_bookings,
    (SELECT COALESCE(SUM(total_cost), 0) FROM bookings WHERE status = 'completed') AS total_revenue,
    (SELECT COUNT(*) FROM bookings WHERE status = 'booked') AS active_bookings;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION cleanup_old_data(
  days_to_keep INT DEFAULT 90
) RETURNS JSON AS $$
DECLARE
  result JSON;
  deleted_count INT := 0;
BEGIN
  -- Cleanup old notifications
  DELETE FROM notifications
  WHERE created_at < CURRENT_TIMESTAMP - (days_to_keep || ' days')::INTERVAL;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  SELECT json_build_object(
    'status', 'success',
    'message', 'Old data cleanup completed',
    'notifications_deleted', deleted_count
  ) INTO result;
  
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  SELECT json_build_object(
    'status', 'error',
    'message', SQLERRM
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION process_referral_reward(
  referred_user_id_param INT
) RETURNS JSON AS $$
DECLARE
  referral_record RECORD;
  result JSON;
BEGIN
  -- Find pending referral for this user's email
  SELECT * INTO referral_record
  FROM referrals
  WHERE referred_email = (
    SELECT email FROM users WHERE user_id = referred_user_id_param
  )
  AND status = 'pending';
  
  IF referral_record IS NULL THEN
    SELECT json_build_object(
      'status', 'error',
      'message', 'No pending referral found for this user'
    ) INTO result;
    RETURN result;
  END IF;
  
  -- Update referral status
  UPDATE referrals
  SET status = 'joined'
  WHERE referral_id = referral_record.referral_id;
  
  -- Create reward for referrer (example: $10 credit)
  INSERT INTO driver_earnings (
    driver_id,
    amount,
    source
  ) VALUES (
    referral_record.referrer_id,
    10.00,
    'referral:' || referred_user_id_param
  );
  
  -- Update referral status to rewarded
  UPDATE referrals
  SET status = 'rewarded'
  WHERE referral_id = referral_record.referral_id;
  
  SELECT json_build_object(
    'status', 'success',
    'message', 'Referral reward processed',
    'referrer_id', referral_record.referrer_id,
    'amount', 10.00
  ) INTO result;
  
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  SELECT json_build_object(
    'status', 'error',
    'message', SQLERRM
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_referral(
  referrer_id_param INT,
  referred_email_param TEXT
) RETURNS JSON AS $$
DECLARE
  referral_id INT;
  result JSON;
BEGIN
  -- Check if email already exists in users
  IF EXISTS (SELECT 1 FROM users WHERE email = referred_email_param) THEN
    SELECT json_build_object(
      'status', 'error',
      'message', 'Email already registered'
    ) INTO result;
    RETURN result;
  END IF;
  
  -- Check if referral already exists
  IF EXISTS (
    SELECT 1 FROM referrals 
    WHERE referrer_id = referrer_id_param 
    AND referred_email = referred_email_param
  ) THEN
    SELECT json_build_object(
      'status', 'error',
      'message', 'Referral already exists'
    ) INTO result;
    RETURN result;
  END IF;
  
  -- Create referral
  INSERT INTO referrals (
    referrer_id,
    referred_email,
    status
  ) VALUES (
    referrer_id_param,
    referred_email_param,
    'pending'
  ) RETURNING referral_id INTO referral_id;
  
  SELECT json_build_object(
    'status', 'success',
    'referral_id', referral_id
  ) INTO result;
  
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  SELECT json_build_object(
    'status', 'error',
    'message', SQLERRM
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION mark_notification_seen(
  notification_id_param INT
) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE notifications
  SET seen = TRUE
  WHERE notification_id = notification_id_param;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_notification(
  user_id_param INT,
  message_param TEXT
) RETURNS INT AS $$
DECLARE
  notification_id INT;
BEGIN
  INSERT INTO notifications (
    user_id,
    message
  ) VALUES (
    user_id_param,
    message_param
  ) RETURNING notification_id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION submit_booking_review(
  booking_id_param INT,
  user_id_param INT,
  rating_param INT,
  comment_param TEXT DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
  booking_record RECORD;
  review_id INT;
  result JSON;
BEGIN
  -- Get booking details
  SELECT * INTO booking_record
  FROM bookings
  WHERE booking_id = booking_id_param;
  
  -- Validate booking
  IF booking_record IS NULL THEN
    SELECT json_build_object(
      'status', 'error',
      'message', 'Booking not found'
    ) INTO result;
    RETURN result;
  END IF;
  
  -- Validate user was part of booking
  IF booking_record.passenger_id != user_id_param AND 
     booking_record.driver_id != user_id_param THEN
    SELECT json_build_object(
      'status', 'error',
      'message', 'User not part of this booking'
    ) INTO result;
    RETURN result;
  END IF;
  
  -- Create review
  INSERT INTO reviews (
    booking_id,
    user_id,
    rating,
    comment
  ) VALUES (
    booking_id_param,
    user_id_param,
    rating_param,
    comment_param
  ) RETURNING review_id INTO review_id;
  
  -- Update driver or passenger rating
  IF EXISTS (
    SELECT 1 FROM users 
    WHERE user_id = user_id_param AND user_type = 'passenger'
  ) THEN
    -- Passenger is reviewing driver
    UPDATE driver_profiles
    SET rating = (
      SELECT AVG(rating) 
      FROM reviews r
      JOIN bookings b ON r.booking_id = b.booking_id
      WHERE b.driver_id = booking_record.driver_id
    )
    WHERE driver_id = booking_record.driver_id;
  ELSE
    -- Driver is reviewing passenger
    UPDATE passenger_profiles
    SET rating = (
      SELECT AVG(rating) 
      FROM reviews r
      JOIN bookings b ON r.booking_id = b.booking_id
      WHERE b.passenger_id = booking_record.passenger_id
    )
    WHERE passenger_id = booking_record.passenger_id;
  END IF;
  
  SELECT json_build_object(
    'status', 'success',
    'review_id', review_id
  ) INTO result;
  
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  SELECT json_build_object(
    'status', 'error',
    'message', SQLERRM
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION process_booking_payment(
  booking_id_param INT,
  payment_method_param TEXT
) RETURNS JSON AS $$
DECLARE
  booking_record RECORD;
  payment_id INT;
  result JSON;
BEGIN
  -- Get booking details
  SELECT * INTO booking_record
  FROM bookings
  WHERE booking_id = booking_id_param;
  
  -- Validate booking
  IF booking_record IS NULL THEN
    SELECT json_build_object(
      'status', 'error',
      'message', 'Booking not found'
    ) INTO result;
    RETURN result;
  END IF;
  
  -- Create payment record
  INSERT INTO payments (
    booking_id,
    amount,
    payment_method,
    status
  ) VALUES (
    booking_id_param,
    booking_record.total_cost,
    payment_method_param,
    'success'
  ) RETURNING payment_id INTO payment_id;
  
  -- Update booking status
  UPDATE bookings
  SET status = 'completed'
  WHERE booking_id = booking_id_param;
  
  -- Record driver earnings (80% of total)
  INSERT INTO driver_earnings (
    driver_id,
    amount,
    source
  ) VALUES (
    booking_record.driver_id,
    booking_record.total_cost * 0.8,
    'booking:' || booking_id_param
  );
  
  -- Make driver available again
  UPDATE driver_locations
  SET is_available = TRUE
  WHERE driver_id = booking_record.driver_id;
  
  SELECT json_build_object(
    'status', 'success',
    'payment_id', payment_id,
    'amount', booking_record.total_cost
  ) INTO result;
  
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  SELECT json_build_object(
    'status', 'error',
    'message', SQLERRM
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION calculate_ride_cost(
  origin_lat DECIMAL,
  origin_lng DECIMAL,
  dest_lat DECIMAL,
  dest_lng DECIMAL
) RETURNS DECIMAL AS $$
DECLARE
  distance_km FLOAT;
  base_rate DECIMAL := 5.00; -- $5 base rate
  per_km_rate DECIMAL := 1.50; -- $1.50 per km
  total_cost DECIMAL;
BEGIN
  -- Calculate distance using Haversine formula
  SELECT 6371 * ACOS(
    COS(RADIANS(origin_lat)) * COS(RADIANS(dest_lat)) *
    COS(RADIANS(dest_lng) - RADIANS(origin_lng)) +
    SIN(RADIANS(origin_lat)) * SIN(RADIANS(dest_lat))
  ) INTO distance_km;
  
  -- Calculate total cost
  total_cost := base_rate + (distance_km * per_km_rate);
  
  RETURN ROUND(total_cost, 2);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_booking_from_request(
  request_id_param INT,
  driver_id_param INT
) RETURNS INT AS $$
DECLARE
  new_booking_id INT;
  request_record RECORD;
BEGIN
  -- Get ride request details
  SELECT * INTO request_record
  FROM ride_requests
  WHERE request_id = request_id_param;
  
  -- Create booking
  INSERT INTO bookings (
    passenger_id,
    driver_id,
    start_time,
    end_time,
    status,
    total_cost
  ) VALUES (
    request_record.passenger_id,
    driver_id_param,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP + INTERVAL '1 hour', -- Default 1 hour booking
    'booked',
    calculate_ride_cost(
      request_record.origin_lat,
      request_record.origin_lng,
      request_record.destination_lat,
      request_record.destination_lng
    )
  ) RETURNING booking_id INTO new_booking_id;
  
  RETURN new_booking_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION match_driver_to_request(
  request_id_param INT,
  driver_id_param INT
) RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  -- Update ride request status
  UPDATE ride_requests
  SET status = 'matched'
  WHERE request_id = request_id_param;
  
  -- Create booking record
  PERFORM create_booking_from_request(request_id_param, driver_id_param);
  
  -- Update driver availability
  UPDATE driver_locations
  SET is_available = FALSE
  WHERE driver_id = driver_id_param;
  
  SELECT json_build_object(
    'status', 'success',
    'message', 'Driver matched to ride request'
  ) INTO result;
  
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  SELECT json_build_object(
    'status', 'error',
    'message', SQLERRM
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_ride_request(
  passenger_id_param INT,
  origin_lat DECIMAL,
  origin_lng DECIMAL,
  dest_lat DECIMAL,
  dest_lng DECIMAL,
  vehicle_type_param TEXT DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
  new_request_id INT;
  result JSON;
BEGIN
  INSERT INTO ride_requests (
    passenger_id,
    origin_lat,
    origin_lng,
    destination_lat,
    destination_lng,
    preferred_vehicle_type,
    status
  ) VALUES (
    passenger_id_param,
    origin_lat,
    origin_lng,
    dest_lat,
    dest_lng,
    vehicle_type_param,
    'requested'
  ) RETURNING request_id INTO new_request_id;

  SELECT json_build_object(
    'status', 'success',
    'request_id', new_request_id
  ) INTO result;
  
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  SELECT json_build_object(
    'status', 'error',
    'message', SQLERRM
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_nearby_drivers(
  lat DECIMAL,
  lng DECIMAL,
  radius_km INT DEFAULT 10,
  vehicle_type_param TEXT DEFAULT NULL
) RETURNS TABLE (
  driver_id INT,
  user_id INT,
  name TEXT,
  vehicle_type TEXT,
  vehicle_capacity FLOAT,
  rating FLOAT,
  distance_km FLOAT,
  latitude DECIMAL,
  longitude DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  WITH nearby_drivers AS (
    SELECT 
      d.driver_id,
      d.user_id,
      d.vehicle_type,
      d.vehicle_capacity,
      d.rating,
      dl.latitude,
      dl.longitude,
      6371 * ACOS(
        COS(RADIANS(lat)) * COS(RADIANS(dl.latitude)) *
        COS(RADIANS(dl.longitude) - RADIANS(lng)) +
        SIN(RADIANS(lat)) * SIN(RADIANS(dl.latitude))
      ) AS distance_km
    FROM driver_profiles d
    JOIN driver_locations dl ON d.driver_id = dl.driver_id
    JOIN users u ON d.user_id = u.user_id
    WHERE dl.is_available = TRUE
      AND (vehicle_type_param IS NULL OR d.vehicle_type = vehicle_type_param)
  )
  SELECT 
    nd.driver_id,
    nd.user_id,
    u.name,
    nd.vehicle_type,
    nd.vehicle_capacity,
    nd.rating,
    nd.distance_km,
    nd.latitude,
    nd.longitude
  FROM nearby_drivers nd
  JOIN users u ON nd.user_id = u.user_id
  WHERE nd.distance_km <= radius_km
  ORDER BY nd.distance_km;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_driver_location(
  driver_id_param INT,
  lat DECIMAL,
  lng DECIMAL,
  available BOOLEAN
) RETURNS VOID AS $$
BEGIN
  INSERT INTO driver_locations (driver_id, latitude, longitude, is_available)
  VALUES (driver_id_param, lat, lng, available)
  ON CONFLICT (driver_id)
  DO UPDATE SET
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    is_available = EXCLUDED.is_available,
    last_updated = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_user_details(user_id_param INT)
RETURNS TABLE (
  user_id INT,
  name TEXT,
  email TEXT,
  phone TEXT,
  user_type TEXT,
  created_at TIMESTAMP,
  profile_data JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.user_id,
    u.name,
    u.email,
    u.phone,
    u.user_type,
    u.created_at,
    CASE 
      WHEN u.user_type = 'driver' THEN 
        (SELECT to_jsonb(d) FROM driver_profiles d WHERE d.user_id = u.user_id)
      WHEN u.user_type = 'passenger' THEN 
        (SELECT to_jsonb(p) FROM passenger_profiles p WHERE p.user_id = u.user_id)
      ELSE NULL
    END AS profile_data
  FROM users u
  WHERE u.user_id = user_id_param;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_user_with_profile(
  name TEXT,
  email TEXT,
  phone TEXT,
  password_hash TEXT,
  user_type TEXT
) RETURNS JSON AS $$
BEGIN
  DECLARE
    new_user_id INT;
    result JSON;
  BEGIN
    INSERT INTO users (name, email, phone, password_hash, user_type)
    VALUES (name, email, phone, password_hash, user_type)
    RETURNING user_id INTO new_user_id;

    IF user_type = 'driver' THEN
      INSERT INTO driver_profiles (user_id, license_number, license_expiry)
      VALUES (new_user_id, 'TEMP_LICENSE', CURRENT_DATE + INTERVAL '1 year');
    ELSIF user_type = 'passenger' THEN
      INSERT INTO passenger_profiles (user_id) VALUES (new_user_id);
    END IF;

    SELECT json_build_object(
      'status', 'success',
      'user_id', new_user_id,
      'user_type', user_type
    ) INTO result;
    
    RETURN result;
  EXCEPTION WHEN OTHERS THEN
    SELECT json_build_object(
      'status', 'error',
      'message', SQLERRM
    ) INTO result;
    RETURN result;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
