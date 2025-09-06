// Medicine History Tracker Component - ওষুধের ইতিহাস ট্র্যাকার কম্পোনেন্ট
import React, { useState, useEffect } from 'react';
import { Pill, Clock, Calendar, TrendingUp, AlertCircle, CheckCircle, Plus, Search, Filter, Edit, Trash2, Star, Activity } from 'lucide-react';
import dataStorageService, { MedicineRecord } from '../services/dataStorageService';

interface MedicineHistoryTrackerProps {
  userId?: string;
  onClose?: () => void;
}

const MedicineHistoryTracker: React.FC<MedicineHistoryTrackerProps> = ({ 
  userId = 'default-user-id', 
  onClose 
}) => {
  // States
  const [medicines, setMedicines] = useState<MedicineRecord[]>([]);
  const [filteredMedicines, setFilteredMedicines] = useState<MedicineRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<string | null>(null);

  // New Medicine Form State
  const [newMedicine, setNewMedicine] = useState({
    medicineName: '',
    genericName: '',
    dosage: '',
    frequency: '',
    duration: '',
    prescribedBy: '',
    prescribedDate: new Date().toISOString().split('T')[0],
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    purpose: '',
    sideEffects: [''],
    effectiveness: 'effective' as const,
    adherence: 100,
    notes: '',
    status: 'active' as const
  });

  // Load medicines on component mount
  useEffect(() => {
    loadMedicines();
  }, [userId]);

  // Filter medicines when search term or filter status changes
  useEffect(() => {
    filterMedicines();
  }, [medicines, searchTerm, filterStatus]);

  // Load medicines from storage
  const loadMedicines = () => {
    try {
      const userMedicines = dataStorageService.getMedicineRecords(userId);
      setMedicines(userMedicines);
    } catch (error) {
      console.error('Error loading medicines:', error);
    }
  };

  // Filter medicines based on search and status
  const filterMedicines = () => {
    let filtered = medicines;

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(medicine => medicine.status === filterStatus);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(medicine => 
        medicine.medicineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medicine.genericName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medicine.prescribedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medicine.purpose.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredMedicines(filtered);
  };

  // Add side effect
  const addSideEffect = () => {
    setNewMedicine(prev => ({
      ...prev,
      sideEffects: [...prev.sideEffects, '']
    }));
  };

  // Update side effect
  const updateSideEffect = (index: number, value: string) => {
    setNewMedicine(prev => ({
      ...prev,
      sideEffects: prev.sideEffects.map((effect, i) => 
        i === index ? value : effect
      )
    }));
  };

  // Remove side effect
  const removeSideEffect = (index: number) => {
    setNewMedicine(prev => ({
      ...prev,
      sideEffects: prev.sideEffects.filter((_, i) => i !== index)
    }));
  };

  // Save new medicine
  const saveMedicine = async () => {
    setIsLoading(true);
    try {
      const medicineData = {
        ...newMedicine,
        userId,
        prescribedDate: new Date(newMedicine.prescribedDate),
        startDate: new Date(newMedicine.startDate),
        endDate: newMedicine.endDate ? new Date(newMedicine.endDate) : undefined,
        sideEffects: newMedicine.sideEffects.filter(effect => effect.trim())
      };

      if (editingMedicine) {
        // Update existing medicine
        dataStorageService.updateMedicineRecord(editingMedicine, medicineData);
        setEditingMedicine(null);
      } else {
        // Save new medicine
        dataStorageService.saveMedicineRecord(medicineData);
      }
      
      loadMedicines();
      setShowAddForm(false);
      resetForm();
      alert('ওষুধের তথ্য সফলভাবে সংরক্ষিত হয়েছে!');
    } catch (error) {
      console.error('Error saving medicine:', error);
      alert('ওষুধের তথ্য সংরক্ষণে সমস্যা হয়েছে।');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setNewMedicine({
      medicineName: '',
      genericName: '',
      dosage: '',
      frequency: '',
      duration: '',
      prescribedBy: '',
      prescribedDate: new Date().toISOString().split('T')[0],
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      purpose: '',
      sideEffects: [''],
      effectiveness: 'effective',
      adherence: 100,
      notes: '',
      status: 'active'
    });
  };

  // Edit medicine
  const editMedicine = (medicine: MedicineRecord) => {
    setNewMedicine({
      medicineName: medicine.medicineName,
      genericName: medicine.genericName || '',
      dosage: medicine.dosage,
      frequency: medicine.frequency,
      duration: medicine.duration,
      prescribedBy: medicine.prescribedBy,
      prescribedDate: new Date(medicine.prescribedDate).toISOString().split('T')[0],
      startDate: new Date(medicine.startDate).toISOString().split('T')[0],
      endDate: medicine.endDate ? new Date(medicine.endDate).toISOString().split('T')[0] : '',
      purpose: medicine.purpose,
      sideEffects: medicine.sideEffects || [''],
      effectiveness: medicine.effectiveness || 'effective',
      adherence: medicine.adherence || 100,
      notes: medicine.notes || '',
      status: medicine.status
    });
    setEditingMedicine(medicine.id);
    setShowAddForm(true);
  };

  // Update medicine status
  const updateMedicineStatus = (medicineId: string, status: 'active' | 'completed' | 'discontinued') => {
    try {
      dataStorageService.updateMedicineRecord(medicineId, { status });
      loadMedicines();
    } catch (error) {
      console.error('Error updating medicine status:', error);
    }
  };

  // Update adherence
  const updateAdherence = (medicineId: string, adherence: number) => {
    try {
      dataStorageService.updateMedicineRecord(medicineId, { adherence });
      loadMedicines();
    } catch (error) {
      console.error('Error updating adherence:', error);
    }
  };

  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      case 'discontinued': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Get effectiveness color
  const getEffectivenessColor = (effectiveness: string) => {
    switch (effectiveness) {
      case 'very_effective': return 'text-green-700 bg-green-200';
      case 'effective': return 'text-green-600 bg-green-100';
      case 'moderate': return 'text-yellow-600 bg-yellow-100';
      case 'ineffective': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Get adherence color
  const getAdherenceColor = (adherence: number) => {
    if (adherence >= 90) return 'text-green-600 bg-green-100';
    if (adherence >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  // Calculate statistics
  const getStatistics = () => {
    const total = medicines.length;
    const active = medicines.filter(m => m.status === 'active').length;
    const completed = medicines.filter(m => m.status === 'completed').length;
    const discontinued = medicines.filter(m => m.status === 'discontinued').length;
    const avgAdherence = medicines.length > 0 
      ? medicines.reduce((sum, m) => sum + (m.adherence || 0), 0) / medicines.length 
      : 0;

    return { total, active, completed, discontinued, avgAdherence };
  };

  const stats = getStatistics();

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Pill className="w-6 h-6 text-blue-600" />
          ওষুধের ইতিহাস ট্র্যাকার
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            নতুন ওষুধ
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              বন্ধ করুন
            </button>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">মোট ওষুধ</p>
              <p className="text-2xl font-bold text-blue-700">{stats.total}</p>
            </div>
            <Pill className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">চলমান</p>
              <p className="text-2xl font-bold text-green-700">{stats.active}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">সম্পন্ন</p>
              <p className="text-2xl font-bold text-blue-700">{stats.completed}</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">বন্ধ</p>
              <p className="text-2xl font-bold text-red-700">{stats.discontinued}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">গড় মেনে চলা</p>
              <p className="text-2xl font-bold text-purple-700">{stats.avgAdherence.toFixed(0)}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="ওষুধ খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
          >
            <option value="all">সব অবস্থা</option>
            <option value="active">চলমান</option>
            <option value="completed">সম্পন্ন</option>
            <option value="discontinued">বন্ধ</option>
          </select>
        </div>
      </div>

      {/* Medicines List */}
      <div className="grid gap-4 mb-6">
        {filteredMedicines.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Pill className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>কোনো ওষুধের তথ্য পাওয়া যায়নি।</p>
          </div>
        ) : (
          filteredMedicines.map(medicine => (
            <div key={medicine.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">{medicine.medicineName}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(medicine.status)}`}>
                      {medicine.status === 'active' ? 'চলমান' : 
                       medicine.status === 'completed' ? 'সম্পন্ন' : 'বন্ধ'}
                    </span>
                  </div>
                  {medicine.genericName && (
                    <p className="text-sm text-gray-600 mb-2">জেনেরিক: {medicine.genericName}</p>
                  )}
                  <p className="text-gray-700 mb-2">{medicine.purpose}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">ডোজ:</span> {medicine.dosage}
                    </div>
                    <div>
                      <span className="font-medium">ফ্রিকোয়েন্সি:</span> {medicine.frequency}
                    </div>
                    <div>
                      <span className="font-medium">সময়কাল:</span> {medicine.duration}
                    </div>
                    <div>
                      <span className="font-medium">ডাক্তার:</span> {medicine.prescribedBy}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => setSelectedMedicine(medicine.id)}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                    title="বিস্তারিত দেখুন"
                  >
                    <Activity className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => editMedicine(medicine)}
                    className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                    title="সম্পাদনা করুন"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {/* Progress and Effectiveness */}
              <div className="border-t pt-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700">মেনে চলা</span>
                      <span className={`text-xs px-2 py-1 rounded ${getAdherenceColor(medicine.adherence || 0)}`}>
                        {medicine.adherence || 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${medicine.adherence || 0}%` }}
                      ></div>
                    </div>
                  </div>
                  {medicine.effectiveness && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">কার্যকারিতা</span>
                      <div className="mt-1">
                        <span className={`text-xs px-2 py-1 rounded ${getEffectivenessColor(medicine.effectiveness)}`}>
                          {medicine.effectiveness === 'very_effective' ? 'অত্যন্ত কার্যকর' :
                           medicine.effectiveness === 'effective' ? 'কার্যকর' :
                           medicine.effectiveness === 'moderate' ? 'মাঝারি' : 'অকার্যকর'}
                        </span>
                      </div>
                    </div>
                  )}
                  <div>
                    <span className="text-sm font-medium text-gray-700">তারিখ</span>
                    <p className="text-xs text-gray-600 mt-1">
                      শুরু: {formatDate(medicine.startDate)}
                      {medicine.endDate && (
                        <><br />শেষ: {formatDate(medicine.endDate)}</>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Actions for Active Medicines */}
              {medicine.status === 'active' && (
                <div className="border-t pt-3 mt-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => updateMedicineStatus(medicine.id, 'completed')}
                      className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full hover:bg-green-200 transition-colors"
                    >
                      সম্পন্ন করুন
                    </button>
                    <button
                      onClick={() => updateMedicineStatus(medicine.id, 'discontinued')}
                      className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full hover:bg-red-200 transition-colors"
                    >
                      বন্ধ করুন
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={medicine.adherence || 100}
                      onChange={(e) => updateAdherence(medicine.id, parseInt(e.target.value))}
                      className="w-20 h-6"
                      title="মেনে চলার হার আপডেট করুন"
                    />
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Medicine Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">
                {editingMedicine ? 'ওষুধের তথ্য সম্পাদনা করুন' : 'নতুন ওষুধ যোগ করুন'}
              </h3>
              
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ওষুধের নাম *</label>
                  <input
                    type="text"
                    value={newMedicine.medicineName}
                    onChange={(e) => setNewMedicine(prev => ({ ...prev, medicineName: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="যেমন: প্যারাসিটামল"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">জেনেরিক নাম</label>
                  <input
                    type="text"
                    value={newMedicine.genericName}
                    onChange={(e) => setNewMedicine(prev => ({ ...prev, genericName: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="জেনেরিক নাম"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ডোজ *</label>
                  <input
                    type="text"
                    value={newMedicine.dosage}
                    onChange={(e) => setNewMedicine(prev => ({ ...prev, dosage: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="যেমন: ৫০০ মিগ্রা"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ফ্রিকোয়েন্সি *</label>
                  <input
                    type="text"
                    value={newMedicine.frequency}
                    onChange={(e) => setNewMedicine(prev => ({ ...prev, frequency: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="যেমন: দিনে ৩ বার"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">সময়কাল *</label>
                  <input
                    type="text"
                    value={newMedicine.duration}
                    onChange={(e) => setNewMedicine(prev => ({ ...prev, duration: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="যেমন: ৭ দিন"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ডাক্তারের নাম *</label>
                  <input
                    type="text"
                    value={newMedicine.prescribedBy}
                    onChange={(e) => setNewMedicine(prev => ({ ...prev, prescribedBy: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="ডাক্তারের নাম"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">প্রেসক্রিপশনের তারিখ</label>
                  <input
                    type="date"
                    value={newMedicine.prescribedDate}
                    onChange={(e) => setNewMedicine(prev => ({ ...prev, prescribedDate: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">শুরুর তারিখ</label>
                  <input
                    type="date"
                    value={newMedicine.startDate}
                    onChange={(e) => setNewMedicine(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">শেষের তারিখ</label>
                  <input
                    type="date"
                    value={newMedicine.endDate}
                    onChange={(e) => setNewMedicine(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">অবস্থা</label>
                  <select
                    value={newMedicine.status}
                    onChange={(e) => setNewMedicine(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">চলমান</option>
                    <option value="completed">সম্পন্ন</option>
                    <option value="discontinued">বন্ধ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">কার্যকারিতা</label>
                  <select
                    value={newMedicine.effectiveness}
                    onChange={(e) => setNewMedicine(prev => ({ ...prev, effectiveness: e.target.value as any }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="very_effective">অত্যন্ত কার্যকর</option>
                    <option value="effective">কার্যকর</option>
                    <option value="moderate">মাঝারি</option>
                    <option value="ineffective">অকার্যকর</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">মেনে চলার হার (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newMedicine.adherence}
                    onChange={(e) => setNewMedicine(prev => ({ ...prev, adherence: parseInt(e.target.value) || 0 }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Purpose */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">ব্যবহারের উদ্দেশ্য *</label>
                <textarea
                  value={newMedicine.purpose}
                  onChange={(e) => setNewMedicine(prev => ({ ...prev, purpose: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="কেন এই ওষুধ ব্যবহার করা হচ্ছে"
                  required
                />
              </div>

              {/* Side Effects */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-semibold">পার্শ্বপ্রতিক্রিয়া</h4>
                  <button
                    onClick={addSideEffect}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                  >
                    + যোগ করুন
                  </button>
                </div>
                {newMedicine.sideEffects.map((effect, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="পার্শ্বপ্রতিক্রিয়া লিখুন"
                      value={effect}
                      onChange={(e) => updateSideEffect(index, e.target.value)}
                      className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    {newMedicine.sideEffects.length > 1 && (
                      <button
                        onClick={() => removeSideEffect(index)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Notes */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">অতিরিক্ত নোট</label>
                <textarea
                  value={newMedicine.notes}
                  onChange={(e) => setNewMedicine(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="অতিরিক্ত তথ্য বা মন্তব্য"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingMedicine(null);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled={isLoading}
                >
                  বাতিল
                </button>
                <button
                  onClick={saveMedicine}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  disabled={isLoading || !newMedicine.medicineName || !newMedicine.dosage || !newMedicine.frequency || !newMedicine.duration || !newMedicine.prescribedBy || !newMedicine.purpose}
                >
                  {isLoading ? 'সংরক্ষণ করা হচ্ছে...' : editingMedicine ? 'আপডেট করুন' : 'সংরক্ষণ করুন'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Medicine Details Modal */}
      {selectedMedicine && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {(() => {
              const medicine = medicines.find(m => m.id === selectedMedicine);
              if (!medicine) return null;
              
              return (
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">{medicine.medicineName}</h3>
                      {medicine.genericName && (
                        <p className="text-gray-600">জেনেরিক: {medicine.genericName}</p>
                      )}
                    </div>
                    <button
                      onClick={() => setSelectedMedicine(null)}
                      className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                      ×
                    </button>
                  </div>

                  {/* Medicine Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">ডোজ ও সেবনবিধি</h4>
                        <div className="bg-gray-50 p-3 rounded">
                          <p><strong>ডোজ:</strong> {medicine.dosage}</p>
                          <p><strong>ফ্রিকোয়েন্সি:</strong> {medicine.frequency}</p>
                          <p><strong>সময়কাল:</strong> {medicine.duration}</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">প্রেসক্রিপশন তথ্য</h4>
                        <div className="bg-gray-50 p-3 rounded">
                          <p><strong>ডাক্তার:</strong> {medicine.prescribedBy}</p>
                          <p><strong>প্রেসক্রিপশনের তারিখ:</strong> {formatDate(medicine.prescribedDate)}</p>
                          <p><strong>শুরুর তারিখ:</strong> {formatDate(medicine.startDate)}</p>
                          {medicine.endDate && (
                            <p><strong>শেষের তারিখ:</strong> {formatDate(medicine.endDate)}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">অবস্থা ও কার্যকারিতা</h4>
                        <div className="bg-gray-50 p-3 rounded">
                          <div className="flex items-center gap-2 mb-2">
                            <span>অবস্থা:</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(medicine.status)}`}>
                              {medicine.status === 'active' ? 'চলমান' : 
                               medicine.status === 'completed' ? 'সম্পন্ন' : 'বন্ধ'}
                            </span>
                          </div>
                          {medicine.effectiveness && (
                            <div className="flex items-center gap-2 mb-2">
                              <span>কার্যকারিতা:</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEffectivenessColor(medicine.effectiveness)}`}>
                                {medicine.effectiveness === 'very_effective' ? 'অত্যন্ত কার্যকর' :
                                 medicine.effectiveness === 'effective' ? 'কার্যকর' :
                                 medicine.effectiveness === 'moderate' ? 'মাঝারি' : 'অকার্যকর'}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <span>মেনে চলার হার:</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAdherenceColor(medicine.adherence || 0)}`}>
                              {medicine.adherence || 0}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Purpose */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-700 mb-2">ব্যবহারের উদ্দেশ্য</h4>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded">{medicine.purpose}</p>
                  </div>

                  {/* Side Effects */}
                  {medicine.sideEffects && medicine.sideEffects.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-700 mb-2">পার্শ্বপ্রতিক্রিয়া</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-700 bg-gray-50 p-3 rounded">
                        {medicine.sideEffects.map((effect, index) => (
                          <li key={index}>{effect}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Notes */}
                  {medicine.notes && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-700 mb-2">অতিরিক্ত নোট</h4>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded">{medicine.notes}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-end gap-4 pt-4 border-t">
                    <button
                      onClick={() => editMedicine(medicine)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      সম্পাদনা
                    </button>
                    <button
                      onClick={() => setSelectedMedicine(null)}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                    >
                      বন্ধ করুন
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicineHistoryTracker;