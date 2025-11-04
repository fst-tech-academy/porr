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
import { Heart, User, MapPin, Shield, CheckCircle, ArrowLeft, ArrowRight, X } from 'lucide-react';
import { VictimFormData } from '../types';
import api from '../services/api';

const victimSchema = yup.object({
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
  status: yup.object({
    isActive: yup.boolean().default(true),
    isDeceased: yup.boolean().default(false),
    dateOfDeath: yup.string().optional(),
    causeOfDeath: yup.string().optional(),
    isMinor: yup.boolean().default(false),
    guardianInfo: yup.object({
      name: yup.string().optional(),
      relationship: yup.string().optional(),
      contactInfo: yup.object({
        phone: yup.string().optional(),
        email: yup.string().optional(),
      }).optional(),
    }).optional(),
  }).required(),
  emergencyContact: yup.object({
    name: yup.string().optional(),
    relationship: yup.string().optional(),
    phone: yup.string().optional(),
    email: yup.string().optional(),
  }).optional(),
  caseInfo: yup.object({
    caseNumbers: yup.array().of(yup.string()).optional(),
    assignedOfficer: yup.string().optional(),
    assignedProsecutor: yup.string().optional(),
    assignedSocialWorker: yup.string().optional(),
  }).required(),
  notes: yup.string().optional(),
});

const CreateVictimPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

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
      icon: <Heart className="h-4 w-4" />
    },
    {
      id: 'address',
      title: 'Address',
      description: 'Current and permanent address',
      icon: <MapPin className="h-4 w-4" />
    },
    {
      id: 'status',
      title: 'Status & Contact',
      description: 'Status and emergency contact',
      icon: <Shield className="h-4 w-4" />
    },
    {
      id: 'review',
      title: 'Review',
      description: 'Confirm details',
      icon: <CheckCircle className="h-4 w-4" />
    }
  ];

  const form = useForm<VictimFormData>({
    resolver: yupResolver(victimSchema),
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
        email: '',
      },
      physicalDescription: {
        height: 0,
        weight: 0,
        eyeColor: '',
        hairColor: '',
        skinTone: '',
        distinguishingMarks: '',
      },
      address: {
        current: {
          street: '',
          city: '',
          state: '',
          country: 'Somalia',
          postalCode: '',
        },
        permanent: {
          street: '',
          city: '',
          state: '',
          country: 'Somalia',
          postalCode: '',
        },
      },
      status: {
        isActive: true,
        isDeceased: false,
        dateOfDeath: '',
        causeOfDeath: '',
        isMinor: false,
        guardianInfo: {
          name: '',
          relationship: '',
          contactInfo: {
            phone: '',
            email: '',
          },
        },
      },
      emergencyContact: {
        name: '',
        relationship: '',
        phone: '',
        email: '',
      },
      caseInfo: {
        caseNumbers: [],
        assignedOfficer: '',
        assignedProsecutor: '',
        assignedSocialWorker: '',
      },
      notes: '',
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
      const response = await api.createVictim(data);
      
      if (response.success) {
        navigate('/victims');
      } else {
        setError(response.message || 'Failed to create victim');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create victim');
    } finally {
      setIsLoading(false);
    }
  };

  const genders = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' }
  ];

  const relationships = [
    { value: 'parent', label: 'Parent' },
    { value: 'sibling', label: 'Sibling' },
    { value: 'spouse', label: 'Spouse' },
    { value: 'child', label: 'Child' },
    { value: 'friend', label: 'Friend' },
    { value: 'neighbor', label: 'Neighbor' },
    { value: 'other', label: 'Other' }
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label htmlFor="firstName" className="text-sm font-semibold text-black">First Name *</Label>
                <Input
                  id="firstName"
                  {...form.register('personalInfo.firstName')}
                  placeholder="Enter first name"
                  className={`h-10 text-black text-sm ${form.formState.errors.personalInfo?.firstName ? 'border-red-500' : ''}`}
                />
                {form.formState.errors.personalInfo?.firstName && (
                  <p className="text-xs text-red-500 text-black">{form.formState.errors.personalInfo.firstName.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="middleName" className="text-sm font-semibold text-black">Middle Name</Label>
                <Input
                  id="middleName"
                  {...form.register('personalInfo.middleName')}
                  placeholder="Enter middle name"
                  className="h-12 text-black"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="lastName" className="text-sm font-semibold text-black">Last Name *</Label>
                <Input
                  id="lastName"
                  {...form.register('personalInfo.lastName')}
                  placeholder="Enter last name"
                  className={`h-10 text-black text-sm ${form.formState.errors.personalInfo?.lastName ? 'border-red-500' : ''}`}
                />
                {form.formState.errors.personalInfo?.lastName && (
                  <p className="text-xs text-red-500 text-black">{form.formState.errors.personalInfo.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="dateOfBirth" className="text-sm font-semibold text-black">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  {...form.register('personalInfo.dateOfBirth')}
                  className={`h-10 text-black text-sm ${form.formState.errors.personalInfo?.dateOfBirth ? 'border-red-500' : ''}`}
                />
                {form.formState.errors.personalInfo?.dateOfBirth && (
                  <p className="text-xs text-red-500 text-black">{form.formState.errors.personalInfo.dateOfBirth.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="gender" className="text-sm font-semibold text-black">Gender *</Label>
                <Select
                  value={form.watch('personalInfo.gender')}
                  onValueChange={(value) => form.setValue('personalInfo.gender', value as 'male' | 'female' | 'other')}
                >
                  <SelectTrigger className="h-10 text-black bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 text-sm">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    {genders.map((gender) => (
                      <SelectItem key={gender.value} value={gender.value} className="text-black hover:bg-blue-50 focus:bg-blue-500 focus:text-white">
                        {gender.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="nationality" className="text-sm font-semibold text-black">Nationality *</Label>
                <Input
                  id="nationality"
                  {...form.register('personalInfo.nationality')}
                  placeholder="Enter nationality"
                  className={`h-10 text-black text-sm ${form.formState.errors.personalInfo?.nationality ? 'border-red-500' : ''}`}
                />
                {form.formState.errors.personalInfo?.nationality && (
                  <p className="text-xs text-red-500 text-black">{form.formState.errors.personalInfo.nationality.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="nationalId" className="text-sm font-semibold text-black">National ID</Label>
                <Input
                  id="nationalId"
                  {...form.register('personalInfo.nationalId')}
                  placeholder="Enter national ID"
                  className="h-12 text-black"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="phoneNumber" className="text-sm font-semibold text-black">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  {...form.register('personalInfo.phoneNumber')}
                  placeholder="Enter phone number"
                  className="h-12 text-black"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="email" className="text-sm font-semibold text-black">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...form.register('personalInfo.email')}
                  placeholder="Enter email address"
                  className="h-12 text-black"
                />
                {form.formState.errors.personalInfo?.email && (
                  <p className="text-xs text-red-500 text-black">{form.formState.errors.personalInfo.email.message}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="height" className="text-sm font-semibold text-black">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  {...form.register('physicalDescription.height', { valueAsNumber: true })}
                  placeholder="Enter height in cm"
                  className="h-12 text-black"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="weight" className="text-sm font-semibold text-black">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  {...form.register('physicalDescription.weight', { valueAsNumber: true })}
                  placeholder="Enter weight in kg"
                  className="h-12 text-black"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="eyeColor" className="text-sm font-semibold text-black">Eye Color</Label>
                <Input
                  id="eyeColor"
                  {...form.register('physicalDescription.eyeColor')}
                  placeholder="Enter eye color"
                  className="h-12 text-black"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="hairColor" className="text-sm font-semibold text-black">Hair Color</Label>
                <Input
                  id="hairColor"
                  {...form.register('physicalDescription.hairColor')}
                  placeholder="Enter hair color"
                  className="h-12 text-black"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="skinTone" className="text-sm font-semibold text-black">Skin Tone</Label>
              <Input
                id="skinTone"
                {...form.register('physicalDescription.skinTone')}
                placeholder="Enter skin tone"
                className="h-12 text-black"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="distinguishingMarks" className="text-sm font-semibold text-black">Distinguishing Marks</Label>
              <textarea
                id="distinguishingMarks"
                {...form.register('physicalDescription.distinguishingMarks')}
                placeholder="Enter any distinguishing marks or features"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-20 text-black text-sm"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-black text-lg">Current Address</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="currentStreet" className="text-black">Street</Label>
                  <Input
                    id="currentStreet"
                    {...form.register('address.current.street')}
                    placeholder="Enter street address"
                    className="h-12 text-black"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="currentCity" className="text-black">City</Label>
                  <Input
                    id="currentCity"
                    {...form.register('address.current.city')}
                    placeholder="Enter city"
                    className="h-12 text-black"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="currentState" className="text-black">State</Label>
                  <Input
                    id="currentState"
                    {...form.register('address.current.state')}
                    placeholder="Enter state"
                    className="h-12 text-black"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="currentCountry" className="text-black">Country</Label>
                  <Input
                    id="currentCountry"
                    {...form.register('address.current.country')}
                    placeholder="Enter country"
                    className="h-12 text-black"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="currentPostalCode" className="text-black">Postal Code</Label>
                  <Input
                    id="currentPostalCode"
                    {...form.register('address.current.postalCode')}
                    placeholder="Enter postal code"
                    className="h-12 text-black"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-black text-lg">Permanent Address</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="permanentStreet" className="text-black">Street</Label>
                  <Input
                    id="permanentStreet"
                    {...form.register('address.permanent.street')}
                    placeholder="Enter street address"
                    className="h-12 text-black"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="permanentCity" className="text-black">City</Label>
                  <Input
                    id="permanentCity"
                    {...form.register('address.permanent.city')}
                    placeholder="Enter city"
                    className="h-12 text-black"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="permanentState" className="text-black">State</Label>
                  <Input
                    id="permanentState"
                    {...form.register('address.permanent.state')}
                    placeholder="Enter state"
                    className="h-12 text-black"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="permanentCountry" className="text-black">Country</Label>
                  <Input
                    id="permanentCountry"
                    {...form.register('address.permanent.country')}
                    placeholder="Enter country"
                    className="h-12 text-black"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="permanentPostalCode" className="text-black">Postal Code</Label>
                  <Input
                    id="permanentPostalCode"
                    {...form.register('address.permanent.postalCode')}
                    placeholder="Enter postal code"
                    className="h-12 text-black"
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
              <h4 className="font-semibold text-black text-lg">Status Information</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-black">Is Minor?</Label>
                  <Select
                    value={form.watch('status.isMinor') ? 'yes' : 'no'}
                    onValueChange={(value) => form.setValue('status.isMinor', value === 'yes')}
                  >
                    <SelectTrigger className="h-10 text-black bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 text-sm">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      <SelectItem value="no" className="text-black hover:bg-blue-50 focus:bg-blue-500 focus:text-white">No</SelectItem>
                      <SelectItem value="yes" className="text-black hover:bg-blue-50 focus:bg-blue-500 focus:text-white">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-1">
                  <Label className="text-black">Is Deceased?</Label>
                  <Select
                    value={form.watch('status.isDeceased') ? 'yes' : 'no'}
                    onValueChange={(value) => form.setValue('status.isDeceased', value === 'yes')}
                  >
                    <SelectTrigger className="h-10 text-black bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 text-sm">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      <SelectItem value="no" className="text-black hover:bg-blue-50 focus:bg-blue-500 focus:text-white">No</SelectItem>
                      <SelectItem value="yes" className="text-black hover:bg-blue-50 focus:bg-blue-500 focus:text-white">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {form.watch('status.isDeceased') && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="dateOfDeath" className="text-black">Date of Death</Label>
                    <Input
                      id="dateOfDeath"
                      type="date"
                      {...form.register('status.dateOfDeath')}
                      className="h-12 text-black"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="causeOfDeath" className="text-black">Cause of Death</Label>
                    <Input
                      id="causeOfDeath"
                      {...form.register('status.causeOfDeath')}
                      placeholder="Enter cause of death"
                      className="h-12 text-black"
                    />
                  </div>
                </div>
              )}

              {form.watch('status.isMinor') && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-black text-lg">Guardian Information</h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="guardianName" className="text-black">Guardian Name</Label>
                      <Input
                        id="guardianName"
                        {...form.register('status.guardianInfo.name')}
                        placeholder="Enter guardian name"
                        className="h-12 text-black"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="guardianRelationship" className="text-black">Relationship</Label>
                      <Select
                        value={form.watch('status.guardianInfo.relationship') || ''}
                        onValueChange={(value) => form.setValue('status.guardianInfo.relationship', value)}
                      >
                        <SelectTrigger className="h-10 text-black bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 text-sm">
                          <SelectValue placeholder="Select relationship" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-200">
                          {relationships.map((rel) => (
                            <SelectItem key={rel.value} value={rel.value} className="text-black hover:bg-blue-50 focus:bg-blue-500 focus:text-white">
                              {rel.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="guardianPhone" className="text-black">Guardian Phone</Label>
                      <Input
                        id="guardianPhone"
                        {...form.register('status.guardianInfo.contactInfo.phone')}
                        placeholder="Enter guardian phone"
                        className="h-12 text-black"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="guardianEmail" className="text-black">Guardian Email</Label>
                      <Input
                        id="guardianEmail"
                        type="email"
                        {...form.register('status.guardianInfo.contactInfo.email')}
                        placeholder="Enter guardian email"
                        className="h-12 text-black"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-black text-lg">Emergency Contact</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="emergencyName" className="text-black">Contact Name</Label>
                  <Input
                    id="emergencyName"
                    {...form.register('emergencyContact.name')}
                    placeholder="Enter emergency contact name"
                    className="h-12 text-black"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="emergencyRelationship" className="text-black">Relationship</Label>
                  <Select
                    value={form.watch('emergencyContact.relationship') || ''}
                    onValueChange={(value) => form.setValue('emergencyContact.relationship', value)}
                  >
                    <SelectTrigger className="h-10 text-black bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 text-sm">
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      {relationships.map((rel) => (
                        <SelectItem key={rel.value} value={rel.value} className="text-black hover:bg-blue-50 focus:bg-blue-500 focus:text-white">
                          {rel.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="emergencyPhone" className="text-black">Phone</Label>
                  <Input
                    id="emergencyPhone"
                    {...form.register('emergencyContact.phone')}
                    placeholder="Enter emergency contact phone"
                    className="h-12 text-black"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="emergencyEmail" className="text-black">Email</Label>
                  <Input
                    id="emergencyEmail"
                    type="email"
                    {...form.register('emergencyContact.email')}
                    placeholder="Enter emergency contact email"
                    className="h-12 text-black"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-black mb-2">Review Victim Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-gray-50 border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-black">Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-black">
                  <p><strong className="text-black">Name:</strong> <span className="text-black">{form.watch('personalInfo.firstName')} {form.watch('personalInfo.lastName')}</span></p>
                  <p><strong className="text-black">Date of Birth:</strong> <span className="text-black">{form.watch('personalInfo.dateOfBirth')}</span></p>
                  <p><strong className="text-black">Gender:</strong> <span className="text-black">{form.watch('personalInfo.gender')}</span></p>
                  <p><strong className="text-black">Nationality:</strong> <span className="text-black">{form.watch('personalInfo.nationality')}</span></p>
                  <p><strong className="text-black">Phone:</strong> <span className="text-black">{form.watch('personalInfo.phoneNumber') || 'N/A'}</span></p>
                </CardContent>
              </Card>
              <Card className="bg-gray-50 border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-black">Status Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-black">
                  <p><strong className="text-black">Is Minor:</strong> <span className="text-black">{form.watch('status.isMinor') ? 'Yes' : 'No'}</span></p>
                  <p><strong className="text-black">Is Deceased:</strong> <span className="text-black">{form.watch('status.isDeceased') ? 'Yes' : 'No'}</span></p>
                  <p><strong className="text-black">Emergency Contact:</strong> <span className="text-black">{form.watch('emergencyContact.name') || 'N/A'}</span></p>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Stepper */}
          <div className="lg:col-span-1">
            <Card className="bg-white dark:bg-slate-800 shadow-lg border-gray-200 dark:border-slate-700 sticky top-4">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3">
                <CardTitle className="text-lg font-semibold">Victim Registration</CardTitle>
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

          {/* Right Column - Form Content */}
          <div className="lg:col-span-2">
            <Card className="bg-white dark:bg-slate-800 shadow-lg border-gray-200 dark:border-slate-700">
              <div className="text-center py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
                <h1 className="text-2xl font-bold text-white">CREATE NEW VICTIM</h1>
              </div>
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3">
                <CardTitle className="flex items-center space-x-2 text-white text-lg mb-1">
                  {steps[currentStep].icon}
                  <span className="text-white">{steps[currentStep].title}</span>
                </CardTitle>
                <p className="text-sm text-blue-100">{steps[currentStep].description}</p>
              </CardHeader>
              <CardContent className="p-4">
                {error && (
                  <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                  </div>
                )}

                <div className="mb-4 text-black">
                  {renderStepContent()}
                </div>

                <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-slate-700">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={currentStep === 0 ? () => navigate('/victims') : handlePrevious}
                    disabled={isLoading}
                    className="flex items-center space-x-2 px-4 py-2 text-black text-sm"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span className="text-black">{currentStep === 0 ? 'Cancel' : 'Previous'}</span>
                  </Button>

                  <div className="flex space-x-4">
                    {currentStep === steps.length - 1 ? (
                      <Button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 text-white text-sm"
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span className="text-white">Creating...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-white">Create Victim</span>
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        onClick={handleNext}
                        className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 text-white text-sm"
                      >
                        <span className="text-white">Next</span>
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateVictimPage;
