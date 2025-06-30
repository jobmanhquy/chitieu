import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { TrendingUp, TrendingDown, Calendar, DollarSign, Target, Zap } from 'lucide-react';
import { useExpenses } from '../hooks/useExpenses';
import { AnalyticsService } from '../services/analyticsService';
import { formatCurrency } from '../utils/currency';
import { useStore } from '../store/useStore';

export const AdvancedAnalytics: React.FC = () => {
  const { expenses } = useExpenses();
  const { dateRange, selectedCategories } = useStore();
  const analyticsService = AnalyticsService.getInstance();

  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const dateInRange = expense.date >= dateRange.start && expense.date <= dateRange.end;
      const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(expense.category);
      return dateInRange && categoryMatch;
    });
  }, [expenses, dateRange, selectedCategories]);

  const analytics = useMemo(() => {
    return analyticsService.generateAnalytics(filteredExpenses);
  }, [filteredExpenses]);

  const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6B7280', '#14B8A6'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.dataKey}: ${formatCurrency(entry.value)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Phân tích nâng cao</h1>
        <p className="text-gray-600">Insights chi tiết về thói quen chi tiêu của bạn</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white"
        >
          <div className="flex items-center space-x-3">
            <DollarSign className="w-8 h-8" />
            <div>
              <p className="text-blue-100">Tổng chi tiêu</p>
              <p className="text-2xl font-bold">{formatCurrency(analytics.totalExpenses)}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white"
        >
          <div className="flex items-center space-x-3">
            <Calendar className="w-8 h-8" />
            <div>
              <p className="text-green-100">Trung bình/ngày</p>
              <p className="text-2xl font-bold">{formatCurrency(analytics.averageDaily)}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white"
        >
          <div className="flex items-center space-x-3">
            <Target className="w-8 h-8" />
            <div>
              <p className="text-purple-100">Trung bình/tháng</p>
              <p className="text-2xl font-bold">{formatCurrency(analytics.averageMonthly)}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 text-white"
        >
          <div className="flex items-center space-x-3">
            <Zap className="w-8 h-8" />
            <div>
              <p className="text-orange-100">Cuối tuần vs Ngày thường</p>
              <p className="text-2xl font-bold">
                {analytics.weekdayVsWeekend.differencePercentage > 0 ? '+' : ''}
                {analytics.weekdayVsWeekend.differencePercentage.toFixed(1)}%
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <div className="bg-white rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Phân bổ theo danh mục</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.topCategories}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="amount"
                  nameKey="category"
                  label={({ category, percentage }) => `${category}: ${percentage.toFixed(1)}%`}
                >
                  {analytics.topCategories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Spending Trends */}
        <div className="bg-white rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Xu hướng chi tiêu</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.spendingTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Comparison */}
        <div className="bg-white rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">So sánh năm hiện tại vs năm trước</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.monthlyComparison}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="currentYear" fill="#3B82F6" name="Năm nay" />
                <Bar dataKey="previousYear" fill="#94A3B8" name="Năm trước" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Seasonal Patterns */}
        <div className="bg-white rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Mẫu chi tiêu theo mùa</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={analytics.seasonalPatterns}>
                <PolarGrid />
                <PolarAngleAxis dataKey="season" />
                <PolarRadiusAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} />
                <Radar
                  name="Chi tiêu trung bình"
                  dataKey="average"
                  stroke="#8B5CF6"
                  fill="#8B5CF6"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Category Analysis */}
      <div className="bg-white rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Phân tích chi tiết theo danh mục</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Danh mục</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Tổng tiền</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">% Tổng</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Số giao dịch</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">TB/giao dịch</th>
                <th className="text-center py-3 px-4 font-medium text-gray-900">Xu hướng</th>
              </tr>
            </thead>
            <tbody>
              {analytics.topCategories.map((category, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">{category.category}</td>
                  <td className="py-3 px-4 text-right">{formatCurrency(category.amount)}</td>
                  <td className="py-3 px-4 text-right">{category.percentage.toFixed(1)}%</td>
                  <td className="py-3 px-4 text-right">{category.transactionCount}</td>
                  <td className="py-3 px-4 text-right">{formatCurrency(category.averageTransaction)}</td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center space-x-1">
                      {category.trend === 'up' ? (
                        <TrendingUp className="w-4 h-4 text-red-500" />
                      ) : category.trend === 'down' ? (
                        <TrendingDown className="w-4 h-4 text-green-500" />
                      ) : (
                        <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
                      )}
                      <span className={`text-xs font-medium ${
                        category.trend === 'up' ? 'text-red-600' : 
                        category.trend === 'down' ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {category.trendPercentage.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Weekday vs Weekend Analysis */}
      <div className="bg-white rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Phân tích ngày thường vs cuối tuần</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 rounded-xl p-6">
            <h4 className="font-semibold text-blue-900 mb-4">Ngày thường (T2-T6)</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-blue-700">Tổng chi tiêu:</span>
                <span className="font-semibold text-blue-900">{formatCurrency(analytics.weekdayVsWeekend.weekdays.total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Trung bình/giao dịch:</span>
                <span className="font-semibold text-blue-900">{formatCurrency(analytics.weekdayVsWeekend.weekdays.average)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Số giao dịch:</span>
                <span className="font-semibold text-blue-900">{analytics.weekdayVsWeekend.weekdays.count}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-orange-50 rounded-xl p-6">
            <h4 className="font-semibold text-orange-900 mb-4">Cuối tuần (T7-CN)</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-orange-700">Tổng chi tiêu:</span>
                <span className="font-semibold text-orange-900">{formatCurrency(analytics.weekdayVsWeekend.weekends.total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-orange-700">Trung bình/giao dịch:</span>
                <span className="font-semibold text-orange-900">{formatCurrency(analytics.weekdayVsWeekend.weekends.average)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-orange-700">Số giao dịch:</span>
                <span className="font-semibold text-orange-900">{analytics.weekdayVsWeekend.weekends.count}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-center text-gray-700">
            Chi tiêu cuối tuần {analytics.weekdayVsWeekend.differencePercentage > 0 ? 'cao hơn' : 'thấp hơn'} ngày thường{' '}
            <span className={`font-bold ${analytics.weekdayVsWeekend.differencePercentage > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {Math.abs(analytics.weekdayVsWeekend.differencePercentage).toFixed(1)}%
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};