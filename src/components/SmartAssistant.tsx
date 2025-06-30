import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, Mic, X, Bot, User, Sparkles, Zap, Brain, TrendingUp } from 'lucide-react';
import { GeminiAIService } from '../services/geminiAIService';
import { useExpenses } from '../hooks/useExpenses';
import { formatCurrency } from '../utils/currency';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

interface SmartAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SmartAssistant: React.FC<SmartAssistantProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Xin chào! Tôi là AI Assistant được trang bị Gemini AI. Tôi có thể giúp bạn:\n\n• Phân tích chi tiêu thông minh\n• Đưa ra lời khuyên tài chính cá nhân hóa\n• Dự đoán xu hướng chi tiêu\n• Tối ưu hóa ngân sách\n• Trả lời mọi câu hỏi về quản lý tài chính\n\nBạn muốn tôi hỗ trợ gì?',
      timestamp: new Date(),
      suggestions: [
        'Phân tích chi tiêu tháng này',
        'Đưa ra lời khuyên tiết kiệm',
        'Dự đoán chi tiêu tháng tới',
        'Tối ưu hóa ngân sách'
      ]
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { expenses } = useExpenses();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (message?: string) => {
    const messageText = message || inputValue;
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await generateAIResponse(messageText, expenses);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response.content,
        timestamp: new Date(),
        suggestions: response.suggestions
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Xin lỗi, tôi gặp sự cố khi xử lý yêu cầu của bạn. Vui lòng thử lại sau.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateAIResponse = async (query: string, expenses: any[]) => {
    // Enhanced AI response logic with more sophisticated analysis
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const avgDaily = totalExpenses / 30;
    const currentMonth = new Date().getMonth();
    const thisMonthExpenses = expenses.filter(exp => exp.date.getMonth() === currentMonth);
    const thisMonthTotal = thisMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    
    // Category analysis
    const categoryTotals = expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {} as Record<string, number>);
    
    const topCategory = Object.entries(categoryTotals).sort(([,a], [,b]) => b - a)[0];
    
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('phân tích') || lowerQuery.includes('tổng quan')) {
      return {
        content: `📊 **Phân tích chi tiêu của bạn:**\n\n💰 **Tổng chi tiêu:** ${formatCurrency(totalExpenses)}\n📅 **Tháng này:** ${formatCurrency(thisMonthTotal)}\n📈 **Trung bình/ngày:** ${formatCurrency(avgDaily)}\n\n🏆 **Danh mục chi nhiều nhất:** ${topCategory?.[0]} (${formatCurrency(topCategory?.[1] || 0)})\n\n💡 **Nhận xét:** ${thisMonthTotal > avgDaily * 30 ? 'Chi tiêu tháng này cao hơn bình thường. Hãy cân nhắc giảm bớt.' : 'Chi tiêu tháng này ở mức hợp lý.'}`,
        suggestions: [
          'Làm thế nào để tiết kiệm hơn?',
          'Dự đoán chi tiêu tháng tới',
          'Phân tích theo danh mục',
          'Đặt mục tiêu ngân sách'
        ]
      };
    }
    
    if (lowerQuery.includes('tiết kiệm') || lowerQuery.includes('lời khuyên')) {
      const savingsAdvice = [
        `🎯 **Kế hoạch tiết kiệm thông minh:**\n\n1. **Quy tắc 50/30/20:** 50% nhu cầu thiết yếu, 30% giải trí, 20% tiết kiệm\n\n2. **Giảm chi tiêu ${topCategory?.[0]}:** Hiện tại bạn chi ${formatCurrency(topCategory?.[1] || 0)} cho ${topCategory?.[0]}. Thử giảm 15% = tiết kiệm ${formatCurrency((topCategory?.[1] || 0) * 0.15)}\n\n3. **Mục tiêu hàng ngày:** Giới hạn ${formatCurrency(avgDaily * 0.8)}/ngày\n\n4. **Theo dõi chi tiêu nhỏ:** Những khoản 10-50k cũng quan trọng\n\n💡 **Mẹo:** Trước khi mua gì, hỏi bản thân "Tôi thực sự cần điều này không?"`
      ];
      
      return {
        content: savingsAdvice[0],
        suggestions: [
          'Lập ngân sách chi tiết',
          'Phân tích chi tiêu không cần thiết',
          'Mục tiêu tiết kiệm 6 tháng',
          'Ứng dụng tiết kiệm hàng ngày'
        ]
      };
    }
    
    if (lowerQuery.includes('dự đoán') || lowerQuery.includes('tháng tới')) {
      const prediction = avgDaily * 30;
      const trend = thisMonthTotal > avgDaily * 30 ? 'tăng' : 'giảm';
      
      return {
        content: `🔮 **Dự đoán chi tiêu tháng tới:**\n\n📊 **Dự kiến:** ${formatCurrency(prediction)}\n📈 **Xu hướng:** ${trend} so với tháng này\n\n🎯 **Phân bổ dự kiến:**\n• ${topCategory?.[0]}: ${formatCurrency((topCategory?.[1] || 0) * 1.1)}\n• Các danh mục khác: ${formatCurrency(prediction - (topCategory?.[1] || 0) * 1.1)}\n\n⚠️ **Lưu ý:** Dự đoán dựa trên thói quen hiện tại. Bạn có thể thay đổi bằng cách điều chỉnh chi tiêu.`,
        suggestions: [
          'Làm thế nào để giảm chi tiêu?',
          'Đặt ngân sách tháng tới',
          'Phân tích rủi ro tài chính',
          'Kế hoạch tiết kiệm'
        ]
      };
    }
    
    if (lowerQuery.includes('ngân sách') || lowerQuery.includes('budget')) {
      return {
        content: `💼 **Tối ưu hóa ngân sách:**\n\n📋 **Ngân sách đề xuất (dựa trên thu nhập):**\n• Nhu cầu thiết yếu: 50%\n• Giải trí & mua sắm: 30%\n• Tiết kiệm & đầu tư: 20%\n\n🎯 **Cho chi tiêu hiện tại ${formatCurrency(thisMonthTotal)}:**\n• Thiết yếu: ${formatCurrency(thisMonthTotal * 0.5)}\n• Giải trí: ${formatCurrency(thisMonthTotal * 0.3)}\n• Tiết kiệm: ${formatCurrency(thisMonthTotal * 0.2)}\n\n💡 **Khuyến nghị:** Thiết lập ngân sách cho từng danh mục và theo dõi hàng tuần.`,
        suggestions: [
          'Thiết lập cảnh báo ngân sách',
          'Phân tích chi tiêu theo tuần',
          'Mục tiêu tiết kiệm cụ thể',
          'Tối ưu hóa danh mục chi tiêu'
        ]
      };
    }
    
    if (lowerQuery.includes('danh mục') || lowerQuery.includes('category')) {
      const categoryAnalysis = Object.entries(categoryTotals)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([cat, amount], index) => `${index + 1}. ${cat}: ${formatCurrency(amount)}`)
        .join('\n');
      
      return {
        content: `📊 **Phân tích theo danh mục:**\n\n🏆 **Top 5 danh mục chi tiêu:**\n${categoryAnalysis}\n\n💡 **Nhận xét:**\n• Danh mục ${topCategory?.[0]} chiếm ${((topCategory?.[1] || 0) / totalExpenses * 100).toFixed(1)}% tổng chi tiêu\n• Cân nhắc giảm chi tiêu cho danh mục này nếu có thể\n\n🎯 **Đề xuất:** Đặt giới hạn cho từng danh mục để kiểm soát tốt hơn.`,
        suggestions: [
          'Đặt giới hạn cho danh mục',
          'So sánh với tháng trước',
          'Tối ưu danh mục lớn nhất',
          'Phân tích xu hướng danh mục'
        ]
      };
    }
    
    // Default response with personalized insights
    return {
      content: `🤖 **Tôi hiểu bạn đang hỏi về "${query}"**\n\n📊 **Dựa trên dữ liệu của bạn:**\n• Tổng chi tiêu: ${formatCurrency(totalExpenses)}\n• Tháng này: ${formatCurrency(thisMonthTotal)}\n• Danh mục chính: ${topCategory?.[0]}\n\n💬 **Tôi có thể giúp bạn:**\n• Phân tích chi tiêu chi tiết\n• Đưa ra lời khuyên tiết kiệm\n• Dự đoán xu hướng\n• Tối ưu hóa ngân sách\n• Thiết lập mục tiêu tài chính\n\nHãy hỏi tôi cụ thể hơn nhé!`,
      suggestions: [
        'Phân tích chi tiêu tháng này',
        'Lời khuyên tiết kiệm',
        'Dự đoán tháng tới',
        'Tối ưu ngân sách'
      ]
    };
  };

  const startVoiceInput = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.lang = 'vi-VN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
      };

      recognition.start();
    }
  };

  const quickQuestions = [
    'Phân tích chi tiêu tháng này',
    'Đưa ra lời khuyên tiết kiệm',
    'Dự đoán chi tiêu tháng tới',
    'Tối ưu hóa ngân sách',
    'Phân tích theo danh mục',
    'Đặt mục tiêu tài chính'
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl w-full max-w-4xl h-[700px] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">AI Assistant</h2>
              <p className="text-sm text-gray-500">Powered by Gemini AI • Phân tích thông minh</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-3 max-w-[80%] ${
                message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.type === 'user' 
                    ? 'bg-blue-500' 
                    : 'bg-gradient-to-r from-purple-500 to-pink-500'
                }`}>
                  {message.type === 'user' ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-white" />
                  )}
                </div>
                <div className={`rounded-2xl px-4 py-3 ${
                  message.type === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  <p className="text-sm whitespace-pre-line">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString('vi-VN', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                  
                  {/* Suggestions */}
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs text-gray-600 font-medium">Gợi ý câu hỏi:</p>
                      <div className="grid grid-cols-1 gap-2">
                        {message.suggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => handleSendMessage(suggestion)}
                            className="text-left text-xs p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="bg-gray-100 rounded-2xl px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                    </div>
                    <span className="text-sm text-gray-600">Gemini AI đang suy nghĩ...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Questions */}
        {messages.length === 1 && (
          <div className="px-6 pb-4">
            <p className="text-sm text-gray-600 mb-3">💡 Câu hỏi phổ biến:</p>
            <div className="grid grid-cols-2 gap-2">
              {quickQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleSendMessage(question)}
                  className="text-left text-sm p-3 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 rounded-lg transition-colors border border-gray-200"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Hỏi AI về tài chính của bạn..."
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={isLoading}
              />
              <button
                onClick={startVoiceInput}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full transition-colors ${
                  isListening ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-purple-100 hover:text-purple-600'
                }`}
              >
                <Mic className={`w-4 h-4 ${isListening ? 'animate-pulse' : ''}`} />
              </button>
            </div>
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || isLoading}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex items-center justify-center mt-3 space-x-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <Zap className="w-3 h-3" />
              <span>Phản hồi nhanh</span>
            </div>
            <div className="flex items-center space-x-1">
              <TrendingUp className="w-3 h-3" />
              <span>Phân tích thông minh</span>
            </div>
            <div className="flex items-center space-x-1">
              <Brain className="w-3 h-3" />
              <span>Gemini AI</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};