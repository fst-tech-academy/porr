import React, { useState } from 'react';
import { Mail, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useLanguage } from '../contexts/LanguageContext';
import { useSettings } from '../hooks/useSettings';
import apiService from '../services/api';

interface ResendVerificationProps {
  userEmail: string;
  onResendSuccess?: () => void;
}

const ResendVerification: React.FC<ResendVerificationProps> = ({ 
  userEmail, 
  onResendSuccess 
}) => {
  const { t } = useLanguage();
  const { isEmailNotificationsEnabled } = useSettings();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  const handleResend = async () => {
    setIsLoading(true);
    setMessage('');
    setMessageType('');

    try {
      const response = await apiService.resendVerificationEmail();
      
      if (response.success) {
        setMessage(response.message);
        setMessageType('success');
        onResendSuccess?.();
      } else {
        setMessage(response.message || 'Failed to send verification email');
        setMessageType('error');
      }
    } catch (error: any) {
      console.error('Resend verification error:', error);
      const errorMessage = error.response?.data?.message || 'Network error. Please try again.';
      setMessage(errorMessage);
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  // If email notifications are disabled, don't show the component
  if (!isEmailNotificationsEnabled()) {
    return null;
  }

  return (
    <Card className="w-full bg-amber-50 border-amber-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-amber-100 rounded-full">
                  <Mail className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-amber-800">
                    {t('emailVerification.resendTitle')}
                  </h3>
                  <p className="text-sm text-amber-700">
                    {t('emailVerification.resendMessage')} - {userEmail}
                  </p>
                </div>
              </div>
              <Button
                onClick={handleResend}
                disabled={isLoading}
                className="bg-amber-600 hover:bg-amber-700 text-white font-medium px-6 py-2 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    {t('emailVerification.sending')}
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    {t('emailVerification.resendButton')}
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-amber-600">
              {t('emailVerification.resendHint')}
            </p>
          </div>
        </div>

        {message && (
          <div className={`mt-4 p-3 rounded-lg flex items-center space-x-2 ${
            messageType === 'success' 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {messageType === 'success' ? (
              <CheckCircle className="h-4 w-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
            )}
            <span className="text-sm">{message}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ResendVerification;
