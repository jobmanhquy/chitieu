import { useState, useEffect } from 'react';
import { FamilyService, FamilyGroup } from '../services/familyService';
import { useAuth } from '../contexts/AuthContext';

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
      const userFamilies = await familyService.getUserFamilies(user.uid);
      setFamilies(userFamilies);
      
      // Set the first family as current if exists
      if (userFamilies.length > 0) {
        setCurrentFamily(userFamilies[0]);
      }
      
      setError(null);
    } catch (err: any) {
      console.error('Error loading families:', err);
      setError('Không thể tải dữ liệu gia đình');
    } finally {
      setLoading(false);
    }
  };

  const createFamily = async (name: string, description?: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const familyId = await familyService.createFamily(name, description, user.uid);
      await loadUserFamilies(); // Reload families
      return familyId;
    } catch (error) {
      console.error('Error creating family:', error);
      throw error;
    }
  };

  const inviteMember = async (familyId: string, email: string, role: 'member' | 'viewer') => {
    if (!user) throw new Error('User not authenticated');

    try {
      await familyService.inviteMember(familyId, email, role, user.uid);
      await loadUserFamilies(); // Reload to get updated invitations
    } catch (error) {
      console.error('Error inviting member:', error);
      throw error;
    }
  };

  const acceptInvitation = async (familyId: string, invitationId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      await familyService.acceptInvitation(
        familyId, 
        invitationId, 
        user.uid, 
        user.email || '', 
        user.displayName || ''
      );
      await loadUserFamilies();
    } catch (error) {
      console.error('Error accepting invitation:', error);
      throw error;
    }
  };

  const removeMember = async (familyId: string, userId: string) => {
    try {
      await familyService.removeMember(familyId, userId);
      await loadUserFamilies();
    } catch (error) {
      console.error('Error removing member:', error);
      throw error;
    }
  };

  const updateMemberRole = async (familyId: string, userId: string, newRole: 'admin' | 'member' | 'viewer') => {
    try {
      await familyService.updateMemberRole(familyId, userId, newRole);
      await loadUserFamilies();
    } catch (error) {
      console.error('Error updating member role:', error);
      throw error;
    }
  };

  const updateFamilySettings = async (familyId: string, settings: any) => {
    try {
      await familyService.updateFamilySettings(familyId, settings);
      await loadUserFamilies();
    } catch (error) {
      console.error('Error updating family settings:', error);
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