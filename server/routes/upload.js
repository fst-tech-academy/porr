const express = require('express');
const router = express.Router();
const { upload, deleteFromS3, getSignedUrl } = require('../config/s3');
const { protect } = require('../middleware/auth');
const { checkFileUploads } = require('../middleware/settings');

// Upload single image
router.post('/single', protect, checkFileUploads, upload.single('image'), (req, res) => {
  try {
    console.log('Upload request received:', {
      hasFile: !!req.file,
      fileInfo: req.file ? {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        location: req.file.location,
        key: req.file.key
      } : null,
      body: req.body
    });
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    console.log('File upload details:', {
      location: req.file.location,
      key: req.file.key,
      bucket: req.file.bucket
    });

    // req.file.location contains the S3 URL
    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        imageUrl: req.file.location,
        key: req.file.key,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading image',
      error: error.message
    });
  }
});

// Upload multiple images
router.post('/multiple', protect, checkFileUploads, upload.array('images', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No image files provided'
      });
    }

    const uploadedFiles = req.files.map(file => ({
      imageUrl: file.location,
      key: file.key,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype
    }));

    res.json({
      success: true,
      message: `${req.files.length} images uploaded successfully`,
      data: uploadedFiles
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading images',
      error: error.message
    });
  }
});

// Get signed URL for image access (temporarily without auth for testing)
router.get('/signed-url/:key', async (req, res) => {
  try {
    const { key } = req.params;
    
    if (!key) {
      return res.status(400).json({
        success: false,
        message: 'Image key is required'
      });
    }

    const signedUrl = await getSignedUrl(key, 3600); // 1 hour expiry

    res.json({
      success: true,
      data: {
        signedUrl: signedUrl
      }
    });
  } catch (error) {
    console.error('Signed URL error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating signed URL',
      error: error.message
    });
  }
});

// Proxy endpoint to serve images directly
router.get('/image/:key', async (req, res) => {
  try {
    const { key } = req.params;
    
    if (!key) {
      return res.status(400).json({
        success: false,
        message: 'Image key is required'
      });
    }

    // Get the S3 client from the config
    const { s3 } = require('../config/s3');
    
    if (!s3) {
      return res.status(500).json({
        success: false,
        message: 'S3 not configured'
      });
    }

    // Get the image from S3
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key
    };

    console.log('Proxy endpoint - S3 params:', params);
    console.log('Proxy endpoint - Bucket:', process.env.AWS_S3_BUCKET);
    console.log('Proxy endpoint - Key:', key);

    const s3Object = await s3.getObject(params).promise();
    
    // Set appropriate headers with CORS
    res.set({
      'Content-Type': s3Object.ContentType || 'image/jpeg',
      'Cache-Control': 'public, max-age=3600',
      'Content-Length': s3Object.ContentLength,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type'
    });

    // Send the image data
    res.send(s3Object.Body);
  } catch (error) {
    console.error('Image proxy error:', error);
    res.status(500).json({
      success: false,
      message: 'Error serving image',
      error: error.message
    });
  }
});

// Delete image from S3
router.delete('/delete', protect, async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Image URL is required'
      });
    }

    await deleteFromS3(imageUrl);

    res.json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting image',
      error: error.message
    });
  }
});

module.exports = router;
