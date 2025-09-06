import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Save, X, User, Phone, Mail, MapPin, Stethoscope, Calendar, Award } from 'lucide-react';

interface Doctor {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  qualification: string;
  experience: number;
  hospital: string;
  address: string;
  consultationFee: number;
  availability: string;
  status: 'active' | 'inactive';
  joinDate: string;
}

interface DoctorManagementProps {
  language: 'en' | 'bn';
}

const DoctorManagement: React.FC<DoctorManagementProps> = ({ language }) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingDoctor, setIsAddingDoctor] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filterSpecialization, setFilterSpecialization] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  const translations = {
    en: {
      title: 'Doctor Management',
      addDoctor: 'Add New Doctor',
      search: 'Search doctors...',
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      specialization: 'Specialization',
      qualification: 'Qualification',
      experience: 'Experience (Years)',
      hospital: 'Hospital',
      address: 'Address',
      consultationFee: 'Consultation Fee (৳)',
      availability: 'Availability',
      status: 'Status',
      joinDate: 'Join Date',
      actions: 'Actions',
      edit: 'Edit',
      delete: 'Delete',
      save: 'Save',
      cancel: 'Cancel',
      active: 'Active',
      inactive: 'Inactive',
      all: 'All',
      filterBySpecialization: 'Filter by Specialization',
      filterByStatus: 'Filter by Status',
      confirmDelete: 'Are you sure you want to delete this doctor?',
      doctorAdded: 'Doctor added successfully!',
      doctorUpdated: 'Doctor updated successfully!',
      doctorDeleted: 'Doctor deleted successfully!',
      noResults: 'No doctors found',
      page: 'Page',
      of: 'of',
      showing: 'Showing',
      to: 'to',
      entries: 'entries'
    },
    bn: {
      title: 'ডাক্তার ম্যানেজমেন্ট',
      addDoctor: 'নতুন ডাক্তার যোগ করুন',
      search: 'ডাক্তার খুঁজুন...',
      name: 'নাম',
      email: 'ইমেইল',
      phone: 'ফোন',
      specialization: 'বিশেষত্ব',
      qualification: 'যোগ্যতা',
      experience: 'অভিজ্ঞতা (বছর)',
      hospital: 'হাসপাতাল',
      address: 'ঠিকানা',
      consultationFee: 'পরামর্শ ফি (৳)',
      availability: 'সময়সূচী',
      status: 'অবস্থা',
      joinDate: 'যোগদানের তারিখ',
      actions: 'কার্যক্রম',
      edit: 'সম্পাদনা',
      delete: 'মুছুন',
      save: 'সংরক্ষণ',
      cancel: 'বাতিল',
      active: 'সক্রিয়',
      inactive: 'নিষ্ক্রিয়',
      all: 'সব',
      filterBySpecialization: 'বিশেষত্ব অনুযায়ী ফিল্টার',
      filterByStatus: 'অবস্থা অনুযায়ী ফিল্টার',
      confirmDelete: 'আপনি কি নিশ্চিত এই ডাক্তারকে মুছে ফেলতে চান?',
      doctorAdded: 'ডাক্তার সফলভাবে যোগ করা হয়েছে!',
      doctorUpdated: 'ডাক্তারের তথ্য সফলভাবে আপডেট করা হয়েছে!',
      doctorDeleted: 'ডাক্তার সফলভাবে মুছে ফেলা হয়েছে!',
      noResults: 'কোন ডাক্তার পাওয়া যায়নি',
      page: 'পৃষ্ঠা',
      of: 'এর',
      showing: 'দেখানো হচ্ছে',
      to: 'থেকে',
      entries: 'এন্ট্রি'
    }
  };

  const t = translations[language];

  const specializations = [
    'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Gynecology',
    'Dermatology', 'Psychiatry', 'Oncology', 'Gastroenterology', 'Endocrinology',
    'Pulmonology', 'Nephrology', 'Ophthalmology', 'ENT', 'General Medicine'
  ];

  // Load doctors from localStorage on component mount
  useEffect(() => {
    const savedDoctors = localStorage.getItem('doctors');
    if (savedDoctors) {
      setDoctors(JSON.parse(savedDoctors));
    } else {
      // Initialize with sample data
      const sampleDoctors: Doctor[] = [
        {
          id: '1',
          name: 'Dr. Ahmed Rahman',
          email: 'ahmed.rahman@hospital.com',
          phone: '+8801712345678',
          specialization: 'Cardiology',
          qualification: 'MBBS, MD (Cardiology)',
          experience: 15,
          hospital: 'Dhaka Medical College Hospital',
          address: 'Dhaka, Bangladesh',
          consultationFee: 1500,
          availability: 'Mon-Fri: 9AM-5PM',
          status: 'active',
          joinDate: '2020-01-15'
        },
        {
          id: '2',
          name: 'Dr. Fatima Khatun',
          email: 'fatima.khatun@hospital.com',
          phone: '+8801812345678',
          specialization: 'Pediatrics',
          qualification: 'MBBS, DCH',
          experience: 10,
          hospital: 'Bangabandhu Sheikh Mujib Medical University',
          address: 'Dhaka, Bangladesh',
          consultationFee: 1200,
          availability: 'Sat-Thu: 10AM-6PM',
          status: 'active',
          joinDate: '2021-03-20'
        }
      ];
      setDoctors(sampleDoctors);
      localStorage.setItem('doctors', JSON.stringify(sampleDoctors));
    }
  }, []);

  // Save doctors to localStorage whenever doctors array changes
  useEffect(() => {
    localStorage.setItem('doctors', JSON.stringify(doctors));
  }, [doctors]);

  const [newDoctor, setNewDoctor] = useState<Omit<Doctor, 'id'>>({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    qualification: '',
    experience: 0,
    hospital: '',
    address: '',
    consultationFee: 0,
    availability: '',
    status: 'active',
    joinDate: new Date().toISOString().split('T')[0]
  });

  // Filter and search logic
  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.hospital.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSpecialization = filterSpecialization === '' || doctor.specialization === filterSpecialization;
    const matchesStatus = filterStatus === 'all' || doctor.status === filterStatus;
    
    return matchesSearch && matchesSpecialization && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredDoctors.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDoctors = filteredDoctors.slice(startIndex, endIndex);

  const handleAddDoctor = () => {
    if (newDoctor.name && newDoctor.email && newDoctor.phone && newDoctor.specialization) {
      const doctor: Doctor = {
        ...newDoctor,
        id: Date.now().toString()
      };
      setDoctors([...doctors, doctor]);
      setNewDoctor({
        name: '',
        email: '',
        phone: '',
        specialization: '',
        qualification: '',
        experience: 0,
        hospital: '',
        address: '',
        consultationFee: 0,
        availability: '',
        status: 'active',
        joinDate: new Date().toISOString().split('T')[0]
      });
      setIsAddingDoctor(false);
      alert(t.doctorAdded);
    }
  };

  const handleEditDoctor = (doctor: Doctor) => {
    setEditingDoctor({ ...doctor });
  };

  const handleUpdateDoctor = () => {
    if (editingDoctor) {
      setDoctors(doctors.map(d => d.id === editingDoctor.id ? editingDoctor : d));
      setEditingDoctor(null);
      alert(t.doctorUpdated);
    }
  };

  const handleDeleteDoctor = (id: string) => {
    if (window.confirm(t.confirmDelete)) {
      setDoctors(doctors.filter(d => d.id !== id));
      alert(t.doctorDeleted);
    }
  };

  const DoctorForm = ({ doctor, onChange, isEditing = false }: {
    doctor: Omit<Doctor, 'id'> | Doctor;
    onChange: (field: string, value: any) => void;
    isEditing?: boolean;
  }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-gray-50 rounded-lg">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <User className="inline w-4 h-4 mr-1" />
          {t.name} *
        </label>
        <input
          type="text"
          value={doctor.name}
          onChange={(e) => onChange('name', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <Mail className="inline w-4 h-4 mr-1" />
          {t.email} *
        </label>
        <input
          type="email"
          value={doctor.email}
          onChange={(e) => onChange('email', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <Phone className="inline w-4 h-4 mr-1" />
          {t.phone} *
        </label>
        <input
          type="tel"
          value={doctor.phone}
          onChange={(e) => onChange('phone', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <Stethoscope className="inline w-4 h-4 mr-1" />
          {t.specialization} *
        </label>
        <select
          value={doctor.specialization}
          onChange={(e) => onChange('specialization', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        >
          <option value="">{t.specialization}</option>
          {specializations.map(spec => (
            <option key={spec} value={spec}>{spec}</option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <Award className="inline w-4 h-4 mr-1" />
          {t.qualification}
        </label>
        <input
          type="text"
          value={doctor.qualification}
          onChange={(e) => onChange('qualification', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t.experience}
        </label>
        <input
          type="number"
          value={doctor.experience}
          onChange={(e) => onChange('experience', parseInt(e.target.value) || 0)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          min="0"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t.hospital}
        </label>
        <input
          type="text"
          value={doctor.hospital}
          onChange={(e) => onChange('hospital', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <MapPin className="inline w-4 h-4 mr-1" />
          {t.address}
        </label>
        <input
          type="text"
          value={doctor.address}
          onChange={(e) => onChange('address', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t.consultationFee}
        </label>
        <input
          type="number"
          value={doctor.consultationFee}
          onChange={(e) => onChange('consultationFee', parseInt(e.target.value) || 0)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          min="0"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t.availability}
        </label>
        <input
          type="text"
          value={doctor.availability}
          onChange={(e) => onChange('availability', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g., Mon-Fri: 9AM-5PM"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t.status}
        </label>
        <select
          value={doctor.status}
          onChange={(e) => onChange('status', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="active">{t.active}</option>
          <option value="inactive">{t.inactive}</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <Calendar className="inline w-4 h-4 mr-1" />
          {t.joinDate}
        </label>
        <input
          type="date"
          value={doctor.joinDate}
          onChange={(e) => onChange('joinDate', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">{t.title}</h1>
        <button
          onClick={() => setIsAddingDoctor(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t.addDoctor}
        </button>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder={t.search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <select
          value={filterSpecialization}
          onChange={(e) => setFilterSpecialization(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">{t.filterBySpecialization}</option>
          {specializations.map(spec => (
            <option key={spec} value={spec}>{spec}</option>
          ))}
        </select>
        
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">{t.all}</option>
          <option value="active">{t.active}</option>
          <option value="inactive">{t.inactive}</option>
        </select>
      </div>

      {/* Add Doctor Form */}
      {isAddingDoctor && (
        <div className="mb-6 bg-white rounded-lg shadow-md">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">{t.addDoctor}</h2>
          </div>
          <DoctorForm
            doctor={newDoctor}
            onChange={(field, value) => setNewDoctor({ ...newDoctor, [field]: value })}
          />
          <div className="p-4 border-t border-gray-200 flex gap-2">
            <button
              onClick={handleAddDoctor}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Save className="w-4 h-4" />
              {t.save}
            </button>
            <button
              onClick={() => setIsAddingDoctor(false)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <X className="w-4 h-4" />
              {t.cancel}
            </button>
          </div>
        </div>
      )}

      {/* Edit Doctor Form */}
      {editingDoctor && (
        <div className="mb-6 bg-white rounded-lg shadow-md">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">{t.edit} - {editingDoctor.name}</h2>
          </div>
          <DoctorForm
            doctor={editingDoctor}
            onChange={(field, value) => setEditingDoctor({ ...editingDoctor, [field]: value })}
            isEditing={true}
          />
          <div className="p-4 border-t border-gray-200 flex gap-2">
            <button
              onClick={handleUpdateDoctor}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Save className="w-4 h-4" />
              {t.save}
            </button>
            <button
              onClick={() => setEditingDoctor(null)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <X className="w-4 h-4" />
              {t.cancel}
            </button>
          </div>
        </div>
      )}

      {/* Doctors Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.name}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.specialization}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.hospital}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.experience}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.consultationFee}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.status}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentDoctors.length > 0 ? (
                currentDoctors.map((doctor) => (
                  <tr key={doctor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{doctor.name}</div>
                        <div className="text-sm text-gray-500">{doctor.email}</div>
                        <div className="text-sm text-gray-500">{doctor.phone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{doctor.specialization}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{doctor.hospital}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{doctor.experience} years</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">৳{doctor.consultationFee}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        doctor.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {doctor.status === 'active' ? t.active : t.inactive}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditDoctor(doctor)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                          title={t.edit}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteDoctor(doctor.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                          title={t.delete}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    {t.noResults}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    {t.showing} <span className="font-medium">{startIndex + 1}</span> {t.to}{' '}
                    <span className="font-medium">{Math.min(endIndex, filteredDoctors.length)}</span> {t.of}{' '}
                    <span className="font-medium">{filteredDoctors.length}</span> {t.entries}
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === currentPage
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorManagement;