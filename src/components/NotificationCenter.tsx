import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, AlertTriangle, Info, CheckCircle, TrendingUp, Target, Users, Mail, Brain, Trash2 } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { formatCurrency } from '../utils/currency';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const { 
    notifications, 
    loading, 
    error, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotifications();

  const handleNotificationAction = async (notification: any) => {
    await markAsRead(notification.id);
    
    if (notification.type === 'invitation') {
      // Handle group invitation
      console.log('Handle group invitation:', notification.data);
      // Would open group invitation modal or navigate to groups
    } else if (notification.type === 'group') {
      // Handle group expense
      console.log('Handle group expense:', notification.data);
      // Would navigate to group detail or expense detail
    } else if (notification.type === 'ai_insight') {
      // Handle AI insight
      console.log('Handle AI insight:', notification.data);
      // Would open AI assistant or analytics
    }
  };

  const handleDeleteNotification = async (notificationId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      await deleteNotification(notificationId);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning': return AlertTriangle;
      case 'info': return Info;
      case 'success': return CheckCircle;
      case 'budget': return TrendingUp;
      case 'goal': return Target;
      case 'group': return Users;
      case 'invitation': return Mail;
      case 'ai_insight': return Brain;
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
      case 'group': return 'text-indigo-600 bg-indigo-100';
      case 'invitation': return 'text-pink-600 bg-pink-100';
      case 'ai_insight': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

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
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <AlertTriangle className="w-12 h-12 mb-4 opacity-50" />
              <p>Lỗi tải thông báo</p>
              <p className="text-sm">{error}</p>
            </div>
          ) : notifications.length === 0 ? (
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
                      className={`p-4 rounded-xl border transition-all cursor-pointer group ${
                        notification.isRead 
                          ? 'bg-gray-50 border-gray-200' 
                          : 'bg-white border-gray-300 shadow-sm'
                      }`}
                      onClick={() => {
                        if (notification.actionable) {
                          handleNotificationAction(notification);
                        } else {
                          markAsRead(notification.id);
                        }
                      }}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-full ${colorClass}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
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
                            {notification.timestamp.toLocaleString('vi-VN')}
                          </p>

                          {/* Special handling for group invitations */}
                          {notification.type === 'invitation' && notification.actionable && (
                            <div className="mt-3 flex space-x-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}
                                className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                              >
                                Từ chối
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleNotificationAction(notification);
                                }}
                                className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                              >
                                Chấp nhận
                              </button>
                            </div>
                          )}

                          {/* Special handling for group expenses */}
                          {notification.type === 'group' && notification.actionable && (
                            <div className="mt-3">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleNotificationAction(notification);
                                }}
                                className="w-full bg-indigo-50 text-indigo-600 py-2 px-3 rounded-lg hover:bg-indigo-100 transition-colors text-sm"
                              >
                                Xem chi tiết
                              </button>
                            </div>
                          )}

                          {/* Special handling for AI insights */}
                          {notification.type === 'ai_insight' && notification.actionable && (
                            <div className="mt-3">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleNotificationAction(notification);
                                }}
                                className="w-full bg-purple-50 text-purple-600 py-2 px-3 rounded-lg hover:bg-purple-100 transition-colors text-sm"
                              >
                                Xem phân tích AI
                              </button>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                          <button
                            onClick={(e) => handleDeleteNotification(notification.id, e)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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