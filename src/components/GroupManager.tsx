import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Crown, Eye, Share2, X, Mail, Settings, Shield, UserCheck, Building, Heart, Briefcase, Folder } from 'lucide-react';
import { formatCurrency } from '../utils/currency';
import { useGroupSharing } from '../hooks/useGroupSharing';
import { useExpenses } from '../hooks/useExpenses';
import { useAuth } from '../contexts/AuthContext';
import { Group } from '../services/groupService';

interface GroupManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GroupManager: React.FC<GroupManagerProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { expenses } = useExpenses();
  const { 
    groups, 
    currentGroup, 
    loading, 
    createGroup, 
    inviteMember, 
    removeMember, 
    updateMemberRole,
    getUserRole,
    hasPermission 
  } = useGroupSharing();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [newGroupData, setNewGroupData] = useState({
    name: '',
    description: '',
    type: 'family' as Group['type']
  });
  const [inviteData, setInviteData] = useState({
    email: '',
    role: 'member' as 'member' | 'viewer'
  });

  const groupTypes = [
    { value: 'family', label: 'Gia đình', icon: Heart, color: 'text-red-500' },
    { value: 'friends', label: 'Bạn bè', icon: Users, color: 'text-blue-500' },
    { value: 'work', label: 'Công việc', icon: Briefcase, color: 'text-green-500' },
    { value: 'project', label: 'Dự án', icon: Folder, color: 'text-purple-500' },
    { value: 'other', label: 'Khác', icon: Building, color: 'text-gray-500' }
  ];

  const handleCreateGroup = async () => {
    if (!newGroupData.name.trim()) return;
    
    try {
      await createGroup(newGroupData.name, newGroupData.type, newGroupData.description);
      setNewGroupData({ name: '', description: '', type: 'family' });
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  const handleInviteMember = async () => {
    if (!inviteData.email.trim() || !currentGroup) return;
    
    try {
      await inviteMember(currentGroup.id, inviteData.email, inviteData.role);
      setInviteData({ email: '', role: 'member' });
      setShowInviteModal(false);
    } catch (error) {
      console.error('Error inviting member:', error);
    }
  };

  const getTypeIcon = (type: string) => {
    const typeConfig = groupTypes.find(t => t.value === type);
    return typeConfig?.icon || Building;
  };

  const getTypeColor = (type: string) => {
    const typeConfig = groupTypes.find(t => t.value === type);
    return typeConfig?.color || 'text-gray-500';
  };

  const getTypeLabel = (type: string) => {
    const typeConfig = groupTypes.find(t => t.value === type);
    return typeConfig?.label || 'Khác';
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl p-8">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p>Đang tải dữ liệu nhóm...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Quản lý nhóm</h2>
              <p className="text-sm text-gray-500">Tạo và quản lý các nhóm chi tiêu</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Groups Grid */}
        <div className="p-6">
          {groups.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có nhóm nào</h3>
              <p className="text-gray-600 mb-6">Tạo nhóm đầu tiên để bắt đầu chia sẻ chi tiêu</p>
              
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
              >
                <Plus className="w-5 h-5" />
                <span>Tạo nhóm đầu tiên</span>
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Các nhóm của bạn</h3>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tạo nhóm mới</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groups.map((group) => {
                  const TypeIcon = getTypeIcon(group.type);
                  const typeColor = getTypeColor(group.type);
                  const userRole = getUserRole(group.id);
                  const canManage = hasPermission(group.id, 'canManageMembers');
                  
                  return (
                    <motion.div
                      key={group.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center`}>
                            <TypeIcon className={`w-6 h-6 ${typeColor}`} />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{group.name}</h4>
                            <p className="text-sm text-gray-500">{getTypeLabel(group.type)}</p>
                          </div>
                        </div>
                        
                        {userRole && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            userRole === 'admin' ? 'bg-purple-100 text-purple-800' :
                            userRole === 'member' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {userRole === 'admin' ? 'Quản trị' : 
                             userRole === 'member' ? 'Thành viên' : 'Xem'}
                          </span>
                        )}
                      </div>

                      {group.description && (
                        <p className="text-sm text-gray-600 mb-4">{group.description}</p>
                      )}

                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Thành viên:</span>
                          <span className="font-medium">{group.members.length}</span>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Hoạt động:</span>
                          <span className="font-medium">
                            {group.members.filter(m => m.isActive).length} người
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Tạo:</span>
                          <span className="font-medium">
                            {group.createdAt.toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center space-x-2">
                          {canManage && (
                            <button
                              onClick={() => setShowInviteModal(true)}
                              className="flex-1 bg-blue-50 text-blue-600 py-2 px-3 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                            >
                              Mời thành viên
                            </button>
                          )}
                          <button className="flex-1 bg-gray-50 text-gray-600 py-2 px-3 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium">
                            Xem chi tiết
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-60">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tạo nhóm mới</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tên nhóm *</label>
                <input
                  type="text"
                  value={newGroupData.name}
                  onChange={(e) => setNewGroupData({...newGroupData, name: e.target.value})}
                  placeholder="Ví dụ: Gia đình Nguyễn, Nhóm bạn thân..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Loại nhóm</label>
                <div className="grid grid-cols-2 gap-2">
                  {groupTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.value}
                        onClick={() => setNewGroupData({...newGroupData, type: type.value})}
                        className={`p-3 border-2 rounded-lg flex flex-col items-center space-y-1 transition-colors ${
                          newGroupData.type === type.value 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${type.color}`} />
                        <span className="text-xs font-medium">{type.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả (tùy chọn)</label>
                <textarea
                  value={newGroupData.description}
                  onChange={(e) => setNewGroupData({...newGroupData, description: e.target.value})}
                  placeholder="Mô tả về nhóm..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleCreateGroup}
                disabled={!newGroupData.name.trim()}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                Tạo nhóm
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-60">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Mời thành viên mới</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  value={inviteData.email}
                  onChange={(e) => setInviteData({...inviteData, email: e.target.value})}
                  placeholder="Nhập email người muốn mời"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vai trò</label>
                <select
                  value={inviteData.role}
                  onChange={(e) => setInviteData({...inviteData, role: e.target.value as 'member' | 'viewer'})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="member">Thành viên - Có thể thêm/sửa chi tiêu</option>
                  <option value="viewer">Người xem - Chỉ xem báo cáo</option>
                </select>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowInviteModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleInviteMember}
                disabled={!inviteData.email.trim()}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                Gửi lời mời
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};