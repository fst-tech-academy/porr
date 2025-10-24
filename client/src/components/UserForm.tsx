import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { User } from '../types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import PasswordInput from './ui/password-input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import ImageUpload from './ImageUpload';
import { useAuth } from '../contexts/AuthContext';

// Role hierarchy (higher number = higher privilege)
const ROLE_HIERARCHY = {
  'viewer': 1,
  'officer': 2,
  'manager': 3,
  'admin': 4,
  'super_admin': 5
};

// Get allowed roles for a user to create/edit
const getAllowedRoles = (userRole: string): string[] => {
  const userLevel = ROLE_HIERARCHY[userRole as keyof typeof ROLE_HIERARCHY] || 0;
  return Object.keys(ROLE_HIERARCHY).filter(role => 
    ROLE_HIERARCHY[role as keyof typeof ROLE_HIERARCHY] <= userLevel
  );
};

const createUserSchema = yup.object({
  firstName: yup.string().required('First name is required'),
  middleName: yup.string().optional().default(''),
  lastName: yup.string().required('Last name is required'),
  username: yup.string().required('Username is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  gender: yup.string().oneOf(['male', 'female']).required('Gender is required'),
  nationalId: yup.string().required('National ID selection is required'),
  phone: yup.string().required('Phone number is required'),
  role: yup.string().oneOf(['super_admin', 'admin', 'manager', 'officer', 'viewer']).required('Role selection is required')
});

const updateUserSchema = yup.object({
  firstName: yup.string().required('First name is required'),
  middleName: yup.string().optional().default(''),
  lastName: yup.string().required('Last name is required'),
  username: yup.string().required('Username is required'),
  password: yup.string().test('password-validation', 'Password must be at least 6 characters', function(value) {
    // If password is empty or undefined, it's valid (optional)
    if (!value || value.length === 0) {
      return true;
    }
    // If password has content, it must be at least 6 characters
    return value.length >= 6;
  }),
  gender: yup.string().oneOf(['male', 'female']).required('Gender is required'),
  nationalId: yup.string().required('National ID selection is required'),
  phone: yup.string().required('Phone number is required'),
  role: yup.string().oneOf(['super_admin', 'admin', 'manager', 'officer', 'viewer']).required('Role selection is required')
});

type UserFormData = {
  firstName: string;
  middleName?: string;
  lastName: string;
  username: string;
  password: string;
  gender: 'male' | 'female';
  nationalId: string;
  phone: string;
  role: 'super_admin' | 'admin' | 'manager' | 'officer' | 'viewer';
  organisationId?: string;
};

interface UserFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UserFormData & { profilePhoto?: string }) => Promise<void>;
  user?: User | null;
  title: string;
  description: string;
  submitButtonText: string;
  loading?: boolean;
  organisationId?: string;
}

const UserForm: React.FC<UserFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  user = null,
  title,
  description,
  submitButtonText,
  loading = false,
  organisationId
}) => {
  const { user: currentUser } = useAuth();
  const [profilePhoto, setProfilePhoto] = useState<string>('');
  const [clearImagePreview, setClearImagePreview] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');

  const isEditMode = !!user;
  
  // Get allowed roles based on current user's role
  const allowedRoles = getAllowedRoles(currentUser?.role || 'viewer');

  const form = useForm<UserFormData>({
    resolver: yupResolver(isEditMode ? updateUserSchema : createUserSchema),
    defaultValues: {
      firstName: '',
      middleName: '',
      lastName: '',
      username: '',
      password: '', // Always start with empty password
      gender: 'male',
      nationalId: '',
      phone: '',
      role: 'viewer',
      organisationId: organisationId || ''
    }
  });

  // Update form when user data changes (for edit mode)
  useEffect(() => {
    console.log('UserForm useEffect - user:', user);
    console.log('UserForm useEffect - isEditMode:', isEditMode);
    console.log('UserForm useEffect - user.profilePhoto:', user?.profilePhoto);
    
    if (user && isEditMode) {
      form.reset({
        firstName: user.firstName || '',
        middleName: user.middleName || '',
        lastName: user.lastName || '',
        username: user.username || '',
        password: '', // Don't pre-fill password for security
        gender: user.gender || 'male',
        nationalId: user.nationalId || '',
        phone: user.phone || '',
        role: user.role || 'viewer'
      });
      console.log('Setting profilePhoto to:', user.profilePhoto || '');
      setProfilePhoto(user.profilePhoto || '');
    } else if (!isEditMode) {
      // For new users, ensure all fields are empty and password is always empty
      form.reset({
        firstName: '',
        middleName: '',
        lastName: '',
        username: '',
        password: '',
        gender: 'male',
        nationalId: '',
        phone: '',
        role: 'viewer'
      });
      setProfilePhoto('');
    }
  }, [user, isEditMode, form]);

  const handleClose = () => {
    form.reset({
      firstName: '',
      middleName: '',
      lastName: '',
      username: '',
      password: '', // Always reset password to empty
      gender: 'male',
      nationalId: '',
      phone: '',
      role: 'viewer'
    });
    setProfilePhoto('');
    setSelectedFile(null);
    setClearImagePreview(true);
    setError('');
    setTimeout(() => setClearImagePreview(false), 100);
    onClose();
  };

  const handleSubmit = async (data: UserFormData) => {
    try {
      let imageUrl = profilePhoto;
      
      console.log('UserForm handleSubmit:', {
        selectedFile: selectedFile,
        profilePhoto: profilePhoto,
        isEditMode: isEditMode
      });
      
      // Upload the selected file if there is one
      if (selectedFile) {
        console.log('Uploading file to S3:', selectedFile.name);
        const uploadService = (await import('../services/uploadService')).default;
        const response = await uploadService.uploadSingleImage(selectedFile);
        imageUrl = response.data.imageUrl;
        console.log('Upload successful, imageUrl:', imageUrl);
        // Update the profilePhoto state with the new image URL
        setProfilePhoto(imageUrl);
      }

      const userData = {
        ...data,
        email: data.username, // Use username as email address
        profilePhoto: imageUrl || undefined
      };

      // In edit mode, if password is empty, we'll send it as empty and the backend will keep the existing password
      // If password is provided, it will be hashed and updated
      if (isEditMode && !data.password) {
        // Remove password field to keep existing password
        delete userData.password;
      }

      console.log('UserForm sending data:', userData); // Debug log
      await onSubmit(userData);
      
      // Update profilePhoto state with the final imageUrl after successful submission
      if (imageUrl) {
        setProfilePhoto(imageUrl);
      }
      
      handleClose();
    } catch (err: any) {
      console.error('UserForm error:', err);
      
      // Handle validation errors with specific field messages
      if (err.response?.status === 400 && err.response?.data?.errors) {
        // Display the first validation error message
        const firstError = err.response.data.errors[0];
        setError(firstError.msg || firstError.message || 'Validation failed');
      } else if (err.response?.status === 400 && err.response?.data?.message) {
        // Handle specific backend error messages (like duplicate username/email)
        setError(err.response.data.message);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError(err.message || 'An error occurred');
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto [&>button]:hidden bg-white p-0">
        {/* Header with gradient background */}
        <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 p-6 text-white">
          <button
            type="button"
            onClick={handleClose}
            className="absolute right-4 top-4 z-10 text-white/80 hover:text-white transition-colors"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold text-white mb-2">{title}</DialogTitle>
            <DialogDescription className="text-blue-100 text-lg">
              {description}
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="p-8 space-y-8" autoComplete="off">
          {/* Hidden fields to prevent auto-fill */}
          <input type="text" style={{ display: 'none' }} autoComplete="off" />
          <input type="password" style={{ display: 'none' }} autoComplete="off" />
          
          {/* Profile Photo Section */}
          <div className="text-center bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-8 border border-gray-200">
            <div className="flex items-center justify-center mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900">Profile Photo</h3>
            </div>
            <div className="flex justify-center">
              <ImageUpload
                onImageUploaded={(imageUrl) => setProfilePhoto(imageUrl)}
                onImageRemoved={() => setProfilePhoto('')}
                currentImageUrl={profilePhoto}
                multiple={false}
                clearPreview={clearImagePreview}
                onFileSelected={(file) => setSelectedFile(file)}
                selectedFile={selectedFile}
              />
            </div>
            <p className="text-sm text-gray-600 mt-4">
              Upload a professional photo for the user profile
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">{error}</span>
              </div>
              <button onClick={() => setError('')} className="ml-2 text-red-500 hover:text-red-700 text-lg font-bold">×</button>
            </div>
          )}

          {/* Personal Information Section */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Personal Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium text-gray-700 dark:text-gray-300">First Name *</Label>
                <Input
                  id="firstName"
                  {...form.register('firstName')}
                  className={`h-12 bg-white text-gray-900 dark:bg-slate-700 dark:text-white border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${form.formState.errors.firstName ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                  placeholder="Enter first name"
                />
                {form.formState.errors.firstName && (
                  <p className="text-red-500 text-sm">{form.formState.errors.firstName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="middleName" className="text-sm font-medium text-gray-700 dark:text-gray-300">Middle Name</Label>
                <Input
                  id="middleName"
                  {...form.register('middleName')}
                  className="h-12 bg-white text-gray-900 dark:bg-slate-700 dark:text-white border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter middle name (optional)"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium text-gray-700 dark:text-gray-300">Last Name *</Label>
                <Input
                  id="lastName"
                  {...form.register('lastName')}
                  className={`h-12 bg-white text-gray-900 dark:bg-slate-700 dark:text-white border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${form.formState.errors.lastName ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                  placeholder="Enter last name"
                />
                {form.formState.errors.lastName && (
                  <p className="text-red-500 text-sm">{form.formState.errors.lastName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender" className="text-sm font-medium text-gray-700 dark:text-gray-300">Gender *</Label>
                <Select
                  value={form.watch('gender')}
                  onValueChange={(value) => form.setValue('gender', value as 'male' | 'female')}
                >
                  <SelectTrigger className="h-12 bg-white text-gray-900 dark:bg-slate-700 dark:text-white border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
                    <SelectItem value="male" className="text-slate-900 dark:text-white data-[highlighted]:bg-blue-600 data-[highlighted]:text-white focus:bg-blue-600 focus:text-white">Male</SelectItem>
                    <SelectItem value="female" className="text-slate-900 dark:text-white data-[highlighted]:bg-blue-600 data-[highlighted]:text-white focus:bg-blue-600 focus:text-white">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="nationalId" className="text-sm font-medium text-gray-700 dark:text-gray-300">National ID *</Label>
                <Input
                  id="nationalId"
                  {...form.register('nationalId')}
                  className={`h-12 bg-white text-gray-900 dark:bg-slate-700 dark:text-white border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${form.formState.errors.nationalId ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                  placeholder="Enter national ID"
                />
                {form.formState.errors.nationalId && (
                  <p className="text-red-500 text-sm">{form.formState.errors.nationalId.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number *</Label>
                <Input
                  id="phone"
                  {...form.register('phone')}
                  className={`h-12 bg-white text-gray-900 dark:bg-slate-700 dark:text-white border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${form.formState.errors.phone ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                  placeholder="Enter phone number"
                />
                {form.formState.errors.phone && (
                  <p className="text-red-500 text-sm">{form.formState.errors.phone.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Contact Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium text-gray-700 dark:text-gray-300">Username *</Label>
                <Input
                  id="username"
                  {...form.register('username')}
                  autoComplete="new-username"
                  className={`h-12 bg-white text-gray-900 dark:bg-slate-700 dark:text-white border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${form.formState.errors.username ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                  placeholder="Enter username"
                />
                {form.formState.errors.username && (
                  <p className="text-red-500 text-sm">{form.formState.errors.username.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password {isEditMode ? '(optional)' : '*'}
                </Label>
                <PasswordInput
                  id="password"
                  {...form.register('password')}
                  autoComplete={isEditMode ? "new-password" : "new-password"}
                  className={`h-12 bg-white text-gray-900 dark:bg-slate-700 dark:text-white border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${form.formState.errors.password ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                  placeholder={isEditMode ? "Enter new password (leave blank to keep current)" : "Enter password"}
                />
                {isEditMode && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Leave blank to keep the current password
                  </p>
                )}
                {form.formState.errors.password && (
                  <p className="text-red-500 text-sm">{form.formState.errors.password.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Role and Permissions Section */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Role & Permissions</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-medium text-gray-700 dark:text-gray-300">Role *</Label>
                <Select
                  value={form.watch('role')}
                  onValueChange={(value) => form.setValue('role', value as 'super_admin' | 'admin' | 'manager' | 'officer' | 'viewer')}
                >
                  <SelectTrigger className="h-12 bg-white text-gray-900 dark:bg-slate-700 dark:text-white border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
                    {allowedRoles.map(role => (
                      <SelectItem 
                        key={role} 
                        value={role} 
                        className="text-slate-900 dark:text-white data-[highlighted]:bg-blue-600 data-[highlighted]:text-white focus:bg-blue-600 focus:text-white"
                      >
                        {role === 'super_admin' ? 'Super Admin' :
                         role === 'admin' ? 'Admin' :
                         role === 'manager' ? 'Manager' :
                         role === 'officer' ? 'Officer' :
                         role === 'viewer' ? 'Viewer' : role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.role && (
                  <p className="text-red-500 text-sm">{form.formState.errors.role.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Professional Footer with Action Buttons */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-6 border border-gray-200 dark:border-slate-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Ready to {isEditMode ? 'update' : 'create'} user?</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Review the information and click {isEditMode ? 'update' : 'create'} to {isEditMode ? 'modify' : 'add'} the user</p>
                </div>
              </div>
              <div className="flex space-x-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="h-12 px-6 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                  onClick={handleClose}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="h-12 px-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  disabled={loading}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  {loading ? 'Processing...' : submitButtonText}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserForm;
