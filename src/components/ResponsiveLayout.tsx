import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  header: React.ReactNode;
}

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  sidebar,
  header
}) => {
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setScreenSize('mobile');
        setSidebarOpen(false);
      } else if (width < 1024) {
        setScreenSize('tablet');
        setSidebarOpen(false);
      } else {
        setScreenSize('desktop');
        setSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getLayoutClasses = () => {
    switch (screenSize) {
      case 'mobile':
        return {
          container: 'min-h-screen bg-gradient-to-br from-blue-50 to-purple-50',
          sidebar: `fixed inset-y-0 left-0 z-50 w-80 transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`,
          main: 'flex flex-col min-h-screen',
          content: 'flex-1 px-4 py-4 overflow-auto'
        };
      case 'tablet':
        return {
          container: 'min-h-screen bg-gradient-to-br from-blue-50 to-purple-50',
          sidebar: `fixed inset-y-0 left-0 z-40 w-80 transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`,
          main: 'flex flex-col min-h-screen',
          content: 'flex-1 px-6 py-6 overflow-auto'
        };
      case 'desktop':
        return {
          container: 'min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex',
          sidebar: 'w-80 flex-shrink-0',
          main: 'flex-1 flex flex-col min-w-0',
          content: 'flex-1 px-8 py-8 overflow-auto'
        };
    }
  };

  const classes = getLayoutClasses();

  return (
    <div className={classes.container}>
      {/* Overlay for mobile/tablet */}
      {(screenSize === 'mobile' || screenSize === 'tablet') && sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={classes.sidebar}>
        {React.cloneElement(sidebar as React.ReactElement, {
          isOpen: sidebarOpen,
          onClose: () => setSidebarOpen(false),
          screenSize
        })}
      </div>

      {/* Main Content */}
      <div className={classes.main}>
        {/* Header */}
        {React.cloneElement(header as React.ReactElement, {
          onMenuClick: () => setSidebarOpen(true),
          screenSize
        })}

        {/* Content */}
        <main className={classes.content}>
          {children}
        </main>
      </div>
    </div>
  );
};