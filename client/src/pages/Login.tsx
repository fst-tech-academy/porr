import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate, Link } from 'react-router-dom';
import { useSettings } from '../hooks/useSettings';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import PasswordInput from '../components/ui/password-input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { AlertCircle, Building2, Shield } from 'lucide-react';
import NPSTLogo from '../components/NPSTLogo';
import apiService from '../services/api';
import { Organisation } from '../types';

const getLoginSchema = (t: any) => yup.object({
  email: yup.string().email(t('auth.invalidEmailFormat')).required(t('auth.emailRequired')),
  password: yup.string().required(t('auth.passwordRequired')),
  organisationId: yup.string().required('Please select an organisation'),
});

const registerSchema = yup.object({
  firstName: yup.string().required('First name is required'),
  middleName: yup.string().optional().default(''),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  nationalId: yup.string().required('National ID is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  phone: yup.string().optional().default(''),
});

type LoginFormData = {
  email: string;
  password: string;
  organisationId: string;
};

type RegisterFormData = {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  nationalId: string;
  password: string;
  phone?: string;
};

const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [organisations, setOrganisations] = useState<Organisation[]>([]);
  const [loadingOrganisations, setLoadingOrganisations] = useState(false);
  const { login, register } = useAuth();
  const { t, currentLanguage, changeLanguage } = useLanguage();
  const navigate = useNavigate();
  const { 
    isPublicRegistrationEnabled, 
    shouldShowRegistrationForm, 
    shouldShowForgotPassword,
    isMaintenanceMode,
    getMaintenanceMessage,
    loading: settingsLoading 
  } = useSettings();

  const loginForm = useForm<LoginFormData>({
    resolver: yupResolver(getLoginSchema(t)),
    defaultValues: {
      email: 'superadmin@default-org.com',
      password: 'SuperAdmin@2024!',
      organisationId: '' // Will be set when organisations load
    }
  });

  const registerForm = useForm<RegisterFormData>();

  // Fetch organisations on component mount
  useEffect(() => {
    const fetchOrganisations = async () => {
      setLoadingOrganisations(true);
      try {
        const response = await apiService.getLoginOrganisations();
        if (response.success && response.data) {
          // Map organisations to ensure consistent id field
          const mappedOrgs = response.data.map((org: any) => ({
            ...org,
            id: org.id || org._id,
          }));
          setOrganisations(mappedOrgs);
          
          // Auto-select the first organisation if available
          if (mappedOrgs.length > 0) {
            const selectedOrg = mappedOrgs[0];
            loginForm.setValue('organisationId', selectedOrg.id || selectedOrg._id);
          }
        }
      } catch (error) {
        console.error('Error fetching organisations:', error);
        setError('Failed to load organisations');
      } finally {
        setLoadingOrganisations(false);
      }
    };

    fetchOrganisations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const handleLogin = async (data: LoginFormData) => {
    try {
      setLoading(true);
      setError('');
      await login(data.email, data.password, data.organisationId);
      // Redirect to root - RoleBasedRedirect will handle the proper destination
      navigate('/');
    } catch (err: any) {
      // Handle different error types
      const status = err.response?.status;
      const apiMessage = err.response?.data?.message;
      
      if (status === 401) {
        // Unauthorized - invalid credentials or account issues
        if (apiMessage?.toLowerCase().includes('deactivated')) {
          setError(t('auth.accountDeactivated'));
        } else {
          setError(t('auth.usernamePasswordIncorrect'));
        }
      } else if (status === 400) {
        // Bad request - validation errors
        setError(t('auth.checkEmailPassword'));
      } else if (status >= 500) {
        // Server errors
        setError(t('auth.serverError'));
      } else if (err.message?.toLowerCase().includes('network')) {
        // Network errors
        setError(t('auth.networkError'));
      } else {
        // Generic fallback
        setError(t('auth.loginFailedGeneric'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (data: RegisterFormData) => {
    try {
      setLoading(true);
      setError('');
      
      // Check if public registration is enabled
      if (!isPublicRegistrationEnabled()) {
        setError('Public registration is currently disabled');
        return;
      }
      
      const userData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        nationalId: data.nationalId, 
        phone: data.phone,
        role: 'admin' // Default role for new registrations
      };
      await register(userData);
      // Redirect to root - RoleBasedRedirect will handle the proper destination
      navigate('/');
    } catch (err: any) {
      // Handle validation errors with specific field messages
      if (err.response?.status === 400 && err.response?.data?.errors) {
        // Display the first validation error message
        const firstError = err.response.data.errors[0];
        setError(firstError.msg || firstError.message || 'Validation failed');
      } else {
        setError(err.response?.data?.message || err.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  // Show maintenance mode message if enabled
  if (isMaintenanceMode()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">System Maintenance</h1>
            <p className="text-gray-600">{getMaintenanceMessage()}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex">
      {/* Left Side - Hero Image & Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Hero Image Background */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1973&q=80"
            alt="Modern office building"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 via-blue-800/70 to-indigo-900/60"></div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-blue-300/15 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-10 w-24 h-24 bg-indigo-300/15 rounded-full blur-xl animate-pulse delay-500"></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-start px-16 py-12">
          <div className="max-w-md">
            {/* Title */}
            <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
              New Project Starter Template
            </h1>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Modern enterprise application template with advanced features and seamless user experience
            </p>

            {/* Features */}
            <div className="space-y-5">
              <div className="flex items-center space-x-4">
                <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-green-500 rounded-full shadow-lg"></div>
                <span className="text-blue-100 text-lg font-medium">
                  Real-time notifications and messaging
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-green-500 rounded-full shadow-lg"></div>
                <span className="text-blue-100 text-lg font-medium">
                  Advanced loading states and smooth UX
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-green-500 rounded-full shadow-lg"></div>
                <span className="text-blue-100 text-lg font-medium">
                  Versioned API with backward compatibility
                </span>
              </div>
            </div>

            {/* Bottom decorative element */}
            <div className="mt-12 w-20 h-1 bg-gradient-to-r from-green-400 to-blue-400 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-12 lg:px-16 py-8">
        {/* Mobile Logo */}
        <div className="lg:hidden mb-8 text-center">
          <div className="flex justify-center mb-4">
            <NPSTLogo size="xl" showText={false} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            New Project Starter Template
          </h1>
          <p className="text-slate-600 text-base">Modern enterprise template with notifications, loading states, and API versioning</p>
        </div>

        {/* Form Container */}
        <div className="max-w-xl mx-auto w-full">
          <Card className="bg-white/90 backdrop-blur-md border-0 shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="text-center pb-6 pt-6">
              <div className="mb-4">
                <NPSTLogo size="lg" showText={false} className="justify-center" />
              </div>

              {/* Language Switcher */}
              <div className="flex justify-center mb-4">
                <div className="bg-slate-100 rounded-2xl p-2 border border-slate-200 shadow-sm">
                  <button
                    onClick={() => changeLanguage("en")}
                    className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      currentLanguage === "en"
                        ? "bg-blue-800 hover:bg-blue-900 text-white shadow-md"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    🇺🇸 English
                  </button>
                  <button
                    onClick={() => changeLanguage("so")}
                    className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      currentLanguage === "so"
                        ? "bg-blue-800 hover:bg-blue-900 text-white shadow-md"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    🇸🇴 Somali
                  </button>
                </div>
              </div>

              <CardTitle className="text-2xl font-bold text-slate-900 mb-2">
                {isLogin ? t("auth.welcomeBack") : t("auth.createAccount")}
              </CardTitle>
              <p className="text-slate-600 text-sm leading-relaxed">
                {isLogin ? t("auth.loginSubtitle") : t("auth.registerSubtitle")}
              </p>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-red-800 text-sm font-semibold mb-1">
                      {t("auth.loginFailed")}
                    </p>
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                </div>
              )}

              {/* Pre-filled credentials note */}
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-blue-800 text-sm font-semibold mb-1">
                      Super Admin Credentials Pre-filled
                    </p>
                    <p className="text-blue-600 text-sm">
                      Email and password are pre-filled for easy access. Click "Sign In" to login as super admin.
                    </p>
                  </div>
                </div>
              </div>

              {isLogin ? (
                <form
                  onSubmit={loginForm.handleSubmit(handleLogin)}
                  className="space-y-4"
                  noValidate
                >
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-slate-700 font-semibold text-sm"
                    >
                      {t("auth.email")}
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={t("auth.enterEmail")}
                      {...loginForm.register("email", {
                        onChange: () => {
                          if (error) setError("");
                        },
                      })}
                      className={`h-12 bg-white border-2 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 rounded-2xl px-4 ${
                        loginForm.formState.errors.email
                          ? "border-red-400 focus:border-red-400"
                          : ""
                      }`}
                    />
                    {loginForm.formState.errors.email && (
                      <p className="text-red-600 text-sm">
                        {loginForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="password"
                      className="text-slate-700 font-semibold text-sm"
                    >
                      {t("auth.password")}
                    </Label>
                    <PasswordInput
                      id="password"
                      placeholder={t("auth.enterPassword")}
                      {...loginForm.register("password", {
                        onChange: () => {
                          if (error) setError("");
                        },
                      })}
                      className={`h-12 bg-white border-2 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 rounded-2xl px-4 ${
                        loginForm.formState.errors.password
                          ? "border-red-400 focus:border-red-400"
                          : ""
                      }`}
                    />
                    {loginForm.formState.errors.password && (
                      <p className="text-red-600 text-sm">
                        {loginForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="organisationId"
                      className="text-slate-700 font-semibold text-sm"
                    >
                      Organisation
                    </Label>
                    <Select
                      onValueChange={(value) => {
                        loginForm.setValue("organisationId", value);
                        if (error) setError("");
                      }}
                      value={loginForm.watch("organisationId")}
                    >
                      <SelectTrigger className={`h-12 bg-white border-2 border-slate-200 text-slate-900 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 rounded-2xl px-4 ${
                        loginForm.formState.errors.organisationId
                          ? "border-red-400 focus:border-red-400"
                          : ""
                      }`}>
                        <div className="flex items-center">
                          <Building2 className="mr-2 h-4 w-4 text-slate-400" />
                          <SelectValue placeholder={loadingOrganisations ? "Loading organisations..." : "Select organisation"} />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200">
                        {organisations.map((org) => {
                          const orgId = (org as any).id || (org as any)._id;
                          return (
                            <SelectItem 
                              key={orgId} 
                              value={orgId}
                              className="text-slate-900 data-[highlighted]:bg-blue-500 data-[highlighted]:text-white"
                            >
                              <div className="flex items-center">
                                <Building2 className="mr-2 h-4 w-4" />
                                {org.name}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    {loginForm.formState.errors.organisationId && (
                      <p className="text-red-600 text-sm">
                        {loginForm.formState.errors.organisationId.message}
                      </p>
                    )}
                  </div>

                  {/* Forgot Password Link - Only show if enabled */}
                  {shouldShowForgotPassword() && (
                    <div className="flex justify-end">
                      <Link
                        to="/forgot-password"
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                      >
                        {t("auth.forgotPassword")}
                      </Link>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-12 bg-blue-800 hover:bg-blue-900 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed text-base"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>{t("common.loading")}</span>
                      </div>
                    ) : (
                      t("auth.login")
                    )}
                  </Button>
                </form>
              ) : (
                <form
                  onSubmit={registerForm.handleSubmit(handleRegister)}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label
                        htmlFor="firstName"
                        className="text-slate-700 font-semibold text-sm"
                      >
                        {t("auth.firstName")}
                      </Label>
                      <Input
                        id="firstName"
                        placeholder={t("auth.firstName")}
                        {...registerForm.register("firstName")}
                        className={`h-12 bg-white border-2 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 rounded-2xl px-4 ${
                          registerForm.formState.errors.firstName
                            ? "border-red-400 focus:border-red-400"
                            : ""
                        }`}
                      />
                      {registerForm.formState.errors.firstName && (
                        <p className="text-red-600 text-sm">
                          {registerForm.formState.errors.firstName.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="middleName"
                        className="text-slate-700 font-semibold text-sm"
                      >
                        {t("auth.middleName")}{" "}
                        <span className="text-slate-500 text-xs">
                          ({t("common.optional")})
                        </span>
                      </Label>
                      <Input
                        id="middleName"
                        placeholder={t("auth.middleName")}
                        {...registerForm.register("middleName")}
                        className={`h-12 bg-white border-2 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 rounded-2xl px-4 ${
                          registerForm.formState.errors.middleName
                            ? "border-red-400 focus:border-red-400"
                            : ""
                        }`}
                      />
                      {registerForm.formState.errors.middleName && (
                        <p className="text-red-600 text-sm">
                          {registerForm.formState.errors.middleName.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="lastName"
                      className="text-slate-700 font-semibold text-sm"
                    >
                      {t("auth.lastName")}
                    </Label>
                    <Input
                      id="lastName"
                      placeholder={t("auth.lastName")}
                      {...registerForm.register("lastName")}
                      className={`h-12 bg-white border-2 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 rounded-2xl px-4 ${
                        registerForm.formState.errors.lastName
                          ? "border-red-400 focus:border-red-400"
                          : ""
                      }`}
                    />
                    {registerForm.formState.errors.lastName && (
                      <p className="text-red-600 text-sm">
                        {registerForm.formState.errors.lastName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-slate-700 font-semibold text-sm"
                    >
                      {t("common.email")}
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={t("auth.enterEmail")}
                      {...registerForm.register("email")}
                      className={`h-12 bg-white border-2 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 rounded-2xl px-4 ${
                        registerForm.formState.errors.email
                          ? "border-red-400 focus:border-red-400"
                          : ""
                      }`}
                    />
                    {registerForm.formState.errors.email && (
                      <p className="text-red-600 text-sm">
                        {registerForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="nationalId"
                        className="text-slate-700 font-semibold text-sm"
                      >
                        National ID
                      </Label>
                      <Input
                        id="nationalId"
                        placeholder="National ID"
                        {...registerForm.register("nationalId")}
                        className={`h-12 bg-white border-2 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 rounded-2xl px-4 ${
                          registerForm.formState.errors.nationalId
                            ? "border-red-400 focus:border-red-400"
                            : ""
                        }`}
                      />
                      {registerForm.formState.errors.nationalId && (
                        <p className="text-red-600 text-sm">
                          {registerForm.formState.errors.nationalId.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="phone"
                        className="text-slate-700 font-semibold text-sm"
                      >
                        {t("auth.phone")}{" "}
                        <span className="text-slate-500 text-xs">
                          ({t("common.optional")})
                        </span>
                      </Label>
                      <Input
                        id="phone"
                        placeholder={t("auth.phone")}
                        {...registerForm.register("phone")}
                        className={`h-12 bg-white border-2 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 rounded-2xl px-4 ${
                          registerForm.formState.errors.phone
                            ? "border-red-400 focus:border-red-400"
                            : ""
                        }`}
                      />
                      {registerForm.formState.errors.phone && (
                        <p className="text-red-600 text-sm">
                          {registerForm.formState.errors.phone.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="password"
                      className="text-slate-700 font-semibold text-sm"
                    >
                      {t("auth.password")}
                    </Label>
                    <PasswordInput
                      id="password"
                      placeholder={t("auth.createPassword")}
                      {...registerForm.register("password")}
                      className={`h-12 bg-white border-2 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 rounded-2xl px-4 ${
                        registerForm.formState.errors.password
                          ? "border-red-400 focus:border-red-400"
                          : ""
                      }`}
                    />
                    {registerForm.formState.errors.password && (
                      <p className="text-red-600 text-sm">
                        {registerForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>{t("common.loading")}</span>
                      </div>
                    ) : (
                      t("auth.register")
                    )}
                  </Button>
                </form>
              )}

              {/* Toggle between Login/Register - Only show if registration is enabled */}
              {shouldShowRegistrationForm() && (
                <div className="mt-6 pt-4 border-t border-slate-200">
                  <div className="text-center">
                    <p className="text-slate-600 text-sm mb-3">
                      {isLogin
                        ? t("auth.dontHaveAccount")
                        : t("auth.alreadyHaveAccount")}
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsLogin(!isLogin);
                        setError("");
                        loginForm.reset();
                        registerForm.reset();
                      }}
                      className={`w-full h-12 border-2 font-bold rounded-2xl transition-all duration-200 text-base ${
                        isLogin
                          ? "border-green-600 text-white bg-green-600 hover:bg-green-700 hover:border-green-700"
                          : "border-blue-800 text-white bg-blue-800 hover:bg-blue-900 hover:border-blue-900"
                      }`}
                    >
                      {isLogin ? t("auth.register") : t("auth.login")}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
