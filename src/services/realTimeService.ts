import { 
  collection, 
  doc, 
  onSnapshot, 
  query, 
  where, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { NotificationService } from './notificationService';

export interface RealTimeEvent {
  type: 'expense_added' | 'group_invitation' | 'member_joined' | 'budget_alert';
  data: any;
  timestamp: Date;
  userId: string;
}

export class RealTimeService {
  private static instance: RealTimeService;
  private notificationService = NotificationService.getInstance();
  private listeners: Map<string, () => void> = new Map();
  
  public static getInstance(): RealTimeService {
    if (!RealTimeService.instance) {
      RealTimeService.instance = new RealTimeService();
    }
    return RealTimeService.instance;
  }

  // Subscribe to user's real-time events
  subscribeToUserEvents(
    userId: string,
    callback: (event: RealTimeEvent) => void
  ): string {
    const listenerId = `user_events_${userId}_${Date.now()}`;
    
    // Listen to group invitations
    const invitationsQuery = query(
      collection(db, 'groupInvitations'),
      where('invitedUserId', '==', userId),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeInvitations = onSnapshot(invitationsQuery, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          callback({
            type: 'group_invitation',
            data: {
              id: change.doc.id,
              ...data,
              createdAt: data.createdAt.toDate()
            },
            timestamp: new Date(),
            userId
          });
        }
      });
    });

    // Listen to group expenses for user's groups
    const expensesQuery = query(
      collection(db, 'groupExpenses'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeExpenses = onSnapshot(expensesQuery, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          // Check if user is involved in this expense
          const userInvolved = data.splits?.some((split: any) => split.userId === userId) || 
                              data.paidBy === userId;
          
          if (userInvolved && data.createdBy !== userId) {
            callback({
              type: 'expense_added',
              data: {
                id: change.doc.id,
                ...data,
                createdAt: data.createdAt.toDate(),
                date: data.date.toDate()
              },
              timestamp: new Date(),
              userId
            });
          }
        }
      });
    });

    // Combine unsubscribe functions
    const unsubscribe = () => {
      unsubscribeInvitations();
      unsubscribeExpenses();
    };

    this.listeners.set(listenerId, unsubscribe);
    return listenerId;
  }

  // Unsubscribe from events
  unsubscribe(listenerId: string): void {
    const unsubscribe = this.listeners.get(listenerId);
    if (unsubscribe) {
      unsubscribe();
      this.listeners.delete(listenerId);
    }
  }

  // Unsubscribe all listeners
  unsubscribeAll(): void {
    this.listeners.forEach((unsubscribe) => unsubscribe());
    this.listeners.clear();
  }

  // Process real-time event and create notification
  async processEvent(event: RealTimeEvent): Promise<void> {
    try {
      switch (event.type) {
        case 'group_invitation':
          await this.notificationService.createGroupInvitationNotification(
            event.userId,
            event.data.groupName,
            event.data.inviterName,
            event.data.groupId,
            event.data.id
          );
          break;

        case 'expense_added':
          // Notification is created in GroupExpenseService
          break;

        case 'member_joined':
          await this.notificationService.createNotification({
            userId: event.userId,
            type: 'info',
            title: 'Thành viên mới',
            message: `${event.data.memberName} đã tham gia nhóm ${event.data.groupName}`,
            isRead: false,
            data: event.data
          });
          break;

        case 'budget_alert':
          await this.notificationService.createBudgetAlertNotification(
            event.userId,
            event.data.category,
            event.data.currentAmount,
            event.data.budgetLimit,
            event.data.percentage
          );
          break;
      }
    } catch (error) {
      console.error('Error processing real-time event:', error);
    }
  }
}