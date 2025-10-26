import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { AlertCircle, Plus, Search, Filter, Eye, Edit, Trash2, User } from 'lucide-react';
import { Offender, OffenderFormData } from '../types';
import api from '../services/api';

const OffendersPage: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [offenders, setOffenders] = useState<Offender[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskLevelFilter, setRiskLevelFilter] = useState<string>('all');
  const [custodyStatusFilter, setCustodyStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedOffender, setSelectedOffender] = useState<Offender | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchOffenders();
  }, [currentPage, searchTerm, riskLevelFilter, custodyStatusFilter]);

  const fetchOffenders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(riskLevelFilter && riskLevelFilter !== 'all' && { riskLevel: riskLevelFilter }),
        ...(custodyStatusFilter && custodyStatusFilter !== 'all' && { custodyStatus: custodyStatusFilter }),
      });

      const response = await api.get(`/offenders?${params}`);
      
      if (response.data.success) {
        setOffenders(response.data.data.offenders);
        setTotalPages(response.data.data.pagination.pages);
        setTotalCount(response.data.data.pagination.total);
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
    if (window.confirm(`Are you sure you want to delete ${offender.personalInfo.firstName} ${offender.personalInfo.lastName}?`)) {
      try {
        await api.delete(`/offenders/${offender._id}`);
        fetchOffenders();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete offender');
      }
    }
  };

  const getRiskLevelBadge = (level: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getCustodyStatusBadge = (isInCustody: boolean) => {
    return isInCustody 
      ? 'bg-red-100 text-red-800' 
      : 'bg-green-100 text-green-800';
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  if (loading && offenders.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading offenders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Offender Management</h1>
          <p className="text-gray-600 mt-1">Manage offender records and profiles</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Offender
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Input
                placeholder="Search by name, ID, or passport..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <Select value={riskLevelFilter} onValueChange={(value) => handleFilterChange('riskLevel', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Risk Level" />
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
              <Select value={custodyStatusFilter} onValueChange={(value) => handleFilterChange('custodyStatus', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Custody Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="in_custody">In Custody</SelectItem>
                  <SelectItem value="released">Released</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={fetchOffenders} className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Apply Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <User className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Offenders</p>
                <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 font-bold">!</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Custody</p>
                <p className="text-2xl font-bold text-gray-900">
                  {offenders.filter(o => o.status.isInCustody).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-orange-600 font-bold">H</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">High Risk</p>
                <p className="text-2xl font-bold text-gray-900">
                  {offenders.filter(o => o.riskAssessment.level === 'high' || o.riskAssessment.level === 'critical').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold">✓</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">
                  {offenders.filter(o => o.status.isActive).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Offenders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Offender Records</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>National ID</TableHead>
                <TableHead>Risk Level</TableHead>
                <TableHead>Custody Status</TableHead>
                <TableHead>Total Offences</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {offenders.map((offender) => (
                <TableRow key={offender._id}>
                  <TableCell className="font-medium">
                    {offender.personalInfo.firstName} {offender.personalInfo.lastName}
                  </TableCell>
                  <TableCell>{calculateAge(offender.personalInfo.dateOfBirth)}</TableCell>
                  <TableCell>{offender.personalInfo.nationalId || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge className={getRiskLevelBadge(offender.riskAssessment.level)}>
                      {offender.riskAssessment.level.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getCustodyStatusBadge(offender.status.isInCustody)}>
                      {offender.status.isInCustody ? 'IN CUSTODY' : 'RELEASED'}
                    </Badge>
                  </TableCell>
                  <TableCell>{offender.criminalHistory.totalOffences}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewOffender(offender)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditOffender(offender)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteOffender(offender)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {offenders.length === 0 && !loading && (
            <div className="text-center py-8">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No offenders found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* View Offender Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Offender Details</DialogTitle>
          </DialogHeader>
          {selectedOffender && (
            <div className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Full Name</label>
                    <p className="text-sm">{selectedOffender.personalInfo.firstName} {selectedOffender.personalInfo.lastName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Date of Birth</label>
                    <p className="text-sm">{new Date(selectedOffender.personalInfo.dateOfBirth).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Gender</label>
                    <p className="text-sm">{selectedOffender.personalInfo.gender}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Nationality</label>
                    <p className="text-sm">{selectedOffender.personalInfo.nationality}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">National ID</label>
                    <p className="text-sm">{selectedOffender.personalInfo.nationalId || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Phone</label>
                    <p className="text-sm">{selectedOffender.personalInfo.phoneNumber || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Risk Assessment */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Risk Assessment</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Risk Level</label>
                    <Badge className={getRiskLevelBadge(selectedOffender.riskAssessment.level)}>
                      {selectedOffender.riskAssessment.level.toUpperCase()}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Last Assessment</label>
                    <p className="text-sm">
                      {selectedOffender.riskAssessment.lastAssessment 
                        ? new Date(selectedOffender.riskAssessment.lastAssessment).toLocaleDateString()
                        : 'N/A'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Criminal History */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Criminal History</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Total Offences</label>
                    <p className="text-sm font-bold">{selectedOffender.criminalHistory.totalOffences}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">First Offence</label>
                    <p className="text-sm">
                      {selectedOffender.criminalHistory.firstOffenceDate 
                        ? new Date(selectedOffender.criminalHistory.firstOffenceDate).toLocaleDateString()
                        : 'N/A'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Current Status</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Custody Status</label>
                    <Badge className={getCustodyStatusBadge(selectedOffender.status.isInCustody)}>
                      {selectedOffender.status.isInCustody ? 'IN CUSTODY' : 'RELEASED'}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Custody Location</label>
                    <p className="text-sm">{selectedOffender.status.custodyLocation || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OffendersPage;
