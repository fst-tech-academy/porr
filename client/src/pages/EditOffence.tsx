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
import { AlertTriangle, Scale, Shield, CheckCircle, ArrowLeft, ArrowRight, X, Loader2 } from 'lucide-react';
import api from '../services/api';

const offenceSchema = yup.object({
  name: yup.string().required('Offence name is required'),
  description: yup.string().required('Description is required'),
  code: yup.string().required('Offence code is required'),
  category: yup.string().required('Category is required'),
  severity: yup.string().required('Severity is required'),
  legalDefinition: yup.string().required('Legal definition is required'),
  penalties: yup.object({
    minimumSentence: yup.string().optional(),
    maximumSentence: yup.string().optional(),
    fineRange: yup.object({
      minimum: yup.number().optional(),
      maximum: yup.number().optional(),
    }).optional(),
  }).optional(),
  riskLevel: yup.string().oneOf(['low', 'medium', 'high', 'critical']).required('Risk level is required'),
  riskFactors: yup.object({
    violenceRisk: yup.string().oneOf(['low', 'medium', 'high']).required('Violence risk is required'),
    recidivismRisk: yup.string().oneOf(['low', 'medium', 'high']).required('Recidivism risk is required'),
    publicSafetyRisk: yup.string().oneOf(['low', 'medium', 'high']).required('Public safety risk is required'),
  }).required(),
  notes: yup.string().notRequired().default(''),
});

type OffenceFormData = yup.InferType<typeof offenceSchema>;

const EditOffencePage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingOffence, setIsLoadingOffence] = useState(true);
  const [error, setError] = useState<string>('');

  const steps = [
    {
      id: 'basic',
      title: 'Basic Info',
      description: 'Basic offence information',
      icon: <AlertTriangle className="h-4 w-4" />
    },
    {
      id: 'legal',
      title: 'Legal Definition',
      description: 'Legal details and penalties',
      icon: <Scale className="h-4 w-4" />
    },
    {
      id: 'risk',
      title: 'Risk Assessment',
      description: 'Risk factors and assessment',
      icon: <Shield className="h-4 w-4" />
    },
    {
      id: 'review',
      title: 'Review',
      description: 'Confirm details',
      icon: <CheckCircle className="h-4 w-4" />
    }
  ];

  const form = useForm<OffenceFormData>({
    resolver: yupResolver(offenceSchema) as any,
    defaultValues: {
      name: '',
      description: '',
      code: '',
      category: 'property_crime',
      severity: 'moderate',
      legalDefinition: '',
      riskLevel: 'low',
      penalties: {
        minimumSentence: '',
        maximumSentence: '',
        fineRange: {
          minimum: undefined,
          maximum: undefined
        }
      },
      riskFactors: {
        violenceRisk: 'low',
        recidivismRisk: 'low',
        publicSafetyRisk: 'low'
      },
      notes: ''
    },
  });

  useEffect(() => {
    const fetchOffence = async () => {
      if (!id) return;
      
      try {
        setIsLoadingOffence(true);
        const response = await api.getOffenceCatalogue(id);
        
        if (response.success && response.data) {
          // The API returns: { success: true, data: { offenceCatalogue: ... } }
          const offence = response.data.offenceCatalogue;
          
          // Helper function to compute riskLevel from risk factors
          const computeRiskLevel = (riskFactors: any): string => {
            if (!riskFactors) return 'low';
            const risks = [riskFactors.violenceRisk, riskFactors.recidivismRisk, riskFactors.publicSafetyRisk];
            if (risks.includes('high')) return 'high';
            if (risks.includes('medium')) return 'medium';
            return 'low';
          };
          
          // Map API response to form data
          form.reset({
            name: offence.name || '',
            description: offence.description || '',
            code: offence.code || '',
            category: offence.category || 'property_crime',
            severity: offence.severity || 'moderate',
            legalDefinition: offence.legalDefinition || '',
            riskLevel: offence.riskLevel || computeRiskLevel(offence.riskFactors),
            penalties: {
              minimumSentence: offence.penalties?.minimumSentence || '',
              maximumSentence: offence.penalties?.maximumSentence || '',
              fineRange: {
                minimum: offence.penalties?.fineRange?.minimum,
                maximum: offence.penalties?.fineRange?.maximum
              }
            },
            riskFactors: {
              violenceRisk: offence.riskFactors?.violenceRisk || 'low',
              recidivismRisk: offence.riskFactors?.recidivismRisk || 'low',
              publicSafetyRisk: offence.riskFactors?.publicSafetyRisk || 'low'
            },
            notes: offence.notes || ''
          });
        } else {
          setError('Failed to load offence data');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load offence data');
      } finally {
        setIsLoadingOffence(false);
      }
    };

    fetchOffence();
  }, [id, form]);

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
      
      if (!id) {
        setError('Offence ID is missing');
        return;
      }
      
      const formData = form.getValues();
      
      // Ensure riskLevel is set (compute from risk factors if not explicitly set)
      if (!formData.riskLevel) {
        const risks = [
          formData.riskFactors.violenceRisk,
          formData.riskFactors.recidivismRisk,
          formData.riskFactors.publicSafetyRisk
        ];
        if (risks.includes('high')) {
          formData.riskLevel = 'high';
        } else if (risks.includes('medium')) {
          formData.riskLevel = 'medium';
        } else {
          formData.riskLevel = 'low';
        }
      }
      
      const response = await api.updateOffenceCatalogue(id, formData);
      
      if (response.success) {
        navigate('/offences');
      } else {
        setError(response.message || 'Failed to update offence');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update offence');
    } finally {
      setIsLoading(false);
    }
  };

  const categories = [
    { value: 'violent_crime', label: 'Violent Crime' },
    { value: 'property_crime', label: 'Property Crime' },
    { value: 'drug_crime', label: 'Drug Crime' },
    { value: 'white_collar_crime', label: 'White Collar Crime' },
    { value: 'cyber_crime', label: 'Cyber Crime' },
    { value: 'traffic_violation', label: 'Traffic Violation' },
    { value: 'public_order', label: 'Public Order' },
    { value: 'sexual_crime', label: 'Sexual Crime' },
    { value: 'terrorism', label: 'Terrorism' },
    { value: 'other', label: 'Other' }
  ];

  const severities = [
    { value: 'minor', label: 'Minor' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'serious', label: 'Serious' },
    { value: 'major', label: 'Major' },
    { value: 'severe', label: 'Severe' },
    { value: 'felony', label: 'Felony' }
  ];

  const riskLevels = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' }
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold text-black">Offence Name *</Label>
                <Input
                  id="name"
                  {...form.register('name')}
                  placeholder="Enter offence name"
                  className={`h-12 text-black border-2 border-gray-300 bg-white ${form.formState.errors.name ? 'border-red-500' : ''}`}
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-500 text-black">{form.formState.errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="code" className="text-sm font-semibold text-black">Offence Code *</Label>
                <Input
                  id="code"
                  {...form.register('code')}
                  placeholder="Enter offence code"
                  className={`h-12 text-black border-2 border-gray-300 bg-white ${form.formState.errors.code ? 'border-red-500' : ''}`}
                />
                {form.formState.errors.code && (
                  <p className="text-sm text-red-500 text-black">{form.formState.errors.code.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-semibold text-black">Description *</Label>
              <textarea
                id="description"
                {...form.register('description')}
                placeholder="Enter offence description"
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 text-black bg-white"
              />
              {form.formState.errors.description && (
                <p className="text-sm text-red-500 text-black">{form.formState.errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-semibold text-black">Category *</Label>
                <Select
                  value={form.watch('category')}
                  onValueChange={(value) => form.setValue('category', value)}
                >
                  <SelectTrigger className="h-12 text-black bg-white border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-2 border-gray-300">
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value} className="text-black hover:bg-blue-100 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="severity" className="text-sm font-semibold text-black">Severity *</Label>
                <Select
                  value={form.watch('severity')}
                  onValueChange={(value) => form.setValue('severity', value)}
                >
                  <SelectTrigger className="h-12 text-black bg-white border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-2 border-gray-300">
                    {severities.map((severity) => (
                      <SelectItem key={severity.value} value={severity.value} className="text-black hover:bg-blue-100 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">
                        {severity.label}
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
            <div className="space-y-2">
              <Label htmlFor="legalDefinition" className="text-sm font-semibold text-black">Legal Definition *</Label>
              <textarea
                id="legalDefinition"
                {...form.register('legalDefinition')}
                placeholder="Enter legal definition"
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32 text-black bg-white"
              />
              {form.formState.errors.legalDefinition && (
                <p className="text-sm text-red-500 text-black">{form.formState.errors.legalDefinition.message}</p>
              )}
            </div>

            <div className="space-y-6">
              <h4 className="font-semibold text-black text-lg">Penalties</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="minimumSentence" className="text-black">Minimum Sentence</Label>
                  <Input
                    id="minimumSentence"
                    {...form.register('penalties.minimumSentence')}
                    placeholder="e.g., 6 months"
                    className="h-12 text-black border-2 border-gray-300 bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maximumSentence" className="text-black">Maximum Sentence</Label>
                  <Input
                    id="maximumSentence"
                    {...form.register('penalties.maximumSentence')}
                    placeholder="e.g., 5 years"
                    className="h-12 text-black border-2 border-gray-300 bg-white"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="minimumFine" className="text-black">Minimum Fine</Label>
                  <Input
                    id="minimumFine"
                    type="number"
                    {...form.register('penalties.fineRange.minimum', { valueAsNumber: true })}
                    placeholder="Enter minimum fine amount"
                    className="h-12 text-black border-2 border-gray-300 bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maximumFine" className="text-black">Maximum Fine</Label>
                  <Input
                    id="maximumFine"
                    type="number"
                    {...form.register('penalties.fineRange.maximum', { valueAsNumber: true })}
                    placeholder="Enter maximum fine amount"
                    className="h-12 text-black border-2 border-gray-300 bg-white"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            <div className="space-y-6">
              <h4 className="font-semibold text-black text-lg">Risk Assessment</h4>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="violenceRisk" className="text-sm font-semibold text-black">Violence Risk *</Label>
                  <Select
                    value={form.watch('riskFactors.violenceRisk')}
                    onValueChange={(value) => form.setValue('riskFactors.violenceRisk', value as any)}
                  >
                    <SelectTrigger className="h-12 text-black bg-white border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                      <SelectValue placeholder="Select violence risk" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-2 border-gray-300">
                      {riskLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value} className="text-black hover:bg-blue-100 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="recidivismRisk" className="text-sm font-semibold text-black">Recidivism Risk *</Label>
                  <Select
                    value={form.watch('riskFactors.recidivismRisk')}
                    onValueChange={(value) => form.setValue('riskFactors.recidivismRisk', value as any)}
                  >
                    <SelectTrigger className="h-12 text-black bg-white border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                      <SelectValue placeholder="Select recidivism risk" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-2 border-gray-300">
                      {riskLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value} className="text-black hover:bg-blue-100 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="publicSafetyRisk" className="text-sm font-semibold text-black">Public Safety Risk *</Label>
                  <Select
                    value={form.watch('riskFactors.publicSafetyRisk')}
                    onValueChange={(value) => form.setValue('riskFactors.publicSafetyRisk', value as any)}
                  >
                    <SelectTrigger className="h-12 text-black bg-white border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                      <SelectValue placeholder="Select public safety risk" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-2 border-gray-300">
                      {riskLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value} className="text-black hover:bg-blue-100 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="riskLevel" className="text-sm font-semibold text-black">Overall Risk Level *</Label>
                <Select
                  value={form.watch('riskLevel')}
                  onValueChange={(value) => form.setValue('riskLevel', value as 'low' | 'medium' | 'high' | 'critical')}
                >
                  <SelectTrigger className="h-12 text-black bg-white border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                    <SelectValue placeholder="Select overall risk level" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-2 border-gray-300">
                    {riskLevels.map((level) => (
                      <SelectItem key={level.value} value={level.value} className="text-black hover:bg-blue-100 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.riskLevel && (
                  <p className="text-sm text-red-500 text-black">{form.formState.errors.riskLevel.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-black">Additional Notes</Label>
              <textarea
                id="notes"
                {...form.register('notes')}
                placeholder="Enter any additional notes"
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 text-black bg-white"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-black mb-4">Review Offence Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gray-50 border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-black">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-black">
                  <p><strong className="text-black">Name:</strong> <span className="text-black">{form.watch('name')}</span></p>
                  <p><strong className="text-black">Code:</strong> <span className="text-black">{form.watch('code')}</span></p>
                  <p><strong className="text-black">Category:</strong> <span className="text-black">{form.watch('category')}</span></p>
                  <p><strong className="text-black">Severity:</strong> <span className="text-black">{form.watch('severity')}</span></p>
                  <p><strong className="text-black">Description:</strong> <span className="text-black">{form.watch('description')}</span></p>
                </CardContent>
              </Card>
              <Card className="bg-gray-50 border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-black">Legal & Penalties</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-black">
                  <p><strong className="text-black">Legal Definition:</strong> <span className="text-black">{form.watch('legalDefinition')}</span></p>
                  <p><strong className="text-black">Min Sentence:</strong> <span className="text-black">{form.watch('penalties.minimumSentence') || 'N/A'}</span></p>
                  <p><strong className="text-black">Max Sentence:</strong> <span className="text-black">{form.watch('penalties.maximumSentence') || 'N/A'}</span></p>
                  <p><strong className="text-black">Min Fine:</strong> <span className="text-black">{form.watch('penalties.fineRange.minimum') || 'N/A'}</span></p>
                  <p><strong className="text-black">Max Fine:</strong> <span className="text-black">{form.watch('penalties.fineRange.maximum') || 'N/A'}</span></p>
                </CardContent>
              </Card>
            </div>
            <Card className="bg-gray-50 border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-black">Risk Assessment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-black">
                <p><strong className="text-black">Overall Risk Level:</strong> <span className="text-black">{form.watch('riskLevel')}</span></p>
                <p><strong className="text-black">Violence Risk:</strong> <span className="text-black">{form.watch('riskFactors.violenceRisk')}</span></p>
                <p><strong className="text-black">Recidivism Risk:</strong> <span className="text-black">{form.watch('riskFactors.recidivismRisk')}</span></p>
                <p><strong className="text-black">Public Safety Risk:</strong> <span className="text-black">{form.watch('riskFactors.publicSafetyRisk')}</span></p>
                <p><strong className="text-black">Notes:</strong> <span className="text-black">{form.watch('notes') || 'N/A'}</span></p>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  if (isLoadingOffence) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading offence data...</p>
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
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold">Edit Offence</h1>
                  <p className="text-blue-100 text-lg">Update offence information</p>
                </div>
              </div>
              <Button
                variant="ghost"
                onClick={() => navigate('/offences')}
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
                <Scale className="w-4 h-4" />
                <span>Multi-step Edit</span>
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
                  <AlertTriangle className="w-5 h-5 text-blue-600" />
                  <span className="text-black">Edit Progress</span>
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
                <div className="flex justify-between pt-6 border-t-2 border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={currentStep === 0 ? () => navigate('/offences') : handlePrevious}
                    disabled={isLoading}
                    className="flex items-center space-x-2 px-6 py-3 border-2 hover:bg-gray-50 text-black"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span className="text-black">{currentStep === 0 ? 'Cancel' : 'Previous'}</span>
                  </Button>

                  <Button
                    type="button"
                    onClick={currentStep === steps.length - 1 ? handleSubmit : handleNext}
                    disabled={isLoading}
                    className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 shadow-lg"
                  >
                    <span className="text-white">{currentStep === steps.length - 1 ? 'Update Offence' : 'Next'}</span>
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

export default EditOffencePage;

