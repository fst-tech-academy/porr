import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import uploadService from '../services/uploadService';
import { Offender, OffenderOffence } from '../types';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import SignedImage from '../components/SignedImage';
import ImageUpload from '../components/ImageUpload';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  User, 
  Shield, 
  AlertTriangle,
  Camera,
  FileText,
  Edit,
  Trash2,
  Plus,
  Info,
  Briefcase,
  Home,
  Images,
  ExternalLink,
  Grid3X3,
  Download,
  Eye,
  Upload,
  Image,
  FolderOpen,
  Filter,
  Copy,
  Clock,
  ChevronLeft,
  ChevronRight,
  X,
  MoreVertical
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';

const OffenderView: React.FC = () => {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedOffender, setSelectedOffender] = useState<Offender | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [previewPhotos, setPreviewPhotos] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<{ url: string; index: number } | null>(null);
  const [crimes, setCrimes] = useState<OffenderOffence[]>([]);
  const profileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (id) {
      fetchOffender(id);
      fetchCrimes(id);
    }
  }, [id]);

  // Generate object URLs for previews and clean up on change/unmount
  useEffect(() => {
    if (previewPhotos.length === 0) {
      // Cleanup any existing URLs
      setPreviewUrls((prev) => {
        prev.forEach((url) => URL.revokeObjectURL(url));
        return [];
      });
      return;
    }

    const urls = previewPhotos.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => {
      // Revoke previous
      prev.forEach((url) => URL.revokeObjectURL(url));
      return urls;
    });

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewPhotos]);

  const fetchOffender = async (offenderId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getOffender(offenderId);
      if (response.success && response.data) {
        setSelectedOffender(response.data.offender);
      } else {
        setError('Failed to fetch offender details');
      }
    } catch (err: any) {
      console.error('Error fetching offender:', err);
      if (err.response?.status === 404) {
        setError('Offender not found. The offender may have been deleted or the ID is invalid.');
      } else if (err.response?.status === 403) {
        setError('Access denied. You do not have permission to view this offender.');
      } else {
        setError(err.message || 'Failed to load offender');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchCrimes = async (offenderId: string) => {
    try {
      const res = await apiService.getCrimesByOffender(offenderId);
      if (res.success) {
        // Handle both response structures: res.data (array) or res.data.crimes (from new structure)
        const crimesData = res.data?.crimes || res.data || [];
        setCrimes(Array.isArray(crimesData) ? crimesData : []);
      }
    } catch (e) {
      console.error('Error fetching crimes:', e);
      // ignore
    }
  };

  const handleChangeProfilePhoto = async (file: File) => {
    if (!selectedOffender) return;
    try {
      setUploadingPhoto(true);
      const response = await uploadService.uploadSingleImage(file);
      const newUrl = response.data.imageUrl;

      // Prepare updated photos array (ensure array exists)
      const updatedPhotos = Array.isArray(selectedOffender.photos)
        ? [...selectedOffender.photos]
        : [];
      // Optionally record the new profile photo in photos list
      updatedPhotos.unshift({
        url: newUrl,
        type: 'profile',
        description: 'profile photo',
        uploadedAt: new Date().toISOString()
      } as any);

      const updatedOffender = {
        ...selectedOffender,
        profilePhoto: newUrl,
        photos: updatedPhotos
      } as any;

      await apiService.updateOffender(selectedOffender._id, updatedOffender);
      setSelectedOffender(updatedOffender);
    } catch (e) {
      setError('Failed to update profile photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const getRiskBadge = (level: string) => {
    const riskColors = {
      'low': 'bg-green-100 text-green-800 border-green-200',
      'medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'high': 'bg-orange-100 text-orange-800 border-orange-200',
      'critical': 'bg-red-100 text-red-800 border-red-200',
    };
    
    return (
      <Badge className={`text-xs font-medium ${riskColors[level as keyof typeof riskColors] || riskColors.low}`}>
        {level?.charAt(0).toUpperCase()}{level?.slice(1)} Risk
      </Badge>
    );
  };

  const getStatusBadge = (isActive: boolean, isInCustody: boolean) => {
    if (isInCustody) {
      return <Badge className="bg-red-100 text-red-800 border-red-200">In Custody</Badge>;
    } else if (isActive) {
      return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>;
    } else {
      return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Inactive</Badge>;
    }
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

  const getCrimeStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      reported: 'bg-blue-100 text-blue-800 border-blue-200',
      under_investigation: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      charged: 'bg-orange-100 text-orange-800 border-orange-200',
      trial: 'bg-purple-100 text-purple-800 border-purple-200',
      convicted: 'bg-red-100 text-red-800 border-red-200',
      acquitted: 'bg-green-100 text-green-800 border-green-200',
      dismissed: 'bg-gray-100 text-gray-800 border-gray-200',
      plea_bargain: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    };
    
    return (
      <Badge className={statusColors[status] || 'bg-gray-100 text-gray-800 border-gray-200'}>
        {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </Badge>
    );
  };

  const getSeverityBadge = (severity: string) => {
    const severityColors: Record<string, string> = {
      minor: 'bg-green-100 text-green-800 border-green-200',
      moderate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      serious: 'bg-orange-100 text-orange-800 border-orange-200',
      major: 'bg-red-100 text-red-800 border-red-200',
      felony: 'bg-red-200 text-red-900 border-red-300',
    };
    
    return (
      <Badge className={severityColors[severity] || 'bg-gray-100 text-gray-800 border-gray-200'}>
        {severity.charAt(0).toUpperCase() + severity.slice(1)}
      </Badge>
    );
  };

  const handlePhotoUpload = async (file: File) => {
    if (!selectedOffender) return;

    try {
      setUploadingPhoto(true);
      const imageUrl = await apiService.uploadImage(file);
      
      // Determine photo type based on existing photos
      const photoType = selectedOffender.photos?.length === 0 ? 'profile' : 'mugshot';
      
      // Add photo to offender's photos array
      const newPhoto = {
        url: imageUrl,
        type: photoType,
        description: `${photoType} photo`,
        uploadedAt: new Date().toISOString()
      };

      const updatedPhotos = [...(selectedOffender.photos || []), newPhoto];
      
      // Update offender with new photo
      const updatedOffender = {
        ...selectedOffender,
        photos: updatedPhotos
      };

      // If it's the first photo or profile photo, also update the profilePhoto field
      if (photoType === 'profile' || !selectedOffender.profilePhoto) {
        updatedOffender.profilePhoto = imageUrl;
      }

      await apiService.updateOffender(selectedOffender._id, updatedOffender);
      setSelectedOffender(updatedOffender);
    } catch (err: any) {
      console.error('Error uploading photo:', err);
      setError('Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleFileSelection = (files: FileList) => {
    const fileArray = Array.from(files);
    setPreviewPhotos(fileArray);
  };

  const handleUploadPhotos = async () => {
    if (!selectedOffender || previewPhotos.length === 0) return;

    try {
      setUploadingPhoto(true);
      const uploadPromises = previewPhotos.map(async (file, index) => {
        const response = await uploadService.uploadSingleImage(file);
        
        // Determine photo type
        const photoType = selectedOffender.photos?.length === 0 && index === 0 ? 'profile' : 'mugshot';
        
        return {
          url: response.data.imageUrl,
          type: photoType,
          description: `${photoType} photo`,
          uploadedAt: new Date().toISOString(),
          originalName: file.name
        };
      });

      const newPhotos = await Promise.all(uploadPromises);
      const updatedPhotos = [...(selectedOffender.photos || []), ...newPhotos];
      
      // Update offender with new photos
      const updatedOffender = {
        ...selectedOffender,
        photos: updatedPhotos
      };

      // If it's the first photo, also update the profilePhoto field
      if (selectedOffender.photos?.length === 0 && newPhotos.length > 0) {
        updatedOffender.profilePhoto = newPhotos[0].url;
      }

      await apiService.updateOffender(selectedOffender._id, updatedOffender);
      setSelectedOffender(updatedOffender);
      setPreviewPhotos([]); // Clear previews after successful upload
    } catch (err: any) {
      console.error('Error uploading photos:', err);
      setError('Failed to upload photos');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleRemovePreview = (index: number) => {
    setPreviewPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const openPreview = (url: string, index: number) => {
    setPreviewPhoto({ url, index });
    setIsPreviewOpen(true);
  };

  const closePreview = () => {
    setIsPreviewOpen(false);
    setPreviewPhoto(null);
  };

  const getProxyImageSrc = (url: string) => {
    try {
      const key = url.split('/').pop() as string;
      return `${(import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5009/api'}/upload/image/${key}`;
    } catch {
      return url;
    }
  };

  // Keyboard navigation for modal
  useEffect(() => {
    if (!isPreviewOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrevPhoto();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToNextPhoto();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        closePreview();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isPreviewOpen, previewPhoto, selectedOffender]);

  const goToPrevPhoto = () => {
    if (!selectedOffender || !previewPhoto) return;
    const total = selectedOffender.photos?.length || 0;
    if (total === 0) return;
    const prevIndex = (previewPhoto.index - 1 + total) % total;
    const newUrl = selectedOffender.photos[prevIndex]?.url || previewPhoto.url;
    setPreviewPhoto({ url: newUrl, index: prevIndex });
  };

  const goToNextPhoto = () => {
    if (!selectedOffender || !previewPhoto) return;
    const total = selectedOffender.photos?.length || 0;
    if (total === 0) return;
    const nextIndex = (previewPhoto.index + 1) % total;
    const newUrl = selectedOffender.photos[nextIndex]?.url || previewPhoto.url;
    setPreviewPhoto({ url: newUrl, index: nextIndex });
  };

  const handleDeletePhoto = async (photoIndex: number) => {
    if (!selectedOffender) return;

    try {
      const updatedPhotos = selectedOffender.photos?.filter((_, index) => index !== photoIndex) || [];
      
      const updatedOffender = {
        ...selectedOffender,
        photos: updatedPhotos
      };

      // If we deleted the profile photo, set the first remaining photo as profile photo
      if (photoIndex === 0 && updatedPhotos.length > 0) {
        updatedOffender.profilePhoto = updatedPhotos[0].url;
      } else if (updatedPhotos.length === 0) {
        updatedOffender.profilePhoto = undefined;
      }

      await apiService.updateOffender(selectedOffender._id, updatedOffender);
      setSelectedOffender(updatedOffender);
    } catch (err: any) {
      console.error('Error deleting photo:', err);
      setError('Failed to delete photo');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading offender details...</p>
        </div>
      </div>
    );
  }

  if (error || !selectedOffender) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {error?.includes('not found') ? 'Offender Not Found' : 'Error'}
          </h2>
          <p className="text-gray-600 mb-4">{error || 'Offender not found'}</p>
          <div className="space-y-2">
            <Button onClick={() => navigate('/offenders')} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Offenders
            </Button>
            <Button onClick={() => window.location.reload()} variant="outline" className="w-full">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-6">
              {/* Profile Photo (editable) */}
              <div className="flex-shrink-0 relative group">
                {selectedOffender.profilePhoto ? (
                  <SignedImage
                    src={selectedOffender.profilePhoto}
                    alt={`${selectedOffender.personalInfo.firstName} ${selectedOffender.personalInfo.lastName}`}
                    className={`h-24 w-24 rounded-lg object-cover border-4 shadow-lg ${
                      crimes.length > 0 ? 'border-red-500' : 'border-blue-100'
                    }`}
                    fallback={getInitials(selectedOffender.personalInfo.firstName, selectedOffender.personalInfo.lastName)}
                    size="xl"
                  />
                ) : (
                  <Avatar className="h-24 w-24 border-4 border-red-500 shadow-lg rounded-lg">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-3xl rounded-lg font-bold">
                      {getInitials(selectedOffender.personalInfo.firstName, selectedOffender.personalInfo.lastName)}
                    </AvatarFallback>
                  </Avatar>
                )}

                {/* Change photo action */}
                <button
                  type="button"
                  onClick={() => profileInputRef.current?.click()}
                  className="absolute -bottom-2 right-0 translate-y-1/2 bg-white/90 hover:bg-white text-blue-700 border border-blue-200 rounded-full px-2 py-1 text-xs font-medium shadow-sm opacity-0 group-hover:opacity-100 transition"
                >
                  Change Photo
                </button>
                <input
                  ref={profileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleChangeProfilePhoto(file);
                    // reset input so same file can be chosen again if needed
                    if (profileInputRef.current) profileInputRef.current.value = '';
                  }}
                />
              </div>

              {/* Name and Basic Info */}
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {selectedOffender.personalInfo.firstName} {selectedOffender.personalInfo.lastName}
                  </h1>
                  {getStatusBadge(selectedOffender.status.isActive, selectedOffender.status.isInCustody)}
                  {getRiskBadge(selectedOffender.riskAssessment.level)}
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>Age: {getAge(selectedOffender.personalInfo.dateOfBirth)} years</span>
                  </div>
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    <span className="capitalize">{selectedOffender.personalInfo.gender}</span>
                  </div>
                  {selectedOffender.personalInfo.nationality && (
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{selectedOffender.personalInfo.nationality}</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">ID: {selectedOffender._id}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => navigate('/offenders')}
                variant="outline"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={() => navigate(`/offenders/${selectedOffender._id}/edit`)}
                className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white shadow-lg border-0"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6 bg-white border border-gray-200 rounded-lg p-1">
            <TabsTrigger value="overview" className="text-black data-[state=active]:bg-blue-100 data-[state=active]:text-black">
              <Info className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="personal" className="text-black data-[state=active]:bg-blue-100 data-[state=active]:text-black">
              <User className="w-4 h-4 mr-2" />
              Personal
            </TabsTrigger>
            <TabsTrigger value="criminal" className="text-black data-[state=active]:bg-blue-100 data-[state=active]:text-black">
              <Shield className="w-4 h-4 mr-2" />
              Criminal History
            </TabsTrigger>
            <TabsTrigger value="address" className="text-black data-[state=active]:bg-blue-100 data-[state=active]:text-black">
              <Home className="w-4 h-4 mr-2" />
              Address
            </TabsTrigger>
            <TabsTrigger value="photos" className="text-black data-[state=active]:bg-blue-100 data-[state=active]:text-black">
              <Images className="w-4 h-4 mr-2" />
              Photo Album
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Quick Stats */}
            <Card className="border-2 border-blue-200 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold flex items-center text-blue-800">
                  <Briefcase className="w-5 h-5 mr-2 text-blue-600" />
                  Offences
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-3xl font-bold text-blue-900">{crimes.length}</p>
                <p className="text-sm text-blue-700 mt-1">Total offences recorded</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold flex items-center text-green-800">
                  <Calendar className="w-5 h-5 mr-2 text-green-600" />
                  Status
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-lg font-semibold text-green-900 mb-1">
                  {selectedOffender.status.isInCustody ? 'In Custody' : 'Released'}
                </p>
                {selectedOffender.status.custodyLocation && (
                  <p className="text-sm text-green-700">{selectedOffender.status.custodyLocation}</p>
                )}
              </CardContent>
            </Card>

            <Card className="border-2 border-orange-200 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold flex items-center text-orange-800">
                  <Shield className="w-5 h-5 mr-2 text-orange-600" />
                  Risk Level
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="mt-2">
                  {getRiskBadge(selectedOffender.riskAssessment.level)}
                </div>
              </CardContent>
            </Card>
            </div>

            {/* Personal Information Summary */}
            <Card className="border-2 border-purple-200 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-purple-800 flex items-center">
                  <User className="w-5 h-5 mr-2 text-purple-600" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-white/50 rounded-lg">
                    <label className="text-sm font-medium text-purple-700">Full Name</label>
                    <p className="text-purple-900 font-medium">
                      {selectedOffender.personalInfo.firstName} {selectedOffender.personalInfo.middleName} {selectedOffender.personalInfo.lastName}
                    </p>
                  </div>
                  <div className="p-3 bg-white/50 rounded-lg">
                    <label className="text-sm font-medium text-purple-700">Date of Birth</label>
                    <p className="text-purple-900">{formatDate(selectedOffender.personalInfo.dateOfBirth)}</p>
                  </div>
                  <div className="p-3 bg-white/50 rounded-lg">
                    <label className="text-sm font-medium text-purple-700">Gender</label>
                    <p className="text-purple-900 capitalize">{selectedOffender.personalInfo.gender}</p>
                  </div>
                  <div className="p-3 bg-white/50 rounded-lg">
                    <label className="text-sm font-medium text-purple-700">Nationality</label>
                    <p className="text-purple-900">{selectedOffender.personalInfo.nationality}</p>
                  </div>
                  {selectedOffender.personalInfo.phoneNumber && (
                    <div className="p-3 bg-white/50 rounded-lg">
                      <label className="text-sm font-medium text-purple-700">Phone</label>
                      <p className="text-purple-900 flex items-center">
                        <Phone className="w-4 h-4 mr-1" />
                        {selectedOffender.personalInfo.phoneNumber}
                      </p>
                    </div>
                  )}
                  {selectedOffender.personalInfo.email && (
                    <div className="p-3 bg-white/50 rounded-lg">
                      <label className="text-sm font-medium text-purple-700">Email</label>
                      <p className="text-purple-900 flex items-center">
                        <Mail className="w-4 h-4 mr-1" />
                        {selectedOffender.personalInfo.email}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Offences */}
            {selectedOffender.criminalHistory.offences && selectedOffender.criminalHistory.offences.length > 0 && (
              <Card className="border-2 border-red-200 shadow-lg bg-gradient-to-br from-red-50 to-red-100">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-red-800 flex items-center">
                    <Briefcase className="w-5 h-5 mr-2 text-red-600" />
                    Recent Offences
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {selectedOffender.criminalHistory.offences.slice(0, 5).map((offence, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-white/70 rounded-lg hover:bg-white/90 transition-colors border border-red-200">
                        <div>
                          <p className="text-sm font-medium text-red-900">
                            {typeof offence.offenceId === 'object' ? offence.offenceId.name : 'Offence'}
                          </p>
                          <p className="text-xs text-red-700">{formatDate(offence.dateCommitted)}</p>
                        </div>
                        <Badge variant={offence.status === 'convicted' ? 'destructive' : 'secondary'} className="border-red-300 text-red-800">
                          {offence.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Personal Information Tab */}
          <TabsContent value="personal" className="space-y-4">
            <Card className="border-2 border-indigo-200 shadow-lg bg-gradient-to-br from-indigo-50 to-indigo-100">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-indigo-800 flex items-center">
                  <User className="w-5 h-5 mr-2 text-indigo-600" />
                  Personal Details
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-white/50 rounded-lg">
                    <label className="text-sm font-medium text-indigo-700">First Name</label>
                    <p className="text-indigo-900 font-medium">{selectedOffender.personalInfo.firstName}</p>
                  </div>
                  <div className="p-3 bg-white/50 rounded-lg">
                    <label className="text-sm font-medium text-indigo-700">Middle Name</label>
                    <p className="text-indigo-900">{selectedOffender.personalInfo.middleName || 'N/A'}</p>
                  </div>
                  <div className="p-3 bg-white/50 rounded-lg">
                    <label className="text-sm font-medium text-indigo-700">Last Name</label>
                    <p className="text-indigo-900 font-medium">{selectedOffender.personalInfo.lastName}</p>
                  </div>
                  <div className="p-3 bg-white/50 rounded-lg">
                    <label className="text-sm font-medium text-indigo-700">Date of Birth</label>
                    <p className="text-indigo-900">{formatDate(selectedOffender.personalInfo.dateOfBirth)}</p>
                  </div>
                  <div className="p-3 bg-white/50 rounded-lg">
                    <label className="text-sm font-medium text-indigo-700">Place of Birth</label>
                    <p className="text-indigo-900">{selectedOffender.personalInfo.placeOfBirth || 'N/A'}</p>
                  </div>
                  <div className="p-3 bg-white/50 rounded-lg">
                    <label className="text-sm font-medium text-indigo-700">Gender</label>
                    <p className="text-indigo-900 capitalize">{selectedOffender.personalInfo.gender}</p>
                  </div>
                  <div className="p-3 bg-white/50 rounded-lg">
                    <label className="text-sm font-medium text-indigo-700">Nationality</label>
                    <p className="text-indigo-900">{selectedOffender.personalInfo.nationality}</p>
                  </div>
                  {selectedOffender.personalInfo.nationalId && (
                    <div className="p-3 bg-white/50 rounded-lg">
                      <label className="text-sm font-medium text-indigo-700">National ID</label>
                      <p className="text-indigo-900">{selectedOffender.personalInfo.nationalId}</p>
                    </div>
                  )}
                  {selectedOffender.personalInfo.passportNumber && (
                    <div className="p-3 bg-white/50 rounded-lg">
                      <label className="text-sm font-medium text-indigo-700">Passport Number</label>
                      <p className="text-indigo-900">{selectedOffender.personalInfo.passportNumber}</p>
                    </div>
                  )}
                  {selectedOffender.personalInfo.phoneNumber && (
                    <div className="p-3 bg-white/50 rounded-lg">
                      <label className="text-sm font-medium text-indigo-700">Phone Number</label>
                      <p className="text-indigo-900 flex items-center">
                        <Phone className="w-4 h-4 mr-1" />
                        {selectedOffender.personalInfo.phoneNumber}
                      </p>
                    </div>
                  )}
                  {selectedOffender.personalInfo.email && (
                    <div className="p-3 bg-white/50 rounded-lg">
                      <label className="text-sm font-medium text-indigo-700">Email</label>
                      <p className="text-indigo-900 flex items-center">
                        <Mail className="w-4 h-4 mr-1" />
                        {selectedOffender.personalInfo.email}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Physical Description */}
            {selectedOffender.physicalDescription && (
              <Card className="border-2 border-teal-200 shadow-lg bg-gradient-to-br from-teal-50 to-teal-100">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-teal-800 flex items-center">
                    <User className="w-5 h-5 mr-2 text-teal-600" />
                    Physical Description
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedOffender.physicalDescription.height && (
                      <div className="p-3 bg-white/50 rounded-lg">
                        <label className="text-sm font-medium text-teal-700">Height</label>
                        <p className="text-teal-900">{selectedOffender.physicalDescription.height} cm</p>
                      </div>
                    )}
                    {selectedOffender.physicalDescription.weight && (
                      <div className="p-3 bg-white/50 rounded-lg">
                        <label className="text-sm font-medium text-teal-700">Weight</label>
                        <p className="text-teal-900">{selectedOffender.physicalDescription.weight} kg</p>
                      </div>
                    )}
                    {selectedOffender.physicalDescription.eyeColor && (
                      <div className="p-3 bg-white/50 rounded-lg">
                        <label className="text-sm font-medium text-teal-700">Eye Color</label>
                        <p className="text-teal-900 capitalize">{selectedOffender.physicalDescription.eyeColor}</p>
                      </div>
                    )}
                    {selectedOffender.physicalDescription.hairColor && (
                      <div className="p-3 bg-white/50 rounded-lg">
                        <label className="text-sm font-medium text-teal-700">Hair Color</label>
                        <p className="text-teal-900 capitalize">{selectedOffender.physicalDescription.hairColor}</p>
                      </div>
                    )}
                    {selectedOffender.physicalDescription.skinTone && (
                      <div className="p-3 bg-white/50 rounded-lg">
                        <label className="text-sm font-medium text-teal-700">Skin Tone</label>
                        <p className="text-teal-900 capitalize">{selectedOffender.physicalDescription.skinTone}</p>
                      </div>
                    )}
                    {selectedOffender.physicalDescription.distinguishingMarks && (
                      <div className="md:col-span-2 p-3 bg-white/50 rounded-lg">
                        <label className="text-sm font-medium text-teal-700">Distinguishing Marks</label>
                        <p className="text-teal-900">{selectedOffender.physicalDescription.distinguishingMarks}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Criminal History Tab */}
          <TabsContent value="criminal" className="space-y-4">
            {/* Summary Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-2 border-slate-300 shadow-lg bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                <CardHeader className="pb-3 bg-gradient-to-r from-slate-600 to-slate-700">
                  <CardTitle className="text-base font-semibold text-white flex items-center justify-between">
                    <div className="flex items-center">
                      <Briefcase className="w-5 h-5 mr-2" />
                      Total Offences
                    </div>
                    <Badge className="bg-white text-slate-700 text-xs font-bold px-2 py-1">
                      {selectedOffender.criminalHistory.totalOffences}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-slate-800 mb-1">{crimes.length}</p>
                    <p className="text-xs text-slate-600">Recorded offences</p>
                  </div>
                </CardContent>
              </Card>

              {crimes.length > 0 && (
                <Card className="border-2 border-blue-300 shadow-lg bg-gradient-to-br from-blue-100 to-blue-200 overflow-hidden">
                  <CardHeader className="pb-3 bg-gradient-to-r from-blue-600 to-blue-700">
                    <CardTitle className="text-base font-semibold text-white flex items-center">
                      <Calendar className="w-5 h-5 mr-2" />
                      First Offence
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <p className="text-lg font-bold text-blue-900 mb-1">{formatDate([...crimes].sort((a,b)=>new Date(a.dateTime.dateCommitted).getTime()-new Date(b.dateTime.dateCommitted).getTime())[0].dateTime.dateCommitted)}</p>
                      <p className="text-xs text-blue-700">Initial record date</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {crimes.length > 0 && (
                <Card className="border-2 border-red-300 shadow-lg bg-gradient-to-br from-red-100 to-red-200 overflow-hidden">
                  <CardHeader className="pb-3 bg-gradient-to-r from-red-600 to-red-700">
                    <CardTitle className="text-base font-semibold text-white flex items-center">
                      <Calendar className="w-5 h-5 mr-2" />
                      Latest Offence
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <p className="text-lg font-bold text-red-900 mb-1">{formatDate([...crimes].sort((a,b)=>new Date(b.dateTime.dateCommitted).getTime()-new Date(a.dateTime.dateCommitted).getTime())[0].dateTime.dateCommitted)}</p>
                      <p className="text-xs text-red-700">Most recent date</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Crimes Table */}
            {crimes.length > 0 ? (
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader className="pb-3 bg-gradient-to-r from-slate-700 to-slate-800">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-white flex items-center">
                      <FileText className="w-5 h-5 mr-2" />
                      Criminal History
                    </CardTitle>
                    <Badge className="bg-white text-slate-700 text-xs font-semibold px-3 py-1">
                      {crimes.length} {crimes.length === 1 ? 'Crime' : 'Crimes'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <Table>
                      <TableHeader className="bg-gray-50">
                        <TableRow>
                          <TableHead className="font-semibold">Case Number</TableHead>
                          <TableHead className="font-semibold">Offence</TableHead>
                          <TableHead className="font-semibold">Date Committed</TableHead>
                          <TableHead className="font-semibold">Location</TableHead>
                          <TableHead className="font-semibold">Status</TableHead>
                          <TableHead className="font-semibold">Severity</TableHead>
                          <TableHead className="font-semibold text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {crimes.map((crime) => (
                          <TableRow key={crime._id} className="hover:bg-gray-50">
                            <TableCell className="font-medium text-gray-900">
                              {crime.crimeInfo.caseNumber}
                            </TableCell>
                            <TableCell className="text-gray-600">
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {typeof crime.offenceCatalogue === 'object' 
                                    ? (crime.offenceCatalogue as any).name 
                                    : crime.crimeInfo.title}
                                </span>
                                {typeof crime.offenceCatalogue === 'object' && (crime.offenceCatalogue as any).code && (
                                  <span className="text-xs text-gray-500">
                                    {(crime.offenceCatalogue as any).code}
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-gray-600">
                              <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                <span className="text-sm">{formatDate(crime.dateTime.dateCommitted)}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-gray-600">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4 text-gray-500" />
                                {crime.location.city}, {crime.location.state}
                              </span>
                            </TableCell>
                            <TableCell>
                              {getCrimeStatusBadge(crime.legal.status)}
                            </TableCell>
                            <TableCell>
                              {getSeverityBadge(crime.legal.severity)}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => navigate(`/crimes/${crime._id}`)}
                                  className="h-8 px-3 text-blue-600 hover:bg-blue-50"
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  View
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="bg-white border border-gray-200 shadow-lg">
                                    <DropdownMenuItem 
                                      className="text-black hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer"
                                      onClick={() => navigate(`/crimes/${crime._id}/edit`)}
                                    >
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit Crime
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                      className="text-red-600 hover:bg-red-50 hover:text-red-700 focus:bg-red-50 focus:text-red-700 cursor-pointer"
                                      onClick={() => {
                                        if (window.confirm('Are you sure you want to delete this crime record?')) {
                                          apiService.deleteCrime(crime._id).then(() => {
                                            fetchCrimes(id!);
                                          });
                                        }
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardContent className="p-8 text-center">
                  <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg font-medium mb-2">No crimes found</p>
                  <p className="text-gray-400 text-sm mb-4">
                    This offender has no recorded criminal history.
                  </p>
                  <Button
                    onClick={() => navigate(`/crimes/new?offender=${id}`)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Crime Record
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Address Tab */}
          <TabsContent value="address" className="space-y-4">
            {selectedOffender.address && (
              <>
                {selectedOffender.address.current && (
                  <Card className="border-2 border-blue-200 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-semibold flex items-center text-blue-800">
                        <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                        Current Address
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2 p-3 bg-white/50 rounded-lg">
                        {selectedOffender.address.current.street && (
                          <p className="text-blue-900 font-medium">{selectedOffender.address.current.street}</p>
                        )}
                        <p className="text-blue-900">
                          {[
                            selectedOffender.address.current.city,
                            selectedOffender.address.current.state,
                            selectedOffender.address.current.country,
                            selectedOffender.address.current.postalCode
                          ].filter(Boolean).join(', ')}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {selectedOffender.address.permanent && (
                  <Card className="border-2 border-green-200 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-semibold flex items-center text-green-800">
                        <MapPin className="w-5 h-5 mr-2 text-green-600" />
                        Permanent Address
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2 p-3 bg-white/50 rounded-lg">
                        {selectedOffender.address.permanent.street && (
                          <p className="text-green-900 font-medium">{selectedOffender.address.permanent.street}</p>
                        )}
                        <p className="text-green-900">
                          {[
                            selectedOffender.address.permanent.city,
                            selectedOffender.address.permanent.state,
                            selectedOffender.address.permanent.country,
                            selectedOffender.address.permanent.postalCode
                          ].filter(Boolean).join(', ')}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>

          {/* Photo Album Tab */}
          <TabsContent value="photos" className="space-y-6">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Photo Album</h2>
                    <p className="text-blue-100 text-sm">
                      Manage offender photos, documents, and evidence
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">{selectedOffender.photos?.length || 0}</div>
                  <div className="text-blue-100 text-sm">Total Photos</div>
                </div>
              </div>
            </div>


            

            {/* Photo Preview Section */}
            {previewPhotos.length > 0 && (
              <Card className="border-2 border-orange-200 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-semibold text-orange-900 flex items-center">
                        <Camera className="w-5 h-5 mr-2" />
                        Photo Preview ({previewPhotos.length} selected)
                      </CardTitle>
                      <p className="text-sm text-orange-700 mt-1">
                        Review your selected photos before uploading
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-orange-600 border-orange-300">
                        <Image className="w-3 h-3 mr-1" />
                        Preview Mode
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
                    {previewPhotos.map((file, index) => (
                      <div key={index} className="group relative bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300">
                        <div className="aspect-square relative">
                          <img
                            src={previewUrls[index]}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRemovePreview(index)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="p-3">
                          <p className="text-xs text-gray-600 truncate" title={file.name}>
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button 
                      onClick={handleUploadPhotos}
                      disabled={uploadingPhoto}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploadingPhoto ? "Uploading..." : `Upload ${previewPhotos.length} Photos`}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setPreviewPhotos([])}
                      disabled={uploadingPhoto}
                      className="border-gray-300 text-gray-600 hover:bg-gray-50"
                    >
                      Cancel
                    </Button>
                  </div>
                  
                  {uploadingPhoto && (
                    <div className="mt-4 flex items-center justify-center text-green-600">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600 mr-3"></div>
                      <span className="font-medium">Uploading photos...</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Photos Gallery */}
            {selectedOffender.photos && selectedOffender.photos.length > 0 && (
              <Card className="border-2 border-gray-200 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Grid3X3 className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold text-gray-900">
                          Photo Gallery
                        </CardTitle>
                        <p className="text-sm text-gray-600">
                          {selectedOffender.photos.length} photos in collection
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-gray-600">
                        <Grid3X3 className="w-3 h-3 mr-1" />
                        Grid View
                      </Badge>
                      <Badge variant="outline" className="text-gray-600">
                        <Filter className="w-3 h-3 mr-1" />
                        All Types
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {selectedOffender.photos.map((photo, index) => (
                      <div key={index} className="group relative bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        {/* Photo Container */}
                        <div className="aspect-square relative overflow-hidden cursor-zoom-in" onClick={() => openPreview(photo.url, index)}>
                          <SignedImage
                            src={photo.url}
                            alt={photo.description || `${photo.type} photo`}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            fallback={
                              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-400">
                                <Camera className="w-16 h-16" />
                              </div>
                            }
                          />
                          
                          {/* Gradient Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          
                          {/* Action Buttons */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="flex space-x-2">
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeletePhoto(index)}
                                className="h-10 w-10 p-0 rounded-full shadow-lg"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={(e) => { e.stopPropagation(); openPreview(photo.url, index); }}
                                className="h-10 w-10 p-0 rounded-full shadow-lg bg-white/90 hover:bg-white"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => navigator.clipboard.writeText(photo.url)}
                                className="h-10 w-10 p-0 rounded-full shadow-lg bg-white/90 hover:bg-white"
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          
                          {/* Photo Number Badge */}
                          <div className="absolute top-3 left-3">
                            <Badge className="text-xs bg-white/95 text-gray-800 font-semibold shadow-sm">
                              #{index + 1}
                            </Badge>
                          </div>
                          
                          {/* Type Badge */}
                          <div className="absolute top-3 right-3">
                            <Badge 
                              variant={photo.type === 'profile' ? 'default' : 'secondary'}
                              className="text-xs font-medium"
                            >
                              {photo.type || 'General'}
                            </Badge>
                          </div>
                        </div>
                        
                        {/* Photo Info */}
                        <div className="p-4 bg-white">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-500 font-medium">
                              {new Date(photo.uploadedAt || Date.now()).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                            <div className="flex items-center text-xs text-gray-400">
                              <Clock className="w-3 h-3 mr-1" />
                              {new Date(photo.uploadedAt || Date.now()).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 font-medium truncate">
                            {photo.originalName || `Photo ${index + 1}`}
                          </p>
                          {photo.description && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                              {photo.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Upload Section (moved below gallery) */}
            <Card className="border-2 border-blue-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold text-blue-900 flex items-center">
                      <Upload className="w-5 h-5 mr-2" />
                      Upload Photos
                    </CardTitle>
                    <p className="text-sm text-blue-700 mt-1">
                      Add multiple photos at once or upload individually
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-blue-600 border-blue-300">
                      <Image className="w-3 h-3 mr-1" />
                      Multiple Upload
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="border-2 border-dashed border-blue-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
                  <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <Camera className="w-10 h-10 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Drop photos here or click to browse</h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Support for JPG, PNG, GIF up to 10MB each. You can select multiple files.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button 
                      onClick={() => document.getElementById('photo-upload-input')?.click()}
                      disabled={uploadingPhoto}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Select Photos
                    </Button>
                    <input
                      id="photo-upload-input"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          handleFileSelection(e.target.files);
                        }
                      }}
                      className="hidden"
                    />
                  </div>
                  
                  {uploadingPhoto && (
                    <div className="mt-4 flex items-center justify-center text-blue-600">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
                      <span className="font-medium">Uploading photos...</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Full-screen Photo Preview Modal */}
        <Dialog open={isPreviewOpen} onOpenChange={(open) => { if (!open) closePreview(); }}>
          <DialogContent className="w-[100vw] h-[100vh] max-w-[100vw] max-h-[100vh] p-0 bg-black">
            <DialogHeader className="p-4 bg-black/70">
              <DialogTitle className="text-white">Photo Preview</DialogTitle>
            </DialogHeader>
            <div className="relative w-full h-[calc(100vh-64px)] bg-black flex items-center justify-center">
              {previewPhoto && (
                <img
                  src={getProxyImageSrc(previewPhoto.url)}
                  alt={`Photo ${previewPhoto.index + 1}`}
                  className="w-auto h-auto max-w-[100vw] max-h-[calc(100vh-64px)] object-contain"
                />
              )}

              {/* Close Button */}
              <button
                type="button"
                onClick={closePreview}
                className="absolute top-3 right-3 inline-flex items-center justify-center h-10 w-10 rounded-full bg-white/15 hover:bg-white/25 text-white transition"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Prev Button */}
              <button
                type="button"
                onClick={goToPrevPhoto}
                className="absolute left-3 top-1/2 -translate-y-1/2 inline-flex items-center justify-center h-12 w-12 rounded-full bg-white/15 hover:bg-white/25 text-white transition"
                aria-label="Previous photo"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              {/* Next Button */}
              <button
                type="button"
                onClick={goToNextPhoto}
                className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center justify-center h-12 w-12 rounded-full bg-white/15 hover:bg-white/25 text-white transition"
                aria-label="Next photo"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default OffenderView;