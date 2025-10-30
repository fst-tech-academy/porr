import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import {
  FileText,
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
  ChevronDown,
  ChevronUp,
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
  Briefcase
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
import { Case, CaseFormData } from '../types';
import api from '../services/api';

const CasesPage: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [caseTypeFilter, setCaseTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCases, setTotalCases] = useState(0);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

  const limit = 10;

  useEffect(() => {
    fetchCases();
  }, [currentPage, searchTerm, statusFilter, caseTypeFilter, priorityFilter]);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && statusFilter !== 'all' && { status: statusFilter }),
        ...(caseTypeFilter && caseTypeFilter !== 'all' && { caseType: caseTypeFilter }),
        ...(priorityFilter && priorityFilter !== 'all' && { priority: priorityFilter }),
      });

      const response = await api.get(`/cases?${params}`);
      
      if (response.data.success) {
        setCases(response.data.data.cases);
        setTotalPages(response.data.data.pagination.pages);
        setTotalCases(response.data.data.pagination.total);
      } else {
        setError(response.data.message || 'Failed to fetch cases');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch cases');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (filterType: string, value: string) => {
    if (filterType === 'status') {
      setStatusFilter(value);
    } else if (filterType === 'caseType') {
      setCaseTypeFilter(value);
    } else if (filterType === 'priority') {
      setPriorityFilter(value);
    }
    setCurrentPage(1);
  };

  const handleViewCase = (caseItem: Case) => {
    setSelectedCase(caseItem);
    setShowViewDialog(true);
  };

  const handleEditCase = (caseItem: Case) => {
    navigate(`/cases/${caseItem._id}/edit`);
  };

  const handleDeleteCase = async (caseItem: Case) => {
    if (window.confirm(`Are you sure you want to delete case ${caseItem.caseNumber}?`)) {
      try {
        await api.delete(`/cases/${caseItem._id}`);
        fetchCases();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete case');
      }
    }
  };

  const handleToggleStatus = async (caseItem: Case) => {
    try {
      await api.put(`/cases/${caseItem._id}`, {
        ...caseItem,
        isActive: !caseItem.isActive
      });
      fetchCases();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update case status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800 border-green-200';
      case 'investigation': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'trial': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'dismissed': return 'bg-red-100 text-red-800 border-red-200';
      case 'settled': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCaseTypeColor = (caseType: string) => {
    switch (caseType) {
      case 'criminal': return 'bg-red-100 text-red-800 border-red-200';
      case 'civil': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'administrative': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'family': return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'commercial': return 'bg-green-100 text-green-800 border-green-200';
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

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatPriority = (priority: string) => {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };

  const formatCaseType = (caseType: string) => {
    return caseType.charAt(0).toUpperCase() + caseType.slice(1);
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
              <FileText className="w-6 h-6 text-blue-600 animate-pulse" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading Cases</h3>
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
              <h3 className="text-xl font-semibold text-red-900 mb-2">Error Loading Cases</h3>
              <p className="text-red-700 mb-6">{error}</p>
              <Button 
                onClick={() => fetchCases()} 
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
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold">Case Management</h1>
                  <p className="text-blue-100 text-lg">Manage and monitor all case files</p>
                </div>
              </div>
              <div className="flex items-center space-x-6 text-blue-100">
                <div className="flex items-center space-x-2">
                  <Briefcase className="w-5 h-5" />
                  <span className="text-sm">{totalCases} Total Cases</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span className="text-sm">{cases.filter(c => c.isActive).length} Active</span>
                </div>
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="text-sm">{cases.filter(c => c.priority === 'urgent').length} Urgent</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => navigate('/cases/new')}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Case
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
                Search & Filter Cases
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
                    Search Cases
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="search"
                      placeholder="Search by case number, title, or details..."
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-10 border border-gray-300 bg-white text-black focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
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
                      <SelectItem value="open" className="text-black hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer">Open</SelectItem>
                      <SelectItem value="investigation" className="text-black hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer">Investigation</SelectItem>
                      <SelectItem value="trial" className="text-black hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer">Trial</SelectItem>
                      <SelectItem value="closed" className="text-black hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer">Closed</SelectItem>
                      <SelectItem value="dismissed" className="text-black hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer">Dismissed</SelectItem>
                      <SelectItem value="settled" className="text-black hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer">Settled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Case Type
                  </Label>
                  <Select value={caseTypeFilter} onValueChange={(value) => handleFilterChange('caseType', value)}>
                    <SelectTrigger className="border border-gray-300 bg-white text-black focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg">
                      <SelectItem value="all" className="text-black hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer">All Types</SelectItem>
                      <SelectItem value="criminal" className="text-black hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer">Criminal</SelectItem>
                      <SelectItem value="civil" className="text-black hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer">Civil</SelectItem>
                      <SelectItem value="administrative" className="text-black hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer">Administrative</SelectItem>
                      <SelectItem value="family" className="text-black hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer">Family</SelectItem>
                      <SelectItem value="commercial" className="text-black hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer">Commercial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Priority
                  </Label>
                  <Select value={priorityFilter} onValueChange={(value) => handleFilterChange('priority', value)}>
                    <SelectTrigger className="border border-gray-300 bg-white text-black focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="All Priorities" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg">
                      <SelectItem value="all" className="text-black hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer">All Priorities</SelectItem>
                      <SelectItem value="low" className="text-black hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer">Low</SelectItem>
                      <SelectItem value="medium" className="text-black hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer">Medium</SelectItem>
                      <SelectItem value="high" className="text-black hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer">High</SelectItem>
                      <SelectItem value="urgent" className="text-black hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Cases Table */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="p-0">
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="font-semibold">Case</TableHead>
                    <TableHead className="font-semibold">Type</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Priority</TableHead>
                    <TableHead className="font-semibold">Created</TableHead>
                    <TableHead className="font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cases.map((caseItem) => (
                    <TableRow key={caseItem._id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                            <FileText className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{caseItem.title}</p>
                            <p className="text-sm text-gray-600">
                              #{caseItem.caseNumber}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getCaseTypeColor(caseItem.type)}>
                          {formatCaseType(caseItem.type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(caseItem.status)}>
                          {formatStatus(caseItem.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(caseItem.priority)}>
                          {formatPriority(caseItem.priority)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-700">
                            {formatDate(caseItem.createdAt)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewCase(caseItem)}
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
                                onClick={() => handleEditCase(caseItem)}
                                className="text-black hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer"
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Case
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleToggleStatus(caseItem)}
                                className="text-black hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer"
                              >
                                {caseItem.isActive ? (
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
                                onClick={() => handleDeleteCase(caseItem)}
                                className="text-red-600 hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Case
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
                  Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, totalCases)} of {totalCases} cases
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
        {cases.length === 0 && !loading && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Cases Found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || statusFilter !== 'all' || caseTypeFilter !== 'all' || priorityFilter !== 'all'
                  ? 'Try adjusting your search criteria or filters.'
                  : 'Get started by adding your first case file.'}
              </p>
              <Button
                onClick={() => navigate('/cases/new')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add First Case
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CasesPage;