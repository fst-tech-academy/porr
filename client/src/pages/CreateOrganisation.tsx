import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import Stepper from '../components/ui/stepper';
import { Building2, User, Settings, CheckCircle, ArrowLeft, ArrowRight, X, Eye, EyeOff } from 'lucide-react';
import { OrganisationFormData } from '../types';
import apiService from '../services/api';
import { getErrorMessage } from '../utils/errorHandler';

const organisationSchema = yup.object({
  name: yup.string().required('Organisation name is required'),
  description: yup.string().optional(),
  email: yup.string().email('Valid email is required').required('Email is required'),
  phone: yup.string().optional(),
  address: yup.object({
    street: yup.string().optional(),
    city: yup.string().optional(),
    state: yup.string().optional(),
    country: yup.string().optional(),
    postalCode: yup.string().optional(),
  }).optional(),
  settings: yup.object({
    maxUsers: yup.number().min(1, 'Max users must be at least 1').required('Max users is required'),
    features: yup.object({
      userManagement: yup.boolean().default(true),
      caseManagement: yup.boolean().default(true),
      offenceRecords: yup.boolean().default(true),
      fileUploads: yup.boolean().default(true),
      emailNotifications: yup.boolean().default(true),
      auditLogging: yup.boolean().default(true),
      dashboardAnalytics: yup.boolean().default(true),
    }).required(),
  }).required(),
  subscription: yup.object({
    plan: yup.string().oneOf(['free', 'basic', 'premium', 'enterprise']).required('Plan is required'),
    endDate: yup.string().optional(),
  }).required(),
  adminUser: yup.object({
    firstName: yup.string().required('Admin first name is required'),
    lastName: yup.string().required('Admin last name is required'),
    email: yup.string().email('Valid email is required').required('Admin email is required'),
    password: yup.string().min(8, 'Password must be at least 8 characters').required('Admin password is required'),
    phone: yup.string().optional(),
    nationalId: yup.string().optional(),
  }).required(),
});

const CreateOrganisation: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<OrganisationFormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);

  const steps = [
    {
      id: 'organisation',
      title: 'Organisation',
      description: 'Basic information',
      icon: <Building2 className="h-4 w-4" />
    },
    {
      id: 'admin',
      title: 'Admin User',
      description: 'Create admin account',
      icon: <User className="h-4 w-4" />
    },
    {
      id: 'settings',
      title: 'Settings',
      description: 'Configure features',
      icon: <Settings className="h-4 w-4" />
    },
    {
      id: 'review',
      title: 'Review',
      description: 'Confirm details',
      icon: <CheckCircle className="h-4 w-4" />
    }
  ];

  const form = useForm<OrganisationFormData>({
    resolver: yupResolver(organisationSchema),
    defaultValues: {
      name: '',
      description: '',
      email: '',
      phone: '',
      address: {
        street: '',
        city: '',
        state: '',
        country: '',
        postalCode: '',
      },
      settings: {
        maxUsers: 10,
        features: {
          userManagement: true,
          caseManagement: true,
          offenceRecords: true,
          fileUploads: true,
          emailNotifications: true,
          auditLogging: true,
          dashboardAnalytics: true,
        },
        isActive: true,
      },
      subscription: {
        plan: 'free',
        endDate: undefined,
      },
      adminUser: {
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        nationalId: '',
      },
    },
  });

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const data = form.getValues();
      const response = await apiService.createOrganisation(data);
      
      if (response.success) {
        navigate('/organisations');
      } else {
        setError(response.message || 'Failed to create organisation');
      }
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold text-black">Organisation Name *</Label>
                <Input
                  id="name"
                  {...form.register('name')}
                  placeholder="Enter organisation name"
                  className={`h-12 text-black ${form.formState.errors.name ? 'border-red-500' : ''}`}
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-500 text-black">{form.formState.errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-black">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  {...form.register('email')}
                  placeholder="Enter organisation email"
                  className={`h-12 text-black ${form.formState.errors.email ? 'border-red-500' : ''}`}
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-red-500 text-black">{form.formState.errors.email.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-black">Description</Label>
              <Input
                id="description"
                {...form.register('description')}
                placeholder="Brief description of the organisation"
                className="h-12 text-black"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-black">Phone</Label>
              <Input
                id="phone"
                {...form.register('phone')}
                placeholder="Enter phone number"
                className="h-12 text-black"
              />
            </div>

            <div className="space-y-6">
              <h4 className="font-semibold text-black text-lg">Address (Optional)</h4>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="street" className="text-black">Street</Label>
                  <Input
                    id="street"
                    {...form.register('address.street')}
                    placeholder="Street address"
                    className="h-12 text-black"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-black">City</Label>
                  <Input
                    id="city"
                    {...form.register('address.city')}
                    placeholder="City"
                    className="h-12 text-black"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state" className="text-black">State</Label>
                  <Input
                    id="state"
                    {...form.register('address.state')}
                    placeholder="State/Province"
                    className="h-12 text-black"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country" className="text-black">Country</Label>
                  <Input
                    id="country"
                    {...form.register('address.country')}
                    placeholder="Country"
                    className="h-12 text-black"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode" className="text-black">Postal Code</Label>
                  <Input
                    id="postalCode"
                    {...form.register('address.postalCode')}
                    placeholder="Postal code"
                    className="h-12 text-black"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="adminFirstName" className="text-sm font-semibold text-black">First Name *</Label>
                <Input
                  id="adminFirstName"
                  {...form.register('adminUser.firstName')}
                  placeholder="Admin first name"
                  className={`h-12 text-black ${form.formState.errors.adminUser?.firstName ? 'border-red-500' : ''}`}
                />
                {form.formState.errors.adminUser?.firstName && (
                  <p className="text-sm text-red-500 text-black">{form.formState.errors.adminUser.firstName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminLastName" className="text-sm font-semibold text-black">Last Name *</Label>
                <Input
                  id="adminLastName"
                  {...form.register('adminUser.lastName')}
                  placeholder="Admin last name"
                  className={`h-12 text-black ${form.formState.errors.adminUser?.lastName ? 'border-red-500' : ''}`}
                />
                {form.formState.errors.adminUser?.lastName && (
                  <p className="text-sm text-red-500 text-black">{form.formState.errors.adminUser.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminEmail" className="text-black">Email *</Label>
              <Input
                id="adminEmail"
                type="email"
                {...form.register('adminUser.email')}
                placeholder="Admin email address"
                className={`h-12 text-black ${form.formState.errors.adminUser?.email ? 'border-red-500' : ''}`}
              />
              {form.formState.errors.adminUser?.email && (
                <p className="text-sm text-red-500 text-black">{form.formState.errors.adminUser.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminPassword" className="text-black">Password *</Label>
              <div className="relative">
                <Input
                  id="adminPassword"
                  type={showPassword ? "text" : "password"}
                  {...form.register('adminUser.password')}
                  placeholder="Admin password"
                  className={`h-12 text-black pr-10 ${form.formState.errors.adminUser?.password ? 'border-red-500' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {form.formState.errors.adminUser?.password && (
                <p className="text-sm text-red-500 text-black">{form.formState.errors.adminUser.password.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="adminPhone" className="text-sm font-semibold text-black">Phone</Label>
                <Input
                  id="adminPhone"
                  {...form.register('adminUser.phone')}
                  placeholder="Admin phone number"
                  className="h-12 text-black"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminNationalId" className="text-sm font-semibold text-black">National ID</Label>
                <Input
                  id="adminNationalId"
                  {...form.register('adminUser.nationalId')}
                  placeholder="Admin national ID"
                  className="h-12 text-black"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h4 className="font-semibold text-black text-lg">Subscription Plan</h4>
                <div className="space-y-2">
                  <Label htmlFor="plan" className="text-sm font-semibold text-black">Plan *</Label>
                  <Select
                    value={form.watch('subscription.plan')}
                    onValueChange={(value) => form.setValue('subscription.plan', value as any)}
                  >
                    <SelectTrigger className="h-12 text-black bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500">
                      <SelectValue placeholder="Select subscription plan" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      <SelectItem value="free" className="text-black hover:bg-blue-50 focus:bg-blue-500 focus:text-white">Free</SelectItem>
                      <SelectItem value="basic" className="text-black hover:bg-blue-50 focus:bg-blue-500 focus:text-white">Basic</SelectItem>
                      <SelectItem value="premium" className="text-black hover:bg-blue-50 focus:bg-blue-500 focus:text-white">Premium</SelectItem>
                      <SelectItem value="enterprise" className="text-black hover:bg-blue-50 focus:bg-blue-500 focus:text-white">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="font-semibold text-black text-lg">User Limits</h4>
                <div className="space-y-2">
                  <Label htmlFor="maxUsers" className="text-sm font-semibold text-black">Maximum Users *</Label>
                  <Input
                    id="maxUsers"
                    type="number"
                    min="1"
                    {...form.register('settings.maxUsers', { valueAsNumber: true })}
                    className={`h-12 text-black ${form.formState.errors.settings?.maxUsers ? 'border-red-500' : ''}`}
                  />
                  {form.formState.errors.settings?.maxUsers && (
                    <p className="text-sm text-red-500 text-black">{form.formState.errors.settings.maxUsers.message}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="font-semibold text-black text-lg">Feature Access</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {Object.entries(form.watch('settings.features') || {}).map(([feature, enabled]) => (
                  <div key={feature} className="flex items-center justify-between p-3 border rounded-lg">
                    <Label htmlFor={feature} className="capitalize text-black">
                      {feature.replace(/([A-Z])/g, ' $1').trim()}
                    </Label>
                    <Switch
                      id={feature}
                      checked={enabled}
                      onCheckedChange={(checked) => form.setValue(`settings.features.${feature}` as any, checked)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-black mb-4">Review Organisation Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gray-50 border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-black">Organisation Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-black">
                  <p><strong className="text-black">Name:</strong> <span className="text-black">{form.watch('name')}</span></p>
                  <p><strong className="text-black">Email:</strong> <span className="text-black">{form.watch('email')}</span></p>
                  <p><strong className="text-black">Phone:</strong> <span className="text-black">{form.watch('phone') || 'N/A'}</span></p>
                  <p><strong className="text-black">Description:</strong> <span className="text-black">{form.watch('description') || 'N/A'}</span></p>
                  {form.watch('address') && (
                    <p><strong className="text-black">Address:</strong> <span className="text-black">{`${form.watch('address.street') || ''}, ${form.watch('address.city') || ''}, ${form.watch('address.country') || ''}`}</span></p>
                  )}
                </CardContent>
              </Card>
              <Card className="bg-gray-50 border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-black">Admin User Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-black">
                  <p><strong className="text-black">Name:</strong> <span className="text-black">{form.watch('adminUser.firstName')} {form.watch('adminUser.lastName')}</span></p>
                  <p><strong className="text-black">Email:</strong> <span className="text-black">{form.watch('adminUser.email')}</span></p>
                  <p><strong className="text-black">Phone:</strong> <span className="text-black">{form.watch('adminUser.phone') || 'N/A'}</span></p>
                  <p><strong className="text-black">National ID:</strong> <span className="text-black">{form.watch('adminUser.nationalId') || 'N/A'}</span></p>
                </CardContent>
              </Card>
            </div>
            <Card className="bg-gray-50 border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-black">Settings & Subscription</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-black">
                <p><strong className="text-black">Subscription Plan:</strong> <span className="text-black">{form.watch('subscription.plan')}</span></p>
                <p><strong className="text-black">Max Users:</strong> <span className="text-black">{form.watch('settings.maxUsers')}</span></p>
                <p><strong className="text-black">Enabled Features:</strong></p>
                <ul className="list-disc list-inside ml-4 text-black">
                  {Object.entries(form.watch('settings.features') || {}).map(([feature, enabled]) => (
                    enabled && <li key={feature} className="text-black">{feature.replace(/([A-Z])/g, ' $1').trim()}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
            <div className="absolute top-20 right-20 w-16 h-16 bg-white/10 rounded-full animate-pulse delay-1000"></div>
            <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-white/10 rounded-full animate-pulse delay-2000"></div>
          </div>
        </div>
        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <div className="text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold">Create Organisation</h1>
                  <p className="text-blue-100 text-lg">Set up a new organisation with admin user and configuration</p>
                </div>
              </div>
              <Button
                variant="ghost"
                onClick={() => navigate('/organisations')}
                className="text-white hover:bg-white/20 px-4 py-2 rounded-lg"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex items-center space-x-6 text-blue-100">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4" />
                <span>Step {currentStep + 1} of {steps.length}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>Multi-step Setup</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Stepper Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl sticky top-8">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
                <CardTitle className="flex items-center space-x-2 text-black">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  <span className="text-black">Setup Progress</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <Stepper
                  steps={steps}
                  currentStep={currentStep}
                  onStepClick={handleStepClick}
                />
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
                <CardTitle className="flex items-center space-x-2 text-black">
                  {steps[currentStep].icon}
                  <span className="text-black">{steps[currentStep].title}</span>
                </CardTitle>
                <p className="text-gray-700 text-black">{steps[currentStep].description}</p>
              </CardHeader>
              <CardContent className="p-8">
                {/* Error Display */}
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800 text-black">{error}</p>
                  </div>
                )}

                {/* Step Content */}
                <div className="mb-8 text-black">
                  {renderStepContent()}
                </div>

                {/* Navigation */}
                <div className="flex justify-between pt-6 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={currentStep === 0 ? () => navigate('/organisations') : handlePrevious}
                    disabled={isLoading}
                    className="flex items-center space-x-2 px-6 py-3 text-black"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span className="text-black">{currentStep === 0 ? 'Cancel' : 'Previous'}</span>
                  </Button>

                  <Button
                    type="button"
                    onClick={currentStep === steps.length - 1 ? handleSubmit : handleNext}
                    disabled={isLoading}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-6 py-3 text-white"
                  >
                    <span className="text-white">{currentStep === steps.length - 1 ? 'Create Organisation' : 'Next'}</span>
                    {currentStep < steps.length - 1 && <ArrowRight className="h-4 w-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateOrganisation;
