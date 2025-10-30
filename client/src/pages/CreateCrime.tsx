import React, { useState, useEffect } from 'react';
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
import EntitySearch from '../components/ui/entity-search';
import { ShieldAlert, UserCheck, Heart, Scale, CheckCircle, ArrowLeft, ArrowRight, X, Plus, Trash2 } from 'lucide-react';
import { OffenderOffenceFormData, Offender, Offence, Victim, EntityOption } from '../types';
import api from '../services/api';

const crimeSchema = yup.object({
  crimeInfo: yup.object({
    caseNumber: yup.string().required('Case number is required'),
    title: yup.string().required('Crime title is required'),
    description: yup.string().required('Description is required'),
    category: yup.string().required('Category is required'),
    subcategory: yup.string().optional(),
  }).required(),
  dateTime: yup.object({
    dateCommitted: yup.string().required('Date committed is required'),
    timeCommitted: yup.string().optional(),
    dateReported: yup.string().required('Date reported is required'),
    dateArrested: yup.string().optional(),
    dateCharged: yup.string().optional(),
    dateConvicted: yup.string().optional(),
    dateSentenced: yup.string().optional(),
  }).required(),
  location: yup.object({
    street: yup.string().optional(),
    city: yup.string().required('City is required'),
    state: yup.string().required('State is required'),
    country: yup.string().required('Country is required'),
    postalCode: yup.string().optional(),
    locationType: yup.string().optional(),
    specificLocation: yup.string().optional(),
  }).required(),
  offender: yup.string().required('Offender is required'),
  offence: yup.string().required('Offence is required'),
  victims: yup.array().of(yup.object({
    victim: yup.string().required('Victim is required'),
    relationshipToOffender: yup.string().optional(),
    victimImpact: yup.object({
      physicalInjury: yup.boolean().optional(),
      psychologicalImpact: yup.string().optional(),
      financialLoss: yup.number().optional(),
    }).optional(),
  })).optional(),
  legal: yup.object({
    status: yup.string().required('Status is required'),
    severity: yup.string().required('Severity is required'),
    charges: yup.array().of(yup.object({
      charge: yup.string().optional(),
      statute: yup.string().optional(),
      penalty: yup.string().optional(),
    })).optional(),
    court: yup.string().optional(),
    judge: yup.object({
      name: yup.string().optional(),
      id: yup.string().optional(),
    }).optional(),
    prosecutor: yup.object({
      name: yup.string().optional(),
      id: yup.string().optional(),
    }).optional(),
    defenseAttorney: yup.object({
      name: yup.string().optional(),
      id: yup.string().optional(),
    }).optional(),
    verdict: yup.string().optional(),
    sentence: yup.object({
      type: yup.string().optional(),
      duration: yup.string().optional(),
      fine: yup.number().optional(),
      conditions: yup.array().of(yup.string()).optional(),
    }).optional(),
  }).required(),
  notes: yup.string().optional(),
});

const CreateCrimePage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const steps = [
    {
      id: 'basic',
      title: 'Basic Info',
      description: 'Basic crime information',
      icon: <ShieldAlert className="h-4 w-4" />
    },
    {
      id: 'offender',
      title: 'Offender & Offence',
      description: 'Select offender and offence',
      icon: <UserCheck className="h-4 w-4" />
    },
    {
      id: 'victims',
      title: 'Victims',
      description: 'Add victims to crime',
      icon: <Heart className="h-4 w-4" />
    },
    {
      id: 'legal',
      title: 'Legal Details',
      description: 'Legal and court information',
      icon: <Scale className="h-4 w-4" />
    },
    {
      id: 'review',
      title: 'Review',
      description: 'Confirm details',
      icon: <CheckCircle className="h-4 w-4" />
    }
  ];

  const form = useForm<OffenderOffenceFormData>({
    resolver: yupResolver(crimeSchema),
    defaultValues: {
      crimeInfo: {
        caseNumber: '',
        title: '',
        description: '',
        category: '',
        subcategory: '',
      },
      dateTime: {
        dateCommitted: '',
        timeCommitted: '',
        dateReported: '',
        dateArrested: '',
        dateCharged: '',
        dateConvicted: '',
        dateSentenced: '',
      },
      location: {
        street: '',
        city: '',
        state: '',
        country: 'Somalia',
        postalCode: '',
        locationType: 'other',
        specificLocation: '',
      },
      offender: '',
      offence: '',
      victims: [],
      legal: {
        status: 'reported',
        severity: 'moderate',
        charges: [],
        court: '',
        judge: { name: '', id: '' },
        prosecutor: { name: '', id: '' },
        defenseAttorney: { name: '', id: '' },
        verdict: 'pending',
        sentence: { type: '', duration: '', fine: 0, conditions: [] },
      },
      notes: '',
    },
  });

  // Search functions for EntitySearch components
  const searchOffenders = async (query: string): Promise<EntityOption[]> => {
    try {
      const response = await api.get(`/offenders?search=${encodeURIComponent(query)}&limit=20`);
      if (response.data.success) {
        return (response.data.data.offenders || []).map((offender: Offender) => ({
          _id: offender._id,
          display: `${offender.personalInfo.firstName} ${offender.personalInfo.lastName} (${offender.personalInfo.nationalId})`,
          type: 'Offender'
        }));
      }
      return [];
    } catch (error) {
      console.error('Error searching offenders:', error);
      return [];
    }
  };

  const searchOffences = async (query: string): Promise<EntityOption[]> => {
    try {
      const response = await api.get(`/offence-catalogues?search=${encodeURIComponent(query)}&limit=20`);
      if (response.data.success) {
        return (response.data.data.offences || []).map((offence: Offence) => ({
          _id: offence._id,
          display: `${offence.name} (${offence.code})`,
          type: offence.category
        }));
      }
      return [];
    } catch (error) {
      console.error('Error searching offences:', error);
      return [];
    }
  };

  const searchVictims = async (query: string): Promise<EntityOption[]> => {
    try {
      const response = await api.get(`/victims?search=${encodeURIComponent(query)}&limit=20`);
      if (response.data.success) {
        return (response.data.data.victims || []).map((victim: Victim) => ({
          _id: victim._id,
          display: `${victim.personalInfo.firstName} ${victim.personalInfo.lastName} (${victim.personalInfo.nationalId || 'No ID'})`,
          type: 'Victim'
        }));
      }
      return [];
    } catch (error) {
      console.error('Error searching victims:', error);
      return [];
    }
  };

  const searchCourts = async (query: string): Promise<EntityOption[]> => {
    try {
      const response = await api.get(`/courts?search=${encodeURIComponent(query)}&limit=20`);
      if (response.data.success) {
        return (response.data.data.courts || []).map((court: any) => ({
          _id: court._id,
          display: `${court.name} (${court.code})`,
          type: court.type
        }));
      }
      return [];
    } catch (error) {
      console.error('Error searching courts:', error);
      return [];
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

  const addVictim = () => {
    const currentVictims = form.getValues('victims') || [];
    form.setValue('victims', [...currentVictims, { victim: '', relationshipToOffender: 'stranger', victimImpact: {} }]);
  };

  const removeVictim = (index: number) => {
    const currentVictims = form.getValues('victims') || [];
    form.setValue('victims', currentVictims.filter((_, i) => i !== index));
  };

  const updateVictim = (index: number, field: string, value: any) => {
    const currentVictims = form.getValues('victims') || [];
    const updatedVictims = currentVictims.map((victim, i) => 
      i === index ? { ...victim, [field]: value } : victim
    );
    form.setValue('victims', updatedVictims);
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const data = form.getValues();
      const response = await api.createCrime(data);
      
      if (response.success) {
        navigate('/crimes');
      } else {
        setError(response.message || 'Failed to create crime');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create crime');
    } finally {
      setIsLoading(false);
    }
  };

  const categories = [
    { value: 'violent', label: 'Violent Crime' },
    { value: 'property', label: 'Property Crime' },
    { value: 'financial', label: 'Financial Crime' },
    { value: 'drug', label: 'Drug Crime' },
    { value: 'cyber', label: 'Cyber Crime' },
    { value: 'white_collar', label: 'White Collar Crime' },
    { value: 'organized', label: 'Organized Crime' },
    { value: 'terrorism', label: 'Terrorism' },
    { value: 'other', label: 'Other' }
  ];

  const severities = [
    { value: 'minor', label: 'Minor' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'serious', label: 'Serious' },
    { value: 'major', label: 'Major' },
    { value: 'felony', label: 'Felony' }
  ];

  const statuses = [
    { value: 'reported', label: 'Reported' },
    { value: 'under_investigation', label: 'Under Investigation' },
    { value: 'charged', label: 'Charged' },
    { value: 'trial', label: 'Trial' },
    { value: 'convicted', label: 'Convicted' },
    { value: 'acquitted', label: 'Acquitted' },
    { value: 'dismissed', label: 'Dismissed' },
    { value: 'plea_bargain', label: 'Plea Bargain' }
  ];

  const locationTypes = [
    { value: 'residential', label: 'Residential' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'public', label: 'Public' },
    { value: 'private', label: 'Private' },
    { value: 'vehicle', label: 'Vehicle' },
    { value: 'online', label: 'Online' },
    { value: 'other', label: 'Other' }
  ];

  const relationships = [
    { value: 'stranger', label: 'Stranger' },
    { value: 'acquaintance', label: 'Acquaintance' },
    { value: 'family', label: 'Family' },
    { value: 'friend', label: 'Friend' },
    { value: 'colleague', label: 'Colleague' },
    { value: 'neighbor', label: 'Neighbor' },
    { value: 'romantic', label: 'Romantic' },
    { value: 'other', label: 'Other' }
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="caseNumber" className="text-sm font-semibold text-black">Case Number *</Label>
                <Input
                  id="caseNumber"
                  {...form.register('crimeInfo.caseNumber')}
                  placeholder="Enter case number"
                  className={`h-12 text-black ${form.formState.errors.crimeInfo?.caseNumber ? 'border-red-500' : ''}`}
                />
                {form.formState.errors.crimeInfo?.caseNumber && (
                  <p className="text-sm text-red-500 text-black">{form.formState.errors.crimeInfo.caseNumber.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-semibold text-black">Crime Title *</Label>
                <Input
                  id="title"
                  {...form.register('crimeInfo.title')}
                  placeholder="Enter crime title"
                  className={`h-12 text-black ${form.formState.errors.crimeInfo?.title ? 'border-red-500' : ''}`}
                />
                {form.formState.errors.crimeInfo?.title && (
                  <p className="text-sm text-red-500 text-black">{form.formState.errors.crimeInfo.title.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-semibold text-black">Description *</Label>
              <textarea
                id="description"
                {...form.register('crimeInfo.description')}
                placeholder="Enter crime description"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 text-black"
              />
              {form.formState.errors.crimeInfo?.description && (
                <p className="text-sm text-red-500 text-black">{form.formState.errors.crimeInfo.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-semibold text-black">Category *</Label>
                <Select
                  value={form.watch('crimeInfo.category')}
                  onValueChange={(value) => form.setValue('crimeInfo.category', value)}
                >
                  <SelectTrigger className="h-12 text-black bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value} className="text-black hover:bg-blue-50 focus:bg-blue-500 focus:text-white">
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subcategory" className="text-sm font-semibold text-black">Subcategory</Label>
                <Input
                  id="subcategory"
                  {...form.register('crimeInfo.subcategory')}
                  placeholder="Enter subcategory"
                  className="h-12 text-black"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="dateCommitted" className="text-sm font-semibold text-black">Date Committed *</Label>
                <Input
                  id="dateCommitted"
                  type="date"
                  {...form.register('dateTime.dateCommitted')}
                  className={`h-12 text-black ${form.formState.errors.dateTime?.dateCommitted ? 'border-red-500' : ''}`}
                />
                {form.formState.errors.dateTime?.dateCommitted && (
                  <p className="text-sm text-red-500 text-black">{form.formState.errors.dateTime.dateCommitted.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="timeCommitted" className="text-sm font-semibold text-black">Time Committed</Label>
                <Input
                  id="timeCommitted"
                  type="time"
                  {...form.register('dateTime.timeCommitted')}
                  className="h-12 text-black"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateReported" className="text-sm font-semibold text-black">Date Reported *</Label>
              <Input
                id="dateReported"
                type="date"
                {...form.register('dateTime.dateReported')}
                className={`h-12 text-black ${form.formState.errors.dateTime?.dateReported ? 'border-red-500' : ''}`}
              />
              {form.formState.errors.dateTime?.dateReported && (
                <p className="text-sm text-red-500 text-black">{form.formState.errors.dateTime.dateReported.message}</p>
              )}
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-black">Offender *</Label>
                <EntitySearch
                  label=""
                  placeholder="Search for offender..."
                  value={form.watch('offender')}
                  onChange={(value) => form.setValue('offender', value)}
                  onSearch={searchOffenders}
                  error={form.formState.errors.offender?.message}
                  className="h-12"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-black">Offence *</Label>
                <EntitySearch
                  label=""
                  placeholder="Search for offence..."
                  value={form.watch('offence')}
                  onChange={(value) => form.setValue('offence', value)}
                  onSearch={searchOffences}
                  error={form.formState.errors.offence?.message}
                  className="h-12"
                />
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="font-semibold text-black text-lg">Location Information</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="street" className="text-black">Street</Label>
                  <Input
                    id="street"
                    {...form.register('location.street')}
                    placeholder="Enter street address"
                    className="h-12 text-black"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-black">City *</Label>
                  <Input
                    id="city"
                    {...form.register('location.city')}
                    placeholder="Enter city"
                    className={`h-12 text-black ${form.formState.errors.location?.city ? 'border-red-500' : ''}`}
                  />
                  {form.formState.errors.location?.city && (
                    <p className="text-sm text-red-500 text-black">{form.formState.errors.location.city.message}</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="state" className="text-black">State *</Label>
                  <Input
                    id="state"
                    {...form.register('location.state')}
                    placeholder="Enter state"
                    className={`h-12 text-black ${form.formState.errors.location?.state ? 'border-red-500' : ''}`}
                  />
                  {form.formState.errors.location?.state && (
                    <p className="text-sm text-red-500 text-black">{form.formState.errors.location.state.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="country" className="text-black">Country *</Label>
                  <Input
                    id="country"
                    {...form.register('location.country')}
                    placeholder="Enter country"
                    className={`h-12 text-black ${form.formState.errors.location?.country ? 'border-red-500' : ''}`}
                  />
                  {form.formState.errors.location?.country && (
                    <p className="text-sm text-red-500 text-black">{form.formState.errors.location.country.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="postalCode" className="text-black">Postal Code</Label>
                  <Input
                    id="postalCode"
                    {...form.register('location.postalCode')}
                    placeholder="Enter postal code"
                    className="h-12 text-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="locationType" className="text-black">Location Type</Label>
                  <Select
                    value={form.watch('location.locationType') || ''}
                    onValueChange={(value) => form.setValue('location.locationType', value)}
                  >
                    <SelectTrigger className="h-12 text-black bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500">
                      <SelectValue placeholder="Select location type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      {locationTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value} className="text-black hover:bg-blue-50 focus:bg-blue-500 focus:text-white">
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="specificLocation" className="text-black">Specific Location</Label>
                  <Input
                    id="specificLocation"
                    {...form.register('location.specificLocation')}
                    placeholder="Enter specific location details"
                    className="h-12 text-black"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-black text-lg">Victims</h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addVictim}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Victim
              </Button>
            </div>

            {(!form.watch('victims') || form.watch('victims').length === 0) ? (
              <div className="text-center py-8 text-gray-500">
                <p>No victims added yet. Click "Add Victim" to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {form.watch('victims').map((victim, index) => (
                  <div key={index} className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 border border-gray-200 rounded-lg">
                    <div className="space-y-2">
                      <Label className="text-black">Victim</Label>
                      <EntitySearch
                        label=""
                        placeholder="Search for victim..."
                        value={victim.victim}
                        onChange={(value) => updateVictim(index, 'victim', value)}
                        onSearch={searchVictims}
                        className="h-12"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-black">Relationship</Label>
                      <Select
                        value={victim.relationshipToOffender || ''}
                        onValueChange={(value) => updateVictim(index, 'relationshipToOffender', value)}
                      >
                        <SelectTrigger className="h-12 text-black bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500">
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
                    
                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeVictim(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-8">
            <div className="space-y-6">
              <h4 className="font-semibold text-black text-lg">Legal Information</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-black">Status *</Label>
                  <Select
                    value={form.watch('legal.status')}
                    onValueChange={(value) => form.setValue('legal.status', value)}
                  >
                    <SelectTrigger className="h-12 text-black bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      {statuses.map((status) => (
                        <SelectItem key={status.value} value={status.value} className="text-black hover:bg-blue-50 focus:bg-blue-500 focus:text-white">
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="severity" className="text-black">Severity *</Label>
                  <Select
                    value={form.watch('legal.severity')}
                    onValueChange={(value) => form.setValue('legal.severity', value)}
                  >
                    <SelectTrigger className="h-12 text-black bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500">
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      {severities.map((severity) => (
                        <SelectItem key={severity.value} value={severity.value} className="text-black hover:bg-blue-50 focus:bg-blue-500 focus:text-white">
                          {severity.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-black">Court</Label>
                <EntitySearch
                  label=""
                  placeholder="Search for court..."
                  value={form.watch('legal.court') || ''}
                  onChange={(value) => form.setValue('legal.court', value)}
                  onSearch={searchCourts}
                  className="h-12"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="judgeName" className="text-black">Judge Name</Label>
                  <Input
                    id="judgeName"
                    {...form.register('legal.judge.name')}
                    placeholder="Enter judge name"
                    className="h-12 text-black"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="prosecutorName" className="text-black">Prosecutor Name</Label>
                  <Input
                    id="prosecutorName"
                    {...form.register('legal.prosecutor.name')}
                    placeholder="Enter prosecutor name"
                    className="h-12 text-black"
                  />
                </div>
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
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-black mb-4">Review Crime Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gray-50 border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-black">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-black">
                  <p><strong className="text-black">Case Number:</strong> <span className="text-black">{form.watch('crimeInfo.caseNumber')}</span></p>
                  <p><strong className="text-black">Title:</strong> <span className="text-black">{form.watch('crimeInfo.title')}</span></p>
                  <p><strong className="text-black">Category:</strong> <span className="text-black">{form.watch('crimeInfo.category')}</span></p>
                  <p><strong className="text-black">Date Committed:</strong> <span className="text-black">{form.watch('dateTime.dateCommitted')}</span></p>
                </CardContent>
              </Card>
              <Card className="bg-gray-50 border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-black">Legal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-black">
                  <p><strong className="text-black">Status:</strong> <span className="text-black">{form.watch('legal.status')}</span></p>
                  <p><strong className="text-black">Severity:</strong> <span className="text-black">{form.watch('legal.severity')}</span></p>
                  <p><strong className="text-black">Court:</strong> <span className="text-black">{form.watch('legal.court') || 'N/A'}</span></p>
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
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create New Crime</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Record a new crime with detailed information
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Stepper */}
          <div className="lg:col-span-1">
            <Card className="bg-white dark:bg-slate-800 shadow-lg border-gray-200 dark:border-slate-700 sticky top-8">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <CardTitle className="text-xl font-semibold">Crime Registration</CardTitle>
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

          {/* Right Column - Form Content */}
          <div className="lg:col-span-2">
            <Card className="bg-white dark:bg-slate-800 shadow-lg border-gray-200 dark:border-slate-700">
              <CardContent className="p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {steps[currentStep].title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {steps[currentStep].description}
                  </p>
                </div>

                {renderStepContent()}

                {error && (
                  <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-red-800 dark:text-red-200">{error}</p>
                  </div>
                )}

                <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-slate-700">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentStep === 0}
                    className="flex items-center"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>

                  <div className="flex space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/crimes')}
                      className="flex items-center"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>

                    {currentStep === steps.length - 1 ? (
                      <Button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="bg-blue-600 hover:bg-blue-700 text-white flex items-center"
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Creating...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Create Crime
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        onClick={handleNext}
                        className="bg-blue-600 hover:bg-blue-700 text-white flex items-center"
                      >
                        Next
                        <ArrowRight className="w-4 h-4 ml-2" />
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

export default CreateCrimePage;
