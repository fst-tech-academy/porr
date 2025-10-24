import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSettings } from '../hooks/useSettings';

interface FeatureBasedRouteProps {
  children: React.ReactNode;
  feature: keyof {
    auditLogging: boolean;
    emailNotifications: boolean;
    fileUploads: boolean;
    dashboardAnalytics: boolean;
    userManagement: boolean;
    caseManagement: boolean;
    offenceRecords: boolean;
  };
  fallbackPath?: string;
}

const FeatureBasedRoute: React.FC<FeatureBasedRouteProps> = ({ 
  children, 
  feature, 
  fallbackPath = "/settings" 
}) => {
  const { isFeatureEnabled, loading } = useSettings();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isFeatureEnabled(feature)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};

export default FeatureBasedRoute;
