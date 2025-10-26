import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles: ('super_admin' | 'admin' | 'manager' | 'officer' | 'viewer')[];
  fallbackPath?: string;
}

const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({ 
  children, 
  allowedRoles, 
  fallbackPath 
}) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Super admin has access to everything
  if (!user) {
    return <Navigate to={fallbackPath || "/"} replace />;
  }

  // If user is super_admin, allow access regardless of allowedRoles
  if (user.role === 'super_admin') {
    return <>{children}</>;
  }

  // Check if user's role is in the allowed roles list
  if (!allowedRoles.includes(user.role as any)) {
    // Redirect based on user role
    return <Navigate to={fallbackPath || "/"} replace />;
  }

  return <>{children}</>;
};

export default RoleBasedRoute;

