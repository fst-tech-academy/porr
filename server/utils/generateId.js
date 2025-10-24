const { v4: uuidv4 } = require('uuid');

// Generate unique IDs for different entities
const generateId = (prefix) => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `${prefix}_${timestamp}_${random}`.toUpperCase();
};

// Generate specific entity IDs
const generateSimId = () => generateId('SIM');

// Generate employee ID
const generateEmployeeId = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 3);
  return `EMP_${timestamp}_${random}`.toUpperCase();
};

module.exports = {
  generateId,
  generateSimId,
  generateEmployeeId
};
