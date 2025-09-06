// React এবং প্রয়োজনীয় হুক ইমপোর্ট
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Google ইউজারের তথ্যের জন্য ইন্টারফেস
interface GoogleUser {
  id: string;          // ইউজার আইডি
  name: string;        // পূর্ণ নাম
  email: string;       // ইমেইল ঠিকানা
  picture: string;     // প্রোফাইল ছবির URL
  given_name: string;  // প্রথম নাম
  family_name: string; // পারিবারিক নাম
}

// ইউজারের অতিরিক্ত তথ্যের জন্য ইন্টারফেস
interface UserInfo {
  whatsappNumber: string;              // হোয়াটসঅ্যাপ নম্বর
  mobileNumber: string;                // মোবাইল নম্বর
  address: string;                     // ঠিকানা
  emergencyContact: string;            // জরুরি যোগাযোগ
  dateOfBirth: string;                 // জন্ম তারিখ
  gender: string;                      // লিঙ্গ
  bloodGroup: string;                  // রক্তের গ্রুপ
  enableWhatsappNotifications: boolean; // হোয়াটসঅ্যাপ নোটিফিকেশন সক্রিয়
  enableFirebaseNotifications: boolean; // Firebase নোটিফিকেশন সক্রিয়
}

// অথেন্টিকেশন কনটেক্সটের টাইপ ডেফিনিশন
interface AuthContextType {
  user: GoogleUser | null;                    // বর্তমান ইউজার
  userInfo: UserInfo | null;                  // ইউজারের অতিরিক্ত তথ্য
  isAuthenticated: boolean;                   // অথেন্টিকেশন স্ট্যাটাস
  isLoading: boolean;                         // লোডিং স্ট্যাটাস
  needsUserInfo: boolean;                     // ইউজার তথ্য প্রয়োজন কিনা
  login: (user: GoogleUser) => void;          // লগইন ফাংশন
  logout: () => void;                         // লগআউট ফাংশন
  saveUserInfo: (info: UserInfo) => void;     // ইউজার তথ্য সেভ ফাংশন
}

// অথেন্টিকেশন কনটেক্সট তৈরি
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider কম্পোনেন্টের প্রপস ইন্টারফেস
interface AuthProviderProps {
  children: ReactNode;  // চাইল্ড কম্পোনেন্টসমূহ
}

// অথেন্টিকেশন প্রোভাইডার কম্পোনেন্ট
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // স্টেট ভেরিয়েবলসমূহ
  const [user, setUser] = useState<GoogleUser | null>(null);        // ইউজার তথ্য
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);  // অতিরিক্ত ইউজার তথ্য
  const [isLoading, setIsLoading] = useState(true);                 // লোডিং স্ট্যাটাস

  useEffect(() => {
    // localStorage থেকে সেভ করা ইউজার তথ্য চেক করা
    const savedUser = localStorage.getItem('medical_app_user');       // সেভ করা ইউজার
    const savedUserInfo = localStorage.getItem('medical_app_userInfo'); // সেভ করা ইউজার তথ্য
    
    // সেভ করা ইউজার তথ্য পার্স করা
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);  // ইউজার সেট করা
      } catch (error) {
        console.error('Error parsing saved user:', error);  // পার্সিং ত্রুটি
        localStorage.removeItem('medical_app_user');        // ভুল ডেটা মুছে ফেলা
      }
    }
    
    // সেভ করা ইউজার তথ্য পার্স করা
    if (savedUserInfo) {
      try {
        setUserInfo(JSON.parse(savedUserInfo));  // ইউজার তথ্য সেট করা
      } catch (error) {
        console.error('Error parsing saved user info:', error);  // পার্সিং ত্রুটি
        localStorage.removeItem('medical_app_userInfo');          // ভুল ডেটা মুছে ফেলা
      }
    }
    
    setIsLoading(false);  // লোডিং শেষ
  }, []);

  // লগইন ফাংশন
  const login = (userData: GoogleUser) => {
    setUser(userData);  // ইউজার সেট করা
    localStorage.setItem('medical_app_user', JSON.stringify(userData));  // localStorage এ সেভ
  };

  // লগআউট ফাংশন
  const logout = () => {
    setUser(null);     // ইউজার ক্লিয়ার করা
    setUserInfo(null); // ইউজার তথ্য ক্লিয়ার করা
    localStorage.removeItem('medical_app_user');     // localStorage থেকে ইউজার মুছে ফেলা
    localStorage.removeItem('medical_app_userInfo'); // localStorage থেকে ইউজার তথ্য মুছে ফেলা
    
    // Google থেকে সাইন আউট
    if (window.google && window.google.accounts) {
      window.google.accounts.id.disableAutoSelect();  // Google auto-select বন্ধ করা
    }
  };

  // ইউজার তথ্য সেভ ফাংশন
  const saveUserInfo = (info: UserInfo) => {
    setUserInfo(info);  // ইউজার তথ্য সেট করা
    localStorage.setItem('medical_app_userInfo', JSON.stringify(info));  // localStorage এ সেভ
  };

  // কনটেক্সট ভ্যালু অবজেক্ট
  const value: AuthContextType = {
    user,                                    // বর্তমান ইউজার
    userInfo,                               // ইউজারের অতিরিক্ত তথ্য
    isAuthenticated: !!user,                // অথেন্টিকেশন স্ট্যাটাস (ইউজার আছে কিনা)
    isLoading,                              // লোডিং স্ট্যাটাস
    needsUserInfo: !!user && !userInfo,     // ইউজার তথ্য প্রয়োজন কিনা
    login,                                  // লগইন ফাংশন
    logout,                                 // লগআউট ফাংশন
    saveUserInfo,                           // ইউজার তথ্য সেভ ফাংশন
  };

  // কনটেক্সট প্রোভাইডার রিটার্ন
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// অথেন্টিকেশন হুক - কনটেক্সট ব্যবহারের জন্য
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');  // ত্রুটি বার্তা
  }
  return context;
};

// ডিফল্ট এক্সপোর্ট
export default AuthContext;