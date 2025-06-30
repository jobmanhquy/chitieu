import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Trophy, Users, Calendar, Target, Plus, Play, Pause, CheckCircle } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { Challenge } from '../../types/goals';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/date';

export const ChallengesManager: React.FC = () => {
  const { challenges, joinChallenge, updateChallengeProgress } = useStore();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const availableChallenges: Challenge[] = [
    {
      id: 'no-spend-week',
      title: 'Tuần không chi tiêu',
      description: 'Thử thách không chi tiêu không cần thiết trong 7 ngày',
      type: 'no_spend',
      duration: 7,
      targetValue: 0,
      currentProgress: 0,
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isActive: false,
      participants: 1247,
      reward: 'Huy hiệu "Tiết kiệm Master" + 100 điểm'
    },
    {
      id: 'budget-challenge',
      title: 'Thử thách ngân sách',
      description: 'Giữ chi tiêu dưới 2 triệu VND trong tháng',
      type: 'budget_limit',
      duration: 30,
      targetValue: 2000000,
      currentProgress: 0,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isActive: false,
      participants: 856,
      reward: 'Huy hiệu "Ngân sách Pro" + Phân tích AI miễn phí'
    },
    {
      id: 'savings-goal',
      title: 'Mục tiêu tiết kiệm',
      description: 'Tiết kiệm 1 triệu VND trong tháng này',
      type: 'savings_target',
      duration: 30,
      targetValue: 1000000,
      currentProgress: 0,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isActive: false,
      participants: 2341,
      reward: 'Huy hiệu "Tiết kiệm Vàng" + Tư vấn tài chính 1-1'
    },
    {
      id: 'category-reduction',
      title: 'Giảm chi ăn uống',
      description: 'Giảm 30% chi tiêu ăn uống so với tháng trước',
      type: 'category_reduction',
      duration: 30,
      targetValue: 30,
      currentProgress: 0,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isActive: false,
      participants: 1523,
      reward: 'Huy hiệu "Healthy Spender" + Recipe book'
    }
  ];

  const activeChallenges = challenges.filter(c => c.isActive);
  const completedChallenges = challenges.filter(c => !c.isActive && c.currentProgress >= c.targetValue);

  const handleJoinChallenge = (challenge: Challenge) => {
    const updatedChallenge = { ...challenge, isActive: true };
    joinChallenge(updatedChallenge);
  };

  const getProgressPercentage = (challenge: Challenge) => {
    if (challenge.type === 'no_spend') {
      const daysPassed = Math.floor((Date.now() - challenge.startDate.getTime()) / (24 * 60 * 60 * 1000));
      return (daysPassed / challenge.duration) * 100;
    }
    return (challenge.currentProgress / challenge.targetValue) * 100;
  };

  const getChallengeIcon = (type: string) => {
    switch (type) {
      case 'no_spend': return Zap;
      case 'budget_limit': return Target;
      case 'savings_target': return Trophy;
      case 'category_reduction': return Calendar;
      default: return Zap;
    }
  };

  const getChallengeColor = (type: string) => {
    switch (type) {
      case 'no_spend': return 'from-red-500 to-pink-500';
      case 'budget_limit': return 'from-blue-500 to-cyan-500';
      case 'savings_target': return 'from-green-500 to-emerald-500';
      case 'category_reduction': return 'from-purple-500 to-indigo-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Thử thách tài chính</h1>
          <p className="text-gray-600">Tham gia thử thách để cải thiện thói quen chi tiêu</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo thử thách</span>
        </button>
      </div>

      {/* Active Challenges */}
      {activeChallenges.length > 0 && (
        <div className="bg-white rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
            <Play className="w-6 h-6 text-green-500" />
            <span>Thử thách đang tham gia</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeChallenges.map((challenge) => {
              const Icon = getChallengeIcon(challenge.type);
              const progress = getProgressPercentage(challenge);
              const isCompleted = progress >= 100;
              
              return (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border-2 border-green-200 bg-green-50 rounded-xl p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 bg-gradient-to-r ${getChallengeColor(challenge.type)} rounded-xl flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{challenge.title}</h3>
                        <p className="text-sm text-gray-600">{challenge.description}</p>
                      </div>
                    </div>
                    {isCompleted && (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tiến độ</span>
                      <span className="font-medium">{progress.toFixed(1)}%</span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ${
                          isCompleted ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Kết thúc: {formatDate(challenge.endDate)}</span>
                      <span className="text-gray-600">{challenge.participants} người tham gia</span>
                    </div>

                    <div className="bg-white bg-opacity-50 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <Trophy className="w-4 h-4 text-yellow-600" />
                        <span className="text-sm font-medium text-gray-800">{challenge.reward}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Available Challenges */}
      <div className="bg-white rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
          <Zap className="w-6 h-6 text-purple-500" />
          <span>Thử thách có sẵn</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {availableChallenges.map((challenge) => {
            const Icon = getChallengeIcon(challenge.type);
            const isJoined = challenges.some(c => c.id === challenge.id);
            
            return (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 bg-gradient-to-r ${getChallengeColor(challenge.type)} rounded-xl flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{challenge.title}</h3>
                      <p className="text-sm text-gray-600">{challenge.description}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Thời gian:</span>
                    <span className="font-medium">{challenge.duration} ngày</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Người tham gia:</span>
                    <span className="font-medium">{challenge.participants.toLocaleString()}</span>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <Trophy className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm font-medium text-gray-800">{challenge.reward}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleJoinChallenge(challenge)}
                    disabled={isJoined}
                    className={`w-full py-3 rounded-lg font-medium transition-colors ${
                      isJoined
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg'
                    }`}
                  >
                    {isJoined ? 'Đã tham gia' : 'Tham gia thử thách'}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Completed Challenges */}
      {completedChallenges.length > 0 && (
        <div className="bg-white rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <span>Thử thách đã hoàn thành</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {completedChallenges.map((challenge) => {
              const Icon = getChallengeIcon(challenge.type);
              
              return (
                <div key={challenge.id} className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className={`w-10 h-10 bg-gradient-to-r ${getChallengeColor(challenge.type)} rounded-lg flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{challenge.title}</h4>
                      <p className="text-sm text-green-600">Hoàn thành</p>
                    </div>
                  </div>
                  
                  <div className="bg-white bg-opacity-50 rounded p-2">
                    <div className="flex items-center space-x-2">
                      <Trophy className="w-4 h-4 text-yellow-600" />
                      <span className="text-xs text-gray-700">{challenge.reward}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Challenge Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white">
          <div className="flex items-center space-x-3">
            <Zap className="w-8 h-8" />
            <div>
              <p className="text-purple-100">Đang tham gia</p>
              <p className="text-2xl font-bold">{activeChallenges.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-6 text-white">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-8 h-8" />
            <div>
              <p className="text-green-100">Đã hoàn thành</p>
              <p className="text-2xl font-bold">{completedChallenges.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-6 text-white">
          <div className="flex items-center space-x-3">
            <Users className="w-8 h-8" />
            <div>
              <p className="text-blue-100">Cộng đồng</p>
              <p className="text-2xl font-bold">12.5K</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};