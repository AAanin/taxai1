// Chat Layout Component - Optimized for chat interface
// Mobile-first design with message area and input section

import React from 'react';
import { cn } from '../design-system/utils/cn';

export interface ChatLayoutProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  sidebar?: React.ReactNode;
  className?: string;
  showSidebar?: boolean;
}

const ChatLayout: React.FC<ChatLayoutProps> = ({
  children,
  header,
  footer,
  sidebar,
  className,
  showSidebar = false,
}) => {
  return (
    <div className={cn(
      'h-screen flex flex-col bg-neutral-50',
      // Mobile optimization for proper height calculation
      'min-h-screen max-h-screen overflow-hidden',
      // Safe area support for mobile devices
      'pb-safe-area-inset-bottom',
      className
    )}>
      {/* Header */}
      {header && (
        <header className="flex-shrink-0 bg-white border-b border-neutral-200 shadow-sm z-10">
          {header}
        </header>
      )}

      {/* Main Content Area - Mobile Optimized */}
      <div className="flex flex-1 min-h-0 relative">
        {/* Sidebar */}
        {showSidebar && sidebar && (
          <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-neutral-200">
            {sidebar}
          </aside>
        )}

        {/* Chat Area - Mobile Height Fix */}
        <main className="flex-1 flex flex-col min-w-0 relative">
          {/* Messages Area - Mobile Scroll Fix */}
          <div className="flex-1 overflow-hidden relative
                          h-full max-h-full
                          pb-20 sm:pb-24 md:pb-0
                          min-h-0">
            {children}
          </div>

          {/* Input Area - Mobile Positioning */}
          {footer && (
            <footer className="flex-shrink-0 bg-white border-t border-neutral-200
                              relative z-20
                              md:relative md:z-auto">
              {footer}
            </footer>
          )}
        </main>
      </div>
    </div>
  );
};

export default ChatLayout;