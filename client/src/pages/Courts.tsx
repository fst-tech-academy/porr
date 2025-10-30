import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import {
  Scale,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  ToggleLeft,
  ToggleRight,
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
  ChevronUp,
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
  Unlock,
  UserCheck,
  BookOpen,
  Briefcase,
  Landmark,
  Home,
  MapPin as LocationIcon
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
import { Court } from '../types';
import api from '../services/api';

const CourtsPage: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [jurisdictionFilter, setJurisdictionFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCourts, setTotalCourts] = useState(0);
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

  const limit = 10;

  useEffect(() => {
    fetchCourts();
  }, [currentPage, searchTerm, typeFilter, jurisdictionFilter, statusFilter]);

  const fetchCourts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(typeFilter && typeFilter !== 'all' && { type: typeFilter }),
        ...(jurisdictionFilter && jurisdictionFilter !== 'all' && { jurisdiction: jurisdictionFilter }),
        ...(statusFilter && statusFilter !== 'all' && { status: statusFilter }),
      });

      const response = await api.get(`/courts?${params}`);
      
      if (response.data.success) {
        setCourts(response.data.data.courts);
        setTotalPages(response.data.data.pagination.pages);
        setTotalCourts(response.data.data.pagination.total);
      } else {
        setError(response.data.message || 'Failed to fetch courts');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch courts');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (filterType: string, value: string) => {
    if (filterType === 'type') {
      setTypeFilter(value);
    } else if (filterType === 'jurisdiction') {
      setJurisdictionFilter(value);
    } else if (filterType === 'status') {
      setStatusFilter(value);
    }
    setCurrentPage(1);
  };

  const handleViewCourt = (court: Court) => {
    setSelectedCourt(court);
    setShowViewDialog(true);
  };

  const handleEditCourt = (court: Court) => {
    navigate(`/courts/${court._id}/edit`);
  };

  const handleDeleteCourt = async (court: Court) => {
    if (window.confirm(`Are you sure you want to delete court ${court.name}?`)) {
      try {
        await api.delete(`/courts/${court._id}`);
        fetchCourts();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete court');
      }
    }
  };

  const handleToggleStatus = async (court: Court) => {
    try {
      await api.put(`/courts/${court._id}`, {
        ...court,
        isActive: !court.isActive
      });
      fetchCourts();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update court status');
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'supreme': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'high': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'district': return 'bg-green-100 text-green-800 border-green-200';
      case 'municipal': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'special': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'tribunal': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getJurisdictionColor = (jurisdiction: string) => {
    switch (jurisdiction) {
      case 'federal': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'state': return 'bg-green-100 text-green-800 border-green-200';
      case 'local': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'military': return 'bg-red-100 text-red-800 border-red-200';
      case 'administrative': return 'bg-purple-100 text-purple-800 border-purple-200';
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

  const formatType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const formatJurisdiction = (jurisdiction: string) => {
    return jurisdiction.charAt(0).toUpperCase() + jurisdiction.slice(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Scale className="w-6 h-6 text-blue-600 animate-pulse" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading Courts</h3>
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
              <h3 className="text-xl font-semibold text-red-900 mb-2">Error Loading Courts</h3>
              <p className="text-red-700 mb-6">{error}</p>
              <Button 
                onClick={() => fetchCourts()} 
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
                  <Scale className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold">Court Management</h1>
                  <p className="text-blue-100 text-lg">Manage and monitor all court information</p>
                </div>
              </div>
              <div className="flex items-center space-x-6 text-blue-100">
                <div className="flex items-center space-x-2">
                  <Landmark className="w-5 h-5" />
                  <span className="text-sm">{totalCourts} Total Courts</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span className="text-sm">{courts.filter(c => c.isActive).length} Active</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Gavel className="w-5 h-5" />
                  <span className="text-sm">{courts.filter(c => c.type === 'supreme').length} Supreme Courts</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => navigate('/courts/new')}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Court
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Filters */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader 
            className="cursor-pointer hover:bg-gray-50/50 transition-colors"
            onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
          >
            <CardTitle className="flex items-center justify-between text-gray-900">
              <div className="flex items-center">
                <Filter className="w-5 h-5 mr-2 text-blue-600" />
                Search & Filter Courts
              </div>
              {isFiltersExpanded ? (
                <ChevronUp className="w-5 h-5 text-gray-600" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-600" />
              )}
            </CardTitle>
          </CardHeader>
          {isFiltersExpanded && (
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="search" className="text-sm font-medium text-gray-700 mb-2 block">
                    Search Courts
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="search"
                      placeholder="Search by name, code, or location..."
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-10 border border-gray-300 bg-white text-black focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Court Type
                  </Label>
                  <Select value={typeFilter} onValueChange={(value) => handleFilterChange('type', value)}>
                    <SelectTrigger className="border border-gray-300 bg-white text-black focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg">
                      <SelectItem value="all" className="text-black hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer">All Types</SelectItem>
                      <SelectItem value="supreme" className="text-black hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer">Supreme Court</SelectItem>
                      <SelectItem value="high" className="text-black hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer">High Court</SelectItem>
                      <SelectItem value="district" className="text-black hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer">District Court</SelectItem>
                      <SelectItem value="municipal" className="text-black hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer">Municipal Court</SelectItem>
                      <SelectItem value="special" className="text-black hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer">Special Court</SelectItem>
                      <SelectItem value="tribunal" className="text-black hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer">Tribunal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Jurisdiction
                  </Label>
                  <Select value={jurisdictionFilter} onValueChange={(value) => handleFilterChange('jurisdiction', value)}>
                    <SelectTrigger className="border border-gray-300 bg-white text-black focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="All Jurisdictions" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg">
                      <SelectItem value="all" className="text-black hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer">All Jurisdictions</SelectItem>
                      <SelectItem value="federal" className="text-black hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer">Federal</SelectItem>
                      <SelectItem value="state" className="text-black hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer">State</SelectItem>
                      <SelectItem value="local" className="text-black hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer">Local</SelectItem>
                      <SelectItem value="military" className="text-black hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer">Military</SelectItem>
                      <SelectItem value="administrative" className="text-black hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer">Administrative</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Status
                  </Label>
                  <Select value={statusFilter} onValueChange={(value) => handleFilterChange('status', value)}>
                    <SelectTrigger className="border border-gray-300 bg-white text-black focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg">
                      <SelectItem value="all" className="text-black hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer">All Status</SelectItem>
                      <SelectItem value="active" className="text-black hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer">Active</SelectItem>
                      <SelectItem value="inactive" className="text-black hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Courts Table */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="p-0">
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="font-semibold">Court</TableHead>
                    <TableHead className="font-semibold">Type</TableHead>
                    <TableHead className="font-semibold">Jurisdiction</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Location</TableHead>
                    <TableHead className="font-semibold">Created</TableHead>
                    <TableHead className="font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courts.map((court) => (
                    <TableRow key={court._id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                            <Scale className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{court.name}</p>
                            <p className="text-sm text-gray-600">
                              Code: {court.code}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getTypeColor(court.type)}>
                          {formatType(court.type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getJurisdictionColor(court.jurisdiction)}>
                          {formatJurisdiction(court.jurisdiction)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(court.isActive)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <LocationIcon className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-700">
                            {court.address?.city || 'N/A'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-700">
                            {formatDate(court.createdAt)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewCourt(court)}
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
                                onClick={() => handleEditCourt(court)}
                                className="text-black hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer"
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Court
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleToggleStatus(court)}
                                className="text-black hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer"
                              >
                                {court.isActive ? (
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
                                onClick={() => handleDeleteCourt(court)}
                                className="text-red-600 hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Court
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
                  Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, totalCourts)} of {totalCourts} courts
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
        {courts.length === 0 && !loading && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Scale className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Courts Found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || typeFilter !== 'all' || jurisdictionFilter !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your search criteria or filters.'
                  : 'Get started by adding your first court information.'}
              </p>
              <Button
                onClick={() => navigate('/courts/new')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add First Court
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CourtsPage;
