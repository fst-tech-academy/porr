import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import {
  UserCheck,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  ToggleLeft,
  ToggleRight,
  Scale,
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
  FileText,
  Gavel,
  Clock,
  MapPin,
  Phone,
  Mail,
  User,
  Users,
  Building2,
  AlertTriangle,
  Lock,
  Unlock
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
import { Offender, OffenderFormData } from '../types';
import api from '../services/api';

const OffendersPage: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [offenders, setOffenders] = useState<Offender[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [riskLevelFilter, setRiskLevelFilter] = useState<string>('all');
  const [custodyStatusFilter, setCustodyStatusFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOffenders, setTotalOffenders] = useState(0);
  const [selectedOffender, setSelectedOffender] = useState<Offender | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);

  const limit = 10;

  useEffect(() => {
    fetchOffenders();
  }, [currentPage, searchTerm, riskLevelFilter, custodyStatusFilter, statusFilter]);

  const fetchOffenders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(riskLevelFilter && riskLevelFilter !== 'all' && { riskLevel: riskLevelFilter }),
        ...(custodyStatusFilter && custodyStatusFilter !== 'all' && { custodyStatus: custodyStatusFilter }),
        ...(statusFilter && statusFilter !== 'all' && { status: statusFilter }),
      });

      const response = await api.get(`/offenders?${params}`);
      
      if (response.data.success) {
        setOffenders(response.data.data.offenders);
        setTotalPages(response.data.data.pagination.pages);
        setTotalOffenders(response.data.data.pagination.total);
      } else {
        setError(response.data.message || 'Failed to fetch offenders');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch offenders');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (filterType: string, value: string) => {
    if (filterType === 'riskLevel') {
      setRiskLevelFilter(value);
    } else if (filterType === 'custodyStatus') {
      setCustodyStatusFilter(value);
    } else if (filterType === 'status') {
      setStatusFilter(value);
    }
    setCurrentPage(1);
  };

  const handleViewOffender = (offender: Offender) => {
    setSelectedOffender(offender);
    setShowViewDialog(true);
  };

  const handleEditOffender = (offender: Offender) => {
    navigate(`/offenders/${offender._id}/edit`);
  };

  const handleDeleteOffender = async (offender: Offender) => {
    if (window.confirm(`Are you sure you want to delete offender ${offender.personalInfo.firstName} ${offender.personalInfo.lastName}?`)) {
      try {
        await api.delete(`/offenders/${offender._id}`);
        fetchOffenders();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete offender');
      }
    }
  };

  const handleToggleStatus = async (offender: Offender) => {
    try {
      await api.put(`/offenders/${offender._id}`, {
        ...offender,
        isActive: !offender.isActive
      });
      fetchOffenders();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update offender status');
    }
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCustodyStatusColor = (custodyStatus: string) => {
    switch (custodyStatus) {
      case 'in_custody': return 'bg-red-100 text-red-800 border-red-200';
      case 'released': return 'bg-green-100 text-green-800 border-green-200';
      case 'probation': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'parole': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'community_service': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const formatRiskLevel = (riskLevel: string) => {
    return riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1);
  };

  const formatCustodyStatus = (custodyStatus: string) => {
    return custodyStatus.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-blue-600 animate-pulse" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading Offenders</h3>
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
              <h3 className="text-xl font-semibold text-red-900 mb-2">Error Loading Offenders</h3>
              <p className="text-red-700 mb-6">{error}</p>
              <Button 
                onClick={() => fetchOffenders()} 
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
                  <UserCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold">Offender Management</h1>
                  <p className="text-blue-100 text-lg">Manage and monitor all offender records</p>
                </div>
              </div>
              <div className="flex items-center space-x-6 text-blue-100">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span className="text-sm">{totalOffenders} Total Offenders</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span className="text-sm">{offenders.filter(o => o.isActive).length} Active</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Lock className="w-5 h-5" />
                  <span className="text-sm">{offenders.filter(o => o.custodyStatus === 'in_custody').length} In Custody</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => navigate('/offenders/new')}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Offender
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Filters */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-900">
              <Filter className="w-5 h-5 mr-2 text-blue-600" />
              Search & Filter Offenders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search" className="text-sm font-medium text-gray-700 mb-2 block">
                  Search Offenders
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="search"
                    placeholder="Search by name, ID, or details..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Risk Level
                </Label>
                <Select value={riskLevelFilter} onValueChange={(value) => handleFilterChange('riskLevel', value)}>
                  <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="All Risk Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Risk Levels</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Custody Status
                </Label>
                <Select value={custodyStatusFilter} onValueChange={(value) => handleFilterChange('custodyStatus', value)}>
                  <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="All Custody Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Custody Status</SelectItem>
                    <SelectItem value="in_custody">In Custody</SelectItem>
                    <SelectItem value="released">Released</SelectItem>
                    <SelectItem value="probation">Probation</SelectItem>
                    <SelectItem value="parole">Parole</SelectItem>
                    <SelectItem value="community_service">Community Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Status
                </Label>
                <Select value={statusFilter} onValueChange={(value) => handleFilterChange('status', value)}>
                  <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Offenders Table */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="p-0">
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="font-semibold">Offender</TableHead>
                    <TableHead className="font-semibold">Risk Level</TableHead>
                    <TableHead className="font-semibold">Custody Status</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Age</TableHead>
                    <TableHead className="font-semibold">Created</TableHead>
                    <TableHead className="font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {offenders.map((offender) => (
                    <TableRow key={offender._id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {offender.personalInfo.firstName} {offender.personalInfo.lastName}
                            </p>
                            <p className="text-sm text-gray-600">
                              ID: {offender.personalInfo.nationalId || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRiskLevelColor(offender.riskAssessment.level)}>
                          {formatRiskLevel(offender.riskAssessment.level)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getCustodyStatusColor(offender.custodyStatus)}>
                          {formatCustodyStatus(offender.custodyStatus)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(offender.isActive)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-700">
                            {getAge(offender.personalInfo.dateOfBirth)} years
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-700">
                            {new Date(offender.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewOffender(offender)}
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
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onClick={() => handleEditOffender(offender)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Offender
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleStatus(offender)}>
                                {offender.isActive ? (
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
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDeleteOffender(offender)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Offender
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
                  Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, totalOffenders)} of {totalOffenders} offenders
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
        {offenders.length === 0 && !loading && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <UserCheck className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Offenders Found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || riskLevelFilter !== 'all' || custodyStatusFilter !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your search criteria or filters.'
                  : 'Get started by adding your first offender record.'}
              </p>
              <Button
                onClick={() => navigate('/offenders/new')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add First Offender
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default OffendersPage;