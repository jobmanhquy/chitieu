import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  onSnapshot,
  arrayUnion,
  arrayRemove,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export interface FamilyGroup {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  members: FamilyMember[];
  memberUids: string[];
  invitations: FamilyInvitation[];
  settings: FamilySettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface FamilyMember {
  userId: string;
  email: string;
  displayName: string;
  role: 'admin' | 'member' | 'viewer';
  joinedAt: Date;
  permissions: FamilyPermissions;
  isActive: boolean;
}

export interface FamilyInvitation {
  id: string;
  email: string;
  role: 'member' | 'viewer';
  invitedBy: string;
  invitedAt: Date;
  expiresAt: Date;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
}

export interface FamilyPermissions {
  canViewExpenses: boolean;
  canAddExpenses: boolean;
  canEditOwnExpenses: boolean;
  canEditAllExpenses: boolean;
  canDeleteOwnExpenses: boolean;
  canDeleteAllExpenses: boolean;
  canViewReports: boolean;
  canManageMembers: boolean;
  canManageSettings: boolean;
}

export interface FamilySettings {
  allowMemberInvites: boolean;
  requireApprovalForExpenses: boolean;
  expenseLimit: number;
  currency: string;
  timezone: string;
  notifications: {
    newExpenses: boolean;
    budgetAlerts: boolean;
    weeklyReports: boolean;
    monthlyReports: boolean;
  };
}

export class FamilyService {
  private static instance: FamilyService;
  
  public static getInstance(): FamilyService {
    if (!FamilyService.instance) {
      FamilyService.instance = new FamilyService();
    }
    return FamilyService.instance;
  }

  // Create a new family group
  async createFamily(name: string, description?: string, createdBy?: string): Promise<string> {
    try {
      const defaultSettings: FamilySettings = {
        allowMemberInvites: true,
        requireApprovalForExpenses: false,
        expenseLimit: 10000000, // 10M VND
        currency: 'VND',
        timezone: 'Asia/Ho_Chi_Minh',
        notifications: {
          newExpenses: true,
          budgetAlerts: true,
          weeklyReports: true,
          monthlyReports: true
        }
      };

      const adminPermissions: FamilyPermissions = {
        canViewExpenses: true,
        canAddExpenses: true,
        canEditOwnExpenses: true,
        canEditAllExpenses: true,
        canDeleteOwnExpenses: true,
        canDeleteAllExpenses: true,
        canViewReports: true,
        canManageMembers: true,
        canManageSettings: true
      };

      const familyData: Omit<FamilyGroup, 'id'> = {
        name,
        description,
        createdBy: createdBy || '',
        members: [{
          userId: createdBy || '',
          email: '',
          displayName: '',
          role: 'admin',
          joinedAt: new Date(),
          permissions: adminPermissions,
          isActive: true
        }],
        memberUids: [createdBy || ''],
        invitations: [],
        settings: defaultSettings,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await addDoc(collection(db, 'families'), {
        ...familyData,
        createdAt: Timestamp.fromDate(familyData.createdAt),
        updatedAt: Timestamp.fromDate(familyData.updatedAt),
        members: familyData.members.map(member => ({
          ...member,
          joinedAt: Timestamp.fromDate(member.joinedAt)
        }))
      });

      toast.success('Đã tạo nhóm gia đình thành công!');
      return docRef.id;
    } catch (error) {
      console.error('Error creating family:', error);
      toast.error('Không thể tạo nhóm gia đình');
      throw error;
    }
  }

  // Invite a member to family
  async inviteMember(familyId: string, email: string, role: 'member' | 'viewer', invitedBy: string): Promise<void> {
    try {
      const invitation: FamilyInvitation = {
        id: Date.now().toString(),
        email,
        role,
        invitedBy,
        invitedAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        status: 'pending'
      };

      const familyRef = doc(db, 'families', familyId);
      await updateDoc(familyRef, {
        invitations: arrayUnion({
          ...invitation,
          invitedAt: Timestamp.fromDate(invitation.invitedAt),
          expiresAt: Timestamp.fromDate(invitation.expiresAt)
        }),
        updatedAt: Timestamp.fromDate(new Date())
      });

      // Send email invitation (would integrate with email service)
      await this.sendInvitationEmail(email, invitation);

      toast.success(`Đã gửi lời mời đến ${email}`);
    } catch (error) {
      console.error('Error inviting member:', error);
      toast.error('Không thể gửi lời mời');
      throw error;
    }
  }

  // Accept invitation
  async acceptInvitation(familyId: string, invitationId: string, userId: string, userEmail: string, displayName: string): Promise<void> {
    try {
      const memberPermissions: FamilyPermissions = {
        canViewExpenses: true,
        canAddExpenses: true,
        canEditOwnExpenses: true,
        canEditAllExpenses: false,
        canDeleteOwnExpenses: true,
        canDeleteAllExpenses: false,
        canViewReports: true,
        canManageMembers: false,
        canManageSettings: false
      };

      const newMember: FamilyMember = {
        userId,
        email: userEmail,
        displayName,
        role: 'member', // Will be updated based on invitation
        joinedAt: new Date(),
        permissions: memberPermissions,
        isActive: true
      };

      const familyRef = doc(db, 'families', familyId);
      
      // Add member and update invitation status
      await updateDoc(familyRef, {
        members: arrayUnion({
          ...newMember,
          joinedAt: Timestamp.fromDate(newMember.joinedAt)
        }),
        memberUids: arrayUnion(userId),
        updatedAt: Timestamp.fromDate(new Date())
      });

      toast.success('Đã tham gia nhóm gia đình!');
    } catch (error) {
      console.error('Error accepting invitation:', error);
      toast.error('Không thể tham gia nhóm gia đình');
      throw error;
    }
  }

  // Remove member from family
  async removeMember(familyId: string, userId: string): Promise<void> {
    try {
      const familyRef = doc(db, 'families', familyId);
      
      // Get current family data to find the member
      const familyDoc = await getDocs(query(collection(db, 'families'), where('__name__', '==', familyId)));
      
      if (!familyDoc.empty) {
        const familyData = familyDoc.docs[0].data() as FamilyGroup;
        const updatedMembers = familyData.members.filter(member => member.userId !== userId);
        
        await updateDoc(familyRef, {
          members: updatedMembers,
          memberUids: arrayRemove(userId),
          updatedAt: Timestamp.fromDate(new Date())
        });

        toast.success('Đã xóa thành viên khỏi nhóm');
      }
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Không thể xóa thành viên');
      throw error;
    }
  }

  // Update member role and permissions
  async updateMemberRole(familyId: string, userId: string, newRole: 'admin' | 'member' | 'viewer'): Promise<void> {
    try {
      const familyRef = doc(db, 'families', familyId);
      
      // Get current family data
      const familyDoc = await getDocs(query(collection(db, 'families'), where('__name__', '==', familyId)));
      
      if (!familyDoc.empty) {
        const familyData = familyDoc.docs[0].data() as FamilyGroup;
        const updatedMembers = familyData.members.map(member => {
          if (member.userId === userId) {
            return {
              ...member,
              role: newRole,
              permissions: this.getPermissionsForRole(newRole)
            };
          }
          return member;
        });
        
        await updateDoc(familyRef, {
          members: updatedMembers,
          updatedAt: Timestamp.fromDate(new Date())
        });

        toast.success('Đã cập nhật vai trò thành viên');
      }
    } catch (error) {
      console.error('Error updating member role:', error);
      toast.error('Không thể cập nhật vai trò');
      throw error;
    }
  }

  // Update family settings
  async updateFamilySettings(familyId: string, settings: Partial<FamilySettings>): Promise<void> {
    try {
      const familyRef = doc(db, 'families', familyId);
      
      await updateDoc(familyRef, {
        settings: settings,
        updatedAt: Timestamp.fromDate(new Date())
      });

      toast.success('Đã cập nhật cài đặt nhóm gia đình');
    } catch (error) {
      console.error('Error updating family settings:', error);
      toast.error('Không thể cập nhật cài đặt');
      throw error;
    }
  }

  // Get family data with real-time updates
  subscribeToFamily(familyId: string, callback: (family: FamilyGroup | null) => void): () => void {
    const familyRef = doc(db, 'families', familyId);
    
    return onSnapshot(familyRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const family: FamilyGroup = {
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
          members: data.members.map((member: any) => ({
            ...member,
            joinedAt: member.joinedAt.toDate()
          })),
          invitations: data.invitations.map((inv: any) => ({
            ...inv,
            invitedAt: inv.invitedAt.toDate(),
            expiresAt: inv.expiresAt.toDate()
          }))
        } as FamilyGroup;
        
        callback(family);
      } else {
        callback(null);
      }
    });
  }

  // Get user's families
  async getUserFamilies(userId: string): Promise<FamilyGroup[]> {
    try {
      const q = query(
        collection(db, 'families'),
        where('memberUids', 'array-contains', userId)
      );
      
      const querySnapshot = await getDocs(q);
      const families: FamilyGroup[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        families.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
          members: data.members.map((member: any) => ({
            ...member,
            joinedAt: member.joinedAt.toDate()
          })),
          invitations: data.invitations.map((inv: any) => ({
            ...inv,
            invitedAt: inv.invitedAt.toDate(),
            expiresAt: inv.expiresAt.toDate()
          }))
        } as FamilyGroup);
      });
      
      return families;
    } catch (error) {
      console.error('Error getting user families:', error);
      return [];
    }
  }

  // Helper methods
  private getPermissionsForRole(role: 'admin' | 'member' | 'viewer'): FamilyPermissions {
    switch (role) {
      case 'admin':
        return {
          canViewExpenses: true,
          canAddExpenses: true,
          canEditOwnExpenses: true,
          canEditAllExpenses: true,
          canDeleteOwnExpenses: true,
          canDeleteAllExpenses: true,
          canViewReports: true,
          canManageMembers: true,
          canManageSettings: true
        };
      case 'member':
        return {
          canViewExpenses: true,
          canAddExpenses: true,
          canEditOwnExpenses: true,
          canEditAllExpenses: false,
          canDeleteOwnExpenses: true,
          canDeleteAllExpenses: false,
          canViewReports: true,
          canManageMembers: false,
          canManageSettings: false
        };
      case 'viewer':
        return {
          canViewExpenses: true,
          canAddExpenses: false,
          canEditOwnExpenses: false,
          canEditAllExpenses: false,
          canDeleteOwnExpenses: false,
          canDeleteAllExpenses: false,
          canViewReports: true,
          canManageMembers: false,
          canManageSettings: false
        };
    }
  }

  private async sendInvitationEmail(email: string, invitation: FamilyInvitation): Promise<void> {
    // In a real app, this would integrate with an email service like SendGrid, AWS SES, etc.
    console.log(`Sending invitation email to ${email}`, invitation);
    
    // For now, we'll just log it. In production, you would:
    // 1. Use Firebase Functions to send emails
    // 2. Create invitation links with tokens
    // 3. Handle email templates
    // 4. Track email delivery status
  }
}