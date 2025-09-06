import React, { useState, useEffect } from 'react';
import { Users, Activity, Calendar, Download, Search, Filter, Eye, MessageSquare, FileText, Clock } from 'lucide-react';

interface UserActivity {
  id: string;
  userId: string;
  userName: string;
  email: string;
  action: string;
  timestamp: Date;
  details: string;
  ipAddress?: string;
}

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  totalSessions: number;
  avgSessionDuration: string;
  topFeatures: { name: string; usage: number }[];
}

const UserReports: React.FC = () => {
  const [userActivities, setUserActivities] = useState<UserActivity[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [dateRange, setDateRange] = useState('today');
  const [loading, setLoading] = useState(true);

  // Mock data - Replace with actual API calls
  useEffect(() => {
    const loadUserData = async () => {
      setLoading(true);
      
      // Simulate API call
      setTimeout(() => {
        const mockActivities: UserActivity[] = [
          {
            id: '1',
            userId: 'user1',
            userName: 'রহিম আহমেদ',
            email: 'rahim@example.com',
            action: 'লগইন',
            timestamp: new Date(),
            details: 'Google OAuth দিয়ে লগইন করেছেন',
            ipAddress: '192.168.1.100'
          },
          {
            id: '2',
            userId: 'user2',
            userName: 'ফাতিমা খাতুন',
            email: 'fatima@example.com',
            action: 'প্রেসক্রিপশন আপলোড',
            timestamp: new Date(Date.now() - 30 * 60 * 1000),
            details: 'নতুন প্রেসক্রিপশন আপলোড করেছেন',
            ipAddress: '192.168.1.101'
          },
          {
            id: '3',
            userId: 'user3',
            userName: 'করিম উদ্দিন',
            email: 'karim@example.com',
            action: 'ডাক্তার খোঁজা',
            timestamp: new Date(Date.now() - 60 * 60 * 1000),
            details: 'হৃদরোগ বিশেষজ্ঞ খুঁজেছেন',
            ipAddress: '192.168.1.102'
          },
          {
            id: '4',
            userId: 'user4',
            userName: 'সালমা বেগম',
            email: 'salma@example.com',
            action: 'অ্যাপয়েন্টমেন্ট বুকিং',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            details: 'ডা. আহমেদ এর সাথে অ্যাপয়েন্টমেন্ট বুক করেছেন',
            ipAddress: '192.168.1.103'
          },
          {
            id: '5',
            userId: 'user5',
            userName: 'নাসির হোসেন',
            email: 'nasir@example.com',
            action: 'চ্যাট',
            timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
            details: 'AI ডাক্তারের সাথে চ্যাট করেছেন',
            ipAddress: '192.168.1.104'
          }
        ];

        const mockStats: UserStats = {
          totalUsers: 1250,
          activeUsers: 89,
          newUsersToday: 12,
          totalSessions: 3456,
          avgSessionDuration: '8 মিনিট 32 সেকেন্ড',
          topFeatures: [
            { name: 'AI চ্যাট', usage: 45 },
            { name: 'ডাক্তার খোঁজা', usage: 32 },
            { name: 'প্রেসক্রিপশন আপলোড', usage: 28 },
            { name: 'অ্যাপয়েন্টমেন্ট', usage: 25 },
            { name: 'মেডিসিন রিমাইন্ডার', usage: 18 }
          ]
        };

        setUserActivities(mockActivities);
        setUserStats(mockStats);
        setLoading(false);
      }, 1000);
    };

    loadUserData();
  }, [dateRange]);

  const filteredActivities = userActivities.filter(activity => {
    const matchesSearch = activity.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.action.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' || activity.action.includes(filterType);
    
    return matchesSearch && matchesFilter;
  });

  const exportData = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "নাম,ইমেইল,কার্যকলাপ,সময়,বিস্তারিত\n" +
      filteredActivities.map(activity => 
        `${activity.userName},${activity.email},${activity.action},${activity.timestamp.toLocaleString('bn-BD')},${activity.details}`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "user_reports.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">ডেটা লোড হচ্ছে...</span>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">ইউজার রিপোর্ট</h2>
        <button
          onClick={exportData}
          className="flex items-center bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
        >
          <Download className="h-4 w-4 mr-2" />
          এক্সপোর্ট করুন
        </button>
      </div>

      {/* Statistics Cards */}
      {userStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">মোট ইউজার</p>
                <p className="text-2xl font-bold text-gray-900">{userStats.totalUsers.toLocaleString('bn-BD')}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">সক্রিয় ইউজার</p>
                <p className="text-2xl font-bold text-gray-900">{userStats.activeUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">আজকের নতুন ইউজার</p>
                <p className="text-2xl font-bold text-gray-900">{userStats.newUsersToday}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">গড় সেশন সময়</p>
                <p className="text-lg font-bold text-gray-900">{userStats.avgSessionDuration}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Features */}
      {userStats && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">জনপ্রিয় ফিচার</h3>
          <div className="space-y-3">
            {userStats.topFeatures.map((feature, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-gray-700">{feature.name}</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${feature.usage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600">{feature.usage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="নাম বা ইমেইল দিয়ে খুঁজুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">সব কার্যকলাপ</option>
              <option value="লগইন">লগইন</option>
              <option value="প্রেসক্রিপশন">প্রেসক্রিপশন</option>
              <option value="ডাক্তার">ডাক্তার খোঁজা</option>
              <option value="অ্যাপয়েন্টমেন্ট">অ্যাপয়েন্টমেন্ট</option>
              <option value="চ্যাট">চ্যাট</option>
            </select>
          </div>

          <div>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="today">আজ</option>
              <option value="week">এই সপ্তাহ</option>
              <option value="month">এই মাস</option>
              <option value="year">এই বছর</option>
            </select>
          </div>
        </div>
      </div>

      {/* Activity Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">ব্যবহারকারীর কার্যকলাপ</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ব্যবহারকারী
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  কার্যকলাপ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  সময়
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  বিস্তারিত
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP ঠিকানা
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredActivities.map((activity) => (
                <tr key={activity.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{activity.userName}</div>
                      <div className="text-sm text-gray-500">{activity.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {activity.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {activity.timestamp.toLocaleString('bn-BD')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {activity.details}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {activity.ipAddress}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredActivities.length === 0 && (
          <div className="text-center py-8">
            <Eye className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">কোনো কার্যকলাপ পাওয়া যায়নি</h3>
            <p className="mt-1 text-sm text-gray-500">আপনার ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন।</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserReports;