// Loading Spinner Component - লোডিং স্পিনার কম্পোনেন্ট
import React from 'react';
import { Loader, Heart, Stethoscope, Activity, Brain } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  type?: 'default' | 'medical' | 'ai' | 'pulse' | 'dots';
  message?: string;
  className?: string;
  color?: 'blue' | 'green' | 'purple' | 'red' | 'gray';
  overlay?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  type = 'default',
  message,
  className = '',
  color = 'blue',
  overlay = false
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'w-4 h-4';
      case 'md': return 'w-6 h-6';
      case 'lg': return 'w-8 h-8';
      case 'xl': return 'w-12 h-12';
      default: return 'w-6 h-6';
    }
  };

  const getColorClasses = () => {
    switch (color) {
      case 'blue': return 'text-blue-600';
      case 'green': return 'text-green-600';
      case 'purple': return 'text-purple-600';
      case 'red': return 'text-red-600';
      case 'gray': return 'text-gray-600';
      default: return 'text-blue-600';
    }
  };

  const renderSpinner = () => {
    const sizeClass = getSizeClasses();
    const colorClass = getColorClasses();

    switch (type) {
      case 'medical':
        return (
          <div className="flex items-center space-x-2">
            <Stethoscope className={`${sizeClass} ${colorClass} animate-pulse`} />
            <Heart className={`${sizeClass} ${colorClass} animate-bounce`} style={{ animationDelay: '0.1s' }} />
            <Activity className={`${sizeClass} ${colorClass} animate-pulse`} style={{ animationDelay: '0.2s' }} />
          </div>
        );

      case 'ai':
        return (
          <div className="relative">
            <Brain className={`${sizeClass} ${colorClass} animate-spin`} />
            <div className="absolute inset-0 animate-ping">
              <Brain className={`${sizeClass} ${colorClass} opacity-25`} />
            </div>
          </div>
        );

      case 'pulse':
        return (
          <div className="relative">
            <div className={`${sizeClass} ${colorClass.replace('text-', 'bg-')} rounded-full animate-pulse`}></div>
            <div className="absolute inset-0 animate-ping">
              <div className={`${sizeClass} ${colorClass.replace('text-', 'bg-')} rounded-full opacity-25`}></div>
            </div>
          </div>
        );

      case 'dots':
        return (
          <div className="flex space-x-1">
            <div className={`w-2 h-2 ${colorClass.replace('text-', 'bg-')} rounded-full animate-bounce`}></div>
            <div className={`w-2 h-2 ${colorClass.replace('text-', 'bg-')} rounded-full animate-bounce`} style={{ animationDelay: '0.1s' }}></div>
            <div className={`w-2 h-2 ${colorClass.replace('text-', 'bg-')} rounded-full animate-bounce`} style={{ animationDelay: '0.2s' }}></div>
          </div>
        );

      default:
        return <Loader className={`${sizeClass} ${colorClass} animate-spin`} />;
    }
  };

  const content = (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      {renderSpinner()}
      {message && (
        <p className={`text-sm ${getColorClasses()} text-center animate-pulse`}>
          {message}
        </p>
      )}
    </div>
  );

  if (overlay) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 shadow-xl">
          {content}
        </div>
      </div>
    );
  }

  return content;
};

// Skeleton Loading Component
export const SkeletonLoader: React.FC<{
  lines?: number;
  className?: string;
  avatar?: boolean;
}> = ({ lines = 3, className = '', avatar = false }) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {avatar && (
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
            <div className="h-3 bg-gray-300 rounded w-1/3"></div>
          </div>
        </div>
      )}
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, index) => (
          <div key={index} className="space-y-2">
            <div className="h-4 bg-gray-300 rounded w-full"></div>
            {index === lines - 1 && (
              <div className="h-4 bg-gray-300 rounded w-2/3"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Card Skeleton
export const CardSkeleton: React.FC<{
  className?: string;
}> = ({ className = '' }) => {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 animate-pulse ${className}`}>
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-12 h-12 bg-gray-300 rounded-lg"></div>
        <div className="flex-1">
          <div className="h-5 bg-gray-300 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-gray-300 rounded w-1/3"></div>
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-300 rounded w-full"></div>
        <div className="h-4 bg-gray-300 rounded w-4/5"></div>
        <div className="h-4 bg-gray-300 rounded w-3/5"></div>
      </div>
      <div className="flex items-center justify-between mt-6">
        <div className="h-8 bg-gray-300 rounded w-20"></div>
        <div className="h-8 bg-gray-300 rounded w-16"></div>
      </div>
    </div>
  );
};

// Table Skeleton
export const TableSkeleton: React.FC<{
  rows?: number;
  columns?: number;
  className?: string;
}> = ({ rows = 5, columns = 4, className = '' }) => {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
        <div className="grid gap-4 animate-pulse" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, index) => (
            <div key={index} className="h-4 bg-gray-300 rounded"></div>
          ))}
        </div>
      </div>
      
      {/* Rows */}
      <div className="divide-y divide-gray-200">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="px-6 py-4">
            <div className="grid gap-4 animate-pulse" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <div key={colIndex} className="h-4 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Loading Button
export const LoadingButton: React.FC<{
  loading: boolean;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}> = ({ loading, children, className = '', disabled, onClick, type = 'button' }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`relative flex items-center justify-center space-x-2 transition-all duration-200 ${className} ${
        loading || disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {loading && (
        <Loader className="w-4 h-4 animate-spin" />
      )}
      <span className={loading ? 'opacity-70' : ''}>{children}</span>
    </button>
  );
};

// Progress Bar
export const ProgressBar: React.FC<{
  progress: number;
  className?: string;
  color?: 'blue' | 'green' | 'purple' | 'red';
  showPercentage?: boolean;
  animated?: boolean;
}> = ({ progress, className = '', color = 'blue', showPercentage = false, animated = true }) => {
  const getColorClasses = () => {
    switch (color) {
      case 'blue': return 'bg-blue-600';
      case 'green': return 'bg-green-600';
      case 'purple': return 'bg-purple-600';
      case 'red': return 'bg-red-600';
      default: return 'bg-blue-600';
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-1">
        {showPercentage && (
          <span className="text-sm font-medium text-gray-700">{Math.round(progress)}%</span>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-500 ease-out ${getColorClasses()} ${
            animated ? 'animate-pulse' : ''
          }`}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        ></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;