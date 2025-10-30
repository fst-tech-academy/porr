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
  AlertTriangle
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
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
      reported: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
      under_investigation: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
      charged: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100',
      trial: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
      convicted: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
      acquitted: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
      dismissed: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100',
      plea_bargain: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100',
    };
    
    return (
      <Badge className={statusColors[status] || 'bg-gray-100 text-gray-800'}>
        {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </Badge>
    );
  };

  const getSeverityBadge = (severity: string) => {
    const severityColors: Record<string, string> = {
      minor: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
      moderate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
      serious: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100',
      major: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
      felony: 'bg-red-200 text-red-900 dark:bg-red-800 dark:text-red-100',
    };
    
    return (
      <Badge className={severityColors[severity] || 'bg-gray-100 text-gray-800'}>
        {severity.charAt(0).toUpperCase() + severity.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Crimes</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage and track crime records
          </p>
        </div>
        <Button onClick={() => navigate('/crimes/new')} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          New Crime
        </Button>
      </div>

      {/* Filters */}
      <Card className="border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <CardHeader 
          className="cursor-pointer bg-gray-50 dark:bg-slate-700"
          onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Search & Filter Crimes
            </CardTitle>
            {isFiltersExpanded ? (
              <ChevronUp className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            )}
          </div>
        </CardHeader>
        {isFiltersExpanded && (
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search by case number, title..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10 border border-gray-300 bg-white text-black dark:bg-slate-700 dark:text-white dark:border-slate-600"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                <Select
                  value={statusFilter}
                  onValueChange={(value) => {
                    setStatusFilter(value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="border border-gray-300 bg-white text-black dark:bg-slate-700 dark:text-white dark:border-slate-600">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-black border border-gray-200 shadow-lg">
                    <SelectItem value="all" className="hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer">All Status</SelectItem>
                    <SelectItem value="reported" className="hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer">Reported</SelectItem>
                    <SelectItem value="under_investigation" className="hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer">Under Investigation</SelectItem>
                    <SelectItem value="charged" className="hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer">Charged</SelectItem>
                    <SelectItem value="trial" className="hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer">Trial</SelectItem>
                    <SelectItem value="convicted" className="hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer">Convicted</SelectItem>
                    <SelectItem value="acquitted" className="hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer">Acquitted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Severity</label>
                <Select
                  value={severityFilter}
                  onValueChange={(value) => {
                    setSeverityFilter(value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="border border-gray-300 bg-white text-black dark:bg-slate-700 dark:text-white dark:border-slate-600">
                    <SelectValue placeholder="All Severity" />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-black border border-gray-200 shadow-lg">
                    <SelectItem value="all" className="hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer">All Severity</SelectItem>
                    <SelectItem value="minor" className="hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer">Minor</SelectItem>
                    <SelectItem value="moderate" className="hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer">Moderate</SelectItem>
                    <SelectItem value="serious" className="hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer">Serious</SelectItem>
                    <SelectItem value="major" className="hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer">Major</SelectItem>
                    <SelectItem value="felony" className="hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer">Felony</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
          <span className="text-red-800 dark:text-red-200">{error}</span>
        </div>
      )}

      {/* Table */}
      <Card className="border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              Loading crimes...
            </div>
          ) : crimes.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              No crimes found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-slate-700">
                  <TableHead className="text-gray-900 dark:text-white">Case Number</TableHead>
                  <TableHead className="text-gray-900 dark:text-white">Title</TableHead>
                  <TableHead className="text-gray-900 dark:text-white">Date Committed</TableHead>
                  <TableHead className="text-gray-900 dark:text-white">Location</TableHead>
                  <TableHead className="text-gray-900 dark:text-white">Status</TableHead>
                  <TableHead className="text-gray-900 dark:text-white">Severity</TableHead>
                  <TableHead className="text-gray-900 dark:text-white text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {crimes.map((crime) => (
                  <TableRow key={crime._id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                    <TableCell className="font-medium text-gray-900 dark:text-white">
                      {crime.crimeInfo.caseNumber}
                    </TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-400">
                      {crime.crimeInfo.title}
                    </TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-400">
                      {formatDate(crime.dateTime.dateCommitted)}
                    </TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
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
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white text-black border border-gray-200 shadow-lg">
                          <DropdownMenuItem 
                            className="hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer"
                            onClick={() => navigate(`/crimes/${crime._id}`)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer"
                            onClick={() => navigate(`/crimes/${crime._id}/edit`)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {(currentPage - 1) * limit + 1} to {Math.min(currentPage * limit, totalCrimes)} of {totalCrimes} crimes
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrimesPage;

