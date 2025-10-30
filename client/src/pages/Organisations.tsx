import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Building2,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  ToggleLeft,
  ToggleRight,
  Users,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  Crown,
  Globe,
  TrendingUp,
  Settings,
  MoreVertical,
  Download,
  Upload,
  RefreshCw,
  Zap,
  Award,
  Target,
  BarChart3,
  Activity,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Organisation, OrganisationFormData } from '../types';
import apiService from '../services/api';

const organisationSchema = yup.object({
  name: yup.string().required('Organisation name is required'),
  description: yup.string().optional(),
  email: yup.string().email('Valid email is required').required('Email is required'),
  phone: yup.string().optional(),
  address: yup.object({
    street: yup.string().optional(),
    city: yup.string().optional(),
    state: yup.string().optional(),
    country: yup.string().optional(),
    postalCode: yup.string().optional(),
  }).optional(),
  settings: yup.object({
    maxUsers: yup.number().min(1, 'Max users must be at least 1').required('Max users is required'),
    features: yup.object({
      userManagement: yup.boolean().default(true),
      caseManagement: yup.boolean().default(true),
      offenceRecords: yup.boolean().default(true),
      fileUploads: yup.boolean().default(true),
      emailNotifications: yup.boolean().default(true),
      auditLogging: yup.boolean().default(true),
      dashboardAnalytics: yup.boolean().default(true),
    }).required(),
  }).required(),
  subscription: yup.object({
    plan: yup.string().oneOf(['free', 'basic', 'premium', 'enterprise']).required('Plan is required'),
    endDate: yup.string().optional(),
  }).required(),
  adminUser: yup.object({
    firstName: yup.string().required('Admin first name is required'),
    lastName: yup.string().required('Admin last name is required'),
    email: yup.string().email('Valid email is required').required('Admin email is required'),
    password: yup.string().min(8, 'Password must be at least 8 characters').required('Admin password is required'),
    phone: yup.string().optional(),
    nationalId: yup.string().optional(),
  }).required(),
});

const Organisations: React.FC = () => {
  const navigate = useNavigate();
  const [organisations, setOrganisations] = useState<Organisation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [editingOrganisation, setEditingOrganisation] = useState<Organisation | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrganisations, setTotalOrganisations] = useState(0);
  const [limit] = useState(10);
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

  const form = useForm<OrganisationFormData>({
    resolver: yupResolver(organisationSchema),
  });

  useEffect(() => {
    fetchOrganisations();
  }, [currentPage, searchTerm, statusFilter, planFilter]);

  const fetchOrganisations = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiService.getOrganisations({
        page: currentPage,
        limit: limit,
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        plan: planFilter !== 'all' ? planFilter : undefined,
      });
      if (response.success) {
        setOrganisations(response.data.organisations || []);
        setTotalOrganisations(response.data.total || 0);
        setTotalPages(Math.ceil((response.data.total || 0) / limit));
      } else {
        setError(response.message || 'Failed to fetch organisations');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch organisations');
    } finally {
      setLoading(false);
    }
  };

  // Filtering is now handled on the backend

  const handleEditOrganisation = (organisation: Organisation) => {
    setEditingOrganisation(organisation);
    form.reset({
      name: organisation.name,
      description: organisation.description,
      email: organisation.email,
      phone: organisation.phone,
      address: organisation.address,
      settings: {
        maxUsers: organisation.settings.maxUsers,
        features: organisation.settings.features,
      },
      subscription: {
        plan: organisation.subscription.plan,
        endDate: organisation.subscription.endDate,
      },
      adminUser: {
        firstName: organisation.adminUser?.firstName || '',
        lastName: organisation.adminUser?.lastName || '',
        email: organisation.adminUser?.email || '',
        password: '', // Don't pre-fill password
        phone: organisation.adminUser?.phone || '',
        nationalId: '',
      },
    });
    setOpenDialog(true);
  };

  const handleToggleStatus = async (organisation: Organisation) => {
    try {
      await apiService.toggleOrganisationStatus(organisation._id);
      await fetchOrganisations();
    } catch (err: any) {
      setError(err.message || 'Failed to toggle organisation status');
    }
  };

  const handleDeleteOrganisation = async (organisation: Organisation) => {
    if (!confirm(`Are you sure you want to delete "${organisation.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await apiService.deleteOrganisation(organisation._id);
      await fetchOrganisations();
    } catch (err: any) {
      setError(err.message || 'Failed to delete organisation');
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
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading Organisations</h3>
          <p className="text-gray-600">Please wait while we fetch your data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <Card className="border-red-200 bg-red-50/50">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-red-900 mb-2">Error Loading Organisations</h3>
              <p className="text-red-700 mb-6">{error}</p>
              <Button 
                onClick={() => fetchOrganisations()} 
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
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
          <div className="flex items-center justify-between">
            <div className="text-white">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold">Organisation Management</h1>
                  <p className="text-blue-100 text-lg">Manage and monitor all organisations</p>
                </div>
              </div>
              <div className="flex items-center space-x-6 text-blue-100">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>{organisations.length} Organisations</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span>Secure Management</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4" />
                  <span>Multi-tenant System</span>
                </div>
              </div>
            </div>
            <div className="hidden lg:block">
              <Button
                onClick={() => {
                  console.log('Add Organisation button clicked');
                  navigate('/organisations/new');
                }}
                className="bg-white/20 hover:bg-white/30 text-white border border-white/30 px-8 py-4 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 backdrop-blur-sm flex items-center space-x-3 group"
              >
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <Plus className="w-4 h-4" />
                </div>
                <span className="font-semibold">Add Organisation</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Organisations</p>
                  <p className="text-3xl font-bold text-gray-900">{organisations.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Active Organisations</p>
                  <p className="text-3xl font-bold text-green-600">{organisations.filter(org => org.settings.isActive).length}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Enterprise Plans</p>
                  <p className="text-3xl font-bold text-purple-600">{organisations.filter(org => org.subscription.plan === 'enterprise').length}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <Crown className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Users</p>
                  <p className="text-3xl font-bold text-orange-600">{organisations.reduce((sum, org) => sum + (org.settings.maxUsers || 0), 0)}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter Bar */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl mb-8">
          <CardHeader 
            className="cursor-pointer hover:bg-gray-50/50 transition-colors"
            onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
          >
            <CardTitle className="flex items-center justify-between text-gray-900">
              <div className="flex items-center">
                <Filter className="w-5 h-5 mr-2 text-blue-600" />
                Search & Filter Organisations
              </div>
              {isFiltersExpanded ? (
                <ChevronUp className="w-5 h-5 text-gray-600" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-600" />
              )}
            </CardTitle>
          </CardHeader>
          {isFiltersExpanded && (
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search organisations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12 border border-gray-300 bg-white text-black focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                  />
                </div>
                <div className="flex gap-3">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40 h-12 border border-gray-300 bg-white text-black focus:border-blue-500 focus:ring-blue-500 rounded-xl">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg">
                      <SelectItem value="all" className="text-black hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer">All Status</SelectItem>
                      <SelectItem value="active" className="text-black hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer">Active</SelectItem>
                      <SelectItem value="inactive" className="text-black hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={planFilter} onValueChange={setPlanFilter}>
                    <SelectTrigger className="w-40 h-12 border border-gray-300 bg-white text-black focus:border-blue-500 focus:ring-blue-500 rounded-xl">
                      <SelectValue placeholder="Plan" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg">
                      <SelectItem value="all" className="text-black hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer">All Plans</SelectItem>
                      <SelectItem value="free" className="text-black hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer">Free</SelectItem>
                      <SelectItem value="basic" className="text-black hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer">Basic</SelectItem>
                      <SelectItem value="premium" className="text-black hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer">Premium</SelectItem>
                      <SelectItem value="enterprise" className="text-black hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={() => fetchOrganisations()}
                    variant="outline"
                    className="h-12 px-6 border border-gray-300 bg-white text-black hover:bg-gray-100 rounded-xl"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Organisations Table */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="p-0">
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="font-semibold">Organisation</TableHead>
                    <TableHead className="font-semibold">Contact</TableHead>
                    <TableHead className="font-semibold">Plan</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Users</TableHead>
                    <TableHead className="font-semibold">Created</TableHead>
                    <TableHead className="font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {organisations.map((organisation) => (
                    <TableRow key={organisation._id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{organisation.name}</p>
                            <p className="text-sm text-gray-600">{organisation.description || 'No description'}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4 text-blue-500" />
                            <span className="text-sm text-gray-700">{organisation.email}</span>
                          </div>
                          {organisation.phone && (
                            <div className="flex items-center space-x-2">
                              <Phone className="w-4 h-4 text-green-500" />
                              <span className="text-sm text-gray-700">{organisation.phone}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getPlanBadge(organisation.subscription.plan)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(organisation.settings.isActive)}
                      </TableCell>
                      <TableCell>
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-600">{organisation.settings.maxUsers || 0}</div>
                          <div className="text-xs text-gray-600">Max Users</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-700">
                            {new Date(organisation.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/organisations/${organisation._id}`)}
                            className="h-8 px-3 text-blue-600 hover:bg-blue-50"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 bg-white border border-gray-200 shadow-lg">
                              <DropdownMenuItem 
                                onClick={() => handleEditOrganisation(organisation)}
                                className="text-black hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer"
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Organisation
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleToggleStatus(organisation)}
                                className="text-black hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer"
                              >
                                {organisation.settings.isActive ? (
                                  <>
                                    <ToggleLeft className="w-4 h-4 mr-2" />
                                    Deactivate
                                  </>
                                ) : (
                                  <>
                                    <ToggleRight className="w-4 h-4 mr-2" />
                                    Activate
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-gray-200" />
                              <DropdownMenuItem 
                                onClick={() => handleDeleteOrganisation(organisation)}
                                className="text-red-600 hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Organisation
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

        {/* Pagination */}
        {totalPages > 1 && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, totalOrganisations)} of {totalOrganisations} organisations
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="border-gray-200 hover:bg-gray-50"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600 px-3">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={currentPage >= totalPages}
                    className="border-gray-200 hover:bg-gray-50"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {organisations.length === 0 && !loading && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Organisations Found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || statusFilter !== 'all' || planFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Get started by creating your first organisation.'
                }
              </p>
              <Button
                onClick={() => {
                  console.log('Empty state Add Organisation button clicked');
                  navigate('/organisations/new');
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Organisation
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

    </div>
  );
};

export default Organisations;