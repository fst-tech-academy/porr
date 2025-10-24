import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../hooks/useSettings';

const RoleBasedRedirect: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const { 
    isDashboardAnalyticsEnabled, 
    isUserManagementEnabled, 
    loading: settingsLoading 
  } = useSettings();

  if (loading || settingsLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }


  // Determine the best redirect based on available features and user role
  const isDashboardAvailable = isDashboardAnalyticsEnabled();
  const isUsersAvailable = isUserManagementEnabled();

  // Priority order: Dashboard > Users > Settings > Help > Profile
  if (isDashboardAvailable) {
    return <Navigate to="/dashboard" replace />;
  } else if (isUsersAvailable && (user?.role === 'admin' || user?.role === 'manager')) {
    return <Navigate to="/users" replace />;
  } else if (user?.role === 'admin' || user?.role === 'super_admin') {
    return <Navigate to="/settings" replace />;
  } else {
    // When dashboard is disabled, redirect to help page for better user experience
    return <Navigate to="/help" replace />;
  }
};

export default RoleBasedRedirect;

