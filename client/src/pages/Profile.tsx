import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import SignedImage from '../components/SignedImage';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { User, Mail, Phone, IdCard, Shield, Calendar, CheckCircle, AlertCircle } from 'lucide-react';

const profileSchema = yup.object({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  phone: yup.string().optional().default(''),
});

type ProfileFormData = {
  firstName: string;
  lastName: string;
  phone?: string;
};

const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [profileError, setProfileError] = useState<string>('');
  const [profileSuccess, setProfileSuccess] = useState<string>('');

  const profileForm = useForm<ProfileFormData>({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
    },
  });

  const handleProfileSubmit = async (data: ProfileFormData) => {
    try {
      setProfileError('');
      setProfileSuccess('');
      await updateProfile(data);
      setProfileSuccess('Profile updated successfully');
    } catch (err: any) {
      setProfileError(err.message || 'Failed to update profile');
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const getRoleBadge = (role: string) => {
    const roleColors = {
      'super_admin': 'bg-red-100 text-red-800 border-red-200',
      'admin': 'bg-blue-100 text-blue-800 border-blue-200',
      'manager': 'bg-green-100 text-green-800 border-green-200',
      'officer': 'bg-orange-100 text-orange-800 border-orange-200',
      'viewer': 'bg-gray-100 text-gray-800 border-gray-200',
    };
    
    return (
      <Badge className={`text-xs font-medium ${roleColors[role as keyof typeof roleColors] || roleColors.viewer}`}>
        {role?.charAt(0).toUpperCase()}{role?.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
            <User className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
            <p className="text-gray-600 mt-1">Manage your personal information and account details</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview */}
        <div className="lg:col-span-1">
          <Card className="border-2 border-gray-200 shadow-xl bg-white rounded-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 border-b border-blue-600 pb-4">
              <CardTitle className="text-xl font-bold text-white flex items-center space-x-2">
                <User className="h-5 w-5 text-white" />
                <span>Profile Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center mb-6">
                {user?.profilePhoto ? (
                  <SignedImage
                    src={user.profilePhoto}
                    alt={`${user.firstName} ${user.lastName}`}
                    className="h-24 w-24 mx-auto rounded-full border-4 border-blue-100 shadow-lg"
                    fallback={getInitials(user.firstName, user.lastName)}
                    size="xl"
                  />
                ) : (
                  <Avatar className="h-24 w-24 mx-auto border-4 border-blue-100 shadow-lg">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-2xl font-bold">
                      {getInitials(user?.firstName || '', user?.lastName || '')}
                    </AvatarFallback>
                  </Avatar>
                )}
                <h3 className="text-xl font-bold text-gray-900 mt-4">
                  {user?.firstName} {user?.lastName}
                </h3>
                <div className="flex justify-center mt-2">
                  {getRoleBadge(user?.role || '')}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="h-4 w-4 text-gray-600" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{user?.email}</p>
                    <p className="text-xs text-gray-500">Email Address</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <IdCard className="h-4 w-4 text-gray-600" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{user?.employeeId}</p>
                    <p className="text-xs text-gray-500">Employee ID</p>
                  </div>
                </div>

                {user?.nationalId && (
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Shield className="h-4 w-4 text-gray-600" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{user.nationalId}</p>
                      <p className="text-xs text-gray-500">National ID</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="h-4 w-4 text-gray-600" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                    <p className="text-xs text-gray-500">Member Since</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Form */}
        <div className="lg:col-span-2">
          <Card className="border-2 border-gray-200 shadow-xl bg-white rounded-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 border-b border-green-600 pb-4">
              <CardTitle className="text-xl font-bold text-white flex items-center space-x-2">
                <User className="h-5 w-5 text-white" />
                <span>Personal Information</span>
              </CardTitle>
              <p className="text-sm text-green-100 mt-1">Update your personal details and contact information</p>
            </CardHeader>
            <CardContent className="p-6">
              {profileError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600">{profileError}</p>
                </div>
              )}

              {profileSuccess && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-green-600">{profileSuccess}</p>
                </div>
              )}

              <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-medium text-gray-700 flex items-center space-x-1">
                      <User className="h-3 w-3" />
                      <span>First Name</span>
                    </Label>
                    <Input
                      id="firstName"
                      {...profileForm.register('firstName')}
                      className={`h-10 text-sm text-black ${profileForm.formState.errors.firstName ? 'border-red-400 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
                    />
                    {profileForm.formState.errors.firstName && (
                      <p className="text-xs text-red-600">{profileForm.formState.errors.firstName.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-medium text-gray-700 flex items-center space-x-1">
                      <User className="h-3 w-3" />
                      <span>Last Name</span>
                    </Label>
                    <Input
                      id="lastName"
                      {...profileForm.register('lastName')}
                      className={`h-10 text-sm text-black ${profileForm.formState.errors.lastName ? 'border-red-400 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
                    />
                    {profileForm.formState.errors.lastName && (
                      <p className="text-xs text-red-600">{profileForm.formState.errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700 flex items-center space-x-1">
                    <Phone className="h-3 w-3" />
                    <span>Phone Number</span>
                  </Label>
                  <Input
                    id="phone"
                    {...profileForm.register('phone')}
                    className={`h-10 text-sm text-black ${profileForm.formState.errors.phone ? 'border-red-400 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
                  />
                  {profileForm.formState.errors.phone && (
                    <p className="text-xs text-red-600">{profileForm.formState.errors.phone.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center space-x-1">
                    <Mail className="h-3 w-3" />
                    <span>Email Address</span>
                  </Label>
                  <Input
                    id="email"
                    value={user?.email || ''}
                    disabled
                    className="h-10 text-sm bg-gray-50 text-gray-500 border-gray-200"
                  />
                  <p className="text-xs text-gray-500">Email cannot be changed</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employeeId" className="text-sm font-medium text-gray-700 flex items-center space-x-1">
                    <IdCard className="h-3 w-3" />
                    <span>Employee ID</span>
                  </Label>
                  <Input
                    id="employeeId"
                    value={user?.employeeId || ''}
                    disabled
                    className="h-10 text-sm bg-gray-50 text-gray-500 border-gray-200"
                  />
                  <p className="text-xs text-gray-500">Employee ID cannot be changed</p>
                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={profileForm.formState.isSubmitting}
                    className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                  >
                    {profileForm.formState.isSubmitting ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Updating...</span>
                      </div>
                    ) : (
                      'Update Profile'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
