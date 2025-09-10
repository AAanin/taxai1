import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import { 
  Heart, 
  Calendar, 
  Pill, 
  FileText, 
  MessageCircle, 
  Bell,
  User,
  LogOut,
  Activity,
  Clock
} from 'lucide-react';

const DashboardPage: React.FC = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  const quickActions = [
    {
      title: 'AI চ্যাট',
      description: 'স্বাস্থ্য সম্পর্কে প্রশ্ন করুন',
      icon: MessageCircle,
      color: 'bg-blue-500',
      href: '/chat'
    },
    {
      title: 'অ্যাপয়েন্টমেন্ট',
      description: 'ডাক্তারের সাথে অ্যাপয়েন্টমেন্ট',
      icon: Calendar,
      color: 'bg-green-500',
      href: '/appointments'
    },
    {
      title: 'ওষুধের রিমাইন্ডার',
      description: 'ওষুধ খাওয়ার সময় মনে রাখুন',
      icon: Pill,
      color: 'bg-purple-500',
      href: '/medicine-reminders'
    },
    {
      title: 'মেডিকেল রেকর্ড',
      description: 'আপনার স্বাস্থ্য তথ্য সংরক্ষণ',
      icon: FileText,
      color: 'bg-orange-500',
      href: '/medical-records'
    },
    {
      title: 'স্বাস্থ্য মেট্রিক্স',
      description: 'রক্তচাপ, ওজন ট্র্যাক করুন',
      icon: Activity,
      color: 'bg-red-500',
      href: '/health-metrics'
    },
    {
      title: 'প্রোফাইল',
      description: 'আপনার তথ্য আপডেট করুন',
      icon: User,
      color: 'bg-gray-500',
      href: '/profile'
    }
  ];

  const recentActivities = [
    {
      title: 'AI চ্যাট সেশন',
      description: 'জ্বর সম্পর্কে প্রশ্ন করেছেন',
      time: '২ ঘন্টা আগে',
      icon: MessageCircle,
      color: 'text-blue-600'
    },
    {
      title: 'ওষুধ খেয়েছেন',
      description: 'প্যারাসিটামল ৫০০mg',
      time: '৪ ঘন্টা আগে',
      icon: Pill,
      color: 'text-green-600'
    },
    {
      title: 'রক্তচাপ রেকর্ড',
      description: '১২০/৮০ mmHg',
      time: 'গতকাল',
      icon: Heart,
      color: 'text-red-600'
    }
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  ডাঃ মিমু মেডিকেল চ্যাটবট
                </h1>
                <p className="text-gray-600">স্বাগতম, {user?.user_metadata?.name || user?.email}</p>
              </div>
              <div className="flex items-center space-x-4">
                <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                  <Bell className="w-6 h-6" />
                </button>
                <button 
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>লগআউট</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white mb-8">
            <h2 className="text-2xl font-bold mb-2">আজকের স্বাস্থ্য সেবা</h2>
            <p className="text-blue-100">
              আপনার স্বাস্থ্যের যত্ন নিন AI সহায়তায়। যেকোনো স্বাস্থ্য সমস্যার জন্য আমাদের সাথে কথা বলুন।
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Quick Actions */}
            <div className="lg:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">দ্রুত অ্যাকশন</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickActions.map((action, index) => {
                  const IconComponent = action.icon;
                  return (
                    <div
                      key={index}
                      className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-200 hover:border-gray-300"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`${action.color} p-3 rounded-lg`}>
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{action.title}</h4>
                          <p className="text-sm text-gray-600">{action.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Activities */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">সাম্প্রতিক কার্যকলাপ</h3>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6">
                  <div className="space-y-4">
                    {recentActivities.map((activity, index) => {
                      const IconComponent = activity.icon;
                      return (
                        <div key={index} className="flex items-start space-x-3">
                          <div className={`p-2 rounded-lg bg-gray-100`}>
                            <IconComponent className={`w-4 h-4 ${activity.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                              {activity.title}
                            </p>
                            <p className="text-sm text-gray-600">
                              {activity.description}
                            </p>
                            <div className="flex items-center mt-1">
                              <Clock className="w-3 h-3 text-gray-400 mr-1" />
                              <p className="text-xs text-gray-500">{activity.time}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Health Stats */}
              <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h4 className="font-medium text-gray-900 mb-4">আজকের স্বাস্থ্য পরিসংখ্যান</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">ওষুধ খাওয়া</span>
                    <span className="text-sm font-medium text-green-600">৩/৪</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">পানি পান</span>
                    <span className="text-sm font-medium text-blue-600">১.৫L</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">হাঁটাহাঁটি</span>
                    <span className="text-sm font-medium text-purple-600">৫,২৩৪ পদক্ষেপ</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default DashboardPage;