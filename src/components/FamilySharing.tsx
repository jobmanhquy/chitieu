import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Crown, Eye, EyeOff, Share2, X, Mail } from 'lucide-react';
import { formatCurrency } from '../utils/currency';

interface FamilyMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member' | 'viewer';
  avatar?: string;
  totalExpenses: number;
  isOnline: boolean;
}

interface FamilySharingProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FamilySharing: React.FC<FamilySharingProps> = ({ isOpen, onClose }) => {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([
    {
      id: '1',
      name: 'Bạn',
      email: 'you@example.com',
      role: 'admin',
      totalExpenses: 2500000,
      isOnline: true
    },
    {
      id: '2',
      name: 'Nguyễn Văn A',
      email: 'a@example.com',
      role: 'member',
      totalExpenses: 1800000,
      isOnline: true
    },
    {
      id: '3',
      name: 'Trần Thị B',
      email: 'b@example.com',
      role: 'viewer',
      totalExpenses: 0,
      isOnline: false
    }
  ]);

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'member' | 'viewer'>('member');

  const handleInvite = () => {
    if (!inviteEmail) return;
    
    // Mock invite logic
    console.log(`Inviting ${inviteEmail} as ${inviteRole}`);
    setInviteEmail('');
    setShowInviteModal(false);
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

  const totalFamilyExpenses = familyMembers.reduce((sum, member) => sum + member.totalExpenses, 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Chia sẻ gia đình</h2>
              <p className="text-sm text-gray-500">Quản lý chi tiêu cùng gia đình</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Family Stats */}
        <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-900">{familyMembers.length}</p>
              <p className="text-sm text-gray-600">Thành viên</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalFamilyExpenses)}</p>
              <p className="text-sm text-gray-600">Tổng chi tiêu</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {familyMembers.filter(m => m.isOnline).length}
              </p>
              <p className="text-sm text-gray-600">Đang online</p>
            </div>
          </div>
        </div>

        {/* Members List */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Thành viên gia đình</h3>
            <button
              onClick={() => setShowInviteModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Mời thành viên</span>
            </button>
          </div>

          <div className="space-y-4">
            {familyMembers.map((member) => {
              const RoleIcon = getRoleIcon(member.role);
              
              return (
                <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {member.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      {member.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-gray-900">{member.name}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                          <RoleIcon className="w-3 h-3 inline mr-1" />
                          {member.role === 'admin' ? 'Quản trị' : 
                           member.role === 'member' ? 'Thành viên' : 'Xem'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{member.email}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(member.totalExpenses)}
                    </p>
                    <p className="text-sm text-gray-500">Chi tiêu tháng này</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Permissions */}
        <div className="p-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quyền hạn</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Quản trị viên</span>
              <span className="text-gray-900">Toàn quyền quản lý</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Thành viên</span>
              <span className="text-gray-900">Thêm/sửa chi tiêu của mình</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Người xem</span>
              <span className="text-gray-900">Chỉ xem báo cáo</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Invite Modal */}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
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
                  <option value="member">Thành viên</option>
                  <option value="viewer">Người xem</option>
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
                onClick={handleInvite}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
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