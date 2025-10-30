import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import {
  Heart,
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
  User,
  Calendar,
  MapPin,
  Phone,
  Mail,
  AlertCircle
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
import { Victim } from '../types';
import api from '../services/api';

const VictimsPage: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [victims, setVictims] = useState<Victim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalVictims, setTotalVictims] = useState(0);
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

  const limit = 10;

  useEffect(() => {
    fetchVictims();
  }, [currentPage, searchTerm, statusFilter]);

  const fetchVictims = async () => {
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
        params.isActive = statusFilter === 'active';
      }

      const response = await api.getVictims(params);
      
      if (response.success) {
        setVictims(response.data.victims || []);
        setTotalPages(response.data.pagination?.pages || 1);
        setTotalVictims(response.data.pagination?.total || 0);
      } else {
        setError(response.message || 'Failed to fetch victims');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch victims');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this victim?')) {
      return;
    }

    try {
      await api.deleteVictim(id);
      fetchVictims();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete victim');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = (victim: Victim) => {
    if (victim.status.isDeceased) {
      return <Badge variant="destructive">Deceased</Badge>;
    }
    if (victim.status.isMinor) {
      return <Badge variant="secondary">Minor</Badge>;
    }
    if (victim.status.isActive) {
      return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">Active</Badge>;
    }
    return <Badge variant="secondary">Inactive</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Victims</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage and track victim records
          </p>
        </div>
        <Button onClick={() => navigate('/victims/new')} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          New Victim
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
              Search & Filter Victims
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
                    placeholder="Search by name, ID, phone..."
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
                    <SelectItem value="active" className="hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer">Active</SelectItem>
                    <SelectItem value="inactive" className="hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer">Inactive</SelectItem>
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
              Loading victims...
            </div>
          ) : victims.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              No victims found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-slate-700">
                  <TableHead className="text-gray-900 dark:text-white">Name</TableHead>
                  <TableHead className="text-gray-900 dark:text-white">Date of Birth</TableHead>
                  <TableHead className="text-gray-900 dark:text-white">Gender</TableHead>
                  <TableHead className="text-gray-900 dark:text-white">Contact</TableHead>
                  <TableHead className="text-gray-900 dark:text-white">Location</TableHead>
                  <TableHead className="text-gray-900 dark:text-white">Status</TableHead>
                  <TableHead className="text-gray-900 dark:text-white text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {victims.map((victim) => (
                  <TableRow key={victim._id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                    <TableCell className="font-medium text-gray-900 dark:text-white">
                      {victim.personalInfo.firstName} {victim.personalInfo.lastName}
                    </TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-400">
                      {formatDate(victim.personalInfo.dateOfBirth)}
                    </TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-400 capitalize">
                      {victim.personalInfo.gender}
                    </TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-400">
                      <div className="flex flex-col gap-1">
                        {victim.personalInfo.phoneNumber && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {victim.personalInfo.phoneNumber}
                          </span>
                        )}
                        {victim.personalInfo.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {victim.personalInfo.email}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-400">
                      {victim.address?.current?.city || 'N/A'}, {victim.address?.current?.state || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(victim)}
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
                            onClick={() => navigate(`/victims/${victim._id}`)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer"
                            onClick={() => navigate(`/victims/${victim._id}/edit`)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600 hover:bg-red-50 hover:text-red-700 focus:bg-red-50 focus:text-red-700 cursor-pointer"
                            onClick={() => handleDelete(victim._id)}
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
            Showing {(currentPage - 1) * limit + 1} to {Math.min(currentPage * limit, totalVictims)} of {totalVictims} victims
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

export default VictimsPage;

