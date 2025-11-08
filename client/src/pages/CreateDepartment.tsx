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
import { Building2, MapPin, Phone, CheckCircle, ArrowLeft, ArrowRight, Users, Settings } from 'lucide-react';
import api from '../services/api';

type DepartmentFormData = {
  name: string;
  code: string;
  description?: string;
  type: string;
  parentDepartment?: string;
  location?: {
    address?: {
      street?: string;
      city?: string;
      state?: string;
      country?: string;
      postalCode?: string;
    };
    phone?: string;
    email?: string;
  };
  contactInfo?: {
    phone?: string;
    email?: string;
    fax?: string;
    website?: string;
    emergencyContact?: string;
  };
  status?: {
    isActive?: boolean;
    establishedDate?: string;
  };
  notes?: string;
};

const departmentSchema = yup.object({
  name: yup.string().required('Department name is required'),
  code: yup.string().required('Department code is required'),
  description: yup.string().optional(),
  type: yup.string().required('Department type is required'),
  parentDepartment: yup.string().optional(),
  location: yup.object({
    address: yup.object({
      street: yup.string().optional(),
      city: yup.string().optional(),
      state: yup.string().optional(),
      country: yup.string().optional(),
      postalCode: yup.string().optional(),
    }).optional(),
    phone: yup.string().optional(),
    email: yup.string().email('Valid email is required').optional(),
  }).optional(),
  contactInfo: yup.object({
    phone: yup.string().optional(),
    email: yup.string().email('Valid email is required').optional(),
    fax: yup.string().optional(),
    website: yup.string().optional(),
    emergencyContact: yup.string().optional(),
  }).optional(),
  status: yup.object({
    isActive: yup.boolean().optional(),
    establishedDate: yup.string().optional(),
  }).optional(),
  notes: yup.string().optional(),
});

const CreateDepartmentPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [departments, setDepartments] = useState<any[]>([]);

  const steps = [
    {
      id: 'basic',
      title: 'Basic Info',
      description: 'Basic department information',
      icon: <Building2 className="h-4 w-4" />
    },
    {
      id: 'location',
      title: 'Location',
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
      id: 'settings',
      title: 'Settings',
      description: 'Department settings',
      icon: <Settings className="h-4 w-4" />
    },
    {
      id: 'review',
      title: 'Review',
      description: 'Confirm details',
      icon: <CheckCircle className="h-4 w-4" />
    }
  ];

  const form = useForm<DepartmentFormData>({
    resolver: yupResolver(departmentSchema),
    defaultValues: {
      name: '',
      code: '',
      description: '',
      type: 'investigation',
      parentDepartment: '',
      location: {
        address: {
          street: '',
          city: '',
          state: '',
          country: 'Somalia',
          postalCode: ''
        },
        phone: '',
        email: ''
      },
      contactInfo: {
        phone: '',
        email: '',
        fax: '',
        website: '',
        emergencyContact: ''
      },
      status: {
        isActive: true,
        establishedDate: ''
      },
      notes: ''
    },
  });

  React.useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await api.getDepartments({ limit: 1000 });
      if (response.success) {
        setDepartments(response.data.departments || []);
      }
    } catch (err) {
      console.error('Failed to fetch departments:', err);
    }
  };

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
      const response = await api.createDepartment(data);
      
      if (response.success) {
        navigate('/departments');
      } else {
        setError(response.message || 'Failed to create department');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create department');
    } finally {
      setIsLoading(false);
    }
  };

  const departmentTypes = [
    { value: 'investigation', label: 'Investigation' },
    { value: 'forensics', label: 'Forensics' },
    { value: 'intelligence', label: 'Intelligence' },
    { value: 'operations', label: 'Operations' },
    { value: 'administration', label: 'Administration' },
    { value: 'training', label: 'Training' },
    { value: 'support', label: 'Support' },
    { value: 'other', label: 'Other' }
  ];

  const formatDateForInput = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="name" className="text-sm font-semibold text-black">Department Name *</Label>
                <Input
                  id="name"
                  {...form.register('name')}
                  placeholder="Enter department name"
                  className={`h-10 text-black text-sm ${form.formState.errors.name ? 'border-red-500' : ''}`}
                />
                {form.formState.errors.name && (
                  <p className="text-xs text-red-500 text-black">{form.formState.errors.name.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="code" className="text-sm font-semibold text-black">Department Code *</Label>
                <Input
                  id="code"
                  {...form.register('code')}
                  placeholder="Enter department code"
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
                placeholder="Enter department description"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-20 text-black text-sm"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="type" className="text-sm font-semibold text-black">Department Type *</Label>
                <Select
                  value={form.watch('type')}
                  onValueChange={(value) => form.setValue('type', value)}
                >
                  <SelectTrigger className="h-10 text-black bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 text-sm">
                    <SelectValue placeholder="Select department type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    {departmentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value} className="text-black hover:bg-blue-50 focus:bg-blue-500 focus:text-white">
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="parentDepartment" className="text-sm font-semibold text-black">Parent Department</Label>
                <Select
                  value={form.watch('parentDepartment') || 'none'}
                  onValueChange={(value) => form.setValue('parentDepartment', value === 'none' ? undefined : value)}
                >
                  <SelectTrigger className="h-10 text-black bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 text-sm">
                    <SelectValue placeholder="Select parent department (optional)" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    <SelectItem value="none" className="text-black hover:bg-blue-50 focus:bg-blue-500 focus:text-white">
                      None
                    </SelectItem>
                    {departments
                      .filter(dept => {
                        const id = String(dept._id || '').trim();
                        return id !== '';
                      })
                      .map((dept) => {
                        const id = String(dept._id).trim();
                        return (
                          <SelectItem key={id} value={id} className="text-black hover:bg-blue-50 focus:bg-blue-500 focus:text-white">
                            {dept.name} ({dept.code})
                          </SelectItem>
                        );
                      })}
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
              <h4 className="font-semibold text-black text-lg">Location Information</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="street" className="text-black">Street Address</Label>
                  <Input
                    id="street"
                    {...form.register('location.address.street')}
                    placeholder="Enter street address"
                    className="h-10 text-black text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="city" className="text-black">City</Label>
                  <Input
                    id="city"
                    {...form.register('location.address.city')}
                    placeholder="Enter city"
                    className="h-10 text-black text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="state" className="text-black">State/Region</Label>
                  <Input
                    id="state"
                    {...form.register('location.address.state')}
                    placeholder="Enter state/region"
                    className="h-10 text-black text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="country" className="text-black">Country</Label>
                  <Input
                    id="country"
                    {...form.register('location.address.country')}
                    placeholder="Enter country"
                    className="h-10 text-black text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="postalCode" className="text-black">Postal Code</Label>
                  <Input
                    id="postalCode"
                    {...form.register('location.address.postalCode')}
                    placeholder="Enter postal code"
                    className="h-10 text-black text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="locationPhone" className="text-black">Location Phone</Label>
                  <Input
                    id="locationPhone"
                    {...form.register('location.phone')}
                    placeholder="Enter location phone"
                    className="h-10 text-black text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="locationEmail" className="text-black">Location Email</Label>
                  <Input
                    id="locationEmail"
                    type="email"
                    {...form.register('location.email')}
                    placeholder="Enter location email"
                    className="h-10 text-black text-sm"
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
                    className="h-10 text-black text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="email" className="text-black">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    {...form.register('contactInfo.email')}
                    placeholder="Enter email address"
                    className="h-10 text-black text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="fax" className="text-black">Fax Number</Label>
                  <Input
                    id="fax"
                    {...form.register('contactInfo.fax')}
                    placeholder="Enter fax number"
                    className="h-10 text-black text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="website" className="text-black">Website</Label>
                  <Input
                    id="website"
                    {...form.register('contactInfo.website')}
                    placeholder="Enter website URL"
                    className="h-10 text-black text-sm"
                  />
                </div>
                <div className="space-y-1 lg:col-span-2">
                  <Label htmlFor="emergencyContact" className="text-black">Emergency Contact</Label>
                  <Input
                    id="emergencyContact"
                    {...form.register('contactInfo.emergencyContact')}
                    placeholder="Enter emergency contact"
                    className="h-10 text-black text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-black text-lg">Department Settings</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="establishedDate" className="text-black">Established Date</Label>
                  <Input
                    id="establishedDate"
                    type="date"
                    {...form.register('status.establishedDate')}
                    className="h-10 text-black text-sm"
                  />
                </div>
                <div className="space-y-1 flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={form.watch('status.isActive') ?? true}
                    onChange={(e) => form.setValue('status.isActive', e.target.checked)}
                    className="mr-2"
                  />
                  <Label htmlFor="isActive" className="text-black cursor-pointer">Active Department</Label>
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
            <h3 className="text-lg font-bold text-black mb-2">Review Department Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-gray-50 border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-black">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-black">
                  <p><strong className="text-black">Name:</strong> <span className="text-black">{form.watch('name')}</span></p>
                  <p><strong className="text-black">Code:</strong> <span className="text-black">{form.watch('code')}</span></p>
                  <p><strong className="text-black">Type:</strong> <span className="text-black">{form.watch('type')}</span></p>
                  <p><strong className="text-black">Parent:</strong> <span className="text-black">{form.watch('parentDepartment') ? departments.find(d => d._id === form.watch('parentDepartment'))?.name || 'N/A' : 'None'}</span></p>
                  <p><strong className="text-black">Description:</strong> <span className="text-black">{form.watch('description') || 'N/A'}</span></p>
                </CardContent>
              </Card>
              <Card className="bg-gray-50 border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-black">Location & Contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-black">
                  <p><strong className="text-black">Address:</strong> <span className="text-black">{`${form.watch('location.address.street') || ''}, ${form.watch('location.address.city') || ''}, ${form.watch('location.address.country') || ''}`}</span></p>
                  <p><strong className="text-black">Phone:</strong> <span className="text-black">{form.watch('contactInfo.phone') || 'N/A'}</span></p>
                  <p><strong className="text-black">Email:</strong> <span className="text-black">{form.watch('contactInfo.email') || 'N/A'}</span></p>
                  <p><strong className="text-black">Website:</strong> <span className="text-black">{form.watch('contactInfo.website') || 'N/A'}</span></p>
                </CardContent>
              </Card>
            </div>
            <Card className="bg-gray-50 border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-black">Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-black">
                <p><strong className="text-black">Status:</strong> <span className="text-black">{form.watch('status.isActive') ? 'Active' : 'Inactive'}</span></p>
                <p><strong className="text-black">Established:</strong> <span className="text-black">{form.watch('status.establishedDate') || 'N/A'}</span></p>
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
                  <Building2 className="w-4 h-4 text-white" />
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
                <h1 className="text-2xl font-bold text-white">CREATE NEW DEPARTMENT</h1>
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
                    onClick={currentStep === 0 ? () => navigate('/departments') : handlePrevious}
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
                    <span className="text-white">{currentStep === steps.length - 1 ? 'Create Department' : 'Next'}</span>
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

export default CreateDepartmentPage;

