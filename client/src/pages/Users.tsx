import React, { useState, useEffect } from 'react';
import { User } from '../types';
import apiService from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import UserTable from '../components/UserTable';
import ShadcnPagination from '../components/ui/shadcn-pagination';
import UserForm from '../components/UserForm';
import { Plus, Users as UsersIcon, UserCheck, Shield, UserX, TrendingUp, Activity } from 'lucide-react';

const Users: React.FC = () => {
  const { user, token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Server-side pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async (page: number = 1) => {
    try {
      setLoading(true);
      console.log('Fetching users with:', { page, limit: itemsPerPage }); // Debug
      const response = await apiService.getUsers({ page, limit: itemsPerPage });
      console.log('API Response:', response); // Debug
      setUsers(response.data.users);
      
      if (response.data.pagination) {
        setCurrentPage(response.data.pagination.current || page);
        setTotalPages(response.data.pagination.pages || 1);
        setTotalItems(response.data.pagination.total || 0);
      } else {
        setCurrentPage(page);
        setTotalPages(1);
        setTotalItems(response.data.users.length);
      }
    } catch (err: any) {
      console.error('Error fetching users:', err); // Debug
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
  };

  const handleCreateUser = async (data: any) => {
    setFormLoading(true);
    try {
      await apiService.createUser(data);
      await fetchUsers();
      handleCloseDialog();
    } catch (err: any) {
      throw err; // Let UserForm handle the error display
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateUser = async (data: any) => {
    if (!editingUser) return;
    
    setFormLoading(true);
    try {
      const updatedUser = await apiService.updateUser(editingUser._id, data);
      // Update the editingUser state with the new data including the photo
      setEditingUser(updatedUser.data.user);
      await fetchUsers();
      handleCloseDialog();
    } catch (err: any) {
      throw err; // Let UserForm handle the error display
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setOpenDialog(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-lg h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  console.log('Users data:', users); // Debug log

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
              <UsersIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-600 mt-1">Manage system users and their permissions</p>
            </div>
          </div>
          <Button 
            onClick={() => setOpenDialog(true)}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3"
          >
            <Plus className="mr-2 h-5 w-5" />
            Add New User
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Users Card */}
        <Card className="border-2 border-gray-200 shadow-xl bg-white rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{totalItems}</p>
                <p className="text-xs text-gray-500 mt-1">All registered users</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl">
                <UsersIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Users Card */}
        <Card className="border-2 border-gray-200 shadow-xl bg-white rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Active Users</p>
                <p className="text-3xl font-bold text-green-600">{users.filter(u => u.isActive).length}</p>
                <p className="text-xs text-gray-500 mt-1">Currently active</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-green-100 to-green-200 rounded-xl">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Admin Users Card */}
        <Card className="border-2 border-gray-200 shadow-xl bg-white rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Administrators</p>
                <p className="text-3xl font-bold text-purple-600">{users.filter(u => u.role === 'admin' || u.role === 'super_admin').length}</p>
                <p className="text-xs text-gray-500 mt-1">Admin & Super Admin</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inactive Users Card */}
        <Card className="border-2 border-gray-200 shadow-xl bg-white rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Inactive Users</p>
                <p className="text-3xl font-bold text-red-600">{users.filter(u => !u.isActive).length}</p>
                <p className="text-xs text-gray-500 mt-1">Pending activation</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-red-100 to-red-200 rounded-xl">
                <UserX className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Role Distribution Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Managers */}
        <Card className="border-2 border-gray-200 shadow-xl bg-white rounded-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 border-b border-green-600 pb-4">
            <CardTitle className="text-lg font-bold text-white flex items-center space-x-2">
              <Activity className="h-5 w-5 text-white" />
              <span>Managers</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-green-600">{users.filter(u => u.role === 'manager').length}</p>
              <p className="text-sm text-gray-600 mt-2">Management Level</p>
            </div>
          </CardContent>
        </Card>

        {/* Officers */}
        <Card className="border-2 border-gray-200 shadow-xl bg-white rounded-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 border-b border-orange-600 pb-4">
            <CardTitle className="text-lg font-bold text-white flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-white" />
              <span>Officers</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-orange-600">{users.filter(u => u.role === 'officer').length}</p>
              <p className="text-sm text-gray-600 mt-2">Operational Level</p>
            </div>
          </CardContent>
        </Card>

        {/* Viewers */}
        <Card className="border-2 border-gray-200 shadow-xl bg-white rounded-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-gray-500 to-gray-600 border-b border-gray-600 pb-4">
            <CardTitle className="text-lg font-bold text-white flex items-center space-x-2">
              <UsersIcon className="h-5 w-5 text-white" />
              <span>Viewers</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-gray-600">{users.filter(u => u.role === 'viewer').length}</p>
              <p className="text-sm text-gray-600 mt-2">Read-Only Access</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Table */}
      <Card className="border-2 border-gray-200 shadow-xl bg-white rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 border-b border-blue-600 pb-4">
          <CardTitle className="text-xl font-bold text-white flex items-center space-x-2">
            <UsersIcon className="h-5 w-5 text-white" />
            <span>User Directory</span>
          </CardTitle>
          <p className="text-sm text-blue-100 mt-1">Manage and monitor all system users</p>
        </CardHeader>
        <CardContent className="p-0">
          <UserTable 
            users={users} 
            onRefresh={() => fetchUsers()} 
            loading={loading}
            onEditUser={handleEditUser}
          />

          {/* Pagination */}
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <ShadcnPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onRefresh={(page) => fetchUsers(page)}
            />
          </div>
        </CardContent>
      </Card>

      {/* User Form Dialog */}
      <UserForm
        isOpen={openDialog}
        onClose={handleCloseDialog}
        onSubmit={editingUser ? handleUpdateUser : handleCreateUser}
        user={editingUser}
        title={editingUser ? "Edit User" : "Add New User"}
        description={editingUser ? "Update user information and permissions" : "Create a comprehensive user profile with photo and complete information"}
        submitButtonText={editingUser ? "Update User" : "Create User"}
        loading={formLoading}
      />
    </div>
  );
};

export default Users;