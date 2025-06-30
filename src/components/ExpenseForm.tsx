import React, { useState, useEffect } from 'react';
import { Plus, X, Camera, Mic, MapPin } from 'lucide-react';
import { defaultCategories } from '../data/categories';
import { formatCurrency } from '../utils/currency';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';

interface ExpenseFormProps {
  onSubmit: (expense: {
    amount: number;
    description: string;
    category: string;
    date: Date;
    location?: string;
    notes?: string;
  }) => void;
  onCancel: () => void;
  isOpen: boolean;
  editingExpense?: any;
}

interface FormData {
  amount: string;
  description: string;
  category: string;
  date: string;
  location?: string;
  notes?: string;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ 
  onSubmit, 
  onCancel, 
  isOpen, 
  editingExpense 
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<string>('');
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm<FormData>({
    defaultValues: {
      amount: '',
      description: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
      location: '',
      notes: ''
    }
  });

  const amount = watch('amount');

  // Load editing data
  useEffect(() => {
    if (editingExpense) {
      setValue('amount', editingExpense.amount.toString());
      setValue('description', editingExpense.description);
      setValue('category', editingExpense.category);
      setValue('date', editingExpense.date.toISOString().split('T')[0]);
      setValue('location', editingExpense.location || '');
      setValue('notes', editingExpense.notes || '');
    } else {
      reset();
    }
  }, [editingExpense, setValue, reset]);

  // Get current location
  useEffect(() => {
    if (isOpen && !editingExpense) {
      getCurrentLocation();
    }
  }, [isOpen, editingExpense]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            // In a real app, you would use a geocoding service
            // For demo, we'll just show coordinates
            const { latitude, longitude } = position.coords;
            const locationString = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
            setCurrentLocation(locationString);
            setValue('location', locationString);
          } catch (error) {
            console.error('Error getting location name:', error);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  const handleFormSubmit = (data: FormData) => {
    const numericAmount = parseFloat(data.amount.replace(/[^\d]/g, ''));
    
    onSubmit({
      amount: numericAmount,
      description: data.description,
      category: data.category,
      date: new Date(data.date),
      location: data.location,
      notes: data.notes
    });

    if (!editingExpense) {
      reset();
    }
  };

  const handleAmountChange = (value: string) => {
    const numericValue = value.replace(/[^\d]/g, '');
    if (numericValue) {
      const formatted = formatCurrency(parseInt(numericValue));
      setValue('amount', formatted);
    } else {
      setValue('amount', '');
    }
  };

  const startVoiceRecording = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.lang = 'vi-VN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setValue('description', transcript);
        setIsRecording(false);
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {editingExpense ? 'Sửa chi tiêu' : 'Thêm chi tiêu'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Amount */}
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-semibold"
              placeholder="0 ₫"
            />
            {errors.amount && (
              <p className="text-red-500 text-sm mt-1">{errors.amount.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả *
            </label>
            <div className="relative">
              <input
                type="text"
                {...register('description', {
                  required: 'Vui lòng nhập mô tả'
                })}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập mô tả chi tiêu"
              />
              <button
                type="button"
                onClick={startVoiceRecording}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-full transition-colors ${
                  isRecording ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600'
                }`}
              >
                <Mic className={`w-4 h-4 ${isRecording ? 'animate-pulse' : ''}`} />
              </button>
            </div>
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
            )}
            {isRecording && (
              <p className="text-blue-600 text-sm mt-1">Đang nghe... Hãy nói mô tả chi tiêu</p>
            )}
          </div>

          {/* Category */}
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

          {/* Date */}
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

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vị trí
            </label>
            <div className="relative">
              <input
                type="text"
                {...register('location')}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập hoặc lấy vị trí hiện tại"
              />
              <button
                type="button"
                onClick={getCurrentLocation}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600 transition-colors"
              >
                <MapPin className="w-4 h-4" />
              </button>
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
              onClick={onCancel}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>{editingExpense ? 'Cập nhật' : 'Thêm'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};