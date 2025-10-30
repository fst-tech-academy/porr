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
import { FileText, UserCheck, Scale, Gavel, CheckCircle, ArrowLeft, ArrowRight, X, Plus, Trash2 } from 'lucide-react';
import { CaseFormData, Offender, Offence, EntityOption } from '../types';
import api from '../services/api';

const caseSchema = yup.object({
  caseNumber: yup.string().required('Case number is required'),
  title: yup.string().required('Case title is required'),
  description: yup.string().required('Description is required'),
  caseType: yup.string().required('Case type is required'),
  priority: yup.string().required('Priority is required'),
  offenders: yup.array().min(1, 'At least one offender is required').required(),
  offences: yup.array().min(1, 'At least one offence is required').required(),
  court: yup.object({
    courtId: yup.string().optional(),
    judge: yup.string().optional(),
    prosecutor: yup.string().optional(),
    defenseAttorney: yup.string().optional(),
  }).optional(),
  notes: yup.string().optional(),
});

const CreateCasePage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [offenders, setOffenders] = useState<Offender[]>([]);
  const [offences, setOffences] = useState<Offence[]>([]);
  const [courts, setCourts] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const steps = [
    {
      id: 'basic',
      title: 'Basic Info',
      description: 'Basic case information',
      icon: <FileText className="h-4 w-4" />
    },
    {
      id: 'offenders',
      title: 'Offenders',
      description: 'Add offenders to case',
      icon: <UserCheck className="h-4 w-4" />
    },
    {
      id: 'offences',
      title: 'Offences',
      description: 'Add offences to case',
      icon: <Scale className="h-4 w-4" />
    },
    {
      id: 'court',
      title: 'Court Info',
      description: 'Court and legal details',
      icon: <Gavel className="h-4 w-4" />
    },
    {
      id: 'review',
      title: 'Review',
      description: 'Confirm details',
      icon: <CheckCircle className="h-4 w-4" />
    }
  ];

  const form = useForm<CaseFormData>({
    resolver: yupResolver(caseSchema),
    defaultValues: {
      caseNumber: '',
      title: '',
      description: '',
      caseType: 'criminal',
      priority: 'medium',
      offenders: [],
      offences: [],
      court: {
        courtId: '',
        judge: '',
        prosecutor: '',
        defenseAttorney: ''
      },
      notes: ''
    },
  });

  useEffect(() => {
    fetchRequiredData();
  }, []);

  const fetchRequiredData = async () => {
    try {
      setLoadingData(true);
      const [offendersRes, offencesRes, courtsRes] = await Promise.all([
        api.get('/offenders?limit=100'),
        api.get('/offence-catalogues?limit=100'),
        api.get('/courts?limit=100')
      ]);

      if (offendersRes.data.success) {
        setOffenders(offendersRes.data.data.offenders || []);
      }
      if (offencesRes.data.success) {
        setOffences(offencesRes.data.data.offences || []);
      }
      if (courtsRes.data.success) {
        setCourts(courtsRes.data.data.courts || []);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoadingData(false);
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

  const addOffender = () => {
    const currentOffenders = form.getValues('offenders');
    form.setValue('offenders', [...currentOffenders, { offenderId: '', role: 'primary' }]);
  };

  const removeOffender = (index: number) => {
    const currentOffenders = form.getValues('offenders');
    form.setValue('offenders', currentOffenders.filter((_, i) => i !== index));
  };

  const updateOffender = (index: number, field: string, value: string) => {
    const currentOffenders = form.getValues('offenders');
    const updatedOffenders = currentOffenders.map((offender, i) => 
      i === index ? { ...offender, [field]: value } : offender
    );
    form.setValue('offenders', updatedOffenders);
  };

  const addOffence = () => {
    const currentOffences = form.getValues('offences');
    form.setValue('offences', [...currentOffences, { offenceId: '', count: 1, dateCommitted: '', location: '' }]);
  };

  const removeOffence = (index: number) => {
    const currentOffences = form.getValues('offences');
    form.setValue('offences', currentOffences.filter((_, i) => i !== index));
  };

  const updateOffence = (index: number, field: string, value: any) => {
    const currentOffences = form.getValues('offences');
    const updatedOffences = currentOffences.map((offence, i) => 
      i === index ? { ...offence, [field]: value } : offence
    );
    form.setValue('offences', updatedOffences);
  };

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

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const data = form.getValues();
      
      // Validate that all offenders and offences are selected
      const hasEmptyOffenders = data.offenders.some(o => !o.offenderId);
      const hasEmptyOffences = data.offences.some(o => !o.offenceId || !o.dateCommitted);

      if (hasEmptyOffenders) {
        setError('Please select an offender for all entries');
        return;
      }

      if (hasEmptyOffences) {
        setError('Please select an offence and date for all entries');
        return;
      }

      const response = await api.createCase(data);
      
      if (response.success) {
        navigate('/cases');
      } else {
        setError(response.message || 'Failed to create case');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create case');
    } finally {
      setIsLoading(false);
    }
  };

  const caseTypes = [
    { value: 'criminal', label: 'Criminal' },
    { value: 'civil', label: 'Civil' },
    { value: 'administrative', label: 'Administrative' },
    { value: 'appeal', label: 'Appeal' },
    { value: 'review', label: 'Review' },
    { value: 'investigation', label: 'Investigation' },
    { value: 'other', label: 'Other' }
  ];

  const priorities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];

  const offenderRoles = [
    { value: 'primary', label: 'Primary' },
    { value: 'secondary', label: 'Secondary' },
    { value: 'accomplice', label: 'Accomplice' },
    { value: 'witness', label: 'Witness' }
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
                  {...form.register('caseNumber')}
                  placeholder="Enter case number"
                  className={`h-12 text-black ${form.formState.errors.caseNumber ? 'border-red-500' : ''}`}
                />
                {form.formState.errors.caseNumber && (
                  <p className="text-sm text-red-500 text-black">{form.formState.errors.caseNumber.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-semibold text-black">Case Title *</Label>
                <Input
                  id="title"
                  {...form.register('title')}
                  placeholder="Enter case title"
                  className={`h-12 text-black ${form.formState.errors.title ? 'border-red-500' : ''}`}
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-red-500 text-black">{form.formState.errors.title.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-semibold text-black">Description *</Label>
              <textarea
                id="description"
                {...form.register('description')}
                placeholder="Enter case description"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 text-black"
              />
              {form.formState.errors.description && (
                <p className="text-sm text-red-500 text-black">{form.formState.errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="caseType" className="text-sm font-semibold text-black">Case Type *</Label>
                <Select
                  value={form.watch('caseType')}
                  onValueChange={(value) => form.setValue('caseType', value)}
                >
                  <SelectTrigger className="h-12 text-black bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500">
                    <SelectValue placeholder="Select case type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    {caseTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value} className="text-black hover:bg-blue-50 focus:bg-blue-500 focus:text-white">
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="priority" className="text-sm font-semibold text-black">Priority *</Label>
                <Select
                  value={form.watch('priority')}
                  onValueChange={(value) => form.setValue('priority', value)}
                >
                  <SelectTrigger className="h-12 text-black bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    {priorities.map((priority) => (
                      <SelectItem key={priority.value} value={priority.value} className="text-black hover:bg-blue-50 focus:bg-blue-500 focus:text-white">
                        {priority.label}
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
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-black text-lg">Offenders</h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addOffender}
                disabled={offenders.length === 0}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Offender
              </Button>
            </div>

            {form.watch('offenders').length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {offenders.length === 0 ? (
                  <p>No offenders available. Please create offenders first.</p>
                ) : (
                  <p>No offenders added yet. Click "Add Offender" to get started.</p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {form.watch('offenders').map((offender, index) => (
                  <div key={index} className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 border border-gray-200 rounded-lg">
                    <div className="space-y-2">
                      <Label className="text-black">Offender</Label>
                      <EntitySearch
                        label=""
                        placeholder="Search for offender..."
                        value={offender.offenderId}
                        onChange={(value) => updateOffender(index, 'offenderId', value)}
                        onSearch={searchOffenders}
                        error={form.formState.errors.offenders?.[index]?.offenderId?.message}
                        className="h-12"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-black">Role</Label>
                      <Select
                        value={offender.role}
                        onValueChange={(value) => updateOffender(index, 'role', value)}
                      >
                        <SelectTrigger className="h-12 text-black bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-200">
                          {offenderRoles.map((role) => (
                            <SelectItem key={role.value} value={role.value} className="text-black hover:bg-blue-50 focus:bg-blue-500 focus:text-white">
                              {role.label}
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
                        onClick={() => removeOffender(index)}
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

      case 2:
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-black text-lg">Offences</h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addOffence}
                disabled={offences.length === 0}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Offence
              </Button>
            </div>

            {form.watch('offences').length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {offences.length === 0 ? (
                  <p>No offences available. Please create offences first.</p>
                ) : (
                  <p>No offences added yet. Click "Add Offence" to get started.</p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {form.watch('offences').map((offence, index) => (
                  <div key={index} className="grid grid-cols-1 lg:grid-cols-4 gap-4 p-4 border border-gray-200 rounded-lg">
                    <div className="space-y-2">
                      <Label className="text-black">Offence</Label>
                      <EntitySearch
                        label=""
                        placeholder="Search for offence..."
                        value={offence.offenceId}
                        onChange={(value) => updateOffence(index, 'offenceId', value)}
                        onSearch={searchOffences}
                        error={form.formState.errors.offences?.[index]?.offenceId?.message}
                        className="h-12"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-black">Count</Label>
                      <Input
                        type="number"
                        min="1"
                        value={offence.count}
                        onChange={(e) => updateOffence(index, 'count', parseInt(e.target.value) || 1)}
                        className="h-12 text-black"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-black">Date Committed *</Label>
                      <Input
                        type="date"
                        value={offence.dateCommitted}
                        onChange={(e) => updateOffence(index, 'dateCommitted', e.target.value)}
                        className="h-12 text-black"
                      />
                    </div>
                    
                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeOffence(index)}
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
              <h4 className="font-semibold text-black text-lg">Court Information</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="courtId" className="text-black">Court</Label>
                  <EntitySearch
                    label=""
                    placeholder="Search for court..."
                    value={form.watch('court.courtId') || ''}
                    onChange={(value) => form.setValue('court.courtId', value)}
                    onSearch={searchCourts}
                    error={form.formState.errors.court?.courtId?.message}
                    className="h-12"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="judge" className="text-black">Judge</Label>
                  <Input
                    id="judge"
                    {...form.register('court.judge')}
                    placeholder="Enter judge name"
                    className="h-12 text-black"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="prosecutor" className="text-black">Prosecutor</Label>
                  <Input
                    id="prosecutor"
                    {...form.register('court.prosecutor')}
                    placeholder="Enter prosecutor name"
                    className="h-12 text-black"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="defenseAttorney" className="text-black">Defense Attorney</Label>
                  <Input
                    id="defenseAttorney"
                    {...form.register('court.defenseAttorney')}
                    placeholder="Enter defense attorney name"
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
            <h3 className="text-xl font-bold text-black mb-4">Review Case Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gray-50 border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-black">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-black">
                  <p><strong className="text-black">Case Number:</strong> <span className="text-black">{form.watch('caseNumber')}</span></p>
                  <p><strong className="text-black">Title:</strong> <span className="text-black">{form.watch('title')}</span></p>
                  <p><strong className="text-black">Type:</strong> <span className="text-black">{form.watch('caseType')}</span></p>
                  <p><strong className="text-black">Priority:</strong> <span className="text-black">{form.watch('priority')}</span></p>
                  <p><strong className="text-black">Description:</strong> <span className="text-black">{form.watch('description')}</span></p>
                </CardContent>
              </Card>
              <Card className="bg-gray-50 border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-black">Court Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-black">
                  <p><strong className="text-black">Court:</strong> <span className="text-black">{courts.find(c => c._id === form.watch('court.courtId'))?.name || 'N/A'}</span></p>
                  <p><strong className="text-black">Judge:</strong> <span className="text-black">{form.watch('court.judge') || 'N/A'}</span></p>
                  <p><strong className="text-black">Prosecutor:</strong> <span className="text-black">{form.watch('court.prosecutor') || 'N/A'}</span></p>
                  <p><strong className="text-black">Defense Attorney:</strong> <span className="text-black">{form.watch('court.defenseAttorney') || 'N/A'}</span></p>
                </CardContent>
              </Card>
            </div>
            <Card className="bg-gray-50 border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-black">Offenders & Offences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-black">
                <div>
                  <p><strong className="text-black">Offenders ({form.watch('offenders').length}):</strong></p>
                  <ul className="list-disc list-inside ml-4 text-black">
                    {form.watch('offenders').map((offender, index) => {
                      const offenderData = offenders.find(o => o._id === offender.offenderId);
                      return (
                        <li key={index} className="text-black">
                          {offenderData ? `${offenderData.personalInfo?.firstName} ${offenderData.personalInfo?.lastName}` : 'Unknown'} ({offender.role})
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <div>
                  <p><strong className="text-black">Offences ({form.watch('offences').length}):</strong></p>
                  <ul className="list-disc list-inside ml-4 text-black">
                    {form.watch('offences').map((offence, index) => {
                      const offenceData = offences.find(o => o._id === offence.offenceId);
                      return (
                        <li key={index} className="text-black">
                          {offenceData ? offenceData.name : 'Unknown'} (Count: {offence.count}, Date: {offence.dateCommitted})
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <p><strong className="text-black">Notes:</strong> <span className="text-black">{form.watch('notes') || 'N/A'}</span></p>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

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
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold">Create Case</h1>
                  <p className="text-blue-100 text-lg">Add a new case file to the system</p>
                </div>
              </div>
              <Button
                variant="ghost"
                onClick={() => navigate('/cases')}
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
                <Gavel className="w-4 h-4" />
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
                  <FileText className="w-5 h-5 text-blue-600" />
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
                    onClick={currentStep === 0 ? () => navigate('/cases') : handlePrevious}
                    disabled={isLoading}
                    className="flex items-center space-x-2 px-6 py-3 text-black"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span className="text-black">{currentStep === 0 ? 'Cancel' : 'Previous'}</span>
                  </Button>

                  <Button
                    type="button"
                    onClick={currentStep === steps.length - 1 ? handleSubmit : handleNext}
                    disabled={isLoading || offenders.length === 0 || offences.length === 0}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-6 py-3 text-white"
                  >
                    <span className="text-white">{currentStep === steps.length - 1 ? 'Create Case' : 'Next'}</span>
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

export default CreateCasePage;