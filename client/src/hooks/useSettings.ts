import { useState, useEffect } from 'react';

interface PublicSettings {
  systemName: string;
  systemDescription: string;
  registration: {
    publicRegistration: boolean;
    emailVerificationRequired: boolean;
    autoApproveUsers: boolean;
  };
  ui: {
    theme: string;
    language: string;
    showRegistrationForm: boolean;
    showForgotPassword: boolean;
  };
  maintenance: {
    isMaintenanceMode: boolean;
    maintenanceMessage: string;
  };
  features: {
    auditLogging: boolean;
    emailNotifications: boolean;
    fileUploads: boolean;
    dashboardAnalytics: boolean;
    userManagement: boolean;
    caseManagement: boolean;
    offenceRecords: boolean;
  };
}

export const useSettings = () => {
  const [settings, setSettings] = useState<PublicSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/settings/public');
      
      if (response.ok) {
        const data = await response.json();
        setSettings(data.data.settings);
      } else {
        setError('Failed to fetch settings');
      }
    } catch (err) {
      setError('Error fetching settings');
    } finally {
      setLoading(false);
    }
  };

  const isPublicRegistrationEnabled = () => {
    return settings?.registration?.publicRegistration ?? true;
  };

  const isEmailVerificationRequired = () => {
    return settings?.registration?.emailVerificationRequired ?? true;
  };

  const isAutoApproveUsers = () => {
    return settings?.registration?.autoApproveUsers ?? false;
  };

  const shouldShowRegistrationForm = () => {
    return settings?.registration?.publicRegistration ?? true;
  };

  const shouldShowForgotPassword = () => {
    return settings?.ui?.showForgotPassword ?? true;
  };

  const isMaintenanceMode = () => {
    return settings?.maintenance?.isMaintenanceMode ?? false;
  };

  const getMaintenanceMessage = () => {
    return settings?.maintenance?.maintenanceMessage ?? 'System is under maintenance. Please try again later.';
  };

  const getSystemName = () => {
    return settings?.systemName ?? 'New Project Starter Template';
  };

  const getSystemDescription = () => {
    return settings?.systemDescription ?? 'A comprehensive system for managing offence records and legal proceedings';
  };

  const isFeatureEnabled = (featureName: keyof PublicSettings['features']) => {
    return settings?.features?.[featureName] ?? true;
  };

  const isDashboardAnalyticsEnabled = () => {
    return isFeatureEnabled('dashboardAnalytics');
  };

  const isUserManagementEnabled = () => {
    return isFeatureEnabled('userManagement');
  };

  const isCaseManagementEnabled = () => {
    return isFeatureEnabled('caseManagement');
  };

  const isOffenceRecordsEnabled = () => {
    return isFeatureEnabled('offenceRecords');
  };

  const isFileUploadsEnabled = () => {
    return isFeatureEnabled('fileUploads');
  };

  const isEmailNotificationsEnabled = () => {
    return isFeatureEnabled('emailNotifications');
  };

  const isAuditLoggingEnabled = () => {
    return isFeatureEnabled('auditLogging');
  };

  return {
    settings,
    loading,
    error,
    isPublicRegistrationEnabled,
    isEmailVerificationRequired,
    isAutoApproveUsers,
    shouldShowRegistrationForm,
    shouldShowForgotPassword,
    isMaintenanceMode,
    getMaintenanceMessage,
    getSystemName,
    getSystemDescription,
    isFeatureEnabled,
    isDashboardAnalyticsEnabled,
    isUserManagementEnabled,
    isCaseManagementEnabled,
    isOffenceRecordsEnabled,
    isFileUploadsEnabled,
    isEmailNotificationsEnabled,
    isAuditLoggingEnabled,
    refetch: fetchSettings
  };
};
