import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Receipt, 
  BarChart3, 
  Target, 
  Settings,
  Trophy,
  Zap,
  X,
  User,
  LogIn,
  Menu
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { useAuth } from '../contexts/AuthContext';
import { AuthModal } from './auth/AuthModal';
import { UserProfile } from './auth/UserProfile';

interface NavigationProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ isOpen, onClose }) => {
  const { activeView, setActiveView, setSidebarOpen } = useStore();
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Tổng quan',
      icon: LayoutDashboard,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'expenses',
      label: 'Chi tiêu',
      icon: Receipt,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      id: 'analytics',
      label: 'Phân tích',
      icon: BarChart3,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      id: 'goals',
      label: 'Mục tiêu',
      icon: Target,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      id: 'achievements',
      label: 'Thành tích',
      icon: Trophy,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      id: 'challenges',
      label: 'Thử thách',
      icon: Zap,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      id: 'settings',
      label: 'Cài đặt',
      icon: Settings,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50'
    }
  ];

  const handleItemClick = (viewId: string) => {
    setActiveView(viewId as any);
    // KHÔNG đóng sidebar trên desktop
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const handleUserClick = () => {
    if (user) {
      setShowUserProfile(true);
    } else {
      setShowAuthModal(true);
    }
  };

  return (
    <>
      {/* Overlay - chỉ hiển thị trên mobile/tablet */}
      {isOpen && window.innerWidth < 1024 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{ 
          x: isOpen || window.innerWidth >= 1024 ? 0 : -300 
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed left-0 top-0 h-full w-80 bg-white shadow-xl z-50 lg:relative lg:translate-x-0 lg:shadow-none lg:border-r lg:border-gray-200"
      >
        {/* Header với nút đóng chỉ hiển thị trên mobile */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 lg:hidden">
          <h2 className="text-xl font-bold text-gray-900">Menu</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Logo/Brand cho desktop */}
        <div className="hidden lg:flex items-center p-6 border-b border-gray-200">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <LayoutDashboard className="w-6 h-6 text-white" />
          </div>
          <div className="ml-3">
            <h1 className="text-lg font-bold text-gray-900">Chi Tiêu AI</h1>
            <p className="text-xs text-gray-500">Powered by Gemini</p>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            
            return (
              <motion.button
                key={item.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? `${item.bgColor} ${item.color} shadow-sm`
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </motion.button>
            );
          })}
        </nav>

        {/* User Profile Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <button
            onClick={handleUserClick}
            className="w-full flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl hover:from-blue-100 hover:to-purple-100 transition-all"
          >
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : user ? (
                <User className="w-5 h-5 text-white" />
              ) : (
                <LogIn className="w-5 h-5 text-white" />
              )}
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-gray-900">
                {user ? (user.displayName || 'Người dùng') : 'Đăng nhập'}
              </p>
              <p className="text-sm text-gray-500">
                {user ? (user.emailVerified ? 'Đã xác thực' : 'Chưa xác thực') : 'Để bắt đầu sử dụng'}
              </p>
            </div>
          </button>
        </div>
      </motion.div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      {/* User Profile Modal */}
      <UserProfile
        isOpen={showUserProfile}
        onClose={() => setShowUserProfile(false)}
      />
    </>
  );
};