import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Users, 
  Settings, 
  Plus, 
  Crown, 
  Share2, 
  Eye, 
  MoreVertical,
  Calendar,
  DollarSign,
  TrendingUp,
  PieChart,
  BarChart3,
  FileText,
  Download,
  Upload,
  Trash2,
  Edit3,
  Heart,
  Briefcase,
  Folder,
  Building
} from 'lucide-react';
import { Group } from '../../services/groupService';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/date';

interface GroupDetailProps {
  group: Group;
  onBack: () => void;
  onInviteMember: () => void;
}

export const GroupDetail: React.FC<GroupDetailProps> = ({ 
  group, 
  onBack, 
  onInviteMember 
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'expenses' | 'reports' | 'settings'>('overview');

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'family': return Heart;
      case 'friends': return Users;
      case 'work': return Briefcase;
      case 'project': return Folder;
      default: return Building;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'family': return 'text-red-500';
      case 'friends': return 'text-blue-500';
      case 'work': return 'text-green-500';
      case 'project': return 'text-purple-500';
      default: return 'text-gray-500';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'family': return 'Gia đình';
      case 'friends': return 'Bạn bè';
      case 'work': return 'Công việc';
      case 'project': return 'Dự án';
      default: return 'Khác';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return Crown;
      case 'member': return Share2;
      case 'viewer': return Eye;
      default: return Eye;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'member': return 'bg-blue-100 text-blue-800';
      case 'viewer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const TypeIcon = getTypeIcon(group.type);
  const typeColor = getTypeColor(group.type);
  const typeLabel = getTypeLabel(group.type);

  // Mock data for group expenses
  const groupStats = {
    totalExpenses: 15420000,
    thisMonth: 3250000,
    lastMonth: 2890000,
    memberCount: group.members.length,
    activeMembers: group.members.filter(m => m.isActive).length
  };

  const tabs = [
    { id: 'overview', label: 'Tổng quan', icon: BarChart3 },
    { id: 'members', label: 'Thành viên', icon: Users },
    { id: 'expenses', label: 'Chi tiêu', icon: DollarSign },
    { id: 'reports', label: 'Báo cáo', icon: FileText },
    { id: 'settings', label: 'Cài đặt', icon: Settings }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                <div className="flex items-center space-x-3">
                  <DollarSign className="w-8 h-8" />
                  <div>
                    <p className="text-blue-100">Tổng chi tiêu</p>
                    <p className="text-2xl font-bold">{formatCurrency(groupStats.totalExpenses)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-8 h-8" />
                  <div>
                    <p className="text-green-100">Tháng này</p>
                    <p className="text-2xl font-bold">{formatCurrency(groupStats.thisMonth)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="w-8 h-8" />
                  <div>
                    <p className="text-purple-100">Tăng trưởng</p>
                    <p className="text-2xl font-bold">+12.5%</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
                <div className="flex items-center space-x-3">
                  <Users className="w-8 h-8" />
                  <div>
                    <p className="text-orange-100">Thành viên</p>
                    <p className="text-2xl font-bold">{groupStats.activeMembers}/{groupStats.memberCount}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Hoạt động gần đây</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Nguyễn Văn A đã thêm chi tiêu</p>
                    <p className="text-sm text-gray-600">Ăn trưa - {formatCurrency(150000)} • 2 giờ trước</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Trần Thị B đã tham gia nhóm</p>
                    <p className="text-sm text-gray-600">1 ngày trước</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <FileText className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Báo cáo tháng 12 đã được tạo</p>
                    <p className="text-sm text-gray-600">3 ngày trước</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'members':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Thành viên nhóm</h3>
              <button
                onClick={onInviteMember}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Mời thành viên</span>
              </button>
            </div>

            <div className="space-y-4">
              {group.members.map((member) => {
                const RoleIcon = getRoleIcon(member.role);
                const roleColor = getRoleColor(member.role);

                return (
                  <div key={member.userId} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold">
                            {member.displayName.charAt(0).toUpperCase() || member.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        {member.isActive && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                      </div>
                      
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-gray-900">
                            {member.displayName || member.email}
                          </h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColor}`}>
                            <RoleIcon className="w-3 h-3 inline mr-1" />
                            {member.role === 'admin' ? 'Quản trị' : 
                             member.role === 'member' ? 'Thành viên' : 'Xem'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">{member.email}</p>
                        <p className="text-xs text-gray-400">
                          Tham gia: {formatDate(member.joinedAt)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(0)} {/* Chi tiêu của thành viên */}
                        </p>
                        <p className="text-sm text-gray-500">Chi tiêu tháng này</p>
                      </div>
                      
                      <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pending Invitations */}
            {group.invitations.filter(inv => inv.status === 'pending').length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Lời mời đang chờ</h4>
                <div className="space-y-2">
                  {group.invitations.filter(inv => inv.status === 'pending').map((invitation) => (
                    <div key={invitation.id} className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{invitation.email}</p>
                        <p className="text-sm text-gray-600">
                          Vai trò: {invitation.role === 'member' ? 'Thành viên' : 'Xem'} • 
                          Hết hạn: {formatDate(invitation.expiresAt)}
                        </p>
                      </div>
                      <div className="text-yellow-600">
                        <Calendar className="w-5 h-5" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'expenses':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Chi tiêu nhóm</h3>
              <div className="flex space-x-2">
                <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>Xuất</span>
                </button>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Thêm chi tiêu</span>
                </button>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="text-center py-8">
                <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Chưa có chi tiêu nào</h4>
                <p className="text-gray-600 mb-4">Bắt đầu thêm chi tiêu để theo dõi ngân sách nhóm</p>
                <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                  Thêm chi tiêu đầu tiên
                </button>
              </div>
            </div>
          </div>
        );

      case 'reports':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Báo cáo nhóm</h3>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Tạo báo cáo</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <PieChart className="w-6 h-6 text-blue-600" />
                  <h4 className="font-semibold text-gray-900">Báo cáo tháng</h4>
                </div>
                <p className="text-gray-600 mb-4">Tổng quan chi tiêu theo danh mục và thành viên</p>
                <button className="w-full bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100 transition-colors">
                  Xem báo cáo tháng 12
                </button>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <BarChart3 className="w-6 h-6 text-green-600" />
                  <h4 className="font-semibold text-gray-900">Báo cáo quý</h4>
                </div>
                <p className="text-gray-600 mb-4">Phân tích xu hướng và so sánh theo quý</p>
                <button className="w-full bg-green-50 text-green-600 py-2 rounded-lg hover:bg-green-100 transition-colors">
                  Xem báo cáo Q4 2024
                </button>
              </div>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Cài đặt nhóm</h3>

            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h4 className="font-medium text-gray-900 mb-4">Thông tin cơ bản</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tên nhóm</label>
                    <input
                      type="text"
                      value={group.name}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
                    <textarea
                      value={group.description || ''}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h4 className="font-medium text-gray-900 mb-4">Quyền hạn</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Cho phép thành viên mời người khác</p>
                      <p className="text-sm text-gray-600">Thành viên có thể gửi lời mời tham gia nhóm</p>
                    </div>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-6" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Yêu cầu phê duyệt chi tiêu</p>
                      <p className="text-sm text-gray-600">Chi tiêu cần được quản trị viên phê duyệt</p>
                    </div>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-1" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <h4 className="font-medium text-red-900 mb-4">Vùng nguy hiểm</h4>
                <div className="space-y-4">
                  <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2">
                    <Trash2 className="w-4 h-4" />
                    <span>Xóa nhóm</span>
                  </button>
                  <p className="text-sm text-red-700">
                    Hành động này không thể hoàn tác. Tất cả dữ liệu nhóm sẽ bị xóa vĩnh viễn.
                  </p>
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
      <div className="flex items-center space-x-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        
        <div className="flex items-center space-x-4 flex-1">
          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
            <TypeIcon className={`w-6 h-6 ${typeColor}`} />
          </div>
          
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{group.name}</h2>
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <span>{typeLabel}</span>
              <span>•</span>
              <span>{group.members.length} thành viên</span>
              <span>•</span>
              <span>Tạo {formatDate(group.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
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
      <div>
        {renderTabContent()}
      </div>
    </div>
  );
};