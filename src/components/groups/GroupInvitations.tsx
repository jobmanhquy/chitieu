import React from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Users, 
  Heart, 
  Briefcase, 
  Folder, 
  Building, 
  Check, 
  X, 
  Clock,
  Crown,
  Eye,
  Share2
} from 'lucide-react';

interface GroupInvitation {
  id: string;
  groupName: string;
  groupType: string;
  invitedBy: string;
  invitedAt: Date;
  role: 'member' | 'viewer';
  status: 'pending';
}

interface GroupInvitationsProps {
  invitations: GroupInvitation[];
  onAccept: (invitationId: string) => void;
  onDecline: (invitationId: string) => void;
}

export const GroupInvitations: React.FC<GroupInvitationsProps> = ({
  invitations,
  onAccept,
  onDecline
}) => {
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

  if (invitations.length === 0) {
    return (
      <div className="text-center py-12">
        <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Không có lời mời nào</h3>
        <p className="text-gray-600">Bạn sẽ nhận được thông báo khi có lời mời tham gia nhóm mới</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-6">
        <Mail className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Lời mời tham gia nhóm</h3>
      </div>

      {invitations.map((invitation) => {
        const TypeIcon = getTypeIcon(invitation.groupType);
        const typeColor = getTypeColor(invitation.groupType);
        const typeLabel = getTypeLabel(invitation.groupType);
        const RoleIcon = getRoleIcon(invitation.role);

        return (
          <motion.div
            key={invitation.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                  <TypeIcon className={`w-6 h-6 ${typeColor}`} />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-semibold text-gray-900">{invitation.groupName}</h4>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      {typeLabel}
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>
                      <span className="font-medium">{invitation.invitedBy}</span> đã mời bạn tham gia nhóm
                    </p>
                    
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <RoleIcon className="w-4 h-4" />
                        <span>Vai trò: {invitation.role === 'member' ? 'Thành viên' : 'Người xem'}</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{invitation.invitedAt.toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      {invitation.role === 'member' 
                        ? 'Bạn sẽ có thể xem, thêm và chỉnh sửa chi tiêu trong nhóm này.'
                        : 'Bạn chỉ có thể xem chi tiêu và báo cáo của nhóm này.'
                      }
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => onDecline(invitation.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Từ chối"
                >
                  <X className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onAccept(invitation.id)}
                  className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  title="Chấp nhận"
                >
                  <Check className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex space-x-3">
                <button
                  onClick={() => onDecline(invitation.id)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  Từ chối
                </button>
                <button
                  onClick={() => onAccept(invitation.id)}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Tham gia nhóm
                </button>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};