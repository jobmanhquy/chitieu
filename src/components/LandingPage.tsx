import React from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  BarChart3, 
  Target, 
  Shield, 
  Smartphone, 
  Zap,
  CheckCircle,
  ArrowRight,
  Star,
  Users,
  TrendingUp
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const features = [
    {
      icon: Brain,
      title: 'AI Gemini Thông Minh',
      description: 'Phân tích chi tiêu bằng AI tiên tiến nhất, đưa ra insights và khuyến nghị cá nhân hóa',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: BarChart3,
      title: 'Phân Tích Nâng Cao',
      description: 'Biểu đồ trực quan, báo cáo chi tiết và dự đoán xu hướng chi tiêu tương lai',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Target,
      title: 'Mục Tiêu Thông Minh',
      description: 'Thiết lập và theo dõi mục tiêu tài chính với AI hỗ trợ đạt được nhanh hơn',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Shield,
      title: 'Bảo Mật Tuyệt Đối',
      description: 'Dữ liệu được mã hóa và bảo vệ bởi Firebase với tiêu chuẩn enterprise',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: Smartphone,
      title: 'Đa Thiết Bị',
      description: 'Đồng bộ real-time trên mọi thiết bị, truy cập mọi lúc mọi nơi',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      icon: Zap,
      title: 'Thời Gian Thực',
      description: 'Cập nhật và phân tích dữ liệu ngay lập tức với hiệu suất cao',
      color: 'from-yellow-500 to-orange-500'
    }
  ];

  const benefits = [
    'Tiết kiệm 30% chi tiêu không cần thiết',
    'Đạt mục tiêu tài chính nhanh hơn 2x',
    'Hiểu rõ thói quen chi tiêu cá nhân',
    'Dự đoán và tránh rủi ro tài chính',
    'Tối ưu hóa ngân sách thông minh'
  ];

  const stats = [
    { number: '10K+', label: 'Người dùng tin tưởng' },
    { number: '95%', label: 'Độ chính xác AI' },
    { number: '24/7', label: 'Hỗ trợ liên tục' },
    { number: '99.9%', label: 'Thời gian hoạt động' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full px-6 py-2 mb-6">
                <Brain className="w-5 h-5 text-purple-600" />
                <span className="text-purple-800 font-medium">Powered by Gemini AI</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Quản Lý Chi Tiêu
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {' '}Thông Minh
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                Ứng dụng đầu tiên tại Việt Nam tích hợp AI Gemini để phân tích chi tiêu, 
                đưa ra insights thông minh và giúp bạn đạt được mục tiêu tài chính.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onGetStarted}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                >
                  <span>Bắt Đầu Miễn Phí</span>
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
                
                <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:border-gray-400 transition-all">
                  Xem Demo
                </button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-purple-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-green-200 rounded-full opacity-20 animate-pulse delay-2000"></div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tính Năng Vượt Trội
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Công nghệ AI tiên tiến kết hợp với thiết kế hiện đại, 
              mang đến trải nghiệm quản lý tài chính tốt nhất.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all"
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Tại Sao Chọn Chi Tiêu AI?
              </h2>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="flex items-center space-x-3"
                  >
                    <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                    <span className="text-white text-lg">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Phân Tích Thông Minh</h3>
                    <p className="text-blue-100 text-sm">Powered by Gemini AI</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="bg-white bg-opacity-10 rounded-lg p-3">
                    <div className="flex justify-between text-white text-sm mb-1">
                      <span>Chi tiêu tháng này</span>
                      <span>85% ngân sách</span>
                    </div>
                    <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
                      <div className="bg-green-400 h-2 rounded-full w-4/5"></div>
                    </div>
                  </div>
                  
                  <div className="bg-white bg-opacity-10 rounded-lg p-3">
                    <div className="text-white text-sm">
                      💡 AI khuyến nghị: Giảm 15% chi tiêu ăn uống để đạt mục tiêu tiết kiệm
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Sẵn Sàng Kiểm Soát Tài Chính?
          </h2>
          
          <p className="text-xl text-gray-600 mb-8">
            Tham gia cùng hàng nghìn người dùng đã thay đổi thói quen chi tiêu 
            và đạt được mục tiêu tài chính với AI.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onGetStarted}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition-all flex items-center justify-center space-x-2"
            >
              <span>Đăng Ký Miễn Phí</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </div>
          
          <div className="flex items-center justify-center space-x-1 text-yellow-500">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-current" />
            ))}
            <span className="ml-2 text-gray-600">4.9/5 từ 1,000+ đánh giá</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Brain className="w-8 h-8 text-purple-400" />
              <span className="text-2xl font-bold">Chi Tiêu AI</span>
            </div>
            
            <p className="text-gray-400 mb-6">
              Quản lý tài chính thông minh với công nghệ AI tiên tiến
            </p>
            
            <div className="border-t border-gray-800 pt-6">
              <p className="text-gray-500 text-sm">
                © 2025 Chi Tiêu AI. Powered by Gemini AI & Firebase.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};