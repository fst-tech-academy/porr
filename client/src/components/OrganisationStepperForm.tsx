import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import Stepper from './ui/stepper';
import { Building2, User, Settings, CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { OrganisationFormData } from '../types';

const organisationSchema = yup.object({
  // Organisation Details
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
  
  // Settings
  settings: yup.object({
    maxUsers: yup.number().min(1, 'Must allow at least 1 user').required('Max users is required'),
    features: yup.object({
      userManagement: yup.boolean().required(),
      caseManagement: yup.boolean().required(),
      offenceRecords: yup.boolean().required(),
      fileUploads: yup.boolean().required(),
      emailNotifications: yup.boolean().required(),
      auditLogging: yup.boolean().required(),
      dashboardAnalytics: yup.boolean().required(),
    }).required(),
  }).optional(),
  
  // Subscription
  subscription: yup.object({
    plan: yup.string().oneOf(['free', 'basic', 'premium', 'enterprise']).required('Plan is required'),
    endDate: yup.string().optional(),
  }).optional(),
  
  // Admin User
  adminUser: yup.object({
    firstName: yup.string().required('Admin first name is required'),
    lastName: yup.string().required('Admin last name is required'),
    email: yup.string().email('Valid email is required').required('Admin email is required'),
    password: yup.string().min(6, 'Password must be at least 6 characters').required('Admin password is required'),
    phone: yup.string().optional(),
    nationalId: yup.string().optional(),
  }).required(),
});

interface OrganisationStepperFormProps {
  onSubmit: (data: OrganisationFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const OrganisationStepperForm: React.FC<OrganisationStepperFormProps> = ({
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<OrganisationFormData>>({});

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
      },
      subscription: {
        plan: 'free',
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

  const handleNext = async () => {
    const isValid = await form.trigger();
    if (isValid) {
      const currentData = form.getValues();
      setFormData(prev => ({ ...prev, ...currentData }));
      
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        // Final step - submit form
        await onSubmit(currentData);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    if (stepIndex < currentStep) {
      setCurrentStep(stepIndex);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold text-gray-700">Organisation Name *</Label>
                <Input
                  id="name"
                  {...form.register('name')}
                  placeholder="Enter organisation name"
                  className={`h-12 ${form.formState.errors.name ? 'border-red-500' : ''}`}
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  {...form.register('email')}
                  placeholder="Enter organisation email"
                  className={`h-12 ${form.formState.errors.email ? 'border-red-500' : ''}`}
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                {...form.register('description')}
                placeholder="Brief description of the organisation"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                {...form.register('phone')}
                placeholder="Enter phone number"
              />
            </div>

            <div className="space-y-6">
              <h4 className="font-semibold text-gray-900 text-lg">Address (Optional)</h4>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="street">Street</Label>
                  <Input
                    id="street"
                    {...form.register('address.street')}
                    placeholder="Street address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    {...form.register('address.city')}
                    placeholder="City"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    {...form.register('address.state')}
                    placeholder="State/Province"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    {...form.register('address.country')}
                    placeholder="Country"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    {...form.register('address.postalCode')}
                    placeholder="Postal code"
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
                <Label htmlFor="adminFirstName" className="text-sm font-semibold text-gray-700">First Name *</Label>
                <Input
                  id="adminFirstName"
                  {...form.register('adminUser.firstName')}
                  placeholder="Admin first name"
                  className={`h-12 ${form.formState.errors.adminUser?.firstName ? 'border-red-500' : ''}`}
                />
                {form.formState.errors.adminUser?.firstName && (
                  <p className="text-sm text-red-500">{form.formState.errors.adminUser.firstName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminLastName" className="text-sm font-semibold text-gray-700">Last Name *</Label>
                <Input
                  id="adminLastName"
                  {...form.register('adminUser.lastName')}
                  placeholder="Admin last name"
                  className={`h-12 ${form.formState.errors.adminUser?.lastName ? 'border-red-500' : ''}`}
                />
                {form.formState.errors.adminUser?.lastName && (
                  <p className="text-sm text-red-500">{form.formState.errors.adminUser.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminEmail">Email *</Label>
              <Input
                id="adminEmail"
                type="email"
                {...form.register('adminUser.email')}
                placeholder="Admin email address"
                className={form.formState.errors.adminUser?.email ? 'border-red-500' : ''}
              />
              {form.formState.errors.adminUser?.email && (
                <p className="text-sm text-red-500">{form.formState.errors.adminUser.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminPassword">Password *</Label>
              <Input
                id="adminPassword"
                type="password"
                {...form.register('adminUser.password')}
                placeholder="Admin password (min 6 characters)"
                className={form.formState.errors.adminUser?.password ? 'border-red-500' : ''}
              />
              {form.formState.errors.adminUser?.password && (
                <p className="text-sm text-red-500">{form.formState.errors.adminUser.password.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="adminPhone" className="text-sm font-semibold text-gray-700">Phone</Label>
                <Input
                  id="adminPhone"
                  {...form.register('adminUser.phone')}
                  placeholder="Admin phone number"
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminNationalId" className="text-sm font-semibold text-gray-700">National ID</Label>
                <Input
                  id="adminNationalId"
                  {...form.register('adminUser.nationalId')}
                  placeholder="Admin national ID"
                  className="h-12"
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
                <h4 className="font-semibold text-gray-900 text-lg">Subscription Plan</h4>
                <div className="space-y-2">
                  <Label htmlFor="plan" className="text-sm font-semibold text-gray-700">Plan *</Label>
                  <Select
                    value={form.watch('subscription.plan')}
                    onValueChange={(value) => form.setValue('subscription.plan', value as any)}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select subscription plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="font-semibold text-gray-900 text-lg">User Limits</h4>
                <div className="space-y-2">
                  <Label htmlFor="maxUsers" className="text-sm font-semibold text-gray-700">Maximum Users *</Label>
                  <Input
                    id="maxUsers"
                    type="number"
                    min="1"
                    {...form.register('settings.maxUsers', { valueAsNumber: true })}
                    className={`h-12 ${form.formState.errors.settings?.maxUsers ? 'border-red-500' : ''}`}
                  />
                  {form.formState.errors.settings?.maxUsers && (
                    <p className="text-sm text-red-500">{form.formState.errors.settings.maxUsers.message}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="font-semibold text-gray-900 text-lg">Feature Access</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {Object.entries(form.watch('settings.features') || {}).map(([feature, enabled]) => (
                  <div key={feature} className="flex items-center justify-between p-3 border rounded-lg">
                    <Label htmlFor={feature} className="capitalize">
                      {feature.replace(/([A-Z])/g, ' $1').trim()}
                    </Label>
                    <Switch
                      id={feature}
                      checked={enabled}
                      onCheckedChange={(checked) => 
                        form.setValue(`settings.features.${feature}` as any, checked)
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        const reviewData = form.getValues();
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-4">Organisation Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Name:</span> {reviewData.name}
                </div>
                <div>
                  <span className="font-medium">Email:</span> {reviewData.email}
                </div>
                <div>
                  <span className="font-medium">Phone:</span> {reviewData.phone || 'Not provided'}
                </div>
                <div>
                  <span className="font-medium">Plan:</span> {reviewData.subscription?.plan}
                </div>
                <div>
                  <span className="font-medium">Max Users:</span> {reviewData.settings?.maxUsers}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-4">Admin User</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Name:</span> {reviewData.adminUser?.firstName} {reviewData.adminUser?.lastName}
                </div>
                <div>
                  <span className="font-medium">Email:</span> {reviewData.adminUser?.email}
                </div>
                <div>
                  <span className="font-medium">Phone:</span> {reviewData.adminUser?.phone || 'Not provided'}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-4">Enabled Features</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                {Object.entries(reviewData.settings?.features || {})
                  .filter(([_, enabled]) => enabled)
                  .map(([feature, _]) => (
                    <div key={feature} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="capitalize">{feature.replace(/([A-Z])/g, ' $1').trim()}</span>
                    </div>
                  ))}
              </div>
            </div>
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
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">Create Organisation</h1>
                <p className="text-blue-100 text-lg">Set up a new organisation with admin user and configuration</p>
              </div>
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Stepper Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl sticky top-8">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  <span>Setup Progress</span>
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
          <div className="lg:col-span-3">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
                <CardTitle className="flex items-center space-x-2">
                  {steps[currentStep].icon}
                  <span>{steps[currentStep].title}</span>
                </CardTitle>
                <p className="text-gray-600">{steps[currentStep].description}</p>
              </CardHeader>
              <CardContent className="p-8">
                {/* Step Content */}
                <div className="mb-8">
                  {renderStepContent()}
                </div>

                {/* Navigation */}
                <div className="flex justify-between pt-6 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={currentStep === 0 ? onCancel : handlePrevious}
                    disabled={loading}
                    className="flex items-center space-x-2 px-6 py-3"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>{currentStep === 0 ? 'Cancel' : 'Previous'}</span>
                  </Button>

                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={loading}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-6 py-3"
                  >
                    <span>{currentStep === steps.length - 1 ? 'Create Organisation' : 'Next'}</span>
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

export default OrganisationStepperForm;
