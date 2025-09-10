import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import AppointmentForm from '../components/appointments/AppointmentForm';
import AppointmentList from '../components/appointments/AppointmentList';
import { Calendar, Plus, List } from 'lucide-react';

interface Appointment {
  id: string;
  user_id: string;
  doctor_name: string;
  doctor_specialty?: string;
  hospital_name?: string;
  appointment_date: string;
  appointment_time: string;
  appointment_type?: string;
  status: string;
  symptoms?: string;
  notes?: string;
  reminder_sent: boolean;
  created_at: string;
  updated_at: string;
}

const AppointmentsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'list' | 'new' | 'edit'>('list');
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [viewingAppointment, setViewingAppointment] = useState<Appointment | null>(null);

  const handleNewAppointment = () => {
    setEditingAppointment(null);
    setActiveTab('new');
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setActiveTab('edit');
  };

  const handleViewAppointment = (appointment: Appointment) => {
    setViewingAppointment(appointment);
  };

  const handleFormSuccess = () => {
    setActiveTab('list');
    setEditingAppointment(null);
  };

  const handleFormCancel = () => {
    setActiveTab('list');
    setEditingAppointment(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'নির্ধারিত';
      case 'confirmed':
        return 'নিশ্চিত';
      case 'completed':
        return 'সম্পন্ন';
      case 'cancelled':
        return 'বাতিল';
      case 'rescheduled':
        return 'পুনঃনির্ধারিত';
      default:
        return status;
    }
  };

  const getAppointmentTypeText = (type: string) => {
    switch (type) {
      case 'consultation':
        return 'পরামর্শ';
      case 'follow_up':
        return 'ফলো-আপ';
      case 'emergency':
        return 'জরুরি';
      case 'routine_checkup':
        return 'নিয়মিত চেকআপ';
      default:
        return type;
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">অ্যাপয়েন্টমেন্ট</h1>
                  <p className="text-sm text-gray-600">আপনার মেডিকেল অ্যাপয়েন্টমেন্ট পরিচালনা করুন</p>
                </div>
              </div>
              
              {/* Tab Navigation */}
              <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('list')}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'list'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <List className="w-4 h-4 mr-2" />
                  তালিকা
                </button>
                <button
                  onClick={handleNewAppointment}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'new' || activeTab === 'edit'
                      ? 'bg-white text-blue-600 shadow-sm'
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
            <AppointmentList
              onEdit={handleEditAppointment}
              onView={handleViewAppointment}
              onNew={handleNewAppointment}
            />
          )}

          {(activeTab === 'new' || activeTab === 'edit') && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {activeTab === 'edit' ? 'অ্যাপয়েন্টমেন্ট সম্পাদনা' : 'নতুন অ্যাপয়েন্টমেন্ট'}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {activeTab === 'edit' 
                      ? 'আপনার অ্যাপয়েন্টমেন্টের তথ্য আপডেট করুন'
                      : 'একটি নতুন অ্যাপয়েন্টমেন্ট বুক করুন'
                    }
                  </p>
                </div>
                
                <AppointmentForm
                  appointment={editingAppointment}
                  onSuccess={handleFormSuccess}
                  onCancel={handleFormCancel}
                />
              </div>
            </div>
          )}
        </div>

        {/* Appointment Details Modal */}
        {viewingAppointment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">অ্যাপয়েন্টমেন্টের বিস্তারিত</h2>
                  <button
                    onClick={() => setViewingAppointment(null)}
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
                    <h3 className="text-lg font-medium text-gray-900 mb-3">ডাক্তারের তথ্য</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <p><strong>নাম:</strong> {viewingAppointment.doctor_name}</p>
                      {viewingAppointment.doctor_specialty && (
                        <p><strong>বিশেষত্ব:</strong> {viewingAppointment.doctor_specialty}</p>
                      )}
                      {viewingAppointment.hospital_name && (
                        <p><strong>হাসপাতাল:</strong> {viewingAppointment.hospital_name}</p>
                      )}
                    </div>
                  </div>

                  {/* Appointment Details */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">অ্যাপয়েন্টমেন্টের তথ্য</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <p><strong>তারিখ:</strong> {formatDate(viewingAppointment.appointment_date)}</p>
                      <p><strong>সময়:</strong> {formatTime(viewingAppointment.appointment_time)}</p>
                      {viewingAppointment.appointment_type && (
                        <p><strong>ধরন:</strong> {getAppointmentTypeText(viewingAppointment.appointment_type)}</p>
                      )}
                      <p><strong>স্ট্যাটাস:</strong> {getStatusText(viewingAppointment.status)}</p>
                    </div>
                  </div>

                  {/* Symptoms */}
                  {viewingAppointment.symptoms && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">লক্ষণসমূহ</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="whitespace-pre-wrap">{viewingAppointment.symptoms}</p>
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {viewingAppointment.notes && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">অতিরিক্ত নোট</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="whitespace-pre-wrap">{viewingAppointment.notes}</p>
                      </div>
                    </div>
                  )}

                  {/* Reminder Status */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">রিমাইন্ডার</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p>
                        <strong>স্ট্যাটাস:</strong> 
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                          viewingAppointment.reminder_sent 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {viewingAppointment.reminder_sent ? 'পাঠানো হয়েছে' : 'পাঠানো হয়নি'}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Timestamps */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">তারিখ তথ্য</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <p><strong>তৈরি:</strong> {new Date(viewingAppointment.created_at).toLocaleString('bn-BD')}</p>
                      <p><strong>আপডেট:</strong> {new Date(viewingAppointment.updated_at).toLocaleString('bn-BD')}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
                  <button
                    onClick={() => setViewingAppointment(null)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    বন্ধ করুন
                  </button>
                  {viewingAppointment.status !== 'completed' && viewingAppointment.status !== 'cancelled' && (
                    <button
                      onClick={() => {
                        handleEditAppointment(viewingAppointment);
                        setViewingAppointment(null);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      সম্পাদনা করুন
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default AppointmentsPage;