import { useState, useEffect } from 'react';
import { AIAnalysisResult } from '../types/ai';
import { Expense } from '../types/expense';
import { GeminiAIService } from '../services/geminiAIService';
import { useAuth } from '../contexts/AuthContext';

export const useAIAnalysis = (expenses: Expense[]) => {
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const analyzeExpenses = async () => {
    if (!user) {
      setAnalysis(null);
      return;
    }

    if (expenses.length === 0) {
      setAnalysis(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const aiService = GeminiAIService.getInstance();
      const result = await aiService.analyzeExpenses(expenses);
      
      setAnalysis(result);
    } catch (err: any) {
      console.error('AI Analysis Error:', err);
      setError(err.message || 'Không thể phân tích dữ liệu. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-analyze when expenses change
  useEffect(() => {
    if (user && expenses.length > 0) {
      // Debounce analysis to avoid too frequent calls
      const timer = setTimeout(() => {
        analyzeExpenses();
      }, 2000);

      return () => clearTimeout(timer);
    } else {
      setAnalysis(null);
    }
  }, [expenses, user]);

  // Manual refresh
  const refreshAnalysis = () => {
    if (user && expenses.length > 0) {
      analyzeExpenses();
    }
  };

  return {
    analysis,
    loading,
    error,
    refreshAnalysis
  };
};