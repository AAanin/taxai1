import React, { useState } from 'react';
import { Shield, LogOut, Settings, Users, Activity, Database, Bell, Menu, X, Key } from 'lucide-react';
import AdminPanel from './AdminPanel';
import ApiKeyManager from './ApiKeyManager';

interface AdminLayoutProps {
  onLogout: () => void;
  language: 'en' | 'bn';
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ onLogout, language }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');

  const adminSession = JSON.parse(localStorage.getItem('adminSession') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('adminSession');
    onLogout();
  };

  const menuItems = [
    {
      id: 'dashboard',
      label: language === 'bn' ? 'ড্যাশবোর্ড' : 'Dashboard',
      icon: Activity,
      description: language === 'bn' ? 'সিস্টেম ওভারভিউ' : 'System Overview'
    },
    {
      id: 'users',
      label: language === 'bn' ? 'ইউজার ম্যানেজমেন্ট' : 'User Management',
      icon: Users,
      description: language === 'bn' ? 'ইউজার অ্যাকাউন্ট নিয়ন্ত্রণ' : 'User Account Control'
    },
    {
      id: 'database',
      label: language === 'bn' ? 'ডেটাবেস ম্যানেজমেন্ট' : 'Database Management',
      icon: Database,
      description: language === 'bn' ? 'ডেটা নিয়ন্ত্রণ ও রক্ষণাবেক্ষণ' : 'Data Control & Maintenance'
    },
    {
      id: 'notifications',
      label: language === 'bn' ? 'নোটিফিকেশন' : 'Notifications',
      icon: Bell,
      description: language === 'bn' ? 'সিস্টেম বার্তা ও সতর্কতা' : 'System Messages & Alerts'
    },
    {
      id: 'api-keys',
      label: language === 'bn' ? 'API কী ম্যানেজমেন্ট' : 'API Key Management',
      icon: Key,
      description: language === 'bn' ? 'API কী কনফিগারেশন ও নিয়ন্ত্রণ' : 'API Key Configuration & Control'
    },
    {
      id: 'settings',
      label: language === 'bn' ? 'সিস্টেম সেটিংস' : 'System Settings',
      icon: Settings,
      description: language === 'bn' ? 'কনফিগারেশন ও নিয়ন্ত্রণ' : 'Configuration & Control'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-64' : 'w-16'} bg-white shadow-lg transition-all duration-300 flex flex-col`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className={`flex items-center ${isSidebarOpen ? 'space-x-3' : 'justify-center'}`}>
              <div className="bg-purple-100 p-2 rounded-lg">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              {isSidebarOpen && (
                <div>
                  <h1 className="font-bold text-gray-800">
                    {language === 'bn' ? 'অ্যাডমিন প্যানেল' : 'Admin Panel'}
                  </h1>
                  <p className="text-xs text-gray-500">
                    {language === 'bn' ? 'সিস্টেম নিয়ন্ত্রণ' : 'System Control'}
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              {isSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center ${isSidebarOpen ? 'space-x-3 px-3' : 'justify-center px-2'} py-3 rounded-lg transition-all ${
                  activeSection === item.id
                    ? 'bg-purple-100 text-purple-700 border border-purple-200'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                title={!isSidebarOpen ? item.label : ''}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {isSidebarOpen && (
                  <div className="text-left">
                    <div className="font-medium text-sm">{item.label}</div>
                    <div className="text-xs text-gray-500">{item.description}</div>
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Admin Info & Logout */}
        <div className="p-4 border-t border-gray-200">
          {isSidebarOpen && (
            <div className="mb-3">
              <div className="text-sm font-medium text-gray-800">
                {adminSession.username || 'Admin'}
              </div>
              <div className="text-xs text-gray-500">
                {language === 'bn' ? 'অনলাইন' : 'Online'} • {adminSession.role || 'admin'}
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center ${isSidebarOpen ? 'space-x-2 px-3' : 'justify-center px-2'} py-2 text-red-600 hover:bg-red-50 rounded-lg transition-all`}
            title={!isSidebarOpen ? (language === 'bn' ? 'লগআউট' : 'Logout') : ''}
          >
            <LogOut className="w-4 h-4" />
            {isSidebarOpen && (
              <span className="text-sm font-medium">
                {language === 'bn' ? 'লগআউট' : 'Logout'}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                {menuItems.find(item => item.id === activeSection)?.label || 'Dashboard'}
              </h2>
              <p className="text-sm text-gray-600">
                {language === 'bn' ? 'সিস্টেম ম্যানেজমেন্ট ও নিয়ন্ত্রণ প্যানেল' : 'System Management & Control Panel'}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-800">
                  {new Date().toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US')}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date().toLocaleTimeString(language === 'bn' ? 'bn-BD' : 'en-US')}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          {activeSection === 'dashboard' && (
            <AdminPanel />
          )}
          {activeSection === 'users' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">
                {language === 'bn' ? 'ইউজার ম্যানেজমেন্ট' : 'User Management'}
              </h3>
              <p className="text-gray-600">
                {language === 'bn' ? 'এই বিভাগটি শীঘ্রই আসছে...' : 'This section is coming soon...'}
              </p>
            </div>
          )}
          {activeSection === 'database' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">
                {language === 'bn' ? 'ডেটাবেস ম্যানেজমেন্ট' : 'Database Management'}
              </h3>
              <p className="text-gray-600">
                {language === 'bn' ? 'এই বিভাগটি শীঘ্রই আসছে...' : 'This section is coming soon...'}
              </p>
            </div>
          )}
          {activeSection === 'notifications' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">
                {language === 'bn' ? 'নোটিফিকেশন সিস্টেম' : 'Notification System'}
              </h3>
              <p className="text-gray-600">
                {language === 'bn' ? 'এই বিভাগটি শীঘ্রই আসছে...' : 'This section is coming soon...'}
              </p>
            </div>
          )}
          {activeSection === 'api-keys' && (
            <ApiKeyManager language={language} />
          )}
          {activeSection === 'settings' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">
                {language === 'bn' ? 'সিস্টেম সেটিংস' : 'System Settings'}
              </h3>
              <p className="text-gray-600">
                {language === 'bn' ? 'এই বিভাগটি শীঘ্রই আসছে...' : 'This section is coming soon...'}
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;