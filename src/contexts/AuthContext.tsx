import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithEmailLink,
  sendSignInLinkToEmail,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile as firebaseUpdateProfile,
  deleteUser,
  onAuthStateChanged,
  isSignInWithEmailLink
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../config/firebase';
import { User, AuthContextType, SignUpData, SignInData } from '../types/auth';
import toast from 'react-hot-toast';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Convert Firebase User to our User type
  const convertFirebaseUser = (firebaseUser: FirebaseUser): User => ({
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
    emailVerified: firebaseUser.emailVerified,
    createdAt: new Date(firebaseUser.metadata.creationTime || Date.now()),
    lastLoginAt: new Date(firebaseUser.metadata.lastSignInTime || Date.now())
  });

  // Create or update user document in Firestore
  const createUserDocument = async (firebaseUser: FirebaseUser) => {
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      const userData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        emailVerified: firebaseUser.emailVerified,
        createdAt: new Date(),
        lastLoginAt: new Date(),
        preferences: {
          theme: 'system',
          currency: 'VND',
          language: 'vi'
        }
      };

      await setDoc(userRef, userData);
    } else {
      // Update last login time
      await updateDoc(userRef, {
        lastLoginAt: new Date(),
        emailVerified: firebaseUser.emailVerified
      });
    }
  };

  // Sign up with email and password
  const signUp = async (data: SignUpData) => {
    try {
      setError(null);
      setLoading(true);

      const { user: firebaseUser } = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      // Update display name if provided
      if (data.displayName) {
        await firebaseUpdateProfile(firebaseUser, {
          displayName: data.displayName
        });
      }

      await createUserDocument(firebaseUser);
      toast.success('Tài khoản đã được tạo thành công!');
    } catch (err: any) {
      const errorMessage = getErrorMessage(err.code);
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Sign in with email and password
  const signIn = async (data: SignInData) => {
    try {
      setError(null);
      setLoading(true);

      const { user: firebaseUser } = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      await createUserDocument(firebaseUser);
      toast.success('Đăng nhập thành công!');
    } catch (err: any) {
      const errorMessage = getErrorMessage(err.code);
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      setError(null);
      setLoading(true);

      const { user: firebaseUser } = await signInWithPopup(auth, googleProvider);
      await createUserDocument(firebaseUser);
      toast.success('Đăng nhập với Google thành công!');
    } catch (err: any) {
      const errorMessage = getErrorMessage(err.code);
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Send sign-in link to email
  const signInWithEmailLink = async (email: string) => {
    try {
      setError(null);
      setLoading(true);

      const actionCodeSettings = {
        url: `${window.location.origin}/auth/email-link`,
        handleCodeInApp: true,
      };

      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      
      // Save email to localStorage for verification
      localStorage.setItem('emailForSignIn', email);
      
      toast.success('Link đăng nhập đã được gửi đến email của bạn!');
    } catch (err: any) {
      const errorMessage = getErrorMessage(err.code);
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Complete email link sign-in
  const completeEmailLinkSignIn = async () => {
    try {
      if (isSignInWithEmailLink(auth, window.location.href)) {
        let email = localStorage.getItem('emailForSignIn');
        
        if (!email) {
          email = window.prompt('Vui lòng nhập email để hoàn tất đăng nhập');
        }

        if (email) {
          const { user: firebaseUser } = await signInWithEmailLink(auth, email, window.location.href);
          localStorage.removeItem('emailForSignIn');
          await createUserDocument(firebaseUser);
          toast.success('Đăng nhập thành công!');
          return true;
        }
      }
      return false;
    } catch (err: any) {
      const errorMessage = getErrorMessage(err.code);
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      setError(null);
      await firebaseSignOut(auth);
      toast.success('Đăng xuất thành công!');
    } catch (err: any) {
      const errorMessage = getErrorMessage(err.code);
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
      toast.success('Email đặt lại mật khẩu đã được gửi!');
    } catch (err: any) {
      const errorMessage = getErrorMessage(err.code);
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  };

  // Update user profile
  const updateProfile = async (data: { displayName?: string; photoURL?: string }) => {
    try {
      setError(null);
      if (auth.currentUser) {
        await firebaseUpdateProfile(auth.currentUser, data);
        
        // Update Firestore document
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userRef, {
          ...data,
          updatedAt: new Date()
        });

        toast.success('Hồ sơ đã được cập nhật!');
      }
    } catch (err: any) {
      const errorMessage = getErrorMessage(err.code);
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  };

  // Delete user account
  const deleteAccount = async () => {
    try {
      setError(null);
      if (auth.currentUser) {
        const uid = auth.currentUser.uid;
        
        // Delete user document from Firestore
        await deleteDoc(doc(db, 'users', uid));
        
        // Delete user expenses
        // This would require a cloud function for proper cleanup
        
        // Delete Firebase Auth user
        await deleteUser(auth.currentUser);
        
        toast.success('Tài khoản đã được xóa!');
      }
    } catch (err: any) {
      const errorMessage = getErrorMessage(err.code);
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  };

  // Error message mapping
  const getErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'Không tìm thấy tài khoản với email này';
      case 'auth/wrong-password':
        return 'Mật khẩu không chính xác';
      case 'auth/email-already-in-use':
        return 'Email này đã được sử dụng';
      case 'auth/weak-password':
        return 'Mật khẩu quá yếu (tối thiểu 6 ký tự)';
      case 'auth/invalid-email':
        return 'Email không hợp lệ';
      case 'auth/user-disabled':
        return 'Tài khoản đã bị vô hiệu hóa';
      case 'auth/too-many-requests':
        return 'Quá nhiều yêu cầu. Vui lòng thử lại sau';
      case 'auth/network-request-failed':
        return 'Lỗi kết nối mạng';
      case 'auth/popup-closed-by-user':
        return 'Cửa sổ đăng nhập đã bị đóng';
      case 'auth/cancelled-popup-request':
        return 'Yêu cầu đăng nhập đã bị hủy';
      default:
        return 'Đã xảy ra lỗi. Vui lòng thử lại';
    }
  };

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          await createUserDocument(firebaseUser);
          setUser(convertFirebaseUser(firebaseUser));
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Auth state change error:', err);
        setError('Lỗi xác thực');
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  // Handle email link sign-in on page load
  useEffect(() => {
    completeEmailLinkSignIn();
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    error,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithEmailLink,
    signOut,
    resetPassword,
    updateProfile,
    deleteAccount
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};