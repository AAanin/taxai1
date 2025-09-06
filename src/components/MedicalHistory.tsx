import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Calendar, User, FileText, X } from 'lucide-react';

interface MedicalRecord {
  id: string;
  date: string;
  diagnosis: string;
  symptoms: string;
  treatment: string;
  doctor: string;
  hospital: string;
  notes: string;
  createdAt: string;
}

interface MedicalHistoryProps {
  language: 'bn' | 'en';
  onClose: () => void;
}

const MedicalHistory: React.FC<MedicalHistoryProps> = ({ language, onClose }) => {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MedicalRecord | null>(null);
  const [formData, setFormData] = useState({
    date: '',
    diagnosis: '',
    symptoms: '',
    treatment: '',
    doctor: '',
    hospital: '',
    notes: ''
  });

  useEffect(() => {
    loadMedicalHistory();
  }, []);

  const loadMedicalHistory = () => {
    const saved = localStorage.getItem('medicalHistory');
    if (saved) {
      setRecords(JSON.parse(saved));
    }
  };

  const saveMedicalHistory = (newRecords: MedicalRecord[]) => {
    localStorage.setItem('medicalHistory', JSON.stringify(newRecords));
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
      saveMedicalHistory(updatedRecords);
      setEditingRecord(null);
    } else {
      // Add new record
      const newRecord: MedicalRecord = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString()
      };
      saveMedicalHistory([...records, newRecord]);
    }
    
    setFormData({
      date: '',
      diagnosis: '',
      symptoms: '',
      treatment: '',
      doctor: '',
      hospital: '',
      notes: ''
    });
    setShowForm(false);
  };

  const handleEdit = (record: MedicalRecord) => {
    setEditingRecord(record);
    setFormData({
      date: record.date,
      diagnosis: record.diagnosis,
      symptoms: record.symptoms,
      treatment: record.treatment,
      doctor: record.doctor,
      hospital: record.hospital,
      notes: record.notes
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm(language === 'bn' ? 'এই রেকর্ডটি মুছে ফেলতে চান?' : 'Are you sure you want to delete this record?')) {
      const updatedRecords = records.filter(record => record.id !== id);
      saveMedicalHistory(updatedRecords);
    }
  };

  const texts = {
    bn: {
      title: 'চিকিৎসা ইতিহাস',
      addNew: 'নতুন রেকর্ড যোগ করুন',
      date: 'তারিখ',
      diagnosis: 'রোগ নির্ণয়',
      symptoms: 'লক্ষণসমূহ',
      treatment: 'চিকিৎসা',
      doctor: 'ডাক্তারের নাম',
      hospital: 'হাসপাতাল/ক্লিনিক',
      notes: 'অতিরিক্ত তথ্য',
      save: 'সংরক্ষণ করুন',
      cancel: 'বাতিল',
      edit: 'সম্পাদনা',
      delete: 'মুছুন',
      noRecords: 'কোন চিকিৎসা রেকর্ড পাওয়া যায়নি',
      addFirst: 'প্রথম রেকর্ড যোগ করুন'
    },
    en: {
      title: 'Medical History',
      addNew: 'Add New Record',
      date: 'Date',
      diagnosis: 'Diagnosis',
      symptoms: 'Symptoms',
      treatment: 'Treatment',
      doctor: 'Doctor Name',
      hospital: 'Hospital/Clinic',
      notes: 'Additional Notes',
      save: 'Save',
      cancel: 'Cancel',
      edit: 'Edit',
      delete: 'Delete',
      noRecords: 'No medical records found',
      addFirst: 'Add your first record'
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
        {/* Add New Button */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="mb-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className={language === 'bn' ? 'bangla-text' : 'english-text'}>
              {t.addNew}
            </span>
          </button>
        )}

        {/* Form */}
        {showForm && (
          <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-1 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                    {t.date}
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-1 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                    {t.doctor}
                  </label>
                  <input
                    type="text"
                    value={formData.doctor}
                    onChange={(e) => setFormData({...formData, doctor: e.target.value})}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-1 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                  {t.diagnosis}
                </label>
                <input
                  type="text"
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({...formData, diagnosis: e.target.value})}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}
                  required
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-1 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                  {t.symptoms}
                </label>
                <textarea
                  value={formData.symptoms}
                  onChange={(e) => setFormData({...formData, symptoms: e.target.value})}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}
                  rows={3}
                  required
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-1 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                  {t.treatment}
                </label>
                <textarea
                  value={formData.treatment}
                  onChange={(e) => setFormData({...formData, treatment: e.target.value})}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}
                  rows={3}
                  required
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-1 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                  {t.hospital}
                </label>
                <input
                  type="text"
                  value={formData.hospital}
                  onChange={(e) => setFormData({...formData, hospital: e.target.value})}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}
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
                      date: '',
                      diagnosis: '',
                      symptoms: '',
                      treatment: '',
                      doctor: '',
                      hospital: '',
                      notes: ''
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
        {records.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className={`text-gray-500 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
              {t.noRecords}
            </p>
            <p className={`text-sm text-gray-400 mt-2 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
              {t.addFirst}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {records.map((record) => (
              <div key={record.id} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-gray-600">{record.date}</span>
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className={`font-semibold text-gray-800 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                      {t.diagnosis}
                    </h4>
                    <p className={`text-gray-600 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                      {record.diagnosis}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className={`font-semibold text-gray-800 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                      {t.doctor}
                    </h4>
                    <p className={`text-gray-600 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                      {record.doctor}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className={`font-semibold text-gray-800 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                      {t.symptoms}
                    </h4>
                    <p className={`text-gray-600 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                      {record.symptoms}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className={`font-semibold text-gray-800 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                      {t.treatment}
                    </h4>
                    <p className={`text-gray-600 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                      {record.treatment}
                    </p>
                  </div>
                  
                  {record.hospital && (
                    <div>
                      <h4 className={`font-semibold text-gray-800 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                        {t.hospital}
                      </h4>
                      <p className={`text-gray-600 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                        {record.hospital}
                      </p>
                    </div>
                  )}
                  
                  {record.notes && (
                    <div className="md:col-span-2">
                      <h4 className={`font-semibold text-gray-800 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
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

export default MedicalHistory;