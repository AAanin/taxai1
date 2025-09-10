-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE appointment_status AS ENUM (
  'SCHEDULED',
  'CONFIRMED', 
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW'
);

CREATE TYPE appointment_type AS ENUM (
  'CONSULTATION',
  'FOLLOW_UP',
  'EMERGENCY', 
  'CHECKUP',
  'VACCINATION'
);

CREATE TYPE report_type AS ENUM (
  'BLOOD_TEST',
  'URINE_TEST',
  'X_RAY',
  'MRI',
  'CT_SCAN',
  'ECG',
  'ULTRASOUND',
  'PRESCRIPTION',
  'MEDICAL_CERTIFICATE',
  'OTHER'
);

CREATE TYPE message_sender AS ENUM (
  'USER',
  'BOT',
  'DOCTOR'
);

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  phone VARCHAR(20),
  avatar TEXT,
  date_of_birth DATE,
  gender VARCHAR(10),
  address TEXT,
  emergency_contact VARCHAR(255),
  blood_group VARCHAR(10),
  allergies TEXT,
  chronic_conditions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Doctors table
CREATE TABLE doctors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  specialization VARCHAR(255) NOT NULL,
  qualification VARCHAR(255),
  experience INTEGER,
  hospital VARCHAR(255),
  address TEXT,
  consultation_fee DECIMAL(10,2),
  rating DECIMAL(3,2) DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medical Records table
CREATE TABLE medical_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  diagnosis TEXT,
  symptoms TEXT,
  treatment TEXT,
  notes TEXT,
  record_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medicines table
CREATE TABLE medicines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  generic_name VARCHAR(255),
  brand VARCHAR(255),
  category VARCHAR(100),
  dosage_form VARCHAR(50),
  strength VARCHAR(50),
  manufacturer VARCHAR(255),
  price DECIMAL(10,2),
  description TEXT,
  side_effects TEXT,
  contraindications TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prescriptions table
CREATE TABLE prescriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES doctors(id),
  title VARCHAR(255) NOT NULL,
  instructions TEXT,
  diagnosis TEXT,
  prescription_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prescription Medicines junction table
CREATE TABLE prescription_medicines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prescription_id UUID NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
  medicine_id UUID NOT NULL REFERENCES medicines(id),
  dosage VARCHAR(100) NOT NULL,
  frequency VARCHAR(100) NOT NULL,
  duration VARCHAR(100) NOT NULL,
  instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(prescription_id, medicine_id)
);

-- Medicine Reminders table
CREATE TABLE medicine_reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  medicine_id UUID NOT NULL REFERENCES medicines(id),
  medicine_name VARCHAR(255) NOT NULL,
  dosage VARCHAR(100) NOT NULL,
  frequency VARCHAR(100) NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  reminder_times TEXT,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Appointments table
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES doctors(id),
  title VARCHAR(255),
  description TEXT,
  appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER,
  status appointment_status DEFAULT 'SCHEDULED',
  type appointment_type DEFAULT 'CONSULTATION',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reports table
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  type report_type NOT NULL,
  description TEXT,
  file_url TEXT,
  file_name VARCHAR(255),
  file_size INTEGER,
  report_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  lab_name VARCHAR(255),
  doctor_name VARCHAR(255),
  results JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat Sessions table
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255),
  language VARCHAR(10) DEFAULT 'bn',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat Messages table
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  sender message_sender NOT NULL,
  language VARCHAR(10) DEFAULT 'bn',
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hospitals table
CREATE TABLE hospitals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  website VARCHAR(255),
  type VARCHAR(50),
  services TEXT,
  emergency_services BOOLEAN DEFAULT false,
  rating DECIMAL(3,2) DEFAULT 0,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Emergency Contacts table
CREATE TABLE emergency_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  type VARCHAR(50) NOT NULL,
  address TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vaccination Schedules table
CREATE TABLE vaccination_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vaccine_name VARCHAR(255) NOT NULL,
  age_group VARCHAR(100) NOT NULL,
  description TEXT,
  schedule VARCHAR(255) NOT NULL,
  is_required BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Health Tips table
CREATE TABLE health_tips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  language VARCHAR(10) DEFAULT 'bn',
  tags TEXT,
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_medical_records_user_id ON medical_records(user_id);
CREATE INDEX idx_prescriptions_user_id ON prescriptions(user_id);
CREATE INDEX idx_appointments_user_id ON appointments(user_id);
CREATE INDEX idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX idx_reports_user_id ON reports(user_id);
CREATE INDEX idx_medicine_reminders_user_id ON medicine_reminders(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicine_reminders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see and modify their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid()::text = id::text);

-- Medical records policies
CREATE POLICY "Users can view own medical records" ON medical_records
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own medical records" ON medical_records
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own medical records" ON medical_records
  FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own medical records" ON medical_records
  FOR DELETE USING (auth.uid()::text = user_id::text);

-- Similar policies for other user-specific tables
CREATE POLICY "Users can manage own prescriptions" ON prescriptions
  FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can manage own appointments" ON appointments
  FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can manage own reports" ON reports
  FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can manage own chat sessions" ON chat_sessions
  FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can manage own medicine reminders" ON medicine_reminders
  FOR ALL USING (auth.uid()::text = user_id::text);

-- Chat messages policy (users can only access messages from their sessions)
CREATE POLICY "Users can manage own chat messages" ON chat_messages
  FOR ALL USING (
    session_id IN (
      SELECT id FROM chat_sessions WHERE user_id::text = auth.uid()::text
    )
  );

-- Public read access for reference tables
CREATE POLICY "Public read access for doctors" ON doctors
  FOR SELECT USING (true);

CREATE POLICY "Public read access for medicines" ON medicines
  FOR SELECT USING (true);

CREATE POLICY "Public read access for hospitals" ON hospitals
  FOR SELECT USING (true);

CREATE POLICY "Public read access for emergency contacts" ON emergency_contacts
  FOR SELECT USING (true);

CREATE POLICY "Public read access for vaccination schedules" ON vaccination_schedules
  FOR SELECT USING (true);

CREATE POLICY "Public read access for health tips" ON health_tips
  FOR SELECT USING (true);

-- Grant permissions to authenticated users
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant read permissions to anonymous users for public tables
GRANT SELECT ON doctors, medicines, hospitals, emergency_contacts, vaccination_schedules, health_tips TO anon;
GRANT USAGE ON SCHEMA public TO anon;