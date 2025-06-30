import { useState, useEffect } from 'react';
import { NotificationService, Notification } from '../services/notificationService';
import { useAuth } from '../contexts/AuthContext';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const notificationService = NotificationService.getInstance();

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    console.log('Setting up notifications listener for user:', user.uid);
    setLoading(true);
    setError(null);

    // Create sample notifications for demo if none exist
    const createSampleNotifications = async () => {
      try {
        await notificationService.createSampleNotifications(user.uid);
      } catch (error) {
        console.error('Error creating sample notifications:', error);
      }
    };

    // Create sample notifications after a short delay
    const timer = setTimeout(() => {
      createSampleNotifications();
    }, 2000);

    const unsubscribe = notificationService.subscribeToUserNotifications(
      user.uid,
      (notifications) => {
        console.log('Received notifications:', notifications.length);
        setNotifications(notifications);
        setError(null);
        setLoading(false);
      }
    );

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, [user]);

  const markAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      setError('Không thể đánh dấu đã đọc');
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    
    try {
      await notificationService.markAllAsRead(user.uid);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      setError('Không thể đánh dấu tất cả đã đọc');
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
    } catch (error) {
      console.error('Error deleting notification:', error);
      setError('Không thể xóa thông báo');
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return {
    notifications,
    loading,
    error,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification
  };
};