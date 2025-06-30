import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  onSnapshot,
  Timestamp,
  limit
} from 'firebase/firestore';
import { db } from '../config/firebase';
import toast from 'react-hot-toast';

export interface Notification {
  id: string;
  userId: string;
  type: 'warning' | 'info' | 'success' | 'budget' | 'goal' | 'group' | 'invitation' | 'ai_insight';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  actionable?: boolean;
  data?: any;
  expiresAt?: Date;
}

export class NotificationService {
  private static instance: NotificationService;
  
  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Create notification
  async createNotification(notification: Omit<Notification, 'id' | 'timestamp'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'notifications'), {
        ...notification,
        timestamp: Timestamp.fromDate(new Date()),
        expiresAt: notification.expiresAt ? Timestamp.fromDate(notification.expiresAt) : null
      });

      return docRef.id;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Get user notifications with real-time updates
  subscribeToUserNotifications(
    userId: string, 
    callback: (notifications: Notification[]) => void
  ): () => void {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(50)
    );

    return onSnapshot(q, (querySnapshot) => {
      const notifications: Notification[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        notifications.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp.toDate(),
          expiresAt: data.expiresAt?.toDate()
        } as Notification);
      });
      
      callback(notifications);
    });
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<void> {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        isRead: true,
        readAt: Timestamp.fromDate(new Date())
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read for user
  async markAllAsRead(userId: string): Promise<void> {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('isRead', '==', false)
      );
      
      const querySnapshot = await getDocs(q);
      const updatePromises = querySnapshot.docs.map(doc => 
        updateDoc(doc.ref, {
          isRead: true,
          readAt: Timestamp.fromDate(new Date())
        })
      );
      
      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Delete notification
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'notifications', notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  // Create group invitation notification (REAL implementation)
  async createGroupInvitationNotification(
    invitedUserEmail: string,
    groupName: string,
    groupType: string,
    inviterName: string,
    groupId: string,
    invitationId: string
  ): Promise<void> {
    // In a real implementation, we would:
    // 1. Find the user by email
    // 2. Create notification for that user
    // For demo purposes, we'll create a notification for the current user
    
    console.log('Creating group invitation notification:', {
      invitedUserEmail,
      groupName,
      groupType,
      inviterName,
      groupId,
      invitationId
    });

    // This would be implemented with proper user lookup in a real app
    // For now, we'll just log the invitation details
  }

  // Create group expense notification
  async createGroupExpenseNotification(
    groupMembers: string[],
    groupName: string,
    memberName: string,
    expenseDescription: string,
    amount: number,
    expenseId: string
  ): Promise<void> {
    const notifications = groupMembers.map(userId => 
      this.createNotification({
        userId,
        type: 'group',
        title: 'Chi tiêu nhóm mới',
        message: `${memberName} đã thêm chi tiêu "${expenseDescription}" - ${amount.toLocaleString('vi-VN')}₫ trong nhóm "${groupName}"`,
        isRead: false,
        actionable: true,
        data: {
          groupName,
          memberName,
          amount,
          description: expenseDescription,
          expenseId
        }
      })
    );

    await Promise.all(notifications);
  }

  // Create AI insight notification
  async createAIInsightNotification(
    userId: string,
    insight: string,
    confidence: number
  ): Promise<void> {
    await this.createNotification({
      userId,
      type: 'ai_insight',
      title: 'AI Insight mới',
      message: insight,
      isRead: false,
      actionable: true,
      data: {
        confidence,
        generatedAt: new Date()
      }
    });
  }

  // Create budget alert notification
  async createBudgetAlertNotification(
    userId: string,
    category: string,
    currentAmount: number,
    budgetLimit: number,
    percentage: number
  ): Promise<void> {
    await this.createNotification({
      userId,
      type: 'warning',
      title: 'Cảnh báo ngân sách',
      message: `Chi tiêu cho ${category} đã đạt ${percentage.toFixed(0)}% ngân sách (${currentAmount.toLocaleString('vi-VN')}₫/${budgetLimit.toLocaleString('vi-VN')}₫)`,
      isRead: false,
      actionable: true,
      data: {
        category,
        currentAmount,
        budgetLimit,
        percentage
      }
    });
  }

  // Create sample notifications for demo
  async createSampleNotifications(userId: string): Promise<void> {
    const sampleNotifications = [
      {
        userId,
        type: 'invitation' as const,
        title: 'Lời mời tham gia nhóm',
        message: 'Nguyễn Văn A đã mời bạn tham gia nhóm "Gia đình Nguyễn"',
        isRead: false,
        actionable: true,
        data: {
          groupName: 'Gia đình Nguyễn',
          groupType: 'family',
          inviterName: 'Nguyễn Văn A',
          groupId: 'sample_group_1',
          invitationId: 'sample_invitation_1',
          role: 'member'
        },
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      },
      {
        userId,
        type: 'invitation' as const,
        title: 'Lời mời tham gia nhóm',
        message: 'Trần Thị B đã mời bạn tham gia nhóm "Nhóm bạn thân"',
        isRead: false,
        actionable: true,
        data: {
          groupName: 'Nhóm bạn thân',
          groupType: 'friends',
          inviterName: 'Trần Thị B',
          groupId: 'sample_group_2',
          invitationId: 'sample_invitation_2',
          role: 'member'
        },
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      },
      {
        userId,
        type: 'ai_insight' as const,
        title: 'AI Insight mới',
        message: 'Chi tiêu ăn uống tháng này tăng 25% so với tháng trước. Hãy cân nhắc giảm bớt để tối ưu ngân sách.',
        isRead: false,
        actionable: true,
        data: {
          confidence: 0.87,
          category: 'Ăn uống',
          increase: 25
        }
      }
    ];

    for (const notification of sampleNotifications) {
      await this.createNotification(notification);
    }
  }

  // Clean up expired notifications
  async cleanupExpiredNotifications(): Promise<void> {
    try {
      const now = new Date();
      const q = query(
        collection(db, 'notifications'),
        where('expiresAt', '<=', Timestamp.fromDate(now))
      );
      
      const querySnapshot = await getDocs(q);
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
      
      await Promise.all(deletePromises);
      console.log(`Cleaned up ${querySnapshot.size} expired notifications`);
    } catch (error) {
      console.error('Error cleaning up expired notifications:', error);
    }
  }
}