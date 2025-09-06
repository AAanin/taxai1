import React, { useState, useEffect } from 'react';
import AdminLogin from './components/AdminLogin';
import AdminLayout from './components/AdminLayout';

const AdminApp: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [language, setLanguage] = useState<'en' | 'bn'>('bn');
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if admin is already logged in
    const adminSession = localStorage.getItem('adminSession');
    if (adminSession) {
      try {
        const session = JSON.parse(adminSession);
        const loginTime = new Date(session.loginTime);
        const now = new Date();
        const hoursDiff = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60);
        
        // Session expires after 8 hours
        if (hoursDiff < 8) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('adminSession');
        }
      } catch (error) {
        localStorage.removeItem('adminSession');
      }
    }

    // Set language from localStorage or browser
    const savedLanguage = localStorage.getItem('language') as 'en' | 'bn';
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleLogin = (credentials: { username: string; password: string }) => {
    setIsAuthenticated(true);
    setError('');
  };

  const handleLoginError = (errorMessage: string) => {
    setError(errorMessage);
    setTimeout(() => setError(''), 5000);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('adminSession');
  };

  if (!isAuthenticated) {
    return (
      <div>
        <AdminLogin 
          onLogin={handleLogin}
          onError={handleLoginError}
          language={language}
        />
        {error && (
          <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <AdminLayout 
      onLogout={handleLogout}
      language={language}
    />
  );
};

export default AdminApp;