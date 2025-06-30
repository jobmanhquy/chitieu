export interface FinancialGoal {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  deadline: Date;
  category: 'savings' | 'debt' | 'investment' | 'purchase';
  priority: 'low' | 'medium' | 'high';
  status: 'active' | 'completed' | 'paused';
  createdAt: Date;
  updatedAt: Date;
}

export interface BudgetGoal {
  id: string;
  category: string;
  monthlyLimit: number;
  currentSpent: number;
  alertThreshold: number; // percentage (e.g., 80 for 80%)
  isActive: boolean;
  createdAt: Date;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: 'streak' | 'savings' | 'budget' | 'category' | 'milestone';
  requirement: number;
  progress: number;
  isUnlocked: boolean;
  unlockedAt?: Date;
  reward?: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'no_spend' | 'budget_limit' | 'savings_target' | 'category_reduction';
  duration: number; // days
  targetValue: number;
  currentProgress: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  participants?: number;
  reward: string;
}