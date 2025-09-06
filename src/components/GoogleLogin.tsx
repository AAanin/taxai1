// React এবং প্রয়োজনীয় হুক ইমপোর্ট
import React, { useEffect, useState } from 'react';
import { Language } from '../types';

// GoogleLogin কম্পোনেন্টের প্রপস ইন্টারফেস
interface GoogleLoginProps {
  language: Language;                           // ভাষা সেটিং
  onLoginSuccess: (user: GoogleUser) => void;   // সফল লগইনের কলব্যাক
  onLoginError: (error: string) => void;        // লগইন এরর কলব্যাক
}

// Google ইউজারের তথ্যের ইন্টারফেস
interface GoogleUser {
  id: string;          // ইউজার আইডি
  name: string;        // পূর্ণ নাম
  email: string;       // ইমেইল ঠিকানা
  picture: string;     // প্রোফাইল ছবির URL
  given_name: string;  // প্রথম নাম
  family_name: string; // পারিবারিক নাম
}

// গ্লোবাল উইন্ডো অবজেক্টে Google API যোগ করা
declare global {
  interface Window {
    google: any;  // Google Identity Services API
    gapi: any;    // Google API Client Library
  }
}

const GoogleLogin: React.FC<GoogleLoginProps> = ({ language, onLoginSuccess, onLoginError }) => {
  // স্টেট ভেরিয়েবল
  const [isLoading, setIsLoading] = useState(false);        // লোডিং স্ট্যাটাস
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false); // Google API লোড স্ট্যাটাস

  // Google Client ID - ডেভেলপমেন্টের জন্য প্রয়োজনীয় সেটআপ:
  // ১. https://console.developers.google.com/ এ যান
  // ২. নতুন প্রজেক্ট তৈরি করুন বা বিদ্যমান নির্বাচন করুন
  // ৩. Google+ API এবং Google Identity Services সক্রিয় করুন
  // ৪. ওয়েব অ্যাপ্লিকেশনের জন্য OAuth 2.0 client ID তৈরি করুন
  // ৫. http://localhost:5173 কে authorized origins এ যোগ করুন
  // ৬. http://localhost:5173 কে authorized redirect URIs এ যোগ করুন
  // ৭. .env ফাইলে VITE_GOOGLE_CLIENT_ID সেট করুন

  const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ||  // পরিবেশ ভেরিয়েবল থেকে
    localStorage.getItem('google_client_id') ||               // localStorage থেকে
    'YOUR_GOOGLE_CLIENT_ID'; // ডিফল্ট প্লেসহোল্ডার (আপনার আসল client ID দিয়ে প্রতিস্থাপন করুন)

  useEffect(() => {
    // Google Identity Services লোড করা
    const loadGoogleScript = () => {
      // যদি Google API ইতিমধ্যে লোড হয়ে থাকে
      if (window.google) {
        setIsGoogleLoaded(true);
        return;
      }

      // Google Identity Services স্ক্রিপ্ট তৈরি করা
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';  // Google GSI client URL
      script.async = true;   // অ্যাসিঙ্ক লোডিং
      script.defer = true;   // ডিফার লোডিং
      script.onload = () => {
        // স্ক্রিপ্ট লোড হওয়ার পর Google API চেক করা
        if (window.google) {
          setIsGoogleLoaded(true);        // লোড স্ট্যাটাস আপডেট
          initializeGoogleSignIn();      // Google Sign-In ইনিশিয়ালাইজ করা
        }
      };
      document.head.appendChild(script);  // DOM এ স্ক্রিপ্ট যোগ করা
    };

    loadGoogleScript();  // স্ক্রিপ্ট লোড ফাংশন কল করা
  }, []);

  // Google Sign-In ইনিশিয়ালাইজেশন ফাংশন
  const initializeGoogleSignIn = () => {
    if (window.google && window.google.accounts) {
      try {
        console.log('Initializing Google Sign-In with Client ID:', CLIENT_ID);
        // Google Identity Services কনফিগারেশন
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,                    // OAuth Client ID
          callback: handleCredentialResponse,      // লগইন সফল হলে কলব্যাক
          auto_select: false,                      // অটো সিলেক্ট বন্ধ
          cancel_on_tap_outside: true,             // বাইরে ক্লিক করলে বাতিল
          use_fedcm_for_prompt: false              // FedCM ব্যবহার না করা
        });
        console.log('Google Sign-In initialized successfully');
      } catch (error) {
        console.error('Error initializing Google Sign-In:', error);
        // ইনিশিয়ালাইজেশন এরর হ্যান্ডলিং
        onLoginError(language === 'bn' ? 'গুগল সাইন-ইন সেটআপে সমস্যা হয়েছে' : 'Google Sign-In setup failed');
      }
    } else {
      console.error('Google accounts API not available');
      // Google API উপলব্ধ না থাকলে এরর
      onLoginError(language === 'bn' ? 'গুগল সার্ভিস উপলব্ধ নেই' : 'Google services not available');
    }
  };

  // Google থেকে প্রাপ্ত credential response হ্যান্ডল করা
  const handleCredentialResponse = (response: any) => {
    try {
      // credential চেক করা
      if (!response || !response.credential) {
        throw new Error('No credential received from Google');
      }

      // JWT টোকেন ডিকোড করে ইউজার তথ্য বের করা
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      
      // Google ইউজার অবজেক্ট তৈরি করা
      const user: GoogleUser = {
        id: payload.sub,                                                    // ইউজার আইডি
        name: payload.name || `${payload.given_name} ${payload.family_name}`, // পূর্ণ নাম
        email: payload.email,                                               // ইমেইল
        picture: payload.picture,                                           // প্রোফাইল ছবি
        given_name: payload.given_name || '',                               // প্রথম নাম
        family_name: payload.family_name || '',                             // পারিবারিক নাম
      };

      console.log('Google login successful:', user.email);
      onLoginSuccess(user);  // সফল লগইনের কলব্যাক কল করা
    } catch (error) {
      console.error('Error parsing Google credential:', error);
      // credential parsing এরর হ্যান্ডলিং
      onLoginError(language === 'bn' ? 'গুগল লগইনে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।' : 'Google login failed. Please try again.');
    }
  };

  // Google লগইন হ্যান্ডলার ফাংশন
  const handleGoogleLogin = () => {
    // Google সার্ভিস লোড চেক করা
    if (!isGoogleLoaded || !window.google || !window.google.accounts) {
      console.error('Google services not properly loaded');
      onLoginError(language === 'bn' ? 'গুগল সার্ভিস লোড হয়নি। পেজ রিফ্রেশ করে আবার চেষ্টা করুন।' : 'Google services not loaded. Please refresh the page and try again.');
      return;
    }

    setIsLoading(true);  // লোডিং স্ট্যাটাস সেট করা
    
    try {
      console.log('Attempting Google Sign-In...');
      
      // প্রথমে One Tap প্রম্পট দেখানোর চেষ্টা করা
      window.google.accounts.id.prompt((notification: any) => {
        console.log('Google prompt notification:', notification);
        setIsLoading(false);  // লোডিং শেষ
        
        // যদি One Tap প্রদর্শিত না হয় বা স্কিপ হয়
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          console.log('One Tap not displayed, rendering button');
          // ফলব্যাক হিসেবে বাটন রেন্ডার করা
          const buttonContainer = document.getElementById('google-signin-button');
          if (buttonContainer) {
            buttonContainer.innerHTML = ''; // পূর্ববর্তী বাটন ক্লিয়ার করা
            // Google Sign-In বাটন রেন্ডার করা
            window.google.accounts.id.renderButton(
              buttonContainer,
              {
                theme: 'outline',     // বাটনের থিম
                size: 'large',        // বাটনের সাইজ
                width: '100%',        // বাটনের প্রস্থ
                text: language === 'bn' ? 'continue_with' : 'signin_with',  // বাটনের টেক্সট
                shape: 'rectangular'  // বাটনের আকার
              }
            );
          }
        }
      });
    } catch (error) {
      setIsLoading(false);  // এরর হলে লোডিং বন্ধ
      console.error('Google login error:', error);
      // লগইন এরর হ্যান্ডলিং
      onLoginError(language === 'bn' ? 'গুগল লগইনে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।' : 'Google login failed. Please try again.');
    }
  };

  // UI টেক্সট অবজেক্ট (বাংলা ও ইংরেজি)
  const texts = {
    bn: {
      signInButton: 'গুগল দিয়ে লগইন করুন',           // লগইন বাটনের টেক্সট
      loading: 'লোড হচ্ছে...',                      // লোডিং টেক্সট
      description: 'আপনার গুগল অ্যাকাউন্ট দিয়ে সহজেই লগইন করুন',  // বর্ণনা
    },
    en: {
      signInButton: 'Sign in with Google',          // ইংরেজি লগইন বাটন
      loading: 'Loading...',                        // ইংরেজি লোডিং টেক্সট
      description: 'Sign in easily with your Google account',  // ইংরেজি বর্ণনা
    },
  };

  const currentTexts = texts[language];  // বর্তমান ভাষার টেক্সট নির্বাচন

  // UI রেন্ডার করা
  return (
    <div className="w-full max-w-md mx-auto">  {/* মূল কন্টেইনার */}
      <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">  {/* লগইন কার্ড */}
        {/* হেডার সেকশন */}
        <div className="text-center mb-6">
          {/* Google আইকন */}
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-red-500 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          </div>
          {/* শিরোনাম */}
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {language === 'bn' ? 'গুগল লগইন' : 'Google Login'}
          </h3>
          {/* বর্ণনা */}
          <p className="text-gray-600 text-sm">
            {currentTexts.description}
          </p>
        </div>

        {/* বাটন সেকশন */}
        <div className="space-y-4">
          {isGoogleLoaded ? (
            <>
              {/* কাস্টম Google লগইন বাটন */}
              <button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  // লোডিং স্পিনার
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                ) : (
                  // Google আইকন
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                {/* বাটন টেক্সট */}
                <span className="font-medium text-gray-700">
                  {isLoading ? currentTexts.loading : currentTexts.signInButton}
                </span>
              </button>
              
              {/* Google Sign-In বাটন কন্টেইনার (অফিসিয়াল বাটনের জন্য) */}
              <div id="google-signin-button" className="w-full"></div>
            </>
          ) : (
            // Google সার্ভিস লোডিং স্ট্যাটাস
            <div className="flex items-center justify-center py-4">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-2 text-gray-600">
                {language === 'bn' ? 'গুগল সার্ভিস লোড হচ্ছে...' : 'Loading Google services...'}
              </span>
            </div>
          )}
        </div>

        {/* ফুটার সেকশন - শর্তাবলী */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            {language === 'bn' 
              ? 'লগইন করে আপনি আমাদের শর্তাবলী এবং গোপনীয়তা নীতি মেনে নিচ্ছেন'  // বাংলা শর্তাবলী
              : 'By signing in, you agree to our Terms of Service and Privacy Policy'  // ইংরেজি শর্তাবলী
            }
          </p>
        </div>
      </div>
    </div>
  );
};

// GoogleLogin কম্পোনেন্ট এক্সপোর্ট করা
export default GoogleLogin;