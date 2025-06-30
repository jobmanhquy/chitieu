import { GoogleGenerativeAI } from '@google/generative-ai';
import { Expense } from '../types/expense';
import { AIAnalysisResult, AIInsight, SpendingPattern, BudgetRecommendation } from '../types/ai';
import { startOfMonth, endOfMonth, subMonths, format, differenceInDays } from 'date-fns';
import { vi } from 'date-fns/locale';

export class GeminiAIService {
  private static instance: GeminiAIService;
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;
  private isAvailable: boolean = false;

  private constructor() {
    // Get API key from environment variables
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey || apiKey === 'AIzaSyAy1seVRiDSIn_pXQy1xxDwc5N8puqeK1Y') {
      console.warn('Gemini API key not found or using placeholder key. AI features will use fallback analysis.');
      this.isAvailable = false;
      return;
    }

    try {
      // Initialize Gemini AI
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
      this.isAvailable = true;
    } catch (error) {
      console.error('Failed to initialize Gemini AI service:', error);
      this.isAvailable = false;
    }
  }

  public static getInstance(): GeminiAIService {
    if (!GeminiAIService.instance) {
      GeminiAIService.instance = new GeminiAIService();
    }
    return GeminiAIService.instance;
  }

  async analyzeExpenses(expenses: Expense[]): Promise<AIAnalysisResult> {
    try {
      if (expenses.length === 0) {
        return this.getEmptyAnalysis();
      }

      // If AI service is not available, use fallback analysis
      if (!this.isAvailable || !this.model) {
        console.log('Using fallback analysis - AI service not available');
        return this.getFallbackAnalysis(expenses);
      }

      // Prepare data for AI analysis
      const analysisData = this.prepareExpenseData(expenses);
      
      // Generate AI insights using Gemini with error handling
      const insights = await this.generateAIInsights(analysisData);
      const patterns = await this.analyzeSpendingPatterns(analysisData);
      const recommendations = await this.generateSmartRecommendations(analysisData);
      const monthlyPrediction = await this.predictMonthlySpending(analysisData);
      const riskFactors = await this.assessFinancialRisks(analysisData);

      return {
        insights,
        patterns,
        recommendations,
        monthlyPrediction,
        riskFactors
      };
    } catch (error) {
      console.error('Gemini AI Analysis Error:', error);
      return this.getFallbackAnalysis(expenses);
    }
  }

  private prepareExpenseData(expenses: Expense[]) {
    const now = new Date();
    const last3Months = expenses.filter(expense => 
      expense.date >= subMonths(now, 3)
    );

    // Group by category
    const categoryData = this.groupByCategory(last3Months);
    
    // Group by month
    const monthlyData = this.groupByMonth(last3Months);
    
    // Calculate trends
    const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const averageDaily = this.calculateDailyAverage(expenses);
    const averageMonthly = this.calculateMonthlyAverage(expenses);

    // Analyze spending patterns
    const weekdayVsWeekend = this.analyzeWeekdayVsWeekend(expenses);
    const timeOfDayPatterns = this.analyzeTimePatterns(expenses);
    const seasonalPatterns = this.analyzeSeasonalPatterns(expenses);

    return {
      expenses: last3Months,
      totalAmount,
      averageDaily,
      averageMonthly,
      categoryData,
      monthlyData,
      weekdayVsWeekend,
      timeOfDayPatterns,
      seasonalPatterns,
      expenseCount: expenses.length,
      dateRange: {
        start: expenses.length > 0 ? Math.min(...expenses.map(e => e.date.getTime())) : 0,
        end: now.getTime()
      }
    };
  }

  private async generateAIInsights(data: any): Promise<AIInsight[]> {
    if (!this.isAvailable || !this.model) {
      return this.generateFallbackInsights(data);
    }

    try {
      const prompt = this.buildInsightPrompt(data);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return this.parseAIInsights(text);
    } catch (error) {
      console.error('Error generating AI insights:', error);
      return this.generateFallbackInsights(data);
    }
  }

  private buildInsightPrompt(data: any): string {
    return `
Phân tích dữ liệu chi tiêu sau và đưa ra insights thông minh bằng tiếng Việt:

DỮ LIỆU CHI TIÊU:
- Tổng số giao dịch: ${data.expenseCount}
- Tổng số tiền: ${data.totalAmount.toLocaleString('vi-VN')} VND
- Trung bình hàng ngày: ${data.averageDaily.toLocaleString('vi-VN')} VND
- Trung bình hàng tháng: ${data.averageMonthly.toLocaleString('vi-VN')} VND

PHÂN BỔ THEO DANH MỤC:
${Object.entries(data.categoryData).map(([category, expenses]: [string, any]) => 
  `- ${category}: ${expenses.reduce((sum: number, e: any) => sum + e.amount, 0).toLocaleString('vi-VN')} VND (${expenses.length} giao dịch)`
).join('\n')}

PHÂN TÍCH NGÀY THƯỜNG VS CUỐI TUẦN:
- Ngày thường: ${data.weekdayVsWeekend.weekdays.total.toLocaleString('vi-VN')} VND (${data.weekdayVsWeekend.weekdays.count} giao dịch)
- Cuối tuần: ${data.weekdayVsWeekend.weekends.total.toLocaleString('vi-VN')} VND (${data.weekdayVsWeekend.weekends.count} giao dịch)

Hãy đưa ra 5-7 insights quan trọng nhất về thói quen chi tiêu, bao gồm:
1. Phân tích xu hướng chi tiêu
2. Cảnh báo về các khoản chi bất thường
3. So sánh với thói quen chi tiêu lành mạnh
4. Đề xuất tối ưu hóa ngân sách
5. Dự đoán rủi ro tài chính

Định dạng phản hồi như JSON với cấu trúc:
{
  "insights": [
    {
      "type": "spending_pattern|budget_alert|category_analysis|prediction|recommendation",
      "title": "Tiêu đề insight",
      "description": "Mô tả chi tiết",
      "severity": "low|medium|high",
      "confidence": 0.8,
      "actionable": true,
      "action": "Hành động cụ thể"
    }
  ]
}
`;
  }

  private parseAIInsights(text: string): AIInsight[] {
    try {
      // Extract JSON from AI response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      const insights: AIInsight[] = [];

      if (parsed.insights && Array.isArray(parsed.insights)) {
        parsed.insights.forEach((insight: any, index: number) => {
          insights.push({
            id: `ai_insight_${Date.now()}_${index}`,
            type: insight.type || 'spending_pattern',
            title: insight.title || 'AI Insight',
            description: insight.description || '',
            severity: insight.severity || 'medium',
            confidence: insight.confidence || 0.7,
            createdAt: new Date(),
            actionable: insight.actionable || false,
            action: insight.action
          });
        });
      }

      return insights;
    } catch (error) {
      console.error('Error parsing AI insights:', error);
      return [];
    }
  }

  private async analyzeSpendingPatterns(data: any): Promise<SpendingPattern[]> {
    if (!this.isAvailable || !this.model) {
      return this.generateFallbackPatterns(data);
    }

    try {
      const prompt = `
Phân tích xu hướng chi tiêu theo từng danh mục dựa trên dữ liệu:

${Object.entries(data.categoryData).map(([category, expenses]: [string, any]) => {
  const amounts = expenses.map((e: any) => e.amount);
  const total = amounts.reduce((sum: number, amount: number) => sum + amount, 0);
  const average = total / amounts.length;
  
  return `${category}: Tổng ${total.toLocaleString('vi-VN')} VND, Trung bình ${average.toLocaleString('vi-VN')} VND, ${expenses.length} giao dịch`;
}).join('\n')}

Đưa ra phân tích xu hướng cho từng danh mục (tăng/giảm/ổn định) và dự đoán chi tiêu tháng tới.

Định dạng JSON:
{
  "patterns": [
    {
      "category": "Tên danh mục",
      "trend": "increasing|decreasing|stable",
      "changePercentage": 15.5,
      "averageAmount": 500000,
      "frequency": 10,
      "nextMonthPrediction": 600000,
      "confidence": 0.8
    }
  ]
}
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return this.parseSpendingPatterns(text);
    } catch (error) {
      console.error('Error analyzing spending patterns:', error);
      return this.generateFallbackPatterns(data);
    }
  }

  private parseSpendingPatterns(text: string): SpendingPattern[] {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      const patterns: SpendingPattern[] = [];

      if (parsed.patterns && Array.isArray(parsed.patterns)) {
        parsed.patterns.forEach((pattern: any) => {
          patterns.push({
            category: pattern.category,
            trend: pattern.trend || 'stable',
            changePercentage: pattern.changePercentage || 0,
            averageAmount: pattern.averageAmount || 0,
            frequency: pattern.frequency || 0,
            prediction: {
              nextMonth: pattern.nextMonthPrediction || 0,
              confidence: pattern.confidence || 0.5
            }
          });
        });
      }

      return patterns;
    } catch (error) {
      console.error('Error parsing spending patterns:', error);
      return [];
    }
  }

  private async generateSmartRecommendations(data: any): Promise<BudgetRecommendation[]> {
    if (!this.isAvailable || !this.model) {
      return this.generateFallbackRecommendations(data);
    }

    try {
      const prompt = `
Dựa trên dữ liệu chi tiêu, đưa ra khuyến nghị ngân sách thông minh:

DỮ LIỆU:
${Object.entries(data.categoryData).map(([category, expenses]: [string, any]) => {
  const total = expenses.reduce((sum: number, e: any) => sum + e.amount, 0);
  const average = total / expenses.length;
  return `${category}: ${total.toLocaleString('vi-VN')} VND (TB: ${average.toLocaleString('vi-VN')} VND)`;
}).join('\n')}

Trung bình tháng: ${data.averageMonthly.toLocaleString('vi-VN')} VND

Đưa ra khuyến nghị ngân sách cho từng danh mục, bao gồm:
1. Ngân sách đề xuất
2. Lý do khuyến nghị
3. Tiềm năng tiết kiệm

Định dạng JSON:
{
  "recommendations": [
    {
      "category": "Tên danh mục",
      "currentSpending": 500000,
      "recommendedBudget": 400000,
      "reasoning": "Lý do khuyến nghị",
      "potentialSavings": 100000
    }
  ]
}
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return this.parseBudgetRecommendations(text);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return this.generateFallbackRecommendations(data);
    }
  }

  private parseBudgetRecommendations(text: string): BudgetRecommendation[] {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      const recommendations: BudgetRecommendation[] = [];

      if (parsed.recommendations && Array.isArray(parsed.recommendations)) {
        parsed.recommendations.forEach((rec: any) => {
          recommendations.push({
            category: rec.category,
            currentSpending: rec.currentSpending || 0,
            recommendedBudget: rec.recommendedBudget || 0,
            reasoning: rec.reasoning || '',
            potentialSavings: rec.potentialSavings || 0
          });
        });
      }

      return recommendations;
    } catch (error) {
      console.error('Error parsing budget recommendations:', error);
      return [];
    }
  }

  private async predictMonthlySpending(data: any) {
    if (!this.isAvailable || !this.model) {
      return this.generateFallbackPrediction(data);
    }

    try {
      const currentMonth = new Date();
      const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
      const daysPassed = currentMonth.getDate();
      
      const currentMonthExpenses = data.expenses.filter((e: any) => 
        e.date >= startOfMonth(currentMonth) && e.date <= endOfMonth(currentMonth)
      );
      
      const currentTotal = currentMonthExpenses.reduce((sum: number, e: any) => sum + e.amount, 0);
      
      const prompt = `
Dự đoán chi tiêu tháng này dựa trên dữ liệu:

CHI TIÊU HIỆN TẠI (${daysPassed}/${daysInMonth} ngày):
- Tổng: ${currentTotal.toLocaleString('vi-VN')} VND
- Trung bình/ngày: ${(currentTotal / daysPassed).toLocaleString('vi-VN')} VND

LỊCH SỬ 3 THÁNG:
${Object.entries(data.monthlyData).map(([month, expenses]: [string, any]) => 
  `${month}: ${expenses.reduce((sum: number, e: any) => sum + e.amount, 0).toLocaleString('vi-VN')} VND`
).join('\n')}

Dự đoán tổng chi tiêu tháng này và phân bổ theo danh mục.

Định dạng JSON:
{
  "totalAmount": 2000000,
  "confidence": 0.85,
  "breakdown": [
    {"category": "Ăn uống", "amount": 800000},
    {"category": "Đi lại", "amount": 300000}
  ]
}
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return this.parseMonthlyPrediction(text);
    } catch (error) {
      console.error('Error predicting monthly spending:', error);
      return this.generateFallbackPrediction(data);
    }
  }

  private parseMonthlyPrediction(text: string) {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      return {
        totalAmount: parsed.totalAmount || 0,
        confidence: parsed.confidence || 0.5,
        breakdown: parsed.breakdown || []
      };
    } catch (error) {
      console.error('Error parsing monthly prediction:', error);
      return {
        totalAmount: 0,
        confidence: 0,
        breakdown: []
      };
    }
  }

  private async assessFinancialRisks(data: any) {
    if (!this.isAvailable || !this.model) {
      return {
        overspending: false,
        unusualPatterns: [],
        budgetExceeded: []
      };
    }

    try {
      const prompt = `
Đánh giá rủi ro tài chính dựa trên dữ liệu chi tiêu:

THỐNG KÊ:
- Tổng chi tiêu: ${data.totalAmount.toLocaleString('vi-VN')} VND
- Trung bình tháng: ${data.averageMonthly.toLocaleString('vi-VN')} VND
- Số giao dịch: ${data.expenseCount}

PHÂN TÍCH THEO THỜI GIAN:
- Ngày thường vs Cuối tuần: ${((data.weekdayVsWeekend.weekends.average / data.weekdayVsWeekend.weekdays.average - 1) * 100).toFixed(1)}% chênh lệch

Xác định các rủi ro:
1. Chi tiêu vượt mức
2. Mẫu chi tiêu bất thường
3. Vượt ngân sách danh mục

Định dạng JSON:
{
  "overspending": true,
  "unusualPatterns": ["Mô tả pattern bất thường"],
  "budgetExceeded": ["Danh mục vượt ngân sách"]
}
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return this.parseRiskFactors(text);
    } catch (error) {
      console.error('Error assessing financial risks:', error);
      return {
        overspending: false,
        unusualPatterns: [],
        budgetExceeded: []
      };
    }
  }

  private parseRiskFactors(text: string) {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      return {
        overspending: parsed.overspending || false,
        unusualPatterns: parsed.unusualPatterns || [],
        budgetExceeded: parsed.budgetExceeded || []
      };
    } catch (error) {
      console.error('Error parsing risk factors:', error);
      return {
        overspending: false,
        unusualPatterns: [],
        budgetExceeded: []
      };
    }
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

  private calculateMonthlyAverage(expenses: Expense[]): number {
    if (expenses.length === 0) return 0;
    
    const monthlyData = this.groupByMonth(expenses);
    const monthlyTotals = Object.values(monthlyData).map(monthExpenses => 
      monthExpenses.reduce((sum, e) => sum + e.amount, 0)
    );
    
    return monthlyTotals.reduce((sum, total) => sum + total, 0) / monthlyTotals.length;
  }

  private analyzeWeekdayVsWeekend(expenses: Expense[]) {
    const weekdayExpenses = expenses.filter(e => {
      const day = e.date.getDay();
      return day >= 1 && day <= 5;
    });
    
    const weekendExpenses = expenses.filter(e => {
      const day = e.date.getDay();
      return day === 0 || day === 6;
    });
    
    const weekdayTotal = weekdayExpenses.reduce((sum, e) => sum + e.amount, 0);
    const weekendTotal = weekendExpenses.reduce((sum, e) => sum + e.amount, 0);
    
    return {
      weekdays: {
        total: weekdayTotal,
        count: weekdayExpenses.length,
        average: weekdayExpenses.length > 0 ? weekdayTotal / weekdayExpenses.length : 0
      },
      weekends: {
        total: weekendTotal,
        count: weekendExpenses.length,
        average: weekendExpenses.length > 0 ? weekendTotal / weekendExpenses.length : 0
      }
    };
  }

  private analyzeTimePatterns(expenses: Expense[]) {
    // Analyze spending by time of day
    const timeSlots = {
      morning: expenses.filter(e => e.date.getHours() >= 6 && e.date.getHours() < 12),
      afternoon: expenses.filter(e => e.date.getHours() >= 12 && e.date.getHours() < 18),
      evening: expenses.filter(e => e.date.getHours() >= 18 && e.date.getHours() < 24),
      night: expenses.filter(e => e.date.getHours() >= 0 && e.date.getHours() < 6)
    };

    return Object.entries(timeSlots).map(([slot, slotExpenses]) => ({
      timeSlot: slot,
      total: slotExpenses.reduce((sum, e) => sum + e.amount, 0),
      count: slotExpenses.length,
      average: slotExpenses.length > 0 ? slotExpenses.reduce((sum, e) => sum + e.amount, 0) / slotExpenses.length : 0
    }));
  }

  private analyzeSeasonalPatterns(expenses: Expense[]) {
    const seasons = {
      spring: expenses.filter(e => [2, 3, 4].includes(e.date.getMonth())),
      summer: expenses.filter(e => [5, 6, 7].includes(e.date.getMonth())),
      fall: expenses.filter(e => [8, 9, 10].includes(e.date.getMonth())),
      winter: expenses.filter(e => [11, 0, 1].includes(e.date.getMonth()))
    };

    return Object.entries(seasons).map(([season, seasonExpenses]) => ({
      season,
      total: seasonExpenses.reduce((sum, e) => sum + e.amount, 0),
      count: seasonExpenses.length,
      average: seasonExpenses.length > 0 ? seasonExpenses.reduce((sum, e) => sum + e.amount, 0) / seasonExpenses.length : 0
    }));
  }

  // Fallback methods
  private generateFallbackInsights(data: any): AIInsight[] {
    const insights: AIInsight[] = [];
    
    // Basic spending analysis
    if (data.totalAmount > data.averageMonthly * 1.2) {
      insights.push({
        id: `fallback_${Date.now()}_1`,
        type: 'spending_pattern',
        title: 'Chi tiêu cao hơn bình thường',
        description: `Chi tiêu gần đây cao hơn ${((data.totalAmount / data.averageMonthly - 1) * 100).toFixed(0)}% so với trung bình`,
        severity: 'medium',
        confidence: 0.7,
        createdAt: new Date(),
        actionable: true,
        action: 'Xem xét giảm chi tiêu không cần thiết'
      });
    }

    // Category analysis
    const topCategory = Object.entries(data.categoryData).reduce((max, [category, expenses]: [string, any]) => {
      const total = expenses.reduce((sum: number, e: any) => sum + e.amount, 0);
      return total > max.amount ? { category, amount: total } : max;
    }, { category: '', amount: 0 });

    if (topCategory.category) {
      insights.push({
        id: `fallback_${Date.now()}_2`,
        type: 'category_analysis',
        title: `${topCategory.category} là danh mục chi tiêu lớn nhất`,
        description: `Bạn đã chi ${topCategory.amount.toLocaleString('vi-VN')} VND cho ${topCategory.category}`,
        severity: 'low',
        confidence: 0.9,
        createdAt: new Date(),
        actionable: true,
        action: `Xem xét tối ưu hóa chi tiêu cho ${topCategory.category}`
      });
    }

    // Weekend vs weekday analysis
    if (data.weekdayVsWeekend.weekends.average > data.weekdayVsWeekend.weekdays.average * 1.3) {
      insights.push({
        id: `fallback_${Date.now()}_3`,
        type: 'spending_pattern',
        title: 'Chi tiêu cuối tuần cao hơn ngày thường',
        description: `Chi tiêu cuối tuần cao hơn ${(((data.weekdayVsWeekend.weekends.average / data.weekdayVsWeekend.weekdays.average) - 1) * 100).toFixed(0)}% so với ngày thường`,
        severity: 'medium',
        confidence: 0.8,
        createdAt: new Date(),
        actionable: true,
        action: 'Lập kế hoạch ngân sách cho cuối tuần'
      });
    }

    return insights;
  }

  private generateFallbackPatterns(data: any): SpendingPattern[] {
    const patterns: SpendingPattern[] = [];
    
    Object.entries(data.categoryData).forEach(([category, expenses]: [string, any]) => {
      const total = expenses.reduce((sum: number, e: any) => sum + e.amount, 0);
      const average = total / expenses.length;
      
      patterns.push({
        category,
        trend: 'stable',
        changePercentage: 0,
        averageAmount: average,
        frequency: expenses.length,
        prediction: {
          nextMonth: average * expenses.length,
          confidence: 0.6
        }
      });
    });

    return patterns;
  }

  private generateFallbackRecommendations(data: any): BudgetRecommendation[] {
    const recommendations: BudgetRecommendation[] = [];
    
    Object.entries(data.categoryData).forEach(([category, expenses]: [string, any]) => {
      const currentSpending = expenses.reduce((sum: number, e: any) => sum + e.amount, 0);
      const recommendedBudget = Math.ceil(currentSpending * 0.9);
      
      recommendations.push({
        category,
        currentSpending,
        recommendedBudget,
        reasoning: 'Đề xuất giảm 10% để tối ưu ngân sách',
        potentialSavings: currentSpending - recommendedBudget
      });
    });

    return recommendations;
  }

  private generateFallbackPrediction(data: any) {
    const dailyAverage = data.averageDaily;
    const daysInMonth = 30;
    
    return {
      totalAmount: Math.round(dailyAverage * daysInMonth),
      confidence: 0.5,
      breakdown: Object.entries(data.categoryData).map(([category, expenses]: [string, any]) => ({
        category,
        amount: Math.round(expenses.reduce((sum: number, e: any) => sum + e.amount, 0) / 3)
      }))
    };
  }

  private getFallbackAnalysis(expenses: Expense[]): AIAnalysisResult {
    const analysisData = this.prepareExpenseData(expenses);
    
    return {
      insights: this.generateFallbackInsights(analysisData),
      patterns: this.generateFallbackPatterns(analysisData),
      recommendations: this.generateFallbackRecommendations(analysisData),
      monthlyPrediction: this.generateFallbackPrediction(analysisData),
      riskFactors: {
        overspending: analysisData.totalAmount > analysisData.averageMonthly * 1.5,
        unusualPatterns: [],
        budgetExceeded: []
      }
    };
  }

  private getEmptyAnalysis(): AIAnalysisResult {
    return {
      insights: [],
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