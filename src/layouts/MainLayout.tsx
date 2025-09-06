import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../design-system/utils/cn';
import FloatingBottomNav from '../components/FloatingBottomNav';

export interface MainLayoutProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  showSidebar?: boolean;
  sidebarCollapsed?: boolean;
  onSidebarToggle?: () => void;
  onFeatureClick?: (featureId: string) => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  header,
  sidebar,
  footer,
  className,
  showSidebar = false,
  sidebarCollapsed = false,
  onSidebarToggle,
  onFeatureClick,
}) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  return (
    <div className={cn('min-h-screen bg-neutral-50 flex flex-col', className)}>
      {header && (
        <header className="sticky top-0 z-40 bg-white border-b border-neutral-200 shadow-sm">
          {header}
        </header>
      )}

      <div className="flex flex-1 relative">
        {showSidebar && sidebar && (
          <aside
            className={cn(
              'hidden lg:flex flex-col bg-white border-r border-neutral-200',
              'transition-all duration-300 ease-in-out',
              sidebarCollapsed ? 'w-16' : 'w-64'
            )}
          >
            {sidebar}
          </aside>
        )}

        <AnimatePresence>
          {showSidebar && isMobileSidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black bg-opacity-50 lg:hidden"
                onClick={toggleMobileSidebar}
              />
              
              <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'tween', duration: 0.3 }}
                className="fixed left-0 top-0 z-50 h-full w-64 bg-white border-r border-neutral-200 lg:hidden"
              >
                <div className="flex items-center justify-between p-4 border-b border-neutral-200">
                  <h2 className="text-lg font-semibold text-neutral-900">Menu</h2>
                  <button
                    onClick={toggleMobileSidebar}
                    className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                    aria-label="Close sidebar"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                  {sidebar}
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        <main className="flex-1 flex flex-col min-w-0">
          {showSidebar && (
            <div className="lg:hidden p-4 border-b border-neutral-200 bg-white">
              <button
                onClick={toggleMobileSidebar}
                className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                aria-label="Open sidebar"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          )}

          <div className="flex-1 p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>

      {footer && (
        <footer className="bg-white border-t border-neutral-200">
          {footer}
        </footer>
      )}
      
      {/* Floating Bottom Navigation - Mobile Only */}
      <FloatingBottomNav onFeatureClick={onFeatureClick} />
    </div>
  );
};

export default MainLayout;