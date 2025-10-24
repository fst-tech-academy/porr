import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useLanguage } from '../contexts/LanguageContext';
import { ArrowLeft, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import apiService from '../services/api';
import NPSTLogo from '../components/NPSTLogo';

const forgotPasswordSchema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
});

type ForgotPasswordFormData = yup.InferType<typeof forgotPasswordSchema>;

const ForgotPassword: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string>('');
  const { t } = useLanguage();

  const form = useForm<ForgotPasswordFormData>({
    resolver: yupResolver(forgotPasswordSchema),
  });

  const handleSubmit = async (data: ForgotPasswordFormData) => {
    setLoading(true);
    setError('');
    
    try {
      await apiService.forgotPassword(data.email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-900-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="w-full h-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat'
        }}></div>
      </div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-blue-900/5 rounded-lg blur-xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-indigo-500/5 rounded-lg blur-xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-10 w-24 h-24 bg-purple-500/5 rounded-lg blur-xl animate-pulse delay-500"></div>
      
      <div className="w-full max-w-md relative z-10">
        <Card className="bg-white/95 backdrop-blur-sm border-slate-200 shadow-2xl">
          <CardHeader className="text-center pb-6">
            {/* Logo Section */}
            <div className="flex flex-col items-center space-y-4 mb-6">
              <NPSTLogo size="lg" showText={false} />
              <div className="text-center">
                <h1 className="text-2xl font-bold text-slate-900 mb-2">
                  Forgot Password?
                </h1>
                <p className="text-slate-600 text-sm">
                  No worries! Enter your email and we'll send you a reset link.
                </p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="px-8 pb-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            )}

            {success ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto">
                  <Mail className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    Check Your Email
                  </h3>
                  <p className="text-slate-600 text-sm mb-6">
                    We've sent a password reset link to your email address.
                  </p>
                </div>
                <div className="space-y-3">
                  <Button
                    onClick={() => {
                      setSuccess(false);
                      form.reset();
                    }}
                    className="w-full bg-blue-900 hover:bg-blue-800 text-white font-semibold py-3 rounded-xl shadow-sm hover:shadow-xl transition-all duration-200"
                  >
                    Send Another Email
                  </Button>
                  <Link to="/login">
                    <Button
                      variant="ghost"
                      className="w-full text-slate-600 hover:text-blue-900 hover:bg-slate-50 transition-all duration-200 font-medium"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Login
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-slate-700 font-medium text-sm">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    {...form.register('email')}
                    className={`bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-500 focus:border-blue-900 focus:ring-blue-900/20 ${
                      form.formState.errors.email ? 'border-red-400' : ''
                    }`}
                  />
                  {form.formState.errors.email && (
                    <p className="text-red-600 text-sm">{form.formState.errors.email.message}</p>
                  )}
                </div>
                
                <Button
                  type="submit"
                  className="w-full bg-blue-900 hover:bg-blue-800 text-white font-semibold py-3 rounded-xl shadow-sm hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-lg animate-spin"></div>
                      <span>Sending...</span>
                    </div>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>
                
                <div className="text-center">
                  <Link to="/login">
                    <Button
                      variant="ghost"
                      className="text-slate-600 hover:text-blue-900 hover:bg-slate-50 transition-all duration-200 font-medium"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Login
                    </Button>
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
