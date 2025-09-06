// Modern Chat Message Component - Clean message bubbles
// Support for different message types and medical context

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../design-system/utils/cn';

export interface ChatMessageProps {
  message: string;
  isUser: boolean;
  timestamp?: Date;
  avatar?: string;
  userName?: string;
  isTyping?: boolean;
  messageType?: 'text' | 'prescription' | 'medicine' | 'doctor' | 'emergency';
  className?: string;
  actions?: React.ReactNode;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isUser,
  timestamp,
  avatar,
  userName,
  isTyping = false,
  messageType = 'text',
  className,
  actions,
}) => {
  // Message type styling
  const getMessageTypeStyles = () => {
    if (isUser) {
      return 'bg-medical-primary text-white';
    }

    switch (messageType) {
      case 'prescription':
        return 'bg-medical-accent text-medical-accent-foreground border border-medical-accent/20';
      case 'medicine':
        return 'bg-success-50 text-success-700 border border-success-200';
      case 'doctor':
        return 'bg-info-50 text-info-700 border border-info-200';
      case 'emergency':
        return 'bg-error-50 text-error-700 border border-error-200';
      default:
        return 'bg-white text-neutral-900 border border-neutral-200';
    }
  };

  // Animation variants
  const messageVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 500,
        damping: 30,
      }
    },
  };

  // Typing indicator
  const TypingIndicator = () => (
    <div className="flex space-x-1 p-3">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-neutral-400 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={
            {
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2,
            }
          }
        />
      ))}
    </div>
  );

  return (
    <motion.div
      variants={messageVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        'flex w-full mb-4',
        isUser ? 'justify-end' : 'justify-start',
        className
      )}
    >
      <div className={cn(
        'flex max-w-[85%] sm:max-w-[75%] lg:max-w-[65%]',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}>
        {/* Avatar */}
        {!isUser && (
          <div className="flex-shrink-0 mr-3">
            {avatar ? (
              <img
                src={avatar}
                alt={userName || 'Dr. Mimu'}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 bg-gradient-to-br from-medical-primary to-medical-secondary rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
            )}
          </div>
        )}

        {/* Message Content */}
        <div className="flex flex-col">
          {/* User Name */}
          {!isUser && userName && (
            <span className="text-xs text-neutral-500 mb-1 ml-1">
              {userName}
            </span>
          )}

          {/* Message Bubble */}
          <div
            className={cn(
              'rounded-2xl px-4 py-3 shadow-sm',
              getMessageTypeStyles(),
              isUser ? 'rounded-br-md' : 'rounded-bl-md'
            )}
          >
            {isTyping ? (
              <TypingIndicator />
            ) : (
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {message}
              </div>
            )}

            {/* Actions */}
            {actions && !isTyping && (
              <div className="mt-3 pt-3 border-t border-current border-opacity-20">
                {actions}
              </div>
            )}
          </div>

          {/* Timestamp */}
          {timestamp && !isTyping && (
            <span className={cn(
              'text-xs text-neutral-500 mt-1',
              isUser ? 'text-right mr-1' : 'text-left ml-1'
            )}>
              {timestamp.toLocaleTimeString('bn-BD', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          )}
        </div>

        {/* User Avatar */}
        {isUser && (
          <div className="flex-shrink-0 ml-3">
            {avatar ? (
              <img
                src={avatar}
                alt={userName || 'You'}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 bg-gradient-to-br from-neutral-400 to-neutral-600 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ChatMessage;