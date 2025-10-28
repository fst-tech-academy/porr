import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
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
  Building2
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
import { Offence } from '../types';
import api from '../services/api';

const Offences: React.FC = () => {
  const navigate = useNavigate();
  
  const [offences, setOffences] = useState<Offence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOffences, setTotalOffences] = useState(0);
  const [selectedOffence, setSelectedOffence] = useState<Offence | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);

  const limit = 10;

  useEffect(() => {
    fetchOffences();
  }, [currentPage, searchTerm, categoryFilter, severityFilter, statusFilter]);

  const fetchOffences = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(categoryFilter && categoryFilter !== 'all' && { category: categoryFilter }),
        ...(severityFilter && severityFilter !== 'all' && { severity: severityFilter }),
        ...(statusFilter && statusFilter !== 'all' && { status: statusFilter }),
      });

      const response = await api.get(`/offences?${params}`);
      
      if (response.data.success) {
        setOffences(response.data.data.offences);
        setTotalPages(response.data.data.pagination.pages);
        setTotalOffences(response.data.data.pagination.total);
      } else {
        setError(response.data.message || 'Failed to fetch offences');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch offences');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (filterType: string, value: string) => {
    if (filterType === 'category') {
      setCategoryFilter(value);
    } else if (filterType === 'severity') {
      setSeverityFilter(value);
    } else if (filterType === 'status') {
      setStatusFilter(value);
    }
    setCurrentPage(1);
  };

  const handleViewOffence = (offence: Offence) => {
    setSelectedOffence(offence);
    setShowViewDialog(true);
  };

  const handleEditOffence = (offence: Offence) => {
    navigate(`/offences/${offence._id}/edit`);
  };

  const handleDeleteOffence = async (offence: Offence) => {
    if (window.confirm(`Are you sure you want to delete offence ${offence.name}?`)) {
      try {
        await api.delete(`/offences/${offence._id}`);
        fetchOffences();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete offence');
      }
    }
  };

  const handleToggleStatus = async (offence: Offence) => {
    try {
      await api.put(`/offences/${offence._id}`, {
        ...offence,
        isActive: !offence.isActive
      });
      fetchOffences();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update offence status');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'minor': return 'bg-green-100 text-green-800 border-green-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'serious': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'major': return 'bg-red-100 text-red-800 border-red-200';
      case 'felony': return 'bg-red-200 text-red-900 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'violent_crime': return 'bg-red-100 text-red-800 border-red-200';
      case 'property_crime': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'drug_offence': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'white_collar_crime': return 'bg-green-100 text-green-800 border-green-200';
      case 'cyber_crime': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'traffic_violation': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'public_order': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'sexual_offence': return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'terrorism': return 'bg-red-200 text-red-900 border-red-300';
      case 'other': return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const formatCategory = (category: string) => {
    return category.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatSeverity = (severity: string) => {
    return severity.charAt(0).toUpperCase() + severity.slice(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-blue-600 animate-pulse" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading Offences</h3>
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
              <h3 className="text-xl font-semibold text-red-900 mb-2">Error Loading Offences</h3>
              <p className="text-red-700 mb-6">{error}</p>
              <Button 
                onClick={() => fetchOffences()} 
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
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold">Offence Management</h1>
                  <p className="text-blue-100 text-lg">Manage and monitor all offence types</p>
                </div>
              </div>
              <div className="flex items-center space-x-6 text-blue-100">
                <div className="flex items-center space-x-2">
                  <Scale className="w-5 h-5" />
                  <span className="text-sm">{totalOffences} Total Offences</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span className="text-sm">{offences.filter(o => o.isActive).length} Active</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Target className="w-5 h-5" />
                  <span className="text-sm">{offences.filter(o => o.severity === 'felony').length} Felonies</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setShowCreateDialog(true)}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Offence
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
              Search & Filter Offences
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search" className="text-sm font-medium text-gray-700 mb-2 block">
                  Search Offences
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="search"
                    placeholder="Search by name, code, or description..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Category
                </Label>
                <Select value={categoryFilter} onValueChange={(value) => handleFilterChange('category', value)}>
                  <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="violent_crime">Violent Crime</SelectItem>
                    <SelectItem value="property_crime">Property Crime</SelectItem>
                    <SelectItem value="drug_offence">Drug Offence</SelectItem>
                    <SelectItem value="white_collar_crime">White Collar Crime</SelectItem>
                    <SelectItem value="cyber_crime">Cyber Crime</SelectItem>
                    <SelectItem value="traffic_violation">Traffic Violation</SelectItem>
                    <SelectItem value="public_order">Public Order</SelectItem>
                    <SelectItem value="sexual_offence">Sexual Offence</SelectItem>
                    <SelectItem value="terrorism">Terrorism</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Severity
                </Label>
                <Select value={severityFilter} onValueChange={(value) => handleFilterChange('severity', value)}>
                  <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="All Severities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="minor">Minor</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="serious">Serious</SelectItem>
                    <SelectItem value="major">Major</SelectItem>
                    <SelectItem value="felony">Felony</SelectItem>
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

        {/* Offences Table */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="p-0">
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="font-semibold">Offence</TableHead>
                    <TableHead className="font-semibold">Category</TableHead>
                    <TableHead className="font-semibold">Severity</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Code</TableHead>
                    <TableHead className="font-semibold">Created</TableHead>
                    <TableHead className="font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {offences.map((offence) => (
                    <TableRow key={offence._id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{offence.name}</p>
                            <p className="text-sm text-gray-600">{offence.description || 'No description'}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getCategoryColor(offence.category)}>
                          {formatCategory(offence.category)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getSeverityColor(offence.severity)}>
                          {formatSeverity(offence.severity)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(offence.isActive)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-blue-500" />
                          <span className="text-sm text-gray-700 font-mono">{offence.code}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-700">
                            {new Date(offence.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewOffence(offence)}
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
                              <DropdownMenuItem onClick={() => handleEditOffence(offence)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Offence
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleStatus(offence)}>
                                {offence.isActive ? (
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
                                onClick={() => handleDeleteOffence(offence)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Offence
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
                  Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, totalOffences)} of {totalOffences} offences
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
        {offences.length === 0 && !loading && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Offences Found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || categoryFilter !== 'all' || severityFilter !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your search criteria or filters.'
                  : 'Get started by adding your first offence type.'}
              </p>
              <Button
                onClick={() => setShowCreateDialog(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add First Offence
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Offences;
