import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Calendar, Pill, Clock, X, AlertCircle } from 'lucide-react';

interface MedicineRecord {
  id: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  startDate: string;
  endDate: string;
  prescribedBy: string;
  purpose: string;
  sideEffects: string;
  notes: string;
  status: 'active' | 'completed' | 'discontinued';
  createdAt: string;
}

interface MedicineHistoryProps {
  language: 'bn' | 'en';
  onClose: () => void;
}

const MedicineHistory: React.FC<MedicineHistoryProps> = ({ language, onClose }) => {
  const [records, setRecords] = useState<MedicineRecord[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MedicineRecord | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed' | 'discontinued'>('all');
  const [formData, setFormData] = useState({
    medicineName: '',
    dosage: '',
    frequency: '',
    duration: '',
    startDate: '',
    endDate: '',
    prescribedBy: '',
    purpose: '',
    sideEffects: '',
    notes: '',
    status: 'active' as 'active' | 'completed' | 'discontinued'
  });

  useEffect(() => {
    loadMedicineHistory();
  }, []);

  const loadMedicineHistory = () => {
    const saved = localStorage.getItem('medicineHistory');
    if (saved) {
      setRecords(JSON.parse(saved));
    }
  };

  const saveMedicineHistory = (newRecords: MedicineRecord[]) => {
    localStorage.setItem('medicineHistory', JSON.stringify(newRecords));
    setRecords(newRecords);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingRecord) {
      // Update existing record
      const updatedRecords = records.map(record => 
        record.id === editingRecord.id 
          ? { ...editingRecord, ...formData }
          : record
      );
      saveMedicineHistory(updatedRecords);
      setEditingRecord(null);
    } else {
      // Add new record
      const newRecord: MedicineRecord = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString()
      };
      saveMedicineHistory([...records, newRecord]);
    }
    
    setFormData({
      medicineName: '',
      dosage: '',
      frequency: '',
      duration: '',
      startDate: '',
      endDate: '',
      prescribedBy: '',
      purpose: '',
      sideEffects: '',
      notes: '',
      status: 'active'
    });
    setShowForm(false);
  };

  const handleEdit = (record: MedicineRecord) => {
    setEditingRecord(record);
    setFormData({
      medicineName: record.medicineName,
      dosage: record.dosage,
      frequency: record.frequency,
      duration: record.duration,
      startDate: record.startDate,
      endDate: record.endDate,
      prescribedBy: record.prescribedBy,
      purpose: record.purpose,
      sideEffects: record.sideEffects,
      notes: record.notes,
      status: record.status
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm(language === 'bn' ? 'এই ওষুধের রেকর্ডটি মুছে ফেলতে চান?' : 'Are you sure you want to delete this medicine record?')) {
      const updatedRecords = records.filter(record => record.id !== id);
      saveMedicineHistory(updatedRecords);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'discontinued': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRecords = filterStatus === 'all' 
    ? records 
    : records.filter(record => record.status === filterStatus);

  const texts = {
    bn: {
      title: 'ওষুধের ইতিহাস',
      addNew: 'নতুন ওষুধ যোগ করুন',
      medicineName: 'ওষুধের নাম',
      dosage: 'ডোজ',
      frequency: 'সেবনের নিয়ম',
      duration: 'সময়কাল',
      startDate: 'শুরুর তারিখ',
      endDate: 'শেষের তারিখ',
      prescribedBy: 'প্রেসক্রাইবকারী ডাক্তার',
      purpose: 'ব্যবহারের কারণ',
      sideEffects: 'পার্শ্বপ্রতিক্রিয়া',
      notes: 'অতিরিক্ত তথ্য',
      status: 'অবস্থা',
      active: 'চলমান',
      completed: 'সম্পন্ন',
      discontinued: 'বন্ধ',
      all: 'সব',
      save: 'সংরক্ষণ করুন',
      cancel: 'বাতিল',
      edit: 'সম্পাদনা',
      delete: 'মুছুন',
      filter: 'ফিল্টার',
      noRecords: 'কোন ওষুধের রেকর্ড পাওয়া যায়নি',
      addFirst: 'প্রথম ওষুধের রেকর্ড যোগ করুন'
    },
    en: {
      title: 'Medicine History',
      addNew: 'Add New Medicine',
      medicineName: 'Medicine Name',
      dosage: 'Dosage',
      frequency: 'Frequency',
      duration: 'Duration',
      startDate: 'Start Date',
      endDate: 'End Date',
      prescribedBy: 'Prescribed By',
      purpose: 'Purpose',
      sideEffects: 'Side Effects',
      notes: 'Additional Notes',
      status: 'Status',
      active: 'Active',
      completed: 'Completed',
      discontinued: 'Discontinued',
      all: 'All',
      save: 'Save',
      cancel: 'Cancel',
      edit: 'Edit',
      delete: 'Delete',
      filter: 'Filter',
      noRecords: 'No medicine records found',
      addFirst: 'Add your first medicine record'
    }
  };

  const t = texts[language];

  return (
    <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className={`text-xl font-semibold ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
          {t.title}
        </h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 p-1"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-4">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-2 sm:space-y-0">
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className={language === 'bn' ? 'bangla-text' : 'english-text'}>
                {t.addNew}
              </span>
            </button>
          )}
          
          {/* Filter */}
          <div className="flex items-center space-x-2">
            <span className={`text-sm text-gray-600 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
              {t.filter}:
            </span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className={`px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}
            >
              <option value="all">{t.all}</option>
              <option value="active">{t.active}</option>
              <option value="completed">{t.completed}</option>
              <option value="discontinued">{t.discontinued}</option>
            </select>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-1 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                    {t.medicineName}
                  </label>
                  <input
                    type="text"
                    value={formData.medicineName}
                    onChange={(e) => setFormData({...formData, medicineName: e.target.value})}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}
                    required
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-1 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                    {t.dosage}
                  </label>
                  <input
                    type="text"
                    value={formData.dosage}
                    onChange={(e) => setFormData({...formData, dosage: e.target.value})}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}
                    placeholder={language === 'bn' ? 'যেমন: ১ ট্যাবলেট' : 'e.g., 1 tablet'}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-1 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                    {t.frequency}
                  </label>
                  <input
                    type="text"
                    value={formData.frequency}
                    onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}
                    placeholder={language === 'bn' ? 'যেমন: দিনে ৩ বার' : 'e.g., 3 times daily'}
                    required
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-1 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                    {t.duration}
                  </label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}
                    placeholder={language === 'bn' ? 'যেমন: ৭ দিন' : 'e.g., 7 days'}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-1 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                    {t.startDate}
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-1 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                    {t.endDate}
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-1 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                    {t.prescribedBy}
                  </label>
                  <input
                    type="text"
                    value={formData.prescribedBy}
                    onChange={(e) => setFormData({...formData, prescribedBy: e.target.value})}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}
                    required
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-1 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                    {t.status}
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}
                  >
                    <option value="active">{t.active}</option>
                    <option value="completed">{t.completed}</option>
                    <option value="discontinued">{t.discontinued}</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-1 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                  {t.purpose}
                </label>
                <textarea
                  value={formData.purpose}
                  onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}
                  rows={2}
                  required
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-1 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                  {t.sideEffects}
                </label>
                <textarea
                  value={formData.sideEffects}
                  onChange={(e) => setFormData({...formData, sideEffects: e.target.value})}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}
                  rows={2}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-1 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                  {t.notes}
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}
                  rows={2}
                />
              </div>
              
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <span className={language === 'bn' ? 'bangla-text' : 'english-text'}>
                    {t.save}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingRecord(null);
                    setFormData({
                      medicineName: '',
                      dosage: '',
                      frequency: '',
                      duration: '',
                      startDate: '',
                      endDate: '',
                      prescribedBy: '',
                      purpose: '',
                      sideEffects: '',
                      notes: '',
                      status: 'active'
                    });
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <span className={language === 'bn' ? 'bangla-text' : 'english-text'}>
                    {t.cancel}
                  </span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Records List */}
        {filteredRecords.length === 0 ? (
          <div className="text-center py-8">
            <Pill className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className={`text-gray-500 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
              {t.noRecords}
            </p>
            <p className={`text-sm text-gray-400 mt-2 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
              {t.addFirst}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRecords.map((record) => (
              <div key={record.id} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-3">
                    <Pill className="w-5 h-5 text-blue-500" />
                    <div>
                      <h3 className={`font-semibold text-lg ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                        {record.medicineName}
                      </h3>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)} ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                        {t[record.status as keyof typeof t]}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(record)}
                      className="text-blue-500 hover:text-blue-700 p-1"
                      title={t.edit}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(record.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title={t.delete}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <h4 className={`font-semibold text-gray-800 text-sm ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                      {t.dosage}
                    </h4>
                    <p className={`text-gray-600 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                      {record.dosage}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className={`font-semibold text-gray-800 text-sm ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                      {t.frequency}
                    </h4>
                    <p className={`text-gray-600 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                      {record.frequency}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className={`font-semibold text-gray-800 text-sm ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                      {t.duration}
                    </h4>
                    <p className={`text-gray-600 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                      {record.duration}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className={`font-semibold text-gray-800 text-sm ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                      {t.startDate}
                    </h4>
                    <p className="text-gray-600">{record.startDate}</p>
                  </div>
                  
                  {record.endDate && (
                    <div>
                      <h4 className={`font-semibold text-gray-800 text-sm ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                        {t.endDate}
                      </h4>
                      <p className="text-gray-600">{record.endDate}</p>
                    </div>
                  )}
                  
                  <div>
                    <h4 className={`font-semibold text-gray-800 text-sm ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                      {t.prescribedBy}
                    </h4>
                    <p className={`text-gray-600 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                      {record.prescribedBy}
                    </p>
                  </div>
                  
                  <div className="md:col-span-2 lg:col-span-3">
                    <h4 className={`font-semibold text-gray-800 text-sm ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                      {t.purpose}
                    </h4>
                    <p className={`text-gray-600 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                      {record.purpose}
                    </p>
                  </div>
                  
                  {record.sideEffects && (
                    <div className="md:col-span-2 lg:col-span-3">
                      <h4 className={`font-semibold text-gray-800 text-sm flex items-center space-x-1 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                        <AlertCircle className="w-4 h-4 text-orange-500" />
                        <span>{t.sideEffects}</span>
                      </h4>
                      <p className={`text-gray-600 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                        {record.sideEffects}
                      </p>
                    </div>
                  )}
                  
                  {record.notes && (
                    <div className="md:col-span-2 lg:col-span-3">
                      <h4 className={`font-semibold text-gray-800 text-sm ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                        {t.notes}
                      </h4>
                      <p className={`text-gray-600 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                        {record.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicineHistory;