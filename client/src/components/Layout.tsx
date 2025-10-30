
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useSettings } from '../hooks/useSettings';
import { Button } from './ui/button';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';
import ResendVerification from './ResendVerification';
import ChangePasswordModal from './ChangePasswordModal';
import NPSTLogo from './NPSTLogo';
import SignedImage from './SignedImage';
import { 
  Menu, 
  X, 
  LayoutDashboard, 
  Home, 
  Users, 
  User, 
  Building, 
  Shield, 
  FileText, 
  CreditCard, 
  Settings,
  LogOut,
  UserCircle,
  ChevronDown,
  Activity,
  Key,
  Building2,
  HelpCircle,
  UserCheck,
  Scale,
  Gavel,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Heart,
  ShieldAlert
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const getMenuItems = (
  t: (key: string) => string, 
  userRole: string, 
  isDashboardAnalyticsEnabled: boolean,
  isUserManagementEnabled: boolean,
  userOrgId?: string
) => [
  // Show dashboard only if analytics feature is enabled
  ...(isDashboardAnalyticsEnabled ? [
    { text: t('navigation.dashboard'), icon: <LayoutDashboard className="h-5 w-5" />, path: '/dashboard' },
  ] : []),
  
  // Offender Registry System - Show for admin, manager, officer, super_admin roles
  ...(userRole === 'admin' || userRole === 'manager' || userRole === 'officer' || userRole === 'super_admin' ? [
    { text: 'Offenders', icon: <UserCheck className="h-5 w-5" />, path: '/offenders' },
    { text: 'Cases', icon: <FileText className="h-5 w-5" />, path: '/cases' },
    { text: 'Offences', icon: <AlertTriangle className="h-5 w-5" />, path: '/offences' },
    { text: 'Crimes', icon: <ShieldAlert className="h-5 w-5" />, path: '/crimes' },
    { text: 'Victims', icon: <Heart className="h-5 w-5" />, path: '/victims' },
    { text: 'Courts', icon: <Scale className="h-5 w-5" />, path: '/courts' },
  ] : []),
  
  // Show users only for admin/manager roles and if user management is enabled
  ...(userRole === 'admin' || userRole === 'manager' ? [
    ...(isUserManagementEnabled ? [
      { text: t('navigation.users'), icon: <Users className="h-5 w-5" />, path: userOrgId ? `/organisations/${userOrgId}?tab=users` : '/users' },
    ] : [])
  ] : []),
  // Show organisations: super_admin sees list; admin sees own organisation
  ...(userRole === 'super_admin' ? [
    { text: 'Organisations', icon: <Building2 className="h-5 w-5" />, path: '/organisations' },
  ] : userRole === 'admin' ? [
    { text: 'My Organisation', icon: <Building2 className="h-5 w-5" />, path: userOrgId ? `/organisations/${userOrgId}` : '/organisations' },
  ] : []),
  // Settings moved under organisation profile; menu item removed
  // Show audit logs only for admin/super_admin roles
  ...(userRole === 'admin' || userRole === 'super_admin' ? [
    { text: 'Audit Logs', icon: <FileText className="h-5 w-5" />, path: '/audit' },
  ] : []),
  // Show help for all authenticated users
  { text: 'Help', icon: <HelpCircle className="h-5 w-5" />, path: '/help' },
];

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });
  const { user, logout, refreshUser } = useAuth();
  const { t } = useLanguage();
  const { isDashboardAnalyticsEnabled, isUserManagementEnabled } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const profileMenuRef = useRef<HTMLDivElement>(null);
  
  const menuItems = getMenuItems(t, user?.role || '', isDashboardAnalyticsEnabled(), isUserManagementEnabled(), (user?.organisationId as any)?._id || (user?.organisationId as any) || undefined);


  // Handle click outside to close profile menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };

    if (profileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileMenuOpen]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSidebarToggle = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
  };

  const handleLogout = () => {
    logout();
    setProfileMenuOpen(false);
    navigate('/login');
  };

  const handleProfile = () => {
    navigate('/profile');
    setProfileMenuOpen(false);
  };

  const handleChangePassword = () => {
    setChangePasswordModalOpen(true);
    setProfileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 sticky top-0 z-40 shadow-sm transition-colors">
        <div className="flex">
          {/* Logo section - positioned in sidebar area */}
          <div className={`${sidebarCollapsed ? 'w-16' : 'w-72'} bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 flex items-center px-6 transition-all duration-300`}>
            {sidebarCollapsed ? (
              <div className="flex items-center justify-center w-full">
                <NPSTLogo size="sm" showText={false} />
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-slate-100 dark:hover:bg-slate-700 ml-1"
                  onClick={handleSidebarToggle}
                >
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full">
                <NPSTLogo size="md" showText={true} />
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-slate-100 dark:hover:bg-slate-700 ml-2"
                  onClick={handleSidebarToggle}
                >
                  {sidebarCollapsed ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <ChevronLeft className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )}
          </div>
          
          {/* Header content section */}
          <div className="flex-1 px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden hover:bg-slate-100 dark:hover:bg-slate-700 mr-2"
                  onClick={handleDrawerToggle}
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="flex items-center space-x-4">
                <ThemeToggle theme="admin" />
                <LanguageSwitcher />
                <div className="relative" ref={profileMenuRef}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className="flex items-center space-x-3 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg px-3 py-2"
                  >
                    {user?.profilePhoto ? (
                      <SignedImage
                        src={user.profilePhoto}
                        alt={`${user.firstName} ${user.lastName}`}
                        className="w-9 h-9 rounded-lg"
                        fallback={`${user?.firstName?.[0]}${user?.lastName?.[0]}`}
                        size="sm"
                      />
                    ) : (
                      <div className="w-9 h-9 bg-blue-900 dark:bg-blue-800 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">
                          {user?.firstName?.[0]}{user?.lastName?.[0]}
                        </span>
                      </div>
                    )}
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.firstName} {user?.lastName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role}</p>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  </Button>
                  
                  {profileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-lg shadow-lg py-2 z-50 border border-gray-200 dark:border-slate-700">
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.firstName} {user?.lastName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                        <div className="mt-1">
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 capitalize">
                            {user?.role}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={handleProfile}
                        className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center space-x-3 transition-colors"
                      >
                        <UserCircle className="h-4 w-4" />
                        <span>{t('navigation.profile')}</span>
                      </button>
                      <button
                        onClick={handleChangePassword}
                        className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center space-x-3 transition-colors"
                      >
                        <Key className="h-4 w-4" />
                        <span>{t('navigation.changePassword')}</span>
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-3 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>{t('navigation.logout')}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`${mobileOpen ? 'translate-x-0' : '-translate-x-full'} fixed top-16 left-0 bottom-0 z-50 ${sidebarCollapsed ? 'w-16' : 'w-72'} bg-white dark:bg-slate-800 shadow-lg transform transition-all duration-300 ease-in-out md:translate-x-0`}>
          <div className="flex items-center justify-end h-16 px-6 border-b border-gray-200 dark:border-slate-700 md:hidden">
            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-gray-100 dark:hover:bg-slate-700"
              onClick={handleDrawerToggle}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <nav className={`${sidebarCollapsed ? 'px-2' : 'px-4'} py-6`}>
            {menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setMobileOpen(false);
                }}
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'px-4'} py-3 text-left rounded-lg transition-all duration-200 mb-1 group ${
                  location.pathname === item.path
                    ? 'bg-blue-900 dark:bg-blue-800 text-white shadow-sm'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white'
                }`}
                title={sidebarCollapsed ? item.text : undefined}
              >
                <span className={`${sidebarCollapsed ? '' : 'mr-3'} transition-colors ${
                  location.pathname === item.path
                    ? 'text-white' 
                    : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                }`}>
                  {item.icon}
                </span>
                {!sidebarCollapsed && (
                  <span className="font-medium">{item.text}</span>
                )}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'md:ml-16' : 'md:ml-72'}`}>
          <div className="px-2 py-8 md:px-4 lg:px-8">
            {/* Show resend verification if user is logged in but not verified */}
            {user && user.emailVerified === false && (
              <div className="mb-6">
                <ResendVerification 
                  userEmail={user.email} 
                  onResendSuccess={() => {
                    // Refresh user data to update verification status
                    refreshUser();
                  }}
                />
              </div>
            )}
            {children}
          </div>
        </main>
      </div>

      {/* Mobile overlay */}
        {mobileOpen && (
          <div
            className="fixed top-16 inset-x-0 bottom-0 bg-black/20 z-40 md:hidden"
            onClick={handleDrawerToggle}
          />
        )}

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={changePasswordModalOpen}
        onClose={() => setChangePasswordModalOpen(false)}
      />
    </div>
  );
};

export default Layout;