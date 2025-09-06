import React, { useState } from 'react';
import { Shield, Eye, EyeOff } from 'lucide-react';

interface AdminLoginProps {
  onLogin: (credentials: { username: string; password: string }) => void;
  onError: (error: string) => void;
  language: 'en' | 'bn';
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, onError, language }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      onError(language === 'bn' ? 'ইউজারনেম এবং পাসওয়ার্ড প্রয়োজন' : 'Username and password are required');
      return;
    }

    setIsLoading(true);
    
    try {
      // Admin credentials validation from environment variables
      const validCredentials = [
        { 
          username: import.meta.env.VITE_ADMIN_USERNAME_1 || 'admin', 
          password: import.meta.env.VITE_ADMIN_PASSWORD_1 || 'admin123' 
        },
        { 
          username: import.meta.env.VITE_ADMIN_USERNAME_2 || 'superadmin', 
          password: import.meta.env.VITE_ADMIN_PASSWORD_2 || 'super123' 
        },
        { 
          username: import.meta.env.VITE_ADMIN_USERNAME_3 || 'drmimu_admin', 
          password: import.meta.env.VITE_ADMIN_PASSWORD_3 || 'drmimu2024' 
        }
      ];

      const isValid = validCredentials.some(
        cred => cred.username === username && cred.password === password
      );

      if (isValid) {
        // Store admin session
        localStorage.setItem('adminSession', JSON.stringify({
          username,
          loginTime: new Date().toISOString(),
          role: username === 'superadmin' ? 'superadmin' : 'admin'
        }));
        
        onLogin({ username, password });
      } else {
        onError(language === 'bn' ? 'ভুল ইউজারনেম বা পাসওয়ার্ড' : 'Invalid username or password');
      }
    } catch (error) {
      onError(language === 'bn' ? 'লগইন করতে সমস্যা হয়েছে' : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-purple-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {language === 'bn' ? 'অ্যাডমিন লগইন' : 'Admin Login'}
          </h1>
          <p className="text-gray-600">
            {language === 'bn' ? 'সিস্টেম ম্যানেজমেন্ট প্যানেল' : 'System Management Panel'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'bn' ? 'ইউজারনেম' : 'Username'}
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder={language === 'bn' ? 'আপনার ইউজারনেম লিখুন' : 'Enter your username'}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'bn' ? 'পাসওয়ার্ড' : 'Password'}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all pr-12"
                placeholder={language === 'bn' ? 'আপনার পাসওয়ার্ড লিখুন' : 'Enter your password'}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isLoading 
              ? (language === 'bn' ? 'লগইন হচ্ছে...' : 'Logging in...') 
              : (language === 'bn' ? 'লগইন' : 'Login')
            }
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            {language === 'bn' 
              ? 'শুধুমাত্র অনুমোদিত অ্যাডমিনিস্ট্রেটরদের জন্য' 
              : 'For authorized administrators only'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;