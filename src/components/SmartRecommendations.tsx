import React from 'react';
import { Lightbulb, Target, TrendingDown, CheckCircle } from 'lucide-react';
import { BudgetRecommendation } from '../types/ai';
import { formatCurrency } from '../utils/currency';

interface SmartRecommendationsProps {
  recommendations: BudgetRecommendation[];
}

export const SmartRecommendations: React.FC<SmartRecommendationsProps> = ({ recommendations }) => {
  if (recommendations.length === 0) {
    return null;
  }

  const totalPotentialSavings = recommendations.reduce((sum, rec) => sum + rec.potentialSavings, 0);

  return (
    <div className="bg-white rounded-2xl p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-3 rounded-xl">
          <Lightbulb className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Khuyến nghị thông minh</h2>
          <p className="text-gray-600 text-sm">
            Tiết kiệm tiềm năng: <span className="font-medium text-green-600">{formatCurrency(totalPotentialSavings)}</span>
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {recommendations.map((rec, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Target className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{rec.category}</h3>
                  <p className="text-sm text-gray-600">{rec.reasoning}</p>
                </div>
              </div>
              {rec.potentialSavings > 0 && (
                <div className="text-right">
                  <div className="text-green-600 font-medium text-sm">
                    Tiết kiệm {formatCurrency(rec.potentialSavings)}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">Chi tiêu hiện tại</div>
                <div className="font-semibold text-gray-900">{formatCurrency(rec.currentSpending)}</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="text-xs text-blue-600 mb-1">Ngân sách đề xuất</div>
                <div className="font-semibold text-blue-900">{formatCurrency(rec.recommendedBudget)}</div>
              </div>
            </div>

            {rec.potentialSavings > 0 && (
              <div className="mt-3 flex items-center space-x-2 text-sm text-green-600">
                <TrendingDown className="w-4 h-4" />
                <span>Giảm {((rec.potentialSavings / rec.currentSpending) * 100).toFixed(1)}% so với hiện tại</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {totalPotentialSavings > 0 && (
        <div className="mt-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <h3 className="font-medium text-gray-900">Tổng tiết kiệm tiềm năng</h3>
              <p className="text-sm text-gray-600">
                Nếu áp dụng tất cả khuyến nghị, bạn có thể tiết kiệm{' '}
                <span className="font-bold text-green-600">{formatCurrency(totalPotentialSavings)}</span> mỗi tháng
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};