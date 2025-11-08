import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Building2,
  Users,
  Settings,
  Activity,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  MoreVertical,
  RefreshCw,
  AlertCircle,
  FileText,
  Clock,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import api from '../services/api';

type Department = any;

const DepartmentView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [department, setDepartment] = useState<Department | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchDepartment();
    }
  }, [id]);

  const fetchDepartment = async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await api.getDepartment(id);
      if (response.success && response.data) {
        setDepartment(response.data.department);
      } else {
        setError(response.message || 'Failed to fetch department');
      }
    } catch (err: any) {
      console.error('Error fetching department:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!department) return;
    
    try {
      await api.updateDepartmentStatus(department._id, {
        isActive: !department.status.isActive
      });
      await fetchDepartment();
    } catch (err: any) {
      setError(err.message || 'Failed to toggle department status');
    }
  };

  const handleDeleteDepartment = async () => {
    if (!department) return;
    setIsDeleting(true);
    try {
      await api.deleteDepartment(department._id);
      navigate('/departments');
    } catch (err: any) {
      setError(err.message || 'Failed to delete department');
    } finally {
      setIsDeleting(false);
      setConfirmOpen(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'N/A';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'investigation': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'forensics': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'intelligence': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'operations': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'administration': return 'bg-green-100 text-green-800 border-green-200';
      case 'training': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'support': return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'other': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-blue-600 animate-pulse" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading Department</h3>
          <p className="text-gray-600">Please wait while we fetch the data...</p>
        </div>
      </div>
    );
  }

  if (error || !department) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <Card className="border-red-200 bg-red-50/50">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-red-900 mb-2">Error Loading Department</h3>
              <p className="text-red-700 mb-6">{error || 'Department not found'}</p>
              <div className="flex gap-3 justify-center">
                <Button 
                  onClick={() => navigate('/departments')} 
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3"
                >
                  Back to Departments
                </Button>
                <Button 
                  onClick={() => fetchDepartment()} 
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header Section */}
      <div className="bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/departments')}
                className="bg-transparent border border-blue-400 text-white hover:bg-blue-700"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold">{department.name}</h1>
                <p className="text-blue-100 mt-1">Code: {department.code}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/departments/${department._id}/edit`)}
                className="bg-transparent border border-blue-400 text-white hover:bg-blue-700"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="bg-transparent border border-blue-400 text-white hover:bg-blue-700"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-white border border-gray-200 shadow-lg">
                  <DropdownMenuItem 
                    onClick={handleToggleStatus}
                    className="text-black hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer"
                  >
                    {department.status.isActive ? (
                      <>
                        <XCircle className="w-4 h-4 mr-2" />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Activate
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-200" />
                  <DropdownMenuItem 
                    onClick={() => setConfirmOpen(true)}
                    className="text-red-600 hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Department
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white border border-gray-200 rounded-lg p-1">
            <TabsTrigger value="overview" className="text-xs px-4 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Overview
            </TabsTrigger>
            <TabsTrigger value="location" className="text-xs px-4 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Location
            </TabsTrigger>
            <TabsTrigger value="contact" className="text-xs px-4 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Contact
            </TabsTrigger>
            <TabsTrigger value="statistics" className="text-xs px-4 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Statistics
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-xs px-4 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-blue-100 border-2 border-blue-200">
                <CardHeader className="bg-blue-600 text-white py-3">
                  <CardTitle className="text-lg font-semibold text-white">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Department Name</p>
                    <p className="text-gray-900">{department.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Code</p>
                    <p className="text-gray-900 font-mono">{department.code}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Type</p>
                    <Badge className={getTypeColor(department.type)}>
                      {formatType(department.type)}
                    </Badge>
                  </div>
                  {department.description && (
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Description</p>
                      <p className="text-gray-900">{department.description}</p>
                    </div>
                  )}
                  {department.parentDepartment && (
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Parent Department</p>
                      <p className="text-gray-900">
                        {typeof department.parentDepartment === 'object' 
                          ? department.parentDepartment.name 
                          : 'N/A'}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Status</p>
                    <Badge className={department.status.isActive ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}>
                      {department.status.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-purple-100 border-2 border-purple-200">
                <CardHeader className="bg-purple-600 text-white py-3">
                  <CardTitle className="text-lg font-semibold text-white">Statistics</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Total Agents</p>
                      <p className="text-2xl font-bold text-gray-900">{department.statistics?.totalAgents || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Active Agents</p>
                      <p className="text-2xl font-bold text-gray-900">{department.statistics?.activeAgents || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Total Cases</p>
                      <p className="text-2xl font-bold text-gray-900">{department.statistics?.totalCases || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Active Cases</p>
                      <p className="text-2xl font-bold text-gray-900">{department.statistics?.activeCases || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Solved Cases</p>
                      <p className="text-2xl font-bold text-gray-900">{department.statistics?.solvedCases || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {department.notes && (
              <Card className="bg-gray-100 border-2 border-gray-200">
                <CardHeader className="bg-gray-600 text-white py-3">
                  <CardTitle className="text-lg font-semibold text-white">Notes</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <p className="text-gray-900 whitespace-pre-wrap">{department.notes}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Location Tab */}
          <TabsContent value="location" className="space-y-4">
            <Card className="bg-green-100 border-2 border-green-200">
              <CardHeader className="bg-green-600 text-white py-3">
                <CardTitle className="text-lg font-semibold text-white flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Location Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {department.location?.address && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Address</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {department.location.address.street && (
                        <div>
                          <p className="text-sm font-semibold text-gray-700">Street</p>
                          <p className="text-gray-900">{department.location.address.street}</p>
                        </div>
                      )}
                      {department.location.address.city && (
                        <div>
                          <p className="text-sm font-semibold text-gray-700">City</p>
                          <p className="text-gray-900">{department.location.address.city}</p>
                        </div>
                      )}
                      {department.location.address.state && (
                        <div>
                          <p className="text-sm font-semibold text-gray-700">State/Region</p>
                          <p className="text-gray-900">{department.location.address.state}</p>
                        </div>
                      )}
                      {department.location.address.country && (
                        <div>
                          <p className="text-sm font-semibold text-gray-700">Country</p>
                          <p className="text-gray-900">{department.location.address.country}</p>
                        </div>
                      )}
                      {department.location.address.postalCode && (
                        <div>
                          <p className="text-sm font-semibold text-gray-700">Postal Code</p>
                          <p className="text-gray-900">{department.location.address.postalCode}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {(department.location?.phone || department.location?.email) && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Location Contact</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {department.location.phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-gray-600" />
                          <p className="text-gray-900">{department.location.phone}</p>
                        </div>
                      )}
                      {department.location.email && (
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-gray-600" />
                          <p className="text-gray-900">{department.location.email}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {department.location?.coordinates && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Coordinates</h4>
                    <p className="text-gray-900">
                      {department.location.coordinates.latitude}, {department.location.coordinates.longitude}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact Tab */}
          <TabsContent value="contact" className="space-y-4">
            <Card className="bg-orange-100 border-2 border-orange-200">
              <CardHeader className="bg-orange-600 text-white py-3">
                <CardTitle className="text-lg font-semibold text-white flex items-center">
                  <Phone className="w-5 h-5 mr-2" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {department.contactInfo?.phone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Phone</p>
                        <p className="text-gray-900">{department.contactInfo.phone}</p>
                      </div>
                    </div>
                  )}
                  {department.contactInfo?.email && (
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Email</p>
                        <p className="text-gray-900">{department.contactInfo.email}</p>
                      </div>
                    </div>
                  )}
                  {department.contactInfo?.fax && (
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Fax</p>
                        <p className="text-gray-900">{department.contactInfo.fax}</p>
                      </div>
                    </div>
                  )}
                  {department.contactInfo?.website && (
                    <div className="flex items-center space-x-3">
                      <Activity className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Website</p>
                        <a href={department.contactInfo.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {department.contactInfo.website}
                        </a>
                      </div>
                    </div>
                  )}
                  {department.contactInfo?.emergencyContact && (
                    <div className="flex items-center space-x-3 md:col-span-2">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Emergency Contact</p>
                        <p className="text-gray-900">{department.contactInfo.emergencyContact}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="statistics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-indigo-100 border-2 border-indigo-200">
                <CardHeader className="bg-indigo-600 text-white py-3">
                  <CardTitle className="text-lg font-semibold text-white flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Agents
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Total</span>
                      <span className="font-bold text-gray-900">{department.statistics?.totalAgents || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Active</span>
                      <span className="font-bold text-gray-900">{department.statistics?.activeAgents || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-teal-100 border-2 border-teal-200">
                <CardHeader className="bg-teal-600 text-white py-3">
                  <CardTitle className="text-lg font-semibold text-white flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Cases
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Total</span>
                      <span className="font-bold text-gray-900">{department.statistics?.totalCases || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Active</span>
                      <span className="font-bold text-gray-900">{department.statistics?.activeCases || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Solved</span>
                      <span className="font-bold text-gray-900">{department.statistics?.solvedCases || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-amber-100 border-2 border-amber-200">
                <CardHeader className="bg-amber-600 text-white py-3">
                  <CardTitle className="text-lg font-semibold text-white flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Success Rate</span>
                      <span className="font-bold text-gray-900">
                        {department.statistics?.totalCases 
                          ? Math.round((department.statistics.solvedCases / department.statistics.totalCases) * 100)
                          : 0}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card className="bg-gray-100 border-2 border-gray-200">
              <CardHeader className="bg-gray-600 text-white py-3">
                <CardTitle className="text-lg font-semibold text-white flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Department Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Status</p>
                  <Badge className={department.status.isActive ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}>
                    {department.status.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                {department.status.establishedDate && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">Established Date</p>
                    <p className="text-gray-900">{formatDate(department.status.establishedDate)}</p>
                  </div>
                )}
                {department.status.lastInspectionDate && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">Last Inspection</p>
                    <p className="text-gray-900">{formatDate(department.status.lastInspectionDate)}</p>
                  </div>
                )}
                {department.status.nextInspectionDate && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">Next Inspection</p>
                    <p className="text-gray-900">{formatDate(department.status.nextInspectionDate)}</p>
                  </div>
                )}
                {department.metadata && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">Created</p>
                    <p className="text-gray-900">{formatDate(department.metadata.createdAt)}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Delete Department</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {department.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteDepartment}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DepartmentView;

