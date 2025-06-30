import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { GoogleSignInButton } from './GoogleSignInButton';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
}

interface FormData {
  email: string;
  password: string;
  displayName?: string;
  confirmPassword?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  initialMode = 'signin' 
}) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot' | 'emaillink'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signIn, signUp, resetPassword, signInWithEmailLink, loading } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<FormData>();

  const password = watch('password');

  const onSubmit = async (data: FormData) => {
    try {
      switch (mode) {
        case 'signin':
          await signIn({ email: data.email, password: data.password });
          break;
        case 'signup':
          await signUp({
            email: data.email,
            password: data.password,
            displayName: data.displayName
          });
          break;
        case 'forgot':
          await resetPassword(data.email);
          setMode('signin');
          break;
        case 'emaillink':
          await signInWithEmailLink(data.email);
          break;
      }
      
      if (mode !== 'forgot' && mode !== 'emaillink') {
        onClose();
        reset();
      }
    } catch (error) {
      // Error is handled in AuthContext
    }
  };

  const handleModeChange = (newMode: typeof mode) => {
    setMode(newMode);
    reset();
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const getTitle = () => {
    switch (mode) {
      case 'signin': return 'Đăng nhập';
      case 'signup': return 'Đăng ký';
      case 'forgot': return 'Quên mật khẩu';
      case 'emaillink': return 'Đăng nhập không mật khẩu';
    }
  };

  const getSubmitText = () => {
    switch (mode) {
      case 'signin': return 'Đăng nhập';
      case 'signup': return 'Đăng ký';
      case 'forgot': return 'Gửi email';
      case 'emaillink': return 'Gửi link đăng nhập';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl p-8 w-full max-w-md relative"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{getTitle()}</h2>
          <p className="text-gray-600">
            {mode === 'signin' && 'Chào mừng bạn quay lại!'}
            {mode === 'signup' && 'Tạo tài khoản mới để bắt đầu'}
            {mode === 'forgot' && 'Nhập email để đặt lại mật khẩu'}
            {mode === 'emaillink' && 'Nhận link đăng nhập qua email'}
          </p>
        </div>

        {/* Google Sign In */}
        {(mode === 'signin' || mode === 'signup') && (
          <div className="mb-6">
            <GoogleSignInButton onSuccess={onClose} />
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">hoặc</span>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Display Name (Signup only) */}
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Họ và tên
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  {...register('displayName', {
                    required: mode === 'signup' ? 'Vui lòng nhập họ và tên' : false
                  })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập họ và tên"
                />
              </div>
              {errors.displayName && (
                <p className="text-red-500 text-sm mt-1">{errors.displayName.message}</p>
              )}
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                {...register('email', {
                  required: 'Vui lòng nhập email',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Email không hợp lệ'
                  }
                })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập email"
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Password (not for forgot password or email link) */}
          {mode !== 'forgot' && mode !== 'emaillink' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', {
                    required: 'Vui lòng nhập mật khẩu',
                    minLength: {
                      value: 6,
                      message: 'Mật khẩu phải có ít nhất 6 ký tự'
                    }
                  })}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập mật khẩu"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>
          )}

          {/* Confirm Password (Signup only) */}
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...register('confirmPassword', {
                    required: 'Vui lòng xác nhận mật khẩu',
                    validate: value => value === password || 'Mật khẩu không khớp'
                  })}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Xác nhận mật khẩu"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              getSubmitText()
            )}
          </button>
        </form>

        {/* Footer Links */}
        <div className="mt-6 text-center space-y-2">
          {mode === 'signin' && (
            <>
              <button
                onClick={() => handleModeChange('forgot')}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                Quên mật khẩu?
              </button>
              <div className="text-gray-600 text-sm">
                Chưa có tài khoản?{' '}
                <button
                  onClick={() => handleModeChange('signup')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Đăng ký ngay
                </button>
              </div>
              <button
                onClick={() => handleModeChange('emaillink')}
                className="text-blue-600 hover:text-blue-700 text-sm block mx-auto"
              >
                Đăng nhập không mật khẩu
              </button>
            </>
          )}

          {mode === 'signup' && (
            <div className="text-gray-600 text-sm">
              Đã có tài khoản?{' '}
              <button
                onClick={() => handleModeChange('signin')}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Đăng nhập
              </button>
            </div>
          )}

          {(mode === 'forgot' || mode === 'emaillink') && (
            <button
              onClick={() => handleModeChange('signin')}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              Quay lại đăng nhập
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};