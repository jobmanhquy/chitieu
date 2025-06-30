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
  isSignInWithEmailLink,
  sendEmailVerification,
  reload,
  reauthenticateWithCredential,
  EmailAuthProvider
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
    try {
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
        console.log('User document created successfully');
      } else {
        // Update last login time and email verification status
        await updateDoc(userRef, {
          lastLoginAt: new Date(),
          emailVerified: firebaseUser.emailVerified
        });
        console.log('User document updated successfully');
      }
    } catch (error) {
      console.error('Error creating user document:', error);
      // Don't throw error here to prevent blocking authentication
      // The app can still work without Firestore user document
    }
  };

  // Send email verification
  const sendVerificationEmail = async () => {
    if (!auth.currentUser) {
      throw new Error('Không có người dùng đăng nhập');
    }

    try {
      await sendEmailVerification(auth.currentUser, {
        url: `${window.location.origin}/verify-email`,
        handleCodeInApp: false
      });
      toast.success('Email xác thực đã được gửi! Vui lòng kiểm tra hộp thư.');
    } catch (error: any) {
      console.error('Error sending verification email:', error);
      const errorMessage = getErrorMessage(error.code);
      toast.error(errorMessage);
      throw error;
    }
  };

  // Check email verification status
  const checkEmailVerification = async () => {
    if (!auth.currentUser) return false;

    try {
      await reload(auth.currentUser);
      const isVerified = auth.currentUser.emailVerified;
      
      if (isVerified) {
        // Update user document
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          emailVerified: true,
          updatedAt: new Date()
        });
        
        // Update local state
        setUser(convertFirebaseUser(auth.currentUser));
        toast.success('Email đã được xác thực thành công!');
      }
      
      return isVerified;
    } catch (error) {
      console.error('Error checking email verification:', error);
      return false;
    }
  };

  // Sign up with email and password
  const signUp = async (data: SignUpData) => {
    try {
      setError(null);
      setLoading(true);

      console.log('Attempting to sign up user...');
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
      
      // Send verification email automatically
      await sendEmailVerification(firebaseUser, {
        url: `${window.location.origin}/verify-email`,
        handleCodeInApp: false
      });

      toast.success('Tài khoản đã được tạo thành công! Vui lòng kiểm tra email để xác thực.');
    } catch (err: any) {
      console.error('Sign up error:', err);
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

      console.log('Attempting to sign in user...');
      const { user: firebaseUser } = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      await createUserDocument(firebaseUser);
      
      // Check if email is verified
      if (!firebaseUser.emailVerified) {
        toast.error('Email chưa được xác thực. Vui lòng kiểm tra hộp thư hoặc gửi lại email xác thực.');
      } else {
        toast.success('Đăng nhập thành công!');
      }
    } catch (err: any) {
      console.error('Sign in error:', err);
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

      console.log('Attempting Google sign in...');
      const { user: firebaseUser } = await signInWithPopup(auth, googleProvider);
      await createUserDocument(firebaseUser);
      toast.success('Đăng nhập với Google thành công!');
    } catch (err: any) {
      console.error('Google sign in error:', err);
      if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
        const errorMessage = getErrorMessage(err.code);
        setError(errorMessage);
        toast.error(errorMessage);
      }
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
      console.error('Email link sign in error:', err);
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
      console.error('Complete email link sign in error:', err);
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
      console.error('Sign out error:', err);
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
      console.error('Reset password error:', err);
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
      console.error('Update profile error:', err);
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
      console.error('Delete account error:', err);
      
      // Handle requires-recent-login error
      if (err.code === 'auth/requires-recent-login') {
        toast.error('Để xóa tài khoản, bạn cần đăng nhập lại gần đây. Vui lòng đăng xuất và đăng nhập lại, sau đó thử xóa tài khoản.');
        return;
      }
      
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
      case 'auth/invalid-credential':
        return 'Thông tin đăng nhập không hợp lệ';
      case 'auth/operation-not-allowed':
        return 'Phương thức đăng nhập này chưa được kích hoạt';
      case 'auth/too-many-requests':
        return 'Quá nhiều yêu cầu gửi email. Vui lòng thử lại sau';
      case 'auth/unauthorized-continue-uri':
        return 'Domain không được phép. Vui lòng liên hệ quản trị viên';
      case 'auth/requires-recent-login':
        return 'Thao tác này yêu cầu đăng nhập gần đây. Vui lòng đăng nhập lại';
      default:
        return 'Đã xảy ra lỗi. Vui lòng thử lại';
    }
  };

  // Auth state listener
  useEffect(() => {
    console.log('Setting up auth state listener...');
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        console.log('Auth state changed:', firebaseUser ? 'User logged in' : 'User logged out');
        if (firebaseUser) {
          await createUserDocument(firebaseUser);
          setUser(convertFirebaseUser(firebaseUser));
        } else {
          setUser(null);
        }
        setError(null);
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
    deleteAccount,
    sendVerificationEmail,
    checkEmailVerification
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};