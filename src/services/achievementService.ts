import { Expense } from '../types/expense';
import { Achievement } from '../types/goals';

export class AchievementService {
  private static instance: AchievementService;
  
  public static getInstance(): AchievementService {
    if (!AchievementService.instance) {
      AchievementService.instance = new AchievementService();
    }
    return AchievementService.instance;
  }

  private defaultAchievements: Achievement[] = [
    {
      id: 'first_expense',
      title: 'Bước đầu tiên',
      description: 'Thêm khoản chi tiêu đầu tiên',
      icon: 'Trophy',
      type: 'milestone',
      requirement: 1,
      progress: 0,
      isUnlocked: false,
      reward: 'Mở khóa tính năng phân tích cơ bản'
    },
    {
      id: 'expense_streak_7',
      title: 'Kiên trì 7 ngày',
      description: 'Ghi chép chi tiêu liên tục 7 ngày',
      icon: 'Calendar',
      type: 'streak',
      requirement: 7,
      progress: 0,
      isUnlocked: false,
      reward: 'Mở khóa báo cáo tuần'
    },
    {
      id: 'expense_streak_30',
      title: 'Thói quen tốt',
      description: 'Ghi chép chi tiêu liên tục 30 ngày',
      icon: 'Star',
      type: 'streak',
      requirement: 30,
      progress: 0,
      isUnlocked: false,
      reward: 'Mở khóa AI insights nâng cao'
    },
    {
      id: 'budget_keeper',
      title: 'Người giữ ngân sách',
      description: 'Không vượt ngân sách trong 1 tháng',
      icon: 'Shield',
      type: 'budget',
      requirement: 1,
      progress: 0,
      isUnlocked: false,
      reward: 'Mở khóa cảnh báo ngân sách thông minh'
    },
    {
      id: 'saver_100k',
      title: 'Tiết kiệm nhỏ',
      description: 'Tiết kiệm được 100,000 VND',
      icon: 'PiggyBank',
      type: 'savings',
      requirement: 100000,
      progress: 0,
      isUnlocked: false,
      reward: 'Mở khóa mục tiêu tiết kiệm'
    },
    {
      id: 'saver_1m',
      title: 'Tiết kiệm lớn',
      description: 'Tiết kiệm được 1,000,000 VND',
      icon: 'Gem',
      type: 'savings',
      requirement: 1000000,
      progress: 0,
      isUnlocked: false,
      reward: 'Mở khóa đầu tư cơ bản'
    },
    {
      id: 'category_master',
      title: 'Chuyên gia phân loại',
      description: 'Sử dụng tất cả 8 danh mục chi tiêu',
      icon: 'Grid',
      type: 'category',
      requirement: 8,
      progress: 0,
      isUnlocked: false,
      reward: 'Mở khóa danh mục tùy chỉnh'
    },
    {
      id: 'expense_100',
      title: 'Người ghi chép chuyên nghiệp',
      description: 'Ghi chép 100 khoản chi tiêu',
      icon: 'BookOpen',
      type: 'milestone',
      requirement: 100,
      progress: 0,
      isUnlocked: false,
      reward: 'Mở khóa xuất dữ liệu Excel'
    }
  ];

  getDefaultAchievements(): Achievement[] {
    return [...this.defaultAchievements];
  }

  checkAchievements(expenses: Expense[], currentAchievements: Achievement[]): Achievement[] {
    const updatedAchievements = [...currentAchievements];
    
    // First expense
    const firstExpenseAchievement = updatedAchievements.find(a => a.id === 'first_expense');
    if (firstExpenseAchievement && !firstExpenseAchievement.isUnlocked && expenses.length >= 1) {
      firstExpenseAchievement.progress = expenses.length;
      firstExpenseAchievement.isUnlocked = true;
      firstExpenseAchievement.unlockedAt = new Date();
    }

    // Expense count milestones
    const expense100Achievement = updatedAchievements.find(a => a.id === 'expense_100');
    if (expense100Achievement) {
      expense100Achievement.progress = expenses.length;
      if (!expense100Achievement.isUnlocked && expenses.length >= 100) {
        expense100Achievement.isUnlocked = true;
        expense100Achievement.unlockedAt = new Date();
      }
    }

    // Category usage
    const categoryMasterAchievement = updatedAchievements.find(a => a.id === 'category_master');
    if (categoryMasterAchievement) {
      const uniqueCategories = new Set(expenses.map(e => e.category));
      categoryMasterAchievement.progress = uniqueCategories.size;
      if (!categoryMasterAchievement.isUnlocked && uniqueCategories.size >= 8) {
        categoryMasterAchievement.isUnlocked = true;
        categoryMasterAchievement.unlockedAt = new Date();
      }
    }

    // Streak achievements would require additional tracking
    // This would be implemented with a separate streak tracking system

    return updatedAchievements;
  }

  calculateStreakDays(expenses: Expense[]): number {
    if (expenses.length === 0) return 0;
    
    const sortedExpenses = expenses.sort((a, b) => b.date.getTime() - a.date.getTime());
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let streak = 0;
    let currentDate = new Date(today);
    
    for (let i = 0; i < 365; i++) { // Check up to 365 days
      const hasExpenseOnDate = sortedExpenses.some(expense => {
        const expenseDate = new Date(expense.date);
        expenseDate.setHours(0, 0, 0, 0);
        return expenseDate.getTime() === currentDate.getTime();
      });
      
      if (hasExpenseOnDate) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return streak;
  }
}