import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Eye, Filter, Download, Upload, Pill, AlertTriangle, Calendar, Package } from 'lucide-react';

interface Medicine {
  id: string;
  name: string;
  nameEn: string;
  genericName: string;
  brandName: string;
  manufacturer: string;
  category: string;
  dosageForm: string;
  strength: string;
  unitPrice: number;
  packSize: string;
  indication: string;
  contraindication: string;
  sideEffects: string;
  dosage: string;
  storage: string;
  expiryDate: string;
  batchNumber: string;
  registrationNumber: string;
  isOTC: boolean; // Over The Counter
  isPrescriptionOnly: boolean;
  isControlled: boolean;
  stockQuantity: number;
  minStockLevel: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const MedicineManagement: React.FC = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([
    {
      id: '1',
      name: 'প্যারাসিটামল',
      nameEn: 'Paracetamol',
      genericName: 'Paracetamol',
      brandName: 'Napa',
      manufacturer: 'Beximco Pharmaceuticals',
      category: 'Analgesic',
      dosageForm: 'Tablet',
      strength: '500mg',
      unitPrice: 2.50,
      packSize: '10 tablets',
      indication: 'জ্বর, ব্যথা নিরাময়',
      contraindication: 'লিভারের সমস্যা',
      sideEffects: 'বমি বমি ভাব, পেট ব্যথা',
      dosage: 'দিনে ৩ বার ১টি করে',
      storage: 'ঠান্ডা ও শুকনো স্থানে রাখুন',
      expiryDate: '2025-12-31',
      batchNumber: 'NAP2024001',
      registrationNumber: 'DRA-001234',
      isOTC: true,
      isPrescriptionOnly: false,
      isControlled: false,
      stockQuantity: 500,
      minStockLevel: 50,
      isActive: true,
      createdAt: '2024-01-15',
      updatedAt: '2024-01-20'
    },
    {
      id: '2',
      name: 'অ্যামোক্সিসিলিন',
      nameEn: 'Amoxicillin',
      genericName: 'Amoxicillin',
      brandName: 'Amoxil',
      manufacturer: 'Square Pharmaceuticals',
      category: 'Antibiotic',
      dosageForm: 'Capsule',
      strength: '250mg',
      unitPrice: 8.00,
      packSize: '16 capsules',
      indication: 'ব্যাকটেরিয়াল ইনফেকশন',
      contraindication: 'পেনিসিলিন অ্যালার্জি',
      sideEffects: 'ডায়রিয়া, বমি, র‍্যাশ',
      dosage: 'দিনে ৩ বার ১টি করে',
      storage: 'ঠান্ডা ও শুকনো স্থানে রাখুন',
      expiryDate: '2025-08-15',
      batchNumber: 'AMX2024002',
      registrationNumber: 'DRA-005678',
      isOTC: false,
      isPrescriptionOnly: true,
      isControlled: false,
      stockQuantity: 200,
      minStockLevel: 30,
      isActive: true,
      createdAt: '2024-01-10',
      updatedAt: '2024-01-18'
    },
    {
      id: '3',
      name: 'ওমিপ্রাজল',
      nameEn: 'Omeprazole',
      genericName: 'Omeprazole',
      brandName: 'Losec',
      manufacturer: 'Incepta Pharmaceuticals',
      category: 'Proton Pump Inhibitor',
      dosageForm: 'Capsule',
      strength: '20mg',
      unitPrice: 12.00,
      packSize: '14 capsules',
      indication: 'গ্যাস্ট্রিক আলসার, এসিডিটি',
      contraindication: 'গর্ভাবস্থায় সতর্কতা',
      sideEffects: 'মাথাব্যথা, পেট ব্যথা',
      dosage: 'দিনে ১ বার খাবারের আগে',
      storage: 'ঠান্ডা ও শুকনো স্থানে রাখুন',
      expiryDate: '2025-10-20',
      batchNumber: 'OME2024003',
      registrationNumber: 'DRA-009876',
      isOTC: false,
      isPrescriptionOnly: true,
      isControlled: false,
      stockQuantity: 150,
      minStockLevel: 25,
      isActive: true,
      createdAt: '2024-01-12',
      updatedAt: '2024-01-19'
    },
    {
      id: '4',
      name: 'ট্রামাডল',
      nameEn: 'Tramadol',
      genericName: 'Tramadol HCl',
      brandName: 'Tramal',
      manufacturer: 'Opsonin Pharma',
      category: 'Opioid Analgesic',
      dosageForm: 'Tablet',
      strength: '50mg',
      unitPrice: 15.00,
      packSize: '10 tablets',
      indication: 'তীব্র ব্যথা',
      contraindication: 'শ্বাসকষ্ট, মাদকাসক্তি',
      sideEffects: 'ঘুমঘুম ভাব, বমি, কোষ্ঠকাঠিন্য',
      dosage: 'প্রয়োজন অনুযায়ী ৬ ঘন্টা পর পর',
      storage: 'নিরাপদ স্থানে রাখুন',
      expiryDate: '2025-06-30',
      batchNumber: 'TRA2024004',
      registrationNumber: 'DRA-012345',
      isOTC: false,
      isPrescriptionOnly: true,
      isControlled: true,
      stockQuantity: 80,
      minStockLevel: 10,
      isActive: true,
      createdAt: '2024-01-08',
      updatedAt: '2024-01-16'
    },
    {
      id: '5',
      name: 'সেটিরিজিন',
      nameEn: 'Cetirizine',
      genericName: 'Cetirizine HCl',
      brandName: 'Zyrtec',
      manufacturer: 'ACI Pharmaceuticals',
      category: 'Antihistamine',
      dosageForm: 'Tablet',
      strength: '10mg',
      unitPrice: 5.00,
      packSize: '10 tablets',
      indication: 'অ্যালার্জি, চুলকানি',
      contraindication: 'কিডনির সমস্যা',
      sideEffects: 'ঘুমঘুম ভাব, মুখ শুকিয়ে যাওয়া',
      dosage: 'দিনে ১ বার রাতে',
      storage: 'ঠান্ডা ও শুকনো স্থানে রাখুন',
      expiryDate: '2025-04-15',
      batchNumber: 'CET2024005',
      registrationNumber: 'DRA-067890',
      isOTC: true,
      isPrescriptionOnly: false,
      isControlled: false,
      stockQuantity: 300,
      minStockLevel: 40,
      isActive: false,
      createdAt: '2024-01-05',
      updatedAt: '2024-01-14'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterStock, setFilterStock] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [formData, setFormData] = useState({
    name: '',
    nameEn: '',
    genericName: '',
    brandName: '',
    manufacturer: '',
    category: '',
    dosageForm: '',
    strength: '',
    unitPrice: 0,
    packSize: '',
    indication: '',
    contraindication: '',
    sideEffects: '',
    dosage: '',
    storage: '',
    expiryDate: '',
    batchNumber: '',
    registrationNumber: '',
    isOTC: false,
    isPrescriptionOnly: false,
    isControlled: false,
    stockQuantity: 0,
    minStockLevel: 0,
    isActive: true
  });

  const categories = ['Analgesic', 'Antibiotic', 'Antihistamine', 'Antacid', 'Antihypertensive', 'Antidiabetic', 'Proton Pump Inhibitor', 'Opioid Analgesic'];
  const dosageForms = ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Cream', 'Ointment', 'Drops', 'Inhaler'];
  const manufacturers = ['Beximco Pharmaceuticals', 'Square Pharmaceuticals', 'Incepta Pharmaceuticals', 'Opsonin Pharma', 'ACI Pharmaceuticals', 'Renata Limited', 'Drug International'];

  // Filter medicines based on search and filters
  const filteredMedicines = medicines.filter(medicine => {
    const matchesSearch = medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         medicine.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         medicine.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         medicine.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         medicine.manufacturer.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || medicine.category === filterCategory;
    const matchesType = filterType === 'all' || 
                       (filterType === 'otc' && medicine.isOTC) ||
                       (filterType === 'prescription' && medicine.isPrescriptionOnly) ||
                       (filterType === 'controlled' && medicine.isControlled);
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && medicine.isActive) ||
                         (filterStatus === 'inactive' && !medicine.isActive);
    const matchesStock = filterStock === 'all' ||
                        (filterStock === 'low' && medicine.stockQuantity <= medicine.minStockLevel) ||
                        (filterStock === 'normal' && medicine.stockQuantity > medicine.minStockLevel);
    
    return matchesSearch && matchesCategory && matchesType && matchesStatus && matchesStock;
  });

  // Pagination
  const totalPages = Math.ceil(filteredMedicines.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMedicines = filteredMedicines.slice(startIndex, startIndex + itemsPerPage);

  const handleAddMedicine = () => {
    const newMedicine: Medicine = {
      id: Date.now().toString(),
      ...formData,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    
    setMedicines([...medicines, newMedicine]);
    setShowAddModal(false);
    resetForm();
  };

  const handleEditMedicine = () => {
    if (selectedMedicine) {
      const updatedMedicines = medicines.map(medicine =>
        medicine.id === selectedMedicine.id
          ? {
              ...medicine,
              ...formData,
              updatedAt: new Date().toISOString().split('T')[0]
            }
          : medicine
      );
      
      setMedicines(updatedMedicines);
      setShowEditModal(false);
      setSelectedMedicine(null);
      resetForm();
    }
  };

  const handleDeleteMedicine = (id: string) => {
    if (window.confirm('আপনি কি এই ওষুধ মুছে ফেলতে চান?')) {
      setMedicines(medicines.filter(medicine => medicine.id !== id));
    }
  };

  const handleToggleStatus = (id: string) => {
    const updatedMedicines = medicines.map(medicine =>
      medicine.id === id
        ? { ...medicine, isActive: !medicine.isActive, updatedAt: new Date().toISOString().split('T')[0] }
        : medicine
    );
    setMedicines(updatedMedicines);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      nameEn: '',
      genericName: '',
      brandName: '',
      manufacturer: '',
      category: '',
      dosageForm: '',
      strength: '',
      unitPrice: 0,
      packSize: '',
      indication: '',
      contraindication: '',
      sideEffects: '',
      dosage: '',
      storage: '',
      expiryDate: '',
      batchNumber: '',
      registrationNumber: '',
      isOTC: false,
      isPrescriptionOnly: false,
      isControlled: false,
      stockQuantity: 0,
      minStockLevel: 0,
      isActive: true
    });
  };

  const openEditModal = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setFormData({
      name: medicine.name,
      nameEn: medicine.nameEn,
      genericName: medicine.genericName,
      brandName: medicine.brandName,
      manufacturer: medicine.manufacturer,
      category: medicine.category,
      dosageForm: medicine.dosageForm,
      strength: medicine.strength,
      unitPrice: medicine.unitPrice,
      packSize: medicine.packSize,
      indication: medicine.indication,
      contraindication: medicine.contraindication,
      sideEffects: medicine.sideEffects,
      dosage: medicine.dosage,
      storage: medicine.storage,
      expiryDate: medicine.expiryDate,
      batchNumber: medicine.batchNumber,
      registrationNumber: medicine.registrationNumber,
      isOTC: medicine.isOTC,
      isPrescriptionOnly: medicine.isPrescriptionOnly,
      isControlled: medicine.isControlled,
      stockQuantity: medicine.stockQuantity,
      minStockLevel: medicine.minStockLevel,
      isActive: medicine.isActive
    });
    setShowEditModal(true);
  };

  const openViewModal = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setShowViewModal(true);
  };

  const exportData = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "ID,Name,Name (EN),Generic Name,Brand Name,Manufacturer,Category,Dosage Form,Strength,Unit Price,Pack Size,Indication,Contraindication,Side Effects,Dosage,Storage,Expiry Date,Batch Number,Registration Number,OTC,Prescription Only,Controlled,Stock Quantity,Min Stock Level,Status,Created At,Updated At\n" +
      medicines.map(m => 
        `${m.id},"${m.name}","${m.nameEn}","${m.genericName}","${m.brandName}","${m.manufacturer}","${m.category}","${m.dosageForm}","${m.strength}",${m.unitPrice},"${m.packSize}","${m.indication}","${m.contraindication}","${m.sideEffects}","${m.dosage}","${m.storage}",${m.expiryDate},"${m.batchNumber}","${m.registrationNumber}",${m.isOTC},${m.isPrescriptionOnly},${m.isControlled},${m.stockQuantity},${m.minStockLevel},${m.isActive ? 'Active' : 'Inactive'},${m.createdAt},${m.updatedAt}`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "medicines.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getTypeLabel = (medicine: Medicine) => {
    if (medicine.isControlled) return 'নিয়ন্ত্রিত';
    if (medicine.isPrescriptionOnly) return 'প্রেসক্রিপশন';
    if (medicine.isOTC) return 'ওটিসি';
    return 'সাধারণ';
  };

  const getTypeColor = (medicine: Medicine) => {
    if (medicine.isControlled) return 'bg-red-100 text-red-800';
    if (medicine.isPrescriptionOnly) return 'bg-orange-100 text-orange-800';
    if (medicine.isOTC) return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  };

  const isLowStock = (medicine: Medicine) => {
    return medicine.stockQuantity <= medicine.minStockLevel;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">ওষুধ ম্যানেজমেন্ট</h1>
          <p className="text-gray-600 mt-1">ওষুধের তথ্য ও স্টক পরিচালনা করুন</p>
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
            নতুন ওষুধ
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">মোট ওষুধ</h3>
          <p className="text-2xl font-bold text-blue-600">{medicines.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">ওটিসি</h3>
          <p className="text-2xl font-bold text-green-600">{medicines.filter(m => m.isOTC).length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">প্রেসক্রিপশন</h3>
          <p className="text-2xl font-bold text-orange-600">{medicines.filter(m => m.isPrescriptionOnly).length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">নিয়ন্ত্রিত</h3>
          <p className="text-2xl font-bold text-red-600">{medicines.filter(m => m.isControlled).length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">কম স্টক</h3>
          <p className="text-2xl font-bold text-yellow-600">{medicines.filter(m => isLowStock(m)).length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">মোট মূল্য</h3>
          <p className="text-2xl font-bold text-purple-600">৳{medicines.reduce((sum, m) => sum + (m.unitPrice * m.stockQuantity), 0).toFixed(2)}</p>
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
                placeholder="ওষুধের নাম, জেনেরিক নাম, ব্র্যান্ড বা প্রস্তুতকারক দিয়ে খুঁজুন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">সব ক্যাটাগরি</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">সব ধরনের</option>
              <option value="otc">ওটিসি</option>
              <option value="prescription">প্রেসক্রিপশন</option>
              <option value="controlled">নিয়ন্ত্রিত</option>
            </select>
            <select
              value={filterStock}
              onChange={(e) => setFilterStock(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">সব স্টক</option>
              <option value="low">কম স্টক</option>
              <option value="normal">স্বাভাবিক স্টক</option>
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

      {/* Medicines Table */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ওষুধ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ধরন</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">প্রস্তুতকারক</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">মূল্য</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">স্টক</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">মেয়াদ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">স্ট্যাটাস</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedMedicines.map((medicine) => (
                <tr key={medicine.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Pill className="w-8 h-8 text-blue-500 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{medicine.name}</div>
                        <div className="text-sm text-gray-500">{medicine.nameEn}</div>
                        <div className="text-xs text-gray-400">{medicine.brandName} - {medicine.strength}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(medicine)}`}>
                      {getTypeLabel(medicine)}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">{medicine.category}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>{medicine.manufacturer}</div>
                    <div className="text-xs text-gray-500">{medicine.dosageForm}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>৳{medicine.unitPrice}</div>
                    <div className="text-xs text-gray-500">{medicine.packSize}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {isLowStock(medicine) && (
                        <AlertTriangle className="w-4 h-4 text-red-500 mr-1" />
                      )}
                      <div>
                        <div className={`text-sm font-medium ${isLowStock(medicine) ? 'text-red-600' : 'text-gray-900'}`}>
                          {medicine.stockQuantity}
                        </div>
                        <div className="text-xs text-gray-500">Min: {medicine.minStockLevel}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-1" />
                      <div className="text-sm text-gray-900">{medicine.expiryDate}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleStatus(medicine.id)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        medicine.isActive
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      } transition-colors cursor-pointer`}
                    >
                      {medicine.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openViewModal(medicine)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                        title="বিস্তারিত দেখুন"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(medicine)}
                        className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                        title="সম্পাদনা করুন"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteMedicine(medicine.id)}
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
                    <span className="font-medium">{Math.min(startIndex + itemsPerPage, filteredMedicines.length)}</span> এর{' '}
                    <span className="font-medium">{filteredMedicines.length}</span> টি ফলাফল
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

      {/* Add Medicine Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">নতুন ওষুধ যোগ করুন</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ওষুধের নাম (বাংলা) *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="যেমন: প্যারাসিটামল"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ওষুধের নাম (ইংরেজি) *</label>
                <input
                  type="text"
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="যেমন: Paracetamol"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">জেনেরিক নাম *</label>
                <input
                  type="text"
                  value={formData.genericName}
                  onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="যেমন: Paracetamol"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ব্র্যান্ড নাম</label>
                <input
                  type="text"
                  value={formData.brandName}
                  onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="যেমন: Napa"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">প্রস্তুতকারক *</label>
                <select
                  value={formData.manufacturer}
                  onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">প্রস্তুতকারক নির্বাচন করুন</option>
                  {manufacturers.map(manufacturer => (
                    <option key={manufacturer} value={manufacturer}>{manufacturer}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ক্যাটাগরি *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">ক্যাটাগরি নির্বাচন করুন</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ডোজেজ ফর্ম *</label>
                <select
                  value={formData.dosageForm}
                  onChange={(e) => setFormData({ ...formData, dosageForm: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">ডোজেজ ফর্ম নির্বাচন করুন</option>
                  {dosageForms.map(form => (
                    <option key={form} value={form}>{form}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">শক্তি/ডোজ *</label>
                <input
                  type="text"
                  value={formData.strength}
                  onChange={(e) => setFormData({ ...formData, strength: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">একক মূল্য (৳)</label>
                <input
                  type="number"
                  value={formData.unitPrice}
                  onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">প্যাক সাইজ</label>
                <input
                  type="text"
                  value={formData.packSize}
                  onChange={(e) => setFormData({ ...formData, packSize: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">স্টক পরিমাণ</label>
                <input
                  type="number"
                  value={formData.stockQuantity}
                  onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">সর্বনিম্ন স্টক</label>
                <input
                  type="number"
                  value={formData.minStockLevel}
                  onChange={(e) => setFormData({ ...formData, minStockLevel: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">মেয়াদ উত্তীর্ণের তারিখ</label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ব্যাচ নম্বর</label>
                <input
                  type="text"
                  value={formData.batchNumber}
                  onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">রেজিস্ট্রেশন নম্বর</label>
                <input
                  type="text"
                  value={formData.registrationNumber}
                  onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">ব্যবহার/ইন্ডিকেশন</label>
                <textarea
                  value={formData.indication}
                  onChange={(e) => setFormData({ ...formData, indication: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">প্রতিনির্দেশনা</label>
                <textarea
                  value={formData.contraindication}
                  onChange={(e) => setFormData({ ...formData, contraindication: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">পার্শ্বপ্রতিক্রিয়া</label>
                <textarea
                  value={formData.sideEffects}
                  onChange={(e) => setFormData({ ...formData, sideEffects: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">ডোজেজ/সেবনবিধি</label>
                <textarea
                  value={formData.dosage}
                  onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">সংরক্ষণ</label>
                <textarea
                  value={formData.storage}
                  onChange={(e) => setFormData({ ...formData, storage: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                />
              </div>
              <div className="md:col-span-3">
                <div className="flex gap-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="edit-isOTC"
                      checked={formData.isOTC}
                      onChange={(e) => setFormData({ ...formData, isOTC: e.target.checked, isPrescriptionOnly: e.target.checked ? false : formData.isPrescriptionOnly })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="edit-isOTC" className="ml-2 block text-sm text-gray-900">
                      ওটিসি (Over The Counter)
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="edit-isPrescriptionOnly"
                      checked={formData.isPrescriptionOnly}
                      onChange={(e) => setFormData({ ...formData, isPrescriptionOnly: e.target.checked, isOTC: e.target.checked ? false : formData.isOTC })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="edit-isPrescriptionOnly" className="ml-2 block text-sm text-gray-900">
                      শুধুমাত্র প্রেসক্রিপশনে
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="edit-isControlled"
                      checked={formData.isControlled}
                      onChange={(e) => setFormData({ ...formData, isControlled: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="edit-isControlled" className="ml-2 block text-sm text-gray-900">
                      নিয়ন্ত্রিত ওষুধ
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="edit-isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="edit-isActive" className="ml-2 block text-sm text-gray-900">
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
                  setSelectedMedicine(null);
                  resetForm();
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                বাতিল
              </button>
              <button
                onClick={handleEditMedicine}
                disabled={!formData.name || !formData.nameEn || !formData.genericName || !formData.manufacturer || !formData.category || !formData.dosageForm || !formData.strength}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                আপডেট করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Medicine Modal */}
      {showViewModal && selectedMedicine && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">ওষুধের বিস্তারিত তথ্য</h2>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedMedicine(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">মূল তথ্য</h3>
                  <div className="space-y-2">
                    <div><span className="font-medium">নাম (বাংলা):</span> {selectedMedicine.name}</div>
                    <div><span className="font-medium">নাম (ইংরেজি):</span> {selectedMedicine.nameEn}</div>
                    <div><span className="font-medium">জেনেরিক নাম:</span> {selectedMedicine.genericName}</div>
                    <div><span className="font-medium">ব্র্যান্ড নাম:</span> {selectedMedicine.brandName}</div>
                    <div><span className="font-medium">প্রস্তুতকারক:</span> {selectedMedicine.manufacturer}</div>
                    <div><span className="font-medium">ক্যাটাগরি:</span> {selectedMedicine.category}</div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">ফর্ম ও মূল্য</h3>
                  <div className="space-y-2">
                    <div><span className="font-medium">ডোজেজ ফর্ম:</span> {selectedMedicine.dosageForm}</div>
                    <div><span className="font-medium">শক্তি:</span> {selectedMedicine.strength}</div>
                    <div><span className="font-medium">একক মূল্য:</span> ৳{selectedMedicine.unitPrice}</div>
                    <div><span className="font-medium">প্যাক সাইজ:</span> {selectedMedicine.packSize}</div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">স্টক তথ্য</h3>
                  <div className="space-y-2">
                    <div><span className="font-medium">বর্তমান স্টক:</span> 
                      <span className={isLowStock(selectedMedicine) ? 'text-red-600 font-bold' : 'text-green-600'}>
                        {selectedMedicine.stockQuantity}
                      </span>
                    </div>
                    <div><span className="font-medium">সর্বনিম্ন স্টক:</span> {selectedMedicine.minStockLevel}</div>
                    <div><span className="font-medium">মোট মূল্য:</span> ৳{(selectedMedicine.unitPrice * selectedMedicine.stockQuantity).toFixed(2)}</div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">ব্যবহার ও নির্দেশনা</h3>
                  <div className="space-y-2">
                    <div><span className="font-medium">ব্যবহার:</span> {selectedMedicine.indication}</div>
                    <div><span className="font-medium">ডোজেজ:</span> {selectedMedicine.dosage}</div>
                    <div><span className="font-medium">প্রতিনির্দেশনা:</span> {selectedMedicine.contraindication}</div>
                    <div><span className="font-medium">পার্শ্বপ্রতিক্রিয়া:</span> {selectedMedicine.sideEffects}</div>
                    <div><span className="font-medium">সংরক্ষণ:</span> {selectedMedicine.storage}</div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">নিয়ন্ত্রণ তথ্য</h3>
                  <div className="space-y-2">
                    <div><span className="font-medium">মেয়াদ:</span> {selectedMedicine.expiryDate}</div>
                    <div><span className="font-medium">ব্যাচ নম্বর:</span> {selectedMedicine.batchNumber}</div>
                    <div><span className="font-medium">রেজিস্ট্রেশন নম্বর:</span> {selectedMedicine.registrationNumber}</div>
                    <div><span className="font-medium">ধরন:</span> 
                      <span className={`ml-2 px-2 py-1 rounded text-xs ${getTypeColor(selectedMedicine)}`}>
                        {getTypeLabel(selectedMedicine)}
                      </span>
                    </div>
                    <div><span className="font-medium">স্ট্যাটাস:</span> 
                      <span className={`ml-2 px-2 py-1 rounded text-xs ${
                        selectedMedicine.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedMedicine.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">তারিখ</h3>
                  <div className="space-y-2">
                    <div><span className="font-medium">তৈরি:</span> {selectedMedicine.createdAt}</div>
                    <div><span className="font-medium">আপডেট:</span> {selectedMedicine.updatedAt}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicineManagement;