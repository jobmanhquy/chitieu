import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

// Components
import { Navigation } from './components/Navigation';
import { StatsCards } from './components/StatsCards';
import { ExpenseChart } from './components/ExpenseChart';
import { ExpenseList } from './components/ExpenseList';
import { ExpenseForm } from './components/ExpenseForm';
import { AIInsights } from './components/AIInsights';
import { SmartRecommendations } from './components/SmartRecommendations';
import { GoalsManager } from './components/GoalsManager';
import { AchievementsPanel } from './components/AchievementsPanel';
import { AdvancedAnalytics } from './components/AdvancedAnalytics';
import { ResponsiveLayout } from './components/ResponsiveLayout';
import { AuthModal } from './components/auth/AuthModal';
import { LandingPage } from './components/LandingPage';
import { ChallengesManager } from './components/challenges/ChallengesManager';
import { SettingsManager } from './components/settings/SettingsManager';
import { EmailVerificationBanner } from './components/auth/EmailVerificationBanner';

// Hooks & Services
import { useExpenses } from './hooks/useExpenses';
import { useAIAnalysis } from './hooks/useAIAnalysis';
import { useRealTime } from './hooks/useRealTime';
import { useStore } from './store/useStore';
import { useAuth } from './contexts/AuthContext';
import { AuthProvider } from './contexts/AuthContext';
import { Expense } from './types/expense';

function AppContent() {
  const { expenses, loading, error, addExpense, updateExpense, deleteExpense } = useExpenses();
  const { analysis, loading: aiLoading, error: aiError, refreshAnalysis } = useAIAnalysis(expenses);
  const { activeView, sidebarOpen, setSidebarOpen } = useStore();
  const { user, loading: authLoading } = useAuth();
  
  // Initialize real-time listeners
  useRealTime();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Nếu đang loading auth, hiển thị loading screen
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600">Đang khởi tạo...</p>
        </div>
      </div>
    );
  }

  // Nếu chưa đăng nhập, hiển thị Landing Page
  if (!user) {
    return (
      <>
        <LandingPage onGetStarted={() => setShowAuthModal(true)} />
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      </>
    );
  }

  const handleAddExpense = async (expenseData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await addExpense(expenseData);
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setIsFormOpen(true);
  };

  const handleUpdateExpense = async (expenseData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingExpense) {
      try {
        await updateExpense(editingExpense.id, expenseData);
        setIsFormOpen(false);
        setEditingExpense(null);
      } catch (error) {
        console.error('Error updating expense:', error);
      }
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa khoản chi tiêu này?')) {
      try {
        await deleteExpense(id);
      } catch (error) {
        console.error('Error deleting expense:', error);
      }
    }
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingExpense(null);
  };

  const handleAddExpenseClick = () => {
    setIsFormOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <div className="space-y-6 lg:space-y-8">
            {/* Stats Cards */}
            <StatsCards expenses={expenses} />

            {/* AI Insights Section */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2">
                <AIInsights 
                  analysis={analysis} 
                  loading={aiLoading} 
                  error={aiError}
                  onRefresh={refreshAnalysis}
                />
              </div>
              <div className="space-y-6">
                {analysis?.recommendations && analysis.recommendations.length > 0 && (
                  <SmartRecommendations recommendations={analysis.recommendations} />
                )}
              </div>
            </div>

            {/* Charts */}
            <ExpenseChart expenses={expenses} />

            {/* Recent Expenses */}
            <div className="bg-white rounded-2xl p-4 lg:p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg lg:text-xl font-semibold text-gray-900">Chi tiêu gần đây</h2>
                <span className="text-sm text-gray-500">
                  {expenses.length} giao dịch
                </span>
              </div>
              
              <ExpenseList 
                expenses={expenses.slice(0, 10)}
                onDelete={handleDeleteExpense}
                onEdit={handleEditExpense}
              />
            </div>
          </div>
        );

      case 'expenses':
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Quản lý chi tiêu</h1>
                <p className="text-gray-600">Tất cả giao dịch chi tiêu của bạn</p>
              </div>
              <button
                onClick={handleAddExpenseClick}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
              >
                Thêm chi tiêu
              </button>
            </div>
            
            <div className="bg-white rounded-2xl p-4 lg:p-6">
              <ExpenseList 
                expenses={expenses}
                onDelete={handleDeleteExpense}
                onEdit={handleEditExpense}
              />
            </div>
          </div>
        );

      case 'analytics':
        return <AdvancedAnalytics />;

      case 'goals':
        return <GoalsManager />;

      case 'achievements':
        return <AchievementsPanel />;

      case 'challenges':
        return <ChallengesManager />;

      case 'settings':
        return <SettingsManager />;

      default:
        return null;
    }
  };

  const header = (
    <>
      {/* Email Verification Banner */}
      <EmailVerificationBanner />
      
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <div>
              <h1 className="text-lg lg:text-xl font-bold text-gray-900">
                {activeView === 'dashboard' && 'Tổng quan'}
                {activeView === 'expenses' && 'Chi tiêu'}
                {activeView === 'analytics' && 'Phân tích'}
                {activeView === 'goals' && 'Mục tiêu'}
                {activeView === 'achievements' && 'Thành tích'}
                {activeView === 'challenges' && 'Thử thách'}
                {activeView === 'settings' && 'Cài đặt'}
              </h1>
              {user && (
                <p className="text-xs lg:text-sm text-gray-500">
                  Xin chào, {user.displayName || user.email}
                  {!user.emailVerified && (
                    <span className="ml-2 text-orange-600 font-medium">• Email chưa xác thực</span>
                  )}
                </p>
              )}
            </div>
          </div>

          {activeView === 'dashboard' && (
            <button
              onClick={handleAddExpenseClick}
              className="hidden sm:block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Thêm chi tiêu
            </button>
          )}
        </div>
      </header>
    </>
  );

  const sidebar = (
    <Navigation 
      isOpen={sidebarOpen} 
      onClose={() => setSidebarOpen(false)} 
    />
  );

  return (
    <ResponsiveLayout
      header={header}
      sidebar={sidebar}
    >
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
      
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800">Lỗi kết nối Firebase</p>
          <p className="text-yellow-600 text-sm mt-1">{error}</p>
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={activeView}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>

      {/* Expense Form Modal */}
      <ExpenseForm
        isOpen={isFormOpen}
        onSubmit={editingExpense ? handleUpdateExpense : handleAddExpense}
        onCancel={handleFormCancel}
        editingExpense={editingExpense}
      />
    </ResponsiveLayout>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;