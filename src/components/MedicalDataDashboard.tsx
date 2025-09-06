// Medical Data Dashboard Component - মেডিকেল ডেটা ড্যাশবোর্ড কম্পোনেন্ট
import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Calendar, 
  FileText, 
  Pill, 
  MessageCircle, 
  Download, 
  Filter, 
  Search,
  Activity,
  Heart,
  Clock,
  AlertTriangle,
  CheckCircle,
  Users,
  Database
} from 'lucide-react';
import dataStorageService, { ChatMessage, MedicalReport, MedicineRecord, MedicalData } from '../services/dataStorageService';
import MedicalReportsManager from './MedicalReportsManager';
import MedicineHistoryTracker from './MedicineHistoryTracker';

interface MedicalDataDashboardProps {
  userId?: string;
  onClose?: () => void;
}

interface DashboardStats {
  totalChats: number;
  totalReports: number;
  activeMedicines: number;
  completedMedicines: number;
  lastChatDate: Date | null;
  lastReportDate: Date | null;
  avgMedicineAdherence: number;
  criticalReports: number;
}

interface ChartData {
  name: string;
  value: number;
  color: string;
}

const MedicalDataDashboard: React.FC<MedicalDataDashboardProps> = ({ 
  userId = 'default-user-id', 
  onClose 
}) => {
  // States
  const [stats, setStats] = useState<DashboardStats>({
    totalChats: 0,
    totalReports: 0,
    activeMedicines: 0,
    completedMedicines: 0,
    lastChatDate: null,
    lastReportDate: null,
    avgMedicineAdherence: 0,
    criticalReports: 0
  });
  
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [medicalReports, setMedicalReports] = useState<MedicalReport[]>([]);
  const [medicineRecords, setMedicineRecords] = useState<MedicineRecord[]>([]);
  const [medicalData, setMedicalData] = useState<MedicalData[]>([]);
  
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('30');
  const [selectedView, setSelectedView] = useState<string>('overview');
  const [showReportsManager, setShowReportsManager] = useState(false);
  const [showMedicineTracker, setShowMedicineTracker] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Load all data on component mount
  useEffect(() => {
    loadAllData();
  }, [userId, selectedTimeRange]);

  // Load all medical data
  const loadAllData = async () => {
    setIsLoading(true);
    try {
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - parseInt(selectedTimeRange));

      // Load data from storage
      const chats = dataStorageService.getChatsByDateRange(userId, startDate, endDate);
      const reports = dataStorageService.getMedicalReports(userId);
      const medicines = dataStorageService.getMedicineRecords(userId);
      const medData = dataStorageService.getMedicalData(userId);

      setChatHistory(chats);
      setMedicalReports(reports);
      setMedicineRecords(medicines);
      setMedicalData(medData);

      // Calculate statistics
      calculateStats(chats, reports, medicines);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate dashboard statistics
  const calculateStats = (chats: ChatMessage[], reports: MedicalReport[], medicines: MedicineRecord[]) => {
    const activeMedicines = medicines.filter(m => m.status === 'active').length;
    const completedMedicines = medicines.filter(m => m.status === 'completed').length;
    const criticalReports = reports.filter(r => 
      r.results.parameters.some(p => p.status === 'critical')
    ).length;
    
    const avgAdherence = medicines.length > 0 
      ? medicines.reduce((sum, m) => sum + (m.adherence || 0), 0) / medicines.length 
      : 0;

    const lastChat = chats.length > 0 ? new Date(chats[0].timestamp) : null;
    const lastReport = reports.length > 0 ? new Date(reports[0].timestamp) : null;

    setStats({
      totalChats: chats.length,
      totalReports: reports.length,
      activeMedicines,
      completedMedicines,
      lastChatDate: lastChat,
      lastReportDate: lastReport,
      avgMedicineAdherence: avgAdherence,
      criticalReports
    });
  };

  // Get chat activity data for chart
  const getChatActivityData = (): ChartData[] => {
    const last7Days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dayChats = chatHistory.filter(chat => {
        const chatDate = new Date(chat.timestamp);
        return chatDate.toDateString() === date.toDateString();
      }).length;
      
      last7Days.push({
        name: date.toLocaleDateString('bn-BD', { weekday: 'short' }),
        value: dayChats,
        color: '#3B82F6'
      });
    }
    
    return last7Days;
  };

  // Get medicine status data for pie chart
  const getMedicineStatusData = (): ChartData[] => {
    const active = medicineRecords.filter(m => m.status === 'active').length;
    const completed = medicineRecords.filter(m => m.status === 'completed').length;
    const discontinued = medicineRecords.filter(m => m.status === 'discontinued').length;

    return [
      { name: 'চলমান', value: active, color: '#10B981' },
      { name: 'সম্পন্ন', value: completed, color: '#3B82F6' },
      { name: 'বন্ধ', value: discontinued, color: '#EF4444' }
    ];
  };

  // Get report types data
  const getReportTypesData = (): ChartData[] => {
    const types = medicalReports.reduce((acc, report) => {
      acc[report.reportType] = (acc[report.reportType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const colors = ['#8B5CF6', '#F59E0B', '#EF4444', '#10B981', '#3B82F6', '#6B7280'];
    
    return Object.entries(types).map(([type, count], index) => ({
      name: getReportTypeLabel(type),
      value: count,
      color: colors[index % colors.length]
    }));
  };

  // Get report type label in Bengali
  const getReportTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      'blood_test': 'রক্ত পরীক্ষা',
      'x_ray': 'এক্স-রে',
      'mri': 'এমআরআই',
      'ct_scan': 'সিটি স্ক্যান',
      'ecg': 'ইসিজি',
      'other': 'অন্যান্য'
    };
    return labels[type] || type;
  };

  // Export all data
  const exportAllData = () => {
    try {
      const exportData = dataStorageService.exportUserData(userId);
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `medical-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      alert('ডেটা সফলভাবে এক্সপোর্ট হয়েছে!');
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('ডেটা এক্সপোর্টে সমস্যা হয়েছে।');
    }
  };

  // Format date
  const formatDate = (date: Date | null) => {
    if (!date) return 'কোনো ডেটা নেই';
    return new Date(date).toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Simple Bar Chart Component
  const SimpleBarChart: React.FC<{ data: ChartData[]; height?: number }> = ({ data, height = 200 }) => {
    const maxValue = Math.max(...data.map(d => d.value));
    
    return (
      <div className="flex items-end justify-between" style={{ height }}>
        {data.map((item, index) => (
          <div key={index} className="flex flex-col items-center flex-1 mx-1">
            <div className="text-xs text-gray-600 mb-1">{item.value}</div>
            <div 
              className="w-full rounded-t transition-all duration-300 hover:opacity-80"
              style={{ 
                height: `${(item.value / maxValue) * (height - 40)}px`,
                backgroundColor: item.color,
                minHeight: '4px'
              }}
            ></div>
            <div className="text-xs text-gray-500 mt-2 text-center">{item.name}</div>
          </div>
        ))}
      </div>
    );
  };

  // Simple Pie Chart Component
  const SimplePieChart: React.FC<{ data: ChartData[] }> = ({ data }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    
    return (
      <div className="flex flex-col items-center">
        <div className="relative w-32 h-32 mb-4">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {data.map((item, index) => {
              const percentage = (item.value / total) * 100;
              const strokeDasharray = `${percentage} ${100 - percentage}`;
              const strokeDashoffset = data.slice(0, index).reduce((sum, prev) => 
                sum + (prev.value / total) * 100, 0
              );
              
              return (
                <circle
                  key={index}
                  cx="50"
                  cy="50"
                  r="15.915"
                  fill="transparent"
                  stroke={item.color}
                  strokeWidth="8"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={-strokeDashoffset}
                  className="transition-all duration-300"
                />
              );
            })}
          </svg>
        </div>
        <div className="space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: item.color }}
              ></div>
              <span>{item.name}: {item.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">ডেটা লোড হচ্ছে...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-blue-600" />
          মেডিকেল ডেটা ড্যাশবোর্ড
        </h2>
        <div className="flex gap-2">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="7">গত ৭ দিন</option>
            <option value="30">গত ৩০ দিন</option>
            <option value="90">গত ৯০ দিন</option>
            <option value="365">গত ১ বছর</option>
          </select>
          <button
            onClick={exportAllData}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            এক্সপোর্ট
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

      {/* Navigation Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'overview', label: 'সারসংক্ষেপ', icon: BarChart3 },
          { id: 'reports', label: 'রিপোর্ট', icon: FileText },
          { id: 'medicines', label: 'ওষুধ', icon: Pill },
          { id: 'chats', label: 'চ্যাট', icon: MessageCircle }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedView(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                selectedView === tab.id 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Overview Tab */}
      {selectedView === 'overview' && (
        <div className="space-y-6">
          {/* Key Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">মোট চ্যাট</p>
                  <p className="text-2xl font-bold text-blue-700">{stats.totalChats}</p>
                  <p className="text-xs text-blue-500">শেষ: {formatDate(stats.lastChatDate)}</p>
                </div>
                <MessageCircle className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">মেডিকেল রিপোর্ট</p>
                  <p className="text-2xl font-bold text-green-700">{stats.totalReports}</p>
                  <p className="text-xs text-green-500">শেষ: {formatDate(stats.lastReportDate)}</p>
                </div>
                <FileText className="w-8 h-8 text-green-600" />
              </div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">চলমান ওষুধ</p>
                  <p className="text-2xl font-bold text-purple-700">{stats.activeMedicines}</p>
                  <p className="text-xs text-purple-500">সম্পন্ন: {stats.completedMedicines}</p>
                </div>
                <Pill className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-600 font-medium">গুরুত্বপূর্ণ রিপোর্ট</p>
                  <p className="text-2xl font-bold text-red-700">{stats.criticalReports}</p>
                  <p className="text-xs text-red-500">মনোযোগ প্রয়োজন</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chat Activity Chart */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                গত ৭ দিনের চ্যাট কার্যকলাপ
              </h3>
              <SimpleBarChart data={getChatActivityData()} />
            </div>

            {/* Medicine Status Chart */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-purple-600" />
                ওষুধের অবস্থা
              </h3>
              <div className="flex justify-center">
                <SimplePieChart data={getMedicineStatusData()} />
              </div>
            </div>
          </div>

          {/* Report Types Chart */}
          {medicalReports.length > 0 && (
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-green-600" />
                রিপোর্টের ধরন
              </h3>
              <SimpleBarChart data={getReportTypesData()} height={150} />
            </div>
          )}

          {/* Medicine Adherence */}
          {medicineRecords.length > 0 && (
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                ওষুধ মেনে চলার হার
              </h3>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">গড় মেনে চলার হার</span>
                    <span className="text-lg font-bold text-blue-600">{stats.avgMedicineAdherence.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div 
                      className="bg-blue-600 h-4 rounded-full transition-all duration-500" 
                      style={{ width: `${stats.avgMedicineAdherence}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">মোট ওষুধ</p>
                  <p className="text-xl font-bold text-gray-800">{medicineRecords.length}</p>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setShowReportsManager(true)}
              className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left"
            >
              <FileText className="w-8 h-8 text-blue-600 mb-2" />
              <h4 className="font-semibold text-gray-800">রিপোর্ট ব্যবস্থাপনা</h4>
              <p className="text-sm text-gray-600">নতুন রিপোর্ট যোগ করুন বা পুরানো দেখুন</p>
            </button>
            
            <button
              onClick={() => setShowMedicineTracker(true)}
              className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-left"
            >
              <Pill className="w-8 h-8 text-purple-600 mb-2" />
              <h4 className="font-semibold text-gray-800">ওষুধ ট্র্যাকার</h4>
              <p className="text-sm text-gray-600">ওষুধের ইতিহাস ও অগ্রগতি দেখুন</p>
            </button>
            
            <button
              onClick={exportAllData}
              className="p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-left"
            >
              <Download className="w-8 h-8 text-green-600 mb-2" />
              <h4 className="font-semibold text-gray-800">ডেটা এক্সপোর্ট</h4>
              <p className="text-sm text-gray-600">সমস্ত ডেটা ডাউনলোড করুন</p>
            </button>
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {selectedView === 'reports' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">মেডিকেল রিপোর্ট ({medicalReports.length})</h3>
            <button
              onClick={() => setShowReportsManager(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              বিস্তারিত দেখুন
            </button>
          </div>
          
          {medicalReports.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>কোনো মেডিকেল রিপোর্ট পাওয়া যায়নি।</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {medicalReports.slice(0, 5).map(report => (
                <div key={report.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-gray-800">{report.title}</h4>
                      <p className="text-sm text-gray-600">{report.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(report.timestamp)} • {report.doctorName}
                      </p>
                    </div>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      {getReportTypeLabel(report.reportType)}
                    </span>
                  </div>
                </div>
              ))}
              {medicalReports.length > 5 && (
                <p className="text-center text-gray-500 text-sm">
                  আরো {medicalReports.length - 5}টি রিপোর্ট রয়েছে
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Medicines Tab */}
      {selectedView === 'medicines' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">ওষুধের তালিকা ({medicineRecords.length})</h3>
            <button
              onClick={() => setShowMedicineTracker(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
            >
              বিস্তারিত দেখুন
            </button>
          </div>
          
          {medicineRecords.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Pill className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>কোনো ওষুধের তথ্য পাওয়া যায়নি।</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {medicineRecords.slice(0, 5).map(medicine => (
                <div key={medicine.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-gray-800">{medicine.medicineName}</h4>
                      <p className="text-sm text-gray-600">{medicine.purpose}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {medicine.dosage} • {medicine.frequency} • {medicine.prescribedBy}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-1 rounded ${
                        medicine.status === 'active' ? 'bg-green-100 text-green-700' :
                        medicine.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {medicine.status === 'active' ? 'চলমান' :
                         medicine.status === 'completed' ? 'সম্পন্ন' : 'বন্ধ'}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        মেনে চলা: {medicine.adherence || 0}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {medicineRecords.length > 5 && (
                <p className="text-center text-gray-500 text-sm">
                  আরো {medicineRecords.length - 5}টি ওষুধ রয়েছে
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Chats Tab */}
      {selectedView === 'chats' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">চ্যাট ইতিহাস ({chatHistory.length})</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="চ্যাট খুঁজুন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          {chatHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>কোনো চ্যাট ইতিহাস পাওয়া যায়নি।</p>
            </div>
          ) : (
            <div className="space-y-3">
              {chatHistory
                .filter(chat => 
                  !searchTerm || 
                  chat.message.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .slice(0, 10)
                .map(chat => (
                  <div key={chat.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        chat.sender === 'user' ? 'bg-blue-100' : 'bg-green-100'
                      }`}>
                        {chat.sender === 'user' ? (
                          <Users className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Heart className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-medium text-gray-800">
                            {chat.sender === 'user' ? 'আপনি' : 'ডা. মিমু'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(chat.timestamp).toLocaleString('bn-BD')}
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm">{chat.message}</p>
                        {chat.category && (
                          <span className="inline-block mt-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {chat.category === 'consultation' ? 'পরামর্শ' :
                             chat.category === 'prescription' ? 'প্রেসক্রিপশন' : 'সাধারণ'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              }
              {chatHistory.filter(chat => 
                !searchTerm || 
                chat.message.toLowerCase().includes(searchTerm.toLowerCase())
              ).length > 10 && (
                <p className="text-center text-gray-500 text-sm">
                  আরো চ্যাট রয়েছে
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {showReportsManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <MedicalReportsManager 
              userId={userId} 
              onClose={() => {
                setShowReportsManager(false);
                loadAllData();
              }} 
            />
          </div>
        </div>
      )}

      {showMedicineTracker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-7xl w-full max-h-[90vh] overflow-hidden">
            <MedicineHistoryTracker 
              userId={userId} 
              onClose={() => {
                setShowMedicineTracker(false);
                loadAllData();
              }} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalDataDashboard;