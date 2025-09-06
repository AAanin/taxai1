// Hospital Services System - হাসপাতাল সেবা সিস্টেম
import React, { useState, useEffect } from 'react';
import {
  Building2, MapPin, Phone, Clock, Star, Navigation, Calendar,
  User, Heart, Brain, Eye, Bone, Baby, Stethoscope,
  Truck, AlertTriangle, Shield, Award, CheckCircle,
  Search, Filter, SortAsc, Info, ExternalLink, Share2,
  Bookmark, RefreshCw, X, ChevronRight, Plus, Edit3,
  Building, Users, Activity, Target, Zap, Globe
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

// Types
interface Hospital {
  id: string;
  name: string;
  type: 'government' | 'private' | 'specialized' | 'clinic';
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  phone: string;
  emergencyPhone?: string;
  email?: string;
  website?: string;
  description: string;
  specialties: string[];
  services: string[];
  facilities: string[];
  rating: number;
  reviewCount: number;
  distance?: number;
  openingHours: {
    [key: string]: { open: string; close: string; closed?: boolean };
  };
  emergencyServices: boolean;
  ambulanceService: boolean;
  bedCapacity: number;
  availableBeds: number;
  doctors: Doctor[];
  departments: Department[];
  verified: boolean;
  licenseNumber: string;
  establishedYear: number;
  accreditation: string[];
  insuranceAccepted: string[];
  languages: string[];
  parkingAvailable: boolean;
  wheelchairAccessible: boolean;
  onlineAppointment: boolean;
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  qualification: string;
  experience: number;
  rating: number;
  consultationFee: number;
  availableSlots: string[];
  languages: string[];
  imageUrl?: string;
}

interface Department {
  id: string;
  name: string;
  description: string;
  services: string[];
  doctors: string[];
  contactPhone?: string;
  location: string;
  emergencyAvailable: boolean;
}

interface Appointment {
  id: string;
  hospitalId: string;
  hospitalName: string;
  doctorId: string;
  doctorName: string;
  patientName: string;
  patientPhone: string;
  appointmentDate: Date;
  timeSlot: string;
  department: string;
  reason: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  consultationFee: number;
  notes?: string;
  createdDate: Date;
}

interface EmergencyContact {
  id: string;
  hospitalId: string;
  type: 'ambulance' | 'emergency_room' | 'icu' | 'trauma_center';
  phone: string;
  description: string;
  available24x7: boolean;
  responseTime: string;
}

interface UserLocation {
  lat: number;
  lng: number;
  address: string;
}

const HospitalServicesSystem: React.FC = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'name'>('distance');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [showHospitalDetails, setShowHospitalDetails] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showEmergencyContacts, setShowEmergencyContacts] = useState(false);
  const [activeTab, setActiveTab] = useState<'directory' | 'appointments' | 'emergency'>('directory');
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  
  const { user } = useAuth();
  const { showNotification } = useNotification();

  // Initialize data
  useEffect(() => {
    loadHospitalData();
    loadEmergencyContacts();
    getCurrentLocation();
  }, []);

  const loadHospitalData = () => {
    // Sample hospital data
    const sampleHospitals: Hospital[] = [
      {
        id: '1',
        name: 'ঢাকা মেডিকেল কলেজ হাসপাতাল',
        type: 'government',
        address: 'বক্সী বাজার, ঢাকা-১০০০',
        location: { lat: 23.7272, lng: 90.3969 },
        phone: '02-55165088',
        emergencyPhone: '02-55165089',
        email: 'info@dmch.gov.bd',
        website: 'www.dmch.gov.bd',
        description: 'দেশের অন্যতম বৃহত্তম সরকারি হাসপাতাল',
        specialties: ['কার্ডিওলজি', 'নিউরোলজি', 'অর্থোপেডিক্স', 'গাইনি', 'পেডিয়াট্রিক্স'],
        services: ['জরুরি চিকিৎসা', 'অপারেশন', 'আইসিইউ', 'ডায়ালাইসিস', 'এক্স-রে', 'ল্যাব টেস্ট'],
        facilities: ['২৪/৭ জরুরি সেবা', 'অ্যাম্বুলেন্স', 'ব্লাড ব্যাংক', 'ফার্মেসি', 'ক্যান্টিন'],
        rating: 4.2,
        reviewCount: 2500,
        distance: 2.5,
        openingHours: {
          'সোমবার': { open: '08:00', close: '20:00' },
          'মঙ্গলবার': { open: '08:00', close: '20:00' },
          'বুধবার': { open: '08:00', close: '20:00' },
          'বৃহস্পতিবার': { open: '08:00', close: '20:00' },
          'শুক্রবার': { open: '08:00', close: '20:00' },
          'শনিবার': { open: '08:00', close: '20:00' },
          'রবিবার': { open: '08:00', close: '20:00' }
        },
        emergencyServices: true,
        ambulanceService: true,
        bedCapacity: 2000,
        availableBeds: 150,
        doctors: [
          {
            id: 'doc1',
            name: 'ডা. আব্দুল করিম',
            specialty: 'কার্ডিওলজি',
            qualification: 'এমবিবিএস, এমডি',
            experience: 15,
            rating: 4.5,
            consultationFee: 800,
            availableSlots: ['09:00', '10:00', '11:00'],
            languages: ['বাংলা', 'ইংরেজি']
          }
        ],
        departments: [
          {
            id: 'dept1',
            name: 'কার্ডিওলজি বিভাগ',
            description: 'হৃদরোগ চিকিৎসা',
            services: ['ইসিজি', 'ইকো', 'এনজিওগ্রাম'],
            doctors: ['doc1'],
            contactPhone: '02-55165090',
            location: '৩য় তলা',
            emergencyAvailable: true
          }
        ],
        verified: true,
        licenseNumber: 'DMCH-2024-001',
        establishedYear: 1946,
        accreditation: ['JCI', 'ISO 9001'],
        insuranceAccepted: ['সরকারি বীমা', 'প্রাইভেট বীমা'],
        languages: ['বাংলা', 'ইংরেজি'],
        parkingAvailable: true,
        wheelchairAccessible: true,
        onlineAppointment: false
      },
      {
        id: '2',
        name: 'স্কয়ার হাসপাতাল',
        type: 'private',
        address: '১৮/এফ বীরউত্তম কাজী নজরুল ইসলাম এভিনিউ, ঢাকা',
        location: { lat: 23.7516, lng: 90.3876 },
        phone: '02-8159457',
        emergencyPhone: '02-9661721',
        email: 'info@squarehospital.com',
        website: 'www.squarehospital.com',
        description: 'আধুনিক সুবিধাসহ বেসরকারি হাসপাতাল',
        specialties: ['কার্ডিয়াক সার্জারি', 'নিউরো সার্জারি', 'ক্যান্সার চিকিৎসা', 'অর্গান ট্রান্সপ্ল্যান্ট'],
        services: ['রোবোটিক সার্জারি', 'পেট স্ক্যান', 'এমআরআই', 'সিটি স্ক্যান', 'ক্যাথ ল্যাব'],
        facilities: ['ভিআইপি রুম', 'আন্তর্জাতিক রোগী সেবা', 'হেলিপ্যাড', 'কনফারেন্স হল'],
        rating: 4.7,
        reviewCount: 1800,
        distance: 3.2,
        openingHours: {
          'সোমবার': { open: '08:00', close: '22:00' },
          'মঙ্গলবার': { open: '08:00', close: '22:00' },
          'বুধবার': { open: '08:00', close: '22:00' },
          'বৃহস্পতিবার': { open: '08:00', close: '22:00' },
          'শুক্রবার': { open: '08:00', close: '22:00' },
          'শনিবার': { open: '08:00', close: '22:00' },
          'রবিবার': { open: '08:00', close: '22:00' }
        },
        emergencyServices: true,
        ambulanceService: true,
        bedCapacity: 650,
        availableBeds: 45,
        doctors: [],
        departments: [],
        verified: true,
        licenseNumber: 'SH-2024-002',
        establishedYear: 2006,
        accreditation: ['JCI', 'NABH', 'ISO 15189'],
        insuranceAccepted: ['সব ধরনের বীমা'],
        languages: ['বাংলা', 'ইংরেজি', 'আরবি'],
        parkingAvailable: true,
        wheelchairAccessible: true,
        onlineAppointment: true
      },
      {
        id: '3',
        name: 'ইউনাইটেড হাসপাতাল',
        type: 'private',
        address: 'গুলশান ২, ঢাকা-১২১২',
        location: { lat: 23.7925, lng: 90.4078 },
        phone: '02-8836444',
        emergencyPhone: '02-8836445',
        email: 'info@uhlbd.com',
        website: 'www.uhlbd.com',
        description: 'উন্নত চিকিৎসা সেবা প্রদানকারী হাসপাতাল',
        specialties: ['হার্ট সার্জারি', 'কিডনি ট্রান্সপ্ল্যান্ট', 'লিভার ট্রান্সপ্ল্যান্ট', 'স্পাইনাল সার্জারি'],
        services: ['ডায়ালাইসিস', 'কেমোথেরাপি', 'রেডিওথেরাপি', 'ফিজিওথেরাপি'],
        facilities: ['আইসিইউ', 'এনআইসিইউ', 'সিসিইউ', 'বার্ন ইউনিট'],
        rating: 4.5,
        reviewCount: 1200,
        distance: 5.8,
        openingHours: {
          'সোমবার': { open: '08:00', close: '20:00' },
          'মঙ্গলবার': { open: '08:00', close: '20:00' },
          'বুধবার': { open: '08:00', close: '20:00' },
          'বৃহস্পতিবার': { open: '08:00', close: '20:00' },
          'শুক্রবার': { open: '08:00', close: '20:00' },
          'শনিবার': { open: '08:00', close: '20:00' },
          'রবিবার': { open: '10:00', close: '18:00' }
        },
        emergencyServices: true,
        ambulanceService: true,
        bedCapacity: 500,
        availableBeds: 30,
        doctors: [],
        departments: [],
        verified: true,
        licenseNumber: 'UH-2024-003',
        establishedYear: 2003,
        accreditation: ['JCI', 'CAP'],
        insuranceAccepted: ['আন্তর্জাতিক বীমা', 'কর্পোরেট বীমা'],
        languages: ['বাংলা', 'ইংরেজি', 'হিন্দি'],
        parkingAvailable: true,
        wheelchairAccessible: true,
        onlineAppointment: true
      },
      {
        id: '4',
        name: 'শিশু হাসপাতাল',
        type: 'specialized',
        address: 'শেরে বাংলা নগর, ঢাকা',
        location: { lat: 23.7693, lng: 90.3563 },
        phone: '02-8181840',
        emergencyPhone: '02-8181841',
        description: 'শিশুদের বিশেষায়িত চিকিৎসা সেবা',
        specialties: ['পেডিয়াট্রিক্স', 'নিওনেটোলজি', 'পেডিয়াট্রিক সার্জারি'],
        services: ['নবজাতক যত্ন', 'শিশু টিকাদান', 'পুষ্টি পরামর্শ'],
        facilities: ['এনআইসিইউ', 'পিআইসিইউ', 'খেলার ঘর'],
        rating: 4.3,
        reviewCount: 950,
        distance: 4.1,
        openingHours: {
          'সোমবার': { open: '08:00', close: '18:00' },
          'মঙ্গলবার': { open: '08:00', close: '18:00' },
          'বুধবার': { open: '08:00', close: '18:00' },
          'বৃহস্পতিবার': { open: '08:00', close: '18:00' },
          'শুক্রবার': { open: '08:00', close: '18:00' },
          'শনিবার': { open: '08:00', close: '18:00' },
          'রবিবার': { closed: true }
        },
        emergencyServices: true,
        ambulanceService: false,
        bedCapacity: 200,
        availableBeds: 25,
        doctors: [],
        departments: [],
        verified: true,
        licenseNumber: 'CH-2024-004',
        establishedYear: 1985,
        accreditation: ['NABH'],
        insuranceAccepted: ['শিশু বীমা'],
        languages: ['বাংলা'],
        parkingAvailable: true,
        wheelchairAccessible: true,
        onlineAppointment: false
      }
    ];

    setHospitals(sampleHospitals);
  };

  const loadEmergencyContacts = () => {
    const sampleEmergencyContacts: EmergencyContact[] = [
      {
        id: '1',
        hospitalId: '1',
        type: 'ambulance',
        phone: '999',
        description: 'জাতীয় জরুরি অ্যাম্বুলেন্স সেবা',
        available24x7: true,
        responseTime: '১০-১৫ মিনিট'
      },
      {
        id: '2',
        hospitalId: '2',
        type: 'emergency_room',
        phone: '02-9661721',
        description: 'স্কয়ার হাসপাতাল জরুরি বিভাগ',
        available24x7: true,
        responseTime: 'তাৎক্ষণিক'
      }
    ];

    setEmergencyContacts(sampleEmergencyContacts);
  };

  const getCurrentLocation = () => {
    setLocationLoading(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: UserLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            address: 'বর্তমান অবস্থান'
          };
          
          setUserLocation(location);
          updateDistances(location);
          setLocationLoading(false);
          showNotification('অবস্থান সফলভাবে নির্ধারণ করা হয়েছে', 'success');
        },
        () => {
          setLocationLoading(false);
          // Use default Dhaka location
          const defaultLocation: UserLocation = {
            lat: 23.8103,
            lng: 90.4125,
            address: 'ঢাকা, বাংলাদেশ (ডিফল্ট)'
          };
          
          setUserLocation(defaultLocation);
          updateDistances(defaultLocation);
          showNotification('ডিফল্ট অবস্থান ব্যবহার করা হচ্ছে', 'info');
        }
      );
    }
  };

  const updateDistances = (location: UserLocation) => {
    setHospitals(prev => 
      prev.map(hospital => ({
        ...hospital,
        distance: calculateDistance(
          location.lat,
          location.lng,
          hospital.location.lat,
          hospital.location.lng
        )
      }))
    );
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Filter and sort hospitals
  const filteredHospitals = hospitals
    .filter(hospital => {
      const matchesSearch = hospital.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           hospital.specialties.some(specialty => specialty.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesType = selectedType === 'all' || hospital.type === selectedType;
      const matchesSpecialty = selectedSpecialty === 'all' || hospital.specialties.includes(selectedSpecialty);
      return matchesSearch && matchesType && matchesSpecialty;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          return (a.distance || 0) - (b.distance || 0);
        case 'rating':
          return b.rating - a.rating;
        default:
          return a.name.localeCompare(b.name);
      }
    });

  // Book appointment
  const bookAppointment = (hospital: Hospital, doctor: Doctor, date: Date, timeSlot: string) => {
    const newAppointment: Appointment = {
      id: `apt-${Date.now()}`,
      hospitalId: hospital.id,
      hospitalName: hospital.name,
      doctorId: doctor.id,
      doctorName: doctor.name,
      patientName: user?.name || 'রোগী',
      patientPhone: '01700000000',
      appointmentDate: date,
      timeSlot,
      department: doctor.specialty,
      reason: 'সাধারণ পরীক্ষা',
      status: 'pending',
      consultationFee: doctor.consultationFee,
      createdDate: new Date()
    };

    setAppointments([newAppointment, ...appointments]);
    setShowAppointmentModal(false);
    showNotification('অ্যাপয়েন্টমেন্ট সফলভাবে বুক করা হয়েছে', 'success');
  };

  // Make emergency call
  const makeEmergencyCall = (contact: EmergencyContact) => {
    window.open(`tel:${contact.phone}`);
    showNotification(`${contact.description} এ কল করা হচ্ছে`, 'info');
  };

  // Get hospital type icon
  const getHospitalTypeIcon = (type: string) => {
    switch (type) {
      case 'government': return <Building className="w-5 h-5 text-blue-600" />;
      case 'private': return <Building2 className="w-5 h-5 text-green-600" />;
      case 'specialized': return <Heart className="w-5 h-5 text-red-600" />;
      case 'clinic': return <Stethoscope className="w-5 h-5 text-purple-600" />;
      default: return <Building2 className="w-5 h-5 text-gray-600" />;
    }
  };

  // Get hospital type name
  const getHospitalTypeName = (type: string) => {
    switch (type) {
      case 'government': return 'সরকারি';
      case 'private': return 'বেসরকারি';
      case 'specialized': return 'বিশেষায়িত';
      case 'clinic': return 'ক্লিনিক';
      default: return type;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">হাসপাতাল সেবা</h1>
                <p className="text-sm text-gray-600">সম্পূর্ণ হাসপাতাল ব্যবস্থাপনা সিস্টেম</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {userLocation && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span className="hidden md:inline">{userLocation.address}</span>
                </div>
              )}
              
              <button
                onClick={getCurrentLocation}
                disabled={locationLoading}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                title="অবস্থান আপডেট করুন"
              >
                <RefreshCw className={`w-5 h-5 ${locationLoading ? 'animate-spin' : ''}`} />
              </button>
              
              <button
                onClick={() => setShowEmergencyContacts(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Truck className="w-4 h-4" />
                <span>জরুরি</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'directory', label: 'হাসপাতাল খুঁজুন', icon: Search },
              { id: 'appointments', label: 'অ্যাপয়েন্টমেন্ট', icon: Calendar, count: appointments.length },
              { id: 'emergency', label: 'জরুরি সেবা', icon: AlertTriangle }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'directory' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="হাসপাতাল বা বিশেষত্ব খুঁজুন..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">সব ধরনের</option>
                    <option value="government">সরকারি</option>
                    <option value="private">বেসরকারি</option>
                    <option value="specialized">বিশেষায়িত</option>
                    <option value="clinic">ক্লিনিক</option>
                  </select>
                  
                  <select
                    value={selectedSpecialty}
                    onChange={(e) => setSelectedSpecialty(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">সব বিশেষত্ব</option>
                    <option value="কার্ডিওলজি">কার্ডিওলজি</option>
                    <option value="নিউরোলজি">নিউরোলজি</option>
                    <option value="অর্থোপেডিক্স">অর্থোপেডিক্স</option>
                    <option value="গাইনি">গাইনি</option>
                    <option value="পেডিয়াট্রিক্স">পেডিয়াট্রিক্স</option>
                  </select>
                  
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="distance">দূরত্ব অনুযায়ী</option>
                    <option value="rating">রেটিং অনুযায়ী</option>
                    <option value="name">নাম অনুযায়ী</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Hospital List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredHospitals.map(hospital => (
                <div key={hospital.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getHospitalTypeIcon(hospital.type)}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{hospital.name}</h3>
                        <p className="text-sm text-gray-600">{getHospitalTypeName(hospital.type)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {hospital.verified && (
                        <CheckCircle className="w-5 h-5 text-green-600" title="যাচাইকৃত" />
                      )}
                      {hospital.emergencyServices && (
                        <AlertTriangle className="w-5 h-5 text-red-600" title="জরুরি সেবা" />
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{hospital.address}</span>
                      {hospital.distance && (
                        <span className="text-blue-600 font-medium">({hospital.distance.toFixed(1)} কিমি)</span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{hospital.phone}</span>
                      {hospital.emergencyPhone && (
                        <span className="text-red-600 font-medium">(জরুরি: {hospital.emergencyPhone})</span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(hospital.rating)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">({hospital.reviewCount} রিভিউ)</span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>বেড: {hospital.availableBeds}/{hospital.bedCapacity}</span>
                      </div>
                      
                      {hospital.ambulanceService && (
                        <div className="flex items-center space-x-1">
                          <Ambulance className="w-4 h-4" />
                          <span>অ্যাম্বুলেন্স</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">বিশেষত্ব:</h4>
                    <div className="flex flex-wrap gap-1">
                      {hospital.specialties.slice(0, 3).map((specialty, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {specialty}
                        </span>
                      ))}
                      {hospital.specialties.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          +{hospital.specialties.length - 3} আরো
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedHospital(hospital);
                        setShowHospitalDetails(true);
                      }}
                      className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                      বিস্তারিত
                    </button>
                    
                    {hospital.onlineAppointment && (
                      <button
                        onClick={() => {
                          setSelectedHospital(hospital);
                          setShowAppointmentModal(true);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        অ্যাপয়েন্টমেন্ট
                      </button>
                    )}
                    
                    <button
                      onClick={() => window.open(`tel:${hospital.phone}`)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      কল করুন
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'appointments' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">আমার অ্যাপয়েন্টমেন্ট</h2>
            
            {appointments.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">কোনো অ্যাপয়েন্টমেন্ট নেই</p>
                <p className="text-sm text-gray-500">নতুন অ্যাপয়েন্টমেন্ট বুক করুন</p>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.map(appointment => (
                  <div key={appointment.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{appointment.doctorName}</h3>
                        <p className="text-sm text-gray-600">{appointment.hospitalName}</p>
                      </div>
                      
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        appointment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {appointment.status === 'pending' ? 'অপেক্ষমান' :
                         appointment.status === 'confirmed' ? 'নিশ্চিত' :
                         appointment.status === 'completed' ? 'সম্পন্ন' : 'বাতিল'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                      <div>
                        <span className="font-medium">তারিখ:</span>
                        <p>{appointment.appointmentDate.toLocaleDateString('bn-BD')}</p>
                      </div>
                      <div>
                        <span className="font-medium">সময়:</span>
                        <p>{appointment.timeSlot}</p>
                      </div>
                      <div>
                        <span className="font-medium">বিভাগ:</span>
                        <p>{appointment.department}</p>
                      </div>
                      <div>
                        <span className="font-medium">ফি:</span>
                        <p>{appointment.consultationFee} ৳</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        <p>কারণ: {appointment.reason}</p>
                        <p>বুকিং: {appointment.createdDate.toLocaleDateString('bn-BD')}</p>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button className="px-3 py-1 text-blue-600 border border-blue-300 rounded hover:bg-blue-50 transition-colors text-sm">
                          পরিবর্তন
                        </button>
                        <button className="px-3 py-1 text-red-600 border border-red-300 rounded hover:bg-red-50 transition-colors text-sm">
                          বাতিল
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'emergency' && (
          <div className="space-y-6">
            {/* Quick Emergency Actions */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                <h2 className="text-xl font-bold text-red-900">জরুরি সেবা</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => window.open('tel:999')}
                  className="flex items-center space-x-3 p-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Phone className="w-6 h-6" />
                  <div className="text-left">
                    <div className="font-bold">৯৯৯</div>
                    <div className="text-sm">জাতীয় জরুরি হটলাইন</div>
                  </div>
                </button>
                
                <button
                  onClick={() => window.open('tel:01713055555')}
                  className="flex items-center space-x-3 p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Truck className="w-6 h-6" />
                  <div className="text-left">
                    <div className="font-bold">অ্যাম্বুলেন্স</div>
                    <div className="text-sm">কোয়ান্টাম ফাউন্ডেশন</div>
                  </div>
                </button>
                
                <button
                  onClick={() => window.open('tel:02-8616384')}
                  className="flex items-center space-x-3 p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Shield className="w-6 h-6" />
                  <div className="text-left">
                    <div className="font-bold">পয়জন কন্ট্রোল</div>
                    <div className="text-sm">বিষক্রিয়া সেবা</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Emergency Hospitals */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">নিকটতম জরুরি হাসপাতাল</h3>
              
              <div className="space-y-4">
                {hospitals.filter(h => h.emergencyServices).slice(0, 3).map(hospital => (
                  <div key={hospital.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-red-600" />
                      </div>
                      
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">{hospital.name}</h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{hospital.distance?.toFixed(1)} কিমি</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Phone className="w-4 h-4" />
                            <span>{hospital.emergencyPhone || hospital.phone}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => window.open(`tel:${hospital.emergencyPhone || hospital.phone}`)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                      >
                        জরুরি কল
                      </button>
                      
                      <button
                        onClick={() => window.open(`https://maps.google.com/?q=${hospital.location.lat},${hospital.location.lng}`)}
                        className="px-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors text-sm"
                      >
                        দিকনির্দেশনা
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hospital Details Modal */}
      {showHospitalDetails && selectedHospital && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] w-full mx-4 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{selectedHospital.name}</h2>
                <button
                  onClick={() => setShowHospitalDetails(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">যোগাযোগের তথ্য</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">ঠিকানা:</span> {selectedHospital.address}</p>
                      <p><span className="font-medium">ফোন:</span> {selectedHospital.phone}</p>
                      {selectedHospital.emergencyPhone && (
                        <p><span className="font-medium">জরুরি ফোন:</span> {selectedHospital.emergencyPhone}</p>
                      )}
                      {selectedHospital.email && (
                        <p><span className="font-medium">ইমেইল:</span> {selectedHospital.email}</p>
                      )}
                      {selectedHospital.website && (
                        <p><span className="font-medium">ওয়েবসাইট:</span> {selectedHospital.website}</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">বিশেষত্ব</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedHospital.specialties.map((specialty, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">সেবাসমূহ</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                      {selectedHospital.services.map((service, index) => (
                        <li key={index}>{service}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">সুবিধাসমূহ</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                      {selectedHospital.facilities.map((facility, index) => (
                        <li key={index}>{facility}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">সময়সূচি</h3>
                    <div className="space-y-1 text-sm">
                      {Object.entries(selectedHospital.openingHours).map(([day, hours]) => (
                        <div key={day} className="flex justify-between">
                          <span className="font-medium">{day}:</span>
                          <span>
                            {hours.closed ? 'বন্ধ' : `${hours.open} - ${hours.close}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">অন্যান্য তথ্য</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">প্রতিষ্ঠিত:</span> {selectedHospital.establishedYear}</p>
                      <p><span className="font-medium">লাইসেন্স:</span> {selectedHospital.licenseNumber}</p>
                      <p><span className="font-medium">বেড ক্ষমতা:</span> {selectedHospital.bedCapacity}</p>
                      <p><span className="font-medium">উপলব্ধ বেড:</span> {selectedHospital.availableBeds}</p>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">রেটিং:</span>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(selectedHospital.rating)
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span>({selectedHospital.reviewCount})</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={() => window.open(`tel:${selectedHospital.phone}`)}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  কল করুন
                </button>
                
                <button
                  onClick={() => window.open(`https://maps.google.com/?q=${selectedHospital.location.lat},${selectedHospital.location.lng}`)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  দিকনির্দেশনা
                </button>
                
                {selectedHospital.onlineAppointment && (
                  <button
                    onClick={() => {
                      setShowHospitalDetails(false);
                      setShowAppointmentModal(true);
                    }}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    অ্যাপয়েন্টমেন্ট বুক করুন
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Appointment Modal */}
      {showAppointmentModal && selectedHospital && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">অ্যাপয়েন্টমেন্ট বুক করুন</h2>
                <button
                  onClick={() => setShowAppointmentModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">হাসপাতাল</label>
                  <input
                    type="text"
                    value={selectedHospital.name}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">বিভাগ</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                      {selectedHospital.specialties.map((specialty, index) => (
                        <option key={index} value={specialty}>{specialty}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ডাক্তার</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option value="">ডাক্তার নির্বাচন করুন</option>
                      {selectedHospital.doctors.map((doctor) => (
                        <option key={doctor.id} value={doctor.id}>
                          {doctor.name} - {doctor.specialty} (ফি: {doctor.consultationFee} ৳)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">তারিখ</label>
                    <input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">সময়</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option value="">সময় নির্বাচন করুন</option>
                      <option value="09:00">সকাল ৯:০০</option>
                      <option value="10:00">সকাল ১০:০০</option>
                      <option value="11:00">সকাল ১১:০০</option>
                      <option value="14:00">দুপুর ২:০০</option>
                      <option value="15:00">বিকাল ৩:০০</option>
                      <option value="16:00">বিকাল ৪:০০</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">রোগীর নাম</label>
                  <input
                    type="text"
                    placeholder="রোগীর পূর্ণ নাম লিখুন"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ফোন নম্বর</label>
                  <input
                    type="tel"
                    placeholder="01XXXXXXXXX"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">সমস্যার বিবরণ</label>
                  <textarea
                    rows={3}
                    placeholder="আপনার সমস্যার সংক্ষিপ্ত বিবরণ লিখুন"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={() => setShowAppointmentModal(false)}
                  className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  বাতিল
                </button>
                
                <button
                  onClick={() => {
                    setShowAppointmentModal(false);
                    showNotification('অ্যাপয়েন্টমেন্ট সফলভাবে বুক করা হয়েছে', 'success');
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  নিশ্চিত করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Contacts Modal */}
      {showEmergencyContacts && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">জরুরি যোগাযোগ</h2>
                <button
                  onClick={() => setShowEmergencyContacts(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                {emergencyContacts.map(contact => (
                  <div key={contact.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{contact.description}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          <span className="flex items-center space-x-1">
                            <Phone className="w-4 h-4" />
                            <span>{contact.phone}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{contact.available24x7 ? '২৪/৭ উপলব্ধ' : 'সীমিত সময়'}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Zap className="w-4 h-4" />
                            <span>প্রতিক্রিয়া: {contact.responseTime}</span>
                          </span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => makeEmergencyCall(contact)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        কল করুন
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HospitalServicesSystem;