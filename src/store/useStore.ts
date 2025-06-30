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
  activeView: 'dashboard' | 'expenses' | 'analytics' | 'goals' | 'settings';
  
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
  setActiveView: (view: 'dashboard' | 'expenses' | 'analytics' | 'goals' | 'settings') => void;
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
      achievements: [],
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