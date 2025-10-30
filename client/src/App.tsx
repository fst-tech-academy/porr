import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import RoleBasedRoute from './components/RoleBasedRoute';
import FeatureBasedRoute from './components/FeatureBasedRoute';
import RoleBasedRedirect from './components/RoleBasedRedirect';
import Layout from './components/Layout';
import { useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import EmailVerification from './pages/EmailVerification';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import UserView from './pages/UserView';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Help from './pages/Help';
import AuditLogs from './pages/AuditLogs';
import Organisations from './pages/Organisations';
import CreateOrganisation from './pages/CreateOrganisation';
import OrganisationProfile from './pages/OrganisationProfile';
import Offenders from './pages/Offenders';
import OffenderView from './pages/OffenderView';
import CreateOffender from './pages/CreateOffender';
import EditOffender from './pages/EditOffender';
import Cases from './pages/Cases';
import CreateCase from './pages/CreateCase';
import Offences from './pages/Offences';
import CreateOffence from './pages/CreateOffence';
import Courts from './pages/Courts';
import CreateCourt from './pages/CreateCourt';
import Victims from './pages/Victims';
import Crimes from './pages/Crimes';
import CreateCrime from './pages/CreateCrime';
import CreateVictim from './pages/CreateVictim';
import NotFound from './pages/NotFound';
import NotFoundTest from './pages/NotFoundTest';
import NotFoundSimple from './pages/NotFoundSimple';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const UsersRedirect: React.FC = () => {
    const { user } = useAuth();
    const orgId = user?.organisationId;
    if (!orgId) return <Navigate to="/organisations" replace />;
    return <Navigate to={`/organisations/${orgId}?tab=users`} replace />;
  };
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <Router>
            <ErrorBoundary>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/verify-email" element={<EmailVerification />} />
                
                {/* Root route - redirect based on authentication */}
                <Route path="/" element={<RoleBasedRedirect />} />
                
                <Route
                  path="/*"
                  element={
                    <ProtectedRoute>
                      <Routes>
                        {/* NPST Admin Portal Routes */}
                        <Route path="/admin/*" element={
                          <RoleBasedRoute allowedRoles={['admin', 'manager', 'officer', 'viewer']}>
                            <Layout>
                              <Routes>
                                <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
                                <Route path="/dashboard" element={
                                  <FeatureBasedRoute feature="dashboardAnalytics">
                                    <Dashboard />
                                  </FeatureBasedRoute>
                                } />
                                <Route path="/users" element={
                                  <RoleBasedRoute allowedRoles={['admin', 'manager']}>
                                    <FeatureBasedRoute feature="userManagement">
                                      <UsersRedirect />
                                    </FeatureBasedRoute>
                                  </RoleBasedRoute>
                                } />
                                <Route path="/users/:id" element={
                                  <RoleBasedRoute allowedRoles={['admin', 'manager']}>
                                    <FeatureBasedRoute feature="userManagement">
                                      <UserView />
                                    </FeatureBasedRoute>
                                  </RoleBasedRoute>
                                } />
                                <Route path="/settings" element={
                                  <RoleBasedRoute allowedRoles={['admin', 'super_admin']}>
                                    <Settings />
                                  </RoleBasedRoute>
                                } />
                                <Route path="/organisations" element={
                                  <RoleBasedRoute allowedRoles={['super_admin']}>
                                    <Organisations />
                                  </RoleBasedRoute>
                                } />
                                <Route path="/audit" element={
                                  <RoleBasedRoute allowedRoles={['admin', 'super_admin']}>
                                    <FeatureBasedRoute feature="auditLogging">
                                      <AuditLogs />
                                    </FeatureBasedRoute>
                                  </RoleBasedRoute>
                                } />
                                {/* Offender Registry Routes */}
                                <Route path="/offenders" element={
                                  <RoleBasedRoute allowedRoles={['admin', 'manager', 'officer', 'super_admin']}>
                                    <Offenders />
                                  </RoleBasedRoute>
                                } />
                                <Route path="/offenders/new" element={
                                  <RoleBasedRoute allowedRoles={['admin', 'manager', 'officer', 'super_admin']}>
                                    <CreateOffender />
                                  </RoleBasedRoute>
                                } />
                                <Route path="/offenders/:id" element={
                                  <RoleBasedRoute allowedRoles={['admin', 'manager', 'officer', 'super_admin']}>
                                    <OffenderView />
                                  </RoleBasedRoute>
                                } />
                                <Route path="/offenders/:id/edit" element={
                                  <RoleBasedRoute allowedRoles={['admin', 'manager', 'officer', 'super_admin']}>
                                    <EditOffender />
                                  </RoleBasedRoute>
                                } />
                                <Route path="/cases" element={
                                  <RoleBasedRoute allowedRoles={['admin', 'manager', 'officer', 'super_admin']}>
                                    <Cases />
                                  </RoleBasedRoute>
                                } />
                                <Route path="/offences" element={
                                  <RoleBasedRoute allowedRoles={['admin', 'manager', 'officer', 'super_admin']}>
                                    <Offences />
                                  </RoleBasedRoute>
                                } />
                                <Route path="/courts" element={
                                  <RoleBasedRoute allowedRoles={['admin', 'manager', 'officer', 'super_admin']}>
                                    <Courts />
                                  </RoleBasedRoute>
                                } />
                                
                                <Route path="/profile" element={<Profile />} />
                                <Route path="/help" element={<Help />} />
                              </Routes>
                            </Layout>
                          </RoleBasedRoute>
                        } />
                        
                        {/* Direct settings route */}
                        <Route path="/settings" element={
                          <RoleBasedRoute allowedRoles={['admin', 'super_admin']}>
                            <Layout>
                              <Settings />
                            </Layout>
                          </RoleBasedRoute>
                        } />
                        
                        {/* Direct audit route */}
                        <Route path="/audit" element={
                          <RoleBasedRoute allowedRoles={['admin', 'super_admin']}>
                            <FeatureBasedRoute feature="auditLogging">
                              <Layout>
                                <AuditLogs />
                              </Layout>
                            </FeatureBasedRoute>
                          </RoleBasedRoute>
                        } />
                        
                        {/* Direct organisations route */}
                        <Route path="/organisations" element={
                          <RoleBasedRoute allowedRoles={['super_admin']}>
                            <Layout>
                              <Organisations />
                            </Layout>
                          </RoleBasedRoute>
                        } />
                        <Route path="/organisations/new" element={
                          <RoleBasedRoute allowedRoles={['super_admin']}>
                            <CreateOrganisation />
                          </RoleBasedRoute>
                        } />
                        <Route path="/organisations/:id" element={
                          <RoleBasedRoute allowedRoles={['super_admin']}>
                            <OrganisationProfile />
                          </RoleBasedRoute>
                        } />
                        
                        {/* Direct offender registry routes */}
                        <Route path="/offenders" element={
                          <RoleBasedRoute allowedRoles={['admin', 'manager', 'officer', 'super_admin']}>
                            <Layout>
                              <Offenders />
                            </Layout>
                          </RoleBasedRoute>
                        } />
                        <Route path="/offenders/new" element={
                          <RoleBasedRoute allowedRoles={['admin', 'manager', 'officer', 'super_admin']}>
                            <Layout>
                              <CreateOffender />
                            </Layout>
                          </RoleBasedRoute>
                        } />
                        <Route path="/offenders/:id" element={
                          <RoleBasedRoute allowedRoles={['admin', 'manager', 'officer', 'super_admin']}>
                            <Layout>
                              <OffenderView />
                            </Layout>
                          </RoleBasedRoute>
                        } />
                        <Route path="/offenders/:id/edit" element={
                          <RoleBasedRoute allowedRoles={['admin', 'manager', 'officer', 'super_admin']}>
                            <Layout>
                              <EditOffender />
                            </Layout>
                          </RoleBasedRoute>
                        } />
                        <Route path="/cases" element={
                          <RoleBasedRoute allowedRoles={['admin', 'manager', 'officer', 'super_admin']}>
                            <Layout>
                              <Cases />
                            </Layout>
                          </RoleBasedRoute>
                        } />
                        <Route path="/cases/new" element={
                          <RoleBasedRoute allowedRoles={['admin', 'manager', 'officer', 'super_admin']}>
                            <Layout>
                              <CreateCase />
                            </Layout>
                          </RoleBasedRoute>
                        } />
                        <Route path="/offences" element={
                          <RoleBasedRoute allowedRoles={['admin', 'manager', 'officer', 'super_admin']}>
                            <Layout>
                              <Offences />
                            </Layout>
                          </RoleBasedRoute>
                        } />
                        <Route path="/offences/new" element={
                          <RoleBasedRoute allowedRoles={['admin', 'manager', 'officer', 'super_admin']}>
                            <Layout>
                              <CreateOffence />
                            </Layout>
                          </RoleBasedRoute>
                        } />
                        <Route path="/courts" element={
                          <RoleBasedRoute allowedRoles={['admin', 'manager', 'officer', 'super_admin']}>
                            <Layout>
                              <Courts />
                            </Layout>
                          </RoleBasedRoute>
                        } />
                        <Route path="/courts/new" element={
                          <RoleBasedRoute allowedRoles={['admin', 'manager', 'officer', 'super_admin']}>
                            <Layout>
                              <CreateCourt />
                            </Layout>
                          </RoleBasedRoute>
                        } />
                        <Route path="/victims" element={
                          <RoleBasedRoute allowedRoles={['admin', 'manager', 'officer', 'super_admin']}>
                            <Layout>
                              <Victims />
                            </Layout>
                          </RoleBasedRoute>
                        } />
                        <Route path="/crimes" element={
                          <RoleBasedRoute allowedRoles={['admin', 'manager', 'officer', 'super_admin']}>
                            <Layout>
                              <Crimes />
                            </Layout>
                          </RoleBasedRoute>
                        } />
                        <Route path="/crimes/new" element={
                          <RoleBasedRoute allowedRoles={['admin', 'manager', 'officer', 'super_admin']}>
                            <Layout>
                              <CreateCrime />
                            </Layout>
                          </RoleBasedRoute>
                        } />
                        <Route path="/victims/new" element={
                          <RoleBasedRoute allowedRoles={['admin', 'manager', 'officer', 'super_admin']}>
                            <Layout>
                              <CreateVictim />
                            </Layout>
                          </RoleBasedRoute>
                        } />
                        
                        {/* Direct help route */}
                        <Route path="/help" element={
                          <Layout>
                            <Help />
                          </Layout>
                        } />
                        
                        {/* Default redirect based on role */}
                        <Route path="/" element={<RoleBasedRedirect />} />
                        
                        {/* Legacy routes for backward compatibility */}
                        <Route path="/dashboard" element={
                          <RoleBasedRoute allowedRoles={['admin', 'manager', 'officer', 'viewer']}>
                            <Layout>
                              <FeatureBasedRoute feature="dashboardAnalytics">
                                <Dashboard />
                              </FeatureBasedRoute>
                            </Layout>
                          </RoleBasedRoute>
                        } />
                        <Route path="/users" element={
                          <RoleBasedRoute allowedRoles={['admin', 'manager']}>
                            <Layout>
                              <FeatureBasedRoute feature="userManagement">
                                <UsersRedirect />
                              </FeatureBasedRoute>
                            </Layout>
                          </RoleBasedRoute>
                        } />
                        <Route path="/profile" element={
                          <RoleBasedRoute allowedRoles={['admin', 'manager', 'officer', 'viewer']}>
                            <Layout>
                              <Profile />
                            </Layout>
                          </RoleBasedRoute>
                        } />
                      </Routes>
                    </ProtectedRoute>
                  }
                />
                
                {/* 404 Not Found Route - Must be last to catch all unmatched routes */}
                <Route path="*" element={<NotFoundSimple />} />
              </Routes>
            </ErrorBoundary>
          </Router>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;