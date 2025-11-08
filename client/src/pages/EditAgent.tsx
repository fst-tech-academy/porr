import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import { UserCheck, Shield, Building2, User, CheckCircle, ArrowLeft, ArrowRight, Lock, Loader2 } from 'lucide-react';
import { AgentFormData, Department, User as UserType, EntityOption } from '../types';
import api from '../services/api';

const agentSchema = yup.object({
  pseudonym: yup.object({
    firstName: yup.string().required('Pseudonym first name is required'),
    lastName: yup.string().required('Pseudonym last name is required'),
    codeName: yup.string().optional(),
  }).required(),
  realIdentity: yup.object({
    firstName: yup.string().optional(),
    lastName: yup.string().optional(),
    nationalId: yup.string().optional(),
    dateOfBirth: yup.string().optional(),
    placeOfBirth: yup.string().optional(),
  }).optional(),
  department: yup.string().required('Department is required'),
  user: yup.string().optional(),
  rank: yup.string().required('Rank is required'),
  specialization: yup.string().required('Specialization is required'),
  employmentDate: yup.string().required('Employment date is required'),
  status: yup.string().optional(),
  clearanceLevel: yup.string().optional(),
  contactInfo: yup.object({
    phone: yup.string().optional(),
    email: yup.string().email('Valid email is required').optional(),
    emergencyContact: yup.object({
      name: yup.string().optional(),
      relationship: yup.string().optional(),
      phone: yup.string().optional(),
    }).optional(),
  }).optional(),
  physicalDescription: yup.object({
    height: yup.number().optional(),
    weight: yup.number().optional(),
    eyeColor: yup.string().optional(),
    hairColor: yup.string().optional(),
    distinguishingMarks: yup.string().optional(),
  }).optional(),
  statusInfo: yup.object({
    isActive: yup.boolean().optional(),
    onDuty: yup.boolean().optional(),
    availability: yup.string().optional(),
  }).optional(),
  notes: yup.string().optional(),
});

const EditAgentPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAgent, setIsLoadingAgent] = useState(true);
  const [error, setError] = useState<string>('');
  const [departments, setDepartments] = useState<Department[]>([]);

  const steps = [
    {
      id: 'pseudonym',
      title: 'Pseudonym',
      description: 'Agent pseudonym information',
      icon: <UserCheck className="h-4 w-4" />
    },
    {
      id: 'department',
      title: 'Department & User',
      description: 'Department assignment and user account',
      icon: <Building2 className="h-4 w-4" />
    },
    {
      id: 'details',
      title: 'Agent Details',
      description: 'Rank, specialization, and employment',
      icon: <Shield className="h-4 w-4" />
    },
    {
      id: 'contact',
      title: 'Contact Info',
      description: 'Contact details',
      icon: <User className="h-4 w-4" />
    },
    {
      id: 'review',
      title: 'Review',
      description: 'Confirm details',
      icon: <CheckCircle className="h-4 w-4" />
    }
  ];

  const form = useForm<AgentFormData>({
    resolver: yupResolver(agentSchema),
    defaultValues: {
      pseudonym: {
        firstName: '',
        lastName: '',
        codeName: ''
      },
      realIdentity: {
        firstName: '',
        lastName: '',
        nationalId: '',
        dateOfBirth: '',
        placeOfBirth: ''
      },
      department: '',
      user: '',
      rank: 'detective',
      specialization: 'general',
      employmentDate: '',
      status: 'active',
      clearanceLevel: 'confidential',
      contactInfo: {
        phone: '',
        email: '',
        emergencyContact: {
          name: '',
          relationship: '',
          phone: ''
        }
      },
      physicalDescription: {
        height: undefined,
        weight: undefined,
        eyeColor: '',
        hairColor: '',
        distinguishingMarks: ''
      },
      statusInfo: {
        isActive: true,
        onDuty: false,
        availability: 'available'
      },
      notes: ''
    },
  });

  useEffect(() => {
    fetchDepartments();
    if (id) {
      fetchAgent();
    }
  }, [id]);

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

  const fetchAgent = async () => {
    if (!id) return;
    
    try {
      setIsLoadingAgent(true);
      const response = await api.getAgent(id);
      
      if (response.success && response.data) {
        const agent = response.data.agent;
        
        form.reset({
          pseudonym: {
            firstName: agent.pseudonym?.firstName || '',
            lastName: agent.pseudonym?.lastName || '',
            codeName: agent.pseudonym?.codeName || ''
          },
          realIdentity: {
            firstName: agent.realIdentity?.firstName || '',
            lastName: agent.realIdentity?.lastName || '',
            nationalId: agent.realIdentity?.nationalId || '',
            dateOfBirth: agent.realIdentity?.dateOfBirth ? formatDateForInput(agent.realIdentity.dateOfBirth) : '',
            placeOfBirth: agent.realIdentity?.placeOfBirth || ''
          },
          department: typeof agent.department === 'object' ? agent.department._id : agent.department || '',
          user: typeof agent.user === 'object' ? agent.user._id : agent.user || '',
          rank: agent.rank || 'detective',
          specialization: agent.specialization || 'general',
          employmentDate: agent.employmentDate ? formatDateForInput(agent.employmentDate) : '',
          status: agent.status || 'active',
          clearanceLevel: agent.clearanceLevel || 'confidential',
          contactInfo: {
            phone: agent.contactInfo?.phone || '',
            email: agent.contactInfo?.email || '',
            emergencyContact: {
              name: agent.contactInfo?.emergencyContact?.name || '',
              relationship: agent.contactInfo?.emergencyContact?.relationship || '',
              phone: agent.contactInfo?.emergencyContact?.phone || ''
            }
          },
          physicalDescription: {
            height: agent.physicalDescription?.height,
            weight: agent.physicalDescription?.weight,
            eyeColor: agent.physicalDescription?.eyeColor || '',
            hairColor: agent.physicalDescription?.hairColor || '',
            distinguishingMarks: agent.physicalDescription?.distinguishingMarks || ''
          },
          statusInfo: {
            isActive: agent.statusInfo?.isActive ?? true,
            onDuty: agent.statusInfo?.onDuty ?? false,
            availability: agent.statusInfo?.availability || 'available'
          },
          notes: agent.notes || ''
        });
      } else {
        setError('Failed to load agent data');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load agent');
    } finally {
      setIsLoadingAgent(false);
    }
  };

  const searchUsers = async (query: string): Promise<EntityOption[]> => {
    try {
      const response = await api.getUsers({ search: query, limit: 20 });
      if (response.success) {
        return (response.data.users || []).map((user: UserType) => ({
          _id: user._id,
          display: `${user.firstName} ${user.lastName} (${user.email})`,
          type: 'User'
        }));
      }
      return [];
    } catch (error) {
      console.error('Error searching users:', error);
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

  const handleSubmit = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      setError('');
      
      const data = form.getValues();
      const response = await api.updateAgent(id, data);
      
      if (response.success) {
        navigate(`/agents/${id}`);
      } else {
        setError(response.message || 'Failed to update agent');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update agent');
    } finally {
      setIsLoading(false);
    }
  };

  const ranks = [
    { value: 'detective', label: 'Detective' },
    { value: 'senior_detective', label: 'Senior Detective' },
    { value: 'supervisor', label: 'Supervisor' },
    { value: 'commander', label: 'Commander' },
    { value: 'director', label: 'Director' }
  ];

  const specializations = [
    { value: 'homicide', label: 'Homicide' },
    { value: 'narcotics', label: 'Narcotics' },
    { value: 'fraud', label: 'Fraud' },
    { value: 'cybercrime', label: 'Cybercrime' },
    { value: 'terrorism', label: 'Terrorism' },
    { value: 'organized_crime', label: 'Organized Crime' },
    { value: 'general', label: 'General' },
    { value: 'other', label: 'Other' }
  ];

  const statuses = [
    { value: 'active', label: 'Active' },
    { value: 'on_leave', label: 'On Leave' },
    { value: 'suspended', label: 'Suspended' },
    { value: 'retired', label: 'Retired' },
    { value: 'transferred', label: 'Transferred' }
  ];

  const clearanceLevels = [
    { value: 'confidential', label: 'Confidential' },
    { value: 'secret', label: 'Secret' },
    { value: 'top_secret', label: 'Top Secret' }
  ];

  const eyeColors = [
    { value: 'brown', label: 'Brown' },
    { value: 'blue', label: 'Blue' },
    { value: 'green', label: 'Green' },
    { value: 'hazel', label: 'Hazel' },
    { value: 'gray', label: 'Gray' },
    { value: 'amber', label: 'Amber' },
    { value: 'black', label: 'Black' },
    { value: 'other', label: 'Other' }
  ];

  const hairColors = [
    { value: 'black', label: 'Black' },
    { value: 'brown', label: 'Brown' },
    { value: 'blonde', label: 'Blonde' },
    { value: 'red', label: 'Red' },
    { value: 'gray', label: 'Gray' },
    { value: 'white', label: 'White' },
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
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800">
                <Lock className="w-4 h-4 inline mr-2" />
                <strong>Pseudonym Information:</strong> This is the name the agent will be known by in the system. Real identity information is kept confidential.
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="pseudonym.firstName" className="text-sm font-semibold text-black">Pseudonym First Name *</Label>
                <Input
                  id="pseudonym.firstName"
                  {...form.register('pseudonym.firstName')}
                  placeholder="Enter pseudonym first name"
                  className={`h-10 text-black text-sm ${form.formState.errors.pseudonym?.firstName ? 'border-red-500' : ''}`}
                />
                {form.formState.errors.pseudonym?.firstName && (
                  <p className="text-xs text-red-500 text-black">{form.formState.errors.pseudonym.firstName.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="pseudonym.lastName" className="text-sm font-semibold text-black">Pseudonym Last Name *</Label>
                <Input
                  id="pseudonym.lastName"
                  {...form.register('pseudonym.lastName')}
                  placeholder="Enter pseudonym last name"
                  className={`h-10 text-black text-sm ${form.formState.errors.pseudonym?.lastName ? 'border-red-500' : ''}`}
                />
                {form.formState.errors.pseudonym?.lastName && (
                  <p className="text-xs text-red-500 text-black">{form.formState.errors.pseudonym.lastName.message}</p>
                )}
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="pseudonym.codeName" className="text-black">Code Name (Optional)</Label>
              <Input
                id="pseudonym.codeName"
                {...form.register('pseudonym.codeName')}
                placeholder="Enter code name"
                className="h-10 text-black text-sm"
              />
            </div>
            <div className="border-t pt-4 mt-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-yellow-800">
                  <Lock className="w-4 h-4 inline mr-2" />
                  <strong>Confidential - Real Identity:</strong> This information is kept secure and only accessible to authorized personnel.
                </p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="realIdentity.firstName" className="text-black">Real First Name</Label>
                  <Input
                    id="realIdentity.firstName"
                    {...form.register('realIdentity.firstName')}
                    placeholder="Enter real first name"
                    className="h-10 text-black text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="realIdentity.lastName" className="text-black">Real Last Name</Label>
                  <Input
                    id="realIdentity.lastName"
                    {...form.register('realIdentity.lastName')}
                    placeholder="Enter real last name"
                    className="h-10 text-black text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="realIdentity.nationalId" className="text-black">National ID</Label>
                  <Input
                    id="realIdentity.nationalId"
                    {...form.register('realIdentity.nationalId')}
                    placeholder="Enter national ID"
                    className="h-10 text-black text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="realIdentity.dateOfBirth" className="text-black">Date of Birth</Label>
                  <Input
                    id="realIdentity.dateOfBirth"
                    type="date"
                    {...form.register('realIdentity.dateOfBirth')}
                    className="h-10 text-black text-sm"
                  />
                </div>
                <div className="space-y-1 lg:col-span-2">
                  <Label htmlFor="realIdentity.placeOfBirth" className="text-black">Place of Birth</Label>
                  <Input
                    id="realIdentity.placeOfBirth"
                    {...form.register('realIdentity.placeOfBirth')}
                    placeholder="Enter place of birth"
                    className="h-10 text-black text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-1">
              <Label className="text-sm font-semibold text-black">Department *</Label>
              <Select
                value={form.watch('department') || undefined}
                onValueChange={(value) => form.setValue('department', value)}
              >
                <SelectTrigger className="h-10 text-black bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 text-sm">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  {departments
                    .filter(dept => {
                      const id = String(dept._id || '');
                      return id.trim() !== '';
                    })
                    .map((dept) => {
                      const id = String(dept._id);
                      return (
                        <SelectItem key={id} value={id} className="text-black hover:bg-blue-50 focus:bg-blue-500 focus:text-white">
                          {dept.name} ({dept.code})
                        </SelectItem>
                      );
                    })}
                </SelectContent>
              </Select>
              {form.formState.errors.department && (
                <p className="text-xs text-red-500 text-black">{form.formState.errors.department.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold text-black">User Account (Optional)</Label>
              <p className="text-xs text-gray-600 mb-2">Link this agent to a user account to enable system login</p>
              <EntitySearch
                label=""
                placeholder="Search for user (optional)..."
                value={form.watch('user') || ''}
                onChange={(value) => form.setValue('user', value || '')}
                onSearch={searchUsers}
                error={form.formState.errors.user?.message}
                className="h-10"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="rank" className="text-sm font-semibold text-black">Rank *</Label>
                <Select
                  value={form.watch('rank')}
                  onValueChange={(value) => form.setValue('rank', value as any)}
                >
                  <SelectTrigger className="h-10 text-black bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 text-sm">
                    <SelectValue placeholder="Select rank" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    {ranks
                      .filter(rank => {
                        const val = String(rank?.value || '').trim();
                        return val !== '';
                      })
                      .map((rank) => {
                        const val = String(rank.value).trim();
                        return (
                          <SelectItem key={val} value={val} className="text-black hover:bg-blue-50 focus:bg-blue-500 focus:text-white">
                            {rank.label}
                          </SelectItem>
                        );
                      })}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="specialization" className="text-sm font-semibold text-black">Specialization *</Label>
                <Select
                  value={form.watch('specialization')}
                  onValueChange={(value) => form.setValue('specialization', value as any)}
                >
                  <SelectTrigger className="h-10 text-black bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 text-sm">
                    <SelectValue placeholder="Select specialization" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    {specializations
                      .filter(spec => {
                        const val = String(spec?.value || '').trim();
                        return val !== '';
                      })
                      .map((spec) => {
                        const val = String(spec.value).trim();
                        return (
                          <SelectItem key={val} value={val} className="text-black hover:bg-blue-50 focus:bg-blue-500 focus:text-white">
                            {spec.label}
                          </SelectItem>
                        );
                      })}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="employmentDate" className="text-sm font-semibold text-black">Employment Date *</Label>
                <Input
                  id="employmentDate"
                  type="date"
                  {...form.register('employmentDate')}
                  className={`h-10 text-black text-sm ${form.formState.errors.employmentDate ? 'border-red-500' : ''}`}
                />
                {form.formState.errors.employmentDate && (
                  <p className="text-xs text-red-500 text-black">{form.formState.errors.employmentDate.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="status" className="text-sm font-semibold text-black">Status</Label>
                <Select
                  value={form.watch('status') || 'active'}
                  onValueChange={(value) => form.setValue('status', value as any)}
                >
                  <SelectTrigger className="h-10 text-black bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 text-sm">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    {statuses
                      .filter(status => {
                        const val = String(status?.value || '').trim();
                        return val !== '';
                      })
                      .map((status) => {
                        const val = String(status.value).trim();
                        return (
                          <SelectItem key={val} value={val} className="text-black hover:bg-blue-50 focus:bg-blue-500 focus:text-white">
                            {status.label}
                          </SelectItem>
                        );
                      })}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="clearanceLevel" className="text-sm font-semibold text-black">Clearance Level</Label>
              <Select
                value={form.watch('clearanceLevel') || 'confidential'}
                onValueChange={(value) => form.setValue('clearanceLevel', value as any)}
              >
                <SelectTrigger className="h-10 text-black bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 text-sm">
                  <SelectValue placeholder="Select clearance level" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  {clearanceLevels
                    .filter(level => {
                      const val = String(level?.value || '').trim();
                      return val !== '';
                    })
                    .map((level) => {
                      const val = String(level.value).trim();
                      return (
                        <SelectItem key={val} value={val} className="text-black hover:bg-blue-50 focus:bg-blue-500 focus:text-white">
                          {level.label}
                        </SelectItem>
                      );
                    })}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="height" className="text-black">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  {...form.register('physicalDescription.height', { valueAsNumber: true })}
                  placeholder="Enter height"
                  className="h-10 text-black text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="weight" className="text-black">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  {...form.register('physicalDescription.weight', { valueAsNumber: true })}
                  placeholder="Enter weight"
                  className="h-10 text-black text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="eyeColor" className="text-black">Eye Color</Label>
                <Select
                  value={form.watch('physicalDescription.eyeColor') || 'none'}
                  onValueChange={(value) => form.setValue('physicalDescription.eyeColor', value === 'none' ? '' : value)}
                >
                  <SelectTrigger className="h-10 text-black bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 text-sm">
                    <SelectValue placeholder="Select eye color" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    <SelectItem value="none" className="text-black hover:bg-blue-50 focus:bg-blue-500 focus:text-white">None</SelectItem>
                    {eyeColors
                      .filter(color => {
                        const val = String(color?.value || '').trim();
                        return val !== '' && val !== 'none';
                      })
                      .map((color) => {
                        const val = String(color.value).trim();
                        return (
                          <SelectItem key={val} value={val} className="text-black hover:bg-blue-50 focus:bg-blue-500 focus:text-white">
                            {color.label}
                          </SelectItem>
                        );
                      })}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="hairColor" className="text-black">Hair Color</Label>
                <Select
                  value={form.watch('physicalDescription.hairColor') || 'none'}
                  onValueChange={(value) => form.setValue('physicalDescription.hairColor', value === 'none' ? '' : value)}
                >
                  <SelectTrigger className="h-10 text-black bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 text-sm">
                    <SelectValue placeholder="Select hair color" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    <SelectItem value="none" className="text-black hover:bg-blue-50 focus:bg-blue-500 focus:text-white">None</SelectItem>
                    {hairColors
                      .filter(color => {
                        const val = String(color?.value || '').trim();
                        return val !== '' && val !== 'none';
                      })
                      .map((color) => {
                        const val = String(color.value).trim();
                        return (
                          <SelectItem key={val} value={val} className="text-black hover:bg-blue-50 focus:bg-blue-500 focus:text-white">
                            {color.label}
                          </SelectItem>
                        );
                      })}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="distinguishingMarks" className="text-black">Distinguishing Marks</Label>
              <textarea
                id="distinguishingMarks"
                {...form.register('physicalDescription.distinguishingMarks')}
                placeholder="Enter distinguishing marks"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-20 text-black text-sm"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
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
            </div>
            <div className="border-t pt-4">
              <h4 className="font-semibold text-black mb-3">Emergency Contact</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="emergencyName" className="text-black">Name</Label>
                  <Input
                    id="emergencyName"
                    {...form.register('contactInfo.emergencyContact.name')}
                    placeholder="Enter emergency contact name"
                    className="h-10 text-black text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="emergencyRelationship" className="text-black">Relationship</Label>
                  <Input
                    id="emergencyRelationship"
                    {...form.register('contactInfo.emergencyContact.relationship')}
                    placeholder="Enter relationship"
                    className="h-10 text-black text-sm"
                  />
                </div>
                <div className="space-y-1 lg:col-span-2">
                  <Label htmlFor="emergencyPhone" className="text-black">Phone</Label>
                  <Input
                    id="emergencyPhone"
                    {...form.register('contactInfo.emergencyContact.phone')}
                    placeholder="Enter emergency contact phone"
                    className="h-10 text-black text-sm"
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
            <h3 className="text-lg font-bold text-black mb-2">Review Agent Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-gray-50 border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-black">Pseudonym Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-black">
                  <p><strong className="text-black">Name:</strong> <span className="text-black">{form.watch('pseudonym.firstName')} {form.watch('pseudonym.lastName')}</span></p>
                  {form.watch('pseudonym.codeName') && (
                    <p><strong className="text-black">Code Name:</strong> <span className="text-black">{form.watch('pseudonym.codeName')}</span></p>
                  )}
                  <p><strong className="text-black">Department:</strong> <span className="text-black">{departments.find(d => d._id === form.watch('department'))?.name || 'N/A'}</span></p>
                </CardContent>
              </Card>
              <Card className="bg-gray-50 border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-black">Agent Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-black">
                  <p><strong className="text-black">Rank:</strong> <span className="text-black">{ranks.find(r => r.value === form.watch('rank'))?.label || 'N/A'}</span></p>
                  <p><strong className="text-black">Specialization:</strong> <span className="text-black">{specializations.find(s => s.value === form.watch('specialization'))?.label || 'N/A'}</span></p>
                  <p><strong className="text-black">Employment Date:</strong> <span className="text-black">{form.watch('employmentDate') || 'N/A'}</span></p>
                  <p><strong className="text-black">Status:</strong> <span className="text-black">{statuses.find(s => s.value === form.watch('status'))?.label || 'N/A'}</span></p>
                </CardContent>
              </Card>
            </div>
            <Card className="bg-gray-50 border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-black">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-black">
                <p><strong className="text-black">Phone:</strong> <span className="text-black">{form.watch('contactInfo.phone') || 'N/A'}</span></p>
                <p><strong className="text-black">Email:</strong> <span className="text-black">{form.watch('contactInfo.email') || 'N/A'}</span></p>
                {form.watch('contactInfo.emergencyContact.name') && (
                  <p><strong className="text-black">Emergency Contact:</strong> <span className="text-black">{form.watch('contactInfo.emergencyContact.name')} ({form.watch('contactInfo.emergencyContact.relationship')}) - {form.watch('contactInfo.emergencyContact.phone')}</span></p>
                )}
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
                  <UserCheck className="w-4 h-4 text-white" />
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
                <h1 className="text-2xl font-bold text-white">EDIT AGENT</h1>
              </div>
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3">
                <CardTitle className="flex items-center space-x-2 text-white text-lg mb-1">
                  {steps[currentStep].icon}
                  <span className="text-white">{steps[currentStep].title}</span>
                </CardTitle>
                <p className="text-sm text-blue-100">{steps[currentStep].description}</p>
              </CardHeader>
              <CardContent className="p-4">
                {/* Loading State */}
                {isLoadingAgent && (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    <span className="ml-3 text-gray-600">Loading agent data...</span>
                  </div>
                )}

                {/* Error Display */}
                {error && !isLoadingAgent && (
                  <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800 text-black">{error}</p>
                  </div>
                )}

                {/* Step Content */}
                {!isLoadingAgent && (
                  <div className="mb-4 text-black">
                    {renderStepContent()}
                  </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between pt-4 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={currentStep === 0 ? () => navigate('/agents') : handlePrevious}
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
                    <span className="text-white">{currentStep === steps.length - 1 ? 'Update Agent' : 'Next'}</span>
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

export default EditAgentPage;
