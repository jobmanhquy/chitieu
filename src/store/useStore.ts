import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Expense } from '../types/expense';
import { FinancialGoal, BudgetGoal, Achievement, Challenge } from '../types/goals';

interface AppState {
  // User preferences
  theme: 'light' | 'dark' | 'system';
  currency: 'VND' | 'USD' | 'EUR';
  language: 'vi' | 'en';
  
  // Goals & Budgets
  financialGoals: FinancialGoal[];
  budgetGoals: BudgetGoal[];
  achievements: Achievement[];
  challenges: Challenge[];
  
  // UI State
  sidebarOpen: boolean;
  activeView: 'dashboard' | 'expenses' | 'analytics' | 'goals' | 'achievements' | 'challenges' | 'settings';
  
  // Filters
  dateRange: {
    start: Date;
    end: Date;
  };
  selectedCategories: string[];
  
  // Actions
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setCurrency: (currency: 'VND' | 'USD' | 'EUR') => void;
  setLanguage: (language: 'vi' | 'en') => void;
  setSidebarOpen: (open: boolean) => void;
  setActiveView: (view: 'dashboard' | 'expenses' | 'analytics' | 'goals' | 'achievements' | 'challenges' | 'settings') => void;
  setDateRange: (range: { start: Date; end: Date }) => void;
  setSelectedCategories: (categories: string[]) => void;
  
  // Goals
  addFinancialGoal: (goal: Omit<FinancialGoal, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateFinancialGoal: (id: string, updates: Partial<FinancialGoal>) => void;
  deleteFinancialGoal: (id: string) => void;
  
  // Budget Goals
  addBudgetGoal: (goal: Omit<BudgetGoal, 'id' | 'createdAt'>) => void;
  updateBudgetGoal: (id: string, updates: Partial<BudgetGoal>) => void;
  deleteBudgetGoal: (id: string) => void;
  
  // Achievements
  unlockAchievement: (id: string) => void;
  
  // Challenges
  joinChallenge: (challenge: Challenge) => void;
  updateChallengeProgress: (id: string, progress: number) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      theme: 'system',
      currency: 'VND',
      language: 'vi',
      financialGoals: [],
      budgetGoals: [],
      achievements: [
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
      ],
      challenges: [],
      sidebarOpen: false,
      activeView: 'dashboard',
      dateRange: {
        start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        end: new Date()
      },
      selectedCategories: [],
      
      // Actions
      setTheme: (theme) => set({ theme }),
      setCurrency: (currency) => set({ currency }),
      setLanguage: (language) => set({ language }),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      setActiveView: (activeView) => set({ activeView }),
      setDateRange: (dateRange) => set({ dateRange }),
      setSelectedCategories: (selectedCategories) => set({ selectedCategories }),
      
      // Goals
      addFinancialGoal: (goalData) => {
        const goal: FinancialGoal = {
          ...goalData,
          id: Date.now().toString(),
          createdAt: new Date(),
          updatedAt: new Date()
        };
        set((state) => ({
          financialGoals: [...state.financialGoals, goal]
        }));
      },
      
      updateFinancialGoal: (id, updates) => {
        set((state) => ({
          financialGoals: state.financialGoals.map(goal =>
            goal.id === id ? { ...goal, ...updates, updatedAt: new Date() } : goal
          )
        }));
      },
      
      deleteFinancialGoal: (id) => {
        set((state) => ({
          financialGoals: state.financialGoals.filter(goal => goal.id !== id)
        }));
      },
      
      // Budget Goals
      addBudgetGoal: (goalData) => {
        const goal: BudgetGoal = {
          ...goalData,
          id: Date.now().toString(),
          createdAt: new Date()
        };
        set((state) => ({
          budgetGoals: [...state.budgetGoals, goal]
        }));
      },
      
      updateBudgetGoal: (id, updates) => {
        set((state) => ({
          budgetGoals: state.budgetGoals.map(goal =>
            goal.id === id ? { ...goal, ...updates } : goal
          )
        }));
      },
      
      deleteBudgetGoal: (id) => {
        set((state) => ({
          budgetGoals: state.budgetGoals.filter(goal => goal.id !== id)
        }));
      },
      
      // Achievements
      unlockAchievement: (id) => {
        set((state) => ({
          achievements: state.achievements.map(achievement =>
            achievement.id === id 
              ? { ...achievement, isUnlocked: true, unlockedAt: new Date() }
              : achievement
          )
        }));
      },
      
      // Challenges
      joinChallenge: (challenge) => {
        set((state) => ({
          challenges: [...state.challenges, challenge]
        }));
      },
      
      updateChallengeProgress: (id, progress) => {
        set((state) => ({
          challenges: state.challenges.map(challenge =>
            challenge.id === id ? { ...challenge, currentProgress: progress } : challenge
          )
        }));
      }
    }),
    {
      name: 'expense-tracker-store',
      partialize: (state) => ({
        theme: state.theme,
        currency: state.currency,
        language: state.language,
        financialGoals: state.financialGoals,
        budgetGoals: state.budgetGoals,
        achievements: state.achievements,
        challenges: state.challenges
      })
    }
  )
);