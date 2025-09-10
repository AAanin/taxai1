import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import PrescriptionForm from '../components/prescriptions/PrescriptionForm';
import PrescriptionList from '../components/prescriptions/PrescriptionList';
import { FileText, Plus, List, Pill, Calendar, User, Building } from 'lucide-react';

interface Medicine {
  id?: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

interface Prescription {
  id: string;
  user_id: string;
  doctor_name: string;
  doctor_specialty?: string;
  hospital_name?: string;
  prescription_date: string;
  diagnosis?: string;
  notes?: string;
  medicines: Medicine[];
  follow_up_date?: string;
  created_at: string;
  updated_at: string;
}

const PrescriptionsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'list' | 'new' | 'edit'>('list');
  const [editingPrescription, setEditingPrescription] = useState<Prescription | null>(null);
  const [viewingPrescription, setViewingPrescription] = useState<Prescription | null>(null);

  const handleNewPrescription = () => {
    setEditingPrescription(null);
    setActiveTab('new');
  };

  const handleEditPrescription = (prescription: Prescription) => {
    setEditingPrescription(prescription);
    setActiveTab('edit');
  };

  const handleViewPrescription = (prescription: Prescription) => {
    setViewingPrescription(prescription);
  };

  const handleFormSuccess = () => {
    setActiveTab('list');
    setEditingPrescription(null);
  };

  const handleFormCancel = () => {
    setActiveTab('list');
    setEditingPrescription(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getFrequencyText = (frequency: string) => {
    const frequencyMap: Record<string, string> = {
      'once_daily': 'দিনে একবার',
      'twice_daily': 'দিনে দুইবার',
      'three_times_daily': 'দিনে তিনবার',
      'four_times_daily': 'দিনে চারবার',
      'every_6_hours': 'প্রতি ৬ ঘন্টায়',
      'every_8_hours': 'প্রতি ৮ ঘন্টায়',
      'every_12_hours': 'প্রতি ১২ ঘন্টায়',
      'as_needed': 'প্রয়োজনে',
      'before_meals': 'খাবারের আগে',
      'after_meals': 'খাবারের পরে',
      'with_meals': 'খাবারের সাথে',
      'at_bedtime': 'ঘুমানোর আগে'
    };
    return frequencyMap[frequency] || frequency;
  };

  const getDurationText = (duration: string) => {
    const durationMap: Record<string, string> = {
      '3_days': '৩ দিন',
      '5_days': '৫ দিন',
      '7_days': '৭ দিন',
      '10_days': '১০ দিন',
      '14_days': '১৪ দিন',
      '21_days': '২১ দিন',
      '1_month': '১ মাস',
      '2_months': '২ মাস',
      '3_months': '৩ মাস',
      '6_months': '৬ মাস',
      'ongoing': 'চলমান',
      'as_directed': 'ডাক্তারের পরামর্শ অনুযায়ী'
    };
    return durationMap[duration] || duration;
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">প্রেসক্রিপশন</h1>
                  <p className="text-sm text-gray-600">আপনার মেডিকেল প্রেসক্রিপশন পরিচালনা করুন</p>
                </div>
              </div>
              
              {/* Tab Navigation */}
              <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('list')}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'list'
                      ? 'bg-white text-green-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <List className="w-4 h-4 mr-2" />
                  তালিকা
                </button>
                <button
                  onClick={handleNewPrescription}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'new' || activeTab === 'edit'
                      ? 'bg-white text-green-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  নতুন
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'list' && (
            <PrescriptionList
              onEdit={handleEditPrescription}
              onView={handleViewPrescription}
              onNew={handleNewPrescription}
            />
          )}

          {(activeTab === 'new' || activeTab === 'edit') && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {activeTab === 'edit' ? 'প্রেসক্রিপশন সম্পাদনা' : 'নতুন প্রেসক্রিপশন'}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {activeTab === 'edit' 
                      ? 'আপনার প্রেসক্রিপশনের তথ্য আপডেট করুন'
                      : 'একটি নতুন প্রেসক্রিপশন যোগ করুন'
                    }
                  </p>
                </div>
                
                <PrescriptionForm
                  prescription={editingPrescription}
                  onSuccess={handleFormSuccess}
                  onCancel={handleFormCancel}
                />
              </div>
            </div>
          )}
        </div>

        {/* Prescription Details Modal */}
        {viewingPrescription && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">প্রেসক্রিপশনের বিস্তারিত</h2>
                  <button
                    onClick={() => setViewingPrescription(null)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Doctor Information */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                      <User className="w-5 h-5 mr-2" />
                      ডাক্তারের তথ্য
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <p><strong>নাম:</strong> {viewingPrescription.doctor_name}</p>
                      {viewingPrescription.doctor_specialty && (
                        <p><strong>বিশেষত্ব:</strong> {viewingPrescription.doctor_specialty}</p>
                      )}
                      {viewingPrescription.hospital_name && (
                        <p><strong>হাসপাতাল:</strong> {viewingPrescription.hospital_name}</p>
                      )}
                    </div>
                  </div>

                  {/* Prescription Details */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                      <Calendar className="w-5 h-5 mr-2" />
                      প্রেসক্রিপশনের তথ্য
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <p><strong>তারিখ:</strong> {formatDate(viewingPrescription.prescription_date)}</p>
                      {viewingPrescription.diagnosis && (
                        <p><strong>রোগ নির্ণয়:</strong> {viewingPrescription.diagnosis}</p>
                      )}
                      {viewingPrescription.follow_up_date && (
                        <p><strong>ফলো-আপ:</strong> {formatDate(viewingPrescription.follow_up_date)}</p>
                      )}
                    </div>
                  </div>

                  {/* Medicines */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                      <Pill className="w-5 h-5 mr-2" />
                      ওষুধের তালিকা ({viewingPrescription.medicines.length}টি)
                    </h3>
                    <div className="space-y-3">
                      {viewingPrescription.medicines.map((medicine, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <p className="font-semibold text-gray-900">{medicine.name}</p>
                              <p className="text-sm text-gray-600">ডোজ: {medicine.dosage}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">
                                <strong>সেবনের নিয়ম:</strong> {getFrequencyText(medicine.frequency)}
                              </p>
                              <p className="text-sm text-gray-600">
                                <strong>মেয়াদ:</strong> {getDurationText(medicine.duration)}
                              </p>
                            </div>
                            {medicine.instructions && (
                              <div className="md:col-span-2">
                                <p className="text-sm text-gray-600">
                                  <strong>নির্দেশনা:</strong> {medicine.instructions}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  {viewingPrescription.notes && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">অতিরিক্ত নোট</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="whitespace-pre-wrap">{viewingPrescription.notes}</p>
                      </div>
                    </div>
                  )}

                  {/* Timestamps */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">তারিখ তথ্য</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <p><strong>তৈরি:</strong> {new Date(viewingPrescription.created_at).toLocaleString('bn-BD')}</p>
                      <p><strong>আপডেট:</strong> {new Date(viewingPrescription.updated_at).toLocaleString('bn-BD')}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
                  <button
                    onClick={() => setViewingPrescription(null)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    বন্ধ করুন
                  </button>
                  <button
                    onClick={() => {
                      handleEditPrescription(viewingPrescription);
                      setViewingPrescription(null);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    সম্পাদনা করুন
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default PrescriptionsPage;