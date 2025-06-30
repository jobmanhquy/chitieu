import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Expense } from '../types/expense';
import { getCategoryColor } from '../data/categories';
import { formatCurrency } from '../utils/currency';
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';
import { vi } from 'date-fns/locale';

interface ExpenseChartProps {
  expenses: Expense[];
}

export const ExpenseChart: React.FC<ExpenseChartProps> = ({ expenses }) => {
  // Prepare category data for pie chart
  const categoryData = expenses.reduce((acc, expense) => {
    const existing = acc.find(item => item.category === expense.category);
    if (existing) {
      existing.amount += expense.amount;
      existing.count += 1;
    } else {
      acc.push({
        category: expense.category,
        amount: expense.amount,
        count: 1,
        color: getCategoryColor(expense.category),
      });
    }
    return acc;
  }, [] as Array<{ category: string; amount: number; count: number; color: string }>);

  // Prepare monthly data for bar chart
  const now = new Date();
  const sixMonthsAgo = subMonths(now, 5);
  const months = eachMonthOfInterval({ start: sixMonthsAgo, end: now });

  const monthlyData = months.map(month => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    
    const monthExpenses = expenses.filter(expense => 
      expense.date >= monthStart && expense.date <= monthEnd
    );
    
    const total = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    return {
      month: format(month, 'MMM yyyy', { locale: vi }),
      total,
      count: monthExpenses.length,
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-blue-600">
            {`Tổng: ${formatCurrency(payload[0].value)}`}
          </p>
          <p className="text-gray-500 text-sm">
            {`${payload[0].payload.count} giao dịch`}
          </p>
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{data.category}</p>
          <p className="text-blue-600">
            {`${formatCurrency(data.amount)}`}
          </p>
          <p className="text-gray-500 text-sm">
            {`${data.count} giao dịch`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Category Distribution */}
      <div className="bg-white rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Phân bổ theo danh mục</h3>
        {categoryData.length > 0 ? (
          <div className="space-y-4">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="amount"
                    label={false}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-2">
              {categoryData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-sm text-gray-600">{item.category}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(item.amount)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.count} giao dịch
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            Chưa có dữ liệu để hiển thị
          </div>
        )}
      </div>

      {/* Monthly Trend */}
      <div className="bg-white rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Xu hướng 6 tháng gần đây</h3>
        {monthlyData.some(item => item.total > 0) ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="total" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            Chưa có dữ liệu để hiển thị
          </div>
        )}
      </div>
    </div>
  );
};