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
import { AlertCircle, Plus, Search, Filter, Eye, Edit, Trash2, FileText, Calendar, Users } from 'lucide-react';
import { Case, CaseFormData } from '../types';
import { api } from '../services/api';

const CasesPage: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [caseTypeFilter, setCaseTypeFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchCases();
  }, [currentPage, searchTerm, statusFilter, caseTypeFilter, priorityFilter]);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter }),
        ...(caseTypeFilter && { caseType: caseTypeFilter }),
        ...(priorityFilter && { priority: priorityFilter }),
      });

      const response = await api.get(`/cases?${params}`);
      
      if (response.data.success) {
        setCases(response.data.data.cases);
        setTotalPages(response.data.data.pagination.pages);
        setTotalCount(response.data.data.pagination.total);
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

  const getStatusBadge = (status: string) => {
    const colors = {
      open: 'bg-blue-100 text-blue-800',
      under_investigation: 'bg-yellow-100 text-yellow-800',
      charges_pending: 'bg-orange-100 text-orange-800',
      in_court: 'bg-purple-100 text-purple-800',
      trial_in_progress: 'bg-indigo-100 text-indigo-800',
      awaiting_sentencing: 'bg-pink-100 text-pink-800',
      sentenced: 'bg-red-100 text-red-800',
      appealed: 'bg-gray-100 text-gray-800',
      closed: 'bg-green-100 text-green-800',
      dismissed: 'bg-gray-100 text-gray-800',
      acquitted: 'bg-green-100 text-green-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getCaseTypeBadge = (caseType: string) => {
    const colors = {
      criminal: 'bg-red-100 text-red-800',
      civil: 'bg-blue-100 text-blue-800',
      administrative: 'bg-green-100 text-green-800',
      appeal: 'bg-purple-100 text-purple-800',
      review: 'bg-yellow-100 text-yellow-800',
      investigation: 'bg-orange-100 text-orange-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[caseType as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const calculateCaseAge = (createdAt: string) => {
    const today = new Date();
    const created = new Date(createdAt);
    const diffTime = Math.abs(today.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading && cases.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading cases...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Case Management</h1>
          <p className="text-gray-600 mt-1">Manage criminal cases and investigations</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Case
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
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Input
                placeholder="Search by case number or title..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <Select value={statusFilter} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="under_investigation">Under Investigation</SelectItem>
                  <SelectItem value="charges_pending">Charges Pending</SelectItem>
                  <SelectItem value="in_court">In Court</SelectItem>
                  <SelectItem value="trial_in_progress">Trial in Progress</SelectItem>
                  <SelectItem value="awaiting_sentencing">Awaiting Sentencing</SelectItem>
                  <SelectItem value="sentenced">Sentenced</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={caseTypeFilter} onValueChange={(value) => handleFilterChange('caseType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Case Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="criminal">Criminal</SelectItem>
                  <SelectItem value="civil">Civil</SelectItem>
                  <SelectItem value="administrative">Administrative</SelectItem>
                  <SelectItem value="appeal">Appeal</SelectItem>
                  <SelectItem value="investigation">Investigation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={priorityFilter} onValueChange={(value) => handleFilterChange('priority', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Priorities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={fetchCases} className="flex items-center gap-2">
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
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Cases</p>
                <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600 font-bold">!</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Cases</p>
                <p className="text-2xl font-bold text-gray-900">
                  {cases.filter(c => ['open', 'under_investigation', 'charges_pending', 'in_court', 'trial_in_progress'].includes(c.status.current)).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 font-bold">U</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Urgent Cases</p>
                <p className="text-2xl font-bold text-gray-900">
                  {cases.filter(c => c.priority === 'urgent').length}
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
                <p className="text-sm font-medium text-gray-600">Closed Cases</p>
                <p className="text-2xl font-bold text-gray-900">
                  {cases.filter(c => ['closed', 'dismissed', 'acquitted'].includes(c.status.current)).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cases Table */}
      <Card>
        <CardHeader>
          <CardTitle>Case Records</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Case Number</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Offenders</TableHead>
                <TableHead>Age (Days)</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cases.map((caseItem) => (
                <TableRow key={caseItem._id}>
                  <TableCell className="font-medium">{caseItem.caseNumber}</TableCell>
                  <TableCell className="max-w-xs truncate">{caseItem.title}</TableCell>
                  <TableCell>
                    <Badge className={getCaseTypeBadge(caseItem.caseType)}>
                      {caseItem.caseType.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getPriorityBadge(caseItem.priority)}>
                      {caseItem.priority.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadge(caseItem.status.current)}>
                      {caseItem.status.current.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>{caseItem.offenders.length}</TableCell>
                  <TableCell>{calculateCaseAge(caseItem.metadata.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewCase(caseItem)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditCase(caseItem)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCase(caseItem)}
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

          {cases.length === 0 && !loading && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No cases found</p>
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

      {/* View Case Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Case Details</DialogTitle>
          </DialogHeader>
          {selectedCase && (
            <div className="space-y-6">
              {/* Case Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Case Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Case Number</label>
                    <p className="text-sm font-bold">{selectedCase.caseNumber}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Title</label>
                    <p className="text-sm">{selectedCase.title}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Type</label>
                    <Badge className={getCaseTypeBadge(selectedCase.caseType)}>
                      {selectedCase.caseType.toUpperCase()}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Priority</label>
                    <Badge className={getPriorityBadge(selectedCase.priority)}>
                      {selectedCase.priority.toUpperCase()}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Status</label>
                    <Badge className={getStatusBadge(selectedCase.status.current)}>
                      {selectedCase.status.current.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Created</label>
                    <p className="text-sm">{new Date(selectedCase.metadata.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="text-sm font-medium text-gray-600">Description</label>
                  <p className="text-sm mt-1">{selectedCase.description}</p>
                </div>
              </div>

              {/* Offenders */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Offenders ({selectedCase.offenders.length})</h3>
                <div className="space-y-2">
                  {selectedCase.offenders.map((offender, index) => (
                    <div key={index} className="border rounded p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">
                            {typeof offender.offenderId === 'object' 
                              ? `${offender.offenderId.personalInfo.firstName} ${offender.offenderId.personalInfo.lastName}`
                              : 'Offender Details'
                            }
                          </p>
                          <p className="text-sm text-gray-600">Role: {offender.role}</p>
                        </div>
                        <Badge variant="outline">{offender.role.toUpperCase()}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Timeline ({selectedCase.timeline.length} events)</h3>
                <div className="space-y-3">
                  {selectedCase.timeline.slice(0, 5).map((event, index) => (
                    <div key={index} className="border-l-2 border-blue-200 pl-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{event.event.replace('_', ' ').toUpperCase()}</p>
                          <p className="text-sm text-gray-600">{event.description}</p>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(event.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                  {selectedCase.timeline.length > 5 && (
                    <p className="text-sm text-gray-500">... and {selectedCase.timeline.length - 5} more events</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CasesPage;
