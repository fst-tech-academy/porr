import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { CheckCircle, XCircle, Clock, Mail } from 'lucide-react';
import apiService from '../services/api';

const EmailVerification: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error' | 'expired' | 'invalid'>('loading');
  const [message, setMessage] = useState('');
  const [userInfo, setUserInfo] = useState<{firstName: string; lastName: string; email: string} | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setVerificationStatus('invalid');
      setMessage('No verification token provided');
      return;
    }

    verifyEmail(token);
  }, [searchParams]);

  const verifyEmail = async (token: string) => {
    try {
      const response = await apiService.post('/email-verification/verify', { token });
      
      if (response.data.success) {
        setVerificationStatus('success');
        setMessage(response.data.message);
        setUserInfo(response.data.user);
      } else {
        setVerificationStatus('error');
        setMessage(response.data.message);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Network error. Please try again.';
      
      if (errorMessage.includes('expired')) {
        setVerificationStatus('expired');
      } else if (errorMessage.includes('Invalid')) {
        setVerificationStatus('invalid');
      } else {
        setVerificationStatus('error');
      }
      setMessage(errorMessage);
    }
  };

  const handleContinue = () => {
    navigate('/login');
  };

  const getStatusIcon = () => {
    switch (verificationStatus) {
      case 'success':
        return <CheckCircle className="h-16 w-16 text-green-500" />;
      case 'expired':
        return <Clock className="h-16 w-16 text-yellow-500" />;
      case 'invalid':
      case 'error':
        return <XCircle className="h-16 w-16 text-red-500" />;
      default:
        return <Mail className="h-16 w-16 text-blue-500 animate-pulse" />;
    }
  };

  const getStatusColor = () => {
    switch (verificationStatus) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'expired':
        return 'border-yellow-200 bg-yellow-50';
      case 'invalid':
      case 'error':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  const getTitleText = () => {
    switch (verificationStatus) {
      case 'success':
        return t('emailVerification.successTitle');
      case 'expired':
        return t('emailVerification.expiredTitle');
      case 'invalid':
        return t('emailVerification.invalidTitle');
      case 'error':
        return t('emailVerification.errorTitle');
      default:
        return t('emailVerification.verifyingTitle');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className={`shadow-2xl ${getStatusColor()}`}>
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              {getStatusIcon()}
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              {getTitleText()}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="text-center space-y-4">
            {verificationStatus === 'loading' && (
              <div className="space-y-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900 mx-auto"></div>
                <p className="text-gray-600">{t('emailVerification.verifyingMessage')}</p>
              </div>
            )}

            {verificationStatus === 'success' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-green-700 font-medium">
                    {t('emailVerification.successMessage')}
                  </p>
                  {userInfo && (
                    <p className="text-gray-600">
                      {t('emailVerification.welcomeMessage', { firstName: userInfo.firstName })}
                    </p>
                  )}
                </div>
                <Button 
                  onClick={handleContinue}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl shadow-sm hover:shadow-xl transition-all duration-200"
                >
                  {t('emailVerification.continueButton')}
                </Button>
              </div>
            )}

            {verificationStatus === 'expired' && (
              <div className="space-y-4">
                <p className="text-yellow-700">
                  {t('emailVerification.expiredMessage')}
                </p>
                <Button 
                  onClick={handleContinue}
                  className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-3 rounded-xl shadow-sm hover:shadow-xl transition-all duration-200"
                >
                  {t('emailVerification.continueButton')}
                </Button>
              </div>
            )}

            {verificationStatus === 'invalid' && (
              <div className="space-y-4">
                <p className="text-red-700">
                  {t('emailVerification.invalidMessage')}
                </p>
                <Button 
                  onClick={handleContinue}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl shadow-sm hover:shadow-xl transition-all duration-200"
                >
                  {t('emailVerification.continueButton')}
                </Button>
              </div>
            )}

            {verificationStatus === 'error' && (
              <div className="space-y-4">
                <p className="text-red-700">
                  {t('emailVerification.errorMessage')}
                </p>
                <Button 
                  onClick={handleContinue}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl shadow-sm hover:shadow-xl transition-all duration-200"
                >
                  {t('emailVerification.continueButton')}
                </Button>
              </div>
            )}

            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                {t('emailVerification.supportMessage')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmailVerification;
