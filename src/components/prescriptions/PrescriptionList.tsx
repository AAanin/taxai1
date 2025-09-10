import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FileText, 
  Calendar, 
  User, 
  Building, 
  Pill, 
  Edit, 
  Trash2, 
  Eye,
  Download,
  Plus,
  Search,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';
import LoadingSpinner from '../ui/LoadingSpinner';

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

interface PrescriptionListProps {
  onEdit?: (prescription: Prescription) => void;
  onView?: (prescription: Prescription) => void;
  onNew?: () => void;
}

const PrescriptionList: React.FC<PrescriptionListProps> = ({ onEdit, onView, onNew }) => {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [doctorFilter, setDoctorFilter] = useState('');

  useEffect(() => {
    if (user) {
      loadPrescriptions();
    }
  }, [user]);

  const loadPrescriptions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/prescriptions/user/${user?.id}`);
      
      if (response.ok) {
        const data = await response.json();
        setPrescriptions(data.data || []);
      } else {
        toast.error('প্রেসক্রিপশন লোড করতে সমস্যা হয়েছে');
      }
    } catch (error) {
      console.error('Error loading prescriptions:', error);
      toast.error('প্রেসক্রিপশন লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (prescriptionId: string) => {
    if (!confirm('আপনি কি এই প্রেসক্রিপশন মুছে ফেলতে চান?')) {
      return;
    }

    try {
      const response = await fetch(`/api/prescriptions/${prescriptionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('প্রেসক্রিপশন মুছে ফেলা হয়েছে');
        loadPrescriptions();
      } else {
        toast.error('প্রেসক্রিপশন মুছতে সমস্যা হয়েছে');
      }
    } catch (error) {
      console.error('Error deleting prescription:', error);
      toast.error('প্রেসক্রিপশন মুছতে সমস্যা হয়েছে');
    }
  };

  const handleDownload = async (prescription: Prescription) => {
    try {
      // Create a simple text format for download
      const content = generatePrescriptionText(prescription);
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `prescription_${prescription.doctor_name}_${prescription.prescription_date}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('প্রেসক্রিপশন ডাউনলোড হয়েছে');
    } catch (error) {
      console.error('Error downloading prescription:', error);
      toast.error('ডাউনলোড করতে সমস্যা হয়েছে');
    }
  };

  const generatePrescriptionText = (prescription: Prescription): string => {
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('bn-BD', {
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

    let content = `প্রেসক্রিপশন\n`;
    content += `===================\n\n`;
    content += `ডাক্তার: ${prescription.doctor_name}\n`;
    if (prescription.doctor_specialty) {
      content += `বিশেষত্ব: ${prescription.doctor_specialty}\n`;
    }
    if (prescription.hospital_name) {
      content += `হাসপাতাল: ${prescription.hospital_name}\n`;
    }
    content += `তারিখ: ${formatDate(prescription.prescription_date)}\n\n`;
    
    if (prescription.diagnosis) {
      content += `রোগ নির্ণয়: ${prescription.diagnosis}\n\n`;
    }
    
    content += `ওষুধের তালিকা:\n`;
    content += `-----------------\n`;
    prescription.medicines.forEach((medicine, index) => {
      content += `${index + 1}. ${medicine.name}\n`;
      content += `   ডোজ: ${medicine.dosage}\n`;
      content += `   সেবনের নিয়ম: ${getFrequencyText(medicine.frequency)}\n`;
      content += `   মেয়াদ: ${getDurationText(medicine.duration)}\n`;
      if (medicine.instructions) {
        content += `   নির্দেশনা: ${medicine.instructions}\n`;
      }
      content += `\n`;
    });
    
    if (prescription.notes) {
      content += `অতিরিক্ত নোট:\n`;
      content += `${prescription.notes}\n\n`;
    }
    
    if (prescription.follow_up_date) {
      content += `ফলো-আপ: ${formatDate(prescription.follow_up_date)}\n`;
    }
    
    return content;
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

  const filteredPrescriptions = prescriptions.filter(prescription => {
    const matchesSearch = searchTerm === '' || 
      prescription.doctor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.hospital_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.medicines.some(medicine => 
        medicine.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    const matchesDate = dateFilter === '' || 
      prescription.prescription_date.startsWith(dateFilter);
    
    const matchesDoctor = doctorFilter === '' || 
      prescription.doctor_name.toLowerCase().includes(doctorFilter.toLowerCase());
    
    return matchesSearch && matchesDate && matchesDoctor;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" text="প্রেসক্রিপশন লোড হচ্ছে..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">আমার প্রেসক্রিপশন</h2>
          <p className="text-gray-600">আপনার সকল প্রেসক্রিপশন দেখুন এবং পরিচালনা করুন</p>
        </div>
        {onNew && (
          <button
            onClick={onNew}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            নতুন প্রেসক্রিপশন
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="ডাক্তার, হাসপাতাল, রোগ বা ওষুধ অনুসন্ধান করুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="month"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="ডাক্তারের নাম..."
            value={doctorFilter}
            onChange={(e) => setDoctorFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Prescriptions List */}
      {filteredPrescriptions.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || dateFilter || doctorFilter ? 'কোনো প্রেসক্রিপশন পাওয়া যায়নি' : 'কোনো প্রেসক্রিপশন নেই'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || dateFilter || doctorFilter
              ? 'অনুসন্ধান বা ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন'
              : 'আপনার প্রথম প্রেসক্রিপশন যোগ করুন'
            }
          </p>
          {onNew && !searchTerm && !dateFilter && !doctorFilter && (
            <button
              onClick={onNew}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              প্রেসক্রিপশন যোগ করুন
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredPrescriptions.map((prescription) => (
            <div
              key={prescription.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="flex-1 space-y-4">
                  {/* Doctor and Hospital Info */}
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{prescription.doctor_name}</h3>
                      {prescription.doctor_specialty && (
                        <p className="text-sm text-gray-600 mt-1">{prescription.doctor_specialty}</p>
                      )}
                      {prescription.hospital_name && (
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <Building className="w-4 h-4 mr-1" />
                          {prescription.hospital_name}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Date and Diagnosis */}
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      {formatDate(prescription.prescription_date)}
                    </div>
                    {prescription.diagnosis && (
                      <div className="flex items-center text-gray-600">
                        <FileText className="w-4 h-4 mr-2" />
                        {prescription.diagnosis}
                      </div>
                    )}
                    {prescription.follow_up_date && (
                      <div className="flex items-center text-blue-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        ফলো-আপ: {formatDate(prescription.follow_up_date)}
                      </div>
                    )}
                  </div>

                  {/* Medicines Preview */}
                  <div className="space-y-2">
                    <div className="flex items-center text-sm font-medium text-gray-700">
                      <Pill className="w-4 h-4 mr-2" />
                      ওষুধসমূহ ({prescription.medicines.length}টি)
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {prescription.medicines.slice(0, 4).map((medicine, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-3">
                          <p className="font-medium text-sm text-gray-900">{medicine.name}</p>
                          <p className="text-xs text-gray-600">
                            {medicine.dosage} • {getFrequencyText(medicine.frequency)} • {getDurationText(medicine.duration)}
                          </p>
                        </div>
                      ))}
                      {prescription.medicines.length > 4 && (
                        <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-center">
                          <p className="text-sm text-gray-600">+{prescription.medicines.length - 4} আরও</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Notes Preview */}
                  {prescription.notes && (
                    <div className="text-sm text-gray-600">
                      <strong>নোট:</strong> {prescription.notes.substring(0, 100)}{prescription.notes.length > 100 ? '...' : ''}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row lg:flex-col gap-2">
                  {onView && (
                    <button
                      onClick={() => onView(prescription)}
                      className="flex items-center justify-center px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="বিস্তারিত দেখুন"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleDownload(prescription)}
                    className="flex items-center justify-center px-3 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="ডাউনলোড করুন"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  
                  {onEdit && (
                    <button
                      onClick={() => onEdit(prescription)}
                      className="flex items-center justify-center px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                      title="সম্পাদনা করুন"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleDelete(prescription.id)}
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

export default PrescriptionList;