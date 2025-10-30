import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Building2,
  Users,
  Settings,
  Activity,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  CheckCircle,
  XCircle,
  Crown,
  Globe,
  TrendingUp,
  BarChart3,
  UserPlus,
  Edit,
  Trash2,
  MoreVertical,
  Download,
  Upload,
  RefreshCw,
  AlertCircle,
  Star,
  Award,
  Target,
  Zap,
  Eye,
  ToggleLeft,
  ToggleRight,
  Filter,
  Search
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Switch } from '../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Organisation, User } from '../types';
import SettingsPage from './Settings';
import apiService from '../services/api';
import UserForm from '../components/UserForm';

const OrganisationProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [organisation, setOrganisation] = useState<Organisation | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const initialTab = new URLSearchParams(location.search).get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [usersPage, setUsersPage] = useState(1);
  const [usersLimit] = useState(10);
  const [usersTotal, setUsersTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleCreateUser = async (userData: any) => {
    if (!id) return;
    
    setIsCreatingUser(true);
    try {
      const response = await apiService.createUser({
        ...userData,
        organisationId: id
      });
      
      if (response.success) {
        setIsUserFormOpen(false);
        await fetchUsers(); // Refresh the users list
      } else {
        setError(response.message || 'Failed to create user');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create user');
    } finally {
      setIsCreatingUser(false);
    }
  };

  const fetchOrganisation = async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getOrganisation(id);
      if (response.success) {
        setOrganisation(response.data.organisation);
      } else {
        setError(response.message || 'Failed to fetch organisation');
      }
    } catch (err: any) {
      console.error('Error fetching organisation:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    if (!id) return;
    
    try {
      const response = await apiService.getOrganisationUsers(id, {
        page: usersPage,
        limit: usersLimit,
        search: searchTerm,
        role: roleFilter !== 'all' ? roleFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });
      
      if (response.success) {
        setUsers(response.data.users);
        setUsersTotal(response.data.total);
      }
    } catch (err: any) {
      console.error('Error fetching users:', err);
    }
  };

  useEffect(() => {
    fetchOrganisation();
  }, [id]);

  useEffect(() => {
    const tab = new URLSearchParams(location.search).get('tab');
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [location.search]);

  useEffect(() => {
    if (organisation) {
      fetchUsers();
    }
  }, [organisation, usersPage, searchTerm, roleFilter, statusFilter]);

  const handleToggleStatus = async () => {
    if (!organisation) return;
    
    try {
      await apiService.toggleOrganisationStatus(organisation._id);
      await fetchOrganisation();
    } catch (err: any) {
      setError(err.message || 'Failed to toggle organisation status');
    }
  };

  const handleDeleteOrganisation = async () => {
    if (!organisation) return;
    setIsDeleting(true);
    try {
      await apiService.deleteOrganisation(organisation._id);
      navigate('/organisations');
    } catch (err: any) {
      setError(err.message || 'Failed to delete organisation');
    }
    finally {
      setIsDeleting(false);
      setConfirmOpen(false);
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-green-100 text-green-800 border-green-200">
        <CheckCircle className="h-3 w-3 mr-1" />
        Active
      </Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800 border-red-200">
        <XCircle className="h-3 w-3 mr-1" />
        Inactive
      </Badge>
    );
  };

  const getPlanBadge = (plan: string) => {
    const planColors = {
      free: 'bg-gray-100 text-gray-800 border-gray-200',
      basic: 'bg-blue-100 text-blue-800 border-blue-200',
      premium: 'bg-purple-100 text-purple-800 border-purple-200',
      enterprise: 'bg-orange-100 text-orange-800 border-orange-200',
    };

    return (
      <Badge className={`text-xs font-medium ${planColors[plan as keyof typeof planColors] || planColors.free}`}>
        {plan.charAt(0).toUpperCase() + plan.slice(1)}
      </Badge>
    );
  };

  const getRoleBadge = (role: string) => {
    const roleColors = {
      super_admin: 'bg-red-100 text-red-800 border-red-200',
      admin: 'bg-purple-100 text-purple-800 border-purple-200',
      manager: 'bg-blue-100 text-blue-800 border-blue-200',
      officer: 'bg-green-100 text-green-800 border-green-200',
      viewer: 'bg-gray-100 text-gray-800 border-gray-200',
    };

    return (
      <Badge className={`text-xs font-medium ${roleColors[role as keyof typeof roleColors] || roleColors.viewer}`}>
        {role.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-blue-600 animate-pulse" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading Organisation</h3>
          <p className="text-gray-600">Please wait while we fetch the details...</p>
        </div>
      </div>
    );
  }

  if (error || !organisation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <Card className="border-red-200 bg-red-50/50">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-red-900 mb-2">Error Loading Organisation</h3>
              <p className="text-red-700 mb-6">{error || 'Organisation not found'}</p>
              <Button
                onClick={() => navigate('/organisations')}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Organisations
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
            <div className="absolute top-20 right-20 w-16 h-16 bg-white/10 rounded-full animate-pulse delay-1000"></div>
            <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-white/10 rounded-full animate-pulse delay-2000"></div>
          </div>
        </div>
        <div className="relative max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/organisations')}
                className="text-white hover:bg-white/20 p-2 rounded-xl bg-transparent hover:bg-white/20"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">{organisation.name}</h1>
                  <p className="text-blue-100 text-lg">{organisation.description || 'No description available'}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {getStatusBadge(organisation.settings.isActive)}
              {getPlanBadge(organisation.subscription.plan)}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl p-2">
            <TabsTrigger value="overview" className="rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Users className="w-4 h-4 mr-2" />
              Users ({usersTotal})
            </TabsTrigger>
            <TabsTrigger value="settings" className="rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="activity" className="rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Activity className="w-4 h-4 mr-2" />
              Activity
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Organisation Details */}
              <Card className="lg:col-span-2 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
                  <CardTitle className="flex items-center space-x-2 text-gray-900">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-900">Organisation Details</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Organisation Name</Label>
                        <p className="text-lg font-semibold text-gray-900">{organisation.name}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Description</Label>
                        <p className="text-gray-700">{organisation.description || 'No description available'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Email</Label>
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-blue-500" />
                          <span className="text-gray-700">{organisation.email}</span>
                        </div>
                      </div>
                      {organisation.phone && (
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Phone</Label>
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4 text-green-500" />
                            <span className="text-gray-700">{organisation.phone}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Subscription Plan</Label>
                        <div className="flex items-center space-x-2 mt-1">
                          {getPlanBadge(organisation.subscription.plan)}
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Status</Label>
                        <div className="flex items-center space-x-2 mt-1">
                          {getStatusBadge(organisation.settings.isActive)}
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Max Users</Label>
                        <p className="text-lg font-semibold text-blue-600">{organisation.settings.maxUsers}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Created</Label>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-700">
                            {new Date(organisation.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {organisation.address && (
                    <div className="border-t border-gray-100 pt-6">
                      <Label className="text-sm font-medium text-gray-600 mb-3 block">Address</Label>
                      <div className="flex items-start space-x-2">
                        <MapPin className="w-4 h-4 text-red-500 mt-1" />
                        <div className="text-gray-700">
                          {organisation.address.street && <p>{organisation.address.street}</p>}
                          <p>
                            {organisation.address.city}, {organisation.address.state}
                          </p>
                          <p>
                            {organisation.address.country} {organisation.address.postalCode}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Admin User Details */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-100">
                  <CardTitle className="flex items-center space-x-2 text-gray-900">
                    <Shield className="w-5 h-5 text-green-600" />
                    <span className="text-gray-900">Admin User</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {organisation.adminUser ? (
                    <>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Name</Label>
                        <p className="text-lg font-semibold text-gray-900">
                          {organisation.adminUser.firstName} {organisation.adminUser.lastName}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Email</Label>
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-blue-500" />
                          <span className="text-gray-700">{organisation.adminUser.email}</span>
                        </div>
                      </div>
                      {organisation.adminUser.phone && (
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Phone</Label>
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4 text-green-500" />
                            <span className="text-gray-700">{organisation.adminUser.phone}</span>
                          </div>
                        </div>
                      )}
                      {organisation.adminUser.nationalId && (
                        <div>
                          <Label className="text-sm font-medium text-gray-600">National ID</Label>
                          <p className="text-gray-700">{organisation.adminUser.nationalId}</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">No admin user assigned</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Features */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-100">
                <CardTitle className="flex items-center space-x-2 text-gray-900">
                  <Zap className="w-5 h-5 text-purple-600" />
                  <span className="text-gray-900">Enabled Features</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(organisation.settings.features).map(([feature, enabled]) => (
                    <div key={feature} className="flex items-center space-x-3 p-3 rounded-xl bg-gray-50">
                      {enabled ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                      <span className="text-sm font-medium text-gray-700">
                        {feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2 text-gray-900">
                    <Users className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-900">Organisation Users</span>
                  </CardTitle>
                  <Button 
                    onClick={() => setIsUserFormOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add User
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {/* Search and Filters */}
                <div className="flex flex-col lg:flex-row gap-4 mb-6 bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-12 border border-gray-300 bg-white focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-xl text-black placeholder:text-gray-500"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                      <SelectTrigger className="w-40 h-12 border border-gray-300 bg-white focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-xl text-black">
                        <SelectValue placeholder="Role" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 shadow-lg">
                        <SelectItem value="all" className="text-black hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer">All Roles</SelectItem>
                        <SelectItem value="admin" className="text-black hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer">Admin</SelectItem>
                        <SelectItem value="manager" className="text-black hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer">Manager</SelectItem>
                        <SelectItem value="officer" className="text-black hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer">Officer</SelectItem>
                        <SelectItem value="viewer" className="text-black hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-40 h-12 border border-gray-300 bg-white focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-xl text-black">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 shadow-lg">
                        <SelectItem value="all" className="text-black hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer">All Status</SelectItem>
                        <SelectItem value="active" className="text-black hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer">Active</SelectItem>
                        <SelectItem value="inactive" className="text-black hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={() => fetchUsers()}
                      variant="outline"
                      className="h-12 px-6 border border-gray-300 bg-white hover:bg-gray-50 rounded-xl text-black"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                </div>

                {/* Users Table */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead className="font-semibold text-gray-900">User</TableHead>
                        <TableHead className="font-semibold text-gray-900">Role</TableHead>
                        <TableHead className="font-semibold text-gray-900">Status</TableHead>
                        <TableHead className="font-semibold text-gray-900">Last Login</TableHead>
                        <TableHead className="font-semibold text-gray-900">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id} className="hover:bg-gray-50">
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                                <span className="text-white font-semibold text-sm">
                                  {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {user.firstName} {user.lastName}
                                </p>
                                <p className="text-sm text-gray-600">{user.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getRoleBadge(user.role)}
                          </TableCell>
                          <TableCell>
                            {user.emailVerified ? (
                              <Badge className="bg-green-100 text-green-800 border-green-200">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Active
                              </Badge>
                            ) : (
                              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Pending
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {user.lastLogin ? (
                              <span className="text-sm text-gray-600">
                                {new Date(user.lastLogin).toLocaleDateString()}
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400">Never</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit User
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600 focus:text-red-600">
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete User
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-600">
                    Showing {((usersPage - 1) * usersLimit) + 1} to {Math.min(usersPage * usersLimit, usersTotal)} of {usersTotal} users
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setUsersPage(prev => Math.max(1, prev - 1))}
                      disabled={usersPage === 1}
                      className="border-gray-200 hover:bg-gray-50"
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-gray-600 px-3">
                      Page {usersPage} of {Math.ceil(usersTotal / usersLimit)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setUsersPage(prev => prev + 1)}
                      disabled={usersPage >= Math.ceil(usersTotal / usersLimit)}
                      className="border-gray-200 hover:bg-gray-50"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-100">
                <CardTitle className="flex items-center space-x-2 text-gray-900">
                  <Settings className="w-5 h-5 text-purple-600" />
                  <span className="text-gray-900">Organisation Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <h3 className="font-semibold text-gray-900">Organisation Status</h3>
                      <p className="text-sm text-gray-600">Enable or disable this organisation</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(organisation.settings.isActive)}
                      <Switch
                        checked={organisation.settings.isActive}
                        onCheckedChange={handleToggleStatus}
                        aria-label="Toggle organisation status"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <h3 className="font-semibold text-gray-900">Delete Organisation</h3>
                      <p className="text-sm text-gray-600">Permanently delete this organisation and all its data</p>
                    </div>
                    <Button
                      onClick={() => setConfirmOpen(true)}
                      variant="destructive"
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Global Settings merged under organisation settings */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-gray-100">
                <CardTitle className="flex items-center space-x-2 text-gray-900">
                  <Settings className="w-5 h-5 text-indigo-600" />
                  <span className="text-gray-900">System Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {/* Reuse existing Settings page component */}
                <div className="p-6">
                  <SettingsPage />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b border-gray-100">
                <CardTitle className="flex items-center space-x-2 text-gray-900">
                  <Activity className="w-5 h-5 text-orange-600" />
                  <span className="text-gray-900">Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center py-12">
                  <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Activity Yet</h3>
                  <p className="text-gray-600">Activity logs will appear here once users start using the system.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

    {/* Confirm Delete Dialog */}
    <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete organisation?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete {organisation.name} and all of its data.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button variant="destructive" onClick={handleDeleteOrganisation} disabled={isDeleting}>
            {isDeleting ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

      {/* User Form Modal */}
      <UserForm
        isOpen={isUserFormOpen}
        onClose={() => setIsUserFormOpen(false)}
        onSubmit={handleCreateUser}
        title="Add New User"
        description="Create a new user for this organisation"
        submitButtonText="Create User"
        loading={isCreatingUser}
        organisationId={id}
      />
    </div>
  );
};

export default OrganisationProfile;
