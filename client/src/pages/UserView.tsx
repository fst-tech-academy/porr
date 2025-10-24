import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import apiService from '../services/api';
import { User as UserType } from '../types';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import SignedImage from '../components/SignedImage';
import { ArrowLeft, Mail, Phone, Shield, Users } from 'lucide-react';

const UserView: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchUser(id);
    }
  }, [id]);

  const fetchUser = async (userId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getUser(userId);
      if (response.success && response.data) {
        setSelectedUser(response.data.user);
      } else {
        setError('Failed to fetch user details');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load user');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const roleConfig: Record<string, { label: string; color: string }> = {
      super_admin: { label: 'Super Admin', color: 'bg-purple-100 text-purple-800' },
      admin: { label: 'Admin', color: 'bg-blue-100 text-blue-800' },
      manager: { label: 'Manager', color: 'bg-green-100 text-green-800' },
      officer: { label: 'Officer', color: 'bg-amber-100 text-amber-800' },
      viewer: { label: 'Viewer', color: 'bg-gray-100 text-gray-800' },
    };
    const config = roleConfig[role] || roleConfig.viewer;
    return (
      <Badge className={`inline-flex items-center gap-1 ${config.color}`}>
        <Users className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getStatusBadge = (isActive: boolean | undefined) => {
    if (isActive !== false) {
      return (
        <Badge className="inline-flex items-center gap-1 bg-green-100 text-green-800">
          Active
        </Badge>
      );
    }
    return (
      <Badge className="inline-flex items-center gap-1 bg-red-100 text-red-800">
        Inactive
      </Badge>
    );
  };

  const getInitials = (firstName: string, lastName: string) => `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user details...</p>
        </div>
      </div>
    );
  }

  if (error || !selectedUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading User</h2>
          <p className="text-gray-600 mb-4">{error || 'User not found'}</p>
          <Button onClick={() => navigate('/admin/users')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto px-6 lg:px-12 py-4">
          <div className="mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/admin/users')}
              className="flex items-center gap-2 bg-white border-gray-300 shadow-sm hover:shadow-md hover:bg-gray-100"
            >
              <ArrowLeft className="h-4 w-4" />
              Back 
            </Button>
          </div>

          <div className="flex items-start gap-6">
            <div className="flex-shrink-0">
              {selectedUser.profilePhoto ? (
                <SignedImage
                  src={selectedUser.profilePhoto}
                  alt={`${selectedUser.firstName} ${selectedUser.lastName}`}
                  className="h-32 w-32 rounded-lg"
                  fallback={getInitials(selectedUser.firstName, selectedUser.lastName)}
                  size="xl"
                />
              ) : (
                <Avatar className="h-32 w-32 rounded-lg">
                  <AvatarFallback className="bg-blue-600 text-white text-3xl rounded-lg">
                    {getInitials(selectedUser.firstName, selectedUser.lastName)}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </h1>
                  <p className="text-lg text-gray-600 mb-2">
                    {selectedUser.email}
                  </p>
                </div>
                <div className="space-x-2">
                  {getRoleBadge(selectedUser.role)}
                  {getStatusBadge(selectedUser.isActive)}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-6 w-6 rounded bg-green-600 flex items-center justify-center">
                      <Mail className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900">Contact</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-900 flex items-center gap-1"><Phone className="h-3 w-3 text-gray-400" /> {selectedUser.phone || '-'}</p>
                    <p className="text-gray-900">National ID: {selectedUser.nationalId}</p>
                    <p className="text-gray-900">Employee ID: {selectedUser.employeeId || '-'}</p>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-6 w-6 rounded bg-purple-600 flex items-center justify-center">
                      <Users className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900">Role & Status</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-900">Role: {selectedUser.role}</p>
                    <p className="text-gray-900">Active: {selectedUser.isActive !== false ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserView;


