import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  HelpCircle, 
  BookOpen, 
  Video, 
  FileText, 
  Play, 
  Download, 
  ExternalLink,
  Search,
  Filter,
  Clock,
  User,
  Settings,
  Users,
  LayoutDashboard,
  Shield,
  Upload,
  Mail,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';

const Help: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Topics', icon: <BookOpen className="h-4 w-4" /> },
    { id: 'getting-started', name: 'Getting Started', icon: <Play className="h-4 w-4" /> },
    { id: 'user-management', name: 'User Management', icon: <Users className="h-4 w-4" /> },
    { id: 'system-settings', name: 'System Settings', icon: <Settings className="h-4 w-4" /> },
    { id: 'troubleshooting', name: 'Troubleshooting', icon: <AlertCircle className="h-4 w-4" /> }
  ];

  const tutorials = [
    {
      id: 1,
      title: 'System Overview & Navigation',
      category: 'getting-started',
      type: 'video',
      duration: '5:30',
      description: 'Learn the basics of navigating the NPST system and understanding the main features.',
      thumbnail: '/api/placeholder/300/200',
      videoUrl: '#',
      steps: [
        'Access the system through your web browser',
        'Log in with your credentials',
        'Navigate through the main dashboard',
        'Understand the sidebar menu structure',
        'Access different modules based on your role'
      ]
    },
    {
      id: 2,
      title: 'User Registration & Management',
      category: 'user-management',
      type: 'video',
      duration: '8:15',
      description: 'Complete guide to registering new users and managing existing user accounts.',
      thumbnail: '/api/placeholder/300/200',
      videoUrl: '#',
      steps: [
        'Navigate to the Users section',
        'Click "Add New User" button',
        'Fill in user details (name, email, role)',
        'Set user permissions and access levels',
        'Save and verify user creation'
      ]
    },
    {
      id: 3,
      title: 'System Settings Configuration',
      category: 'system-settings',
      type: 'video',
      duration: '12:45',
      description: 'How to configure system settings, features, and security options.',
      thumbnail: '/api/placeholder/300/200',
      videoUrl: '#',
      steps: [
        'Access Settings from the main menu',
        'Configure general system information',
        'Set up registration and authentication options',
        'Enable/disable system features',
        'Configure security and maintenance settings'
      ]
    },
    {
      id: 4,
      title: 'File Upload & Management',
      category: 'getting-started',
      type: 'video',
      duration: '6:20',
      description: 'Learn how to upload, manage, and organize files in the system.',
      thumbnail: '/api/placeholder/300/200',
      videoUrl: '#',
      steps: [
        'Navigate to file upload section',
        'Select files from your device',
        'Configure upload settings',
        'Monitor upload progress',
        'Manage uploaded files'
      ]
    },
    {
      id: 5,
      title: 'Troubleshooting Login Issues',
      category: 'troubleshooting',
      type: 'article',
      duration: '3:00',
      description: 'Common solutions for login problems and account access issues.',
      thumbnail: '/api/placeholder/300/200',
      videoUrl: '#',
      steps: [
        'Check your username and password',
        'Verify your account is active',
        'Clear browser cache and cookies',
        'Try different browser',
        'Contact system administrator'
      ]
    },
    {
      id: 6,
      title: 'Role-Based Access Control',
      category: 'user-management',
      type: 'video',
      duration: '10:30',
      description: 'Understanding different user roles and their permissions in the system.',
      thumbnail: '/api/placeholder/300/200',
      videoUrl: '#',
      steps: [
        'Review available user roles',
        'Understand role permissions',
        'Assign appropriate roles to users',
        'Configure role-based access',
        'Test access restrictions'
      ]
    }
  ];

  const quickStartGuide = [
    {
      title: 'First Time Setup',
      icon: <Play className="h-5 w-5 text-blue-600" />,
      steps: [
        'Log in with your administrator credentials',
        'Navigate to Settings to configure system basics',
        'Set up user roles and permissions',
        'Configure email notifications',
        'Test the system with a sample user'
      ]
    },
    {
      title: 'Adding Users',
      icon: <Users className="h-5 w-5 text-green-600" />,
      steps: [
        'Go to Users section in the main menu',
        'Click "Add New User" button',
        'Fill in required user information',
        'Assign appropriate role and permissions',
        'Save and notify the user of their account'
      ]
    },
    {
      title: 'System Configuration',
      icon: <Settings className="h-5 w-5 text-purple-600" />,
      steps: [
        'Access Settings from the main menu',
        'Configure system name and description',
        'Set up registration options',
        'Enable/disable features as needed',
        'Configure security settings'
      ]
    }
  ];

  const filteredTutorials = tutorials.filter(tutorial => {
    const matchesSearch = tutorial.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tutorial.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || tutorial.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
            <HelpCircle className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Help & Documentation</h1>
            <p className="text-gray-600 mt-1">Step-by-step guides and video tutorials to help you use the system</p>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <Card className="mb-8 border-2 border-gray-200 shadow-xl bg-white rounded-xl overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search tutorials and guides..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-sm"
                />
              </div>
            </div>
            <div className="flex gap-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center space-x-2 transition-all duration-200 ${
                    selectedCategory === category.id 
                      ? 'bg-blue-500 hover:bg-blue-600 text-white border-blue-500 shadow-md' 
                      : 'border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300'
                  }`}
                >
                  {category.icon}
                  <span className="hidden sm:inline">{category.name}</span>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Start Guide */}
      <Card className="mb-8 border-2 border-gray-200 shadow-xl bg-white rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 border-b border-green-600 pb-4">
          <CardTitle className="text-xl font-bold text-white flex items-center space-x-2">
            <Play className="h-5 w-5 text-white" />
            <span>Quick Start Guide</span>
          </CardTitle>
          <p className="text-sm text-green-100 mt-1">Get up and running quickly with these essential steps</p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {quickStartGuide.map((guide, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl p-6 shadow-lg">
                <div className="flex items-center space-x-3 mb-4">
                  {guide.icon}
                  <h3 className="text-lg font-bold text-gray-800">{guide.title}</h3>
                </div>
                <ol className="space-y-2">
                  {guide.steps.map((step, stepIndex) => (
                    <li key={stepIndex} className="flex items-start space-x-2 text-sm text-gray-700">
                      <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                        {stepIndex + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Video Tutorials */}
      <Card className="mb-8 border-2 border-gray-200 shadow-xl bg-white rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 border-b border-purple-600 pb-4">
          <CardTitle className="text-xl font-bold text-white flex items-center space-x-2">
            <Video className="h-5 w-5 text-white" />
            <span>Video Tutorials</span>
          </CardTitle>
          <p className="text-sm text-purple-100 mt-1">Step-by-step video guides for all major features</p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTutorials.map((tutorial) => (
              <div key={tutorial.id} className={`bg-white border-2 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-200 ${
                tutorial.category === selectedCategory && selectedCategory !== 'all'
                  ? 'border-blue-500 shadow-blue-100 shadow-lg' 
                  : 'border-gray-200'
              }`}>
                <div className="relative">
                  <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Play className="h-8 w-8 text-white ml-1" />
                      </div>
                      <p className="text-sm text-gray-600">Video Tutorial</p>
                    </div>
                  </div>
                  <div className="absolute top-3 right-3">
                    <Badge variant="secondary" className="bg-black/80 text-white">
                      {tutorial.duration}
                    </Badge>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        tutorial.category === selectedCategory && selectedCategory !== 'all'
                          ? 'bg-blue-500 text-white border-blue-500' 
                          : 'border-gray-300 text-gray-600'
                      }`}
                    >
                      {categories.find(cat => cat.id === tutorial.category)?.name}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {tutorial.type === 'video' ? 'Video' : 'Article'}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{tutorial.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{tutorial.description}</p>
                  <div className="space-y-2 mb-4">
                    <h4 className="font-semibold text-gray-800 text-sm">Key Steps:</h4>
                    <ul className="space-y-1">
                      {tutorial.steps.slice(0, 3).map((step, index) => (
                        <li key={index} className="flex items-start space-x-2 text-xs text-gray-600">
                          <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{step}</span>
                        </li>
                      ))}
                      {tutorial.steps.length > 3 && (
                        <li className="text-xs text-gray-500">
                          +{tutorial.steps.length - 3} more steps
                        </li>
                      )}
                    </ul>
                  </div>
                  <div className="flex space-x-2">
                    <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                      <Play className="h-4 w-4 mr-2" />
                      Watch Now
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Documentation Resources */}
      <Card className="border-2 border-gray-200 shadow-xl bg-white rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-indigo-500 to-indigo-600 border-b border-indigo-600 pb-4">
          <CardTitle className="text-xl font-bold text-white flex items-center space-x-2">
            <FileText className="h-5 w-5 text-white" />
            <span>Documentation Resources</span>
          </CardTitle>
          <p className="text-sm text-indigo-100 mt-1">Additional resources and documentation</p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-6 shadow-lg">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-blue-800">User Manual</h3>
                  <p className="text-sm text-blue-600">Complete system documentation</p>
                </div>
              </div>
              <p className="text-sm text-blue-700 mb-4">
                Comprehensive guide covering all features, settings, and best practices for using the NPST system.
              </p>
              <Button variant="outline" className="w-full border-blue-300 text-blue-700 hover:bg-blue-50">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl p-6 shadow-lg">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-green-500 rounded-lg">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-green-800">Security Guide</h3>
                  <p className="text-sm text-green-600">Best practices for security</p>
                </div>
              </div>
              <p className="text-sm text-green-700 mb-4">
                Learn about security features, password policies, and how to maintain a secure system environment.
              </p>
              <Button variant="outline" className="w-full border-green-300 text-green-700 hover:bg-green-50">
                <ExternalLink className="h-4 w-4 mr-2" />
                View Guide
              </Button>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-xl p-6 shadow-lg">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-purple-800">Troubleshooting</h3>
                  <p className="text-sm text-purple-600">Common issues and solutions</p>
                </div>
              </div>
              <p className="text-sm text-purple-700 mb-4">
                Quick reference for resolving common issues, error messages, and system problems.
              </p>
              <Button variant="outline" className="w-full border-purple-300 text-purple-700 hover:bg-purple-50">
                <Info className="h-4 w-4 mr-2" />
                View Solutions
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Help;
