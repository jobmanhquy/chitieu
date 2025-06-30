export interface AIInsight {
  id: string;
  type: 'spending_pattern' | 'budget_alert' | 'category_analysis' | 'prediction' | 'recommendation';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  category?: string;
  amount?: number;
  confidence: number;
  createdAt: Date;
  actionable: boolean;
  action?: string;
}

export interface SpendingPattern {
  category: string;
  trend: 'increasing' | 'decreasing' | 'stable';
  changePercentage: number;
  averageAmount: number;
  frequency: number;
  prediction: {
    nextMonth: number;
    confidence: number;
  };
}

export interface BudgetRecommendation {
  category: string;
  currentSpending: number;
  recommendedBudget: number;
  reasoning: string;
  potentialSavings: number;
}

export interface AIAnalysisResult {
  insights: AIInsight[];
  patterns: SpendingPattern[];
  recommendations: BudgetRecommendation[];
  monthlyPrediction: {
    totalAmount: number;
    confidence: number;
    breakdown: { category: string; amount: number }[];
  };
  riskFactors: {
    overspending: boolean;
    unusualPatterns: string[];
    budgetExceeded: string[];
  };
}