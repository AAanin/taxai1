import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Eye, Filter, Download, Upload, MapPin, Phone, Clock, Star } from 'lucide-react';

interface Hospital {
  id: string;
  name: string;
  nameEn: string;
  address: string;
  district: string;
  division: string;
  phone: string;
  email: string;
  website: string;
  type: 'government' | 'private' | 'specialized';
  category: string;
  bedCount: number;
  doctorCount: number;
  emergencyService: boolean;
  ambulanceService: boolean;
  rating: number;
  establishedYear: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const HospitalManagement: React.FC = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([
    {
      id: '1',
      name: 'ঢাকা মেডিকেল কলেজ হাসপাতাল',
      nameEn: 'Dhaka Medical College Hospital',
      address: 'বক্সী বাজার, ঢাকা',
      district: 'ঢাকা',
      division: 'ঢাকা',
      phone: '+880-2-8626812',
      email: 'info@dmch.gov.bd',
      website: 'www.dmch.gov.bd',
      type: 'government',
      category: 'General Hospital',
      bedCount: 2600,
      doctorCount: 450,
      emergencyService: true,
      ambulanceService: true,
      rating: 4.2,
      establishedYear: 1946,
      isActive: true,
      createdAt: '2024-01-15',
      updatedAt: '2024-01-20'
    },
    {
      id: '2',
      name: 'স্কয়ার হাসপাতাল',
      nameEn: 'Square Hospital',
      address: 'পান্থপথ, ঢাকা',
      district: 'ঢাকা',
      division: 'ঢাকা',
      phone: '+880-2-8159457',
      email: 'info@squarehospital.com',
      website: 'www.squarehospital.com',
      type: 'private',
      category: 'Multi-specialty Hospital',
      bedCount: 650,
      doctorCount: 200,
      emergencyService: true,
      ambulanceService: true,
      rating: 4.8,
      establishedYear: 2006,
      isActive: true,
      createdAt: '2024-01-10',
      updatedAt: '2024-01-18'
    },
    {
      id: '3',
      name: 'জাতীয় হৃদরোগ ইনস্টিটিউট',
      nameEn: 'National Institute of Cardiovascular Diseases',
      address: 'শেরে বাংলা নগর, ঢাকা',
      district: 'ঢাকা',
      division: 'ঢাকা',
      phone: '+880-2-9122334',
      email: 'info@nicvd.gov.bd',
      website: 'www.nicvd.gov.bd',
      type: 'specialized',
      category: 'Cardiac Hospital',
      bedCount: 600,
      doctorCount: 120,
      emergencyService: true,
      ambulanceService: true,
      rating: 4.5,
      establishedYear: 1998,
      isActive: true,
      createdAt: '2024-01-12',
      updatedAt: '2024-01-19'
    },
    {
      id: '4',
      name: 'চট্টগ্রাম মেডিকেল কলেজ হাসপাতাল',
      nameEn: 'Chittagong Medical College Hospital',
      address: 'পাহাড়তলী, চট্টগ্রাম',
      district: 'চট্টগ্রাম',
      division: 'চট্টগ্রাম',
      phone: '+880-31-2502000',
      email: 'info@cmch.gov.bd',
      website: 'www.cmch.gov.bd',
      type: 'government',
      category: 'General Hospital',
      bedCount: 1200,
      doctorCount: 280,
      emergencyService: true,
      ambulanceService: true,
      rating: 4.0,
      establishedYear: 1957,
      isActive: true,
      createdAt: '2024-01-08',
      updatedAt: '2024-01-16'
    },
    {
      id: '5',
      name: 'ইউনাইটেড হাসপাতাল',
      nameEn: 'United Hospital',
      address: 'গুলশান, ঢাকা',
      district: 'ঢাকা',
      division: 'ঢাকা',
      phone: '+880-2-8836000',
      email: 'info@uhlbd.com',
      website: 'www.uhlbd.com',
      type: 'private',
      category: 'Multi-specialty Hospital',
      bedCount: 500,
      doctorCount: 180,
      emergencyService: true,
      ambulanceService: true,
      rating: 4.7,
      establishedYear: 2006,
      isActive: false,
      createdAt: '2024-01-05',
      updatedAt: '2024-01-14'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterDivision, setFilterDivision] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [formData, setFormData] = useState({
    name: '',
    nameEn: '',
    address: '',
    district: '',
    division: '',
    phone: '',
    email: '',
    website: '',
    type: 'government' as Hospital['type'],
    category: '',
    bedCount: 0,
    doctorCount: 0,
    emergencyService: true,
    ambulanceService: true,
    rating: 0,
    establishedYear: new Date().getFullYear(),
    isActive: true
  });

  const divisions = ['ঢাকা', 'চট্টগ্রাম', 'রাজশাহী', 'খুলনা', 'বরিশাল', 'সিলেট', 'রংপুর', 'ময়মনসিংহ'];
  const hospitalTypes = [
    { value: 'government', label: 'সরকারি' },
    { value: 'private', label: 'বেসরকারি' },
    { value: 'specialized', label: 'বিশেষায়িত' }
  ];

  // Filter hospitals based on search and filters
  const filteredHospitals = hospitals.filter(hospital => {
    const matchesSearch = hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hospital.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hospital.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hospital.district.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || hospital.type === filterType;
    const matchesDivision = filterDivision === 'all' || hospital.division === filterDivision;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && hospital.isActive) ||
                         (filterStatus === 'inactive' && !hospital.isActive);
    
    return matchesSearch && matchesType && matchesDivision && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredHospitals.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedHospitals = filteredHospitals.slice(startIndex, startIndex + itemsPerPage);

  const handleAddHospital = () => {
    const newHospital: Hospital = {
      id: Date.now().toString(),
      ...formData,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    
    setHospitals([...hospitals, newHospital]);
    setShowAddModal(false);
    resetForm();
  };

  const handleEditHospital = () => {
    if (selectedHospital) {
      const updatedHospitals = hospitals.map(hospital =>
        hospital.id === selectedHospital.id
          ? {
              ...hospital,
              ...formData,
              updatedAt: new Date().toISOString().split('T')[0]
            }
          : hospital
      );
      
      setHospitals(updatedHospitals);
      setShowEditModal(false);
      setSelectedHospital(null);
      resetForm();
    }
  };

  const handleDeleteHospital = (id: string) => {
    if (window.confirm('আপনি কি এই হাসপাতাল মুছে ফেলতে চান?')) {
      setHospitals(hospitals.filter(hospital => hospital.id !== id));
    }
  };

  const handleToggleStatus = (id: string) => {
    const updatedHospitals = hospitals.map(hospital =>
      hospital.id === id
        ? { ...hospital, isActive: !hospital.isActive, updatedAt: new Date().toISOString().split('T')[0] }
        : hospital
    );
    setHospitals(updatedHospitals);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      nameEn: '',
      address: '',
      district: '',
      division: '',
      phone: '',
      email: '',
      website: '',
      type: 'government',
      category: '',
      bedCount: 0,
      doctorCount: 0,
      emergencyService: true,
      ambulanceService: true,
      rating: 0,
      establishedYear: new Date().getFullYear(),
      isActive: true
    });
  };

  const openEditModal = (hospital: Hospital) => {
    setSelectedHospital(hospital);
    setFormData({
      name: hospital.name,
      nameEn: hospital.nameEn,
      address: hospital.address,
      district: hospital.district,
      division: hospital.division,
      phone: hospital.phone,
      email: hospital.email,
      website: hospital.website,
      type: hospital.type,
      category: hospital.category,
      bedCount: hospital.bedCount,
      doctorCount: hospital.doctorCount,
      emergencyService: hospital.emergencyService,
      ambulanceService: hospital.ambulanceService,
      rating: hospital.rating,
      establishedYear: hospital.establishedYear,
      isActive: hospital.isActive
    });
    setShowEditModal(true);
  };

  const openViewModal = (hospital: Hospital) => {
    setSelectedHospital(hospital);
    setShowViewModal(true);
  };

  const exportData = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "ID,Name,Name (EN),Address,District,Division,Phone,Email,Website,Type,Category,Bed Count,Doctor Count,Emergency,Ambulance,Rating,Established,Status,Created At,Updated At\n" +
      hospitals.map(h => 
        `${h.id},"${h.name}","${h.nameEn}","${h.address}","${h.district}","${h.division}","${h.phone}","${h.email}","${h.website}","${h.type}","${h.category}",${h.bedCount},${h.doctorCount},${h.emergencyService},${h.ambulanceService},${h.rating},${h.establishedYear},${h.isActive ? 'Active' : 'Inactive'},${h.createdAt},${h.updatedAt}`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "hospitals.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getTypeLabel = (type: string) => {
    const typeObj = hospitalTypes.find(t => t.value === type);
    return typeObj ? typeObj.label : type;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">হাসপাতাল ম্যানেজমেন্ট</h1>
          <p className="text-gray-600 mt-1">হাসপাতালের তথ্য পরিচালনা করুন</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportData}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            নতুন হাসপাতাল
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">মোট হাসপাতাল</h3>
          <p className="text-2xl font-bold text-blue-600">{hospitals.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">সরকারি</h3>
          <p className="text-2xl font-bold text-green-600">{hospitals.filter(h => h.type === 'government').length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">বেসরকারি</h3>
          <p className="text-2xl font-bold text-purple-600">{hospitals.filter(h => h.type === 'private').length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">বিশেষায়িত</h3>
          <p className="text-2xl font-bold text-orange-600">{hospitals.filter(h => h.type === 'specialized').length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">মোট বেড</h3>
          <p className="text-2xl font-bold text-red-600">{hospitals.reduce((sum, h) => sum + h.bedCount, 0)}</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-lg shadow border mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="হাসপাতালের নাম, ঠিকানা বা জেলা দিয়ে খুঁজুন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">সব ধরনের</option>
              {hospitalTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            <select
              value={filterDivision}
              onChange={(e) => setFilterDivision(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">সব বিভাগ</option>
              {divisions.map(division => (
                <option key={division} value={division}>{division}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">সব স্ট্যাটাস</option>
              <option value="active">সক্রিয়</option>
              <option value="inactive">নিষ্ক্রিয়</option>
            </select>
          </div>
        </div>
      </div>

      {/* Hospitals Table */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">হাসপাতাল</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ধরন</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">অবস্থান</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">বেড/ডাক্তার</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">সেবা</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">রেটিং</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">স্ট্যাটাস</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedHospitals.map((hospital) => (
                <tr key={hospital.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{hospital.name}</div>
                      <div className="text-sm text-gray-500">{hospital.nameEn}</div>
                      <div className="text-xs text-gray-400">{hospital.category}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      hospital.type === 'government' ? 'bg-green-100 text-green-800' :
                      hospital.type === 'private' ? 'bg-purple-100 text-purple-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {getTypeLabel(hospital.type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                      <div>
                        <div>{hospital.district}</div>
                        <div className="text-xs text-gray-500">{hospital.division}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div>বেড: {hospital.bedCount}</div>
                      <div className="text-xs text-gray-500">ডাক্তার: {hospital.doctorCount}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-1">
                      {hospital.emergencyService && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          জরুরি
                        </span>
                      )}
                      {hospital.ambulanceService && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          অ্যাম্বুলেন্স
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 mr-1" />
                      <span className="text-sm text-gray-900">{hospital.rating}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleStatus(hospital.id)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        hospital.isActive
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      } transition-colors cursor-pointer`}
                    >
                      {hospital.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openViewModal(hospital)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                        title="বিস্তারিত দেখুন"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(hospital)}
                        className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                        title="সম্পাদনা করুন"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteHospital(hospital.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
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
                  পূর্ববর্তী
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  পরবর্তী
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    দেখানো হচ্ছে <span className="font-medium">{startIndex + 1}</span> থেকে{' '}
                    <span className="font-medium">{Math.min(startIndex + itemsPerPage, filteredHospitals.length)}</span> এর{' '}
                    <span className="font-medium">{filteredHospitals.length}</span> টি ফলাফল
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      পূর্ববর্তী
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
                      পরবর্তী
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Hospital Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">নতুন হাসপাতাল যোগ করুন</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">হাসপাতালের নাম (বাংলা) *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="যেমন: ঢাকা মেডিকেল কলেজ হাসপাতাল"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">হাসপাতালের নাম (ইংরেজি) *</label>
                <input
                  type="text"
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="যেমন: Dhaka Medical College Hospital"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">ঠিকানা *</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="সম্পূর্ণ ঠিকানা লিখুন"
                  rows={2}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">জেলা *</label>
                <input
                  type="text"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="যেমন: ঢাকা"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">বিভাগ *</label>
                <select
                  value={formData.division}
                  onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">বিভাগ নির্বাচন করুন</option>
                  {divisions.map(division => (
                    <option key={division} value={division}>{division}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ফোন নম্বর</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="যেমন: +880-2-8626812"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ইমেইল</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="যেমন: info@hospital.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ওয়েবসাইট</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="যেমন: www.hospital.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">হাসপাতালের ধরন *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as Hospital['type'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  {hospitalTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ক্যাটাগরি</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="যেমন: General Hospital"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">বেড সংখ্যা</label>
                <input
                  type="number"
                  value={formData.bedCount}
                  onChange={(e) => setFormData({ ...formData, bedCount: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ডাক্তার সংখ্যা</label>
                <input
                  type="number"
                  value={formData.doctorCount}
                  onChange={(e) => setFormData({ ...formData, doctorCount: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">রেটিং</label>
                <input
                  type="number"
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  max="5"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">প্রতিষ্ঠার বছর</label>
                <input
                  type="number"
                  value={formData.establishedYear}
                  onChange={(e) => setFormData({ ...formData, establishedYear: parseInt(e.target.value) || new Date().getFullYear() })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1800"
                  max={new Date().getFullYear()}
                />
              </div>
              <div className="md:col-span-2">
                <div className="flex gap-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="emergencyService"
                      checked={formData.emergencyService}
                      onChange={(e) => setFormData({ ...formData, emergencyService: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="emergencyService" className="ml-2 block text-sm text-gray-900">
                      জরুরি সেবা আছে
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="ambulanceService"
                      checked={formData.ambulanceService}
                      onChange={(e) => setFormData({ ...formData, ambulanceService: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="ambulanceService" className="ml-2 block text-sm text-gray-900">
                      অ্যাম্বুলেন্স সেবা আছে
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                      সক্রিয় রাখুন
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                বাতিল
              </button>
              <button
                onClick={handleAddHospital}
                disabled={!formData.name || !formData.nameEn || !formData.address || !formData.district || !formData.division}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                যোগ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Hospital Modal */}
      {showEditModal && selectedHospital && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">হাসপাতাল সম্পাদনা করুন</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">হাসপাতালের নাম (বাংলা) *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">হাসপাতালের নাম (ইংরেজি) *</label>
                <input
                  type="text"
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">ঠিকানা *</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">জেলা *</label>
                <input
                  type="text"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">বিভাগ *</label>
                <select
                  value={formData.division}
                  onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">বিভাগ নির্বাচন করুন</option>
                  {divisions.map(division => (
                    <option key={division} value={division}>{division}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ফোন নম্বর</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ইমেইল</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ওয়েবসাইট</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">হাসপাতালের ধরন *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as Hospital['type'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  {hospitalTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ক্যাটাগরি</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">বেড সংখ্যা</label>
                <input
                  type="number"
                  value={formData.bedCount}
                  onChange={(e) => setFormData({ ...formData, bedCount: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ডাক্তার সংখ্যা</label>
                <input
                  type="number"
                  value={formData.doctorCount}
                  onChange={(e) => setFormData({ ...formData, doctorCount: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">রেটিং</label>
                <input
                  type="number"
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  max="5"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">প্রতিষ্ঠার বছর</label>
                <input
                  type="number"
                  value={formData.establishedYear}
                  onChange={(e) => setFormData({ ...formData, establishedYear: parseInt(e.target.value) || new Date().getFullYear() })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1800"
                  max={new Date().getFullYear()}
                />
              </div>
              <div className="md:col-span-2">
                <div className="flex gap-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="editEmergencyService"
                      checked={formData.emergencyService}
                      onChange={(e) => setFormData({ ...formData, emergencyService: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="editEmergencyService" className="ml-2 block text-sm text-gray-900">
                      জরুরি সেবা আছে
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="editAmbulanceService"
                      checked={formData.ambulanceService}
                      onChange={(e) => setFormData({ ...formData, ambulanceService: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="editAmbulanceService" className="ml-2 block text-sm text-gray-900">
                      অ্যাম্বুলেন্স সেবা আছে
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="editIsActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="editIsActive" className="ml-2 block text-sm text-gray-900">
                      সক্রিয় রাখুন
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedHospital(null);
                  resetForm();
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                বাতিল
              </button>
              <button
                onClick={handleEditHospital}
                disabled={!formData.name || !formData.nameEn || !formData.address || !formData.district || !formData.division}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                আপডেট করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Hospital Modal */}
      {showViewModal && selectedHospital && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">হাসপাতাল বিস্তারিত</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{selectedHospital.name}</h3>
                <p className="text-gray-600 mb-4">{selectedHospital.nameEn}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">ঠিকানা</label>
                <p className="mt-1 text-sm text-gray-900">{selectedHospital.address}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">অবস্থান</label>
                <p className="mt-1 text-sm text-gray-900">{selectedHospital.district}, {selectedHospital.division}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">ফোন</label>
                <p className="mt-1 text-sm text-gray-900">{selectedHospital.phone || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">ইমেইল</label>
                <p className="mt-1 text-sm text-gray-900">{selectedHospital.email || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">ওয়েবসাইট</label>
                <p className="mt-1 text-sm text-gray-900">{selectedHospital.website || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">ধরন</label>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  selectedHospital.type === 'government' ? 'bg-green-100 text-green-800' :
                  selectedHospital.type === 'private' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {selectedHospital.type === 'government' ? 'সরকারি' :
                   selectedHospital.type === 'private' ? 'বেসরকারি' : 'অন্যান্য'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HospitalManagement;