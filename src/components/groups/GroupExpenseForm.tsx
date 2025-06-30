import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Users, DollarSign, Calendar, Tag } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { defaultCategories } from '../../data/categories';
import { formatCurrency } from '../../utils/currency';
import { Group } from '../../services/groupService';

interface GroupExpenseFormProps {
  isOpen: boolean;
  onClose: () => void;
  group: Group;
  onSubmit: (expense: GroupExpenseData) => void;
}

interface GroupExpenseData {
  amount: number;
  description: string;
  category: string;
  date: Date;
  paidBy: string;
  splitMethod: 'equal' | 'percentage' | 'amount';
  splits: Array<{
    userId: string;
    amount?: number;
    percentage?: number;
  }>;
  notes?: string;
}

interface FormData {
  amount: string;
  description: string;
  category: string;
  date: string;
  paidBy: string;
  splitMethod: 'equal' | 'percentage' | 'amount';
  notes?: string;
}

export const GroupExpenseForm: React.FC<GroupExpenseFormProps> = ({
  isOpen,
  onClose,
  group,
  onSubmit
}) => {
  const [splitMethod, setSplitMethod] = useState<'equal' | 'percentage' | 'amount'>('equal');
  const [splits, setSplits] = useState<Array<{
    userId: string;
    amount?: number;
    percentage?: number;
    selected: boolean;
  }>>(
    group.members.map(member => ({
      userId: member.userId,
      selected: true,
      amount: 0,
      percentage: 0
    }))
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<FormData>({
    defaultValues: {
      amount: '',
      description: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
      paidBy: '',
      splitMethod: 'equal',
      notes: ''
    }
  });

  const amount = watch('amount');
  const selectedMembers = splits.filter(s => s.selected);

  const handleAmountChange = (value: string) => {
    const numericValue = value.replace(/[^\d]/g, '');
    if (numericValue && splitMethod === 'equal') {
      const totalAmount = parseInt(numericValue);
      const perPerson = Math.floor(totalAmount / selectedMembers.length);
      
      setSplits(prev => prev.map(split => ({
        ...split,
        amount: split.selected ? perPerson : 0
      })));
    }
  };

  const handleSplitMethodChange = (method: 'equal' | 'percentage' | 'amount') => {
    setSplitMethod(method);
    const totalAmount = parseInt(amount?.replace(/[^\d]/g, '') || '0');
    
    if (method === 'equal' && totalAmount > 0) {
      const perPerson = Math.floor(totalAmount / selectedMembers.length);
      setSplits(prev => prev.map(split => ({
        ...split,
        amount: split.selected ? perPerson : 0,
        percentage: split.selected ? Math.floor(100 / selectedMembers.length) : 0
      })));
    } else if (method === 'percentage') {
      const perPersonPercentage = Math.floor(100 / selectedMembers.length);
      setSplits(prev => prev.map(split => ({
        ...split,
        percentage: split.selected ? perPersonPercentage : 0,
        amount: split.selected ? Math.floor(totalAmount * perPersonPercentage / 100) : 0
      })));
    }
  };

  const handleMemberToggle = (userId: string) => {
    setSplits(prev => prev.map(split => 
      split.userId === userId 
        ? { ...split, selected: !split.selected }
        : split
    ));
  };

  const handleSplitValueChange = (userId: string, value: number, type: 'amount' | 'percentage') => {
    setSplits(prev => prev.map(split => 
      split.userId === userId 
        ? { ...split, [type]: value }
        : split
    ));
  };

  const getTotalSplit = () => {
    if (splitMethod === 'percentage') {
      return splits.reduce((sum, split) => sum + (split.percentage || 0), 0);
    }
    return splits.reduce((sum, split) => sum + (split.amount || 0), 0);
  };

  const onFormSubmit = (data: FormData) => {
    const numericAmount = parseFloat(data.amount.replace(/[^\d]/g, ''));
    
    const expenseData: GroupExpenseData = {
      amount: numericAmount,
      description: data.description,
      category: data.category,
      date: new Date(data.date),
      paidBy: data.paidBy,
      splitMethod,
      splits: splits.filter(s => s.selected).map(s => ({
        userId: s.userId,
        amount: s.amount,
        percentage: s.percentage
      })),
      notes: data.notes
    };

    onSubmit(expenseData);
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Thêm chi tiêu nhóm</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số tiền *
              </label>
              <input
                type="text"
                {...register('amount', {
                  required: 'Vui lòng nhập số tiền',
                  validate: (value) => {
                    const numericValue = parseFloat(value.replace(/[^\d]/g, ''));
                    return numericValue > 0 || 'Số tiền phải lớn hơn 0';
                  }
                })}
                onChange={(e) => handleAmountChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0 ₫"
              />
              {errors.amount && (
                <p className="text-red-500 text-sm mt-1">{errors.amount.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Người trả *
              </label>
              <select
                {...register('paidBy', {
                  required: 'Vui lòng chọn người trả'
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Chọn người trả</option>
                {group.members.map((member) => (
                  <option key={member.userId} value={member.userId}>
                    {member.displayName || member.email}
                  </option>
                ))}
              </select>
              {errors.paidBy && (
                <p className="text-red-500 text-sm mt-1">{errors.paidBy.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả *
            </label>
            <input
              type="text"
              {...register('description', {
                required: 'Vui lòng nhập mô tả'
              })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nhập mô tả chi tiêu"
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Danh mục *
              </label>
              <select
                {...register('category', {
                  required: 'Vui lòng chọn danh mục'
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Chọn danh mục</option>
                {defaultCategories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày *
              </label>
              <input
                type="date"
                {...register('date', {
                  required: 'Vui lòng chọn ngày'
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.date && (
                <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>
              )}
            </div>
          </div>

          {/* Split Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Cách chia chi tiêu
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'equal', label: 'Chia đều', icon: Users },
                { value: 'percentage', label: 'Theo %', icon: DollarSign },
                { value: 'amount', label: 'Số tiền', icon: Tag }
              ].map((method) => {
                const Icon = method.icon;
                return (
                  <button
                    key={method.value}
                    type="button"
                    onClick={() => handleSplitMethodChange(method.value as any)}
                    className={`p-3 border-2 rounded-lg flex flex-col items-center space-y-1 transition-colors ${
                      splitMethod === method.value 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{method.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Member Splits */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Chia cho thành viên
            </label>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {splits.map((split) => {
                const member = group.members.find(m => m.userId === split.userId);
                if (!member) return null;

                return (
                  <div key={split.userId} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      checked={split.selected}
                      onChange={() => handleMemberToggle(split.userId)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {member.displayName || member.email}
                      </p>
                    </div>

                    {split.selected && (
                      <div className="flex items-center space-x-2">
                        {splitMethod === 'percentage' ? (
                          <div className="flex items-center space-x-1">
                            <input
                              type="number"
                              value={split.percentage || 0}
                              onChange={(e) => handleSplitValueChange(split.userId, Number(e.target.value), 'percentage')}
                              className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                              min="0"
                              max="100"
                            />
                            <span className="text-sm text-gray-600">%</span>
                          </div>
                        ) : splitMethod === 'amount' ? (
                          <div className="flex items-center space-x-1">
                            <input
                              type="number"
                              value={split.amount || 0}
                              onChange={(e) => handleSplitValueChange(split.userId, Number(e.target.value), 'amount')}
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                              min="0"
                            />
                            <span className="text-sm text-gray-600">₫</span>
                          </div>
                        ) : (
                          <span className="text-sm font-medium text-gray-900">
                            {formatCurrency(split.amount || 0)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Split Summary */}
            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-blue-800">
                  Tổng {splitMethod === 'percentage' ? 'phần trăm' : 'số tiền'}:
                </span>
                <span className="font-medium text-blue-900">
                  {splitMethod === 'percentage' 
                    ? `${getTotalSplit()}%` 
                    : formatCurrency(getTotalSplit())
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ghi chú
            </label>
            <textarea
              {...register('notes')}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Thêm ghi chú (tùy chọn)"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm chi tiêu</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};