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
import { UserCheck, User, MapPin, Shield, CheckCircle, ArrowLeft, ArrowRight, X } from 'lucide-react';
import { OffenderFormData } from '../types';
import api from '../services/api';
import { Avatar, AvatarFallback } from '../components/ui/avatar';

const offenderSchema = yup.object({
  personalInfo: yup.object({
    firstName: yup.string().required('First name is required'),
    lastName: yup.string().required('Last name is required'),
    middleName: yup.string().optional(),
    dateOfBirth: yup.string().required('Date of birth is required'),
    gender: yup.string().oneOf(['male', 'female', 'other']).required('Gender is required'),
    nationality: yup.string().required('Nationality is required'),
    nationalId: yup.string().optional(),
    passportNumber: yup.string().optional(),
    phoneNumber: yup.string().optional(),
    email: yup.string().email('Valid email is required').optional(),
  }).required(),
  physicalDescription: yup.object({
    height: yup.number().optional(),
    weight: yup.number().optional(),
    eyeColor: yup.string().optional(),
    hairColor: yup.string().optional(),
    skinTone: yup.string().optional(),
    distinguishingMarks: yup.string().optional(),
  }).optional(),
  address: yup.object({
    current: yup.object({
      street: yup.string().optional(),
      city: yup.string().optional(),
      state: yup.string().optional(),
      country: yup.string().optional(),
      postalCode: yup.string().optional(),
    }).optional(),
    permanent: yup.object({
      street: yup.string().optional(),
      city: yup.string().optional(),
      state: yup.string().optional(),
      country: yup.string().optional(),
      postalCode: yup.string().optional(),
    }).optional(),
  }).optional(),
  familyInfo: yup.object({
    maritalStatus: yup.string().optional(),
    spouse: yup.object({
      name: yup.string().optional(),
      phone: yup.string().optional(),
      address: yup.string().optional(),
    }).optional(),
    emergencyContact: yup.object({
      name: yup.string().optional(),
      relationship: yup.string().optional(),
      phone: yup.string().optional(),
      address: yup.string().optional(),
    }).optional(),
  }).optional(),
  riskAssessment: yup.object({
    level: yup.string().oneOf(['low', 'medium', 'high', 'critical']).required('Risk level is required'),
    notes: yup.string().optional(),
  }).required(),
  status: yup.object({
    isActive: yup.boolean().default(true),
    isInCustody: yup.boolean().default(false),
    custodyLocation: yup.string().optional(),
  }).required(),
  notes: yup.string().optional(),
});

const CreateOffenderPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  // Photos are uploaded after offender is created (no uploads here)

  const steps = [
    {
      id: 'personal',
      title: 'Personal Info',
      description: 'Basic personal information',
      icon: <User className="h-4 w-4" />
    },
    {
      id: 'physical',
      title: 'Physical Description',
      description: 'Physical characteristics',
      icon: <UserCheck className="h-4 w-4" />
    },
    {
      id: 'address',
      title: 'Address',
      description: 'Location information',
      icon: <MapPin className="h-4 w-4" />
    },
    {
      id: 'risk',
      title: 'Risk Assessment',
      description: 'Risk level and status',
      icon: <Shield className="h-4 w-4" />
    },
    {
      id: 'photos',
      title: 'Photos',
      description: 'Photos are uploaded after creation',
      icon: <User className="h-4 w-4" />
    },
    {
      id: 'review',
      title: 'Review',
      description: 'Confirm details',
      icon: <CheckCircle className="h-4 w-4" />
    }
  ];

  const form = useForm<OffenderFormData>({
    resolver: yupResolver(offenderSchema),
    defaultValues: {
    personalInfo: {
      firstName: '',
      lastName: '',
      middleName: '',
      dateOfBirth: '',
      gender: 'male',
      nationality: 'Somali',
      nationalId: '',
      passportNumber: '',
      phoneNumber: '',
      email: ''
    },
    physicalDescription: {
      height: undefined,
      weight: undefined,
      eyeColor: '',
      hairColor: '',
      skinTone: '',
      distinguishingMarks: ''
    },
    address: {
      current: {
        street: '',
        city: '',
        state: '',
        country: 'Somalia',
        postalCode: ''
      },
      permanent: {
        street: '',
        city: '',
        state: '',
        country: 'Somalia',
        postalCode: ''
      }
    },
    familyInfo: {
      maritalStatus: '',
      spouse: {
        name: '',
        phone: '',
        address: ''
      },
      emergencyContact: {
        name: '',
        relationship: '',
        phone: '',
        address: ''
      }
    },
    riskAssessment: {
      level: 'low',
      notes: ''
    },
    status: {
      isActive: true,
      isInCustody: false,
      custodyLocation: ''
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

  // No photo upload handlers on create


  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const data = form.getValues();
      const response = await api.createOffender(data as any);
      
      if (response.success) {
        navigate('/offenders');
      } else {
        setError(response.message || 'Failed to create offender');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create offender');
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
                <Label htmlFor="firstName" className="text-sm font-semibold text-black">First Name *</Label>
                <Input
                  id="firstName"
                  {...form.register('personalInfo.firstName')}
                  placeholder="Enter first name"
                  className={`h-12 text-black ${form.formState.errors.personalInfo?.firstName ? 'border-red-500' : ''}`}
                />
                {form.formState.errors.personalInfo?.firstName && (
                  <p className="text-sm text-red-500 text-black">{form.formState.errors.personalInfo.firstName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-semibold text-black">Last Name *</Label>
                <Input
                  id="lastName"
                  {...form.register('personalInfo.lastName')}
                  placeholder="Enter last name"
                  className={`h-12 text-black ${form.formState.errors.personalInfo?.lastName ? 'border-red-500' : ''}`}
                />
                {form.formState.errors.personalInfo?.lastName && (
                  <p className="text-sm text-red-500 text-black">{form.formState.errors.personalInfo.lastName.message}</p>
                )}
              </div>
            </div>


            <div className="space-y-2">
              <Label htmlFor="middleName" className="text-black">Middle Name</Label>
              <Input
                id="middleName"
                {...form.register('personalInfo.middleName')}
                placeholder="Enter middle name"
                className="h-12 text-black"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth" className="text-sm font-semibold text-black">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  {...form.register('personalInfo.dateOfBirth')}
                  className={`h-12 text-black ${form.formState.errors.personalInfo?.dateOfBirth ? 'border-red-500' : ''}`}
                />
                {form.formState.errors.personalInfo?.dateOfBirth && (
                  <p className="text-sm text-red-500 text-black">{form.formState.errors.personalInfo.dateOfBirth.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender" className="text-sm font-semibold text-black">Gender *</Label>
                <Select
                  value={form.watch('personalInfo.gender')}
                  onValueChange={(value) => form.setValue('personalInfo.gender', value as any)}
                >
                  <SelectTrigger className="h-12 text-black bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    <SelectItem value="male" className="text-black hover:bg-blue-50 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">Male</SelectItem>
                    <SelectItem value="female" className="text-black hover:bg-blue-50 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">Female</SelectItem>
                    <SelectItem value="other" className="text-black hover:bg-blue-50 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="nationality" className="text-sm font-semibold text-black">Nationality *</Label>
                <Input
                  id="nationality"
                  {...form.register('personalInfo.nationality')}
                  placeholder="Enter nationality"
                  className={`h-12 text-black ${form.formState.errors.personalInfo?.nationality ? 'border-red-500' : ''}`}
                />
                {form.formState.errors.personalInfo?.nationality && (
                  <p className="text-sm text-red-500 text-black">{form.formState.errors.personalInfo.nationality.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="nationalId" className="text-black">National ID</Label>
                <Input
                  id="nationalId"
                  {...form.register('personalInfo.nationalId')}
                  placeholder="Enter national ID"
                  className="h-12 text-black"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-black">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  {...form.register('personalInfo.phoneNumber')}
                  placeholder="Enter phone number"
                  className="h-12 text-black"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-black">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...form.register('personalInfo.email')}
                  placeholder="Enter email address"
                  className="h-12 text-black"
                />
              </div>
            </div>
            </div>
        );

      case 1:
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="height" className="text-black">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  {...form.register('physicalDescription.height', { valueAsNumber: true })}
                  placeholder="Enter height in cm"
                  className="h-12 text-black"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight" className="text-black">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  {...form.register('physicalDescription.weight', { valueAsNumber: true })}
                  placeholder="Enter weight in kg"
                  className="h-12 text-black"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="eyeColor" className="text-black">Eye Color</Label>
                <Input
                  id="eyeColor"
                  {...form.register('physicalDescription.eyeColor')}
                  placeholder="Enter eye color"
                  className="h-12 text-black"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hairColor" className="text-black">Hair Color</Label>
                <Input
                  id="hairColor"
                  {...form.register('physicalDescription.hairColor')}
                  placeholder="Enter hair color"
                  className="h-12 text-black"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="skinTone" className="text-black">Skin Tone</Label>
              <Input
                id="skinTone"
                {...form.register('physicalDescription.skinTone')}
                placeholder="Enter skin tone"
                className="h-12 text-black"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="distinguishingMarks" className="text-black">Distinguishing Marks</Label>
              <Input
                id="distinguishingMarks"
                {...form.register('physicalDescription.distinguishingMarks')}
                placeholder="Enter distinguishing marks"
                className="h-12 text-black"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            <div className="space-y-6">
              <h4 className="font-semibold text-black text-lg">Current Address</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="currentStreet" className="text-black">Street</Label>
                  <Input
                    id="currentStreet"
                    {...form.register('address.current.street')}
                    placeholder="Street address"
                    className="h-12 text-black"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentCity" className="text-black">City</Label>
                  <Input
                    id="currentCity"
                    {...form.register('address.current.city')}
                    placeholder="City"
                    className="h-12 text-black"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentState" className="text-black">State</Label>
                  <Input
                    id="currentState"
                    {...form.register('address.current.state')}
                    placeholder="State/Province"
                    className="h-12 text-black"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentCountry" className="text-black">Country</Label>
                  <Input
                    id="currentCountry"
                    {...form.register('address.current.country')}
                    placeholder="Country"
                    className="h-12 text-black"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentPostalCode" className="text-black">Postal Code</Label>
                  <Input
                    id="currentPostalCode"
                    {...form.register('address.current.postalCode')}
                    placeholder="Postal code"
                    className="h-12 text-black"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="font-semibold text-black text-lg">Permanent Address</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="permanentStreet" className="text-black">Street</Label>
                  <Input
                    id="permanentStreet"
                    {...form.register('address.permanent.street')}
                    placeholder="Street address"
                    className="h-12 text-black"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="permanentCity" className="text-black">City</Label>
                  <Input
                    id="permanentCity"
                    {...form.register('address.permanent.city')}
                    placeholder="City"
                    className="h-12 text-black"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="permanentState" className="text-black">State</Label>
                  <Input
                    id="permanentState"
                    {...form.register('address.permanent.state')}
                    placeholder="State/Province"
                    className="h-12 text-black"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="permanentCountry" className="text-black">Country</Label>
                  <Input
                    id="permanentCountry"
                    {...form.register('address.permanent.country')}
                    placeholder="Country"
                    className="h-12 text-black"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="permanentPostalCode" className="text-black">Postal Code</Label>
                  <Input
                    id="permanentPostalCode"
                    {...form.register('address.permanent.postalCode')}
                    placeholder="Postal code"
                    className="h-12 text-black"
                  />
                </div>
              </div>
            </div>
            </div>
        );

      case 3:
        return (
          <div className="space-y-8">
            <div className="space-y-6">
              <h4 className="font-semibold text-black text-lg">Risk Assessment</h4>
              <div className="space-y-2">
                <Label htmlFor="riskLevel" className="text-sm font-semibold text-black">Risk Level *</Label>
                <Select
                  value={form.watch('riskAssessment.level')}
                  onValueChange={(value) => form.setValue('riskAssessment.level', value as any)}
                >
                  <SelectTrigger className="h-12 text-black bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500">
                    <SelectValue placeholder="Select risk level" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    <SelectItem value="low" className="text-black hover:bg-blue-50 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">Low</SelectItem>
                    <SelectItem value="medium" className="text-black hover:bg-blue-50 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">Medium</SelectItem>
                    <SelectItem value="high" className="text-black hover:bg-blue-50 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">High</SelectItem>
                    <SelectItem value="critical" className="text-black hover:bg-blue-50 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="riskNotes" className="text-black">Risk Assessment Notes</Label>
                <textarea
                  id="riskNotes"
                  {...form.register('riskAssessment.notes')}
                  placeholder="Enter risk assessment notes"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 text-black"
                />
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="font-semibold text-black text-lg">Status</h4>
              <div className="space-y-2">
                <Label htmlFor="custodyLocation" className="text-black">Custody Location</Label>
                <Input
                  id="custodyLocation"
                  {...form.register('status.custodyLocation')}
                  placeholder="Enter custody location"
                  className="h-12 text-black"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-black">Additional Notes</Label>
              <textarea
                id="notes"
                {...form.register('notes')}
                placeholder="Enter any additional notes"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 text-black"
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-black mb-2">Photos</h3>
              <p className="text-gray-600">Add photos of the offender for identification purposes</p>
            </div>

            <Card className="bg-white border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-black">Profile Photo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-24 w-24 rounded-lg">
                    <AvatarFallback className="bg-blue-600 text-white text-2xl rounded-lg">
                      {getInitials(form.watch('personalInfo.firstName') || '', form.watch('personalInfo.lastName') || '')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">Upload a clear photo of the offender's face</p>
                    <p className="text-xs text-gray-500">Max 5MB</p>
                  </div>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                  Profile photos and additional photos can be uploaded after the offender is created from the offender profile page.
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-black mb-4">Review Offender Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gray-50 border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-black">Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-black">
                  <p><strong className="text-black">Name:</strong> <span className="text-black">{form.watch('personalInfo.firstName')} {form.watch('personalInfo.middleName')} {form.watch('personalInfo.lastName')}</span></p>
                  <p><strong className="text-black">Date of Birth:</strong> <span className="text-black">{form.watch('personalInfo.dateOfBirth')}</span></p>
                  <p><strong className="text-black">Gender:</strong> <span className="text-black">{form.watch('personalInfo.gender')}</span></p>
                  <p><strong className="text-black">Nationality:</strong> <span className="text-black">{form.watch('personalInfo.nationality')}</span></p>
                  <p><strong className="text-black">National ID:</strong> <span className="text-black">{form.watch('personalInfo.nationalId') || 'N/A'}</span></p>
                  <p><strong className="text-black">Phone:</strong> <span className="text-black">{form.watch('personalInfo.phoneNumber') || 'N/A'}</span></p>
                  <p><strong className="text-black">Email:</strong> <span className="text-black">{form.watch('personalInfo.email') || 'N/A'}</span></p>
                </CardContent>
              </Card>
              <Card className="bg-gray-50 border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-black">Physical Description</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-black">
                  <p><strong className="text-black">Height:</strong> <span className="text-black">{form.watch('physicalDescription.height') || 'N/A'} cm</span></p>
                  <p><strong className="text-black">Weight:</strong> <span className="text-black">{form.watch('physicalDescription.weight') || 'N/A'} kg</span></p>
                  <p><strong className="text-black">Eye Color:</strong> <span className="text-black">{form.watch('physicalDescription.eyeColor') || 'N/A'}</span></p>
                  <p><strong className="text-black">Hair Color:</strong> <span className="text-black">{form.watch('physicalDescription.hairColor') || 'N/A'}</span></p>
                  <p><strong className="text-black">Skin Tone:</strong> <span className="text-black">{form.watch('physicalDescription.skinTone') || 'N/A'}</span></p>
                  <p><strong className="text-black">Distinguishing Marks:</strong> <span className="text-black">{form.watch('physicalDescription.distinguishingMarks') || 'N/A'}</span></p>
          </CardContent>
        </Card>
            </div>
            <Card className="bg-gray-50 border-gray-200 shadow-sm">
          <CardHeader>
                <CardTitle className="text-lg font-semibold text-black">Risk Assessment & Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-black">
                <p><strong className="text-black">Risk Level:</strong> <span className="text-black">{form.watch('riskAssessment.level')}</span></p>
                <p><strong className="text-black">Custody Location:</strong> <span className="text-black">{form.watch('status.custodyLocation') || 'N/A'}</span></p>
                <p><strong className="text-black">Risk Notes:</strong> <span className="text-black">{form.watch('riskAssessment.notes') || 'N/A'}</span></p>
                <p><strong className="text-black">Additional Notes:</strong> <span className="text-black">{form.watch('notes') || 'N/A'}</span></p>
              </CardContent>
            </Card>
            
            {/* Photos Section (info-only) */}
            <Card className="bg-gray-50 border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-black">Photos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 text-sm">
                  Photos will be added after the offender is created. You can upload a profile photo and manage the album on the offender profile page.
                </p>
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
                  <UserCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold">Create Offender</h1>
                  <p className="text-blue-100 text-lg">Add a new offender to the registry system</p>
                </div>
              </div>
              <Button
                variant="ghost"
                onClick={() => navigate('/offenders')}
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
                <Shield className="w-4 h-4" />
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
                  <UserCheck className="w-5 h-5 text-blue-600" />
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
                    onClick={currentStep === 0 ? () => navigate('/offenders') : handlePrevious}
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
                    <span className="text-white">{currentStep === steps.length - 1 ? 'Create Offender' : 'Next'}</span>
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

export default CreateOffenderPage;