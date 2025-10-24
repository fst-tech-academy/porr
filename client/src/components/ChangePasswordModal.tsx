import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { X, Eye, EyeOff, CheckCircle, AlertCircle, Key, Shield, Lock } from 'lucide-react';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const getChangePasswordSchema = (t: any) => yup.object({
  currentPassword: yup.string().required(t('auth.currentPasswordRequired')),
  newPassword: yup.string().min(6, t('auth.passwordMinLength')).required(t('auth.newPasswordRequired')),
  confirmPassword: yup.string()
    .oneOf([yup.ref('newPassword')], t('auth.passwordsDoNotMatch'))
    .required(t('auth.confirmPasswordRequired')),
});

type ChangePasswordFormData = yup.InferType<ReturnType<typeof getChangePasswordSchema>>;

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const { changePassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<ChangePasswordFormData>({
    resolver: yupResolver(getChangePasswordSchema(t)),
  });

  const handleSubmit = async (data: ChangePasswordFormData) => {
    try {
      setLoading(true);
      setError('');
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      setSuccess(true);
      form.reset();
      // Close modal after 2 seconds
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (err: any) {
      const apiMessage = err.response?.data?.message;
      if (apiMessage?.toLowerCase().includes('incorrect')) {
        setError(t('auth.currentPasswordIncorrect'));
      } else {
        setError(err.response?.data?.message || t('auth.passwordChangeFailed'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      form.reset();
      setError('');
      setSuccess(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-sm w-full border border-gray-200 dark:border-slate-700 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">
                  {t('auth.changePassword')}
                </h2>
                <p className="text-xs text-blue-100">Secure your account</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={loading}
              className="p-1 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all duration-200 disabled:opacity-50"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {success ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                {t('auth.passwordChangeSuccess')}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {t('auth.passwordChangeSuccessMessage')}
              </p>
            </div>
          ) : (
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              {/* Current Password */}
              <div className="space-y-1">
                <Label htmlFor="currentPassword" className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-1">
                  <Lock className="h-3 w-3" />
                  <span>{t('auth.currentPassword')}</span>
                </Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    placeholder={t('auth.enterCurrentPassword')}
                    {...form.register('currentPassword', {
                      onChange: () => {
                        if (error) setError('');
                      }
                    })}
                    className={`h-9 text-sm pr-9 ${form.formState.errors.currentPassword ? 'border-red-400 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                  >
                    {showCurrentPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
                {form.formState.errors.currentPassword && (
                  <p className="text-xs text-red-600 dark:text-red-400">{form.formState.errors.currentPassword.message}</p>
                )}
              </div>

              {/* New Password */}
              <div className="space-y-1">
                <Label htmlFor="newPassword" className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-1">
                  <Key className="h-3 w-3" />
                  <span>{t('auth.newPassword')}</span>
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    placeholder={t('auth.enterNewPassword')}
                    {...form.register('newPassword', {
                      onChange: () => {
                        if (error) setError('');
                      }
                    })}
                    className={`h-9 text-sm pr-9 ${form.formState.errors.newPassword ? 'border-red-400 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                  >
                    {showNewPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
                {form.formState.errors.newPassword && (
                  <p className="text-xs text-red-600 dark:text-red-400">{form.formState.errors.newPassword.message}</p>
                )}
              </div>

              {/* Confirm New Password */}
              <div className="space-y-1">
                <Label htmlFor="confirmPassword" className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-1">
                  <Shield className="h-3 w-3" />
                  <span>{t('auth.confirmNewPassword')}</span>
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder={t('auth.confirmNewPassword')}
                    {...form.register('confirmPassword', {
                      onChange: () => {
                        if (error) setError('');
                      }
                    })}
                    className={`h-9 text-sm pr-9 ${form.formState.errors.confirmPassword ? 'border-red-400 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
                {form.formState.errors.confirmPassword && (
                  <p className="text-xs text-red-600 dark:text-red-400">{form.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Buttons */}
              <div className="flex space-x-2 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={loading}
                  className="flex-1 h-8 text-xs border-gray-300 hover:bg-gray-50 dark:border-slate-600 dark:hover:bg-slate-700"
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                >
                  {loading ? (
                    <div className="flex items-center space-x-1">
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>{t('common.loading')}</span>
                    </div>
                  ) : (
                    t('auth.changePassword')
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordModal;

