import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { AlertCircle, Plus, Search, Filter, Eye, Edit, Trash2, Scale } from 'lucide-react';
import api from '../services/api';
import { Offence } from '../types';

const Offences: React.FC = () => {
  const navigate = useNavigate();
  
  const [offences, setOffences] = useState<Offence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedOffence, setSelectedOffence] = useState<Offence | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchOffences();
  }, [currentPage, searchTerm, categoryFilter, severityFilter]);

  const fetchOffences = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(categoryFilter && categoryFilter !== 'all' && { category: categoryFilter }),
        ...(severityFilter && severityFilter !== 'all' && { severity: severityFilter }),
      });

      const response = await api.get(`/offences?${params}`);
      
      if (response.data.success) {
        setOffences(response.data.data.offences);
        setTotalPages(response.data.data.pagination.pages);
        setTotalCount(response.data.data.pagination.total);
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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'minor': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'serious': return 'bg-orange-100 text-orange-800';
      case 'major': return 'bg-red-100 text-red-800';
      case 'felony': return 'bg-red-200 text-red-900';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'violent_crime': return 'bg-red-100 text-red-800';
      case 'property_crime': return 'bg-blue-100 text-blue-800';
      case 'drug_offence': return 'bg-purple-100 text-purple-800';
      case 'white_collar_crime': return 'bg-green-100 text-green-800';
      case 'cyber_crime': return 'bg-indigo-100 text-indigo-800';
      case 'traffic_violation': return 'bg-yellow-100 text-yellow-800';
      case 'public_order': return 'bg-orange-100 text-orange-800';
      case 'sexual_offence': return 'bg-pink-100 text-pink-800';
      case 'terrorism': return 'bg-red-200 text-red-900';
      case 'other': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
          <Button onClick={fetchOffences} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Offences</h1>
          <p className="text-gray-600">Manage offence types and definitions</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Offence
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Offence</DialogTitle>
              <DialogDescription>
                Add a new offence type to the system
              </DialogDescription>
            </DialogHeader>
            <div className="p-4">
              <p className="text-gray-600">Offence creation form will be implemented here.</p>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Input
                placeholder="Search offences..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <Select value={categoryFilter} onValueChange={(value) => handleFilterChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
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
              <Select value={severityFilter} onValueChange={(value) => handleFilterChange('severity', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Severity" />
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
            <div className="flex items-center">
              <Button variant="outline" onClick={fetchOffences}>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="grid gap-4">
        {offences.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <div className="text-center">
                <Scale className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No offences found</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          offences.map((offence) => (
            <Card key={offence._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{offence.name}</h3>
                      <Badge className={getSeverityColor(offence.severity)}>
                        {formatSeverity(offence.severity)}
                      </Badge>
                      <Badge className={getCategoryColor(offence.category)}>
                        {formatCategory(offence.category)}
                      </Badge>
                    </div>
                    <p className="text-gray-600 mb-2">{offence.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span><strong>Code:</strong> {offence.code}</span>
                      {offence.subcategory && (
                        <span><strong>Subcategory:</strong> {offence.subcategory}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewOffence(offence)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditOffence(offence)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteOffence(offence)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

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
            Page {currentPage} of {totalPages} ({totalCount} total)
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

      {/* View Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedOffence?.name}</DialogTitle>
            <DialogDescription>
              Offence Details
            </DialogDescription>
          </DialogHeader>
          {selectedOffence && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Code</label>
                  <p className="text-gray-900">{selectedOffence.code}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Category</label>
                  <Badge className={getCategoryColor(selectedOffence.category)}>
                    {formatCategory(selectedOffence.category)}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Severity</label>
                  <Badge className={getSeverityColor(selectedOffence.severity)}>
                    {formatSeverity(selectedOffence.severity)}
                  </Badge>
                </div>
                {selectedOffence.subcategory && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Subcategory</label>
                    <p className="text-gray-900">{selectedOffence.subcategory}</p>
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Description</label>
                <p className="text-gray-900">{selectedOffence.description}</p>
              </div>
              {selectedOffence.legalDefinition && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Legal Definition</label>
                  <p className="text-gray-900">{selectedOffence.legalDefinition}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Offences;
