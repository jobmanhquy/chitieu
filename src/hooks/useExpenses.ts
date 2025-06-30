import { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  orderBy, 
  where,
  Timestamp,
  onSnapshot,
  limit
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Expense } from '../types/expense';
import toast from 'react-hot-toast';

export const useExpenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Real-time listener for expenses
  useEffect(() => {
    if (!user) {
      setExpenses([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const q = query(
      collection(db, 'expenses'),
      where('userId', '==', user.uid),
      orderBy('date', 'desc'),
      limit(1000) // Limit for performance
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        try {
          const expensesData: Expense[] = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            expensesData.push({
              id: doc.id,
              amount: data.amount,
              description: data.description,
              category: data.category,
              date: data.date.toDate(),
              createdAt: data.createdAt.toDate(),
              updatedAt: data.updatedAt.toDate(),
            });
          });
          
          setExpenses(expensesData);
          setError(null);
        } catch (err) {
          console.error('Error processing expenses:', err);
          setError('Lỗi xử lý dữ liệu chi tiêu');
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error fetching expenses:', err);
        setError('Không thể tải dữ liệu chi tiêu');
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user]);

  // Add new expense
  const addExpense = async (expenseData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) {
      throw new Error('Vui lòng đăng nhập để thêm chi tiêu');
    }

    try {
      const now = new Date();
      
      // Validate data
      if (!expenseData.amount || expenseData.amount <= 0) {
        throw new Error('Số tiền phải lớn hơn 0');
      }
      
      if (!expenseData.description.trim()) {
        throw new Error('Vui lòng nhập mô tả');
      }
      
      if (!expenseData.category) {
        throw new Error('Vui lòng chọn danh mục');
      }

      const docRef = await addDoc(collection(db, 'expenses'), {
        ...expenseData,
        userId: user.uid,
        date: Timestamp.fromDate(expenseData.date),
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now),
      });

      toast.success('Đã thêm chi tiêu thành công!');
      return docRef.id;
    } catch (err: any) {
      console.error('Error adding expense:', err);
      const errorMessage = err.message || 'Không thể thêm chi tiêu';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Update expense
  const updateExpense = async (id: string, expenseData: Partial<Expense>) => {
    if (!user) {
      throw new Error('Vui lòng đăng nhập để cập nhật chi tiêu');
    }

    try {
      // Validate data
      if (expenseData.amount !== undefined && expenseData.amount <= 0) {
        throw new Error('Số tiền phải lớn hơn 0');
      }
      
      if (expenseData.description !== undefined && !expenseData.description.trim()) {
        throw new Error('Vui lòng nhập mô tả');
      }

      const expenseRef = doc(db, 'expenses', id);
      const updateData: any = {
        ...expenseData,
        updatedAt: Timestamp.fromDate(new Date()),
      };
      
      if (expenseData.date) {
        updateData.date = Timestamp.fromDate(expenseData.date);
      }

      await updateDoc(expenseRef, updateData);
      toast.success('Đã cập nhật chi tiêu thành công!');
    } catch (err: any) {
      console.error('Error updating expense:', err);
      const errorMessage = err.message || 'Không thể cập nhật chi tiêu';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Delete expense
  const deleteExpense = async (id: string) => {
    if (!user) {
      throw new Error('Vui lòng đăng nhập để xóa chi tiêu');
    }

    try {
      await deleteDoc(doc(db, 'expenses', id));
      toast.success('Đã xóa chi tiêu thành công!');
    } catch (err: any) {
      console.error('Error deleting expense:', err);
      const errorMessage = 'Không thể xóa chi tiêu';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Bulk operations
  const addMultipleExpenses = async (expensesData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>[]) => {
    if (!user) {
      throw new Error('Vui lòng đăng nhập để thêm chi tiêu');
    }

    try {
      const promises = expensesData.map(expenseData => addExpense(expenseData));
      await Promise.all(promises);
      toast.success(`Đã thêm ${expensesData.length} chi tiêu thành công!`);
    } catch (err: any) {
      console.error('Error adding multiple expenses:', err);
      const errorMessage = 'Không thể thêm nhiều chi tiêu';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Get expenses by date range
  const getExpensesByDateRange = (startDate: Date, endDate: Date): Expense[] => {
    return expenses.filter(expense => 
      expense.date >= startDate && expense.date <= endDate
    );
  };

  // Get expenses by category
  const getExpensesByCategory = (category: string): Expense[] => {
    return expenses.filter(expense => expense.category === category);
  };

  // Get total amount
  const getTotalAmount = (filteredExpenses?: Expense[]): number => {
    const expensesToSum = filteredExpenses || expenses;
    return expensesToSum.reduce((sum, expense) => sum + expense.amount, 0);
  };

  // Get statistics
  const getStatistics = () => {
    const total = getTotalAmount();
    const count = expenses.length;
    const average = count > 0 ? total / count : 0;
    
    const categories = expenses.reduce((acc, expense) => {
      if (!acc[expense.category]) {
        acc[expense.category] = { count: 0, total: 0 };
      }
      acc[expense.category].count++;
      acc[expense.category].total += expense.amount;
      return acc;
    }, {} as Record<string, { count: number; total: number }>);

    return {
      total,
      count,
      average,
      categories
    };
  };

  return {
    expenses,
    loading,
    error,
    addExpense,
    updateExpense,
    deleteExpense,
    addMultipleExpenses,
    getExpensesByDateRange,
    getExpensesByCategory,
    getTotalAmount,
    getStatistics
  };
};