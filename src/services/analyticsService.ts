import { Expense } from '../types/expense';
import { ExpenseAnalytics, CategorySpending, TrendData, MonthlyComparison, WeekdayAnalysis, SeasonalData } from '../types/analytics';
import { startOfMonth, endOfMonth, format, getMonth, getDay, subMonths, isSameMonth, differenceInDays } from 'date-fns';
import { vi } from 'date-fns/locale';

export class AnalyticsService {
  private static instance: AnalyticsService;
  
  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  generateAnalytics(expenses: Expense[]): ExpenseAnalytics {
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const averageDaily = this.calculateDailyAverage(expenses);
    const averageMonthly = this.calculateMonthlyAverage(expenses);
    
    return {
      totalExpenses,
      averageDaily,
      averageMonthly,
      topCategories: this.getTopCategories(expenses),
      spendingTrends: this.getSpendingTrends(expenses),
      monthlyComparison: this.getMonthlyComparison(expenses),
      weekdayVsWeekend: this.getWeekdayAnalysis(expenses),
      seasonalPatterns: this.getSeasonalPatterns(expenses)
    };
  }

  private calculateDailyAverage(expenses: Expense[]): number {
    if (expenses.length === 0) return 0;
    
    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const oldestDate = Math.min(...expenses.map(exp => exp.date.getTime()));
    const days = differenceInDays(new Date(), new Date(oldestDate)) + 1;
    
    return total / days;
  }

  private calculateMonthlyAverage(expenses: Expense[]): number {
    if (expenses.length === 0) return 0;
    
    const monthlyTotals = this.groupByMonth(expenses);
    const totals = Object.values(monthlyTotals).map(monthExpenses => 
      monthExpenses.reduce((sum, exp) => sum + exp.amount, 0)
    );
    
    return totals.reduce((sum, total) => sum + total, 0) / totals.length;
  }

  private getTopCategories(expenses: Expense[]): CategorySpending[] {
    const categoryMap = new Map<string, {
      amount: number;
      count: number;
      transactions: Expense[];
    }>();

    expenses.forEach(expense => {
      const existing = categoryMap.get(expense.category);
      if (existing) {
        existing.amount += expense.amount;
        existing.count += 1;
        existing.transactions.push(expense);
      } else {
        categoryMap.set(expense.category, {
          amount: expense.amount,
          count: 1,
          transactions: [expense]
        });
      }
    });

    const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    return Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category,
        amount: data.amount,
        percentage: (data.amount / totalAmount) * 100,
        transactionCount: data.count,
        averageTransaction: data.amount / data.count,
        trend: this.calculateCategoryTrend(data.transactions),
        trendPercentage: this.calculateCategoryTrendPercentage(data.transactions)
      }))
      .sort((a, b) => b.amount - a.amount);
  }

  private calculateCategoryTrend(transactions: Expense[]): 'up' | 'down' | 'stable' {
    if (transactions.length < 2) return 'stable';
    
    const now = new Date();
    const currentMonth = transactions.filter(t => isSameMonth(t.date, now));
    const previousMonth = transactions.filter(t => isSameMonth(t.date, subMonths(now, 1)));
    
    const currentTotal = currentMonth.reduce((sum, t) => sum + t.amount, 0);
    const previousTotal = previousMonth.reduce((sum, t) => sum + t.amount, 0);
    
    if (previousTotal === 0) return 'stable';
    
    const change = (currentTotal - previousTotal) / previousTotal;
    
    if (change > 0.1) return 'up';
    if (change < -0.1) return 'down';
    return 'stable';
  }

  private calculateCategoryTrendPercentage(transactions: Expense[]): number {
    if (transactions.length < 2) return 0;
    
    const now = new Date();
    const currentMonth = transactions.filter(t => isSameMonth(t.date, now));
    const previousMonth = transactions.filter(t => isSameMonth(t.date, subMonths(now, 1)));
    
    const currentTotal = currentMonth.reduce((sum, t) => sum + t.amount, 0);
    const previousTotal = previousMonth.reduce((sum, t) => sum + t.amount, 0);
    
    if (previousTotal === 0) return 0;
    
    return ((currentTotal - previousTotal) / previousTotal) * 100;
  }

  private getSpendingTrends(expenses: Expense[]): TrendData[] {
    const monthlyData = this.groupByMonth(expenses);
    const sortedMonths = Object.keys(monthlyData).sort();
    
    return sortedMonths.map((month, index) => {
      const currentAmount = monthlyData[month].reduce((sum, exp) => sum + exp.amount, 0);
      const previousAmount = index > 0 
        ? monthlyData[sortedMonths[index - 1]].reduce((sum, exp) => sum + exp.amount, 0)
        : 0;
      
      const change = currentAmount - previousAmount;
      const changePercentage = previousAmount > 0 ? (change / previousAmount) * 100 : 0;
      
      return {
        period: month,
        amount: currentAmount,
        change,
        changePercentage
      };
    });
  }

  private getMonthlyComparison(expenses: Expense[]): MonthlyComparison[] {
    const now = new Date();
    const currentYear = now.getFullYear();
    const previousYear = currentYear - 1;
    
    const months = [];
    for (let i = 0; i < 12; i++) {
      const month = new Date(currentYear, i, 1);
      const monthKey = format(month, 'MMM', { locale: vi });
      
      const currentYearExpenses = expenses.filter(exp => 
        exp.date.getFullYear() === currentYear && exp.date.getMonth() === i
      );
      
      const previousYearExpenses = expenses.filter(exp => 
        exp.date.getFullYear() === previousYear && exp.date.getMonth() === i
      );
      
      const currentYearTotal = currentYearExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      const previousYearTotal = previousYearExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      
      const change = currentYearTotal - previousYearTotal;
      const changePercentage = previousYearTotal > 0 ? (change / previousYearTotal) * 100 : 0;
      
      months.push({
        month: monthKey,
        currentYear: currentYearTotal,
        previousYear: previousYearTotal,
        change,
        changePercentage
      });
    }
    
    return months;
  }

  private getWeekdayAnalysis(expenses: Expense[]): WeekdayAnalysis {
    const weekdayExpenses = expenses.filter(exp => {
      const day = getDay(exp.date);
      return day >= 1 && day <= 5; // Monday to Friday
    });
    
    const weekendExpenses = expenses.filter(exp => {
      const day = getDay(exp.date);
      return day === 0 || day === 6; // Saturday and Sunday
    });
    
    const weekdayTotal = weekdayExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const weekendTotal = weekendExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    
    const weekdayAverage = weekdayExpenses.length > 0 ? weekdayTotal / weekdayExpenses.length : 0;
    const weekendAverage = weekendExpenses.length > 0 ? weekendTotal / weekendExpenses.length : 0;
    
    const difference = weekendAverage - weekdayAverage;
    const differencePercentage = weekdayAverage > 0 ? (difference / weekdayAverage) * 100 : 0;
    
    return {
      weekdays: {
        average: weekdayAverage,
        total: weekdayTotal,
        count: weekdayExpenses.length
      },
      weekends: {
        average: weekendAverage,
        total: weekendTotal,
        count: weekendExpenses.length
      },
      difference,
      differencePercentage
    };
  }

  private getSeasonalPatterns(expenses: Expense[]): SeasonalData[] {
    const seasons = {
      spring: [2, 3, 4], // March, April, May
      summer: [5, 6, 7], // June, July, August
      fall: [8, 9, 10],  // September, October, November
      winter: [11, 0, 1] // December, January, February
    };
    
    return Object.entries(seasons).map(([season, months]) => {
      const seasonExpenses = expenses.filter(exp => 
        months.includes(exp.date.getMonth())
      );
      
      const average = seasonExpenses.length > 0 
        ? seasonExpenses.reduce((sum, exp) => sum + exp.amount, 0) / seasonExpenses.length
        : 0;
      
      const categories = this.getTopCategories(seasonExpenses).slice(0, 5);
      
      return {
        season: season as 'spring' | 'summer' | 'fall' | 'winter',
        average,
        categories
      };
    });
  }

  private groupByMonth(expenses: Expense[]): Record<string, Expense[]> {
    return expenses.reduce((acc, expense) => {
      const monthKey = format(expense.date, 'yyyy-MM');
      if (!acc[monthKey]) {
        acc[monthKey] = [];
      }
      acc[monthKey].push(expense);
      return acc;
    }, {} as Record<string, Expense[]>);
  }
}