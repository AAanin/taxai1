import React from 'react';
import { useNavigate } from 'react-router-dom';
import RegisterForm from '../../components/auth/RegisterForm';
import ProtectedRoute from '../../components/auth/ProtectedRoute';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  const handleRegisterSuccess = () => {
    navigate('/login', { replace: true });
  };

  return (
    <ProtectedRoute requireAuth={false}>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              ডাঃ মিমু মেডিকেল চ্যাটবট
            </h1>
            <p className="text-gray-600">
              নতুন অ্যাকাউন্ট তৈরি করে শুরু করুন
            </p>
          </div>

          {/* Register Form */}
          <RegisterForm onSuccess={handleRegisterSuccess} />

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

export default RegisterPage;