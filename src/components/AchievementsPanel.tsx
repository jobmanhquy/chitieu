import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Lock, Gift, Calendar, Target, PiggyBank, Grid, BookOpen, Shield } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useExpenses } from '../hooks/useExpenses';
import { AchievementService } from '../services/achievementService';

export const AchievementsPanel: React.FC = () => {
  const { achievements, unlockAchievement } = useStore();
  const { expenses } = useExpenses();
  const achievementService = AchievementService.getInstance();

  useEffect(() => {
    // Initialize achievements if empty
    if (achievements.length === 0) {
      const defaultAchievements = achievementService.getDefaultAchievements();
      // This would need to be implemented in the store
      // For now, we'll check achievements manually
    }

    // Check for new achievements
    const updatedAchievements = achievementService.checkAchievements(expenses, achievements);
    updatedAchievements.forEach(achievement => {
      if (achievement.isUnlocked && !achievements.find(a => a.id === achievement.id)?.isUnlocked) {
        unlockAchievement(achievement.id);
      }
    });
  }, [expenses, achievements]);

  const getAchievementIcon = (iconName: string) => {
    const icons = {
      Trophy,
      Star,
      Calendar,
      Shield,
      PiggyBank,
      Gem: Star,
      Grid,
      BookOpen
    };
    return icons[iconName as keyof typeof icons] || Trophy;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'streak': return 'from-orange-400 to-red-500';
      case 'savings': return 'from-green-400 to-blue-500';
      case 'budget': return 'from-blue-400 to-purple-500';
      case 'category': return 'from-purple-400 to-pink-500';
      case 'milestone': return 'from-yellow-400 to-orange-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const unlockedAchievements = achievements.filter(a => a.isUnlocked);
  const lockedAchievements = achievements.filter(a => !a.isUnlocked);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Thành tích</h1>
        <p className="text-gray-600">
          Đã mở khóa {unlockedAchievements.length} / {achievements.length} thành tích
        </p>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 mt-4 max-w-md mx-auto">
          <div
            className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${(unlockedAchievements.length / achievements.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Unlocked Achievements */}
      {unlockedAchievements.length > 0 && (
        <div className="bg-white rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <span>Thành tích đã mở khóa</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unlockedAchievements.map((achievement) => {
              const Icon = getAchievementIcon(achievement.icon);
              
              return (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  className="relative bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-6 hover:shadow-lg transition-all"
                >
                  <div className="absolute top-2 right-2">
                    <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                      <Star className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  
                  <div className={`w-12 h-12 bg-gradient-to-r ${getTypeColor(achievement.type)} rounded-xl flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  
                  <h3 className="font-bold text-gray-900 mb-2">{achievement.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                  
                  {achievement.reward && (
                    <div className="bg-white bg-opacity-50 rounded-lg p-2 mb-3">
                      <div className="flex items-center space-x-2">
                        <Gift className="w-4 h-4 text-orange-600" />
                        <span className="text-xs font-medium text-orange-800">{achievement.reward}</span>
                      </div>
                    </div>
                  )}
                  
                  {achievement.unlockedAt && (
                    <p className="text-xs text-gray-500">
                      Mở khóa: {achievement.unlockedAt.toLocaleDateString('vi-VN')}
                    </p>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Locked Achievements */}
      {lockedAchievements.length > 0 && (
        <div className="bg-white rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
            <Lock className="w-6 h-6 text-gray-400" />
            <span>Thành tích chưa mở khóa</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lockedAchievements.map((achievement) => {
              const Icon = getAchievementIcon(achievement.icon);
              const progressPercentage = (achievement.progress / achievement.requirement) * 100;
              
              return (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative bg-gray-50 border-2 border-gray-200 rounded-xl p-6 hover:shadow-md transition-all"
                >
                  <div className="absolute top-2 right-2">
                    <Lock className="w-5 h-5 text-gray-400" />
                  </div>
                  
                  <div className="w-12 h-12 bg-gray-300 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-gray-500" />
                  </div>
                  
                  <h3 className="font-bold text-gray-700 mb-2">{achievement.title}</h3>
                  <p className="text-sm text-gray-500 mb-3">{achievement.description}</p>
                  
                  {/* Progress */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Tiến độ</span>
                      <span>{achievement.progress} / {achievement.requirement}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                      />
                    </div>
                  </div>
                  
                  {achievement.reward && (
                    <div className="bg-gray-100 rounded-lg p-2">
                      <div className="flex items-center space-x-2">
                        <Gift className="w-4 h-4 text-gray-500" />
                        <span className="text-xs text-gray-600">{achievement.reward}</span>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Achievement Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-6 text-white">
          <div className="flex items-center space-x-3">
            <Trophy className="w-8 h-8" />
            <div>
              <p className="text-yellow-100">Tổng thành tích</p>
              <p className="text-2xl font-bold">{unlockedAchievements.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl p-6 text-white">
          <div className="flex items-center space-x-3">
            <Target className="w-8 h-8" />
            <div>
              <p className="text-blue-100">Đang theo đuổi</p>
              <p className="text-2xl font-bold">{lockedAchievements.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-2xl p-6 text-white">
          <div className="flex items-center space-x-3">
            <Star className="w-8 h-8" />
            <div>
              <p className="text-green-100">Tỷ lệ hoàn thành</p>
              <p className="text-2xl font-bold">
                {achievements.length > 0 ? Math.round((unlockedAchievements.length / achievements.length) * 100) : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};