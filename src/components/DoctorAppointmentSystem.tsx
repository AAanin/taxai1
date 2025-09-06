// React এবং প্রয়োজনীয় hooks import করা হচ্ছে
import React, { useState, useEffect } from 'react';
// Lucide React থেকে আইকন import করা হচ্ছে UI এর জন্য
import { Calendar, Clock, MapPin, Star, Phone, Mail, Award, BookOpen, Users, CheckCircle, AlertCircle, Search, Filter, User } from 'lucide-react';
// মেডিকেল ডেটা সার্ভিস import করা হচ্ছে ডাক্তার ও অ্যাপয়েন্টমেন্ট ডেটা পরিচালনার জন্য
import { medicalDataService } from '../services/medicalDataService';
// LangChain সার্ভিস import করা হচ্ছে AI-powered ডাক্তার খোঁজার জন্য
import langchainService from '../services/langchainService';

/**
 * ডাক্তার ইন্টারফেস - একজন ডাক্তারের সম্পূর্ণ তথ্য সংজ্ঞায়িত করে
 * এতে ডাক্তারের ব্যক্তিগত তথ্য, যোগ্যতা, অভিজ্ঞতা, ফি এবং সময়সূচী রয়েছে
 */
interface Doctor {
  id: string; // ডাক্তারের অনন্য পরিচয়
  name: string; // ডাক্তারের নাম
  specialization: string; // বিশেষত্ব (যেমন: কার্ডিওলজি, গাইনোকোলজি)
  experience: number; // অভিজ্ঞতার বছর
  rating: number; // রেটিং (১-৫ স্কেলে)
  reviews: number; // মোট রিভিউ সংখ্যা
  location: string; // অবস্থান
  hospital: string; // হাসপাতালের নাম
  consultationFee: number; // পরামর্শ ফি
  image?: string; // ডাক্তারের ছবি (ঐচ্ছিক)
  phone: string; // ফোন নম্বর
  email: string; // ইমেইল ঠিকানা
  education: string[]; // শিক্ষাগত যোগ্যতার তালিকা
  languages: string[]; // কথা বলতে পারেন এমন ভাষার তালিকা
  availableDays: string[]; // সপ্তাহের যে দিনগুলোতে উপলব্ধ
  timeSlots: string[]; // দৈনিক সময়সূচী
  about: string; // ডাক্তার সম্পর্কে বিবরণ
  achievements: string[]; // অর্জন ও পুরস্কারের তালিকা
}

/**
 * অ্যাপয়েন্টমেন্ট ইন্টারফেস - একটি অ্যাপয়েন্টমেন্টের সম্পূর্ণ তথ্য সংজ্ঞায়িত করে
 * এতে রোগী ও ডাক্তারের তথ্য, সময়, সমস্যা এবং অ্যাপয়েন্টমেন্টের অবস্থা রয়েছে
 */
interface Appointment {
  id: string; // অ্যাপয়েন্টমেন্টের অনন্য পরিচয়
  doctorId: string; // ডাক্তারের ID
  doctorName: string; // ডাক্তারের নাম
  patientName: string; // রোগীর নাম
  patientPhone: string; // রোগীর ফোন নম্বর
  patientAge: number; // রোগীর বয়স
  appointmentDate: string; // অ্যাপয়েন্টমেন্টের তারিখ
  timeSlot: string; // নির্ধারিত সময়
  problem: string; // স্বাস্থ্য সমস্যার বিবরণ
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'; // অ্যাপয়েন্টমেন্টের অবস্থা
  consultationFee: number; // পরামর্শ ফি
  createdAt: Date; // অ্যাপয়েন্টমেন্ট তৈরির সময়
}

/**
 * ডাক্তার অ্যাপয়েন্টমেন্ট সিস্টেম কম্পোনেন্টের props ইন্টারফেস
 * অ্যাপয়েন্টমেন্ট নিশ্চিত হওয়ার পর callback function চালানোর জন্য
 */
interface DoctorAppointmentSystemProps {
  onBack?: () => void; // পূর্ববর্তী পেজে ফিরে যাওয়ার callback
  onAppointmentConfirm?: (appointmentId: string) => void; // অ্যাপয়েন্টমেন্ট নিশ্চিত হওয়ার callback
}

/**
 * ডাক্তার অ্যাপয়েন্টমেন্ট সিস্টেম - মূল কম্পোনেন্ট
 * এই কম্পোনেন্ট ডাক্তার খোঁজা, অ্যাপয়েন্টমেন্ট বুকিং এবং পরিচালনার সুবিধা প্রদান করে
 * AI-powered সার্চ এবং ফিল্টারিং সুবিধা রয়েছে
 */
const DoctorAppointmentSystem: React.FC<DoctorAppointmentSystemProps> = ({ onBack, onAppointmentConfirm }) => {
  // ডাক্তারদের তালিকা সংরক্ষণের জন্য state
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  // অ্যাপয়েন্টমেন্টের তালিকা সংরক্ষণের জন্য state
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  // সার্চ টার্ম সংরক্ষণের জন্য state
  const [searchTerm, setSearchTerm] = useState('');
  // নির্বাচিত বিশেষত্ব সংরক্ষণের জন্য state
  const [selectedSpecialization, setSelectedSpecialization] = useState('all');
  // নির্বাচিত ডাক্তার সংরক্ষণের জন্য state
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  // অ্যাপয়েন্টমেন্ট বুকিং ফর্ম দেখানোর জন্য state
  const [showBooking, setShowBooking] = useState(false);
  // অ্যাপয়েন্টমেন্ট তালিকা দেখানোর জন্য state
  const [showAppointments, setShowAppointments] = useState(false);
  // AI সার্চ চলছে কিনা তা নির্দেশ করার জন্য state
  const [isSearching, setIsSearching] = useState(false);
  // ফিল্টার করা ডাক্তারদের তালিকা সংরক্ষণের জন্য state
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);

  /**
   * AI-powered ডাক্তার সার্চ ফাংশন
   * ব্যবহারকারীর query অনুযায়ী সবচেয়ে উপযুক্ত ডাক্তার খুঁজে বের করে
   * LangChain AI সার্ভিস ব্যবহার করে intelligent matching করে
   * @param query - ব্যবহারকারীর সার্চ টার্ম (সমস্যা, বিশেষত্ব, ডাক্তারের নাম ইত্যাদি)
   * @returns Promise<Doctor[]> - ফিল্টার করা ডাক্তারদের তালিকা
   */
  const searchDoctorsWithAI = async (query: string): Promise<Doctor[]> => {
    try {
      // AI সার্চ শুরুর ইন্ডিকেটর সেট করা
      setIsSearching(true);
      // LangChain সার্ভিস দিয়ে AI recommendation পাওয়া
      const response = await langchainService.getDoctorRecommendations(query);
      
      // AI recommendation এর ভিত্তিতে ডাক্তারদের ফিল্টার করা
      const recommendedDoctors = doctors.filter(doctor => {
        const specialization = doctor.specialization.toLowerCase();
        const name = doctor.name.toLowerCase();
        const hospital = doctor.hospital.toLowerCase();
        const queryLower = query.toLowerCase();
        
        // ডাক্তার AI recommendation বা search term এর সাথে মিলে কিনা চেক করা
        return specialization.includes(queryLower) ||
               name.includes(queryLower) ||
               hospital.includes(queryLower) ||
               response.toLowerCase().includes(specialization) ||
               response.toLowerCase().includes(name.split(' ')[1]); // শেষ নাম চেক করা
      });
      
      return recommendedDoctors;
    } catch (error) {
      console.error('AI doctor search failed:', error);
      // AI সার্চ ব্যর্থ হলে traditional search এ ফিরে যাওয়া
      return doctors.filter(doctor => {
        const matchesSearch = doctor.name.toLowerCase().includes(query.toLowerCase()) ||
                             doctor.specialization.toLowerCase().includes(query.toLowerCase()) ||
                             doctor.hospital.toLowerCase().includes(query.toLowerCase());
        return matchesSearch;
      });
    } finally {
      // সার্চ শেষে loading indicator বন্ধ করা
      setIsSearching(false);
    }
  };

  /**
   * কম্পোনেন্ট মাউন্ট হওয়ার সময় ডাক্তারদের ডেটা লোড করার useEffect
   * নমুনা ডাক্তারদের তথ্য দিয়ে শুরু করে, পরে API থেকে ডেটা লোড করার চেষ্টা করে
   */
  useEffect(() => {
    // নমুনা ডাক্তারদের ডেটা - বিভিন্ন বিশেষত্বের ডাক্তারদের সম্পূর্ণ তথ্য
    const sampleDoctors: Doctor[] = [
      {
        id: '1', // ডাক্তারের অনন্য পরিচয়
        name: 'ডা. মোহাম্মদ রহিম', // ডাক্তারের নাম
        specialization: 'কার্ডিওলজি', // হৃদরোগ বিশেষজ্ঞ
        experience: 15, // ১৫ বছরের অভিজ্ঞতা
        rating: 4.8, // ৫ এর মধ্যে ৪.৮ রেটিং
        reviews: 320, // ৩২০টি রিভিউ
        location: 'ধানমন্ডি, ঢাকা', // অবস্থান
        hospital: 'স্কয়ার হাসপাতাল', // হাসপাতালের নাম
        consultationFee: 1500, // পরামর্শ ফি ১৫০০ টাকা
        phone: '01711-123456', // ফোন নম্বর
        email: 'dr.rahim@example.com', // ইমেইল ঠিকানা
        education: ['এমবিবিএস - ঢাকা মেডিকেল কলেজ', 'এমডি (কার্ডিওলজি) - বিএসএমএমইউ'], // শিক্ষাগত যোগ্যতা
        languages: ['বাংলা', 'ইংরেজি'], // ভাষা দক্ষতা
        availableDays: ['রবিবার', 'মঙ্গলবার', 'বৃহস্পতিবার'], // উপলব্ধ দিন
        timeSlots: ['৯:০০ - ১২:০০', '৪:০০ - ৮:০০'], // সময়সূচী
        about: 'হৃদরোগ বিশেষজ্ঞ হিসেবে ১৫ বছরের অভিজ্ঞতা। জটিল হৃদরোগের চিকিৎসায় দক্ষ।', // সম্পর্কে
        achievements: ['বেস্ট কার্ডিওলজিস্ট অ্যাওয়ার্ড ২০২২', '৫০০+ সফল হার্ট সার্জারি'] // অর্জনসমূহ
      },
      {
        id: '2',
        name: 'ডা. ফাতেমা খাতুন',
        specialization: 'গাইনোকোলজি',
        experience: 12,
        rating: 4.9,
        reviews: 280,
        location: 'গুলশান, ঢাকা',
        hospital: 'ইউনাইটেড হাসপাতাল',
        consultationFee: 1200,
        phone: '01711-234567',
        email: 'dr.fatema@example.com',
        education: ['এমবিবিএস - চট্টগ্রাম মেডিকেল কলেজ', 'এফসিপিএস (গাইনোকোলজি)'],
        languages: ['বাংলা', 'ইংরেজি', 'হিন্দি'],
        availableDays: ['সোমবার', 'বুধবার', 'শুক্রবার'],
        timeSlots: ['১০:০০ - ১:০০', '৫:০০ - ৯:০০'],
        about: 'মহিলা ও প্রসূতি রোগ বিশেষজ্ঞ। নিরাপদ প্রসব ও মহিলাদের স্বাস্থ্য সেবায় অভিজ্ঞ।',
        achievements: ['মাতৃত্ব স্বাস্থ্য পুরস্কার ২০২১', '১০০০+ সফল প্রসব']
      },
      {
        id: '3',
        name: 'ডা. আহমেদ হাসান',
        specialization: 'অর্থোপেডিক্স',
        experience: 18,
        rating: 4.7,
        reviews: 450,
        location: 'বনানী, ঢাকা',
        hospital: 'এপোলো হাসপাতাল',
        consultationFee: 1800,
        phone: '01711-345678',
        email: 'dr.ahmed@example.com',
        education: ['এমবিবিএস - রাজশাহী মেডিকেল কলেজ', 'এমএস (অর্থোপেডিক্স) - বিএসএমএমইউ'],
        languages: ['বাংলা', 'ইংরেজি'],
        availableDays: ['রবিবার', 'মঙ্গলবার', 'বৃহস্পতিবার', 'শনিবার'],
        timeSlots: ['৮:০০ - ১১:০০', '৩:০০ - ৭:০০'],
        about: 'হাড় ও জয়েন্ট বিশেষজ্ঞ। স্পোর্টস ইনজুরি ও জটিল ফ্র্যাকচার চিকিৎসায় দক্ষ।',
        achievements: ['অর্থোপেডিক এক্সিলেন্স অ্যাওয়ার্ড ২০২৩', '২০০০+ সফল অপারেশন']
      },
      {
        id: '4',
        name: 'ডা. নাসরিন আক্তার',
        specialization: 'শিশু বিশেষজ্ঞ',
        experience: 10,
        rating: 4.9,
        reviews: 380,
        location: 'ধানমন্ডি, ঢাকা',
        hospital: 'হলি ফ্যামিলি হাসপাতাল',
        consultationFee: 1000,
        phone: '01711-456789',
        email: 'dr.nasrin@example.com',
        education: ['এমবিবিএস - সিলেট এমএজি ওসমানী মেডিকেল কলেজ', 'এমডি (পেডিয়াট্রিক্স)'],
        languages: ['বাংলা', 'ইংরেজি'],
        availableDays: ['সোমবার', 'বুধবার', 'শুক্রবার', 'শনিবার'],
        timeSlots: ['৯:০০ - ১২:০০', '৪:০০ - ৭:০০'],
        about: 'শিশু রোগ বিশেষজ্ঞ। নবজাতক থেকে কিশোর বয়স পর্যন্ত সব ধরনের চিকিৎসা।',
        achievements: ['চাইল্ড কেয়ার এক্সিলেন্স অ্যাওয়ার্ড ২০২২', 'শিশু স্বাস্থ্য গবেষণা পুরস্কার']
      },
      {
        id: '5',
        name: 'ডা. কামরুল ইসলাম',
        specialization: 'নিউরোলজি',
        experience: 20,
        rating: 4.8,
        reviews: 290,
        location: 'মিরপুর, ঢাকা',
        hospital: 'ন্যাশনাল ইনস্টিটিউট অব নিউরোসায়েন্স',
        consultationFee: 2000,
        phone: '01711-567890',
        email: 'dr.kamrul@example.com',
        education: ['এমবিবিএস - ময়মনসিংহ মেডিকেল কলেজ', 'এমডি (নিউরোলজি) - বিএসএমএমইউ'],
        languages: ['বাংলা', 'ইংরেজি'],
        availableDays: ['রবিবার', 'মঙ্গলবার', 'বৃহস্পতিবার'],
        timeSlots: ['১০:০০ - ১:০০', '৫:০০ - ৮:০০'],
        about: 'স্নায়ু রোগ বিশেষজ্ঞ। মস্তিষ্ক ও স্নায়ুতন্ত্রের জটিল রোগের চিকিৎসায় অভিজ্ঞ।',
        achievements: ['নিউরোলজি রিসার্চ অ্যাওয়ার্ড ২০২১', 'স্ট্রোক ট্রিটমেন্ট এক্সপার্ট']
      }
    ];
    
    /**
     * মেডিকেল ডেটা সার্ভিস থেকে ডাক্তারদের তথ্য লোড করার async ফাংশন
     * API কল ব্যর্থ হলে নমুনা ডেটা ব্যবহার করে
     */
    const loadDoctors = async () => {
      try {
        // মেডিকেল ডেটা সার্ভিস থেকে সব ডাক্তারের তথ্য পাওয়ার চেষ্টা
        const doctorsData = await medicalDataService.getAllDoctors();
        setDoctors(doctorsData); // সফল হলে API ডেটা সেট করা
      } catch (error) {
        console.error('Error loading doctors:', error); // এরর লগ করা
        setDoctors(sampleDoctors); // API ব্যর্থ হলে নমুনা ডেটা ব্যবহার করা
      }
    };
    loadDoctors(); // ফাংশন কল করা
  }, []);

  /**
   * ফিল্টারিংয়ের জন্য উপলব্ধ বিশেষত্বের তালিকা
   * রোগীরা নির্দিষ্ট বিশেষত্বের ডাক্তার খুঁজে পেতে এটি ব্যবহার করতে পারেন
   */
  const specializations = [
    'all', // সব ধরনের ডাক্তার দেখানোর জন্য
    'কার্ডিওলজি', // হৃদরোগ বিশেষজ্ঞ
    'গাইনোকোলজি', // নারী রোগ বিশেষজ্ঞ
    'অর্থোপেডিক্স', // হাড় ও জয়েন্ট বিশেষজ্ঞ
    'শিশু বিশেষজ্ঞ', // শিশু রোগ বিশেষজ্ঞ
    'নিউরোলজি' // স্নায়ুরোগ বিশেষজ্ঞ
  ];

  /**
   * AI-চালিত ডাক্তার ফিল্টারিং সিস্টেম
   * সার্চ টার্ম এবং নির্বাচিত বিশেষত্বের ভিত্তিতে ডাক্তারদের ফিল্টার করে
   * রিয়েল-টাইমে ফলাফল আপডেট করে যখন ইউজার সার্চ করে বা ফিল্টার পরিবর্তন করে
   */
  useEffect(() => {
    /**
     * ডাক্তার ফিল্টারিং ফাংশন - AI এবং ঐতিহ্যগত উভয় পদ্ধতি ব্যবহার করে
     * সার্চ টার্ম থাকলে AI সার্চ, না থাকলে সাধারণ ফিল্টারিং
     */
    const filterDoctors = async () => {
      if (searchTerm.trim()) {
        // সার্চ টার্ম থাকলে AI সার্চ ব্যবহার করা
        const aiFilteredDoctors = await searchDoctorsWithAI(searchTerm);
        
        // AI ফলাফলে বিশেষত্ব ফিল্টার প্রয়োগ করা
        const finalFiltered = aiFilteredDoctors.filter(doctor => 
          selectedSpecialization === 'all' || doctor.specialization === selectedSpecialization
        );
        
        setFilteredDoctors(finalFiltered);
      } else {
        // সার্চ টার্ম না থাকলে ঐতিহ্যগত ফিল্টারিং ব্যবহার করা
        const traditionalFiltered = doctors.filter(doctor => 
          selectedSpecialization === 'all' || doctor.specialization === selectedSpecialization
        );
        setFilteredDoctors(traditionalFiltered);
      }
    };
    
    // ফিল্টারিং ফাংশন চালু করা
    filterDoctors();
  }, [searchTerm, selectedSpecialization, doctors]); // ডিপেন্ডেন্সি অ্যারে - এই ভ্যালুগুলো পরিবর্তন হলে useEffect চালু হবে

  /**
   * নতুন অ্যাপয়েন্টমেন্ট বুক করার ফাংশন
   * রোগীর তথ্য এবং ডাক্তারের সময়সূচী অনুযায়ী অ্যাপয়েন্টমেন্ট তৈরি করে
   * @param appointmentData - অ্যাপয়েন্টমেন্টের সব প্রয়োজনীয় তথ্য
   */
  const bookAppointment = async (appointmentData: {
    patientName: string; // রোগীর নাম
    patientPhone: string; // রোগীর ফোন নম্বর
    patientAge: number; // রোগীর বয়স
    appointmentDate: string; // অ্যাপয়েন্টমেন্টের তারিখ
    timeSlot: string; // সময়ের স্লট
    problem: string; // সমস্যার বিবরণ
  }) => {
    if (!selectedDoctor) return; // নির্বাচিত ডাক্তার না থাকলে ফাংশন বন্ধ করা

    try {
      // মেডিকেল ডেটা সার্ভিসের জন্য অ্যাপয়েন্টমেন্ট ডেটা প্রস্তুত করা
      const appointmentServiceData = {
        userId: 'user_123', // ব্যবহারকারীর আইডি (ভবিষ্যতে ডায়নামিক হবে)
        doctorId: selectedDoctor.id, // নির্বাচিত ডাক্তারের আইডি
        date: appointmentData.appointmentDate, // অ্যাপয়েন্টমেন্টের তারিখ
        time: appointmentData.timeSlot, // নির্ধারিত সময়
        symptoms: appointmentData.problem, // রোগীর সমস্যার বিবরণ
        appointmentType: 'offline' as const, // অফলাইন অ্যাপয়েন্টমেন্ট
        cost: selectedDoctor.consultationFee, // পরামর্শ ফি
        status: 'pending' as const // প্রাথমিক অবস্থা - অপেক্ষমাণ
      };

      // মেডিকেল ডেটা সার্ভিসে অ্যাপয়েন্টমেন্ট তৈরি করা
      const serviceAppointment = await medicalDataService.createAppointment(appointmentServiceData);
      
      // স্থানীয় অ্যাপয়েন্টমেন্ট অবজেক্ট তৈরি করা
      const newAppointment: Appointment = {
        id: serviceAppointment.id, // সার্ভিস থেকে প্রাপ্ত আইডি
        doctorId: selectedDoctor.id, // ডাক্তারের রেফারেন্স
        doctorName: selectedDoctor.name, // ডাক্তারের নাম
        patientName: appointmentData.patientName, // রোগীর নাম
        patientPhone: appointmentData.patientPhone, // যোগাযোগের জন্য ফোন নম্বর
        patientAge: appointmentData.patientAge, // চিকিৎসার জন্য বয়সের তথ্য
        appointmentDate: appointmentData.appointmentDate, // নির্ধারিত তারিখ
        timeSlot: appointmentData.timeSlot, // নির্ধারিত সময়
        problem: appointmentData.problem, // রোগীর সমস্যার বিস্তারিত
        status: 'pending', // প্রাথমিক অবস্থা - অপেক্ষমাণ
        consultationFee: selectedDoctor.consultationFee, // পরামর্শ ফি
        createdAt: new Date() // তৈরির সময় রেকর্ড করা
      };

      // স্থানীয় স্টেট আপডেট করা - নতুন অ্যাপয়েন্টমেন্ট তালিকার শুরুতে যোগ করা
      setAppointments([newAppointment, ...appointments]);
      setShowBooking(false); // বুকিং ফর্ম বন্ধ করা
      setSelectedDoctor(null); // নির্বাচিত ডাক্তার রিসেট করা
      
      // কনফার্মেশন কলব্যাক চালানো (যদি প্রদান করা হয়)
      if (onAppointmentConfirm) {
        onAppointmentConfirm(newAppointment.id); // প্যারেন্ট কম্পোনেন্টকে জানানো
      } else {
        alert('অ্যাপয়েন্টমেন্ট সফলভাবে বুক হয়েছে!'); // সফলতার বার্তা প্রদর্শন
      }
    } catch (error) {
      // এরর হ্যান্ডলিং এবং লগিং
      console.error('Appointment booking failed:', error);
      alert('অ্যাপয়েন্টমেন্ট বুক করতে সমস্যা হয়েছে!'); // ব্যর্থতার বার্তা
    }
  };

  /**
   * অ্যাপয়েন্টমেন্ট নিশ্চিত করার ফাংশন
   * ডাক্তার বা অ্যাডমিন অ্যাপয়েন্টমেন্ট অনুমোদন করতে এটি ব্যবহার করেন
   * @param appointmentId - নিশ্চিত করার জন্য অ্যাপয়েন্টমেন্টের আইডি
   */
  const confirmAppointment = (appointmentId: string) => {
    // স্থানীয় স্টেটে নির্দিষ্ট অ্যাপয়েন্টমেন্টের স্ট্যাটাস আপডেট করা
    setAppointments(appointments.map(appointment => 
      appointment.id === appointmentId 
        ? { ...appointment, status: 'confirmed' as const } // শুধু নির্দিষ্ট অ্যাপয়েন্টমেন্টের স্ট্যাটাস পরিবর্তন
        : appointment // অন্য অ্যাপয়েন্টমেন্টগুলো অপরিবর্তিত রাখা
    ));
  };

  /**
   * অ্যাপয়েন্টমেন্ট বাতিল করার ফাংশন
   * রোগী বা ডাক্তার প্রয়োজনে অ্যাপয়েন্টমেন্ট বাতিল করতে পারেন
   * @param appointmentId - বাতিল করার জন্য অ্যাপয়েন্টমেন্টের আইডি
   */
  const cancelAppointment = (appointmentId: string) => {
    // স্থানীয় স্টেটে নির্দিষ্ট অ্যাপয়েন্টমেন্টের স্ট্যাটাস বাতিল হিসেবে আপডেট করা
    setAppointments(appointments.map(appointment => 
      appointment.id === appointmentId 
        ? { ...appointment, status: 'cancelled' as const } // শুধু নির্দিষ্ট অ্যাপয়েন্টমেন্টের স্ট্যাটাস পরিবর্তন
        : appointment // অন্য অ্যাপয়েন্টমেন্টগুলো অপরিবর্তিত রাখা
    ));
  };

  /**
   * অ্যাপয়েন্টমেন্টের স্ট্যাটাস অনুযায়ী রঙের ক্লাস নির্ধারণ করার ইউটিলিটি ফাংশন
   * UI তে বিভিন্ন স্ট্যাটাসের জন্য আলাদা রঙ প্রদর্শন করতে ব্যবহৃত হয়
   * @param status - অ্যাপয়েন্টমেন্টের বর্তমান অবস্থা
   * @returns Tailwind CSS ক্লাস স্ট্রিং (টেক্সট ও ব্যাকগ্রাউন্ড রঙ)
   */
  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100'; // অপেক্ষমাণ অ্যাপয়েন্টমেন্টের জন্য হলুদ রঙ
      case 'confirmed': return 'text-blue-600 bg-blue-100'; // নিশ্চিত অ্যাপয়েন্টমেন্টের জন্য নীল রঙ
      case 'completed': return 'text-green-600 bg-green-100'; // সম্পন্ন অ্যাপয়েন্টমেন্টের জন্য সবুজ রঙ
      case 'cancelled': return 'text-red-600 bg-red-100'; // বাতিল অ্যাপয়েন্টমেন্টের জন্য লাল রঙ
      default: return 'text-gray-600 bg-gray-100'; // অজানা স্ট্যাটাসের জন্য ধূসর রঙ
    }
  };

  /**
   * অ্যাপয়েন্টমেন্টের স্ট্যাটাসের বাংলা টেক্সট প্রদান করার ইউটিলিটি ফাংশন
   * ইংরেজি স্ট্যাটাসকে বাংলায় রূপান্তর করে ব্যবহারকারীর জন্য বোধগম্য করে তোলে
   * @param status - অ্যাপয়েন্টমেন্টের বর্তমান অবস্থা
   * @returns বাংলা স্ট্যাটাস টেক্সট
   */
  const getStatusText = (status: Appointment['status']) => {
    switch (status) {
      case 'pending': return 'অপেক্ষমান'; // অ্যাপয়েন্টমেন্ট অনুমোদনের অপেক্ষায়
      case 'confirmed': return 'নিশ্চিত'; // অ্যাপয়েন্টমেন্ট অনুমোদিত
      case 'completed': return 'সম্পন্ন'; // অ্যাপয়েন্টমেন্ট সফলভাবে সম্পন্ন
      case 'cancelled': return 'বাতিল'; // অ্যাপয়েন্টমেন্ট বাতিল করা হয়েছে
      default: return status; // অজানা স্ট্যাটাসের ক্ষেত্রে মূল টেক্সট ফেরত দেওয়া
    }
  };

  // অ্যাপয়েন্টমেন্ট ইতিহাস দেখার কন্ডিশনাল রেন্ডারিং
  if (showAppointments) {
    return (
      <div className="p-6">
        {/* হেডার সেকশন - শিরোনাম এবং নেভিগেশন */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">আমার অ্যাপয়েন্টমেন্ট</h2>
          {/* মূল ডাক্তার তালিকায় ফিরে যাওয়ার বাটন */}
          <button
            onClick={() => setShowAppointments(false)}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
          >
            ফিরে যান
          </button>
        </div>

        {/* অ্যাপয়েন্টমেন্ট তালিকা বা খালি স্টেট */}
        {appointments.length === 0 ? (
          // কোনো অ্যাপয়েন্টমেন্ট না থাকলে খালি স্টেট দেখানো
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">কোনো অ্যাপয়েন্টমেন্ট নেই</p>
          </div>
        ) : (
          // অ্যাপয়েন্টমেন্ট তালিকা প্রদর্শন
          <div className="space-y-4">
            {appointments.map(appointment => (
              // প্রতিটি অ্যাপয়েন্টমেন্টের জন্য কার্ড
              <div key={appointment.id} className="bg-white border rounded-lg p-6 shadow-sm">
                {/* অ্যাপয়েন্টমেন্টের হেডার - ডাক্তার ও রোগীর নাম, স্ট্যাটাস */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    {/* ডাক্তারের নাম */}
                    <h3 className="font-semibold text-lg">{appointment.doctorName}</h3>
                    {/* রোগীর নাম */}
                    <p className="text-sm text-gray-600">রোগী: {appointment.patientName}</p>
                  </div>
                  {/* অ্যাপয়েন্টমেন্টের স্ট্যাটাস ব্যাজ */}
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                    {getStatusText(appointment.status)}
                  </span>
                </div>
                
                {/* অ্যাপয়েন্টমেন্টের বিস্তারিত তথ্য গ্রিড */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {/* তারিখ */}
                  <div>
                    <p className="text-sm text-gray-600">তারিখ</p>
                    <p className="font-medium">{appointment.appointmentDate}</p>
                  </div>
                  {/* সময় */}
                  <div>
                    <p className="text-sm text-gray-600">সময়</p>
                    <p className="font-medium">{appointment.timeSlot}</p>
                  </div>
                  {/* ফোন নম্বর */}
                  <div>
                    <p className="text-sm text-gray-600">ফোন</p>
                    <p className="font-medium">{appointment.patientPhone}</p>
                  </div>
                  {/* পরামর্শ ফি */}
                  <div>
                    <p className="text-sm text-gray-600">ফি</p>
                    <p className="font-medium text-green-600">৳{appointment.consultationFee}</p>
                  </div>
                </div>
                
                {/* রোগীর সমস্যার বিবরণ সেকশন */}
                <div className="bg-gray-50 p-3 rounded mb-4">
                  <p className="text-sm text-gray-600 mb-1">সমস্যার বিবরণ:</p>
                  <p className="text-sm">{appointment.problem}</p>
                </div>
                
                {/* অ্যাকশন বাটনগুলো - শুধুমাত্র পেন্ডিং অ্যাপয়েন্টমেন্টের জন্য */}
                {appointment.status === 'pending' && (
                  <div className="flex space-x-2">
                    {/* অ্যাপয়েন্টমেন্ট নিশ্চিত করার বাটন */}
                    <button
                      onClick={() => confirmAppointment(appointment.id)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center text-sm"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      নিশ্চিত করুন
                    </button>
                    {/* অ্যাপয়েন্টমেন্ট বাতিল করার বাটন */}
                    <button
                      onClick={() => cancelAppointment(appointment.id)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center text-sm"
                    >
                      <AlertCircle className="h-4 w-4 mr-1" />
                      বাতিল করুন
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // অ্যাপয়েন্টমেন্ট বুকিং ফর্মের কন্ডিশনাল রেন্ডারিং
  if (showBooking && selectedDoctor) {
    return (
      <AppointmentBookingForm
        doctor={selectedDoctor}
        onBook={bookAppointment}
        onCancel={() => {
          setShowBooking(false);
          setSelectedDoctor(null);
        }}
      />
    );
  }

  // মূল ডাক্তার তালিকা ইন্টারফেস রেন্ডারিং
  return (
    <div className="p-6">
      {/* হেডার সেকশন - শিরোনাম এবং অ্যাপয়েন্টমেন্ট ইতিহাস বাটন */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">ডাক্তার অ্যাপয়েন্টমেন্ট সিস্টেম</h1>
        {/* অ্যাপয়েন্টমেন্ট ইতিহাস দেখার বাটন */}
        <button
          onClick={() => setShowAppointments(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center"
        >
          <Calendar className="h-4 w-4 mr-2" />
          আমার অ্যাপয়েন্টমেন্ট
        </button>
      </div>

      {/* সার্চ এবং ফিল্টার সেকশন */}
      <div className="mb-6 space-y-4">
        <div className="flex space-x-4">
          {/* সার্চ ইনপুট ফিল্ড */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="ডাক্তারের নাম, বিশেষত্ব বা হাসপাতাল খুঁজুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {/* বিশেষত্ব ফিল্টার ড্রপডাউন */}
          <select
            value={selectedSpecialization}
            onChange={(e) => setSelectedSpecialization(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {specializations.map(spec => (
              <option key={spec} value={spec}>
                {spec === 'all' ? 'সব বিশেষত্ব' : spec}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ডাক্তারদের গ্রিড লেআউট */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDoctors.map(doctor => (
          // প্রতিটি ডাক্তারের জন্য কার্ড
          <div key={doctor.id} className="bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            {/* ডাক্তারের মূল তথ্য সেকশন */}
            <div className="flex items-start space-x-4 mb-4">
              {/* প্রোফাইল আইকন */}
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-blue-600" />
              </div>
              {/* ডাক্তারের নাম, বিশেষত্ব এবং হাসপাতাল */}
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-800">{doctor.name}</h3>
                <p className="text-blue-600 font-medium">{doctor.specialization}</p>
                <p className="text-sm text-gray-600">{doctor.hospital}</p>
              </div>
            </div>

            {/* ডাক্তারের বিস্তারিত তথ্য সেকশন */}
            <div className="space-y-2 mb-4">
              {/* অভিজ্ঞতা */}
              <div className="flex items-center space-x-2">
                <Award className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{doctor.experience} বছর অভিজ্ঞতা</span>
              </div>
              
              {/* অবস্থান */}
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{doctor.location}</span>
              </div>
              
              {/* রেটিং এবং রিভিউ */}
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < Math.floor(doctor.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">{doctor.rating} ({doctor.reviews} রিভিউ)</span>
              </div>
              
              {/* ফোন নম্বর */}
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{doctor.phone}</span>
              </div>
            </div>

            {/* উপলব্ধ দিনের তালিকা */}
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">উপলব্ধ দিন:</p>
              <div className="flex flex-wrap gap-1">
                {doctor.availableDays.map(day => (
                  <span key={day} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                    {day}
                  </span>
                ))}
              </div>
            </div>

            {/* পরামর্শ ফি এবং অ্যাপয়েন্টমেন্ট বুকিং সেকশন */}
            <div className="flex items-center justify-between">
              {/* পরামর্শ ফি প্রদর্শন */}
              <div>
                <p className="text-2xl font-bold text-green-600">৳{doctor.consultationFee}</p>
                <p className="text-sm text-gray-600">পরামর্শ ফি</p>
              </div>
              
              {/* অ্যাপয়েন্টমেন্ট বুক করার বাটন */}
              <button
                onClick={() => {
                  setSelectedDoctor(doctor);
                  setShowBooking(true);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
              >
                <Calendar className="h-4 w-4 mr-2" />
                অ্যাপয়েন্টমেন্ট
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// অ্যাপয়েন্টমেন্ট বুকিং ফর্ম কম্পোনেন্ট
/**
 * অ্যাপয়েন্টমেন্ট বুকিং ফর্মের প্রপস ইন্টারফেস
 * @interface AppointmentBookingFormProps
 * @property {Doctor} doctor - নির্বাচিত ডাক্তারের তথ্য
 * @property {Function} onBook - অ্যাপয়েন্টমেন্ট বুক করার কলব্যাক ফাংশন
 * @property {Function} onCancel - বুকিং বাতিল করার কলব্যাক ফাংশন
 */
interface AppointmentBookingFormProps {
  doctor: Doctor;
  onBook: (appointmentData: {
    patientName: string;
    patientPhone: string;
    patientAge: number;
    appointmentDate: string;
    timeSlot: string;
    problem: string;
  }) => void;
  onCancel: () => void;
}

/**
 * অ্যাপয়েন্টমেন্ট বুকিং ফর্ম কম্পোনেন্ট
 * রোগীর তথ্য সংগ্রহ করে এবং অ্যাপয়েন্টমেন্ট বুক করে
 */
const AppointmentBookingForm: React.FC<AppointmentBookingFormProps> = ({ doctor, onBook, onCancel }) => {
  // রোগীর তথ্যের জন্য স্টেট ভেরিয়েবলগুলো
  const [patientName, setPatientName] = useState(''); // রোগীর নাম
  const [patientPhone, setPatientPhone] = useState(''); // রোগীর ফোন নম্বর
  const [patientAge, setPatientAge] = useState(''); // রোগীর বয়স
  const [appointmentDate, setAppointmentDate] = useState(''); // অ্যাপয়েন্টমেন্টের তারিখ
  const [timeSlot, setTimeSlot] = useState(''); // সময়ের স্লট
  const [problem, setProblem] = useState(''); // রোগীর সমস্যার বিবরণ

  /**
   * ফর্ম সাবমিট হ্যান্ডলার
   * সব তথ্য যাচাই করে এবং অ্যাপয়েন্টমেন্ট বুক করে
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // সব ফিল্ড পূরণ হয়েছে কিনা যাচাই
    if (!patientName || !patientPhone || !patientAge || !appointmentDate || !timeSlot || !problem) {
      alert('সব তথ্য পূরণ করুন');
      return;
    }
    
    // অ্যাপয়েন্টমেন্ট ডেটা তৈরি করে onBook কলব্যাক কল করা
    onBook({
      patientName,
      patientPhone,
      patientAge: parseInt(patientAge),
      appointmentDate,
      timeSlot,
      problem
    });
  };

  /**
   * পরবর্তী ৩০ দিনের মধ্যে উপলব্ধ তারিখগুলো পেতে ফাংশন
   * ডাক্তারের উপলব্ধ দিনের ভিত্তিতে তারিখ ফিল্টার করে
   * @returns {Array} উপলব্ধ তারিখের অ্যারে
   */
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    // পরবর্তী ৩০ দিন লুপ করা
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      // বাংলা দিনের নাম পেতে
      const dayName = date.toLocaleDateString('bn-BD', { weekday: 'long' });
      // ডাক্তার এই দিনে উপলব্ধ কিনা চেক করা
      if (doctor.availableDays.includes(dayName)) {
        dates.push({
          value: date.toISOString().split('T')[0],
          label: date.toLocaleDateString('bn-BD', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })
        });
      }
    }
    return dates;
  };

  // অ্যাপয়েন্টমেন্ট বুকিং ফর্ম রেন্ডারিং
  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* ফর্মের শিরোনাম */}
        <h2 className="text-2xl font-bold mb-6">অ্যাপয়েন্টমেন্ট বুক করুন</h2>
        
        {/* দুই কলামের গ্রিড লেআউট */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* ডাক্তারের তথ্য সেকশন */}
          <div className="bg-white border rounded-lg p-6">
            {/* ডাক্তারের প্রোফাইল হেডার */}
            <div className="flex items-start space-x-4 mb-6">
              {/* প্রোফাইল আইকন */}
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-10 w-10 text-blue-600" />
              </div>
              {/* ডাক্তারের মূল তথ্য */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800">{doctor.name}</h3>
                <p className="text-blue-600 font-medium">{doctor.specialization}</p>
                <p className="text-gray-600">{doctor.hospital}</p>
                <p className="text-gray-600">{doctor.location}</p>
              </div>
            </div>
            
            {/* ডাক্তারের অতিরিক্ত তথ্য */}
            <div className="space-y-3 mb-6">
              {/* অভিজ্ঞতা */}
              <div className="flex items-center space-x-2">
                <Award className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{doctor.experience} বছর অভিজ্ঞতা</span>
              </div>
              
              {/* রেটিং এবং রিভিউ */}
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < Math.floor(doctor.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">{doctor.rating} ({doctor.reviews} রিভিউ)</span>
              </div>
              
              {/* ফোন নম্বর */}
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{doctor.phone}</span>
              </div>
              
              {/* ইমেইল */}
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{doctor.email}</span>
              </div>
            </div>
            
            {/* শিক্ষাগত যোগ্যতা সেকশন */}
            <div className="mb-4">
              <h4 className="font-semibold mb-2">শিক্ষাগত যোগ্যতা:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {doctor.qualifications && doctor.qualifications.map((edu, index) => (
                  <li key={index}>• {edu}</li>
                ))}
              </ul>
            </div>
            
            {/* ভাষা সেকশন */}
            <div className="mb-4">
              <h4 className="font-semibold mb-2">ভাষা:</h4>
              <div className="flex flex-wrap gap-2">
                {doctor.languages.map(lang => (
                  <span key={lang} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    {lang}
                  </span>
                ))}
              </div>
            </div>
            
            {/* পরামর্শ ফি */}
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-lg font-semibold text-green-600">পরামর্শ ফি: ৳{doctor.consultationFee}</p>
            </div>
          </div>
          
          {/* অ্যাপয়েন্টমেন্ট বুকিং ফর্ম */}
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">রোগীর তথ্য</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* রোগীর নাম ইনপুট */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  রোগীর নাম *
                </label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="পূর্ণ নাম লিখুন"
                  required
                />
              </div>
              
              {/* ফোন নম্বর ইনপুট */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ফোন নম্বর *
                </label>
                <input
                  type="tel"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="০১xxxxxxxxx"
                  required
                />
              </div>
              
              {/* বয়স ইনপুট */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  বয়স *
                </label>
                <input
                  type="number"
                  value={patientAge}
                  onChange={(e) => setPatientAge(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="বয়স লিখুন"
                  min="1"
                  max="120"
                  required
                />
              </div>
              
              {/* অ্যাপয়েন্টমেন্টের তারিখ নির্বাচন */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  অ্যাপয়েন্টমেন্টের তারিখ *
                </label>
                <select
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">তারিখ নির্বাচন করুন</option>
                  {getAvailableDates().map(date => (
                    <option key={date.value} value={date.value}>
                      {date.label}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* সময় নির্বাচন */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  সময় *
                </label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">সময় নির্বাচন করুন</option>
                  {/* ডাক্তারের উপলব্ধ সময়ের তালিকা */}
                  {doctor.timeSlots.map(slot => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* সমস্যার বিবরণ ইনপুট */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  সমস্যার বিবরণ *
                </label>
                <textarea
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="আপনার স্বাস্থ্য সমস্যার বিস্তারিত লিখুন"
                  required
                />
              </div>
              
              {/* ফর্ম অ্যাকশন বাটন */}
              <div className="flex space-x-4 pt-4">
                {/* বাতিল বাটন */}
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600"
                >
                  বাতিল
                </button>
                {/* সাবমিট বাটন */}
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  অ্যাপয়েন্টমেন্ট নিশ্চিত করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorAppointmentSystem;