import React from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../../components/auth/LoginForm';
import ProtectedRoute from '../../components/auth/ProtectedRoute';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    navigate('/dashboard', { replace: true });
  };

  return (
    <ProtectedRoute requireAuth={false}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              ডাঃ মিমু মেডিকেল চ্যাটবট
            </h1>
            <p className="text-gray-600">
              আপনার স্বাস্থ্য সেবার জন্য AI সহায়ক
            </p>
          </div>

          {/* Login Form */}
          <LoginForm onSuccess={handleLoginSuccess} />

          {/* Footer */}
          <div className="text-center text-sm text-gray-500">
            <p>
              © ২০২৪ ডাঃ মিমু মেডিকেল চ্যাটবট। সকল অধিকার সংরক্ষিত।
            </p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default LoginPage;