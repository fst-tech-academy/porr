const AWS = require('aws-sdk');
require('dotenv').config();

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const bucketName = process.env.AWS_S3_BUCKET;

async function generateSignedUrls() {
  try {
    console.log('🔗 Generating signed URLs for S3 files...');
    
    // List all objects in the bucket
    const listParams = {
      Bucket: bucketName,
      MaxKeys: 50 // Limit for testing
    };
    
    const listedObjects = await s3.listObjectsV2(listParams).promise();
    console.log(`📁 Found ${listedObjects.Contents.length} files in bucket`);
    
    // Generate signed URLs for each file
    const signedUrls = {};
    
    for (const obj of listedObjects.Contents) {
      const signedUrl = s3.getSignedUrl('getObject', {
        Bucket: bucketName,
        Key: obj.Key,
        Expires: 3600 // URL expires in 1 hour
      });
      
      signedUrls[obj.Key] = signedUrl;
      console.log(`✅ ${obj.Key} → ${signedUrl}`);
    }
    
    console.log('\n🎉 Signed URLs generated successfully!');
    console.log('📝 Note: These URLs expire in 1 hour. For production, you should:');
    console.log('   1. Generate signed URLs on-demand in your API');
    console.log('   2. Or disable Block Public Access in S3 console');
    
    return signedUrls;
    
  } catch (error) {
    console.error('❌ Failed to generate signed URLs:', error.message);
  }
}

generateSignedUrls();
