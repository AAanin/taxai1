// Floating Bottom Navigation Component - ভাসমান নিচের নেভিগেশন কম্পোনেন্ট
// Modern UX/UI compliant mobile bottom navigation with accessibility and smooth animations

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Bot, Bell, User, Activity } from 'lucide-react';

const FloatingBottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('home');
  const [isPressed, setIsPressed] = useState<string | null>(null);

  // Update active tab based on current route
  useEffect(() => {
    const path = location.pathname;
    if (path === '/') setActiveTab('home');
    else if (path.includes('/medicine')) setActiveTab('medicine');
    else if (path.includes('/medical-tests')) setActiveTab('tests');
    else if (path.includes('/chat')) setActiveTab('ai');
    else if (path.includes('/notifications')) setActiveTab('notifications');
    else if (path.includes('/profile')) setActiveTab('profile');
  }, [location.pathname]);

  const handleNavigation = (tab: string, path: string) => {
    setActiveTab(tab);
    navigate(path);
    
    // Haptic feedback for mobile devices
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  };

  const handleTouchStart = (itemId: string) => {
    setIsPressed(itemId);
  };

  const handleTouchEnd = () => {
    setIsPressed(null);
  };

  const navItems = [
    {
      id: 'home',
      icon: Home,
      label: 'হোম',
      path: '/',
      ariaLabel: 'হোম পেইজে যান'
    },
    {
      id: 'tests',
      icon: Activity,
      label: 'টেস্ট',
      path: '/medical-tests',
      ariaLabel: 'মেডিকেল টেস্ট করুন'
    },
    {
      id: 'ai',
      icon: Bot,
      label: 'AI',
      path: '/chat',
      isSpecial: true,
      ariaLabel: 'AI চ্যাট সহায়তা'
    },
    {
      id: 'notifications',
      icon: Bell,
      label: 'বিজ্ঞপ্তি',
      path: '/notifications',
      ariaLabel: 'নোটিফিকেশন দেখুন'
    },
    {
      id: 'profile',
      icon: User,
      label: 'প্রোফাইল',
      path: '/profile',
      ariaLabel: 'ব্যবহারকারী প্রোফাইল'
    }
  ];

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
      role="navigation"
      aria-label="প্রধান নেভিগেশন মেনু"
    >
      {/* Safe area padding for modern mobile devices */}
      <div className="pb-safe-area-inset-bottom">
        {/* Enhanced background with improved blur and shadow */}
        <div className="bg-white/98 dark:bg-slate-900/98 backdrop-blur-xl border-t border-gray-200/60 dark:border-slate-700/60 shadow-2xl shadow-black/10 dark:shadow-black/30">
          <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 relative">
            {/* Left side navigation items */}
            <div className="flex space-x-4 sm:space-x-6">
              {navItems.slice(0, 2).map((item) => {
                const IconComponent = item.icon;
                const isActive = activeTab === item.id;
                const isCurrentPressed = isPressed === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item.id, item.path)}
                    onTouchStart={() => handleTouchStart(item.id)}
                    onTouchEnd={handleTouchEnd}
                    onMouseDown={() => handleTouchStart(item.id)}
                    onMouseUp={handleTouchEnd}
                    onMouseLeave={handleTouchEnd}
                    className={`
                      flex flex-col items-center space-y-1 py-2 px-2.5 sm:px-3 
                      rounded-xl sm:rounded-2xl transition-all duration-300 ease-out
                      transform hover:scale-105 active:scale-95
                      focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:ring-offset-2
                      min-h-[56px] min-w-[56px] sm:min-h-[60px] sm:min-w-[60px] relative overflow-hidden touch-target
                      ${isActive
                        ? 'text-purple-600 dark:text-purple-300 bg-gradient-to-br from-purple-50 to-purple-100/80 dark:from-slate-800/90 dark:to-slate-700/80 shadow-lg shadow-purple-500/20 dark:shadow-purple-400/30'
                        : 'text-gray-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-300 hover:bg-gradient-to-br hover:from-purple-50/50 hover:to-purple-100/30 dark:hover:from-slate-700/60 dark:hover:to-slate-600/40'
                      }
                      ${isCurrentPressed ? 'scale-90 bg-purple-200/50 dark:bg-purple-800/30' : ''}
                    `}
                    aria-label={item.ariaLabel}
                    role="tab"
                    aria-selected={isActive}
                  >
                    {/* Ripple effect background */}
                    <div className={`
                      absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-400/20 to-purple-600/20
                      transition-all duration-300 scale-0
                      ${isCurrentPressed ? 'scale-100 opacity-100' : 'opacity-0'}
                    `} />
                    
                    {/* Icon with enhanced animations */}
                    <IconComponent 
                      size={20} 
                      className={`
                        transition-all duration-300 ease-out relative z-10
                        ${isActive ? 'scale-110 drop-shadow-md filter brightness-110' : 'scale-100'}
                        ${isCurrentPressed ? 'scale-95' : ''}
                      `} 
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                    
                    {/* Label with improved typography */}
                    <span className={`
                      text-xs font-medium transition-all duration-300 relative z-10 leading-tight
                      ${isActive ? 'font-bold text-purple-700 dark:text-purple-200 scale-105' : 'font-medium'}
                      ${isCurrentPressed ? 'scale-95' : ''}
                    `}>
                      {item.label}
                    </span>
                    
                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-purple-500 to-purple-600 dark:from-purple-400 dark:to-purple-300 rounded-full shadow-lg dark:shadow-purple-400/50"></div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Center AI button - Enhanced special design */}
            <div className="relative">
              <button
                onClick={() => handleNavigation('ai', '/chat')}
                onTouchStart={() => handleTouchStart('ai')}
                onTouchEnd={handleTouchEnd}
                onMouseDown={() => handleTouchStart('ai')}
                onMouseUp={handleTouchEnd}
                onMouseLeave={handleTouchEnd}
                className={`
                  w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full 
                  bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400
                  shadow-2xl hover:shadow-3xl dark:shadow-purple-500/40 dark:hover:shadow-purple-400/60 transition-all duration-300 ease-out
                  transform hover:scale-110 active:scale-95
                  flex items-center justify-center group relative overflow-hidden touch-target
                  focus:outline-none focus:ring-4 focus:ring-purple-400/50 focus:ring-offset-2
                  ${activeTab === 'ai' ? 'ring-4 ring-purple-400/60 dark:ring-purple-500/60 scale-105' : ''}
                  ${isPressed === 'ai' ? 'scale-90' : ''}
                `}
                aria-label="AI চ্যাট সহায়তা"
                role="tab"
                aria-selected={activeTab === 'ai'}
              >
                {/* Multiple animated background layers */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 dark:from-blue-300 dark:via-purple-300 dark:to-pink-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></div>
                
                {/* Enhanced pulse animation */}
                <div className={`
                  absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-500
                  transition-all duration-1000
                  ${activeTab === 'ai' ? 'animate-pulse opacity-40 scale-110' : 'opacity-0 scale-100'}
                `} />
                
                {/* Improved glow effect */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 blur-xl opacity-30 dark:opacity-50 group-hover:opacity-60 dark:group-hover:opacity-80 transition-all duration-300 scale-110"></div>
                
                {/* Ripple effect for press */}
                <div className={`
                  absolute inset-0 rounded-full bg-white/30
                  transition-all duration-200 scale-0
                  ${isPressed === 'ai' ? 'scale-100 opacity-100' : 'opacity-0'}
                `} />
                
                {/* Icon with enhanced animations */}
                <Bot 
                  size={22} 
                  className={`
                    text-white relative z-10 drop-shadow-lg 
                    transition-all duration-300 ease-out
                    group-hover:rotate-12 group-hover:scale-110
                    ${activeTab === 'ai' ? 'animate-bounce' : ''}
                    ${isPressed === 'ai' ? 'scale-90' : ''}
                  `}
                  strokeWidth={2.5}
                />
                
                {/* Floating particles effect */}
                {activeTab === 'ai' && (
                  <>
                    <div className="absolute top-1 right-1 w-1 h-1 bg-white/60 rounded-full animate-ping" />
                    <div className="absolute bottom-2 left-2 w-0.5 h-0.5 bg-white/40 rounded-full animate-pulse" />
                  </>
                )}
              </button>
              
              {/* AI label with improved positioning */}
              <div className="absolute -bottom-6 sm:-bottom-7 left-1/2 transform -translate-x-1/2">
                <span className={`
                  text-xs font-medium transition-all duration-300 leading-tight
                  ${activeTab === 'ai' ? 'font-bold text-purple-700 dark:text-purple-300 scale-105' : 'text-gray-600 dark:text-slate-300'}
                `}>
                  AI
                </span>
              </div>
            </div>

            {/* Right side navigation items */}
            <div className="flex space-x-4 sm:space-x-6">
              {navItems.slice(3).map((item) => {
                const IconComponent = item.icon;
                const isActive = activeTab === item.id;
                const isCurrentPressed = isPressed === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item.id, item.path)}
                    onTouchStart={() => handleTouchStart(item.id)}
                    onTouchEnd={handleTouchEnd}
                    onMouseDown={() => handleTouchStart(item.id)}
                    onMouseUp={handleTouchEnd}
                    onMouseLeave={handleTouchEnd}
                    className={`
                      flex flex-col items-center space-y-1 py-2 px-2.5 sm:px-3 
                      rounded-xl sm:rounded-2xl transition-all duration-300 ease-out
                      transform hover:scale-105 active:scale-95
                      focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:ring-offset-2
                      min-h-[56px] min-w-[56px] sm:min-h-[60px] sm:min-w-[60px] relative overflow-hidden touch-target
                      ${isActive
                        ? 'text-purple-600 dark:text-purple-400 bg-gradient-to-br from-purple-50 to-purple-100/80 dark:from-purple-900/30 dark:to-purple-800/20 shadow-lg shadow-purple-500/20'
                        : 'text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gradient-to-br hover:from-purple-50/50 hover:to-purple-100/30 dark:hover:from-purple-900/20 dark:hover:to-purple-800/10'
                      }
                      ${isCurrentPressed ? 'scale-90 bg-purple-200/50 dark:bg-purple-800/30' : ''}
                    `}
                    aria-label={item.ariaLabel}
                    role="tab"
                    aria-selected={isActive}
                  >
                    {/* Ripple effect background */}
                    <div className={`
                      absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-400/20 to-purple-600/20
                      transition-all duration-300 scale-0
                      ${isCurrentPressed ? 'scale-100 opacity-100' : 'opacity-0'}
                    `} />
                    
                    {/* Icon with enhanced animations */}
                    <IconComponent 
                      size={20} 
                      className={`
                        transition-all duration-300 ease-out relative z-10
                        ${isActive ? 'scale-110 drop-shadow-md filter brightness-110' : 'scale-100'}
                        ${isCurrentPressed ? 'scale-95' : ''}
                      `} 
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                    
                    {/* Label with improved typography */}
                    <span className={`
                      text-xs font-medium transition-all duration-300 relative z-10 leading-tight
                      ${isActive ? 'font-bold text-purple-700 dark:text-purple-300 scale-105' : 'font-medium'}
                      ${isCurrentPressed ? 'scale-95' : ''}
                    `}>
                      {item.label}
                    </span>
                    
                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 sm:w-8 h-0.5 sm:h-1 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full shadow-lg" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default FloatingBottomNav;