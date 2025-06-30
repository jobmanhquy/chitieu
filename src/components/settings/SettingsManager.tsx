import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Database,
  Download,
  Trash2,
  Eye,
  EyeOff,
  Moon,
  Sun,
  Monitor
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useAuth } from '../../contexts/AuthContext';
import { useExpenses } from '../../hooks/useExpenses';
import toast from 'react-hot-toast';

export const SettingsManager: React.FC = () => {
  const { user, updateProfile, deleteAccount } = useAuth();
  const { expenses } = useExpenses();
  const { theme, currency, language, setTheme, setCurrency, setLanguage } = useStore();
  
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'notifications' | 'privacy' | 'data'>('profile');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [profileData, setProfileData] = useState({
    displayName: user?.displayName || '',
    email: user?.email || ''
  });
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    weeklyReports: true,
    monthlyReports: true,
    budgetAlerts: true,
    expenseReminders: false
  });
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'private' as 'public' | 'friends' | 'private',
    dataSharing: false,
    analyticsTracking: true,
    marketingEmails: false
  });

  const tabs = [
    { id: 'profile', label: 'Hồ sơ', icon: User },
    { id: 'preferences', label: 'Tùy chọn', icon: Palette },
    { id: 'notifications', label: 'Thông báo', icon: Bell },
    { id: 'privacy', label: 'Riêng tư', icon: Shield },
    { id: 'data', label: 'Dữ liệu', icon: Database }
  ];

  const handleProfileUpdate = async () => {
    try {
      await updateProfile({
        displayName: profileData.displayName
      });
      toast.success('Đã cập nhật hồ sơ!');
    } catch (error) {
      toast.error('Không thể cập nhật hồ sơ');
    }
  };

  const handleExportData = () => {
    const dataToExport = {
      user: {
        email: user?.email,
        displayName: user?.displayName,
        createdAt: user?.createdAt
      },
      expenses: expenses,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chi-tieu-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Đã xuất dữ liệu thành công!');
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác.')) {
      try {
        await deleteAccount();
        toast.success('Tài khoản đã được xóa');
      } catch (error) {
        toast.error('Không thể xóa tài khoản');
      }
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin cá nhân</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tên hiển thị</label>
                  <input
                    type="text"
                    value={profileData.displayName}
                    onChange={(e) => setProfileData({...profileData, displayName: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={profileData.email}
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">Email không thể thay đổi</p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${user?.emailVerified ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                  <span className="text-sm text-gray-600">
                    {user?.emailVerified ? 'Email đã xác thực' : 'Email chưa xác thực'}
                  </span>
                </div>
                
                <button
                  onClick={handleProfileUpdate}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Cập nhật hồ sơ
                </button>
              </div>
            </div>
          </div>
        );

      case 'preferences':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Giao diện</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Chủ đề</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'light', label: 'Sáng', icon: Sun },
                      { value: 'dark', label: 'Tối', icon: Moon },
                      { value: 'system', label: 'Hệ thống', icon: Monitor }
                    ].map((option) => {
                      const Icon = option.icon;
                      return (
                        <button
                          key={option.value}
                          onClick={() => setTheme(option.value as any)}
                          className={`p-4 border-2 rounded-lg flex flex-col items-center space-y-2 transition-colors ${
                            theme === option.value 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Icon className="w-6 h-6" />
                          <span className="text-sm font-medium">{option.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tiền tệ</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as any)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="VND">Việt Nam Đồng (₫)</option>
                    <option value="USD">US Dollar ($)</option>
                    <option value="EUR">Euro (€)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ngôn ngữ</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as any)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="vi">Tiếng Việt</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cài đặt thông báo</h3>
              
              <div className="space-y-4">
                {Object.entries(notificationSettings).map(([key, value]) => {
                  const labels = {
                    emailNotifications: 'Thông báo qua email',
                    pushNotifications: 'Thông báo đẩy',
                    weeklyReports: 'Báo cáo hàng tuần',
                    monthlyReports: 'Báo cáo hàng tháng',
                    budgetAlerts: 'Cảnh báo ngân sách',
                    expenseReminders: 'Nhắc nhở ghi chi tiêu'
                  };
                  
                  return (
                    <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">{labels[key as keyof typeof labels]}</h4>
                        <p className="text-sm text-gray-600">
                          {key === 'emailNotifications' && 'Nhận thông báo qua email'}
                          {key === 'pushNotifications' && 'Nhận thông báo trên thiết bị'}
                          {key === 'weeklyReports' && 'Báo cáo tổng kết hàng tuần'}
                          {key === 'monthlyReports' && 'Báo cáo tổng kết hàng tháng'}
                          {key === 'budgetAlerts' && 'Cảnh báo khi vượt ngân sách'}
                          {key === 'expenseReminders' && 'Nhắc nhở ghi chép chi tiêu hàng ngày'}
                        </p>
                      </div>
                      <button
                        onClick={() => setNotificationSettings({
                          ...notificationSettings,
                          [key]: !value
                        })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          value ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            value ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quyền riêng tư</h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Hiển thị hồ sơ</h4>
                  <select
                    value={privacySettings.profileVisibility}
                    onChange={(e) => setPrivacySettings({
                      ...privacySettings,
                      profileVisibility: e.target.value as any
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="private">Riêng tư</option>
                    <option value="friends">Bạn bè</option>
                    <option value="public">Công khai</option>
                  </select>
                </div>
                
                {Object.entries(privacySettings).filter(([key]) => key !== 'profileVisibility').map(([key, value]) => {
                  const labels = {
                    dataSharing: 'Chia sẻ dữ liệu',
                    analyticsTracking: 'Theo dõi phân tích',
                    marketingEmails: 'Email marketing'
                  };
                  
                  return (
                    <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">{labels[key as keyof typeof labels]}</h4>
                        <p className="text-sm text-gray-600">
                          {key === 'dataSharing' && 'Cho phép chia sẻ dữ liệu ẩn danh để cải thiện dịch vụ'}
                          {key === 'analyticsTracking' && 'Theo dõi cách sử dụng ứng dụng để cải thiện trải nghiệm'}
                          {key === 'marketingEmails' && 'Nhận email về tính năng mới và khuyến mãi'}
                        </p>
                      </div>
                      <button
                        onClick={() => setPrivacySettings({
                          ...privacySettings,
                          [key]: !value
                        })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          value ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            value ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case 'data':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quản lý dữ liệu</h3>
              
              <div className="space-y-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Xuất dữ liệu</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Tải xuống tất cả dữ liệu của bạn dưới định dạng JSON
                  </p>
                  <button
                    onClick={handleExportData}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Xuất dữ liệu</span>
                  </button>
                </div>
                
                <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                  <h4 className="font-medium text-red-900 mb-2">Xóa tài khoản</h4>
                  <p className="text-sm text-red-700 mb-4">
                    Xóa vĩnh viễn tài khoản và tất cả dữ liệu liên quan. Hành động này không thể hoàn tác.
                  </p>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Xóa tài khoản</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cài đặt</h1>
        <p className="text-gray-600">Quản lý tài khoản và tùy chọn ứng dụng</p>
      </div>

      <div className="bg-white rounded-2xl overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Xác nhận xóa tài khoản</h3>
            <p className="text-gray-600 mb-6">
              Bạn có chắc chắn muốn xóa tài khoản? Tất cả dữ liệu sẽ bị mất vĩnh viễn và không thể khôi phục.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors"
              >
                Xóa tài khoản
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};