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
    if (!createdBy) {
      throw new Error('User ID is required to create family');
    }

    try {
      console.log('Creating family in Firestore:', { name, description, createdBy });

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

      const now = new Date();
      const familyData = {
        name,
        description: description || '',
        createdBy,
        members: [{
          userId: createdBy,
          email: '', // Will be filled from user data
          displayName: '', // Will be filled from user data
          role: 'admin' as const,
          joinedAt: Timestamp.fromDate(now),
          permissions: adminPermissions,
          isActive: true
        }],
        memberUids: [createdBy],
        invitations: [],
        settings: defaultSettings,
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now)
      };

      const docRef = await addDoc(collection(db, 'families'), familyData);
      console.log('Family created successfully with ID:', docRef.id);
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating family in Firestore:', error);
      throw error;
    }
  }

  // Invite a member to family
  async inviteMember(familyId: string, email: string, role: 'member' | 'viewer', invitedBy: string): Promise<void> {
    try {
      console.log('Inviting member to family:', { familyId, email, role, invitedBy });

      const invitation: Omit<FamilyInvitation, 'id'> = {
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
          id: Date.now().toString(),
          invitedAt: Timestamp.fromDate(invitation.invitedAt),
          expiresAt: Timestamp.fromDate(invitation.expiresAt)
        }),
        updatedAt: Timestamp.fromDate(new Date())
      });

      console.log('Invitation added to family successfully');
    } catch (error) {
      console.error('Error inviting member:', error);
      throw error;
    }
  }

  // Accept invitation
  async acceptInvitation(familyId: string, invitationId: string, userId: string, userEmail: string, displayName: string): Promise<void> {
    try {
      console.log('Accepting invitation:', { familyId, invitationId, userId, userEmail, displayName });

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

      const newMember = {
        userId,
        email: userEmail,
        displayName,
        role: 'member' as const,
        joinedAt: Timestamp.fromDate(new Date()),
        permissions: memberPermissions,
        isActive: true
      };

      const familyRef = doc(db, 'families', familyId);
      
      // Add member and update invitation status
      await updateDoc(familyRef, {
        members: arrayUnion(newMember),
        memberUids: arrayUnion(userId),
        updatedAt: Timestamp.fromDate(new Date())
      });

      console.log('Member added to family successfully');
    } catch (error) {
      console.error('Error accepting invitation:', error);
      throw error;
    }
  }

  // Remove member from family
  async removeMember(familyId: string, userId: string): Promise<void> {
    try {
      console.log('Removing member from family:', { familyId, userId });

      // Get current family data to find the member
      const familyQuery = query(collection(db, 'families'), where('__name__', '==', familyId));
      const familySnapshot = await getDocs(familyQuery);
      
      if (!familySnapshot.empty) {
        const familyDoc = familySnapshot.docs[0];
        const familyData = familyDoc.data() as any;
        
        // Filter out the member to remove
        const updatedMembers = familyData.members.filter((member: any) => member.userId !== userId);
        
        const familyRef = doc(db, 'families', familyId);
        await updateDoc(familyRef, {
          members: updatedMembers,
          memberUids: arrayRemove(userId),
          updatedAt: Timestamp.fromDate(new Date())
        });

        console.log('Member removed from family successfully');
      }
    } catch (error) {
      console.error('Error removing member:', error);
      throw error;
    }
  }

  // Update member role and permissions
  async updateMemberRole(familyId: string, userId: string, newRole: 'admin' | 'member' | 'viewer'): Promise<void> {
    try {
      console.log('Updating member role:', { familyId, userId, newRole });

      // Get current family data
      const familyQuery = query(collection(db, 'families'), where('__name__', '==', familyId));
      const familySnapshot = await getDocs(familyQuery);
      
      if (!familySnapshot.empty) {
        const familyDoc = familySnapshot.docs[0];
        const familyData = familyDoc.data() as any;
        
        // Update the specific member's role and permissions
        const updatedMembers = familyData.members.map((member: any) => {
          if (member.userId === userId) {
            return {
              ...member,
              role: newRole,
              permissions: this.getPermissionsForRole(newRole)
            };
          }
          return member;
        });
        
        const familyRef = doc(db, 'families', familyId);
        await updateDoc(familyRef, {
          members: updatedMembers,
          updatedAt: Timestamp.fromDate(new Date())
        });

        console.log('Member role updated successfully');
      }
    } catch (error) {
      console.error('Error updating member role:', error);
      throw error;
    }
  }

  // Update family settings
  async updateFamilySettings(familyId: string, settings: Partial<FamilySettings>): Promise<void> {
    try {
      console.log('Updating family settings:', { familyId, settings });

      const familyRef = doc(db, 'families', familyId);
      
      await updateDoc(familyRef, {
        settings: settings,
        updatedAt: Timestamp.fromDate(new Date())
      });

      console.log('Family settings updated successfully');
    } catch (error) {
      console.error('Error updating family settings:', error);
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
    }, (error) => {
      console.error('Error in family subscription:', error);
      callback(null);
    });
  }

  // Get user's families
  async getUserFamilies(userId: string): Promise<FamilyGroup[]> {
    try {
      console.log('Getting families for user:', userId);

      const q = query(
        collection(db, 'families'),
        where('memberUids', 'array-contains', userId)
      );
      
      const querySnapshot = await getDocs(q);
      const families: FamilyGroup[] = [];
      
      console.log('Found families:', querySnapshot.size);
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log('Processing family:', doc.id, data);
        
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
      
      console.log('Processed families:', families);
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
}