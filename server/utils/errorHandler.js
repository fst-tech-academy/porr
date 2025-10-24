/**
 * Handle Mongoose errors and return appropriate response
 * @param {Error} error - The error object
 * @param {Object} res - Express response object
 * @param {string} defaultMessage - Default error message
 * @returns {Object} - Formatted error response
 */
const handleMongooseError = (error, res, defaultMessage = 'Server error') => {
  console.error('Error:', error);
  
  // Handle Mongoose validation errors
  if (error.name === 'ValidationError') {
    const validationErrors = Object.values(error.errors).map(err => ({
      field: err.path,
      message: err.message
    }));
    
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: validationErrors
    });
  }
  
  // Handle duplicate key errors (e.g., email already exists)
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    return res.status(400).json({
      success: false,
      message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`
    });
  }
  
  // Handle cast errors (invalid ObjectId)
  if (error.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }
  
  // Generic server error
  return res.status(500).json({
    success: false,
    message: defaultMessage
  });
};

module.exports = {
  handleMongooseError
};
