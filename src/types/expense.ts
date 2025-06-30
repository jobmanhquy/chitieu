export interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface MonthlyData {
  month: string;
  total: number;
  expenses: Expense[];
}

export interface CategoryData {
  category: string;
  amount: number;
  color: string;
  count: number;
}