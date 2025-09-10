# Dr. Mimu - Medical Assistant Chatbot

🏥 **Dr. Mimu** হলো বাংলাদেশের জন্য একটি আধুনিক AI-চালিত মেডিকেল সহায়ক চ্যাটবট অ্যাপ্লিকেশন। এটি ব্যবহারকারীদের স্বাস্থ্য সেবা পরিচালনা, অ্যাপয়েন্টমেন্ট বুকিং, প্রেসক্রিপশন ম্যানেজমেন্ট এবং মেডিকেল রেকর্ড সংরক্ষণে সহায়তা করে।

## 🌟 বৈশিষ্ট্যসমূহ

### 🔐 ব্যবহারকারী ব্যবস্থাপনা
- নিরাপদ রেজিস্ট্রেশন এবং লগইন সিস্টেম
- প্রোফাইল ম্যানেজমেন্ট
- পাসওয়ার্ড রিসেট ফিচার
- ব্যবহারকারীর ব্যক্তিগত তথ্য সুরক্ষা

### 📋 মেডিকেল রেকর্ড ম্যানেজমেন্ট
- বিভিন্ন ধরনের মেডিকেল রেকর্ড সংরক্ষণ
- ফাইল আপলোড এবং ডাউনলোড
- রেকর্ড অনুসন্ধান এবং ফিল্টারিং
- ডাক্তার এবং হাসপাতালের তথ্য সংরক্ষণ

### 📅 অ্যাপয়েন্টমেন্ট বুকিং
- ডাক্তারের সাথে অ্যাপয়েন্টমেন্ট বুক করা
- অ্যাপয়েন্টমেন্ট স্ট্যাটাস ট্র্যাকিং
- রিমাইন্ডার নোটিফিকেশন
- অ্যাপয়েন্টমেন্ট রিশিডিউল এবং বাতিল

### 💊 প্রেসক্রিপশন ম্যানেজমেন্ট
- ডিজিটাল প্রেসক্রিপশন সংরক্ষণ
- ওষুধের তালিকা এবং ডোজ ট্র্যাকিং
- ওষুধ সেবনের রিমাইন্ডার
- প্রেসক্রিপশন ডাউনলোড এবং শেয়ার

### 🔔 রিয়েল-টাইম নোটিফিকেশন
- তাৎক্ষণিক নোটিফিকেশন সিস্টেম
- কাস্টমাইজেবল নোটিফিকেশন সেটিংস
- অ্যাপয়েন্টমেন্ট এবং ওষুধের রিমাইন্ডার
- সিস্টেম আপডেট নোটিফিকেশন

### 🤖 AI চ্যাটবট
- বাংলা ভাষায় স্বাস্থ্য পরামর্শ
- লক্ষণ বিশ্লেষণ এবং প্রাথমিক পরামর্শ
- ওষুধ এবং চিকিৎসা সম্পর্কে তথ্য
- জরুরি অবস্থায় গাইডেন্স

## 🛠️ প্রযুক্তিগত স্ট্যাক

### Frontend
- **React 18** - ইউজার ইন্টারফেস
- **TypeScript** - টাইপ সেফটি
- **Vite** - বিল্ড টুল
- **Tailwind CSS** - স্টাইলিং
- **React Router** - রাউটিং
- **Zustand** - স্টেট ম্যানেজমেন্ট
- **React Hook Form** - ফর্ম ম্যানেজমেন্ট
- **Zod** - ভ্যালিডেশন
- **Sonner** - টোস্ট নোটিফিকেশন
- **Lucide React** - আইকন

### Backend
- **Node.js** - রানটাইম এনভায়রনমেন্ট
- **Express.js** - ওয়েব ফ্রেমওয়ার্ক
- **TypeScript** - টাইপ সেফটি
- **Supabase** - ডাটাবেস এবং অথেন্টিকেশন
- **PostgreSQL** - ডাটাবেস
- **Prisma** - ORM (অপশনাল)

### Security & Performance
- **Helmet** - সিকিউরিটি হেডার
- **CORS** - ক্রস-অরিজিন রিসোর্স শেয়ারিং
- **Rate Limiting** - API রেট লিমিটিং
- **Compression** - রেসপন্স কম্প্রেশন
- **Morgan** - HTTP রিকোয়েস্ট লগিং

## 🚀 ইনস্টলেশন এবং সেটআপ

### প্রয়োজনীয়তা
- Node.js (v18 বা তার পরের ভার্সন)
- npm বা pnpm
- Supabase অ্যাকাউন্ট

### 1. প্রোজেক্ট ক্লোন করুন
```bash
git clone https://github.com/your-username/dr-mimu-medical-chatbot.git
cd dr-mimu-medical-chatbot
```

### 2. ডিপেন্ডেন্সি ইনস্টল করুন
```bash
npm install
# অথবা
pnpm install
```

### 3. এনভায়রনমেন্ট ভেরিয়েবল সেটআপ
`.env` ফাইল তৈরি করুন এবং নিম্নলিখিত ভেরিয়েবল যোগ করুন:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# API Configuration
PORT=3001
NODE_ENV=development

# AI Configuration (Optional)
OPENAI_API_KEY=your_openai_api_key
GOOGLE_API_KEY=your_google_api_key
```

### 4. Supabase ডাটাবেস সেটআপ

#### টেবিল তৈরি করুন:

```sql
-- Users table (Supabase Auth এর সাথে সিঙ্ক)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  date_of_birth DATE,
  gender VARCHAR(10),
  address TEXT,
  emergency_contact VARCHAR(20),
  blood_group VARCHAR(5),
  allergies TEXT,
  medical_conditions TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medical Records table
CREATE TABLE medical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  record_type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  file_url TEXT,
  doctor_name VARCHAR(100),
  hospital_name VARCHAR(100),
  date_recorded DATE NOT NULL,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Appointments table
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  doctor_name VARCHAR(100) NOT NULL,
  doctor_specialty VARCHAR(100),
  hospital_name VARCHAR(100),
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  appointment_type VARCHAR(50),
  status VARCHAR(20) DEFAULT 'scheduled',
  symptoms TEXT,
  notes TEXT,
  reminder_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prescriptions table
CREATE TABLE prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  doctor_name VARCHAR(100) NOT NULL,
  doctor_specialty VARCHAR(100),
  hospital_name VARCHAR(100),
  prescription_date DATE NOT NULL,
  diagnosis VARCHAR(200),
  notes TEXT,
  medicines JSONB NOT NULL,
  follow_up_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notification Settings table
CREATE TABLE notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  email_notifications BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT TRUE,
  appointment_reminders BOOLEAN DEFAULT TRUE,
  prescription_reminders BOOLEAN DEFAULT TRUE,
  medical_record_updates BOOLEAN DEFAULT TRUE,
  system_notifications BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Row Level Security (RLS) সেটআপ:

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Medical records policies
CREATE POLICY "Users can view own medical records" ON medical_records
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own medical records" ON medical_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own medical records" ON medical_records
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own medical records" ON medical_records
  FOR DELETE USING (auth.uid() = user_id);

-- Similar policies for other tables...
```

#### পারমিশন গ্রান্ট করুন:

```sql
-- Grant permissions to authenticated users
GRANT ALL ON users TO authenticated;
GRANT ALL ON medical_records TO authenticated;
GRANT ALL ON appointments TO authenticated;
GRANT ALL ON prescriptions TO authenticated;
GRANT ALL ON notifications TO authenticated;
GRANT ALL ON notification_settings TO authenticated;

-- Grant read permissions to anonymous users (for public data)
GRANT SELECT ON users TO anon;
```

### 5. অ্যাপ্লিকেশন চালু করুন

#### ডেভেলপমেন্ট মোড:
```bash
# Frontend server (port 5173)
npm run dev

# Backend API server (port 3001) - নতুন টার্মিনালে
npm run api:dev
```

#### প্রোডাকশন বিল্ড:
```bash
# Frontend বিল্ড
npm run build

# Backend বিল্ড
npm run api:build

# প্রোডাকশন সার্ভার চালু
npm run api:start
```

## 📁 প্রোজেক্ট স্ট্রাকচার

```
dr-mimu-medical-chatbot/
├── api/                          # Backend API
│   ├── auth.ts                   # Authentication routes
│   ├── users.ts                  # User management routes
│   ├── medical-records.ts        # Medical records routes
│   ├── appointments.ts           # Appointments routes
│   ├── prescriptions.ts          # Prescriptions routes
│   ├── index.ts                  # API routes index
│   └── server.ts                 # Express server setup
├── src/                          # Frontend source
│   ├── components/               # React components
│   │   ├── auth/                 # Authentication components
│   │   ├── appointments/         # Appointment components
│   │   ├── prescriptions/        # Prescription components
│   │   ├── notifications/        # Notification components
│   │   └── ui/                   # UI components
│   ├── contexts/                 # React contexts
│   │   ├── AuthContext.tsx       # Authentication context
│   │   └── NotificationContext.tsx # Notification context
│   ├── hooks/                    # Custom hooks
│   │   └── useNotifications.ts   # Notifications hook
│   ├── lib/                      # Libraries and utilities
│   │   └── supabase.ts           # Supabase client
│   ├── pages/                    # Page components
│   │   ├── auth/                 # Auth pages
│   │   ├── DashboardPage.tsx     # Dashboard
│   │   ├── AppointmentsPage.tsx  # Appointments page
│   │   └── PrescriptionsPage.tsx # Prescriptions page
│   ├── utils/                    # Utility functions
│   │   ├── validation.ts         # Validation schemas
│   │   └── errorHandling.ts      # Error handling utilities
│   └── App.tsx                   # Main app component
├── supabase/                     # Supabase configuration
│   └── migrations/               # Database migrations
├── .env                          # Environment variables
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
├── vite.config.ts                # Vite configuration
├── tailwind.config.js            # Tailwind CSS configuration
└── README.md                     # Project documentation
```

## 🔧 API এন্ডপয়েন্টস

### Authentication
- `POST /api/auth/register` - নতুন ব্যবহারকারী রেজিস্ট্রেশন
- `POST /api/auth/login` - ব্যবহারকারী লগইন
- `POST /api/auth/logout` - ব্যবহারকারী লগআউট
- `GET /api/auth/profile` - ব্যবহারকারীর প্রোফাইল
- `PUT /api/auth/profile` - প্রোফাইল আপডেট

### Medical Records
- `GET /api/medical-records/user/:userId` - ব্যবহারকারীর মেডিকেল রেকর্ড
- `POST /api/medical-records` - নতুন রেকর্ড তৈরি
- `PUT /api/medical-records/:id` - রেকর্ড আপডেট
- `DELETE /api/medical-records/:id` - রেকর্ড মুছে ফেলা

### Appointments
- `GET /api/appointments/user/:userId` - ব্যবহারকারীর অ্যাপয়েন্টমেন্ট
- `POST /api/appointments` - নতুন অ্যাপয়েন্টমেন্ট বুক
- `PUT /api/appointments/:id` - অ্যাপয়েন্টমেন্ট আপডেট
- `DELETE /api/appointments/:id` - অ্যাপয়েন্টমেন্ট বাতিল

### Prescriptions
- `GET /api/prescriptions/user/:userId` - ব্যবহারকারীর প্রেসক্রিপশন
- `POST /api/prescriptions` - নতুন প্রেসক্রিপশন যোগ
- `PUT /api/prescriptions/:id` - প্রেসক্রিপশন আপডেট
- `DELETE /api/prescriptions/:id` - প্রেসক্রিপশন মুছে ফেলা

## 🧪 টেস্টিং

```bash
# Unit tests চালান
npm run test

# Integration tests চালান
npm run test:integration

# E2E tests চালান
npm run test:e2e

# Test coverage দেখুন
npm run test:coverage
```

## 🚀 ডিপ্লয়মেন্ট

### Vercel এ ডিপ্লয়

1. Vercel অ্যাকাউন্ট তৈরি করুন
2. GitHub রিপোজিটরি কানেক্ট করুন
3. Environment variables সেট করুন
4. Deploy বাটনে ক্লিক করুন

### Docker ব্যবহার করে

```bash
# Docker image বিল্ড করুন
docker build -t dr-mimu .

# Container চালু করুন
docker run -p 3000:3000 dr-mimu
```

## 🔒 সিকিউরিটি

- **Authentication**: Supabase Auth ব্যবহার করে নিরাপদ অথেন্টিকেশন
- **Authorization**: Row Level Security (RLS) দিয়ে ডেটা সুরক্ষা
- **Data Validation**: Zod স্কিমা দিয়ে ইনপুট ভ্যালিডেশন
- **Rate Limiting**: API abuse প্রতিরোধে রেট লিমিটিং
- **CORS**: নিয়ন্ত্রিত ক্রস-অরিজিন অ্যাক্সেস
- **Helmet**: HTTP সিকিউরিটি হেডার

## 🤝 কন্ট্রিবিউশন

1. প্রোজেক্ট ফর্ক করুন
2. নতুন ফিচার ব্রাঞ্চ তৈরি করুন (`git checkout -b feature/amazing-feature`)
3. পরিবর্তন কমিট করুন (`git commit -m 'Add some amazing feature'`)
4. ব্রাঞ্চে পুশ করুন (`git push origin feature/amazing-feature`)
5. Pull Request তৈরি করুন

## 📝 লাইসেন্স

এই প্রোজেক্ট MIT লাইসেন্সের অধীনে লাইসেন্সপ্রাপ্ত। বিস্তারিত জানতে [LICENSE](LICENSE) ফাইল দেখুন।

## 📞 সাপোর্ট

কোনো সমস্যা বা প্রশ্ন থাকলে:

- 📧 Email: support@drmimu.com
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/dr-mimu-medical-chatbot/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/your-username/dr-mimu-medical-chatbot/discussions)

## 🙏 কৃতজ্ঞতা

- [Supabase](https://supabase.com/) - Backend as a Service
- [React](https://reactjs.org/) - Frontend Framework
- [Tailwind CSS](https://tailwindcss.com/) - CSS Framework
- [Lucide](https://lucide.dev/) - Icons
- [Vite](https://vitejs.dev/) - Build Tool

---

**Dr. Mimu** দিয়ে আপনার স্বাস্থ্য সেবা পরিচালনা করুন সহজে এবং নিরাপদে! 🏥💙