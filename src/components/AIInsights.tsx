import React, { useState } from 'react';
import { Brain, TrendingUp, TrendingDown, AlertTriangle, Lightbulb, Target, Zap, RefreshCw, Sparkles } from 'lucide-react';
import { AIAnalysisResult, AIInsight } from '../types/ai';
import { formatCurrency } from '../utils/currency';
import { motion, AnimatePresence } from 'framer-motion';

interface AIInsightsProps {
  analysis: AIAnalysisResult | null;
  loading: boolean;
  error: string | null;
  onRefresh?: () => void;
}

export const AIInsights: React.FC<AIInsightsProps> = ({ analysis, loading, error, onRefresh }) => {
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-xl">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">AI Insights</h2>
            <p className="text-gray-600 text-sm">Phân tích thông minh bằng Gemini AI</p>
          </div>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full mx-auto mb-4"
            />
            <p className="text-gray-600">Gemini AI đang phân tích dữ liệu...</p>
            <p className="text-gray-500 text-sm mt-1">Vui lòng chờ trong giây lát</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-xl">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">AI Insights</h2>
              <p className="text-gray-600 text-sm">Phân tích thông minh bằng Gemini AI</p>
            </div>
          </div>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          )}
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <p className="text-red-800 font-medium">Lỗi phân tích AI</p>
          </div>
          <p className="text-red-700 text-sm">{error}</p>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              Thử lại
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="bg-white rounded-2xl p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-xl">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">AI Insights</h2>
            <p className="text-gray-600 text-sm">Phân tích thông minh bằng Gemini AI</p>
          </div>
        </div>
        
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500">Thêm dữ liệu chi tiêu để nhận insights từ Gemini AI</p>
          <p className="text-gray-400 text-sm mt-1">AI sẽ phân tích và đưa ra khuyến nghị thông minh</p>
        </div>
      </div>
    );
  }

  const getInsightIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'spending_pattern':
        return TrendingUp;
      case 'budget_alert':
        return AlertTriangle;
      case 'category_analysis':
        return Target;
      case 'prediction':
        return Zap;
      case 'recommendation':
        return Lightbulb;
      default:
        return Brain;
    }
  };

  const getSeverityColor = (severity: AIInsight['severity']) => {
    switch (severity) {
      case 'high':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'low':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="space-y-6">
      {/* Main AI Insights */}
      <div className="bg-white rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-xl">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">AI Insights</h2>
              <p className="text-gray-600 text-sm">Phân tích thông minh bằng Gemini AI</p>
            </div>
          </div>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          )}
        </div>

        {analysis.insights.length > 0 ? (
          <div className="space-y-4">
            <AnimatePresence>
              {analysis.insights.slice(0, 5).map((insight) => {
                const Icon = getInsightIcon(insight.type);
                const isExpanded = expandedInsight === insight.id;
                
                return (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${getSeverityColor(insight.severity)}`}
                    onClick={() => setExpandedInsight(isExpanded ? null : insight.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">{insight.title}</h3>
                          <div className="flex items-center space-x-2">
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${getConfidenceColor(insight.confidence)}`}>
                              {(insight.confidence * 100).toFixed(0)}% tin cậy
                            </span>
                            <motion.div
                              animate={{ rotate: isExpanded ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <TrendingDown className="w-4 h-4" />
                            </motion.div>
                          </div>
                        </div>
                        
                        <p className="text-sm opacity-90 mb-2">{insight.description}</p>
                        
                        <AnimatePresence>
                          {isExpanded && insight.actionable && insight.action && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="bg-white bg-opacity-50 rounded-md p-3 text-xs mt-3"
                            >
                              <div className="flex items-center space-x-2 mb-1">
                                <Lightbulb className="w-4 h-4" />
                                <strong>Khuyến nghị:</strong>
                              </div>
                              <p>{insight.action}</p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">Chưa có insights nào được tạo</p>
        )}
      </div>

      {/* Monthly Prediction */}
      {analysis.monthlyPrediction.totalAmount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-blue-500 p-2 rounded-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Dự đoán AI cho tháng này</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {formatCurrency(analysis.monthlyPrediction.totalAmount)}
              </div>
              <div className="text-sm text-gray-600 mb-2">Tổng dự kiến</div>
              <div className={`text-xs font-medium px-2 py-1 rounded-full inline-block ${getConfidenceColor(analysis.monthlyPrediction.confidence)}`}>
                Độ tin cậy: {(analysis.monthlyPrediction.confidence * 100).toFixed(0)}%
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Phân bổ theo danh mục</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {analysis.monthlyPrediction.breakdown.slice(0, 5).map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-600 truncate">{item.category}</span>
                    <span className="font-medium ml-2">{formatCurrency(item.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Risk Factors */}
      {(analysis.riskFactors.overspending || analysis.riskFactors.unusualPatterns.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-2xl p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <h3 className="text-lg font-semibold text-red-900">Cảnh báo rủi ro từ AI</h3>
          </div>
          
          <div className="space-y-3">
            {analysis.riskFactors.overspending && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-lg p-3"
              >
                <p className="text-red-800 font-medium">Chi tiêu vượt mức bình thường</p>
                <p className="text-red-600 text-sm">AI phát hiện mức chi tiêu cao bất thường</p>
              </motion.div>
            )}
            
            {analysis.riskFactors.unusualPatterns.map((pattern, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg p-3"
              >
                <p className="text-red-800 font-medium">Mẫu chi tiêu bất thường</p>
                <p className="text-red-600 text-sm">{pattern}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};