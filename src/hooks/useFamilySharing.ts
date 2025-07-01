import { useState, useEffect } from 'react';
import { FamilyService, FamilyGroup } from '../services/familyService';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export const useFamilySharing = () => {
  const [families, setFamilies] = useState<FamilyGroup[]>([]);
  const [currentFamily, setCurrentFamily] = useState<FamilyGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const familyService = FamilyService.getInstance();

  useEffect(() => {
    if (!user) {
      setFamilies([]);
      setCurrentFamily(null);
      setLoading(false);
      return;
    }

    loadUserFamilies();
  }, [user]);

  const loadUserFamilies = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      
      console.log('Loading families for user:', user.uid);
      const userFamilies = await familyService.getUserFamilies(user.uid);
      console.log('Loaded families:', userFamilies);
      
      setFamilies(userFamilies);
      
      // Set the first family as current if exists
      if (userFamilies.length > 0) {
        setCurrentFamily(userFamilies[0]);
      } else {
        setCurrentFamily(null);
      }
      
    } catch (err: any) {
      console.error('Error loading families:', err);
      setError('Không thể tải dữ liệu gia đình');
      toast.error('Không thể tải dữ liệu gia đình');
    } finally {
      setLoading(false);
    }
  };

  const createFamily = async (name: string, description?: string) => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để tạo gia đình');
      throw new Error('User not authenticated');
    }

    try {
      setLoading(true);
      console.log('Creating family:', { name, description, userId: user.uid });
      
      const familyId = await familyService.createFamily(name, description, user.uid);
      console.log('Family created with ID:', familyId);
      
      await loadUserFamilies(); // Reload families
      toast.success('Đã tạo nhóm gia đình thành công!');
      return familyId;
    } catch (error: any) {
      console.error('Error creating family:', error);
      toast.error('Không thể tạo nhóm gia đình');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const inviteMember = async (familyId: string, email: string, role: 'member' | 'viewer') => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để mời thành viên');
      throw new Error('User not authenticated');
    }

    try {
      console.log('Inviting member:', { familyId, email, role, invitedBy: user.uid });
      
      await familyService.inviteMember(familyId, email, role, user.uid);
      await loadUserFamilies(); // Reload to get updated invitations
      
      toast.success(`Đã gửi lời mời đến ${email}`);
    } catch (error: any) {
      console.error('Error inviting member:', error);
      toast.error('Không thể gửi lời mời');
      throw error;
    }
  };

  const acceptInvitation = async (familyId: string, invitationId: string) => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để chấp nhận lời mời');
      throw new Error('User not authenticated');
    }

    try {
      console.log('Accepting invitation:', { familyId, invitationId, userId: user.uid });
      
      await familyService.acceptInvitation(
        familyId, 
        invitationId, 
        user.uid, 
        user.email || '', 
        user.displayName || ''
      );
      await loadUserFamilies();
      
      toast.success('Đã tham gia nhóm gia đình!');
    } catch (error: any) {
      console.error('Error accepting invitation:', error);
      toast.error('Không thể tham gia nhóm gia đình');
      throw error;
    }
  };

  const removeMember = async (familyId: string, userId: string) => {
    try {
      console.log('Removing member:', { familyId, userId });
      
      await familyService.removeMember(familyId, userId);
      await loadUserFamilies();
      
      toast.success('Đã xóa thành viên khỏi nhóm');
    } catch (error: any) {
      console.error('Error removing member:', error);
      toast.error('Không thể xóa thành viên');
      throw error;
    }
  };

  const updateMemberRole = async (familyId: string, userId: string, newRole: 'admin' | 'member' | 'viewer') => {
    try {
      console.log('Updating member role:', { familyId, userId, newRole });
      
      await familyService.updateMemberRole(familyId, userId, newRole);
      await loadUserFamilies();
      
      toast.success('Đã cập nhật vai trò thành viên');
    } catch (error: any) {
      console.error('Error updating member role:', error);
      toast.error('Không thể cập nhật vai trò');
      throw error;
    }
  };

  const updateFamilySettings = async (familyId: string, settings: any) => {
    try {
      console.log('Updating family settings:', { familyId, settings });
      
      await familyService.updateFamilySettings(familyId, settings);
      await loadUserFamilies();
      
      toast.success('Đã cập nhật cài đặt nhóm gia đình');
    } catch (error: any) {
      console.error('Error updating family settings:', error);
      toast.error('Không thể cập nhật cài đặt');
      throw error;
    }
  };

  // Get current user's role in a family
  const getUserRole = (familyId: string): 'admin' | 'member' | 'viewer' | null => {
    if (!user) return null;
    
    const family = families.find(f => f.id === familyId);
    if (!family) return null;
    
    const member = family.members.find(m => m.userId === user.uid);
    return member?.role || null;
  };

  // Check if user has specific permission
  const hasPermission = (familyId: string, permission: keyof import('../services/familyService').FamilyPermissions): boolean => {
    if (!user) return false;
    
    const family = families.find(f => f.id === familyId);
    if (!family) return false;
    
    const member = family.members.find(m => m.userId === user.uid);
    return member?.permissions[permission] || false;
  };

  return {
    families,
    currentFamily,
    loading,
    error,
    createFamily,
    inviteMember,
    acceptInvitation,
    removeMember,
    updateMemberRole,
    updateFamilySettings,
    getUserRole,
    hasPermission,
    refreshFamilies: loadUserFamilies
  };
};