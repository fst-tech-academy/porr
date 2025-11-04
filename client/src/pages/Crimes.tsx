import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import {
  ShieldAlert,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Calendar,
  MapPin,
  AlertCircle,
  Scale,
  UserCheck,
  AlertTriangle,
  Activity,
  TrendingUp,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  BarChart3
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
import { OffenderOffence } from '../types';
import api from '../services/api';

const CrimesPage: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [crimes, setCrimes] = useState<OffenderOffence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCrimes, setTotalCrimes] = useState(0);
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

  const limit = 10;

  useEffect(() => {
    fetchCrimes();
  }, [currentPage, searchTerm, statusFilter, severityFilter]);

  const fetchCrimes = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: limit,
      };

      if (searchTerm) {
        params.search = searchTerm;
      }

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      if (severityFilter !== 'all') {
        params.severity = severityFilter;
      }

      const response = await api.getCrimes(params);
      
      if (response.success) {
        setCrimes(response.data.crimes || []);
        setTotalPages(response.data.pagination?.pages || 1);
        setTotalCrimes(response.data.pagination?.total || 0);
      } else {
        setError(response.message || 'Failed to fetch crimes');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch crimes');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this crime record?')) {
      return;
    }

    try {
      await api.deleteCrime(id);
      fetchCrimes();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete crime');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      reported: 'bg-blue-100 text-blue-800 border-blue-200',
      under_investigation: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      charged: 'bg-orange-100 text-orange-800 border-orange-200',
      trial: 'bg-purple-100 text-purple-800 border-purple-200',
      convicted: 'bg-red-100 text-red-800 border-red-200',
      acquitted: 'bg-green-100 text-green-800 border-green-200',
      dismissed: 'bg-gray-100 text-gray-800 border-gray-200',
      plea_bargain: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    };
    
    return (
      <Badge className={statusColors[status] || 'bg-gray-100 text-gray-800 border-gray-200'}>
        {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </Badge>
    );
  };

  const getSeverityBadge = (severity: string) => {
    const severityColors: Record<string, string> = {
      minor: 'bg-green-100 text-green-800 border-green-200',
      moderate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      serious: 'bg-orange-100 text-orange-800 border-orange-200',
      major: 'bg-red-100 text-red-800 border-red-200',
      felony: 'bg-red-200 text-red-900 border-red-300',
    };
    
    return (
      <Badge className={severityColors[severity] || 'bg-gray-100 text-gray-800 border-gray-200'}>
        {severity.charAt(0).toUpperCase() + severity.slice(1)}
      </Badge>
    );
  };

  // Calculate stats
  const totalCrimesCount = totalCrimes;
  const activeCrimes = crimes.filter(c => c.legal.status === 'under_investigation' || c.legal.status === 'trial' || c.legal.status === 'charged').length;
  const convictedCrimes = crimes.filter(c => c.legal.status === 'convicted').length;
  const pendingCrimes = crimes.filter(c => c.legal.status === 'reported' || c.legal.status === 'under_investigation').length;
  const awaitingTrial = crimes.filter(c => c.legal.status === 'charged' || c.legal.status === 'trial').length;
  const dismissedCrimes = crimes.filter(c => c.legal.status === 'dismissed' || c.legal.status === 'acquitted').length;
  const last7Days = crimes.filter(c => {
    if (!c.dateTime?.dateCommitted) return false;
    const crimeDate = new Date(c.dateTime.dateCommitted);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return crimeDate >= sevenDaysAgo;
  }).length;

  // Calculate time-based stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const todayCrimes = crimes.filter(c => {
    if (!c.dateTime?.dateCommitted) return false;
    const crimeDate = new Date(c.dateTime.dateCommitted);
    crimeDate.setHours(0, 0, 0, 0);
    return crimeDate.getTime() === today.getTime();
  }).length;

  const yesterdayCrimes = crimes.filter(c => {
    if (!c.dateTime?.dateCommitted) return false;
    const crimeDate = new Date(c.dateTime.dateCommitted);
    crimeDate.setHours(0, 0, 0, 0);
    return crimeDate.getTime() === yesterday.getTime();
  }).length;

  const thisMonthCrimes = crimes.filter(c => {
    if (!c.dateTime?.dateCommitted) return false;
    const crimeDate = new Date(c.dateTime.dateCommitted);
    return crimeDate >= firstDayOfMonth;
  }).length;

  // Calculate crimes by region
  const crimesByRegion = crimes.reduce((acc, crime) => {
    const region = crime.location?.state || crime.location?.city || 'Unknown';
    acc[region] = (acc[region] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topRegions = Object.entries(crimesByRegion)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5); // Top 5 regions

  if (loading && crimes.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6 text-blue-600 animate-pulse" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading Crimes</h3>
          <p className="text-gray-600">Please wait while we fetch your data...</p>
        </div>
      </div>
    );
  }

  if (error && crimes.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <Card className="border-red-200 bg-red-50/50">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-red-900 mb-2">Error Loading Crimes</h3>
              <p className="text-red-700 mb-6">{error}</p>
              <Button 
                onClick={() => fetchCrimes()} 
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
                  <ShieldAlert className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold">Crime Management</h1>
                  <p className="text-blue-100 text-lg">Manage and track all crime records</p>
                </div>
              </div>
              <div className="flex items-center space-x-6 text-blue-100">
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span className="text-sm">{totalCrimesCount} Total Crimes</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span className="text-sm">{activeCrimes} Active Cases</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm">{convictedCrimes} Convicted</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => navigate('/crimes/new')}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="w-5 h-5 mr-2" />
                New Crime
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stats Cards - No duplicates from hero banner */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-0.5">Today's Crimes</p>
                  <p className="text-2xl font-bold text-purple-600">{todayCrimes}</p>
                </div>
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <div className="pt-2 border-t border-purple-200">
                <p className="text-[10px] text-gray-500">Last 24 hours</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-teal-50 to-cyan-50 border-2 border-teal-200 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-0.5">Yesterday's Crimes</p>
                  <p className="text-2xl font-bold text-teal-600">{yesterdayCrimes}</p>
                </div>
                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-teal-600" />
                </div>
              </div>
              <div className="pt-2 border-t border-teal-200">
                <p className="text-[10px] text-gray-500">Previous day</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-200 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-0.5">Last 7 Days</p>
                  <p className="text-2xl font-bold text-indigo-600">{last7Days}</p>
                </div>
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-indigo-600" />
                </div>
              </div>
              <div className="pt-2 border-t border-indigo-200">
                <p className="text-[10px] text-gray-500">Weekly trend</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-rose-50 to-pink-50 border-2 border-rose-200 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-0.5">This Month</p>
                  <p className="text-2xl font-bold text-rose-600">{thisMonthCrimes}</p>
                </div>
                <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-rose-600" />
                </div>
              </div>
              <div className="pt-2 border-t border-rose-200">
                <p className="text-[10px] text-gray-500">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Status-based Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-200 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-0.5">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{pendingCrimes}</p>
                </div>
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
              <div className="pt-2 border-t border-yellow-200">
                <p className="text-[10px] text-gray-500">Awaiting action</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-violet-50 to-purple-50 border-2 border-violet-200 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-0.5">Awaiting Trial</p>
                  <p className="text-2xl font-bold text-violet-600">{awaitingTrial}</p>
                </div>
                <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                  <Scale className="w-5 h-5 text-violet-600" />
                </div>
              </div>
              <div className="pt-2 border-t border-violet-200">
                <p className="text-[10px] text-gray-500">In court system</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-0.5">Dismissed/Acquitted</p>
                  <p className="text-2xl font-bold text-emerald-600">{dismissedCrimes}</p>
                </div>
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-emerald-600" />
                </div>
              </div>
              <div className="pt-2 border-t border-emerald-200">
                <p className="text-[10px] text-gray-500">Closed cases</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-sky-50 to-blue-50 border-2 border-sky-200 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-0.5">Regions</p>
                  <p className="text-2xl font-bold text-sky-600">{Object.keys(crimesByRegion).length}</p>
                </div>
                <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-sky-600" />
                </div>
              </div>
              <div className="pt-2 border-t border-sky-200">
                <p className="text-[10px] text-gray-500">Active regions</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Crimes by Region Card */}
        {topRegions.length > 0 && (
          <Card className="bg-gradient-to-br from-slate-50 to-gray-50 border-2 border-slate-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-slate-600" />
                Crimes by Region
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {topRegions.map(([region, count]) => (
                  <div key={region} className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <p className="text-[10px] font-medium text-gray-500 mb-1 uppercase tracking-wide">{region}</p>
                    <p className="text-xl font-bold text-gray-900">{count}</p>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-blue-600 h-1.5 rounded-full" 
                          style={{ width: `${(count / totalCrimesCount) * 100}%` }}
                        ></div>
                      </div>
                      <p className="text-[9px] text-gray-400 mt-1">
                        {((count / totalCrimesCount) * 100).toFixed(1)}% of total
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {Object.keys(crimesByRegion).length > 5 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-[10px] text-gray-500 text-center">
                    Showing top 5 of {Object.keys(crimesByRegion).length} regions
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader 
            className="cursor-pointer hover:bg-gray-50/50 transition-colors"
            onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
          >
            <CardTitle className="flex items-center justify-between text-gray-900">
              <div className="flex items-center">
                <Filter className="w-5 h-5 mr-2 text-blue-600" />
                Search & Filter Crimes
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="search" className="text-sm font-medium text-gray-700 mb-2 block">
                    Search Crimes
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="search"
                      placeholder="Search by case number, title..."
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
                  <Select
                    value={statusFilter}
                    onValueChange={(value) => {
                      setStatusFilter(value);
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="border border-gray-300 bg-white text-black focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg">
                      <SelectItem value="all" className="text-black hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer">All Status</SelectItem>
                      <SelectItem value="reported" className="text-black hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer">Reported</SelectItem>
                      <SelectItem value="under_investigation" className="text-black hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer">Under Investigation</SelectItem>
                      <SelectItem value="charged" className="text-black hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer">Charged</SelectItem>
                      <SelectItem value="trial" className="text-black hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer">Trial</SelectItem>
                      <SelectItem value="convicted" className="text-black hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer">Convicted</SelectItem>
                      <SelectItem value="acquitted" className="text-black hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer">Acquitted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Severity
                  </Label>
                  <Select
                    value={severityFilter}
                    onValueChange={(value) => {
                      setSeverityFilter(value);
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="border border-gray-300 bg-white text-black focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="All Severity" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg">
                      <SelectItem value="all" className="text-black hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer">All Severity</SelectItem>
                      <SelectItem value="minor" className="text-black hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer">Minor</SelectItem>
                      <SelectItem value="moderate" className="text-black hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer">Moderate</SelectItem>
                      <SelectItem value="serious" className="text-black hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer">Serious</SelectItem>
                      <SelectItem value="major" className="text-black hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer">Major</SelectItem>
                      <SelectItem value="felony" className="text-black hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer">Felony</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-800">{error}</span>
          </div>
        )}

        {/* Crimes Table */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="p-0">
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              {loading && crimes.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                  Loading crimes...
                </div>
              ) : crimes.length === 0 ? (
                <div className="p-8 text-center">
                  <ShieldAlert className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg font-medium mb-2">No crimes found</p>
                  <p className="text-gray-400 text-sm mb-4">
                    {searchTerm || statusFilter !== 'all' || severityFilter !== 'all' 
                      ? 'Try adjusting your search or filters' 
                      : 'Get started by adding your first crime record.'}
                  </p>
                  <Button
                    onClick={() => navigate('/crimes/new')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Add First Crime
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="font-semibold">Case Number</TableHead>
                      <TableHead className="font-semibold">Title</TableHead>
                      <TableHead className="font-semibold">Date Committed</TableHead>
                      <TableHead className="font-semibold">Location</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Severity</TableHead>
                      <TableHead className="font-semibold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {crimes.map((crime) => (
                      <TableRow key={crime._id} className="hover:bg-gray-50">
                        <TableCell className="font-medium text-gray-900">
                          {crime.crimeInfo.caseNumber}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {crime.crimeInfo.title}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span className="text-sm">{formatDate(crime.dateTime.dateCommitted)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-600">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            {crime.location.city}, {crime.location.state}
                          </span>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(crime.legal.status)}
                        </TableCell>
                        <TableCell>
                          {getSeverityBadge(crime.legal.severity)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/crimes/${crime._id}`)}
                              className="h-8 px-3 text-blue-600 hover:bg-blue-50"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-white border border-gray-200 shadow-lg">
                                <DropdownMenuItem 
                                  className="text-black hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer"
                                  onClick={() => navigate(`/crimes/${crime._id}/edit`)}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Crime
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-red-600 hover:bg-red-50 hover:text-red-700 focus:bg-red-50 focus:text-red-700 cursor-pointer"
                                  onClick={() => handleDelete(crime._id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl px-6 py-4 shadow-lg">
            <div className="text-sm text-gray-600">
              Showing {(currentPage - 1) * limit + 1} to {Math.min(currentPage * limit, totalCrimes)} of {totalCrimes} crimes
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="border-gray-300 hover:bg-gray-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium text-gray-700 px-4">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="border-gray-300 hover:bg-gray-50"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CrimesPage;

