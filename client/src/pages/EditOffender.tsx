import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import Stepper from '../components/ui/stepper';
import ImageUpload from '../components/ImageUpload';
import SignedImage from '../components/SignedImage';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { ArrowLeft, ArrowRight, CheckCircle, X, User, Camera, Save } from 'lucide-react';
import apiService from '../services/api';
import { Offender, OffenderFormData } from '../types';

const EditOffenderPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingOffender, setIsLoadingOffender] = useState(true);
  const [error, setError] = useState<string>('');
  const [profilePhoto, setProfilePhoto] = useState<string>('');

  const steps = [
    {
      id: 'personal',
      title: 'Personal Information',
      description: 'Basic personal details and identification'
    },
    {
      id: 'physical',
      title: 'Physical Description',
      description: 'Physical characteristics and appearance'
    },
    {
      id: 'family',
      title: 'Family Information',
      description: 'Family background and relationships'
    },
    {
      id: 'criminal',
      title: 'Criminal History',
      description: 'Previous offences and criminal record'
    },
  ];

  const validationSchema = yup.object({
    personalInfo: yup.object({
      firstName: yup.string().required('First name is required'),
      lastName: yup.string().required('Last name is required'),
      dateOfBirth: yup.string().required('Date of birth is required'),
      gender: yup.string().required('Gender is required'),
      nationalId: yup.string().required('National ID is required'),
      placeOfBirth: yup.string().required('Place of birth is required'),
      nationality: yup.string().required('Nationality is required')
    }),
    physicalDescription: yup.object({
      height: yup.number().min(30, 'Height must be at least 30 cm').max(250, 'Height must be at most 250 cm'),
      weight: yup.number().min(20, 'Weight must be at least 20 kg').max(200, 'Weight must be at most 200 kg'),
      eyeColor: yup.string().required('Eye color is required'),
      hairColor: yup.string().required('Hair color is required'),
      skinTone: yup.string().required('Skin tone is required'),
      distinguishingMarks: yup.string()
    }),
    familyInfo: yup.object({
      maritalStatus: yup.string().required('Marital status is required'),
      spouseName: yup.string(),
      children: yup.array().of(yup.object({
        name: yup.string(),
        age: yup.number(),
        relationship: yup.string()
      })),
      parents: yup.object({
        fatherName: yup.string(),
        motherName: yup.string()
      }),
      siblings: yup.array().of(yup.object({
        name: yup.string(),
        age: yup.number(),
        relationship: yup.string()
      }))
    }),
    criminalHistory: yup.object({}),
    status: yup.object({
      isActive: yup.boolean(),
      isInCustody: yup.boolean(),
      riskLevel: yup.string().required('Risk level is required'),
      lastSeen: yup.string(),
      notes: yup.string()
    })
  });

  const form = useForm<OffenderFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      personalInfo: {
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        gender: '',
        nationalId: '',
        placeOfBirth: '',
        nationality: ''
      },
      physicalDescription: {
        height: 0,
        weight: 0,
        eyeColor: '',
        hairColor: '',
        skinTone: '',
        distinguishingMarks: ''
      },
      familyInfo: {
        maritalStatus: 'single',
        spouseName: '',
        children: [],
        parents: {
          fatherName: '',
          motherName: ''
        },
        siblings: []
      },
      criminalHistory: {},
      status: {
        isActive: true,
        isInCustody: false,
        riskLevel: 'low',
        lastSeen: '',
        notes: ''
      }
    }
  });

  useEffect(() => {
    const fetchOffender = async () => {
      if (!id) return;
      
      try {
        setIsLoadingOffender(true);
        const response = await apiService.getOffender(id);
        const offender = response.data.offender;
        
        console.log('Fetched offender data:', offender);
        
        // Helper function to format date for HTML date input
        const formatDateForInput = (date: any) => {
          if (!date) return '';
          const dateObj = new Date(date);
          if (isNaN(dateObj.getTime())) return '';
          return dateObj.toISOString().split('T')[0];
        };

        // Populate form with existing data - handle both direct properties and nested structure
        const formData = {
          personalInfo: {
            firstName: offender.firstName || offender.personalInfo?.firstName || '',
            lastName: offender.lastName || offender.personalInfo?.lastName || '',
            dateOfBirth: formatDateForInput(offender.dateOfBirth || offender.personalInfo?.dateOfBirth),
            gender: offender.gender || offender.personalInfo?.gender || '',
            nationalId: offender.nationalId || offender.personalInfo?.nationalId || '',
            placeOfBirth: offender.placeOfBirth || offender.personalInfo?.placeOfBirth || '',
            nationality: offender.nationality || offender.personalInfo?.nationality || ''
          },
          physicalDescription: {
            height: offender.height || offender.physicalDescription?.height || 0,
            weight: offender.weight || offender.physicalDescription?.weight || 0,
            eyeColor: offender.eyeColor || offender.physicalDescription?.eyeColor || '',
            hairColor: offender.hairColor || offender.physicalDescription?.hairColor || '',
            skinTone: offender.skinTone || offender.physicalDescription?.skinTone || '',
            distinguishingMarks: offender.distinguishingMarks || offender.physicalDescription?.distinguishingMarks || ''
          },
          familyInfo: {
            maritalStatus: offender.maritalStatus || offender.familyInfo?.maritalStatus || 'single',
            spouseName: offender.spouseName || offender.familyInfo?.spouseName || '',
            children: offender.children || offender.familyInfo?.children || [],
            parents: {
              fatherName: offender.fatherName || offender.familyInfo?.parents?.fatherName || '',
              motherName: offender.motherName || offender.familyInfo?.parents?.motherName || ''
            },
            siblings: offender.siblings || offender.familyInfo?.siblings || []
          },
          criminalHistory: {
            totalOffences: offender.totalOffences || offender.criminalHistory?.totalOffences || 0,
            firstOffenceDate: formatDateForInput(offender.firstOffenceDate || offender.criminalHistory?.firstOffenceDate),
            lastOffenceDate: formatDateForInput(offender.lastOffenceDate || offender.criminalHistory?.lastOffenceDate),
            offences: offender.offences || offender.criminalHistory?.offences || []
          },
          status: {
            isActive: offender.isActive !== undefined ? offender.isActive : (offender.status?.isActive !== undefined ? offender.status.isActive : true),
            isInCustody: offender.isInCustody !== undefined ? offender.isInCustody : (offender.status?.isInCustody !== undefined ? offender.status.isInCustody : false),
            riskLevel: offender.riskLevel || offender.status?.riskLevel || 'low',
            lastSeen: formatDateForInput(offender.lastSeen || offender.status?.lastSeen),
            notes: offender.notes || offender.status?.notes || ''
          }
        };
        
        console.log('Form data to populate:', formData);
        
        // Reset form with the prepared data
        form.reset(formData);
        
        // Set profile photo
        setProfilePhoto(offender.profilePhoto || '');
        
      } catch (err: any) {
        console.error('Error fetching offender:', err);
        setError('Failed to load offender data');
      } finally {
        setIsLoadingOffender(false);
      }
    };

    fetchOffender();
  }, [id, form]);

  const handleStepClick = (stepIndex: number) => {
    if (stepIndex < currentStep) {
      setCurrentStep(stepIndex);
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


  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const handleSubmit = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      setError('');
      
      const data = form.getValues();
      
      // Add profile photo to the data
      const offenderData = {
        ...data,
        profilePhoto: profilePhoto || undefined
      };
      
      await apiService.updateOffender(id, offenderData);
      navigate(`/offenders/${id}`);
      
    } catch (err: any) {
      console.error('Error updating offender:', err);
      setError(err.response?.data?.message || 'Failed to update offender');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">First Name *</label>
                <Input
                  {...form.register('personalInfo.firstName')}
                  className="w-full border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-black dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
                {form.formState.errors.personalInfo?.firstName && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.personalInfo.firstName.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Last Name *</label>
                <Input
                  {...form.register('personalInfo.lastName')}
                  className="w-full border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-black dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
                {form.formState.errors.personalInfo?.lastName && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.personalInfo.lastName.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date of Birth *</label>
                <Input
                  type="date"
                  {...form.register('personalInfo.dateOfBirth')}
                  className="w-full border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-black dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
                {form.formState.errors.personalInfo?.dateOfBirth && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.personalInfo.dateOfBirth.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Gender *</label>
                <Select value={form.watch('personalInfo.gender')} onValueChange={(value) => form.setValue('personalInfo.gender', value)}>
                  <SelectTrigger className="w-full border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-black dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-700 border-2 border-gray-300 dark:border-gray-600">
                    <SelectItem value="male" className="text-black dark:text-white hover:bg-blue-100 dark:hover:bg-blue-900 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">Male</SelectItem>
                    <SelectItem value="female" className="text-black dark:text-white hover:bg-blue-100 dark:hover:bg-blue-900 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">Female</SelectItem>
                    <SelectItem value="other" className="text-black dark:text-white hover:bg-blue-100 dark:hover:bg-blue-900 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">Other</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.personalInfo?.gender && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.personalInfo.gender.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">National ID *</label>
                <Input
                  {...form.register('personalInfo.nationalId')}
                  className="w-full border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-black dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
                {form.formState.errors.personalInfo?.nationalId && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.personalInfo.nationalId.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Place of Birth *</label>
                <Input
                  {...form.register('personalInfo.placeOfBirth')}
                  className="w-full border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-black dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
                {form.formState.errors.personalInfo?.placeOfBirth && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.personalInfo.placeOfBirth.message}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nationality *</label>
                <Input
                  {...form.register('personalInfo.nationality')}
                  className="w-full border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-black dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
                {form.formState.errors.personalInfo?.nationality && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.personalInfo.nationality.message}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Height (cm)</label>
                <Input
                  type="number"
                  {...form.register('physicalDescription.height', { valueAsNumber: true })}
                  className="w-full border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-black dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
                {form.formState.errors.physicalDescription?.height && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.physicalDescription.height.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Weight (kg)</label>
                <Input
                  type="number"
                  {...form.register('physicalDescription.weight', { valueAsNumber: true })}
                  className="w-full border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-black dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
                {form.formState.errors.physicalDescription?.weight && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.physicalDescription.weight.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Eye Color *</label>
                <Select value={form.watch('physicalDescription.eyeColor')} onValueChange={(value) => form.setValue('physicalDescription.eyeColor', value)}>
                  <SelectTrigger className="w-full border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-black dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                    <SelectValue placeholder="Select eye color" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-700 border-2 border-gray-300 dark:border-gray-600">
                    <SelectItem value="brown" className="text-black dark:text-white hover:bg-blue-100 dark:hover:bg-blue-900 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">Brown</SelectItem>
                    <SelectItem value="blue" className="text-black dark:text-white hover:bg-blue-100 dark:hover:bg-blue-900 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">Blue</SelectItem>
                    <SelectItem value="green" className="text-black dark:text-white hover:bg-blue-100 dark:hover:bg-blue-900 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">Green</SelectItem>
                    <SelectItem value="hazel" className="text-black dark:text-white hover:bg-blue-100 dark:hover:bg-blue-900 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">Hazel</SelectItem>
                    <SelectItem value="gray" className="text-black dark:text-white hover:bg-blue-100 dark:hover:bg-blue-900 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">Gray</SelectItem>
                    <SelectItem value="amber" className="text-black dark:text-white hover:bg-blue-100 dark:hover:bg-blue-900 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">Amber</SelectItem>
                    <SelectItem value="black" className="text-black dark:text-white hover:bg-blue-100 dark:hover:bg-blue-900 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">Black</SelectItem>
                    <SelectItem value="other" className="text-black dark:text-white hover:bg-blue-100 dark:hover:bg-blue-900 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">Other</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.physicalDescription?.eyeColor && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.physicalDescription.eyeColor.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Hair Color *</label>
                <Select value={form.watch('physicalDescription.hairColor')} onValueChange={(value) => form.setValue('physicalDescription.hairColor', value)}>
                  <SelectTrigger className="w-full border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-black dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                    <SelectValue placeholder="Select hair color" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-700 border-2 border-gray-300 dark:border-gray-600">
                    <SelectItem value="black" className="text-black dark:text-white hover:bg-blue-100 dark:hover:bg-blue-900 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">Black</SelectItem>
                    <SelectItem value="brown" className="text-black dark:text-white hover:bg-blue-100 dark:hover:bg-blue-900 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">Brown</SelectItem>
                    <SelectItem value="blonde" className="text-black dark:text-white hover:bg-blue-100 dark:hover:bg-blue-900 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">Blonde</SelectItem>
                    <SelectItem value="red" className="text-black dark:text-white hover:bg-blue-100 dark:hover:bg-blue-900 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">Red</SelectItem>
                    <SelectItem value="gray" className="text-black dark:text-white hover:bg-blue-100 dark:hover:bg-blue-900 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">Gray</SelectItem>
                    <SelectItem value="white" className="text-black dark:text-white hover:bg-blue-100 dark:hover:bg-blue-900 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">White</SelectItem>
                    <SelectItem value="other" className="text-black dark:text-white hover:bg-blue-100 dark:hover:bg-blue-900 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">Other</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.physicalDescription?.hairColor && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.physicalDescription.hairColor.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Skin Tone *</label>
                <Select value={form.watch('physicalDescription.skinTone')} onValueChange={(value) => form.setValue('physicalDescription.skinTone', value)}>
                  <SelectTrigger className="w-full border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-black dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                    <SelectValue placeholder="Select skin tone" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-700 border-2 border-gray-300 dark:border-gray-600">
                    <SelectItem value="light" className="text-black dark:text-white hover:bg-blue-100 dark:hover:bg-blue-900 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">Light</SelectItem>
                    <SelectItem value="medium" className="text-black dark:text-white hover:bg-blue-100 dark:hover:bg-blue-900 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">Medium</SelectItem>
                    <SelectItem value="dark" className="text-black dark:text-white hover:bg-blue-100 dark:hover:bg-blue-900 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">Dark</SelectItem>
                    <SelectItem value="very dark" className="text-black dark:text-white hover:bg-blue-100 dark:hover:bg-blue-900 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">Very Dark</SelectItem>
                    <SelectItem value="maariin" className="text-black dark:text-white hover:bg-blue-100 dark:hover:bg-blue-900 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">Maariin</SelectItem>
                    <SelectItem value="jecel" className="text-black dark:text-white hover:bg-blue-100 dark:hover:bg-blue-900 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">Jecel</SelectItem>
                    <SelectItem value="other" className="text-black dark:text-white hover:bg-blue-100 dark:hover:bg-blue-900 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">Other</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.physicalDescription?.skinTone && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.physicalDescription.skinTone.message}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Distinguishing Marks</label>
                <Input
                  {...form.register('physicalDescription.distinguishingMarks')}
                  placeholder="Scars, tattoos, birthmarks, etc."
                  className="w-full border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-black dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Marital Status *</label>
                <Select value={form.watch('familyInfo.maritalStatus')} onValueChange={(value) => form.setValue('familyInfo.maritalStatus', value)}>
                  <SelectTrigger className="w-full border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-black dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                    <SelectValue placeholder="Select marital status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-700 border-2 border-gray-300 dark:border-gray-600">
                    <SelectItem value="single" className="text-black dark:text-white hover:bg-blue-100 dark:hover:bg-blue-900 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">Single</SelectItem>
                    <SelectItem value="married" className="text-black dark:text-white hover:bg-blue-100 dark:hover:bg-blue-900 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">Married</SelectItem>
                    <SelectItem value="divorced" className="text-black dark:text-white hover:bg-blue-100 dark:hover:bg-blue-900 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">Divorced</SelectItem>
                    <SelectItem value="widowed" className="text-black dark:text-white hover:bg-blue-100 dark:hover:bg-blue-900 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">Widowed</SelectItem>
                    <SelectItem value="separated" className="text-black dark:text-white hover:bg-blue-100 dark:hover:bg-blue-900 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">Separated</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.familyInfo?.maritalStatus && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.familyInfo.maritalStatus.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Spouse Name</label>
                <Input
                  {...form.register('familyInfo.spouseName')}
                  className="w-full border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-black dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Father's Name</label>
                <Input
                  {...form.register('familyInfo.parents.fatherName')}
                  className="w-full border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-black dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mother's Name</label>
                <Input
                  {...form.register('familyInfo.parents.motherName')}
                  className="w-full border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-black dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Risk Level *</label>
                <Select value={form.watch('status.riskLevel')} onValueChange={(value) => form.setValue('status.riskLevel', value)}>
                  <SelectTrigger className="w-full border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-black dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                    <SelectValue placeholder="Select risk level" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-700 border-2 border-gray-300 dark:border-gray-600">
                    <SelectItem value="low" className="text-black dark:text-white hover:bg-blue-100 dark:hover:bg-blue-900 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">Low</SelectItem>
                    <SelectItem value="medium" className="text-black dark:text-white hover:bg-blue-100 dark:hover:bg-blue-900 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">Medium</SelectItem>
                    <SelectItem value="high" className="text-black dark:text-white hover:bg-blue-100 dark:hover:bg-blue-900 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">High</SelectItem>
                    <SelectItem value="critical" className="text-black dark:text-white hover:bg-blue-100 dark:hover:bg-blue-900 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">Critical</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.status?.riskLevel && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.status.riskLevel.message}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={form.watch('status.isActive')}
                  onCheckedChange={(checked) => form.setValue('status.isActive', checked)}
                />
                <label className="text-sm font-medium text-gray-700">Active</label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={form.watch('status.isInCustody')}
                  onCheckedChange={(checked) => form.setValue('status.isInCustody', checked)}
                />
                <label className="text-sm font-medium text-gray-700">In Custody</label>
              </div>
            </div>
          </div>
        );


      default:
        return null;
    }
  };

  if (isLoadingOffender) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading offender data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Offender</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Update offender information and details
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Stepper */}
          <div className="lg:col-span-1">
            <Card className="bg-white dark:bg-slate-800 shadow-xl border-2 border-blue-100 dark:border-slate-700 sticky top-8">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <CardTitle className="text-xl font-semibold">Edit Offender</CardTitle>
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
            <Card className="bg-white dark:bg-slate-800 shadow-xl border-2 border-blue-100 dark:border-slate-700">
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
                  <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-red-800 dark:text-red-200">{error}</p>
                  </div>
                )}

                <div className="flex justify-between mt-8 pt-6 border-t-2 border-gray-200 dark:border-slate-700">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentStep === 0}
                    className="flex items-center border-2 hover:bg-gray-50"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>

                  <div className="flex space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate(`/offenders/${id}`)}
                      className="flex items-center border-2 hover:bg-gray-50"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>

                    {currentStep === steps.length - 1 ? (
                      <Button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white flex items-center shadow-lg"
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Updating...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Update Offender
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        onClick={handleNext}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white flex items-center shadow-lg"
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

export default EditOffenderPage;
