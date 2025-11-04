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
import Stepper from '../components/ui/stepper';
import { Gavel, Building2, MapPin, Phone, CheckCircle, ArrowLeft, ArrowRight, X } from 'lucide-react';
import { CourtFormData } from '../types';
import api from '../services/api';

const courtSchema = yup.object({
  name: yup.string().required('Court name is required'),
  code: yup.string().required('Court code is required'),
  description: yup.string().optional(),
  type: yup.string().required('Court type is required'),
  jurisdiction: yup.string().required('Jurisdiction is required'),
  level: yup.string().required('Court level is required'),
  address: yup.object({
    street: yup.string().optional(),
    city: yup.string().optional(),
    state: yup.string().optional(),
    country: yup.string().optional(),
    postalCode: yup.string().optional(),
  }).optional(),
  contactInfo: yup.object({
    phone: yup.string().optional(),
    email: yup.string().email('Valid email is required').optional(),
    website: yup.string().optional(),
  }).optional(),
  caseManagement: yup.object({
    maxCaseLoad: yup.number().min(1, 'Max case load must be at least 1').optional(),
  }).optional(),
  budget: yup.object({
    annual: yup.number().min(0, 'Annual budget must be positive').optional(),
  }).optional(),
  notes: yup.string().optional(),
});

const CreateCourtPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const steps = [
    {
      id: 'basic',
      title: 'Basic Info',
      description: 'Basic court information',
      icon: <Building2 className="h-4 w-4" />
    },
    {
      id: 'address',
      title: 'Address',
      description: 'Location information',
      icon: <MapPin className="h-4 w-4" />
    },
    {
      id: 'contact',
      title: 'Contact Info',
      description: 'Contact details',
      icon: <Phone className="h-4 w-4" />
    },
    {
      id: 'management',
      title: 'Management',
      description: 'Case management settings',
      icon: <Gavel className="h-4 w-4" />
    },
    {
      id: 'review',
      title: 'Review',
      description: 'Confirm details',
      icon: <CheckCircle className="h-4 w-4" />
    }
  ];

  const form = useForm<CourtFormData>({
    resolver: yupResolver(courtSchema),
    defaultValues: {
      name: '',
      code: '',
      description: '',
      type: 'district_court',
      jurisdiction: 'state',
      level: 'trial',
      address: {
        street: '',
        city: '',
        state: '',
        country: 'Somalia',
        postalCode: ''
      },
      contactInfo: {
        phone: '',
        email: '',
        website: ''
      },
      caseManagement: {
        maxCaseLoad: 100
      },
      budget: {
        annual: 0
      },
      notes: ''
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
      const response = await api.createCourt(data);
      
      if (response.success) {
        navigate('/courts');
      } else {
        setError(response.message || 'Failed to create court');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create court');
    } finally {
      setIsLoading(false);
    }
  };

  const courtTypes = [
    { value: 'supreme_court', label: 'Supreme Court' },
    { value: 'appeals_court', label: 'Appeals Court' },
    { value: 'district_court', label: 'District Court' },
    { value: 'regional_court', label: 'Regional Court' },
    { value: 'municipal_court', label: 'Municipal Court' },
    { value: 'specialized_court', label: 'Specialized Court' },
    { value: 'military_court', label: 'Military Court' },
    { value: 'other', label: 'Other' }
  ];

  const jurisdictions = [
    { value: 'federal', label: 'Federal' },
    { value: 'state', label: 'State' },
    { value: 'regional', label: 'Regional' },
    { value: 'municipal', label: 'Municipal' },
    { value: 'specialized', label: 'Specialized' }
  ];

  const levels = [
    { value: 'trial', label: 'Trial' },
    { value: 'appellate', label: 'Appellate' },
    { value: 'supreme', label: 'Supreme' },
    { value: 'administrative', label: 'Administrative' }
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="name" className="text-sm font-semibold text-black">Court Name *</Label>
                <Input
                  id="name"
                  {...form.register('name')}
                  placeholder="Enter court name"
                  className={`h-10 text-black text-sm ${form.formState.errors.name ? 'border-red-500' : ''}`}
                />
                {form.formState.errors.name && (
                  <p className="text-xs text-red-500 text-black">{form.formState.errors.name.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="code" className="text-sm font-semibold text-black">Court Code *</Label>
                <Input
                  id="code"
                  {...form.register('code')}
                  placeholder="Enter court code"
                  className={`h-10 text-black text-sm ${form.formState.errors.code ? 'border-red-500' : ''}`}
                />
                {form.formState.errors.code && (
                  <p className="text-xs text-red-500 text-black">{form.formState.errors.code.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="description" className="text-black">Description</Label>
              <textarea
                id="description"
                {...form.register('description')}
                placeholder="Enter court description"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-20 text-black text-sm"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label htmlFor="type" className="text-sm font-semibold text-black">Court Type *</Label>
                <Select
                  value={form.watch('type')}
                  onValueChange={(value) => form.setValue('type', value)}
                >
                  <SelectTrigger className="h-10 text-black bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 text-sm">
                    <SelectValue placeholder="Select court type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    {courtTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value} className="text-black hover:bg-blue-50 focus:bg-blue-500 focus:text-white">
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="jurisdiction" className="text-sm font-semibold text-black">Jurisdiction *</Label>
                <Select
                  value={form.watch('jurisdiction')}
                  onValueChange={(value) => form.setValue('jurisdiction', value)}
                >
                  <SelectTrigger className="h-10 text-black bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 text-sm">
                    <SelectValue placeholder="Select jurisdiction" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    {jurisdictions.map((jurisdiction) => (
                      <SelectItem key={jurisdiction.value} value={jurisdiction.value} className="text-black hover:bg-blue-50 focus:bg-blue-500 focus:text-white">
                        {jurisdiction.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="level" className="text-sm font-semibold text-black">Level *</Label>
                <Select
                  value={form.watch('level')}
                  onValueChange={(value) => form.setValue('level', value)}
                >
                  <SelectTrigger className="h-10 text-black bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 text-sm">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    {levels.map((level) => (
                      <SelectItem key={level.value} value={level.value} className="text-black hover:bg-blue-50 focus:bg-blue-500 focus:text-white">
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-black text-lg">Address Information</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="street" className="text-black">Street Address</Label>
                  <Input
                    id="street"
                    {...form.register('address.street')}
                    placeholder="Enter street address"
                    className="h-12 text-black"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="city" className="text-black">City</Label>
                  <Input
                    id="city"
                    {...form.register('address.city')}
                    placeholder="Enter city"
                    className="h-12 text-black"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="state" className="text-black">State/Region</Label>
                  <Input
                    id="state"
                    {...form.register('address.state')}
                    placeholder="Enter state/region"
                    className="h-12 text-black"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="country" className="text-black">Country</Label>
                  <Input
                    id="country"
                    {...form.register('address.country')}
                    placeholder="Enter country"
                    className="h-12 text-black"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="postalCode" className="text-black">Postal Code</Label>
                  <Input
                    id="postalCode"
                    {...form.register('address.postalCode')}
                    placeholder="Enter postal code"
                    className="h-12 text-black"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-black text-lg">Contact Information</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="phone" className="text-black">Phone Number</Label>
                  <Input
                    id="phone"
                    {...form.register('contactInfo.phone')}
                    placeholder="Enter phone number"
                    className="h-12 text-black"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="email" className="text-black">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    {...form.register('contactInfo.email')}
                    placeholder="Enter email address"
                    className="h-12 text-black"
                  />
                </div>
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="website" className="text-black">Website</Label>
                <Input
                  id="website"
                  {...form.register('contactInfo.website')}
                  placeholder="Enter website URL"
                  className="h-12 text-black"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-black text-lg">Management Information</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="maxCaseLoad" className="text-black">Maximum Case Load</Label>
                  <Input
                    id="maxCaseLoad"
                    type="number"
                    min="1"
                    {...form.register('caseManagement.maxCaseLoad', { valueAsNumber: true })}
                    placeholder="Enter maximum case load"
                    className="h-12 text-black"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="annualBudget" className="text-black">Annual Budget</Label>
                  <Input
                    id="annualBudget"
                    type="number"
                    min="0"
                    {...form.register('budget.annual', { valueAsNumber: true })}
                    placeholder="Enter annual budget"
                    className="h-12 text-black"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="notes" className="text-black">Additional Notes</Label>
              <textarea
                id="notes"
                {...form.register('notes')}
                placeholder="Enter any additional notes"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-20 text-black text-sm"
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-black mb-2">Review Court Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-gray-50 border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-black">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-black">
                  <p><strong className="text-black">Name:</strong> <span className="text-black">{form.watch('name')}</span></p>
                  <p><strong className="text-black">Code:</strong> <span className="text-black">{form.watch('code')}</span></p>
                  <p><strong className="text-black">Type:</strong> <span className="text-black">{form.watch('type')}</span></p>
                  <p><strong className="text-black">Jurisdiction:</strong> <span className="text-black">{form.watch('jurisdiction')}</span></p>
                  <p><strong className="text-black">Level:</strong> <span className="text-black">{form.watch('level')}</span></p>
                  <p><strong className="text-black">Description:</strong> <span className="text-black">{form.watch('description') || 'N/A'}</span></p>
                </CardContent>
              </Card>
              <Card className="bg-gray-50 border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-black">Address & Contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-black">
                  <p><strong className="text-black">Address:</strong> <span className="text-black">{`${form.watch('address.street') || ''}, ${form.watch('address.city') || ''}, ${form.watch('address.country') || ''}`}</span></p>
                  <p><strong className="text-black">Phone:</strong> <span className="text-black">{form.watch('contactInfo.phone') || 'N/A'}</span></p>
                  <p><strong className="text-black">Email:</strong> <span className="text-black">{form.watch('contactInfo.email') || 'N/A'}</span></p>
                  <p><strong className="text-black">Website:</strong> <span className="text-black">{form.watch('contactInfo.website') || 'N/A'}</span></p>
                </CardContent>
              </Card>
            </div>
            <Card className="bg-gray-50 border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-black">Management & Budget</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-black">
                <p><strong className="text-black">Max Case Load:</strong> <span className="text-black">{form.watch('caseManagement.maxCaseLoad') || 'N/A'}</span></p>
                <p><strong className="text-black">Annual Budget:</strong> <span className="text-black">{form.watch('budget.annual') || 'N/A'}</span></p>
                <p><strong className="text-black">Notes:</strong> <span className="text-black">{form.watch('notes') || 'N/A'}</span></p>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stepper Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl sticky top-4">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3">
                <CardTitle className="flex items-center space-x-2 text-white text-lg">
                  <Gavel className="w-4 h-4 text-white" />
                  <span className="text-white">Setup Progress</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
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
              <div className="text-center py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
                <h1 className="text-2xl font-bold text-white">CREATE NEW COURT</h1>
              </div>
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3">
                <CardTitle className="flex items-center space-x-2 text-white text-lg mb-1">
                  {steps[currentStep].icon}
                  <span className="text-white">{steps[currentStep].title}</span>
                </CardTitle>
                <p className="text-sm text-blue-100">{steps[currentStep].description}</p>
              </CardHeader>
              <CardContent className="p-4">
                {/* Error Display */}
                {error && (
                  <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800 text-black">{error}</p>
                  </div>
                )}

                {/* Step Content */}
                <div className="mb-4 text-black">
                  {renderStepContent()}
                </div>

                {/* Navigation */}
                <div className="flex justify-between pt-4 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={currentStep === 0 ? () => navigate('/courts') : handlePrevious}
                    disabled={isLoading}
                    className="flex items-center space-x-2 px-4 py-2 text-black text-sm"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span className="text-black">{currentStep === 0 ? 'Cancel' : 'Previous'}</span>
                  </Button>

                  <Button
                    type="button"
                    onClick={currentStep === steps.length - 1 ? handleSubmit : handleNext}
                    disabled={isLoading}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 text-white text-sm"
                  >
                    <span className="text-white">{currentStep === steps.length - 1 ? 'Create Court' : 'Next'}</span>
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

export default CreateCourtPage;