import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Filter, Download, Upload, Eye, Package, Building2 } from 'lucide-react';

interface MedicineBrand {
  id: string;
  name: string;
  manufacturer: string;
  country: string;
  establishedYear: number;
  description: string;
  website?: string;
  email?: string;
  phone?: string;
  address: string;
  logoUrl?: string;
  isActive: boolean;
  totalMedicines: number;
  createdAt: Date;
  updatedAt: Date;
}

interface BrandFormData {
  name: string;
  manufacturer: string;
  country: string;
  establishedYear: number;
  description: string;
  website: string;
  email: string;
  phone: string;
  address: string;
  logoUrl: string;
  isActive: boolean;
}

const MedicineBrandManagement: React.FC = () => {
  const [brands, setBrands] = useState<MedicineBrand[]>([]);
  const [filteredBrands, setFilteredBrands] = useState<MedicineBrand[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedManufacturer, setSelectedManufacturer] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState<MedicineBrand | null>(null);
  const [viewingBrand, setViewingBrand] = useState<MedicineBrand | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [formData, setFormData] = useState<BrandFormData>({
    name: '',
    manufacturer: '',
    country: '',
    establishedYear: new Date().getFullYear(),
    description: '',
    website: '',
    email: '',
    phone: '',
    address: '',
    logoUrl: '',
    isActive: true
  });

  // Mock data - Replace with actual API calls
  useEffect(() => {
    const mockBrands: MedicineBrand[] = [
      {
        id: '1',
        name: 'স্কয়ার ফার্মাসিউটিক্যালস',
        manufacturer: 'Square Pharmaceuticals Ltd.',
        country: 'বাংলাদেশ',
        establishedYear: 1958,
        description: 'বাংলাদেশের অন্যতম বৃহত্তম ফার্মাসিউটিক্যাল কোম্পানি',
        website: 'https://squarepharma.com.bd',
        email: 'info@squarepharma.com.bd',
        phone: '+88-02-8401001',
        address: 'স্কয়ার সেন্টার, ৪৮ মহাখালী বাণিজ্যিক এলাকা, ঢাকা-১২১২',
        logoUrl: '',
        isActive: true,
        totalMedicines: 450,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        name: 'ইনসেপ্টা ফার্মাসিউটিক্যালস',
        manufacturer: 'Incepta Pharmaceuticals Ltd.',
        country: 'বাংলাদেশ',
        establishedYear: 1999,
        description: 'আধুনিক প্রযুক্তি ও গুণগত মানের ওষুধ উৎপাদনকারী প্রতিষ্ঠান',
        website: 'https://inceptapharma.com',
        email: 'info@inceptapharma.com',
        phone: '+88-02-8401234',
        address: 'ইনসেপ্টা ভবন, ৪০ কাজী নজরুল ইসলাম এভিনিউ, ঢাকা',
        logoUrl: '',
        isActive: true,
        totalMedicines: 320,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '3',
        name: 'বেক্সিমকো ফার্মা',
        manufacturer: 'Beximco Pharmaceuticals Ltd.',
        country: 'বাংলাদেশ',
        establishedYear: 1976,
        description: 'বাংলাদেশের শীর্ষস্থানীয় ফার্মাসিউটিক্যাল কোম্পানি',
        website: 'https://beximcopharma.com',
        email: 'info@beximcopharma.com',
        phone: '+88-02-9881234',
        address: 'বেক্সিমকো ইন্ডাস্ট্রিয়াল এরিয়া, টঙ্গী, গাজীপুর',
        logoUrl: '',
        isActive: true,
        totalMedicines: 380,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '4',
        name: 'নোভার্টিস',
        manufacturer: 'Novartis AG',
        country: 'সুইজারল্যান্ড',
        establishedYear: 1996,
        description: 'বিশ্বব্যাপী স্বাস্থ্যসেবা কোম্পানি',
        website: 'https://novartis.com',
        email: 'info@novartis.com',
        phone: '+41-61-324-1111',
        address: 'Novartis Campus, Basel, Switzerland',
        logoUrl: '',
        isActive: true,
        totalMedicines: 850,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '5',
        name: 'ফাইজার',
        manufacturer: 'Pfizer Inc.',
        country: 'যুক্তরাষ্ট্র',
        establishedYear: 1849,
        description: 'বিশ্বের অন্যতম বৃহত্তম ফার্মাসিউটিক্যাল কোম্পানি',
        website: 'https://pfizer.com',
        email: 'info@pfizer.com',
        phone: '+1-212-733-2323',
        address: '235 East 42nd Street, New York, NY 10017, USA',
        logoUrl: '',
        isActive: true,
        totalMedicines: 1200,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    setBrands(mockBrands);
    setFilteredBrands(mockBrands);
  }, []);

  // Filter and search functionality
  useEffect(() => {
    let filtered = brands;

    if (searchTerm) {
      filtered = filtered.filter(brand =>
        brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        brand.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        brand.country.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCountry) {
      filtered = filtered.filter(brand => brand.country === selectedCountry);
    }

    if (selectedManufacturer) {
      filtered = filtered.filter(brand => brand.manufacturer === selectedManufacturer);
    }

    setFilteredBrands(filtered);
    setCurrentPage(1);
  }, [searchTerm, selectedCountry, selectedManufacturer, brands]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.manufacturer.trim()) {
      alert('অনুগ্রহ করে ব্র্যান্ডের নাম এবং প্রস্তুতকারকের নাম পূরণ করুন।');
      return;
    }

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      if (editingBrand) {
        // Update existing brand
        setBrands(prev => prev.map(brand =>
          brand.id === editingBrand.id
            ? {
                ...brand,
                ...formData,
                updatedAt: new Date()
              }
            : brand
        ));
      } else {
        // Add new brand
        const newBrand: MedicineBrand = {
          id: Date.now().toString(),
          ...formData,
          totalMedicines: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        setBrands(prev => [newBrand, ...prev]);
      }

      setShowModal(false);
      setEditingBrand(null);
      resetForm();
      setLoading(false);
    }, 1000);
  };

  const handleEdit = (brand: MedicineBrand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      manufacturer: brand.manufacturer,
      country: brand.country,
      establishedYear: brand.establishedYear,
      description: brand.description,
      website: brand.website || '',
      email: brand.email || '',
      phone: brand.phone || '',
      address: brand.address,
      logoUrl: brand.logoUrl || '',
      isActive: brand.isActive
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('আপনি কি এই ব্র্যান্ডটি মুছে ফেলতে চান?')) {
      setBrands(prev => prev.filter(brand => brand.id !== id));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      manufacturer: '',
      country: '',
      establishedYear: new Date().getFullYear(),
      description: '',
      website: '',
      email: '',
      phone: '',
      address: '',
      logoUrl: '',
      isActive: true
    });
  };

  const handleExport = () => {
    const csvContent = [
      ['নাম', 'প্রস্তুতকারক', 'দেশ', 'প্রতিষ্ঠার বছর', 'মোট ওষুধ', 'স্ট্যাটাস'],
      ...filteredBrands.map(brand => [
        brand.name,
        brand.manufacturer,
        brand.country,
        brand.establishedYear.toString(),
        brand.totalMedicines.toString(),
        brand.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'medicine-brands.csv';
    link.click();
  };

  // Get unique countries and manufacturers for filters
  const uniqueCountries = [...new Set(brands.map(brand => brand.country))];
  const uniqueManufacturers = [...new Set(brands.map(brand => brand.manufacturer))];

  // Pagination
  const totalPages = Math.ceil(filteredBrands.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBrands = filteredBrands.slice(startIndex, endIndex);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">মেডিসিন ব্র্যান্ড ম্যানেজমেন্ট</h2>
        <div className="flex space-x-3">
          <button
            onClick={handleExport}
            className="flex items-center bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            এক্সপোর্ট
          </button>
          <button
            onClick={() => {
              resetForm();
              setEditingBrand(null);
              setShowModal(true);
            }}
            className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            নতুন ব্র্যান্ড
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">মোট ব্র্যান্ড</p>
              <p className="text-2xl font-bold text-gray-900">{brands.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center">
            <Building2 className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">সক্রিয় ব্র্যান্ড</p>
              <p className="text-2xl font-bold text-gray-900">
                {brands.filter(b => b.isActive).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">মোট ওষুধ</p>
              <p className="text-2xl font-bold text-gray-900">
                {brands.reduce((sum, brand) => sum + brand.totalMedicines, 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center">
            <Building2 className="h-8 w-8 text-orange-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">দেশের সংখ্যা</p>
              <p className="text-2xl font-bold text-gray-900">{uniqueCountries.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="ব্র্যান্ড, প্রস্তুতকারক বা দেশ খুঁজুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">সব দেশ</option>
            {uniqueCountries.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
          
          <select
            value={selectedManufacturer}
            onChange={(e) => setSelectedManufacturer(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">সব প্রস্তুতকারক</option>
            {uniqueManufacturers.map(manufacturer => (
              <option key={manufacturer} value={manufacturer}>{manufacturer}</option>
            ))}
          </select>
          
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCountry('');
              setSelectedManufacturer('');
            }}
            className="flex items-center justify-center bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            <Filter className="h-4 w-4 mr-2" />
            রিসেট
          </button>
        </div>
      </div>

      {/* Brands Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ব্র্যান্ড
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  প্রস্তুতকারক
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  দেশ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  প্রতিষ্ঠার বছর
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  মোট ওষুধ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  স্ট্যাটাস
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  অ্যাকশন
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentBrands.map(brand => (
                <tr key={brand.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <Package className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{brand.name}</div>
                        <div className="text-sm text-gray-500">{brand.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {brand.manufacturer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {brand.country}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {brand.establishedYear}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {brand.totalMedicines}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      brand.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {brand.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setViewingBrand(brand)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(brand)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(brand.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
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
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                পূর্ববর্তী
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                পরবর্তী
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  দেখানো হচ্ছে <span className="font-medium">{startIndex + 1}</span> থেকে{' '}
                  <span className="font-medium">{Math.min(endIndex, filteredBrands.length)}</span> এর{' '}
                  <span className="font-medium">{filteredBrands.length}</span> টি ফলাফল
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === page
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {editingBrand ? 'ব্র্যান্ড সম্পাদনা' : 'নতুন ব্র্যান্ড যোগ করুন'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingBrand(null);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ব্র্যান্ডের নাম *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    প্রস্তুতকারক *
                  </label>
                  <input
                    type="text"
                    value={formData.manufacturer}
                    onChange={(e) => setFormData(prev => ({ ...prev, manufacturer: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    দেশ
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    প্রতিষ্ঠার বছর
                  </label>
                  <input
                    type="number"
                    value={formData.establishedYear}
                    onChange={(e) => setFormData(prev => ({ ...prev, establishedYear: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ওয়েবসাইট
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ইমেইল
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ফোন
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    লোগো URL
                  </label>
                  <input
                    type="url"
                    value={formData.logoUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, logoUrl: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ঠিকানা
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  বিবরণ
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                  ব্র্যান্ড সক্রিয় রাখুন
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingBrand(null);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  {loading ? 'সংরক্ষণ করা হচ্ছে...' : 'সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewingBrand && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">ব্র্যান্ডের বিস্তারিত</h3>
              <button
                onClick={() => setViewingBrand(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">ব্র্যান্ডের নাম</label>
                  <p className="text-lg font-semibold">{viewingBrand.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">প্রস্তুতকারক</label>
                  <p className="text-lg">{viewingBrand.manufacturer}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">দেশ</label>
                  <p className="text-lg">{viewingBrand.country}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">প্রতিষ্ঠার বছর</label>
                  <p className="text-lg">{viewingBrand.establishedYear}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">মোট ওষুধ</label>
                  <p className="text-lg font-semibold text-blue-600">{viewingBrand.totalMedicines}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">স্ট্যাটাস</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                    viewingBrand.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {viewingBrand.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                  </span>
                </div>
              </div>
              
              {viewingBrand.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">বিবরণ</label>
                  <p className="text-gray-700">{viewingBrand.description}</p>
                </div>
              )}
              
              {viewingBrand.address && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">ঠিকানা</label>
                  <p className="text-gray-700">{viewingBrand.address}</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {viewingBrand.website && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">ওয়েবসাইট</label>
                    <a href={viewingBrand.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {viewingBrand.website}
                    </a>
                  </div>
                )}
                {viewingBrand.email && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">ইমেইল</label>
                    <a href={`mailto:${viewingBrand.email}`} className="text-blue-600 hover:underline">
                      {viewingBrand.email}
                    </a>
                  </div>
                )}
                {viewingBrand.phone && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">ফোন</label>
                    <a href={`tel:${viewingBrand.phone}`} className="text-blue-600 hover:underline">
                      {viewingBrand.phone}
                    </a>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
                <div>
                  <label className="block font-medium">তৈরি করা হয়েছে</label>
                  <p>{viewingBrand.createdAt.toLocaleString('bn-BD')}</p>
                </div>
                <div>
                  <label className="block font-medium">সর্বশেষ আপডেট</label>
                  <p>{viewingBrand.updatedAt.toLocaleString('bn-BD')}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6">
              <button
                onClick={() => {
                  setViewingBrand(null);
                  handleEdit(viewingBrand);
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                সম্পাদনা করুন
              </button>
              <button
                onClick={() => setViewingBrand(null)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicineBrandManagement;