import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { 
  Home, 
  ArrowLeft, 
  Search, 
  AlertTriangle,
  RefreshCw,
  Globe,
  Shield,
  Users,
  Settings,
  FileText,
  Database,
  BarChart3,
  Bell
} from 'lucide-react';
import NPSTLogo from '../components/NPSTLogo';

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleGoHome = () => {
    navigate('/help');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setIsSearching(true);
      // Simulate search - in a real app, this would search through available routes
      setTimeout(() => {
        setIsSearching(false);
        // Navigate to dashboard with search term (could be enhanced with actual search)
        navigate('/help');
      }, 1000);
    }
  };

  const quickLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: <Home className="h-4 w-4" />, description: 'Main dashboard' },
    { name: 'Users', path: '/users', icon: <Users className="h-4 w-4" />, description: 'User management' },
    { name: 'Settings', path: '/settings', icon: <Settings className="h-4 w-4" />, description: 'System settings' },
    { name: 'Audit Logs', path: '/audit', icon: <FileText className="h-4 w-4" />, description: 'System logs' },
    { name: 'Organisations', path: '/organisations', icon: <Database className="h-4 w-4" />, description: 'Organisation management' },
    { name: 'Help', path: '/help', icon: <Globe className="h-4 w-4" />, description: 'Help & support' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header with Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <NPSTLogo className="h-16 w-auto" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">New Project Starter Template</h1>
          <p className="text-gray-600">Enterprise Application Template</p>
        </div>

        {/* Main 404 Content */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-2xl">
          <CardContent className="p-8">
            <div className="text-center">
              {/* 404 Number with Animation */}
              <div className="relative mb-8">
                <div className="text-9xl font-bold text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text animate-pulse">
                  404
                </div>
                <div className="absolute -top-4 -right-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center animate-bounce">
                    <AlertTriangle className="h-4 w-4 text-white" />
                  </div>
                </div>
              </div>

              {/* Error Message */}
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Oops! Page Not Found
              </h2>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                The page you're looking for seems to have vanished into the digital void. 
                Don't worry, even the best systems sometimes lose track of things!
              </p>

              {/* Search Functionality */}
              <div className="mb-8">
                <form onSubmit={handleSearch} className="max-w-md mx-auto">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      type="text"
                      placeholder="Search for pages or features..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-3 text-lg border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                    />
                    <Button
                      type="submit"
                      disabled={isSearching || !searchTerm.trim()}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-200"
                    >
                      {isSearching ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </form>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Button
                  onClick={handleGoHome}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
                >
                  <Home className="h-5 w-5" />
                  <span>Go to Dashboard</span>
                </Button>
                
                <Button
                  onClick={handleGoBack}
                  variant="outline"
                  className="border-2 border-gray-300 hover:border-blue-500 text-gray-700 hover:text-blue-600 px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span>Go Back</span>
                </Button>
                
                <Button
                  onClick={handleRefresh}
                  variant="outline"
                  className="border-2 border-gray-300 hover:border-green-500 text-gray-700 hover:text-green-600 px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
                >
                  <RefreshCw className="h-5 w-5" />
                  <span>Refresh Page</span>
                </Button>
              </div>

              {/* Quick Links */}
              <div className="border-t border-gray-200 pt-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">Quick Navigation</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {quickLinks.map((link, index) => (
                    <Button
                      key={index}
                      onClick={() => navigate(link.path)}
                      variant="ghost"
                      className="h-auto p-6 flex flex-col items-center space-y-3 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md"
                    >
                      <div className="text-blue-600">{link.icon}</div>
                      <div className="text-center">
                        <div className="text-sm font-semibold text-gray-900">{link.name}</div>
                        <div className="text-xs text-gray-500 mt-1">{link.description}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Helpful Tips */}
        <Card className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="text-center">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">💡 Helpful Tips</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Bell className="h-4 w-4 text-blue-500" />
                  <span>Check your notifications for recent updates</span>
                </div>
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4 text-green-500" />
                  <span>Visit the dashboard for system overview</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Settings className="h-4 w-4 text-purple-500" />
                  <span>Review settings if you have access issues</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Information */}
        <div className="text-center mt-8">
          <div className="flex items-center justify-center space-x-2 text-gray-500 mb-2">
            <Shield className="h-4 w-4" />
            <span className="text-sm">Secure Digital Justice Platform</span>
          </div>
          <p className="text-xs text-gray-400">
            If you believe this is an error, please contact your system administrator
          </p>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-16 h-16 bg-gradient-to-r from-pink-400 to-red-400 rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-5 w-12 h-12 bg-gradient-to-r from-green-400 to-blue-400 rounded-full opacity-20 animate-pulse delay-500"></div>
        <div className="absolute top-1/3 right-5 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full opacity-20 animate-pulse delay-700"></div>
      </div>
    </div>
  );
};

export default NotFound;
