import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Eye, Filter, Download, Upload } from 'lucide-react';

interface DoctorCategory {
  id: string;
  name: string;
  description: string;
  specialization: string;
  doctorCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const DoctorCategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<DoctorCategory[]>([
    {
      id: '1',
      name: 'কার্ডিওলজি',
      description: 'হৃদরোগ বিশেষজ্ঞ',
      specialization: 'Heart Disease',
      doctorCount: 25,
      isActive: true,
      createdAt: '2024-01-15',
      updatedAt: '2024-01-20'
    },
    {
      id: '2',
      name: 'নিউরোলজি',
      description: 'স্নায়ুরোগ বিশেষজ্ঞ',
      specialization: 'Neurological Disorders',
      doctorCount: 18,
      isActive: true,
      createdAt: '2024-01-10',
      updatedAt: '2024-01-18'
    },
    {
      id: '3',
      name: 'অর্থোপেডিক্স',
      description: 'হাড় ও জয়েন্ট বিশেষজ্ঞ',
      specialization: 'Bone and Joint',
      doctorCount: 22,
      isActive: true,
      createdAt: '2024-01-12',
      updatedAt: '2024-01-19'
    },
    {
      id: '4',
      name: 'গাইনোকোলজি',
      description: 'নারী রোগ বিশেষজ্ঞ',
      specialization: 'Women\'s Health',
      doctorCount: 15,
      isActive: true,
      createdAt: '2024-01-08',
      updatedAt: '2024-01-16'
    },
    {
      id: '5',
      name: 'পেডিয়াট্রিক্স',
      description: 'শিশু রোগ বিশেষজ্ঞ',
      specialization: 'Child Health',
      doctorCount: 20,
      isActive: false,
      createdAt: '2024-01-05',
      updatedAt: '2024-01-14'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<DoctorCategory | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    specialization: '',
    isActive: true
  });

  // Filter categories based on search and status
  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && category.isActive) ||
                         (filterStatus === 'inactive' && !category.isActive);
    
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCategories = filteredCategories.slice(startIndex, startIndex + itemsPerPage);

  const handleAddCategory = () => {
    const newCategory: DoctorCategory = {
      id: Date.now().toString(),
      name: formData.name,
      description: formData.description,
      specialization: formData.specialization,
      doctorCount: 0,
      isActive: formData.isActive,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    
    setCategories([...categories, newCategory]);
    setShowAddModal(false);
    resetForm();
  };

  const handleEditCategory = () => {
    if (selectedCategory) {
      const updatedCategories = categories.map(category =>
        category.id === selectedCategory.id
          ? {
              ...category,
              name: formData.name,
              description: formData.description,
              specialization: formData.specialization,
              isActive: formData.isActive,
              updatedAt: new Date().toISOString().split('T')[0]
            }
          : category
      );
      
      setCategories(updatedCategories);
      setShowEditModal(false);
      setSelectedCategory(null);
      resetForm();
    }
  };

  const handleDeleteCategory = (id: string) => {
    if (window.confirm('আপনি কি এই ক্যাটাগরি মুছে ফেলতে চান?')) {
      setCategories(categories.filter(category => category.id !== id));
    }
  };

  const handleToggleStatus = (id: string) => {
    const updatedCategories = categories.map(category =>
      category.id === id
        ? { ...category, isActive: !category.isActive, updatedAt: new Date().toISOString().split('T')[0] }
        : category
    );
    setCategories(updatedCategories);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      specialization: '',
      isActive: true
    });
  };

  const openEditModal = (category: DoctorCategory) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      specialization: category.specialization,
      isActive: category.isActive
    });
    setShowEditModal(true);
  };

  const openViewModal = (category: DoctorCategory) => {
    setSelectedCategory(category);
    setShowViewModal(true);
  };

  const exportData = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "ID,Name,Description,Specialization,Doctor Count,Status,Created At,Updated At\n" +
      categories.map(cat => 
        `${cat.id},"${cat.name}","${cat.description}","${cat.specialization}",${cat.doctorCount},${cat.isActive ? 'Active' : 'Inactive'},${cat.createdAt},${cat.updatedAt}`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "doctor_categories.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">ডাক্তার ক্যাটাগরি ম্যানেজমেন্ট</h1>
          <p className="text-gray-600 mt-1">ডাক্তারের বিভিন্ন বিভাগ পরিচালনা করুন</p>
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
            নতুন ক্যাটাগরি
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">মোট ক্যাটাগরি</h3>
          <p className="text-2xl font-bold text-blue-600">{categories.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">সক্রিয় ক্যাটাগরি</h3>
          <p className="text-2xl font-bold text-green-600">{categories.filter(c => c.isActive).length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">নিষ্ক্রিয় ক্যাটাগরি</h3>
          <p className="text-2xl font-bold text-red-600">{categories.filter(c => !c.isActive).length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">মোট ডাক্তার</h3>
          <p className="text-2xl font-bold text-purple-600">{categories.reduce((sum, c) => sum + c.doctorCount, 0)}</p>
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
                placeholder="ক্যাটাগরি নাম, বিবরণ বা বিশেষত্ব দিয়ে খুঁজুন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
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

      {/* Categories Table */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ক্যাটাগরি</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">বিশেষত্ব</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ডাক্তার সংখ্যা</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">স্ট্যাটাস</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">তৈরি হয়েছে</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedCategories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{category.name}</div>
                      <div className="text-sm text-gray-500">{category.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {category.specialization}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {category.doctorCount}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleStatus(category.id)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        category.isActive
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      } transition-colors cursor-pointer`}
                    >
                      {category.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {category.createdAt}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openViewModal(category)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                        title="বিস্তারিত দেখুন"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(category)}
                        className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                        title="সম্পাদনা করুন"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
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
                    <span className="font-medium">{Math.min(startIndex + itemsPerPage, filteredCategories.length)}</span> এর{' '}
                    <span className="font-medium">{filteredCategories.length}</span> টি ফলাফল
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

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">নতুন ডাক্তার ক্যাটাগরি যোগ করুন</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ক্যাটাগরি নাম *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="যেমন: কার্ডিওলজি"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">বিবরণ *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="যেমন: হৃদরোগ বিশেষজ্ঞ"
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">বিশেষত্ব (ইংরেজিতে) *</label>
                <input
                  type="text"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="যেমন: Heart Disease"
                  required
                />
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
                onClick={handleAddCategory}
                disabled={!formData.name || !formData.description || !formData.specialization}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                যোগ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {showEditModal && selectedCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">ক্যাটাগরি সম্পাদনা করুন</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ক্যাটাগরি নাম *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">বিবরণ *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">বিশেষত্ব (ইংরেজিতে) *</label>
                <input
                  type="text"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
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
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedCategory(null);
                  resetForm();
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                বাতিল
              </button>
              <button
                onClick={handleEditCategory}
                disabled={!formData.name || !formData.description || !formData.specialization}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                আপডেট করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Category Modal */}
      {showViewModal && selectedCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">ক্যাটাগরি বিস্তারিত</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">ক্যাটাগরি নাম</label>
                <p className="mt-1 text-sm text-gray-900">{selectedCategory.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">বিবরণ</label>
                <p className="mt-1 text-sm text-gray-900">{selectedCategory.description}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">বিশেষত্ব</label>
                <p className="mt-1 text-sm text-gray-900">{selectedCategory.specialization}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">ডাক্তার সংখ্যা</label>
                <p className="mt-1 text-sm text-gray-900">{selectedCategory.doctorCount}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">স্ট্যাটাস</label>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  selectedCategory.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {selectedCategory.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">তৈরি হয়েছে</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedCategory.createdAt}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">আপডেট হয়েছে</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedCategory.updatedAt}</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedCategory(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                বন্ধ করুন
              </button>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  openEditModal(selectedCategory);
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                সম্পাদনা করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorCategoryManagement;