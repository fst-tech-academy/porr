import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import { OffenderOffence } from '../types';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Shield,
  User,
  FileText,
  Scale,
  DollarSign,
  AlertTriangle,
  Edit,
  Trash2,
  Briefcase,
  Clock,
  Gavel,
  Building2,
  Users,
  Search,
  Info
} from 'lucide-react';

const CrimeView: React.FC = () => {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [crime, setCrime] = useState<OffenderOffence | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchCrime(id);
    }
  }, [id]);

  const fetchCrime = async (crimeId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getCrime(crimeId);
      if (response.success && response.data) {
        setCrime(response.data);
      } else {
        setError('Failed to fetch crime details');
      }
    } catch (err: any) {
      console.error('Error fetching crime:', err);
      if (err.response?.status === 404) {
        setError('Crime not found. The crime may have been deleted or the ID is invalid.');
      } else if (err.response?.status === 403) {
        setError('Access denied. You do not have permission to view this crime.');
      } else {
        setError(err.message || 'Failed to load crime');
      }
    } finally {
      setLoading(false);
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

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this crime record? This action cannot be undone.')) {
      return;
    }

    try {
      await apiService.deleteCrime(id!);
      navigate('/crimes');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete crime');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading Crime Details</h3>
          <p className="text-gray-600">Please wait while we fetch the information...</p>
        </div>
      </div>
    );
  }

  if (error || !crime) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <Card className="border-red-200 bg-red-50/50">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-red-900 mb-2">Error Loading Crime</h3>
              <p className="text-red-700 mb-6">{error || 'Crime not found'}</p>
              <div className="flex gap-3 justify-center">
                <Button 
                  onClick={() => navigate('/crimes')} 
                  variant="outline"
                  className="px-6 py-3"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Crimes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const offender = typeof crime.offender === 'object' ? crime.offender : null;
  const offenceCatalogue = typeof crime.offenceCatalogue === 'object' ? crime.offenceCatalogue : null;
  const court = typeof crime.legal.court === 'object' ? crime.legal.court : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Compact Header Section - Simplified Single Color */}
      <div className="bg-blue-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-3">
            <Button
              onClick={() => navigate('/crimes')}
              className="bg-transparent text-white hover:bg-blue-700 border border-blue-400 flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => navigate(`/crimes/${id}/edit`)}
                className="bg-transparent text-white hover:bg-blue-700 border border-blue-400 flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit
              </Button>
              <Button
                onClick={handleDelete}
                className="bg-transparent text-white hover:bg-red-600 border border-red-400 flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">
                {crime.crimeInfo.title}
              </h1>
              <div className="flex items-center gap-4 text-blue-100">
                <span className="text-sm">Case: <span className="font-semibold">{crime.crimeInfo.caseNumber}</span></span>
                <span className="text-sm">•</span>
                <span className="text-sm">{formatDate(crime.dateTime.dateCommitted)}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {getStatusBadge(crime.legal.status)}
              {getSeverityBadge(crime.legal.severity)}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Compact */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="bg-gray-100 border border-gray-300 rounded-lg p-1 h-auto">
            <TabsTrigger value="overview" className="text-xs px-3 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Overview
            </TabsTrigger>
            <TabsTrigger value="legal" className="text-xs px-3 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Legal
            </TabsTrigger>
            <TabsTrigger value="investigation" className="text-xs px-3 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Investigation
            </TabsTrigger>
            <TabsTrigger value="financial" className="text-xs px-3 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Financial
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-3 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Crime Information */}
              <Card className="bg-blue-100 border-2 border-blue-200 shadow-md">
                <CardHeader className="pb-2 bg-blue-600">
                  <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Crime Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-3 space-y-2">
                  <div>
                    <label className="text-xs font-medium text-gray-600">Description</label>
                    <p className="text-sm text-gray-900 mt-0.5">{crime.crimeInfo.description}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">Category</label>
                    <p className="text-sm text-gray-900 mt-0.5 capitalize">{crime.crimeInfo.category.replace('_', ' ')}</p>
                  </div>
                  {crime.crimeInfo.subcategory && (
                    <div>
                      <label className="text-xs font-medium text-gray-600">Subcategory</label>
                      <p className="text-sm text-gray-900 mt-0.5">{crime.crimeInfo.subcategory}</p>
                    </div>
                  )}
                  {offenceCatalogue && (
                    <div>
                      <label className="text-xs font-medium text-gray-600">Offence</label>
                      <p className="text-sm text-gray-900 mt-0.5 font-medium">
                        {offenceCatalogue.name}
                      </p>
                      <p className="text-xs text-gray-600">{offenceCatalogue.code}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Date & Time Information */}
              <Card className="bg-purple-100 border-2 border-blue-200 shadow-md">
                <CardHeader className="pb-2 bg-blue-600">
                  <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-3 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-xs font-medium text-gray-600">Committed</span>
                    <span className="text-xs text-gray-900 font-medium">{formatDate(crime.dateTime.dateCommitted)}</span>
                  </div>
                  {crime.dateTime.timeCommitted && (
                    <div className="flex justify-between">
                      <span className="text-xs font-medium text-gray-600">Time</span>
                      <span className="text-xs text-gray-900">{crime.dateTime.timeCommitted}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-xs font-medium text-gray-600">Reported</span>
                    <span className="text-xs text-gray-900">{formatDate(crime.dateTime.dateReported)}</span>
                  </div>
                  {crime.dateTime.dateArrested && (
                    <div className="flex justify-between">
                      <span className="text-xs font-medium text-gray-600">Arrested</span>
                      <span className="text-xs text-gray-900">{formatDate(crime.dateTime.dateArrested)}</span>
                    </div>
                  )}
                  {crime.dateTime.dateCharged && (
                    <div className="flex justify-between">
                      <span className="text-xs font-medium text-gray-600">Charged</span>
                      <span className="text-xs text-gray-900">{formatDate(crime.dateTime.dateCharged)}</span>
                    </div>
                  )}
                  {crime.dateTime.dateConvicted && (
                    <div className="flex justify-between">
                      <span className="text-xs font-medium text-gray-600">Convicted</span>
                      <span className="text-xs text-gray-900">{formatDate(crime.dateTime.dateConvicted)}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Location Information */}
              <Card className="bg-green-100 border-2 border-blue-200 shadow-md">
                <CardHeader className="pb-2 bg-blue-600">
                  <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Location
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-3 space-y-1.5">
                  {crime.location.street && (
                    <div>
                      <label className="text-xs font-medium text-gray-600">Street</label>
                      <p className="text-xs text-gray-900 mt-0.5">{crime.location.street}</p>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-xs font-medium text-gray-600">City</span>
                    <span className="text-xs text-gray-900 font-medium">{crime.location.city}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs font-medium text-gray-600">State</span>
                    <span className="text-xs text-gray-900">{crime.location.state}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs font-medium text-gray-600">Country</span>
                    <span className="text-xs text-gray-900">{crime.location.country}</span>
                  </div>
                  {crime.location.specificLocation && (
                    <div>
                      <label className="text-xs font-medium text-gray-600">Specific</label>
                      <p className="text-xs text-gray-900 mt-0.5">{crime.location.specificLocation}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Offender Information */}
              {offender && (
                <Card className="bg-orange-100 border-2 border-blue-200 shadow-md">
                  <CardHeader className="pb-2 bg-blue-600">
                    <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Offender
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-3">
                    <Button
                      variant="link"
                      onClick={() => navigate(`/offenders/${offender._id}`)}
                      className="p-0 h-auto text-left w-full text-blue-600 hover:text-blue-700"
                    >
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {offender.personalInfo.firstName} {offender.personalInfo.lastName}
                        </p>
                        <p className="text-xs text-gray-600 mt-0.5">View Profile →</p>
                      </div>
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Victims Information */}
              {crime.victims && crime.victims.length > 0 && (
                <Card className="bg-pink-100 border-2 border-blue-200 shadow-md">
                  <CardHeader className="pb-2 bg-blue-600">
                    <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Victims ({crime.victims.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-3">
                    <div className="space-y-2">
                      {crime.victims.map((victimEntry, index) => {
                        const victim = typeof victimEntry.victim === 'object' ? victimEntry.victim : null;
                        return (
                          <div key={index} className="bg-white/60 rounded-lg p-2 border border-gray-200">
                            {victim ? (
                              <Button
                                variant="link"
                                onClick={() => navigate(`/victims/${victim._id}`)}
                                className="p-0 h-auto text-left w-full text-blue-600 hover:text-blue-700"
                              >
                                <div>
                                  <p className="text-sm font-semibold text-gray-900">
                                    {victim.personalInfo.firstName} {victim.personalInfo.lastName}
                                  </p>
                                  {victimEntry.relationshipToOffender && (
                                    <p className="text-xs text-gray-600 mt-0.5">
                                      Relationship: {victimEntry.relationshipToOffender.replace('_', ' ')}
                                    </p>
                                  )}
                                  {victimEntry.victimImpact && (
                                    <div className="mt-1 flex flex-wrap gap-1">
                                      {victimEntry.victimImpact.physicalInjury && (
                                        <Badge variant="destructive" className="text-xs">Injury</Badge>
                                      )}
                                      {victimEntry.victimImpact.psychologicalImpact && (
                                        <Badge className="text-xs">{victimEntry.victimImpact.psychologicalImpact}</Badge>
                                      )}
                                    </div>
                                  )}
                                  <p className="text-xs text-blue-600 mt-1">View Profile →</p>
                                </div>
                              </Button>
                            ) : (
                              <div>
                                <p className="text-sm font-semibold text-gray-900">Victim {index + 1}</p>
                                <p className="text-xs text-gray-600">ID: {victimEntry.victim}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {crime.notes && (
              <Card className="bg-gray-100 border-2 border-blue-200 shadow-md">
                <CardHeader className="pb-2 bg-blue-600">
                  <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Notes
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-3">
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{crime.notes}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Legal Information Tab */}
          <TabsContent value="legal" className="space-y-3 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Card className="bg-indigo-100 border-2 border-blue-200 shadow-md">
                <CardHeader className="pb-2 bg-blue-600">
                  <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                    <Scale className="w-4 h-4" />
                    Legal Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-3 space-y-2">
                  <div>
                    <label className="text-xs font-medium text-gray-600">Status</label>
                    <div className="mt-1">{getStatusBadge(crime.legal.status)}</div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">Severity</label>
                    <div className="mt-1">{getSeverityBadge(crime.legal.severity)}</div>
                  </div>
                  {crime.legal.verdict && (
                    <div>
                      <label className="text-xs font-medium text-gray-600">Verdict</label>
                      <p className="text-sm text-gray-900 mt-0.5 capitalize">{crime.legal.verdict.replace('_', ' ')}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {court && (
                <Card className="bg-teal-100 border-2 border-blue-200 shadow-md">
                  <CardHeader className="pb-2 bg-blue-600">
                    <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Court
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-3 space-y-1.5">
                    <div>
                      <label className="text-xs font-medium text-gray-600">Name</label>
                      <p className="text-sm text-gray-900 mt-0.5 font-medium">{court.name}</p>
                    </div>
                    {court.code && (
                      <div>
                        <label className="text-xs font-medium text-gray-600">Code</label>
                        <p className="text-xs text-gray-900 mt-0.5">{court.code}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {crime.legal.charges && crime.legal.charges.length > 0 && (
                <Card className="bg-violet-100 border-2 border-blue-200 shadow-md md:col-span-2">
                  <CardHeader className="pb-2 bg-blue-600">
                    <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                      <Gavel className="w-4 h-4" />
                      Charges ({crime.legal.charges.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {crime.legal.charges.map((charge, index) => (
                        <div key={index} className="bg-white/60 rounded-lg p-2 border-l-4 border-violet-500">
                          <p className="text-sm font-semibold text-gray-900">{charge.charge}</p>
                          {charge.statute && (
                            <p className="text-xs text-gray-600 mt-0.5">Statute: {charge.statute}</p>
                          )}
                          {charge.penalty && (
                            <p className="text-xs text-gray-600">Penalty: {charge.penalty}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {crime.legal.sentence && (
                <Card className="bg-rose-100 border-2 border-blue-200 shadow-md md:col-span-2">
                  <CardHeader className="pb-2 bg-blue-600">
                    <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                      <Gavel className="w-4 h-4" />
                      Sentence
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {crime.legal.sentence.type && (
                        <div>
                          <label className="text-xs font-medium text-gray-600">Type</label>
                          <p className="text-sm text-gray-900 mt-0.5 capitalize font-medium">{crime.legal.sentence.type.replace('_', ' ')}</p>
                        </div>
                      )}
                      {crime.legal.sentence.duration && (
                        <div>
                          <label className="text-xs font-medium text-gray-600">Duration</label>
                          <p className="text-sm text-gray-900 mt-0.5 font-medium">{crime.legal.sentence.duration}</p>
                        </div>
                      )}
                      {crime.legal.sentence.fine && (
                        <div>
                          <label className="text-xs font-medium text-gray-600">Fine</label>
                          <p className="text-sm text-gray-900 mt-0.5 font-medium">${crime.legal.sentence.fine.toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                    {crime.legal.sentence.conditions && crime.legal.sentence.conditions.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <label className="text-xs font-medium text-gray-600">Conditions</label>
                        <ul className="list-disc list-inside mt-1 space-y-0.5">
                          {crime.legal.sentence.conditions.map((condition, index) => (
                            <li key={index} className="text-xs text-gray-900">{condition}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Investigation Tab */}
          <TabsContent value="investigation" className="space-y-3 mt-4">
            {crime.investigation ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Card className="bg-yellow-100 border-2 border-blue-200 shadow-md">
                  <CardHeader className="pb-2 bg-blue-600">
                    <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                      <Search className="w-4 h-4" />
                      Investigation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-3 space-y-2">
                    {crime.investigation.assignedOfficer && (
                      <div>
                        <label className="text-xs font-medium text-gray-600">Officer</label>
                        <p className="text-sm text-gray-900 mt-0.5">{crime.investigation.assignedOfficer}</p>
                      </div>
                    )}
                    {crime.investigation.assignedDetective && (
                      <div>
                        <label className="text-xs font-medium text-gray-600">Detective</label>
                        <p className="text-sm text-gray-900 mt-0.5">{crime.investigation.assignedDetective}</p>
                      </div>
                    )}
                    {crime.investigation.motive && (
                      <div>
                        <label className="text-xs font-medium text-gray-600">Motive</label>
                        <p className="text-sm text-gray-900 mt-0.5">{crime.investigation.motive}</p>
                      </div>
                    )}
                    {crime.investigation.method && (
                      <div>
                        <label className="text-xs font-medium text-gray-600">Method</label>
                        <p className="text-sm text-gray-900 mt-0.5">{crime.investigation.method}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {crime.investigation.evidence && crime.investigation.evidence.length > 0 && (
                  <Card className="bg-sky-100 border-2 border-blue-200 shadow-md">
                    <CardHeader className="pb-2 bg-blue-600">
                      <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                        <Briefcase className="w-4 h-4" />
                        Evidence ({crime.investigation.evidence.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <div className="space-y-2">
                        {crime.investigation.evidence.map((evidence, index) => (
                          <div key={index} className="bg-white/60 rounded-lg p-2 border-l-4 border-sky-500">
                            <p className="text-xs font-semibold text-gray-900 capitalize">{evidence.type}</p>
                            {evidence.description && (
                              <p className="text-xs text-gray-600 mt-0.5">{evidence.description}</p>
                            )}
                            {evidence.collectedDate && (
                              <p className="text-xs text-gray-500 mt-1">
                                {formatDate(evidence.collectedDate)}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {crime.investigation.witnesses && crime.investigation.witnesses.length > 0 && (
                  <Card className="bg-emerald-100 border-2 border-blue-200 shadow-md md:col-span-2">
                    <CardHeader className="pb-2 bg-blue-600">
                      <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Witnesses ({crime.investigation.witnesses.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {crime.investigation.witnesses.map((witness, index) => (
                          <div key={index} className="bg-white/60 rounded-lg p-2 border border-gray-200">
                            <p className="text-xs font-semibold text-gray-900">{witness.name || 'Unknown'}</p>
                            {witness.contactInfo && (
                              <p className="text-xs text-gray-600 mt-0.5">{witness.contactInfo}</p>
                            )}
                            {witness.credibility && (
                              <Badge className="mt-1 text-xs" variant="outline">
                                {witness.credibility}
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card className="bg-gray-100 border-2 border-blue-200 shadow-md">
                <CardContent className="p-6 text-center text-gray-500 text-sm">
                  No investigation details available
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Financial Impact Tab */}
          <TabsContent value="financial" className="space-y-3 mt-4">
            {crime.financialImpact ? (
              <Card className="bg-emerald-100 border-2 border-blue-200 shadow-md">
                <CardHeader className="pb-2 bg-blue-600">
                  <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Financial Impact
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-3">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {crime.financialImpact.propertyDamage !== undefined && (
                      <div className="bg-white/60 rounded-lg p-2 border border-gray-200">
                        <label className="text-xs font-medium text-gray-600">Property Damage</label>
                        <p className="text-lg font-bold text-gray-900 mt-1">
                          ${crime.financialImpact.propertyDamage.toLocaleString()}
                        </p>
                      </div>
                    )}
                    {crime.financialImpact.stolenValue !== undefined && (
                      <div className="bg-white/60 rounded-lg p-2 border border-gray-200">
                        <label className="text-xs font-medium text-gray-600">Stolen Value</label>
                        <p className="text-lg font-bold text-gray-900 mt-1">
                          ${crime.financialImpact.stolenValue.toLocaleString()}
                        </p>
                      </div>
                    )}
                    {crime.financialImpact.investigationCost !== undefined && (
                      <div className="bg-white/60 rounded-lg p-2 border border-gray-200">
                        <label className="text-xs font-medium text-gray-600">Investigation</label>
                        <p className="text-lg font-bold text-gray-900 mt-1">
                          ${crime.financialImpact.investigationCost.toLocaleString()}
                        </p>
                      </div>
                    )}
                    {crime.financialImpact.courtCosts !== undefined && (
                      <div className="bg-white/60 rounded-lg p-2 border border-gray-200">
                        <label className="text-xs font-medium text-gray-600">Court Costs</label>
                        <p className="text-lg font-bold text-gray-900 mt-1">
                          ${crime.financialImpact.courtCosts.toLocaleString()}
                        </p>
                      </div>
                    )}
                    {crime.financialImpact.victimCompensation !== undefined && (
                      <div className="bg-white/60 rounded-lg p-2 border border-gray-200">
                        <label className="text-xs font-medium text-gray-600">Compensation</label>
                        <p className="text-lg font-bold text-gray-900 mt-1">
                          ${crime.financialImpact.victimCompensation.toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                  {(crime.financialImpact.propertyDamage || crime.financialImpact.stolenValue || 
                    crime.financialImpact.investigationCost || crime.financialImpact.courtCosts || 
                    crime.financialImpact.victimCompensation) && (
                    <div className="mt-3 pt-3 border-t-2 border-emerald-300">
                      <div className="bg-white/80 rounded-lg p-3">
                        <label className="text-xs font-medium text-gray-600">Total Financial Impact</label>
                        <p className="text-2xl font-bold text-emerald-700 mt-1">
                          ${(
                            (crime.financialImpact.propertyDamage || 0) +
                            (crime.financialImpact.stolenValue || 0) +
                            (crime.financialImpact.investigationCost || 0) +
                            (crime.financialImpact.courtCosts || 0) +
                            (crime.financialImpact.victimCompensation || 0)
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-gray-100 border-2 border-blue-200 shadow-md">
                <CardContent className="p-6 text-center text-gray-500 text-sm">
                  No financial impact data available
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CrimeView;
