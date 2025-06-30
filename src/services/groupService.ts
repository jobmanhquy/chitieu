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
import { NotificationService } from './notificationService';
import toast from 'react-hot-toast';

export interface Group {
  id: string;
  name: string;
  description?: string;
  type: 'family' | 'friends' | 'work' | 'project' | 'other';
  createdBy: string;
  members: GroupMember[];
  memberUids: string[];
  invitations: GroupInvitation[];
  settings: GroupSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface GroupMember {
  userId: string;
  email: string;
  displayName: string;
  role: 'admin' | 'member' | 'viewer';
  joinedAt: Date;
  permissions: GroupPermissions;
  isActive: boolean;
}

export interface GroupInvitation {
  id: string;
  email: string;
  role: 'member' | 'viewer';
  invitedBy: string;
  invitedAt: Date;
  expiresAt: Date;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
}

export interface GroupPermissions {
  canViewExpenses: boolean;
  canAddExpenses: boolean;
  canEditOwnExpenses: boolean;
  canEditAllExpenses: boolean;
  canDeleteOwnExpenses: boolean;
  canDeleteAllExpenses: boolean;
  canViewReports: boolean;
  canManageMembers: boolean;
  canManageSettings: boolean;
  canExportData: boolean;
}

export interface GroupSettings {
  allowMemberInvites: boolean;
  requireApprovalForExpenses: boolean;
  expenseLimit: number;
  currency: string;
  timezone: string;
  autoSplitExpenses: boolean;
  defaultSplitMethod: 'equal' | 'percentage' | 'amount';
  notifications: {
    newExpenses: boolean;
    budgetAlerts: boolean;
    weeklyReports: boolean;
    monthlyReports: boolean;
    memberJoined: boolean;
    memberLeft: boolean;
  };
}

export class GroupService {
  private static instance: GroupService;
  private notificationService = NotificationService.getInstance();
  
  public static getInstance(): GroupService {
    if (!GroupService.instance) {
      GroupService.instance = new GroupService();
    }
    return GroupService.instance;
  }

  // Create a new group
  async createGroup(
    name: string, 
    type: Group['type'], 
    description?: string, 
    createdBy?: string
  ): Promise<string> {
    try {
      const defaultSettings: GroupSettings = {
        allowMemberInvites: true,
        requireApprovalForExpenses: false,
        expenseLimit: 10000000, // 10M VND
        currency: 'VND',
        timezone: 'Asia/Ho_Chi_Minh',
        autoSplitExpenses: false,
        defaultSplitMethod: 'equal',
        notifications: {
          newExpenses: true,
          budgetAlerts: true,
          weeklyReports: true,
          monthlyReports: true,
          memberJoined: true,
          memberLeft: true
        }
      };

      const adminPermissions: GroupPermissions = {
        canViewExpenses: true,
        canAddExpenses: true,
        canEditOwnExpenses: true,
        canEditAllExpenses: true,
        canDeleteOwnExpenses: true,
        canDeleteAllExpenses: true,
        canViewReports: true,
        canManageMembers: true,
        canManageSettings: true,
        canExportData: true
      };

      const groupData: Omit<Group, 'id'> = {
        name,
        type,
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

      const docRef = await addDoc(collection(db, 'groups'), {
        ...groupData,
        createdAt: Timestamp.fromDate(groupData.createdAt),
        updatedAt: Timestamp.fromDate(groupData.updatedAt),
        members: groupData.members.map(member => ({
          ...member,
          joinedAt: Timestamp.fromDate(member.joinedAt)
        }))
      });

      console.log('Group created successfully:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  }

  // Invite a member to group - REAL implementation
  async inviteMember(
    groupId: string, 
    email: string, 
    role: 'member' | 'viewer', 
    invitedBy: string
  ): Promise<void> {
    try {
      // Get group details first
      const groupDoc = await getDocs(query(collection(db, 'groups'), where('__name__', '==', groupId)));
      if (groupDoc.empty) {
        throw new Error('Group not found');
      }

      const groupData = groupDoc.docs[0].data() as Group;
      
      // Get inviter details
      const inviterDoc = await getDocs(query(collection(db, 'users'), where('__name__', '==', invitedBy)));
      let inviterName = 'Người dùng';
      if (!inviterDoc.empty) {
        const inviterData = inviterDoc.docs[0].data();
        inviterName = inviterData.displayName || inviterData.email || 'Người dùng';
      }

      const invitation: GroupInvitation = {
        id: Date.now().toString(),
        email,
        role,
        invitedBy,
        invitedAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        status: 'pending'
      };

      // Update group with invitation
      const groupRef = doc(db, 'groups', groupId);
      await updateDoc(groupRef, {
        invitations: arrayUnion({
          ...invitation,
          invitedAt: Timestamp.fromDate(invitation.invitedAt),
          expiresAt: Timestamp.fromDate(invitation.expiresAt)
        }),
        updatedAt: Timestamp.fromDate(new Date())
      });

      // Create notification for the invited user
      await this.notificationService.createGroupInvitationNotification(
        email,
        groupData.name,
        groupData.type,
        inviterName,
        groupId,
        invitation.id
      );

      console.log(`Real invitation sent to ${email} for group ${groupId}`);
    } catch (error) {
      console.error('Error inviting member:', error);
      throw error;
    }
  }

  // Accept invitation - REAL implementation
  async acceptInvitation(
    groupId: string, 
    invitationId: string, 
    userId: string, 
    userEmail: string, 
    displayName: string
  ): Promise<void> {
    try {
      const memberPermissions: GroupPermissions = {
        canViewExpenses: true,
        canAddExpenses: true,
        canEditOwnExpenses: true,
        canEditAllExpenses: false,
        canDeleteOwnExpenses: true,
        canDeleteAllExpenses: false,
        canViewReports: true,
        canManageMembers: false,
        canManageSettings: false,
        canExportData: false
      };

      const newMember: GroupMember = {
        userId,
        email: userEmail,
        displayName,
        role: 'member',
        joinedAt: new Date(),
        permissions: memberPermissions,
        isActive: true
      };

      const groupRef = doc(db, 'groups', groupId);
      
      // Add member and update invitation status
      await updateDoc(groupRef, {
        members: arrayUnion({
          ...newMember,
          joinedAt: Timestamp.fromDate(newMember.joinedAt)
        }),
        memberUids: arrayUnion(userId),
        updatedAt: Timestamp.fromDate(new Date())
      });

      console.log(`User ${userId} joined group ${groupId}`);
    } catch (error) {
      console.error('Error accepting invitation:', error);
      throw error;
    }
  }

  // Remove member from group
  async removeMember(groupId: string, userId: string): Promise<void> {
    try {
      const groupRef = doc(db, 'groups', groupId);
      
      // Get current group data to find the member
      const groupDoc = await getDocs(query(collection(db, 'groups'), where('__name__', '==', groupId)));
      
      if (!groupDoc.empty) {
        const groupData = groupDoc.docs[0].data() as Group;
        const updatedMembers = groupData.members.filter(member => member.userId !== userId);
        
        await updateDoc(groupRef, {
          members: updatedMembers,
          memberUids: arrayRemove(userId),
          updatedAt: Timestamp.fromDate(new Date())
        });
      }
    } catch (error) {
      console.error('Error removing member:', error);
      throw error;
    }
  }

  // Update member role and permissions
  async updateMemberRole(
    groupId: string, 
    userId: string, 
    newRole: 'admin' | 'member' | 'viewer'
  ): Promise<void> {
    try {
      const groupRef = doc(db, 'groups', groupId);
      
      // Get current group data
      const groupDoc = await getDocs(query(collection(db, 'groups'), where('__name__', '==', groupId)));
      
      if (!groupDoc.empty) {
        const groupData = groupDoc.docs[0].data() as Group;
        const updatedMembers = groupData.members.map(member => {
          if (member.userId === userId) {
            return {
              ...member,
              role: newRole,
              permissions: this.getPermissionsForRole(newRole)
            };
          }
          return member;
        });
        
        await updateDoc(groupRef, {
          members: updatedMembers,
          updatedAt: Timestamp.fromDate(new Date())
        });
      }
    } catch (error) {
      console.error('Error updating member role:', error);
      throw error;
    }
  }

  // Update group settings
  async updateGroupSettings(groupId: string, settings: Partial<GroupSettings>): Promise<void> {
    try {
      const groupRef = doc(db, 'groups', groupId);
      
      await updateDoc(groupRef, {
        settings: settings,
        updatedAt: Timestamp.fromDate(new Date())
      });
    } catch (error) {
      console.error('Error updating group settings:', error);
      throw error;
    }
  }

  // Get group data with real-time updates
  subscribeToGroup(groupId: string, callback: (group: Group | null) => void): () => void {
    const groupRef = doc(db, 'groups', groupId);
    
    return onSnapshot(groupRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const group: Group = {
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
        } as Group;
        
        callback(group);
      } else {
        callback(null);
      }
    });
  }

  // Get user's groups
  async getUserGroups(userId: string): Promise<Group[]> {
    try {
      const q = query(
        collection(db, 'groups'),
        where('memberUids', 'array-contains', userId)
      );
      
      const querySnapshot = await getDocs(q);
      const groups: Group[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        groups.push({
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
        } as Group);
      });
      
      return groups;
    } catch (error) {
      console.error('Error getting user groups:', error);
      return [];
    }
  }

  // Helper methods
  private getPermissionsForRole(role: 'admin' | 'member' | 'viewer'): GroupPermissions {
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
          canManageSettings: true,
          canExportData: true
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
          canManageSettings: false,
          canExportData: false
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
          canManageSettings: false,
          canExportData: false
        };
    }
  }
}