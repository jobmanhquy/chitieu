import { useEffect } from 'react';
import { RealTimeService, RealTimeEvent } from '../services/realTimeService';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export const useRealTime = () => {
  const { user } = useAuth();
  const realTimeService = RealTimeService.getInstance();

  useEffect(() => {
    if (!user) return;

    console.log('Setting up real-time listeners for user:', user.uid);

    const listenerId = realTimeService.subscribeToUserEvents(
      user.uid,
      (event: RealTimeEvent) => {
        console.log('Real-time event received:', event);
        
        // Show toast notifications for important events
        switch (event.type) {
          case 'group_invitation':
            toast.success(`Bạn có lời mời tham gia nhóm "${event.data.groupName}"`);
            break;
          case 'expense_added':
            toast.info(`Chi tiêu mới: ${event.data.description} - ${event.data.amount.toLocaleString('vi-VN')}₫`);
            break;
          case 'member_joined':
            toast.info(`${event.data.memberName} đã tham gia nhóm`);
            break;
          case 'budget_alert':
            toast.error(`Cảnh báo: Chi tiêu ${event.data.category} vượt ngân sách!`);
            break;
        }

        // Process the event to create notifications
        realTimeService.processEvent(event);
      }
    );

    return () => {
      realTimeService.unsubscribe(listenerId);
    };
  }, [user]);

  return {
    // Could return methods to manually trigger events if needed
  };
};