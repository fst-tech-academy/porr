import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import { Victim } from '../types';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import SignedImage from '../components/SignedImage';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  User, 
  AlertTriangle,
  Edit,
  Trash2,
  Info,
  Home,
  FileText,
  Heart,
  DollarSign,
  Activity,
  Shield,
  Clock,
  ExternalLink
} from 'lucide-react';

const VictimView: React.FC = () => {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedVictim, setSelectedVictim] = useState<Victim | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (id) {
      fetchVictim(id);
    }
  }, [id]);

  const fetchVictim = async (victimId: string) => {
    try {
      setLoading(true);
      const response = await apiService.getVictim(victimId);
      
      if (response.success && response.data) {
        setSelectedVictim(response.data);
      } else {
        setError('Victim not found');
      }
    } catch (err: any) {
      console.error('Error fetching victim:', err);
      setError(err.response?.data?.message || 'Failed to fetch victim details');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getStatusBadge = (victim: Victim) => {
    if (victim.status.isDeceased) {
      return <Badge className="bg-red-100 text-red-800 border-red-200">Deceased</Badge>;
    }
    if (victim.status.isMinor) {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Minor</Badge>;
    }
    if (victim.status.isActive) {
      return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>;
    }
    return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Inactive</Badge>;
  };

  const getAge = (dateOfBirth: Date | string) => {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const getTraumaLevelBadge = (level?: string) => {
    const levelColors: Record<string, string> = {
      none: 'bg-green-100 text-green-800 border-green-200',
      mild: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      moderate: 'bg-orange-100 text-orange-800 border-orange-200',
      severe: 'bg-red-100 text-red-800 border-red-200',
    };
    
    return (
      <Badge className={levelColors[level || 'none'] || 'bg-gray-100 text-gray-800 border-gray-200'}>
        {level ? level.charAt(0).toUpperCase() + level.slice(1) : 'None'}
      </Badge>
    );
  };

  const getSeverityBadge = (severity?: string) => {
    const severityColors: Record<string, string> = {
      minor: 'bg-green-100 text-green-800 border-green-200',
      moderate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      severe: 'bg-orange-100 text-orange-800 border-orange-200',
      critical: 'bg-red-100 text-red-800 border-red-200',
    };
    
    return (
      <Badge className={severityColors[severity || 'minor'] || 'bg-gray-100 text-gray-800 border-gray-200'}>
        {severity ? severity.charAt(0).toUpperCase() + severity.slice(1) : 'N/A'}
      </Badge>
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleDelete = async () => {
    if (!selectedVictim) return;
    
    if (!window.confirm('Are you sure you want to delete this victim record?')) {
      return;
    }

    try {
      await apiService.deleteVictim(selectedVictim._id);
      navigate('/victims');
    } catch (err: any) {
      console.error('Error deleting victim:', err);
      setError(err.response?.data?.message || 'Failed to delete victim');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading victim details...</p>
        </div>
      </div>
    );
  }

  if (error || !selectedVictim) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {error?.includes('not found') ? 'Victim Not Found' : 'Error'}
          </h2>
          <p className="text-gray-600 mb-4">{error || 'Victim not found'}</p>
          <div className="space-y-2">
            <Button onClick={() => navigate('/victims')} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Victims
            </Button>
            <Button onClick={() => window.location.reload()} variant="outline" className="w-full">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const totalFinancialImpact = 
    (selectedVictim.impactAssessment?.financialImpact?.medicalExpenses || 0) +
    (selectedVictim.impactAssessment?.financialImpact?.lostWages || 0) +
    (selectedVictim.impactAssessment?.financialImpact?.propertyDamage || 0) +
    (selectedVictim.impactAssessment?.financialImpact?.otherExpenses || 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-pink-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-6">
              {/* Profile Avatar */}
              <div className="flex-shrink-0">
                <Avatar className="h-24 w-24 border-4 border-pink-200 shadow-lg rounded-lg">
                  <AvatarFallback className="bg-gradient-to-br from-pink-500 to-pink-600 text-white text-3xl rounded-lg font-bold">
                    {getInitials(selectedVictim.personalInfo.firstName, selectedVictim.personalInfo.lastName)}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Basic Info */}
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {selectedVictim.personalInfo.firstName} {selectedVictim.personalInfo.middleName || ''} {selectedVictim.personalInfo.lastName}
                  </h1>
                  {getStatusBadge(selectedVictim)}
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-1.5" />
                    {selectedVictim.personalInfo.gender.charAt(0).toUpperCase() + selectedVictim.personalInfo.gender.slice(1)} • Age {getAge(selectedVictim.personalInfo.dateOfBirth)}
                  </div>
                  {selectedVictim.personalInfo.phoneNumber && (
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-1.5" />
                      {selectedVictim.personalInfo.phoneNumber}
                    </div>
                  )}
                  {selectedVictim.personalInfo.email && (
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-1.5" />
                      {selectedVictim.personalInfo.email}
                    </div>
                  )}
                  {selectedVictim.address?.current?.city && (
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1.5" />
                      {selectedVictim.address.current.city}, {selectedVictim.address.current.state}
                    </div>
                  )}
                </div>
                {selectedVictim.caseInfo.victimId && (
                  <div className="mt-2 text-sm text-gray-500">
                    <span className="font-medium">Victim ID:</span> {selectedVictim.caseInfo.victimId}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => navigate('/victims')}
                className="bg-transparent border-gray-300 hover:bg-gray-50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate(`/victims/${selectedVictim._id}/edit`)}
                className="bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                onClick={handleDelete}
                className="bg-red-50 border-red-300 text-red-700 hover:bg-red-100"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white border border-gray-200 rounded-lg p-1">
            <TabsTrigger value="overview" className="text-xs px-4 py-2">
              Overview
            </TabsTrigger>
            <TabsTrigger value="personal" className="text-xs px-4 py-2">
              Personal Info
            </TabsTrigger>
            <TabsTrigger value="impact" className="text-xs px-4 py-2">
              Impact Assessment
            </TabsTrigger>
            <TabsTrigger value="case" className="text-xs px-4 py-2">
              Case Information
            </TabsTrigger>
            <TabsTrigger value="notes" className="text-xs px-4 py-2">
              Notes
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Personal Information Summary */}
              <Card className="bg-blue-100 border-2 border-blue-200 shadow-md">
                <CardHeader className="pb-2 bg-blue-600">
                  <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-3 space-y-2">
                  <div>
                    <label className="text-xs font-medium text-gray-600">Date of Birth</label>
                    <p className="text-sm text-gray-900">{formatDate(selectedVictim.personalInfo.dateOfBirth)}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">Nationality</label>
                    <p className="text-sm text-gray-900">{selectedVictim.personalInfo.nationality}</p>
                  </div>
                  {selectedVictim.personalInfo.nationalId && (
                    <div>
                      <label className="text-xs font-medium text-gray-600">National ID</label>
                      <p className="text-sm text-gray-900">{selectedVictim.personalInfo.nationalId}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Physical Description */}
              {selectedVictim.physicalDescription && (
                <Card className="bg-purple-100 border-2 border-blue-200 shadow-md">
                  <CardHeader className="pb-2 bg-blue-600">
                    <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      Physical Description
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-3 space-y-2">
                    {selectedVictim.physicalDescription.height && (
                      <div>
                        <label className="text-xs font-medium text-gray-600">Height</label>
                        <p className="text-sm text-gray-900">{selectedVictim.physicalDescription.height} cm</p>
                      </div>
                    )}
                    {selectedVictim.physicalDescription.weight && (
                      <div>
                        <label className="text-xs font-medium text-gray-600">Weight</label>
                        <p className="text-sm text-gray-900">{selectedVictim.physicalDescription.weight} kg</p>
                      </div>
                    )}
                    {selectedVictim.physicalDescription.eyeColor && (
                      <div>
                        <label className="text-xs font-medium text-gray-600">Eye Color</label>
                        <p className="text-sm text-gray-900">{selectedVictim.physicalDescription.eyeColor}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Impact Summary */}
              <Card className="bg-pink-100 border-2 border-blue-200 shadow-md">
                <CardHeader className="pb-2 bg-blue-600">
                  <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    Impact Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-3 space-y-2">
                  <div>
                    <label className="text-xs font-medium text-gray-600">Trauma Level</label>
                    <div className="mt-1">
                      {getTraumaLevelBadge(selectedVictim.impactAssessment?.psychologicalImpact?.traumaLevel)}
                    </div>
                  </div>
                  {selectedVictim.impactAssessment?.physicalInjuries && selectedVictim.impactAssessment.physicalInjuries.length > 0 && (
                    <div>
                      <label className="text-xs font-medium text-gray-600">Physical Injuries</label>
                      <p className="text-sm text-gray-900">{selectedVictim.impactAssessment.physicalInjuries.length} injury(ies)</p>
                    </div>
                  )}
                  <div>
                    <label className="text-xs font-medium text-gray-600">Total Financial Impact</label>
                    <p className="text-sm font-semibold text-gray-900">{formatCurrency(totalFinancialImpact)}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Address Information */}
            {(selectedVictim.address?.current || selectedVictim.address?.permanent) && (
              <Card className="bg-green-100 border-2 border-blue-200 shadow-md">
                <CardHeader className="pb-2 bg-blue-600">
                  <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                    <Home className="w-4 h-4" />
                    Address Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedVictim.address?.current && (
                      <div>
                        <label className="text-xs font-medium text-gray-600 mb-1 block">Current Address</label>
                        <p className="text-sm text-gray-900">
                          {selectedVictim.address.current.street && `${selectedVictim.address.current.street}, `}
                          {selectedVictim.address.current.city && `${selectedVictim.address.current.city}, `}
                          {selectedVictim.address.current.state && `${selectedVictim.address.current.state}, `}
                          {selectedVictim.address.current.country}
                          {selectedVictim.address.current.postalCode && ` ${selectedVictim.address.current.postalCode}`}
                        </p>
                      </div>
                    )}
                    {selectedVictim.address?.permanent && (
                      <div>
                        <label className="text-xs font-medium text-gray-600 mb-1 block">Permanent Address</label>
                        <p className="text-sm text-gray-900">
                          {selectedVictim.address.permanent.street && `${selectedVictim.address.permanent.street}, `}
                          {selectedVictim.address.permanent.city && `${selectedVictim.address.permanent.city}, `}
                          {selectedVictim.address.permanent.state && `${selectedVictim.address.permanent.state}, `}
                          {selectedVictim.address.permanent.country}
                          {selectedVictim.address.permanent.postalCode && ` ${selectedVictim.address.permanent.postalCode}`}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Emergency Contact */}
            {selectedVictim.emergencyContact && (
              <Card className="bg-orange-100 border-2 border-blue-200 shadow-md">
                <CardHeader className="pb-2 bg-blue-600">
                  <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Emergency Contact
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-3 space-y-2">
                  <div>
                    <label className="text-xs font-medium text-gray-600">Name</label>
                    <p className="text-sm text-gray-900">{selectedVictim.emergencyContact.name}</p>
                  </div>
                  {selectedVictim.emergencyContact.relationship && (
                    <div>
                      <label className="text-xs font-medium text-gray-600">Relationship</label>
                      <p className="text-sm text-gray-900">{selectedVictim.emergencyContact.relationship}</p>
                    </div>
                  )}
                  {selectedVictim.emergencyContact.phone && (
                    <div>
                      <label className="text-xs font-medium text-gray-600">Phone</label>
                      <p className="text-sm text-gray-900">{selectedVictim.emergencyContact.phone}</p>
                    </div>
                  )}
                  {selectedVictim.emergencyContact.email && (
                    <div>
                      <label className="text-xs font-medium text-gray-600">Email</label>
                      <p className="text-sm text-gray-900">{selectedVictim.emergencyContact.email}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Personal Info Tab */}
          <TabsContent value="personal" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-blue-100 border-2 border-blue-200 shadow-md">
                <CardHeader className="pb-2 bg-blue-600">
                  <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Personal Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-3 space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600">Full Name</label>
                    <p className="text-sm text-gray-900">
                      {selectedVictim.personalInfo.firstName} {selectedVictim.personalInfo.middleName || ''} {selectedVictim.personalInfo.lastName}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">Date of Birth</label>
                    <p className="text-sm text-gray-900">{formatDate(selectedVictim.personalInfo.dateOfBirth)}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">Gender</label>
                    <p className="text-sm text-gray-900">{selectedVictim.personalInfo.gender.charAt(0).toUpperCase() + selectedVictim.personalInfo.gender.slice(1)}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">Nationality</label>
                    <p className="text-sm text-gray-900">{selectedVictim.personalInfo.nationality}</p>
                  </div>
                  {selectedVictim.personalInfo.nationalId && (
                    <div>
                      <label className="text-xs font-medium text-gray-600">National ID</label>
                      <p className="text-sm text-gray-900">{selectedVictim.personalInfo.nationalId}</p>
                    </div>
                  )}
                  {selectedVictim.personalInfo.passportNumber && (
                    <div>
                      <label className="text-xs font-medium text-gray-600">Passport Number</label>
                      <p className="text-sm text-gray-900">{selectedVictim.personalInfo.passportNumber}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-purple-100 border-2 border-blue-200 shadow-md">
                <CardHeader className="pb-2 bg-blue-600">
                  <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-3 space-y-3">
                  {selectedVictim.personalInfo.phoneNumber && (
                    <div>
                      <label className="text-xs font-medium text-gray-600">Phone Number</label>
                      <p className="text-sm text-gray-900">{selectedVictim.personalInfo.phoneNumber}</p>
                    </div>
                  )}
                  {selectedVictim.personalInfo.email && (
                    <div>
                      <label className="text-xs font-medium text-gray-600">Email</label>
                      <p className="text-sm text-gray-900">{selectedVictim.personalInfo.email}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {selectedVictim.physicalDescription && (
                <Card className="bg-indigo-100 border-2 border-blue-200 shadow-md">
                  <CardHeader className="pb-2 bg-blue-600">
                    <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      Physical Description
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-3 space-y-3">
                    {selectedVictim.physicalDescription.height && (
                      <div>
                        <label className="text-xs font-medium text-gray-600">Height</label>
                        <p className="text-sm text-gray-900">{selectedVictim.physicalDescription.height} cm</p>
                      </div>
                    )}
                    {selectedVictim.physicalDescription.weight && (
                      <div>
                        <label className="text-xs font-medium text-gray-600">Weight</label>
                        <p className="text-sm text-gray-900">{selectedVictim.physicalDescription.weight} kg</p>
                      </div>
                    )}
                    {selectedVictim.physicalDescription.eyeColor && (
                      <div>
                        <label className="text-xs font-medium text-gray-600">Eye Color</label>
                        <p className="text-sm text-gray-900">{selectedVictim.physicalDescription.eyeColor}</p>
                      </div>
                    )}
                    {selectedVictim.physicalDescription.hairColor && (
                      <div>
                        <label className="text-xs font-medium text-gray-600">Hair Color</label>
                        <p className="text-sm text-gray-900">{selectedVictim.physicalDescription.hairColor}</p>
                      </div>
                    )}
                    {selectedVictim.physicalDescription.skinTone && (
                      <div>
                        <label className="text-xs font-medium text-gray-600">Skin Tone</label>
                        <p className="text-sm text-gray-900">{selectedVictim.physicalDescription.skinTone}</p>
                      </div>
                    )}
                    {selectedVictim.physicalDescription.distinguishingMarks && (
                      <div>
                        <label className="text-xs font-medium text-gray-600">Distinguishing Marks</label>
                        <p className="text-sm text-gray-900">{selectedVictim.physicalDescription.distinguishingMarks}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              <Card className="bg-teal-100 border-2 border-blue-200 shadow-md">
                <CardHeader className="pb-2 bg-blue-600">
                  <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Status Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-3 space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600">Status</label>
                    <div className="mt-1">{getStatusBadge(selectedVictim)}</div>
                  </div>
                  {selectedVictim.status.isDeceased && selectedVictim.status.dateOfDeath && (
                    <div>
                      <label className="text-xs font-medium text-gray-600">Date of Death</label>
                      <p className="text-sm text-gray-900">{formatDate(selectedVictim.status.dateOfDeath)}</p>
                    </div>
                  )}
                  {selectedVictim.status.isDeceased && selectedVictim.status.causeOfDeath && (
                    <div>
                      <label className="text-xs font-medium text-gray-600">Cause of Death</label>
                      <p className="text-sm text-gray-900">{selectedVictim.status.causeOfDeath}</p>
                    </div>
                  )}
                  {selectedVictim.status.isMinor && selectedVictim.status.guardianInfo && (
                    <div>
                      <label className="text-xs font-medium text-gray-600">Guardian Information</label>
                      <p className="text-sm text-gray-900">
                        {selectedVictim.status.guardianInfo.name}
                        {selectedVictim.status.guardianInfo.relationship && ` (${selectedVictim.status.guardianInfo.relationship})`}
                      </p>
                      {selectedVictim.status.guardianInfo.contactInfo?.phone && (
                        <p className="text-xs text-gray-600 mt-1">Phone: {selectedVictim.status.guardianInfo.contactInfo.phone}</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Impact Assessment Tab */}
          <TabsContent value="impact" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Physical Injuries */}
              {selectedVictim.impactAssessment?.physicalInjuries && selectedVictim.impactAssessment.physicalInjuries.length > 0 && (
                <Card className="bg-red-100 border-2 border-blue-200 shadow-md">
                  <CardHeader className="pb-2 bg-blue-600">
                    <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      Physical Injuries ({selectedVictim.impactAssessment.physicalInjuries.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-3 space-y-4">
                    {selectedVictim.impactAssessment.physicalInjuries.map((injury, index) => (
                      <div key={index} className="bg-white/60 rounded-lg p-3 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-gray-900">{injury.type || 'Injury'}</span>
                          {getSeverityBadge(injury.severity)}
                        </div>
                        {injury.description && (
                          <p className="text-xs text-gray-600 mb-2">{injury.description}</p>
                        )}
                        {injury.medicalTreatment && (
                          <p className="text-xs text-gray-600 mb-1">
                            <span className="font-medium">Treatment:</span> {injury.medicalTreatment}
                          </p>
                        )}
                        {injury.recoveryStatus && (
                          <div className="mt-2">
                            <span className="text-xs font-medium text-gray-600">Recovery Status: </span>
                            <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                              {injury.recoveryStatus.charAt(0).toUpperCase() + injury.recoveryStatus.slice(1)}
                            </Badge>
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Psychological Impact */}
              {selectedVictim.impactAssessment?.psychologicalImpact && (
                <Card className="bg-yellow-100 border-2 border-blue-200 shadow-md">
                  <CardHeader className="pb-2 bg-blue-600">
                    <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                      <Heart className="w-4 h-4" />
                      Psychological Impact
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-3 space-y-3">
                    <div>
                      <label className="text-xs font-medium text-gray-600">Trauma Level</label>
                      <div className="mt-1">{getTraumaLevelBadge(selectedVictim.impactAssessment.psychologicalImpact.traumaLevel)}</div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600">Counseling Required</label>
                      <p className="text-sm text-gray-900">
                        {selectedVictim.impactAssessment.psychologicalImpact.counselingRequired ? 'Yes' : 'No'}
                      </p>
                    </div>
                    {selectedVictim.impactAssessment.psychologicalImpact.notes && (
                      <div>
                        <label className="text-xs font-medium text-gray-600">Notes</label>
                        <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedVictim.impactAssessment.psychologicalImpact.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Financial Impact */}
              {selectedVictim.impactAssessment?.financialImpact && (
                <Card className="bg-green-100 border-2 border-blue-200 shadow-md">
                  <CardHeader className="pb-2 bg-blue-600">
                    <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Financial Impact
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-3 space-y-3">
                    <div>
                      <label className="text-xs font-medium text-gray-600">Medical Expenses</label>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatCurrency(selectedVictim.impactAssessment.financialImpact.medicalExpenses)}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600">Lost Wages</label>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatCurrency(selectedVictim.impactAssessment.financialImpact.lostWages)}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600">Property Damage</label>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatCurrency(selectedVictim.impactAssessment.financialImpact.propertyDamage)}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600">Other Expenses</label>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatCurrency(selectedVictim.impactAssessment.financialImpact.otherExpenses)}
                      </p>
                    </div>
                    <div className="pt-2 border-t border-gray-300">
                      <label className="text-xs font-medium text-gray-600">Total Impact</label>
                      <p className="text-lg font-bold text-gray-900">{formatCurrency(totalFinancialImpact)}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Case Information Tab */}
          <TabsContent value="case" className="space-y-4">
            <Card className="bg-indigo-100 border-2 border-blue-200 shadow-md">
              <CardHeader className="pb-2 bg-blue-600">
                <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Case Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-3 space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-600">Victim ID</label>
                  <p className="text-sm font-semibold text-gray-900">{selectedVictim.caseInfo.victimId}</p>
                </div>
                {selectedVictim.caseInfo.caseNumbers && selectedVictim.caseInfo.caseNumbers.length > 0 && (
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-2 block">Related Case Numbers</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedVictim.caseInfo.caseNumbers.map((caseNumber, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/crimes?search=${caseNumber}`)}
                          className="text-xs bg-white hover:bg-blue-50"
                        >
                          {caseNumber}
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                {selectedVictim.caseInfo.assignedOfficer && (
                  <div>
                    <label className="text-xs font-medium text-gray-600">Assigned Officer</label>
                    <p className="text-sm text-gray-900">{selectedVictim.caseInfo.assignedOfficer}</p>
                  </div>
                )}
                {selectedVictim.caseInfo.assignedProsecutor && (
                  <div>
                    <label className="text-xs font-medium text-gray-600">Assigned Prosecutor</label>
                    <p className="text-sm text-gray-900">{selectedVictim.caseInfo.assignedProsecutor}</p>
                  </div>
                )}
                {selectedVictim.caseInfo.assignedSocialWorker && (
                  <div>
                    <label className="text-xs font-medium text-gray-600">Assigned Social Worker</label>
                    <p className="text-sm text-gray-900">{selectedVictim.caseInfo.assignedSocialWorker}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes" className="space-y-4">
            <Card className="bg-gray-100 border-2 border-blue-200 shadow-md">
              <CardHeader className="pb-2 bg-blue-600">
                <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-3">
                {selectedVictim.notes ? (
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedVictim.notes}</p>
                ) : (
                  <p className="text-sm text-gray-500 italic">No notes available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default VictimView;

