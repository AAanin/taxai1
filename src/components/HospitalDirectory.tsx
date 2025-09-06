import React, { useState, useEffect } from 'react';
import { X, Building, MapPin, Phone, Clock, Star, Search, Filter, Navigation, Heart, Users, Stethoscope, Truck, Car, Bus } from 'lucide-react';

interface HospitalDirectoryProps {
  language: 'bn' | 'en';
  onClose: () => void;
}

interface Hospital {
  id: string;
  name: string;
  type: 'government' | 'private' | 'specialized';
  category: string;
  address: string;
  area: string;
  city: string;
  phone: string;
  emergency: string;
  email?: string;
  website?: string;
  rating: number;
  reviews: number;
  distance?: number; // in km
  services: string[];
  departments: string[];
  facilities: string[];
  doctors: number;
  beds: number;
  established: number;
  coordinates?: { lat: number; lng: number };
  operatingHours: {
    weekdays: string;
    weekends: string;
    emergency: string;
  };
  insurance: string[];
  ambulanceService: boolean;
  parkingAvailable: boolean;
  publicTransport: string[];
}

const HospitalDirectory: React.FC<HospitalDirectoryProps> = ({ language, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedArea, setSelectedArea] = useState('all');
  const [sortBy, setSortBy] = useState('distance');
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const text = {
    title: language === 'bn' ? 'হাসপাতাল ডিরেক্টরি' : 'Hospital Directory',
    subtitle: language === 'bn' ? 'নিকটস্থ হাসপাতাল ও স্বাস্থ্যসেবা কেন্দ্র খুঁজুন' : 'Find nearby hospitals and healthcare centers',
    search: language === 'bn' ? 'হাসপাতাল বা সেবা খুঁজুন...' : 'Search hospital or service...',
    type: language === 'bn' ? 'ধরন' : 'Type',
    area: language === 'bn' ? 'এলাকা' : 'Area',
    sortBy: language === 'bn' ? 'সাজান' : 'Sort By',
    all: language === 'bn' ? 'সব' : 'All',
    government: language === 'bn' ? 'সরকারি' : 'Government',
    private: language === 'bn' ? 'বেসরকারি' : 'Private',
    specialized: language === 'bn' ? 'বিশেষায়িত' : 'Specialized',
    distance: language === 'bn' ? 'দূরত্ব' : 'Distance',
    rating: language === 'bn' ? 'রেটিং' : 'Rating',
    name: language === 'bn' ? 'নাম' : 'Name',
    address: language === 'bn' ? 'ঠিকানা' : 'Address',
    phone: language === 'bn' ? 'ফোন' : 'Phone',
    emergency: language === 'bn' ? 'জরুরি' : 'Emergency',
    email: language === 'bn' ? 'ইমেইল' : 'Email',
    website: language === 'bn' ? 'ওয়েবসাইট' : 'Website',
    reviews: language === 'bn' ? 'রিভিউ' : 'Reviews',
    km: language === 'bn' ? 'কিমি' : 'km',
    away: language === 'bn' ? 'দূরে' : 'away',
    services: language === 'bn' ? 'সেবাসমূহ' : 'Services',
    departments: language === 'bn' ? 'বিভাগসমূহ' : 'Departments',
    facilities: language === 'bn' ? 'সুবিধাসমূহ' : 'Facilities',
    doctors: language === 'bn' ? 'ডাক্তার' : 'Doctors',
    beds: language === 'bn' ? 'বেড' : 'Beds',
    established: language === 'bn' ? 'প্রতিষ্ঠিত' : 'Established',
    operatingHours: language === 'bn' ? 'সময়সূচি' : 'Operating Hours',
    weekdays: language === 'bn' ? 'সপ্তাহের দিন' : 'Weekdays',
    weekends: language === 'bn' ? 'সপ্তাহান্তে' : 'Weekends',
    emergency24: language === 'bn' ? 'জরুরি ২৪ ঘন্টা' : 'Emergency 24/7',
    insurance: language === 'bn' ? 'বীমা গ্রহণযোগ্য' : 'Insurance Accepted',
    ambulance: language === 'bn' ? 'অ্যাম্বুলেন্স সেবা' : 'Ambulance Service',
    parking: language === 'bn' ? 'পার্কিং সুবিধা' : 'Parking Available',
    publicTransport: language === 'bn' ? 'পাবলিক ট্রান্সপোর্ট' : 'Public Transport',
    getDirections: language === 'bn' ? 'দিকনির্দেশনা পান' : 'Get Directions',
    callNow: language === 'bn' ? 'এখনই কল করুন' : 'Call Now',
    viewDetails: language === 'bn' ? 'বিস্তারিত দেখুন' : 'View Details',
    back: language === 'bn' ? 'পিছনে' : 'Back',
    close: language === 'bn' ? 'বন্ধ করুন' : 'Close',
    noResults: language === 'bn' ? 'কোন ফলাফল পাওয়া যায়নি' : 'No results found',
    locationPermission: language === 'bn' ? 'অবস্থানের অনুমতি দিন' : 'Enable Location',
    generalHospital: language === 'bn' ? 'সাধারণ হাসপাতাল' : 'General Hospital',
    medicalCollege: language === 'bn' ? 'মেডিকেল কলেজ' : 'Medical College',
    specializedCenter: language === 'bn' ? 'বিশেষায়িত কেন্দ্র' : 'Specialized Center',
    clinic: language === 'bn' ? 'ক্লিনিক' : 'Clinic',
    diagnosticCenter: language === 'bn' ? 'ডায়াগনস্টিক সেন্টার' : 'Diagnostic Center'
  };

  const sampleHospitals: Hospital[] = [
    {
      id: '1',
      name: 'Dhaka Medical College Hospital',
      type: 'government',
      category: 'Medical College',
      address: 'Secretariat Road, Ramna, Dhaka-1000',
      area: 'Ramna',
      city: 'Dhaka',
      phone: '+880-2-9661064',
      emergency: '+880-2-9661065',
      email: 'info@dmch.gov.bd',
      website: 'www.dmch.gov.bd',
      rating: 4.2,
      reviews: 850,
      distance: 2.5,
      services: [
        language === 'bn' ? 'জরুরি সেবা' : 'Emergency Care',
        language === 'bn' ? 'অস্ত্রোপচার' : 'Surgery',
        language === 'bn' ? 'আইসিইউ' : 'ICU',
        language === 'bn' ? 'ক্যান্সার চিকিৎসা' : 'Cancer Treatment',
        language === 'bn' ? 'হৃদরোগ চিকিৎসা' : 'Cardiology'
      ],
      departments: [
        language === 'bn' ? 'সাধারণ চিকিৎসা' : 'General Medicine',
        language === 'bn' ? 'অস্ত্রোপচার' : 'Surgery',
        language === 'bn' ? 'স্ত্রীরোগ' : 'Gynecology',
        language === 'bn' ? 'শিশুরোগ' : 'Pediatrics',
        language === 'bn' ? 'অর্থোপেডিক্স' : 'Orthopedics'
      ],
      facilities: [
        language === 'bn' ? 'এক্স-রে' : 'X-Ray',
        language === 'bn' ? 'এমআরআই' : 'MRI',
        language === 'bn' ? 'সিটি স্ক্যান' : 'CT Scan',
        language === 'bn' ? 'ল্যাবরেটরি' : 'Laboratory',
        language === 'bn' ? 'ফার্মেসি' : 'Pharmacy'
      ],
      doctors: 450,
      beds: 1200,
      established: 1946,
      operatingHours: {
        weekdays: '8:00 AM - 8:00 PM',
        weekends: '8:00 AM - 6:00 PM',
        emergency: '24/7'
      },
      insurance: ['Government Health Scheme', 'BRAC Insurance', 'Pragati Insurance'],
      ambulanceService: true,
      parkingAvailable: true,
      publicTransport: ['Bus', 'CNG', 'Rickshaw']
    },
    {
      id: '2',
      name: 'Square Hospital',
      type: 'private',
      category: 'General Hospital',
      address: '18/F, Bir Uttam Qazi Nuruzzaman Sarak, West Panthapath, Dhaka-1205',
      area: 'Panthapath',
      city: 'Dhaka',
      phone: '+880-2-8159457',
      emergency: '+880-2-8159458',
      email: 'info@squarehospital.com',
      website: 'www.squarehospital.com',
      rating: 4.7,
      reviews: 1200,
      distance: 1.8,
      services: [
        language === 'bn' ? 'জরুরি সেবা' : 'Emergency Care',
        language === 'bn' ? 'হার্ট সার্জারি' : 'Heart Surgery',
        language === 'bn' ? 'নিউরো সার্জারি' : 'Neuro Surgery',
        language === 'bn' ? 'ক্যান্সার চিকিৎসা' : 'Cancer Treatment',
        language === 'bn' ? 'কিডনি ট্রান্সপ্লান্ট' : 'Kidney Transplant'
      ],
      departments: [
        language === 'bn' ? 'হৃদরোগ' : 'Cardiology',
        language === 'bn' ? 'স্নায়ুরোগ' : 'Neurology',
        language === 'bn' ? 'অনকোলজি' : 'Oncology',
        language === 'bn' ? 'নেফ্রোলজি' : 'Nephrology',
        language === 'bn' ? 'গ্যাস্ট্রোএন্টেরোলজি' : 'Gastroenterology'
      ],
      facilities: [
        language === 'bn' ? 'আধুনিক আইসিইউ' : 'Modern ICU',
        language === 'bn' ? 'ক্যাথ ল্যাব' : 'Cath Lab',
        language === 'bn' ? 'এমআরআই' : 'MRI',
        language === 'bn' ? 'সিটি স্ক্যান' : 'CT Scan',
        language === 'bn' ? '২৪ ঘন্টা ল্যাব' : '24 Hour Lab'
      ],
      doctors: 200,
      beds: 350,
      established: 2006,
      operatingHours: {
        weekdays: '24/7',
        weekends: '24/7',
        emergency: '24/7'
      },
      insurance: ['Meghna Insurance', 'Delta Life Insurance', 'Pragati Insurance', 'Green Delta Insurance'],
      ambulanceService: true,
      parkingAvailable: true,
      publicTransport: ['Bus', 'Metro Rail', 'CNG']
    },
    {
      id: '3',
      name: 'United Hospital',
      type: 'private',
      category: 'General Hospital',
      address: 'Plot 15, Road 71, Gulshan-2, Dhaka-1212',
      area: 'Gulshan',
      city: 'Dhaka',
      phone: '+880-2-8836000',
      emergency: '+880-2-8836444',
      email: 'info@uhlbd.com',
      website: 'www.uhlbd.com',
      rating: 4.6,
      reviews: 980,
      distance: 3.2,
      services: [
        language === 'bn' ? 'জরুরি সেবা' : 'Emergency Care',
        language === 'bn' ? 'রোবোটিক সার্জারি' : 'Robotic Surgery',
        language === 'bn' ? 'ট্রান্সপ্লান্ট সার্জারি' : 'Transplant Surgery',
        language === 'bn' ? 'আইভিএফ' : 'IVF',
        language === 'bn' ? 'কসমেটিক সার্জারি' : 'Cosmetic Surgery'
      ],
      departments: [
        language === 'bn' ? 'কার্ডিওভাসকুলার' : 'Cardiovascular',
        language === 'bn' ? 'নিউরোসায়েন্স' : 'Neuroscience',
        language === 'bn' ? 'অর্থোপেডিক্স' : 'Orthopedics',
        language === 'bn' ? 'ইউরোলজি' : 'Urology',
        language === 'bn' ? 'প্লাস্টিক সার্জারি' : 'Plastic Surgery'
      ],
      facilities: [
        language === 'bn' ? 'হাইব্রিড অপারেটিং রুম' : 'Hybrid Operating Room',
        language === 'bn' ? 'পেট স্ক্যান' : 'PET Scan',
        language === 'bn' ? 'লিনিয়ার এক্সিলারেটর' : 'Linear Accelerator',
        language === 'bn' ? 'হেলিপ্যাড' : 'Helipad',
        language === 'bn' ? 'ভিআইপি রুম' : 'VIP Rooms'
      ],
      doctors: 180,
      beds: 420,
      established: 2006,
      operatingHours: {
        weekdays: '24/7',
        weekends: '24/7',
        emergency: '24/7'
      },
      insurance: ['Meghna Insurance', 'Eastland Insurance', 'Popular Insurance', 'Reliance Insurance'],
      ambulanceService: true,
      parkingAvailable: true,
      publicTransport: ['Bus', 'CNG', 'Uber/Pathao']
    },
    {
      id: '4',
      name: 'National Institute of Cardiovascular Diseases (NICVD)',
      type: 'specialized',
      category: 'Specialized Center',
      address: 'Sher-E-Bangla Nagar, Dhaka-1207',
      area: 'Sher-E-Bangla Nagar',
      city: 'Dhaka',
      phone: '+880-2-9122334',
      emergency: '+880-2-9122335',
      email: 'info@nicvd.gov.bd',
      website: 'www.nicvd.gov.bd',
      rating: 4.4,
      reviews: 650,
      distance: 4.1,
      services: [
        language === 'bn' ? 'হার্ট সার্জারি' : 'Heart Surgery',
        language === 'bn' ? 'এনজিওপ্লাস্টি' : 'Angioplasty',
        language === 'bn' ? 'পেসমেকার' : 'Pacemaker',
        language === 'bn' ? 'ইকোকার্ডিওগ্রাম' : 'Echocardiogram',
        language === 'bn' ? 'হার্ট ট্রান্সপ্লান্ট' : 'Heart Transplant'
      ],
      departments: [
        language === 'bn' ? 'ইন্টারভেনশনাল কার্ডিওলজি' : 'Interventional Cardiology',
        language === 'bn' ? 'কার্ডিয়াক সার্জারি' : 'Cardiac Surgery',
        language === 'bn' ? 'পেডিয়াট্রিক কার্ডিওলজি' : 'Pediatric Cardiology',
        language === 'bn' ? 'ইলেক্ট্রোফিজিওলজি' : 'Electrophysiology'
      ],
      facilities: [
        language === 'bn' ? 'ক্যাথ ল্যাব' : 'Cath Lab',
        language === 'bn' ? 'কার্ডিয়াক আইসিইউ' : 'Cardiac ICU',
        language === 'bn' ? 'ইকো ল্যাব' : 'Echo Lab',
        language === 'bn' ? 'হার্ট সার্জারি ইউনিট' : 'Heart Surgery Unit'
      ],
      doctors: 85,
      beds: 250,
      established: 1998,
      operatingHours: {
        weekdays: '8:00 AM - 8:00 PM',
        weekends: '8:00 AM - 2:00 PM',
        emergency: '24/7'
      },
      insurance: ['Government Health Scheme', 'BRAC Insurance'],
      ambulanceService: true,
      parkingAvailable: true,
      publicTransport: ['Bus', 'CNG']
    },
    {
      id: '5',
      name: 'Apollo Hospitals Dhaka',
      type: 'private',
      category: 'General Hospital',
      address: 'Plot 81, Block E, Bashundhara R/A, Dhaka-1229',
      area: 'Bashundhara',
      city: 'Dhaka',
      phone: '+880-2-8401661',
      emergency: '+880-2-8401662',
      email: 'info@apollodhaka.com',
      website: 'www.apollodhaka.com',
      rating: 4.5,
      reviews: 750,
      distance: 5.8,
      services: [
        language === 'bn' ? 'জরুরি সেবা' : 'Emergency Care',
        language === 'bn' ? 'ক্যান্সার চিকিৎসা' : 'Cancer Treatment',
        language === 'bn' ? 'অর্গান ট্রান্সপ্লান্ট' : 'Organ Transplant',
        language === 'bn' ? 'রোবোটিক সার্জারি' : 'Robotic Surgery',
        language === 'bn' ? 'স্টেম সেল থেরাপি' : 'Stem Cell Therapy'
      ],
      departments: [
        language === 'bn' ? 'অনকোলজি' : 'Oncology',
        language === 'bn' ? 'ট্রান্সপ্লান্ট' : 'Transplant',
        language === 'bn' ? 'নিউরোসার্জারি' : 'Neurosurgery',
        language === 'bn' ? 'কার্ডিওলজি' : 'Cardiology',
        language === 'bn' ? 'গ্যাস্ট্রোএন্টেরোলজি' : 'Gastroenterology'
      ],
      facilities: [
        language === 'bn' ? 'সাইবার নাইফ' : 'Cyber Knife',
        language === 'bn' ? 'পেট সিটি' : 'PET CT',
        language === 'bn' ? 'ডা ভিঞ্চি রোবট' : 'Da Vinci Robot',
        language === 'bn' ? 'বোন ম্যারো ট্রান্সপ্লান্ট ইউনিট' : 'Bone Marrow Transplant Unit'
      ],
      doctors: 150,
      beds: 370,
      established: 2005,
      operatingHours: {
        weekdays: '24/7',
        weekends: '24/7',
        emergency: '24/7'
      },
      insurance: ['Apollo Munich', 'Meghna Insurance', 'Green Delta Insurance'],
      ambulanceService: true,
      parkingAvailable: true,
      publicTransport: ['Bus', 'CNG']
    }
  ];

  useEffect(() => {
    // Request user location for distance calculation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied:', error);
        }
      );
    }
  }, []);

  const filteredHospitals = sampleHospitals.filter(hospital => {
    const matchesSearch = hospital.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         hospital.services.some(service => service.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         hospital.departments.some(dept => dept.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         hospital.area.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = selectedType === 'all' || hospital.type === selectedType;
    const matchesArea = selectedArea === 'all' || hospital.area.toLowerCase().includes(selectedArea.toLowerCase());
    
    return matchesSearch && matchesType && matchesArea;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'distance':
        return (a.distance || 0) - (b.distance || 0);
      case 'rating':
        return b.rating - a.rating;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  const getDirections = (hospital: Hospital) => {
    const address = encodeURIComponent(hospital.address);
    const url = `https://www.google.com/maps/dir/?api=1&destination=${address}`;
    window.open(url, '_blank');
  };

  const callHospital = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const renderHospitalCard = (hospital: Hospital) => (
    <div key={hospital.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-start space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-800">{hospital.name}</h3>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  hospital.type === 'government' ? 'bg-green-100 text-green-700' :
                  hospital.type === 'private' ? 'bg-blue-100 text-blue-700' :
                  'bg-purple-100 text-purple-700'
                }`}>
                  {text[hospital.type as keyof typeof text]}
                </span>
                <span className="text-sm text-gray-600">{hospital.category}</span>
              </div>
              <div className="flex items-center space-x-4 mt-2">
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium">{hospital.rating}</span>
                  <span className="text-sm text-gray-600">({hospital.reviews} {text.reviews})</span>
                </div>
                {hospital.distance && (
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{hospital.distance} {text.km} {text.away}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="space-y-3 mb-4">
        <div className="flex items-start space-x-2">
          <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
          <span className="text-sm text-gray-600">{hospital.address}</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center space-x-2">
            <Phone className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">{hospital.phone}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Truck className="w-4 h-4 text-red-500" />
            <span className="text-gray-600">{hospital.emergency}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">{hospital.doctors} {text.doctors}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Heart className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">{hospital.beds} {text.beds}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">
            {text.emergency24}: {hospital.operatingHours.emergency}
          </span>
        </div>
      </div>
      
      {/* Key Services */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">{text.services}:</h4>
        <div className="flex flex-wrap gap-1">
          {hospital.services.slice(0, 3).map((service, index) => (
            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
              {service}
            </span>
          ))}
          {hospital.services.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
              +{hospital.services.length - 3} {language === 'bn' ? 'আরো' : 'more'}
            </span>
          )}
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => callHospital(hospital.phone)}
          className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
        >
          <Phone className="w-4 h-4" />
          <span>{text.callNow}</span>
        </button>
        <button
          onClick={() => getDirections(hospital)}
          className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          <Navigation className="w-4 h-4" />
          <span>{text.getDirections}</span>
        </button>
        <button
          onClick={() => {
            setSelectedHospital(hospital);
            setShowDetails(true);
          }}
          className="flex items-center space-x-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
        >
          <Building className="w-4 h-4" />
          <span>{text.viewDetails}</span>
        </button>
      </div>
    </div>
  );

  const renderHospitalDetails = () => {
    if (!selectedHospital) return null;

    return (
      <div className="space-y-6">
        {/* Hospital Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-6">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <Building className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold">{selectedHospital.name}</h3>
              <p className="text-blue-100">{selectedHospital.category}</p>
              <div className="flex items-center space-x-4 mt-2">
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span>{selectedHospital.rating} ({selectedHospital.reviews} {text.reviews})</span>
                </div>
                <span className="text-blue-100">{text.established}: {selectedHospital.established}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">
            {language === 'bn' ? 'যোগাযোগের তথ্য' : 'Contact Information'}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="font-medium text-gray-800">{text.address}</div>
                  <div className="text-gray-600">{selectedHospital.address}</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="font-medium text-gray-800">{text.phone}</div>
                  <div className="text-gray-600">{selectedHospital.phone}</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Truck className="w-5 h-5 text-red-500" />
                <div>
                  <div className="font-medium text-gray-800">{text.emergency}</div>
                  <div className="text-gray-600">{selectedHospital.emergency}</div>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              {selectedHospital.email && (
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 text-gray-400">@</div>
                  <div>
                    <div className="font-medium text-gray-800">{text.email}</div>
                    <div className="text-gray-600">{selectedHospital.email}</div>
                  </div>
                </div>
              )}
              {selectedHospital.website && (
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 text-gray-400">🌐</div>
                  <div>
                    <div className="font-medium text-gray-800">{text.website}</div>
                    <div className="text-blue-600">{selectedHospital.website}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Operating Hours */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">{text.operatingHours}</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-gray-400" />
              <div>
                <div className="font-medium text-gray-800">{text.weekdays}</div>
                <div className="text-gray-600">{selectedHospital.operatingHours.weekdays}</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-gray-400" />
              <div>
                <div className="font-medium text-gray-800">{text.weekends}</div>
                <div className="text-gray-600">{selectedHospital.operatingHours.weekends}</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Truck className="w-5 h-5 text-red-500" />
              <div>
                <div className="font-medium text-gray-800">{text.emergency24}</div>
                <div className="text-gray-600">{selectedHospital.operatingHours.emergency}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Services & Departments */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">{text.services}</h4>
            <div className="space-y-2">
              {selectedHospital.services.map((service, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Stethoscope className="w-4 h-4 text-blue-500" />
                  <span className="text-gray-700">{service}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">{text.departments}</h4>
            <div className="space-y-2">
              {selectedHospital.departments.map((dept, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-green-500" />
                  <span className="text-gray-700">{dept}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Facilities & Additional Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">{text.facilities}</h4>
            <div className="space-y-2">
              {selectedHospital.facilities.map((facility, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span className="text-gray-700">{facility}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">
              {language === 'bn' ? 'অতিরিক্ত তথ্য' : 'Additional Information'}
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">{text.doctors}:</span>
                <span className="font-medium">{selectedHospital.doctors}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">{text.beds}:</span>
                <span className="font-medium">{selectedHospital.beds}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">{text.ambulance}:</span>
                <span className={`font-medium ${
                  selectedHospital.ambulanceService ? 'text-green-600' : 'text-red-600'
                }`}>
                  {selectedHospital.ambulanceService ? 
                    (language === 'bn' ? 'উপলব্ধ' : 'Available') : 
                    (language === 'bn' ? 'উপলব্ধ নয়' : 'Not Available')
                  }
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">{text.parking}:</span>
                <span className={`font-medium ${
                  selectedHospital.parkingAvailable ? 'text-green-600' : 'text-red-600'
                }`}>
                  {selectedHospital.parkingAvailable ? 
                    (language === 'bn' ? 'উপলব্ধ' : 'Available') : 
                    (language === 'bn' ? 'উপলব্ধ নয়' : 'Not Available')
                  }
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Insurance & Transport */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">{text.insurance}</h4>
            <div className="space-y-2">
              {selectedHospital.insurance.map((ins, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span className="text-gray-700">{ins}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">{text.publicTransport}</h4>
            <div className="space-y-2">
              {selectedHospital.publicTransport.map((transport, index) => (
                <div key={index} className="flex items-center space-x-2">
                  {transport.toLowerCase().includes('bus') && <Bus className="w-4 h-4 text-blue-500" />}
                  {transport.toLowerCase().includes('cng') && <Car className="w-4 h-4 text-yellow-500" />}
                  {!transport.toLowerCase().includes('bus') && !transport.toLowerCase().includes('cng') && 
                   <div className="w-4 h-4 bg-gray-400 rounded-full" />}
                  <span className="text-gray-700">{transport}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Building className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">{text.title}</h2>
                <p className="text-green-100">{text.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {showDetails && (
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg px-3 py-2 transition-colors"
                >
                  {text.back}
                </button>
              )}
              <button
                onClick={onClose}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {showDetails ? renderHospitalDetails() : (
            <div className="space-y-6">
              {/* Search and Filters */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder={text.search}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">{text.all} {text.type}</option>
                    <option value="government">{text.government}</option>
                    <option value="private">{text.private}</option>
                    <option value="specialized">{text.specialized}</option>
                  </select>
                  <select
                    value={selectedArea}
                    onChange={(e) => setSelectedArea(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">{text.all} {text.area}</option>
                    <option value="dhanmondi">Dhanmondi</option>
                    <option value="gulshan">Gulshan</option>
                    <option value="uttara">Uttara</option>
                    <option value="bashundhara">Bashundhara</option>
                    <option value="ramna">Ramna</option>
                  </select>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="distance">{text.sortBy} {text.distance}</option>
                    <option value="rating">{text.sortBy} {text.rating}</option>
                    <option value="name">{text.sortBy} {text.name}</option>
                  </select>
                </div>
              </div>

              {/* Results */}
              {filteredHospitals.length === 0 ? (
                <div className="text-center py-12">
                  <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">{text.noResults}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {filteredHospitals.length} {language === 'bn' ? 'টি হাসপাতাল পাওয়া গেছে' : 'hospitals found'}
                    </h3>
                    {!userLocation && (
                      <button
                        onClick={() => window.location.reload()}
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        {text.locationPermission}
                      </button>
                    )}
                  </div>
                  
                  <div className="grid gap-6">
                    {filteredHospitals.map(renderHospitalCard)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HospitalDirectory;