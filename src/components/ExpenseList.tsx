import React from 'react';
import { Trash2, Edit3 } from 'lucide-react';
import { Expense } from '../types/expense';
import { formatCurrency } from '../utils/currency';
import { formatDate } from '../utils/date';
import { getCategoryColor } from '../data/categories';

interface ExpenseListProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
  onEdit: (expense: Expense) => void;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, onDelete, onEdit }) => {
  if (expenses.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center">
        <div className="text-gray-400 mb-4">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <div className="w-8 h-8 bg-gray-300 rounded"></div>
          </div>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có chi tiêu nào</h3>
        <p className="text-gray-500">Thêm chi tiêu đầu tiên của bạn để bắt đầu theo dõi</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {expenses.map((expense) => (
        <div key={expense.id} className="bg-white rounded-xl p-4 hover:shadow-md transition-shadow group">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${getCategoryColor(expense.category)}20` }}
              >
                <div 
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: getCategoryColor(expense.category) }}
                ></div>
              </div>
              
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{expense.description}</h3>
                <div className="flex items-center space-x-3 text-sm text-gray-500">
                  <span>{expense.category}</span>
                  <span>•</span>
                  <span>{formatDate(expense.date)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="font-semibold text-lg text-gray-900">
                  {formatCurrency(expense.amount)}
                </div>
              </div>
              
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                <button
                  onClick={() => onEdit(expense)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(expense.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};