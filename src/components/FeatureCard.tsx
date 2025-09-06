// Feature Card Component - Medical feature display
// Modern card design for health features

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '../design-system';
import { cn } from '../design-system/utils/cn';

export interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  badge?: string;
  className?: string;
  variant?: 'primary' | 'secondary' | 'emergency';
  size?: 'sm' | 'md' | 'lg';
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon,
  onClick,
  disabled = false,
  badge,
  className = '',
  variant = 'primary',
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'min-h-[120px] sm:min-h-[140px] p-3 sm:p-4',
    md: 'min-h-[140px] sm:min-h-[160px] lg:min-h-[180px] p-4 sm:p-5 lg:p-6',
    lg: 'min-h-[160px] sm:min-h-[180px] lg:min-h-[200px] p-5 sm:p-6 lg:p-7'
  };

  const variantClasses = {
    primary: 'bg-gradient-to-br from-primary-50 via-primary-100 to-primary-200 hover:from-primary-100 hover:via-primary-200 hover:to-primary-300 border-primary-200 hover:border-brand-blue shadow-primary-100/50 hover:shadow-primary-200/70',
    secondary: 'bg-gradient-to-br from-secondary-50 via-secondary-100 to-secondary-200 hover:from-secondary-100 hover:via-secondary-200 hover:to-secondary-300 border-secondary-200 hover:border-brand-orange shadow-secondary-100/50 hover:shadow-secondary-200/70',
    emergency: 'bg-gradient-to-br from-medical-50 via-medical-100 to-medical-200 hover:from-medical-100 hover:via-medical-200 hover:to-medical-300 border-medical-200 hover:border-brand-coral shadow-medical-100/50 hover:shadow-medical-200/70'
  };

  const iconBgClasses = {
    primary: 'bg-gradient-to-br from-brand-blue to-brand-navy text-white shadow-lg',
    secondary: 'bg-gradient-to-br from-brand-orange to-secondary-600 text-white shadow-lg',
    emergency: 'bg-gradient-to-br from-brand-coral to-medical-600 text-white shadow-lg'
  };

  const badgeClasses = {
    primary: 'bg-gradient-to-r from-brand-blue to-brand-navy',
    secondary: 'bg-gradient-to-r from-brand-orange to-brand-coral',
    emergency: 'bg-gradient-to-r from-brand-coral to-medical-600'
  };

  return (
    <motion.button
      whileHover={!disabled ? { 
        scale: 1.02, 
        y: -4,
        boxShadow: "0 12px 24px rgba(0,0,0,0.12)"
      } : {}}
      whileTap={!disabled ? { scale: 0.98, y: -1 } : {}}
      transition={{ 
        duration: 0.2, 
        ease: "easeInOut"
      }}
      className={cn(
        "relative w-full cursor-pointer rounded-2xl border-2 shadow-md",
        "transition-all duration-300 hover:shadow-lg",
        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-opacity-50",
        "flex flex-col items-center justify-center text-center",
        "group active:scale-95",
        sizeClasses[size],
        variantClasses[variant],
        disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-opacity-80',
        variant === 'primary' ? 'focus:ring-brand-blue' : variant === 'secondary' ? 'focus:ring-brand-orange' : 'focus:ring-brand-coral',
        className
      )}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-label={`${title}: ${description}`}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {badge && (
        <div className={cn(
          "absolute -top-2 -right-2 sm:-top-3 sm:-right-3",
          "text-white text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-1",
          "rounded-full font-medium shadow-lg border-2 border-white",
          "transform group-hover:scale-105 transition-transform duration-300",
          badgeClasses[variant]
        )}>
          {badge}
        </div>
      )}
      
      <div className="flex flex-col items-center justify-center text-center space-y-2 sm:space-y-3 h-full w-full">
        <div className={cn(
          "flex-shrink-0 p-2 sm:p-3 rounded-full shadow-md",
          "transform group-hover:scale-110 transition-all duration-300",
          "group-hover:shadow-lg",
          iconBgClasses[variant]
        )}>
          {icon}
        </div>
        
        <div className="space-y-1 sm:space-y-2 px-2 sm:px-3 w-full">
          <h3 className="font-bold text-gray-900 text-xs sm:text-sm lg:text-base leading-tight group-hover:text-gray-800 transition-colors duration-300">
            {title}
          </h3>
          <p className="text-gray-600 text-xs sm:text-sm leading-relaxed overflow-hidden group-hover:text-gray-700 transition-colors duration-300" 
             style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>
            {description}
          </p>
        </div>
       </div>
      </motion.button>
    );
};

export default FeatureCard;