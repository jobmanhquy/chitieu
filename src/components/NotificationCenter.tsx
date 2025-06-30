import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, AlertTriangle, Info, CheckCircle, TrendingUp, Target } from 'lucide-react';
import { useExpenses } from '../hooks/useExpenses';
import { formatCurrency } from '../utils/currency';
import { startOfMonth, endOfMonth } from 'date-fns';

interface Notification {
  id: string;
  type: 'warning' | 'info' | 'success' | 'budget' | 'goal';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  actionable?: boolean;
  action?: () => void;
}

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { expenses } = useExpenses();

  useEffect(() => {
    generateNotifications();
  }, [expenses]);

  const generateNotifications = () => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    
    const thisMonthExpenses = expenses.filter(expense =>
      expense.date >= monthStart && expense.date <= monthEnd
    );
    
    const totalThisMonth = thisMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const dailyAverage = totalThisMonth / now.getDate();
    
    const newNotifications: Notification[] = [];

    // Budget warning
    if (totalThisMonth > 5000000) {
      newNotifications.push({
        id: 'budget-warning',
        type: 'warning',
        title: 'Cảnh báo ngân sách',
        message: `Chi tiêu tháng này đã đạt ${formatCurrency(totalThisMonth)}. Hãy cân nhắc giảm chi tiêu.`,
        timestamp: new Date(),
        isRead: false,
        actionable: true
      });
    }

    // Daily spending insight
    if (dailyAverage > 200000) {
      newNotifications.push({
        id: 'daily-insight',
        type: 'info',
        title: 'Thông tin chi tiêu',
        message: `Trung bình bạn chi ${formatCurrency(dailyAverage)}/ngày. Điều này cao hơn mức khuyến nghị.`,
        timestamp: new Date(),
        isRead: false
      });
    }

    // Achievement notification
    if (expenses.length >= 10) {
      newNotifications.push({
        id: 'achievement',
        type: 'success',
        title: 'Thành tích mới!',
        message: 'Bạn đã ghi chép 10+ giao dịch. Tiếp tục duy trì thói quen tốt!',
        timestamp: new Date(),
        isRead: false
      });
    }

    // Goal reminder
    newNotifications.push({
      id: 'goal-reminder',
      type: 'goal',
      title: 'Nhắc nhở mục tiêu',
      message: 'Đừng quên cập nhật tiến độ mục tiêu tiết kiệm của bạn.',
      timestamp: new Date(),
      isRead: false
    });

    setNotifications(newNotifications);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, isRead: true }))
    );
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning': return AlertTriangle;
      case 'info': return Info;
      case 'success': return CheckCircle;
      case 'budget': return TrendingUp;
      case 'goal': return Target;
      default: return Info;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'warning': return 'text-orange-600 bg-orange-100';
      case 'info': return 'text-blue-600 bg-blue-100';
      case 'success': return 'text-green-600 bg-green-100';
      case 'budget': return 'text-red-600 bg-red-100';
      case 'goal': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl w-full max-w-md h-[600px] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Bell className="w-6 h-6 text-gray-700" />
              {unreadCount > 0 && (
                <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount}
                </div>
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Thông báo</h2>
              <p className="text-sm text-gray-500">{unreadCount} chưa đọc</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Đánh dấu tất cả
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <Bell className="w-12 h-12 mb-4 opacity-50" />
              <p>Không có thông báo nào</p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              <AnimatePresence>
                {notifications.map((notification) => {
                  const Icon = getIcon(notification.type);
                  const colorClass = getColor(notification.type);
                  
                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        notification.isRead 
                          ? 'bg-gray-50 border-gray-200' 
                          : 'bg-white border-gray-300 shadow-sm'
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-full ${colorClass}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <h3 className={`font-medium ${
                            notification.isRead ? 'text-gray-600' : 'text-gray-900'
                          }`}>
                            {notification.title}
                          </h3>
                          <p className={`text-sm mt-1 ${
                            notification.isRead ? 'text-gray-500' : 'text-gray-600'
                          }`}>
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            {notification.timestamp.toLocaleTimeString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};