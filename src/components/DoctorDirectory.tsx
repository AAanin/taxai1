import React, { useState, useMemo } from 'react';
import { Search, MapPin, Phone, Mail, Star, Clock, Calendar, User, Stethoscope, Filter, X } from 'lucide-react';
import { Doctor, DoctorSearch, Language } from '../types';

interface DoctorDirectoryProps {
  language: Language;
  onBookAppointment: (doctor: Doctor) => void;
}

// Sample doctor data
const sampleDoctors: Doctor[] = [
  {
    id: '1',
    name: 'ডা. মোহাম্মদ রহিম',
    nameEn: 'Dr. Mohammad Rahim',
    specialty: 'হৃদরোগ বিশেষজ্ঞ',
    specialtyEn: 'Cardiologist',
    qualifications: ['MBBS', 'MD (Cardiology)', 'FCPS'],
    experience: 15,
    hospital: 'ঢাকা মেডিকেল কলেজ হাসপাতাল',
    hospitalEn: 'Dhaka Medical College Hospital',
    address: 'বক্সী বাজার, ঢাকা',
    addressEn: 'Bakshi Bazar, Dhaka',
    phone: '+880-1711-123456',
    email: 'dr.rahim@dmch.gov.bd',
    consultationFee: 1500,
    availableDays: ['রবিবার', 'মঙ্গলবার', 'বৃহস্পতিবার'],
    availableTime: 'সকাল ৯টা - দুপুর ১টা',
    rating: 4.8,
    totalReviews: 245,
    languages: ['বাংলা', 'ইংরেজি'],
    chamberLocation: 'ল্যাবএইড হাসপাতাল, ধানমন্ডি',
    onlineConsultation: true
  },
  {
    id: '2',
    name: 'ডা. ফাতেমা খাতুন',
    nameEn: 'Dr. Fatema Khatun',
    specialty: 'স্ত্রীরোগ ও প্রসূতি বিশেষজ্ঞ',
    specialtyEn: 'Gynecologist & Obstetrician',
    qualifications: ['MBBS', 'FCPS (Gynecology)', 'MS'],
    experience: 12,
    hospital: 'বঙ্গবন্ধু শেখ মুজিব মেডিকেল বিশ্ববিদ্যালয়',
    hospitalEn: 'Bangabandhu Sheikh Mujib Medical University',
    address: 'শাহবাগ, ঢাকা',
    addressEn: 'Shahbag, Dhaka',
    phone: '+880-1712-234567',
    email: 'dr.fatema@bsmmu.edu.bd',
    consultationFee: 1200,
    availableDays: ['সোমবার', 'বুধবার', 'শুক্রবার'],
    availableTime: 'বিকাল ৩টা - সন্ধ্যা ৭টা',
    rating: 4.9,
    totalReviews: 189,
    languages: ['বাংলা', 'ইংরেজি'],
    chamberLocation: 'আদ-দিন হাসপাতাল, মগবাজার',
    onlineConsultation: true
  },
  {
    id: '3',
    name: 'ডা. আহমেদ হাসান',
    nameEn: 'Dr. Ahmed Hasan',
    specialty: 'শিশু বিশেষজ্ঞ',
    specialtyEn: 'Pediatrician',
    qualifications: ['MBBS', 'DCH', 'FCPS (Pediatrics)'],
    experience: 8,
    hospital: 'শিশু হাসপাতাল ও ইনস্টিটিউট',
    hospitalEn: 'Shishu Hospital & Institute',
    address: 'আগারগাঁও, ঢাকা',
    addressEn: 'Agargaon, Dhaka',
    phone: '+880-1713-345678',
    consultationFee: 800,
    availableDays: ['সোমবার', 'মঙ্গলবার', 'বৃহস্পতিবার', 'শনিবার'],
    availableTime: 'সকাল ১০টা - দুপুর ২টা',
    rating: 4.7,
    totalReviews: 156,
    languages: ['বাংলা', 'ইংরেজি'],
    chamberLocation: 'ইউনাইটেড হাসপাতাল, গুলশান',
    onlineConsultation: false
  }
];

const DoctorDirectory: React.FC<DoctorDirectoryProps> = ({ language, onBookAppointment }) => {
  const [searchParams, setSearchParams] = useState<DoctorSearch>({
    query: '',
    specialty: '',
    location: '',
    consultationFee: undefined,
    rating: undefined,
    availableToday: false,
    onlineConsultation: false
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  const specialties = [
    { bn: 'হৃদরোগ বিশেষজ্ঞ', en: 'Cardiologist' },
    { bn: 'স্ত্রীরোগ ও প্রসূতি বিশেষজ্ঞ', en: 'Gynecologist & Obstetrician' },
    { bn: 'শিশু বিশেষজ্ঞ', en: 'Pediatrician' },
    { bn: 'অর্থোপেডিক সার্জন', en: 'Orthopedic Surgeon' },
    { bn: 'নিউরোলজিস্ট', en: 'Neurologist' },
    { bn: 'চর্মরোগ বিশেষজ্ঞ', en: 'Dermatologist' }
  ];

  const filteredDoctors = useMemo(() => {
    return sampleDoctors.filter(doctor => {
      const nameMatch = searchParams.query === '' || 
        doctor.name.toLowerCase().includes(searchParams.query.toLowerCase()) ||
        doctor.nameEn.toLowerCase().includes(searchParams.query.toLowerCase());
      
      const specialtyMatch = searchParams.specialty === '' ||
        doctor.specialty === searchParams.specialty ||
        doctor.specialtyEn === searchParams.specialty;
      
      const locationMatch = searchParams.location === '' ||
        doctor.address.toLowerCase().includes(searchParams.location.toLowerCase()) ||
        doctor.addressEn.toLowerCase().includes(searchParams.location.toLowerCase());
      
      const feeMatch = !searchParams.consultationFee ||
        (doctor.consultationFee >= searchParams.consultationFee.min &&
         doctor.consultationFee <= searchParams.consultationFee.max);
      
      const ratingMatch = !searchParams.rating || doctor.rating >= searchParams.rating;
      
      const onlineMatch = !searchParams.onlineConsultation || doctor.onlineConsultation;
      
      return nameMatch && specialtyMatch && locationMatch && feeMatch && ratingMatch && onlineMatch;
    });
  }, [searchParams]);

  const handleSearch = (field: keyof DoctorSearch, value: any) => {
    setSearchParams(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setSearchParams({
      query: '',
      specialty: '',
      location: '',
      consultationFee: undefined,
      rating: undefined,
      availableToday: false,
      onlineConsultation: false
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {language === 'bn' ? 'ডাক্তার ডিরেক্টরি' : 'Doctor Directory'}
        </h1>
        <p className="text-gray-600">
          {language === 'bn' 
            ? 'আপনার প্রয়োজনীয় ডাক্তার খুঁজে নিন এবং অ্যাপয়েন্টমেন্ট বুক করুন'
            : 'Find the right doctor for you and book an appointment'
          }
        </p>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-gradient-to-br from-white via-blue-50 to-indigo-50 rounded-2xl shadow-xl border border-blue-100 p-8 mb-8">
        <div className="flex flex-col gap-6 mb-6">
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-400 group-focus-within:text-blue-600 transition-colors" />
            <input
              type="text"
              placeholder={language === 'bn' ? 'ডাক্তারের নাম বা বিশেষত্ব খুঁজুন...' : 'Search doctor name or specialty...'}
              className="w-full pl-12 pr-4 py-4 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl text-gray-700 placeholder-gray-400"
              value={searchParams.query}
              onChange={(e) => handleSearch('query', e.target.value)}
            />
          </div>
        </div>

        {/* Filter Options - Always Visible */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Filter className="w-5 h-5 text-blue-600" />
            {language === 'bn' ? 'ফিল্টার অপশন' : 'Filter Options'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-xl border-2 border-blue-200 shadow-inner">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-blue-600" />
                {language === 'bn' ? 'বিশেষত্ব' : 'Specialty'}
              </label>
              <select
                className="w-full p-3 border-2 border-blue-200 rounded-lg focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 bg-white/90 backdrop-blur-sm shadow-md hover:shadow-lg text-gray-700"
                value={searchParams.specialty}
                onChange={(e) => handleSearch('specialty', e.target.value)}
              >
                <option value="">{language === 'bn' ? 'সব বিশেষত্ব' : 'All Specialties'}</option>
                {specialties.map((specialty, index) => (
                  <option key={index} value={language === 'bn' ? specialty.bn : specialty.en}>
                    {language === 'bn' ? specialty.bn : specialty.en}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-green-600" />
                {language === 'bn' ? 'এলাকা' : 'Location'}
              </label>
              <input
                type="text"
                placeholder={language === 'bn' ? 'এলাকার নাম' : 'Location name'}
                className="w-full p-3 border-2 border-blue-200 rounded-lg focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 bg-white/90 backdrop-blur-sm shadow-md hover:shadow-lg text-gray-700 placeholder-gray-400"
                value={searchParams.location}
                onChange={(e) => handleSearch('location', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                {language === 'bn' ? 'সর্বনিম্ন রেটিং' : 'Minimum Rating'}
              </label>
              <select
                className="w-full p-3 border-2 border-blue-200 rounded-lg focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 bg-white/90 backdrop-blur-sm shadow-md hover:shadow-lg text-gray-700"
                value={searchParams.rating || ''}
                onChange={(e) => handleSearch('rating', e.target.value ? parseFloat(e.target.value) : undefined)}
              >
                <option value="">{language === 'bn' ? 'যেকোনো রেটিং' : 'Any Rating'}</option>
                <option value="4.5">4.5+ ⭐</option>
                <option value="4.0">4.0+ ⭐</option>
                <option value="3.5">3.5+ ⭐</option>
              </select>
            </div>

            <div className="flex flex-col space-y-4">
              <label className="flex items-center p-3 bg-white/70 rounded-lg border-2 border-blue-200 hover:bg-white/90 transition-all duration-300 cursor-pointer group">
                <input
                  type="checkbox"
                  className="mr-3 w-4 h-4 text-blue-600 border-2 border-blue-300 rounded focus:ring-blue-500 focus:ring-2"
                  checked={searchParams.onlineConsultation}
                  onChange={(e) => handleSearch('onlineConsultation', e.target.checked)}
                />
                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700 transition-colors">{language === 'bn' ? 'অনলাইন পরামর্শ' : 'Online Consultation'}</span>
              </label>
              <button
                onClick={clearFilters}
                className="flex items-center justify-center gap-2 p-3 text-sm font-medium text-red-600 hover:text-white bg-red-50 hover:bg-red-500 border-2 border-red-200 hover:border-red-500 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <X className="w-4 h-4" />
                {language === 'bn' ? 'ক্লিয়ার' : 'Clear'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredDoctors.map((doctor) => (
          <div key={doctor.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Stethoscope className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-800">
                    {language === 'bn' ? doctor.name : doctor.nameEn}
                  </h3>
                  <p className="text-blue-600 text-sm">
                    {language === 'bn' ? doctor.specialty : doctor.specialtyEn}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                {renderStars(doctor.rating)}
                <span className="text-sm text-gray-600 ml-1">({doctor.totalReviews})</span>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <User className="w-4 h-4 mr-2" />
                <span>{doctor.experience} {language === 'bn' ? 'বছরের অভিজ্ঞতা' : 'years experience'}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-2" />
                <span>{language === 'bn' ? doctor.hospital : doctor.hospitalEn}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="w-4 h-4 mr-2" />
                <span>{doctor.phone}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-2" />
                <span>{doctor.availableTime}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div>
                <span className="text-lg font-semibold text-green-600">৳{doctor.consultationFee}</span>
                <span className="text-sm text-gray-500 ml-1">
                  {language === 'bn' ? 'পরামর্শ ফি' : 'Consultation Fee'}
                </span>
              </div>
              <button
                onClick={() => onBookAppointment(doctor)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                {language === 'bn' ? 'অ্যাপয়েন্টমেন্ট' : 'Book Appointment'}
              </button>
            </div>

            {doctor.onlineConsultation && (
              <div className="mt-2">
                <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  {language === 'bn' ? 'অনলাইন পরামর্শ উপলব্ধ' : 'Online Consultation Available'}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredDoctors.length === 0 && (
        <div className="text-center py-12">
          <Stethoscope className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-500 mb-2">
            {language === 'bn' ? 'কোনো ডাক্তার পাওয়া যায়নি' : 'No doctors found'}
          </h3>
          <p className="text-gray-400">
            {language === 'bn' 
              ? 'অনুসন্ধানের শর্ত পরিবর্তন করে আবার চেষ্টা করুন'
              : 'Try adjusting your search criteria'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default DoctorDirectory;