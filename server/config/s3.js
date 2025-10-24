// Ensure environment variables are loaded first
require('dotenv').config();

const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

// Check if AWS credentials are available
const hasAWSCredentials = process.env.AWS_ACCESS_KEY_ID && 
                         process.env.AWS_SECRET_ACCESS_KEY && 
                         process.env.AWS_S3_BUCKET;

console.log('AWS Configuration Check:', {
  hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
  hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY,
  hasBucket: !!process.env.AWS_S3_BUCKET,
  bucket: process.env.AWS_S3_BUCKET,
  region: process.env.AWS_REGION || 'eu-west-2',
  hasAllCredentials: hasAWSCredentials
});

let upload, s3, deleteFromS3, getSignedUrl;

if (hasAWSCredentials) {
  // Configure AWS SDK v2
  AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'eu-west-2'
  });

  // Create S3 client with AWS SDK v2
  s3 = new AWS.S3();

  // Configure multer for S3 upload
  upload = multer({
    storage: multerS3({
      s3: s3,
      bucket: process.env.AWS_S3_BUCKET,
      // Remove ACL since bucket doesn't allow ACLs
      key: function (req, file, cb) {
        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileName = `${file.fieldname}-${uniqueSuffix}.${file.originalname.split('.').pop()}`;
        cb(null, fileName);
      },
      contentType: multerS3.AUTO_CONTENT_TYPE,
      cacheControl: 'max-age=31536000', // Cache for 1 year
      metadata: function (req, file, cb) {
        cb(null, { fieldName: file.fieldname });
      }
    }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Allow all document types
    const allowedMimes = [
      'image/', 'application/pdf', 'text/', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];
    
    const isAllowed = allowedMimes.some(mime => 
      file.mimetype.startsWith(mime) || file.mimetype === mime
    );
    
    if (isAllowed) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed!'), false);
    }
  }
});

  // Helper function to delete file from S3
  deleteFromS3 = async (fileUrl) => {
    try {
      const key = fileUrl.split('/').pop(); // Extract filename from URL
      const params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key
      };
      
      await s3.deleteObject(params).promise();
      console.log(`File deleted from S3: ${key}`);
    } catch (error) {
      console.error('Error deleting file from S3:', error);
      throw error;
    }
  };

  // Helper function to get signed URL for private files (if needed)
  getSignedUrl = async (key, expires = 3600) => {
    try {
      const params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
        Expires: expires
      };
      
      return s3.getSignedUrl('getObject', params);
    } catch (error) {
      console.error('Error generating signed URL:', error);
      throw error;
    }
  };
} else {
  // Fallback to local storage if AWS credentials are not available
  console.log('⚠️  AWS credentials not found, using local storage fallback');
  
  upload = multer({
    dest: 'uploads/',
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    }
  });
  
  deleteFromS3 = async (fileUrl) => {
    console.log('Local storage: File deletion not implemented');
  };
  
  getSignedUrl = async (key, expires = 3600) => {
    console.log('Local storage: Signed URL not implemented');
    return null;
  };
}

module.exports = {
  upload,
  deleteFromS3,
  getSignedUrl,
  s3
};
