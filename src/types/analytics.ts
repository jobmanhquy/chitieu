export interface ExpenseAnalytics {
  totalExpenses: number;
  averageDaily: number;
  averageMonthly: number;
  topCategories: CategorySpending[];
  spendingTrends: TrendData[];
  monthlyComparison: MonthlyComparison[];
  weekdayVsWeekend: WeekdayAnalysis;
  seasonalPatterns: SeasonalData[];
}

export interface CategorySpending {
  category: string;
  amount: number;
  percentage: number;
  transactionCount: number;
  averageTransaction: number;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
}

export interface TrendData {
  period: string;
  amount: number;
  change: number;
  changePercentage: number;
}

export interface MonthlyComparison {
  month: string;
  currentYear: number;
  previousYear: number;
  change: number;
  changePercentage: number;
}

export interface WeekdayAnalysis {
  weekdays: {
    average: number;
    total: number;
    count: number;
  };
  weekends: {
    average: number;
    total: number;
    count: number;
  };
  difference: number;
  differencePercentage: number;
}

export interface SeasonalData {
  season: 'spring' | 'summer' | 'fall' | 'winter';
  average: number;
  categories: CategorySpending[];
}

export interface CashFlowData {
  date: Date;
  income: number;
  expenses: number;
  balance: number;
  runningBalance: number;
}