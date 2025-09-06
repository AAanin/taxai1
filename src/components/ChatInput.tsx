// Modern Chat Input Component - Enhanced input with actions
// Support for file upload, voice input, and quick actions

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../design-system';
import { cn } from '../design-system/utils/cn';
import { Upload, FileText, Image, File, X, CheckCircle, AlertCircle } from 'lucide-react';

export interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onFileUpload?: (file: File) => void;
  onVoiceInput?: () => void;
  onSmsShare?: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
  showFileUpload?: boolean;
  showVoiceInput?: boolean;
  showSmsShare?: boolean;
  maxLength?: number;
  maxFileSize?: number; // in MB
  acceptedFileTypes?: string[];
  quickActions?: Array<{
    label: string;
    value: string;
    icon?: React.ReactNode;
  }>;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onFileUpload,
  onVoiceInput,
  onSmsShare,
  placeholder = 'আপনার স্বাস্থ্য সমস্যা লিখুন...',
  disabled = false,
  isLoading = false,
  className,
  showFileUpload = true,
  showVoiceInput = true,
  showSmsShare = false,
  maxLength = 1000,
  maxFileSize = 10, // 10MB default
  acceptedFileTypes = ['image/*', '.pdf', '.doc', '.docx', '.txt'],
  quickActions = [],
}) => {
  const [message, setMessage] = useState('');
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadError, setUploadError] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  // Handle send message
  const handleSend = () => {
    if (message.trim() && !disabled && !isLoading) {
      onSendMessage(message.trim());
      setMessage('');
      setShowQuickActions(false);
    }
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // File validation helper
  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      return `ফাইলের সাইজ ${maxFileSize}MB এর চেয়ে বড় হতে পারবে না`;
    }

    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const isValidType = acceptedFileTypes.some(type => {
      if (type.includes('*')) {
        const baseType = type.split('/')[0];
        return file.type.startsWith(baseType);
      }
      return type === fileExtension || file.type === type;
    });

    if (!isValidType) {
      return 'এই ধরনের ফাইল সাপোর্ট করা হয় না';
    }

    return null;
  };

  // Get file icon based on type
  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="w-4 h-4" />;
    } else if (file.type === 'application/pdf') {
      return <FileText className="w-4 h-4" />;
    } else {
      return <File className="w-4 h-4" />;
    }
  };

  // Handle file upload
  const handleFileUpload = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const file = fileArray[0]; // Take first file only
    
    if (!file) return;

    const error = validateFile(file);
    if (error) {
      setUploadError(error);
      return;
    }

    setUploadError('');
    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setIsUploading(false);
          setUploadedFiles([file]);
          if (onFileUpload) {
            onFileUpload(file);
          }
          return 100;
        }
        return prev + 10;
      });
    }, 100);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle input file change
  const handleInputFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileUpload(e.target.files);
    }
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  // Remove uploaded file
  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    setUploadProgress(0);
    setUploadError('');
  };

  // Handle quick action
  const handleQuickAction = (value: string) => {
    setMessage(value);
    setShowQuickActions(false);
    textareaRef.current?.focus();
  };

  // Handle SMS share
  const handleSmsShare = () => {
    if (message.trim() && onSmsShare) {
      onSmsShare(message.trim());
    }
  };

  return (
    <div 
      className={cn(
        'relative bg-white border-t border-neutral-200',
        'transition-all duration-300 chat-input-container',
        // Mobile optimization for FloatingBottomNav
        'pb-safe-area-inset-bottom',
        'sm:pb-4 md:pb-4',
        isDragOver && 'bg-blue-50 border-blue-300',
        className
      )}
      ref={dropZoneRef}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Quick Actions */}
      {quickActions.length > 0 && (
        <motion.div
          initial={false}
          animate={{ height: showQuickActions ? 'auto' : 0 }}
          className="overflow-hidden border-b border-neutral-200"
        >
          <div className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-700">দ্রুত প্রশ্ন</span>
              <button
                onClick={() => setShowQuickActions(!showQuickActions)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickAction(action.value)}
                  className="flex items-center space-x-2 px-3 py-2 text-sm bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg transition-colors"
                >
                  {action.icon && <span className="w-4 h-4">{action.icon}</span>}
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* File Upload Area */}
      {showFileUpload && (
        <AnimatePresence>
          {/* Drag & Drop Overlay */}
          {isDragOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-medical-primary/10 border-2 border-dashed border-medical-primary rounded-lg flex items-center justify-center z-10"
            >
              <div className="text-center">
                <Upload className="w-12 h-12 text-medical-primary mx-auto mb-2" />
                <p className="text-medical-primary font-medium">ফাইল ছেড়ে দিন</p>
                <p className="text-sm text-medical-primary/70">PDF, ছবি বা ডকুমেন্ট</p>
              </div>
            </motion.div>
          )}

          {/* Uploaded Files Display */}
          {uploadedFiles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 border-b border-neutral-200 bg-neutral-50"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-neutral-700">আপলোড করা ফাইল</span>
              </div>
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center gap-3 p-2 bg-white rounded-lg border">
                  <div className="flex items-center gap-2 flex-1">
                    {getFileIcon(file)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-700 truncate">{file.name}</p>
                      <p className="text-xs text-neutral-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="p-1 text-neutral-400 hover:text-red-500 transition-colors"
                    aria-label="ফাইল মুছুন"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </motion.div>
          )}

          {/* Upload Progress */}
          {isUploading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-3 border-b border-neutral-200 bg-blue-50"
            >
              <div className="flex items-center gap-2 mb-2">
                <Upload className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">আপলোড হচ্ছে...</span>
                <span className="text-sm text-blue-600">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <motion.div
                  className="bg-blue-600 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>
          )}

          {/* Upload Error */}
          {uploadError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 border-b border-neutral-200 bg-red-50"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-700">{uploadError}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Input Area */}
      <div className="p-2 sm:p-3 md:p-4">
        <style dangerouslySetInnerHTML={{
          __html: `
            @media (max-width: 480px) {
              .mobile-input {
                font-size: 14px !important;
                padding: 8px 12px !important;
              }
              .mobile-button {
                width: 40px !important;
                height: 40px !important;
                min-width: 40px !important;
                min-height: 44px !important;
                touch-action: manipulation;
              }
              .mobile-container {
                padding: 8px !important;
              }
            }
            
            @media (min-width: 481px) {
              .desktop-button {
                min-width: 44px !important;
                min-height: 44px !important;
              }
            }
            
            .touch-target {
              min-width: 44px;
              min-height: 44px;
              touch-action: manipulation;
            }
            
            .scrollable-input {
              overflow-y: auto;
              scrollbar-width: thin;
              scrollbar-color: #cbd5e1 transparent;
            }
            
            .scrollable-input::-webkit-scrollbar {
              width: 4px;
            }
            
            .scrollable-input::-webkit-scrollbar-track {
              background: transparent;
            }
            
            .scrollable-input::-webkit-scrollbar-thumb {
              background-color: #cbd5e1;
              border-radius: 2px;
            }
          `
        }} />
        {/* Mobile Layout - Stacked */}
        <div className="flex sm:hidden flex-col gap-2">
          {/* Mobile Action Buttons Row */}
           <div className="flex w-full justify-start items-center gap-2 mobile-container">
            {/* File Upload */}
            {showFileUpload && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={acceptedFileTypes.join(',')}
                  onChange={handleInputFileChange}
                  className="hidden"
                />
                <button
                   onClick={() => fileInputRef.current?.click()}
                   disabled={disabled || isLoading || isUploading}
                   className={cn(
                     "mobile-button touch-target w-[40px] h-[40px] rounded-lg transition-all duration-200 border",
                     "hover:shadow-md focus:outline-none focus:ring-2 focus:ring-white/50",
                     "disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center",
                     "hover:scale-105 active:scale-95 touch-manipulation",
                     "focus:ring-offset-2 focus:ring-2 focus:ring-white/50",
                     "bg-black text-white border-black hover:bg-gray-800 shadow-md"
                   )}
                   aria-label="ফাইল আপলোড করুন"
                   title="ছবি, PDF বা ডকুমেন্ট আপলোড করুন"
                 >
                  {uploadedFiles.length > 0 ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                </button>
              </>
            )}

            {/* Voice Input */}
            {showVoiceInput && (
              <button
                 onClick={onVoiceInput}
                 disabled={disabled || isLoading}
                 className={cn(
                   "mobile-button touch-target w-[40px] h-[40px] rounded-lg transition-all duration-200 border border-black",
                   "bg-black hover:bg-gray-800 text-white",
                   "disabled:opacity-50 disabled:cursor-not-allowed",
                   "flex items-center justify-center hover:scale-105 active:scale-95 hover:shadow-md touch-manipulation",
                   "focus:ring-offset-2 focus:ring-2 focus:ring-white/50"
                 )}
                 aria-label="ভয়েস ইনপুট"
                 title="ভয়েস দিয়ে বার্তা লিখুন"
               >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>
            )}

            {/* SMS Share */}
            {showSmsShare && (
              <button
                onClick={handleSmsShare}
                disabled={!message.trim() || disabled || isLoading}
                className={cn(
                  "w-[40px] h-[40px] rounded-lg transition-all duration-200",
                  "bg-black text-white hover:bg-gray-800",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "border border-black hover:shadow-md",
                  "flex items-center justify-center hover:scale-105 active:scale-95 touch-manipulation"
                )}
                aria-label="এসএমএস পাঠান"
                title="বার্তাটি এসএমএস হিসেবে পাঠান"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </button>
            )}
          </div>

          {/* Mobile Text Input */}
          <div className="relative w-full">
            <textarea
               ref={textareaRef}
               value={message}
               onChange={(e) => setMessage(e.target.value)}
               onKeyPress={handleKeyPress}
               placeholder={placeholder}
               disabled={disabled || isLoading}
               maxLength={maxLength}
               rows={1}
               className={cn(
                 'mobile-input scrollable-input w-full px-3 py-2 pr-10 bg-neutral-50 border border-neutral-200',
                 'rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-medical-primary focus:border-transparent',
                 'placeholder-neutral-500 disabled:opacity-50 disabled:cursor-not-allowed',
                 'max-h-32 overflow-y-auto min-h-[44px]',
                 'transition-all duration-200 hover:border-neutral-300 focus:shadow-lg',
                 'focus:ring-offset-2'
               )}
               style={{ fontSize: '14px', lineHeight: '1.4' }}
             />
            
            {/* Character Count */}
            {maxLength && (
              <span className="absolute bottom-1 right-2 text-xs text-neutral-400">
                {message.length}/{maxLength}
              </span>
            )}
          </div>

          {/* Mobile Send Button */}
          <motion.button
            onClick={handleSend}
            disabled={!message.trim() || disabled || isLoading || isUploading}
            whileHover={{ 
              scale: 1.02,
              boxShadow: "0 8px 20px rgba(0, 0, 0, 0.15)",
              transition: { duration: 0.3, ease: "easeOut" }
            }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "w-full h-[44px] rounded-lg font-medium transition-all duration-300",
              "focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-md hover:shadow-xl",
              "flex items-center justify-center gap-2 border border-black",
              "bg-black text-white hover:bg-gray-800 hover:border-gray-800 focus:ring-white/50",
              "transform hover:-translate-y-0.5 active:translate-y-0",
              (!message.trim() || disabled || isLoading || isUploading)
                ? "opacity-50 cursor-not-allowed hover:bg-black hover:border-black hover:transform-none"
                : "opacity-100"
            )}
            aria-label={isLoading ? "পাঠানো হচ্ছে..." : "বার্তা পাঠান"}
          >
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, rotate: 0 }}
                  animate={{ opacity: 1, rotate: 360 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, rotate: { duration: 1, repeat: Infinity, ease: "linear" } }}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </motion.div>
              ) : (
                <motion.div
                  key="send"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col items-center justify-center gap-1"
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  <span className="text-sm font-medium leading-none">পাঠান</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Desktop Layout - Flexbox */}
        <div className="hidden sm:flex items-end gap-3">
          {/* Left Side Action Buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Desktop File Upload */}
            {showFileUpload && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={acceptedFileTypes.join(',')}
                  onChange={handleInputFileChange}
                  className="hidden"
                />
                <button
                   onClick={() => fileInputRef.current?.click()}
                   disabled={disabled || isLoading || isUploading}
                   className={cn(
                     "desktop-button touch-target flex-shrink-0 w-[44px] h-[44px] md:w-[48px] md:h-[48px] rounded-lg transition-all duration-200 border",
                     "hover:shadow-md focus:outline-none focus:ring-2 focus:ring-white/50",
                     "disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center",
                     "hover:scale-105 active:scale-95 touch-manipulation focus:ring-offset-2",
                     "bg-black text-white border-black hover:bg-gray-800 shadow-md"
                   )}
                   aria-label="ফাইল আপলোড করুন"
                   title="ছবি, PDF বা ডকুমেন্ট আপলোড করুন"
                 >
                  {uploadedFiles.length > 0 ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <Upload className="w-5 h-5" />
                  )}
                </button>
              </>
            )}

            {/* Desktop Voice Input */}
            {showVoiceInput && (
              <button
                 onClick={onVoiceInput}
                 disabled={disabled || isLoading}
                 className={cn(
                   "desktop-button touch-target flex-shrink-0 w-[44px] h-[44px] md:w-[48px] md:h-[48px] rounded-lg transition-all duration-200",
                   "border border-black bg-black hover:bg-gray-800 text-white",
                   "disabled:opacity-50 disabled:cursor-not-allowed",
                   "flex items-center justify-center hover:scale-105 active:scale-95 hover:shadow-md touch-manipulation",
                   "focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2"
                 )}
                 aria-label="ভয়েস ইনপুট"
                 title="ভয়েস দিয়ে বার্তা লিখুন"
               >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>
            )}
          </div>

          {/* Desktop Text Input - Takes Full Width */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              disabled={disabled || isLoading}
              maxLength={maxLength}
              rows={1}
              className={cn(
                'scrollable-input w-full px-4 py-3 pr-16 text-sm bg-neutral-50 border border-neutral-200',
                'rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-medical-primary focus:border-transparent',
                'placeholder-neutral-500 disabled:opacity-50 disabled:cursor-not-allowed',
                'max-h-32 overflow-y-auto min-h-[44px] md:min-h-[48px]',
                'transition-all duration-200 hover:border-neutral-300 focus:shadow-lg focus:ring-offset-2'
              )}
            />
            
            {/* Character Count */}
            {maxLength && (
              <span className="absolute bottom-2 right-14 text-xs text-neutral-400">
                {message.length}/{maxLength}
              </span>
            )}

            {/* SMS Share Button (if enabled) */}
            {showSmsShare && (
              <button
                onClick={handleSmsShare}
                disabled={!message.trim() || disabled || isLoading}
                className={cn(
                  "absolute right-2 top-1/2 transform -translate-y-1/2",
                  "w-8 h-8 rounded-lg transition-all duration-200",
                  "bg-black text-white hover:bg-gray-800",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "border border-black hover:shadow-md",
                  "flex items-center justify-center"
                )}
                aria-label="এসএমএস পাঠান"
                title="বার্তাটি এসএমএস হিসেবে পাঠান"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </button>
            )}
          </div>

          {/* Desktop Send Button */}
          <motion.button
            onClick={handleSend}
            disabled={!message.trim() || disabled || isLoading || isUploading}
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
              transition: { duration: 0.3, ease: "easeOut" }
            }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "desktop-button touch-target flex-shrink-0 w-[44px] h-[44px] md:w-[52px] md:h-[52px]",
              "rounded-xl font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2",
              "shadow-lg hover:shadow-2xl touch-manipulation",
              "flex items-center justify-center gap-2",
              "bg-black text-white border border-black",
              "hover:bg-gray-800 hover:border-gray-800 focus:ring-white/50",
              "transform hover:-translate-y-0.5 active:translate-y-0",
              (!message.trim() || disabled || isLoading || isUploading)
                ? "opacity-50 cursor-not-allowed hover:bg-black hover:border-black hover:transform-none"
                : "opacity-100"
            )}
            aria-label={isLoading ? "পাঠানো হচ্ছে..." : "বার্তা পাঠান"}
          >
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, rotate: 0 }}
                  animate={{ opacity: 1, rotate: 360 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, rotate: { duration: 1, repeat: Infinity, ease: "linear" } }}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </motion.div>
              ) : (
                <motion.div
                  key="send"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col items-center justify-center gap-1"
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  <span className="hidden lg:inline text-sm font-medium leading-none">পাঠান</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Quick Actions Toggle */}
        {quickActions.length > 0 && !showQuickActions && (
          <button
            onClick={() => setShowQuickActions(true)}
            className="mt-2 text-xs text-neutral-500 hover:text-neutral-700 transition-colors"
          >
            দ্রুত প্রশ্ন দেখুন
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatInput;