import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Calendar, 
  Clock, 
  User, 
  Building, 
  Stethoscope, 
  Edit, 
  Trash2, 
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus
} from 'lucide-react';
import { toast } from 'sonner';
import LoadingSpinner from '../ui/LoadingSpinner';

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

interface AppointmentListProps {
  onEdit?: (appointment: Appointment) => void;
  onView?: (appointment: Appointment) => void;
  onNew?: () => void;
}

const AppointmentList: React.FC<AppointmentListProps> = ({ onEdit, onView, onNew }) => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user) {
      loadAppointments();
    }
  }, [user]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/appointments/user/${user?.id}`);
      
      if (response.ok) {
        const data = await response.json();
        setAppointments(data.data || []);
      } else {
        toast.error('অ্যাপয়েন্টমেন্ট লোড করতে সমস্যা হয়েছে');
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
      toast.error('অ্যাপয়েন্টমেন্ট লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (appointmentId: string) => {
    if (!confirm('আপনি কি এই অ্যাপয়েন্টমেন্ট মুছে ফেলতে চান?')) {
      return;
    }

    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('অ্যাপয়েন্টমেন্ট মুছে ফেলা হয়েছে');
        loadAppointments();
      } else {
        toast.error('অ্যাপয়েন্টমেন্ট মুছতে সমস্যা হয়েছে');
      }
    } catch (error) {
      console.error('Error deleting appointment:', error);
      toast.error('অ্যাপয়েন্টমেন্ট মুছতে সমস্যা হয়েছে');
    }
  };

  const handleStatusUpdate = async (appointmentId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success('অ্যাপয়েন্টমেন্ট স্ট্যাটাস আপডেট হয়েছে');
        loadAppointments();
      } else {
        toast.error('স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে');
      }
    } catch (error) {
      console.error('Error updating appointment status:', error);
      toast.error('স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'rescheduled':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'rescheduled':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  const filteredAppointments = appointments.filter(appointment => {
    const matchesFilter = filter === 'all' || appointment.status === filter;
    const matchesSearch = searchTerm === '' || 
      appointment.doctor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.hospital_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.doctor_specialty?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" text="অ্যাপয়েন্টমেন্ট লোড হচ্ছে..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">আমার অ্যাপয়েন্টমেন্ট</h2>
          <p className="text-gray-600">আপনার সকল অ্যাপয়েন্টমেন্ট দেখুন এবং পরিচালনা করুন</p>
        </div>
        {onNew && (
          <button
            onClick={onNew}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            নতুন অ্যাপয়েন্টমেন্ট
          </button>
        )}
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="ডাক্তার, হাসপাতাল বা বিশেষত্ব অনুসন্ধান করুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">সব অ্যাপয়েন্টমেন্ট</option>
          <option value="scheduled">নির্ধারিত</option>
          <option value="confirmed">নিশ্চিত</option>
          <option value="completed">সম্পন্ন</option>
          <option value="cancelled">বাতিল</option>
          <option value="rescheduled">পুনঃনির্ধারিত</option>
        </select>
      </div>

      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || filter !== 'all' ? 'কোনো অ্যাপয়েন্টমেন্ট পাওয়া যায়নি' : 'কোনো অ্যাপয়েন্টমেন্ট নেই'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filter !== 'all' 
              ? 'অনুসন্ধান বা ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন'
              : 'আপনার প্রথম অ্যাপয়েন্টমেন্ট বুক করুন'
            }
          </p>
          {onNew && !searchTerm && filter === 'all' && (
            <button
              onClick={onNew}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              অ্যাপয়েন্টমেন্ট বুক করুন
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredAppointments.map((appointment) => (
            <div
              key={appointment.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1 space-y-3">
                  {/* Doctor and Hospital Info */}
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{appointment.doctor_name}</h3>
                      {appointment.doctor_specialty && (
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <Stethoscope className="w-4 h-4 mr-1" />
                          {appointment.doctor_specialty}
                        </div>
                      )}
                      {appointment.hospital_name && (
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <Building className="w-4 h-4 mr-1" />
                          {appointment.hospital_name}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Date and Time */}
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      {formatDate(appointment.appointment_date)}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      {formatTime(appointment.appointment_time)}
                    </div>
                    {appointment.appointment_type && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                        {getAppointmentTypeText(appointment.appointment_type)}
                      </span>
                    )}
                  </div>

                  {/* Status */}
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(appointment.status)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                      {getStatusText(appointment.status)}
                    </span>
                  </div>

                  {/* Symptoms/Notes Preview */}
                  {(appointment.symptoms || appointment.notes) && (
                    <div className="text-sm text-gray-600">
                      {appointment.symptoms && (
                        <p><strong>লক্ষণ:</strong> {appointment.symptoms.substring(0, 100)}{appointment.symptoms.length > 100 ? '...' : ''}</p>
                      )}
                      {appointment.notes && (
                        <p><strong>নোট:</strong> {appointment.notes.substring(0, 100)}{appointment.notes.length > 100 ? '...' : ''}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-2">
                  {onView && (
                    <button
                      onClick={() => onView(appointment)}
                      className="flex items-center justify-center px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="বিস্তারিত দেখুন"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                  
                  {onEdit && appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
                    <button
                      onClick={() => onEdit(appointment)}
                      className="flex items-center justify-center px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                      title="সম্পাদনা করুন"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
                  
                  {appointment.status === 'scheduled' && (
                    <button
                      onClick={() => handleStatusUpdate(appointment.id, 'confirmed')}
                      className="flex items-center justify-center px-3 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="নিশ্চিত করুন"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                  
                  {(appointment.status === 'scheduled' || appointment.status === 'confirmed') && (
                    <button
                      onClick={() => handleStatusUpdate(appointment.id, 'cancelled')}
                      className="flex items-center justify-center px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="বাতিল করুন"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleDelete(appointment.id)}
                    className="flex items-center justify-center px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="মুছে ফেলুন"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AppointmentList;