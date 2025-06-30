import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Crown, Eye, Share2, X, Mail, Settings, Shield, UserCheck } from 'lucide-react';
import { formatCurrency } from '../utils/currency';
import { useFamilySharing } from '../hooks/useFamilySharing';
import { useExpenses } from '../hooks/useExpenses';
import { useAuth } from '../contexts/AuthContext';

interface FamilySharingProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FamilySharing: React.FC<FamilySharingProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { expenses } = useExpenses();
  const { 
    families, 
    currentFamily, 
    loading, 
    createFamily, 
    inviteMember, 
    removeMember, 
    updateMemberRole,
    getUserRole,
    hasPermission 
  } = useFamilySharing();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [newFamilyName, setNewFamilyName] = useState('');
  const [newFamilyDescription, setNewFamilyDescription] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'member' | 'viewer'>('member');

  const handleCreateFamily = async () => {
    if (!newFamilyName.trim()) return;
    
    try {
      await createFamily(newFamilyName, newFamilyDescription);
      setNewFamilyName('');
      setNewFamilyDescription('');
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating family:', error);
    }
  };

  const handleInviteMember = async () => {
    if (!inviteEmail.trim() || !currentFamily) return;
    
    try {
      await inviteMember(currentFamily.id, inviteEmail, inviteRole);
      setInviteEmail('');
      setShowInviteModal(false);
    } catch (error) {
      console.error('Error inviting member:', error);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!currentFamily) return;
    
    if (window.confirm('Bạn có chắc chắn muốn xóa thành viên này?')) {
      try {
        await removeMember(currentFamily.id, userId);
      } catch (error) {
        console.error('Error removing member:', error);
      }
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'member' | 'viewer') => {
    if (!currentFamily) return;
    
    try {
      await updateMemberRole(currentFamily.id, userId, newRole);
    } catch (error) {
      console.error('Error updating role:', error);
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

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return Crown;
      case 'member': return Share2;
      case 'viewer': return Eye;
      default: return Eye;
    }
  };

  // Calculate family expenses (mock for now - would need real family expense aggregation)
  const familyExpenses = currentFamily?.members.reduce((total, member) => {
    // In real implementation, this would aggregate expenses from all family members
    const memberExpenses = expenses.filter(exp => exp.userId === member.userId);
    return total + memberExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  }, 0) || 0;

  const currentUserRole = currentFamily ? getUserRole(currentFamily.id) : null;
  const canManageMembers = currentFamily ? hasPermission(currentFamily.id, 'canManageMembers') : false;
  const canManageSettings = currentFamily ? hasPermission(currentFamily.id, 'canManageSettings') : false;

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl p-8">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p>Đang tải dữ liệu gia đình...</p>
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
        className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {currentFamily ? currentFamily.name : 'Chia sẻ gia đình'}
              </h2>
              <p className="text-sm text-gray-500">
                {currentFamily ? 'Quản lý chi tiêu cùng gia đình' : 'Tạo hoặc tham gia nhóm gia đình'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {currentFamily && canManageSettings && (
              <button
                onClick={() => setShowSettingsModal(true)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <Settings className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        {!currentFamily ? (
          // No family - show create/join options
          <div className="p-8 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có nhóm gia đình</h3>
            <p className="text-gray-600 mb-6">Tạo nhóm mới hoặc chờ lời mời từ thành viên khác</p>
            
            <div className="space-y-4 max-w-md mx-auto">
              <button
                onClick={() => setShowCreateModal(true)}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Tạo nhóm gia đình</span>
              </button>
              
              <div className="text-sm text-gray-500">
                Hoặc chờ lời mời qua email từ thành viên khác
              </div>
            </div>
          </div>
        ) : (
          // Has family - show family details
          <>
            {/* Family Stats */}
            <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{currentFamily.members.length}</p>
                  <p className="text-sm text-gray-600">Thành viên</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(familyExpenses)}</p>
                  <p className="text-sm text-gray-600">Tổng chi tiêu</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {currentFamily.members.filter(m => m.isActive).length}
                  </p>
                  <p className="text-sm text-gray-600">Đang hoạt động</p>
                </div>
              </div>
            </div>

            {/* Members List */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Thành viên gia đình</h3>
                {canManageMembers && (
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Mời thành viên</span>
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {currentFamily.members.map((member) => {
                  const RoleIcon = getRoleIcon(member.role);
                  const isCurrentUser = member.userId === user?.uid;
                  
                  return (
                    <div key={member.userId} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
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
                              {isCurrentUser && <span className="text-blue-600 text-sm ml-1">(Bạn)</span>}
                            </h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                              <RoleIcon className="w-3 h-3 inline mr-1" />
                              {member.role === 'admin' ? 'Quản trị' : 
                               member.role === 'member' ? 'Thành viên' : 'Xem'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">{member.email}</p>
                          <p className="text-xs text-gray-400">
                            Tham gia: {member.joinedAt.toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {formatCurrency(0)} {/* Would show actual member expenses */}
                          </p>
                          <p className="text-sm text-gray-500">Chi tiêu tháng này</p>
                        </div>
                        
                        {canManageMembers && !isCurrentUser && (
                          <div className="flex items-center space-x-1">
                            <select
                              value={member.role}
                              onChange={(e) => handleRoleChange(member.userId, e.target.value as any)}
                              className="text-sm border border-gray-300 rounded px-2 py-1"
                            >
                              <option value="viewer">Xem</option>
                              <option value="member">Thành viên</option>
                              <option value="admin">Quản trị</option>
                            </select>
                            <button
                              onClick={() => handleRemoveMember(member.userId)}
                              className="p-1 text-red-400 hover:text-red-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pending Invitations */}
              {currentFamily.invitations.length > 0 && (
                <div className="mt-8">
                  <h4 className="font-medium text-gray-900 mb-4">Lời mời đang chờ</h4>
                  <div className="space-y-2">
                    {currentFamily.invitations.filter(inv => inv.status === 'pending').map((invitation) => (
                      <div key={invitation.id} className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{invitation.email}</p>
                          <p className="text-sm text-gray-600">
                            Vai trò: {invitation.role === 'member' ? 'Thành viên' : 'Xem'} • 
                            Hết hạn: {invitation.expiresAt.toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                        <div className="text-yellow-600">
                          <UserCheck className="w-5 h-5" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Permissions Info */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <h4 className="font-medium text-gray-900 mb-3">Quyền hạn của bạn</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${hasPermission(currentFamily.id, 'canViewExpenses') ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span>Xem chi tiêu</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${hasPermission(currentFamily.id, 'canAddExpenses') ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span>Thêm chi tiêu</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${hasPermission(currentFamily.id, 'canViewReports') ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span>Xem báo cáo</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${hasPermission(currentFamily.id, 'canManageMembers') ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span>Quản lý thành viên</span>
                </div>
              </div>
            </div>
          </>
        )}
      </motion.div>

      {/* Create Family Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-60">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tạo nhóm gia đình mới</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tên nhóm *</label>
                <input
                  type="text"
                  value={newFamilyName}
                  onChange={(e) => setNewFamilyName(e.target.value)}
                  placeholder="Ví dụ: Gia đình Nguyễn"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả (tùy chọn)</label>
                <textarea
                  value={newFamilyDescription}
                  onChange={(e) => setNewFamilyDescription(e.target.value)}
                  placeholder="Mô tả về nhóm gia đình..."
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
                onClick={handleCreateFamily}
                disabled={!newFamilyName.trim()}
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
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="Nhập email người muốn mời"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vai trò</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as 'member' | 'viewer')}
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
                disabled={!inviteEmail.trim()}
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