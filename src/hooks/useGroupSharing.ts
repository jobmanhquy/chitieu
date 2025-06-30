import { useState, useEffect } from 'react';
import { GroupService, Group } from '../services/groupService';
import { useAuth } from '../contexts/AuthContext';

export const useGroupSharing = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const groupService = GroupService.getInstance();

  useEffect(() => {
    if (!user) {
      setGroups([]);
      setCurrentGroup(null);
      setLoading(false);
      return;
    }

    loadUserGroups();
  }, [user]);

  const loadUserGroups = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const userGroups = await groupService.getUserGroups(user.uid);
      setGroups(userGroups);
      
      // Set the first group as current if exists
      if (userGroups.length > 0) {
        setCurrentGroup(userGroups[0]);
      }
      
      setError(null);
    } catch (err: any) {
      console.error('Error loading groups:', err);
      setError('Không thể tải dữ liệu nhóm');
    } finally {
      setLoading(false);
    }
  };

  const createGroup = async (name: string, type: Group['type'], description?: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const groupId = await groupService.createGroup(name, type, description, user.uid);
      await loadUserGroups(); // Reload groups
      return groupId;
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  };

  const inviteMember = async (groupId: string, email: string, role: 'member' | 'viewer') => {
    if (!user) throw new Error('User not authenticated');

    try {
      await groupService.inviteMember(groupId, email, role, user.uid);
      await loadUserGroups(); // Reload to get updated invitations
    } catch (error) {
      console.error('Error inviting member:', error);
      throw error;
    }
  };

  const acceptInvitation = async (groupId: string, invitationId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      await groupService.acceptInvitation(
        groupId, 
        invitationId, 
        user.uid, 
        user.email || '', 
        user.displayName || ''
      );
      await loadUserGroups();
    } catch (error) {
      console.error('Error accepting invitation:', error);
      throw error;
    }
  };

  const removeMember = async (groupId: string, userId: string) => {
    try {
      await groupService.removeMember(groupId, userId);
      await loadUserGroups();
    } catch (error) {
      console.error('Error removing member:', error);
      throw error;
    }
  };

  const updateMemberRole = async (groupId: string, userId: string, newRole: 'admin' | 'member' | 'viewer') => {
    try {
      await groupService.updateMemberRole(groupId, userId, newRole);
      await loadUserGroups();
    } catch (error) {
      console.error('Error updating member role:', error);
      throw error;
    }
  };

  const updateGroupSettings = async (groupId: string, settings: any) => {
    try {
      await groupService.updateGroupSettings(groupId, settings);
      await loadUserGroups();
    } catch (error) {
      console.error('Error updating group settings:', error);
      throw error;
    }
  };

  // Get current user's role in a group
  const getUserRole = (groupId: string): 'admin' | 'member' | 'viewer' | null => {
    if (!user) return null;
    
    const group = groups.find(g => g.id === groupId);
    if (!group) return null;
    
    const member = group.members.find(m => m.userId === user.uid);
    return member?.role || null;
  };

  // Check if user has specific permission
  const hasPermission = (groupId: string, permission: keyof import('../services/groupService').GroupPermissions): boolean => {
    if (!user) return false;
    
    const group = groups.find(g => g.id === groupId);
    if (!group) return false;
    
    const member = group.members.find(m => m.userId === user.uid);
    return member?.permissions[permission] || false;
  };

  return {
    groups,
    currentGroup,
    loading,
    error,
    createGroup,
    inviteMember,
    acceptInvitation,
    removeMember,
    updateMemberRole,
    updateGroupSettings,
    getUserRole,
    hasPermission,
    refreshGroups: loadUserGroups
  };
};