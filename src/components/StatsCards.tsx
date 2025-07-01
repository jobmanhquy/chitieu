import React from 'react';
import { TrendingUp, TrendingDown, Calendar, Target } from 'lucide-react';
import { Expense } from '../types/expense';
import { formatCurrency } from '../utils/currency';
import { startOfMonth, endOfMonth, isWithinInterval, subMonths } from 'date-fns';

interface StatsCardsProps {
  expenses: Expense[];
}

export const StatsCards: React.FC<StatsCardsProps> = ({ expenses }) => {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  // Filter expenses for this month
  const thisMonthExpenses = expenses.filter(expense =>
    isWithinInterval(expense.date, { start: monthStart, end: monthEnd })
  );

  const totalThisMonth = thisMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const avgPerDay = thisMonthExpenses.length > 0 ? totalThisMonth / now.getDate() : 0;
  const transactionCount = thisMonthExpenses.length;

  // Calculate previous month for comparison
  const prevMonthStart = subMonths(monthStart, 1);
  const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
  
  const prevMonthExpenses = expenses.filter(expense =>
    isWithinInterval(expense.date, { start: prevMonthStart, end: prevMonthEnd })
  );
  
  const totalPrevMonth = prevMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const monthlyChange = totalPrevMonth > 0 ? ((totalThisMonth - totalPrevMonth) / totalPrevMonth) * 100 : 0;

  // Calculate total all time
  const totalAllTime = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  const stats = [
    {
      title: 'Chi tiêu tháng này',
      value: formatCurrency(totalThisMonth),
      change: monthlyChange,
      icon: Calendar,
      color: 'blue',
      subtitle: `${transactionCount} giao dịch`
    },
    {
      title: 'Trung bình/ngày',
      value: formatCurrency(avgPerDay),
      subtitle: 'Tháng này',
      icon: TrendingUp,
      color: 'green',
    },
    {
      title: 'Tổng chi tiêu',
      value: formatCurrency(totalAllTime),
      subtitle: `${expenses.length} giao dịch`,
      icon: Target,
      color: 'purple',
    },
    {
      title: 'So với tháng trước',
      value: `${monthlyChange >= 0 ? '+' : ''}${monthlyChange.toFixed(1)}%`,
      subtitle: monthlyChange >= 0 ? 'Tăng' : 'Giảm',
      icon: monthlyChange >= 0 ? TrendingUp : TrendingDown,
      color: monthlyChange >= 0 ? 'red' : 'green',
    },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-600',
      green: 'bg-green-50 text-green-600',
      purple: 'bg-purple-50 text-purple-600',
      red: 'bg-red-50 text-red-600',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-2xl p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${getColorClasses(stat.color)}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            {stat.change !== undefined && (
              <div className={`text-sm font-medium ${
                stat.change >= 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                {stat.change >= 0 ? '↗' : '↘'} {Math.abs(stat.change).toFixed(1)}%
              </div>
            )}
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">{stat.title}</h3>
            <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
            {stat.subtitle && (
              <p className="text-sm text-gray-500">{stat.subtitle}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};