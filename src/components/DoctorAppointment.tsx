import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, MapPin, Phone, Star, Search, Filter, Plus, CheckCircle, AlertCircle, Video, MessageSquare } from 'lucide-react';

interface DoctorAppointmentProps {
  language: 'bn' | 'en';
  onClose: () => void;
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  qualification: string;
  experience: number;
  rating: number;
  reviews: number;
  hospital: string;
  address: string;
  phone: string;
  email: string;
  consultationFee: number;
  availableSlots: TimeSlot[];
  image?: string;
  languages: string[];
  about: string;
}

interface TimeSlot {
  id: string;
  date: string;
  time: string;
  available: boolean;
  type: 'in-person' | 'video' | 'phone';
}

interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  type: 'in-person' | 'video' | 'phone';
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  symptoms: string;
  notes?: string;
  fee: number;
  createdAt: string;
}

const DoctorAppointment: React.FC<DoctorAppointmentProps> = ({ language, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1); // 1: Search, 2: Select Doctor, 3: Book Appointment, 4: Confirmation
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [appointmentForm, setAppointmentForm] = useState({
    patientName: '',
    patientPhone: '',
    patientEmail: '',
    symptoms: '',
    notes: ''
  });
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [showMyAppointments, setShowMyAppointments] = useState(false);

  const text = {
    title: language === 'bn' ? 'ডাক্তার অ্যাপয়েন্টমেন্ট' : 'Doctor Appointment',
    subtitle: language === 'bn' ? 'বিশেষজ্ঞ ডাক্তারদের সাথে অ্যাপয়েন্টমেন্ট বুক করুন' : 'Book appointments with specialist doctors',
    searchDoctors: language === 'bn' ? 'ডাক্তার খুঁজুন' : 'Search Doctors',
    selectDoctor: language === 'bn' ? 'ডাক্তার নির্বাচন' : 'Select Doctor',
    bookAppointment: language === 'bn' ? 'অ্যাপয়েন্টমেন্ট বুক করুন' : 'Book Appointment',
    confirmation: language === 'bn' ? 'নিশ্চিতকরণ' : 'Confirmation',
    search: language === 'bn' ? 'ডাক্তার বা বিশেষত্ব খুঁজুন...' : 'Search doctor or specialty...',
    specialty: language === 'bn' ? 'বিশেষত্ব' : 'Specialty',
    all: language === 'bn' ? 'সব' : 'All',
    cardiology: language === 'bn' ? 'হৃদরোগ বিশেষজ্ঞ' : 'Cardiology',
    dermatology: language === 'bn' ? 'চর্মরোগ বিশেষজ্ঞ' : 'Dermatology',
    neurology: language === 'bn' ? 'স্নায়ুরোগ বিশেষজ্ঞ' : 'Neurology',
    orthopedics: language === 'bn' ? 'অর্থোপেডিক্স' : 'Orthopedics',
    pediatrics: language === 'bn' ? 'শিশুরোগ বিশেষজ্ঞ' : 'Pediatrics',
    gynecology: language === 'bn' ? 'স্ত্রীরোগ বিশেষজ্ঞ' : 'Gynecology',
    generalMedicine: language === 'bn' ? 'সাধারণ চিকিৎসা' : 'General Medicine',
    experience: language === 'bn' ? 'অভিজ্ঞতা' : 'Experience',
    years: language === 'bn' ? 'বছর' : 'years',
    rating: language === 'bn' ? 'রেটিং' : 'Rating',
    reviews: language === 'bn' ? 'রিভিউ' : 'reviews',
    consultationFee: language === 'bn' ? 'পরামর্শ ফি' : 'Consultation Fee',
    hospital: language === 'bn' ? 'হাসপাতাল' : 'Hospital',
    address: language === 'bn' ? 'ঠিকানা' : 'Address',
    phone: language === 'bn' ? 'ফোন' : 'Phone',
    email: language === 'bn' ? 'ইমেইল' : 'Email',
    languages: language === 'bn' ? 'ভাষা' : 'Languages',
    about: language === 'bn' ? 'সম্পর্কে' : 'About',
    availableSlots: language === 'bn' ? 'উপলব্ধ সময়' : 'Available Slots',
    selectSlot: language === 'bn' ? 'সময় নির্বাচন করুন' : 'Select Time Slot',
    inPerson: language === 'bn' ? 'সরাসরি দেখা' : 'In-Person',
    videoCall: language === 'bn' ? 'ভিডিও কল' : 'Video Call',
    phoneCall: language === 'bn' ? 'ফোন কল' : 'Phone Call',
    patientName: language === 'bn' ? 'রোগীর নাম' : 'Patient Name',
    patientPhone: language === 'bn' ? 'রোগীর ফোন' : 'Patient Phone',
    patientEmail: language === 'bn' ? 'রোগীর ইমেইল' : 'Patient Email',
    symptoms: language === 'bn' ? 'লক্ষণ' : 'Symptoms',
    notes: language === 'bn' ? 'অতিরিক্ত নোট' : 'Additional Notes',
    bookNow: language === 'bn' ? 'এখনই বুক করুন' : 'Book Now',
    confirmBooking: language === 'bn' ? 'বুকিং নিশ্চিত করুন' : 'Confirm Booking',
    appointmentDetails: language === 'bn' ? 'অ্যাপয়েন্টমেন্টের বিবরণ' : 'Appointment Details',
    date: language === 'bn' ? 'তারিখ' : 'Date',
    time: language === 'bn' ? 'সময়' : 'Time',
    type: language === 'bn' ? 'ধরন' : 'Type',
    fee: language === 'bn' ? 'ফি' : 'Fee',
    status: language === 'bn' ? 'অবস্থা' : 'Status',
    scheduled: language === 'bn' ? 'নির্ধারিত' : 'Scheduled',
    completed: language === 'bn' ? 'সম্পন্ন' : 'Completed',
    cancelled: language === 'bn' ? 'বাতিল' : 'Cancelled',
    rescheduled: language === 'bn' ? 'পুনঃনির্ধারিত' : 'Rescheduled',
    myAppointments: language === 'bn' ? 'আমার অ্যাপয়েন্টমেন্ট' : 'My Appointments',
    viewAppointments: language === 'bn' ? 'অ্যাপয়েন্টমেন্ট দেখুন' : 'View Appointments',
    reschedule: language === 'bn' ? 'পুনঃনির্ধারণ' : 'Reschedule',
    cancel: language === 'bn' ? 'বাতিল' : 'Cancel',
    back: language === 'bn' ? 'পিছনে' : 'Back',
    next: language === 'bn' ? 'পরবর্তী' : 'Next',
    close: language === 'bn' ? 'বন্ধ করুন' : 'Close',
    noResults: language === 'bn' ? 'কোন ফলাফল পাওয়া যায়নি' : 'No results found',
    noAppointments: language === 'bn' ? 'কোন অ্যাপয়েন্টমেন্ট নেই' : 'No appointments found',
    appointmentBooked: language === 'bn' ? 'অ্যাপয়েন্টমেন্ট সফলভাবে বুক হয়েছে!' : 'Appointment booked successfully!',
    fillAllFields: language === 'bn' ? 'সব ক্ষেত্র পূরণ করুন' : 'Please fill all required fields'
  };

  const sampleDoctors: Doctor[] = [
    {
      id: '1',
      name: 'Dr. Ahmed Rahman',
      specialty: 'Cardiology',
      qualification: 'MBBS, MD (Cardiology)',
      experience: 15,
      rating: 4.8,
      reviews: 120,
      hospital: 'Square Hospital',
      address: 'Panthapath, Dhaka',
      phone: '+880-1700-000001',
      email: 'ahmed.rahman@hospital.com',
      consultationFee: 1500,
      languages: ['Bengali', 'English'],
      about: language === 'bn' 
        ? 'হৃদরোগের চিকিৎসায় ১৫ বছরের অভিজ্ঞতা সম্পন্ন বিশেষজ্ঞ ডাক্তার।'
        : 'Experienced cardiologist with 15 years of expertise in heart disease treatment.',
      availableSlots: [
        { id: '1', date: '2024-01-15', time: '10:00 AM', available: true, type: 'in-person' },
        { id: '2', date: '2024-01-15', time: '11:00 AM', available: true, type: 'video' },
        { id: '3', date: '2024-01-16', time: '2:00 PM', available: true, type: 'in-person' },
        { id: '4', date: '2024-01-16', time: '3:00 PM', available: true, type: 'phone' }
      ]
    },
    {
      id: '2',
      name: 'Dr. Fatima Khatun',
      specialty: 'Dermatology',
      qualification: 'MBBS, DDV (Dermatology)',
      experience: 12,
      rating: 4.7,
      reviews: 95,
      hospital: 'United Hospital',
      address: 'Gulshan, Dhaka',
      phone: '+880-1800-000002',
      email: 'fatima.khatun@hospital.com',
      consultationFee: 1200,
      languages: ['Bengali', 'English', 'Hindi'],
      about: language === 'bn'
        ? 'চর্মরোগ ও কসমেটিক চিকিৎসায় দক্ষ বিশেষজ্ঞ।'
        : 'Specialist in dermatology and cosmetic treatments.',
      availableSlots: [
        { id: '5', date: '2024-01-15', time: '9:00 AM', available: true, type: 'in-person' },
        { id: '6', date: '2024-01-15', time: '4:00 PM', available: true, type: 'video' },
        { id: '7', date: '2024-01-17', time: '11:00 AM', available: true, type: 'in-person' }
      ]
    },
    {
      id: '3',
      name: 'Dr. Mohammad Ali',
      specialty: 'Neurology',
      qualification: 'MBBS, MD (Neurology)',
      experience: 18,
      rating: 4.9,
      reviews: 150,
      hospital: 'Apollo Hospital',
      address: 'Bashundhara, Dhaka',
      phone: '+880-1900-000003',
      email: 'mohammad.ali@hospital.com',
      consultationFee: 2000,
      languages: ['Bengali', 'English'],
      about: language === 'bn'
        ? 'স্নায়ুরোগের চিকিৎসায় অভিজ্ঞ ও দক্ষ বিশেষজ্ঞ।'
        : 'Expert neurologist with extensive experience in treating neurological disorders.',
      availableSlots: [
        { id: '8', date: '2024-01-16', time: '10:00 AM', available: true, type: 'in-person' },
        { id: '9', date: '2024-01-16', time: '5:00 PM', available: true, type: 'video' },
        { id: '10', date: '2024-01-18', time: '9:00 AM', available: true, type: 'in-person' }
      ]
    }
  ];

  useEffect(() => {
    const saved = localStorage.getItem('doctorAppointments');
    if (saved) {
      setAppointments(JSON.parse(saved));
    }
  }, []);

  const filteredDoctors = sampleDoctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doctor.hospital.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'all' || 
                            doctor.specialty.toLowerCase() === selectedSpecialty.toLowerCase();
    return matchesSearch && matchesSpecialty;
  });

  const bookAppointment = () => {
    if (!selectedDoctor || !selectedSlot || !appointmentForm.patientName || !appointmentForm.patientPhone) {
      alert(text.fillAllFields);
      return;
    }

    const newAppointment: Appointment = {
      id: Date.now().toString(),
      doctorId: selectedDoctor.id,
      doctorName: selectedDoctor.name,
      specialty: selectedDoctor.specialty,
      date: selectedSlot.date,
      time: selectedSlot.time,
      type: selectedSlot.type,
      status: 'scheduled',
      patientName: appointmentForm.patientName,
      patientPhone: appointmentForm.patientPhone,
      patientEmail: appointmentForm.patientEmail,
      symptoms: appointmentForm.symptoms,
      notes: appointmentForm.notes,
      fee: selectedDoctor.consultationFee,
      createdAt: new Date().toISOString()
    };

    const updatedAppointments = [newAppointment, ...appointments];
    setAppointments(updatedAppointments);
    localStorage.setItem('doctorAppointments', JSON.stringify(updatedAppointments));

    setCurrentStep(4);
  };

  const getAppointmentTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'phone': return <Phone className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      case 'rescheduled': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const renderSearchStep = () => (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
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
          value={selectedSpecialty}
          onChange={(e) => setSelectedSpecialty(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">{text.all}</option>
          <option value="cardiology">{text.cardiology}</option>
          <option value="dermatology">{text.dermatology}</option>
          <option value="neurology">{text.neurology}</option>
          <option value="orthopedics">{text.orthopedics}</option>
          <option value="pediatrics">{text.pediatrics}</option>
          <option value="gynecology">{text.gynecology}</option>
          <option value="general medicine">{text.generalMedicine}</option>
        </select>
      </div>

      {/* Doctors List */}
      {filteredDoctors.length === 0 ? (
        <div className="text-center py-12">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">{text.noResults}</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredDoctors.map((doctor) => (
            <div key={doctor.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-800">{doctor.name}</h3>
                      <p className="text-blue-600 font-medium">{doctor.specialty}</p>
                      <p className="text-sm text-gray-600">{doctor.qualification}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                        <span>{doctor.experience} {text.years} {text.experience}</span>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span>{doctor.rating} ({doctor.reviews} {text.reviews})</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>{doctor.hospital}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>{doctor.address}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{doctor.phone}</span>
                      </div>
                      <div className="text-lg font-bold text-green-600">
                        ৳{doctor.consultationFee} {text.consultationFee}
                      </div>
                    </div>
                  </div>
                  
                  <p className="mt-3 text-gray-600">{doctor.about}</p>
                  
                  <div className="mt-3">
                    <span className="text-sm text-gray-600">{text.languages}: </span>
                    <span className="text-sm font-medium">{doctor.languages.join(', ')}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => {
                    setSelectedDoctor(doctor);
                    setCurrentStep(2);
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {text.bookNow}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderDoctorDetails = () => {
    if (!selectedDoctor) return null;

    return (
      <div className="space-y-6">
        {/* Doctor Info */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-start space-x-4">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-800">{selectedDoctor.name}</h3>
              <p className="text-blue-600 font-medium text-lg">{selectedDoctor.specialty}</p>
              <p className="text-gray-600">{selectedDoctor.qualification}</p>
              <div className="flex items-center space-x-4 mt-2">
                <span className="text-sm text-gray-600">{selectedDoctor.experience} {text.years} {text.experience}</span>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm">{selectedDoctor.rating} ({selectedDoctor.reviews} {text.reviews})</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">৳{selectedDoctor.consultationFee}</div>
              <div className="text-sm text-gray-600">{text.consultationFee}</div>
            </div>
          </div>
        </div>

        {/* Available Slots */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">{text.availableSlots}</h4>
          <div className="grid gap-3">
            {selectedDoctor.availableSlots.map((slot) => (
              <button
                key={slot.id}
                onClick={() => setSelectedSlot(slot)}
                disabled={!slot.available}
                className={`p-4 border-2 rounded-lg transition-colors text-left ${
                  selectedSlot?.id === slot.id
                    ? 'border-blue-500 bg-blue-50'
                    : slot.available
                    ? 'border-gray-200 hover:border-gray-300'
                    : 'border-gray-100 bg-gray-50 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-600" />
                    <div>
                      <div className="font-medium">{slot.date}</div>
                      <div className="text-sm text-gray-600">{slot.time}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getAppointmentTypeIcon(slot.type)}
                    <span className="text-sm capitalize">
                      {slot.type === 'in-person' ? text.inPerson : 
                       slot.type === 'video' ? text.videoCall : text.phoneCall}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderBookingForm = () => (
    <div className="space-y-6">
      {/* Selected Appointment Summary */}
      {selectedDoctor && selectedSlot && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">{text.appointmentDetails}</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-blue-600">{text.date}:</span>
              <span className="ml-2 font-medium">{selectedSlot.date}</span>
            </div>
            <div>
              <span className="text-blue-600">{text.time}:</span>
              <span className="ml-2 font-medium">{selectedSlot.time}</span>
            </div>
            <div>
              <span className="text-blue-600">{text.type}:</span>
              <span className="ml-2 font-medium capitalize">
                {selectedSlot.type === 'in-person' ? text.inPerson : 
                 selectedSlot.type === 'video' ? text.videoCall : text.phoneCall}
              </span>
            </div>
            <div>
              <span className="text-blue-600">{text.fee}:</span>
              <span className="ml-2 font-medium">৳{selectedDoctor.consultationFee}</span>
            </div>
          </div>
        </div>
      )}

      {/* Patient Information Form */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">
          {language === 'bn' ? 'রোগীর তথ্য' : 'Patient Information'}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{text.patientName} *</label>
            <input
              type="text"
              value={appointmentForm.patientName}
              onChange={(e) => setAppointmentForm({...appointmentForm, patientName: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={language === 'bn' ? 'রোগীর পূর্ণ নাম' : 'Patient full name'}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{text.patientPhone} *</label>
            <input
              type="tel"
              value={appointmentForm.patientPhone}
              onChange={(e) => setAppointmentForm({...appointmentForm, patientPhone: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="+880-1700-000000"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">{text.patientEmail}</label>
            <input
              type="email"
              value={appointmentForm.patientEmail}
              onChange={(e) => setAppointmentForm({...appointmentForm, patientEmail: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="patient@email.com"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">{text.symptoms}</label>
            <textarea
              value={appointmentForm.symptoms}
              onChange={(e) => setAppointmentForm({...appointmentForm, symptoms: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={language === 'bn' ? 'আপনার লক্ষণগুলি বর্ণনা করুন...' : 'Describe your symptoms...'}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">{text.notes}</label>
            <textarea
              value={appointmentForm.notes}
              onChange={(e) => setAppointmentForm({...appointmentForm, notes: e.target.value})}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={language === 'bn' ? 'অতিরিক্ত কোন তথ্য...' : 'Any additional information...'}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderConfirmation = () => (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="w-12 h-12 text-green-600" />
      </div>
      <div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">{text.appointmentBooked}</h3>
        <p className="text-gray-600">
          {language === 'bn' 
            ? 'আপনার অ্যাপয়েন্টমেন্ট সফলভাবে বুক হয়েছে। ডাক্তার বা হাসপাতাল থেকে শীঘ্রই যোগাযোগ করা হবে।'
            : 'Your appointment has been successfully booked. You will be contacted by the doctor or hospital soon.'}
        </p>
      </div>
      
      {selectedDoctor && selectedSlot && (
        <div className="bg-gray-50 rounded-lg p-6 text-left max-w-md mx-auto">
          <h4 className="font-semibold text-gray-800 mb-4">{text.appointmentDetails}</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Doctor:</span>
              <span className="font-medium">{selectedDoctor.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{text.specialty}:</span>
              <span className="font-medium">{selectedDoctor.specialty}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{text.date}:</span>
              <span className="font-medium">{selectedSlot.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{text.time}:</span>
              <span className="font-medium">{selectedSlot.time}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{text.type}:</span>
              <span className="font-medium capitalize">
                {selectedSlot.type === 'in-person' ? text.inPerson : 
                 selectedSlot.type === 'video' ? text.videoCall : text.phoneCall}
              </span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-gray-600">{text.fee}:</span>
              <span className="font-bold text-green-600">৳{selectedDoctor.consultationFee}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderMyAppointments = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">{text.myAppointments}</h3>
        <button
          onClick={() => setShowMyAppointments(false)}
          className="text-blue-600 hover:text-blue-700"
        >
          {text.back}
        </button>
      </div>
      
      {appointments.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">{text.noAppointments}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-semibold text-gray-800">{appointment.doctorName}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                      {text[appointment.status as keyof typeof text] || appointment.status}
                    </span>
                  </div>
                  <p className="text-blue-600 mb-2">{appointment.specialty}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{appointment.date}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{appointment.time}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {getAppointmentTypeIcon(appointment.type)}
                      <span className="capitalize">
                        {appointment.type === 'in-person' ? text.inPerson : 
                         appointment.type === 'video' ? text.videoCall : text.phoneCall}
                      </span>
                    </div>
                    <div className="font-medium text-green-600">
                      ৳{appointment.fee}
                    </div>
                  </div>
                  {appointment.symptoms && (
                    <div className="mt-3">
                      <span className="text-sm font-medium text-gray-700">{text.symptoms}: </span>
                      <span className="text-sm text-gray-600">{appointment.symptoms}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Calendar className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">{text.title}</h2>
                <p className="text-blue-100">{text.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowMyAppointments(!showMyAppointments)}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg px-3 py-2 transition-colors"
              >
                {text.viewAppointments}
              </button>
              <button
                onClick={onClose}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
          
          {/* Progress Steps */}
          {!showMyAppointments && (
            <div className="flex items-center justify-center mt-6 space-x-4">
              {[
                { step: 1, label: text.searchDoctors },
                { step: 2, label: text.selectDoctor },
                { step: 3, label: text.bookAppointment },
                { step: 4, label: text.confirmation }
              ].map((step, index) => (
                <div key={step.step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step.step ? 'bg-white text-blue-600' : 'bg-blue-500 text-white'
                  }`}>
                    {currentStep > step.step ? <CheckCircle className="w-4 h-4" /> : step.step}
                  </div>
                  {index < 3 && (
                    <div className={`w-12 h-1 mx-2 ${
                      currentStep > step.step ? 'bg-white' : 'bg-blue-500'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {showMyAppointments ? renderMyAppointments() :
           currentStep === 1 ? renderSearchStep() :
           currentStep === 2 ? renderDoctorDetails() :
           currentStep === 3 ? renderBookingForm() :
           renderConfirmation()}
        </div>

        {/* Footer */}
        {!showMyAppointments && (
          <div className="bg-gray-50 px-6 py-4 flex justify-between">
            <button
              onClick={() => {
                if (currentStep === 1) {
                  onClose();
                } else {
                  setCurrentStep(currentStep - 1);
                }
              }}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              {currentStep === 1 ? text.close : text.back}
            </button>
            
            {currentStep === 2 && selectedSlot && (
              <button
                onClick={() => setCurrentStep(3)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {text.next}
              </button>
            )}
            
            {currentStep === 3 && (
              <button
                onClick={bookAppointment}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                {text.confirmBooking}
              </button>
            )}
            
            {currentStep === 4 && (
              <button
                onClick={onClose}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {text.close}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorAppointment;