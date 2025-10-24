// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
// @ts-ignore
import { Separator } from './ui/separator';
// @ts-ignore
import { Alert, AlertDescription } from './ui/alert';
import { Save, Settings, Users, Shield, Monitor, Wrench, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface SettingsData {
  systemName: string;
  systemDescription: string;
  registration: {
    publicRegistration: boolean;
    adminRegistration: boolean;
    emailVerificationRequired: boolean;
    autoApproveUsers: boolean;
    allowedRoles: string[];
  };
  authentication: {
    sessionTimeout: number;
    maxLoginAttempts: number;
    lockoutDuration: number;
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumbers: boolean;
      requireSpecialChars: boolean;
    };
  };
  features: {
    auditLogging: boolean;
    emailNotifications: boolean;
    fileUploads: boolean;
    dashboardAnalytics: boolean;
    userManagement: boolean;
    caseManagement: boolean;
    offenceRecords: boolean;
  };
  ui: {
    theme: string;
    language: string;
    showRegistrationForm: boolean;
    showForgotPassword: boolean;
  };
  security: {
    ipWhitelist: string[];
    requireHttps: boolean;
    enableCors: boolean;
    allowedOrigins: string[];
  };
  maintenance: {
    isMaintenanceMode: boolean;
    maintenanceMessage: string;
    allowedMaintenanceUsers: string[];
  };
}

// Validation schema
const settingsSchema = yup.object().shape({
  systemName: yup.string().required('System name is required').min(3, 'System name must be at least 3 characters'),
  systemDescription: yup.string().required('System description is required').min(10, 'System description must be at least 10 characters'),
  registration: yup.object().shape({
    publicRegistration: yup.boolean(),
    adminRegistration: yup.boolean(),
    emailVerificationRequired: yup.boolean(),
    autoApproveUsers: yup.boolean(),
    allowedRoles: yup.array().of(yup.string())
  }),
  authentication: yup.object().shape({
    sessionTimeout: yup.number().min(1, 'Session timeout must be at least 1 hour').max(168, 'Session timeout cannot exceed 168 hours'),
    maxLoginAttempts: yup.number().min(3, 'Max login attempts must be at least 3').max(10, 'Max login attempts cannot exceed 10'),
    lockoutDuration: yup.number().min(5, 'Lockout duration must be at least 5 minutes').max(1440, 'Lockout duration cannot exceed 1440 minutes'),
    passwordPolicy: yup.object().shape({
      minLength: yup.number().min(4, 'Minimum length must be at least 4').max(20, 'Minimum length cannot exceed 20'),
      requireUppercase: yup.boolean(),
      requireLowercase: yup.boolean(),
      requireNumbers: yup.boolean(),
      requireSpecialChars: yup.boolean()
    })
  }),
  features: yup.object().shape({
    auditLogging: yup.boolean(),
    emailNotifications: yup.boolean(),
    fileUploads: yup.boolean(),
    dashboardAnalytics: yup.boolean(),
    userManagement: yup.boolean(),
    caseManagement: yup.boolean(),
    offenceRecords: yup.boolean()
  }),
  ui: yup.object().shape({
    theme: yup.string().oneOf(['light', 'dark', 'auto'], 'Invalid theme selection'),
    language: yup.string().oneOf(['en', 'so'], 'Invalid language selection'),
    showRegistrationForm: yup.boolean(),
    showForgotPassword: yup.boolean()
  }),
  security: yup.object().shape({
    ipWhitelist: yup.array().of(yup.string()),
    requireHttps: yup.boolean(),
    enableCors: yup.boolean(),
    allowedOrigins: yup.array().of(yup.string())
  }),
  maintenance: yup.object().shape({
    isMaintenanceMode: yup.boolean(),
    maintenanceMessage: yup.string().when('isMaintenanceMode', {
      is: true,
      then: (schema) => schema.required('Maintenance message is required when maintenance mode is enabled'),
      otherwise: (schema) => schema
    }),
    allowedMaintenanceUsers: yup.array().of(yup.string())
  })
});

const SettingsForm: React.FC = () => {
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const { t } = useLanguage();

  const form = useForm<any>({
    resolver: yupResolver(settingsSchema),
    defaultValues: {
      systemName: 'New Project Starter Template',
      systemDescription: 'A comprehensive system for managing offence records and legal proceedings',
      registration: {
        publicRegistration: true,
        adminRegistration: true,
        emailVerificationRequired: true,
        autoApproveUsers: false,
        allowedRoles: ['admin', 'manager', 'officer', 'viewer']
      },
      authentication: {
        sessionTimeout: 24,
        maxLoginAttempts: 5,
        lockoutDuration: 30,
        passwordPolicy: {
          minLength: 6,
          requireUppercase: false,
          requireLowercase: false,
          requireNumbers: false,
          requireSpecialChars: false
        }
      },
      features: {
        auditLogging: true,
        emailNotifications: true,
        fileUploads: true,
        dashboardAnalytics: true,
        userManagement: true,
        caseManagement: true,
        offenceRecords: true
      },
      ui: {
        theme: 'light',
        language: 'en',
        showRegistrationForm: true,
        showForgotPassword: true
      },
      security: {
        ipWhitelist: [],
        requireHttps: false,
        enableCors: true,
        allowedOrigins: ['http://localhost:3000', 'http://localhost:3009']
      },
      maintenance: {
        isMaintenanceMode: false,
        maintenanceMessage: 'System is under maintenance. Please try again later.',
        allowedMaintenanceUsers: []
      }
    }
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/settings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSettings(data.data.settings);
        form.reset(data.data.settings);
      } else {
        setMessage({ type: 'error', text: 'Failed to fetch settings' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error fetching settings' });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      setSaving(true);
      setMessage(null);
      
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        const responseData = await response.json();
        setMessage({ type: 'success', text: 'Settings updated successfully' });
        setSettings(responseData.data.settings);
        
        // Clear any form errors
        form.clearErrors();
      } else {
        const errorData = await response.json();
        let errorMessage = 'Failed to update settings';
        
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.errors && Array.isArray(errorData.errors)) {
          errorMessage = errorData.errors.map((err: any) => err.msg || err.message).join(', ');
        }
        
        setMessage({ type: 'error', text: errorMessage });
        
        // Set form errors if validation errors are returned
        if (errorData.errors && Array.isArray(errorData.errors)) {
          errorData.errors.forEach((error: any) => {
            if (error.path) {
              form.setError(error.path as any, {
                type: 'server',
                message: error.msg || error.message
              });
            }
          });
        }
      }
    } catch (error) {
      console.error('Settings update error:', error);
      setMessage({ type: 'error', text: 'Network error. Please check your connection and try again.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-3 text-gray-600 font-medium">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
              <p className="text-gray-600 mt-1">Configure your system preferences and features</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSettings}
            className="flex items-center space-x-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 shadow-sm"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Status Message */}
      {message && (
        <Alert className={`mb-6 shadow-lg border-2 ${message.type === 'success' ? 'border-green-300 bg-gradient-to-r from-green-50 to-green-100' : 'border-red-300 bg-gradient-to-r from-red-50 to-red-100'}`}>
          <div className="flex items-center space-x-3">
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-600" />
            )}
            <AlertDescription className={`font-medium ${message.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
              {message.text}
            </AlertDescription>
          </div>
        </Alert>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="general" className="w-full">
          {/* Enhanced Tab Navigation */}
          <TabsList className="grid w-full grid-cols-6 bg-white p-0 rounded-xl shadow-lg border border-gray-200 mb-0">
            <TabsTrigger value="general" className="flex items-center space-x-2 text-sm data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 hover:bg-blue-50 rounded-lg">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">General</span>
            </TabsTrigger>
            <TabsTrigger value="registration" className="flex items-center space-x-2 text-sm data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 hover:bg-blue-50 rounded-lg">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Registration</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center space-x-2 text-sm data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 hover:bg-blue-50 rounded-lg">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="features" className="flex items-center space-x-2 text-sm data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 hover:bg-blue-50 rounded-lg">
              <Monitor className="h-4 w-4" />
              <span className="hidden sm:inline">Features</span>
            </TabsTrigger>
            <TabsTrigger value="ui" className="flex items-center space-x-2 text-sm data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 hover:bg-blue-50 rounded-lg">
              <Monitor className="h-4 w-4" />
              <span className="hidden sm:inline">UI/UX</span>
            </TabsTrigger>
            <TabsTrigger value="maintenance" className="flex items-center space-x-2 text-sm data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 hover:bg-blue-50 rounded-lg">
              <Wrench className="h-4 w-4" />
              <span className="hidden sm:inline">Maintenance</span>
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-6">
            <Card className="border-2 border-gray-200 shadow-xl bg-white rounded-xl overflow-hidden">
              <CardHeader className="bg-blue-500 border-b border-blue-600 pb-4">
                <CardTitle className="text-xl font-bold text-white flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-white" />
                  <span>General Settings</span>
                </CardTitle>
                <p className="text-sm text-blue-100 mt-1">Basic system configuration</p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="systemName" className="text-sm font-medium text-gray-700">System Name</Label>
                    <Input
                      id="systemName"
                      {...form.register('systemName')}
                      placeholder="Enter system name"
                      className={`border-2 ${form.formState.errors.systemName ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-sm rounded-lg text-black`}
                    />
                    {form.formState.errors.systemName && (
                      <p className="text-sm text-red-600">
                        {/* @ts-ignore */}
                        {form.formState.errors.systemName.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="systemDescription" className="text-sm font-medium text-gray-700">System Description</Label>
                    <Input
                      id="systemDescription"
                      {...form.register('systemDescription')}
                      placeholder="Enter system description"
                      className={`border-2 ${form.formState.errors.systemDescription ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-sm rounded-lg text-black`}
                    />
                    {form.formState.errors.systemDescription && (
                      <p className="text-sm text-red-600">
                        {/* @ts-ignore */}
                        {form.formState.errors.systemDescription.message}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* User Roles & Permissions */}
            <Card className="border-2 border-gray-200 shadow-xl bg-white rounded-xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 border-b border-purple-600 pb-4">
                <CardTitle className="text-xl font-bold text-white flex items-center space-x-2">
                  <Users className="h-5 w-5 text-white" />
                  <span>User Roles & Permissions</span>
                </CardTitle>
                <p className="text-sm text-purple-100 mt-1">Available roles and their access permissions</p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {/* Super Admin */}
                  <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 rounded-xl p-6 shadow-lg">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-red-500 rounded-lg">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-red-800">Super Admin</h3>
                        <p className="text-sm text-red-600">Highest level access</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-red-800">Permissions:</h4>
                      <ul className="text-sm text-red-700 space-y-1">
                        <li>• Full system access</li>
                        <li>• Manage all settings</li>
                        <li>• View audit logs</li>
                        <li>• Manage all users</li>
                        <li>• System maintenance</li>
                        <li>• Database management</li>
                      </ul>
                    </div>
                  </div>

                  {/* Admin */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-6 shadow-lg">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-blue-500 rounded-lg">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-blue-800">Admin</h3>
                        <p className="text-sm text-blue-600">Administrative access</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-blue-800">Permissions:</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Dashboard analytics</li>
                        <li>• User management</li>
                        <li>• Case management</li>
                        <li>• Offence records</li>
                        <li>• File uploads</li>
                        <li>• Email notifications</li>
                      </ul>
                    </div>
                  </div>

                  {/* Manager */}
                  <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl p-6 shadow-lg">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-green-500 rounded-lg">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-green-800">Manager</h3>
                        <p className="text-sm text-green-600">Management level access</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-green-800">Permissions:</h4>
                      <ul className="text-sm text-green-700 space-y-1">
                        <li>• Dashboard analytics</li>
                        <li>• User management</li>
                        <li>• Case management</li>
                        <li>• Offence records</li>
                        <li>• File uploads</li>
                        <li>• Email notifications</li>
                      </ul>
                    </div>
                  </div>

                  {/* Officer */}
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 rounded-xl p-6 shadow-lg">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-orange-500 rounded-lg">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-orange-800">Officer</h3>
                        <p className="text-sm text-orange-600">Operational access</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-orange-800">Permissions:</h4>
                      <ul className="text-sm text-orange-700 space-y-1">
                        <li>• Dashboard analytics</li>
                        <li>• Case management</li>
                        <li>• Offence records</li>
                        <li>• File uploads</li>
                        <li>• Email notifications</li>
                        <li>• View user profiles</li>
                      </ul>
                    </div>
                  </div>

                  {/* Viewer */}
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl p-6 shadow-lg">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-gray-500 rounded-lg">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">Viewer</h3>
                        <p className="text-sm text-gray-600">Read-only access</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-800">Permissions:</h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Dashboard analytics</li>
                        <li>• View cases</li>
                        <li>• View offence records</li>
                        <li>• View uploaded files</li>
                        <li>• Email notifications</li>
                        <li>• View user profiles</li>
                      </ul>
                    </div>
                  </div>

                </div>

                {/* Feature Access Matrix */}
                <div className="mt-8">
                  <h4 className="text-lg font-bold text-gray-900 mb-4">Feature Access Matrix</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300 rounded-lg overflow-hidden shadow-lg">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-800">Feature</th>
                          <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-800">Super Admin</th>
                          <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-800">Admin</th>
                          <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-800">Manager</th>
                          <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-800">Officer</th>
                          <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-800">Viewer</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { feature: 'Dashboard Analytics', superAdmin: '✓', admin: '✓', manager: '✓', officer: '✓', viewer: '✓' },
                          { feature: 'User Management', superAdmin: '✓', admin: '✓', manager: '✓', officer: '✗', viewer: '✗' },
                          { feature: 'Case Management', superAdmin: '✓', admin: '✓', manager: '✓', officer: '✓', viewer: '✓' },
                          { feature: 'Offence Records', superAdmin: '✓', admin: '✓', manager: '✓', officer: '✓', viewer: '✓' },
                          { feature: 'File Uploads', superAdmin: '✓', admin: '✓', manager: '✓', officer: '✓', viewer: '✓' },
                          { feature: 'Email Notifications', superAdmin: '✓', admin: '✓', manager: '✓', officer: '✓', viewer: '✓' },
                          { feature: 'Audit Logging', superAdmin: '✓', admin: '✓', manager: '✗', officer: '✗', viewer: '✗' },
                          { feature: 'System Settings', superAdmin: '✓', admin: '✗', manager: '✗', officer: '✗', viewer: '✗' }
                        ].map((row, index) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="border border-gray-300 px-4 py-3 font-medium text-gray-800">{row.feature}</td>
                            <td className="border border-gray-300 px-4 py-3 text-center text-green-600 font-bold">{row.superAdmin}</td>
                            <td className="border border-gray-300 px-4 py-3 text-center text-blue-600 font-bold">{row.admin}</td>
                            <td className="border border-gray-300 px-4 py-3 text-center text-green-600 font-bold">{row.manager}</td>
                            <td className="border border-gray-300 px-4 py-3 text-center text-orange-600 font-bold">{row.officer}</td>
                            <td className="border border-gray-300 px-4 py-3 text-center text-gray-600 font-bold">{row.viewer}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Registration Settings */}
          <TabsContent value="registration" className="space-y-6">
            <Card className="border-2 border-gray-200 shadow-xl bg-white rounded-xl overflow-hidden">
              <CardHeader className="bg-blue-500 border-b border-blue-600 pb-4">
                <CardTitle className="text-xl font-bold text-white flex items-center space-x-2">
                  <Users className="h-5 w-5 text-white" />
                  <span>Registration Settings</span>
                </CardTitle>
                <p className="text-sm text-blue-100 mt-1">Configure user registration and authentication</p>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Registration Options */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Registration Options</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="space-y-1">
                        <Label className="font-semibold text-gray-800">Public Registration</Label>
                        <p className="text-sm text-gray-600">Allow users to register publicly</p>
                      </div>
                      <Switch
                        checked={form.watch('registration.publicRegistration')}
                        onCheckedChange={(checked) => form.setValue('registration.publicRegistration', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="space-y-1">
                        <Label className="font-semibold text-gray-800">Admin Registration</Label>
                        <p className="text-sm text-gray-600">Allow admins to create users</p>
                      </div>
                      <Switch
                        checked={form.watch('registration.adminRegistration')}
                        onCheckedChange={(checked) => form.setValue('registration.adminRegistration', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="space-y-1">
                        <Label className="font-semibold text-gray-800">Email Verification</Label>
                        <p className="text-sm text-gray-600">Require email verification</p>
                      </div>
                      <Switch
                        checked={form.watch('registration.emailVerificationRequired')}
                        onCheckedChange={(checked) => form.setValue('registration.emailVerificationRequired', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="space-y-1">
                        <Label className="font-semibold text-gray-800">Auto-approve Users</Label>
                        <p className="text-sm text-gray-600">Automatically approve registrations</p>
                      </div>
                      <Switch
                        checked={form.watch('registration.autoApproveUsers')}
                        onCheckedChange={(checked) => form.setValue('registration.autoApproveUsers', checked)}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Password Policy */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 text-lg">Password Policy</h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="minLength" className="text-sm font-semibold text-gray-700">Minimum Length</Label>
                      <Input
                        id="minLength"
                        type="number"
                        {...form.register('authentication.passwordPolicy.minLength', { valueAsNumber: true })}
                        min="4"
                        max="20"
                        className={`border-2 ${form.formState.errors.authentication?.passwordPolicy?.minLength ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-sm rounded-lg text-black`}
                      />
                      {/* @ts-ignore */}
                      {form.formState.errors.authentication?.passwordPolicy?.minLength && (
                        <p className="text-sm text-red-600">
                          {/* @ts-ignore */}
                          {form.formState.errors.authentication.passwordPolicy.minLength.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-700">Password Requirements</Label>
                      <div className="space-y-3">
                        {[
                          { key: 'requireUppercase', label: 'Uppercase Letters' },
                          { key: 'requireLowercase', label: 'Lowercase Letters' },
                          { key: 'requireNumbers', label: 'Numbers' },
                          { key: 'requireSpecialChars', label: 'Special Characters' }
                        ].map(({ key, label }, index) => (
                          <div key={key} className={`flex items-center space-x-3 p-3 ${index % 2 === 0 ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200'} rounded-lg border shadow-sm`}>
                            <Switch
                              checked={form.watch(`authentication.passwordPolicy.${key}` as any)}
                              onCheckedChange={(checked) => form.setValue(`authentication.passwordPolicy.${key}` as any, checked)}
                            />
                            <Label className="text-sm font-medium text-gray-700">{label}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-6">
            <Card className="border-2 border-gray-200 shadow-xl bg-white rounded-xl overflow-hidden">
              <CardHeader className="bg-blue-500 border-b border-blue-600 pb-4">
                <CardTitle className="text-xl font-bold text-white flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-white" />
                  <span>Security Settings</span>
                </CardTitle>
                <p className="text-sm text-blue-100 mt-1">Configure security and access controls</p>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="space-y-1">
                      <Label className="font-semibold text-gray-800">HTTPS Required</Label>
                      <p className="text-sm text-gray-600">Force HTTPS connections</p>
                    </div>
                    <Switch
                      checked={form.watch('security.requireHttps')}
                      onCheckedChange={(checked) => form.setValue('security.requireHttps', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="space-y-1">
                      <Label className="font-semibold text-gray-800">Enable CORS</Label>
                      <p className="text-sm text-gray-600">Cross-origin resource sharing</p>
                    </div>
                    <Switch
                      checked={form.watch('security.enableCors')}
                      onCheckedChange={(checked) => form.setValue('security.enableCors', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Features Settings */}
          <TabsContent value="features" className="space-y-6">
            <Card className="border-2 border-gray-200 shadow-xl bg-white rounded-xl overflow-hidden">
              <CardHeader className="bg-blue-500 border-b border-blue-600 pb-4">
                <CardTitle className="text-xl font-bold text-white flex items-center space-x-2">
                  <Monitor className="h-5 w-5 text-blue-600" />
                  <span>Feature Toggles</span>
                </CardTitle>
                <p className="text-sm text-blue-100 mt-1">Enable or disable system features</p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* @ts-ignore */}
                  {Object.entries(form.watch('features')).map(([key, value], index) => (
                    <div key={key} className={`flex items-center justify-between p-4 ${index % 2 === 0 ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200'} rounded-xl border shadow-sm hover:shadow-md transition-shadow`}>
                      <div className="space-y-1">
                        <Label className="font-semibold text-gray-800 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </Label>
                        <p className="text-sm text-gray-600">
                          Enable {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                        </p>
                      </div>
                      <Switch
                        checked={value as boolean}
                        onCheckedChange={(checked) => form.setValue(`features.${key}` as any, checked)}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* UI/UX Settings */}
          <TabsContent value="ui" className="space-y-6">
            <Card className="border-2 border-gray-200 shadow-xl bg-white rounded-xl overflow-hidden">
              <CardHeader className="bg-blue-500 border-b border-blue-600 pb-4">
                <CardTitle className="text-xl font-bold text-white flex items-center space-x-2">
                  <Monitor className="h-5 w-5 text-white" />
                  <span>UI/UX Settings</span>
                </CardTitle>
                <p className="text-sm text-blue-100 mt-1">Configure user interface preferences</p>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="theme" className="text-sm font-semibold text-gray-700">Theme</Label>
                    <Select
                      value={form.watch('ui.theme')}
                      onValueChange={(value) => form.setValue('ui.theme', value)}
                    >
                      <SelectTrigger className="border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-sm rounded-lg text-black bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 shadow-lg rounded-lg">
                        <SelectItem value="light" className="text-black hover:bg-blue-50 focus:bg-blue-500 focus:text-white">Light</SelectItem>
                        <SelectItem value="dark" className="text-black hover:bg-blue-50 focus:bg-blue-500 focus:text-white">Dark</SelectItem>
                        <SelectItem value="auto" className="text-black hover:bg-blue-50 focus:bg-blue-500 focus:text-white">Auto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language" className="text-sm font-semibold text-gray-700">Language</Label>
                    <Select
                      value={form.watch('ui.language')}
                      onValueChange={(value) => form.setValue('ui.language', value)}
                    >
                      <SelectTrigger className="border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-sm rounded-lg text-black bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 shadow-lg rounded-lg">
                        <SelectItem value="en" className="text-black hover:bg-blue-50 focus:bg-blue-500 focus:text-white">English</SelectItem>
                        <SelectItem value="so" className="text-black hover:bg-blue-50 focus:bg-blue-500 focus:text-white">Somali</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 text-lg">Login Page Options</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="space-y-1">
                        <Label className="font-semibold text-gray-800">Show Registration Form</Label>
                        <p className="text-sm text-gray-600">Display registration form on login page</p>
                      </div>
                      <Switch
                        checked={form.watch('ui.showRegistrationForm')}
                        onCheckedChange={(checked) => form.setValue('ui.showRegistrationForm', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="space-y-1">
                        <Label className="font-semibold text-gray-800">Show Forgot Password</Label>
                        <p className="text-sm text-gray-600">Display forgot password link</p>
                      </div>
                      <Switch
                        checked={form.watch('ui.showForgotPassword')}
                        onCheckedChange={(checked) => form.setValue('ui.showForgotPassword', checked)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Maintenance Settings */}
          <TabsContent value="maintenance" className="space-y-6">
            <Card className="border-2 border-gray-200 shadow-xl bg-white rounded-xl overflow-hidden">
              <CardHeader className="bg-blue-500 border-b border-blue-600 pb-4">
                <CardTitle className="text-xl font-bold text-white flex items-center space-x-2">
                  <Wrench className="h-5 w-5 text-white" />
                  <span>Maintenance Settings</span>
                </CardTitle>
                <p className="text-sm text-blue-100 mt-1">Configure system maintenance mode</p>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="space-y-1">
                    <Label className="font-semibold text-gray-800">Maintenance Mode</Label>
                    <p className="text-sm text-gray-600">Enable maintenance mode to restrict access</p>
                  </div>
                  <Switch
                    checked={form.watch('maintenance.isMaintenanceMode')}
                    onCheckedChange={(checked) => form.setValue('maintenance.isMaintenanceMode', checked)}
                  />
                </div>

                {form.watch('maintenance.isMaintenanceMode') && (
                  <div className="space-y-2">
                    <Label htmlFor="maintenanceMessage" className="text-sm font-semibold text-gray-700">Maintenance Message</Label>
                    <Input
                      id="maintenanceMessage"
                      {...form.register('maintenance.maintenanceMessage')}
                      placeholder="Enter maintenance message"
                      className={`border-2 ${form.formState.errors.maintenance?.maintenanceMessage ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-sm rounded-lg text-black`}
                    />
                    {form.formState.errors.maintenance?.maintenanceMessage && (
                      <p className="text-sm text-red-600">
                        {form.formState.errors.maintenance.maintenanceMessage.message}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Enhanced Action Buttons */}
        <div className="flex justify-end space-x-4 pt-8 border-t-2 border-gray-200 bg-white p-6 rounded-xl shadow-lg">
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset(settings)}
            className="flex items-center space-x-2 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Reset</span>
          </Button>
          <Button
            type="submit"
            disabled={saving}
            className="flex items-center space-x-2 bg-white border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 font-semibold"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SettingsForm;