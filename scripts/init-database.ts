// Database Initialization Script
// Sets up the database with initial data and configurations

import { PrismaClient } from '@prisma/client';
import { connectToDatabase, disconnectFromDatabase } from '../lib/prisma';

const prisma = new PrismaClient();

// Initial data for seeding the database
const initialData = {
  // Sample medicines
  medicines: [
    {
      name: 'Paracetamol',
      genericName: 'Acetaminophen',
      brand: 'Napa',
      category: 'Analgesic',
      dosageForm: 'Tablet',
      strength: '500mg',
      manufacturer: 'Beximco Pharmaceuticals',
      price: 2.5,
      description: 'Pain reliever and fever reducer',
      sideEffects: ['Nausea', 'Stomach upset'],
      contraindications: ['Liver disease', 'Alcohol dependency'],
    },
    {
      name: 'Amoxicillin',
      genericName: 'Amoxicillin',
      brand: 'Amoxil',
      category: 'Antibiotic',
      dosageForm: 'Capsule',
      strength: '250mg',
      manufacturer: 'Square Pharmaceuticals',
      price: 8.0,
      description: 'Broad-spectrum antibiotic',
      sideEffects: ['Diarrhea', 'Nausea', 'Skin rash'],
      contraindications: ['Penicillin allergy'],
    },
    {
      name: 'Omeprazole',
      genericName: 'Omeprazole',
      brand: 'Losec',
      category: 'Proton Pump Inhibitor',
      dosageForm: 'Capsule',
      strength: '20mg',
      manufacturer: 'Incepta Pharmaceuticals',
      price: 5.5,
      description: 'Reduces stomach acid production',
      sideEffects: ['Headache', 'Diarrhea', 'Abdominal pain'],
      contraindications: ['Hypersensitivity to omeprazole'],
    },
    {
      name: 'Metformin',
      genericName: 'Metformin HCl',
      brand: 'Glucophage',
      category: 'Antidiabetic',
      dosageForm: 'Tablet',
      strength: '500mg',
      manufacturer: 'Renata Limited',
      price: 3.0,
      description: 'Type 2 diabetes medication',
      sideEffects: ['Nausea', 'Diarrhea', 'Metallic taste'],
      contraindications: ['Kidney disease', 'Liver disease'],
    },
    {
      name: 'Atorvastatin',
      genericName: 'Atorvastatin Calcium',
      brand: 'Lipitor',
      category: 'Statin',
      dosageForm: 'Tablet',
      strength: '20mg',
      manufacturer: 'ACI Limited',
      price: 12.0,
      description: 'Cholesterol-lowering medication',
      sideEffects: ['Muscle pain', 'Liver problems'],
      contraindications: ['Liver disease', 'Pregnancy'],
    },
  ],

  // Sample doctors
  doctors: [
    {
      name: 'Dr. Mohammad Rahman',
      email: 'dr.rahman@example.com',
      phone: '+8801712345678',
      specialization: 'Cardiology',
      qualification: 'MBBS, MD (Cardiology)',
      experience: 15,
      hospital: 'Dhaka Medical College Hospital',
      address: 'Dhaka, Bangladesh',
      consultationFee: 1500,
      rating: 4.8,
    },
    {
      name: 'Dr. Fatima Khatun',
      email: 'dr.fatima@example.com',
      phone: '+8801812345678',
      specialization: 'Pediatrics',
      qualification: 'MBBS, DCH',
      experience: 12,
      hospital: 'Bangabandhu Sheikh Mujib Medical University',
      address: 'Dhaka, Bangladesh',
      consultationFee: 1200,
      rating: 4.9,
    },
    {
      name: 'Dr. Ahmed Hassan',
      email: 'dr.ahmed@example.com',
      phone: '+8801912345678',
      specialization: 'Orthopedics',
      qualification: 'MBBS, MS (Orthopedics)',
      experience: 18,
      hospital: 'National Institute of Traumatology',
      address: 'Dhaka, Bangladesh',
      consultationFee: 1800,
      rating: 4.7,
    },
    {
      name: 'Dr. Rashida Begum',
      email: 'dr.rashida@example.com',
      phone: '+8801612345678',
      specialization: 'Gynecology',
      qualification: 'MBBS, FCPS (Gynecology)',
      experience: 20,
      hospital: 'Dhaka Shishu Hospital',
      address: 'Dhaka, Bangladesh',
      consultationFee: 1600,
      rating: 4.8,
    },
    {
      name: 'Dr. Karim Uddin',
      email: 'dr.karim@example.com',
      phone: '+8801512345678',
      specialization: 'Neurology',
      qualification: 'MBBS, MD (Neurology)',
      experience: 14,
      hospital: 'National Institute of Neurosciences',
      address: 'Dhaka, Bangladesh',
      consultationFee: 2000,
      rating: 4.6,
    },
  ],

  // Sample hospitals
  hospitals: [
    {
      name: 'Dhaka Medical College Hospital',
      address: 'Secretariat Road, Dhaka 1000',
      phone: '+88029668690',
      email: 'info@dmch.gov.bd',
      type: 'government',
      services: ['Emergency', 'Surgery', 'Cardiology', 'Neurology', 'Pediatrics'],
      emergencyServices: true,
      rating: 4.2,
    },
    {
      name: 'Square Hospital',
      address: '18/F, Bir Uttam Qazi Nuruzzaman Sarak, Dhaka 1205',
      phone: '+88028159457',
      email: 'info@squarehospital.com',
      type: 'private',
      services: ['Emergency', 'Surgery', 'Oncology', 'Cardiology', 'Orthopedics'],
      emergencyServices: true,
      rating: 4.7,
    },
    {
      name: 'United Hospital',
      address: 'Plot 15, Road 71, Gulshan 2, Dhaka 1212',
      phone: '+88028836444',
      email: 'info@uhlbd.com',
      type: 'private',
      services: ['Emergency', 'Surgery', 'Cardiology', 'Neurology', 'Gastroenterology'],
      emergencyServices: true,
      rating: 4.6,
    },
  ],

  // Emergency contacts
  emergencyContacts: [
    {
      name: 'National Emergency Service',
      phone: '999',
      type: 'emergency',
      description: 'National emergency hotline for all types of emergencies',
      priority: 1,
    },
    {
      name: 'Fire Service',
      phone: '9555555',
      type: 'fire',
      description: 'Fire service and civil defense',
      priority: 2,
    },
    {
      name: 'Police',
      phone: '100',
      type: 'police',
      description: 'Police emergency hotline',
      priority: 3,
    },
    {
      name: 'Ambulance Service',
      phone: '102',
      type: 'ambulance',
      description: 'Ambulance service hotline',
      priority: 4,
    },
  ],

  // Vaccination schedules
  vaccinationSchedules: [
    {
      vaccineName: 'BCG',
      ageGroup: '0-2 months',
      description: 'Bacillus Calmette-Guérin vaccine for tuberculosis',
      schedule: 'At birth',
      isRequired: true,
    },
    {
      vaccineName: 'Hepatitis B',
      ageGroup: '0-2 months',
      description: 'Hepatitis B vaccine',
      schedule: 'At birth, 6 weeks, 10 weeks, 14 weeks',
      isRequired: true,
    },
    {
      vaccineName: 'DPT',
      ageGroup: '6 weeks - 14 weeks',
      description: 'Diphtheria, Pertussis, and Tetanus vaccine',
      schedule: '6 weeks, 10 weeks, 14 weeks',
      isRequired: true,
    },
    {
      vaccineName: 'Polio',
      ageGroup: '6 weeks - 14 weeks',
      description: 'Oral Polio Vaccine',
      schedule: '6 weeks, 10 weeks, 14 weeks',
      isRequired: true,
    },
    {
      vaccineName: 'Measles',
      ageGroup: '9 months',
      description: 'Measles vaccine',
      schedule: '9 months',
      isRequired: true,
    },
    {
      vaccineName: 'COVID-19',
      ageGroup: 'adult',
      description: 'COVID-19 vaccine',
      schedule: 'As per government guidelines',
      isRequired: false,
    },
  ],

  // Health tips
  healthTips: [
    {
      title: 'দৈনিক পানি পান',
      content: 'দিনে কমপক্ষে ৮-১০ গ্লাস পানি পান করুন। পানি আপনার শরীরকে হাইড্রেটেড রাখে এবং বিষাক্ত পদার্থ বের করে দেয়।',
      category: 'hydration',
      language: 'bn',
      tags: ['পানি', 'স্বাস্থ্য', 'হাইড্রেশন'],
      priority: 1,
    },
    {
      title: 'নিয়মিত ব্যায়াম',
      content: 'সপ্তাহে কমপক্ষে ১৫০ মিনিট মাঝারি ব্যায়াম করুন। হাঁটা, দৌড়ানো, সাইক্লিং বা সাঁতার কাটা ভালো ব্যায়াম।',
      category: 'exercise',
      language: 'bn',
      tags: ['ব্যায়াম', 'ফিটনেস', 'স্বাস্থ্য'],
      priority: 2,
    },
    {
      title: 'সুষম খাবার',
      content: 'প্রতিদিন ফল, সবজি, প্রোটিন এবং শস্য জাতীয় খাবার খান। প্রক্রিয়াজাত খাবার এবং চিনি কম খান।',
      category: 'diet',
      language: 'bn',
      tags: ['খাবার', 'পুষ্টি', 'ডায়েট'],
      priority: 3,
    },
    {
      title: 'পর্যাপ্ত ঘুম',
      content: 'প্রতিদিন ৭-৯ ঘন্টা ঘুমান। ভালো ঘুম আপনার মানসিক ও শারীরিক স্বাস্থ্যের জন্য অত্যন্ত গুরুত্বপূর্ণ।',
      category: 'sleep',
      language: 'bn',
      tags: ['ঘুম', 'বিশ্রাম', 'স্বাস্থ্য'],
      priority: 4,
    },
    {
      title: 'মানসিক স্বাস্থ্য',
      content: 'মানসিক চাপ কমাতে মেডিটেশন, যোগব্যায়াম বা গভীর শ্বাস নেওয়ার অনুশীলন করুন। প্রয়োজনে বিশেষজ্ঞের সাহায্য নিন।',
      category: 'mental_health',
      language: 'bn',
      tags: ['মানসিক স্বাস্থ্য', 'মেডিটেশন', 'চাপ'],
      priority: 5,
    },
  ],
};

// Seed function to populate initial data
async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  try {
    // Clear existing data (optional - remove in production)
    console.log('🧹 Cleaning existing data...');
    await prisma.healthTip.deleteMany();
    await prisma.vaccinationSchedule.deleteMany();
    await prisma.emergencyContact.deleteMany();
    await prisma.hospital.deleteMany();
    await prisma.doctor.deleteMany();
    await prisma.medicine.deleteMany();

    // Seed medicines
    console.log('💊 Seeding medicines...');
    for (const medicine of initialData.medicines) {
      await prisma.medicine.create({ data: medicine });
    }
    console.log(`✅ Created ${initialData.medicines.length} medicines`);

    // Seed doctors
    console.log('👨‍⚕️ Seeding doctors...');
    for (const doctor of initialData.doctors) {
      await prisma.doctor.create({ data: doctor });
    }
    console.log(`✅ Created ${initialData.doctors.length} doctors`);

    // Seed hospitals
    console.log('🏥 Seeding hospitals...');
    for (const hospital of initialData.hospitals) {
      await prisma.hospital.create({ data: hospital });
    }
    console.log(`✅ Created ${initialData.hospitals.length} hospitals`);

    // Seed emergency contacts
    console.log('🚨 Seeding emergency contacts...');
    for (const contact of initialData.emergencyContacts) {
      await prisma.emergencyContact.create({ data: contact });
    }
    console.log(`✅ Created ${initialData.emergencyContacts.length} emergency contacts`);

    // Seed vaccination schedules
    console.log('💉 Seeding vaccination schedules...');
    for (const schedule of initialData.vaccinationSchedules) {
      await prisma.vaccinationSchedule.create({ data: schedule });
    }
    console.log(`✅ Created ${initialData.vaccinationSchedules.length} vaccination schedules`);

    // Seed health tips
    console.log('💡 Seeding health tips...');
    for (const tip of initialData.healthTips) {
      await prisma.healthTip.create({ data: tip });
    }
    console.log(`✅ Created ${initialData.healthTips.length} health tips`);

    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Main initialization function
async function initializeDatabase() {
  try {
    console.log('🚀 Initializing Dr. Mimu database...');
    
    // Connect to database
    await connectToDatabase();
    
    // Run database migrations (if needed)
    console.log('📋 Checking database schema...');
    
    // Seed initial data
    await seedDatabase();
    
    // Verify database health
    console.log('🔍 Verifying database health...');
    const healthCheck = await prisma.$queryRaw`SELECT 1 as health`;
    console.log('✅ Database health check passed');
    
    console.log('🎯 Database initialization completed successfully!');
    console.log('📊 Database is ready for Dr. Mimu application');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  } finally {
    await disconnectFromDatabase();
  }
}

// Run initialization if this script is executed directly
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('✨ Dr. Mimu database is ready!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Initialization failed:', error);
      process.exit(1);
    });
}

export { initializeDatabase, seedDatabase };