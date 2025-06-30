import { Category } from '../types/expense';

export const defaultCategories: Category[] = [
  { id: '1', name: 'Ăn uống', color: '#EF4444', icon: 'Utensils' },
  { id: '2', name: 'Đi lại', color: '#3B82F6', icon: 'Car' },
  { id: '3', name: 'Mua sắm', color: '#8B5CF6', icon: 'ShoppingBag' },
  { id: '4', name: 'Giải trí', color: '#F59E0B', icon: 'GameController2' },
  { id: '5', name: 'Y tế', color: '#10B981', icon: 'Heart' },
  { id: '6', name: 'Giáo dục', color: '#6B7280', icon: 'BookOpen' },
  { id: '7', name: 'Hóa đơn', color: '#DC2626', icon: 'Receipt' },
  { id: '8', name: 'Khác', color: '#9CA3AF', icon: 'MoreHorizontal' }
];

export const getCategoryById = (id: string): Category | undefined => {
  return defaultCategories.find(cat => cat.id === id);
};

export const getCategoryColor = (categoryName: string): string => {
  const category = defaultCategories.find(cat => cat.name === categoryName);
  return category?.color || '#9CA3AF';
};