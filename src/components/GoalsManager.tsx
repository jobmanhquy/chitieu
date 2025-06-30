import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Target, Calendar, DollarSign, TrendingUp, Edit, Trash2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { FinancialGoal, BudgetGoal } from '../types/goals';
import { formatCurrency } from '../utils/currency';
import { formatDate } from '../utils/date';

export const GoalsManager: React.FC = () => {
  const { financialGoals, budgetGoals, addFinancialGoal, addBudgetGoal, updateFinancialGoal, deleteFinancialGoal } = useStore();
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [goalType, setGoalType] = useState<'financial' | 'budget'>('financial');

  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    targetAmount: 0,
    currentAmount: 0,
    deadline: '',
    category: 'savings' as const,
    priority: 'medium' as const
  });

  const [newBudgetGoal, setNewBudgetGoal] = useState({
    category: '',
    monthlyLimit: 0,
    alertThreshold: 80
  });

  const handleAddFinancialGoal = () => {
    if (!newGoal.title || !newGoal.targetAmount || !newGoal.deadline) return;

    addFinancialGoal({
      ...newGoal,
      deadline: new Date(newGoal.deadline),
      status: 'active'
    });

    setNewGoal({
      title: '',
      description: '',
      targetAmount: 0,
      currentAmount: 0,
      deadline: '',
      category: 'savings',
      priority: 'medium'
    });
    setShowAddGoal(false);
  };

  const handleAddBudgetGoal = () => {
    if (!newBudgetGoal.category || !newBudgetGoal.monthlyLimit) return;

    addBudgetGoal({
      ...newBudgetGoal,
      currentSpent: 0,
      isActive: true
    });

    setNewBudgetGoal({
      category: '',
      monthlyLimit: 0,
      alertThreshold: 80
    });
    setShowAddGoal(false);
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'savings': return Target;
      case 'debt': return TrendingUp;
      case 'investment': return DollarSign;
      case 'purchase': return Calendar;
      default: return Target;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mục tiêu tài chính</h1>
          <p className="text-gray-600">Quản lý mục tiêu và ngân sách của bạn</p>
        </div>
        <button
          onClick={() => setShowAddGoal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm mục tiêu</span>
        </button>
      </div>

      {/* Financial Goals */}
      <div className="bg-white rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Mục tiêu tài chính</h2>
        
        {financialGoals.length === 0 ? (
          <div className="text-center py-8">
            <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Chưa có mục tiêu nào. Hãy tạo mục tiêu đầu tiên!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {financialGoals.map((goal) => {
              const Icon = getCategoryIcon(goal.category);
              const progress = getProgressPercentage(goal.currentAmount, goal.targetAmount);
              
              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <Icon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{goal.title}</h3>
                        <p className="text-sm text-gray-600">{goal.description}</p>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <button className="p-1 text-gray-400 hover:text-blue-600">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => deleteFinancialGoal(goal.id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tiến độ</span>
                      <span className="font-medium">{progress.toFixed(1)}%</span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Hiện tại</p>
                        <p className="font-semibold">{formatCurrency(goal.currentAmount)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Mục tiêu</p>
                        <p className="font-semibold">{formatCurrency(goal.targetAmount)}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(goal.priority)}`}>
                        {goal.priority === 'high' ? 'Cao' : goal.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                      </span>
                      <span className="text-sm text-gray-600">
                        Hạn: {formatDate(goal.deadline)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Budget Goals */}
      <div className="bg-white rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Ngân sách theo danh mục</h2>
        
        {budgetGoals.length === 0 ? (
          <div className="text-center py-8">
            <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Chưa có ngân sách nào. Hãy thiết lập ngân sách!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {budgetGoals.map((budget) => {
              const usedPercentage = (budget.currentSpent / budget.monthlyLimit) * 100;
              const isOverBudget = usedPercentage > 100;
              const isNearLimit = usedPercentage > budget.alertThreshold;
              
              return (
                <div key={budget.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900">{budget.category}</h3>
                    <div className="text-right">
                      <p className="font-semibold">
                        {formatCurrency(budget.currentSpent)} / {formatCurrency(budget.monthlyLimit)}
                      </p>
                      <p className={`text-sm ${
                        isOverBudget ? 'text-red-600' : isNearLimit ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {usedPercentage.toFixed(1)}% đã sử dụng
                      </p>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        isOverBudget ? 'bg-red-500' : isNearLimit ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(usedPercentage, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Goal Modal */}
      {showAddGoal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">Thêm mục tiêu mới</h3>
            
            <div className="mb-4">
              <div className="flex space-x-2">
                <button
                  onClick={() => setGoalType('financial')}
                  className={`px-4 py-2 rounded-lg ${
                    goalType === 'financial' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  Mục tiêu tài chính
                </button>
                <button
                  onClick={() => setGoalType('budget')}
                  className={`px-4 py-2 rounded-lg ${
                    goalType === 'budget' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  Ngân sách
                </button>
              </div>
            </div>

            {goalType === 'financial' ? (
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Tên mục tiêu"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                
                <textarea
                  placeholder="Mô tả (tùy chọn)"
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
                
                <input
                  type="number"
                  placeholder="Số tiền mục tiêu"
                  value={newGoal.targetAmount || ''}
                  onChange={(e) => setNewGoal({ ...newGoal, targetAmount: Number(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                
                <input
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                
                <select
                  value={newGoal.category}
                  onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value as any })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="savings">Tiết kiệm</option>
                  <option value="debt">Trả nợ</option>
                  <option value="investment">Đầu tư</option>
                  <option value="purchase">Mua sắm</option>
                </select>
              </div>
            ) : (
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Danh mục"
                  value={newBudgetGoal.category}
                  onChange={(e) => setNewBudgetGoal({ ...newBudgetGoal, category: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                
                <input
                  type="number"
                  placeholder="Ngân sách hàng tháng"
                  value={newBudgetGoal.monthlyLimit || ''}
                  onChange={(e) => setNewBudgetGoal({ ...newBudgetGoal, monthlyLimit: Number(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cảnh báo khi sử dụng {newBudgetGoal.alertThreshold}%
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    value={newBudgetGoal.alertThreshold}
                    onChange={(e) => setNewBudgetGoal({ ...newBudgetGoal, alertThreshold: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </div>
            )}

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowAddGoal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={goalType === 'financial' ? handleAddFinancialGoal : handleAddBudgetGoal}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Thêm
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};