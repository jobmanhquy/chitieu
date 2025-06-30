import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, X, RefreshCw, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const EmailVerificationBanner: React.FC = () => {
  const { user, sendVerificationEmail, checkEmailVerification } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Don't show banner if user is not logged in, email is verified, or banner is dismissed
  if (!user || user.emailVerified || isDismissed) {
    return null;
  }

  const handleResendEmail = async () => {
    try {
      setIsResending(true);
      await sendVerificationEmail();
    } catch (error) {
      console.error('Error resending verification email:', error);
    } finally {
      setIsResending(false);
    }
  };

  const handleCheckVerification = async () => {
    try {
      setIsChecking(true);
      const isVerified = await checkEmailVerification();
      if (isVerified) {
        setIsDismissed(true);
      }
    } catch (error) {
      console.error('Error checking verification:', error);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-3 relative"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Mail className="w-5 h-5" />
            <div>
              <p className="font-medium">Email chưa được xác thực</p>
              <p className="text-sm text-orange-100">
                Vui lòng kiểm tra hộp thư và nhấp vào link xác thực để kích hoạt tài khoản
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleCheckVerification}
              disabled={isChecking}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              {isChecking ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              <span>{isChecking ? 'Đang kiểm tra...' : 'Đã xác thực'}</span>
            </button>
            
            <button
              onClick={handleResendEmail}
              disabled={isResending}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {isResending ? 'Đang gửi...' : 'Gửi lại email'}
            </button>
            
            <button
              onClick={() => setIsDismissed(true)}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};