/**
 * Error Handler Utility
 * Provides consistent error handling across the application
 */

export interface ApiError {
  response?: {
    status: number;
    data?: {
      message?: string;
      errors?: Array<{
        msg?: string;
        message?: string;
        field?: string;
      }>;
    };
  };
  message?: string;
}

/**
 * Get user-friendly error message from API error
 */
export const getErrorMessage = (error: ApiError): string => {
  // Handle validation errors
  if (error.response?.status === 400 && error.response?.data?.errors) {
    const firstError = error.response.data.errors[0];
    return firstError.msg || firstError.message || 'Validation failed';
  }

  // Handle specific backend error messages
  if (error.response?.status === 400 && error.response?.data?.message) {
    const message = error.response.data.message;
    
    // User management errors
    if (message.includes('User already exists with this username')) {
      return 'This username is already taken. Please choose a different username.';
    }
    if (message.includes('User already exists with this email')) {
      return 'This email address is already registered. Please use a different email.';
    }
    if (message.includes('You cannot create users with role')) {
      return 'You do not have permission to create users with this role. Please select a different role.';
    }
    if (message.includes('User management is currently disabled')) {
      return 'User management is currently disabled. Please contact your administrator.';
    }
    if (message.includes('Role is required')) {
      return 'Please select a role for the user.';
    }
    if (message.includes('Password must be at least')) {
      return 'Password must be at least 6 characters long.';
    }
    if (message.includes('Please enter a valid email')) {
      return 'Please enter a valid email address.';
    }
    if (message.includes('Please enter a valid phone number')) {
      return 'Please enter a valid phone number.';
    }

    // Organisation errors
    if (message.includes('Organisation already exists')) {
      return 'An organisation with this name already exists. Please choose a different name.';
    }
    if (message.includes('Email already registered')) {
      return 'This email address is already registered. Please use a different email.';
    }

    // Registration errors
    if (message.includes('Public registration is currently disabled')) {
      return 'Public registration is currently disabled. Please contact your administrator.';
    }

    // Return the original message if no specific handler found
    return message;
  }

  // Handle permission errors
  if (error.response?.status === 403) {
    return 'You do not have permission to perform this action. Please contact your administrator.';
  }

  // Handle server errors
  if (error.response?.status === 500) {
    return 'Server error occurred. Please try again later or contact support.';
  }

  // Handle network errors
  if (error.message?.toLowerCase().includes('network')) {
    return 'Network error. Please check your connection and try again.';
  }

  // Handle timeout errors
  if (error.message?.toLowerCase().includes('timeout')) {
    return 'Request timed out. Please try again.';
  }

  // Return generic error message
  return error.response?.data?.message || error.message || 'An unexpected error occurred. Please try again.';
};

/**
 * Check if error is a validation error
 */
export const isValidationError = (error: ApiError): boolean => {
  return error.response?.status === 400 && !!error.response?.data?.errors;
};

/**
 * Check if error is a permission error
 */
export const isPermissionError = (error: ApiError): boolean => {
  return error.response?.status === 403;
};

/**
 * Check if error is a server error
 */
export const isServerError = (error: ApiError): boolean => {
  return (error.response?.status || 0) >= 500;
};

/**
 * Check if error is a network error
 */
export const isNetworkError = (error: ApiError): boolean => {
  return error.message?.toLowerCase().includes('network') || 
         error.message?.toLowerCase().includes('timeout') ||
         !error.response;
};

/**
 * Get error severity level
 */
export const getErrorSeverity = (error: ApiError): 'low' | 'medium' | 'high' | 'critical' => {
  if (isServerError(error)) return 'critical';
  if (isPermissionError(error)) return 'high';
  if (isValidationError(error)) return 'medium';
  if (isNetworkError(error)) return 'high';
  return 'low';
};

/**
 * Format error for logging
 */
export const formatErrorForLogging = (error: ApiError, context?: string): string => {
  const timestamp = new Date().toISOString();
  const contextStr = context ? ` [${context}]` : '';
  const status = error.response?.status ? ` (${error.response.status})` : '';
  const message = getErrorMessage(error);
  
  return `${timestamp}${contextStr}${status}: ${message}`;
};
