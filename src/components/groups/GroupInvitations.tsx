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
  Share2,
  AlertCircle
} from 'lucide-react';

interface GroupInvitation {
  id: string;
  groupName: string;
  groupType: string;
  invitedBy: string;
  invitedAt: Date;
  role: 'member' | 'viewer';
  status: 'pending';
  groupId?: string;
  invitationId?: string;
}

interface GroupInvitationsProps {
  invitations: GroupInvitation[];
  onAccept: (invitation: GroupInvitation) => void;
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
        <p className="text-gray-600 mb-4">Bạn sẽ nhận được thông báo khi có lời mời tham gia nhóm mới</p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">Cách nhận lời mời:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Người khác mời bạn qua email trong ứng dụng</li>
                <li>Bạn sẽ nhận thông báo trong tab "Thông báo"</li>
                <li>Lời mời sẽ xuất hiện ở đây để bạn phản hồi</li>
                <li>Bạn có thể chấp nhận hoặc từ chối lời mời</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-6">
        <Mail className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Lời mời tham gia nhóm</h3>
        <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
          {invitations.length} mới
        </span>
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
            className="bg-white border-2 border-blue-200 rounded-xl p-6 hover:shadow-md transition-all"
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
                    <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
                      Mới
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
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
                      <strong>Quyền hạn:</strong> {invitation.role === 'member' 
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
                  onClick={() => onAccept(invitation)}
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
                  onClick={() => onAccept(invitation)}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Tham gia nhóm
                </button>
              </div>
            </div>
          </motion.div>
        );
      })}

      {/* Instructions */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">Hướng dẫn:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• <strong>Chấp nhận:</strong> Bạn sẽ trở thành thành viên nhóm và có thể tham gia quản lý chi tiêu</li>
          <li>• <strong>Từ chối:</strong> Lời mời sẽ bị xóa và người mời sẽ được thông báo</li>
          <li>• <strong>Lưu ý:</strong> Bạn có thể rời khỏi nhóm bất cứ lúc nào sau khi tham gia</li>
        </ul>
      </div>
    </div>
  );
};