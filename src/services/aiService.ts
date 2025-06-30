import { Expense } from '../types/expense';
import { AIAnalysisResult, AIInsight, SpendingPattern, BudgetRecommendation } from '../types/ai';
import { startOfMonth, endOfMonth, subMonths, format, differenceInDays } from 'date-fns';
import { vi } from 'date-fns/locale';

export class AIAnalysisService {
  private static instance: AIAnalysisService;
  
  public static getInstance(): AIAnalysisService {
    if (!AIAnalysisService.instance) {
      AIAnalysisService.instance = new AIAnalysisService();
    }
    return AIAnalysisService.instance;
  }

  async analyzeExpenses(expenses: Expense[]): Promise<AIAnalysisResult> {
    try {
      // Prepare data for AI analysis
      const analysisData = this.prepareAnalysisData(expenses);
      
      // Generate insights using pattern recognition
      const insights = await this.generateInsights(expenses);
      const patterns = this.analyzeSpendingPatterns(expenses);
      const recommendations = this.generateRecommendations(expenses);
      const monthlyPrediction = this.predictMonthlySpending(expenses);
      const riskFactors = this.assessRiskFactors(expenses);

      return {
        insights,
        patterns,
        recommendations,
        monthlyPrediction,
        riskFactors
      };
    } catch (error) {
      console.error('AI Analysis Error:', error);
      return this.getFallbackAnalysis(expenses);
    }
  }

  private prepareAnalysisData(expenses: Expense[]) {
    const now = new Date();
    const last3Months = expenses.filter(expense => 
      expense.date >= subMonths(now, 3)
    );

    // Group by category and month
    const categoryData = this.groupByCategory(last3Months);
    const monthlyData = this.groupByMonth(last3Months);
    
    return {
      totalExpenses: expenses.length,
      totalAmount: expenses.reduce((sum, exp) => sum + exp.amount, 0),
      categories: categoryData,
      monthlyTrends: monthlyData,
      averageDaily: this.calculateDailyAverage(expenses),
      timeRange: {
        start: expenses.length > 0 ? Math.min(...expenses.map(e => e.date.getTime())) : 0,
        end: now.getTime()
      }
    };
  }

  private async generateInsights(expenses: Expense[]): Promise<AIInsight[]> {
    const insights: AIInsight[] = [];
    const now = new Date();

    // Spending spike detection
    const recentSpending = this.getRecentSpending(expenses, 7);
    const averageWeekly = this.getAverageWeeklySpending(expenses);
    
    if (recentSpending > averageWeekly * 1.5) {
      insights.push({
        id: `spike_${Date.now()}`,
        type: 'spending_pattern',
        title: 'Chi tiêu tăng đột biến',
        description: `Chi tiêu tuần này cao hơn ${((recentSpending / averageWeekly - 1) * 100).toFixed(0)}% so với trung bình`,
        severity: 'high',
        confidence: 0.85,
        createdAt: now,
        actionable: true,
        action: 'Xem xét lại các khoản chi không cần thiết'
      });
    }

    // Category analysis
    const categoryInsights = this.analyzeCategoryTrends(expenses);
    insights.push(...categoryInsights);

    // Budget alerts
    const budgetAlerts = this.generateBudgetAlerts(expenses);
    insights.push(...budgetAlerts);

    // Unusual patterns
    const unusualPatterns = this.detectUnusualPatterns(expenses);
    insights.push(...unusualPatterns);

    return insights.sort((a, b) => b.confidence - a.confidence);
  }

  private analyzeSpendingPatterns(expenses: Expense[]): SpendingPattern[] {
    const categories = [...new Set(expenses.map(e => e.category))];
    
    return categories.map(category => {
      const categoryExpenses = expenses.filter(e => e.category === category);
      const monthlyAmounts = this.getMonthlyAmounts(categoryExpenses);
      
      const trend = this.calculateTrend(monthlyAmounts);
      const averageAmount = categoryExpenses.reduce((sum, e) => sum + e.amount, 0) / categoryExpenses.length;
      
      return {
        category,
        trend: trend.direction,
        changePercentage: trend.percentage,
        averageAmount,
        frequency: categoryExpenses.length,
        prediction: {
          nextMonth: this.predictCategorySpending(categoryExpenses),
          confidence: 0.75
        }
      };
    });
  }

  private generateRecommendations(expenses: Expense[]): BudgetRecommendation[] {
    const categories = [...new Set(expenses.map(e => e.category))];
    
    return categories.map(category => {
      const categoryExpenses = expenses.filter(e => e.category === category);
      const currentSpending = this.getCurrentMonthSpending(categoryExpenses);
      const averageSpending = this.getAverageMonthlySpending(categoryExpenses);
      
      const recommendedBudget = Math.ceil(averageSpending * 1.1); // 10% buffer
      const potentialSavings = Math.max(0, currentSpending - recommendedBudget);
      
      return {
        category,
        currentSpending,
        recommendedBudget,
        reasoning: this.generateRecommendationReasoning(category, currentSpending, averageSpending),
        potentialSavings
      };
    });
  }

  private predictMonthlySpending(expenses: Expense[]) {
    const now = new Date();
    const currentMonthExpenses = expenses.filter(e => 
      e.date >= startOfMonth(now) && e.date <= endOfMonth(now)
    );
    
    const daysInMonth = endOfMonth(now).getDate();
    const daysPassed = now.getDate();
    const currentTotal = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
    
    // Simple linear projection
    const dailyAverage = currentTotal / daysPassed;
    const projectedTotal = dailyAverage * daysInMonth;
    
    // Category breakdown prediction
    const categories = [...new Set(expenses.map(e => e.category))];
    const breakdown = categories.map(category => {
      const categoryExpenses = currentMonthExpenses.filter(e => e.category === category);
      const categoryTotal = categoryExpenses.reduce((sum, e) => sum + e.amount, 0);
      const categoryDaily = categoryTotal / daysPassed;
      
      return {
        category,
        amount: Math.round(categoryDaily * daysInMonth)
      };
    });

    return {
      totalAmount: Math.round(projectedTotal),
      confidence: Math.min(0.9, daysPassed / daysInMonth),
      breakdown
    };
  }

  private assessRiskFactors(expenses: Expense[]) {
    const now = new Date();
    const currentMonth = expenses.filter(e => 
      e.date >= startOfMonth(now) && e.date <= endOfMonth(now)
    );
    
    const previousMonth = expenses.filter(e => {
      const prevMonth = subMonths(now, 1);
      return e.date >= startOfMonth(prevMonth) && e.date <= endOfMonth(prevMonth);
    });

    const currentTotal = currentMonth.reduce((sum, e) => sum + e.amount, 0);
    const previousTotal = previousMonth.reduce((sum, e) => sum + e.amount, 0);
    
    const overspending = currentTotal > previousTotal * 1.3;
    const unusualPatterns: string[] = [];
    const budgetExceeded: string[] = [];

    // Detect unusual patterns
    if (currentTotal > previousTotal * 2) {
      unusualPatterns.push('Chi tiêu tháng này gấp đôi tháng trước');
    }

    // Check for large single transactions
    const largeTransactions = currentMonth.filter(e => e.amount > currentTotal * 0.3);
    if (largeTransactions.length > 0) {
      unusualPatterns.push(`Có ${largeTransactions.length} giao dịch lớn bất thường`);
    }

    return {
      overspending,
      unusualPatterns,
      budgetExceeded
    };
  }

  // Helper methods
  private groupByCategory(expenses: Expense[]) {
    return expenses.reduce((acc, expense) => {
      if (!acc[expense.category]) {
        acc[expense.category] = [];
      }
      acc[expense.category].push(expense);
      return acc;
    }, {} as Record<string, Expense[]>);
  }

  private groupByMonth(expenses: Expense[]) {
    return expenses.reduce((acc, expense) => {
      const monthKey = format(expense.date, 'yyyy-MM');
      if (!acc[monthKey]) {
        acc[monthKey] = [];
      }
      acc[monthKey].push(expense);
      return acc;
    }, {} as Record<string, Expense[]>);
  }

  private calculateDailyAverage(expenses: Expense[]): number {
    if (expenses.length === 0) return 0;
    
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    const oldestDate = Math.min(...expenses.map(e => e.date.getTime()));
    const days = differenceInDays(new Date(), new Date(oldestDate)) + 1;
    
    return total / days;
  }

  private getRecentSpending(expenses: Expense[], days: number): number {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    
    return expenses
      .filter(e => e.date >= cutoff)
      .reduce((sum, e) => sum + e.amount, 0);
  }

  private getAverageWeeklySpending(expenses: Expense[]): number {
    const weeks = Math.ceil(expenses.length / 7);
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    return total / Math.max(weeks, 1);
  }

  private analyzeCategoryTrends(expenses: Expense[]): AIInsight[] {
    const insights: AIInsight[] = [];
    const categories = [...new Set(expenses.map(e => e.category))];
    
    categories.forEach(category => {
      const categoryExpenses = expenses.filter(e => e.category === category);
      const recentAmount = this.getRecentCategorySpending(categoryExpenses, 30);
      const averageAmount = this.getAverageCategorySpending(categoryExpenses);
      
      if (recentAmount > averageAmount * 1.4) {
        insights.push({
          id: `category_${category}_${Date.now()}`,
          type: 'category_analysis',
          title: `Chi tiêu ${category} tăng cao`,
          description: `Chi tiêu cho ${category} trong 30 ngày qua cao hơn ${((recentAmount / averageAmount - 1) * 100).toFixed(0)}% so với trung bình`,
          severity: 'medium',
          category,
          amount: recentAmount,
          confidence: 0.8,
          createdAt: new Date(),
          actionable: true,
          action: `Xem xét tối ưu chi tiêu cho ${category}`
        });
      }
    });
    
    return insights;
  }

  private generateBudgetAlerts(expenses: Expense[]): AIInsight[] {
    // This would integrate with user-defined budgets
    // For now, we'll use intelligent budget estimation
    return [];
  }

  private detectUnusualPatterns(expenses: Expense[]): AIInsight[] {
    const insights: AIInsight[] = [];
    
    // Detect weekend vs weekday spending patterns
    const weekendSpending = expenses.filter(e => {
      const day = e.date.getDay();
      return day === 0 || day === 6;
    });
    
    const weekdaySpending = expenses.filter(e => {
      const day = e.date.getDay();
      return day >= 1 && day <= 5;
    });
    
    const weekendAvg = weekendSpending.reduce((sum, e) => sum + e.amount, 0) / weekendSpending.length;
    const weekdayAvg = weekdaySpending.reduce((sum, e) => sum + e.amount, 0) / weekdaySpending.length;
    
    if (weekendAvg > weekdayAvg * 1.5) {
      insights.push({
        id: `weekend_pattern_${Date.now()}`,
        type: 'spending_pattern',
        title: 'Chi tiêu cuối tuần cao',
        description: `Chi tiêu cuối tuần trung bình cao hơn ${((weekendAvg / weekdayAvg - 1) * 100).toFixed(0)}% so với ngày thường`,
        severity: 'low',
        confidence: 0.7,
        createdAt: new Date(),
        actionable: true,
        action: 'Lập kế hoạch chi tiêu cuối tuần'
      });
    }
    
    return insights;
  }

  private getMonthlyAmounts(expenses: Expense[]): number[] {
    const monthlyData = this.groupByMonth(expenses);
    return Object.values(monthlyData).map(monthExpenses => 
      monthExpenses.reduce((sum, e) => sum + e.amount, 0)
    );
  }

  private calculateTrend(amounts: number[]): { direction: 'increasing' | 'decreasing' | 'stable'; percentage: number } {
    if (amounts.length < 2) return { direction: 'stable', percentage: 0 };
    
    const recent = amounts.slice(-2);
    const change = (recent[1] - recent[0]) / recent[0];
    
    if (Math.abs(change) < 0.1) return { direction: 'stable', percentage: change * 100 };
    return { 
      direction: change > 0 ? 'increasing' : 'decreasing', 
      percentage: Math.abs(change * 100) 
    };
  }

  private predictCategorySpending(expenses: Expense[]): number {
    const monthlyAmounts = this.getMonthlyAmounts(expenses);
    if (monthlyAmounts.length === 0) return 0;
    
    // Simple moving average prediction
    const recentMonths = monthlyAmounts.slice(-3);
    return recentMonths.reduce((sum, amount) => sum + amount, 0) / recentMonths.length;
  }

  private getCurrentMonthSpending(expenses: Expense[]): number {
    const now = new Date();
    return expenses
      .filter(e => e.date >= startOfMonth(now) && e.date <= endOfMonth(now))
      .reduce((sum, e) => sum + e.amount, 0);
  }

  private getAverageMonthlySpending(expenses: Expense[]): number {
    const monthlyAmounts = this.getMonthlyAmounts(expenses);
    return monthlyAmounts.reduce((sum, amount) => sum + amount, 0) / Math.max(monthlyAmounts.length, 1);
  }

  private generateRecommendationReasoning(category: string, current: number, average: number): string {
    if (current > average * 1.2) {
      return `Chi tiêu ${category} hiện tại cao hơn trung bình. Nên giảm bớt để tối ưu ngân sách.`;
    } else if (current < average * 0.8) {
      return `Chi tiêu ${category} thấp hơn trung bình. Có thể tăng ngân sách nếu cần thiết.`;
    }
    return `Chi tiêu ${category} ở mức hợp lý. Duy trì mức chi tiêu hiện tại.`;
  }

  private getRecentCategorySpending(expenses: Expense[], days: number): number {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    
    return expenses
      .filter(e => e.date >= cutoff)
      .reduce((sum, e) => sum + e.amount, 0);
  }

  private getAverageCategorySpending(expenses: Expense[]): number {
    if (expenses.length === 0) return 0;
    return expenses.reduce((sum, e) => sum + e.amount, 0) / expenses.length;
  }

  private getFallbackAnalysis(expenses: Expense[]): AIAnalysisResult {
    return {
      insights: [{
        id: 'fallback',
        type: 'spending_pattern',
        title: 'Phân tích cơ bản',
        description: 'Đang sử dụng phân tích cơ bản do không thể kết nối AI service',
        severity: 'low',
        confidence: 0.5,
        createdAt: new Date(),
        actionable: false
      }],
      patterns: [],
      recommendations: [],
      monthlyPrediction: {
        totalAmount: 0,
        confidence: 0,
        breakdown: []
      },
      riskFactors: {
        overspending: false,
        unusualPatterns: [],
        budgetExceeded: []
      }
    };
  }
}