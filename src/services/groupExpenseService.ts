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
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { NotificationService } from './notificationService';

export interface GroupExpense {
  id: string;
  groupId: string;
  amount: number;
  description: string;
  category: string;
  date: Date;
  paidBy: string;
  paidByName: string;
  splitMethod: 'equal' | 'percentage' | 'amount';
  splits: Array<{
    userId: string;
    userName: string;
    amount: number;
    percentage?: number;
    settled: boolean;
  }>;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export class GroupExpenseService {
  private static instance: GroupExpenseService;
  private notificationService = NotificationService.getInstance();
  
  public static getInstance(): GroupExpenseService {
    if (!GroupExpenseService.instance) {
      GroupExpenseService.instance = new GroupExpenseService();
    }
    return GroupExpenseService.instance;
  }

  // Add group expense
  async addGroupExpense(
    groupId: string,
    expenseData: Omit<GroupExpense, 'id' | 'createdAt' | 'updatedAt'>,
    groupMembers: Array<{ userId: string; displayName: string; email: string }>
  ): Promise<string> {
    try {
      const now = new Date();
      
      const docRef = await addDoc(collection(db, 'groupExpenses'), {
        ...expenseData,
        groupId,
        date: Timestamp.fromDate(expenseData.date),
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now),
        splits: expenseData.splits.map(split => ({
          ...split,
          settled: false
        }))
      });

      // Create notifications for group members
      const memberIds = groupMembers
        .filter(member => member.userId !== expenseData.createdBy)
        .map(member => member.userId);

      if (memberIds.length > 0) {
        await this.notificationService.createGroupExpenseNotification(
          memberIds,
          'Nhóm', // Would get actual group name
          expenseData.paidByName,
          expenseData.description,
          expenseData.amount,
          docRef.id
        );
      }

      return docRef.id;
    } catch (error) {
      console.error('Error adding group expense:', error);
      throw error;
    }
  }

  // Get group expenses with real-time updates
  subscribeToGroupExpenses(
    groupId: string,
    callback: (expenses: GroupExpense[]) => void
  ): () => void {
    const q = query(
      collection(db, 'groupExpenses'),
      where('groupId', '==', groupId),
      orderBy('date', 'desc')
    );

    return onSnapshot(q, (querySnapshot) => {
      const expenses: GroupExpense[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        expenses.push({
          id: doc.id,
          ...data,
          date: data.date.toDate(),
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        } as GroupExpense);
      });
      
      callback(expenses);
    });
  }

  // Update expense
  async updateGroupExpense(
    expenseId: string,
    updates: Partial<GroupExpense>
  ): Promise<void> {
    try {
      const expenseRef = doc(db, 'groupExpenses', expenseId);
      const updateData: any = {
        ...updates,
        updatedAt: Timestamp.fromDate(new Date())
      };
      
      if (updates.date) {
        updateData.date = Timestamp.fromDate(updates.date);
      }

      await updateDoc(expenseRef, updateData);
    } catch (error) {
      console.error('Error updating group expense:', error);
      throw error;
    }
  }

  // Delete expense
  async deleteGroupExpense(expenseId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'groupExpenses', expenseId));
    } catch (error) {
      console.error('Error deleting group expense:', error);
      throw error;
    }
  }

  // Settle split
  async settleSplit(
    expenseId: string,
    userId: string
  ): Promise<void> {
    try {
      // This would require a more complex update to modify the splits array
      // For now, we'll implement a simple version
      const expenseRef = doc(db, 'groupExpenses', expenseId);
      
      // In a real implementation, you'd need to:
      // 1. Get the current expense
      // 2. Update the specific split
      // 3. Save back to Firestore
      
      await updateDoc(expenseRef, {
        updatedAt: Timestamp.fromDate(new Date())
      });
    } catch (error) {
      console.error('Error settling split:', error);
      throw error;
    }
  }

  // Get user's balance in group
  async getUserGroupBalance(groupId: string, userId: string): Promise<number> {
    try {
      const q = query(
        collection(db, 'groupExpenses'),
        where('groupId', '==', groupId)
      );
      
      const querySnapshot = await getDocs(q);
      let balance = 0;
      
      querySnapshot.forEach((doc) => {
        const expense = doc.data() as GroupExpense;
        
        // Amount paid by user
        if (expense.paidBy === userId) {
          balance += expense.amount;
        }
        
        // Amount owed by user
        const userSplit = expense.splits.find(split => split.userId === userId);
        if (userSplit) {
          balance -= userSplit.amount;
        }
      });
      
      return balance;
    } catch (error) {
      console.error('Error calculating user group balance:', error);
      return 0;
    }
  }

  // Get group expense summary
  async getGroupExpenseSummary(groupId: string) {
    try {
      const q = query(
        collection(db, 'groupExpenses'),
        where('groupId', '==', groupId)
      );
      
      const querySnapshot = await getDocs(q);
      const expenses: GroupExpense[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        expenses.push({
          id: doc.id,
          ...data,
          date: data.date.toDate(),
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        } as GroupExpense);
      });

      const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
      const thisMonth = expenses.filter(exp => {
        const now = new Date();
        return exp.date.getMonth() === now.getMonth() && 
               exp.date.getFullYear() === now.getFullYear();
      }).reduce((sum, exp) => sum + exp.amount, 0);

      const categoryBreakdown = expenses.reduce((acc, exp) => {
        acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalAmount,
        thisMonth,
        expenseCount: expenses.length,
        categoryBreakdown,
        expenses
      };
    } catch (error) {
      console.error('Error getting group expense summary:', error);
      return {
        totalAmount: 0,
        thisMonth: 0,
        expenseCount: 0,
        categoryBreakdown: {},
        expenses: []
      };
    }
  }
}