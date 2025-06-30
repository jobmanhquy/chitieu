import { useState, useEffect } from 'react';
import { GroupExpenseService, GroupExpense } from '../services/groupExpenseService';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export const useGroupExpenses = (groupId?: string) => {
  const [expenses, setExpenses] = useState<GroupExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const groupExpenseService = GroupExpenseService.getInstance();

  useEffect(() => {
    if (!user || !groupId) {
      setExpenses([]);
      setLoading(false);
      return;
    }

    console.log('Setting up group expenses listener for group:', groupId);
    setLoading(true);
    setError(null);

    const unsubscribe = groupExpenseService.subscribeToGroupExpenses(
      groupId,
      (expenses) => {
        console.log('Received group expenses:', expenses.length);
        setExpenses(expenses);
        setError(null);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user, groupId]);

  const addGroupExpense = async (
    expenseData: Omit<GroupExpense, 'id' | 'createdAt' | 'updatedAt'>,
    groupMembers: Array<{ userId: string; displayName: string; email: string }>
  ) => {
    if (!user || !groupId) {
      throw new Error('User not authenticated or group not selected');
    }

    try {
      const expenseId = await groupExpenseService.addGroupExpense(
        groupId,
        { ...expenseData, createdBy: user.uid },
        groupMembers
      );
      
      toast.success('Đã thêm chi tiêu nhóm thành công!');
      return expenseId;
    } catch (error) {
      console.error('Error adding group expense:', error);
      toast.error('Không thể thêm chi tiêu nhóm');
      throw error;
    }
  };

  const updateGroupExpense = async (
    expenseId: string,
    updates: Partial<GroupExpense>
  ) => {
    try {
      await groupExpenseService.updateGroupExpense(expenseId, updates);
      toast.success('Đã cập nhật chi tiêu nhóm!');
    } catch (error) {
      console.error('Error updating group expense:', error);
      toast.error('Không thể cập nhật chi tiêu nhóm');
      throw error;
    }
  };

  const deleteGroupExpense = async (expenseId: string) => {
    try {
      await groupExpenseService.deleteGroupExpense(expenseId);
      toast.success('Đã xóa chi tiêu nhóm!');
    } catch (error) {
      console.error('Error deleting group expense:', error);
      toast.error('Không thể xóa chi tiêu nhóm');
      throw error;
    }
  };

  const settleSplit = async (expenseId: string) => {
    if (!user) return;
    
    try {
      await groupExpenseService.settleSplit(expenseId, user.uid);
      toast.success('Đã thanh toán!');
    } catch (error) {
      console.error('Error settling split:', error);
      toast.error('Không thể thanh toán');
      throw error;
    }
  };

  return {
    expenses,
    loading,
    error,
    addGroupExpense,
    updateGroupExpense,
    deleteGroupExpense,
    settleSplit
  };
};