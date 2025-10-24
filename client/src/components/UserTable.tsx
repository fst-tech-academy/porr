// @ts-nocheck
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { format } from 'date-fns';
import { 
  Eye, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  Mail,
  Phone,
  Calendar,
  User,
  Building,
  CheckCircle,
  XCircle,
  Shield,
  Users,
  UserCheck,
  UserX
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import SignedImage from './SignedImage';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import { User as UserType } from '../types';

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

// Check if a user can edit another user
const canEditUser = (editorRole: string, targetRole: string): boolean => {
  const editorLevel = ROLE_HIERARCHY[editorRole as keyof typeof ROLE_HIERARCHY] || 0;
  const targetLevel = ROLE_HIERARCHY[targetRole as keyof typeof ROLE_HIERARCHY] || 0;
  return targetLevel <= editorLevel;
};

// Check if a user can delete another user
const canDeleteUser = (deleterRole: string, targetRole: string): boolean => {
  const deleterLevel = ROLE_HIERARCHY[deleterRole as keyof typeof ROLE_HIERARCHY] || 0;
  const targetLevel = ROLE_HIERARCHY[targetRole as keyof typeof ROLE_HIERARCHY] || 0;
  return targetLevel <= deleterLevel;
};

const userSchema = yup.object({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  role: yup.string().required('Role is required'),
  nationalId: yup.string().required('National ID is required'),
  employeeId: yup.string().required('Employee ID is required'),
  phone: yup.string().optional(),
  isActive: yup.boolean().required('Active status is required'),
});

type UserFormData = yup.InferType<typeof userSchema>;

interface UserTableProps {
  users: UserType[];
  onRefresh: () => void;
  loading?: boolean;
  onEditUser?: (user: UserType) => void;
}

const UserTable: React.FC<UserTableProps> = ({ 
  users, 
  onRefresh, 
  loading: tableLoading = false,
  onEditUser
}) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  
  // Get allowed roles based on current user's role
  const allowedRoles = getAllowedRoles(user?.role || 'viewer');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Filter users based on search term, role, and status
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      (user.firstName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (user.lastName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (user.employeeId?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (user.nationalId?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && user.isActive !== false) ||
      (statusFilter === 'inactive' && user.isActive === false);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const form = useForm({
    resolver: yupResolver(userSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      role: 'viewer',
      nationalId: '',
      employeeId: '',
      phone: '',
      isActive: true,
    },
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <Shield className="h-4 w-4" />;
      case 'admin':
        return <Shield className="h-4 w-4" />;
      case 'manager':
        return <UserCheck className="h-4 w-4" />;
      case 'officer':
        return <User className="h-4 w-4" />;
      case 'viewer':
        return <Eye className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      super_admin: { label: 'Super Admin', className: 'bg-orange-100 text-orange-800' },
      admin: { label: 'Admin', className: 'bg-red-100 text-red-800' },
      manager: { label: 'Manager', className: 'bg-blue-100 text-blue-800' },
      officer: { label: 'Officer', className: 'bg-green-100 text-green-800' },
      viewer: { label: 'Viewer', className: 'bg-gray-100 text-gray-800' },
    };

    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.viewer;
    
    return (
      <Badge className={`inline-flex items-center gap-1 ${config.className}`}>
        {getRoleIcon(role)}
        {config.label}
      </Badge>
    );
  };

  const getStatusBadge = (isActive: boolean | undefined) => {
    if (isActive !== false) {
      return (
        <Badge className="inline-flex items-center gap-1 bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3" />
          Active
        </Badge>
      );
    } else {
      return (
        <Badge className="inline-flex items-center gap-1 bg-red-100 text-red-800">
          <XCircle className="h-3 w-3" />
          Inactive
        </Badge>
      );
    }
  };

  const handleView = (user: UserType) => {
    const uid = (user as any)._id || user.id;
    navigate(`/admin/users/${uid}`);
  };

  const handleEdit = (user: UserType) => {
    if (onEditUser) {
      onEditUser(user);
    } else {
      // Fallback to existing modal if onEditUser is not provided
      setSelectedUser(user);
      form.reset({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        nationalId: user.nationalId,
        employeeId: user.employeeId,
        phone: user.phone || '',
        isActive: user.isActive !== false,
      });
      setIsEditModalOpen(true);
    }
  };

  const handleDelete = (user: UserType) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleEditSubmit = async (data: any) => {
    if (!selectedUser) return;
    
    setLoading(true);
    setError('');
    
    try {
      await apiService.updateUser(selectedUser.id, data);
      setIsEditModalOpen(false);
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;
    
    setLoading(true);
    setError('');
    
    try {
      await apiService.deleteUser(selectedUser.id);
      setIsDeleteModalOpen(false);
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    const firstInitial = firstName?.charAt(0) || '';
    const lastInitial = lastName?.charAt(0) || '';
    return `${firstInitial}${lastInitial}`.toUpperCase();
  };

  return (
    <div className="bg-white">
      <div className="p-6">
        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0 sm:space-x-4 mb-6">
          <div className="relative w-full sm:w-1/3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-2 border-2 border-gray-200 rounded-lg w-full bg-white text-black focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
            />
          </div>
          <div className="flex items-center space-x-4">
            <Select
              onValueChange={(value) => setRoleFilter(value)}
              value={roleFilter}
            >
              <SelectTrigger className="w-[180px] bg-white text-black border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200">
                <Filter className="mr-2 h-4 w-4 text-gray-400" />
                <SelectValue placeholder="Filter by Role" />
              </SelectTrigger>
              <SelectContent className="bg-white text-black border-gray-200">
                <SelectItem value="all" className="data-[highlighted]:bg-blue-500 data-[highlighted]:text-white data-[state=checked]:bg-blue-500 data-[state=checked]:text-white">All Roles</SelectItem>
                {allowedRoles.map(role => (
                  <SelectItem 
                    key={role} 
                    value={role} 
                    className="data-[highlighted]:bg-blue-500 data-[highlighted]:text-white data-[state=checked]:bg-blue-500 data-[state=checked]:text-white"
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
            <Select
              onValueChange={(value) => setStatusFilter(value)}
              value={statusFilter}
            >
              <SelectTrigger className="w-[180px] bg-white text-black border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200">
                <CheckCircle className="mr-2 h-4 w-4 text-gray-400" />
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent className="bg-white text-black border-gray-200">
                <SelectItem value="all" className="data-[highlighted]:bg-blue-500 data-[highlighted]:text-white data-[state=checked]:bg-blue-500 data-[state=checked]:text-white">All Statuses</SelectItem>
                <SelectItem value="active" className="data-[highlighted]:bg-blue-500 data-[highlighted]:text-white data-[state=checked]:bg-blue-500 data-[state=checked]:text-white">Active</SelectItem>
                <SelectItem value="inactive" className="data-[highlighted]:bg-blue-500 data-[highlighted]:text-white data-[state=checked]:bg-blue-500 data-[state=checked]:text-white">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto rounded-lg border-2 border-gray-200 shadow-lg">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
              <tr>
                <th className="text-left p-4 font-bold text-gray-800 text-sm uppercase tracking-wide">User</th>
                <th className="text-left p-4 font-bold text-gray-800 text-sm uppercase tracking-wide">Email</th>
                <th className="text-left p-4 font-bold text-gray-800 text-sm uppercase tracking-wide">Role</th>
                <th className="text-left p-4 font-bold text-gray-800 text-sm uppercase tracking-wide">National ID</th>
                <th className="text-left p-4 font-bold text-gray-800 text-sm uppercase tracking-wide">Employee ID</th>
                <th className="text-left p-4 font-bold text-gray-800 text-sm uppercase tracking-wide">Status</th>
                <th className="text-left p-4 font-bold text-gray-800 text-sm uppercase tracking-wide">Last Login</th>
                <th className="text-right p-4 font-bold text-gray-800 text-sm uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tableLoading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-500">
                    Loading users...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-500">
                    No users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, index) => (
                  <tr 
                    key={(user as any)._id || user.id}
                    className={`border-b border-gray-200 hover:bg-blue-50 transition-all duration-200 cursor-pointer ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                    onClick={() => handleView(user)}
                  >
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        {user.profilePhoto ? (
                          <SignedImage
                            src={user.profilePhoto}
                            alt={`${user.firstName} ${user.lastName}`}
                            className="h-10 w-10"
                            fallback={getInitials(user.firstName, user.lastName)}
                            size="md"
                          />
                        ) : (
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-blue-100 text-blue-800">
                              {getInitials(user.firstName, user.lastName)}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </p>
                          {user.phone && (
                            <p className="text-sm text-gray-500 flex items-center">
                              <Phone className="h-3 w-3 mr-1" />
                              {user.phone}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center text-gray-600">
                        <Mail className="h-4 w-4 mr-2" />
                        {user.email}
                      </div>
                    </td>
                    <td className="p-4">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="p-4 text-gray-900">
                      <div className="flex items-center">
                        <Building className="h-4 w-4 mr-2 text-gray-400" />
                        {user.nationalId}
                      </div>
                    </td>
                    <td className="p-4 text-gray-900 font-mono text-sm">
                      {user.employeeId}
                    </td>
                    <td className="p-4">
                      {getStatusBadge(user.isActive)}
                    </td>
                    <td className="p-4 text-gray-600">
                      {user.lastLogin ? (
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          {format(new Date(user.lastLogin), 'MMM d, yyyy')}
                        </div>
                      ) : (
                        <span className="text-gray-400">Never</span>
                      )}
                    </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end space-x-2">
                          {canEditUser(user?.role || 'viewer', user.role) && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={(e) => { e.stopPropagation(); handleEdit(user); }}
                              className="bg-white text-blue-600 border-2 border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 shadow-sm"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {canDeleteUser(user?.role || 'viewer', user.role) && user.id !== user?.id && (
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              className="bg-white text-red-600 border-2 border-red-200 hover:bg-red-50 hover:border-red-300 transition-all duration-200 shadow-sm"
                              onClick={(e) => { e.stopPropagation(); handleDelete(user); }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* View User Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl bg-white text-black">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">
              User Details
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              View detailed information about this user.
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-6">
              {/* User Profile */}
              <div className="flex items-center space-x-4">
                {selectedUser.profilePhoto ? (
                  <SignedImage
                    src={selectedUser.profilePhoto}
                    alt={`${selectedUser.firstName} ${selectedUser.lastName}`}
                    className="h-20 w-20"
                    fallback={getInitials(selectedUser.firstName, selectedUser.lastName)}
                    size="xl"
                  />
                ) : (
                  <Avatar className="h-20 w-20">
                    <AvatarFallback className="bg-blue-100 text-blue-800 text-lg">
                      {getInitials(selectedUser.firstName, selectedUser.lastName)}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </h3>
                  <p className="text-slate-600">{selectedUser.email}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    {getRoleBadge(selectedUser.role)}
                    {getStatusBadge(selectedUser.isActive)}
                  </div>
                </div>
              </div>

              {/* User Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-slate-600">Employee ID</Label>
                    <p className="text-slate-900 font-mono">{selectedUser.employeeId}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-600">National ID</Label>
                    <p className="text-slate-900">{selectedUser.nationalId}</p>
                  </div>
                  {selectedUser.phone && (
                    <div>
                      <Label className="text-sm font-medium text-slate-600">Phone</Label>
                      <p className="text-slate-900">{selectedUser.phone}</p>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-slate-600">Created</Label>
                    <p className="text-slate-900">
                      {format(new Date(selectedUser.createdAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-600">Last Login</Label>
                    <p className="text-slate-900">
                      {selectedUser.lastLogin 
                        ? format(new Date(selectedUser.lastLogin), 'MMM d, yyyy HH:mm')
                        : 'Never'
                      }
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-600">Email Verified</Label>
                    <p className="text-slate-900">
                      {selectedUser.emailVerified ? 'Yes' : 'No'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl bg-white text-black">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">
              Edit User
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              Update user information.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={form.handleSubmit(handleEditSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName" className="text-slate-700">First Name</Label>
                <Input
                  id="firstName"
                  {...form.register('firstName')}
                  className="bg-white text-black border-gray-200"
                />
                {form.formState.errors.firstName && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.firstName.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="lastName" className="text-slate-700">Last Name</Label>
                <Input
                  id="lastName"
                  {...form.register('lastName')}
                  className="bg-white text-black border-gray-200"
                />
                {form.formState.errors.lastName && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.lastName.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="email" className="text-slate-700">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...form.register('email')}
                  className="bg-white text-black border-gray-200"
                />
                {form.formState.errors.email && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.email.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="phone" className="text-slate-700">Phone</Label>
                <Input
                  id="phone"
                  {...form.register('phone')}
                  className="bg-white text-black border-gray-200"
                />
              </div>
              <div>
                <Label htmlFor="role" className="text-slate-700">Role</Label>
                <Select
                  value={form.watch('role')}
                  onValueChange={(value) => form.setValue('role', value as any)}
                >
                  <SelectTrigger className="bg-white text-black border-gray-200">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-black border-gray-200">
                    {allowedRoles.map(role => (
                      <SelectItem key={role} value={role}>
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
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.role.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="National ID" className="text-slate-700">National ID</Label>
                <Input
                  id="National ID"
                  {...form.register('nationalId')}
                  className="bg-white text-black border-gray-200"
                />
                {form.formState.errors.nationalId && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.nationalId.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="employeeId" className="text-slate-700">Employee ID</Label>
                <Input
                  id="employeeId"
                  {...form.register('employeeId')}
                  className="bg-white text-black border-gray-200"
                />
                {form.formState.errors.employeeId && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.employeeId.message}</p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  {...form.register('isActive')}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="isActive" className="text-slate-700">Active User</Label>
              </div>
            </div>

            <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)} className="bg-white text-black border-gray-200 hover:bg-gray-50">
              Cancel
            </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Updating...' : 'Update User'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete User Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="w-full max-w-lg bg-white text-black">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">
              Delete User
            </DialogTitle>
            <DialogDescription className="text-slate-600 text-sm leading-relaxed">
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="py-4">
              <p className="text-slate-900">
                <strong>{selectedUser.firstName} {selectedUser.lastName}</strong> ({selectedUser.email})
              </p>
            </div>
          )}
          
          <div className="flex justify-end gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsDeleteModalOpen(false)} 
              className="px-4 py-2 min-w-[80px] bg-white text-black border-gray-200 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              variant="destructive" 
              onClick={handleDeleteConfirm} 
              disabled={loading}
              className="px-4 py-2 min-w-[120px] bg-slate-50 hover:bg-red-100 text-red-600 hover:text-red-700"
            >
              {loading ? 'Deleting...' : 'Delete User'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserTable;
