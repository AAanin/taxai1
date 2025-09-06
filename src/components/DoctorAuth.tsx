// Doctor Authentication Component - ডাক্তার অথেন্টিকেশন কম্পোনেন্ট
import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  UserPlus, 
  LogIn, 
  Stethoscope, 
  MapPin, 
  Award, 
  Building2, 
  Camera, 
  Check, 
  X, 
  AlertCircle, 
  Shield, 
  Star,
  Calendar,
  FileText,
  Upload
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// Doctor Registration Data Interface
interface DoctorRegistrationData {
  // Personal Information
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  
  // Professional Details
  bmdcNumber: string;
  specialization: string;
  experience: string;
  qualification: string;
  
  // Hospital/Clinic Information
  workplace: string;
  workplaceAddress: string;
  consultationFee: string;
  
  // Credentials
  password: string;
  confirmPassword: string;
  
  // Additional
  profilePicture?: File;
  termsAccepted: boolean;
}

// Doctor Login Data Interface
interface DoctorLoginData {
  emailOrPhone: string;
  password: string;
  rememberMe: boolean;
}

// Form Validation Errors
interface ValidationErrors {
  [key: string]: string;
}

// Password Strength Levels
type PasswordStrength = 'weak' | 'medium' | 'strong' | 'very-strong';

// Language Type
type Language = 'bn' | 'en';

// Component Props
interface DoctorAuthProps {
  language?: Language;
  onLoginSuccess?: (doctor: any) => void;
  onRegistrationSuccess?: (doctor: any) => void;
}

const DoctorAuth: React.FC<DoctorAuthProps> = ({ 
  language = 'bn', 
  onLoginSuccess, 
  onRegistrationSuccess 
}) => {
  // State Management
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>('weak');
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  
  // Form Data States
  const [loginData, setLoginData] = useState<DoctorLoginData>({
    emailOrPhone: '',
    password: '',
    rememberMe: false
  });
  
  const [registrationData, setRegistrationData] = useState<DoctorRegistrationData>({
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: 'male',
    bmdcNumber: '',
    specialization: '',
    experience: '',
    qualification: '',
    workplace: '',
    workplaceAddress: '',
    consultationFee: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false
  });
  
  const { login } = useAuth();
  const navigate = useNavigate();
  
  // Text Content Based on Language
  const text = {
    bn: {
      doctorLogin: 'ডাক্তার লগইন',
      doctorRegistration: 'ডাক্তার রেজিস্ট্রেশন',
      switchToRegister: 'নতুন অ্যাকাউন্ট তৈরি করুন',
      switchToLogin: 'ইতিমধ্যে অ্যাকাউন্ট আছে? লগইন করুন',
      emailOrPhone: 'ইমেইল বা ফোন নম্বর',
      password: 'পাসওয়ার্ড',
      confirmPassword: 'পাসওয়ার্ড নিশ্চিত করুন',
      rememberMe: 'আমাকে মনে রাখুন',
      forgotPassword: 'পাসওয়ার্ড ভুলে গেছেন?',
      loginButton: 'লগইন করুন',
      registerButton: 'রেজিস্টার করুন',
      fullName: 'পূর্ণ নাম',
      email: 'ইমেইল',
      phone: 'ফোন নম্বর',
      dateOfBirth: 'জন্ম তারিখ',
      gender: 'লিঙ্গ',
      male: 'পুরুষ',
      female: 'মহিলা',
      other: 'অন্যান্য',
      bmdcNumber: 'BMDC রেজিস্ট্রেশন নম্বর',
      specialization: 'বিশেষত্ব',
      experience: 'অভিজ্ঞতা (বছর)',
      qualification: 'শিক্ষাগত যোগ্যতা',
      workplace: 'কর্মক্ষেত্র',
      workplaceAddress: 'কর্মক্ষেত্রের ঠিকানা',
      consultationFee: 'পরামর্শ ফি (টাকা)',
      profilePicture: 'প্রোফাইল ছবি',
      uploadPhoto: 'ছবি আপলোড করুন',
      termsAndConditions: 'শর্তাবলী ও নীতিমালা গ্রহণ করি',
      personalInfo: 'ব্যক্তিগত তথ্য',
      professionalInfo: 'পেশাগত তথ্য',
      workplaceInfo: 'কর্মক্ষেত্রের তথ্য',
      accountSecurity: 'অ্যাকাউন্ট নিরাপত্তা',
      passwordStrength: 'পাসওয়ার্ড শক্তি',
      weak: 'দুর্বল',
      medium: 'মাঝারি',
      strong: 'শক্তিশালী',
      veryStrong: 'অত্যন্ত শক্তিশালী',
      loading: 'প্রক্রিয়াকরণ...',
      loginWithGoogle: 'Google দিয়ে লগইন করুন'
    },
    en: {
      doctorLogin: 'Doctor Login',
      doctorRegistration: 'Doctor Registration',
      switchToRegister: 'Create New Account',
      switchToLogin: 'Already have an account? Login',
      emailOrPhone: 'Email or Phone Number',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      rememberMe: 'Remember Me',
      forgotPassword: 'Forgot Password?',
      loginButton: 'Login',
      registerButton: 'Register',
      fullName: 'Full Name',
      email: 'Email',
      phone: 'Phone Number',
      dateOfBirth: 'Date of Birth',
      gender: 'Gender',
      male: 'Male',
      female: 'Female',
      other: 'Other',
      bmdcNumber: 'BMDC Registration Number',
      specialization: 'Specialization',
      experience: 'Experience (Years)',
      qualification: 'Educational Qualification',
      workplace: 'Workplace',
      workplaceAddress: 'Workplace Address',
      consultationFee: 'Consultation Fee (BDT)',
      profilePicture: 'Profile Picture',
      uploadPhoto: 'Upload Photo',
      termsAndConditions: 'I accept Terms & Conditions',
      personalInfo: 'Personal Information',
      professionalInfo: 'Professional Information',
      workplaceInfo: 'Workplace Information',
      accountSecurity: 'Account Security',
      passwordStrength: 'Password Strength',
      weak: 'Weak',
      medium: 'Medium',
      strong: 'Strong',
      veryStrong: 'Very Strong',
      loading: 'Processing...',
      loginWithGoogle: 'Login with Google'
    }
  };
  
  const t = text[language];
  
  // Password Strength Checker
  const checkPasswordStrength = (password: string): PasswordStrength => {
    let score = 0;
    
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    if (score <= 2) return 'weak';
    if (score === 3) return 'medium';
    if (score === 4) return 'strong';
    return 'very-strong';
  };
  
  // Form Validation
  const validateLoginForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    
    if (!loginData.emailOrPhone.trim()) {
      newErrors.emailOrPhone = language === 'bn' ? 'ইমেইল বা ফোন নম্বর প্রয়োজন' : 'Email or phone number is required';
    }
    
    if (!loginData.password) {
      newErrors.password = language === 'bn' ? 'পাসওয়ার্ড প্রয়োজন' : 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const validateRegistrationForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    
    // Personal Information Validation
    if (!registrationData.fullName.trim()) {
      newErrors.fullName = language === 'bn' ? 'পূর্ণ নাম প্রয়োজন' : 'Full name is required';
    }
    
    if (!registrationData.email.trim()) {
      newErrors.email = language === 'bn' ? 'ইমেইল প্রয়োজন' : 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registrationData.email)) {
      newErrors.email = language === 'bn' ? 'বৈধ ইমেইল প্রয়োজন' : 'Valid email is required';
    }
    
    if (!registrationData.phone.trim()) {
      newErrors.phone = language === 'bn' ? 'ফোন নম্বর প্রয়োজন' : 'Phone number is required';
    } else if (!/^[0-9+\-\s()]+$/.test(registrationData.phone)) {
      newErrors.phone = language === 'bn' ? 'বৈধ ফোন নম্বর প্রয়োজন' : 'Valid phone number is required';
    }
    
    // Professional Information Validation
    if (!registrationData.bmdcNumber.trim()) {
      newErrors.bmdcNumber = language === 'bn' ? 'BMDC রেজিস্ট্রেশন নম্বর প্রয়োজন' : 'BMDC registration number is required';
    }
    
    if (!registrationData.specialization.trim()) {
      newErrors.specialization = language === 'bn' ? 'বিশেষত্ব প্রয়োজন' : 'Specialization is required';
    }
    
    // Password Validation
    if (!registrationData.password) {
      newErrors.password = language === 'bn' ? 'পাসওয়ার্ড প্রয়োজন' : 'Password is required';
    } else if (registrationData.password.length < 8) {
      newErrors.password = language === 'bn' ? 'পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে' : 'Password must be at least 8 characters';
    }
    
    if (registrationData.password !== registrationData.confirmPassword) {
      newErrors.confirmPassword = language === 'bn' ? 'পাসওয়ার্ড মিলছে না' : 'Passwords do not match';
    }
    
    if (!registrationData.termsAccepted) {
      newErrors.termsAccepted = language === 'bn' ? 'শর্তাবলী গ্রহণ করতে হবে' : 'You must accept terms and conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle Profile Picture Upload
  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setRegistrationData(prev => ({ ...prev, profilePicture: file }));
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Demo Doctor Profile Data
  const demoDoctor = {
    email: 'doctor@test.com',
    password: 'doctor123',
    profile: {
      id: 'doc_demo_001',
      fullName: 'ডাঃ মোহাম্মদ রহিম',
      email: 'doctor@test.com',
      phone: '+8801712345678',
      bmdcNumber: '12345',
      specialization: 'কার্ডিওলজি',
      experience: '১০ বছর',
      qualification: 'MBBS, MD (Cardiology)',
      workplace: 'ঢাকা মেডিকেল কলেজ হাসপাতাল',
      workplaceAddress: 'ঢাকা, বাংলাদেশ',
      consultationFee: '১০০০',
      type: 'doctor',
      verified: true,
      profilePicture: null
    }
  };

  // Handle Demo Login
  const handleDemoLogin = async () => {
    setIsLoading(true);
    
    try {
      // Set demo credentials
      setLoginData({
        emailOrPhone: demoDoctor.email,
        password: demoDoctor.password,
        rememberMe: false
      });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Save demo profile to localStorage
      localStorage.setItem('demoDoctor', JSON.stringify(demoDoctor.profile));
      
      login(demoDoctor.profile);
      onLoginSuccess?.(demoDoctor.profile);
      navigate('/doctor-dashboard');
      
    } catch (error) {
      console.error('Demo login error:', error);
      setErrors({ general: language === 'bn' ? 'ডেমো লগইন ব্যর্থ হয়েছে' : 'Demo login failed' });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateLoginForm()) return;
    
    setIsLoading(true);
    
    try {
      // Check for demo credentials
      if (loginData.emailOrPhone === demoDoctor.email && loginData.password === demoDoctor.password) {
        // Demo login
        localStorage.setItem('demoDoctor', JSON.stringify(demoDoctor.profile));
        login(demoDoctor.profile);
        onLoginSuccess?.(demoDoctor.profile);
        navigate('/doctor-dashboard');
        return;
      }
      
      // Simulate API call for other credentials
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock doctor data for other logins
      const doctorData = {
        id: 'doc_' + Date.now(),
        name: 'Dr. Example',
        email: loginData.emailOrPhone,
        type: 'doctor',
        verified: true
      };
      
      login(doctorData);
      onLoginSuccess?.(doctorData);
      navigate('/doctor-dashboard');
      
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ general: language === 'bn' ? 'লগইন ব্যর্থ হয়েছে' : 'Login failed' });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle Registration Submit
  const handleRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateRegistrationForm()) return;
    
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock doctor registration
      const doctorData = {
        id: 'doc_' + Date.now(),
        ...registrationData,
        type: 'doctor',
        verified: false
      };
      
      onRegistrationSuccess?.(doctorData);
      setIsLogin(true); // Switch to login after successful registration
      
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ general: language === 'bn' ? 'রেজিস্ট্রেশন ব্যর্থ হয়েছে' : 'Registration failed' });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Update password strength when password changes
  useEffect(() => {
    if (registrationData.password) {
      setPasswordStrength(checkPasswordStrength(registrationData.password));
    }
  }, [registrationData.password]);
  
  // Password Strength Color
  const getPasswordStrengthColor = (strength: PasswordStrength) => {
    switch (strength) {
      case 'weak': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'strong': return 'bg-blue-500';
      case 'very-strong': return 'bg-green-500';
      default: return 'bg-gray-300';
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-green-600 p-6 text-white text-center">
          <div className="flex items-center justify-center mb-4">
            <Stethoscope className="w-8 h-8 mr-3" />
            <h1 className="text-3xl font-bold">
              {isLogin ? t.doctorLogin : t.doctorRegistration}
            </h1>
          </div>
          <p className="text-blue-100">
            {isLogin 
              ? (language === 'bn' ? 'আপনার ডাক্তার অ্যাকাউন্টে প্রবেশ করুন' : 'Access your doctor account')
              : (language === 'bn' ? 'নতুন ডাক্তার অ্যাকাউন্ট তৈরি করুন' : 'Create your doctor account')
            }
          </p>
        </div>
        
        {/* Toggle Buttons */}
        <div className="flex border-b">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-4 px-6 font-semibold transition-colors ${
              isLogin 
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <LogIn className="w-5 h-5 inline mr-2" />
            {t.doctorLogin}
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-4 px-6 font-semibold transition-colors ${
              !isLogin 
                ? 'bg-green-50 text-green-600 border-b-2 border-green-600' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <UserPlus className="w-5 h-5 inline mr-2" />
            {t.doctorRegistration}
          </button>
        </div>
        
        {/* Form Content */}
        <div className="p-6">
          {isLogin ? (
            /* Login Form */
            <form onSubmit={handleLoginSubmit} className="space-y-6">
              {/* Email/Phone Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  {t.emailOrPhone}
                </label>
                <input
                  type="text"
                  value={loginData.emailOrPhone}
                  onChange={(e) => setLoginData(prev => ({ ...prev, emailOrPhone: e.target.value }))}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.emailOrPhone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder={language === 'bn' ? 'আপনার ইমেইল বা ফোন নম্বর' : 'Your email or phone number'}
                />
                {errors.emailOrPhone && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.emailOrPhone}
                  </p>
                )}
              </div>
              
              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Lock className="w-4 h-4 inline mr-2" />
                  {t.password}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginData.password}
                    onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                    className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder={language === 'bn' ? 'আপনার পাসওয়ার্ড' : 'Your password'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.password}
                  </p>
                )}
              </div>
              
              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={loginData.rememberMe}
                    onChange={(e) => setLoginData(prev => ({ ...prev, rememberMe: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">{t.rememberMe}</span>
                </label>
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  {t.forgotPassword}
                </button>
              </div>
              
              {/* General Error */}
              {errors.general && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600 text-sm flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {errors.general}
                  </p>
                </div>
              )}
              
              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 focus:ring-4 focus:ring-blue-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    {t.loading}
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5 mr-2" />
                    {t.loginButton}
                  </>
                )}
              </button>
              
              {/* Demo Login Section */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-center mb-3">
                  <Shield className="w-5 h-5 text-green-600 mr-2" />
                  <h4 className="font-semibold text-green-800">
                    {language === 'bn' ? 'ডেমো লগইন' : 'Demo Login'}
                  </h4>
                </div>
                <div className="text-sm text-green-700 mb-3">
                  <p className="mb-2">
                    {language === 'bn' ? 'টেস্ট করার জন্য নিচের তথ্য ব্যবহার করুন:' : 'Use the following credentials for testing:'}
                  </p>
                  <div className="bg-white rounded p-3 border border-green-200">
                    <p><strong>{language === 'bn' ? 'ইমেইল:' : 'Email:'}</strong> doctor@test.com</p>
                    <p><strong>{language === 'bn' ? 'পাসওয়ার্ড:' : 'Password:'}</strong> doctor123</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {language === 'bn' ? 'ডাক্তার: ডাঃ মোহাম্মদ রহিম (কার্ডিওলজিস্ট)' : 'Doctor: Dr. Mohammad Rahim (Cardiologist)'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleDemoLogin}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-2 px-4 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 focus:ring-4 focus:ring-green-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {language === 'bn' ? 'লগইন হচ্ছে...' : 'Logging in...'}
                    </>
                  ) : (
                    <>
                      <Star className="w-4 h-4 mr-2" />
                      {language === 'bn' ? 'ডেমো লগইন করুন' : 'Demo Login'}
                    </>
                  )}
                </button>
              </div>

              {/* Google Login */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    {language === 'bn' ? 'অথবা' : 'or'}
                  </span>
                </div>
              </div>
              
              <button
                type="button"
                className="w-full bg-white border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 focus:ring-4 focus:ring-gray-200 transition-all duration-200 flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {t.loginWithGoogle}
              </button>
            </form>
          ) : (
            /* Registration Form */
            <form onSubmit={handleRegistrationSubmit} className="space-y-8">
              {/* Personal Information Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-blue-600" />
                  {t.personalInfo}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.fullName} *
                    </label>
                    <input
                      type="text"
                      value={registrationData.fullName}
                      onChange={(e) => setRegistrationData(prev => ({ ...prev, fullName: e.target.value }))}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                        errors.fullName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder={language === 'bn' ? 'ডাঃ আপনার নাম' : 'Dr. Your Name'}
                    />
                    {errors.fullName && (
                      <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                    )}
                  </div>
                  
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.email} *
                    </label>
                    <input
                      type="email"
                      value={registrationData.email}
                      onChange={(e) => setRegistrationData(prev => ({ ...prev, email: e.target.value }))}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="doctor@example.com"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>
                  
                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.phone} *
                    </label>
                    <input
                      type="tel"
                      value={registrationData.phone}
                      onChange={(e) => setRegistrationData(prev => ({ ...prev, phone: e.target.value }))}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="+880 1XXX-XXXXXX"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                    )}
                  </div>
                  
                  {/* Date of Birth */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.dateOfBirth}
                    </label>
                    <input
                      type="date"
                      value={registrationData.dateOfBirth}
                      onChange={(e) => setRegistrationData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    />
                  </div>
                  
                  {/* Gender */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.gender}
                    </label>
                    <div className="flex space-x-4">
                      {(['male', 'female', 'other'] as const).map((gender) => (
                        <label key={gender} className="flex items-center">
                          <input
                            type="radio"
                            name="gender"
                            value={gender}
                            checked={registrationData.gender === gender}
                            onChange={(e) => setRegistrationData(prev => ({ ...prev, gender: e.target.value as any }))}
                            className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">{t[gender]}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Professional Information Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Stethoscope className="w-5 h-5 mr-2 text-green-600" />
                  {t.professionalInfo}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* BMDC Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.bmdcNumber} *
                    </label>
                    <input
                      type="text"
                      value={registrationData.bmdcNumber}
                      onChange={(e) => setRegistrationData(prev => ({ ...prev, bmdcNumber: e.target.value }))}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                        errors.bmdcNumber ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="BMDC-XXXXX"
                    />
                    {errors.bmdcNumber && (
                      <p className="text-red-500 text-sm mt-1">{errors.bmdcNumber}</p>
                    )}
                  </div>
                  
                  {/* Specialization */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.specialization} *
                    </label>
                    <select
                      value={registrationData.specialization}
                      onChange={(e) => setRegistrationData(prev => ({ ...prev, specialization: e.target.value }))}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                        errors.specialization ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">{language === 'bn' ? 'বিশেষত্ব নির্বাচন করুন' : 'Select Specialization'}</option>
                      <option value="cardiology">{language === 'bn' ? 'হৃদরোগ বিশেষজ্ঞ' : 'Cardiology'}</option>
                      <option value="neurology">{language === 'bn' ? 'স্নায়ুরোগ বিশেষজ্ঞ' : 'Neurology'}</option>
                      <option value="orthopedics">{language === 'bn' ? 'অর্থোপেডিক্স' : 'Orthopedics'}</option>
                      <option value="pediatrics">{language === 'bn' ? 'শিশুরোগ বিশেষজ্ঞ' : 'Pediatrics'}</option>
                      <option value="gynecology">{language === 'bn' ? 'স্ত্রীরোগ বিশেষজ্ঞ' : 'Gynecology'}</option>
                      <option value="dermatology">{language === 'bn' ? 'চর্মরোগ বিশেষজ্ঞ' : 'Dermatology'}</option>
                      <option value="general">{language === 'bn' ? 'সাধারণ চিকিৎসক' : 'General Medicine'}</option>
                    </select>
                    {errors.specialization && (
                      <p className="text-red-500 text-sm mt-1">{errors.specialization}</p>
                    )}
                  </div>
                  
                  {/* Experience */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.experience}
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={registrationData.experience}
                      onChange={(e) => setRegistrationData(prev => ({ ...prev, experience: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      placeholder="5"
                    />
                  </div>
                  
                  {/* Qualification */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.qualification}
                    </label>
                    <input
                      type="text"
                      value={registrationData.qualification}
                      onChange={(e) => setRegistrationData(prev => ({ ...prev, qualification: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      placeholder={language === 'bn' ? 'MBBS, MD' : 'MBBS, MD'}
                    />
                  </div>
                </div>
              </div>
              
              {/* Workplace Information Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Building2 className="w-5 h-5 mr-2 text-purple-600" />
                  {t.workplaceInfo}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Workplace */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.workplace}
                    </label>
                    <input
                      type="text"
                      value={registrationData.workplace}
                      onChange={(e) => setRegistrationData(prev => ({ ...prev, workplace: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      placeholder={language === 'bn' ? 'হাসপাতাল/ক্লিনিকের নাম' : 'Hospital/Clinic Name'}
                    />
                  </div>
                  
                  {/* Consultation Fee */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.consultationFee}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={registrationData.consultationFee}
                      onChange={(e) => setRegistrationData(prev => ({ ...prev, consultationFee: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      placeholder="500"
                    />
                  </div>
                  
                  {/* Workplace Address */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.workplaceAddress}
                    </label>
                    <textarea
                      value={registrationData.workplaceAddress}
                      onChange={(e) => setRegistrationData(prev => ({ ...prev, workplaceAddress: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      placeholder={language === 'bn' ? 'সম্পূর্ণ ঠিকানা' : 'Complete Address'}
                    />
                  </div>
                </div>
              </div>
              
              {/* Profile Picture Upload */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Camera className="w-5 h-5 mr-2 text-indigo-600" />
                  {t.profilePicture}
                </h3>
                <div className="flex items-center space-x-4">
                  {profilePreview ? (
                    <div className="relative">
                      <img
                        src={profilePreview}
                        alt="Profile Preview"
                        className="w-20 h-20 rounded-full object-cover border-4 border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setProfilePreview(null);
                          setRegistrationData(prev => ({ ...prev, profilePicture: undefined }));
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                      <Camera className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <label className="cursor-pointer bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg border border-indigo-200 hover:bg-indigo-100 transition-colors">
                    <Upload className="w-4 h-4 inline mr-2" />
                    {t.uploadPhoto}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
              
              {/* Account Security Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-red-600" />
                  {t.accountSecurity}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.password} *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={registrationData.password}
                        onChange={(e) => setRegistrationData(prev => ({ ...prev, password: e.target.value }))}
                        className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                          errors.password ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder={language === 'bn' ? 'শক্তিশালী পাসওয়ার্ড' : 'Strong password'}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                    )}
                    
                    {/* Password Strength Indicator */}
                    {registrationData.password && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">{t.passwordStrength}:</span>
                          <span className={`font-medium ${
                            passwordStrength === 'weak' ? 'text-red-500' :
                            passwordStrength === 'medium' ? 'text-yellow-500' :
                            passwordStrength === 'strong' ? 'text-blue-500' :
                            'text-green-500'
                          }`}>
                            {t[passwordStrength.replace('-', '') as keyof typeof t]}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              getPasswordStrengthColor(passwordStrength)
                            }`}
                            style={{ 
                              width: `${{
                                'weak': '25%',
                                'medium': '50%',
                                'strong': '75%',
                                'very-strong': '100%'
                              }[passwordStrength]}` 
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.confirmPassword} *
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={registrationData.confirmPassword}
                        onChange={(e) => setRegistrationData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                          errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder={language === 'bn' ? 'পাসওয়ার্ড পুনরায় লিখুন' : 'Re-enter password'}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                    )}
                    
                    {/* Password Match Indicator */}
                    {registrationData.confirmPassword && (
                      <div className="mt-2 flex items-center text-sm">
                        {registrationData.password === registrationData.confirmPassword ? (
                          <>
                            <Check className="w-4 h-4 text-green-500 mr-1" />
                            <span className="text-green-600">
                              {language === 'bn' ? 'পাসওয়ার্ড মিলেছে' : 'Passwords match'}
                            </span>
                          </>
                        ) : (
                          <>
                            <X className="w-4 h-4 text-red-500 mr-1" />
                            <span className="text-red-600">
                              {language === 'bn' ? 'পাসওয়ার্ড মিলছে না' : 'Passwords do not match'}
                            </span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Terms and Conditions */}
              <div>
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={registrationData.termsAccepted}
                    onChange={(e) => setRegistrationData(prev => ({ ...prev, termsAccepted: e.target.checked }))}
                    className={`w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 mt-1 ${
                      errors.termsAccepted ? 'border-red-500' : ''
                    }`}
                  />
                  <span className="ml-3 text-sm text-gray-600">
                    {t.termsAndConditions}
                    <button
                      type="button"
                      className="text-green-600 hover:text-green-800 font-medium ml-1"
                    >
                      {language === 'bn' ? 'পড়ুন' : 'Read'}
                    </button>
                  </span>
                </label>
                {errors.termsAccepted && (
                  <p className="text-red-500 text-sm mt-1 ml-7">{errors.termsAccepted}</p>
                )}
              </div>
              
              {/* General Error */}
              {errors.general && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600 text-sm flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {errors.general}
                  </p>
                </div>
              )}
              
              {/* Register Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 focus:ring-4 focus:ring-green-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    {t.loading}
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5 mr-2" />
                    {t.registerButton}
                  </>
                )}
              </button>
            </form>
          )}
          
          {/* Switch Form Link */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setErrors({});
              }}
              className="text-sm text-gray-600 hover:text-gray-800 font-medium"
            >
              {isLogin ? t.switchToRegister : t.switchToLogin}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorAuth;