import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  UserCheck,
  Users,
  Settings,
  Activity,
  ArrowLeft,
  Mail,
  Phone,
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
  Briefcase,
  Award,
  MapPin,
  Eye,
  Lock,
  User,
  Building2
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
import { Agent } from '../types';

const AgentView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchAgent();
    }
  }, [id]);

  const fetchAgent = async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await api.getAgent(id);
      if (response.success && response.data) {
        setAgent(response.data.agent);
      } else {
        setError(response.message || 'Failed to fetch agent');
      }
    } catch (err: any) {
      console.error('Error fetching agent:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!agent) return;
    
    try {
      await api.updateAgentStatus(agent._id, {
        isActive: !agent.statusInfo?.isActive
      });
      await fetchAgent();
    } catch (err: any) {
      setError(err.message || 'Failed to toggle agent status');
    }
  };

  const handleDeleteAgent = async () => {
    if (!agent) return;
    setIsDeleting(true);
    try {
      await api.deleteAgent(agent._id);
      navigate('/agents');
    } catch (err: any) {
      setError(err.message || 'Failed to delete agent');
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

  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'director': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'commander': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'supervisor': return 'bg-green-100 text-green-800 border-green-200';
      case 'senior_detective': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'detective': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatRank = (rank: string) => {
    return rank.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const formatSpecialization = (spec: string) => {
    return spec.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'on_leave': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'suspended': return 'bg-red-100 text-red-800 border-red-200';
      case 'retired': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'transferred': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-blue-600 animate-pulse" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading Agent</h3>
          <p className="text-gray-600">Please wait while we fetch the data...</p>
        </div>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <Card className="border-red-200 bg-red-50/50">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-red-900 mb-2">Error Loading Agent</h3>
              <p className="text-red-700 mb-6">{error || 'Agent not found'}</p>
              <div className="flex gap-3 justify-center">
                <Button 
                  onClick={() => navigate('/agents')} 
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3"
                >
                  Back to Agents
                </Button>
                <Button 
                  onClick={() => fetchAgent()} 
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

  const department = typeof agent.department === 'object' ? agent.department : null;

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
                onClick={() => navigate('/agents')}
                className="bg-transparent border border-blue-400 text-white hover:bg-blue-700"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold">
                  {agent.pseudonym.firstName} {agent.pseudonym.lastName}
                  {agent.pseudonym.codeName && ` (${agent.pseudonym.codeName})`}
                </h1>
                <p className="text-blue-100 mt-1">Agent ID: {agent.agentId}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/agents/${agent._id}/edit`)}
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
                    {agent.statusInfo?.isActive ? (
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
                    className="text-red-600 hover:bg-red-600 hover:text-white focus:bg-red-600 focus:text-white cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Agent
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
            <TabsTrigger value="personal" className="text-xs px-4 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Personal Info
            </TabsTrigger>
            <TabsTrigger value="employment" className="text-xs px-4 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Employment
            </TabsTrigger>
            <TabsTrigger value="contact" className="text-xs px-4 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Contact
            </TabsTrigger>
            <TabsTrigger value="physical" className="text-xs px-4 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Physical
            </TabsTrigger>
            <TabsTrigger value="performance" className="text-xs px-4 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Performance
            </TabsTrigger>
            <TabsTrigger value="cases" className="text-xs px-4 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Case Assignments
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
                    <p className="text-sm font-semibold text-gray-700">Agent ID</p>
                    <p className="text-gray-900 font-mono">{agent.agentId}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Pseudonym</p>
                    <p className="text-gray-900">
                      {agent.pseudonym.firstName} {agent.pseudonym.lastName}
                      {agent.pseudonym.codeName && ` (${agent.pseudonym.codeName})`}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Rank</p>
                    <Badge className={getRankColor(agent.rank)}>
                      {formatRank(agent.rank)}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Specialization</p>
                    <p className="text-gray-900">{formatSpecialization(agent.specialization)}</p>
                  </div>
                  {department && (
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Department</p>
                      <p className="text-gray-900">{department.name}</p>
                      <p className="text-xs text-gray-600">{department.code}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Status</p>
                    <Badge className={getStatusColor(agent.status)}>
                      {formatSpecialization(agent.status)}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Clearance Level</p>
                    <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200">
                      {formatSpecialization(agent.clearanceLevel)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-purple-100 border-2 border-purple-200">
                <CardHeader className="bg-purple-600 text-white py-3">
                  <CardTitle className="text-lg font-semibold text-white">Status Information</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Active Status</p>
                    <Badge className={agent.statusInfo?.isActive ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}>
                      {agent.statusInfo?.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">On Duty</p>
                    <Badge className={agent.statusInfo?.onDuty ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-800 border-gray-200'}>
                      {agent.statusInfo?.onDuty ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Availability</p>
                    <p className="text-gray-900">{formatSpecialization(agent.statusInfo?.availability || 'N/A')}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Employment Date</p>
                    <p className="text-gray-900">{formatDate(agent.employmentDate)}</p>
                  </div>
                  {agent.statusInfo?.lastActiveDate && (
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Last Active</p>
                      <p className="text-gray-900">{formatDate(agent.statusInfo.lastActiveDate)}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Personal Info Tab */}
          <TabsContent value="personal" className="space-y-4">
            <Card className="bg-green-100 border-2 border-green-200">
              <CardHeader className="bg-green-600 text-white py-3">
                <CardTitle className="text-lg font-semibold text-white flex items-center">
                  <Lock className="w-5 h-5 mr-2" />
                  Pseudonym Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-700">First Name</p>
                    <p className="text-gray-900">{agent.pseudonym.firstName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Last Name</p>
                    <p className="text-gray-900">{agent.pseudonym.lastName}</p>
                  </div>
                  {agent.pseudonym.codeName && (
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Code Name</p>
                      <p className="text-gray-900">{agent.pseudonym.codeName}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {agent.realIdentity && (
              <Card className="bg-yellow-100 border-2 border-yellow-200">
                <CardHeader className="bg-yellow-600 text-white py-3">
                  <CardTitle className="text-lg font-semibold text-white flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Real Identity (Confidential)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {agent.realIdentity.firstName && (
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Real First Name</p>
                        <p className="text-gray-900">{agent.realIdentity.firstName}</p>
                      </div>
                    )}
                    {agent.realIdentity.lastName && (
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Real Last Name</p>
                        <p className="text-gray-900">{agent.realIdentity.lastName}</p>
                      </div>
                    )}
                    {agent.realIdentity.nationalId && (
                      <div>
                        <p className="text-sm font-semibold text-gray-700">National ID</p>
                        <p className="text-gray-900">{agent.realIdentity.nationalId}</p>
                      </div>
                    )}
                    {agent.realIdentity.dateOfBirth && (
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Date of Birth</p>
                        <p className="text-gray-900">{formatDate(agent.realIdentity.dateOfBirth)}</p>
                      </div>
                    )}
                    {agent.realIdentity.placeOfBirth && (
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Place of Birth</p>
                        <p className="text-gray-900">{agent.realIdentity.placeOfBirth}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Employment Tab */}
          <TabsContent value="employment" className="space-y-4">
            <Card className="bg-indigo-100 border-2 border-indigo-200">
              <CardHeader className="bg-indigo-600 text-white py-3">
                <CardTitle className="text-lg font-semibold text-white flex items-center">
                  <Briefcase className="w-5 h-5 mr-2" />
                  Employment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Rank</p>
                    <Badge className={getRankColor(agent.rank)}>
                      {formatRank(agent.rank)}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Specialization</p>
                    <p className="text-gray-900">{formatSpecialization(agent.specialization)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Employment Date</p>
                    <p className="text-gray-900">{formatDate(agent.employmentDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Status</p>
                    <Badge className={getStatusColor(agent.status)}>
                      {formatSpecialization(agent.status)}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Clearance Level</p>
                    <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200">
                      {formatSpecialization(agent.clearanceLevel)}
                    </Badge>
                  </div>
                  {department && (
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Department</p>
                      <div className="flex items-center space-x-2">
                        <Building2 className="w-4 h-4 text-gray-600" />
                        <div>
                          <p className="text-gray-900">{department.name}</p>
                          <p className="text-xs text-gray-600">{department.code}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
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
                  {agent.contactInfo?.phone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Phone</p>
                        <p className="text-gray-900">{agent.contactInfo.phone}</p>
                      </div>
                    </div>
                  )}
                  {agent.contactInfo?.email && (
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Email</p>
                        <p className="text-gray-900">{agent.contactInfo.email}</p>
                      </div>
                    </div>
                  )}
                  {agent.contactInfo?.emergencyContact && (
                    <div className="flex items-center space-x-3 md:col-span-2">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Emergency Contact</p>
                        <p className="text-gray-900">
                          {agent.contactInfo.emergencyContact.name}
                          {agent.contactInfo.emergencyContact.relationship && ` (${agent.contactInfo.emergencyContact.relationship})`}
                        </p>
                        {agent.contactInfo.emergencyContact.phone && (
                          <p className="text-sm text-gray-600">{agent.contactInfo.emergencyContact.phone}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Physical Tab */}
          <TabsContent value="physical" className="space-y-4">
            {agent.physicalDescription && (
              <Card className="bg-teal-100 border-2 border-teal-200">
                <CardHeader className="bg-teal-600 text-white py-3">
                  <CardTitle className="text-lg font-semibold text-white flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Physical Description
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {agent.physicalDescription.height && (
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Height</p>
                        <p className="text-gray-900">{agent.physicalDescription.height} cm</p>
                      </div>
                    )}
                    {agent.physicalDescription.weight && (
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Weight</p>
                        <p className="text-gray-900">{agent.physicalDescription.weight} kg</p>
                      </div>
                    )}
                    {agent.physicalDescription.eyeColor && (
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Eye Color</p>
                        <p className="text-gray-900">{formatSpecialization(agent.physicalDescription.eyeColor)}</p>
                      </div>
                    )}
                    {agent.physicalDescription.hairColor && (
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Hair Color</p>
                        <p className="text-gray-900">{formatSpecialization(agent.physicalDescription.hairColor)}</p>
                      </div>
                    )}
                    {agent.physicalDescription.distinguishingMarks && (
                      <div className="md:col-span-2">
                        <p className="text-sm font-semibold text-gray-700">Distinguishing Marks</p>
                        <p className="text-gray-900">{agent.physicalDescription.distinguishingMarks}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-4">
            {agent.performance && (
              <Card className="bg-amber-100 border-2 border-amber-200">
                <CardHeader className="bg-amber-600 text-white py-3">
                  <CardTitle className="text-lg font-semibold text-white flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Total Cases</p>
                      <p className="text-2xl font-bold text-gray-900">{agent.performance.totalCases || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Solved Cases</p>
                      <p className="text-2xl font-bold text-gray-900">{agent.performance.solvedCases || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Current Cases</p>
                      <p className="text-2xl font-bold text-gray-900">{agent.performance.currentCases || 0}</p>
                    </div>
                    {agent.performance.totalCases && agent.performance.totalCases > 0 && (
                      <div className="md:col-span-3">
                        <p className="text-sm font-semibold text-gray-700">Success Rate</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {Math.round((agent.performance.solvedCases || 0) / agent.performance.totalCases * 100)}%
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Case Assignments Tab */}
          <TabsContent value="cases" className="space-y-4">
            <Card className="bg-gray-100 border-2 border-gray-200">
              <CardHeader className="bg-gray-600 text-white py-3">
                <CardTitle className="text-lg font-semibold text-white flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Case Assignments
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {agent.caseAssignments && agent.caseAssignments.length > 0 ? (
                  <div className="space-y-3">
                    {agent.caseAssignments.map((assignment, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-3 bg-white">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {formatSpecialization(assignment.role)}
                            </p>
                            <p className="text-sm text-gray-600">
                              Status: {formatSpecialization(assignment.status)}
                            </p>
                            {assignment.assignedDate && (
                              <p className="text-xs text-gray-500">
                                Assigned: {formatDate(assignment.assignedDate)}
                              </p>
                            )}
                          </div>
                          <Badge className={assignment.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {formatSpecialization(assignment.status)}
                          </Badge>
                        </div>
                        {assignment.notes && (
                          <p className="text-sm text-gray-700 mt-2">{assignment.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-4">No case assignments</p>
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
            <DialogTitle>Delete Agent</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {agent.pseudonym.firstName} {agent.pseudonym.lastName}? This action cannot be undone.
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
              onClick={handleDeleteAgent}
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

export default AgentView;
