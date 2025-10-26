import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { AlertCircle, ArrowLeft, Save } from 'lucide-react';
import { OffenderFormData } from '../types';
import { api } from '../services/api';

const CreateOffenderPage: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<OffenderFormData>({
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
  });

  const handleInputChange = (section: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof OffenderFormData],
        [field]: value
      }
    }));
  };

  const handleNestedInputChange = (section: string, subsection: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof OffenderFormData],
        [subsection]: {
          ...(prev[section as keyof OffenderFormData] as any)?.[subsection],
          [field]: value
        }
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/offenders', formData);
      
      if (response.data.success) {
        navigate('/offenders');
      } else {
        setError(response.data.message || 'Failed to create offender');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create offender');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate('/offenders')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Offenders
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Offender</h1>
          <p className="text-gray-600 mt-1">Add a new offender to the registry</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <Input
                  value={formData.personalInfo.firstName}
                  onChange={(e) => handleInputChange('personalInfo', 'firstName', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Middle Name
                </label>
                <Input
                  value={formData.personalInfo.middleName}
                  onChange={(e) => handleInputChange('personalInfo', 'middleName', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <Input
                  value={formData.personalInfo.lastName}
                  onChange={(e) => handleInputChange('personalInfo', 'lastName', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth *
                </label>
                <Input
                  type="date"
                  value={formData.personalInfo.dateOfBirth}
                  onChange={(e) => handleInputChange('personalInfo', 'dateOfBirth', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender *
                </label>
                <Select value={formData.personalInfo.gender} onValueChange={(value) => handleInputChange('personalInfo', 'gender', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nationality *
                </label>
                <Input
                  value={formData.personalInfo.nationality}
                  onChange={(e) => handleInputChange('personalInfo', 'nationality', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  National ID
                </label>
                <Input
                  value={formData.personalInfo.nationalId}
                  onChange={(e) => handleInputChange('personalInfo', 'nationalId', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Passport Number
                </label>
                <Input
                  value={formData.personalInfo.passportNumber}
                  onChange={(e) => handleInputChange('personalInfo', 'passportNumber', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <Input
                  value={formData.personalInfo.phoneNumber}
                  onChange={(e) => handleInputChange('personalInfo', 'phoneNumber', e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <Input
                type="email"
                value={formData.personalInfo.email}
                onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Physical Description */}
        <Card>
          <CardHeader>
            <CardTitle>Physical Description</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Height (cm)
                </label>
                <Input
                  type="number"
                  value={formData.physicalDescription?.height || ''}
                  onChange={(e) => handleInputChange('physicalDescription', 'height', parseInt(e.target.value) || undefined)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weight (kg)
                </label>
                <Input
                  type="number"
                  value={formData.physicalDescription?.weight || ''}
                  onChange={(e) => handleInputChange('physicalDescription', 'weight', parseInt(e.target.value) || undefined)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Eye Color
                </label>
                <Select value={formData.physicalDescription?.eyeColor || ''} onValueChange={(value) => handleInputChange('physicalDescription', 'eyeColor', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select eye color" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="brown">Brown</SelectItem>
                    <SelectItem value="blue">Blue</SelectItem>
                    <SelectItem value="green">Green</SelectItem>
                    <SelectItem value="hazel">Hazel</SelectItem>
                    <SelectItem value="gray">Gray</SelectItem>
                    <SelectItem value="amber">Amber</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hair Color
                </label>
                <Select value={formData.physicalDescription?.hairColor || ''} onValueChange={(value) => handleInputChange('physicalDescription', 'hairColor', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select hair color" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="black">Black</SelectItem>
                    <SelectItem value="brown">Brown</SelectItem>
                    <SelectItem value="blonde">Blonde</SelectItem>
                    <SelectItem value="red">Red</SelectItem>
                    <SelectItem value="gray">Gray</SelectItem>
                    <SelectItem value="white">White</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Skin Tone
                </label>
                <Select value={formData.physicalDescription?.skinTone || ''} onValueChange={(value) => handleInputChange('physicalDescription', 'skinTone', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select skin tone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="very dark">Very Dark</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Distinguishing Marks
              </label>
              <Input
                value={formData.physicalDescription?.distinguishingMarks || ''}
                onChange={(e) => handleInputChange('physicalDescription', 'distinguishingMarks', e.target.value)}
                placeholder="Scars, tattoos, birthmarks, etc."
              />
            </div>
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card>
          <CardHeader>
            <CardTitle>Address Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="text-lg font-medium mb-3">Current Address</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street
                  </label>
                  <Input
                    value={formData.address?.current?.street || ''}
                    onChange={(e) => handleNestedInputChange('address', 'current', 'street', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <Input
                    value={formData.address?.current?.city || ''}
                    onChange={(e) => handleNestedInputChange('address', 'current', 'city', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <Input
                    value={formData.address?.current?.state || ''}
                    onChange={(e) => handleNestedInputChange('address', 'current', 'state', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Postal Code
                  </label>
                  <Input
                    value={formData.address?.current?.postalCode || ''}
                    onChange={(e) => handleNestedInputChange('address', 'current', 'postalCode', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-medium mb-3">Permanent Address</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street
                  </label>
                  <Input
                    value={formData.address?.permanent?.street || ''}
                    onChange={(e) => handleNestedInputChange('address', 'permanent', 'street', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <Input
                    value={formData.address?.permanent?.city || ''}
                    onChange={(e) => handleNestedInputChange('address', 'permanent', 'city', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <Input
                    value={formData.address?.permanent?.state || ''}
                    onChange={(e) => handleNestedInputChange('address', 'permanent', 'state', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Postal Code
                  </label>
                  <Input
                    value={formData.address?.permanent?.postalCode || ''}
                    onChange={(e) => handleNestedInputChange('address', 'permanent', 'postalCode', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Risk Assessment */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Assessment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Risk Level *
              </label>
              <Select value={formData.riskAssessment.level} onValueChange={(value) => handleInputChange('riskAssessment', 'level', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Risk Assessment Notes
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                value={formData.riskAssessment.notes || ''}
                onChange={(e) => handleInputChange('riskAssessment', 'notes', e.target.value)}
                placeholder="Additional notes about risk factors..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Custody Status
                </label>
                <Select value={formData.status?.isInCustody ? 'in_custody' : 'released'} onValueChange={(value) => handleInputChange('status', 'isInCustody', value === 'in_custody')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="released">Released</SelectItem>
                    <SelectItem value="in_custody">In Custody</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Custody Location
                </label>
                <Input
                  value={formData.status?.custodyLocation || ''}
                  onChange={(e) => handleInputChange('status', 'custodyLocation', e.target.value)}
                  placeholder="Prison, detention center, etc."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              value={formData.notes || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any additional information about this offender..."
            />
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/offenders')}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            {loading ? 'Creating...' : 'Create Offender'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateOffenderPage;
