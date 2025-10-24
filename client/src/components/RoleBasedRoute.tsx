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
  
  console.log('RoleBasedRoute - User:', user);
  console.log('RoleBasedRoute - Allowed roles:', allowedRoles);
  console.log('RoleBasedRoute - User role:', user?.role);
  console.log('RoleBasedRoute - Is authenticated:', isAuthenticated);

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

  if (!user || !allowedRoles.includes(user.role as any)) {
    // Redirect based on user role
    return <Navigate to={fallbackPath || "/"} replace />;
  }

  return <>{children}</>;
};

export default RoleBasedRoute;

