import React from 'react';
import { Plus, BarChart3, Wallet } from 'lucide-react';

interface HeaderProps {
  onAddExpense: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onAddExpense }) => {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="bg-white bg-opacity-20 p-2 rounded-lg">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Quản lý chi tiêu</h1>
              <p className="text-blue-100 text-sm">Theo dõi và kiểm soát chi tiêu cá nhân</p>
            </div>
          </div>

          <button
            onClick={onAddExpense}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors backdrop-blur-sm"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Thêm chi tiêu</span>
          </button>
        </div>
      </div>
    </header>
  );
};