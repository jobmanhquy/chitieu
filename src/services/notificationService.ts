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

  // Create group invitation notification
  async createGroupInvitationNotification(
    invitedUserId: string,
    groupName: string,
    inviterName: string,
    groupId: string,
    invitationId: string
  ): Promise<void> {
    await this.createNotification({
      userId: invitedUserId,
      type: 'invitation',
      title: 'Lời mời tham gia nhóm',
      message: `${inviterName} đã mời bạn tham gia nhóm "${groupName}"`,
      isRead: false,
      actionable: true,
      data: {
        groupId,
        groupName,
        inviterName,
        invitationId
      },
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });
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