# Dr. Mimu Database Setup Guide

This guide will help you set up PostgreSQL database with Prisma ORM for the Dr. Mimu medical chatbot application.

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn package manager

## Database Schema Overview

The Dr. Mimu application uses a comprehensive database schema that includes:

### Core Entities
- **Users**: Patient profiles and authentication
- **Doctors**: Healthcare provider information
- **Medical Records**: Patient medical history and diagnoses
- **Prescriptions**: Medicine prescriptions and dosage information
- **Medicines**: Medicine database with details and availability
- **Appointments**: Doctor-patient appointment scheduling
- **Reports**: Medical reports and test results
- **Chat Sessions**: AI conversation history

### Supporting Entities
- **Hospitals**: Healthcare facility directory
- **Emergency Contacts**: Emergency service information
- **Vaccination Schedules**: Immunization schedules
- **Health Tips**: Health education content

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

This will install all required dependencies including:
- `@prisma/client`: Prisma client for database operations
- `prisma`: Prisma CLI and development tools
- `pg`: PostgreSQL client for Node.js
- `@types/pg`: TypeScript types for PostgreSQL

### 2. PostgreSQL Database Setup

#### Option A: Local PostgreSQL Installation

1. Install PostgreSQL on your system:
   - **Windows**: Download from [postgresql.org](https://www.postgresql.org/download/windows/)
   - **macOS**: Use Homebrew: `brew install postgresql`
   - **Linux**: Use package manager: `sudo apt-get install postgresql`

2. Create a database:
   ```sql
   CREATE DATABASE dr_mimu_db;
   CREATE USER dr_mimu_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE dr_mimu_db TO dr_mimu_user;
   ```

#### Option B: Cloud PostgreSQL (Recommended for Production)

- **Supabase**: Free tier available at [supabase.com](https://supabase.com)
- **Railway**: Easy deployment at [railway.app](https://railway.app)
- **Neon**: Serverless PostgreSQL at [neon.tech](https://neon.tech)
- **AWS RDS**: Enterprise solution

### 3. Environment Configuration

1. Copy the `.env` file and update the database URL:
   ```bash
   cp .env.example .env
   ```

2. Update the `DATABASE_URL` in `.env`:
   ```env
   # Local PostgreSQL
   DATABASE_URL="postgresql://dr_mimu_user:your_password@localhost:5432/dr_mimu_db"
   
   # Or cloud database URL (example for Supabase)
   DATABASE_URL="postgresql://postgres:your_password@db.your_project.supabase.co:5432/postgres"
   ```

### 4. Database Initialization

Run the complete database setup:

```bash
npm run db:init
```

This command will:
1. Generate Prisma client
2. Push schema to database
3. Seed initial data

#### Manual Setup (Alternative)

If you prefer to run steps manually:

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed initial data
npm run db:seed
```

### 5. Verify Setup

1. Check database connection:
   ```bash
   npm run db:studio
   ```
   This opens Prisma Studio at `http://localhost:5555`

2. Verify tables and data in Prisma Studio

## Available Database Commands

| Command | Description |
|---------|-------------|
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema changes to database |
| `npm run db:migrate` | Create and apply migrations |
| `npm run db:migrate:deploy` | Deploy migrations (production) |
| `npm run db:seed` | Seed database with initial data |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:reset` | Reset database and apply migrations |
| `npm run db:init` | Complete database initialization |

## Database Services Usage

The application provides comprehensive database services for CRUD operations:

### User Service
```typescript
import { userService } from './lib/services';

// Create user
const user = await userService.createUser({
  email: 'patient@example.com',
  name: 'John Doe',
  phone: '+1234567890'
});

// Get user with relations
const userWithData = await userService.getUserById(user.id, true);
```

### Medical Record Service
```typescript
import { medicalRecordService } from './lib/services';

// Create medical record
const record = await medicalRecordService.createMedicalRecord({
  userId: user.id,
  title: 'Regular Checkup',
  description: 'Annual health checkup',
  symptoms: ['fatigue', 'headache']
});
```

### Prescription Service
```typescript
import { prescriptionService } from './lib/services';

// Create prescription with medicines
const prescription = await prescriptionService.createPrescription({
  userId: user.id,
  doctorId: doctor.id,
  title: 'Cold Treatment',
  medicines: [
    {
      medicineId: medicine.id,
      dosage: '1 tablet',
      frequency: 'twice daily',
      duration: '7 days'
    }
  ]
});
```

### Appointment Service
```typescript
import { appointmentService } from './lib/services';

// Create appointment
const appointment = await appointmentService.createAppointment({
  userId: user.id,
  doctorId: doctor.id,
  appointmentDate: new Date('2024-01-15T10:00:00'),
  duration: 30,
  type: 'CONSULTATION'
});
```

## Database Schema Details

### Key Relationships

- **User** → **MedicalRecords** (One-to-Many)
- **User** → **Prescriptions** (One-to-Many)
- **User** → **Appointments** (One-to-Many)
- **Doctor** → **Appointments** (One-to-Many)
- **Prescription** → **PrescriptionMedicines** → **Medicine** (Many-to-Many)
- **User** → **ChatSessions** → **ChatMessages** (One-to-Many-to-Many)

### Enums

- **AppointmentStatus**: SCHEDULED, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW
- **AppointmentType**: CONSULTATION, FOLLOW_UP, EMERGENCY, CHECKUP, VACCINATION
- **ReportType**: BLOOD_TEST, URINE_TEST, X_RAY, MRI, CT_SCAN, ECG, ULTRASOUND, etc.
- **MessageSender**: USER, BOT, DOCTOR

## Production Deployment

### 1. Environment Variables

Set these environment variables in production:

```env
DATABASE_URL="your_production_database_url"
NODE_ENV="production"
JWT_SECRET="your_secure_jwt_secret"
```

### 2. Database Migration

```bash
# Deploy migrations
npm run db:migrate:deploy

# Generate client
npm run db:generate
```

### 3. Security Considerations

- Use connection pooling for high traffic
- Enable SSL for database connections
- Implement proper backup strategies
- Monitor database performance
- Use read replicas for scaling

## Troubleshooting

### Common Issues

1. **Connection Error**
   ```
   Error: P1001: Can't reach database server
   ```
   - Check DATABASE_URL format
   - Verify PostgreSQL is running
   - Check firewall settings

2. **Migration Error**
   ```
   Error: P3009: migrate found failed migration
   ```
   - Reset database: `npm run db:reset`
   - Or manually fix migration

3. **Schema Sync Error**
   ```
   Error: P1012: Schema drift detected
   ```
   - Run: `npm run db:push --accept-data-loss`
   - Or create proper migration

### Performance Optimization

1. **Indexing**: Key fields are automatically indexed
2. **Connection Pooling**: Configure in production
3. **Query Optimization**: Use `select` to limit fields
4. **Pagination**: Implemented in all list services

## Support

For database-related issues:

1. Check the [Prisma Documentation](https://www.prisma.io/docs/)
2. Review PostgreSQL logs
3. Use Prisma Studio for data inspection
4. Check application logs for detailed error messages

## Data Privacy and Security

- All sensitive medical data is properly structured
- User data includes privacy controls
- Audit trails for data modifications
- Compliance with healthcare data regulations

The database is designed to handle sensitive medical information securely while providing efficient access patterns for the Dr. Mimu application.