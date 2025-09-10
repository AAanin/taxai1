import { toast } from 'sonner';
import { z } from 'zod';

// Error types
export interface ApiError {
  success: false;
  message: string;
  error?: string;
  details?: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export interface ValidationError {
  field: string;
  message: string;
}

// Custom error classes
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    details?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  public readonly validationErrors: ValidationError[];

  constructor(message: string, validationErrors: ValidationError[]) {
    super(message, 400);
    this.validationErrors = validationErrors;
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict') {
    super(message, 409);
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 429);
  }
}

// Error handling utilities
export const handleApiError = (error: any): string => {
  console.error('API Error:', error);

  // Handle network errors
  if (!error.response) {
    return 'নেটওয়ার্ক সংযোগে সমস্যা। দয়া করে আপনার ইন্টারনেট সংযোগ চেক করুন।';
  }

  const { status, data } = error.response;

  // Handle specific HTTP status codes
  switch (status) {
    case 400:
      return data?.error || data?.message || 'অবৈধ অনুরোধ';
    case 401:
      return 'আপনার সেশন মেয়াদ শেষ। দয়া করে আবার লগইন করুন।';
    case 403:
      return 'এই কাজের অনুমতি নেই।';
    case 404:
      return 'তথ্য পাওয়া যায়নি।';
    case 409:
      return data?.error || data?.message || 'ডেটা দ্বন্দ্ব';
    case 422:
      return 'প্রদত্ত তথ্য সঠিক নয়।';
    case 429:
      return 'অনেক বেশি অনুরোধ। দয়া করে কিছুক্ষণ পর চেষ্টা করুন।';
    case 500:
      return 'সার্ভার সমস্যা। দয়া করে পরে চেষ্টা করুন।';
    case 502:
      return 'সার্ভার সাময়িকভাবে অনুপলব্ধ।';
    case 503:
      return 'সেবা সাময়িকভাবে বন্ধ।';
    default:
      return data?.error || data?.message || 'অজানা সমস্যা ঘটেছে।';
  }
};

// Handle validation errors from Zod
export const handleValidationError = (error: z.ZodError): ValidationError[] => {
  return error.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message
  }));
};

// Show error toast with appropriate message
export const showErrorToast = (error: any, defaultMessage?: string): void => {
  let message: string;

  if (error instanceof z.ZodError) {
    message = 'দয়া করে সব প্রয়োজনীয় তথ্য সঠিকভাবে পূরণ করুন।';
  } else if (error instanceof AppError) {
    message = error.message;
  } else if (error?.response) {
    message = handleApiError(error);
  } else if (typeof error === 'string') {
    message = error;
  } else {
    message = defaultMessage || 'একটি সমস্যা ঘটেছে। দয়া করে আবার চেষ্টা করুন।';
  }

  toast.error(message);
};

// Show success toast
export const showSuccessToast = (message: string): void => {
  toast.success(message);
};

// Show info toast
export const showInfoToast = (message: string): void => {
  toast.info(message);
};

// Show warning toast
export const showWarningToast = (message: string): void => {
  toast.warning(message);
};

// Async error handler wrapper
export const withErrorHandling = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  errorMessage?: string
) => {
  return async (...args: T): Promise<R | null> => {
    try {
      return await fn(...args);
    } catch (error) {
      showErrorToast(error, errorMessage);
      return null;
    }
  };
};

// Form error handler
export const handleFormError = (
  error: any,
  setErrors: (errors: Record<string, string>) => void
): void => {
  if (error instanceof z.ZodError) {
    const validationErrors = handleValidationError(error);
    const errorMap: Record<string, string> = {};
    
    validationErrors.forEach(err => {
      errorMap[err.field] = err.message;
    });
    
    setErrors(errorMap);
  } else if (error?.response?.data?.errors) {
    const errorMap: Record<string, string> = {};
    
    error.response.data.errors.forEach((err: ValidationError) => {
      errorMap[err.field] = err.message;
    });
    
    setErrors(errorMap);
  } else {
    showErrorToast(error);
  }
};

// Retry mechanism
export const withRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: any;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (i === maxRetries) {
        throw error;
      }
      
      // Don't retry on client errors (4xx)
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }

  throw lastError;
};

// Error boundary helper
export const logError = (error: Error, errorInfo?: any): void => {
  console.error('Error caught by boundary:', error);
  
  if (errorInfo) {
    console.error('Error info:', errorInfo);
  }

  // In production, you might want to send this to an error reporting service
  if (process.env.NODE_ENV === 'production') {
    // Send to error reporting service (e.g., Sentry, LogRocket)
    // reportError(error, errorInfo);
  }
};

// Network status checker
export const checkNetworkStatus = (): boolean => {
  return navigator.onLine;
};

// Handle offline scenarios
export const handleOfflineError = (): void => {
  if (!checkNetworkStatus()) {
    showErrorToast('আপনি অফলাইনে আছেন। দয়া করে ইন্টারনেট সংযোগ চেক করুন।');
  }
};

// Debounced error handler for rapid fire errors
let errorTimeout: NodeJS.Timeout | null = null;

export const debouncedErrorHandler = (error: any, delay: number = 500): void => {
  if (errorTimeout) {
    clearTimeout(errorTimeout);
  }

  errorTimeout = setTimeout(() => {
    showErrorToast(error);
    errorTimeout = null;
  }, delay);
};

// Error recovery suggestions
export const getErrorRecoverySuggestion = (error: any): string => {
  if (!checkNetworkStatus()) {
    return 'ইন্টারনেট সংযোগ চেক করুন এবং আবার চেষ্টা করুন।';
  }

  const status = error?.response?.status;

  switch (status) {
    case 401:
      return 'দয়া করে আবার লগইন করুন।';
    case 403:
      return 'প্রয়োজনীয় অনুমতি নিন বা অ্যাডমিনের সাথে যোগাযোগ করুন।';
    case 404:
      return 'পেজ রিফ্রেশ করুন বা হোম পেজে ফিরে যান।';
    case 429:
      return 'কিছুক্ষণ অপেক্ষা করুন এবং আবার চেষ্টা করুন।';
    case 500:
    case 502:
    case 503:
      return 'কিছুক্ষণ পর আবার চেষ্টা করুন বা সাপোর্টের সাথে যোগাযোগ করুন।';
    default:
      return 'পেজ রিফ্রেশ করুন বা আবার চেষ্টা করুন।';
  }
};

// Error context for better debugging
export interface ErrorContext {
  userId?: string;
  action?: string;
  component?: string;
  timestamp?: string;
  userAgent?: string;
  url?: string;
}

export const createErrorContext = (action?: string, component?: string): ErrorContext => {
  return {
    action,
    component,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href
  };
};

// Enhanced error logging with context
export const logErrorWithContext = (
  error: Error,
  context: ErrorContext
): void => {
  console.group('🚨 Error Details');
  console.error('Error:', error.message);
  console.error('Stack:', error.stack);
  console.table(context);
  console.groupEnd();

  // In production, send to monitoring service
  if (process.env.NODE_ENV === 'production') {
    // sendErrorToMonitoring(error, context);
  }
};

// Performance monitoring for error-prone operations
export const withPerformanceMonitoring = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  operationName: string
) => {
  return async (...args: T): Promise<R> => {
    const startTime = performance.now();
    
    try {
      const result = await fn(...args);
      const endTime = performance.now();
      
      console.log(`✅ ${operationName} completed in ${(endTime - startTime).toFixed(2)}ms`);
      
      return result;
    } catch (error) {
      const endTime = performance.now();
      
      console.error(`❌ ${operationName} failed after ${(endTime - startTime).toFixed(2)}ms`);
      
      logErrorWithContext(
        error as Error,
        createErrorContext(operationName)
      );
      
      throw error;
    }
  };
};

// Export all error handling utilities
export default {
  handleApiError,
  handleValidationError,
  showErrorToast,
  showSuccessToast,
  showInfoToast,
  showWarningToast,
  withErrorHandling,
  handleFormError,
  withRetry,
  logError,
  checkNetworkStatus,
  handleOfflineError,
  debouncedErrorHandler,
  getErrorRecoverySuggestion,
  createErrorContext,
  logErrorWithContext,
  withPerformanceMonitoring
};